import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import postgres from "postgres";

export const ZYPPI_REGISTRY_MIGRATION_LOCK_KEY = 13370505;

export interface Migration {
  readonly version: string; // "NNN" zero-padded string
  readonly filename: string;
  readonly checksum: string; // lowercase sha-256 hex digest
  readonly sql: string;
}

export interface AppliedMigration {
  readonly version: string;
  readonly filename: string;
  readonly checksum: string;
  readonly applied_at: Date;
}

export interface MigrationStatus {
  readonly applied: string[]; // versions applied
  readonly pending: string[]; // versions pending
  readonly details: {
    readonly version: string;
    readonly filename: string;
    readonly status: "applied" | "pending" | "missing_file" | "checksum_mismatch" | "unknown_applied";
    readonly recordedChecksum?: string;
    readonly currentChecksum?: string;
  }[];
}

/**
 * Calculates a deterministic lowercase SHA-256 checksum from the exact raw file content.
 */
export function calculateSha256(content: string): string {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex").toLowerCase();
}

/**
 * Validates and discovers migrations in the specified directory.
 * Enforces strict NNN_lowercase_snake_case.sql naming and deterministic ordering.
 */
export function discoverMigrations(migrationsDir: string): Migration[] {
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migration directory not found: "${migrationsDir}"`);
  }

  const files = fs.readdirSync(migrationsDir);
  const migrations: Migration[] = [];
  const seenVersions = new Set<string>();
  const seenFilenames = new Set<string>();

  // Strict regex to enforce: NNN_lowercase_snake_case.sql
  // NNN must be exactly 3 digits, followed by an underscore, and snake case alphanumeric description
  const migrationRegex = /^(\d{3})_([a-z0-9_]+)\.sql$/;

  for (const file of files) {
    const stat = fs.statSync(path.join(migrationsDir, file));
    if (!stat.isFile()) {
      continue;
    }

    const match = file.match(migrationRegex);
    if (!match) {
      throw new Error(`Malformed migration filename detected: "${file}". Filenames must strictly follow the NNN_lowercase_snake_case.sql format.`);
    }

    const version = match[1];
    const description = match[2];

    if (seenVersions.has(version)) {
      throw new Error(`Duplicate migration version detected: "${version}" (found in "${file}")`);
    }
    seenVersions.add(version);

    if (seenFilenames.has(file)) {
      throw new Error(`Duplicate migration filename detected: "${file}"`);
    }
    seenFilenames.add(file);

    const filePath = path.join(migrationsDir, file);
    const sqlContent = fs.readFileSync(filePath, "utf8");
    const checksum = calculateSha256(sqlContent);

    migrations.push({
      version,
      filename: file,
      checksum,
      sql: sqlContent,
    });
  }

  // Deterministically sort by numeric version
  return migrations.sort((a, b) => parseInt(a.version, 10) - parseInt(b.version, 10));
}

/**
 * Acquires the PostgreSQL advisory lock for the migration runner using a bounded retry strategy.
 */
export async function acquireAdvisoryLock(
  sql: postgres.Sql,
  key: number = ZYPPI_REGISTRY_MIGRATION_LOCK_KEY,
  timeoutMs: number = 10000,
  retryIntervalMs: number = 500,
): Promise<boolean> {
  const start = Date.now();
  while (true) {
    try {
      const result = await sql`
        SELECT pg_try_advisory_lock(${key}) AS acquired;
      `;
      if (result && result[0] && result[0].acquired === true) {
        return true;
      }
    } catch (err: any) {
      // Fail closed on query errors
      throw new Error(`Advisory lock query failure: ${err.message}`);
    }

    if (Date.now() - start >= timeoutMs) {
      return false;
    }
    await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));
  }
}

/**
 * Releases the PostgreSQL advisory lock reliably.
 */
export async function releaseAdvisoryLock(
  sql: postgres.Sql,
  key: number = ZYPPI_REGISTRY_MIGRATION_LOCK_KEY,
): Promise<void> {
  try {
    await sql`
      SELECT pg_advisory_unlock(${key});
    `;
  } catch (err: any) {
    // Suppress release errors or log gently, but we want to prevent crashing finally block
  }
}

/**
 * Checks if the schema_migrations ledger exists in the public schema.
 */
export async function checkLedgerExists(sql: postgres.Sql): Promise<boolean> {
  const result = await sql`
    SELECT EXISTS (
      SELECT FROM pg_tables
      WHERE schemaname = 'public' AND tablename = 'schema_migrations'
    );
  `;
  return result[0].exists;
}

/**
 * Creates the schema_migrations ledger idempotently.
 */
export async function bootstrapLedger(sql: postgres.Sql): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(3) PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      checksum CHAR(64) NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

/**
 * Reads all applied migrations from the ledger.
 */
export async function getAppliedMigrations(sql: postgres.Sql): Promise<AppliedMigration[]> {
  const rows = await sql`
    SELECT version, filename, checksum, applied_at
    FROM schema_migrations
    ORDER BY version ASC;
  `;
  return rows.map((r) => ({
    version: r.version,
    filename: r.filename,
    checksum: r.checksum,
    applied_at: new Date(r.applied_at),
  }));
}

/**
 * Evaluates the current migration corpus against the database ledger.
 * This function remains completely read-only and does NOT create the ledger or mutate any state.
 */
export async function getMigrationStatus(sql: postgres.Sql, corpus: Migration[]): Promise<MigrationStatus> {
  const exists = await checkLedgerExists(sql);
  if (!exists) {
    // Read-only boundary: return status with empty applied list, all corpus migrations pending
    return {
      applied: [],
      pending: corpus.map((c) => c.version),
      details: corpus.map((c) => ({
        version: c.version,
        filename: c.filename,
        status: "pending" as const,
        currentChecksum: c.checksum,
      })),
    };
  }

  const applied = await getAppliedMigrations(sql);

  const appliedMap = new Map<string, AppliedMigration>();
  for (const a of applied) {
    appliedMap.set(a.version, a);
  }

  const corpusMap = new Map<string, Migration>();
  for (const c of corpus) {
    corpusMap.set(c.version, c);
  }

  const details: {
    version: string;
    filename: string;
    status: "applied" | "pending" | "missing_file" | "checksum_mismatch" | "unknown_applied";
    recordedChecksum?: string;
    currentChecksum?: string;
  }[] = [];
  const pending: string[] = [];
  const appliedVersions: string[] = [];

  const allVersions = new Set([...appliedMap.keys(), ...corpusMap.keys()]);
  const sortedVersions = Array.from(allVersions).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  for (const v of sortedVersions) {
    const app = appliedMap.get(v);
    const corp = corpusMap.get(v);

    if (app && corp) {
      if (app.filename !== corp.filename) {
        details.push({
          version: v,
          filename: corp.filename,
          status: "checksum_mismatch" as const,
          recordedChecksum: app.checksum,
          currentChecksum: corp.checksum,
        });
      } else if (app.checksum !== corp.checksum) {
        details.push({
          version: v,
          filename: corp.filename,
          status: "checksum_mismatch" as const,
          recordedChecksum: app.checksum,
          currentChecksum: corp.checksum,
        });
      } else {
        details.push({
          version: v,
          filename: corp.filename,
          status: "applied" as const,
          recordedChecksum: app.checksum,
          currentChecksum: corp.checksum,
        });
        appliedVersions.push(v);
      }
    } else if (app && !corp) {
      // Applied ledger record without matching corpus file is a missing file/unknown record
      details.push({
        version: v,
        filename: app.filename,
        status: "missing_file" as const,
        recordedChecksum: app.checksum,
      });
    } else if (!app && corp) {
      details.push({
        version: v,
        filename: corp.filename,
        status: "pending" as const,
        currentChecksum: corp.checksum,
      });
      pending.push(v);
    }
  }

  return {
    applied: appliedVersions,
    pending,
    details,
  };
}

/**
 * Verifies repository-to-ledger integrity and throws an error on any divergence.
 * Completely read-only.
 */
export async function verifyMigrations(sql: postgres.Sql, corpus: Migration[]): Promise<void> {
  const exists = await checkLedgerExists(sql);
  if (!exists) {
    // If database has no ledger, it's valid if we have no applied records.
    return;
  }

  const status = await getMigrationStatus(sql, corpus);
  for (const d of status.details) {
    if (d.status === "missing_file") {
      throw new Error(`Migration verification failure: Applied migration "${d.version}" is missing its file "${d.filename}" in repository corpus.`);
    }
    if (d.status === "checksum_mismatch") {
      throw new Error(`Migration verification failure: Checksum divergence detected for migration "${d.version}". Recorded: "${d.recordedChecksum}", Current: "${d.currentChecksum}".`);
    }
    if (d.status === "unknown_applied") {
      throw new Error(`Migration verification failure: Unknown applied migration record in ledger: version "${d.version}".`);
    }
  }
}

/**
 * Runs pending migrations sequentially and transactionally.
 * Creates the ledger idempotently and applies atomic transactions.
 */
export async function runMigrations(sql: postgres.Sql, corpus: Migration[]): Promise<{ applied: string[] }> {
  // 1. Idempotent bootstrap under lock (lock must already be held)
  await bootstrapLedger(sql);

  // 2. Read applied migrations
  const applied = await getAppliedMigrations(sql);

  const appliedMap = new Map<string, AppliedMigration>();
  for (const a of applied) {
    appliedMap.set(a.version, a);
  }

  const corpusMap = new Map<string, Migration>();
  for (const c of corpus) {
    corpusMap.set(c.version, c);
  }

  // 3. Historical ledger verification
  for (const a of applied) {
    const c = corpusMap.get(a.version);
    if (!c) {
      throw new Error(`Historical integrity failure: Applied migration "${a.version}" is missing its file "${a.filename}" in corpus.`);
    }
    if (a.filename !== c.filename) {
      throw new Error(`Historical integrity failure: Filename mismatch for version "${a.version}". Recorded: "${a.filename}", Current: "${c.filename}".`);
    }
    if (a.checksum !== c.checksum) {
      throw new Error(`Historical integrity failure: Checksum mismatch for version "${a.version}". Recorded: "${a.checksum}", Current: "${c.checksum}".`);
    }
  }

  // 4. Identify pending
  const pending = corpus.filter((c) => !appliedMap.has(c.version));
  const appliedThisRun: string[] = [];

  // 5. Apply each pending migration sequentially inside its own transaction
  for (const p of pending) {
    await sql.begin(async (tx) => {
      // Execute migration SQL
      await tx.unsafe(p.sql);
      // Record successful application atomically
      await tx`
        INSERT INTO schema_migrations (version, filename, checksum, applied_at)
        VALUES (${p.version}, ${p.filename}, ${p.checksum}, CURRENT_TIMESTAMP);
      `;
    });
    appliedThisRun.push(p.version);
  }

  return { applied: appliedThisRun };
}

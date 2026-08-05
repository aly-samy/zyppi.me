import * as path from "node:path";
import { parseAndValidateDbConfig, createPostgresClient } from "./db.js";
import {
  discoverMigrations,
  acquireAdvisoryLock,
  releaseAdvisoryLock,
  getMigrationStatus,
  verifyMigrations,
  runMigrations,
  ZYPPI_REGISTRY_MIGRATION_LOCK_KEY,
} from "./runner.js";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || !["migrate", "status", "verify"].includes(command)) {
    console.error("Usage: node cli.js <migrate | status | verify>");
    process.exit(1);
  }

  // 1. Parse and validate DB configuration (never logs credentials)
  let config;
  try {
    config = parseAndValidateDbConfig();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Database Configuration Error: ${message}`);
    process.exit(1);
  }

  const migrationsDir = path.resolve(process.cwd(), "infra/migrations");

  // 2. Execute commands based on parsed argument
  if (command === "migrate") {
    // Write action: needs connection, locking, ledger bootstrap, and migration application
    const sql = createPostgresClient(config, { max: 1 });
    let lockAcquired = false;

    try {
      // A. Discover and validate migration corpus
      const corpus = discoverMigrations(migrationsDir);

      // B. Acquire PostgreSQL advisory lock
      console.log(
        `Attempting to acquire database advisory lock (key: ${ZYPPI_REGISTRY_MIGRATION_LOCK_KEY})...`,
      );
      lockAcquired = await acquireAdvisoryLock(
        sql,
        ZYPPI_REGISTRY_MIGRATION_LOCK_KEY,
      );
      if (!lockAcquired) {
        console.error(
          "Migration Lock Contention: Failed to acquire database advisory lock within 10 seconds. Concurrent migration execution blocked.",
        );
        process.exit(1);
      }

      // C. Run sequential transactional migrations
      console.log("Advisory lock acquired. Executing migrations...");
      const result = await runMigrations(sql, corpus);

      if (result.applied.length === 0) {
        console.log("No pending migrations. Database is up-to-date.");
      } else {
        console.log(
          `Successfully applied ${result.applied.length} migration(s): ${result.applied.join(", ")}`,
        );
      }
      process.exit(0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Migration Failed: ${message}`);
      process.exit(1);
    } finally {
      if (lockAcquired) {
        await releaseAdvisoryLock(sql, ZYPPI_REGISTRY_MIGRATION_LOCK_KEY);
      }
      await sql.end();
    }
  } else if (command === "status") {
    // Read-only action: evaluates status without applying or modifying ledger
    const sql = createPostgresClient(config, { max: 1 });
    try {
      const corpus = discoverMigrations(migrationsDir);
      const status = await getMigrationStatus(sql, corpus);

      console.log("\n--- Migration Status ---");
      console.log(`Applied: ${status.applied.length}`);
      console.log(`Pending: ${status.pending.length}`);
      console.log("------------------------");

      let hasIntegrityError = false;
      for (const d of status.details) {
        if (d.status === "applied") {
          console.log(`[APPLIED] ${d.filename}`);
        } else if (d.status === "pending") {
          console.log(`[PENDING] ${d.filename}`);
        } else if (d.status === "missing_file") {
          console.error(
            `[ERROR]   Missing applied file: ${d.filename} (Version ${d.version} applied but file is missing in repository)`,
          );
          hasIntegrityError = true;
        } else if (d.status === "checksum_mismatch") {
          console.error(
            `[ERROR]   Checksum Mismatch: ${d.filename} (Version ${d.version} has modified contents)`,
          );
          hasIntegrityError = true;
        } else if (d.status === "unknown_applied") {
          console.error(
            `[ERROR]   Unknown applied record: Version ${d.version} is recorded in DB but is unrecognized in repository`,
          );
          hasIntegrityError = true;
        }
      }

      if (hasIntegrityError) {
        console.error(
          "\nDatabase migration history is historically inconsistent with the repository corpus.",
        );
        process.exit(1);
      } else {
        process.exit(0);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Status check failed: ${message}`);
      process.exit(1);
    } finally {
      await sql.end();
    }
  } else if (command === "verify") {
    // Read-only action: performs read-only integrity verification
    const sql = createPostgresClient(config, { max: 1 });
    try {
      const corpus = discoverMigrations(migrationsDir);
      await verifyMigrations(sql, corpus);
      console.log("Migration integrity verification: PASS");
      process.exit(0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `Migration integrity verification: FAIL\nDiagnostics: ${message}`,
      );
      process.exit(1);
    } finally {
      await sql.end();
    }
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Fatal Execution Error: ${message}`);
  process.exit(1);
});

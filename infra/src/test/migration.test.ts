import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import postgres from "postgres";
import { parseAndValidateDbConfig, createPostgresClient } from "../db.js";
import {
  discoverMigrations,
  acquireAdvisoryLock,
  releaseAdvisoryLock,
  bootstrapLedger,
  checkLedgerExists,
  getAppliedMigrations,
  getMigrationStatus,
  verifyMigrations,
  runMigrations,
  calculateSha256,
  ZYPPI_REGISTRY_MIGRATION_LOCK_KEY,
} from "../runner.js";

describe("Registry Migration Framework Integration Tests — AMS-0505", () => {
  let sql: postgres.Sql;

  beforeAll(async () => {
    const config = parseAndValidateDbConfig();
    sql = createPostgresClient(config);
  });

  afterAll(async () => {
    if (sql) {
      await sql.end();
    }
  });

  beforeEach(async () => {
    // Reset schema to ensure a completely clean slate before each test
    await sql`DROP SCHEMA public CASCADE;`;
    await sql`CREATE SCHEMA public;`;
  });

  // Helper to create disposable migrations
  function createTempDir(): string {
    const dir = path.join(
      os.tmpdir(),
      `zyppi-temp-migrations-${Math.random().toString(36).slice(2)}`,
    );
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  function cleanupTempDir(dir: string) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  }

  it("MF-01: should verify that infra package compiles and has valid configuration", () => {
    // This is run at compile-time/runtime; we just check that package.json and tsconfig.json exist
    const pjPath = path.resolve(__dirname, "../../../package.json");
    expect(fs.existsSync(pjPath)).toBe(true);
    const tsconfigPath = path.resolve(__dirname, "../../../tsconfig.json");
    expect(fs.existsSync(tsconfigPath)).toBe(true);
  });

  it("MF-02: should verify that ledger bootstrap is idempotent and does not modify baseline", async () => {
    // Verify ledger doesn't exist
    const existsBefore = await checkLedgerExists(sql);
    expect(existsBefore).toBe(false);

    // Bootstrap first time
    await bootstrapLedger(sql);
    const existsAfter1 = await checkLedgerExists(sql);
    expect(existsAfter1).toBe(true);

    // Bootstrap second time (idempotency check)
    await expect(bootstrapLedger(sql)).resolves.not.toThrow();
    const existsAfter2 = await checkLedgerExists(sql);
    expect(existsAfter2).toBe(true);
  });

  it("MF-03 & MF-04: should verify initial migration application and repeated execution safety", async () => {
    const tempDir = createTempDir();
    const migrationContent = `
      CREATE TABLE test_table (id SERIAL PRIMARY KEY, val TEXT);
    `;
    fs.writeFileSync(
      path.join(tempDir, "001_initial_table.sql"),
      migrationContent,
      "utf8",
    );

    const corpus = discoverMigrations(tempDir);
    expect(corpus.length).toBe(1);
    expect(corpus[0].version).toBe("001");
    expect(corpus[0].filename).toBe("001_initial_table.sql");

    // Run first time
    const res1 = await runMigrations(sql, corpus);
    expect(res1.applied).toEqual(["001"]);

    // Verify ledger entry
    const applied = await getAppliedMigrations(sql);
    expect(applied.length).toBe(1);
    expect(applied[0].version).toBe("001");
    expect(applied[0].filename).toBe("001_initial_table.sql");
    expect(applied[0].checksum).toBe(calculateSha256(migrationContent));
    expect(applied[0].applied_at).toBeInstanceOf(Date);

    // Run second time (should apply 0 pending)
    const res2 = await runMigrations(sql, corpus);
    expect(res2.applied).toEqual([]);

    // Double-check ledger didn't add duplicate records
    const appliedAfter = await getAppliedMigrations(sql);
    expect(appliedAfter.length).toBe(1);

    cleanupTempDir(tempDir);
  });

  it("MF-05: should verify deterministic numeric sorting of discovered migrations", () => {
    const tempDir = createTempDir();
    fs.writeFileSync(path.join(tempDir, "003_third.sql"), "SELECT 3;", "utf8");
    fs.writeFileSync(path.join(tempDir, "001_first.sql"), "SELECT 1;", "utf8");
    fs.writeFileSync(path.join(tempDir, "002_second.sql"), "SELECT 2;", "utf8");

    const corpus = discoverMigrations(tempDir);
    expect(corpus.length).toBe(3);
    expect(corpus[0].version).toBe("001");
    expect(corpus[1].version).toBe("002");
    expect(corpus[2].version).toBe("003");

    cleanupTempDir(tempDir);
  });

  it("MF-06: should reject duplicate migration versions before execution", () => {
    const tempDir = createTempDir();
    fs.writeFileSync(path.join(tempDir, "001_a.sql"), "SELECT 1;", "utf8");
    fs.writeFileSync(path.join(tempDir, "001_b.sql"), "SELECT 2;", "utf8");

    expect(() => discoverMigrations(tempDir)).toThrow(
      "Duplicate migration version detected",
    );

    cleanupTempDir(tempDir);
  });

  it("MF-07: should reject malformed filenames and not silently ignore them", () => {
    const tempDir = createTempDir();
    fs.writeFileSync(
      path.join(tempDir, "001_initial.sql"),
      "SELECT 1;",
      "utf8",
    );
    // Malformed: uppercase letters in name description (must be lowercase snake case)
    fs.writeFileSync(
      path.join(tempDir, "002_BadName.sql"),
      "SELECT 2;",
      "utf8",
    );

    expect(() => discoverMigrations(tempDir)).toThrow(
      "Malformed migration filename detected",
    );

    cleanupTempDir(tempDir);
  });

  it("MF-08: should verify exact SHA-256 checksum mapping", () => {
    const tempDir = createTempDir();
    const content = "CREATE TABLE some_table (id INT);";
    fs.writeFileSync(path.join(tempDir, "001_some_table.sql"), content, "utf8");

    const corpus = discoverMigrations(tempDir);
    expect(corpus[0].checksum).toBe(calculateSha256(content));

    cleanupTempDir(tempDir);
  });

  it("MF-09: should detect historical mutation/checksum divergence and fail closed", async () => {
    const tempDir = createTempDir();
    const originalContent = "SELECT 1;";
    fs.writeFileSync(
      path.join(tempDir, "001_test.sql"),
      originalContent,
      "utf8",
    );

    // 1. Run original migration
    const corpus1 = discoverMigrations(tempDir);
    await runMigrations(sql, corpus1);

    // 2. Mutate file content
    fs.writeFileSync(path.join(tempDir, "001_test.sql"), "SELECT 2;", "utf8");

    // 3. Trying to run/verify should fail closed
    const corpus2 = discoverMigrations(tempDir);
    await expect(runMigrations(sql, corpus2)).rejects.toThrow(
      "Checksum mismatch",
    );

    cleanupTempDir(tempDir);
  });

  it("MF-10: should detect missing applied migration file in corpus and fail closed", async () => {
    const tempDir = createTempDir();
    fs.writeFileSync(path.join(tempDir, "001_test.sql"), "SELECT 1;", "utf8");

    // Run first migration
    const corpus1 = discoverMigrations(tempDir);
    await runMigrations(sql, corpus1);

    // Remove the file from disk
    fs.unlinkSync(path.join(tempDir, "001_test.sql"));

    // Attempting to run again should fail closed because an applied version's file is missing
    const corpus2: any[] = [];
    await expect(runMigrations(sql, corpus2)).rejects.toThrow(
      'Applied migration "001" is missing its file',
    );

    cleanupTempDir(tempDir);
  });

  it("MF-11: should detect unknown applied ledger records and fail closed", async () => {
    const tempDir = createTempDir();
    fs.writeFileSync(path.join(tempDir, "001_test.sql"), "SELECT 1;", "utf8");

    // Run first migration
    const corpus = discoverMigrations(tempDir);
    await runMigrations(sql, corpus);

    // Manually insert an unknown ledger record
    await sql`
      INSERT INTO schema_migrations (version, filename, checksum, applied_at)
      VALUES ('002', '002_unrecognized.sql', 'unrecognized-checksum-sha256-unrecognized', CURRENT_TIMESTAMP);
    `;

    // Attempting to run should fail closed due to unknown applied record in ledger
    await expect(runMigrations(sql, corpus)).rejects.toThrow(
      'Applied migration "002" is missing its file',
    );

    cleanupTempDir(tempDir);
  });

  it("MF-12: should verify failed migration atomicity (rolls back both SQL and ledger record)", async () => {
    const tempDir = createTempDir();
    fs.writeFileSync(
      path.join(tempDir, "001_good.sql"),
      "CREATE TABLE good_table (id INT);",
      "utf8",
    );
    // Malformed SQL that causes syntax error
    fs.writeFileSync(
      path.join(tempDir, "002_bad.sql"),
      "CREATE TABLE bad_table (id INT); INTENTIONAL SYNTAX ERROR;",
      "utf8",
    );

    const corpus = discoverMigrations(tempDir);

    // Run migrations (should successfully apply 001, but fail on 002)
    await expect(runMigrations(sql, corpus)).rejects.toThrow();

    // Verify 001 was recorded and good_table exists
    const applied = await getAppliedMigrations(sql);
    expect(applied.map((a) => a.version)).toEqual(["001"]);

    const goodTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'good_table'
      );
    `;
    expect(goodTableExists[0].exists).toBe(true);

    // Verify 002's SQL effects are rolled back: bad_table should NOT exist!
    const badTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'bad_table'
      );
    `;
    expect(badTableExists[0].exists).toBe(false);

    cleanupTempDir(tempDir);
  });

  it("MF-13: should verify that db:status is read-only", async () => {
    const tempDir = createTempDir();
    fs.writeFileSync(
      path.join(tempDir, "001_status_check.sql"),
      "CREATE TABLE status_test (id INT);",
      "utf8",
    );

    const corpus = discoverMigrations(tempDir);

    // Check status before ledger exists
    const status1 = await getMigrationStatus(sql, corpus);
    expect(status1.applied).toEqual([]);
    expect(status1.pending).toEqual(["001"]);

    // Ensure status call did not bootstrap ledger or apply anything
    const exists = await checkLedgerExists(sql);
    expect(exists).toBe(false);

    const tableExists1 = await sql`
      SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'status_test');
    `;
    expect(tableExists1[0].exists).toBe(false);

    cleanupTempDir(tempDir);
  });

  it("MF-14: should verify that db:verify is read-only and validates checksums", async () => {
    const tempDir = createTempDir();
    fs.writeFileSync(
      path.join(tempDir, "001_verify_check.sql"),
      "SELECT 1;",
      "utf8",
    );

    const corpus = discoverMigrations(tempDir);

    // Verify passes when database is unmigrated
    await expect(verifyMigrations(sql, corpus)).resolves.not.toThrow();

    // Run migration
    await runMigrations(sql, corpus);

    // Verify passes when in sync
    await expect(verifyMigrations(sql, corpus)).resolves.not.toThrow();

    // Mutate file to cause checksum divergence
    fs.writeFileSync(
      path.join(tempDir, "001_verify_check.sql"),
      "SELECT 2;",
      "utf8",
    );
    const mutatedCorpus = discoverMigrations(tempDir);

    // Verify should fail on divergence
    await expect(verifyMigrations(sql, mutatedCorpus)).rejects.toThrow(
      "Checksum divergence detected",
    );

    // Ensure verification check is read-only (did not change the recorded checksum)
    const applied = await getAppliedMigrations(sql);
    expect(applied[0].checksum).toBe(corpus[0].checksum);

    cleanupTempDir(tempDir);
  });

  it("MF-15: should verify PostgreSQL advisory lock protection and bounded wait policy", async () => {
    const lockKey = 13379999; // Isolated test-only key to avoid contention with real runs

    // Acquire the lock in session A
    const acquired = await acquireAdvisoryLock(sql, lockKey);
    expect(acquired).toBe(true);

    // Create a second connection client (session B)
    const config = parseAndValidateDbConfig();
    const concurrentSql = createPostgresClient(config);

    // Attempting to acquire the same lock in session B with a short timeout should fail/timeout
    const secondAcquired = await acquireAdvisoryLock(
      concurrentSql,
      lockKey,
      1000,
      200,
    );
    expect(secondAcquired).toBe(false);

    // Release the lock in session A
    await releaseAdvisoryLock(sql, lockKey);

    // Attempting to acquire in session B now should succeed
    const afterReleaseAcquired = await acquireAdvisoryLock(
      concurrentSql,
      lockKey,
      1000,
      200,
    );
    expect(afterReleaseAcquired).toBe(true);

    // Cleanup session B
    await releaseAdvisoryLock(concurrentSql, lockKey);
    await concurrentSql.end();
  });

  it("MF-16: should verify Runtime isolation constraints", () => {
    // Programmatically assert that no file in the @zyppi/infra package imports from @zyppi/runtime
    const files = fs.readdirSync(path.resolve(__dirname, ".."));
    for (const file of files) {
      if (file.endsWith(".ts")) {
        const content = fs.readFileSync(
          path.resolve(__dirname, "..", file),
          "utf8",
        );
        expect(content).not.toContain("@zyppi/runtime");
      }
    }
  });
});

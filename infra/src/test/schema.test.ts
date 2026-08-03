import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

describe("PostgreSQL Registry Schema Verification — AMS-0501", () => {
  let sql: postgres.Sql;

  beforeAll(async () => {
    // Connect to the real PostgreSQL database
    sql = postgres({
      host: "127.0.0.1",
      port: 5432,
      database: "zyppi_test",
      username: "zyppi_test",
      password: "zyppi_test",
      onnotice: () => {}, // suppress notice warnings to keep logs clean
    });

    // Recreate public schema to ensure a perfectly clean slate
    await sql`DROP SCHEMA public CASCADE;`;
    await sql`CREATE SCHEMA public;`;

    // Read and apply the SQL migration
    const migrationPath = path.resolve(
      __dirname,
      "../../migrations/001_initial_registry_schema.sql",
    );
    const sqlContent = fs.readFileSync(migrationPath, "utf8");
    await sql.unsafe(sqlContent);
  });

  afterAll(async () => {
    if (sql) {
      await sql.end();
    }
  });

  it("V-0501-02: should verify that all eight authorized constitutional tables exist", async () => {
    const tables = [
      "referents",
      "identities",
      "evidence",
      "policies",
      "authorities",
      "capabilities",
      "standings",
      "execution_receipts",
    ];

    for (const table of tables) {
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM pg_tables
          WHERE schemaname = 'public' AND tablename = ${table}
        );
      `;
      expect(result[0].exists).toBe(true);
    }
  });

  it("V-0501-03: should verify that no unauthorized constitutional tables are present", async () => {
    // schema_migrations is explicitly excluded and must not exist yet
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'schema_migrations'
      );
    `;
    expect(result[0].exists).toBe(false);
  });

  it("V-0501-09: should verify that valid dependency-ordered inserts succeed", async () => {
    const referentId = "11111111-1111-1111-1111-111111111111";
    const identityId = "22222222-2222-2222-2222-222222222222";
    const evidenceId = "33333333-3333-3333-3333-333333333333";
    const policyId = "44444444-4444-4444-4444-444444444444";
    const authorityId = "55555555-5555-5555-5555-555555555555";
    const capabilityId = "66666666-6666-6666-6666-666666666666";
    const standingId = "77777777-7777-7777-7777-777777777777";
    const receiptId = "88888888-8888-8888-8888-888888888888";

    // 1. Insert into referents
    await expect(sql`
      INSERT INTO referents (id, referent_type, name, parent_referent_id)
      VALUES (${referentId}, 'product', 'Aura Smart Ring', NULL);
    `).resolves.not.toThrow();

    // 2. Insert into identities (referencing referent)
    await expect(sql`
      INSERT INTO identities (id, identity_type, canonical_reference, referent_id, status)
      VALUES (${identityId}, 'gtin', '00860000000123', ${referentId}, 'active');
    `).resolves.not.toThrow();

    // 3. Insert into evidence (referencing identity)
    await expect(sql`
      INSERT INTO evidence (id, identity_id, evidence_type, hash, storage_ref, retrieved_at)
      VALUES (${evidenceId}, ${identityId}, 'certificate', 'sha256-hash', 'r2-storage-key', '2026-07-28T14:30:00Z');
    `).resolves.not.toThrow();

    // 4. Insert into policies
    await expect(sql`
      INSERT INTO policies (id, policy_type, version, definition, active)
      VALUES (${policyId}, 'allowlist', '1.0.0', '{"rules": []}'::jsonb, true);
    `).resolves.not.toThrow();

    // 5. Insert into authorities
    await expect(sql`
      INSERT INTO authorities (id, subject_id, scope, valid_from, valid_to)
      VALUES (${authorityId}, 'subject-id', 'scope-authority', '2026-07-28T00:00:00Z', '2026-07-28T23:59:59Z');
    `).resolves.not.toThrow();

    // 6. Insert into capabilities
    await expect(sql`
      INSERT INTO capabilities (id, subject_id, scope, valid_from, valid_to)
      VALUES (${capabilityId}, 'subject-id', 'scope-capability', '2026-07-28T00:00:00Z', '2026-07-28T23:59:59Z');
    `).resolves.not.toThrow();

    // 7. Insert into standings
    await expect(sql`
      INSERT INTO standings (id, subject_id, scope, valid_from, valid_to)
      VALUES (${standingId}, 'subject-id', 'scope-standing', '2026-07-28T00:00:00Z', '2026-07-28T23:59:59Z');
    `).resolves.not.toThrow();

    // 8. Insert into execution_receipts
    await expect(sql`
      INSERT INTO execution_receipts (
        id, execution_id, runtime_version, input_hash, output_hash, evidence_hash,
        policy_version, decision_summary, execution_time_ms, deterministic_hash
      ) VALUES (
        ${receiptId}, 'exec-456', '0.1.0', 'in-hash', 'out-hash', 'ev-hash',
        'v1', '{"decision": "authorized"}'::jsonb, 42, 'det-hash'
      );
    `).resolves.not.toThrow();
  });

  it("V-0501-10: should verify that invalid foreign-key inserts fail", async () => {
    const invalidId = "e9999999-9999-9999-9999-999999999999";
    const nonExistentReferentId = "f9999999-9999-9999-9999-999999999999";

    // Inserting an identity referencing a non-existent referent id must fail
    await expect(sql`
      INSERT INTO identities (id, identity_type, canonical_reference, referent_id, status)
      VALUES (${invalidId}, 'gtin', '00860000000123', ${nonExistentReferentId}, 'active');
    `).rejects.toThrow(); // Should reject with a foreign key violation exception
  });

  it("V-0501-08: should verify explicit ON DELETE RESTRICT on foreign-key deletion", async () => {
    const referentId = "11111111-1111-1111-1111-111111111111";

    // Deleting a referent that is referenced by an identity must fail (restrict)
    await expect(sql`
      DELETE FROM referents WHERE id = ${referentId};
    `).rejects.toThrow();
  });

  it("should verify authorized CHECK constraints", async () => {
    const badReferentId = "a1111111-1111-1111-1111-111111111111";
    const badIdentityId = "b2222222-2222-2222-2222-222222222222";

    // referent_type check constraint
    await expect(sql`
      INSERT INTO referents (id, referent_type, name, parent_referent_id)
      VALUES (${badReferentId}, 'invalid_type', 'Bad Referent', NULL);
    `).rejects.toThrow();

    // status check constraint
    await expect(sql`
      INSERT INTO identities (id, identity_type, canonical_reference, referent_id, status)
      VALUES (${badIdentityId}, 'gtin', '00860000000123', NULL, 'invalid_status');
    `).rejects.toThrow();
  });

  it("V-0501-11 & V-0501-12: should verify that evidence table rejects UPDATE and DELETE", async () => {
    const evidenceId = "33333333-3333-3333-3333-333333333333";

    // 1. UPDATE attempt must fail with SQLSTATE P0001
    try {
      await sql`
        UPDATE evidence
        SET evidence_type = 'updated-cert'
        WHERE id = ${evidenceId};
      `;
      throw new Error("Update should have failed but did not");
    } catch (err) {
      const dbError = err as { code: string; message: string };
      expect(dbError.code).toBe("P0001");
      expect(dbError.message).toContain("immutable and append-only");
    }

    // 2. DELETE attempt must fail with SQLSTATE P0001
    try {
      await sql`
        DELETE FROM evidence
        WHERE id = ${evidenceId};
      `;
      throw new Error("Delete should have failed but did not");
    } catch (err) {
      const dbError = err as { code: string; message: string };
      expect(dbError.code).toBe("P0001");
      expect(dbError.message).toContain("immutable and append-only");
    }
  });

  it("V-0501-13 & V-0501-14: should verify that execution_receipts table rejects UPDATE and DELETE", async () => {
    const receiptId = "88888888-8888-8888-8888-888888888888";

    // 1. UPDATE attempt must fail with SQLSTATE P0001
    try {
      await sql`
        UPDATE execution_receipts
        SET runtime_version = '9.9.9'
        WHERE id = ${receiptId};
      `;
      throw new Error("Update should have failed but did not");
    } catch (err) {
      const dbError = err as { code: string; message: string };
      expect(dbError.code).toBe("P0001");
      expect(dbError.message).toContain("immutable and append-only");
    }

    // 2. DELETE attempt must fail with SQLSTATE P0001
    try {
      await sql`
        DELETE FROM execution_receipts
        WHERE id = ${receiptId};
      `;
      throw new Error("Delete should have failed but did not");
    } catch (err) {
      const dbError = err as { code: string; message: string };
      expect(dbError.code).toBe("P0001");
      expect(dbError.message).toContain("immutable and append-only");
    }
  });

  it("V-0501-15: should verify that rejected mutations leave original rows unchanged", async () => {
    const evidenceId = "33333333-3333-3333-3333-333333333333";
    const receiptId = "88888888-8888-8888-8888-888888888888";

    // Verify evidence row remains unchanged
    const evidenceRows = await sql`
      SELECT evidence_type, hash FROM evidence WHERE id = ${evidenceId};
    `;
    expect(evidenceRows[0].evidence_type).toBe("certificate");
    expect(evidenceRows[0].hash).toBe("sha256-hash");

    // Verify receipt row remains unchanged
    const receiptRows = await sql`
      SELECT runtime_version, execution_time_ms FROM execution_receipts WHERE id = ${receiptId};
    `;
    expect(receiptRows[0].runtime_version).toBe("0.1.0");
    expect(receiptRows[0].execution_time_ms).toBe("42"); // postgres-js returns BIGINT as string to prevent loss of precision
  });
});

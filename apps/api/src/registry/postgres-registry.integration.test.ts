import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { createValidatedCanonicalIdentifier } from "@zyppi/contracts";
import type { ExecutionReceipt } from "@zyppi/domain";
import { PostgresRegistryRepository } from "./postgres-registry-repository.js";
import { PostgresReceiptRepository } from "./postgres-receipt-repository.js";

describe("PostgreSQL Registry Adapter Integration Tests — IT-0503", () => {
  let sql: postgres.Sql;

  beforeAll(async () => {
    // Establish connection to real PostgreSQL 16 database
    sql = postgres({
      host: "127.0.0.1",
      port: 5432,
      database: "zyppi_test",
      username: "zyppi_test",
      password: "zyppi_test",
      onnotice: () => {}, // suppress notice warnings to keep logs clean
    });

    // Run migration script to establish the required clean schema state
    await sql`DROP SCHEMA public CASCADE;`;
    await sql`CREATE SCHEMA public;`;

    const migrationPath = path.resolve(
      __dirname,
      "../../../../infra/migrations/001_initial_registry_schema.sql",
    );
    const sqlContent = fs.readFileSync(migrationPath, "utf8");
    await sql.unsafe(sqlContent);
  });

  afterAll(async () => {
    if (sql) {
      await sql.end();
    }
  });

  beforeEach(async () => {
    // Clean all tables before each test to ensure perfect test isolation
    await sql`TRUNCATE TABLE execution_receipts, evidence, standings, capabilities, authorities, identities, referents, policies CASCADE;`;
  });

  // A. Complete Valid Retrieval
  it("should successfully lookup a complete, valid Registry graph", async () => {
    const referentId = "11111111-1111-1111-1111-111111111111";
    const identityId = "22222222-2222-2222-2222-222222222222";
    const evidenceId = "33333333-3333-3333-3333-333333333333";
    const policyId = "44444444-4444-4444-4444-444444444444";
    const authorityId = "55555555-5555-5555-5555-555555555555";
    const capabilityId = "66666666-6666-6666-6666-666666666666";
    const standingId = "77777777-7777-7777-7777-777777777777";

    // Insert database fixtures
    await sql`
      INSERT INTO referents (id, referent_type, name, parent_referent_id, created_at)
      VALUES (${referentId}, 'product', 'Aura Smart Ring', NULL, '2026-07-28T12:00:00Z');
    `;

    await sql`
      INSERT INTO identities (id, identity_type, canonical_reference, referent_id, status, created_at, updated_at)
      VALUES (${identityId}, 'gtin', '00860000000123', ${referentId}, 'active', '2026-07-28T12:00:00Z', '2026-07-28T12:00:00Z');
    `;

    await sql`
      INSERT INTO evidence (id, identity_id, evidence_type, hash, storage_ref, retrieved_at, created_at)
      VALUES (${evidenceId}, ${identityId}, 'certificate', 'sha256-hash', 'r2-storage-key', '2026-07-28T14:30:00Z', '2026-07-28T12:00:00Z');
    `;

    await sql`
      INSERT INTO policies (id, policy_type, version, definition, active, created_at, updated_at)
      VALUES (${policyId}, 'allowlist', '1.0.0', '{"rules": []}'::jsonb, true, '2026-07-28T12:00:00Z', '2026-07-28T12:00:00Z');
    `;

    await sql`
      INSERT INTO authorities (id, subject_id, scope, valid_from, valid_to, created_at)
      VALUES (${authorityId}, ${identityId}, 'scope-authority', '2026-07-28T00:00:00Z', '2026-07-28T23:59:59Z', '2026-07-28T12:00:00Z');
    `;

    await sql`
      INSERT INTO capabilities (id, subject_id, scope, valid_from, valid_to, created_at)
      VALUES (${capabilityId}, ${identityId}, 'scope-capability', '2026-07-28T00:00:00Z', '2026-07-28T23:59:59Z', '2026-07-28T12:00:00Z');
    `;

    await sql`
      INSERT INTO standings (id, subject_id, scope, valid_from, valid_to, created_at)
      VALUES (${standingId}, ${identityId}, 'scope-standing', '2026-07-28T00:00:00Z', '2026-07-28T23:59:59Z', '2026-07-28T12:00:00Z');
    `;

    const repo = new PostgresRegistryRepository(sql);
    const identifier = createValidatedCanonicalIdentifier("00860000000123");
    expect(identifier.ok).toBe(true);

    if (identifier.ok) {
      const res = await repo.lookup(identifier.value);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value).not.toBeNull();
        const state = res.value!;

        // Verify mapped record correctness
        expect(state.identity.identityId).toBe(identityId);
        expect(state.identity.canonicalReference).toBe("00860000000123");
        expect(state.identity.status).toBe("active");

        expect(state.relationships.length).toBe(1);
        expect(state.relationships[0].referentId).toBe(referentId);
        expect(state.relationships[0].name).toBe("Aura Smart Ring");

        expect(state.evidenceReferences.length).toBe(1);
        expect(state.evidenceReferences[0].evidenceId).toBe(evidenceId);

        expect(state.applicablePolicies.length).toBe(1);
        expect(state.applicablePolicies[0].policyId).toBe(policyId);

        expect(state.standings.length).toBe(1);
        expect(state.standings[0].standingId).toBe(standingId);
        expect(state.standings[0].subjectId).toBe(identityId);

        expect(state.capabilities.length).toBe(1);
        expect(state.capabilities[0].capabilityId).toBe(capabilityId);

        expect(state.authorities.length).toBe(1);
        expect(state.authorities[0].authorityId).toBe(authorityId);

        // Ensure storage metadata is completely absent
        expect(state.evidenceReferences[0]).not.toHaveProperty("created_at");
        expect(state.applicablePolicies[0]).not.toHaveProperty("created_at");
        expect(state.applicablePolicies[0]).not.toHaveProperty("updated_at");
        expect(state.standings[0]).not.toHaveProperty("created_at");
      }
    }
  });

  // B. Valid Identity Absence
  it("should return ok: true and value: null when identity is absent", async () => {
    const repo = new PostgresRegistryRepository(sql);
    const identifier = createValidatedCanonicalIdentifier("non-existent-reference");
    expect(identifier.ok).toBe(true);

    if (identifier.ok) {
      const res = await repo.lookup(identifier.value);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value).toBeNull();
      }
    }
  });

  // C. Valid Optional Empty Collections
  it("should return empty arrays for optional relationships/collections when empty", async () => {
    const identityId = "22222222-2222-2222-2222-222222222222";

    // Insert identity with referent_id = NULL
    await sql`
      INSERT INTO identities (id, identity_type, canonical_reference, referent_id, status, created_at, updated_at)
      VALUES (${identityId}, 'gtin', '00860000000123', NULL, 'active', '2026-07-28T12:00:00Z', '2026-07-28T12:00:00Z');
    `;

    const repo = new PostgresRegistryRepository(sql);
    const identifier = createValidatedCanonicalIdentifier("00860000000123");
    expect(identifier.ok).toBe(true);

    if (identifier.ok) {
      const res = await repo.lookup(identifier.value);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value).not.toBeNull();
        const state = res.value!;

        // Check that optional associated collections map correctly to empty arrays, not null/undefined
        expect(state.relationships).toEqual([]);
        expect(state.standings).toEqual([]);
        expect(state.authorities).toEqual([]);
        expect(state.capabilities).toEqual([]);
        expect(state.evidenceReferences).toEqual([]);
        expect(state.applicablePolicies).toEqual([]); // No active policies inserted
      }
    }
  });

  // F. Data Corruption
  it("should return DataCorruption when a retrieved row fails Domain validation", async () => {
    const identityId = "22222222-2222-2222-2222-222222222222";

    // Insert an identity row with an invalid status ('invalid-status' violates check/domain)
    // To bypass DB check constraint for the test, we'll insert a row with an invalid timestamp in created_at
    await sql`
      INSERT INTO identities (id, identity_type, canonical_reference, referent_id, status, created_at, updated_at)
      VALUES (${identityId}, 'gtin', '00860000000123', NULL, 'active', 'not-a-timestamp', '2026-07-28T12:00:00Z');
    `.catch(async () => {
      // If DB blocks 'not-a-timestamp', we insert a correct timestamp but violate another check/constraint
      // Wait, created_at is TIMESTAMPTZ, so postgres blocks 'not-a-timestamp'.
      // Instead, we can insert into 'evidence' table with an invalid retrieved_at date (like Feb 30, which passes postgres TIMESTAMPTZ but fails isValidIso8601Utc calendar-level check in Domain!).
      await sql`
        INSERT INTO identities (id, identity_type, canonical_reference, referent_id, status, created_at, updated_at)
        VALUES (${identityId}, 'gtin', '00860000000123', NULL, 'active', '2026-07-28T12:00:00Z', '2026-07-28T12:00:00Z');
      `;
      // '2026-02-30T12:00:00Z' is a completely invalid date but passes DB timestamptz parser (reinterprets or accepts depending on config, but our regex blocks it!).
      // Or we can just insert a blank/empty string into evidence_type which is caught by the validator as invalid!
      await sql`
        INSERT INTO evidence (id, identity_id, evidence_type, hash, storage_ref, retrieved_at)
        VALUES ('33333333-3333-3333-3333-333333333333', ${identityId}, '   ', 'sha256-hash', 'r2-storage-key', '2026-07-28T14:30:00Z');
      `;
    });

    const repo = new PostgresRegistryRepository(sql);
    const identifier = createValidatedCanonicalIdentifier("00860000000123");
    expect(identifier.ok).toBe(true);

    if (identifier.ok) {
      const res = await repo.lookup(identifier.value);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.kind).toBe("DataCorruption");
      }
    }
  });

  // G. Infrastructure Failure
  it("should return InfrastructureUnavailable when database endpoint is down", async () => {
    // Create an invalid, dead client with incorrect port
    const deadSql = postgres({
      host: "127.0.0.1",
      port: 5439, // dead port
      database: "zyppi_test",
      username: "zyppi_test",
      password: "zyppi_test",
      connect_timeout: 1, // timeout quickly
      max: 1,
    });

    const repo = new PostgresRegistryRepository(deadSql);
    const identifier = createValidatedCanonicalIdentifier("00860000000123");
    expect(identifier.ok).toBe(true);

    if (identifier.ok) {
      const res = await repo.lookup(identifier.value);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.kind).toBe("InfrastructureUnavailable");
      }
    }

    await deadSql.end();
  });

  // H. Snapshot Consistency
  it("should demonstrate snapshot consistency under READ ONLY REPEATABLE READ isolation", async () => {
    const identityId = "22222222-2222-2222-2222-222222222222";
    const standingIdBefore = "77777777-7777-7777-7777-777777777777";
    const standingIdAfter = "99999999-9999-9999-9999-999999999999";

    await sql`
      INSERT INTO identities (id, identity_type, canonical_reference, referent_id, status, created_at, updated_at)
      VALUES (${identityId}, 'gtin', '00860000000123', NULL, 'active', '2026-07-28T12:00:00Z', '2026-07-28T12:00:00Z');
    `;

    // Insert first standing
    await sql`
      INSERT INTO standings (id, subject_id, scope, valid_from, valid_to, created_at)
      VALUES (${standingIdBefore}, ${identityId}, 'scope-before', '2026-07-28T00:00:00Z', '2026-07-28T23:59:59Z', '2026-07-28T12:00:00Z');
    `;

    // Setup another independent connection client for concurrent inserts
    const concurrentSql = postgres({
      host: "127.0.0.1",
      port: 5432,
      database: "zyppi_test",
      username: "zyppi_test",
      password: "zyppi_test",
    });

    // Coordination testHook: runs after identity lookup, inserts a second standing concurrently and commits
    const testHook = async () => {
      await concurrentSql`
        INSERT INTO standings (id, subject_id, scope, valid_from, valid_to, created_at)
        VALUES (${standingIdAfter}, ${identityId}, 'scope-after-concurrent', '2026-07-28T00:00:00Z', '2026-07-28T23:59:59Z', '2026-07-28T12:00:00Z');
      `;
    };

    const repo = new PostgresRegistryRepository(sql, testHook);
    const identifier = createValidatedCanonicalIdentifier("00860000000123");
    expect(identifier.ok).toBe(true);

    if (identifier.ok) {
      const res = await repo.lookup(identifier.value);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value).not.toBeNull();
        const state = res.value!;

        // The transaction operates under REPEATABLE READ snapshot isolation.
        // Therefore, it must NOT see the concurrent insert committed after its snapshot was established!
        expect(state.standings.length).toBe(1);
        expect(state.standings[0].standingId).toBe(standingIdBefore);
      }
    }

    // A subsequent, separate query/transaction SHOULD see the newly inserted row
    const freshRepo = new PostgresRegistryRepository(sql);
    if (identifier.ok) {
      const freshRes = await freshRepo.lookup(identifier.value);
      expect(freshRes.ok).toBe(true);
      if (freshRes.ok) {
        expect(freshRes.value?.standings.length).toBe(2);
      }
    }

    await concurrentSql.end();
  });

  // Receipt Persistence Integration Tests — 12.2
  describe("PostgresReceiptRepository Persistence", () => {
    const validReceipt: ExecutionReceipt = {
      receiptId: "99999999-9999-9999-9999-999999999999", // Valid UUID string
      executionId: "exec-999",
      runtimeVersion: "0.1.0",
      inputHash: "in-hash-val",
      outputHash: "out-hash-val",
      evidenceHash: "ev-hash-val",
      policyVersion: "v1.2",
      decisionSummary: '{"decision": "authorized", "policyCount": 2}', // non-empty JSON string
      executionTime: 33.3,
      deterministicHash: "det-hash-val",
    };

    it("should successfully append/save a valid ExecutionReceipt", async () => {
      const repo = new PostgresReceiptRepository(sql);
      const res = await repo.save(validReceipt);

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value).toEqual({});
      }

      // Verify directly against database that columns map exactly as expected
      const rows = await sql`
        SELECT id, execution_id, runtime_version, input_hash, output_hash, evidence_hash,
               policy_version, decision_summary, execution_time_ms, deterministic_hash, created_at
        FROM execution_receipts
        WHERE id = ${validReceipt.receiptId}
      `;

      expect(rows.length).toBe(1);
      const r = rows[0];
      expect(r.id).toBe(validReceipt.receiptId);
      expect(r.execution_id).toBe(validReceipt.executionId);
      expect(r.runtime_version).toBe(validReceipt.runtimeVersion);
      expect(r.input_hash).toBe(validReceipt.inputHash);
      expect(r.output_hash).toBe(validReceipt.outputHash);
      expect(r.evidence_hash).toBe(validReceipt.evidenceHash);
      expect(r.policy_version).toBe(validReceipt.policyVersion);
      expect(r.decision_summary).toEqual(JSON.parse(validReceipt.decisionSummary));
      expect(r.execution_time_ms).toBe("33"); // Bigint in PG.js is integer string (truncated/rounded to integer)
      expect(r.deterministic_hash).toBe(validReceipt.deterministicHash);
      expect(r.created_at).toBeInstanceOf(Date);
    });

    it("should return OperationFailed on duplicate receipt primary key insertion", async () => {
      const repo = new PostgresReceiptRepository(sql);

      // Save first time succeeds
      const res1 = await repo.save(validReceipt);
      expect(res1.ok).toBe(true);

      // Save second time with same ID fails with OperationFailed (no DB exceptions leak)
      const res2 = await repo.save(validReceipt);
      expect(res2.ok).toBe(false);
      if (!res2.ok) {
        expect(res2.error.kind).toBe("OperationFailed");
      }
    });
  });
});

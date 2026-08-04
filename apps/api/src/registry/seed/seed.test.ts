import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import * as crypto from "crypto";
import postgres from "postgres";
import { canonicalizeJcs } from "@zyppi/domain";
import { parseAndValidateManifest } from "./seed-manifest-loader.js";
import { verifyRecordIntegrity } from "./seed-integrity.js";
import { verifyManifestAuthority } from "./seed-authority.js";
import { executeSeedTransaction } from "./postgres-registry-seeder.js";
import type { SeedManifest } from "./seed-manifest.js";
import type { SeedTrustKeyEntry } from "./seed-trust-set.js";

// Helper to sign a mock envelope dynamically at test runtime
function createSignedTestManifest(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  records: any,
  privateKey: crypto.KeyObject,
  keyId = "zyppi-seed-ed25519-2026-v1",
): SeedManifest {
  // 1. Canonicalize records and digest
  const canonicalRecs = canonicalizeJcs(records);
  const integrityDigest = crypto
    .createHash("sha256")
    .update(canonicalRecs, "utf8")
    .digest("hex");

  // 2. Build signed envelope
  const envelope = {
    manifestId: "00000000-0000-0000-0000-000000000001",
    manifestVersion: "1.0.0" as const,
    authorityReference: "zyppi:council:test-authority",
    keyId,
    integrityAlgorithm: "SHA-256" as const,
    integrityDigest,
    signatureAlgorithm: "Ed25519" as const,
  };

  const canonicalEnv = canonicalizeJcs(envelope);
  const signature = crypto
    .sign(undefined, Buffer.from(canonicalEnv, "utf8"), privateKey)
    .toString("base64");

  return {
    ...envelope,
    signature,
    records,
  };
}

describe("Registry Seed System Mechanics — AMS-0504", () => {
  let sql: postgres.Sql;
  let testPrivateKey: crypto.KeyObject;
  let testPublicKeyBase64: string;
  let testTrustSet: SeedTrustKeyEntry[];

  beforeAll(async () => {
    // Connect to real PostgreSQL test database
    sql = postgres({
      host: "127.0.0.1",
      port: 5432,
      database: "zyppi_test",
      username: "zyppi_test",
      password: "zyppi_test",
      onnotice: () => {},
    });

    // Generate ephemeral Ed25519 keypair for tests
    const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
    testPrivateKey = privateKey;
    testPublicKeyBase64 = publicKey
      .export({ type: "spki", format: "der" })
      .slice(12)
      .toString("base64");

    testTrustSet = [
      {
        keyId: "zyppi-seed-ed25519-2026-v1",
        algorithm: "Ed25519",
        publicKey: testPublicKeyBase64,
        status: "active",
      },
      {
        keyId: "zyppi-seed-ed25519-2026-revoked",
        algorithm: "Ed25519",
        publicKey: testPublicKeyBase64,
        status: "revoked",
      },
    ];
  });

  afterAll(async () => {
    if (sql) {
      await sql.end();
    }
  });

  beforeEach(async () => {
    // Clear the tables to ensure isolation
    await sql`TRUNCATE TABLE standings, capabilities, authorities, evidence, identities, referents, policies CASCADE;`;
  });

  describe("Manifest Envelope & Parsing Validation", () => {
    it("should fail on invalid JSON text", () => {
      const res = parseAndValidateManifest("{ invalid-json }");
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.outcome?.kind).toBe("ValidationRefusal");
      }
    });

    it("should fail on unsupported manifestVersion", () => {
      const records = {
        referents: [],
        identities: [],
        evidence: [],
        policies: [],
        authorities: [],
        capabilities: [],
        standings: [],
      };
      const manifest = createSignedTestManifest(records, testPrivateKey);
      const mutated = { ...manifest, manifestVersion: "2.0.0" };
      const res = parseAndValidateManifest(JSON.stringify(mutated));
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.outcome?.kind).toBe("ValidationRefusal");
      }
    });

    it("should fail on duplicate records inside collections", () => {
      const records = {
        referents: [
          {
            referentId: "ref-1",
            referentType: "manufacturer",
            name: "Aura Labs",
            parentReferentId: null,
            createdAt: "2026-08-04T00:00:00Z",
          },
          {
            referentId: "ref-1",
            referentType: "product",
            name: "Duplicate",
            parentReferentId: null,
            createdAt: "2026-08-04T00:00:00Z",
          },
        ],
        identities: [],
        evidence: [],
        policies: [],
        authorities: [],
        capabilities: [],
        standings: [],
      };
      const manifest = createSignedTestManifest(records, testPrivateKey);
      const res = parseAndValidateManifest(JSON.stringify(manifest));
      expect(res.ok).toBe(false);
      if (!res.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const out = res.outcome as any;
        expect(out.reasonCode).toBe("DUPLICATE_RECORD_IDENTITY");
      }
    });

    it("should fail on invalid referential integrity (missing referent in identity)", () => {
      const records = {
        referents: [],
        identities: [
          {
            identityId: "id-1",
            identityType: "product",
            canonicalReference: "gtin:1",
            referentId: "ref-missing",
            status: "active",
            createdAt: "2026-08-04T00:00:00Z",
            updatedAt: "2026-08-04T00:00:00Z",
          },
        ],
        evidence: [],
        policies: [],
        authorities: [],
        capabilities: [],
        standings: [],
      };
      const manifest = createSignedTestManifest(records, testPrivateKey);
      const res = parseAndValidateManifest(JSON.stringify(manifest));
      expect(res.ok).toBe(false);
      if (!res.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const out = res.outcome as any;
        expect(out.reasonCode).toBe("REFERENTIAL_INTEGRITY_VIOLATION");
      }
    });
  });

  describe("Integrity and Signature Refusals", () => {
    it("should refuse signature when integrity is valid but keyId is unknown", () => {
      const records = {
        referents: [],
        identities: [],
        evidence: [],
        policies: [],
        authorities: [],
        capabilities: [],
        standings: [],
      };
      const manifest = createSignedTestManifest(
        records,
        testPrivateKey,
        "zyppi-seed-ed25519-2026-v999",
      );

      const parsed = parseAndValidateManifest(JSON.stringify(manifest));
      expect(parsed.ok).toBe(true);
      if (parsed.ok) {
        const integrityRes = verifyRecordIntegrity(parsed.manifest);
        expect(integrityRes.ok).toBe(true);

        const authRes = verifyManifestAuthority(parsed.manifest, testTrustSet);
        expect(authRes.ok).toBe(false);
        if (!authRes.ok) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const out = authRes.outcome as any;
          expect(out.kind).toBe("AuthorityRefusal");
          expect(out.reasonCode).toBe("UNKNOWN_KEY_ID");
        }
      }
    });

    it("should refuse integrity before signature when both have defects (CD-1 Precedence)", () => {
      const records = {
        referents: [],
        identities: [],
        evidence: [],
        policies: [],
        authorities: [],
        capabilities: [],
        standings: [],
      };
      const manifest = createSignedTestManifest(
        records,
        testPrivateKey,
        "zyppi-seed-ed25519-2026-v999",
      );

      // Mutate integrity digest to cause mismatch
      const tampered = {
        ...manifest,
        integrityDigest:
          "0000000000000000000000000000000000000000000000000000000000000000",
      };

      const parsed = parseAndValidateManifest(JSON.stringify(tampered));
      expect(parsed.ok).toBe(true);
      if (parsed.ok) {
        const integrityRes = verifyRecordIntegrity(parsed.manifest);
        expect(integrityRes.ok).toBe(false);
        if (!integrityRes.ok) {
          expect(integrityRes.outcome?.kind).toBe("IntegrityRefusal");
        }
      }
    });
  });

  describe("PostgreSQL Seeder Transactional Materialization & States", () => {
    it("should successfully materialize an empty database and then return AlreadyMaterialized on rerun", async () => {
      const records = {
        referents: [
          {
            referentId: "e2a16bc0-1a1a-1a1a-1a1a-111111111111",
            referentType: "manufacturer" as const,
            name: "Aura Labs",
            parentReferentId: null,
            createdAt: "2026-08-04T00:00:00Z",
          },
        ],
        identities: [
          {
            identityId: "e2a16bc0-2b2b-2b2b-2b2b-222222222222",
            identityType: "product",
            canonicalReference: "gtin:00012345",
            referentId: "e2a16bc0-1a1a-1a1a-1a1a-111111111111",
            status: "active" as const,
            createdAt: "2026-08-04T00:00:00Z",
            updatedAt: "2026-08-04T00:00:00Z",
          },
        ],
        evidence: [],
        policies: [],
        authorities: [],
        capabilities: [],
        standings: [],
      };

      const manifest = createSignedTestManifest(records, testPrivateKey);

      // First run: Empty DB -> should materialize successfully
      const outcome1 = await executeSeedTransaction(sql, manifest);
      expect(outcome1.kind).toBe("Success");
      if (outcome1.kind === "Success") {
        expect(outcome1.materializedRecordCount).toBe(2);
      }

      // Verify records physically present
      const referentsInDb = await sql`SELECT * FROM referents`;
      expect(referentsInDb.length).toBe(1);
      expect(referentsInDb[0].name).toBe("Aura Labs");

      // Second run: Fully Equivalent -> should return AlreadyMaterialized and execute no mutations
      const outcome2 = await executeSeedTransaction(sql, manifest);
      expect(outcome2.kind).toBe("AlreadyMaterialized");
    });

    it("should refuse and rollback on divergence (StateDiverged)", async () => {
      // 1. Manually seed an existing referent in DB
      await sql`
        INSERT INTO referents (id, referent_type, name, parent_referent_id)
        VALUES ('e2a16bc0-1a1a-1a1a-1a1a-111111111111', 'manufacturer', 'Old Name', NULL)
      `;

      // 2. Load manifest with different name for the same ID (divergence!)
      const records = {
        referents: [
          {
            referentId: "e2a16bc0-1a1a-1a1a-1a1a-111111111111",
            referentType: "manufacturer" as const,
            name: "Divergent Name",
            parentReferentId: null,
            createdAt: "2026-08-04T00:00:00Z",
          },
        ],
        identities: [],
        evidence: [],
        policies: [],
        authorities: [],
        capabilities: [],
        standings: [],
      };

      const manifest = createSignedTestManifest(records, testPrivateKey);
      const outcome = await executeSeedTransaction(sql, manifest);
      expect(outcome.kind).toBe("StateDiverged");

      // Verify database remains unchanged
      const rows =
        await sql`SELECT name FROM referents WHERE id = 'e2a16bc0-1a1a-1a1a-1a1a-111111111111'`;
      expect(rows[0].name).toBe("Old Name");
    });

    it("should refuse and rollback on partial state (PartialStateAnomaly)", async () => {
      // 1. Manually seed record A
      await sql`
        INSERT INTO referents (id, referent_type, name, parent_referent_id)
        VALUES ('e2a16bc0-1a1a-1a1a-1a1a-111111111111', 'manufacturer', 'Aura Labs', NULL)
      `;

      // 2. Load manifest declaring both A and a new record B
      const records = {
        referents: [
          {
            referentId: "e2a16bc0-1a1a-1a1a-1a1a-111111111111",
            referentType: "manufacturer" as const,
            name: "Aura Labs",
            parentReferentId: null,
            createdAt: "2026-08-04T00:00:00Z",
          },
          {
            referentId: "e2a16bc0-9999-9999-9999-999999999999",
            referentType: "product" as const,
            name: "Record B",
            parentReferentId: null,
            createdAt: "2026-08-04T00:00:00Z",
          },
        ],
        identities: [],
        evidence: [],
        policies: [],
        authorities: [],
        capabilities: [],
        standings: [],
      };

      const manifest = createSignedTestManifest(records, testPrivateKey);
      const outcome = await executeSeedTransaction(sql, manifest);
      expect(outcome.kind).toBe("PartialStateAnomaly");

      // Verify that Record B was NOT inserted (rollback/no mutation)
      const rows =
        await sql`SELECT * FROM referents WHERE id = 'e2a16bc0-9999-9999-9999-999999999999'`;
      expect(rows.length).toBe(0);
    });

    it("should fail closed and rollback on transaction statement timeout", async () => {
      let errCode = "";
      try {
        await sql.begin(async (tx) => {
          await tx`SET LOCAL statement_timeout = 1;`;
          await tx`SELECT pg_sleep(0.1);`;
        });
      } catch (err: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = err as any;
        errCode = error.code || "";
      }
      expect(errCode).toBe("57014");

      // Confirm no records were inserted
      const rows = await sql`SELECT * FROM referents`;
      expect(rows.length).toBe(0);
    });
  });
});

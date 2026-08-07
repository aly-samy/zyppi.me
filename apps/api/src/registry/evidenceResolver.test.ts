import { describe, it, expect } from "vitest";
import { FrozenRegistryRepository } from "@zyppi/testing";
import { serializeEvidenceBundle, type EvidenceRecord } from "@zyppi/domain";
import type {
  RetrievedRegistryState,
  RegistryResult,
  RegistryRepository,
} from "@zyppi/contracts";
import { RegistryEvidenceResolver } from "./evidenceResolver.js";

// Setup helper snapshots with valid and invalid evidence metadata for testing
const VALID_EVIDENCE_1 = {
  evidenceId: "ev-1",
  identityId: "id-456",
  evidenceType: "document_verification",
  hash: "sha256-abc",
  storageRef: "r2://bucket/doc1.pdf",
  retrievedAt: "2026-07-28T12:00:00Z",
};

const VALID_EVIDENCE_2 = {
  evidenceId: "ev-2",
  identityId: "id-456",
  evidenceType: "seal_check",
  hash: "sha256-def",
  storageRef: "r2://bucket/doc2.pdf",
  retrievedAt: "2026-07-28T12:00:00Z",
};

const INVALID_EVIDENCE_METADATA_ITEM = {
  evidenceId: "ev-invalid",
  identityId: "id-456",
  evidenceType: "   ", // whitespace only should fail validateEvidenceRecord() and validateEvidenceBundle()
  hash: "sha256-invalid",
  storageRef: "r2://bucket/invalid.pdf",
  retrievedAt: "2026-07-28T12:00:00Z",
};

const TEST_SNAPSHOT: Record<string, RetrievedRegistryState> = {
  "state-valid": {
    identity: {
      identityId: "id-456",
      identityType: "product",
      canonicalReference: "state-valid",
      referentId: null,
      status: "active",
      createdAt: "2026-07-28T12:00:00Z",
      updatedAt: "2026-07-28T12:00:00Z",
    },
    relationships: [],
    standings: [],
    authorities: [],
    capabilities: [],
    evidenceReferences: [VALID_EVIDENCE_1, VALID_EVIDENCE_2],
    applicablePolicies: [],
  },
  "state-invalid-metadata": {
    identity: {
      identityId: "id-456",
      identityType: "product",
      canonicalReference: "state-invalid-metadata",
      referentId: null,
      status: "active",
      createdAt: "2026-07-28T12:00:00Z",
      updatedAt: "2026-07-28T12:00:00Z",
    },
    relationships: [],
    standings: [],
    authorities: [],
    capabilities: [],
    evidenceReferences: [INVALID_EVIDENCE_METADATA_ITEM],
    applicablePolicies: [],
  },
};

describe("Evidence Reference Resolver (AMS-0702 / IT-0702)", () => {
  describe("Success Scenarios", () => {
    it("should successfully resolve multiple valid references into a validated EvidenceBundle", async () => {
      const repo = new FrozenRegistryRepository(TEST_SNAPSHOT);
      const resolver = new RegistryEvidenceResolver(repo);

      const result = await resolver.resolve(["ev-1", "ev-2"]);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const bundle = result.value;
        expect(bundle.schemaVersion).toBe("1.0");
        expect(bundle.evidenceRecords).toHaveLength(2);
        expect(bundle.evidenceRecords[0]).toEqual(VALID_EVIDENCE_1);
        expect(bundle.evidenceRecords[1]).toEqual(VALID_EVIDENCE_2);

        // Verify deep freeze guarantee
        expect(Object.isFrozen(bundle)).toBe(true);
        expect(Object.isFrozen(bundle.evidenceRecords)).toBe(true);
        expect(Object.isFrozen(bundle.evidenceRecords[0])).toBe(true);
        expect(Object.isFrozen(bundle.evidenceRecords[1])).toBe(true);
      }
    });

    it("should handle empty input list gracefully by producing a valid empty EvidenceBundle", async () => {
      const repo = new FrozenRegistryRepository(TEST_SNAPSHOT);
      const resolver = new RegistryEvidenceResolver(repo);

      const result = await resolver.resolve([]);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const bundle = result.value;
        expect(bundle.schemaVersion).toBe("1.0");
        expect(bundle.evidenceRecords).toHaveLength(0);
        expect(Object.isFrozen(bundle)).toBe(true);
      }
    });
  });

  describe("Failure Scenarios & Rejections", () => {
    it("should reject duplicate references inside the input identifiers", async () => {
      const repo = new FrozenRegistryRepository(TEST_SNAPSHOT);
      const resolver = new RegistryEvidenceResolver(repo);

      const result = await resolver.resolve(["ev-1", "ev-1"]);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("DUPLICATE_REFERENCE");
        expect(result.error.message).toContain("Duplicate evidence reference");
      }
    });

    it("should fail atomic resolution with REFERENCE_NOT_FOUND when any reference is missing", async () => {
      const repo = new FrozenRegistryRepository(TEST_SNAPSHOT);
      const resolver = new RegistryEvidenceResolver(repo);

      // ev-3 does not exist in the snapshot, so it must fail completely (fail-fast, no partial bundle)
      const result = await resolver.resolve(["ev-1", "ev-3"]);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("REFERENCE_NOT_FOUND");
        expect(result.error.message).toContain("Evidence reference not found");
      }
    });

    it("should fail with INVALID_EVIDENCE_METADATA if any resolved record fails validateEvidenceBundle() validation", async () => {
      const repo = new FrozenRegistryRepository(TEST_SNAPSHOT);
      const resolver = new RegistryEvidenceResolver(repo);

      const result = await resolver.resolve(["ev-invalid"]);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_EVIDENCE_METADATA");
        expect(result.error.message).toContain("validation failed");
      }
    });

    it("should return RESOLVER_FAILURE if the underlying repository lookup fails", async () => {
      const failingRepo = {
        lookup: async () => ({ ok: true as const, value: null }),
        lookupEvidenceByIds: async (): Promise<
          RegistryResult<readonly EvidenceRecord[]>
        > => {
          return {
            ok: false as const,
            error: { kind: "InfrastructureUnavailable" },
          };
        },
      };

      const resolver = new RegistryEvidenceResolver(failingRepo);
      const result = await resolver.resolve(["ev-1"]);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("RESOLVER_FAILURE");
        expect(result.error.message).toContain("Registry lookup failed");
      }
    });

    it("should return RESOLVER_FAILURE if repository throws an unexpected exception", async () => {
      const explodingRepo = {
        lookup: async () => ({ ok: true as const, value: null }),
        lookupEvidenceByIds: async (): Promise<readonly EvidenceRecord[]> => {
          throw new Error("Unexpected postgres connection crash");
        },
      };

      const resolver = new RegistryEvidenceResolver(
        explodingRepo as unknown as RegistryRepository,
      );
      const result = await resolver.resolve(["ev-1"]);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("RESOLVER_FAILURE");
        expect(result.error.message).toContain("Unexpected repository failure");
        // DB-specific error shouldn't escape unformatted/raw
        expect(result.error.message).not.toContain("PostgresError");
      }
    });

    it("should return RESOLVER_FAILURE on invalid input types", async () => {
      const repo = new FrozenRegistryRepository(TEST_SNAPSHOT);
      const resolver = new RegistryEvidenceResolver(repo);

      const res1 = await resolver.resolve(null as unknown as readonly string[]);
      expect(res1.ok).toBe(false);
      if (!res1.ok) {
        expect(res1.error.code).toBe("RESOLVER_FAILURE");
      }

      const res2 = await resolver.resolve(["ev-1", 123 as unknown as string]);
      expect(res2.ok).toBe(false);
      if (!res2.ok) {
        expect(res2.error.code).toBe("RESOLVER_FAILURE");
      }
    });
  });

  describe("Constitutional Semantics (Ordering, Idempotency & Canonical Serialization)", () => {
    it("should demonstrate idempotent resolution where repeated executions yield identical outcomes", async () => {
      const repo = new FrozenRegistryRepository(TEST_SNAPSHOT);
      const resolver = new RegistryEvidenceResolver(repo);

      const firstResult = await resolver.resolve(["ev-1", "ev-2"]);
      const secondResult = await resolver.resolve(["ev-1", "ev-2"]);

      expect(firstResult.ok).toBe(true);
      expect(secondResult.ok).toBe(true);
      if (firstResult.ok && secondResult.ok) {
        expect(firstResult.value).toEqual(secondResult.value);
        expect(serializeEvidenceBundle(firstResult.value)).toBe(
          serializeEvidenceBundle(secondResult.value),
        );
      }
    });

    it("should guarantee output canonical serialization is independent of input ordering", async () => {
      const repo = new FrozenRegistryRepository(TEST_SNAPSHOT);
      const resolver = new RegistryEvidenceResolver(repo);

      // Retrieve same evidence IDs in different input orderings
      const resOrdered1 = await resolver.resolve(["ev-1", "ev-2"]);
      const resOrdered2 = await resolver.resolve(["ev-2", "ev-1"]);

      expect(resOrdered1.ok).toBe(true);
      expect(resOrdered2.ok).toBe(true);

      if (resOrdered1.ok && resOrdered2.ok) {
        const bundle1 = resOrdered1.value;
        const bundle2 = resOrdered2.value;

        // The serialized outputs must be exactly bit-level identical (thanks to serializeEvidenceBundle sorting)
        const serialized1 = serializeEvidenceBundle(bundle1);
        const serialized2 = serializeEvidenceBundle(bundle2);

        expect(serialized1).toBe(serialized2);
      }
    });
  });
});

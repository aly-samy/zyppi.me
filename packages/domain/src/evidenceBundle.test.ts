import { describe, it, expect } from "vitest";
import {
  validateEvidenceBundle,
  serializeEvidenceBundle,
  type EvidenceBundle,
  type EvidenceRecord,
  validateExecutionContext,
} from "./index.js";

describe("EvidenceBundle Domain Model", () => {
  const validEvidence1: EvidenceRecord = {
    evidenceId: "ev-1",
    identityId: "id-456",
    evidenceType: "document_verification",
    hash: "sha256-abc",
    storageRef: "r2://bucket/doc1.pdf",
    retrievedAt: "2026-07-28T12:00:00Z",
  };

  const validEvidence2: EvidenceRecord = {
    evidenceId: "ev-2",
    identityId: "id-456",
    evidenceType: "seal_check",
    hash: "sha256-def",
    storageRef: "r2://bucket/doc2.pdf",
    retrievedAt: "2026-07-28T12:00:00Z",
  };

  describe("Validation", () => {
    it("accepts a well-formed input with schemaVersion 1.0", () => {
      const input = {
        schemaVersion: "1.0",
        evidenceRecords: [validEvidence1, validEvidence2],
      };
      const result = validateEvidenceBundle(input);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.schemaVersion).toBe("1.0");
        expect(result.value.evidenceRecords).toHaveLength(2);
        expect(result.value.evidenceRecords[0]).toEqual(validEvidence1);
        expect(result.value.evidenceRecords[1]).toEqual(validEvidence2);
      }
    });

    it("accepts an empty evidenceRecords list as valid", () => {
      const input = {
        schemaVersion: "1.0",
        evidenceRecords: [],
      };
      const result = validateEvidenceBundle(input);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.schemaVersion).toBe("1.0");
        expect(result.value.evidenceRecords).toHaveLength(0);
      }
    });

    it("rejects non-object inputs with INVALID_BUNDLE", () => {
      const resultNull = validateEvidenceBundle(null);
      expect(resultNull.ok).toBe(false);
      if (!resultNull.ok) {
        expect(resultNull.error.code).toBe("INVALID_BUNDLE");
        expect(resultNull.error.field).toBe("bundle");
      }

      const resultString = validateEvidenceBundle("not-an-object");
      expect(resultString.ok).toBe(false);
      if (!resultString.ok) {
        expect(resultString.error.code).toBe("INVALID_BUNDLE");
      }
    });

    it("rejects missing or invalid schemaVersion", () => {
      // Missing
      const inputMissing = {
        evidenceRecords: [validEvidence1],
      };
      const resultMissing = validateEvidenceBundle(inputMissing);
      expect(resultMissing.ok).toBe(false);
      if (!resultMissing.ok) {
        expect(resultMissing.error.code).toBe("INVALID_SCHEMA_VERSION");
        expect(resultMissing.error.field).toBe("schemaVersion");
      }

      // Non-string
      const inputNonString = {
        schemaVersion: 1.0,
        evidenceRecords: [validEvidence1],
      };
      const resultNonString = validateEvidenceBundle(inputNonString);
      expect(resultNonString.ok).toBe(false);
      if (!resultNonString.ok) {
        expect(resultNonString.error.code).toBe("INVALID_SCHEMA_VERSION");
      }

      // Unsupported value
      const inputUnsupported = {
        schemaVersion: "2.0",
        evidenceRecords: [validEvidence1],
      };
      const resultUnsupported = validateEvidenceBundle(inputUnsupported);
      expect(resultUnsupported.ok).toBe(false);
      if (!resultUnsupported.ok) {
        expect(resultUnsupported.error.code).toBe("INVALID_SCHEMA_VERSION");
      }
    });

    it("rejects non-array evidenceRecords", () => {
      const input = {
        schemaVersion: "1.0",
        evidenceRecords: "not-an-array",
      };
      const result = validateEvidenceBundle(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_EVIDENCE_RECORDS");
        expect(result.error.field).toBe("evidenceRecords");
      }
    });

    it("rejects invalid EvidenceRecord items with INVALID_EVIDENCE_RECORD", () => {
      const invalidRecord = {
        ...validEvidence1,
        evidenceId: "", // invalid because empty string is rejected
      };
      const input = {
        schemaVersion: "1.0",
        evidenceRecords: [invalidRecord],
      };
      const result = validateEvidenceBundle(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_EVIDENCE_RECORD");
        expect(result.error.field).toBe("evidenceRecords");
      }
    });

    it("rejects duplicate references with DUPLICATE_EVIDENCE_REFERENCE", () => {
      const input = {
        schemaVersion: "1.0",
        evidenceRecords: [
          validEvidence1,
          { ...validEvidence1, evidenceId: "ev-1" },
        ],
      };
      const result = validateEvidenceBundle(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("DUPLICATE_EVIDENCE_REFERENCE");
        expect(result.error.field).toBe("evidenceRecords");
        expect(result.error.message).toContain(
          "Duplicate evidence reference detected",
        );
      }
    });
  });

  describe("Deterministic Serialization", () => {
    it("serializes deterministically sorting evidenceRecords by evidenceId lexically", () => {
      const bundle1: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [validEvidence2, validEvidence1],
      };
      const bundle2: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [validEvidence1, validEvidence2],
      };

      const serialized1 = serializeEvidenceBundle(bundle1);
      const serialized2 = serializeEvidenceBundle(bundle2);

      expect(serialized1).toBe(serialized2);

      // Verify that sorting has sorted records ascendingly by evidenceId ("ev-1" -> "ev-2")
      const parsed = JSON.parse(serialized1);
      expect(parsed.evidenceRecords[0].evidenceId).toBe("ev-1");
      expect(parsed.evidenceRecords[1].evidenceId).toBe("ev-2");
    });

    it("does not mutate original bundle input during serialization", () => {
      const originalRecords = [validEvidence2, validEvidence1];
      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: originalRecords,
      };

      serializeEvidenceBundle(bundle);

      // Verify original array reference is not mutated or reordered
      expect(bundle.evidenceRecords).toBe(originalRecords);
      expect(bundle.evidenceRecords[0]).toBe(validEvidence2);
      expect(bundle.evidenceRecords[1]).toBe(validEvidence1);
    });

    it("produces identical output on repeated serialization", () => {
      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [validEvidence1, validEvidence2],
      };
      const first = serializeEvidenceBundle(bundle);
      const second = serializeEvidenceBundle(bundle);
      expect(first).toBe(second);
    });

    it("serialize → deserialize → serialize produces identical canonical output", () => {
      const originalBundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [validEvidence2, validEvidence1],
      };

      const serializedOriginal = serializeEvidenceBundle(originalBundle);
      const deserializedResult = validateEvidenceBundle(
        JSON.parse(serializedOriginal),
      );

      expect(deserializedResult.ok).toBe(true);
      if (deserializedResult.ok) {
        const serializedDeserialized = serializeEvidenceBundle(
          deserializedResult.value,
        );
        expect(serializedDeserialized).toBe(serializedOriginal);
      }
    });
  });

  describe("Compile-time Type Assertions", () => {
    it("verify readonly type guarantees on compile-time", () => {
      const bundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [validEvidence1],
      };

      // @ts-expect-error schemaVersion is readonly
      bundle.schemaVersion = "2.0";

      // @ts-expect-error evidenceRecords is readonly
      bundle.evidenceRecords = [];

      // We don't verify non-mutation at runtime because runtime javascript doesn't prevent property reassignment unless Object.freeze is called.
      expect(true).toBe(true);
    });
  });

  describe("ExecutionContext Non-Regression Check", () => {
    it("verify that existing ExecutionContext validation remains unchanged", () => {
      const validECInput = {
        budget: 500,
        entropy: "some_entropy_value",
        versions: ["1.0", "1.1"],
      };

      const result = validateExecutionContext(validECInput);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.budget).toBe(500);
        expect(result.value.entropy).toBe("some_entropy_value");
        expect(result.value.versions).toEqual(["1.0", "1.1"]);
      }
    });
  });
});

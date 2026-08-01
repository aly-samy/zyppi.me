import { describe, it, expect } from "vitest";
import {
  validateEvidenceRecord,
  serializeEvidenceRecord,
  type EvidenceRecord,
} from "./index.js";

describe("EvidenceRecord Domain Model", () => {
  const validRecordInput = {
    evidenceId: "ev-123",
    identityId: "id-456",
    evidenceType: "document_verification",
    hash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    storageRef: "r2://evidence-bucket/id-456/receipt.pdf",
    retrievedAt: "2026-07-28T12:00:00Z",
  };

  describe("Validation", () => {
    it("accepts a well-formed input", () => {
      const result = validateEvidenceRecord(validRecordInput);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(validRecordInput);
      }
    });

    it("rejects non-object inputs", () => {
      const result1 = validateEvidenceRecord(null);
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_EVIDENCE_ID");
        expect(result1.error.field).toBe("evidenceId");
        expect(result1.error.message).toContain(
          "Evidence record must be a non-null object.",
        );
      }

      const result2 = validateEvidenceRecord("not-an-object");
      expect(result2.ok).toBe(false);
      if (!result2.ok) {
        expect(result2.error.code).toBe("INVALID_EVIDENCE_ID");
        expect(result2.error.field).toBe("evidenceId");
      }
    });

    it("rejects empty or whitespace-only evidenceId", () => {
      const result1 = validateEvidenceRecord({
        ...validRecordInput,
        evidenceId: "",
      });
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_EVIDENCE_ID");
        expect(result1.error.field).toBe("evidenceId");
      }

      const result2 = validateEvidenceRecord({
        ...validRecordInput,
        evidenceId: "   ",
      });
      expect(result2.ok).toBe(false);
    });

    it("rejects invalid or empty identityId", () => {
      const result1 = validateEvidenceRecord({
        ...validRecordInput,
        identityId: "",
      });
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_IDENTITY_ID");
        expect(result1.error.field).toBe("identityId");
      }

      const result2 = validateEvidenceRecord({
        ...validRecordInput,
        identityId: "   ",
      });
      expect(result2.ok).toBe(false);

      const result3 = validateEvidenceRecord({
        ...validRecordInput,
        identityId: 1234,
      });
      expect(result3.ok).toBe(false);
    });

    it("rejects invalid or empty evidenceType", () => {
      const result1 = validateEvidenceRecord({
        ...validRecordInput,
        evidenceType: "",
      });
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_EVIDENCE_TYPE");
        expect(result1.error.field).toBe("evidenceType");
      }

      const result2 = validateEvidenceRecord({
        ...validRecordInput,
        evidenceType: "   ",
      });
      expect(result2.ok).toBe(false);

      const result3 = validateEvidenceRecord({
        ...validRecordInput,
        evidenceType: null,
      });
      expect(result3.ok).toBe(false);
    });

    it("rejects invalid or empty hash", () => {
      const result1 = validateEvidenceRecord({
        ...validRecordInput,
        hash: "",
      });
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_HASH");
        expect(result1.error.field).toBe("hash");
      }

      const result2 = validateEvidenceRecord({
        ...validRecordInput,
        hash: "   ",
      });
      expect(result2.ok).toBe(false);

      const result3 = validateEvidenceRecord({
        ...validRecordInput,
        hash: 123,
      });
      expect(result3.ok).toBe(false);
    });

    it("rejects invalid or empty storageRef", () => {
      const result1 = validateEvidenceRecord({
        ...validRecordInput,
        storageRef: "",
      });
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_STORAGE_REF");
        expect(result1.error.field).toBe("storageRef");
      }

      const result2 = validateEvidenceRecord({
        ...validRecordInput,
        storageRef: "   ",
      });
      expect(result2.ok).toBe(false);

      const result3 = validateEvidenceRecord({
        ...validRecordInput,
        storageRef: true,
      });
      expect(result3.ok).toBe(false);
    });

    it("rejects invalid or non-UTC ISO-8601 retrievedAt", () => {
      const invalidTimes = [
        "2026-07-28", // incomplete
        "2026-07-28T12:00:00", // missing Z timezone
        "2026-07-28T12:00:00+02:00", // offset is not allowed (must be strict UTC Z)
        "not-a-date",
        "2026-02-30T12:00:00Z", // invalid date (Feb 30)
        "2026-07-28T25:00:00Z", // invalid hour
        "2026-07-28T12:60:00Z", // invalid minute
        "2026-07-28T12:00:60Z", // invalid second
      ];

      for (const time of invalidTimes) {
        const result = validateEvidenceRecord({
          ...validRecordInput,
          retrievedAt: time,
        });
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe("INVALID_RETRIEVED_AT");
          expect(result.error.field).toBe("retrievedAt");
        }
      }
    });

    it("accepts valid leap-year usage for retrievedAt", () => {
      const leapYearTime = "2024-02-29T12:00:00Z";
      const result = validateEvidenceRecord({
        ...validRecordInput,
        retrievedAt: leapYearTime,
      });
      expect(result.ok).toBe(true);
    });

    it("rejects invalid leap-year usage for retrievedAt", () => {
      const nonLeapYearTime = "2025-02-29T12:00:00Z";
      const result = validateEvidenceRecord({
        ...validRecordInput,
        retrievedAt: nonLeapYearTime,
      });
      expect(result.ok).toBe(false);
    });

    it("preserves opaque fields exactly and does not silently rewrite them", () => {
      const input = {
        evidenceId: "  preserve-id  ",
        identityId: "  preserve-identity-id  ",
        evidenceType: "  preserve-type  ",
        hash: "  preserve-hash  ",
        storageRef: "  preserve-ref  ",
        retrievedAt: "2026-07-28T12:00:00Z",
      };

      const result = validateEvidenceRecord(input);
      expect(result.ok).toBe(true);
      if (result.ok) {
        // Trimming validation checks non-empty state, but must PRESERVE the original input exactly
        expect(result.value.evidenceId).toBe("  preserve-id  ");
        expect(result.value.identityId).toBe("  preserve-identity-id  ");
        expect(result.value.evidenceType).toBe("  preserve-type  ");
        expect(result.value.hash).toBe("  preserve-hash  ");
        expect(result.value.storageRef).toBe("  preserve-ref  ");
      }
    });
  });

  describe("Canonical Serialization", () => {
    it("serializes deterministically in exact alphabetical key order", () => {
      const record: EvidenceRecord = {
        evidenceId: "ev-123",
        identityId: "id-456",
        evidenceType: "document_verification",
        hash: "sha256-abc",
        storageRef: "r2://bucket/receipt.pdf",
        retrievedAt: "2026-07-28T12:00:00Z",
      };

      const serialized = serializeEvidenceRecord(record);

      // Verify exact alphabetical key order:
      // evidenceId, evidenceType, hash, identityId, retrievedAt, storageRef
      const parsedKeys = Object.keys(JSON.parse(serialized));
      expect(parsedKeys).toEqual([
        "evidenceId",
        "evidenceType",
        "hash",
        "identityId",
        "retrievedAt",
        "storageRef",
      ]);

      // Verify deterministic string matching
      const expected = JSON.stringify({
        evidenceId: "ev-123",
        evidenceType: "document_verification",
        hash: "sha256-abc",
        identityId: "id-456",
        retrievedAt: "2026-07-28T12:00:00Z",
        storageRef: "r2://bucket/receipt.pdf",
      });
      expect(serialized).toBe(expected);
    });

    it("repeated serialization of the same valid record produces byte-identical output", () => {
      const record: EvidenceRecord = {
        evidenceId: "ev-123",
        identityId: "id-456",
        evidenceType: "document_verification",
        hash: "sha256-abc",
        storageRef: "r2://bucket/receipt.pdf",
        retrievedAt: "2026-07-28T12:00:00Z",
      };

      const serialized1 = serializeEvidenceRecord(record);
      const serialized2 = serializeEvidenceRecord(record);
      expect(serialized1).toBe(serialized2);
    });

    it("equivalent records with different property insertion histories produce identical output", () => {
      // Create object with property sequence A
      const recordA = {} as unknown as Record<string, unknown>;
      recordA.evidenceId = "ev-123";
      recordA.identityId = "id-456";
      recordA.evidenceType = "document_verification";
      recordA.hash = "sha256-abc";
      recordA.storageRef = "r2://bucket/receipt.pdf";
      recordA.retrievedAt = "2026-07-28T12:00:00Z";

      // Create object with property sequence B
      const recordB = {} as unknown as Record<string, unknown>;
      recordB.retrievedAt = "2026-07-28T12:00:00Z";
      recordB.storageRef = "r2://bucket/receipt.pdf";
      recordB.hash = "sha256-abc";
      recordB.evidenceType = "document_verification";
      recordB.identityId = "id-456";
      recordB.evidenceId = "ev-123";

      const serializedA = serializeEvidenceRecord(
        recordA as unknown as EvidenceRecord,
      );
      const serializedB = serializeEvidenceRecord(
        recordB as unknown as EvidenceRecord,
      );

      expect(serializedA).toBe(serializedB);
    });

    it("performs successful serialize -> JSON.parse -> validate round-trip", () => {
      const record: EvidenceRecord = {
        evidenceId: "ev-123",
        identityId: "id-456",
        evidenceType: "document_verification",
        hash: "sha256-abc",
        storageRef: "r2://bucket/receipt.pdf",
        retrievedAt: "2026-07-28T12:00:00Z",
      };

      const serialized = serializeEvidenceRecord(record);
      const parsed = JSON.parse(serialized);
      const validationResult = validateEvidenceRecord(parsed);

      expect(validationResult.ok).toBe(true);
      if (validationResult.ok) {
        expect(validationResult.value).toEqual(record);
      }
    });
  });

  describe("Immutability", () => {
    it("expresses readonly contract at compile-time", () => {
      const record: EvidenceRecord = {
        evidenceId: "ev-123",
        identityId: "id-456",
        evidenceType: "document_verification",
        hash: "sha256-abc",
        storageRef: "r2://bucket/receipt.pdf",
        retrievedAt: "2026-07-28T12:00:00Z",
      };

      // @ts-expect-error EvidenceRecord properties are readonly
      record.evidenceId = "new-id";

      // @ts-expect-error EvidenceRecord properties are readonly
      record.identityId = "new-id";

      // @ts-expect-error EvidenceRecord properties are readonly
      record.evidenceType = "new-type";

      // @ts-expect-error EvidenceRecord properties are readonly
      record.hash = "new-hash";

      // @ts-expect-error EvidenceRecord properties are readonly
      record.storageRef = "new-ref";

      // @ts-expect-error EvidenceRecord properties are readonly
      record.retrievedAt = "2026-07-28T13:00:00Z";

      // The compile-time test compiles cleanly because of the @ts-expect-error directives.
      // We don't verify non-mutation at runtime because runtime javascript doesn't prevent property reassignment unless Object.freeze is called.
      expect(true).toBe(true);
    });
  });
});

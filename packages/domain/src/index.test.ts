import { describe, it, expect } from "vitest";
import {
  validateIdentityRecord,
  serializeIdentityRecord,
  type IdentityRecord,
} from "./index.js";

describe("IdentityRecord Domain Model", () => {
  const validRecordInput = {
    identityId: "id-123",
    identityType: "product",
    canonicalReference: "https://id.gs1.org/01/09780201379626",
    referentId: "ref-456",
    status: "active" as const,
    createdAt: "2026-07-28T12:00:00Z",
    updatedAt: "2026-07-28T12:05:00.123Z",
  };

  describe("Validation", () => {
    it("accepts a well-formed input", () => {
      const result = validateIdentityRecord(validRecordInput);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(validRecordInput);
      }
    });

    it("accepts a well-formed input with null referentId", () => {
      const input = { ...validRecordInput, referentId: null };
      const result = validateIdentityRecord(input);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.referentId).toBeNull();
      }
    });

    it("rejects non-object inputs", () => {
      const result1 = validateIdentityRecord(null);
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_IDENTITY_ID");
      }

      const result2 = validateIdentityRecord("string");
      expect(result2.ok).toBe(false);
    });

    it("rejects empty or whitespace-only identityId", () => {
      const result1 = validateIdentityRecord({
        ...validRecordInput,
        identityId: "",
      });
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_IDENTITY_ID");
        expect(result1.error.field).toBe("identityId");
      }

      const result2 = validateIdentityRecord({
        ...validRecordInput,
        identityId: "   ",
      });
      expect(result2.ok).toBe(false);
    });

    it("rejects empty or whitespace-only identityType", () => {
      const result1 = validateIdentityRecord({
        ...validRecordInput,
        identityType: "",
      });
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_IDENTITY_TYPE");
        expect(result1.error.field).toBe("identityType");
      }

      const result2 = validateIdentityRecord({
        ...validRecordInput,
        identityType: "\n\t",
      });
      expect(result2.ok).toBe(false);
    });

    it("rejects empty or whitespace-only canonicalReference", () => {
      const result1 = validateIdentityRecord({
        ...validRecordInput,
        canonicalReference: "",
      });
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_CANONICAL_REFERENCE");
        expect(result1.error.field).toBe("canonicalReference");
      }

      const result2 = validateIdentityRecord({
        ...validRecordInput,
        canonicalReference: "   ",
      });
      expect(result2.ok).toBe(false);
    });

    it("rejects invalid referentId types or empty strings", () => {
      const result1 = validateIdentityRecord({
        ...validRecordInput,
        referentId: "",
      });
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_REFERENT_ID");
        expect(result1.error.field).toBe("referentId");
      }

      const result2 = validateIdentityRecord({
        ...validRecordInput,
        referentId: "  ",
      });
      expect(result2.ok).toBe(false);

      const result3 = validateIdentityRecord({
        ...validRecordInput,
        referentId: 123,
      });
      expect(result3.ok).toBe(false);
    });

    it("rejects invalid status", () => {
      const result = validateIdentityRecord({
        ...validRecordInput,
        status: "unknown",
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_STATUS");
        expect(result.error.field).toBe("status");
      }
    });

    it("rejects invalid or non-UTC ISO-8601 createdAt", () => {
      const invalidTimes = [
        "2026-07-28", // incomplete
        "2026-07-28T12:00:00", // missing Z timezone
        "2026-07-28T12:00:00+02:00", // offset is not allowed (must be strict UTC Z)
        "not-a-date",
        "2026-02-30T12:00:00Z", // invalid date (Feb 30)
      ];

      for (const time of invalidTimes) {
        const result = validateIdentityRecord({
          ...validRecordInput,
          createdAt: time,
        });
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe("INVALID_CREATED_AT");
          expect(result.error.field).toBe("createdAt");
        }
      }
    });

    it("rejects invalid or non-UTC ISO-8601 updatedAt", () => {
      const invalidTimes = ["2026-07-28T12:00:00", "invalid"];

      for (const time of invalidTimes) {
        const result = validateIdentityRecord({
          ...validRecordInput,
          updatedAt: time,
        });
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe("INVALID_UPDATED_AT");
          expect(result.error.field).toBe("updatedAt");
        }
      }
    });
  });

  describe("Canonical Serialization", () => {
    it("serializes deterministically regardless of key order in Javascript memory", () => {
      const recordA: IdentityRecord = {
        identityId: "id-123",
        identityType: "product",
        canonicalReference: "https://id.gs1.org/01/09780201379626",
        referentId: "ref-456",
        status: "active",
        createdAt: "2026-07-28T12:00:00Z",
        updatedAt: "2026-07-28T12:05:00.123Z",
      };

      const serialized = serializeIdentityRecord(recordA);

      // Verify strict alphabetic key ordering:
      // canonicalReference -> createdAt -> identityId -> identityType -> referentId -> status -> updatedAt
      const parsedKeys = Object.keys(JSON.parse(serialized));
      expect(parsedKeys).toEqual([
        "canonicalReference",
        "createdAt",
        "identityId",
        "identityType",
        "referentId",
        "status",
        "updatedAt",
      ]);

      // Serializing must always produce byte-identical strings
      const expected = JSON.stringify({
        canonicalReference: "https://id.gs1.org/01/09780201379626",
        createdAt: "2026-07-28T12:00:00Z",
        identityId: "id-123",
        identityType: "product",
        referentId: "ref-456",
        status: "active",
        updatedAt: "2026-07-28T12:05:00.123Z",
      });
      expect(serialized).toBe(expected);
    });

    it("performs successful serialize -> deserialize -> identical value round-trip", () => {
      const record: IdentityRecord = {
        identityId: "id-999",
        identityType: "manufacturer",
        canonicalReference: "https://id.gs1.org/01/00000000000000",
        referentId: null,
        status: "draft",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      };

      const serialized = serializeIdentityRecord(record);
      const deserialized = JSON.parse(serialized);

      expect(deserialized).toEqual(record);
    });
  });
});

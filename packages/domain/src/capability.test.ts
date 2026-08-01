import { describe, it, expect } from "vitest";
import {
  validateCapabilityRecord,
  serializeCapabilityRecord,
  type CapabilityRecord,
  type AuthorityRecord,
} from "./index.js";

describe("CapabilityRecord Domain Model", () => {
  const validRecordInput = {
    capabilityId: "cap-123",
    subjectId: "id-456",
    scope: "assert:compliance",
    validFrom: "2026-07-28T12:00:00Z",
    validTo: "2026-07-28T14:00:00Z",
  };

  describe("Validation", () => {
    it("accepts a well-formed input", () => {
      const result = validateCapabilityRecord(validRecordInput);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(validRecordInput);
      }
    });

    it("rejects non-object inputs", () => {
      const result1 = validateCapabilityRecord(null);
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_CAPABILITY_ID");
        expect(result1.error.field).toBe("capabilityId");
        expect(result1.error.message).toContain(
          "Input must be a non-null object",
        );
      }

      const result2 = validateCapabilityRecord("not-an-object");
      expect(result2.ok).toBe(false);
      if (!result2.ok) {
        expect(result2.error.code).toBe("INVALID_CAPABILITY_ID");
        expect(result2.error.field).toBe("capabilityId");
      }

      const result3 = validateCapabilityRecord([]);
      expect(result3.ok).toBe(false);
      if (!result3.ok) {
        expect(result3.error.code).toBe("INVALID_CAPABILITY_ID");
        expect(result3.error.field).toBe("capabilityId");
      }
    });

    it("rejects empty or whitespace-only capabilityId", () => {
      const result1 = validateCapabilityRecord({
        ...validRecordInput,
        capabilityId: "",
      });
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_CAPABILITY_ID");
        expect(result1.error.field).toBe("capabilityId");
      }

      const result2 = validateCapabilityRecord({
        ...validRecordInput,
        capabilityId: "   ",
      });
      expect(result2.ok).toBe(false);
    });

    it("rejects empty or whitespace-only subjectId", () => {
      const result1 = validateCapabilityRecord({
        ...validRecordInput,
        subjectId: "",
      });
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_SUBJECT_ID");
        expect(result1.error.field).toBe("subjectId");
      }

      const result2 = validateCapabilityRecord({
        ...validRecordInput,
        subjectId: "   ",
      });
      expect(result2.ok).toBe(false);
    });

    it("rejects empty or whitespace-only scope", () => {
      const result1 = validateCapabilityRecord({
        ...validRecordInput,
        scope: "",
      });
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_SCOPE");
        expect(result1.error.field).toBe("scope");
      }

      const result2 = validateCapabilityRecord({
        ...validRecordInput,
        scope: "   ",
      });
      expect(result2.ok).toBe(false);
    });

    it("rejects invalid or non-UTC ISO-8601 validFrom", () => {
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
        const result = validateCapabilityRecord({
          ...validRecordInput,
          validFrom: time,
        });
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe("INVALID_VALID_FROM");
          expect(result.error.field).toBe("validFrom");
        }
      }
    });

    it("rejects invalid or non-UTC ISO-8601 validTo", () => {
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
        const result = validateCapabilityRecord({
          ...validRecordInput,
          validTo: time,
        });
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe("INVALID_VALID_TO");
          expect(result.error.field).toBe("validTo");
        }
      }
    });

    it("accepts valid leap-year usage for validFrom/validTo", () => {
      const result = validateCapabilityRecord({
        ...validRecordInput,
        validFrom: "2024-02-29T12:00:00Z",
        validTo: "2024-02-29T13:00:00Z",
      });
      expect(result.ok).toBe(true);
    });

    it("rejects invalid leap-year usage for validFrom/validTo", () => {
      const result1 = validateCapabilityRecord({
        ...validRecordInput,
        validFrom: "2025-02-29T12:00:00Z",
      });
      expect(result1.ok).toBe(false);

      const result2 = validateCapabilityRecord({
        ...validRecordInput,
        validTo: "2025-02-29T12:00:00Z",
      });
      expect(result2.ok).toBe(false);
    });

    it("accepts validTo equal to validFrom (zero duration, boundary case)", () => {
      const zeroDurationInput = {
        ...validRecordInput,
        validFrom: "2026-07-28T12:00:00Z",
        validTo: "2026-07-28T12:00:00Z",
      };
      const result = validateCapabilityRecord(zeroDurationInput);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(zeroDurationInput);
      }
    });

    it("rejects validTo chronologically before validFrom with VALID_TO_BEFORE_VALID_FROM", () => {
      const result = validateCapabilityRecord({
        ...validRecordInput,
        validFrom: "2026-07-28T14:00:00Z",
        validTo: "2026-07-28T12:00:00Z",
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("VALID_TO_BEFORE_VALID_FROM");
        expect(result.error.field).toBe("validTo");
      }
    });

    it("preserves original values exactly without trimming or normalizing in output", () => {
      const customInput = {
        capabilityId: "  cap-123  ",
        subjectId: "  id-456  ",
        scope: "  assert:compliance  ",
        validFrom: "2026-07-28T12:00:00Z",
        validTo: "2026-07-28T14:00:00Z",
      };

      const result = validateCapabilityRecord(customInput);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.capabilityId).toBe("  cap-123  ");
        expect(result.value.subjectId).toBe("  id-456  ");
        expect(result.value.scope).toBe("  assert:compliance  ");
      }
    });
  });

  describe("Canonical Serialization", () => {
    it("serializes deterministically in exact alphabetical key order", () => {
      const record: CapabilityRecord = {
        capabilityId: "cap-123",
        scope: "assert:compliance",
        subjectId: "id-456",
        validFrom: "2026-07-28T12:00:00Z",
        validTo: "2026-07-28T14:00:00Z",
      };

      const serialized = serializeCapabilityRecord(record);

      // Verify exact alphabetical key order:
      // capabilityId, scope, subjectId, validFrom, validTo
      const parsedKeys = Object.keys(JSON.parse(serialized));
      expect(parsedKeys).toEqual([
        "capabilityId",
        "scope",
        "subjectId",
        "validFrom",
        "validTo",
      ]);

      const expected = JSON.stringify({
        capabilityId: "cap-123",
        scope: "assert:compliance",
        subjectId: "id-456",
        validFrom: "2026-07-28T12:00:00Z",
        validTo: "2026-07-28T14:00:00Z",
      });
      expect(serialized).toBe(expected);
    });

    it("repeated serialization produces byte-identical output", () => {
      const record: CapabilityRecord = {
        capabilityId: "cap-123",
        scope: "assert:compliance",
        subjectId: "id-456",
        validFrom: "2026-07-28T12:00:00Z",
        validTo: "2026-07-28T14:00:00Z",
      };

      const serialized1 = serializeCapabilityRecord(record);
      const serialized2 = serializeCapabilityRecord(record);
      expect(serialized1).toBe(serialized2);
    });

    it("equivalent records with different property insertion histories produce identical output", () => {
      const recordA = {} as unknown as Record<string, unknown>;
      recordA.capabilityId = "cap-123";
      recordA.scope = "assert:compliance";
      recordA.subjectId = "id-456";
      recordA.validFrom = "2026-07-28T12:00:00Z";
      recordA.validTo = "2026-07-28T14:00:00Z";

      const recordB = {} as unknown as Record<string, unknown>;
      recordB.validTo = "2026-07-28T14:00:00Z";
      recordB.validFrom = "2026-07-28T12:00:00Z";
      recordB.subjectId = "id-456";
      recordB.scope = "assert:compliance";
      recordB.capabilityId = "cap-123";

      const serializedA = serializeCapabilityRecord(
        recordA as unknown as CapabilityRecord,
      );
      const serializedB = serializeCapabilityRecord(
        recordB as unknown as CapabilityRecord,
      );

      expect(serializedA).toBe(serializedB);
    });

    it("performs successful serialize -> JSON.parse -> validate round-trip", () => {
      const record: CapabilityRecord = {
        capabilityId: "cap-123",
        scope: "assert:compliance",
        subjectId: "id-456",
        validFrom: "2026-07-28T12:00:00Z",
        validTo: "2026-07-28T14:00:00Z",
      };

      const serialized = serializeCapabilityRecord(record);
      const parsed = JSON.parse(serialized);
      const validationResult = validateCapabilityRecord(parsed);

      expect(validationResult.ok).toBe(true);
      if (validationResult.ok) {
        expect(validationResult.value).toEqual(record);
      }
    });
  });

  describe("Immutability", () => {
    it("expresses readonly contract at compile-time", () => {
      const record: CapabilityRecord = {
        capabilityId: "cap-123",
        scope: "assert:compliance",
        subjectId: "id-456",
        validFrom: "2026-07-28T12:00:00Z",
        validTo: "2026-07-28T14:00:00Z",
      };

      // @ts-expect-error CapabilityRecord properties are readonly
      record.capabilityId = "new-id";

      // @ts-expect-error CapabilityRecord properties are readonly
      record.subjectId = "new-subject";

      // @ts-expect-error CapabilityRecord properties are readonly
      record.scope = "new-scope";

      // @ts-expect-error CapabilityRecord properties are readonly
      record.validFrom = "2026-07-28T13:00:00Z";

      // @ts-expect-error CapabilityRecord properties are readonly
      record.validTo = "2026-07-28T15:00:00Z";

      expect(true).toBe(true);
    });
  });

  describe("Structural Type System Defenses (Compile-time Checks)", () => {
    it("verifies that CapabilityRecord and AuthorityRecord are not interchangeble due to different unique identifier property names", () => {
      const capability: CapabilityRecord = {
        capabilityId: "cap-123",
        scope: "assert:compliance",
        subjectId: "id-456",
        validFrom: "2026-07-28T12:00:00Z",
        validTo: "2026-07-28T14:00:00Z",
      };

      const authority: AuthorityRecord = {
        authorityId: "auth-123",
        scope: "assert:compliance",
        subjectId: "id-456",
        validFrom: "2026-07-28T12:00:00Z",
        validTo: "2026-07-28T14:00:00Z",
      };

      // @ts-expect-error CapabilityRecord is not assignable to AuthorityRecord
      const checkAuthority: AuthorityRecord = capability;

      // @ts-expect-error AuthorityRecord is not assignable to CapabilityRecord
      const checkCapability: CapabilityRecord = authority;

      expect(checkAuthority).toBeDefined();
      expect(checkCapability).toBeDefined();
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  validateStandingRecord,
  serializeStandingRecord,
  type StandingRecord,
  type AuthorityRecord,
  type CapabilityRecord,
} from "./index.js";

describe("StandingRecord Domain Model", () => {
  const validRecordInput = {
    standingId: "st-123",
    subjectId: "id-456",
    scope: "default",
    validFrom: "2026-07-28T12:00:00Z",
    validTo: "2026-07-28T14:00:00Z",
  };

  describe("Validation", () => {
    it("accepts a well-formed input", () => {
      const result = validateStandingRecord(validRecordInput);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(validRecordInput);
      }
    });

    it("rejects non-object inputs", () => {
      const result1 = validateStandingRecord(null);
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_STANDING_ID");
        expect(result1.error.field).toBe("standingId");
        expect(result1.error.message).toContain(
          "Input must be a non-null object",
        );
      }

      const result2 = validateStandingRecord("not-an-object");
      expect(result2.ok).toBe(false);
      if (!result2.ok) {
        expect(result2.error.code).toBe("INVALID_STANDING_ID");
        expect(result2.error.field).toBe("standingId");
      }

      const result3 = validateStandingRecord([]);
      expect(result3.ok).toBe(false);
      if (!result3.ok) {
        expect(result3.error.code).toBe("INVALID_STANDING_ID");
        expect(result3.error.field).toBe("standingId");
      }
    });

    it("rejects empty or whitespace-only standingId", () => {
      const result1 = validateStandingRecord({
        ...validRecordInput,
        standingId: "",
      });
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_STANDING_ID");
        expect(result1.error.field).toBe("standingId");
      }

      const result2 = validateStandingRecord({
        ...validRecordInput,
        standingId: "   ",
      });
      expect(result2.ok).toBe(false);
    });

    it("rejects empty or whitespace-only subjectId", () => {
      const result1 = validateStandingRecord({
        ...validRecordInput,
        subjectId: "",
      });
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_SUBJECT_ID");
        expect(result1.error.field).toBe("subjectId");
      }

      const result2 = validateStandingRecord({
        ...validRecordInput,
        subjectId: "   ",
      });
      expect(result2.ok).toBe(false);
    });

    describe("scope emptiness table (five rows testing)", () => {
      it('rejects ""', () => {
        const result = validateStandingRecord({
          ...validRecordInput,
          scope: "",
        });
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe("INVALID_SCOPE");
          expect(result.error.field).toBe("scope");
        }
      });

      it('rejects " "', () => {
        const result = validateStandingRecord({
          ...validRecordInput,
          scope: " ",
        });
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe("INVALID_SCOPE");
          expect(result.error.field).toBe("scope");
        }
      });

      it('rejects "\\t\\n"', () => {
        const result = validateStandingRecord({
          ...validRecordInput,
          scope: "\t\n",
        });
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe("INVALID_SCOPE");
          expect(result.error.field).toBe("scope");
        }
      });

      it('accepts "default" and preserves it exactly as "default"', () => {
        const result = validateStandingRecord({
          ...validRecordInput,
          scope: "default",
        });
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.scope).toBe("default");
        }
      });

      it('accepts " default " and preserves it exactly as " default "', () => {
        const result = validateStandingRecord({
          ...validRecordInput,
          scope: " default ",
        });
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.scope).toBe(" default ");
        }
      });
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
        const result = validateStandingRecord({
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
        const result = validateStandingRecord({
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
      const result = validateStandingRecord({
        ...validRecordInput,
        validFrom: "2024-02-29T12:00:00Z",
        validTo: "2024-02-29T13:00:00Z",
      });
      expect(result.ok).toBe(true);
    });

    it("rejects invalid leap-year usage for validFrom/validTo", () => {
      const result1 = validateStandingRecord({
        ...validRecordInput,
        validFrom: "2025-02-29T12:00:00Z",
      });
      expect(result1.ok).toBe(false);

      const result2 = validateStandingRecord({
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
      const result = validateStandingRecord(zeroDurationInput);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(zeroDurationInput);
      }
    });

    it("rejects validTo chronologically before validFrom with VALID_TO_BEFORE_VALID_FROM", () => {
      const result = validateStandingRecord({
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
        standingId: "  st-123  ",
        subjectId: "  id-456  ",
        scope: "  assert:compliance  ",
        validFrom: "2026-07-28T12:00:00Z",
        validTo: "2026-07-28T14:00:00Z",
      };

      const result = validateStandingRecord(customInput);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.standingId).toBe("  st-123  ");
        expect(result.value.subjectId).toBe("  id-456  ");
        expect(result.value.scope).toBe("  assert:compliance  ");
      }
    });
  });

  describe("Canonical Serialization", () => {
    it("serializes deterministically in exact alphabetical key order", () => {
      const record: StandingRecord = {
        standingId: "st-123",
        scope: "assert:compliance",
        subjectId: "id-456",
        validFrom: "2026-07-28T12:00:00Z",
        validTo: "2026-07-28T14:00:00Z",
      };

      const serialized = serializeStandingRecord(record);

      // Verify exact alphabetical key order:
      // scope, standingId, subjectId, validFrom, validTo
      const parsedKeys = Object.keys(JSON.parse(serialized));
      expect(parsedKeys).toEqual([
        "scope",
        "standingId",
        "subjectId",
        "validFrom",
        "validTo",
      ]);

      const expected = JSON.stringify({
        scope: "assert:compliance",
        standingId: "st-123",
        subjectId: "id-456",
        validFrom: "2026-07-28T12:00:00Z",
        validTo: "2026-07-28T14:00:00Z",
      });
      expect(serialized).toBe(expected);
    });

    it("repeated serialization produces byte-identical output", () => {
      const record: StandingRecord = {
        standingId: "st-123",
        scope: "assert:compliance",
        subjectId: "id-456",
        validFrom: "2026-07-28T12:00:00Z",
        validTo: "2026-07-28T14:00:00Z",
      };

      const serialized1 = serializeStandingRecord(record);
      const serialized2 = serializeStandingRecord(record);
      expect(serialized1).toBe(serialized2);
    });

    it("equivalent records with different property insertion histories produce identical output", () => {
      const recordA = {} as unknown as Record<string, unknown>;
      recordA.standingId = "st-123";
      recordA.scope = "assert:compliance";
      recordA.subjectId = "id-456";
      recordA.validFrom = "2026-07-28T12:00:00Z";
      recordA.validTo = "2026-07-28T14:00:00Z";

      const recordB = {} as unknown as Record<string, unknown>;
      recordB.validTo = "2026-07-28T14:00:00Z";
      recordB.validFrom = "2026-07-28T12:00:00Z";
      recordB.subjectId = "id-456";
      recordB.scope = "assert:compliance";
      recordB.standingId = "st-123";

      const serializedA = serializeStandingRecord(
        recordA as unknown as StandingRecord,
      );
      const serializedB = serializeStandingRecord(
        recordB as unknown as StandingRecord,
      );

      expect(serializedA).toBe(serializedB);
    });

    it("performs successful serialize -> JSON.parse -> validate round-trip", () => {
      const record: StandingRecord = {
        standingId: "st-123",
        scope: "assert:compliance",
        subjectId: "id-456",
        validFrom: "2026-07-28T12:00:00Z",
        validTo: "2026-07-28T14:00:00Z",
      };

      const serialized = serializeStandingRecord(record);
      const parsed = JSON.parse(serialized);
      const validationResult = validateStandingRecord(parsed);

      expect(validationResult.ok).toBe(true);
      if (validationResult.ok) {
        expect(validationResult.value).toEqual(record);
      }
    });
  });

  describe("Immutability", () => {
    it("expresses readonly contract at compile-time", () => {
      const record: StandingRecord = {
        standingId: "st-123",
        scope: "assert:compliance",
        subjectId: "id-456",
        validFrom: "2026-07-28T12:00:00Z",
        validTo: "2026-07-28T14:00:00Z",
      };

      // @ts-expect-error StandingRecord properties are readonly
      record.standingId = "new-id";

      // @ts-expect-error StandingRecord properties are readonly
      record.subjectId = "new-subject";

      // @ts-expect-error StandingRecord properties are readonly
      record.scope = "new-scope";

      // @ts-expect-error StandingRecord properties are readonly
      record.validFrom = "2026-07-28T13:00:00Z";

      // @ts-expect-error StandingRecord properties are readonly
      record.validTo = "2026-07-28T15:00:00Z";

      expect(true).toBe(true);
    });
  });

  describe("Structural Type System Defenses (Compile-time Checks)", () => {
    it("verifies bidirectional negative assignability among siblings", () => {
      const standing: StandingRecord = {
        standingId: "st-123",
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

      const capability: CapabilityRecord = {
        capabilityId: "cap-123",
        scope: "assert:compliance",
        subjectId: "id-456",
        validFrom: "2026-07-28T12:00:00Z",
        validTo: "2026-07-28T14:00:00Z",
      };

      // @ts-expect-error StandingRecord is not assignable to AuthorityRecord
      const standingToAuthority: AuthorityRecord = standing;

      // @ts-expect-error AuthorityRecord is not assignable to StandingRecord
      const authorityToStanding: StandingRecord = authority;

      // @ts-expect-error StandingRecord is not assignable to CapabilityRecord
      const standingToCapability: CapabilityRecord = standing;

      // @ts-expect-error CapabilityRecord is not assignable to StandingRecord
      const capabilityToStanding: StandingRecord = capability;

      expect(standingToAuthority).toBeDefined();
      expect(authorityToStanding).toBeDefined();
      expect(standingToCapability).toBeDefined();
      expect(capabilityToStanding).toBeDefined();
    });
  });
});

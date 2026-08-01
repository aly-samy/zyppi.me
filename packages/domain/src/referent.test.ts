import { describe, it, expect } from "vitest";
import {
  validateReferentRecord,
  serializeReferentRecord,
  validateGS1Identifier,
  serializeGS1Identifier,
  type ReferentRecord,
  type GS1Identifier,
} from "./index.js";

describe("AMS-0302 Domain Models", () => {
  describe("ReferentRecord", () => {
    const validProductInput = {
      referentId: "ref-prod-123",
      referentType: "product" as const,
      name: "Super Acme Widgets",
      parentReferentId: "ref-brand-456",
      createdAt: "2026-07-28T12:00:00Z",
    };

    describe("Validation", () => {
      it("accepts a well-formed Product referent", () => {
        const result = validateReferentRecord(validProductInput);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value).toEqual(validProductInput);
        }
      });

      it("accepts a well-formed Brand referent with parentReferentId: null", () => {
        const input = {
          referentId: "ref-brand-456",
          referentType: "brand" as const,
          name: "Acme Corp",
          parentReferentId: null,
          createdAt: "2026-07-28T12:00:00Z",
        };
        const result = validateReferentRecord(input);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value).toEqual(input);
        }
      });

      it("accepts a well-formed Manufacturer referent", () => {
        const input = {
          referentId: "ref-mfg-789",
          referentType: "manufacturer" as const,
          name: "Acme Mfg",
          parentReferentId: null,
          createdAt: "2026-07-28T12:00:00.123Z",
        };
        const result = validateReferentRecord(input);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value).toEqual(input);
        }
      });

      it("accepts a valid leap-day timestamp", () => {
        const input = {
          ...validProductInput,
          createdAt: "2024-02-29T12:00:00Z", // 2024 was a leap year
        };
        const result = validateReferentRecord(input);
        expect(result.ok).toBe(true);
      });

      it("preserves original non-empty string formatting exactly", () => {
        const input = {
          referentId: "  ref-with-spaces  ",
          referentType: "product" as const,
          name: "\tName with tabs\n",
          parentReferentId: "  parent-with-spaces  ",
          createdAt: "2026-07-28T12:00:00Z",
        };
        const result = validateReferentRecord(input);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.referentId).toBe("  ref-with-spaces  ");
          expect(result.value.name).toBe("\tName with tabs\n");
          expect(result.value.parentReferentId).toBe("  parent-with-spaces  ");
        }
      });

      it("rejects non-object or null input", () => {
        const result1 = validateReferentRecord(null);
        expect(result1.ok).toBe(false);
        if (!result1.ok) {
          expect(result1.error.code).toBe("INVALID_REFERENT_ID");
          expect(result1.error.field).toBe("referentId");
          expect(result1.error.message).toBe(
            "referentId must be a non-empty string",
          );
        }

        const result2 = validateReferentRecord("string-instead");
        expect(result2.ok).toBe(false);
        if (!result2.ok) {
          expect(result2.error.code).toBe("INVALID_REFERENT_ID");
        }
      });

      it("rejects missing, empty, or whitespace-only referentId", () => {
        const result1 = validateReferentRecord({
          ...validProductInput,
          referentId: undefined,
        });
        expect(result1.ok).toBe(false);
        if (!result1.ok) {
          expect(result1.error.code).toBe("INVALID_REFERENT_ID");
          expect(result1.error.field).toBe("referentId");
        }

        const result2 = validateReferentRecord({
          ...validProductInput,
          referentId: "",
        });
        expect(result2.ok).toBe(false);

        const result3 = validateReferentRecord({
          ...validProductInput,
          referentId: "   ",
        });
        expect(result3.ok).toBe(false);
      });

      it("rejects missing or invalid referentType", () => {
        const result1 = validateReferentRecord({
          ...validProductInput,
          referentType: undefined,
        });
        expect(result1.ok).toBe(false);
        if (!result1.ok) {
          expect(result1.error.code).toBe("INVALID_REFERENT_TYPE");
          expect(result1.error.field).toBe("referentType");
        }

        const result2 = validateReferentRecord({
          ...validProductInput,
          referentType: "unknown",
        });
        expect(result2.ok).toBe(false);
      });

      it("rejects missing, empty, or whitespace-only name", () => {
        const result1 = validateReferentRecord({
          ...validProductInput,
          name: undefined,
        });
        expect(result1.ok).toBe(false);
        if (!result1.ok) {
          expect(result1.error.code).toBe("INVALID_NAME");
          expect(result1.error.field).toBe("name");
        }

        const result2 = validateReferentRecord({
          ...validProductInput,
          name: "",
        });
        expect(result2.ok).toBe(false);

        const result3 = validateReferentRecord({
          ...validProductInput,
          name: "\t\n  ",
        });
        expect(result3.ok).toBe(false);
      });

      it("rejects invalid, empty, or whitespace-only parentReferentId", () => {
        const result1 = validateReferentRecord({
          ...validProductInput,
          parentReferentId: 123,
        });
        expect(result1.ok).toBe(false);
        if (!result1.ok) {
          expect(result1.error.code).toBe("INVALID_PARENT_REFERENT_ID");
          expect(result1.error.field).toBe("parentReferentId");
        }

        const result2 = validateReferentRecord({
          ...validProductInput,
          parentReferentId: "",
        });
        expect(result2.ok).toBe(false);

        const result3 = validateReferentRecord({
          ...validProductInput,
          parentReferentId: "   ",
        });
        expect(result3.ok).toBe(false);
      });

      it("rejects when parentReferentId exactly equals referentId", () => {
        const result = validateReferentRecord({
          ...validProductInput,
          referentId: "identical-id",
          parentReferentId: "identical-id",
        });
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe("SELF_REFERENCING_PARENT");
          expect(result.error.field).toBe("parentReferentId");
          expect(result.error.message).toBe(
            "parentReferentId must not equal referentId",
          );
        }
      });

      it("does not reject self-reference if strings only differ by case or whitespace", () => {
        const result = validateReferentRecord({
          ...validProductInput,
          referentId: "identical-id",
          parentReferentId: "Identical-Id",
        });
        expect(result.ok).toBe(true);
      });

      it("rejects malformed, non-UTC, or calendar-invalid createdAt", () => {
        const invalidTimes = [
          undefined,
          123,
          "2026-07-28", // incomplete
          "2026-07-28T12:00:00", // missing Z
          "2026-07-28T12:00:00+02:00", // offset not UTC
          "not-a-date",
          "2026-02-30T12:00:00Z", // invalid calendar day
        ];

        for (const time of invalidTimes) {
          const result = validateReferentRecord({
            ...validProductInput,
            createdAt: time,
          });
          expect(result.ok).toBe(false);
          if (!result.ok) {
            expect(result.error.code).toBe("INVALID_CREATED_AT");
            expect(result.error.field).toBe("createdAt");
          }
        }
      });
    });

    describe("Serialization", () => {
      it("canonically serializes in strict alphabetical order and is insertion-order independent", () => {
        const record: ReferentRecord = {
          referentId: "ref-123",
          referentType: "product",
          name: "Acme Product",
          parentReferentId: null,
          createdAt: "2026-07-28T12:00:00Z",
        };

        const serialized = serializeReferentRecord(record);

        // Verify strict alphabetic key ordering:
        // createdAt -> name -> parentReferentId -> referentId -> referentType
        const parsedKeys = Object.keys(JSON.parse(serialized));
        expect(parsedKeys).toEqual([
          "createdAt",
          "name",
          "parentReferentId",
          "referentId",
          "referentType",
        ]);

        // Serialization must produce exact byte-identical string
        const expected = JSON.stringify({
          createdAt: "2026-07-28T12:00:00Z",
          name: "Acme Product",
          parentReferentId: null,
          referentId: "ref-123",
          referentType: "product",
        });
        expect(serialized).toBe(expected);
      });

      it("does not mutate the input object", () => {
        const original = {
          referentId: "ref-123",
          referentType: "product" as const,
          name: "Acme Product",
          parentReferentId: null,
          createdAt: "2026-07-28T12:00:00Z",
        };
        const copy = { ...original };
        serializeReferentRecord(original);
        expect(original).toEqual(copy);
      });

      it("successfully performs serialize -> deserialize -> validate -> identical value round-trip", () => {
        const original: ReferentRecord = {
          referentId: "ref-123",
          referentType: "product",
          name: "Acme Product",
          parentReferentId: "ref-brand",
          createdAt: "2026-07-28T12:00:00Z",
        };

        const serialized = serializeReferentRecord(original);
        const deserialized = JSON.parse(serialized);

        expect(deserialized).toEqual(original);

        const result = validateReferentRecord(deserialized);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value).toEqual(original);
        }
      });
    });
  });

  describe("GS1Identifier", () => {
    describe("Validation", () => {
      it("accepts a valid GTIN-8", () => {
        // Example GTIN-8: 49012347
        const result = validateGS1Identifier({ gtin: "49012347" });
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.gtin).toBe("49012347");
        }
      });

      it("accepts a valid GTIN-12", () => {
        // Example GTIN-12: 614141210220 (U.P.C.)
        const result = validateGS1Identifier({ gtin: "614141210220" });
        expect(result.ok).toBe(true);
      });

      it("accepts a valid GTIN-13", () => {
        // Example GTIN-13: 4006381333931
        const result = validateGS1Identifier({ gtin: "4006381333931" });
        expect(result.ok).toBe(true);
      });

      it("accepts a valid GTIN-14", () => {
        // Example GTIN-14: 10012345678902
        const result = validateGS1Identifier({ gtin: "10012345678902" });
        expect(result.ok).toBe(true);
      });

      it("accepts valid values containing significant leading zeroes", () => {
        // GTIN-14 starting with zero: 00000000000000 is valid modulo 10 check
        const result = validateGS1Identifier({ gtin: "00000000000000" });
        expect(result.ok).toBe(true);
      });

      it("rejects non-object or null input", () => {
        const result1 = validateGS1Identifier(null);
        expect(result1.ok).toBe(false);
        if (!result1.ok) {
          expect(result1.error.code).toBe("INVALID_GTIN_TYPE");
          expect(result1.error.field).toBe("gtin");
          expect(result1.error.message).toBe("gtin must be a string");
        }

        const result2 = validateGS1Identifier("string-input");
        expect(result2.ok).toBe(false);
        if (!result2.ok) {
          expect(result2.error.code).toBe("INVALID_GTIN_TYPE");
        }
      });

      it("rejects missing, non-string, or empty gtin", () => {
        const result1 = validateGS1Identifier({});
        expect(result1.ok).toBe(false);
        if (!result1.ok) {
          expect(result1.error.code).toBe("INVALID_GTIN_TYPE");
        }

        const result2 = validateGS1Identifier({ gtin: 12345678 });
        expect(result2.ok).toBe(false);

        const result3 = validateGS1Identifier({ gtin: "" });
        expect(result3.ok).toBe(false);
      });

      it("rejects unsupported lengths", () => {
        const badLengths = [
          "1234567",
          "123456789",
          "12345678901",
          "123456789012345",
        ];
        for (const val of badLengths) {
          const result = validateGS1Identifier({ gtin: val });
          expect(result.ok).toBe(false);
          if (!result.ok) {
            expect(result.error.code).toBe("INVALID_GTIN_LENGTH");
          }
        }
      });

      it("rejects non-ASCII decimal digits", () => {
        const invalidDigits = [
          "4901234a", // letters
          "4901 234", // embedded space
          " 4901234", // leading space
          "4901234 ", // trailing space
          "+4901234", // sign
          "49.01234", // decimal point
          "４９０１２３４８", // Unicode digits
        ];
        for (const val of invalidDigits) {
          const result = validateGS1Identifier({ gtin: val });
          expect(result.ok).toBe(false);
          if (!result.ok) {
            expect(result.error.code).toBe("INVALID_GTIN_FORMAT");
          }
        }
      });

      it("rejects valid-length value with incorrect check digit", () => {
        // Valid GTIN-8 is 49012347, so 49012348 should fail check digit
        const result = validateGS1Identifier({ gtin: "49012348" });
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe("INVALID_GTIN_CHECK_DIGIT");
          expect(result.error.field).toBe("gtin");
        }
      });

      it("does not silently pad, shorten, or normalize inputs", () => {
        const input = { gtin: "49012347" };
        const result = validateGS1Identifier(input);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.gtin).toBe("49012347"); // NOT padded to GTIN-14
        }
      });
    });

    describe("Serialization", () => {
      it("canonically serializes gtin deterministically and is insertion-order independent", () => {
        const id: GS1Identifier = {
          gtin: "49012347",
        };

        const serialized = serializeGS1Identifier(id);
        const expected = JSON.stringify({ gtin: "49012347" });
        expect(serialized).toBe(expected);
      });

      it("does not mutate the input object", () => {
        const id: GS1Identifier = {
          gtin: "49012347",
        };
        serializeGS1Identifier(id);
        expect(id).toEqual({ gtin: "49012347" });
      });

      it("successfully performs serialize -> deserialize -> validate -> identical value round-trip", () => {
        const original: GS1Identifier = {
          gtin: "10012345678902",
        };

        const serialized = serializeGS1Identifier(original);
        const deserialized = JSON.parse(serialized);

        expect(deserialized).toEqual(original);

        const result = validateGS1Identifier(deserialized);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value).toEqual(original);
        }
      });
    });
  });
});

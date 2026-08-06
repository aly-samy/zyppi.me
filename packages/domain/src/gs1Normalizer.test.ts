import { describe, it, expect } from "vitest";
import { normalizeGs1DigitalLink } from "./gs1Normalizer.js";
import { type ValidatedGs1DigitalLink } from "./gs1Validator.js";
import { type ParsedGs1DigitalLinkComponent } from "./gs1Parser.js";

const DEFAULT_PARSED_CARRIER = {
  originalInput: "https://id.gs1.org/01/12345678901231",
  parsedUri: "https://id.gs1.org/01/12345678901231",
  scheme: "https",
  host: "id.gs1.org",
  applicationIdentifiers: [],
};

describe("normalizeGs1DigitalLink — AMS-0603", () => {
  describe("Success Scenarios", () => {
    it("should normalize a ValidatedGs1DigitalLink with GTIN only", () => {
      const input: ValidatedGs1DigitalLink = {
        parsedCarrier: DEFAULT_PARSED_CARRIER,
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path" as const,
        },
        supportedQualifiers: Object.freeze([]),
        unsupportedContext: Object.freeze([]),
      };

      const result = normalizeGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.k1).toBe("12345678901231");
        expect(result.value.primaryIdentifier).toEqual({
          ai: "01",
          value: "12345678901231",
          source: "path",
        });
        expect(result.value.supportedQualifiers).toEqual([]);
        expect(result.value.unsupportedContext).toEqual([]);
      }
    });

    it("should normalize a ValidatedGs1DigitalLink with GTIN + AI 10", () => {
      const input: ValidatedGs1DigitalLink = {
        parsedCarrier: DEFAULT_PARSED_CARRIER,
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path" as const,
        },
        supportedQualifiers: Object.freeze([
          { ai: "10", value: "LOT123", source: "query" as const },
        ]),
        unsupportedContext: Object.freeze([]),
      };

      const result = normalizeGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.k1).toBe("12345678901231");
        expect(result.value.supportedQualifiers).toEqual([
          { ai: "10", value: "LOT123", source: "query" },
        ]);
      }
    });

    it("should normalize a ValidatedGs1DigitalLink with GTIN + AI 17", () => {
      const input: ValidatedGs1DigitalLink = {
        parsedCarrier: DEFAULT_PARSED_CARRIER,
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path" as const,
        },
        supportedQualifiers: Object.freeze([
          { ai: "17", value: "260728", source: "query" as const },
        ]),
        unsupportedContext: Object.freeze([]),
      };

      const result = normalizeGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.supportedQualifiers).toEqual([
          { ai: "17", value: "260728", source: "query" },
        ]);
      }
    });

    it("should normalize a ValidatedGs1DigitalLink with GTIN + AI 21", () => {
      const input: ValidatedGs1DigitalLink = {
        parsedCarrier: DEFAULT_PARSED_CARRIER,
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path" as const,
        },
        supportedQualifiers: Object.freeze([
          { ai: "21", value: "SN9999", source: "path" as const },
        ]),
        unsupportedContext: Object.freeze([]),
      };

      const result = normalizeGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.supportedQualifiers).toEqual([
          { ai: "21", value: "SN9999", source: "path" },
        ]);
      }
    });

    it("should normalize and canonically reorder supported qualifiers to 10 -> 17 -> 21", () => {
      // Input in mixed/reverse order
      const input: ValidatedGs1DigitalLink = {
        parsedCarrier: DEFAULT_PARSED_CARRIER,
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path" as const,
        },
        supportedQualifiers: Object.freeze([
          { ai: "21", value: "SN9999", source: "query" as const },
          { ai: "17", value: "260728", source: "path" as const },
          { ai: "10", value: "LOT123", source: "query" as const },
        ]),
        unsupportedContext: Object.freeze([]),
      };

      const result = normalizeGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.supportedQualifiers).toEqual([
          { ai: "10", value: "LOT123", source: "query" },
          { ai: "17", value: "260728", source: "path" },
          { ai: "21", value: "SN9999", source: "query" },
        ]);
      }
    });

    it("should preserve unsupported context exactly as received, retaining order, original values, and original source", () => {
      const unsupported: ParsedGs1DigitalLinkComponent[] = [
        { ai: "91", value: "PROMO", source: "query" as const },
        { ai: "240", value: "456", source: "path" as const },
      ];

      const input: ValidatedGs1DigitalLink = {
        parsedCarrier: DEFAULT_PARSED_CARRIER,
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path" as const,
        },
        supportedQualifiers: Object.freeze([]),
        unsupportedContext: Object.freeze(unsupported),
      };

      const result = normalizeGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.unsupportedContext).toEqual(unsupported);
        // Direct reference equality of inner array elements is fine (as they are reused)
        expect(result.value.unsupportedContext[0]).toBe(unsupported[0]);
        expect(result.value.unsupportedContext[1]).toBe(unsupported[1]);
      }
    });

    it("should support mixed supported qualifiers and unsupported context", () => {
      const unsupported: ParsedGs1DigitalLinkComponent[] = [
        { ai: "91", value: "PROMO", source: "query" as const },
        { ai: "240", value: "456", source: "path" as const },
      ];

      const input: ValidatedGs1DigitalLink = {
        parsedCarrier: DEFAULT_PARSED_CARRIER,
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path" as const,
        },
        supportedQualifiers: Object.freeze([
          { ai: "21", value: "SN9999", source: "query" as const },
          { ai: "10", value: "LOT123", source: "query" as const },
        ]),
        unsupportedContext: Object.freeze(unsupported),
      };

      const result = normalizeGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.supportedQualifiers).toEqual([
          { ai: "10", value: "LOT123", source: "query" },
          { ai: "21", value: "SN9999", source: "query" },
        ]);
        expect(result.value.unsupportedContext).toEqual(unsupported);
      }
    });
  });

  describe("Defensive Contract Assertions", () => {
    it("should return GS1NormalizationError if validated object is null/undefined", () => {
      const result = normalizeGs1DigitalLink(null as unknown as ValidatedGs1DigitalLink);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_VALIDATED_INPUT");
        expect(result.error.message).toContain("violates contract invariants");
      }
    });

    it("should return GS1NormalizationError if primaryIdentifier is missing", () => {
      const input = {
        parsedCarrier: DEFAULT_PARSED_CARRIER,
        supportedQualifiers: [],
        unsupportedContext: [],
      } as unknown as ValidatedGs1DigitalLink;
      const result = normalizeGs1DigitalLink(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_VALIDATED_INPUT");
      }
    });

    it("should return GS1NormalizationError if primaryIdentifier is not AI 01", () => {
      const input = {
        parsedCarrier: DEFAULT_PARSED_CARRIER,
        primaryIdentifier: {
          ai: "02",
          value: "12345678901231",
          source: "path" as const,
        },
        supportedQualifiers: [],
        unsupportedContext: [],
      } as unknown as ValidatedGs1DigitalLink;
      const result = normalizeGs1DigitalLink(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_VALIDATED_INPUT");
      }
    });

    it("should return GS1NormalizationError if primaryIdentifier value is not exactly 14 digits", () => {
      const input = {
        parsedCarrier: DEFAULT_PARSED_CARRIER,
        primaryIdentifier: {
          ai: "01",
          value: "123456789012", // 12 digits
          source: "path" as const,
        },
        supportedQualifiers: [],
        unsupportedContext: [],
      } as unknown as ValidatedGs1DigitalLink;
      const result = normalizeGs1DigitalLink(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_VALIDATED_INPUT");
      }
    });

    it("should return GS1NormalizationError if primaryIdentifier value contains non-numeric characters", () => {
      const input = {
        parsedCarrier: DEFAULT_PARSED_CARRIER,
        primaryIdentifier: {
          ai: "01",
          value: "123456789012A1", // contains 'A'
          source: "path" as const,
        },
        supportedQualifiers: [],
        unsupportedContext: [],
      } as unknown as ValidatedGs1DigitalLink;
      const result = normalizeGs1DigitalLink(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_VALIDATED_INPUT");
      }
    });
  });

  describe("Purity & Immutability", () => {
    it("should produce deterministic outputs and repeated executions produce identical results", () => {
      const input: ValidatedGs1DigitalLink = {
        parsedCarrier: DEFAULT_PARSED_CARRIER,
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path" as const,
        },
        supportedQualifiers: Object.freeze([
          { ai: "21", value: "SN9999", source: "query" as const },
          { ai: "10", value: "LOT123", source: "query" as const },
        ]),
        unsupportedContext: Object.freeze([]),
      };

      const result1 = normalizeGs1DigitalLink(input);
      const result2 = normalizeGs1DigitalLink(input);

      expect(result1.ok).toBe(true);
      expect(result2.ok).toBe(true);
      if (result1.ok && result2.ok) {
        expect(result1.value).toEqual(result2.value);
      }
    });

    it("should not mutate the input", () => {
      const supported = [
        { ai: "21", value: "SN9999", source: "query" as const },
        { ai: "10", value: "LOT123", source: "query" as const },
      ];
      Object.freeze(supported);

      const input: ValidatedGs1DigitalLink = {
        parsedCarrier: DEFAULT_PARSED_CARRIER,
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path" as const,
        },
        supportedQualifiers: supported,
        unsupportedContext: Object.freeze([]),
      };

      const result = normalizeGs1DigitalLink(input);
      expect(result.ok).toBe(true);
      expect(input.supportedQualifiers).toEqual(supported); // Unaltered
    });

    it("should return deeply immutable output (all objects and arrays frozen)", () => {
      const input: ValidatedGs1DigitalLink = {
        parsedCarrier: DEFAULT_PARSED_CARRIER,
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path" as const,
        },
        supportedQualifiers: Object.freeze([
          { ai: "21", value: "SN9999", source: "query" as const },
          { ai: "10", value: "LOT123", source: "query" as const },
        ]),
        unsupportedContext: Object.freeze([]),
      };

      const result = normalizeGs1DigitalLink(input);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const val = result.value;
        expect(Object.isFrozen(val)).toBe(true);
        expect(Object.isFrozen(val.supportedQualifiers)).toBe(true);
        expect(Object.isFrozen(val.unsupportedContext)).toBe(true);
      }
    });
  });

  describe("Canonical Equality Criteria", () => {
    it("should verify that canonical identity depends only on k1 and canonical supported qualifiers", () => {
      // Two links with different unsupported context but identical primary and supported qualifiers
      // should have identical k1 and supportedQualifiers
      const link1: ValidatedGs1DigitalLink = {
        parsedCarrier: DEFAULT_PARSED_CARRIER,
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path" as const,
        },
        supportedQualifiers: Object.freeze([
          { ai: "21", value: "SN9999", source: "query" as const },
          { ai: "10", value: "LOT123", source: "query" as const },
        ]),
        unsupportedContext: Object.freeze([
          { ai: "91", value: "A", source: "query" as const },
        ]),
      };

      const link2: ValidatedGs1DigitalLink = {
        parsedCarrier: DEFAULT_PARSED_CARRIER,
        primaryIdentifier: {
          ai: "01",
          value: "12345678901231",
          source: "path" as const,
        },
        supportedQualifiers: Object.freeze([
          { ai: "10", value: "LOT123", source: "query" as const },
          { ai: "21", value: "SN9999", source: "query" as const },
        ]),
        unsupportedContext: Object.freeze([
          { ai: "91", value: "B", source: "query" as const },
          { ai: "92", value: "C", source: "query" as const },
        ]),
      };

      const res1 = normalizeGs1DigitalLink(link1);
      const res2 = normalizeGs1DigitalLink(link2);

      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);

      if (res1.ok && res2.ok) {
        expect(res1.value.k1).toBe(res2.value.k1);
        expect(res1.value.supportedQualifiers).toEqual(res2.value.supportedQualifiers);
        // They differ only in unsupportedContext
        expect(res1.value.unsupportedContext).not.toEqual(res2.value.unsupportedContext);
      }
    });
  });
});

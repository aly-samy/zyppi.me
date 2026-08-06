import { describe, it, expect } from "vitest";
import {
  parseGs1DigitalLink,
  type ParsedGs1DigitalLink,
  type GS1ParseError,
} from "./index.js";

describe("GS1 Digital Link Parser (IT-0601)", () => {
  describe("1. Successful Structural Parsing", () => {
    it("parses a supported carrier containing only AI 01 in the path", () => {
      const input = "https://id.gs1.org/01/09506000134352";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.originalInput).toBe(input);
        expect(result.value.scheme).toBe("https");
        expect(result.value.host).toBe("id.gs1.org");
        expect(result.value.applicationIdentifiers).toHaveLength(1);
        expect(result.value.applicationIdentifiers[0]).toEqual({
          ai: "01",
          value: "09506000134352",
          source: "path",
        });
      }
    });

    it("parses a supported carrier containing AI 01 and AI 10", () => {
      const input = "https://id.gs1.org/01/09506000134352?10=LOT123";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.applicationIdentifiers).toHaveLength(2);
        expect(result.value.applicationIdentifiers[0]).toEqual({
          ai: "01",
          value: "09506000134352",
          source: "path",
        });
        expect(result.value.applicationIdentifiers[1]).toEqual({
          ai: "10",
          value: "LOT123",
          source: "query",
        });
      }
    });

    it("parses a supported carrier containing AI 01 and AI 17", () => {
      const input = "https://id.gs1.org/01/09506000134352/17/260831";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.applicationIdentifiers).toHaveLength(2);
        expect(result.value.applicationIdentifiers[0]).toEqual({
          ai: "01",
          value: "09506000134352",
          source: "path",
        });
        expect(result.value.applicationIdentifiers[1]).toEqual({
          ai: "17",
          value: "260831",
          source: "path",
        });
      }
    });

    it("parses a supported carrier containing AI 01 and AI 21", () => {
      const input = "https://id.gs1.org/01/09506000134352/21/SER123";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.applicationIdentifiers).toHaveLength(2);
        expect(result.value.applicationIdentifiers[0]).toEqual({
          ai: "01",
          value: "09506000134352",
          source: "path",
        });
        expect(result.value.applicationIdentifiers[1]).toEqual({
          ai: "21",
          value: "SER123",
          source: "path",
        });
      }
    });

    it("parses a supported carrier containing all profile-listed AIs (01 10 17 21) across path and query", () => {
      const input =
        "https://id.gs1.org/01/09506000134352/21/SER123?10=LOT123&17=260831";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.applicationIdentifiers).toHaveLength(4);
        expect(result.value.applicationIdentifiers[0]).toEqual({
          ai: "01",
          value: "09506000134352",
          source: "path",
        });
        expect(result.value.applicationIdentifiers[1]).toEqual({
          ai: "21",
          value: "SER123",
          source: "path",
        });
        expect(result.value.applicationIdentifiers[2]).toEqual({
          ai: "10",
          value: "LOT123",
          source: "query",
        });
        expect(result.value.applicationIdentifiers[3]).toEqual({
          ai: "17",
          value: "260831",
          source: "query",
        });
      }
    });

    it("preserves leading zeroes in the AI 01 value", () => {
      const input = "https://id.gs1.org/01/00012345678905";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.applicationIdentifiers[0].value).toBe("00012345678905");
      }
    });

    it("preserves AI codes and values strictly as strings", () => {
      const input = "https://id.gs1.org/01/09506000134352/21/123456";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const id1 = result.value.applicationIdentifiers[0];
        const id2 = result.value.applicationIdentifiers[1];

        expect(typeof id1.ai).toBe("string");
        expect(typeof id1.value).toBe("string");
        expect(typeof id2.ai).toBe("string");
        expect(typeof id2.value).toBe("string");
      }
    });

    it("guarantees deterministic component ordering based on input structure", () => {
      const input =
        "https://id.gs1.org/01/09506000134352/21/SER123?17=260831&10=LOT123";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const ais = result.value.applicationIdentifiers;
        expect(ais[0].ai).toBe("01");
        expect(ais[1].ai).toBe("21");
        expect(ais[2].ai).toBe("17");
        expect(ais[3].ai).toBe("10");
      }
    });

    it("produces an output that is deeply immutable-by-value", () => {
      const input = "https://id.gs1.org/01/09506000134352/21/SER123?10=LOT123";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const value = result.value;
        expect(Object.isFrozen(value)).toBe(true);
        expect(Object.isFrozen(value.applicationIdentifiers)).toBe(true);
        expect(Object.isFrozen(value.applicationIdentifiers[0])).toBe(true);

        // Attempting to modify should throw in strict mode
        expect(() => {
          (value as any).scheme = "ftp";
        }).toThrow();
        expect(() => {
          (value.applicationIdentifiers as any)[0] = {} as any;
        }).toThrow();
        expect(() => {
          (value.applicationIdentifiers[0] as any).value = "newVal";
        }).toThrow();
      }
    });

    it("produces deeply equivalent results on repeated execution with identical input", () => {
      const input =
        "https://id.gs1.org/01/09506000134352/21/SER123?10=LOT123&17=260831";
      const res1 = parseGs1DigitalLink(input);
      const res2 = parseGs1DigitalLink(input);

      expect(res1).toEqual(res2);
    });

    it("decodes percent-encoded components exactly once", () => {
      const input =
        "https://id.gs1.org/01/09506%30%30%30134352/21/SER%20123?10=LOT%2F456";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.applicationIdentifiers[0].value).toBe("09506000134352");
        expect(result.value.applicationIdentifiers[1].value).toBe("SER 123");
        expect(result.value.applicationIdentifiers[2].value).toBe("LOT/456");
      }
    });

    it("preserves empty query parameters as empty strings", () => {
      const input = "https://id.gs1.org/01/09506000134352?10=&17";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.applicationIdentifiers).toHaveLength(3);
        expect(result.value.applicationIdentifiers[1]).toEqual({
          ai: "10",
          value: "",
          source: "query",
        });
        expect(result.value.applicationIdentifiers[2]).toEqual({
          ai: "17",
          value: "",
          source: "query",
        });
      }
    });

    it("ignores non-GS1 query parameters (non-numeric keys)", () => {
      const input =
        "https://id.gs1.org/01/09506000134352?linkType=all&10=LOT123&customParam=value";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.applicationIdentifiers).toHaveLength(2);
        expect(result.value.applicationIdentifiers[0].ai).toBe("01");
        expect(result.value.applicationIdentifiers[1]).toEqual({
          ai: "10",
          value: "LOT123",
          source: "query",
        });
      }
    });

    it("is host-neutral and parses any valid HTTP(S) host authority correctly", () => {
      const input = "https://my-custom-host.com/01/09506000134352/21/SER123";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.host).toBe("my-custom-host.com");
        expect(result.value.applicationIdentifiers).toHaveLength(2);
      }
    });
  });

  describe("2. Parser Boundary Tests (No Downstream Validation)", () => {
    it("does not calculate or validate GTIN check digits", () => {
      // 09506000134352 has correct check digit 2
      // Let's use 09506000134359 which has an invalid check digit
      const input = "https://id.gs1.org/01/09506000134359";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.applicationIdentifiers[0].value).toBe("09506000134359");
      }
    });

    it("does not validate GTIN lengths", () => {
      // Very short GTIN in path
      const input = "https://id.gs1.org/01/123";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.applicationIdentifiers[0].value).toBe("123");
      }
    });

    it("does not validate AI 17 date semantics or day 00", () => {
      // 999999 represents month 99, day 99, year 99
      const input = "https://id.gs1.org/01/09506000134352/17/999999?17=260800";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.applicationIdentifiers[1].value).toBe("999999");
        expect(result.value.applicationIdentifiers[2].value).toBe("260800");
      }
    });

    it("does not perform K1 derivation or GTIN padding", () => {
      const input = "https://id.gs1.org/01/123456";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        // Value remains unpadded
        expect(result.value.applicationIdentifiers[0].value).toBe("123456");
        // No K1 derived property is present in the output
        expect((result.value as any).k1).toBeUndefined();
      }
    });

    it("does not enforce recognized-versus-unsupported AI classification", () => {
      // AI 99 is unsupported by the wedge but validly parsed as a GS1 component at the parser layer
      const input = "https://id.gs1.org/01/09506000134352/99/SOMEVAL";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.applicationIdentifiers[1]).toEqual({
          ai: "99",
          value: "SOMEVAL",
          source: "path",
        });
      }
    });
  });

  describe("3. Failure Tests", () => {
    it("returns UNSUPPORTED_CARRIER_FORM for schemeless strings", () => {
      const input = "id.gs1.org/01/09506000134352";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("UNSUPPORTED_CARRIER_FORM");
        expect(result.error.message).toContain("URI");
      }
    });

    it("returns UNSUPPORTED_CARRIER_FORM for relative paths", () => {
      const input = "/01/09506000134352";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("UNSUPPORTED_CARRIER_FORM");
      }
    });

    it("returns UNSUPPORTED_CARRIER_FORM for non-HTTP(S) schemes", () => {
      const input = "ftp://id.gs1.org/01/09506000134352";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("UNSUPPORTED_CARRIER_FORM");
      }
    });

    it("returns MALFORMED_CARRIER_STRUCTURE for invalid percent encoding in path", () => {
      const input = "https://id.gs1.org/01/09506000134352/21/SER%G1";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("MALFORMED_CARRIER_STRUCTURE");
      }
    });

    it("returns MALFORMED_CARRIER_STRUCTURE for invalid percent encoding in query", () => {
      const input = "https://id.gs1.org/01/09506000134352?10=LOT%G2";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("MALFORMED_CARRIER_STRUCTURE");
      }
    });

    it("returns MALFORMED_AI_STRUCTURE for odd number of path segments", () => {
      const input = "https://id.gs1.org/01/09506000134352/21";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("MALFORMED_AI_STRUCTURE");
        expect(result.error.message).toContain("alternating");
      }
    });

    it("returns MALFORMED_AI_STRUCTURE for non-numeric subsequent path AI segment", () => {
      const input = "https://id.gs1.org/01/09506000134352/invalid_ai/123";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("MALFORMED_AI_STRUCTURE");
      }
    });

    it("returns MISSING_REQUIRED_STRUCTURE for empty path URIs", () => {
      const input = "https://id.gs1.org/";
      const result = parseGs1DigitalLink(input);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("MISSING_REQUIRED_STRUCTURE");
      }
    });

    it("returns MISSING_REQUIRED_STRUCTURE when first path segment is not a parseable AI", () => {
      const testCases = [
        "https://example.com/products/widget",
        "https://example.com/about",
        "https://example.com/some/prefix/01/09506000134352",
      ];

      for (const input of testCases) {
        const result = parseGs1DigitalLink(input);
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe("MISSING_REQUIRED_STRUCTURE");
        }
      }
    });

    it("does not throw raw exceptions across the public parser boundary", () => {
      const badInputs = [
        null as any,
        undefined as any,
        123 as any,
        {},
        "",
        "https://",
        "https://example.com/%",
      ];

      for (const input of badInputs) {
        expect(() => {
          const res = parseGs1DigitalLink(input);
          expect(res.ok).toBe(false);
        }).not.toThrow();
      }
    });
  });

  describe("4. Purity Tests", () => {
    it("operates with no wall-clock or random dependency", () => {
      const input = "https://id.gs1.org/01/09506000134352";
      const res1 = parseGs1DigitalLink(input);
      const res2 = parseGs1DigitalLink(input);

      expect(res1).toEqual(res2);
    });
  });
});

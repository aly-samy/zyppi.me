import { describe, it, expect } from "vitest";
import { parseGs1DigitalLink } from "./gs1Parser.js";
import { validateGs1DigitalLink } from "./gs1Validator.js";

describe("GS1 Digital Link Validator (IT-0602)", () => {
  // Helper to parse and then validate
  function parseAndValidate(uri: string) {
    const parseRes = parseGs1DigitalLink(uri);
    if (!parseRes.ok) {
      throw new Error(
        `Parse failed for test URI: ${uri}. Error: ${parseRes.error.message}`,
      );
    }
    return validateGs1DigitalLink(parseRes.value);
  }

  describe("1. Success Scenarios", () => {
    it("validates a carrier with a valid GTIN (AI 01) and no qualifiers", () => {
      // 09506000134352 has correct check digit 2
      const res = parseAndValidate("https://id.gs1.org/01/09506000134352");
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.primaryIdentifier.value).toBe("09506000134352");
        expect(res.value.supportedQualifiers).toHaveLength(0);
        expect(res.value.unsupportedContext).toHaveLength(0);
      }
    });

    it("validates a carrier with a valid GTIN and supported qualifiers (10, 17, 21)", () => {
      // AI 10: LOT123 (valid set 82)
      // AI 17: 260831 (valid digits, month 08, day 31)
      // AI 21: SER123 (valid set 82)
      const res = parseAndValidate(
        "https://id.gs1.org/01/09506000134352/21/SER-123_456?10=LOT.999&17=260831",
      );
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.primaryIdentifier.value).toBe("09506000134352");
        expect(res.value.supportedQualifiers).toHaveLength(3);
        const q21 = res.value.supportedQualifiers.find((q) => q.ai === "21");
        const q10 = res.value.supportedQualifiers.find((q) => q.ai === "10");
        const q17 = res.value.supportedQualifiers.find((q) => q.ai === "17");
        expect(q21?.value).toBe("SER-123_456");
        expect(q10?.value).toBe("LOT.999");
        expect(q17?.value).toBe("260831");
        expect(res.value.unsupportedContext).toHaveLength(0);
      }
    });

    it("validates mixed path and query locations and keeps them distinct", () => {
      const res = parseAndValidate(
        "https://id.gs1.org/01/09506000134352?10=LOT123&17=260831",
      );
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.supportedQualifiers).toHaveLength(2);
        const q10 = res.value.supportedQualifiers.find((q) => q.ai === "10");
        const q17 = res.value.supportedQualifiers.find((q) => q.ai === "17");
        expect(q10?.source).toBe("query");
        expect(q17?.source).toBe("query");
      }
    });

    it("validates successfully when day is '00' in AI 17 per GS1 standards", () => {
      const res = parseAndValidate(
        "https://id.gs1.org/01/09506000134352/17/260800",
      );
      expect(res.ok).toBe(true);
      if (res.ok) {
        const q17 = res.value.supportedQualifiers.find((q) => q.ai === "17");
        expect(q17?.value).toBe("260800");
      }
    });

    it("does not mutate parser output and preserves immutability", () => {
      const parseRes = parseGs1DigitalLink(
        "https://id.gs1.org/01/09506000134352/10/LOT123",
      );
      expect(parseRes.ok).toBe(true);
      if (parseRes.ok) {
        const parsed = parseRes.value;
        const res = validateGs1DigitalLink(parsed);
        expect(res.ok).toBe(true);
        if (res.ok) {
          expect(res.value.parsedCarrier).toBe(parsed); // exact reference identity
          expect(Object.isFrozen(res.value)).toBe(true);
          expect(Object.isFrozen(res.value.supportedQualifiers)).toBe(true);
          expect(Object.isFrozen(res.value.unsupportedContext)).toBe(true);
        }
      }
    });
  });

  describe("2. Failure Scenarios and Error Precedence", () => {
    it("returns MISSING_PRIMARY_IDENTIFIER if parsed carrier has no AI 01", () => {
      // Construct a parsed link manually without AI 01
      const mockCarrier = {
        originalInput: "https://id.gs1.org/10/LOT123",
        parsedUri: "https://id.gs1.org/10/LOT123",
        scheme: "https",
        host: "id.gs1.org",
        applicationIdentifiers: [
          { ai: "10", value: "LOT123", source: "path" as const },
        ],
      };
      const res = validateGs1DigitalLink(mockCarrier);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("MISSING_PRIMARY_IDENTIFIER");
      }
    });

    it("returns DUPLICATE_PRIMARY_IDENTIFIER if multiple AI 01s are present", () => {
      const mockCarrier = {
        originalInput: "https://id.gs1.org/01/09506000134352/01/09506000134352",
        parsedUri: "https://id.gs1.org/01/09506000134352/01/09506000134352",
        scheme: "https",
        host: "id.gs1.org",
        applicationIdentifiers: [
          { ai: "01", value: "09506000134352", source: "path" as const },
          { ai: "01", value: "09506000134352", source: "path" as const },
        ],
      };
      const res = validateGs1DigitalLink(mockCarrier);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("DUPLICATE_PRIMARY_IDENTIFIER");
      }
    });

    it("returns INVALID_AI_CONFLICT for path/query conflict of AI 01", () => {
      const mockCarrier = {
        originalInput: "https://id.gs1.org/01/09506000134352?01=09506000134352",
        parsedUri: "https://id.gs1.org/01/09506000134352?01=09506000134352",
        scheme: "https",
        host: "id.gs1.org",
        applicationIdentifiers: [
          { ai: "01", value: "09506000134352", source: "path" as const },
          { ai: "01", value: "09506000134352", source: "query" as const },
        ],
      };
      const res = validateGs1DigitalLink(mockCarrier);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("INVALID_AI_CONFLICT");
      }
    });

    it("returns INVALID_AI_CONFLICT for path/query conflict of supported qualifier (even if value is identical)", () => {
      const res = parseAndValidate(
        "https://id.gs1.org/01/09506000134352/10/LOT123?10=LOT123",
      );
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("INVALID_AI_CONFLICT");
      }
    });

    it("returns INVALID_AI_CONFLICT for path/query conflict of unsupported AI (even if values are different)", () => {
      const res = parseAndValidate(
        "https://id.gs1.org/01/09506000134352/99/ABC?99=DEF",
      );
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("INVALID_AI_CONFLICT");
      }
    });

    it("returns INVALID_CARDINALITY for duplicate AI within path-only or query-only locations", () => {
      // Duplicate AI 10 in path
      const mockPathDup = {
        originalInput: "mock",
        parsedUri: "mock",
        scheme: "https",
        host: "id.gs1.org",
        applicationIdentifiers: [
          { ai: "01", value: "09506000134352", source: "path" as const },
          { ai: "10", value: "A", source: "path" as const },
          { ai: "10", value: "B", source: "path" as const },
        ],
      };
      const resPath = validateGs1DigitalLink(mockPathDup);
      expect(resPath.ok).toBe(false);
      if (!resPath.ok) {
        expect(resPath.error.code).toBe("INVALID_CARDINALITY");
      }

      // Duplicate AI 99 in query
      const mockQueryDup = {
        originalInput: "mock",
        parsedUri: "mock",
        scheme: "https",
        host: "id.gs1.org",
        applicationIdentifiers: [
          { ai: "01", value: "09506000134352", source: "path" as const },
          { ai: "99", value: "X", source: "query" as const },
          { ai: "99", value: "Y", source: "query" as const },
        ],
      };
      const resQuery = validateGs1DigitalLink(mockQueryDup);
      expect(resQuery.ok).toBe(false);
      if (!resQuery.ok) {
        expect(resQuery.error.code).toBe("INVALID_CARDINALITY");
      }
    });

    it("returns INVALID_PRIMARY_IDENTIFIER if AI 01 has non-digit characters", () => {
      const res = parseAndValidate("https://id.gs1.org/01/0950600013435A");
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("INVALID_PRIMARY_IDENTIFIER");
      }
    });

    it("returns INVALID_AI_LENGTH if AI 01 value is not exactly 14 characters", () => {
      // 13 digits
      const resShort = parseAndValidate("https://id.gs1.org/01/0950600013435");
      expect(resShort.ok).toBe(false);
      if (!resShort.ok) {
        expect(resShort.error.code).toBe("INVALID_AI_LENGTH");
      }

      // 15 digits
      const resLong = parseAndValidate("https://id.gs1.org/01/095060001343521");
      expect(resLong.ok).toBe(false);
      if (!resLong.ok) {
        expect(resLong.error.code).toBe("INVALID_AI_LENGTH");
      }
    });

    it("returns INVALID_CHECK_DIGIT if AI 01 modulo-10 fails", () => {
      // Correct check digit is 2, using 3 here
      const res = parseAndValidate("https://id.gs1.org/01/09506000134353");
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("INVALID_CHECK_DIGIT");
      }
    });

    it("returns INVALID_AI_LENGTH for AI 10 if too long (greater than 20)", () => {
      const res = parseAndValidate(
        "https://id.gs1.org/01/09506000134352?10=123456789012345678901",
      );
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("INVALID_AI_LENGTH");
      }
    });

    it("returns INVALID_AI_CHARACTER_SET for AI 10 if invalid Set 82 characters exist", () => {
      // Space is not allowed in Character Set 82
      const resSpace = parseAndValidate(
        "https://id.gs1.org/01/09506000134352?10=LOT%20123",
      );
      expect(resSpace.ok).toBe(false);
      if (!resSpace.ok) {
        expect(resSpace.error.code).toBe("INVALID_AI_CHARACTER_SET");
      }

      // Hash (#) is not allowed
      const resHash = parseAndValidate(
        "https://id.gs1.org/01/09506000134352?10=LOT%23123",
      );
      expect(resHash.ok).toBe(false);
      if (!resHash.ok) {
        expect(resHash.error.code).toBe("INVALID_AI_CHARACTER_SET");
      }
    });

    it("validates AI 17 expiration date errors in precise precedence order: non-digit -> length -> value", () => {
      // 1. Non-digit checks first: INVALID_AI_CHARACTER_SET
      const resNonDigit = parseAndValidate(
        "https://id.gs1.org/01/09506000134352/17/26A831",
      );
      expect(resNonDigit.ok).toBe(false);
      if (!resNonDigit.ok) {
        expect(resNonDigit.error.code).toBe("INVALID_AI_CHARACTER_SET");
      }

      // 2. Length check: INVALID_AI_LENGTH
      const resLength = parseAndValidate(
        "https://id.gs1.org/01/09506000134352/17/2608311",
      );
      expect(resLength.ok).toBe(false);
      if (!resLength.ok) {
        expect(resLength.error.code).toBe("INVALID_AI_LENGTH");
      }

      // 3. Date semantic check: INVALID_AI_VALUE (invalid month or day)
      // Month 13 is invalid
      const resMonth = parseAndValidate(
        "https://id.gs1.org/01/09506000134352/17/261331",
      );
      expect(resMonth.ok).toBe(false);
      if (!resMonth.ok) {
        expect(resMonth.error.code).toBe("INVALID_AI_VALUE");
      }

      // Day 32 is invalid
      const resDay = parseAndValidate(
        "https://id.gs1.org/01/09506000134352/17/260832",
      );
      expect(resDay.ok).toBe(false);
      if (!resDay.ok) {
        expect(resDay.error.code).toBe("INVALID_AI_VALUE");
      }
    });

    it("returns INVALID_AI_LENGTH for AI 21 if too long (greater than 20)", () => {
      const res = parseAndValidate(
        "https://id.gs1.org/01/09506000134352?21=123456789012345678901",
      );
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("INVALID_AI_LENGTH");
      }
    });

    it("returns INVALID_AI_CHARACTER_SET for AI 21 if invalid Set 82 characters exist", () => {
      // @ symbol is not allowed in Character Set 82
      const res = parseAndValidate(
        "https://id.gs1.org/01/09506000134352?21=SER@123",
      );
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("INVALID_AI_CHARACTER_SET");
      }
    });
  });

  describe("3. Unsupported Context preservation", () => {
    it("preserves unsupported but syntactically recognized AIs without rejecting the carrier", () => {
      // AI 99 is recognized-but-unsupported in M06 profile
      const res = parseAndValidate(
        "https://id.gs1.org/01/09506000134352/99/ABC",
      );
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.unsupportedContext).toHaveLength(1);
        expect(res.value.unsupportedContext[0].ai).toBe("99");
        expect(res.value.unsupportedContext[0].value).toBe("ABC");
        expect(res.value.supportedQualifiers).toHaveLength(0);
      }
    });

    it("maintains original sequence ordering of unsupported AIs", () => {
      const res = parseAndValidate(
        "https://id.gs1.org/01/09506000134352/98/VAL1?99=VAL2",
      );
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.unsupportedContext).toHaveLength(2);
        expect(res.value.unsupportedContext[0].ai).toBe("98");
        expect(res.value.unsupportedContext[1].ai).toBe("99");
      }
    });
  });

  describe("4. Purity and Determinism", () => {
    it("produces identical output structures on repeated executions with identical parsed inputs", () => {
      const parseRes = parseGs1DigitalLink(
        "https://id.gs1.org/01/09506000134352/21/SER123?10=LOT123&17=260831",
      );
      expect(parseRes.ok).toBe(true);
      if (parseRes.ok) {
        const parsed = parseRes.value;
        const out1 = validateGs1DigitalLink(parsed);
        const out2 = validateGs1DigitalLink(parsed);
        expect(out1).toEqual(out2);
      }
    });
  });
});

import { describe, it, expect } from "vitest";
import { validateOutcome, serializeOutcome, type Outcome } from "./index.js";

describe("Outcome Domain Model", () => {
  describe("Validation Contract (validateOutcome)", () => {
    it("successfully validates exact valid lowercase literals", () => {
      const vResult = validateOutcome("verified");
      expect(vResult.ok).toBe(true);
      if (vResult.ok) {
        expect(vResult.value).toBe("verified");
      }

      const uvResult = validateOutcome("unverified");
      expect(uvResult.ok).toBe(true);
      if (uvResult.ok) {
        expect(uvResult.value).toBe("unverified");
      }

      const rResult = validateOutcome("rejected");
      expect(rResult.ok).toBe(true);
      if (rResult.ok) {
        expect(rResult.value).toBe("rejected");
      }
    });

    it("rejects invalid string formats and strings with whitespaces", () => {
      const testCases = [
        "",
        " ",
        "verified ",
        " verified",
        " verified ",
        "unverified ",
        " unverified",
        "rejected ",
        " rejected",
      ];

      for (const input of testCases) {
        const result = validateOutcome(input);
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toEqual({
            code: "INVALID_OUTCOME",
            message: "outcome must be one of: verified, unverified, rejected",
          });
        }
      }
    });

    it("rejects incorrect case variants", () => {
      const testCases = [
        "VERIFIED",
        "Verified",
        "UNVERIFIED",
        "Unverified",
        "REJECTED",
        "Rejected",
      ];

      for (const input of testCases) {
        const result = validateOutcome(input);
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toEqual({
            code: "INVALID_OUTCOME",
            message: "outcome must be one of: verified, unverified, rejected",
          });
        }
      }
    });

    it("rejects unauthorized outcome vocabulary and synonyms", () => {
      const testCases = [
        "accepted",
        "authorized",
        "denied",
        "conditionally-authorized",
        "deferred",
        "success",
        "failed",
      ];

      for (const input of testCases) {
        const result = validateOutcome(input);
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toEqual({
            code: "INVALID_OUTCOME",
            message: "outcome must be one of: verified, unverified, rejected",
          });
        }
      }
    });

    it("rejects trust vocabulary values", () => {
      const testCases = [
        "definite",
        "probable",
        "possible",
        "uncertain",
        "speculative",
      ];

      for (const input of testCases) {
        const result = validateOutcome(input);
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toEqual({
            code: "INVALID_OUTCOME",
            message: "outcome must be one of: verified, unverified, rejected",
          });
        }
      }
    });

    it("rejects non-string primitive types", () => {
      const testCases = [
        null,
        undefined,
        true,
        false,
        0,
        1,
        -1,
        NaN,
        Infinity,
        Symbol("verified"),
        123n,
      ];

      for (const input of testCases) {
        const result = validateOutcome(input);
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toEqual({
            code: "INVALID_OUTCOME",
            message: "outcome must be one of: verified, unverified, rejected",
          });
        }
      }
    });

    it("rejects complex types (objects, arrays)", () => {
      const testCases = [
        {},
        [],
        { status: "verified" },
        ["verified"],
        new Date(),
      ];

      for (const input of testCases) {
        const result = validateOutcome(input);
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toEqual({
            code: "INVALID_OUTCOME",
            message: "outcome must be one of: verified, unverified, rejected",
          });
        }
      }
    });

    it("rejects boxed string instances", () => {
      // boxed strings are object wrappers and must be strictly rejected
      const boxedVerified = new String("verified");
      const result = validateOutcome(boxedVerified);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual({
          code: "INVALID_OUTCOME",
          message: "outcome must be one of: verified, unverified, rejected",
        });
      }
    });

    it("guarantees validation purity and does not mutate input", () => {
      const input = "verified";
      const result1 = validateOutcome(input);
      const result2 = validateOutcome(input);
      expect(result1).toEqual(result2);
      expect(input).toBe("verified");
    });
  });

  describe("Canonical Scalar Serialization (serializeOutcome)", () => {
    it("produces exact canonical JSON scalar values", () => {
      expect(serializeOutcome("verified")).toBe('"verified"');
      expect(serializeOutcome("unverified")).toBe('"unverified"');
      expect(serializeOutcome("rejected")).toBe('"rejected"');
    });

    it("is pure, deterministic, and has no side effects", () => {
      const val: Outcome = "verified";
      const ser1 = serializeOutcome(val);
      const ser2 = serializeOutcome(val);
      expect(ser1).toBe(ser2);
      expect(val).toBe("verified");
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  validateExecutionContext,
  serializeExecutionContext,
  type ExecutionContext,
} from "./index.js";

describe("ExecutionContext Domain Model", () => {
  const validContext: ExecutionContext = {
    executionId: "exec-456",
    constitutionalTimestamp: "2026-08-08T14:30:00Z",
    budget: 1000,
    entropy: "explicit-entropy-string",
    versions: ["1.0.0", "2.0.0-rc.1"],
  };

  describe("Validation (validateExecutionContext)", () => {
    it("accepts a perfectly valid context with multiple versions", () => {
      const result = validateExecutionContext(validContext);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(validContext);
      }
    });

    it("accepts a valid context with budget equal to 0", () => {
      const result = validateExecutionContext({
        ...validContext,
        budget: 0,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.budget).toBe(0);
      }
    });

    it("accepts a positive finite non-integer budget", () => {
      const result = validateExecutionContext({
        ...validContext,
        budget: 123.456,
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.budget).toBe(123.456);
      }
    });

    it("rejects null, undefined, primitive, or array root values", () => {
      expect(validateExecutionContext(null).ok).toBe(false);
      expect(validateExecutionContext(undefined).ok).toBe(false);
      expect(validateExecutionContext("string").ok).toBe(false);
      expect(validateExecutionContext(42).ok).toBe(false);
      expect(validateExecutionContext([]).ok).toBe(false);
    });

    it("rejects missing executionId", () => {
      const rest = { ...validContext } as unknown as Record<string, unknown>;
      delete rest.executionId;
      const result = validateExecutionContext(rest);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_EXECUTION_ID");
        expect(result.error.field).toBe("executionId");
      }
    });

    it("rejects non-string executionId", () => {
      const result = validateExecutionContext({
        ...validContext,
        executionId: 12345 as unknown,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_EXECUTION_ID");
      }
    });

    it("rejects empty executionId string", () => {
      const result = validateExecutionContext({
        ...validContext,
        executionId: "",
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_EXECUTION_ID");
      }
    });

    it("rejects missing constitutionalTimestamp", () => {
      const rest = { ...validContext } as unknown as Record<string, unknown>;
      delete rest.constitutionalTimestamp;
      const result = validateExecutionContext(rest);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_CONSTITUTIONAL_TIMESTAMP");
        expect(result.error.field).toBe("constitutionalTimestamp");
      }
    });

    it("rejects non-string constitutionalTimestamp", () => {
      const result = validateExecutionContext({
        ...validContext,
        constitutionalTimestamp: 12345 as unknown,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_CONSTITUTIONAL_TIMESTAMP");
      }
    });

    it("rejects invalid format constitutionalTimestamp", () => {
      const result = validateExecutionContext({
        ...validContext,
        constitutionalTimestamp: "2026-08-08 14:30:00",
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_CONSTITUTIONAL_TIMESTAMP");
      }
    });

    it("rejects missing budget", () => {
      const rest = { ...validContext } as unknown as Record<string, unknown>;
      delete rest.budget;
      const result = validateExecutionContext(rest);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_BUDGET");
        expect(result.error.field).toBe("budget");
      }
    });

    it("rejects non-number budget values", () => {
      const result = validateExecutionContext({
        ...validContext,
        budget: "1000" as unknown,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_BUDGET");
      }
    });

    it("rejects NaN budget", () => {
      const result = validateExecutionContext({
        ...validContext,
        budget: NaN,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_BUDGET");
      }
    });

    it("rejects positive infinity budget", () => {
      const result = validateExecutionContext({
        ...validContext,
        budget: Infinity,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_BUDGET");
      }
    });

    it("rejects negative infinity budget", () => {
      const result = validateExecutionContext({
        ...validContext,
        budget: -Infinity,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_BUDGET");
      }
    });

    it("rejects negative budget", () => {
      const result = validateExecutionContext({
        ...validContext,
        budget: -1,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_BUDGET");
        expect(result.error.message).toContain("non-negative");
      }
    });

    it("rejects missing entropy", () => {
      const rest = { ...validContext } as unknown as Record<string, unknown>;
      delete rest.entropy;
      const result = validateExecutionContext(rest);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_ENTROPY");
        expect(result.error.field).toBe("entropy");
      }
    });

    it("rejects non-string entropy", () => {
      const result = validateExecutionContext({
        ...validContext,
        entropy: 12345 as unknown,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_ENTROPY");
      }
    });

    it("rejects empty entropy string", () => {
      const result = validateExecutionContext({
        ...validContext,
        entropy: "",
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_ENTROPY");
      }
    });

    it("rejects whitespace-only entropy", () => {
      const result = validateExecutionContext({
        ...validContext,
        entropy: "   ",
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_ENTROPY");
        expect(result.error.message).toContain("non-whitespace");
      }
    });

    it("rejects missing versions array", () => {
      const rest = { ...validContext } as unknown as Record<string, unknown>;
      delete rest.versions;
      const result = validateExecutionContext(rest);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_VERSIONS");
        expect(result.error.field).toBe("versions");
      }
    });

    it("rejects non-array versions", () => {
      const result = validateExecutionContext({
        ...validContext,
        versions: "1.0.0" as unknown,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_VERSIONS");
      }
    });

    it("rejects empty versions array", () => {
      const result = validateExecutionContext({
        ...validContext,
        versions: [],
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_VERSIONS");
        expect(result.error.message).toContain("at least one element");
      }
    });

    it("rejects non-string version elements", () => {
      const result = validateExecutionContext({
        ...validContext,
        versions: ["1.0.0", 42 as unknown],
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_VERSIONS");
      }
    });

    it("rejects empty version elements", () => {
      const result = validateExecutionContext({
        ...validContext,
        versions: ["1.0.0", ""],
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_VERSIONS");
      }
    });

    it("rejects whitespace-only version elements", () => {
      const result = validateExecutionContext({
        ...validContext,
        versions: ["1.0.0", "   "],
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_VERSIONS");
      }
    });

    it("does not mutate the input", () => {
      const input = {
        executionId: "exec-456",
        constitutionalTimestamp: "2026-08-08T14:30:00Z",
        budget: 50,
        entropy: "test-entropy",
        versions: ["1.0.0", "1.1.0"],
      };
      const inputClone = JSON.parse(JSON.stringify(input));
      validateExecutionContext(input);
      expect(input).toEqual(inputClone);
    });

    it("does not trim or normalize accepted strings in the returned output", () => {
      const input = {
        executionId: " exec-456 ",
        constitutionalTimestamp: "2026-08-08T14:30:00Z",
        budget: 50,
        entropy: " test-entropy ",
        versions: [" 1.0.0 "],
      };
      const result = validateExecutionContext(input);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.entropy).toBe(" test-entropy ");
        expect(result.value.versions[0]).toBe(" 1.0.0 ");
      }
    });

    it("is pure and deterministic: repeated validation produces equivalent results", () => {
      const result1 = validateExecutionContext(validContext);
      const result2 = validateExecutionContext(validContext);
      expect(result1).toEqual(result2);
    });
  });

  describe("Canonical Serialization (serializeExecutionContext)", () => {
    it("serializes deterministically in exact alphabetical key order", () => {
      const serialized = serializeExecutionContext(validContext);
      const expectedKeys = [
        "budget",
        "constitutionalTimestamp",
        "entropy",
        "executionId",
        "versions",
      ];
      expect(Object.keys(JSON.parse(serialized))).toEqual(expectedKeys);

      // Shuffle key order in JS object and ensure identical output
      const shuffled: ExecutionContext = {
        versions: validContext.versions,
        budget: validContext.budget,
        entropy: validContext.entropy,
        executionId: validContext.executionId,
        constitutionalTimestamp: validContext.constitutionalTimestamp,
      };
      expect(serializeExecutionContext(shuffled)).toBe(serialized);
    });

    it("does not mutate the input object or its nested array during serialization", () => {
      const context = {
        executionId: "exec-456",
        constitutionalTimestamp: "2026-08-08T14:30:00Z",
        budget: 10,
        entropy: "immutable",
        versions: ["a", "b"],
      };
      const clone = JSON.parse(JSON.stringify(context));
      serializeExecutionContext(context);
      expect(context).toEqual(clone);
    });

    it("preserves versions array order during serialization", () => {
      const context = {
        executionId: "exec-456",
        constitutionalTimestamp: "2026-08-08T14:30:00Z",
        budget: 10,
        entropy: "immutable",
        versions: ["z", "a", "m"],
      };
      const serialized = serializeExecutionContext(context);
      const parsed = JSON.parse(serialized);
      expect(parsed.versions).toEqual(["z", "a", "m"]);
    });

    it("preserves accepted string values (does not trim)", () => {
      const context = {
        executionId: " exec-with-spaces ",
        constitutionalTimestamp: "2026-08-08T14:30:00Z",
        budget: 10,
        entropy: " whitespace preserved ",
        versions: [" ver with space "],
      };
      const serialized = serializeExecutionContext(context);
      const parsed = JSON.parse(serialized);
      expect(parsed.entropy).toBe(" whitespace preserved ");
      expect(parsed.versions[0]).toBe(" ver with space ");
    });

    it("repeated serialization produces byte-identical output", () => {
      const s1 = serializeExecutionContext(validContext);
      const s2 = serializeExecutionContext(validContext);
      expect(s1).toBe(s2);
    });
  });
});

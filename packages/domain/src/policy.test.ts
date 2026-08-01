import { describe, it, expect } from "vitest";
import {
  validatePolicyRecord,
  serializePolicyRecord,
  type PolicyRecord,
  type AuthorityRecord,
  type CapabilityRecord,
} from "./index.js";

describe("PolicyRecord Domain Model", () => {
  const validRecordInput = {
    policyId: "pol-123",
    policyType: "auth-policy",
    version: "1.0.0",
    definition: {
      ruleName: "AllowAll",
      conditions: [true, 42, "always"],
    },
    active: true,
  };

  describe("Validation", () => {
    it("accepts a well-formed input", () => {
      const result = validatePolicyRecord(validRecordInput);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(validRecordInput);
      }
    });

    it("rejects non-object inputs", () => {
      const result1 = validatePolicyRecord(null);
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_POLICY_ID");
        expect(result1.error.field).toBe("policyId");
        expect(result1.error.message).toContain(
          "Input must be a non-null object",
        );
      }

      const result2 = validatePolicyRecord("not-an-object");
      expect(result2.ok).toBe(false);
      if (!result2.ok) {
        expect(result2.error.code).toBe("INVALID_POLICY_ID");
        expect(result2.error.field).toBe("policyId");
      }

      const result3 = validatePolicyRecord([]);
      expect(result3.ok).toBe(false);
      if (!result3.ok) {
        expect(result3.error.code).toBe("INVALID_POLICY_ID");
        expect(result3.error.field).toBe("policyId");
      }
    });

    it("rejects empty or whitespace-only policyId", () => {
      const result1 = validatePolicyRecord({
        ...validRecordInput,
        policyId: "",
      });
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_POLICY_ID");
        expect(result1.error.field).toBe("policyId");
      }

      const result2 = validatePolicyRecord({
        ...validRecordInput,
        policyId: "   ",
      });
      expect(result2.ok).toBe(false);
    });

    it("rejects empty or whitespace-only policyType", () => {
      const result1 = validatePolicyRecord({
        ...validRecordInput,
        policyType: "",
      });
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_POLICY_TYPE");
        expect(result1.error.field).toBe("policyType");
      }

      const result2 = validatePolicyRecord({
        ...validRecordInput,
        policyType: "   ",
      });
      expect(result2.ok).toBe(false);
    });

    it("rejects empty or whitespace-only version", () => {
      const result1 = validatePolicyRecord({
        ...validRecordInput,
        version: "",
      });
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_VERSION");
        expect(result1.error.field).toBe("version");
      }

      const result2 = validatePolicyRecord({
        ...validRecordInput,
        version: "   ",
      });
      expect(result2.ok).toBe(false);
    });

    it("preserves whitespace in string properties without mutation", () => {
      const customInput = {
        policyId: "  pol-123  ",
        policyType: "  auth-policy  ",
        version: "  1.0.0  ",
        definition: null,
        active: true,
      };
      const result = validatePolicyRecord(customInput);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.policyId).toBe("  pol-123  ");
        expect(result.value.policyType).toBe("  auth-policy  ");
        expect(result.value.version).toBe("  1.0.0  ");
      }
    });

    describe("Definition valid structural types", () => {
      const testCases: { name: string; definition: unknown }[] = [
        { name: "null", definition: null },
        { name: "boolean true", definition: true },
        { name: "boolean false", definition: false },
        { name: "zero", definition: 0 },
        { name: "negative integer", definition: -123 },
        { name: "finite float", definition: 3.14159 },
        { name: "large finite number", definition: 1e15 },
        { name: "empty string", definition: "" },
        { name: "non-empty string", definition: "hello world" },
        {
          name: "Base64 string (opaque, not decoded)",
          definition: "SGVsbG8gV29ybGQ=",
        },
        { name: "empty array", definition: [] },
        { name: "nested array", definition: [1, [2, [3]]] },
        { name: "empty object", definition: {} },
        { name: "null-prototype object", definition: Object.create(null) },
        {
          name: "deeply nested object",
          definition: { a: { b: { c: { d: 42 } } } },
        },
        {
          name: "complex mixed structure",
          definition: {
            active: true,
            rules: ["A", "B", { sub: null }],
            scores: [1.2, -3.4, 0],
          },
        },
      ];

      for (const tc of testCases) {
        it(`accepts valid definition: ${tc.name}`, () => {
          const input = { ...validRecordInput, definition: tc.definition };
          const result = validatePolicyRecord(input);
          expect(result.ok).toBe(true);
        });
      }

      it("handles a deeply nested representative structure without a depth limit crash", () => {
        let current: unknown = { value: "leaf" };
        for (let i = 0; i < 150; i++) {
          current = { child: current };
        }
        const input = { ...validRecordInput, definition: current };
        const result = validatePolicyRecord(input);
        expect(result.ok).toBe(true);
      });
    });

    describe("Definition invalid types", () => {
      const invalidCases: { name: string; definition: unknown }[] = [
        { name: "NaN", definition: NaN },
        { name: "Infinity", definition: Infinity },
        { name: "-Infinity", definition: -Infinity },
        { name: "undefined", definition: undefined },
        { name: "undefined inside array", definition: [1, undefined, 3] },
        { name: "undefined inside object", definition: { x: undefined } },
        { name: "function", definition: () => {} },
        { name: "symbol", definition: Symbol("sym") },
        { name: "bigint", definition: 123n },
        { name: "Map", definition: new Map() },
        { name: "Set", definition: new Set() },
        { name: "class instance", definition: new (class TestClass {})() },
      ];

      for (const tc of invalidCases) {
        it(`rejects invalid definition: ${tc.name}`, () => {
          const input = { ...validRecordInput, definition: tc.definition };
          const result = validatePolicyRecord(input);
          expect(result.ok).toBe(false);
          if (!result.ok) {
            expect(result.error.code).toBe("INVALID_DEFINITION");
            expect(result.error.field).toBe("definition");
          }
        });
      }
    });

    describe("Active-path cycle detection", () => {
      it("rejects cyclic objects cleanly with CYCLIC_DEFINITION", () => {
        const cyclicNode: Record<string, unknown> = {};
        cyclicNode.self = cyclicNode;

        const input = { ...validRecordInput, definition: cyclicNode };
        const result = validatePolicyRecord(input);
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe("CYCLIC_DEFINITION");
          expect(result.error.field).toBe("definition");
        }
      });

      it("rejects cyclic arrays cleanly with CYCLIC_DEFINITION", () => {
        const cyclicArray: unknown[] = [];
        cyclicArray.push(cyclicArray);

        const input = { ...validRecordInput, definition: cyclicArray };
        const result = validatePolicyRecord(input);
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe("CYCLIC_DEFINITION");
          expect(result.error.field).toBe("definition");
        }
      });

      it("accepts shared-reference (DAG) nodes that are non-cyclic", () => {
        const sharedNode = { key: "value" };
        const dagDefinition = {
          first: sharedNode,
          second: sharedNode,
        };

        const input = { ...validRecordInput, definition: dagDefinition };
        const result = validatePolicyRecord(input);
        expect(result.ok).toBe(true);
      });
    });

    describe("Active boolean validation", () => {
      it("accepts strictly literal booleans", () => {
        const resultTrue = validatePolicyRecord({
          ...validRecordInput,
          active: true,
        });
        expect(resultTrue.ok).toBe(true);

        const resultFalse = validatePolicyRecord({
          ...validRecordInput,
          active: false,
        });
        expect(resultFalse.ok).toBe(true);
      });

      const invalidActives = [1, 0, "true", "false", null, undefined, [], {}];
      for (const active of invalidActives) {
        it(`rejects non-strict active boolean: ${JSON.stringify(active)}`, () => {
          const input = { ...validRecordInput, active };
          const result = validatePolicyRecord(input);
          expect(result.ok).toBe(false);
          if (!result.ok) {
            expect(result.error.code).toBe("INVALID_ACTIVE");
            expect(result.error.field).toBe("active");
          }
        });
      }
    });

    describe("Semantic Neutrality Boundary (Strict Mandate)", () => {
      it("structurally accepts definition without inferring policy meaning, allowing/denying anything, or validating language schema", () => {
        const denierPolicy = {
          ...validRecordInput,
          definition: {
            effect: "Deny",
            action: "*",
            resource: "*",
          },
        };
        const allowPolicy = {
          ...validRecordInput,
          definition: {
            effect: "Allow",
            action: "read",
            resource: "doc-1",
          },
        };
        const nullPolicy = {
          ...validRecordInput,
          definition: null,
        };

        const resultDeny = validatePolicyRecord(denierPolicy);
        const resultAllow = validatePolicyRecord(allowPolicy);
        const resultNull = validatePolicyRecord(nullPolicy);

        // Assert structural acceptance:
        expect(resultDeny.ok).toBe(true);
        expect(resultAllow.ok).toBe(true);
        expect(resultNull.ok).toBe(true);

        // Explicitly assert that validation makes no inferences about policy logic:
        // No checks are made on the semantics of "effect", "action", "resource" or nullness.
        expect(resultDeny.ok ? resultDeny.value.definition : undefined).toEqual(
          denierPolicy.definition,
        );
        expect(
          resultAllow.ok ? resultAllow.value.definition : undefined,
        ).toEqual(allowPolicy.definition);
        expect(
          resultNull.ok ? resultNull.value.definition : undefined,
        ).toBeNull();
      });
    });
  });

  describe("Canonical Serialization", () => {
    it("serializes deterministically in exact alphabetical key order for top-level keys", () => {
      const record: PolicyRecord = {
        policyId: "pol-123",
        policyType: "auth-policy",
        version: "1.0.0",
        definition: null,
        active: true,
      };

      const serialized = serializePolicyRecord(record);

      // Verify exact alphabetical top-level key order:
      // active, definition, policyId, policyType, version
      const parsedKeys = Object.keys(JSON.parse(serialized));
      expect(parsedKeys).toEqual([
        "active",
        "definition",
        "policyId",
        "policyType",
        "version",
      ]);

      const expected = JSON.stringify({
        active: true,
        definition: null,
        policyId: "pol-123",
        policyType: "auth-policy",
        version: "1.0.0",
      });
      expect(serialized).toBe(expected);
    });

    it("serializes recursively sorting object keys and preserving array order within definition", () => {
      const record: PolicyRecord = {
        policyId: "p",
        policyType: "t",
        version: "v",
        active: true,
        definition: {
          z: 1,
          a: {
            y: [3, 1, 2],
            b: "val",
          },
        },
      };

      const serialized = serializePolicyRecord(record);

      // Expected string representation has sorted keys recursively:
      // Within definition:
      // "definition":{"a":{"b":"val","y":[3,1,2]},"z":1}
      expect(serialized).toContain(
        '"definition":{"a":{"b":"val","y":[3,1,2]},"z":1}',
      );
    });

    it("does not mutate the input record or its nested structures", () => {
      const nested = { y: [1, 2], x: "val" };
      const record: PolicyRecord = {
        policyId: "p",
        policyType: "t",
        version: "v",
        active: true,
        definition: nested,
      };

      serializePolicyRecord(record);

      // Verify input keys order did not change
      expect(Object.keys(nested)).toEqual(["y", "x"]);
    });

    it("round-trips perfectly for complex/deeply nested structures", () => {
      const record: PolicyRecord = {
        policyId: "pol-123",
        policyType: "auth",
        version: "1.0",
        active: true,
        definition: {
          nested: {
            deep: {
              arr: [null, true, false, -3.14, "opaque"],
            },
          },
        },
      };

      const serialized = serializePolicyRecord(record);
      const parsed = JSON.parse(serialized);
      const validationResult = validatePolicyRecord(parsed);

      expect(validationResult.ok).toBe(true);
      if (validationResult.ok) {
        expect(validationResult.value).toEqual(record);
      }
    });

    describe("Prototype-Pollution Safety", () => {
      it("succeeds validation, canonicalizes safely, and survives round-trip with prototype-safety", () => {
        // Construct input with prototype-pollution attempt keys
        const rawDefinition = JSON.parse(
          `{
            "__proto__": { "marker": true },
            "constructor": "data",
            "prototype": "data"
          }`,
        );

        // Verify that Object.getPrototypeOf(rawDefinition) is Object.prototype
        expect(Object.getPrototypeOf(rawDefinition)).toBe(Object.prototype);

        const input = {
          ...validRecordInput,
          definition: rawDefinition,
        };

        // 1. Validation succeeds
        const valResult = validatePolicyRecord(input);
        expect(valResult.ok).toBe(true);

        if (valResult.ok) {
          const record = valResult.value;

          // 2. Serialization is deterministic
          const serialized = serializePolicyRecord(record);
          expect(serialized).toContain('"__proto__":{"marker":true}');
          expect(serialized).toContain('"constructor":"data"');
          expect(serialized).toContain('"prototype":"data"');

          // Ensure sorted order: "__proto__", "constructor", "prototype"
          // Sorted lexicographically: "__proto__" -> "constructor" -> "prototype"
          const defPart =
            '"definition":{"__proto__":{"marker":true},"constructor":"data","prototype":"data"}';
          expect(serialized).toContain(defPart);

          // 3. Keys survive round-trip as ordinary data
          const roundTripped = JSON.parse(serialized);
          const valRoundTripResult = validatePolicyRecord(roundTripped);
          expect(valRoundTripResult.ok).toBe(true);

          if (valRoundTripResult.ok) {
            const rtDefinition = valRoundTripResult.value.definition as Record<
              string,
              unknown
            >;
            expect(rtDefinition.constructor).toBe("data");
            expect(rtDefinition.prototype).toBe("data");
            expect(
              (rtDefinition.__proto__ as Record<string, unknown>).marker,
            ).toBe(true);

            // 4. No prototype mutation occurs on Object.prototype!
            expect(
              (Object.prototype as Record<string, unknown>).marker,
            ).toBeUndefined();
          }
        }
      });
    });
  });

  describe("Immutability", () => {
    it("expresses readonly contract at compile-time", () => {
      const record: PolicyRecord = {
        policyId: "pol-123",
        policyType: "auth",
        version: "1.0",
        active: true,
        definition: null,
      };

      // @ts-expect-error PolicyRecord properties are readonly
      record.policyId = "new-id";

      // @ts-expect-error PolicyRecord properties are readonly
      record.policyType = "new-type";

      // @ts-expect-error PolicyRecord properties are readonly
      record.version = "new-version";

      // @ts-expect-error PolicyRecord properties are readonly
      record.active = false;

      // @ts-expect-error PolicyRecord properties are readonly
      record.definition = {};

      expect(true).toBe(true);
    });
  });

  describe("Structural Type System Defenses (Compile-time Checks)", () => {
    it("verifies bidirectional negative assignability among siblings", () => {
      const policy: PolicyRecord = {
        policyId: "pol-123",
        policyType: "auth",
        version: "1.0",
        active: true,
        definition: null,
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

      // @ts-expect-error PolicyRecord is not assignable to AuthorityRecord
      const policyToAuthority: AuthorityRecord = policy;

      // @ts-expect-error AuthorityRecord is not assignable to PolicyRecord
      const authorityToPolicy: PolicyRecord = authority;

      // @ts-expect-error PolicyRecord is not assignable to CapabilityRecord
      const policyToCapability: CapabilityRecord = policy;

      // @ts-expect-error CapabilityRecord is not assignable to PolicyRecord
      const capabilityToPolicy: PolicyRecord = capability;

      expect(policyToAuthority).toBeDefined();
      expect(authorityToPolicy).toBeDefined();
      expect(policyToCapability).toBeDefined();
      expect(capabilityToPolicy).toBeDefined();
    });
  });
});

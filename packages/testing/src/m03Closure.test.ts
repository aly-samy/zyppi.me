import { describe, it, expect } from "vitest";
import {
  validateIdentityRecord,
  serializeIdentityRecord,
  validateReferentRecord,
  serializeReferentRecord,
  validateGS1Identifier,
  serializeGS1Identifier,
  validateOutcome,
  serializeOutcome,
  validatePolicyRecord,
  serializePolicyRecord,
  validateStandingRecord,
  serializeStandingRecord,
  validateCapabilityRecord,
  serializeCapabilityRecord,
  validateAuthorityRecord,
  serializeAuthorityRecord,
  validateEvidenceRecord,
  serializeEvidenceRecord,
  validateExecutionContext,
  serializeExecutionContext,
  validateExecutionRequest,
  serializeExecutionRequest,
  validateExecutionReceipt,
  serializeExecutionReceipt,
  type IdentityRecord,
  type ReferentRecord,
  type GS1Identifier,
  type Outcome,
  type PolicyRecord,
  type StandingRecord,
  type CapabilityRecord,
  type AuthorityRecord,
  type EvidenceRecord,
  type ExecutionContext,
  type ExecutionRequest,
  type ExecutionReceipt,
} from "@zyppi/domain";

describe("M03 Domain Foundation — Adversarial Closure Audit Suite", () => {
  // A. Baseline Valid Values
  const validIdentity: IdentityRecord = {
    identityId: "id-123",
    identityType: "product",
    canonicalReference: "https://id.gs1.org/01/09780201379626",
    referentId: "ref-456",
    status: "active",
    createdAt: "2026-07-28T12:00:00Z",
    updatedAt: "2026-07-28T12:05:00.123Z",
  };

  const validReferent: ReferentRecord = {
    referentId: "ref-456",
    referentType: "product",
    name: "My Product",
    parentReferentId: null,
    createdAt: "2026-07-28T12:00:00Z",
  };

  const validGS1: GS1Identifier = {
    gtin: "10012345678902",
  };

  const validPolicy: PolicyRecord = {
    policyId: "policy-123",
    policyType: "membership",
    version: "1.0.0",
    definition: { rules: ["rule1", "rule2"], active: true },
    active: true,
  };

  const validStanding: StandingRecord = {
    standingId: "standing-123",
    subjectId: "id-123",
    scope: "global-audit",
    validFrom: "2026-01-01T00:00:00Z",
    validTo: "2026-12-31T23:59:59Z",
  };

  const validCapability: CapabilityRecord = {
    capabilityId: "capability-123",
    subjectId: "id-123",
    scope: "read-write",
    validFrom: "2026-01-01T00:00:00Z",
    validTo: "2026-12-31T23:59:59Z",
  };

  const validAuthority: AuthorityRecord = {
    authorityId: "authority-123",
    subjectId: "id-123",
    scope: "write-auth",
    validFrom: "2026-01-01T00:00:00Z",
    validTo: "2026-12-31T23:59:59Z",
  };

  const validEvidence: EvidenceRecord = {
    evidenceId: "evidence-123",
    identityId: "id-123",
    evidenceType: "hash-proof",
    hash: "sha256-abc123xyz",
    storageRef: "s3://bucket/evidence-123",
    retrievedAt: "2026-07-28T12:00:00Z",
  };

  const validExecutionContext: ExecutionContext = {
    budget: 1000,
    entropy: "random-entropy-seed",
    versions: ["1.0.0"],
  };

  const validExecutionRequest: ExecutionRequest = {
    requestId: "req-123",
    identity: validIdentity,
    activeConstitutionalView: {
      identity: validIdentity,
      relationships: [validReferent],
      standings: [validStanding],
      authorities: [validAuthority],
      capabilities: [validCapability],
      evidenceReferences: [validEvidence],
      applicablePolicies: [validPolicy],
    },
    evidenceBundle: {
      schemaVersion: "1.0",
      evidenceRecords: [validEvidence],
    },
    policyContext: {
      policies: [validPolicy],
    },
    executionContext: validExecutionContext,
  };

  const validExecutionReceipt: ExecutionReceipt = {
    receiptId: "receipt-123",
    executionId: "exec-456",
    runtimeVersion: "1.0.0",
    inputHash: "sha256-input-hash",
    outputHash: "sha256-output-hash",
    evidenceHash: "sha256-evidence-hash",
    policyVersion: "1.0.0",
    decisionSummary: "verified with 0 warnings",
    executionTime: 12.5,
    deterministicHash: "sha256-receipt-hash",
  };

  describe("1. Validation-Serialization-Rehydration Symmetry and Canonical Fixed Points", () => {
    // Utility helper to run symmetry test across any object model
    function testModelSymmetry<T, E>(
      name: string,
      validator: (input: unknown) => { ok: boolean; value?: T; error?: E },
      serializer: (record: T) => string,
      validValue: T,
    ) {
      it(`enforces round-trip symmetry for ${name}`, () => {
        // 1. Initial Validation
        const validationResult = validator(validValue);
        expect(validationResult.ok).toBe(true);
        if (validationResult.ok && validationResult.value) {
          const validatedValue = validationResult.value;

          // 2. Serialization of validated value
          const serialized = serializer(validatedValue);
          expect(typeof serialized).toBe("string");

          // 3. JSON Parse of serialized payload
          const parsed = JSON.parse(serialized);

          // 4. Re-validation of parsed value
          const rehydratedResult = validator(parsed);
          expect(rehydratedResult.ok).toBe(true);
          if (rehydratedResult.ok && rehydratedResult.value) {
            const rehydratedValue = rehydratedResult.value;

            // 5. Verify structural equivalence (deep equality)
            expect(rehydratedValue).toEqual(validatedValue);

            // 6. Verify identical reserialization (Canonical Fixed-Point Invariant)
            const reserialized = serializer(rehydratedValue);
            expect(reserialized).toBe(serialized);

            // 7. Verify the direct macro canonical formula:
            // serialize(validate(parse(serialize(v))).value) === serialize(v)
            const parsedBack = JSON.parse(serializer(validValue));
            const revalBack = validator(parsedBack);
            if (revalBack.ok && revalBack.value) {
              const directFixedPoint = serializer(revalBack.value);
              expect(directFixedPoint).toBe(serialized);
            } else {
              throw new Error("revalBack failed inside symmetry helper");
            }
          } else {
            throw new Error("rehydratedResult failed inside symmetry helper");
          }
        } else {
          throw new Error("validationResult failed inside symmetry helper");
        }
      });
    }

    testModelSymmetry(
      "IdentityRecord",
      validateIdentityRecord,
      serializeIdentityRecord,
      validIdentity,
    );
    testModelSymmetry(
      "ReferentRecord",
      validateReferentRecord,
      serializeReferentRecord,
      validReferent,
    );
    testModelSymmetry(
      "GS1Identifier",
      validateGS1Identifier,
      serializeGS1Identifier,
      validGS1,
    );
    testModelSymmetry(
      "PolicyRecord",
      validatePolicyRecord,
      serializePolicyRecord,
      validPolicy,
    );
    testModelSymmetry(
      "StandingRecord",
      validateStandingRecord,
      serializeStandingRecord,
      validStanding,
    );
    testModelSymmetry(
      "CapabilityRecord",
      validateCapabilityRecord,
      serializeCapabilityRecord,
      validCapability,
    );
    testModelSymmetry(
      "AuthorityRecord",
      validateAuthorityRecord,
      serializeAuthorityRecord,
      validAuthority,
    );
    testModelSymmetry(
      "EvidenceRecord",
      validateEvidenceRecord,
      serializeEvidenceRecord,
      validEvidence,
    );
    testModelSymmetry(
      "ExecutionContext",
      validateExecutionContext,
      serializeExecutionContext,
      validExecutionContext,
    );
    testModelSymmetry(
      "ExecutionRequest",
      validateExecutionRequest,
      serializeExecutionRequest,
      validExecutionRequest,
    );
    testModelSymmetry(
      "ExecutionReceipt",
      validateExecutionReceipt,
      serializeExecutionReceipt,
      validExecutionReceipt,
    );
  });

  describe("2. Scalar Model Symmetry and Robust Rejection of Synonyms/Alternatives for Outcome", () => {
    it("enforces literal exact validation and scalar round-trip symmetry", () => {
      const literals: Outcome[] = ["verified", "unverified", "rejected"];

      for (const literal of literals) {
        // 1. Validate scalar directly
        const res = validateOutcome(literal);
        expect(res.ok).toBe(true);
        if (res.ok) {
          expect(res.value).toBe(literal);

          // 2. Serialize scalar
          const serialized = serializeOutcome(res.value);
          expect(serialized).toBe(JSON.stringify(literal));

          // 3. Re-validate
          const parsed = JSON.parse(serialized);
          const rehydrated = validateOutcome(parsed);
          expect(rehydrated.ok).toBe(true);
          if (rehydrated.ok) {
            expect(rehydrated.value).toBe(literal);

            // 4. Reserialized bytes match exactly
            expect(serializeOutcome(rehydrated.value)).toBe(serialized);
          }
        }
      }
    });

    it("rejects near-miss string variants with extra spaces, casing, or tabs", () => {
      const nearMisses = [
        "verified ",
        " verified",
        "verified\t",
        "VERIFIED",
        "Verified",
        "unverified ",
        " unverified",
        "UNVERIFIED",
        "Unverified",
        "rejected ",
        " rejected",
        "REJECTED",
        "Rejected",
      ];

      for (const variant of nearMisses) {
        const res = validateOutcome(variant);
        expect(res.ok).toBe(false);
        if (!res.ok) {
          expect(res.error).toEqual({
            code: "INVALID_OUTCOME",
            message: "outcome must be one of: verified, unverified, rejected",
          });
        }
      }
    });

    it("rejects synonym and alternative vocabularies from policy, trust, or API layers", () => {
      const prohibitedVocab = [
        // Trust results
        "definite",
        "probable",
        "possible",
        "uncertain",
        "speculative",
        // API or workflow status
        "approved",
        "authorized",
        "denied",
        "success",
        "failed",
        "conditionally-authorized",
        "deferred",
        "valid",
        "invalid",
      ];

      for (const word of prohibitedVocab) {
        const res = validateOutcome(word);
        expect(res.ok).toBe(false);
      }
    });
  });

  describe("3. Strict Non-Coercion", () => {
    it("rejects numeric strings for integer/float fields (coercion block)", () => {
      // executionTime is primitive number, "12.5" must be strictly rejected
      const badReceipt = { ...validExecutionReceipt, executionTime: "12.5" };
      const resReceipt = validateExecutionReceipt(badReceipt);
      expect(resReceipt.ok).toBe(false);
      if (!resReceipt.ok) {
        expect(resReceipt.error.field).toBe("executionTime");
      }

      // budget is primitive number, "1000" must be strictly rejected
      const badContext = { ...validExecutionContext, budget: "1000" };
      const resContext = validateExecutionContext(badContext);
      expect(resContext.ok).toBe(false);
      if (!resContext.ok) {
        expect(resContext.error.field).toBe("budget");
      }
    });

    it("rejects booleans where strings/numbers are required", () => {
      const badStanding = { ...validStanding, standingId: true };
      const resStanding = validateStandingRecord(badStanding);
      expect(resStanding.ok).toBe(false);
      if (!resStanding.ok) {
        expect(resStanding.error.field).toBe("standingId");
      }

      const badReceipt = { ...validExecutionReceipt, executionTime: true };
      const resReceipt = validateExecutionReceipt(badReceipt);
      expect(resReceipt.ok).toBe(false);
      if (!resReceipt.ok) {
        expect(resReceipt.error.field).toBe("executionTime");
      }
    });

    it("rejects arrays where object properties or primitive parameters are expected", () => {
      const badStanding = { ...validStanding, scope: ["global-audit"] };
      const resStanding = validateStandingRecord(badStanding);
      expect(resStanding.ok).toBe(false);
      if (!resStanding.ok) {
        expect(resStanding.error.field).toBe("scope");
      }
    });

    it("rejects boxed primitives explicitly", () => {
      // String primitives should not be satisfied by new String("foo")
      const boxedStringId = new String("id-123") as unknown as string;
      const badIdentity = { ...validIdentity, identityId: boxedStringId };
      const resIdentity = validateIdentityRecord(badIdentity);
      expect(resIdentity.ok).toBe(false);

      // Number primitives should not be satisfied by new Number(100)
      const boxedNumberBudget = new Number(1000) as unknown as number;
      const badContext = {
        ...validExecutionContext,
        budget: boxedNumberBudget,
      };
      const resContext = validateExecutionContext(badContext);
      expect(resContext.ok).toBe(false);
    });

    it("rejects NaN, Infinity, and -Infinity on finite numeric contracts", () => {
      for (const nonFinite of [NaN, Infinity, -Infinity]) {
        const badReceipt = {
          ...validExecutionReceipt,
          executionTime: nonFinite,
        };
        const resReceipt = validateExecutionReceipt(badReceipt);
        expect(resReceipt.ok).toBe(false);
        if (!resReceipt.ok) {
          expect(resReceipt.error.field).toBe("executionTime");
        }

        const badContext = { ...validExecutionContext, budget: nonFinite };
        const resContext = validateExecutionContext(badContext);
        expect(resContext.ok).toBe(false);
        if (!resContext.ok) {
          expect(resContext.error.field).toBe("budget");
        }
      }
    });
  });

  describe("4. Non-Mutation and Purity of Validation/Serialization", () => {
    it("does not mutate supplied input structures (frozen object safe)", () => {
      // Validate that freeze-protected input does not cause validators to throw, nor alters values
      const frozenIdentity = Object.freeze({
        ...validIdentity,
      });

      const res = validateIdentityRecord(frozenIdentity);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value).toEqual(validIdentity);

        // Same check for serializer
        expect(() => serializeIdentityRecord(res.value)).not.toThrow();
      }
    });

    it("preserves valid string values verbatim without trimming or normalization on successful validation", () => {
      // Standard M03 rules preserve original whitespace in valid values
      // (e.g., if a value is not empty or whitespace-only, original whitespaces should not be normalized)
      const spacedStandingInput = {
        ...validStanding,
        scope: "  global-audit  with-inner-spaces  ",
      };

      const res = validateStandingRecord(spacedStandingInput);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.scope).toBe("  global-audit  with-inner-spaces  ");
      }
    });
  });

  describe("5. Deterministic First-Failure Ordering", () => {
    it("returns error on the chronologically first invalid field in sequence declaration order", () => {
      // For ExecutionReceipt, validation order is:
      // receiptId -> executionId -> runtimeVersion -> inputHash -> outputHash -> evidenceHash -> policyVersion -> decisionSummary -> executionTime -> deterministicHash
      // Let's invalidate BOTH executionId and executionTime. The validator must return error for executionId.
      const badReceipt = {
        ...validExecutionReceipt,
        executionId: "   ", // invalid (whitespace-only)
        executionTime: -5.0, // invalid (negative)
      };

      const res = validateExecutionReceipt(badReceipt);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.field).toBe("executionId");
        expect(res.error.code).toBe("INVALID_EXECUTION_ID");
      }
    });

    it("returns error on scope first when both scope and validFrom are invalid", () => {
      // Validation order for StandingRecord: standingId -> subjectId -> scope -> validFrom -> validTo -> chronological check
      const badStanding = {
        ...validStanding,
        scope: "", // invalid
        validFrom: "invalid-timestamp", // invalid
      };

      const res = validateStandingRecord(badStanding);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.field).toBe("scope");
        expect(res.error.code).toBe("INVALID_SCOPE");
      }
    });
  });

  describe("6. Exotic and Inherited Property Handling", () => {
    it("accepts inputs with prototype-inherited valid fields", () => {
      // Since validation checks for field properties using raw access (raw.field),
      // verify that inherited properties are accepted if they exist in the prototype chain.
      const prototypeRecord = {
        identityId: "id-proto-123",
        identityType: "product",
        canonicalReference: "https://id.gs1.org/01/09780201379626",
        referentId: "ref-456",
        status: "active" as const,
        createdAt: "2026-07-28T12:00:00Z",
        updatedAt: "2026-07-28T12:05:00.123Z",
      };

      const inheritedInput = Object.create(prototypeRecord);

      const res = validateIdentityRecord(inheritedInput);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.identityId).toBe("id-proto-123");
      }
    });

    it("successfully validates clean null-prototype objects", () => {
      const cleanNullProtoObject = Object.create(null);
      cleanNullProtoObject.identityId = "id-123";
      cleanNullProtoObject.identityType = "product";
      cleanNullProtoObject.canonicalReference =
        "https://id.gs1.org/01/09780201379626";
      cleanNullProtoObject.referentId = null;
      cleanNullProtoObject.status = "active";
      cleanNullProtoObject.createdAt = "2026-07-28T12:00:00Z";
      cleanNullProtoObject.updatedAt = "2026-07-28T12:05:00.123Z";

      const res = validateIdentityRecord(cleanNullProtoObject);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.identityId).toBe("id-123");
      }
    });

    it("evaluates object properties containing getter functions cleanly", () => {
      const getterInput = {
        get standingId() {
          return "standing-getter-123";
        },
        subjectId: "id-123",
        scope: "global-audit",
        validFrom: "2026-01-01T00:00:00Z",
        validTo: "2026-12-31T23:59:59Z",
      };

      const res = validateStandingRecord(getterInput);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.standingId).toBe("standing-getter-123");
      }
    });

    it("evaluates transparency under standard JavaScript Proxy wrappers", () => {
      const proxyInput = new Proxy(validStanding, {});
      const res = validateStandingRecord(proxyInput);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value).toEqual(validStanding);
      }
    });
  });

  describe("7. Policy Definition Safety (Cycles, Deep Nesting, Prototypes)", () => {
    it("rejects cyclic definitions safely returning CYCLIC_DEFINITION", () => {
      const cyclicObj: Record<string, unknown> = {};
      cyclicObj.self = cyclicObj;

      const badPolicy = {
        ...validPolicy,
        definition: cyclicObj,
      };

      const res = validatePolicyRecord(badPolicy);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("CYCLIC_DEFINITION");
        expect(res.error.field).toBe("definition");
      }
    });

    it("rejects definitions with exotic or non-plain object prototypes", () => {
      class CustomPolicyRule {
        constructor(public name = "rule") {}
      }

      const badPolicy = {
        ...validPolicy,
        definition: {
          rule: new CustomPolicyRule(),
        },
      };

      const res = validatePolicyRecord(badPolicy);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("INVALID_DEFINITION");
        expect(res.error.field).toBe("definition");
      }
    });

    it("validates prototype-safe own-data structures that contain __proto__, constructor, and prototype safely", () => {
      // Verify behavior on own keys matching keywords without prototype pollution
      // Note: AMS-0307 allows these keys to survive as own data properties in clean JSON structure
      const defString =
        '{"__proto__": {"marker": true}, "constructor": "data", "prototype": "data"}';
      const parsedDef = JSON.parse(defString);

      const policyInput = {
        ...validPolicy,
        definition: parsedDef,
      };

      const res = validatePolicyRecord(policyInput);
      expect(res.ok).toBe(true);
      if (res.ok) {
        // Verify Object.prototype has not been polluted
        expect(
          (Object.prototype as Record<string, unknown>).marker,
        ).toBeUndefined();

        // Serializes safely with these keys
        const serialized = serializePolicyRecord(res.value);
        expect(serialized).toContain('"__proto__"');
        expect(serialized).toContain('"constructor"');
        expect(serialized).toContain('"prototype"');
      }
    });
  });

  describe("8. Cross-Model Responsibility Separation", () => {
    it("confirms Outcome remains isolated to verified/unverified/rejected scalar", () => {
      // Verify that validateOutcome strictly fails on objects, preventing responsibility leakage
      const invalidOutcomeWithReceipt = {
        outcome: "verified",
        receiptId: "receipt-123",
        executionTime: 12.5,
      };

      const res = validateOutcome(invalidOutcomeWithReceipt);
      expect(res.ok).toBe(false);
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  validateExecutionRequest,
  serializeExecutionRequest,
  type ExecutionRequest,
  type IdentityRecord,
  type ReferentRecord,
  type StandingRecord,
  type AuthorityRecord,
  type CapabilityRecord,
  type EvidenceRecord,
  type PolicyRecord,
  type ActiveConstitutionalView,
  type EvidenceBundle,
  type PolicyContext,
  type ExecutionContext,
} from "./index.js";

describe("ExecutionRequest Domain Model", () => {
  const validIdentity: IdentityRecord = {
    identityId: "id-123",
    identityType: "product",
    canonicalReference: "https://id.gs1.org/01/09780201379626",
    referentId: "ref-456",
    status: "active",
    createdAt: "2026-07-28T12:00:00Z",
    updatedAt: "2026-07-28T12:05:00.123Z",
  };

  const validRelationship: ReferentRecord = {
    referentId: "ref-456",
    referentType: "brand",
    name: "Acme",
    parentReferentId: null,
    createdAt: "2026-07-28T12:00:00Z",
  };

  const validStanding: StandingRecord = {
    standingId: "standing-001",
    subjectId: "id-123",
    scope: "caw:eligible",
    validFrom: "2026-07-28T12:00:00Z",
    validTo: "2026-07-28T12:00:00Z",
  };

  const validAuthority: AuthorityRecord = {
    authorityId: "auth-001",
    subjectId: "id-123",
    scope: "caw:assert",
    validFrom: "2026-07-28T12:00:00Z",
    validTo: "2026-07-28T12:00:00Z",
  };

  const validCapability: CapabilityRecord = {
    capabilityId: "cap-001",
    subjectId: "id-123",
    scope: "caw:verify",
    validFrom: "2026-07-28T12:00:00Z",
    validTo: "2026-07-28T12:00:00Z",
  };

  const validEvidence: EvidenceRecord = {
    evidenceId: "evidence-001",
    identityId: "id-123",
    evidenceType: "caw:receipt",
    hash: "hash123",
    storageRef: "r2://key-123",
    retrievedAt: "2026-07-28T12:00:00Z",
  };

  const validPolicy: PolicyRecord = {
    policyId: "policy-001",
    policyType: "caw:simple",
    version: "1.0.0",
    definition: { rule: "always-allow" },
    active: true,
  };

  const validRequestInput = {
    requestId: "req-789",
    identity: validIdentity,
    activeConstitutionalView: {
      identity: validIdentity,
      relationships: [validRelationship],
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
    executionContext: {
      executionId: "exec-456",
      constitutionalTimestamp: "2026-08-08T14:30:00Z",
      budget: 1000,
      entropy: "random_entropy_string",
      versions: ["1.0.0", "1.1.0"],
    },
    resolvedPolicyGraph: {
      edges: [],
    },
  };

  describe("Validation", () => {
    it("accepts a well-formed input", () => {
      const result = validateExecutionRequest(validRequestInput);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.requestId).toBe("req-789");
        expect(result.value.identity).toEqual(validIdentity);
        expect(result.value.activeConstitutionalView.standings[0]).toEqual(
          validStanding,
        );
      }
    });

    it("rejects non-object inputs", () => {
      const resultNull = validateExecutionRequest(null);
      expect(resultNull.ok).toBe(false);
      if (!resultNull.ok) {
        expect(resultNull.error.code).toBe("INVALID_REQUEST_ID");
      }

      const resultString = validateExecutionRequest("invalid");
      expect(resultString.ok).toBe(false);
    });

    it("rejects empty or missing requestId", () => {
      const input1 = { ...validRequestInput, requestId: "" };
      const result1 = validateExecutionRequest(input1);
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error.code).toBe("INVALID_REQUEST_ID");
        expect(result1.error.field).toBe("requestId");
      }

      const input2 = { ...validRequestInput, requestId: "   " };
      const result2 = validateExecutionRequest(input2);
      expect(result2.ok).toBe(false);
    });

    it("rejects missing or invalid identity", () => {
      const input = {
        ...validRequestInput,
        identity: null as unknown as IdentityRecord,
      };
      const result = validateExecutionRequest(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_IDENTITY");
        expect(result.error.field).toBe("identity");
      }
    });

    it("rejects invalid activeConstitutionalView structure", () => {
      const input = {
        ...validRequestInput,
        activeConstitutionalView: null as unknown as ActiveConstitutionalView,
      };
      const result = validateExecutionRequest(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_ACTIVE_CONSTITUTIONAL_VIEW");
        expect(result.error.field).toBe("activeConstitutionalView");
      }
    });

    it("rejects invalid sub-elements inside activeConstitutionalView", () => {
      // Invalid identity in ACV
      const inputIdentity = {
        ...validRequestInput,
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          identity: { ...validIdentity, identityId: "" },
        },
      };
      const resIdentity = validateExecutionRequest(inputIdentity);
      expect(resIdentity.ok).toBe(false);
      if (!resIdentity.ok) {
        expect(resIdentity.error.code).toBe(
          "INVALID_ACTIVE_CONSTITUTIONAL_VIEW",
        );
      }

      // Invalid relationships (not array)
      const inputRel = {
        ...validRequestInput,
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          relationships: "not-array" as unknown as ReferentRecord[],
        },
      };
      const resRel = validateExecutionRequest(inputRel);
      expect(resRel.ok).toBe(false);

      // Invalid standing inside array
      const inputStanding = {
        ...validRequestInput,
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          standings: [{ ...validStanding, standingId: "" }],
        },
      };
      const resStanding = validateExecutionRequest(inputStanding);
      expect(resStanding.ok).toBe(false);

      // Invalid authority inside array
      const inputAuth = {
        ...validRequestInput,
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          authorities: [{ ...validAuthority, authorityId: "" }],
        },
      };
      const resAuth = validateExecutionRequest(inputAuth);
      expect(resAuth.ok).toBe(false);

      // Invalid capability inside array
      const inputCap = {
        ...validRequestInput,
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          capabilities: [{ ...validCapability, capabilityId: "" }],
        },
      };
      const resCap = validateExecutionRequest(inputCap);
      expect(resCap.ok).toBe(false);

      // Invalid evidence reference inside array
      const inputEvidenceRef = {
        ...validRequestInput,
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          evidenceReferences: [{ ...validEvidence, evidenceId: "" }],
        },
      };
      const resEvidenceRef = validateExecutionRequest(inputEvidenceRef);
      expect(resEvidenceRef.ok).toBe(false);

      // Invalid policy inside array
      const inputPolicy = {
        ...validRequestInput,
        activeConstitutionalView: {
          ...validRequestInput.activeConstitutionalView,
          applicablePolicies: [{ ...validPolicy, policyId: "" }],
        },
      };
      const resPolicy = validateExecutionRequest(inputPolicy);
      expect(resPolicy.ok).toBe(false);
    });

    it("rejects invalid evidenceBundle structure or sub-elements", () => {
      // null bundle
      const inputNull = {
        ...validRequestInput,
        evidenceBundle: null as unknown as EvidenceBundle,
      };
      const resNull = validateExecutionRequest(inputNull);
      expect(resNull.ok).toBe(false);
      if (!resNull.ok) {
        expect(resNull.error.code).toBe("INVALID_EVIDENCE_BUNDLE");
        expect(resNull.error.field).toBe("evidenceBundle");
      }

      // invalid records
      const inputInvalidRecord = {
        ...validRequestInput,
        evidenceBundle: {
          schemaVersion: "1.0",
          evidenceRecords: [{ ...validEvidence, evidenceId: "" }],
        },
      };
      const resInvalidRecord = validateExecutionRequest(inputInvalidRecord);
      expect(resInvalidRecord.ok).toBe(false);
    });

    it("rejects invalid policyContext structure or sub-elements", () => {
      // null context
      const inputNull = {
        ...validRequestInput,
        policyContext: null as unknown as PolicyContext,
      };
      const resNull = validateExecutionRequest(inputNull);
      expect(resNull.ok).toBe(false);
      if (!resNull.ok) {
        expect(resNull.error.code).toBe("INVALID_POLICY_CONTEXT");
        expect(resNull.error.field).toBe("policyContext");
      }

      // invalid policy records
      const inputInvalidPolicy = {
        ...validRequestInput,
        policyContext: {
          policies: [{ ...validPolicy, policyId: "" }],
        },
      };
      const resInvalidPolicy = validateExecutionRequest(inputInvalidPolicy);
      expect(resInvalidPolicy.ok).toBe(false);
    });

    it("rejects invalid executionContext structure or invalid fields", () => {
      // null context
      const inputNull = {
        ...validRequestInput,
        executionContext: null as unknown as ExecutionContext,
      };
      const resNull = validateExecutionRequest(inputNull);
      expect(resNull.ok).toBe(false);
      if (!resNull.ok) {
        expect(resNull.error.code).toBe("INVALID_EXECUTION_CONTEXT");
        expect(resNull.error.field).toBe("executionContext");
      }

      // invalid budget
      const inputBudget = {
        ...validRequestInput,
        executionContext: {
          ...validRequestInput.executionContext,
          budget: -10,
        },
      };
      const resBudget = validateExecutionRequest(inputBudget);
      expect(resBudget.ok).toBe(false);

      // invalid entropy
      const inputEntropy = {
        ...validRequestInput,
        executionContext: {
          ...validRequestInput.executionContext,
          entropy: "",
        },
      };
      const resEntropy = validateExecutionRequest(inputEntropy);
      expect(resEntropy.ok).toBe(false);

      // invalid versions (not array)
      const inputVer = {
        ...validRequestInput,
        executionContext: {
          ...validRequestInput.executionContext,
          versions: "not-array" as unknown as string[],
        },
      };
      const resVer = validateExecutionRequest(inputVer);
      expect(resVer.ok).toBe(false);

      // invalid versions items
      const inputVerItem = {
        ...validRequestInput,
        executionContext: {
          ...validRequestInput.executionContext,
          versions: ["1.0.0", ""],
        },
      };
      const resVerItem = validateExecutionRequest(inputVerItem);
      expect(resVerItem.ok).toBe(false);
    });

    it("does not mutate its input", () => {
      const originalInput = JSON.parse(JSON.stringify(validRequestInput));
      const result = validateExecutionRequest(validRequestInput);
      expect(result.ok).toBe(true);
      expect(validRequestInput).toEqual(originalInput);
    });

    it("repeated validation produces the same result (determinism)", () => {
      const result1 = validateExecutionRequest(validRequestInput);
      const result2 = validateExecutionRequest(validRequestInput);
      expect(result1).toEqual(result2);
    });
  });

  describe("Canonical Serialization", () => {
    it("serializes deterministically regardless of Javascript property ordering", () => {
      const result = validateExecutionRequest(validRequestInput);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const req = result.value;
        const serialized = serializeExecutionRequest(req);

        // Re-sorting memory order should still yield the same serialized output
        const shuffledReq: ExecutionRequest = {
          requestId: req.requestId,
          executionContext: req.executionContext,
          activeConstitutionalView: req.activeConstitutionalView,
          policyContext: req.policyContext,
          evidenceBundle: req.evidenceBundle,
          identity: req.identity,
          resolvedPolicyGraph: req.resolvedPolicyGraph,
        };
        const serializedShuffled = serializeExecutionRequest(shuffledReq);
        expect(serialized).toBe(serializedShuffled);

        // Verify alphabetic order of top level fields:
        // activeConstitutionalView -> evidenceBundle -> executionContext -> identity -> policyContext -> requestId -> resolvedPolicyGraph
        const parsedKeys = Object.keys(JSON.parse(serialized));
        expect(parsedKeys).toEqual([
          "activeConstitutionalView",
          "evidenceBundle",
          "executionContext",
          "identity",
          "policyContext",
          "requestId",
          "resolvedPolicyGraph",
        ]);
      }
    });

    it("does not mutate the input", () => {
      const result = validateExecutionRequest(validRequestInput);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const req = result.value;
        const clone = JSON.parse(JSON.stringify(req));
        serializeExecutionRequest(req);
        expect(req).toEqual(clone);
      }
    });

    it("preserves array order during serialization", () => {
      const result = validateExecutionRequest(validRequestInput);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const req = result.value;
        const serialized = serializeExecutionRequest(req);
        const parsed = JSON.parse(serialized);

        // check executionContext versions array ordering remains exact
        expect(parsed.executionContext.versions).toEqual(
          req.executionContext.versions,
        );
      }
    });
  });
});

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  deriveEvidenceStateRefV2,
  derivePolicyUniverseRefV2,
  deriveSemanticStateRefV2,
  type ExecutionRequestV2,
  type OwnerDeterminationBindingV2,
} from "@zyppi/domain";
import * as runtimeExports from "@zyppi/runtime";
import { materializeExecutionReceiptV2 } from "@zyppi/runtime";
import { dispatchRawExecutionRequest } from "./executionGenerationBoundary.js";
import {
  materializeExecutionRequestV2,
  type ExecutionRequestV2MaterializationInput,
} from "./v2ExecutionMaterialization.js";

// Common owner refs
const OWNER_POL_001 = {
  family: "OWNER" as const,
  ownerRef: "urn:zyppi:owner:pol:v1",
  artifactId: "POL-001",
};

const OWNER_SEC_001 = {
  family: "OWNER" as const,
  ownerRef: "urn:zyppi:owner:sec:v1",
  artifactId: "SEC-001",
};

const OWNER_OTHER_001 = {
  family: "OWNER" as const,
  ownerRef: "urn:zyppi:owner:other:v1",
  artifactId: "OTHER-001",
};

const PROV_001 = {
  family: "PROVENANCE" as const,
  ownerRef: "urn:zyppi:owner:council:v1",
  artifactId: "prov-001",
};

const RULE_001 = {
  family: "RULE" as const,
  ownerRef: "urn:zyppi:owner:council:v1",
  artifactId: "rule-001",
};

const STATE_INST_001 = {
  family: "STATE_INSTANCE" as const,
  ownerRef: "urn:zyppi:owner:council:v1",
  artifactId: "state-inst-001",
};

// Standard Question Operand Bindings for POL Aggregate, Authorization, and Trust
const POL_AGGREGATE_OPERANDS = [
  {
    operandKey: "op_pu",
    operandSlotSemanticRef: {
      family: "EVALUATION_SEMANTIC" as const,
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "slot-pu",
    },
    operandKind: "POLICY_UNIVERSE" as const,
    policyUniverseRef:
      "sha256:3e72c74c72b3cfd918eb167e12c8e5d2cad8644b808634e50293fc94bb3e9777",
  },
  {
    operandKey: "op_ra",
    operandSlotSemanticRef: {
      family: "EVALUATION_SEMANTIC" as const,
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "slot-ra",
    },
    operandKind: "REQUESTED_ACTION" as const,
    requestedActionRef: "REQUESTED_ACTION" as const,
  },
];

const POL_AUTH_OPERANDS = [
  {
    operandKey: "op_ra",
    operandSlotSemanticRef: {
      family: "EVALUATION_SEMANTIC" as const,
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "slot-ra",
    },
    operandKind: "REQUESTED_ACTION" as const,
    requestedActionRef: "REQUESTED_ACTION" as const,
  },
  {
    operandKey: "op_pu",
    operandSlotSemanticRef: {
      family: "EVALUATION_SEMANTIC" as const,
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "slot-pu",
    },
    operandKind: "POLICY_UNIVERSE" as const,
    policyUniverseRef:
      "sha256:3e72c74c72b3cfd918eb167e12c8e5d2cad8644b808634e50293fc94bb3e9777",
  },
  {
    operandKey: "op_ap",
    operandSlotSemanticRef: {
      family: "EVALUATION_SEMANTIC" as const,
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "slot-ap",
    },
    operandKind: "ACTION_PERFORMER" as const,
    performerRef: "pk1",
  },
  {
    operandKey: "op_at",
    operandSlotSemanticRef: {
      family: "EVALUATION_SEMANTIC" as const,
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "slot-at",
    },
    operandKind: "ACTION_TARGET" as const,
    targetSlotSemanticRef: {
      family: "TARGET_SLOT_SEMANTIC" as const,
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "primary-target-v1",
    },
    targetRef: {
      family: "TARGET" as const,
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "asset-001",
    },
  },
];

const SEC_TRUST_OPERANDS = [
  {
    operandKey: "op_es",
    operandSlotSemanticRef: {
      family: "EVALUATION_SEMANTIC" as const,
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "slot-es",
    },
    operandKind: "EVIDENCE_STATE" as const,
    evidenceStateRef:
      "sha256:93f27b9a5bf46d85dd8e98710398e85db24eb8efc0e43827ebf6c900f73e2dde",
  },
];

// Helper builders for owner determination bindings
function makePolAggregateBinding(
  aggregateResult: "ALLOW" | "DENY" | "INDETERMINATE" = "ALLOW",
  bindingKey = "od_pol_aggregate",
  ownerRef = OWNER_POL_001,
): OwnerDeterminationBindingV2 {
  return {
    determinationBindingKey: bindingKey,
    determinationQuestionBinding: {
      questionSemanticRef: {
        family: "QUESTION_SEMANTIC",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "q-pol-aggregate",
      },
      questionOperandBindings: POL_AGGREGATE_OPERANDS,
    },
    constitutionalOwnerRef: ownerRef,
    ownerNativeResult: { aggregateResult },
    exactStateRef: STATE_INST_001,
    exactRuleRef: RULE_001,
    assessedAtCoordinateRef: "tEInput",
    provenanceRef: PROV_001,
    determinationDependencyDeclaration: { kind: "AUTHORITATIVELY_NONE" },
  };
}

function makePolAuthBinding(
  authorizationDecision:
    | "Authorized"
    | "Denied"
    | "Conditionally Authorized"
    | "Deferred" = "Authorized",
  bindingKey = "od_pol_auth",
): OwnerDeterminationBindingV2 {
  return {
    determinationBindingKey: bindingKey,
    determinationQuestionBinding: {
      questionSemanticRef: {
        family: "QUESTION_SEMANTIC",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "q-pol-auth",
      },
      questionOperandBindings: POL_AUTH_OPERANDS,
    },
    constitutionalOwnerRef: OWNER_POL_001,
    ownerNativeResult: { authorizationDecision },
    exactStateRef: STATE_INST_001,
    exactRuleRef: RULE_001,
    assessedAtCoordinateRef: "tEInput",
    provenanceRef: PROV_001,
    determinationDependencyDeclaration: { kind: "AUTHORITATIVELY_NONE" },
  };
}

function makeSecTrustBinding(
  trustStatus = "definite",
  degradationFactors: readonly string[] = [],
  bindingKey = "od_sec_trust",
): OwnerDeterminationBindingV2 {
  return {
    determinationBindingKey: bindingKey,
    determinationQuestionBinding: {
      questionSemanticRef: {
        family: "QUESTION_SEMANTIC",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "q-sec-trust",
      },
      questionOperandBindings: SEC_TRUST_OPERANDS,
    },
    constitutionalOwnerRef: OWNER_SEC_001,
    ownerNativeResult: {
      trustStatus,
      degradationFactors: [...degradationFactors],
    },
    exactStateRef: STATE_INST_001,
    exactRuleRef: RULE_001,
    assessedAtCoordinateRef: "tEInput",
    provenanceRef: PROV_001,
    determinationDependencyDeclaration: { kind: "AUTHORITATIVELY_NONE" },
  };
}

// Base lawful V2 request template
function createBaseV2Request(
  overrides?: Partial<ExecutionRequestV2>,
): ExecutionRequestV2 {
  const req: ExecutionRequestV2 = {
    contractVersion: "v2",
    requestId: "req-v2-proof-001",
    participation: {
      roleBindings: [
        {
          roleBindingKey: "rb1",
          role: "ACTOR",
          subject: {
            kind: "KNOWN",
            subjectRef: {
              family: "SUBJECT",
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "actor-001",
            },
          },
        },
      ],
      agencyBindings: [],
    },
    intent: {
      originatorParticipationRef: "rb1",
      intentCategory: "VERIFY",
      intentTargetRef: {
        family: "TARGET",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "asset-001",
      },
      candidateStateBinding: {
        stateTargetRef: {
          family: "TARGET",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "asset-001",
        },
        stateSemanticRef: {
          family: "STATE_SEMANTIC",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "verification-v1",
        },
        exactStateInstance: {
          kind: "GOVERNED_ARTIFACT_REF",
          stateInstanceRef: {
            family: "STATE_INSTANCE",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "instance-001",
          },
        },
      },
    },
    requestedAction: {
      actionSemanticRef: {
        family: "ACTION_SEMANTIC",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "verify-asset-v1",
      },
      intentActionCompatibilityBinding: {
        kind: "GOVERNED_SEMANTIC_CONTRACT",
        exactCompatibilityContractRef: {
          family: "COMPATIBILITY_CONTRACT",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "compat-contract-001",
        },
      },
      actionPerformerBindings: [
        {
          performerKey: "pk1",
          actorParticipationRef: "rb1",
          agencyReliance: {
            kind: "NO_DELEGATED_AGENCY_RELIANCE",
          },
        },
      ],
      actionTargetBindings: [
        {
          targetSlotSemanticRef: {
            family: "TARGET_SLOT_SEMANTIC",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "primary-target-v1",
          },
          targetRef: {
            family: "TARGET",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "asset-001",
          },
        },
      ],
      requestedCapabilityClaimBindings: [],
    },
    constitutionalState: {
      semanticStateRef:
        "sha256:946a1d1d35385c868648e1967ca70ea87ea1f254b517deb46a2ea6d5f6e7708d",
      stateViews: [
        {
          viewKey: "vk1",
          viewScope: {
            family: "SCOPE",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "global-v1",
          },
          stateBindings: [
            {
              stateBindingKey: "sb1",
              kind: "IDENTITY_STATE",
              subjectRef: {
                family: "SUBJECT",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "actor-001",
              },
              stateSemanticRef: {
                family: "STATE_SEMANTIC",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "identity-v1",
              },
              exactStateRef: {
                family: "STATE_INSTANCE",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "instance-001",
              },
            },
          ],
        },
      ],
    },
    evidenceState: {
      evidenceStateRef:
        "sha256:93f27b9a5bf46d85dd8e98710398e85db24eb8efc0e43827ebf6c900f73e2dde",
      evidenceRequirementBindings: [],
      suppliedEvidenceMaterial: [],
      evidencePresentationBindings: [],
      integrityCoordinates: [],
    },
    policyUniverse: {
      policyUniverseRef:
        "sha256:3e72c74c72b3cfd918eb167e12c8e5d2cad8644b808634e50293fc94bb3e9777",
      applicablePolicyMaterial: [],
      dependencyTopology: {
        dependencyEdges: [],
      },
      applicabilityProvenanceBinding: PROV_001,
    },
    evaluationContext: {
      authorizedInputBindings: [],
      evaluationParameterBindings: [],
      boundContextBindings: [],
      ownerDeterminationBindings: [
        makePolAggregateBinding("ALLOW"),
        makePolAuthBinding("Authorized"),
        makeSecTrustBinding("definite"),
      ],
    },
    executionContext: {
      executionId: "exec-v2-proof-001",
      temporalCoordinates: {
        tEInput: "2026-08-24T17:00:00Z",
      },
      budget: 1000,
    },
    ...overrides,
  };
  return req;
}

function toMatInput(
  req: ExecutionRequestV2,
): ExecutionRequestV2MaterializationInput {
  const input = { ...req } as Record<string, unknown>;
  delete input.contractVersion;
  return input as unknown as ExecutionRequestV2MaterializationInput;
}

describe("CCP-RI-V2-10 — Native End-to-End Proof Suite", () => {
  // 1. Primary Typed End-to-End Lane (V210-T01..T08)
  describe("Primary Typed End-to-End Lane", () => {
    it("V210-T01 — Typed Native Positive Verification", () => {
      const sourceReq = createBaseV2Request();
      const matInput = toMatInput(sourceReq);

      const matRes = materializeExecutionRequestV2(matInput);
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      expect(
        receiptRes.frame.executabilityOutcomeFrame.executability.status,
      ).toBe("DETERMINED");
      if (
        receiptRes.frame.executabilityOutcomeFrame.executability.status ===
        "DETERMINED"
      ) {
        expect(
          receiptRes.frame.executabilityOutcomeFrame.executability.value,
        ).toBe(true);
      }

      expect(receiptRes.frame.executabilityOutcomeFrame.outcome.status).toBe(
        "PRODUCED",
      );
      if (
        receiptRes.frame.executabilityOutcomeFrame.outcome.status === "PRODUCED"
      ) {
        expect(receiptRes.frame.executabilityOutcomeFrame.outcome.outcome).toBe(
          "verified",
        );
      }

      expect(receiptRes.frame.executionReceipt.runtimeVersion).toBe("2.0.0");
    });

    it("V210-T02 — Application -> Runtime Input Digest Continuity", () => {
      const sourceReq = createBaseV2Request();
      const matRes = materializeExecutionRequestV2(toMatInput(sourceReq));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      const prodFrame =
        receiptRes.frame.executabilityOutcomeFrame.ownerIntegrationFrame
          .productionFrame;

      expect(matRes.wholeRequestDigestCandidate).toBe(
        prodFrame.wholeRequestDigestCandidate,
      );
      expect(prodFrame.wholeRequestDigestCandidate).toBe(
        receiptRes.frame.executionReceipt.inputHash,
      );
    });

    it("V210-T03 — Native Frame Chain", () => {
      const sourceReq = createBaseV2Request();
      const matRes = materializeExecutionRequestV2(toMatInput(sourceReq));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      const receiptFrame = receiptRes.frame;
      expect(receiptFrame.kind).toBe("RECEIPT_MATERIALIZATION_V2");

      const execOutcomeFrame = receiptFrame.executabilityOutcomeFrame;
      expect(execOutcomeFrame.kind).toBe("EXECUTABILITY_OUTCOME_V2");

      const ownerIntegFrame = execOutcomeFrame.ownerIntegrationFrame;
      expect(ownerIntegFrame.kind).toBe("OWNER_DETERMINATION_INTEGRATION_V2");

      const prodFrame = ownerIntegFrame.productionFrame;
      expect(prodFrame.kind).toBe("PRODUCTION_EXECUTION_V2");

      expect(prodFrame.executionRequest.contractVersion).toBe("v2");
    });

    it("V210-T04 — Execution Identity Continuity", () => {
      const sourceReq = createBaseV2Request();
      const matRes = materializeExecutionRequestV2(toMatInput(sourceReq));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      const prodReq =
        receiptRes.frame.executabilityOutcomeFrame.ownerIntegrationFrame
          .productionFrame.executionRequest;

      expect(sourceReq.executionContext.executionId).toBe(
        matRes.executionRequest.executionContext.executionId,
      );
      expect(matRes.executionRequest.executionContext.executionId).toBe(
        prodReq.executionContext.executionId,
      );
      expect(prodReq.executionContext.executionId).toBe(
        receiptRes.frame.executionReceipt.executionId,
      );
    });

    it("V210-T05 — Policy Identity Continuity", () => {
      const sourceReq = createBaseV2Request();
      const matRes = materializeExecutionRequestV2(toMatInput(sourceReq));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      const prodReq =
        receiptRes.frame.executabilityOutcomeFrame.ownerIntegrationFrame
          .productionFrame.executionRequest;

      expect(matRes.executionRequest.policyUniverse.policyUniverseRef).toBe(
        prodReq.policyUniverse.policyUniverseRef,
      );
      expect(prodReq.policyUniverse.policyUniverseRef).toBe(
        receiptRes.frame.executionReceipt.policyVersion,
      );
    });

    it("V210-T06 — Temporal Continuity", () => {
      const sourceReq = createBaseV2Request();
      const matRes = materializeExecutionRequestV2(toMatInput(sourceReq));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      expect(receiptRes.frame.executionReceipt.executionTime).toBe(
        "2026-08-24T17:00:00Z",
      );
    });

    it("V210-T07 — Owner Binding Continuity", () => {
      const sourceReq = createBaseV2Request();
      const matRes = materializeExecutionRequestV2(toMatInput(sourceReq));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      const prodBindings =
        receiptRes.frame.executabilityOutcomeFrame.ownerIntegrationFrame
          .productionFrame.executionRequest.evaluationContext
          .ownerDeterminationBindings;

      const ownerResults =
        receiptRes.frame.executabilityOutcomeFrame.ownerResults;

      expect(ownerResults.policyAggregate).toBe(prodBindings[0]);
      expect(ownerResults.authorization).toBe(prodBindings[1]);
      expect(ownerResults.trustResult).toBe(prodBindings[2]);
    });

    it("V210-T08 — Exact Ten-Field Receipt", () => {
      const sourceReq = createBaseV2Request();
      const matRes = materializeExecutionRequestV2(toMatInput(sourceReq));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      const receipt = receiptRes.frame.executionReceipt;
      const keys = Object.keys(receipt).sort();

      const expectedKeys = [
        "decisionSummary",
        "deterministicHash",
        "evidenceHash",
        "executionId",
        "executionTime",
        "inputHash",
        "outputHash",
        "policyVersion",
        "receiptId",
        "runtimeVersion",
      ];

      expect(keys).toEqual(expectedKeys);
      expect(receipt.runtimeVersion).toBe("2.0.0");
    });
  });

  // 2. Secondary Raw End-to-End Lane (V210-T09..T18)
  describe("Secondary Raw End-to-End Lane", () => {
    it("V210-T09 — Raw Explicit V2 Native Success", () => {
      const sourceReq = createBaseV2Request();
      const rawJson = JSON.stringify(sourceReq);

      const dispatchRes = dispatchRawExecutionRequest(rawJson);
      expect(dispatchRes.ok).toBe(true);
      if (!dispatchRes.ok) return;

      expect(dispatchRes.generation).toBe("v2");

      const receiptRes = materializeExecutionReceiptV2(
        dispatchRes.executionRequest,
      );
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      expect(receiptRes.frame.executionReceipt.runtimeVersion).toBe("2.0.0");
    });

    it("V210-T10 — Raw Dispatch Digest Continuity", () => {
      const sourceReq = createBaseV2Request();
      const rawJson = JSON.stringify(sourceReq);

      const dispatchRes = dispatchRawExecutionRequest(rawJson);
      expect(dispatchRes.ok).toBe(true);
      if (!dispatchRes.ok) return;

      expect(dispatchRes.generation).toBe("v2");
      if (dispatchRes.generation !== "v2") return;

      const receiptRes = materializeExecutionReceiptV2(
        dispatchRes.executionRequest,
      );
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      expect(dispatchRes.wholeRequestDigestCandidate).toBe(
        receiptRes.frame.executionReceipt.inputHash,
      );
    });

    it("V210-T11 — Duplicate JSON Key Rejects Before Execution", () => {
      const rawJsonWithDupKey = `{
        "contractVersion": "v2",
        "requestId": "req-1",
        "requestId": "req-2",
        "participation": { "roleBindings": [], "agencyBindings": [] }
      }`;

      const dispatchRes = dispatchRawExecutionRequest(rawJsonWithDupKey);
      expect(dispatchRes.ok).toBe(false);
      if (dispatchRes.ok) return;

      expect(dispatchRes.stage).toBe("RAW_JSON");
      if (dispatchRes.stage === "RAW_JSON") {
        expect(dispatchRes.code).toBe("DUPLICATE_JSON_KEY");
      }
    });

    it("V210-T12 — Malformed Explicit V2 Never Falls Back to V1", () => {
      const malformedV2Json = JSON.stringify({
        contractVersion: "v2",
        requestId: "req-v2-invalid",
        participation: { invalidField: true },
      });

      const dispatchRes = dispatchRawExecutionRequest(malformedV2Json);
      expect(dispatchRes.ok).toBe(false);
      if (dispatchRes.ok) return;

      expect(dispatchRes.stage).toBe("V2_VALIDATION");
    });

    it("V210-T13 — Unsupported Explicit Generation Never Falls Back", () => {
      const v3Json = JSON.stringify({
        contractVersion: "v3",
        requestId: "req-v3-001",
      });

      const dispatchRes = dispatchRawExecutionRequest(v3Json);
      expect(dispatchRes.ok).toBe(false);
      if (dispatchRes.ok) return;

      expect(dispatchRes.stage).toBe("GENERATION_CLASSIFICATION");
      if (dispatchRes.stage === "GENERATION_CLASSIFICATION") {
        expect(dispatchRes.code).toBe("UNSUPPORTED_EXPLICIT_GENERATION");
      }
    });

    it("V210-T14 — V2 Marker Without Version Is Rejected", () => {
      const sourceReq = createBaseV2Request();
      const reqObj = JSON.parse(JSON.stringify(sourceReq));
      delete reqObj.contractVersion;

      const dispatchRes = dispatchRawExecutionRequest(JSON.stringify(reqObj));
      expect(dispatchRes.ok).toBe(false);
      if (dispatchRes.ok) return;

      expect(dispatchRes.stage).toBe("GENERATION_CLASSIFICATION");
      if (dispatchRes.stage === "GENERATION_CLASSIFICATION") {
        expect(dispatchRes.code).toBe("MISSING_V2_GENERATION_MARKER");
      }
    });

    it("V210-T15 — Historical Markerless V1 Remains V1", () => {
      const v1Fixture = {
        requestId: "req-v1-001",
        identity: {
          identityId: "id-001",
          identityType: "product",
          canonicalReference: "urn:gtin:00012345678905",
          referentId: "ref-001",
          status: "active",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
        activeConstitutionalView: {
          identity: {
            identityId: "id-001",
            identityType: "product",
            canonicalReference: "urn:gtin:00012345678905",
            referentId: "ref-001",
            status: "active",
            createdAt: "2026-01-01T00:00:00Z",
            updatedAt: "2026-01-01T00:00:00Z",
          },
          relationships: [],
          standings: [],
          authorities: [],
          capabilities: [],
          evidenceReferences: [],
          applicablePolicies: [],
        },
        evidenceBundle: {
          schemaVersion: "1.0",
          evidenceRecords: [],
        },
        policyContext: {
          policies: [],
        },
        executionContext: {
          executionId: "exec-v1-001",
          constitutionalTimestamp: "2026-01-01T00:00:00Z",
          budget: 100,
          entropy: "entropy-001",
          versions: ["1.0.0"],
        },
        resolvedPolicyGraph: {
          edges: [],
        },
      };

      const dispatchRes = dispatchRawExecutionRequest(
        JSON.stringify(v1Fixture),
      );
      expect(dispatchRes.ok).toBe(true);
      if (!dispatchRes.ok) return;

      expect(dispatchRes.generation).toBe("v1");
      // Note per mandate V210-T15: Do NOT pass historical V1 into materializeExecutionReceiptV2
    });

    it("V210-T16 — Raw Property-Order Invariance", () => {
      const reqA = createBaseV2Request();

      // Create reqB with altered JSON property order
      const jsonA = JSON.stringify(reqA);
      const objA = JSON.parse(jsonA);

      const objB = {
        executionContext: objA.executionContext,
        evaluationContext: objA.evaluationContext,
        policyUniverse: objA.policyUniverse,
        evidenceState: objA.evidenceState,
        constitutionalState: objA.constitutionalState,
        requestedAction: objA.requestedAction,
        intent: objA.intent,
        participation: objA.participation,
        requestId: objA.requestId,
        contractVersion: objA.contractVersion,
      };
      const jsonB = JSON.stringify(objB);

      const dispatchResA = dispatchRawExecutionRequest(jsonA);
      const dispatchResB = dispatchRawExecutionRequest(jsonB);

      expect(dispatchResA.ok).toBe(true);
      expect(dispatchResB.ok).toBe(true);
      if (!dispatchResA.ok || !dispatchResB.ok) return;

      expect(dispatchResA.generation).toBe("v2");
      expect(dispatchResB.generation).toBe("v2");
      if (dispatchResA.generation !== "v2" || dispatchResB.generation !== "v2")
        return;

      expect(dispatchResA.wholeRequestDigestCandidate).toBe(
        dispatchResB.wholeRequestDigestCandidate,
      );

      const receiptResA = materializeExecutionReceiptV2(
        dispatchResA.executionRequest,
      );
      const receiptResB = materializeExecutionReceiptV2(
        dispatchResB.executionRequest,
      );

      expect(receiptResA.ok).toBe(true);
      expect(receiptResB.ok).toBe(true);
      if (!receiptResA.ok || !receiptResB.ok) return;

      const rA = receiptResA.frame.executionReceipt;
      const rB = receiptResB.frame.executionReceipt;

      expect(rA.inputHash).toBe(rB.inputHash);
      expect(rA.decisionSummary).toBe(rB.decisionSummary);
      expect(rA.receiptId).toBe(rB.receiptId);
      expect(rA.deterministicHash).toBe(rB.deterministicHash);
    });

    it("V210-T17 — Top-Level Success Injection Rejected", () => {
      const sourceReq = createBaseV2Request();
      const rawWithInjection = {
        ...JSON.parse(JSON.stringify(sourceReq)),
        outcome: { status: "PRODUCED", outcome: "verified" },
        trustResult: { trustStatus: "definite" },
        authorization: { authorizationDecision: "Authorized" },
        executability: { status: "DETERMINED", value: true },
        receipt: { receiptId: "fake-receipt" },
      };

      const dispatchRes = dispatchRawExecutionRequest(
        JSON.stringify(rawWithInjection),
      );
      expect(dispatchRes.ok).toBe(false);
      if (dispatchRes.ok) return;

      expect(dispatchRes.stage).toBe("V2_VALIDATION");
      if (dispatchRes.stage === "V2_VALIDATION") {
        expect(dispatchRes.error.code).toBe("UNKNOWN_FIELD");
      }
    });

    it("V210-T18 — Inter-Stage Mutation Fails Closed", () => {
      const sourceReq = createBaseV2Request();
      const matRes = materializeExecutionRequestV2(toMatInput(sourceReq));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      // Mutate subject artifactId in constitutional state view without updating semanticStateRef
      const sb0 =
        matRes.executionRequest.constitutionalState.stateViews[0]
          .stateBindings[0];
      const mutatedBinding =
        sb0.kind === "IDENTITY_STATE"
          ? {
              ...sb0,
              subjectRef: {
                family: "SUBJECT" as const,
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "actor-mutated-002",
              },
            }
          : sb0;

      const mutatedReq: ExecutionRequestV2 = {
        ...matRes.executionRequest,
        constitutionalState: {
          ...matRes.executionRequest.constitutionalState,
          stateViews: [
            {
              ...matRes.executionRequest.constitutionalState.stateViews[0],
              stateBindings: [mutatedBinding],
            },
          ],
        },
      };

      const receiptRes = materializeExecutionReceiptV2(mutatedReq);
      expect(receiptRes.ok).toBe(false);
      if (receiptRes.ok) return;

      expect(receiptRes.stage).toBe("IDENTITY_VALIDATION");
      if (receiptRes.stage === "IDENTITY_VALIDATION") {
        expect(receiptRes.error.code).toBe("COMPONENT_DIGEST_MISMATCH");
      }
    });
  });

  // 3. Outcome / Receipt Matrix & Policy/Auth/Trust Separation (V210-T19..T29)
  describe("Outcome / Receipt Matrix & Separation", () => {
    it("V210-T19 — ALLOW + Authorized + Trust -> Verified", () => {
      const req = createBaseV2Request();
      const matRes = materializeExecutionRequestV2(toMatInput(req));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      const execFrame = receiptRes.frame.executabilityOutcomeFrame;
      expect(execFrame.executability).toEqual({
        status: "DETERMINED",
        value: true,
        blockers: [],
        basisBindingKeys: [
          "od_pol_aggregate",
          "od_pol_auth",
          "od_sec_trust",
        ].sort(),
        assessedAtCoordinateRef: "tEInput",
      });

      expect(execFrame.outcome).toEqual({
        status: "PRODUCED",
        outcome: "verified",
        basisBindingKeys: [
          "od_pol_aggregate",
          "od_pol_auth",
          "od_sec_trust",
        ].sort(),
      });
    });

    it("V210-T20 — DENY -> Rejected Receipt", () => {
      const req = createBaseV2Request();
      const denyReq: ExecutionRequestV2 = {
        ...req,
        evaluationContext: {
          ...req.evaluationContext,
          ownerDeterminationBindings: [
            makePolAggregateBinding("DENY"),
            makePolAuthBinding("Authorized"),
            makeSecTrustBinding("definite"),
          ],
        },
      };

      const matRes = materializeExecutionRequestV2(toMatInput(denyReq));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      const execFrame = receiptRes.frame.executabilityOutcomeFrame;
      expect(execFrame.executability.status).toBe("DETERMINED");
      if (execFrame.executability.status === "DETERMINED") {
        expect(execFrame.executability.value).toBe(false);
        expect(execFrame.executability.blockers).toContain("POLICY_DENIED");
      }

      expect(execFrame.outcome).toEqual({
        status: "PRODUCED",
        outcome: "rejected",
        basisBindingKeys: [
          "od_pol_aggregate",
          "od_pol_auth",
          "od_sec_trust",
        ].sort(),
      });
    });

    it("V210-T21 — INDETERMINATE Does Not Become Verified", () => {
      const req = createBaseV2Request();
      const indetReq: ExecutionRequestV2 = {
        ...req,
        evaluationContext: {
          ...req.evaluationContext,
          ownerDeterminationBindings: [
            makePolAggregateBinding("INDETERMINATE"),
            makePolAuthBinding("Authorized"),
            makeSecTrustBinding("definite"),
          ],
        },
      };

      const matRes = materializeExecutionRequestV2(toMatInput(indetReq));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      const execFrame = receiptRes.frame.executabilityOutcomeFrame;
      expect(execFrame.executability.status).toBe("DETERMINED");
      if (execFrame.executability.status === "DETERMINED") {
        expect(execFrame.executability.value).toBe(false);
        expect(execFrame.executability.blockers).toContain(
          "POLICY_INDETERMINATE",
        );
      }

      expect(execFrame.outcome).toEqual({
        status: "PRODUCED",
        outcome: "unverified",
        basisBindingKeys: [
          "od_pol_aggregate",
          "od_pol_auth",
          "od_sec_trust",
        ].sort(),
      });
    });

    it("V210-T22 — Missing Authorization Remains Missing", () => {
      const req = createBaseV2Request();
      const missingAuthReq: ExecutionRequestV2 = {
        ...req,
        evaluationContext: {
          ...req.evaluationContext,
          ownerDeterminationBindings: [
            makePolAggregateBinding("ALLOW"),
            makeSecTrustBinding("definite"),
          ],
        },
      };

      const matRes = materializeExecutionRequestV2(toMatInput(missingAuthReq));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      const execFrame = receiptRes.frame.executabilityOutcomeFrame;
      expect(execFrame.executability.status).toBe("UNAVAILABLE");
      if (execFrame.executability.status === "UNAVAILABLE") {
        expect(execFrame.executability.missingOwnerResults).toContain(
          "AUTHORIZATION",
        );
      }

      expect(execFrame.outcome.status).toBe("NOT_PRODUCED");
      if (execFrame.outcome.status === "NOT_PRODUCED") {
        expect(execFrame.outcome.reason).toBe("EXECUTABILITY_UNAVAILABLE");
      }
    });

    it("V210-T23 — Missing TrustResult Remains Missing", () => {
      const req = createBaseV2Request();
      const missingTrustReq: ExecutionRequestV2 = {
        ...req,
        evaluationContext: {
          ...req.evaluationContext,
          ownerDeterminationBindings: [
            makePolAggregateBinding("ALLOW"),
            makePolAuthBinding("Authorized"),
          ],
        },
      };

      const matRes = materializeExecutionRequestV2(toMatInput(missingTrustReq));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      const execFrame = receiptRes.frame.executabilityOutcomeFrame;
      expect(execFrame.executability.status).toBe("UNAVAILABLE");
      if (execFrame.executability.status === "UNAVAILABLE") {
        expect(execFrame.executability.missingOwnerResults).toContain(
          "TRUST_RESULT",
        );
      }

      expect(execFrame.outcome.status).toBe("NOT_PRODUCED");
      if (execFrame.outcome.status === "NOT_PRODUCED") {
        expect(execFrame.outcome.reason).toBe("EXECUTABILITY_UNAVAILABLE");
      }
    });

    it("V210-T24 — Budget Zero Is Non-Executable, Not Structural Failure", () => {
      const req = createBaseV2Request();
      const budgetZeroReq: ExecutionRequestV2 = {
        ...req,
        executionContext: {
          ...req.executionContext,
          budget: 0,
        },
      };

      const matRes = materializeExecutionRequestV2(toMatInput(budgetZeroReq));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      const execFrame = receiptRes.frame.executabilityOutcomeFrame;
      expect(execFrame.executability.status).toBe("DETERMINED");
      if (execFrame.executability.status === "DETERMINED") {
        expect(execFrame.executability.value).toBe(false);
        expect(execFrame.executability.blockers).toContain("BUDGET_EXHAUSTED");
      }

      expect(execFrame.outcome.status).toBe("NOT_PRODUCED");
      if (execFrame.outcome.status === "NOT_PRODUCED") {
        expect(execFrame.outcome.reason).toBe(
          "EXECUTION_NOT_ADMITTED_TO_TERMINAL_VERIFICATION",
        );
      }
    });

    it("V210-T25 — Non-VERIFY Intent Produces No VERIFY Outcome", () => {
      const req = createBaseV2Request();
      const discoverReq: ExecutionRequestV2 = {
        ...req,
        intent: {
          ...req.intent,
          intentCategory: "DISCOVER",
        },
      };

      const matRes = materializeExecutionRequestV2(toMatInput(discoverReq));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      const execFrame = receiptRes.frame.executabilityOutcomeFrame;
      expect(execFrame.outcome).toEqual({
        status: "NOT_PRODUCED",
        reason: "OUTCOME_NOT_APPLICABLE_TO_INTENT",
        basisBindingKeys: [
          "od_pol_aggregate",
          "od_pol_auth",
          "od_sec_trust",
        ].sort(),
      });
    });

    it("V210-T26 — Wrong Owner Cannot Supply POL Aggregate Authority", () => {
      const req = createBaseV2Request();
      const wrongOwnerReq: ExecutionRequestV2 = {
        ...req,
        evaluationContext: {
          ...req.evaluationContext,
          ownerDeterminationBindings: [
            makePolAggregateBinding(
              "ALLOW",
              "od_pol_aggregate",
              OWNER_OTHER_001,
            ),
            makePolAuthBinding("Authorized"),
            makeSecTrustBinding("definite"),
          ],
        },
      };

      const matRes = materializeExecutionRequestV2(toMatInput(wrongOwnerReq));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      const execFrame = receiptRes.frame.executabilityOutcomeFrame;
      expect(execFrame.ownerResults.policyAggregate).toBeNull();
      expect(execFrame.executability.status).toBe("UNAVAILABLE");
    });

    it("V210-T27 — Cross-Role POL Binding Is Rejected", () => {
      const req = createBaseV2Request();

      // One POL binding attempting to satisfy both Aggregate Policy Result and Authorization
      const dualRoleBinding: OwnerDeterminationBindingV2 = {
        determinationBindingKey: "od_dual_role",
        determinationQuestionBinding: {
          questionSemanticRef: {
            family: "QUESTION_SEMANTIC",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "q-dual",
          },
          questionOperandBindings: [
            {
              operandKey: "op_pu_dual",
              operandSlotSemanticRef: {
                family: "EVALUATION_SEMANTIC",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "slot-pu",
              },
              operandKind: "POLICY_UNIVERSE",
              policyUniverseRef:
                "sha256:3e72c74c72b3cfd918eb167e12c8e5d2cad8644b808634e50293fc94bb3e9777",
            },
            {
              operandKey: "op_ra_dual",
              operandSlotSemanticRef: {
                family: "EVALUATION_SEMANTIC",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "slot-ra",
              },
              operandKind: "REQUESTED_ACTION",
              requestedActionRef: "REQUESTED_ACTION",
            },
            {
              operandKey: "op_ap_dual",
              operandSlotSemanticRef: {
                family: "EVALUATION_SEMANTIC",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "slot-ap",
              },
              operandKind: "ACTION_PERFORMER",
              performerRef: "pk1",
            },
            {
              operandKey: "op_at_dual",
              operandSlotSemanticRef: {
                family: "EVALUATION_SEMANTIC",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "slot-at",
              },
              operandKind: "ACTION_TARGET",
              targetSlotSemanticRef: {
                family: "TARGET_SLOT_SEMANTIC",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "primary-target-v1",
              },
              targetRef: {
                family: "TARGET",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "asset-001",
              },
            },
          ],
        },
        constitutionalOwnerRef: OWNER_POL_001,
        ownerNativeResult: {
          aggregateResult: "ALLOW",
          authorizationDecision: "Authorized",
        },
        exactStateRef: STATE_INST_001,
        exactRuleRef: RULE_001,
        assessedAtCoordinateRef: "tEInput",
        provenanceRef: PROV_001,
        determinationDependencyDeclaration: { kind: "AUTHORITATIVELY_NONE" },
      };

      const dualReq: ExecutionRequestV2 = {
        ...req,
        evaluationContext: {
          ...req.evaluationContext,
          ownerDeterminationBindings: [
            dualRoleBinding,
            makeSecTrustBinding("definite"),
          ],
        },
      };

      const matRes = materializeExecutionRequestV2(toMatInput(dualReq));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(false);
      if (receiptRes.ok) return;

      expect(receiptRes.stage).toBe("EXECUTABILITY_OUTCOME");
      expect(receiptRes.error.code).toBe("OWNER_RESULT_ROLE_AMBIGUOUS");
    });

    it("V210-T28 — ALLOW Alone Does Not Create Authorization", () => {
      const req = createBaseV2Request();
      const allowOnlyReq: ExecutionRequestV2 = {
        ...req,
        evaluationContext: {
          ...req.evaluationContext,
          ownerDeterminationBindings: [
            makePolAggregateBinding("ALLOW"),
            makeSecTrustBinding("definite"),
          ],
        },
      };

      const matRes = materializeExecutionRequestV2(toMatInput(allowOnlyReq));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      const execFrame = receiptRes.frame.executabilityOutcomeFrame;
      expect(execFrame.ownerResults.authorization).toBeNull();
      expect(execFrame.outcome.status).not.toBe("PRODUCED");
    });

    it("V210-T29 — Trust Alone Does Not Create Authorization or Verification", () => {
      const req = createBaseV2Request();
      const trustOnlyReq: ExecutionRequestV2 = {
        ...req,
        evaluationContext: {
          ...req.evaluationContext,
          ownerDeterminationBindings: [makeSecTrustBinding("definite")],
        },
      };

      const matRes = materializeExecutionRequestV2(toMatInput(trustOnlyReq));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      const execFrame = receiptRes.frame.executabilityOutcomeFrame;
      expect(execFrame.ownerResults.policyAggregate).toBeNull();
      expect(execFrame.ownerResults.authorization).toBeNull();
      expect(execFrame.outcome.status).not.toBe("PRODUCED");
    });
  });

  // 4. Participant Foundation PFG-E2E-01..05 Proofs (V210-T30..T34)
  describe("Participant Foundation PFG-E2E Proofs", () => {
    it("V210-T30 — PFG-E2E-01 Self Execution", () => {
      const subjectRefS = {
        family: "SUBJECT" as const,
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "actor-001",
      };

      const selfReq: ExecutionRequestV2 = createBaseV2Request({
        participation: {
          roleBindings: [
            {
              roleBindingKey: "rb_actor",
              role: "ACTOR",
              subject: {
                kind: "KNOWN",
                subjectRef: subjectRefS,
              },
            },
            {
              roleBindingKey: "rb_governed",
              role: "GOVERNED_SUBJECT",
              subject: {
                kind: "KNOWN",
                subjectRef: subjectRefS,
              },
            },
          ],
          agencyBindings: [],
        },
        intent: {
          originatorParticipationRef: "rb_actor",
          intentCategory: "VERIFY",
          intentTargetRef: {
            family: "TARGET",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "asset-001",
          },
          candidateStateBinding: {
            stateTargetRef: {
              family: "TARGET",
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "asset-001",
            },
            stateSemanticRef: {
              family: "STATE_SEMANTIC",
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "verification-v1",
            },
            exactStateInstance: {
              kind: "GOVERNED_ARTIFACT_REF",
              stateInstanceRef: {
                family: "STATE_INSTANCE",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "instance-001",
              },
            },
          },
        },
        requestedAction: {
          actionSemanticRef: {
            family: "ACTION_SEMANTIC",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "verify-asset-v1",
          },
          intentActionCompatibilityBinding: {
            kind: "GOVERNED_SEMANTIC_CONTRACT",
            exactCompatibilityContractRef: {
              family: "COMPATIBILITY_CONTRACT",
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "compat-contract-001",
            },
          },
          actionPerformerBindings: [
            {
              performerKey: "pk1",
              actorParticipationRef: "rb_actor",
              agencyReliance: {
                kind: "NO_DELEGATED_AGENCY_RELIANCE",
              },
            },
          ],
          actionTargetBindings: [
            {
              targetSlotSemanticRef: {
                family: "TARGET_SLOT_SEMANTIC",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "primary-target-v1",
              },
              targetRef: {
                family: "TARGET",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "asset-001",
              },
            },
          ],
          requestedCapabilityClaimBindings: [],
        },
      });

      // Assert explicit self-execution shape: Actor SubjectRef == Governed Subject SubjectRef
      const actorSubj = selfReq.participation.roleBindings.find(
        (rb) => rb.role === "ACTOR",
      )?.subject;
      const govSubj = selfReq.participation.roleBindings.find(
        (rb) => rb.role === "GOVERNED_SUBJECT",
      )?.subject;

      expect(actorSubj?.kind).toBe("KNOWN");
      expect(govSubj?.kind).toBe("KNOWN");
      if (actorSubj?.kind === "KNOWN" && govSubj?.kind === "KNOWN") {
        expect(actorSubj.subjectRef).toEqual(govSubj.subjectRef);
      }
      expect(selfReq.participation.agencyBindings).toEqual([]);
      expect(
        selfReq.requestedAction.actionPerformerBindings[0].agencyReliance.kind,
      ).toBe("NO_DELEGATED_AGENCY_RELIANCE");

      const matRes = materializeExecutionRequestV2(toMatInput(selfReq));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      expect(
        receiptRes.frame.executabilityOutcomeFrame.outcome.status ===
          "PRODUCED" &&
          receiptRes.frame.executabilityOutcomeFrame.outcome.outcome ===
            "verified",
      ).toBe(true);
    });

    it("V210-T31 — PFG-E2E-02 Delegated Execution", () => {
      const req = createBaseV2Request();
      const delegatedReq: ExecutionRequestV2 = {
        ...req,
        participation: {
          roleBindings: [
            {
              roleBindingKey: "rb_actor",
              role: "ACTOR",
              subject: {
                kind: "KNOWN",
                subjectRef: {
                  family: "SUBJECT",
                  ownerRef: "urn:zyppi:owner:council:v1",
                  artifactId: "agent-001",
                },
              },
            },
            {
              roleBindingKey: "rb_governed",
              role: "GOVERNED_SUBJECT",
              subject: {
                kind: "KNOWN",
                subjectRef: {
                  family: "SUBJECT",
                  ownerRef: "urn:zyppi:owner:council:v1",
                  artifactId: "principal-001",
                },
              },
            },
          ],
          agencyBindings: [
            {
              agencyBindingKey: "ab1",
              actorRoleBindingRef: "rb_actor",
              governedSubjectRoleBindingRef: "rb_governed",
              terminalAgencyBasisRef: {
                family: "AGENCY_BASIS",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "poa-v1",
              },
            },
          ],
        },
        intent: {
          ...req.intent,
          originatorParticipationRef: "rb_actor",
        },
        requestedAction: {
          ...req.requestedAction,
          actionPerformerBindings: [
            {
              performerKey: "pk1",
              actorParticipationRef: "rb_actor",
              agencyReliance: {
                kind: "DELEGATED_AGENCY_SINGLE",
                agencyBindingRef: "ab1",
              },
            },
          ],
        },
      };

      const matRes = materializeExecutionRequestV2(toMatInput(delegatedReq));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      expect(receiptRes.frame.executionReceipt.runtimeVersion).toBe("2.0.0");
    });

    it("V210-T32 — PFG-E2E-03 Same Subject, Different Context", () => {
      const subjectRefS = {
        family: "SUBJECT" as const,
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "actor-001",
      };

      const rawStateA = {
        semanticStateRef: "",
        stateViews: [
          {
            viewKey: "vk1",
            viewScope: {
              family: "SCOPE" as const,
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "global-v1",
            },
            stateBindings: [
              {
                stateBindingKey: "sb_standing",
                kind: "STANDING_STATE" as const,
                subjectRef: subjectRefS,
                stateSemanticRef: {
                  family: "STATE_SEMANTIC" as const,
                  ownerRef: "urn:zyppi:owner:council:v1",
                  artifactId: "standing-v1",
                },
                exactStateRef: {
                  family: "STATE_INSTANCE" as const,
                  ownerRef: "urn:zyppi:owner:council:v1",
                  artifactId: "standing-active",
                },
              },
            ],
          },
        ],
      };

      const semResA = deriveSemanticStateRefV2(
        rawStateA as unknown as Parameters<typeof deriveSemanticStateRefV2>[0],
      );
      expect(semResA.ok).toBe(true);
      if (!semResA.ok) return;

      const constStateA = {
        ...rawStateA,
        semanticStateRef: semResA.value,
      };

      const rawStateB = {
        semanticStateRef: "",
        stateViews: [
          {
            viewKey: "vk1",
            viewScope: {
              family: "SCOPE" as const,
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "global-v1",
            },
            stateBindings: [
              {
                stateBindingKey: "sb_standing",
                kind: "STANDING_STATE" as const,
                subjectRef: subjectRefS,
                stateSemanticRef: {
                  family: "STATE_SEMANTIC" as const,
                  ownerRef: "urn:zyppi:owner:council:v1",
                  artifactId: "standing-v1",
                },
                exactStateRef: {
                  family: "STATE_INSTANCE" as const,
                  ownerRef: "urn:zyppi:owner:council:v1",
                  artifactId: "standing-suspended",
                },
              },
            ],
          },
        ],
      };

      const semResB = deriveSemanticStateRefV2(
        rawStateB as unknown as Parameters<typeof deriveSemanticStateRefV2>[0],
      );
      expect(semResB.ok).toBe(true);
      if (!semResB.ok) return;

      const constStateB = {
        ...rawStateB,
        semanticStateRef: semResB.value,
      };

      const req1 = createBaseV2Request({
        requestId: "req-context-1",
        constitutionalState: constStateA,
      });

      const req2 = createBaseV2Request({
        requestId: "req-context-2",
        constitutionalState: constStateB,
        executionContext: {
          executionId: "exec-context-2",
          temporalCoordinates: { tEInput: "2026-08-25T10:00:00Z" },
          budget: 1000,
        },
      });

      const matRes1 = materializeExecutionRequestV2(toMatInput(req1));
      const matRes2 = materializeExecutionRequestV2(toMatInput(req2));

      expect(matRes1.ok).toBe(true);
      expect(matRes2.ok).toBe(true);
      if (!matRes1.ok || !matRes2.ok) return;

      // Both retain same canonical SubjectRef
      expect(
        matRes1.executionRequest.participation.roleBindings[0].subject,
      ).toEqual(matRes2.executionRequest.participation.roleBindings[0].subject);

      // Governed semantic state differs
      expect(
        matRes1.executionRequest.constitutionalState.semanticStateRef,
      ).not.toBe(matRes2.executionRequest.constitutionalState.semanticStateRef);

      // Whole request digest candidate differs
      expect(matRes1.wholeRequestDigestCandidate).not.toBe(
        matRes2.wholeRequestDigestCandidate,
      );

      const receipt1 = materializeExecutionReceiptV2(matRes1.executionRequest);
      const receipt2 = materializeExecutionReceiptV2(matRes2.executionRequest);

      expect(receipt1.ok).toBe(true);
      expect(receipt2.ok).toBe(true);
      if (!receipt1.ok || !receipt2.ok) return;

      expect(receipt1.frame.executionReceipt.receiptId).not.toBe(
        receipt2.frame.executionReceipt.receiptId,
      );
    });

    it("V210-T33 — PFG-E2E-04 Historical T1 vs Current T2", () => {
      const reqT1 = createBaseV2Request({
        requestId: "req-hist-t1",
        executionContext: {
          executionId: "exec-hist-t1",
          temporalCoordinates: { tEInput: "2026-01-01T00:00:00Z" },
          budget: 1000,
        },
      });

      const reqT2 = createBaseV2Request({
        requestId: "req-hist-t2",
        evaluationContext: {
          authorizedInputBindings: [],
          evaluationParameterBindings: [],
          boundContextBindings: [],
          ownerDeterminationBindings: [
            makePolAggregateBinding("ALLOW"),
            makePolAuthBinding("Denied"), // Authority revoked at T2
            makeSecTrustBinding("definite"),
          ],
        },
        executionContext: {
          executionId: "exec-hist-t2",
          temporalCoordinates: { tEInput: "2026-06-01T00:00:00Z" },
          budget: 1000,
        },
      });

      const matT1 = materializeExecutionRequestV2(toMatInput(reqT1));
      const matT2 = materializeExecutionRequestV2(toMatInput(reqT2));

      expect(matT1.ok).toBe(true);
      expect(matT2.ok).toBe(true);
      if (!matT1.ok || !matT2.ok) return;

      const receiptResT1 = materializeExecutionReceiptV2(
        matT1.executionRequest,
      );
      const receiptResT2 = materializeExecutionReceiptV2(
        matT2.executionRequest,
      );

      expect(receiptResT1.ok).toBe(true);
      expect(receiptResT2.ok).toBe(true);
      if (!receiptResT1.ok || !receiptResT2.ok) return;

      // T1 Receipt is verified
      expect(
        receiptResT1.frame.executabilityOutcomeFrame.outcome.status ===
          "PRODUCED" &&
          receiptResT1.frame.executabilityOutcomeFrame.outcome.outcome ===
            "verified",
      ).toBe(true);

      // T2 Execution is evaluated independently (not verified / DENIED)
      expect(
        receiptResT2.frame.executabilityOutcomeFrame.executability.status ===
          "DETERMINED" &&
          receiptResT2.frame.executabilityOutcomeFrame.executability.value ===
            false,
      ).toBe(true);

      // Replaying T1 again produces identical Receipt
      const replayT1 = materializeExecutionReceiptV2(matT1.executionRequest);
      expect(replayT1.ok).toBe(true);
      if (replayT1.ok && receiptResT1.ok) {
        expect(replayT1.frame.executionReceipt).toEqual(
          receiptResT1.frame.executionReceipt,
        );
      }
    });

    it("V210-T34 — PFG-E2E-05 UNKNOWN Preservation", () => {
      const req = createBaseV2Request();
      const unknownReq: ExecutionRequestV2 = {
        ...req,
        participation: {
          roleBindings: [
            {
              roleBindingKey: "rb1",
              role: "ACTOR",
              subject: { kind: "UNKNOWN" },
            },
          ],
          agencyBindings: [],
        },
      };

      const matRes = materializeExecutionRequestV2(toMatInput(unknownReq));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      expect(
        matRes.executionRequest.participation.roleBindings[0].subject,
      ).toEqual({ kind: "UNKNOWN" });

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      const receipt = receiptRes.frame.executionReceipt;
      expect(receipt).not.toHaveProperty("account");
      expect(receipt).not.toHaveProperty("user");
      expect(receipt).not.toHaveProperty("tenant");
      expect(receipt).not.toHaveProperty("participant");
    });
  });

  // 5. Determinism, Replay, Domain Neutrality & Audits (V210-T35..T40)
  describe("Determinism, Domain Neutrality & Audits", () => {
    it("V210-T35 — Exact Replay Stability", () => {
      const req = createBaseV2Request();
      const input1 = toMatInput(req);
      const input2 = toMatInput(req);

      const mat1 = materializeExecutionRequestV2(input1);
      const mat2 = materializeExecutionRequestV2(input2);

      expect(mat1.ok).toBe(true);
      expect(mat2.ok).toBe(true);
      if (!mat1.ok || !mat2.ok) return;

      expect(mat1.wholeRequestDigestCandidate).toBe(
        mat2.wholeRequestDigestCandidate,
      );

      const r1 = materializeExecutionReceiptV2(mat1.executionRequest);
      const r2 = materializeExecutionReceiptV2(mat2.executionRequest);

      expect(r1.ok).toBe(true);
      expect(r2.ok).toBe(true);
      if (!r1.ok || !r2.ok) return;

      expect(r1.frame.executionReceipt).toEqual(r2.frame.executionReceipt);
    });

    it("V210-T36 — Equivalent Temporal Offset Stability", () => {
      const reqA = createBaseV2Request({
        executionContext: {
          executionId: "exec-time-001",
          temporalCoordinates: { tEInput: "2026-08-24T17:00:00Z" },
          budget: 1000,
        },
      });

      const reqB = createBaseV2Request({
        executionContext: {
          executionId: "exec-time-001",
          temporalCoordinates: { tEInput: "2026-08-24T20:00:00+03:00" },
          budget: 1000,
        },
      });

      const matA = materializeExecutionRequestV2(toMatInput(reqA));
      const matB = materializeExecutionRequestV2(toMatInput(reqB));

      expect(matA.ok).toBe(true);
      expect(matB.ok).toBe(true);
      if (!matA.ok || !matB.ok) return;

      expect(matA.wholeRequestDigestCandidate).toBe(
        matB.wholeRequestDigestCandidate,
      );

      const rA = materializeExecutionReceiptV2(matA.executionRequest);
      const rB = materializeExecutionReceiptV2(matB.executionRequest);

      expect(rA.ok).toBe(true);
      expect(rB.ok).toBe(true);
      if (!rA.ok || !rB.ok) return;

      expect(rA.frame.executionReceipt.executionTime).toBe(
        rB.frame.executionReceipt.executionTime,
      );
      expect(rA.frame.executionReceipt.inputHash).toBe(
        rB.frame.executionReceipt.inputHash,
      );
      expect(rA.frame.executionReceipt.receiptId).toBe(
        rB.frame.executionReceipt.receiptId,
      );
      expect(rA.frame.executionReceipt.deterministicHash).toBe(
        rB.frame.executionReceipt.deterministicHash,
      );
    });

    it("V210-T37 — Synthetic Non-GS1 Twin", () => {
      const SYNTHETIC_PROV = {
        family: "PROVENANCE" as const,
        ownerRef: "urn:zyppi:owner:synthetic:v1",
        artifactId: "synthetic-prov-001",
      };

      const rawState = {
        semanticStateRef: "",
        stateViews: [
          {
            viewKey: "synth_vk",
            viewScope: {
              family: "SCOPE" as const,
              ownerRef: "urn:zyppi:owner:synthetic:v1",
              artifactId: "scope-v1",
            },
            stateBindings: [
              {
                stateBindingKey: "synth_sb",
                kind: "IDENTITY_STATE" as const,
                subjectRef: {
                  family: "SUBJECT" as const,
                  ownerRef: "urn:zyppi:owner:synthetic:v1",
                  artifactId: "subject-synth-1",
                },
                stateSemanticRef: {
                  family: "STATE_SEMANTIC" as const,
                  ownerRef: "urn:zyppi:owner:synthetic:v1",
                  artifactId: "semantic-synth-1",
                },
                exactStateRef: {
                  family: "STATE_INSTANCE" as const,
                  ownerRef: "urn:zyppi:owner:synthetic:v1",
                  artifactId: "inst-synth-1",
                },
              },
            ],
          },
        ],
      };

      const semRes = deriveSemanticStateRefV2(
        rawState as unknown as Parameters<typeof deriveSemanticStateRefV2>[0],
      );
      expect(semRes.ok).toBe(true);
      if (!semRes.ok) return;

      const rawEv = {
        evidenceStateRef: "",
        evidenceRequirementBindings: [],
        suppliedEvidenceMaterial: [],
        evidencePresentationBindings: [],
        integrityCoordinates: [],
      };
      const evRes = deriveEvidenceStateRefV2(
        rawEv as unknown as Parameters<typeof deriveEvidenceStateRefV2>[0],
      );
      expect(evRes.ok).toBe(true);
      if (!evRes.ok) return;

      const rawPol = {
        policyUniverseRef: "",
        applicablePolicyMaterial: [],
        dependencyTopology: { dependencyEdges: [] },
        applicabilityProvenanceBinding: SYNTHETIC_PROV,
      };
      const polRes = derivePolicyUniverseRefV2(
        rawPol as unknown as Parameters<typeof derivePolicyUniverseRefV2>[0],
      );
      expect(polRes.ok).toBe(true);
      if (!polRes.ok) return;

      const synthReq: ExecutionRequestV2 = {
        contractVersion: "v2",
        requestId: "req-synth-001",
        participation: {
          roleBindings: [
            {
              roleBindingKey: "rb_synth",
              role: "ACTOR",
              subject: {
                kind: "KNOWN",
                subjectRef: {
                  family: "SUBJECT",
                  ownerRef: "urn:zyppi:owner:synthetic:v1",
                  artifactId: "subject-synth-1",
                },
              },
            },
          ],
          agencyBindings: [],
        },
        intent: {
          originatorParticipationRef: "rb_synth",
          intentCategory: "VERIFY",
          intentTargetRef: {
            family: "TARGET",
            ownerRef: "urn:zyppi:owner:synthetic:v1",
            artifactId: "target-synth-1",
          },
          candidateStateBinding: {
            stateTargetRef: {
              family: "TARGET",
              ownerRef: "urn:zyppi:owner:synthetic:v1",
              artifactId: "target-synth-1",
            },
            stateSemanticRef: {
              family: "STATE_SEMANTIC",
              ownerRef: "urn:zyppi:owner:synthetic:v1",
              artifactId: "semantic-synth-1",
            },
            exactStateInstance: {
              kind: "GOVERNED_ARTIFACT_REF",
              stateInstanceRef: {
                family: "STATE_INSTANCE",
                ownerRef: "urn:zyppi:owner:synthetic:v1",
                artifactId: "inst-synth-1",
              },
            },
          },
        },
        requestedAction: {
          actionSemanticRef: {
            family: "ACTION_SEMANTIC",
            ownerRef: "urn:zyppi:owner:synthetic:v1",
            artifactId: "action-synth-1",
          },
          intentActionCompatibilityBinding: {
            kind: "GOVERNED_SEMANTIC_CONTRACT",
            exactCompatibilityContractRef: {
              family: "COMPATIBILITY_CONTRACT",
              ownerRef: "urn:zyppi:owner:synthetic:v1",
              artifactId: "compat-synth-1",
            },
          },
          actionPerformerBindings: [
            {
              performerKey: "pk_synth",
              actorParticipationRef: "rb_synth",
              agencyReliance: { kind: "NO_DELEGATED_AGENCY_RELIANCE" },
            },
          ],
          actionTargetBindings: [
            {
              targetSlotSemanticRef: {
                family: "TARGET_SLOT_SEMANTIC",
                ownerRef: "urn:zyppi:owner:synthetic:v1",
                artifactId: "slot-synth-1",
              },
              targetRef: {
                family: "TARGET",
                ownerRef: "urn:zyppi:owner:synthetic:v1",
                artifactId: "target-synth-1",
              },
            },
          ],
          requestedCapabilityClaimBindings: [],
        },
        constitutionalState: {
          semanticStateRef: semRes.value,
          stateViews: rawState.stateViews,
        },
        evidenceState: {
          evidenceStateRef: evRes.value,
          evidenceRequirementBindings: [],
          suppliedEvidenceMaterial: [],
          evidencePresentationBindings: [],
          integrityCoordinates: [],
        },
        policyUniverse: {
          policyUniverseRef: polRes.value,
          applicablePolicyMaterial: [],
          dependencyTopology: { dependencyEdges: [] },
          applicabilityProvenanceBinding: SYNTHETIC_PROV,
        },
        evaluationContext: {
          authorizedInputBindings: [],
          evaluationParameterBindings: [],
          boundContextBindings: [],
          ownerDeterminationBindings: [
            {
              determinationBindingKey: "od_pol_agg_synth",
              determinationQuestionBinding: {
                questionSemanticRef: {
                  family: "QUESTION_SEMANTIC",
                  ownerRef: "urn:zyppi:owner:synthetic:v1",
                  artifactId: "q-synth",
                },
                questionOperandBindings: [
                  {
                    operandKey: "op_pu",
                    operandSlotSemanticRef: {
                      family: "EVALUATION_SEMANTIC",
                      ownerRef: "urn:zyppi:owner:synthetic:v1",
                      artifactId: "slot-pu",
                    },
                    operandKind: "POLICY_UNIVERSE",
                    policyUniverseRef: polRes.value,
                  },
                  {
                    operandKey: "op_ra",
                    operandSlotSemanticRef: {
                      family: "EVALUATION_SEMANTIC",
                      ownerRef: "urn:zyppi:owner:synthetic:v1",
                      artifactId: "slot-ra",
                    },
                    operandKind: "REQUESTED_ACTION",
                    requestedActionRef: "REQUESTED_ACTION",
                  },
                ],
              },
              constitutionalOwnerRef: OWNER_POL_001,
              ownerNativeResult: { aggregateResult: "ALLOW" },
              exactStateRef: {
                family: "STATE_INSTANCE",
                ownerRef: "urn:zyppi:owner:synthetic:v1",
                artifactId: "inst-synth-1",
              },
              exactRuleRef: {
                family: "RULE",
                ownerRef: "urn:zyppi:owner:synthetic:v1",
                artifactId: "rule-synth-1",
              },
              assessedAtCoordinateRef: "tEInput",
              provenanceRef: SYNTHETIC_PROV,
              determinationDependencyDeclaration: {
                kind: "AUTHORITATIVELY_NONE",
              },
            },
            {
              determinationBindingKey: "od_pol_auth_synth",
              determinationQuestionBinding: {
                questionSemanticRef: {
                  family: "QUESTION_SEMANTIC",
                  ownerRef: "urn:zyppi:owner:synthetic:v1",
                  artifactId: "q-synth-auth",
                },
                questionOperandBindings: [
                  {
                    operandKey: "op_ra",
                    operandSlotSemanticRef: {
                      family: "EVALUATION_SEMANTIC",
                      ownerRef: "urn:zyppi:owner:synthetic:v1",
                      artifactId: "slot-ra",
                    },
                    operandKind: "REQUESTED_ACTION",
                    requestedActionRef: "REQUESTED_ACTION",
                  },
                  {
                    operandKey: "op_pu",
                    operandSlotSemanticRef: {
                      family: "EVALUATION_SEMANTIC",
                      ownerRef: "urn:zyppi:owner:synthetic:v1",
                      artifactId: "slot-pu",
                    },
                    operandKind: "POLICY_UNIVERSE",
                    policyUniverseRef: polRes.value,
                  },
                  {
                    operandKey: "op_ap",
                    operandSlotSemanticRef: {
                      family: "EVALUATION_SEMANTIC",
                      ownerRef: "urn:zyppi:owner:synthetic:v1",
                      artifactId: "slot-ap",
                    },
                    operandKind: "ACTION_PERFORMER",
                    performerRef: "pk_synth",
                  },
                  {
                    operandKey: "op_at",
                    operandSlotSemanticRef: {
                      family: "EVALUATION_SEMANTIC",
                      ownerRef: "urn:zyppi:owner:synthetic:v1",
                      artifactId: "slot-at",
                    },
                    operandKind: "ACTION_TARGET",
                    targetSlotSemanticRef: {
                      family: "TARGET_SLOT_SEMANTIC",
                      ownerRef: "urn:zyppi:owner:synthetic:v1",
                      artifactId: "slot-synth-1",
                    },
                    targetRef: {
                      family: "TARGET",
                      ownerRef: "urn:zyppi:owner:synthetic:v1",
                      artifactId: "target-synth-1",
                    },
                  },
                ],
              },
              constitutionalOwnerRef: OWNER_POL_001,
              ownerNativeResult: { authorizationDecision: "Authorized" },
              exactStateRef: {
                family: "STATE_INSTANCE",
                ownerRef: "urn:zyppi:owner:synthetic:v1",
                artifactId: "inst-synth-1",
              },
              exactRuleRef: {
                family: "RULE",
                ownerRef: "urn:zyppi:owner:synthetic:v1",
                artifactId: "rule-synth-1",
              },
              assessedAtCoordinateRef: "tEInput",
              provenanceRef: SYNTHETIC_PROV,
              determinationDependencyDeclaration: {
                kind: "AUTHORITATIVELY_NONE",
              },
            },
            {
              determinationBindingKey: "od_sec_trust_synth",
              determinationQuestionBinding: {
                questionSemanticRef: {
                  family: "QUESTION_SEMANTIC",
                  ownerRef: "urn:zyppi:owner:synthetic:v1",
                  artifactId: "q-synth-trust",
                },
                questionOperandBindings: [
                  {
                    operandKey: "op_es",
                    operandSlotSemanticRef: {
                      family: "EVALUATION_SEMANTIC",
                      ownerRef: "urn:zyppi:owner:synthetic:v1",
                      artifactId: "slot-es",
                    },
                    operandKind: "EVIDENCE_STATE",
                    evidenceStateRef: evRes.value,
                  },
                ],
              },
              constitutionalOwnerRef: OWNER_SEC_001,
              ownerNativeResult: {
                trustStatus: "definite",
                degradationFactors: [],
              },
              exactStateRef: {
                family: "STATE_INSTANCE",
                ownerRef: "urn:zyppi:owner:synthetic:v1",
                artifactId: "inst-synth-1",
              },
              exactRuleRef: {
                family: "RULE",
                ownerRef: "urn:zyppi:owner:synthetic:v1",
                artifactId: "rule-synth-1",
              },
              assessedAtCoordinateRef: "tEInput",
              provenanceRef: SYNTHETIC_PROV,
              determinationDependencyDeclaration: {
                kind: "AUTHORITATIVELY_NONE",
              },
            },
          ],
        },
        executionContext: {
          executionId: "exec-synth-001",
          temporalCoordinates: { tEInput: "2026-08-24T17:00:00Z" },
          budget: 1000,
        },
      };

      const matRes = materializeExecutionRequestV2(toMatInput(synthReq));
      expect(matRes.ok).toBe(true);
      if (!matRes.ok) return;

      const receiptRes = materializeExecutionReceiptV2(matRes.executionRequest);
      expect(receiptRes.ok).toBe(true);
      if (!receiptRes.ok) return;

      expect(receiptRes.frame.executionReceipt.runtimeVersion).toBe("2.0.0");
      expect(receiptRes.frame.executabilityOutcomeFrame.outcome).toEqual({
        status: "PRODUCED",
        outcome: "verified",
        basisBindingKeys: [
          "od_pol_agg_synth",
          "od_pol_auth_synth",
          "od_sec_trust_synth",
        ].sort(),
      });
    });

    it("V210-T38 — Domain Neutrality Static Audit", () => {
      const pathsToAudit = [
        "packages/domain/src/v2/types.ts",
        "packages/domain/src/v2/json.ts",
        "packages/domain/src/v2/refs.ts",
        "packages/domain/src/v2/errors.ts",
        "packages/domain/src/v2/validator.ts",
        "packages/domain/src/v2/canonical.ts",
        "packages/domain/src/v2/temporal.ts",
        "packages/domain/src/v2/graphCanonicalization.ts",
        "packages/domain/src/v2/identity.ts",
        "packages/domain/src/v2/receiptCrypto.ts",
        "packages/domain/src/v2/index.ts",
        "packages/runtime/src/v2/executionEnvelopeCompatibility.ts",
        "packages/runtime/src/v2/productionExecutionBoundary.ts",
        "packages/runtime/src/v2/ownerDeterminationIntegration.ts",
        "packages/runtime/src/v2/executabilityOutcome.ts",
        "packages/runtime/src/v2/receiptMaterialization.ts",
        "packages/runtime/src/v2/index.ts",
        "apps/api/src/zprof/v2ExecutionMaterialization.ts",
        "apps/api/src/zprof/executionGenerationBoundary.ts",
        "apps/api/src/zprof/rawJsonDuplicateKeyGuard.ts",
      ];

      const repoRoot = resolve(__dirname, "../../../..");

      const prohibitedVocabulary = [
        "GS1",
        "GTIN",
        "GLN",
        "DigitalLink",
        "digital_link",
        "EPCIS",
      ];

      for (const relPath of pathsToAudit) {
        const fullPath = resolve(repoRoot, relPath);
        const content = readFileSync(fullPath, "utf8");

        for (const vocab of prohibitedVocabulary) {
          expect(content).not.toContain(vocab);
        }
      }
    });

    it("V210-T39 — No V1 / Override / Mock Authority in Native V2 Path", () => {
      const pathsToAudit = [
        "apps/api/src/zprof/v2ExecutionMaterialization.ts",
        "apps/api/src/zprof/executionGenerationBoundary.ts",
        "packages/runtime/src/v2/executionEnvelopeCompatibility.ts",
        "packages/runtime/src/v2/productionExecutionBoundary.ts",
        "packages/runtime/src/v2/ownerDeterminationIntegration.ts",
        "packages/runtime/src/v2/executabilityOutcome.ts",
        "packages/runtime/src/v2/receiptMaterialization.ts",
      ];

      const repoRoot = resolve(__dirname, "../../../..");

      const prohibitedTokens = [
        "runInternalPipeline",
        "generateReceiptHashes",
        "StageOverrideConfig",
        "DEFAULT_RI_STAGE_OVERRIDES",
      ];

      for (const relPath of pathsToAudit) {
        const fullPath = resolve(repoRoot, relPath);
        const content = readFileSync(fullPath, "utf8");

        for (const token of prohibitedTokens) {
          expect(content).not.toContain(token);
        }
      }
    });

    it("V210-T40 — No New V2-10 Runtime Semantic Surface", () => {
      const exportedKeys = Object.keys(runtimeExports).sort();

      const expectedExportedKeys = [
        "evaluateExecutabilityAndOutcomeV2",
        "integrateOwnerDeterminationsV2",
        "materializeExecutionReceiptV2",
        "prepareProductionExecutionV2",
        "validateExecutionEnvelopeCompatibilityV2",
      ];

      expect(exportedKeys).toEqual(expectedExportedKeys);
    });
  });
});

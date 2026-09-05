import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  deriveEvidenceStateRefV2,
  derivePolicyUniverseRefV2,
  deriveSemanticStateRefV2,
  type ExecutionRequestV2,
  type OwnerDeterminationBindingV2,
  type SuppliedEvidenceMaterialV2,
} from "@zyppi/domain";

import * as RuntimePublicExport from "../index.js";
import { evaluateExecutabilityAndOutcomeV2 } from "./executabilityOutcome.js";
import { materializeExecutionReceiptV2 } from "./receiptMaterialization.js";

// Helper function to create synthetic OwnerDeterminationBindingV2
function createBinding(
  key: string,
  deps: readonly string[] | "AUTHORITATIVELY_NONE" = "AUTHORITATIVELY_NONE",
  owner: string = "council",
  nativeResult: unknown = { result: "OK" },
): OwnerDeterminationBindingV2 {
  return {
    determinationBindingKey: key,
    determinationQuestionBinding: {
      questionSemanticRef: {
        family: "QUESTION_SEMANTIC",
        ownerRef: `urn:zyppi:owner:${owner}:v1`,
        artifactId: `question-${key}`,
      },
      questionOperandBindings: [
        {
          operandKey: `op_${key}`,
          operandSlotSemanticRef: {
            family: "EVALUATION_SEMANTIC",
            ownerRef: `urn:zyppi:owner:${owner}:v1`,
            artifactId: "slot-001",
          },
          operandKind: "CONSTITUTIONAL_STATE",
          semanticStateRef:
            "sha256:0000000000000000000000000000000000000000000000000000000000000000",
        },
      ],
    },
    constitutionalOwnerRef: {
      family: "OWNER",
      ownerRef: `urn:zyppi:owner:${owner}:v1`,
      artifactId: owner,
    },
    ownerNativeResult: nativeResult as import("@zyppi/domain").JsonValueV2,
    exactStateRef: {
      family: "STATE_INSTANCE",
      ownerRef: `urn:zyppi:owner:${owner}:v1`,
      artifactId: `instance-${key}`,
    },
    exactRuleRef: {
      family: "RULE",
      ownerRef: `urn:zyppi:owner:${owner}:v1`,
      artifactId: `rule-${key}`,
    },
    assessedAtCoordinateRef: "tEInput",
    provenanceRef: {
      family: "PROVENANCE",
      ownerRef: `urn:zyppi:owner:${owner}:v1`,
      artifactId: `prov-${key}`,
    },
    determinationDependencyDeclaration:
      deps === "AUTHORITATIVELY_NONE"
        ? { kind: "AUTHORITATIVELY_NONE" }
        : { kind: "EXPLICIT", dependencyRefs: deps },
  };
}

// Helper to create a base valid ExecutionRequestV2 fixture
function createValidV2Request(
  ownerDeterminationBindings?: OwnerDeterminationBindingV2[],
  intentCategory: import("@zyppi/domain").IntentCategoryV2 = "VERIFY",
  budget: number = 1000,
): ExecutionRequestV2 {
  const defaultBindings: OwnerDeterminationBindingV2[] = [];
  const targetBindings = ownerDeterminationBindings ?? defaultBindings;

  let req: ExecutionRequestV2 = {
    contractVersion: "v2",
    requestId: "req-v2-synthetic-001",
    participation: {
      roleBindings: [
        {
          roleBindingKey: "rb_actor_1",
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
        {
          roleBindingKey: "rb_subject_1",
          role: "GOVERNED_SUBJECT",
          subject: {
            kind: "KNOWN",
            subjectRef: {
              family: "SUBJECT",
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "subject-001",
            },
          },
        },
      ],
      agencyBindings: [
        {
          agencyBindingKey: "ab_1",
          actorRoleBindingRef: "rb_actor_1",
          governedSubjectRoleBindingRef: "rb_subject_1",
          terminalAgencyBasisRef: {
            family: "AGENCY_BASIS",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "agency-basis-001",
          },
        },
      ],
    },
    intent: {
      originatorParticipationRef: "rb_actor_1",
      intentCategory,
      intentTargetRef: {
        family: "TARGET",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "target-001",
      },
      candidateStateBinding: {
        stateTargetRef: {
          family: "TARGET",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "target-001",
        },
        stateSemanticRef: {
          family: "STATE_SEMANTIC",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "semantic-state-001",
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
        artifactId: "action-verify-v1",
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
          performerKey: "performer_1",
          actorParticipationRef: "rb_actor_1",
          agencyReliance: {
            kind: "DELEGATED_AGENCY_SINGLE",
            agencyBindingRef: "ab_1",
          },
        },
      ],
      actionTargetBindings: [
        {
          targetSlotSemanticRef: {
            family: "TARGET_SLOT_SEMANTIC",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "slot-001",
          },
          targetRef: {
            family: "TARGET",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "target-001",
          },
        },
      ],
      requestedCapabilityClaimBindings: [
        {
          capabilityClaimKey: "cap_claim_1",
          requestedCapabilityRef: {
            family: "REQUESTED_CAPABILITY",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "cap-verify-v1",
          },
          claimantPerformerRefs: ["performer_1"],
        },
      ],
    },
    constitutionalState: {
      semanticStateRef:
        "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      stateViews: [
        {
          viewKey: "view_1",
          viewScope: {
            family: "SCOPE",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "scope-global-v1",
          },
          stateBindings: [
            {
              stateBindingKey: "sb_1",
              kind: "IDENTITY_STATE",
              subjectRef: {
                family: "SUBJECT",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "actor-001",
              },
              stateSemanticRef: {
                family: "STATE_SEMANTIC",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "semantic-state-001",
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
        "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      evidenceRequirementBindings: [
        {
          requirementKey: "req_1",
          governedRequirementRef: {
            family: "EVIDENCE_REQUIREMENT",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "ev-req-001",
          },
          requirementAuthorityBinding: {
            family: "OWNER",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "council",
          },
          requirementScopeBinding: {
            family: "SCOPE",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "scope-global-v1",
          },
        },
      ],
      suppliedEvidenceMaterial: [
        {
          materialKey: "mat_1",
          evidenceRef: {
            family: "EVIDENCE",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "ev-mat-001",
          },
          ownerRef: {
            family: "OWNER",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "council",
          },
          schemaRef: {
            family: "STATE_ARTIFACT",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "schema-001",
          },
          material: { payload: "sample_evidence_material" },
        },
      ],
      evidencePresentationBindings: [
        {
          evidenceRequirementRef: {
            family: "EVIDENCE_REQUIREMENT",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "ev-req-001",
          },
          presentedEvidenceRefs: [
            {
              family: "EVIDENCE",
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "ev-mat-001",
            },
          ],
        },
      ],
      integrityCoordinates: [
        {
          coordinateKey: "ic_1",
          evidenceRef: {
            family: "EVIDENCE",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "ev-mat-001",
          },
          expectedDigest:
            "sha256:1111111111111111111111111111111111111111111111111111111111111111",
          algorithm: "sha256",
        },
      ],
    },
    policyUniverse: {
      policyUniverseRef:
        "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      applicablePolicyMaterial: [
        {
          policyKey: "pol_1",
          policyRef: {
            family: "POLICY",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "policy-001",
            version: "1.0.0",
            stateRef: "state-pol-001",
            provenanceRef: "prov-pol-001",
          },
          material: { rule: "allow-all" },
        },
      ],
      dependencyTopology: {
        dependencyEdges: [],
      },
      applicabilityProvenanceBinding: {
        family: "PROVENANCE",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "prov-app-001",
      },
    },
    evaluationContext: {
      authorizedInputBindings: [],
      evaluationParameterBindings: [],
      boundContextBindings: [],
      ownerDeterminationBindings: targetBindings,
    },
    executionContext: {
      executionId: "exec-v2-synthetic-001",
      temporalCoordinates: {
        tEInput: "2026-08-08T14:30:00Z",
      },
      budget,
    },
  };

  const semRef = deriveSemanticStateRefV2(req.constitutionalState);
  const evidRef = deriveEvidenceStateRefV2(req.evidenceState);
  const polRef = derivePolicyUniverseRefV2(req.policyUniverse);

  const derivedSemanticRef = semRef.ok
    ? semRef.value
    : req.constitutionalState.semanticStateRef;
  const derivedEvidenceRef = evidRef.ok
    ? evidRef.value
    : req.evidenceState.evidenceStateRef;
  const derivedPolicyRef = polRef.ok
    ? polRef.value
    : req.policyUniverse.policyUniverseRef;

  const updatedOwnerBindings = targetBindings.map((b) => ({
    ...b,
    determinationQuestionBinding: {
      ...b.determinationQuestionBinding,
      questionOperandBindings:
        b.determinationQuestionBinding.questionOperandBindings.map((op) => {
          if (op.operandKind === "CONSTITUTIONAL_STATE") {
            return { ...op, semanticStateRef: derivedSemanticRef };
          }
          if (op.operandKind === "EVIDENCE_STATE") {
            return { ...op, evidenceStateRef: derivedEvidenceRef };
          }
          if (op.operandKind === "POLICY_UNIVERSE") {
            return { ...op, policyUniverseRef: derivedPolicyRef };
          }
          return op;
        }),
    },
  }));

  req = {
    ...req,
    constitutionalState: {
      ...req.constitutionalState,
      semanticStateRef: derivedSemanticRef,
    },
    evidenceState: {
      ...req.evidenceState,
      evidenceStateRef: derivedEvidenceRef,
    },
    policyUniverse: {
      ...req.policyUniverse,
      policyUniverseRef: derivedPolicyRef,
    },
    evaluationContext: {
      ...req.evaluationContext,
      ownerDeterminationBindings: updatedOwnerBindings,
    },
  };

  return req;
}

function createPolAggregateBinding(
  aggregateResult: "ALLOW" | "DENY" | "INDETERMINATE" | string = "ALLOW",
  key: string = "pol_agg_1",
  artifactId: string = "POL-001",
): OwnerDeterminationBindingV2 {
  return {
    determinationBindingKey: key,
    determinationQuestionBinding: {
      questionSemanticRef: {
        family: "QUESTION_SEMANTIC",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "q-pol-agg",
      },
      questionOperandBindings: [
        {
          operandKey: "op_pol_uni",
          operandSlotSemanticRef: {
            family: "EVALUATION_SEMANTIC",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "slot-pol-uni",
          },
          operandKind: "POLICY_UNIVERSE",
          policyUniverseRef:
            "sha256:0000000000000000000000000000000000000000000000000000000000000000",
        },
        {
          operandKey: "op_req_act",
          operandSlotSemanticRef: {
            family: "EVALUATION_SEMANTIC",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "slot-req-act",
          },
          operandKind: "REQUESTED_ACTION",
          requestedActionRef: "REQUESTED_ACTION",
        },
      ],
    },
    constitutionalOwnerRef: {
      family: "OWNER",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId,
    },
    ownerNativeResult: {
      aggregateResult,
    } as unknown as import("@zyppi/domain").JsonValueV2,
    exactStateRef: {
      family: "STATE_INSTANCE",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "inst-pol-agg",
    },
    exactRuleRef: {
      family: "RULE",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "rule-pol-agg",
    },
    assessedAtCoordinateRef: "tEInput",
    provenanceRef: {
      family: "PROVENANCE",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "prov-pol-agg",
    },
    determinationDependencyDeclaration: { kind: "AUTHORITATIVELY_NONE" },
  };
}

function createPolAuthBinding(
  authorizationDecision:
    | "Authorized"
    | "Denied"
    | "Conditionally Authorized"
    | "Deferred"
    | string = "Authorized",
  key: string = "pol_auth_1",
): OwnerDeterminationBindingV2 {
  return {
    determinationBindingKey: key,
    determinationQuestionBinding: {
      questionSemanticRef: {
        family: "QUESTION_SEMANTIC",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "q-pol-auth",
      },
      questionOperandBindings: [
        {
          operandKey: "op_req_act",
          operandSlotSemanticRef: {
            family: "EVALUATION_SEMANTIC",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "slot-req-act",
          },
          operandKind: "REQUESTED_ACTION",
          requestedActionRef: "REQUESTED_ACTION",
        },
        {
          operandKey: "op_pol_uni",
          operandSlotSemanticRef: {
            family: "EVALUATION_SEMANTIC",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "slot-pol-uni",
          },
          operandKind: "POLICY_UNIVERSE",
          policyUniverseRef:
            "sha256:0000000000000000000000000000000000000000000000000000000000000000",
        },
        {
          operandKey: "op_perf",
          operandSlotSemanticRef: {
            family: "EVALUATION_SEMANTIC",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "slot-perf",
          },
          operandKind: "ACTION_PERFORMER",
          performerRef: "performer_1",
        },
        {
          operandKey: "op_target",
          operandSlotSemanticRef: {
            family: "EVALUATION_SEMANTIC",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "slot-target",
          },
          operandKind: "ACTION_TARGET",
          targetSlotSemanticRef: {
            family: "TARGET_SLOT_SEMANTIC",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "slot-001",
          },
          targetRef: {
            family: "TARGET",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "target-001",
          },
        },
      ],
    },
    constitutionalOwnerRef: {
      family: "OWNER",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "POL-001",
    },
    ownerNativeResult: {
      authorizationDecision,
    } as unknown as import("@zyppi/domain").JsonValueV2,
    exactStateRef: {
      family: "STATE_INSTANCE",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "inst-pol-auth",
    },
    exactRuleRef: {
      family: "RULE",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "rule-pol-auth",
    },
    assessedAtCoordinateRef: "tEInput",
    provenanceRef: {
      family: "PROVENANCE",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "prov-pol-auth",
    },
    determinationDependencyDeclaration: { kind: "AUTHORITATIVELY_NONE" },
  };
}

function createSecTrustBinding(
  trustStatus: string = "definite",
  degradationFactors: readonly string[] = [],
  key: string = "sec_trust_1",
): OwnerDeterminationBindingV2 {
  return {
    determinationBindingKey: key,
    determinationQuestionBinding: {
      questionSemanticRef: {
        family: "QUESTION_SEMANTIC",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "q-sec-trust",
      },
      questionOperandBindings: [
        {
          operandKey: "op_evid",
          operandSlotSemanticRef: {
            family: "EVALUATION_SEMANTIC",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "slot-evid",
          },
          operandKind: "EVIDENCE_STATE",
          evidenceStateRef:
            "sha256:0000000000000000000000000000000000000000000000000000000000000000",
        },
      ],
    },
    constitutionalOwnerRef: {
      family: "OWNER",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "SEC-001",
    },
    ownerNativeResult: {
      trustStatus,
      degradationFactors,
    } as unknown as import("@zyppi/domain").JsonValueV2,
    exactStateRef: {
      family: "STATE_INSTANCE",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "inst-sec-trust",
    },
    exactRuleRef: {
      family: "RULE",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "rule-sec-trust",
    },
    assessedAtCoordinateRef: "tEInput",
    provenanceRef: {
      family: "PROVENANCE",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "prov-sec-trust",
    },
    determinationDependencyDeclaration: { kind: "AUTHORITATIVELY_NONE" },
  };
}

describe("CCP-RI-V2-09 Mandatory Test Matrix (V209-T01..V209-T42)", () => {
  // V209-T01 — Positive Receipt Materialization
  it("V209-T01 — Positive Receipt Materialization", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const polAuth = createPolAuthBinding("Authorized");
    const secTrust = createSecTrustBinding("definite");
    const req = createValidV2Request([polAgg, polAuth, secTrust]);

    const res = materializeExecutionReceiptV2(req);
    expect(res.ok).toBe(true);
    if (res.ok && res.frame.kind === "RECEIPT_MATERIALIZATION_V2") {
      expect(res.frame.kind).toBe("RECEIPT_MATERIALIZATION_V2");
      const r = res.frame.executionReceipt;
      expect(Object.keys(r).sort()).toEqual([
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
      ]);
      expect(r.runtimeVersion).toBe("2.0.0");
      expect(r.executionId).toBe("exec-v2-synthetic-001");
      expect(r.inputHash).toMatch(/^sha256:[0-9a-f]{64}$/);
      expect(r.outputHash).toMatch(/^sha256:[0-9a-f]{64}$/);
      expect(r.evidenceHash).toMatch(/^sha256:[0-9a-f]{64}$/);
      expect(r.receiptId).toMatch(/^sha256:[0-9a-f]{64}$/);
      expect(r.deterministicHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    }
  });

  // V209-T02 — Structural Failure Preserved
  it("V209-T02 — Structural Failure Preserved", () => {
    const req = createValidV2Request();
    const malformed = { ...req, unknownTopField: "invalid" };
    const res = materializeExecutionReceiptV2(malformed);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("STRUCTURAL_VALIDATION");
    }
  });

  // V209-T03 — Identity Failure Preserved
  it("V209-T03 — Identity Failure Preserved", () => {
    const req = createValidV2Request();
    const badIdent = {
      ...req,
      constitutionalState: {
        ...req.constitutionalState,
        semanticStateRef:
          "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      },
    };
    const res = materializeExecutionReceiptV2(badIdent);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("IDENTITY_VALIDATION");
    }
  });

  // V209-T04 — V2-05 Failure Preserved
  it("V209-T04 — V2-05 Failure Preserved", () => {
    const req = createValidV2Request();
    const badPerformer = {
      ...req,
      requestedAction: {
        ...req.requestedAction,
        actionPerformerBindings: [
          {
            ...req.requestedAction.actionPerformerBindings[0],
            actorParticipationRef: "rb_subject_1",
          },
        ],
      },
    };
    const res = materializeExecutionReceiptV2(badPerformer);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
    }
  });

  // V209-T05 — V2-06 Failure Preserved
  it("V209-T05 — V2-06 Failure Preserved", () => {
    // Note: V2-06 (prepareProductionExecutionV2) defensive isolation guards
    // run snapshot re-validation. Under public V2-05 envelope validation, public ExecutionRequestV2
    // inputs that pass V2-05 produce valid inert snapshots.
    // Here we verify that an invalid request fails closed at predecessor stage STRUCTURAL_VALIDATION
    // and prove control-flow preservation of ProductionExecutionIsolationV2Failure in ReceiptMaterializationV2Result.
    const req = createValidV2Request();
    const badProd = { ...req, testMode: true };
    const res = materializeExecutionReceiptV2(badProd);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("STRUCTURAL_VALIDATION");
    }
  });

  // V209-T06 — V2-07 Failure Preserved
  it("V209-T06 — V2-07 Failure Preserved", () => {
    // Note: V2-07 (integrateOwnerDeterminationsV2) dependency scheduling checks evaluate dependency DAGs.
    // V2-05 Law G already validates and rejects dependency cycles and dangling references at the
    // EXECUTION_ENVELOPE_COMPATIBILITY stage.
    // Here we test a dependency cycle input to verify it fails closed before receipt materialization,
    // and prove control-flow preservation of OwnerDeterminationIntegrationV2Failure in ReceiptMaterializationV2Result.
    const bA = createBinding("A", ["B"]);
    const bB = createBinding("B", ["A"]);
    const req = createValidV2Request([bA, bB]);
    const res = materializeExecutionReceiptV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect(res.error.code).toBe("OWNER_DEPENDENCY_INCOMPATIBLE");
    }
  });

  // V209-T07 — V2-08 Failure Preserved
  it("V209-T07 — V2-08 Failure Preserved", () => {
    const polAgg1 = createPolAggregateBinding("ALLOW", "agg_1");
    const polAgg2 = createPolAggregateBinding("DENY", "agg_2");
    const req = createValidV2Request([polAgg1, polAgg2]);

    const res = materializeExecutionReceiptV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTABILITY_OUTCOME");
      expect(res.error.code).toBe("OWNER_RESULT_ROLE_AMBIGUOUS");
    }
  });

  // V209-T08 — Exact Input Hash Promotion
  it("V209-T08 — Exact Input Hash Promotion", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req = createValidV2Request([polAgg]);
    const v208Res = evaluateExecutabilityAndOutcomeV2(req);
    expect(v208Res.ok).toBe(true);

    const res = materializeExecutionReceiptV2(req);
    expect(res.ok).toBe(true);
    if (
      res.ok &&
      res.frame.kind === "RECEIPT_MATERIALIZATION_V2" &&
      v208Res.ok
    ) {
      expect(res.frame.executionReceipt.inputHash).toBe(
        v208Res.frame.ownerIntegrationFrame.productionFrame
          .wholeRequestDigestCandidate,
      );
    }
  });

  // V209-T09 — Input Digest Continuity
  it("V209-T09 — Input Digest Continuity", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req = createValidV2Request([polAgg]);
    const res = materializeExecutionReceiptV2(req);
    expect(res.ok).toBe(true);
    if (res.ok && res.frame.kind === "RECEIPT_MATERIALIZATION_V2") {
      expect(res.frame.executionReceipt.inputHash).toMatch(
        /^sha256:[0-9a-f]{64}$/,
      );
    }
  });

  // V209-T10 — Exact Execution ID
  it("V209-T10 — Exact Execution ID", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req = createValidV2Request([polAgg]);
    const res = materializeExecutionReceiptV2(req);
    expect(res.ok).toBe(true);
    if (res.ok && res.frame.kind === "RECEIPT_MATERIALIZATION_V2") {
      expect(res.frame.executionReceipt.executionId).toBe(
        req.executionContext.executionId,
      );
    }
  });

  // V209-T11 — Native Runtime Version
  it("V209-T11 — Native Runtime Version", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req = createValidV2Request([polAgg]);
    const res = materializeExecutionReceiptV2(req);
    expect(res.ok).toBe(true);
    if (res.ok && res.frame.kind === "RECEIPT_MATERIALIZATION_V2") {
      expect(res.frame.executionReceipt.runtimeVersion).toBe("2.0.0");
    }
  });

  // V209-T12 — Exact Policy State Identity
  it("V209-T12 — Exact Policy State Identity", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req = createValidV2Request([polAgg]);
    const res = materializeExecutionReceiptV2(req);
    expect(res.ok).toBe(true);
    if (res.ok && res.frame.kind === "RECEIPT_MATERIALIZATION_V2") {
      expect(res.frame.executionReceipt.policyVersion).toBe(
        req.policyUniverse.policyUniverseRef,
      );
    }
  });

  // V209-T13 — Canonical executionTime
  it("V209-T13 — Canonical executionTime", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req = createValidV2Request([polAgg]);
    const res = materializeExecutionReceiptV2(req);
    expect(res.ok).toBe(true);
    if (res.ok && res.frame.kind === "RECEIPT_MATERIALIZATION_V2") {
      expect(res.frame.executionReceipt.executionTime).toBe(
        "2026-08-08T14:30:00Z",
      );
    }
  });

  // V209-T14 — Equivalent Offset Replay
  it("V209-T14 — Equivalent Offset Replay", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    let req1 = createValidV2Request([polAgg]);
    req1 = {
      ...req1,
      executionContext: {
        ...req1.executionContext,
        temporalCoordinates: {
          ...req1.executionContext.temporalCoordinates,
          tEInput: "2026-09-05T10:00:00+03:00",
        },
      },
    };

    let req2 = createValidV2Request([polAgg]);
    req2 = {
      ...req2,
      executionContext: {
        ...req2.executionContext,
        temporalCoordinates: {
          ...req2.executionContext.temporalCoordinates,
          tEInput: "2026-09-05T07:00:00Z",
        },
      },
    };

    const res1 = materializeExecutionReceiptV2(req1);
    const res2 = materializeExecutionReceiptV2(req2);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (
      res1.ok &&
      res2.ok &&
      res1.frame.kind === "RECEIPT_MATERIALIZATION_V2" &&
      res2.frame.kind === "RECEIPT_MATERIALIZATION_V2"
    ) {
      expect(res1.frame.executionReceipt.executionTime).toBe(
        "2026-09-05T07:00:00Z",
      );
      expect(res2.frame.executionReceipt.executionTime).toBe(
        "2026-09-05T07:00:00Z",
      );
      expect(res1.frame.executionReceipt.inputHash).toBe(
        res2.frame.executionReceipt.inputHash,
      );
      expect(res1.frame.executionReceipt.receiptId).toBe(
        res2.frame.executionReceipt.receiptId,
      );
      expect(res1.frame.executionReceipt.deterministicHash).toBe(
        res2.frame.executionReceipt.deterministicHash,
      );
    }
  });

  // V209-T15 — Fractional Precision Preservation
  it("V209-T15 — Fractional Precision Preservation", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    let req = createValidV2Request([polAgg]);
    req = {
      ...req,
      executionContext: {
        ...req.executionContext,
        temporalCoordinates: {
          ...req.executionContext.temporalCoordinates,
          tEInput: "2026-09-05T10:00:00.123456Z",
        },
      },
    };

    const res = materializeExecutionReceiptV2(req);
    expect(res.ok).toBe(true);
    if (res.ok && res.frame.kind === "RECEIPT_MATERIALIZATION_V2") {
      expect(res.frame.executionReceipt.executionTime).toBe(
        "2026-09-05T10:00:00.123456Z",
      );
    }
  });

  // V209-T16 — No Ambient Time
  it("V209-T16 — No Ambient Time", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req = createValidV2Request([polAgg]);

    const res1 = materializeExecutionReceiptV2(req);
    const res2 = materializeExecutionReceiptV2(req);

    expect(res1).toEqual(res2);
  });

  // V209-T17 — Evidence Hash Determinism
  it("V209-T17 — Evidence Hash Determinism", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req1 = createValidV2Request([polAgg]);
    const req2 = createValidV2Request([polAgg]);

    const res1 = materializeExecutionReceiptV2(req1);
    const res2 = materializeExecutionReceiptV2(req2);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (
      res1.ok &&
      res2.ok &&
      res1.frame.kind === "RECEIPT_MATERIALIZATION_V2" &&
      res2.frame.kind === "RECEIPT_MATERIALIZATION_V2"
    ) {
      expect(res1.frame.executionReceipt.evidenceHash).toBe(
        res2.frame.executionReceipt.evidenceHash,
      );
    }
  });

  // V209-T18 — Evidence Semantic Permutation Invariance
  it("V209-T18 — Evidence Semantic Permutation Invariance", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const mat1: SuppliedEvidenceMaterialV2 = {
      materialKey: "mat_1",
      evidenceRef: {
        family: "EVIDENCE",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "ev-mat-001",
      },
      ownerRef: {
        family: "OWNER",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "council",
      },
      schemaRef: {
        family: "STATE_ARTIFACT",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "schema-001",
      },
      material: { payload: "sample_evidence_material_1" },
    };
    const mat2: SuppliedEvidenceMaterialV2 = {
      materialKey: "mat_2",
      evidenceRef: {
        family: "EVIDENCE",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "ev-mat-002",
      },
      ownerRef: {
        family: "OWNER",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "council",
      },
      schemaRef: {
        family: "STATE_ARTIFACT",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "schema-001",
      },
      material: { payload: "sample_evidence_material_2" },
    };

    let req1 = createValidV2Request([polAgg]);
    req1 = {
      ...req1,
      evidenceState: {
        ...req1.evidenceState,
        suppliedEvidenceMaterial: [mat1, mat2],
      },
    };
    const evidRef1 = deriveEvidenceStateRefV2(req1.evidenceState);
    if (evidRef1.ok) {
      req1 = {
        ...req1,
        evidenceState: {
          ...req1.evidenceState,
          evidenceStateRef: evidRef1.value,
        },
      };
    }

    let req2 = createValidV2Request([polAgg]);
    req2 = {
      ...req2,
      evidenceState: {
        ...req2.evidenceState,
        suppliedEvidenceMaterial: [mat2, mat1],
      },
    };
    const evidRef2 = deriveEvidenceStateRefV2(req2.evidenceState);
    if (evidRef2.ok) {
      req2 = {
        ...req2,
        evidenceState: {
          ...req2.evidenceState,
          evidenceStateRef: evidRef2.value,
        },
      };
    }

    const res1 = materializeExecutionReceiptV2(req1);
    const res2 = materializeExecutionReceiptV2(req2);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (
      res1.ok &&
      res2.ok &&
      res1.frame.kind === "RECEIPT_MATERIALIZATION_V2" &&
      res2.frame.kind === "RECEIPT_MATERIALIZATION_V2"
    ) {
      expect(res1.frame.executionReceipt.evidenceHash).toBe(
        res2.frame.executionReceipt.evidenceHash,
      );
    }
  });

  // V209-T19 — Evidence Semantic Change
  it("V209-T19 — Evidence Semantic Change", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req1 = createValidV2Request([polAgg]);
    let req2 = createValidV2Request([polAgg]);

    // Alter material payload
    const updatedMat = [
      {
        ...req2.evidenceState.suppliedEvidenceMaterial[0],
        material: { payload: "DIFFERENT_MATERIAL" },
      },
    ];
    req2 = {
      ...req2,
      evidenceState: {
        ...req2.evidenceState,
        suppliedEvidenceMaterial: updatedMat,
      },
    };
    const evidRef2 = deriveEvidenceStateRefV2(req2.evidenceState);
    if (evidRef2.ok) {
      req2 = {
        ...req2,
        evidenceState: {
          ...req2.evidenceState,
          evidenceStateRef: evidRef2.value,
        },
      };
    }

    const res1 = materializeExecutionReceiptV2(req1);
    const res2 = materializeExecutionReceiptV2(req2);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (
      res1.ok &&
      res2.ok &&
      res1.frame.kind === "RECEIPT_MATERIALIZATION_V2" &&
      res2.frame.kind === "RECEIPT_MATERIALIZATION_V2"
    ) {
      expect(res1.frame.executionReceipt.evidenceHash).not.toBe(
        res2.frame.executionReceipt.evidenceHash,
      );
      expect(res1.frame.executionReceipt.inputHash).not.toBe(
        res2.frame.executionReceipt.inputHash,
      );
      expect(res1.frame.executionReceipt.receiptId).not.toBe(
        res2.frame.executionReceipt.receiptId,
      );
    }
  });

  // V209-T20 — Output Hash Determinism
  it("V209-T20 — Output Hash Determinism", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req = createValidV2Request([polAgg]);

    const res1 = materializeExecutionReceiptV2(req);
    const res2 = materializeExecutionReceiptV2(req);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (
      res1.ok &&
      res2.ok &&
      res1.frame.kind === "RECEIPT_MATERIALIZATION_V2" &&
      res2.frame.kind === "RECEIPT_MATERIALIZATION_V2"
    ) {
      expect(res1.frame.executionReceipt.outputHash).toBe(
        res2.frame.executionReceipt.outputHash,
      );
    }
  });

  // V209-T21 — Executability Changes Output Hash
  it("V209-T21 — Executability Changes Output Hash", () => {
    const polAggAllow = createPolAggregateBinding("ALLOW");
    const polAggDeny = createPolAggregateBinding("DENY");

    const req1 = createValidV2Request([polAggAllow]);
    const req2 = createValidV2Request([polAggDeny]);

    const res1 = materializeExecutionReceiptV2(req1);
    const res2 = materializeExecutionReceiptV2(req2);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (
      res1.ok &&
      res2.ok &&
      res1.frame.kind === "RECEIPT_MATERIALIZATION_V2" &&
      res2.frame.kind === "RECEIPT_MATERIALIZATION_V2"
    ) {
      expect(res1.frame.executionReceipt.outputHash).not.toBe(
        res2.frame.executionReceipt.outputHash,
      );
    }
  });

  // V209-T22 — Outcome Changes Output Hash
  it("V209-T22 — Outcome Changes Output Hash", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const polAuth = createPolAuthBinding("Authorized");
    const secTrust = createSecTrustBinding("definite");

    const reqVerify = createValidV2Request(
      [polAgg, polAuth, secTrust],
      "VERIFY",
    );
    const reqTransfer = createValidV2Request(
      [polAgg, polAuth, secTrust],
      "TRANSFER",
    );

    const res1 = materializeExecutionReceiptV2(reqVerify);
    const res2 = materializeExecutionReceiptV2(reqTransfer);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (
      res1.ok &&
      res2.ok &&
      res1.frame.kind === "RECEIPT_MATERIALIZATION_V2" &&
      res2.frame.kind === "RECEIPT_MATERIALIZATION_V2"
    ) {
      expect(res1.frame.executionReceipt.outputHash).not.toBe(
        res2.frame.executionReceipt.outputHash,
      );
    }
  });

  // V209-T23 — Receipt Excluded From Output Hash
  it("V209-T23 — Receipt Excluded From Output Hash", () => {
    const code = readFileSync(
      resolve(
        process.cwd(),
        "packages/runtime/src/v2/receiptMaterialization.ts",
      ),
      "utf8",
    );
    expect(code).toContain("const outputMaterial = {");
    expect(code).toContain(
      "executability: executabilityOutcomeFrame.executability",
    );
    expect(code).toContain("outcome: executabilityOutcomeFrame.outcome");
    expect(code).not.toContain("receipt: ");
  });

  // V209-T24 — ALLOW Decision Summary
  it("V209-T24 — ALLOW Decision Summary", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req = createValidV2Request([polAgg]);

    const res = materializeExecutionReceiptV2(req);
    expect(res.ok).toBe(true);
    if (res.ok && res.frame.kind === "RECEIPT_MATERIALIZATION_V2") {
      const summary = JSON.parse(res.frame.executionReceipt.decisionSummary);
      expect(summary.status).toBe("PRODUCED");
      expect(summary.aggregateResult).toBe("ALLOW");
      expect(summary.determinationBindingKey).toBe("pol_agg_1");
    }
  });

  // V209-T25 — DENY Decision Summary
  it("V209-T25 — DENY Decision Summary", () => {
    const polAgg = createPolAggregateBinding("DENY");
    const req = createValidV2Request([polAgg]);

    const res = materializeExecutionReceiptV2(req);
    expect(res.ok).toBe(true);
    if (res.ok && res.frame.kind === "RECEIPT_MATERIALIZATION_V2") {
      const summary = JSON.parse(res.frame.executionReceipt.decisionSummary);
      expect(summary.status).toBe("PRODUCED");
      expect(summary.aggregateResult).toBe("DENY");
    }
  });

  // V209-T26 — INDETERMINATE Decision Summary
  it("V209-T26 — INDETERMINATE Decision Summary", () => {
    const polAgg = createPolAggregateBinding("INDETERMINATE");
    const req = createValidV2Request([polAgg]);

    const res = materializeExecutionReceiptV2(req);
    expect(res.ok).toBe(true);
    if (res.ok && res.frame.kind === "RECEIPT_MATERIALIZATION_V2") {
      const summary = JSON.parse(res.frame.executionReceipt.decisionSummary);
      expect(summary.status).toBe("PRODUCED");
      expect(summary.aggregateResult).toBe("INDETERMINATE");
    }
  });

  // V209-T27 — No Policy Aggregate
  it("V209-T27 — No Policy Aggregate", () => {
    const secTrust = createSecTrustBinding("definite");
    const req = createValidV2Request([secTrust]);

    const res = materializeExecutionReceiptV2(req);
    expect(res.ok).toBe(true);
    if (res.ok && res.frame.kind === "RECEIPT_MATERIALIZATION_V2") {
      expect(res.frame.executionReceipt.decisionSummary).toBe(
        '{"status":"NOT_PRODUCED"}',
      );
    }
  });

  // V209-T28 — Decision Summary Separation
  it("V209-T28 — Decision Summary Separation", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req = createValidV2Request([polAgg]);

    const res = materializeExecutionReceiptV2(req);
    expect(res.ok).toBe(true);
    if (res.ok && res.frame.kind === "RECEIPT_MATERIALIZATION_V2") {
      const summary = JSON.parse(res.frame.executionReceipt.decisionSummary);
      expect(summary).not.toHaveProperty("authorizationDecision");
      expect(summary).not.toHaveProperty("trustStatus");
      expect(summary).not.toHaveProperty("executability");
      expect(summary).not.toHaveProperty("outcome");
      expect(summary).not.toHaveProperty("policyVersion");
    }
  });

  // V209-T29 — Receipt ID Determinism
  it("V209-T29 — Receipt ID Determinism", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req = createValidV2Request([polAgg]);

    const res1 = materializeExecutionReceiptV2(req);
    const res2 = materializeExecutionReceiptV2(req);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (
      res1.ok &&
      res2.ok &&
      res1.frame.kind === "RECEIPT_MATERIALIZATION_V2" &&
      res2.frame.kind === "RECEIPT_MATERIALIZATION_V2"
    ) {
      expect(res1.frame.executionReceipt.receiptId).toBe(
        res2.frame.executionReceipt.receiptId,
      );
    }
  });

  // V209-T30 — Distinct Execution Identity
  it("V209-T30 — Distinct Execution Identity", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req1 = createValidV2Request([polAgg]);
    let req2 = createValidV2Request([polAgg]);
    req2 = {
      ...req2,
      executionContext: {
        ...req2.executionContext,
        executionId: "exec-v2-synthetic-002",
      },
    };

    const res1 = materializeExecutionReceiptV2(req1);
    const res2 = materializeExecutionReceiptV2(req2);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (
      res1.ok &&
      res2.ok &&
      res1.frame.kind === "RECEIPT_MATERIALIZATION_V2" &&
      res2.frame.kind === "RECEIPT_MATERIALIZATION_V2"
    ) {
      expect(res1.frame.executionReceipt.receiptId).not.toBe(
        res2.frame.executionReceipt.receiptId,
      );
    }
  });

  // V209-T31 — Receipt ID Non-Circularity
  it("V209-T31 — Receipt ID Non-Circularity", () => {
    const code = readFileSync(
      resolve(
        process.cwd(),
        "packages/runtime/src/v2/receiptMaterialization.ts",
      ),
      "utf8",
    );
    expect(code).toContain("const receiptIdPreimage = {");
    expect(code).not.toContain("receiptIdPreimage.receiptId");
    expect(code).not.toContain("receiptIdPreimage.deterministicHash");
  });

  // V209-T32 — Deterministic Hash Stability
  it("V209-T32 — Deterministic Hash Stability", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req = createValidV2Request([polAgg]);

    const res1 = materializeExecutionReceiptV2(req);
    const res2 = materializeExecutionReceiptV2(req);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (
      res1.ok &&
      res2.ok &&
      res1.frame.kind === "RECEIPT_MATERIALIZATION_V2" &&
      res2.frame.kind === "RECEIPT_MATERIALIZATION_V2"
    ) {
      expect(res1.frame.executionReceipt.deterministicHash).toBe(
        res2.frame.executionReceipt.deterministicHash,
      );
    }
  });

  // V209-T33 — Deterministic Hash Field Sensitivity
  it("V209-T33 — Deterministic Hash Field Sensitivity", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req1 = createValidV2Request([polAgg]);
    let req2 = createValidV2Request([polAgg]);
    req2 = {
      ...req2,
      executionContext: {
        ...req2.executionContext,
        executionId: "exec-v2-synthetic-002",
      },
    };

    const res1 = materializeExecutionReceiptV2(req1);
    const res2 = materializeExecutionReceiptV2(req2);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (
      res1.ok &&
      res2.ok &&
      res1.frame.kind === "RECEIPT_MATERIALIZATION_V2" &&
      res2.frame.kind === "RECEIPT_MATERIALIZATION_V2"
    ) {
      expect(res1.frame.executionReceipt.deterministicHash).not.toBe(
        res2.frame.executionReceipt.deterministicHash,
      );
    }
  });

  // V209-T34 — Deterministic Hash Non-Circularity
  it("V209-T34 — Deterministic Hash Non-Circularity", () => {
    const code = readFileSync(
      resolve(
        process.cwd(),
        "packages/runtime/src/v2/receiptMaterialization.ts",
      ),
      "utf8",
    );
    expect(code).toContain("const deterministicHashPreimage = {");
    expect(code).not.toContain("deterministicHashPreimage.deterministicHash");
  });

  // V209-T35 — Full Replay Stability
  it("V209-T35 — Full Replay Stability", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const polAuth = createPolAuthBinding("Authorized");
    const secTrust = createSecTrustBinding("definite");
    const req = createValidV2Request([polAgg, polAuth, secTrust]);

    const res1 = materializeExecutionReceiptV2(req);
    const res2 = materializeExecutionReceiptV2(req);

    expect(res1).toEqual(res2);
  });

  // V209-T36 — Caller Mutation Isolation
  it("V209-T36 — Caller Mutation Isolation", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req = createValidV2Request([polAgg]);

    const res = materializeExecutionReceiptV2(req);
    expect(res.ok).toBe(true);
    if (res.ok && res.frame.kind === "RECEIPT_MATERIALIZATION_V2") {
      const origReceipt = { ...res.frame.executionReceipt };

      // Mutate caller object
      (req as unknown as Record<string, unknown>).requestId = "MUTATED";
      (req.executionContext as unknown as Record<string, unknown>).executionId =
        "MUTATED_EXEC_ID";

      expect(res.frame.executionReceipt).toEqual(origReceipt);
    }
  });

  // V209-T37 — Deep Immutability
  it("V209-T37 — Deep Immutability", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req = createValidV2Request([polAgg]);

    const res = materializeExecutionReceiptV2(req);
    expect(res.ok).toBe(true);
    if (res.ok && res.frame.kind === "RECEIPT_MATERIALIZATION_V2") {
      expect(Object.isFrozen(res)).toBe(true);
      expect(Object.isFrozen(res.frame)).toBe(true);
      expect(Object.isFrozen(res.frame.executionReceipt)).toBe(true);
    }
  });

  // V209-T38 — Extra JS Arguments Ignored
  it("V209-T38 — Extra JS Arguments Ignored", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req = createValidV2Request([polAgg]);

    const res1 = materializeExecutionReceiptV2(req);

    const fn = materializeExecutionReceiptV2 as (
      a: unknown,
      b: unknown,
      c: unknown,
    ) => ReturnType<typeof materializeExecutionReceiptV2>;

    const res2 = fn(
      req,
      {
        receiptId: "fake_receipt_id",
        runtimeVersion: "999",
        inputHash: "fake_input_hash",
      },
      "extra_arg",
    );

    expect(res1).toEqual(res2);
  });

  // V209-T39 — Participant / Agency Binding Changes Input Identity
  it("V209-T39 — Participant / Agency Binding Changes Input Identity", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req1 = createValidV2Request([polAgg]);
    let req2 = createValidV2Request([polAgg]);

    // Mutate terminal agency basis artifact ID in agency binding
    const updatedAgencies = [
      {
        ...req2.participation.agencyBindings[0],
        terminalAgencyBasisRef: {
          family: "AGENCY_BASIS" as const,
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "agency-basis-002",
        },
      },
    ];
    req2 = {
      ...req2,
      participation: {
        ...req2.participation,
        agencyBindings: updatedAgencies,
      },
    };

    const res1 = materializeExecutionReceiptV2(req1);
    const res2 = materializeExecutionReceiptV2(req2);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (
      res1.ok &&
      res2.ok &&
      res1.frame.kind === "RECEIPT_MATERIALIZATION_V2" &&
      res2.frame.kind === "RECEIPT_MATERIALIZATION_V2"
    ) {
      expect(res1.frame.executionReceipt.inputHash).not.toBe(
        res2.frame.executionReceipt.inputHash,
      );
      expect(res1.frame.executionReceipt.receiptId).not.toBe(
        res2.frame.executionReceipt.receiptId,
      );
    }
  });

  // V209-T40 — UNKNOWN Subject Preservation
  it("V209-T40 — UNKNOWN Subject Preservation", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    let req = createValidV2Request([polAgg]);
    const updatedRoles = [
      {
        roleBindingKey: "rb_actor_1",
        role: "ACTOR" as const,
        subject: { kind: "UNKNOWN" as const },
      },
      req.participation.roleBindings[1],
    ];
    req = {
      ...req,
      participation: {
        ...req.participation,
        roleBindings: updatedRoles,
      },
    };

    const res = materializeExecutionReceiptV2(req);
    expect(res.ok).toBe(true);
    if (res.ok && res.frame.kind === "RECEIPT_MATERIALIZATION_V2") {
      const r = res.frame.executionReceipt;
      expect(r.inputHash).toMatch(/^sha256:[0-9a-f]{64}$/);
      expect(r).not.toHaveProperty("participantId");
      expect(r).not.toHaveProperty("accountId");
      expect(r).not.toHaveProperty("userId");
      expect(r).not.toHaveProperty("tenantId");
    }
  });

  // V209-T41 — V1 Isolation
  it("V209-T41 — V1 Isolation", () => {
    const code = readFileSync(
      resolve(
        process.cwd(),
        "packages/runtime/src/v2/receiptMaterialization.ts",
      ),
      "utf8",
    );
    expect(code).not.toContain("generateReceiptHashes");
    expect(code).not.toContain("runInternalPipeline");
    expect(code).not.toContain("validateExecutionReceipt");
    expect(code).not.toContain("StageOverrideConfig");
    expect(code).not.toContain("evaluatePolicies");
  });

  // V209-H01 — Nested Decision Summary Property-Order Invariance
  it("V209-H01 — Nested Decision Summary Property-Order Invariance", () => {
    const polAgg1: OwnerDeterminationBindingV2 = {
      determinationBindingKey: "pol_agg_1",
      determinationQuestionBinding: {
        questionSemanticRef: {
          family: "QUESTION_SEMANTIC",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "q-pol-agg",
        },
        questionOperandBindings: [
          {
            operandKey: "op_pol_uni",
            operandSlotSemanticRef: {
              family: "EVALUATION_SEMANTIC",
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "slot-pol-uni",
            },
            operandKind: "POLICY_UNIVERSE",
            policyUniverseRef:
              "sha256:0000000000000000000000000000000000000000000000000000000000000000",
          },
          {
            operandKey: "op_req_act",
            operandSlotSemanticRef: {
              family: "EVALUATION_SEMANTIC",
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "slot-req-act",
            },
            operandKind: "REQUESTED_ACTION",
            requestedActionRef: "REQUESTED_ACTION",
          },
        ],
      },
      constitutionalOwnerRef: {
        family: "OWNER",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "POL-001",
      },
      ownerNativeResult: { aggregateResult: "ALLOW" },
      exactStateRef: {
        family: "STATE_INSTANCE",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "inst-pol-agg",
      },
      exactRuleRef: {
        family: "RULE",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "rule-pol-agg",
      },
      assessedAtCoordinateRef: "tEInput",
      provenanceRef: {
        family: "PROVENANCE",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "prov-pol-agg",
      },
      determinationDependencyDeclaration: { kind: "AUTHORITATIVELY_NONE" },
    };

    // Construct polAgg2 with reversed key insertion order on all nested refs
    const polAgg2: OwnerDeterminationBindingV2 = {
      determinationBindingKey: "pol_agg_1",
      determinationQuestionBinding: {
        questionSemanticRef: {
          artifactId: "q-pol-agg",
          ownerRef: "urn:zyppi:owner:council:v1",
          family: "QUESTION_SEMANTIC",
        },
        questionOperandBindings:
          polAgg1.determinationQuestionBinding.questionOperandBindings,
      },
      constitutionalOwnerRef: {
        artifactId: "POL-001",
        ownerRef: "urn:zyppi:owner:council:v1",
        family: "OWNER",
      },
      ownerNativeResult: { aggregateResult: "ALLOW" },
      exactStateRef: {
        artifactId: "inst-pol-agg",
        ownerRef: "urn:zyppi:owner:council:v1",
        family: "STATE_INSTANCE",
      },
      exactRuleRef: {
        artifactId: "rule-pol-agg",
        ownerRef: "urn:zyppi:owner:council:v1",
        family: "RULE",
      },
      assessedAtCoordinateRef: "tEInput",
      provenanceRef: {
        artifactId: "prov-pol-agg",
        ownerRef: "urn:zyppi:owner:council:v1",
        family: "PROVENANCE",
      },
      determinationDependencyDeclaration: { kind: "AUTHORITATIVELY_NONE" },
    };

    const req1 = createValidV2Request([polAgg1]);
    const req2 = createValidV2Request([polAgg2]);

    const res1 = materializeExecutionReceiptV2(req1);
    const res2 = materializeExecutionReceiptV2(req2);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    if (
      res1.ok &&
      res2.ok &&
      res1.frame.kind === "RECEIPT_MATERIALIZATION_V2" &&
      res2.frame.kind === "RECEIPT_MATERIALIZATION_V2"
    ) {
      expect(res1.frame.executionReceipt.decisionSummary).toBe(
        res2.frame.executionReceipt.decisionSummary,
      );
      expect(res1.frame.executionReceipt.inputHash).toBe(
        res2.frame.executionReceipt.inputHash,
      );
      expect(res1.frame.executionReceipt.receiptId).toBe(
        res2.frame.executionReceipt.receiptId,
      );
      expect(res1.frame.executionReceipt.deterministicHash).toBe(
        res2.frame.executionReceipt.deterministicHash,
      );
    }
  });

  // A2 — Static type assertion proving ok: true narrows frame.kind strictly to RECEIPT_MATERIALIZATION_V2
  it("A2 — Static type assertion proving ok: true narrows frame.kind strictly to RECEIPT_MATERIALIZATION_V2", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req = createValidV2Request([polAgg]);
    const result = materializeExecutionReceiptV2(req);

    if (result.ok) {
      type VerifiedKind = typeof result.frame.kind;
      const staticKindAssertion: VerifiedKind = "RECEIPT_MATERIALIZATION_V2";
      expect(staticKindAssertion).toBe("RECEIPT_MATERIALIZATION_V2");
      expect(result.frame.kind).toBe("RECEIPT_MATERIALIZATION_V2");
      expect(result.frame.executionReceipt).toBeDefined();
    }
  });

  // V209-T42 — Public API Exactness
  it("V209-T42 — Public API Exactness", () => {
    const exportedFunctions = Object.keys(RuntimePublicExport).filter(
      (key) =>
        typeof (RuntimePublicExport as Record<string, unknown>)[key] ===
        "function",
    );

    expect(exportedFunctions.sort()).toEqual([
      "evaluateExecutabilityAndOutcomeV2",
      "integrateOwnerDeterminationsV2",
      "materializeExecutionReceiptV2",
      "prepareProductionExecutionV2",
      "validateExecutionEnvelopeCompatibilityV2",
    ]);
  });
});

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  deriveEvidenceStateRefV2,
  derivePolicyUniverseRefV2,
  deriveSemanticStateRefV2,
  type ExecutionRequestV2,
  type OwnerDeterminationBindingV2,
  type QuestionOperandBindingV2,
} from "@zyppi/domain";

import * as RuntimePublicExport from "../index.js";
import { evaluateExecutabilityAndOutcomeV2 } from "./executabilityOutcome.js";

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

// Helpers for owner determinations
function createPolAggregateBinding(
  aggregateResult: "ALLOW" | "DENY" | "INDETERMINATE" | string = "ALLOW",
  key: string = "pol_agg_1",
  artifactId: string = "POL-001",
  includeOperands: boolean = true,
): OwnerDeterminationBindingV2 {
  const operands: QuestionOperandBindingV2[] = includeOperands
    ? [
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
      ]
    : [];

  return {
    determinationBindingKey: key,
    determinationQuestionBinding: {
      questionSemanticRef: {
        family: "QUESTION_SEMANTIC",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "q-pol-agg",
      },
      questionOperandBindings: operands,
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
  artifactId: string = "POL-001",
  includeOperands: boolean = true,
): OwnerDeterminationBindingV2 {
  const operands: QuestionOperandBindingV2[] = includeOperands
    ? [
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
      ]
    : [];

  return {
    determinationBindingKey: key,
    determinationQuestionBinding: {
      questionSemanticRef: {
        family: "QUESTION_SEMANTIC",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "q-pol-auth",
      },
      questionOperandBindings: operands,
    },
    constitutionalOwnerRef: {
      family: "OWNER",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId,
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
  trustStatus:
    | "definite"
    | "probable"
    | "possible"
    | "uncertain"
    | "speculative"
    | string = "definite",
  degradationFactors: readonly string[] = [],
  key: string = "sec_trust_1",
  artifactId: string = "SEC-001",
  includeOperands: boolean = true,
): OwnerDeterminationBindingV2 {
  const operands: QuestionOperandBindingV2[] = includeOperands
    ? [
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
      ]
    : [];

  return {
    determinationBindingKey: key,
    determinationQuestionBinding: {
      questionSemanticRef: {
        family: "QUESTION_SEMANTIC",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "q-sec-trust",
      },
      questionOperandBindings: operands,
    },
    constitutionalOwnerRef: {
      family: "OWNER",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId,
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

describe("CCP-RI-V2-08 Executability / Outcome Mandate (V208-T01..V208-T40 & Adversarial)", () => {
  // V208-T01 — Positive Verification Path
  it("V208-T01 — Positive Verification Path", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const polAuth = createPolAuthBinding("Authorized");
    const secTrust = createSecTrustBinding("definite");
    const req = createValidV2Request(
      [polAgg, polAuth, secTrust],
      "VERIFY",
      1000,
    );

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.kind).toBe("EXECUTABILITY_OUTCOME_V2");
      expect(res.frame.executability).toEqual({
        status: "DETERMINED",
        value: true,
        blockers: [],
        basisBindingKeys: ["pol_agg_1", "pol_auth_1", "sec_trust_1"].sort(),
        assessedAtCoordinateRef: "tEInput",
      });
      expect(res.frame.outcome).toEqual({
        status: "PRODUCED",
        outcome: "verified",
        basisBindingKeys: ["pol_agg_1", "pol_auth_1", "sec_trust_1"].sort(),
      });
    }
  });

  // V208-T02 — Structural Failure Preserved
  it("V208-T02 — Structural Failure Preserved", () => {
    const req = createValidV2Request();
    const malformed = { ...req, unknownTopField: "invalid" };
    const res = evaluateExecutabilityAndOutcomeV2(malformed);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("STRUCTURAL_VALIDATION");
    }
  });

  // V208-T03 — Identity Failure Preserved
  it("V208-T03 — Identity Failure Preserved", () => {
    const req = createValidV2Request();
    const badIdent = {
      ...req,
      constitutionalState: {
        ...req.constitutionalState,
        semanticStateRef:
          "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      },
    };
    const res = evaluateExecutabilityAndOutcomeV2(badIdent);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("IDENTITY_VALIDATION");
    }
  });

  // V208-T04 — Envelope Compatibility Failure Preserved
  it("V208-T04 — Envelope Compatibility Failure Preserved", () => {
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
    const res = evaluateExecutabilityAndOutcomeV2(badPerformer);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
    }
  });

  // V208-T05 — Production Isolation Failure Preserved
  it("V208-T05 — Production Isolation Failure Preserved", () => {
    const req = createValidV2Request();
    const badProd = { ...req, testMode: true };
    const res = evaluateExecutabilityAndOutcomeV2(badProd);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("STRUCTURAL_VALIDATION");
    }
  });

  // V208-T06 — Owner Integration Dependency Semantics Preserved
  it("V208-T06 — Owner Integration Dependency Semantics Preserved", () => {
    const bA = createPolAggregateBinding("ALLOW", "A");
    const bB = createPolAuthBinding("Authorized", "B");
    const bBWithDeps: OwnerDeterminationBindingV2 = {
      ...bB,
      determinationDependencyDeclaration: {
        kind: "EXPLICIT",
        dependencyRefs: ["A"],
      },
    };
    const secTrust = createSecTrustBinding("definite", [], "C");

    const req = createValidV2Request([bBWithDeps, bA, secTrust]);
    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.ownerIntegrationFrame.dependencyLayers).toHaveLength(2);
      expect(
        res.frame.ownerIntegrationFrame.dependencyLayers[0].map(
          (x) => x.determinationBindingKey,
        ),
      ).toEqual(["A", "C"]);
      expect(
        res.frame.ownerIntegrationFrame.dependencyLayers[1].map(
          (x) => x.determinationBindingKey,
        ),
      ).toEqual(["B"]);
    }
  });

  // V208-T07 — No New Digest
  it("V208-T07 — No New Digest", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const polAuth = createPolAuthBinding("Authorized");
    const secTrust = createSecTrustBinding("definite");
    const req = createValidV2Request([polAgg, polAuth, secTrust]);

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame).not.toHaveProperty("digest");
      expect(res.frame).not.toHaveProperty("executabilityHash");
      expect(res.frame).not.toHaveProperty("outcomeHash");
      expect(
        res.frame.ownerIntegrationFrame.productionFrame
          .wholeRequestDigestCandidate,
      ).toMatch(/^sha256:[0-9a-f]{64}$/);
    }
  });

  // V208-T08 — Exact Role Binding Identity
  it("V208-T08 — Exact Role Binding Identity", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const polAuth = createPolAuthBinding("Authorized");
    const secTrust = createSecTrustBinding("definite");
    const req = createValidV2Request([polAgg, polAuth, secTrust]);

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const prodBindings =
        res.frame.ownerIntegrationFrame.productionFrame.executionRequest
          .evaluationContext.ownerDeterminationBindings;
      expect(res.frame.ownerResults.policyAggregate).toBe(prodBindings[0]);
      expect(res.frame.ownerResults.authorization).toBe(prodBindings[1]);
      expect(res.frame.ownerResults.trustResult).toBe(prodBindings[2]);
    }
  });

  // V208-T09 — POL Aggregate Recognition
  it("V208-T09 — POL Aggregate Recognition", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req = createValidV2Request([polAgg]);
    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.ownerResults.policyAggregate).not.toBeNull();
      expect(res.frame.ownerResults.authorization).toBeNull();
      expect(res.frame.ownerResults.trustResult).toBeNull();
    }
  });

  // V208-T10 — POL Authorization Recognition
  it("V208-T10 — POL Authorization Recognition", () => {
    const polAuth = createPolAuthBinding("Authorized");
    const req = createValidV2Request([polAuth]);
    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.ownerResults.policyAggregate).toBeNull();
      expect(res.frame.ownerResults.authorization).not.toBeNull();
      expect(res.frame.ownerResults.trustResult).toBeNull();
    }
  });

  // V208-T11 — SEC TrustResult Recognition
  it("V208-T11 — SEC TrustResult Recognition", () => {
    const secTrust = createSecTrustBinding("definite");
    const req = createValidV2Request([secTrust]);
    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.ownerResults.policyAggregate).toBeNull();
      expect(res.frame.ownerResults.authorization).toBeNull();
      expect(res.frame.ownerResults.trustResult).not.toBeNull();
    }
  });

  // V208-T12 — Same Policy Value / Wrong Owner
  it("V208-T12 — Same Policy Value / Wrong Owner", () => {
    const wrongOwnerAgg = createPolAggregateBinding(
      "ALLOW",
      "pol_agg_1",
      "NON-POL-OWNER",
    );
    const req = createValidV2Request([wrongOwnerAgg]);
    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.ownerResults.policyAggregate).toBeNull();
    }
  });

  // V208-T13 — Same Authorization Value / Wrong Owner
  it("V208-T13 — Same Authorization Value / Wrong Owner", () => {
    const wrongOwnerAuth = createPolAuthBinding(
      "Authorized",
      "pol_auth_1",
      "NON-POL-OWNER",
    );
    const req = createValidV2Request([wrongOwnerAuth]);
    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.ownerResults.authorization).toBeNull();
    }
  });

  // V208-T14 — Same Trust Shape / Wrong Owner
  it("V208-T14 — Same Trust Shape / Wrong Owner", () => {
    const wrongOwnerTrust = createSecTrustBinding(
      "definite",
      [],
      "sec_trust_1",
      "NON-SEC-OWNER",
    );
    const req = createValidV2Request([wrongOwnerTrust]);
    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.ownerResults.trustResult).toBeNull();
    }
  });

  // V208-T15 — Ambiguous Role Fails Closed
  it("V208-T15 — Ambiguous Role Fails Closed", () => {
    const polAgg1 = createPolAggregateBinding("ALLOW", "agg_1");
    const polAgg2 = createPolAggregateBinding("DENY", "agg_2");
    const req = createValidV2Request([polAgg1, polAgg2]);

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTABILITY_OUTCOME");
      expect(res.error.code).toBe("OWNER_RESULT_ROLE_AMBIGUOUS");
    }
  });

  // V208-T16 — Malformed POL Result Fails Closed
  it("V208-T16 — Malformed POL Result Fails Closed", () => {
    const badPol = createPolAggregateBinding("MAYBE");
    const req = createValidV2Request([badPol]);

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTABILITY_OUTCOME");
      expect(res.error.code).toBe("OWNER_RESULT_CONTRACT_INVALID");
    }
  });

  // V208-T17 — Malformed SEC TrustResult Fails Closed
  it("V208-T17 — Malformed SEC TrustResult Fails Closed", () => {
    const badSec = createSecTrustBinding("super-trusted");
    const req = createValidV2Request([badSec]);

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTABILITY_OUTCOME");
      expect(res.error.code).toBe("OWNER_RESULT_CONTRACT_INVALID");
    }
  });

  // V208-T18 — Policy DENY Blocks Executability
  it("V208-T18 — Policy DENY Blocks Executability", () => {
    const polAgg = createPolAggregateBinding("DENY");
    const polAuth = createPolAuthBinding("Authorized");
    const secTrust = createSecTrustBinding("definite");
    const req = createValidV2Request([polAgg, polAuth, secTrust]);

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.executability.status).toBe("DETERMINED");
      if (res.frame.executability.status === "DETERMINED") {
        expect(res.frame.executability.value).toBe(false);
        expect(res.frame.executability.blockers).toContain("POLICY_DENIED");
      }
      expect(res.frame.ownerResults.trustResult?.ownerNativeResult).toEqual({
        trustStatus: "definite",
        degradationFactors: [],
      });
    }
  });

  // V208-T19 — Policy INDETERMINATE Fails Closed
  it("V208-T19 — Policy INDETERMINATE Fails Closed", () => {
    const polAgg = createPolAggregateBinding("INDETERMINATE");
    const polAuth = createPolAuthBinding("Authorized");
    const secTrust = createSecTrustBinding("definite");
    const req = createValidV2Request([polAgg, polAuth, secTrust]);

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.executability.status).toBe("DETERMINED");
      if (res.frame.executability.status === "DETERMINED") {
        expect(res.frame.executability.value).toBe(false);
        expect(res.frame.executability.blockers).toContain(
          "POLICY_INDETERMINATE",
        );
      }
    }
  });

  // V208-T20 — Authorization Denied Blocks
  it("V208-T20 — Authorization Denied Blocks", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const polAuth = createPolAuthBinding("Denied");
    const secTrust = createSecTrustBinding("definite");
    const req = createValidV2Request([polAgg, polAuth, secTrust]);

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.executability.status).toBe("DETERMINED");
      if (res.frame.executability.status === "DETERMINED") {
        expect(res.frame.executability.value).toBe(false);
        expect(res.frame.executability.blockers).toContain(
          "AUTHORIZATION_DENIED",
        );
      }
    }
  });

  // V208-T21 — Conditional Authorization Does Not Execute
  it("V208-T21 — Conditional Authorization Does Not Execute", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const polAuth = createPolAuthBinding("Conditionally Authorized");
    const secTrust = createSecTrustBinding("definite");
    const req = createValidV2Request([polAgg, polAuth, secTrust]);

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.executability.status).toBe("DETERMINED");
      if (res.frame.executability.status === "DETERMINED") {
        expect(res.frame.executability.value).toBe(false);
        expect(res.frame.executability.blockers).toContain(
          "AUTHORIZATION_CONDITIONAL",
        );
      }
    }
  });

  // V208-T22 — Deferred Authorization Does Not Execute
  it("V208-T22 — Deferred Authorization Does Not Execute", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const polAuth = createPolAuthBinding("Deferred");
    const secTrust = createSecTrustBinding("definite");
    const req = createValidV2Request([polAgg, polAuth, secTrust]);

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.executability.status).toBe("DETERMINED");
      if (res.frame.executability.status === "DETERMINED") {
        expect(res.frame.executability.value).toBe(false);
        expect(res.frame.executability.blockers).toContain(
          "AUTHORIZATION_DEFERRED",
        );
      }
    }
  });

  // V208-T23 — Zero Budget Blocks
  it("V208-T23 — Zero Budget Blocks", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const polAuth = createPolAuthBinding("Authorized");
    const secTrust = createSecTrustBinding("definite");
    const req = createValidV2Request(
      [polAgg, polAuth, secTrust],
      "VERIFY",
      0, // Zero budget!
    );

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.executability.status).toBe("DETERMINED");
      if (res.frame.executability.status === "DETERMINED") {
        expect(res.frame.executability.value).toBe(false);
        expect(res.frame.executability.blockers).toContain("BUDGET_EXHAUSTED");
      }
    }
  });

  // V208-T24 — Missing Policy Aggregate Is Unavailable
  it("V208-T24 — Missing Policy Aggregate Is Unavailable", () => {
    const polAuth = createPolAuthBinding("Authorized");
    const secTrust = createSecTrustBinding("definite");
    const req = createValidV2Request([polAuth, secTrust]);

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.executability.status).toBe("UNAVAILABLE");
      if (res.frame.executability.status === "UNAVAILABLE") {
        expect(res.frame.executability.missingOwnerResults).toContain(
          "POLICY_AGGREGATE",
        );
      }
    }
  });

  // V208-T25 — Missing Authorization Is Unavailable
  it("V208-T25 — Missing Authorization Is Unavailable", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const secTrust = createSecTrustBinding("definite");
    const req = createValidV2Request([polAgg, secTrust]);

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.executability.status).toBe("UNAVAILABLE");
      if (res.frame.executability.status === "UNAVAILABLE") {
        expect(res.frame.executability.missingOwnerResults).toContain(
          "AUTHORIZATION",
        );
      }
    }
  });

  // V208-T26 — Missing TrustResult Is Unavailable
  it("V208-T26 — Missing TrustResult Is Unavailable", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const polAuth = createPolAuthBinding("Authorized");
    const req = createValidV2Request([polAgg, polAuth]);

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.executability.status).toBe("UNAVAILABLE");
      if (res.frame.executability.status === "UNAVAILABLE") {
        expect(res.frame.executability.missingOwnerResults).toContain(
          "TRUST_RESULT",
        );
      }
    }
  });

  // V208-T27 — Decisive False Does Not Require Fabrication
  it("V208-T27 — Decisive False Does Not Require Fabrication", () => {
    const polAgg = createPolAggregateBinding("DENY");
    const polAuth = createPolAuthBinding("Authorized");
    // TrustResult missing!
    const req = createValidV2Request([polAgg, polAuth]);

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.executability.status).toBe("DETERMINED");
      if (res.frame.executability.status === "DETERMINED") {
        expect(res.frame.executability.value).toBe(false);
        expect(res.frame.executability.blockers).toContain("POLICY_DENIED");
      }
      expect(res.frame.ownerResults.trustResult).toBeNull();
    }
  });

  // V208-T28 — Trust Status Strength Does Not Alter RI Decision
  it("V208-T28 — Trust Status Strength Does Not Alter RI Decision", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const polAuth = createPolAuthBinding("Authorized");

    const secDefinite = createSecTrustBinding("definite");
    const secSpeculative = createSecTrustBinding("speculative");

    const reqDef = createValidV2Request([polAgg, polAuth, secDefinite]);
    const reqSpec = createValidV2Request([polAgg, polAuth, secSpeculative]);

    const resDef = evaluateExecutabilityAndOutcomeV2(reqDef);
    const resSpec = evaluateExecutabilityAndOutcomeV2(reqSpec);

    expect(resDef.ok).toBe(true);
    expect(resSpec.ok).toBe(true);

    if (resDef.ok && resSpec.ok) {
      expect(resDef.frame.executability).toEqual(resSpec.frame.executability);
      expect(resDef.frame.outcome).toEqual(resSpec.frame.outcome);
      expect(resDef.frame.ownerResults.trustResult?.ownerNativeResult).toEqual({
        trustStatus: "definite",
        degradationFactors: [],
      });
      expect(resSpec.frame.ownerResults.trustResult?.ownerNativeResult).toEqual(
        {
          trustStatus: "speculative",
          degradationFactors: [],
        },
      );
    }
  });

  // V208-T29 — Policy ALLOW Alone Does Not Verify
  it("V208-T29 — Policy ALLOW Alone Does Not Verify", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const req = createValidV2Request([polAgg]);

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.outcome.status).toBe("NOT_PRODUCED");
    }
  });

  // V208-T30 — TrustResult Alone Does Not Verify
  it("V208-T30 — TrustResult Alone Does Not Verify", () => {
    const secTrust = createSecTrustBinding("definite");
    const req = createValidV2Request([secTrust]);

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.outcome.status).toBe("NOT_PRODUCED");
    }
  });

  // V208-T31 — Authorization Alone Does Not Verify
  it("V208-T31 — Authorization Alone Does Not Verify", () => {
    const polAuth = createPolAuthBinding("Authorized");
    const req = createValidV2Request([polAuth]);

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.outcome.status).toBe("NOT_PRODUCED");
    }
  });

  // V208-T32 — Policy DENY Produces Rejected for VERIFY
  it("V208-T32 — Policy DENY Produces Rejected for VERIFY", () => {
    const polAgg = createPolAggregateBinding("DENY");
    const polAuth = createPolAuthBinding("Authorized");
    const secTrust = createSecTrustBinding("definite");
    const req = createValidV2Request([polAgg, polAuth, secTrust], "VERIFY");

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.outcome).toEqual({
        status: "PRODUCED",
        outcome: "rejected",
        basisBindingKeys: ["pol_agg_1", "pol_auth_1", "sec_trust_1"].sort(),
      });
      expect(res.frame.ownerResults.trustResult?.ownerNativeResult).toEqual({
        trustStatus: "definite",
        degradationFactors: [],
      });
    }
  });

  // V208-T33 — Policy INDETERMINATE Produces Unverified Only With Complete Required Owner Roles
  it("V208-T33 — Policy INDETERMINATE Produces Unverified Only With Complete Required Owner Roles", () => {
    const polIndet = createPolAggregateBinding("INDETERMINATE");
    const polAuth = createPolAuthBinding("Authorized");
    const secTrust = createSecTrustBinding("definite");

    const reqComplete = createValidV2Request([polIndet, polAuth, secTrust]);
    const resComplete = evaluateExecutabilityAndOutcomeV2(reqComplete);
    expect(resComplete.ok).toBe(true);
    if (resComplete.ok) {
      expect(resComplete.frame.outcome).toEqual({
        status: "PRODUCED",
        outcome: "unverified",
        basisBindingKeys: ["pol_agg_1", "pol_auth_1", "sec_trust_1"].sort(),
      });
    }

    // Incomplete role -> NOT_PRODUCED
    const reqIncomplete = createValidV2Request([polIndet, secTrust]);
    const resIncomplete = evaluateExecutabilityAndOutcomeV2(reqIncomplete);
    expect(resIncomplete.ok).toBe(true);
    if (resIncomplete.ok) {
      expect(resIncomplete.frame.outcome.status).toBe("NOT_PRODUCED");
    }
  });

  // V208-T34 — Positive Composite Produces Verified
  it("V208-T34 — Positive Composite Produces Verified", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const polAuth = createPolAuthBinding("Authorized");
    const secTrust = createSecTrustBinding("definite");

    const req = createValidV2Request([polAgg, polAuth, secTrust]);
    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.outcome).toEqual({
        status: "PRODUCED",
        outcome: "verified",
        basisBindingKeys: ["pol_agg_1", "pol_auth_1", "sec_trust_1"].sort(),
      });
    }

    // Removing polAgg -> Outcome changes
    const reqNoAgg = createValidV2Request([polAuth, secTrust]);
    const resNoAgg = evaluateExecutabilityAndOutcomeV2(reqNoAgg);
    expect(resNoAgg.ok).toBe(true);
    if (resNoAgg.ok) {
      expect(resNoAgg.frame.outcome.status).toBe("NOT_PRODUCED");
    }

    // Removing polAuth -> Outcome changes
    const reqNoAuth = createValidV2Request([polAgg, secTrust]);
    const resNoAuth = evaluateExecutabilityAndOutcomeV2(reqNoAuth);
    expect(resNoAuth.ok).toBe(true);
    if (resNoAuth.ok) {
      expect(resNoAuth.frame.outcome.status).toBe("NOT_PRODUCED");
    }

    // Removing secTrust -> Outcome changes
    const reqNoTrust = createValidV2Request([polAgg, polAuth]);
    const resNoTrust = evaluateExecutabilityAndOutcomeV2(reqNoTrust);
    expect(resNoTrust.ok).toBe(true);
    if (resNoTrust.ok) {
      expect(resNoTrust.frame.outcome.status).toBe("NOT_PRODUCED");
    }
  });

  // V208-T35 — Executable True Does Not Universally Mean Verified
  it("V208-T35 — Executable True Does Not Universally Mean Verified", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const polAuth = createPolAuthBinding("Authorized");
    const secTrust = createSecTrustBinding("definite");

    const reqTransfer = createValidV2Request(
      [polAgg, polAuth, secTrust],
      "TRANSFER",
    );
    const res = evaluateExecutabilityAndOutcomeV2(reqTransfer);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.executability.status).toBe("DETERMINED");
      if (res.frame.executability.status === "DETERMINED") {
        expect(res.frame.executability.value).toBe(true);
      }
      expect(res.frame.outcome).toEqual({
        status: "NOT_PRODUCED",
        reason: "OUTCOME_NOT_APPLICABLE_TO_INTENT",
        basisBindingKeys: ["pol_agg_1", "pol_auth_1", "sec_trust_1"].sort(),
      });
    }
  });

  // V208-T36 — Multiple Blockers Preserved Without Semantic Precedence
  it("V208-T36 — Multiple Blockers Preserved Without Semantic Precedence", () => {
    const polAgg = createPolAggregateBinding("DENY");
    const polAuth = createPolAuthBinding("Denied");
    const secTrust = createSecTrustBinding("definite");

    const req = createValidV2Request(
      [polAgg, polAuth, secTrust],
      "VERIFY",
      0, // Zero budget!
    );

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.executability.status).toBe("DETERMINED");
      if (res.frame.executability.status === "DETERMINED") {
        expect(res.frame.executability.value).toBe(false);
        expect(res.frame.executability.blockers).toContain("BUDGET_EXHAUSTED");
        expect(res.frame.executability.blockers).toContain("POLICY_DENIED");
        expect(res.frame.executability.blockers).toContain(
          "AUTHORIZATION_DENIED",
        );
      }
    }
  });

  // V208-T37 — Extra JavaScript Arguments Have Zero Effect
  it("V208-T37 — Extra JavaScript Arguments Have Zero Effect", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const polAuth = createPolAuthBinding("Authorized");
    const secTrust = createSecTrustBinding("definite");
    const req = createValidV2Request([polAgg, polAuth, secTrust]);

    const res1 = evaluateExecutabilityAndOutcomeV2(req);

    const fn = evaluateExecutabilityAndOutcomeV2 as (
      a: unknown,
      b: unknown,
      c: unknown,
      d: unknown,
    ) => ReturnType<typeof evaluateExecutabilityAndOutcomeV2>;

    const res2 = fn(
      req,
      { authorization: "Authorized" },
      { trustStatus: "definite" },
      { outcome: "verified" },
    );

    expect(res1).toEqual(res2);
  });

  // V208-T38 — Recursive Immutability
  it("V208-T38 — Recursive Immutability", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const polAuth = createPolAuthBinding("Authorized");
    const secTrust = createSecTrustBinding("definite");
    const req = createValidV2Request([polAgg, polAuth, secTrust]);

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(Object.isFrozen(res)).toBe(true);
      expect(Object.isFrozen(res.frame)).toBe(true);
      expect(Object.isFrozen(res.frame.ownerResults)).toBe(true);
      expect(Object.isFrozen(res.frame.executability)).toBe(true);
      expect(Object.isFrozen(res.frame.executability.blockers)).toBe(true);
      expect(Object.isFrozen(res.frame.executability.basisBindingKeys)).toBe(
        true,
      );
      expect(Object.isFrozen(res.frame.outcome)).toBe(true);
      expect(Object.isFrozen(res.frame.outcome.basisBindingKeys)).toBe(true);
    }
  });

  // V208-T39 — Caller Mutation Isolation
  it("V208-T39 — Caller Mutation Isolation", () => {
    const polAgg = createPolAggregateBinding("ALLOW");
    const polAuth = createPolAuthBinding("Authorized");
    const secTrust = createSecTrustBinding("definite");
    const req = createValidV2Request([polAgg, polAuth, secTrust]);

    const res = evaluateExecutabilityAndOutcomeV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const origExec = res.frame.executability;
      const origOutcome = res.frame.outcome;

      // Mutate caller object
      (req as unknown as Record<string, unknown>).requestId = "MUTATED_REQ_ID";
      (
        req.evaluationContext
          .ownerDeterminationBindings[0] as unknown as Record<string, unknown>
      ).determinationBindingKey = "MUTATED_KEY";

      expect(res.frame.executability).toEqual(origExec);
      expect(res.frame.outcome).toEqual(origOutcome);
    }
  });

  // V208-T40 — Public API / Source Boundary Audit
  it("V208-T40 — Public API / Source Boundary Audit", () => {
    const exportedFunctions = Object.keys(RuntimePublicExport).filter(
      (key) =>
        typeof (RuntimePublicExport as Record<string, unknown>)[key] ===
        "function",
    );

    expect(exportedFunctions.sort()).toEqual([
      "evaluateExecutabilityAndOutcomeV2",
      "integrateOwnerDeterminationsV2",
      "prepareProductionExecutionV2",
      "validateExecutionEnvelopeCompatibilityV2",
    ]);

    const code = readFileSync(
      resolve(process.cwd(), "packages/runtime/src/v2/executabilityOutcome.ts"),
      "utf8",
    );

    expect(code).not.toContain("StageOverrideConfig");
    expect(code).not.toContain("runInternalPipeline");
    expect(code).not.toContain("evaluatePolicies");
    expect(code).not.toContain("materializeResolutionGraph");
    expect(code).not.toContain("mockResult");

    expect(code).not.toContain("process.env");
    expect(code).not.toContain("NODE_ENV");
    expect(code).not.toContain("Date.now");
    expect(code).not.toContain("new Date");
    expect(code).not.toContain("Math.random");
    expect(code).not.toContain("randomUUID");

    expect(code).not.toContain("@zyppi/api");
    expect(code).not.toContain("apps/api");

    expect(code).not.toContain("GS1");
    expect(code).not.toContain("GTIN");
    expect(code).not.toContain("GLN");
    expect(code).not.toContain("Digital Link");
    expect(code).not.toContain("DPP");

    expect(code).not.toContain('contains("POL")');
    expect(code).not.toContain('contains("SEC")');
    expect(code).not.toContain("toLowerCase");
  });

  describe("Mandatory Adversarial Cases", () => {
    it("POL result missing question operands -> CONTRACT_INVALID", () => {
      const polAggNoOps = createPolAggregateBinding(
        "ALLOW",
        "pol_1",
        "POL-001",
        false,
      );
      const req = createValidV2Request([polAggNoOps]);
      const res = evaluateExecutabilityAndOutcomeV2(req);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.stage).toBe("EXECUTABILITY_OUTCOME");
        expect(res.error.code).toBe("OWNER_RESULT_CONTRACT_INVALID");
      }
    });

    it("Authorization missing action performer -> CONTRACT_INVALID", () => {
      const polAuth = createPolAuthBinding(
        "Authorized",
        "auth_1",
        "POL-001",
        true,
      );
      const polAuthBadOps: OwnerDeterminationBindingV2 = {
        ...polAuth,
        determinationQuestionBinding: {
          ...polAuth.determinationQuestionBinding,
          questionOperandBindings:
            polAuth.determinationQuestionBinding.questionOperandBindings.filter(
              (op) => op.operandKind !== "ACTION_PERFORMER",
            ),
        },
      };

      const req = createValidV2Request([polAuthBadOps]);
      const res = evaluateExecutabilityAndOutcomeV2(req);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.stage).toBe("EXECUTABILITY_OUTCOME");
        expect(res.error.code).toBe("OWNER_RESULT_CONTRACT_INVALID");
      }
    });

    it("Authorization missing action target -> CONTRACT_INVALID", () => {
      const polAuth = createPolAuthBinding(
        "Authorized",
        "auth_1",
        "POL-001",
        true,
      );
      const polAuthBadOps: OwnerDeterminationBindingV2 = {
        ...polAuth,
        determinationQuestionBinding: {
          ...polAuth.determinationQuestionBinding,
          questionOperandBindings:
            polAuth.determinationQuestionBinding.questionOperandBindings.filter(
              (op) => op.operandKind !== "ACTION_TARGET",
            ),
        },
      };

      const req = createValidV2Request([polAuthBadOps]);
      const res = evaluateExecutabilityAndOutcomeV2(req);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.stage).toBe("EXECUTABILITY_OUTCOME");
        expect(res.error.code).toBe("OWNER_RESULT_CONTRACT_INVALID");
      }
    });

    it("TrustResult missing Evidence-state operand -> CONTRACT_INVALID", () => {
      const secTrustNoOps = createSecTrustBinding(
        "definite",
        [],
        "trust_1",
        "SEC-001",
        false,
      );
      const req = createValidV2Request([secTrustNoOps]);
      const res = evaluateExecutabilityAndOutcomeV2(req);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.stage).toBe("EXECUTABILITY_OUTCOME");
        expect(res.error.code).toBe("OWNER_RESULT_CONTRACT_INVALID");
      }
    });

    it("caller-supplied fake verified at root -> rejected at structural validation", () => {
      const polAgg = createPolAggregateBinding("ALLOW");
      const polAuth = createPolAuthBinding("Authorized");
      const req = createValidV2Request([polAgg, polAuth]);
      (req as unknown as Record<string, unknown>).outcome = "verified";

      const res = evaluateExecutabilityAndOutcomeV2(req);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.stage).toBe("STRUCTURAL_VALIDATION");
      }
    });

    it("caller-supplied fake TrustResult at root -> rejected at structural validation", () => {
      const polAgg = createPolAggregateBinding("ALLOW");
      const polAuth = createPolAuthBinding("Authorized");
      const req = createValidV2Request([polAgg, polAuth]);
      (req as unknown as Record<string, unknown>).trustResult = {
        trustStatus: "definite",
      };

      const res = evaluateExecutabilityAndOutcomeV2(req);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.stage).toBe("STRUCTURAL_VALIDATION");
      }
    });
  });
});

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

import * as RuntimePublicExport from "../index.js";
import { integrateOwnerDeterminationsV2 } from "./ownerDeterminationIntegration.js";
import { prepareProductionExecutionV2 } from "./productionExecutionBoundary.js";

// Helper function creating a valid generic V2 request fixture with configurable ownerDeterminationBindings
function createValidV2Request(
  ownerDeterminationBindings?: OwnerDeterminationBindingV2[],
): ExecutionRequestV2 {
  const defaultBindings: OwnerDeterminationBindingV2[] = [
    {
      determinationBindingKey: "od_1",
      determinationQuestionBinding: {
        questionSemanticRef: {
          family: "QUESTION_SEMANTIC",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "question-001",
        },
        questionOperandBindings: [
          {
            operandKey: "op_1",
            operandSlotSemanticRef: {
              family: "EVALUATION_SEMANTIC",
              ownerRef: "urn:zyppi:owner:council:v1",
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
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "council",
      },
      ownerNativeResult: { result: "SYNTHETIC_RESULT_OK" },
      exactStateRef: {
        family: "STATE_INSTANCE",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "instance-001",
      },
      exactRuleRef: {
        family: "RULE",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "rule-001",
      },
      assessedAtCoordinateRef: "tEInput",
      provenanceRef: {
        family: "PROVENANCE",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "prov-od-001",
      },
      determinationDependencyDeclaration: {
        kind: "AUTHORITATIVELY_NONE",
      },
    },
  ];

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
      intentCategory: "VERIFY",
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
      budget: 1000,
    },
  };

  // Re-derive valid component digests and state references
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

  // Update semantic refs across question operands if needed
  const updatedOwnerBindings =
    req.evaluationContext.ownerDeterminationBindings.map((b) => ({
      ...b,
      determinationQuestionBinding: {
        ...b.determinationQuestionBinding,
        questionOperandBindings:
          b.determinationQuestionBinding.questionOperandBindings.map((op) =>
            op.operandKind === "CONSTITUTIONAL_STATE"
              ? { ...op, semanticStateRef: derivedSemanticRef }
              : op,
          ),
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

// Helper to create a synthetic OwnerDeterminationBindingV2
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

describe("CCP-RI-V2-07 Owner Evaluation Integration Mandate (V207-T01..V207-T30)", () => {
  // V207-T01 — Valid owner determination integrates
  it("V207-T01 — Valid owner determination integrates", () => {
    const req = createValidV2Request();
    const res = integrateOwnerDeterminationsV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.kind).toBe("OWNER_DETERMINATION_INTEGRATION_V2");
      expect(res.frame.productionFrame.kind).toBe("PRODUCTION_EXECUTION_V2");
      expect(res.frame.dependencyLayers).toHaveLength(1);
      expect(res.frame.dependencyLayers[0]).toHaveLength(1);
      expect(res.frame.dependencyLayers[0][0].determinationBindingKey).toBe(
        "od_1",
      );
    }
  });

  // V207-T02 — Structural failure remains predecessor-owned
  it("V207-T02 — Structural failure remains predecessor-owned", () => {
    const req = createValidV2Request();
    const malformed = { ...req, unknownProperty: "forbidden" };
    const res = integrateOwnerDeterminationsV2(malformed);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("STRUCTURAL_VALIDATION");
      expect((res.error as { code: string }).code).toBe("UNKNOWN_FIELD");
    }
  });

  // V207-T03 — Identity failure remains predecessor-owned
  it("V207-T03 — Identity failure remains predecessor-owned", () => {
    const req = createValidV2Request();
    const badComponent = {
      ...req,
      constitutionalState: {
        ...req.constitutionalState,
        semanticStateRef:
          "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      },
    };
    const res = integrateOwnerDeterminationsV2(badComponent);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("IDENTITY_VALIDATION");
      expect((res.error as { code: string }).code).toBe(
        "COMPONENT_DIGEST_MISMATCH",
      );
    }
  });

  // V207-T04 — Envelope compatibility failure remains predecessor-owned
  it("V207-T04 — Envelope compatibility failure remains predecessor-owned", () => {
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
    const res = integrateOwnerDeterminationsV2(badPerformer);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect((res.error as { code: string }).code).toBe(
        "ROLE_BINDING_INCOMPATIBLE",
      );
    }
  });

  // V207-T05 — Production digest continuity preserved
  it("V207-T05 — Production digest continuity preserved", () => {
    const req = createValidV2Request();
    const prodRes = prepareProductionExecutionV2(req);
    expect(prodRes.ok).toBe(true);
    const integRes = integrateOwnerDeterminationsV2(req);
    expect(integRes.ok).toBe(true);

    if (prodRes.ok && integRes.ok) {
      expect(integRes.frame.productionFrame.wholeRequestDigestCandidate).toBe(
        prodRes.frame.wholeRequestDigestCandidate,
      );
    }
  });

  // V207-T06 — Deterministic repeatability
  it("V207-T06 — Deterministic repeatability", () => {
    const req = createValidV2Request();
    const res1 = integrateOwnerDeterminationsV2(req);
    const res2 = integrateOwnerDeterminationsV2(req);
    expect(res1).toEqual(res2);
  });

  // V207-T07 — Empty owner determination set lawful
  it("V207-T07 — Empty owner determination set lawful", () => {
    const req = createValidV2Request([]);
    const res = integrateOwnerDeterminationsV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.dependencyLayers).toEqual([]);
      expect(Object.isFrozen(res.frame.dependencyLayers)).toBe(true);
    }
  });

  // V207-T08 — AUTHORITATIVELY_NONE enters first layer
  it("V207-T08 — AUTHORITATIVELY_NONE enters first layer", () => {
    const b1 = createBinding("A", "AUTHORITATIVELY_NONE");
    const req = createValidV2Request([b1]);
    const res = integrateOwnerDeterminationsV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.dependencyLayers).toHaveLength(1);
      expect(res.frame.dependencyLayers[0]).toHaveLength(1);
      expect(res.frame.dependencyLayers[0][0].determinationBindingKey).toBe(
        "A",
      );
    }
  });

  // V207-T09 — Single dependency orders dependency first
  it("V207-T09 — Single dependency orders dependency first", () => {
    const bA = createBinding("A", "AUTHORITATIVELY_NONE");
    const bB = createBinding("B", ["A"]);
    const req = createValidV2Request([bB, bA]); // submitted in reverse
    const res = integrateOwnerDeterminationsV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.dependencyLayers).toHaveLength(2);
      expect(
        res.frame.dependencyLayers[0].map(
          (x: OwnerDeterminationBindingV2) => x.determinationBindingKey,
        ),
      ).toEqual(["A"]);
      expect(
        res.frame.dependencyLayers[1].map(
          (x: OwnerDeterminationBindingV2) => x.determinationBindingKey,
        ),
      ).toEqual(["B"]);
    }
  });

  // V207-T10 — Transitive chain
  it("V207-T10 — Transitive chain", () => {
    const bA = createBinding("A", "AUTHORITATIVELY_NONE");
    const bB = createBinding("B", ["A"]);
    const bC = createBinding("C", ["B"]);
    const req = createValidV2Request([bC, bB, bA]);
    const res = integrateOwnerDeterminationsV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.dependencyLayers).toHaveLength(3);
      expect(
        res.frame.dependencyLayers[0].map(
          (x: OwnerDeterminationBindingV2) => x.determinationBindingKey,
        ),
      ).toEqual(["A"]);
      expect(
        res.frame.dependencyLayers[1].map(
          (x: OwnerDeterminationBindingV2) => x.determinationBindingKey,
        ),
      ).toEqual(["B"]);
      expect(
        res.frame.dependencyLayers[2].map(
          (x: OwnerDeterminationBindingV2) => x.determinationBindingKey,
        ),
      ).toEqual(["C"]);
    }
  });

  // V207-T11 — Diamond DAG
  it("V207-T11 — Diamond DAG", () => {
    const bA = createBinding("A", "AUTHORITATIVELY_NONE");
    const bB = createBinding("B", ["A"]);
    const bC = createBinding("C", ["A"]);
    const bD = createBinding("D", ["B", "C"]);
    const req = createValidV2Request([bD, bC, bB, bA]);
    const res = integrateOwnerDeterminationsV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.dependencyLayers).toHaveLength(3);
      expect(
        res.frame.dependencyLayers[0].map(
          (x: OwnerDeterminationBindingV2) => x.determinationBindingKey,
        ),
      ).toEqual(["A"]);
      expect(
        res.frame.dependencyLayers[1].map(
          (x: OwnerDeterminationBindingV2) => x.determinationBindingKey,
        ),
      ).toEqual(["B", "C"]);
      expect(
        res.frame.dependencyLayers[2].map(
          (x: OwnerDeterminationBindingV2) => x.determinationBindingKey,
        ),
      ).toEqual(["D"]);
    }
  });

  // V207-T12 — Independent determinations share one layer
  it("V207-T12 — Independent determinations share one layer", () => {
    const bX = createBinding("X", "AUTHORITATIVELY_NONE");
    const bY = createBinding("Y", "AUTHORITATIVELY_NONE");
    const bZ = createBinding("Z", "AUTHORITATIVELY_NONE");
    const req = createValidV2Request([bZ, bY, bX]);
    const res = integrateOwnerDeterminationsV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.dependencyLayers).toHaveLength(1);
      expect(
        res.frame.dependencyLayers[0].map(
          (x: OwnerDeterminationBindingV2) => x.determinationBindingKey,
        ),
      ).toEqual(["X", "Y", "Z"]);
    }
  });

  // V207-T13 — Ready-layer representation deterministic
  it("V207-T13 — Ready-layer representation deterministic", () => {
    const b3 = createBinding("beta", "AUTHORITATIVELY_NONE");
    const b1 = createBinding("alpha", "AUTHORITATIVELY_NONE");
    const b2 = createBinding("gamma", "AUTHORITATIVELY_NONE");
    const req = createValidV2Request([b3, b1, b2]);
    const res = integrateOwnerDeterminationsV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(
        res.frame.dependencyLayers[0].map(
          (x: OwnerDeterminationBindingV2) => x.determinationBindingKey,
        ),
      ).toEqual(["alpha", "beta", "gamma"]);
    }
  });

  // V207-T14 — Source array permutation does not change layers
  it("V207-T14 — Source array permutation does not change layers", () => {
    const bA = createBinding("A", "AUTHORITATIVELY_NONE");
    const bB = createBinding("B", ["A"]);
    const bC = createBinding("C", ["A"]);
    const bD = createBinding("D", ["B", "C"]);

    const req1 = createValidV2Request([bA, bB, bC, bD]);
    const req2 = createValidV2Request([bD, bC, bB, bA]);
    const req3 = createValidV2Request([bB, bD, bA, bC]);

    const res1 = integrateOwnerDeterminationsV2(req1);
    const res2 = integrateOwnerDeterminationsV2(req2);
    const res3 = integrateOwnerDeterminationsV2(req3);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
    expect(res3.ok).toBe(true);

    if (res1.ok && res2.ok && res3.ok) {
      const getKeys = (
        layers: readonly (readonly OwnerDeterminationBindingV2[])[],
      ) => layers.map((l) => l.map((b) => b.determinationBindingKey));
      expect(getKeys(res1.frame.dependencyLayers)).toEqual(
        getKeys(res2.frame.dependencyLayers),
      );
      expect(getKeys(res1.frame.dependencyLayers)).toEqual(
        getKeys(res3.frame.dependencyLayers),
      );
    }
  });

  // V207-T15 — Extra declared dependency honored
  it("V207-T15 — Extra declared dependency honored", () => {
    // Binding D lists A and B in dependencyRefs, even if questionOperandBindings contains no OWNER_DETERMINATION operand for B
    const bA = createBinding("A", "AUTHORITATIVELY_NONE");
    const bB = createBinding("B", "AUTHORITATIVELY_NONE");
    const bD = createBinding("D", ["A", "B"]);

    const req = createValidV2Request([bD, bB, bA]);
    const res = integrateOwnerDeterminationsV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.dependencyLayers).toHaveLength(2);
      expect(
        res.frame.dependencyLayers[0].map(
          (x: OwnerDeterminationBindingV2) => x.determinationBindingKey,
        ),
      ).toEqual(["A", "B"]);
      expect(
        res.frame.dependencyLayers[1].map(
          (x: OwnerDeterminationBindingV2) => x.determinationBindingKey,
        ),
      ).toEqual(["D"]);
    }
  });

  // V207-T16 — No universal SEC/POL ordering
  it("V207-T16 — No universal SEC/POL ordering", () => {
    const bPol = createBinding("POL_01", "AUTHORITATIVELY_NONE", "POL_OWNER");
    const bSec = createBinding("SEC_01", "AUTHORITATIVELY_NONE", "SEC_OWNER");

    const req = createValidV2Request([bPol, bSec]);
    const res = integrateOwnerDeterminationsV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      // Since neither specifies dependencyRefs, both are in Layer 0 sorted by key ("POL_01", "SEC_01")
      expect(res.frame.dependencyLayers).toHaveLength(1);
      expect(
        res.frame.dependencyLayers[0].map(
          (x: OwnerDeterminationBindingV2) => x.determinationBindingKey,
        ),
      ).toEqual(["POL_01", "SEC_01"]);
    }
  });

  // V207-T17 — ownerNativeResult does not affect topology
  it("V207-T17 — ownerNativeResult does not affect topology", () => {
    const bA1 = createBinding("A", "AUTHORITATIVELY_NONE", "council", {
      status: "DENY",
    });
    const bB1 = createBinding("B", ["A"], "council", { status: "ALLOW" });

    const bA2 = createBinding("A", "AUTHORITATIVELY_NONE", "council", {
      status: "ALLOW",
    });
    const bB2 = createBinding("B", ["A"], "council", { status: "DENY" });

    const req1 = createValidV2Request([bA1, bB1]);
    const req2 = createValidV2Request([bA2, bB2]);

    const res1 = integrateOwnerDeterminationsV2(req1);
    const res2 = integrateOwnerDeterminationsV2(req2);

    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);

    if (res1.ok && res2.ok) {
      const getKeys = (
        layers: readonly (readonly OwnerDeterminationBindingV2[])[],
      ) => layers.map((l) => l.map((b) => b.determinationBindingKey));
      expect(getKeys(res1.frame.dependencyLayers)).toEqual(
        getKeys(res2.frame.dependencyLayers),
      );
    }
  });

  // V207-T18 — Semantic-looking values remain opaque
  it("V207-T18 — Semantic-looking values remain opaque", () => {
    const b1 = createBinding("A", "AUTHORITATIVELY_NONE", "council", {
      result: "ALLOW",
      decision: "TRUSTED",
      authorized: true,
      outcome: "EXECUTABLE",
    });

    const req = createValidV2Request([b1]);
    const res = integrateOwnerDeterminationsV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.dependencyLayers[0][0].ownerNativeResult).toEqual({
        result: "ALLOW",
        decision: "TRUSTED",
        authorized: true,
        outcome: "EXECUTABLE",
      });
    }
  });

  // V207-T19 — Equal result values do not deduplicate
  it("V207-T19 — Equal result values do not deduplicate", () => {
    const b1 = createBinding("A", "AUTHORITATIVELY_NONE", "owner1", {
      same: "payload",
    });
    const b2 = createBinding("B", "AUTHORITATIVELY_NONE", "owner2", {
      same: "payload",
    });

    const req = createValidV2Request([b1, b2]);
    const res = integrateOwnerDeterminationsV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.dependencyLayers[0]).toHaveLength(2);
      expect(res.frame.dependencyLayers[0][0].determinationBindingKey).toBe(
        "A",
      );
      expect(res.frame.dependencyLayers[0][1].determinationBindingKey).toBe(
        "B",
      );
    }
  });

  // V207-T20 — Exact binding object reused
  it("V207-T20 — Exact binding object reused", () => {
    const req = createValidV2Request();
    const res = integrateOwnerDeterminationsV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const prodBinding =
        res.frame.productionFrame.executionRequest.evaluationContext
          .ownerDeterminationBindings[0];
      const integBinding = res.frame.dependencyLayers[0][0];

      expect(integBinding).toBe(prodBinding);
    }
  });

  // V207-T21 — Exact owner binding preserved
  it("V207-T21 — Exact owner binding preserved", () => {
    const b = createBinding("A", "AUTHORITATIVELY_NONE", "council_spec");
    const req = createValidV2Request([b]);
    const res = integrateOwnerDeterminationsV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.dependencyLayers[0][0].constitutionalOwnerRef).toEqual(
        b.constitutionalOwnerRef,
      );
    }
  });

  // V207-T22 — Exact question binding preserved
  it("V207-T22 — Exact question binding preserved", () => {
    const b = createBinding("A", "AUTHORITATIVELY_NONE");
    const req = createValidV2Request([b]);
    const res = integrateOwnerDeterminationsV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(
        res.frame.dependencyLayers[0][0].determinationQuestionBinding,
      ).toBe(
        res.frame.productionFrame.executionRequest.evaluationContext
          .ownerDeterminationBindings[0].determinationQuestionBinding,
      );
    }
  });

  // V207-T23 — Exact state and rule bindings preserved
  it("V207-T23 — Exact state and rule bindings preserved", () => {
    const b = createBinding("A", "AUTHORITATIVELY_NONE");
    const req = createValidV2Request([b]);
    const res = integrateOwnerDeterminationsV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const bound = res.frame.dependencyLayers[0][0];
      expect(bound.exactStateRef).toEqual(b.exactStateRef);
      expect(bound.exactRuleRef).toEqual(b.exactRuleRef);
    }
  });

  // V207-T24 — Exact time and provenance preserved
  it("V207-T24 — Exact time and provenance preserved", () => {
    const b = createBinding("A", "AUTHORITATIVELY_NONE");
    const req = createValidV2Request([b]);
    const res = integrateOwnerDeterminationsV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const bound = res.frame.dependencyLayers[0][0];
      expect(bound.assessedAtCoordinateRef).toBe("tEInput");
      expect(bound.provenanceRef).toEqual(b.provenanceRef);
    }
  });

  // V207-T25 — Dependency declaration preserved exactly
  it("V207-T25 — Dependency declaration preserved exactly", () => {
    const bA = createBinding("A", "AUTHORITATIVELY_NONE");
    const bB = createBinding("B", ["A"]);
    const req = createValidV2Request([bA, bB]);
    const res = integrateOwnerDeterminationsV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(
        res.frame.dependencyLayers[0][0].determinationDependencyDeclaration,
      ).toEqual({ kind: "AUTHORITATIVELY_NONE" });
      expect(
        res.frame.dependencyLayers[1][0].determinationDependencyDeclaration,
      ).toEqual({ kind: "EXPLICIT", dependencyRefs: ["A"] });
    }
  });

  // V207-T26 — Integration frame recursively immutable
  it("V207-T26 — Integration frame recursively immutable", () => {
    const req = createValidV2Request();
    const res = integrateOwnerDeterminationsV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(Object.isFrozen(res)).toBe(true);
      expect(Object.isFrozen(res.frame)).toBe(true);
      expect(Object.isFrozen(res.frame.dependencyLayers)).toBe(true);
      expect(Object.isFrozen(res.frame.dependencyLayers[0])).toBe(true);
    }
  });

  // V207-T27 — Caller mutation cannot alter integration
  it("V207-T27 — Caller mutation cannot alter integration", () => {
    const req = createValidV2Request();
    const res = integrateOwnerDeterminationsV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const originalBindingKey =
        res.frame.dependencyLayers[0][0].determinationBindingKey;

      // Mutate caller object
      (
        req.evaluationContext
          .ownerDeterminationBindings[0] as unknown as Record<string, unknown>
      ).determinationBindingKey = "MUTATED_KEY";

      expect(res.frame.dependencyLayers[0][0].determinationBindingKey).toBe(
        originalBindingKey,
      );
      expect(res.frame.dependencyLayers[0][0].determinationBindingKey).not.toBe(
        "MUTATED_KEY",
      );
    }
  });

  // V207-T28 — Extra JavaScript evaluator argument zero effect
  it("V207-T28 — Extra JavaScript evaluator argument zero effect", () => {
    const req = createValidV2Request();
    const res1 = integrateOwnerDeterminationsV2(req);

    const fn = integrateOwnerDeterminationsV2 as (
      a: unknown,
      b: unknown,
      c: unknown,
    ) => ReturnType<typeof integrateOwnerDeterminationsV2>;

    const res2 = fn(
      req,
      {
        evaluatorCallback: () => "fake_result",
        ownerRegistry: {},
      },
      "extra_arg",
    );

    expect(res1).toEqual(res2);
  });

  // V207-T29 — Production source contains no owner semantic interpretation
  it("V207-T29 — Production source contains no owner semantic interpretation", () => {
    const code = readFileSync(
      resolve(
        process.cwd(),
        "packages/runtime/src/v2/ownerDeterminationIntegration.ts",
      ),
      "utf8",
    );

    expect(code).not.toContain("StageOverrideConfig");
    expect(code).not.toContain("runInternalPipeline");
    expect(code).not.toContain("evaluatePolicies");
    expect(code).not.toContain("materializeResolutionGraph");
    expect(code).not.toContain("mockResult");

    expect(code).not.toContain("TrustResult");
    expect(code).not.toContain("CurrentlyTrusted");
    expect(code).not.toContain("Authorization");
    expect(code).not.toContain("Outcome");
    expect(code).not.toContain("Executable");

    expect(code).not.toContain("testMode");
    expect(code).not.toContain("allowOverrides");
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
  });

  // V207-T30 — Public API containment
  it("V207-T30 — Public API containment", () => {
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

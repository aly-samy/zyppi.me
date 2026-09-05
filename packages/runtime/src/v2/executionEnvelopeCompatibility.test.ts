import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  deriveEvidenceStateRefV2,
  deriveExecutionRequestV2DigestCandidate,
  derivePolicyUniverseRefV2,
  deriveSemanticStateRefV2,
  type ExecutionRequestV2,
  type PolicyRefV2,
} from "@zyppi/domain";
import { validateExecutionEnvelopeCompatibilityV2 } from "./executionEnvelopeCompatibility.js";

// Canonical valid base synthetic V2 execution request fixture
function createValidV2Request(): ExecutionRequestV2 {
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
      ownerDeterminationBindings: [
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
      ],
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
      ownerDeterminationBindings: [
        {
          ...req.evaluationContext.ownerDeterminationBindings[0],
          determinationQuestionBinding: {
            ...req.evaluationContext.ownerDeterminationBindings[0]
              .determinationQuestionBinding,
            questionOperandBindings: [
              {
                operandKey: "op_1",
                operandSlotSemanticRef: {
                  family: "EVALUATION_SEMANTIC",
                  ownerRef: "urn:zyppi:owner:council:v1",
                  artifactId: "slot-001",
                },
                operandKind: "CONSTITUTIONAL_STATE",
                semanticStateRef: derivedSemanticRef,
              },
            ],
          },
        },
      ],
    },
  };

  return req;
}

describe("CCP-RI-V2-05 Mandatory Test Matrix (V205-T01..V205-T32)", () => {
  // V205-T01
  it("V205-T01 — Valid generic V2 envelope is compatible", () => {
    const req = createValidV2Request();
    const res = validateExecutionEnvelopeCompatibilityV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.executionRequest).toBeDefined();
      expect(res.wholeRequestDigestCandidate).toMatch(/^sha256:[0-9a-f]{64}$/);
    }
  });

  // V205-T02
  it("V205-T02 — Structural defect remains Domain-owned", () => {
    const req = createValidV2Request();
    const malformed = {
      ...req,
      contractVersion: "invalid_version_string",
    };
    const res = validateExecutionEnvelopeCompatibilityV2(malformed);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("STRUCTURAL_VALIDATION");
      expect(res.error.code).toBe("INVALID_CONTRACT_VERSION");
    }
  });

  // V205-T03
  it("V205-T03 — Component identity mismatch remains Domain-owned", () => {
    const req = createValidV2Request();
    const badComponent = {
      ...req,
      constitutionalState: {
        ...req.constitutionalState,
        semanticStateRef:
          "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      },
    };
    const res = validateExecutionEnvelopeCompatibilityV2(badComponent);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("IDENTITY_VALIDATION");
      expect(res.error.code).toBe("COMPONENT_DIGEST_MISMATCH");
    }
  });

  // V205-T04
  it("V205-T04 — Dangling local label remains V2-02-owned", () => {
    const req = createValidV2Request();
    const danglingReq: ExecutionRequestV2 = {
      ...req,
      intent: {
        ...req.intent,
        originatorParticipationRef: "dangling_role_binding_ref_xyz",
      },
    };
    const res = validateExecutionEnvelopeCompatibilityV2(danglingReq);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("IDENTITY_VALIDATION");
      expect(res.error.code).toBe("GRAPH_CANONICALIZATION_FAILURE");
    }
  });

  // V205-T05
  it("V205-T05 — Digest equality", () => {
    const req = createValidV2Request();
    const res = validateExecutionEnvelopeCompatibilityV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const directDigest = deriveExecutionRequestV2DigestCandidate(req);
      expect(directDigest.ok).toBe(true);
      if (directDigest.ok) {
        expect(res.wholeRequestDigestCandidate).toBe(directDigest.value);
      }
    }
  });

  // V205-T06
  it("V205-T06 — Deterministic repeatability", () => {
    const req = createValidV2Request();
    const res1 = validateExecutionEnvelopeCompatibilityV2(req);
    const res2 = validateExecutionEnvelopeCompatibilityV2(req);
    expect(res1).toEqual(res2);
  });

  // V205-T07
  it("V205-T07 — No source mutation", () => {
    const req = createValidV2Request();
    const snapshot = JSON.parse(JSON.stringify(req));
    validateExecutionEnvelopeCompatibilityV2(req);
    expect(req).toEqual(snapshot);
  });

  // V205-T08
  it("V205-T08 — Action performer bound to ACTOR succeeds", () => {
    const req = createValidV2Request();
    expect(req.participation.roleBindings[0].role).toBe("ACTOR");
    expect(
      req.requestedAction.actionPerformerBindings[0].actorParticipationRef,
    ).toBe("rb_actor_1");
    const res = validateExecutionEnvelopeCompatibilityV2(req);
    expect(res.ok).toBe(true);
  });

  // V205-T09
  it("V205-T09 — Action performer bound only to GOVERNED_SUBJECT rejects", () => {
    const req = createValidV2Request();
    const badPerformer = {
      ...req,
      requestedAction: {
        ...req.requestedAction,
        actionPerformerBindings: [
          {
            ...req.requestedAction.actionPerformerBindings[0],
            actorParticipationRef: "rb_subject_1", // role is GOVERNED_SUBJECT
          },
        ],
      },
    };
    const res = validateExecutionEnvelopeCompatibilityV2(badPerformer);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect(res.error.code).toBe("ROLE_BINDING_INCOMPATIBLE");
      expect(res.error.path).toContain("actionPerformerBindings");
    }
  });

  // V205-T10
  it("V205-T10 — Agency actor endpoint must be ACTOR", () => {
    const req = createValidV2Request();
    const badAgency = {
      ...req,
      participation: {
        ...req.participation,
        agencyBindings: [
          {
            ...req.participation.agencyBindings[0],
            actorRoleBindingRef: "rb_subject_1", // role is GOVERNED_SUBJECT
          },
        ],
      },
    };
    const res = validateExecutionEnvelopeCompatibilityV2(badAgency);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect(res.error.code).toBe("ROLE_BINDING_INCOMPATIBLE");
      expect(res.error.path).toContain("actorRoleBindingRef");
    }
  });

  // V205-T11
  it("V205-T11 — Agency governed endpoint must be GOVERNED_SUBJECT", () => {
    const req = createValidV2Request();
    const badAgency = {
      ...req,
      participation: {
        ...req.participation,
        agencyBindings: [
          {
            ...req.participation.agencyBindings[0],
            governedSubjectRoleBindingRef: "rb_actor_1", // role is ACTOR
          },
        ],
      },
    };
    const res = validateExecutionEnvelopeCompatibilityV2(badAgency);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect(res.error.code).toBe("ROLE_BINDING_INCOMPATIBLE");
      expect(res.error.path).toContain("governedSubjectRoleBindingRef");
    }
  });

  // V205-T12
  it("V205-T12 — Intent originator lawful roles (ACTOR and INTENT_ORIGINATOR)", () => {
    // 1. ACTOR as originator (default valid request)
    const reqActor = createValidV2Request();
    expect(validateExecutionEnvelopeCompatibilityV2(reqActor).ok).toBe(true);

    // 2. INTENT_ORIGINATOR as originator
    const baseReq = createValidV2Request();
    const rbOriginator = {
      roleBindingKey: "rb_orig_1",
      role: "INTENT_ORIGINATOR" as const,
      subject: {
        kind: "KNOWN" as const,
        subjectRef: {
          family: "SUBJECT" as const,
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "originator-001",
        },
      },
    };
    const reqOriginator: ExecutionRequestV2 = {
      ...baseReq,
      participation: {
        ...baseReq.participation,
        roleBindings: [...baseReq.participation.roleBindings, rbOriginator],
      },
      intent: {
        ...baseReq.intent,
        originatorParticipationRef: "rb_orig_1",
      },
    };

    const resOriginator =
      validateExecutionEnvelopeCompatibilityV2(reqOriginator);
    expect(resOriginator.ok).toBe(true);
  });

  // V205-T13
  it("V205-T13 — Governed subject alone cannot originate intent", () => {
    const req = createValidV2Request();
    const badIntent = {
      ...req,
      intent: {
        ...req.intent,
        originatorParticipationRef: "rb_subject_1", // role is GOVERNED_SUBJECT
      },
    };
    const res = validateExecutionEnvelopeCompatibilityV2(badIntent);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect(res.error.code).toBe("ROLE_BINDING_INCOMPATIBLE");
      expect(res.error.path).toContain("originatorParticipationRef");
    }
  });

  // V205-T14
  it("V205-T14 — Single delegated agency must belong to performer actor", () => {
    const baseReq = createValidV2Request();
    // Add a second actor and a second agency binding
    const rbActor2 = {
      roleBindingKey: "rb_actor_2",
      role: "ACTOR" as const,
      subject: {
        kind: "KNOWN" as const,
        subjectRef: {
          family: "SUBJECT" as const,
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "actor-002",
        },
      },
    };
    const ab2 = {
      agencyBindingKey: "ab_2",
      actorRoleBindingRef: "rb_actor_2",
      governedSubjectRoleBindingRef: "rb_subject_1",
      terminalAgencyBasisRef: {
        family: "AGENCY_BASIS" as const,
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "agency-basis-002",
      },
    };

    // Performer_1 has actorParticipationRef = "rb_actor_1" but relies on "ab_2" (actorRoleBindingRef = "rb_actor_2")
    const req: ExecutionRequestV2 = {
      ...baseReq,
      participation: {
        roleBindings: [...baseReq.participation.roleBindings, rbActor2],
        agencyBindings: [...baseReq.participation.agencyBindings, ab2],
      },
      requestedAction: {
        ...baseReq.requestedAction,
        actionPerformerBindings: [
          {
            performerKey: "performer_1",
            actorParticipationRef: "rb_actor_1",
            agencyReliance: {
              kind: "DELEGATED_AGENCY_SINGLE",
              agencyBindingRef: "ab_2",
            },
          },
        ],
      },
    };

    const res = validateExecutionEnvelopeCompatibilityV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect(res.error.code).toBe("AGENCY_RELIANCE_INCOMPATIBLE");
      expect(res.error.path).toContain("agencyReliance.agencyBindingRef");
    }
  });

  // V205-T15
  it("V205-T15 — Presentation requirement must be bound", () => {
    const req = createValidV2Request();
    const badEvidState = {
      ...req.evidenceState,
      evidencePresentationBindings: [
        {
          evidenceRequirementRef: {
            family: "EVIDENCE_REQUIREMENT" as const,
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "unbound-requirement-999",
          },
          presentedEvidenceRefs: [
            {
              family: "EVIDENCE" as const,
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "ev-mat-001",
            },
          ],
        },
      ],
    };

    const evidRef = deriveEvidenceStateRefV2(badEvidState);
    expect(evidRef.ok).toBe(true);
    const derivedRef = evidRef.ok
      ? evidRef.value
      : badEvidState.evidenceStateRef;

    const badReq = {
      ...req,
      evidenceState: {
        ...badEvidState,
        evidenceStateRef: derivedRef,
      },
    };

    const res = validateExecutionEnvelopeCompatibilityV2(badReq);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect(res.error.code).toBe("EVIDENCE_BINDING_INCOMPATIBLE");
      expect(res.error.path).toContain("evidenceRequirementRef");
    }
  });

  // V205-T16
  it("V205-T16 — Presented evidence must be supplied", () => {
    const req = createValidV2Request();
    const badEvidState = {
      ...req.evidenceState,
      evidencePresentationBindings: [
        {
          evidenceRequirementRef: {
            family: "EVIDENCE_REQUIREMENT" as const,
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "ev-req-001",
          },
          presentedEvidenceRefs: [
            {
              family: "EVIDENCE" as const,
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "unsupplied-evidence-999",
            },
          ],
        },
      ],
    };

    const evidRef = deriveEvidenceStateRefV2(badEvidState);
    expect(evidRef.ok).toBe(true);
    const derivedRef = evidRef.ok
      ? evidRef.value
      : badEvidState.evidenceStateRef;

    const badReq = {
      ...req,
      evidenceState: {
        ...badEvidState,
        evidenceStateRef: derivedRef,
      },
    };

    const res = validateExecutionEnvelopeCompatibilityV2(badReq);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect(res.error.code).toBe("EVIDENCE_BINDING_INCOMPATIBLE");
      expect(res.error.path).toContain("presentedEvidenceRefs");
    }
  });

  // V205-T17
  it("V205-T17 — Integrity coordinate evidence must be supplied", () => {
    const req = createValidV2Request();
    const badEvidState = {
      ...req.evidenceState,
      integrityCoordinates: [
        {
          coordinateKey: "ic_1",
          evidenceRef: {
            family: "EVIDENCE" as const,
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "unsupplied-evidence-888",
          },
          expectedDigest:
            "sha256:1111111111111111111111111111111111111111111111111111111111111111",
          algorithm: "sha256",
        },
      ],
    };

    const evidRef = deriveEvidenceStateRefV2(badEvidState);
    expect(evidRef.ok).toBe(true);
    const derivedRef = evidRef.ok
      ? evidRef.value
      : badEvidState.evidenceStateRef;

    const badReq = {
      ...req,
      evidenceState: {
        ...badEvidState,
        evidenceStateRef: derivedRef,
      },
    };

    const res = validateExecutionEnvelopeCompatibilityV2(badReq);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect(res.error.code).toBe("EVIDENCE_BINDING_INCOMPATIBLE");
      expect(res.error.path).toContain("integrityCoordinates");
    }
  });

  // V205-T18
  it("V205-T18 — Unpresented requirement is not invented incompatibility", () => {
    const req = createValidV2Request();
    // Clear evidencePresentationBindings so requirement is unpresented
    const unpresentedEvidState = {
      ...req.evidenceState,
      evidencePresentationBindings: [],
    };

    const evidRef = deriveEvidenceStateRefV2(unpresentedEvidState);
    expect(evidRef.ok).toBe(true);
    const derivedRef = evidRef.ok
      ? evidRef.value
      : unpresentedEvidState.evidenceStateRef;

    const unpresentedReq = {
      ...req,
      evidenceState: {
        ...unpresentedEvidState,
        evidenceStateRef: derivedRef,
      },
    };

    const res = validateExecutionEnvelopeCompatibilityV2(unpresentedReq);
    expect(res.ok).toBe(true);
  });

  // V205-T19
  it("V205-T19 — Policy edge endpoints must belong to universe", () => {
    const req = createValidV2Request();
    const unboundPolicy: PolicyRefV2 = {
      family: "POLICY",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "unbound-policy-999",
      version: "1.0.0",
      stateRef: "state-unbound",
      provenanceRef: "prov-unbound",
    };

    const badPolUniverse = {
      ...req.policyUniverse,
      dependencyTopology: {
        dependencyEdges: [
          {
            dependeePolicyRef:
              req.policyUniverse.applicablePolicyMaterial[0].policyRef,
            dependentPolicyRef: unboundPolicy,
          },
        ],
      },
    };

    const polRef = derivePolicyUniverseRefV2(badPolUniverse);
    expect(polRef.ok).toBe(true);
    const derivedRef = polRef.ok
      ? polRef.value
      : badPolUniverse.policyUniverseRef;

    const badReq = {
      ...req,
      policyUniverse: {
        ...badPolUniverse,
        policyUniverseRef: derivedRef,
      },
    };

    const res = validateExecutionEnvelopeCompatibilityV2(badReq);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect(res.error.code).toBe("POLICY_TOPOLOGY_INCOMPATIBLE");
      expect(res.error.path).toContain("dependencyEdges");
    }
  });

  // V205-T20
  it("V205-T20 — Policy self-edge rejects", () => {
    const req = createValidV2Request();
    const polRef0 = req.policyUniverse.applicablePolicyMaterial[0].policyRef;

    const badPolUniverse = {
      ...req.policyUniverse,
      dependencyTopology: {
        dependencyEdges: [
          {
            dependeePolicyRef: polRef0,
            dependentPolicyRef: polRef0,
          },
        ],
      },
    };

    const polRef = derivePolicyUniverseRefV2(badPolUniverse);
    expect(polRef.ok).toBe(true);
    const derivedRef = polRef.ok
      ? polRef.value
      : badPolUniverse.policyUniverseRef;

    const badReq = {
      ...req,
      policyUniverse: {
        ...badPolUniverse,
        policyUniverseRef: derivedRef,
      },
    };

    const res = validateExecutionEnvelopeCompatibilityV2(badReq);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect(res.error.code).toBe("POLICY_TOPOLOGY_INCOMPATIBLE");
    }
  });

  // V205-T21
  it("V205-T21 — Policy cycle rejects", () => {
    const req = createValidV2Request();
    const polRef1: PolicyRefV2 = {
      family: "POLICY",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "policy-001",
      version: "1.0.0",
      stateRef: "state-pol-001",
      provenanceRef: "prov-pol-001",
    };
    const polRef2: PolicyRefV2 = {
      family: "POLICY",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "policy-002",
      version: "1.0.0",
      stateRef: "state-pol-002",
      provenanceRef: "prov-pol-002",
    };

    const cyclePolUniverse = {
      ...req.policyUniverse,
      applicablePolicyMaterial: [
        { policyKey: "pol_1", policyRef: polRef1, material: { r: 1 } },
        { policyKey: "pol_2", policyRef: polRef2, material: { r: 2 } },
      ],
      dependencyTopology: {
        dependencyEdges: [
          { dependeePolicyRef: polRef1, dependentPolicyRef: polRef2 },
          { dependeePolicyRef: polRef2, dependentPolicyRef: polRef1 },
        ],
      },
    };

    const polRef = derivePolicyUniverseRefV2(cyclePolUniverse);
    expect(polRef.ok).toBe(true);
    const derivedRef = polRef.ok
      ? polRef.value
      : cyclePolUniverse.policyUniverseRef;

    const cycleReq = {
      ...req,
      policyUniverse: {
        ...cyclePolUniverse,
        policyUniverseRef: derivedRef,
      },
    };

    const res = validateExecutionEnvelopeCompatibilityV2(cycleReq);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect(res.error.code).toBe("POLICY_TOPOLOGY_INCOMPATIBLE");
    }
  });

  // V205-T22
  it("V205-T22 — Edgeless / disconnected policy universe is lawful", () => {
    const req = createValidV2Request();
    const polRef1: PolicyRefV2 = {
      family: "POLICY",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "policy-001",
      version: "1.0.0",
      stateRef: "state-pol-001",
      provenanceRef: "prov-pol-001",
    };
    const polRef2: PolicyRefV2 = {
      family: "POLICY",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "policy-002",
      version: "1.0.0",
      stateRef: "state-pol-002",
      provenanceRef: "prov-pol-002",
    };

    const disconnectedUniverse = {
      ...req.policyUniverse,
      applicablePolicyMaterial: [
        { policyKey: "pol_1", policyRef: polRef1, material: { r: 1 } },
        { policyKey: "pol_2", policyRef: polRef2, material: { r: 2 } },
      ],
      dependencyTopology: {
        dependencyEdges: [],
      },
    };

    const polRef = derivePolicyUniverseRefV2(disconnectedUniverse);
    expect(polRef.ok).toBe(true);
    const derivedRef = polRef.ok
      ? polRef.value
      : disconnectedUniverse.policyUniverseRef;

    const disconnectedReq = {
      ...req,
      policyUniverse: {
        ...disconnectedUniverse,
        policyUniverseRef: derivedRef,
      },
    };

    const res = validateExecutionEnvelopeCompatibilityV2(disconnectedReq);
    expect(res.ok).toBe(true);
  });

  // V205-T23
  it("V205-T23 — Missing temporal operand coordinate rejects", () => {
    const req = createValidV2Request();
    // Add question operand referencing optional tTrust while tTrust is absent
    const badDetBinding = {
      ...req.evaluationContext.ownerDeterminationBindings[0],
      determinationQuestionBinding: {
        ...req.evaluationContext.ownerDeterminationBindings[0]
          .determinationQuestionBinding,
        questionOperandBindings: [
          {
            operandKey: "op_trust",
            operandSlotSemanticRef: {
              family: "EVALUATION_SEMANTIC" as const,
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "slot-trust",
            },
            operandKind: "TEMPORAL_COORDINATE" as const,
            temporalCoordinateRef: "tTrust" as const,
          },
        ],
      },
    };

    const badReq = {
      ...req,
      evaluationContext: {
        ...req.evaluationContext,
        ownerDeterminationBindings: [badDetBinding],
      },
    };

    expect(badReq.executionContext.temporalCoordinates.tTrust).toBeUndefined();

    const res = validateExecutionEnvelopeCompatibilityV2(badReq);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect(res.error.code).toBe("TEMPORAL_BINDING_INCOMPATIBLE");
      expect(res.error.path).toContain("temporalCoordinateRef");
    }
  });

  // V205-T24
  it("V205-T24 — Missing assessed-at coordinate rejects", () => {
    const req = createValidV2Request();
    const badDetBinding = {
      ...req.evaluationContext.ownerDeterminationBindings[0],
      assessedAtCoordinateRef: "tObservation" as const,
    };

    const badReq = {
      ...req,
      evaluationContext: {
        ...req.evaluationContext,
        ownerDeterminationBindings: [badDetBinding],
      },
    };

    expect(
      badReq.executionContext.temporalCoordinates.tObservation,
    ).toBeUndefined();

    const res = validateExecutionEnvelopeCompatibilityV2(badReq);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect(res.error.code).toBe("TEMPORAL_BINDING_INCOMPATIBLE");
      expect(res.error.path).toContain("assessedAtCoordinateRef");
    }
  });

  // V205-T25
  it("V205-T25 — Constitutional-state operand must bind request state", () => {
    const req = createValidV2Request();
    const badDetBinding = {
      ...req.evaluationContext.ownerDeterminationBindings[0],
      determinationQuestionBinding: {
        ...req.evaluationContext.ownerDeterminationBindings[0]
          .determinationQuestionBinding,
        questionOperandBindings: [
          {
            operandKey: "op_sem",
            operandSlotSemanticRef: {
              family: "EVALUATION_SEMANTIC" as const,
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "slot-sem",
            },
            operandKind: "CONSTITUTIONAL_STATE" as const,
            semanticStateRef:
              "sha256:1111111111111111111111111111111111111111111111111111111111111111",
          },
        ],
      },
    };

    const badReq = {
      ...req,
      evaluationContext: {
        ...req.evaluationContext,
        ownerDeterminationBindings: [badDetBinding],
      },
    };

    const res = validateExecutionEnvelopeCompatibilityV2(badReq);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect(res.error.code).toBe("QUESTION_OPERAND_INCOMPATIBLE");
      expect(res.error.path).toContain("semanticStateRef");
    }
  });

  // V205-T26
  it("V205-T26 — Evidence-state operand must bind request evidence state", () => {
    const req = createValidV2Request();
    const badDetBinding = {
      ...req.evaluationContext.ownerDeterminationBindings[0],
      determinationQuestionBinding: {
        ...req.evaluationContext.ownerDeterminationBindings[0]
          .determinationQuestionBinding,
        questionOperandBindings: [
          {
            operandKey: "op_ev",
            operandSlotSemanticRef: {
              family: "EVALUATION_SEMANTIC" as const,
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "slot-ev",
            },
            operandKind: "EVIDENCE_STATE" as const,
            evidenceStateRef:
              "sha256:2222222222222222222222222222222222222222222222222222222222222222",
          },
        ],
      },
    };

    const badReq = {
      ...req,
      evaluationContext: {
        ...req.evaluationContext,
        ownerDeterminationBindings: [badDetBinding],
      },
    };

    const res = validateExecutionEnvelopeCompatibilityV2(badReq);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect(res.error.code).toBe("QUESTION_OPERAND_INCOMPATIBLE");
      expect(res.error.path).toContain("evidenceStateRef");
    }
  });

  // V205-T27
  it("V205-T27 — Policy-universe operand must bind request policy universe", () => {
    const req = createValidV2Request();
    const badDetBinding = {
      ...req.evaluationContext.ownerDeterminationBindings[0],
      determinationQuestionBinding: {
        ...req.evaluationContext.ownerDeterminationBindings[0]
          .determinationQuestionBinding,
        questionOperandBindings: [
          {
            operandKey: "op_pol",
            operandSlotSemanticRef: {
              family: "EVALUATION_SEMANTIC" as const,
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "slot-pol",
            },
            operandKind: "POLICY_UNIVERSE" as const,
            policyUniverseRef:
              "sha256:3333333333333333333333333333333333333333333333333333333333333333",
          },
        ],
      },
    };

    const badReq = {
      ...req,
      evaluationContext: {
        ...req.evaluationContext,
        ownerDeterminationBindings: [badDetBinding],
      },
    };

    const res = validateExecutionEnvelopeCompatibilityV2(badReq);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect(res.error.code).toBe("QUESTION_OPERAND_INCOMPATIBLE");
      expect(res.error.path).toContain("policyUniverseRef");
    }
  });

  // V205-T28
  it("V205-T28 — Action-target operand must match a requested action target", () => {
    const req = createValidV2Request();
    const badDetBinding = {
      ...req.evaluationContext.ownerDeterminationBindings[0],
      determinationQuestionBinding: {
        ...req.evaluationContext.ownerDeterminationBindings[0]
          .determinationQuestionBinding,
        questionOperandBindings: [
          {
            operandKey: "op_target",
            operandSlotSemanticRef: {
              family: "EVALUATION_SEMANTIC" as const,
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "slot-target",
            },
            operandKind: "ACTION_TARGET" as const,
            targetSlotSemanticRef: {
              family: "TARGET_SLOT_SEMANTIC" as const,
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "unbound-target-slot-999",
            },
            targetRef: {
              family: "TARGET" as const,
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "target-001",
            },
          },
        ],
      },
    };

    const badReq = {
      ...req,
      evaluationContext: {
        ...req.evaluationContext,
        ownerDeterminationBindings: [badDetBinding],
      },
    };

    const res = validateExecutionEnvelopeCompatibilityV2(badReq);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect(res.error.code).toBe("QUESTION_OPERAND_INCOMPATIBLE");
    }
  });

  // V205-T29
  it("V205-T29 — AUTHORITATIVELY_NONE cannot consume owner determination operand", () => {
    const req = createValidV2Request();

    // Add od_1 and od_2 where od_2 specifies AUTHORITATIVELY_NONE but includes od_1 as an OWNER_DETERMINATION operand
    const od1 = req.evaluationContext.ownerDeterminationBindings[0];
    const od2 = {
      ...od1,
      determinationBindingKey: "od_2",
      determinationQuestionBinding: {
        ...od1.determinationQuestionBinding,
        questionOperandBindings: [
          {
            operandKey: "op_dep_1",
            operandSlotSemanticRef: {
              family: "EVALUATION_SEMANTIC" as const,
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "slot-dep",
            },
            operandKind: "OWNER_DETERMINATION" as const,
            ownerDeterminationBindingRef: "od_1",
          },
        ],
      },
      determinationDependencyDeclaration: {
        kind: "AUTHORITATIVELY_NONE" as const,
      },
    };

    const badReq = {
      ...req,
      evaluationContext: {
        ...req.evaluationContext,
        ownerDeterminationBindings: [od1, od2],
      },
    };

    const res = validateExecutionEnvelopeCompatibilityV2(badReq);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect(res.error.code).toBe("OWNER_DEPENDENCY_INCOMPATIBLE");
      expect(res.error.path).toContain("determinationDependencyDeclaration");
    }
  });

  // V205-T30
  it("V205-T30 — Owner determination operand must be explicitly declared dependency", () => {
    const req = createValidV2Request();

    const od1 = req.evaluationContext.ownerDeterminationBindings[0];
    const od3 = {
      ...od1,
      determinationBindingKey: "od_3",
      determinationQuestionBinding: {
        ...od1.determinationQuestionBinding,
        questionSemanticRef: {
          ...od1.determinationQuestionBinding.questionSemanticRef,
          artifactId: "question-003",
        },
      },
      determinationDependencyDeclaration: {
        kind: "AUTHORITATIVELY_NONE" as const,
      },
    };
    const od2 = {
      ...od1,
      determinationBindingKey: "od_2",
      determinationQuestionBinding: {
        ...od1.determinationQuestionBinding,
        questionSemanticRef: {
          ...od1.determinationQuestionBinding.questionSemanticRef,
          artifactId: "question-002",
        },
        questionOperandBindings: [
          {
            operandKey: "op_dep_1",
            operandSlotSemanticRef: {
              family: "EVALUATION_SEMANTIC" as const,
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "slot-dep",
            },
            operandKind: "OWNER_DETERMINATION" as const,
            ownerDeterminationBindingRef: "od_1",
          },
        ],
      },
      determinationDependencyDeclaration: {
        kind: "EXPLICIT" as const,
        dependencyRefs: ["od_3"], // Declares od_3 but uses od_1 in question operands!
      },
    };

    const badReq = {
      ...req,
      evaluationContext: {
        ...req.evaluationContext,
        ownerDeterminationBindings: [od1, od2, od3],
      },
    };

    const res = validateExecutionEnvelopeCompatibilityV2(badReq);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect(res.error.code).toBe("OWNER_DEPENDENCY_INCOMPATIBLE");
      expect(res.error.path).toContain("dependencyRefs");
    }
  });

  // V205-T31
  it("V205-T31 — Owner dependency self-edge / cycle rejects", () => {
    const req = createValidV2Request();

    // 1. Self-dependency proof
    const selfDepOd = {
      ...req.evaluationContext.ownerDeterminationBindings[0],
      determinationDependencyDeclaration: {
        kind: "EXPLICIT" as const,
        dependencyRefs: ["od_1"],
      },
    };
    const selfDepReq = {
      ...req,
      evaluationContext: {
        ...req.evaluationContext,
        ownerDeterminationBindings: [selfDepOd],
      },
    };
    const resSelf = validateExecutionEnvelopeCompatibilityV2(selfDepReq);
    expect(resSelf.ok).toBe(false);
    if (!resSelf.ok) {
      expect(resSelf.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect(resSelf.error.code).toBe("OWNER_DEPENDENCY_INCOMPATIBLE");
    }

    // 2. Multi-node cycle proof (od_1 -> od_2 -> od_1)
    const od1 = {
      ...req.evaluationContext.ownerDeterminationBindings[0],
      determinationBindingKey: "od_1",
      determinationDependencyDeclaration: {
        kind: "EXPLICIT" as const,
        dependencyRefs: ["od_2"],
      },
    };
    const od2 = {
      ...req.evaluationContext.ownerDeterminationBindings[0],
      determinationBindingKey: "od_2",
      determinationQuestionBinding: {
        ...req.evaluationContext.ownerDeterminationBindings[0]
          .determinationQuestionBinding,
        questionSemanticRef: {
          ...req.evaluationContext.ownerDeterminationBindings[0]
            .determinationQuestionBinding.questionSemanticRef,
          artifactId: "question-002",
        },
      },
      determinationDependencyDeclaration: {
        kind: "EXPLICIT" as const,
        dependencyRefs: ["od_1"],
      },
    };
    const cycleReq = {
      ...req,
      evaluationContext: {
        ...req.evaluationContext,
        ownerDeterminationBindings: [od1, od2],
      },
    };
    const resCycle = validateExecutionEnvelopeCompatibilityV2(cycleReq);
    expect(resCycle.ok).toBe(false);
    if (!resCycle.ok) {
      expect(resCycle.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect(resCycle.error.code).toBe("OWNER_DEPENDENCY_INCOMPATIBLE");
    }
  });

  // V205-T32
  it("V205-T32 — Owner-native result remains opaque", () => {
    const baseReq = createValidV2Request();
    const od0 = baseReq.evaluationContext.ownerDeterminationBindings[0];

    const reqAlpha: ExecutionRequestV2 = {
      ...baseReq,
      evaluationContext: {
        ...baseReq.evaluationContext,
        ownerDeterminationBindings: [
          {
            ...od0,
            ownerNativeResult: {
              syntheticResult: "ALPHA",
              decision: "DENY",
              trustStatus: "UNTRUSTED",
            },
          },
        ],
      },
    };

    const reqOmega: ExecutionRequestV2 = {
      ...baseReq,
      evaluationContext: {
        ...baseReq.evaluationContext,
        ownerDeterminationBindings: [
          {
            ...od0,
            ownerNativeResult: {
              syntheticResult: "OMEGA",
              decision: "ALLOW",
              trustStatus: "TRUSTED",
            },
          },
        ],
      },
    };

    const resAlpha = validateExecutionEnvelopeCompatibilityV2(reqAlpha);
    const resOmega = validateExecutionEnvelopeCompatibilityV2(reqOmega);

    expect(resAlpha.ok).toBe(true);
    expect(resOmega.ok).toBe(true);
  });
});

describe("CCP-RI-V2-05 Adversarial Regression Proofs (V205-H01)", () => {
  it("V205-H01 — Policy graph reference identity is collision-safe", () => {
    const polRefA: PolicyRefV2 = {
      family: "POLICY",
      ownerRef: "urn:owner:a|b",
      artifactId: "c",
      version: "1.0.0",
      stateRef: "state-001",
      provenanceRef: "prov-001",
    };

    const polRefB: PolicyRefV2 = {
      family: "POLICY",
      ownerRef: "urn:owner:a",
      artifactId: "b|c",
      version: "1.0.0",
      stateRef: "state-001",
      provenanceRef: "prov-001",
    };

    const req = createValidV2Request();

    const policyUniverse = {
      ...req.policyUniverse,
      applicablePolicyMaterial: [
        {
          policyKey: "pol_A",
          policyRef: polRefA,
          material: { rule: "rule-A" },
        },
        {
          policyKey: "pol_B",
          policyRef: polRefB,
          material: { rule: "rule-B" },
        },
      ],
      dependencyTopology: {
        dependencyEdges: [
          { dependeePolicyRef: polRefA, dependentPolicyRef: polRefB },
        ],
      },
    };

    const polRef = derivePolicyUniverseRefV2(policyUniverse);
    expect(polRef.ok).toBe(true);
    const derivedRef = polRef.ok
      ? polRef.value
      : policyUniverse.policyUniverseRef;

    const testReq = {
      ...req,
      policyUniverse: {
        ...policyUniverse,
        policyUniverseRef: derivedRef,
      },
    };

    const res = validateExecutionEnvelopeCompatibilityV2(testReq);
    expect(res.ok).toBe(true);
  });
});

describe("V2-05 Negative-Space & Boundary Audits", () => {
  it("preserves UNKNOWN subject bindings without auto-rejection", () => {
    const baseReq = createValidV2Request();
    const req: ExecutionRequestV2 = {
      ...baseReq,
      participation: {
        roleBindings: [
          {
            roleBindingKey: "rb_actor_1",
            role: "ACTOR",
            subject: { kind: "UNKNOWN" },
          },
        ],
        agencyBindings: [],
      },
      intent: {
        ...baseReq.intent,
        originatorParticipationRef: "rb_actor_1",
      },
      requestedAction: {
        ...baseReq.requestedAction,
        actionPerformerBindings: [
          {
            performerKey: "performer_1",
            actorParticipationRef: "rb_actor_1",
            agencyReliance: { kind: "NO_DELEGATED_AGENCY_RELIANCE" },
          },
        ],
      },
    };

    const res = validateExecutionEnvelopeCompatibilityV2(req);
    expect(res.ok).toBe(true);
  });

  it("does not infer ordered delegation chain for DELEGATED_AGENCY_COMPOSED", () => {
    const baseReq = createValidV2Request();
    const ab2 = {
      agencyBindingKey: "ab_2",
      actorRoleBindingRef: "rb_actor_1",
      governedSubjectRoleBindingRef: "rb_subject_1",
      terminalAgencyBasisRef: {
        family: "AGENCY_BASIS" as const,
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "agency-basis-002",
      },
    };
    const req: ExecutionRequestV2 = {
      ...baseReq,
      participation: {
        ...baseReq.participation,
        agencyBindings: [...baseReq.participation.agencyBindings, ab2],
      },
      requestedAction: {
        ...baseReq.requestedAction,
        actionPerformerBindings: [
          {
            performerKey: "performer_1",
            actorParticipationRef: "rb_actor_1",
            agencyReliance: {
              kind: "DELEGATED_AGENCY_COMPOSED",
              agencyBindingRefs: ["ab_2", "ab_1"], // reverse order
              agencyCompositionBasisRef: {
                family: "AGENCY_BASIS",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "comp-basis-001",
              },
            },
          },
        ],
      },
    };

    const res = validateExecutionEnvelopeCompatibilityV2(req);
    expect(res.ok).toBe(true);
  });

  it("production code contains no prohibited imports, side effects, or domain logic", () => {
    const code = readFileSync(
      resolve(
        process.cwd(),
        "packages/runtime/src/v2/executionEnvelopeCompatibility.ts",
      ),
      "utf8",
    );

    expect(code).not.toContain("@zyppi/api");
    expect(code).not.toContain("apps/api");
    expect(code).not.toContain("compatibilityValidator");
    expect(code).not.toContain("validateCompositionCompatibility");
    expect(code).not.toContain("runInternalPipeline");
    expect(code).not.toContain("materializeResolutionGraph");
    expect(code).not.toContain("evaluatePolicies");
    expect(code).not.toContain("generateReceiptHashes");
    expect(code).not.toContain("Date.now");
    expect(code).not.toContain("new Date");
    expect(code).not.toContain("Math.random");
    expect(code).not.toContain("randomUUID");
    expect(code).not.toContain("process.env");
    expect(code).not.toContain("GS1");
    expect(code).not.toContain("GTIN");
    expect(code).not.toContain("GLN");
    expect(code).not.toContain("Digital Link");
    expect(code).not.toContain("DPP");
  });

  it("production code contains no owner-result semantic interpretation branching", () => {
    const code = readFileSync(
      resolve(
        process.cwd(),
        "packages/runtime/src/v2/executionEnvelopeCompatibility.ts",
      ),
      "utf8",
    );

    expect(code).not.toContain('ownerNativeResult === "ALLOW"');
    expect(code).not.toContain("ownerNativeResult.status");
    expect(code).not.toContain("ownerNativeResult.decision");
    expect(code).not.toContain("ownerNativeResult.trust");
  });
});

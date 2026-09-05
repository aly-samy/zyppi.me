import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  deriveEvidenceStateRefV2,
  derivePolicyUniverseRefV2,
  deriveSemanticStateRefV2,
  type ExecutionRequestV2,
} from "@zyppi/domain";

import * as RuntimePublicExport from "../index.js";
import { validateExecutionEnvelopeCompatibilityV2 } from "./executionEnvelopeCompatibility.js";
import { prepareProductionExecutionV2 } from "./productionExecutionBoundary.js";

// Helper function creating a valid generic V2 request fixture
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

describe("CCP-RI-V2-06 Production / Test Isolation Mandate (V206-T01..V206-T30)", () => {
  // V206-T01 — Valid V2 request prepares production frame
  it("V206-T01 — Valid V2 request prepares production frame", () => {
    const req = createValidV2Request();
    const res = prepareProductionExecutionV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.kind).toBe("PRODUCTION_EXECUTION_V2");
      expect(res.frame.executionRequest).toBeDefined();
      expect(res.frame.wholeRequestDigestCandidate).toMatch(
        /^sha256:[0-9a-f]{64}$/,
      );
    }
  });

  // V206-T02 — Structural failure remains V2-owned
  it("V206-T02 — Structural failure remains V2-owned", () => {
    const req = createValidV2Request();
    const malformed = {
      ...req,
      unknownTopLevelProperty: "forbidden",
    };
    const res = prepareProductionExecutionV2(malformed);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("STRUCTURAL_VALIDATION");
      expect((res.error as { code: string }).code).toBe("UNKNOWN_FIELD");
    }
  });

  // V206-T03 — Identity failure remains V2-02-owned
  it("V206-T03 — Identity failure remains V2-02-owned", () => {
    const req = createValidV2Request();
    const badComponent = {
      ...req,
      constitutionalState: {
        ...req.constitutionalState,
        semanticStateRef:
          "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      },
    };
    const res = prepareProductionExecutionV2(badComponent);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("IDENTITY_VALIDATION");
      expect((res.error as { code: string }).code).toBe(
        "COMPONENT_DIGEST_MISMATCH",
      );
    }
  });

  // V206-T04 — Compatibility failure remains V2-05-owned
  it("V206-T04 — Compatibility failure remains V2-05-owned", () => {
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
    const res = prepareProductionExecutionV2(badPerformer);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("EXECUTION_ENVELOPE_COMPATIBILITY");
      expect((res.error as { code: string }).code).toBe(
        "ROLE_BINDING_INCOMPATIBLE",
      );
    }
  });

  // V206-T05 — Digest continuity equals direct V2-05
  it("V206-T05 — Digest continuity equals direct V2-05", () => {
    const req = createValidV2Request();
    const directRes = validateExecutionEnvelopeCompatibilityV2(req);
    expect(directRes.ok).toBe(true);
    const prodRes = prepareProductionExecutionV2(req);
    expect(prodRes.ok).toBe(true);
    if (directRes.ok && prodRes.ok) {
      expect(prodRes.frame.wholeRequestDigestCandidate).toBe(
        directRes.wholeRequestDigestCandidate,
      );
    }
  });

  // V206-T06 — Deterministic repeatability
  it("V206-T06 — Deterministic repeatability", () => {
    const req = createValidV2Request();
    const res1 = prepareProductionExecutionV2(req);
    const res2 = prepareProductionExecutionV2(req);
    expect(res1).toEqual(res2);
  });

  // V206-T07 — Root alias broken
  it("V206-T07 — Root alias broken", () => {
    const req = createValidV2Request();
    const res = prepareProductionExecutionV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.frame.executionRequest).not.toBe(req);
    }
  });

  // V206-T08 — Nested aliases broken
  it("V206-T08 — Nested aliases broken", () => {
    const req = createValidV2Request();
    const res = prepareProductionExecutionV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const snap = res.frame.executionRequest;
      expect(snap.participation).not.toBe(req.participation);
      expect(snap.policyUniverse).not.toBe(req.policyUniverse);
      expect(snap.evaluationContext).not.toBe(req.evaluationContext);
      expect(snap.participation.roleBindings).not.toBe(
        req.participation.roleBindings,
      );
      expect(
        snap.evaluationContext.ownerDeterminationBindings[0].ownerNativeResult,
      ).not.toBe(
        req.evaluationContext.ownerDeterminationBindings[0].ownerNativeResult,
      );
    }
  });

  // V206-T09 — Caller source is not mutated during preparation
  it("V206-T09 — Caller source is not mutated during preparation", () => {
    const req = createValidV2Request();
    const beforeCall = JSON.parse(JSON.stringify(req));
    prepareProductionExecutionV2(req);
    expect(JSON.parse(JSON.stringify(req))).toEqual(beforeCall);
  });

  // V206-T10 — Caller mutation after preparation cannot alter frame
  it("V206-T10 — Caller mutation after preparation cannot alter frame", () => {
    const req = createValidV2Request();
    const res = prepareProductionExecutionV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const originalDigest = res.frame.wholeRequestDigestCandidate;
      const originalReqId = res.frame.executionRequest.requestId;

      // Deeply mutate caller's original object graph through untyped casting
      (req as unknown as Record<string, unknown>).requestId =
        "MUTATED_CALLER_REQUEST_ID";
      (
        req.participation.roleBindings[0] as unknown as Record<string, unknown>
      ).roleBindingKey = "MUTATED_KEY";
      (
        req.evaluationContext.ownerDeterminationBindings[0]
          .ownerNativeResult as Record<string, unknown>
      ).result = "MUTATED_RESULT";

      expect(res.frame.executionRequest.requestId).toBe(originalReqId);
      expect(res.frame.executionRequest.requestId).not.toBe(
        "MUTATED_CALLER_REQUEST_ID",
      );
      expect(
        res.frame.executionRequest.participation.roleBindings[0].roleBindingKey,
      ).toBe("rb_actor_1");
      expect(res.frame.wholeRequestDigestCandidate).toBe(originalDigest);
    }
  });

  // V206-T11 — Root request frozen
  it("V206-T11 — Root request frozen", () => {
    const req = createValidV2Request();
    const res = prepareProductionExecutionV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(Object.isFrozen(res.frame.executionRequest)).toBe(true);
    }
  });

  // V206-T12 — Nested objects frozen
  it("V206-T12 — Nested objects frozen", () => {
    const req = createValidV2Request();
    const res = prepareProductionExecutionV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const snap = res.frame.executionRequest;
      expect(Object.isFrozen(snap.participation)).toBe(true);
      expect(Object.isFrozen(snap.policyUniverse)).toBe(true);
      expect(Object.isFrozen(snap.evaluationContext)).toBe(true);
      expect(
        Object.isFrozen(
          snap.evaluationContext.ownerDeterminationBindings[0]
            .ownerNativeResult,
        ),
      ).toBe(true);
    }
  });

  // V206-T13 — Nested arrays frozen
  it("V206-T13 — Nested arrays frozen", () => {
    const req = createValidV2Request();
    const res = prepareProductionExecutionV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const snap = res.frame.executionRequest;
      expect(Object.isFrozen(snap.participation.roleBindings)).toBe(true);
      expect(Object.isFrozen(snap.participation.agencyBindings)).toBe(true);
      expect(
        Object.isFrozen(
          snap.evaluationContext.ownerDeterminationBindings[0]
            .determinationQuestionBinding.questionOperandBindings,
        ),
      ).toBe(true);
    }
  });

  // V206-T14 — Production frame frozen
  it("V206-T14 — Production frame frozen", () => {
    const req = createValidV2Request();
    const res = prepareProductionExecutionV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(Object.isFrozen(res)).toBe(true);
      expect(Object.isFrozen(res.frame)).toBe(true);
    }
  });

  // V206-T15 — Mutation attempt cannot change production snapshot
  it("V206-T15 — Mutation attempt cannot change production snapshot", () => {
    const req = createValidV2Request();
    const res = prepareProductionExecutionV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const snap = res.frame.executionRequest;
      expect(() => {
        (snap as unknown as Record<string, unknown>).requestId =
          "HACKED_REQUEST_ID";
      }).toThrow();
      expect(snap.requestId).not.toBe("HACKED_REQUEST_ID");
    }
  });

  // V206-T16 — Extra JS override argument has zero effect
  it("V206-T16 — Extra JS override argument has zero effect", () => {
    const req = createValidV2Request();
    const res1 = prepareProductionExecutionV2(req);

    // Call through untyped JS interface passing extra arguments
    const fn = prepareProductionExecutionV2 as (
      a: unknown,
      b: unknown,
      c: unknown,
    ) => ReturnType<typeof prepareProductionExecutionV2>;
    const res2 = fn(
      req,
      {
        outcome: "verified",
        trustResult: { synthetic: "TRUSTED" },
        Admission: { ok: true },
        "Active Execution": { ok: true },
      },
      "extra_arg",
    );

    expect(res1).toEqual(res2);
  });

  // V206-T17 — Top-level overrides rejected
  it("V206-T17 — Top-level overrides rejected", () => {
    const req = createValidV2Request();
    const badReq = {
      ...req,
      overrides: {},
    };
    const res = prepareProductionExecutionV2(badReq);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("STRUCTURAL_VALIDATION");
    }
  });

  // V206-T18 — Top-level outcome rejected
  it("V206-T18 — Top-level outcome rejected", () => {
    const req = createValidV2Request();
    const badReq = {
      ...req,
      outcome: "verified",
    };
    const res = prepareProductionExecutionV2(badReq);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("STRUCTURAL_VALIDATION");
    }
  });

  // V206-T19 — Top-level trustResult rejected
  it("V206-T19 — Top-level trustResult rejected", () => {
    const req = createValidV2Request();
    const badReq = {
      ...req,
      trustResult: { status: "TRUSTED" },
    };
    const res = prepareProductionExecutionV2(badReq);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("STRUCTURAL_VALIDATION");
    }
  });

  // V206-T20 — Legacy stage field rejected
  it("V206-T20 — Legacy stage field rejected", () => {
    const req = createValidV2Request();
    const badReq1 = {
      ...req,
      Admission: { ok: true },
    };
    const res1 = prepareProductionExecutionV2(badReq1);
    expect(res1.ok).toBe(false);
    if (!res1.ok) {
      expect(res1.stage).toBe("STRUCTURAL_VALIDATION");
    }

    const badReq2 = {
      ...req,
      "Active Execution": { ok: true },
    };
    const res2 = prepareProductionExecutionV2(badReq2);
    expect(res2.ok).toBe(false);
    if (!res2.ok) {
      expect(res2.stage).toBe("STRUCTURAL_VALIDATION");
    }
  });

  // V206-T21 — Caller-selected testMode rejected
  it("V206-T21 — Caller-selected testMode rejected", () => {
    const req = createValidV2Request();
    const badReq = {
      ...req,
      testMode: true,
    };
    const res = prepareProductionExecutionV2(badReq);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.stage).toBe("STRUCTURAL_VALIDATION");
    }
  });

  // V206-T22 — Owner-native semantic-looking values remain opaque
  it("V206-T22 — Owner-native semantic-looking values remain opaque", () => {
    const req = createValidV2Request();
    const reqOpaque: ExecutionRequestV2 = {
      ...req,
      evaluationContext: {
        ...req.evaluationContext,
        ownerDeterminationBindings: [
          {
            ...req.evaluationContext.ownerDeterminationBindings[0],
            ownerNativeResult: {
              reportedVocabulary: "ALLOW",
              decision: "DENY",
              status: "TRUSTED",
              field: "outcome",
              trustResult: "UNTRUSTED",
            },
          },
        ],
      },
    };

    const res = prepareProductionExecutionV2(reqOpaque);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const resResult =
        res.frame.executionRequest.evaluationContext
          .ownerDeterminationBindings[0].ownerNativeResult;
      expect(resResult).toEqual({
        reportedVocabulary: "ALLOW",
        decision: "DENY",
        status: "TRUSTED",
        field: "outcome",
        trustResult: "UNTRUSTED",
      });
    }
  });

  // V206-T23 — Nested opaque Admission / stage-like keys remain lawful
  it("V206-T23 — Nested opaque Admission / stage-like keys remain lawful", () => {
    const req = createValidV2Request();
    const reqNestedStage: ExecutionRequestV2 = {
      ...req,
      evaluationContext: {
        ...req.evaluationContext,
        ownerDeterminationBindings: [
          {
            ...req.evaluationContext.ownerDeterminationBindings[0],
            ownerNativeResult: {
              Admission: "PASS",
              "Active Execution": "COMPLETED",
            },
          },
        ],
      },
    };

    const res = prepareProductionExecutionV2(reqNestedStage);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(
        res.frame.executionRequest.evaluationContext
          .ownerDeterminationBindings[0].ownerNativeResult,
      ).toEqual({
        Admission: "PASS",
        "Active Execution": "COMPLETED",
      });
    }
  });

  // V206-T24 — Negative zero preserved
  it("V206-T24 — Negative zero preserved", () => {
    const req = createValidV2Request();
    const reqNegZero: ExecutionRequestV2 = {
      ...req,
      evaluationContext: {
        ...req.evaluationContext,
        ownerDeterminationBindings: [
          {
            ...req.evaluationContext.ownerDeterminationBindings[0],
            ownerNativeResult: {
              negativeZeroValue: -0,
            },
          },
        ],
      },
    };

    const res = prepareProductionExecutionV2(reqNegZero);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const val = (
        res.frame.executionRequest.evaluationContext
          .ownerDeterminationBindings[0].ownerNativeResult as Record<
          string,
          unknown
        >
      ).negativeZeroValue;
      expect(Object.is(val, -0)).toBe(true);
    }
  });

  // V206-T25 — "__proto__" preserved as data without pollution
  it("V206-T25 — '__proto__' preserved as data without pollution", () => {
    const req = createValidV2Request();

    const customResult = Object.create(null);
    Object.defineProperty(customResult, "__proto__", {
      value: "dataValue",
      enumerable: true,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(customResult, "normalKey", {
      value: "normalValue",
      enumerable: true,
      writable: true,
      configurable: true,
    });

    const reqProto: ExecutionRequestV2 = {
      ...req,
      evaluationContext: {
        ...req.evaluationContext,
        ownerDeterminationBindings: [
          {
            ...req.evaluationContext.ownerDeterminationBindings[0],
            ownerNativeResult: customResult,
          },
        ],
      },
    };

    const res = prepareProductionExecutionV2(reqProto);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const snapResult =
        res.frame.executionRequest.evaluationContext
          .ownerDeterminationBindings[0].ownerNativeResult;
      expect(
        Object.prototype.hasOwnProperty.call(snapResult, "__proto__"),
      ).toBe(true);
      expect((snapResult as Record<string, unknown>).__proto__).toBe(
        "dataValue",
      );
      expect(
        (Object.prototype as Record<string, unknown>).dataValue,
      ).toBeUndefined();
    }
  });

  // V206-T26 — "constructor" / "prototype" remain data
  it("V206-T26 — 'constructor' / 'prototype' remain data", () => {
    const req = createValidV2Request();
    const reqDataKeys: ExecutionRequestV2 = {
      ...req,
      evaluationContext: {
        ...req.evaluationContext,
        ownerDeterminationBindings: [
          {
            ...req.evaluationContext.ownerDeterminationBindings[0],
            ownerNativeResult: {
              constructor: "custom_constructor_string",
              prototype: "custom_prototype_string",
            },
          },
        ],
      },
    };

    const res = prepareProductionExecutionV2(reqDataKeys);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const snapResult =
        res.frame.executionRequest.evaluationContext
          .ownerDeterminationBindings[0].ownerNativeResult;
      expect((snapResult as Record<string, unknown>).constructor).toBe(
        "custom_constructor_string",
      );
      expect((snapResult as Record<string, unknown>).prototype).toBe(
        "custom_prototype_string",
      );
    }
  });

  // V206-T27 — Production source contains no V1 override/runtime pipeline import
  it("V206-T27 — Production source contains no V1 override/runtime pipeline import", () => {
    const code = readFileSync(
      resolve(
        process.cwd(),
        "packages/runtime/src/v2/productionExecutionBoundary.ts",
      ),
      "utf8",
    );

    expect(code).not.toContain("StageOverrideConfig");
    expect(code).not.toContain("runInternalPipeline");
    expect(code).not.toContain("LifecycleStage");
    expect(code).not.toContain("PipelineResult");
  });

  // V206-T28 — Production source contains no caller-result semantics
  it("V206-T28 — Production source contains no caller-result semantics", () => {
    const code = readFileSync(
      resolve(
        process.cwd(),
        "packages/runtime/src/v2/productionExecutionBoundary.ts",
      ),
      "utf8",
    );

    expect(code).not.toContain("TrustResult");
    expect(code).not.toContain("Outcome");
    expect(code).not.toContain("StageOverrideConfigV2");
    expect(code).not.toContain("testMode");
    expect(code).not.toContain("allowOverrides");
    expect(code).not.toContain("NODE_ENV");
    expect(code).not.toContain("process.env");
  });

  // V206-T29 — Domain neutrality / zero-I/O audit
  it("V206-T29 — Domain neutrality / zero-I/O audit", () => {
    const code = readFileSync(
      resolve(
        process.cwd(),
        "packages/runtime/src/v2/productionExecutionBoundary.ts",
      ),
      "utf8",
    );

    expect(code).not.toContain("GS1");
    expect(code).not.toContain("GTIN");
    expect(code).not.toContain("GLN");
    expect(code).not.toContain("Digital Link");
    expect(code).not.toContain("DPP");
    expect(code).not.toContain("Date.now");
    expect(code).not.toContain("new Date");
    expect(code).not.toContain("Math.random");
    expect(code).not.toContain("randomUUID");
    expect(code).not.toContain("fs");
    expect(code).not.toContain("fetch");
  });

  // V206-T30 — Public API containment
  it("V206-T30 — Public API containment", () => {
    const exportedFunctions = Object.keys(RuntimePublicExport).filter(
      (key) =>
        typeof (RuntimePublicExport as Record<string, unknown>)[key] ===
        "function",
    );

    expect(exportedFunctions).toEqual([
      "validateExecutionEnvelopeCompatibilityV2",
      "prepareProductionExecutionV2",
    ]);
  });
});

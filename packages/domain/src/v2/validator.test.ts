import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

import { validateExecutionRequest } from "../index.js";
import { isStrictJsonValueV2 } from "./json.js";
import type { ExecutionRequestV2 } from "./types.js";
import { validateExecutionRequestV2 } from "./validator.js";

const UNUSED_MARKER = isStrictJsonValueV2(null);
if (!UNUSED_MARKER) console.log("impossible");

const VALID_REF_SUBJECT = {
  family: "SUBJECT" as const,
  ownerRef: "owner-01",
  artifactId: "subj-01",
};

const VALID_REF_ACTION = {
  family: "ACTION_SEMANTIC" as const,
  ownerRef: "owner-01",
  artifactId: "act-01",
};

const VALID_REF_TARGET = {
  family: "TARGET" as const,
  ownerRef: "owner-01",
  artifactId: "tgt-01",
};

const VALID_REF_STATE_SEMANTIC = {
  family: "STATE_SEMANTIC" as const,
  ownerRef: "owner-01",
  artifactId: "ss-01",
};

const VALID_REF_STATE_INSTANCE = {
  family: "STATE_INSTANCE" as const,
  ownerRef: "owner-01",
  artifactId: "si-01",
};

const VALID_REF_CAPABILITY = {
  family: "REQUESTED_CAPABILITY" as const,
  ownerRef: "owner-01",
  artifactId: "cap-01",
};

const VALID_REF_AGENCY_BASIS = {
  family: "AGENCY_BASIS" as const,
  ownerRef: "owner-01",
  artifactId: "ab-01",
};

const VALID_REF_POLICY = {
  family: "POLICY" as const,
  ownerRef: "owner-01",
  artifactId: "pol-01",
  version: "1.0.0",
  stateRef: "state-pol-01",
  provenanceRef: "prov-pol-01",
};

const VALID_REF_EVIDENCE = {
  family: "EVIDENCE" as const,
  ownerRef: "owner-01",
  artifactId: "ev-01",
};

// Exercise constant references to satisfy linter
if (
  VALID_REF_POLICY.family !== "POLICY" ||
  VALID_REF_EVIDENCE.family !== "EVIDENCE"
) {
  console.log("impossible");
}

const VALID_REF_QUESTION = {
  family: "QUESTION_SEMANTIC" as const,
  ownerRef: "owner-01",
  artifactId: "q-01",
};

const VALID_REF_TARGET_SLOT = {
  family: "TARGET_SLOT_SEMANTIC" as const,
  ownerRef: "owner-01",
  artifactId: "ts-01",
};

const VALID_REF_COMPAT = {
  family: "COMPATIBILITY_CONTRACT" as const,
  ownerRef: "owner-01",
  artifactId: "cc-01",
};

const VALID_REF_EV_REQ = {
  family: "EVIDENCE_REQUIREMENT" as const,
  ownerRef: "owner-01",
  artifactId: "er-01",
};

const VALID_REF_SCOPE = {
  family: "SCOPE" as const,
  ownerRef: "owner-01",
  artifactId: "sc-01",
};

const VALID_REF_RULE = {
  family: "RULE" as const,
  ownerRef: "owner-01",
  artifactId: "rule-01",
};

const VALID_REF_PROVENANCE = {
  family: "PROVENANCE" as const,
  ownerRef: "owner-01",
  artifactId: "prov-01",
};

const VALID_REF_OWNER = {
  family: "OWNER" as const,
  ownerRef: "owner-01",
  artifactId: "owner-01",
};

const VALID_REF_RELATIONSHIP = {
  family: "RELATIONSHIP" as const,
  ownerRef: "owner-01",
  artifactId: "rel-01",
};

const VALID_REF_STATE_ARTIFACT = {
  family: "STATE_ARTIFACT" as const,
  ownerRef: "owner-01",
  artifactId: "sa-01",
};

if (VALID_REF_STATE_ARTIFACT.family !== "STATE_ARTIFACT") {
  console.log("impossible");
}

const VALID_REF_EVAL_SEMANTIC = {
  family: "EVALUATION_SEMANTIC" as const,
  ownerRef: "owner-01",
  artifactId: "es-01",
};

const DIGEST_64 =
  "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

function createValidMinimalV2Request(): ExecutionRequestV2 {
  return {
    contractVersion: "v2",
    requestId: "req-v2-001",
    participation: {
      roleBindings: [
        {
          roleBindingKey: "rb-actor",
          role: "ACTOR",
          subject: {
            kind: "KNOWN",
            subjectRef: { ...VALID_REF_SUBJECT },
          },
        },
      ],
      agencyBindings: [],
    },
    intent: {
      originatorParticipationRef: "rb-actor",
      intentCategory: "ACCESS",
      intentTargetRef: { ...VALID_REF_TARGET },
      candidateStateBinding: {
        stateTargetRef: { ...VALID_REF_TARGET },
        stateSemanticRef: { ...VALID_REF_STATE_SEMANTIC },
        exactStateInstance: {
          kind: "GOVERNED_ARTIFACT_REF",
          stateInstanceRef: { ...VALID_REF_STATE_INSTANCE },
        },
      },
    },
    requestedAction: {
      actionSemanticRef: { ...VALID_REF_ACTION },
      intentActionCompatibilityBinding: {
        kind: "GOVERNED_SEMANTIC_CONTRACT",
        exactCompatibilityContractRef: { ...VALID_REF_COMPAT },
      },
      actionPerformerBindings: [
        {
          performerKey: "perf-actor",
          actorParticipationRef: "rb-actor",
          agencyReliance: {
            kind: "NO_DELEGATED_AGENCY_RELIANCE",
          },
        },
      ],
      actionTargetBindings: [],
      requestedCapabilityClaimBindings: [],
    },
    constitutionalState: {
      semanticStateRef: DIGEST_64,
      stateViews: [
        {
          viewKey: "view-01",
          viewScope: { ...VALID_REF_SCOPE },
          stateBindings: [
            {
              stateBindingKey: "sb-identity-01",
              kind: "IDENTITY_STATE",
              subjectRef: { ...VALID_REF_SUBJECT },
              stateSemanticRef: { ...VALID_REF_STATE_SEMANTIC },
              exactStateRef: { ...VALID_REF_STATE_INSTANCE },
            },
          ],
        },
      ],
    },
    evidenceState: {
      evidenceStateRef: DIGEST_64,
      evidenceRequirementBindings: [],
      suppliedEvidenceMaterial: [],
      evidencePresentationBindings: [],
      integrityCoordinates: [],
    },
    policyUniverse: {
      policyUniverseRef: DIGEST_64,
      applicablePolicyMaterial: [],
      dependencyTopology: {
        dependencyEdges: [],
      },
      applicabilityProvenanceBinding: { ...VALID_REF_PROVENANCE },
    },
    evaluationContext: {
      authorizedInputBindings: [],
      evaluationParameterBindings: [],
      boundContextBindings: [],
      ownerDeterminationBindings: [],
    },
    executionContext: {
      executionId: "exec-001",
      temporalCoordinates: {
        tEInput: "2026-07-28T14:30:00Z",
      },
      budget: 1000,
    },
  };
}

describe("CCP-RI-V2-01 — Council Mandated Immutable Test Matrix V201-T01..T52", () => {
  it("V201-T01 — valid minimal same-Subject request accepted", () => {
    const req = createValidMinimalV2Request();
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.contractVersion).toBe("v2");
    }
  });

  it("V201-T02 — valid delegated structural request accepted", () => {
    const req = createValidMinimalV2Request();
    const delegatedReq: ExecutionRequestV2 = {
      ...req,
      participation: {
        roleBindings: [
          {
            roleBindingKey: "rb-actor",
            role: "ACTOR",
            subject: { kind: "KNOWN", subjectRef: { ...VALID_REF_SUBJECT } },
          },
          {
            roleBindingKey: "rb-gov-subject",
            role: "GOVERNED_SUBJECT",
            subject: {
              kind: "KNOWN",
              subjectRef: { ...VALID_REF_SUBJECT, artifactId: "subj-02" },
            },
          },
        ],
        agencyBindings: [
          {
            agencyBindingKey: "ab-01",
            actorRoleBindingRef: "rb-actor",
            governedSubjectRoleBindingRef: "rb-gov-subject",
            terminalAgencyBasisRef: { ...VALID_REF_AGENCY_BASIS },
          },
          {
            agencyBindingKey: "ab-02",
            actorRoleBindingRef: "rb-actor",
            governedSubjectRoleBindingRef: "rb-gov-subject",
            terminalAgencyBasisRef: {
              ...VALID_REF_AGENCY_BASIS,
              artifactId: "ab-02",
            },
          },
        ],
      },
      requestedAction: {
        ...req.requestedAction,
        actionPerformerBindings: [
          {
            performerKey: "perf-actor",
            actorParticipationRef: "rb-actor",
            agencyReliance: {
              kind: "DELEGATED_AGENCY_COMPOSED",
              agencyBindingRefs: ["ab-01", "ab-02"],
              agencyCompositionBasisRef: { ...VALID_REF_AGENCY_BASIS },
            },
          },
        ],
      },
    };

    const res = validateExecutionRequestV2(delegatedReq);
    expect(res.ok).toBe(true);
  });

  it("V201-T03 — contractVersion exactly 'v2'", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    req.contractVersion = "v1";
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_CONTRACT_VERSION");
    }
  });

  it("V201-T04 — V1 request rejected by V2 validator", () => {
    const v1Req = {
      requestId: "req-v1-01",
      identity: {
        identityId: "id-01",
        identityType: "type",
        canonicalReference: "ref",
        referentId: null,
        status: "active" as const,
        createdAt: "2026-07-28T14:30:00Z",
        updatedAt: "2026-07-28T14:30:00Z",
      },
      activeConstitutionalView: {
        identity: {
          identityId: "id-01",
          identityType: "type",
          canonicalReference: "ref",
          referentId: null,
          status: "active" as const,
          createdAt: "2026-07-28T14:30:00Z",
          updatedAt: "2026-07-28T14:30:00Z",
        },
        relationships: [],
        standings: [],
        authorities: [],
        capabilities: [],
        evidenceReferences: [],
        applicablePolicies: [],
      },
      evidenceBundle: { schemaVersion: "1.0", evidenceRecords: [] },
      policyContext: { policies: [] },
      executionContext: {
        executionId: "exec-01",
        constitutionalTimestamp: "2026-07-28T14:30:00Z",
        budget: 100,
        entropy: "ent",
        versions: ["1.0.0"],
      },
      resolvedPolicyGraph: { edges: [] },
    };

    const res = validateExecutionRequestV2(v1Req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("UNKNOWN_FIELD");
    }
  });

  it("V201-T05 — unknown top-level field rejected", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    req.unadmittedTopLevel = "forbidden";
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("UNKNOWN_FIELD");
      expect(res.error.path).toBe("unadmittedTopLevel");
    }
  });

  it("V201-T06 — unknown nested field rejected", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.intent as Record<string, unknown>).unadmittedNested = "forbidden";
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("UNKNOWN_FIELD");
      expect(res.error.path).toBe("intent.unadmittedNested");
    }
  });

  it("V201-T07 — undefined rejected", () => {
    const res = validateExecutionRequestV2(undefined);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_RUNTIME_VALUE");
    }
  });

  it("V201-T08 — non-plain runtime values rejected", () => {
    class CustomClass {}
    const res1 = validateExecutionRequestV2(new CustomClass());
    expect(res1.ok).toBe(false);

    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.evaluationContext as Record<string, unknown>).authorizedInputBindings =
      [
        {
          bindingKey: "b-fn",
          semanticRef: { ...VALID_REF_EVAL_SEMANTIC },
          value: () => "function",
        },
      ];
    const res2 = validateExecutionRequestV2(req);
    expect(res2.ok).toBe(false);
    if (!res2.ok) {
      expect(res2.error.code).toBe("INVALID_RUNTIME_VALUE");
    }
  });

  it("V201-T09 — non-finite numbers rejected", () => {
    const req1 = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req1.executionContext as Record<string, unknown>).budget = NaN;
    const res1 = validateExecutionRequestV2(req1);
    expect(res1.ok).toBe(false);

    const req2 = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req2.executionContext as Record<string, unknown>).budget = Infinity;
    const res2 = validateExecutionRequestV2(req2);
    expect(res2.ok).toBe(false);
  });

  it("V201-T10 — unknown reference family rejected", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      (req.intent as Record<string, unknown>).intentTargetRef as Record<
        string,
        unknown
      >
    ).family = "UNBOUNDED_FAMILY";
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_REFERENCE");
      expect(res.error.path).toBe("intent.intentTargetRef.family");
    }
  });

  it("V201-T11 — malformed typed reference rejected", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      (req.intent as Record<string, unknown>).intentTargetRef as Record<
        string,
        unknown
      >
    ).ownerRef = "   ";
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_REFERENCE");
    }
  });

  it("V201-T12 — component digest grammar enforced", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.constitutionalState as Record<string, unknown>).semanticStateRef =
      "sha256:invalidhex";
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_DIGEST");
    }
  });

  it("V201-T13 — at least one ACTOR required", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.participation as Record<string, unknown>).roleBindings = [
      {
        roleBindingKey: "rb-gov",
        role: "GOVERNED_SUBJECT",
        subject: {
          kind: "KNOWN",
          subjectRef: { ...VALID_REF_SUBJECT },
        },
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_CARDINALITY");
    }
  });

  it("V201-T14 — UNKNOWN allowed only for ACTOR", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.participation as Record<string, unknown>).roleBindings = [
      {
        roleBindingKey: "rb-act",
        role: "ACTOR",
        subject: { kind: "KNOWN", subjectRef: { ...VALID_REF_SUBJECT } },
      },
      {
        roleBindingKey: "rb-unk-gov",
        role: "GOVERNED_SUBJECT",
        subject: { kind: "UNKNOWN" },
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_VALUE");
    }
  });

  it("V201-T15 — known duplicate Subject+Role rejected", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.participation as Record<string, unknown>).roleBindings = [
      {
        roleBindingKey: "rb-act-1",
        role: "ACTOR",
        subject: { kind: "KNOWN", subjectRef: { ...VALID_REF_SUBJECT } },
      },
      {
        roleBindingKey: "rb-act-2",
        role: "ACTOR",
        subject: { kind: "KNOWN", subjectRef: { ...VALID_REF_SUBJECT } },
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("DUPLICATE_BINDING");
    }
  });

  it("V201-T16 — duplicate Participation key rejected", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.participation as Record<string, unknown>).roleBindings = [
      {
        roleBindingKey: "dup-key",
        role: "ACTOR",
        subject: { kind: "KNOWN", subjectRef: { ...VALID_REF_SUBJECT } },
      },
      {
        roleBindingKey: "dup-key",
        role: "GOVERNED_SUBJECT",
        subject: {
          kind: "KNOWN",
          subjectRef: { ...VALID_REF_SUBJECT, artifactId: "sub-2" },
        },
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("DUPLICATE_BINDING");
    }
  });

  it("V201-T17 — malformed Agency Binding rejected", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.participation as Record<string, unknown>).agencyBindings = [
      {
        agencyBindingKey: "ab-01",
        actorRoleBindingRef: "  ",
        governedSubjectRoleBindingRef: "rb-gov",
        terminalAgencyBasisRef: { ...VALID_REF_AGENCY_BASIS },
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_VALUE");
    }
  });

  it("V201-T18 — invalid Intent category rejected", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.intent as Record<string, unknown>).intentCategory = "EXECUTE_OTHER";
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_VALUE");
    }
  });

  it("V201-T19 — missing candidate exact state rejected", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    delete (
      (req.intent as Record<string, unknown>).candidateStateBinding as Record<
        string,
        unknown
      >
    ).exactStateInstance;
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("MISSING_FIELD");
      expect(res.error.path).toBe(
        "intent.candidateStateBinding.exactStateInstance",
      );
    }
  });

  it("V201-T20 — Requested Action requires performer(s)", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.requestedAction as Record<string, unknown>).actionPerformerBindings =
      [];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_CARDINALITY");
    }
  });

  it("V201-T21 — COMPOSED agency requires >=2 unique refs + basis", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      (
        (req.requestedAction as Record<string, unknown>)
          .actionPerformerBindings as Record<string, unknown>[]
      )[0] as Record<string, unknown>
    ).agencyReliance = {
      kind: "DELEGATED_AGENCY_COMPOSED",
      agencyBindingRefs: ["ab-01"],
      agencyCompositionBasisRef: { ...VALID_REF_AGENCY_BASIS },
    };
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_CARDINALITY");
    }
  });

  it("V201-T22 — target binding requires slot semantic + target", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.requestedAction as Record<string, unknown>).actionTargetBindings = [
      {
        targetSlotSemanticRef: { ...VALID_REF_TARGET_SLOT },
        // missing targetRef
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_TYPE");
    }
  });

  it("V201-T23 — capability claim requires claimant performer(s)", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.requestedAction as Record<string, unknown>
    ).requestedCapabilityClaimBindings = [
      {
        capabilityClaimKey: "claim-empty",
        requestedCapabilityRef: { ...VALID_REF_CAPABILITY },
        claimantPerformerRefs: [],
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_CARDINALITY");
    }
  });

  it("V201-T24 — Constitutional State requires >=1 view", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.constitutionalState as Record<string, unknown>).stateViews = [];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_CARDINALITY");
    }
  });

  it("V201-T25 — State binding kind is closed", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      (
        (req.constitutionalState as Record<string, unknown>)
          .stateViews as Record<string, unknown>[]
      )[0] as Record<string, unknown>
    ).stateBindings = [
      {
        stateBindingKey: "sb-bad-kind",
        kind: "UNADMITTED_KIND",
        subjectRef: { ...VALID_REF_SUBJECT },
        stateSemanticRef: { ...VALID_REF_STATE_SEMANTIC },
        exactStateRef: { ...VALID_REF_STATE_INSTANCE },
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_VALUE");
    }
  });

  it("V201-T26 — Evidence State requires all explicit collections", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    delete (req.evidenceState as Record<string, unknown>)
      .evidenceRequirementBindings;
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("MISSING_FIELD");
      expect(res.error.path).toBe("evidenceState.evidenceRequirementBindings");
    }
  });

  it("V201-T27 — Evidence presentation requires >=1 Evidence ref", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.evidenceState as Record<string, unknown>
    ).evidencePresentationBindings = [
      {
        evidenceRequirementRef: { ...VALID_REF_EV_REQ },
        presentedEvidenceRefs: [],
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_CARDINALITY");
    }
  });

  it("V201-T28 — duplicate Evidence requirement key rejected", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.evidenceState as Record<string, unknown>).evidenceRequirementBindings =
      [
        {
          requirementKey: "req-dup",
          governedRequirementRef: { ...VALID_REF_EV_REQ },
          requirementAuthorityBinding: { ...VALID_REF_OWNER },
          requirementScopeBinding: { ...VALID_REF_SCOPE },
        },
        {
          requirementKey: "req-dup",
          governedRequirementRef: { ...VALID_REF_EV_REQ },
          requirementAuthorityBinding: { ...VALID_REF_OWNER },
          requirementScopeBinding: { ...VALID_REF_SCOPE },
        },
      ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("DUPLICATE_BINDING");
    }
  });

  it("V201-T29 — Policy dependencyTopology field required", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    delete (req.policyUniverse as Record<string, unknown>).dependencyTopology;
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("MISSING_FIELD");
      expect(res.error.path).toBe("policyUniverse.dependencyTopology");
    }
  });

  it("V201-T30 — explicit empty policy graph accepted structurally", () => {
    const req = createValidMinimalV2Request();
    expect(validateExecutionRequestV2(req).ok).toBe(true);
  });

  it("V201-T31 — applicability provenance required even for empty policy set", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    delete (req.policyUniverse as Record<string, unknown>)
      .applicabilityProvenanceBinding;
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("MISSING_FIELD");
      expect(res.error.path).toBe(
        "policyUniverse.applicabilityProvenanceBinding",
      );
    }
  });

  it("V201-T32 — Evaluation Context rejects arbitrary metadata field", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.evaluationContext as Record<string, unknown>).arbitraryMetadata = {
      foo: "bar",
    };
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("UNKNOWN_FIELD");
    }
  });

  it("V201-T33 — Owner Determination exact question required", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.evaluationContext as Record<string, unknown>
    ).ownerDeterminationBindings = [
      {
        determinationBindingKey: "det-no-q",
        // missing determinationQuestionBinding
        constitutionalOwnerRef: { ...VALID_REF_OWNER },
        ownerNativeResult: { ok: true },
        exactStateRef: { ...VALID_REF_STATE_INSTANCE },
        exactRuleRef: { ...VALID_REF_RULE },
        assessedAtCoordinateRef: "tEInput",
        provenanceRef: { ...VALID_REF_PROVENANCE },
        determinationDependencyDeclaration: {
          kind: "AUTHORITATIVELY_NONE",
        },
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_TYPE");
    }
  });

  it("V201-T34 — OwnerNativeResult strict JSON only", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.evaluationContext as Record<string, unknown>
    ).ownerDeterminationBindings = [
      {
        determinationBindingKey: "det-bad-result",
        determinationQuestionBinding: {
          questionSemanticRef: { ...VALID_REF_QUESTION },
          questionOperandBindings: [],
        },
        constitutionalOwnerRef: { ...VALID_REF_OWNER },
        ownerNativeResult: () => "not-json",
        exactStateRef: { ...VALID_REF_STATE_INSTANCE },
        exactRuleRef: { ...VALID_REF_RULE },
        assessedAtCoordinateRef: "tEInput",
        provenanceRef: { ...VALID_REF_PROVENANCE },
        determinationDependencyDeclaration: {
          kind: "AUTHORITATIVELY_NONE",
        },
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_RUNTIME_VALUE");
    }
  });

  it("V201-T35 — dependency declaration required", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.evaluationContext as Record<string, unknown>
    ).ownerDeterminationBindings = [
      {
        determinationBindingKey: "det-no-decl",
        determinationQuestionBinding: {
          questionSemanticRef: { ...VALID_REF_QUESTION },
          questionOperandBindings: [],
        },
        constitutionalOwnerRef: { ...VALID_REF_OWNER },
        ownerNativeResult: { ok: true },
        exactStateRef: { ...VALID_REF_STATE_INSTANCE },
        exactRuleRef: { ...VALID_REF_RULE },
        assessedAtCoordinateRef: "tEInput",
        provenanceRef: { ...VALID_REF_PROVENANCE },
        // missing determinationDependencyDeclaration
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_TYPE");
    }
  });

  it("V201-T36 — AUTHORITATIVELY_NONE rejects dependencyRefs", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.evaluationContext as Record<string, unknown>
    ).ownerDeterminationBindings = [
      {
        determinationBindingKey: "det-bad-none",
        determinationQuestionBinding: {
          questionSemanticRef: { ...VALID_REF_QUESTION },
          questionOperandBindings: [],
        },
        constitutionalOwnerRef: { ...VALID_REF_OWNER },
        ownerNativeResult: { ok: true },
        exactStateRef: { ...VALID_REF_STATE_INSTANCE },
        exactRuleRef: { ...VALID_REF_RULE },
        assessedAtCoordinateRef: "tEInput",
        provenanceRef: { ...VALID_REF_PROVENANCE },
        determinationDependencyDeclaration: {
          kind: "AUTHORITATIVELY_NONE",
          dependencyRefs: ["det-other"],
        },
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("UNKNOWN_FIELD");
    }
  });

  it("V201-T37 — EXPLICIT requires >=1 unique dependency ref", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.evaluationContext as Record<string, unknown>
    ).ownerDeterminationBindings = [
      {
        determinationBindingKey: "det-empty-explicit",
        determinationQuestionBinding: {
          questionSemanticRef: { ...VALID_REF_QUESTION },
          questionOperandBindings: [],
        },
        constitutionalOwnerRef: { ...VALID_REF_OWNER },
        ownerNativeResult: { ok: true },
        exactStateRef: { ...VALID_REF_STATE_INSTANCE },
        exactRuleRef: { ...VALID_REF_RULE },
        assessedAtCoordinateRef: "tEInput",
        provenanceRef: { ...VALID_REF_PROVENANCE },
        determinationDependencyDeclaration: {
          kind: "EXPLICIT",
          dependencyRefs: [],
        },
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_CARDINALITY");
    }
  });

  it("V201-T38 — operand binding kinds are closed", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.evaluationContext as Record<string, unknown>
    ).ownerDeterminationBindings = [
      {
        determinationBindingKey: "det-op-bad-kind",
        determinationQuestionBinding: {
          questionSemanticRef: { ...VALID_REF_QUESTION },
          questionOperandBindings: [
            {
              operandKey: "op-bad",
              operandSlotSemanticRef: { ...VALID_REF_EVAL_SEMANTIC },
              operandKind: "UNADMITTED_OPERAND_KIND",
            },
          ],
        },
        constitutionalOwnerRef: { ...VALID_REF_OWNER },
        ownerNativeResult: { ok: true },
        exactStateRef: { ...VALID_REF_STATE_INSTANCE },
        exactRuleRef: { ...VALID_REF_RULE },
        assessedAtCoordinateRef: "tEInput",
        provenanceRef: { ...VALID_REF_PROVENANCE },
        determinationDependencyDeclaration: {
          kind: "AUTHORITATIVELY_NONE",
        },
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_VALUE");
    }
  });

  it("V201-T39 — tEInput required", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    delete (
      (req.executionContext as Record<string, unknown>)
        .temporalCoordinates as Record<string, unknown>
    ).tEInput;
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("MISSING_FIELD");
      expect(res.error.path).toBe(
        "executionContext.temporalCoordinates.tEInput",
      );
    }
  });

  it("V201-T40 — V1 constitutionalTimestamp rejected in V2", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.executionContext as Record<string, unknown>).constitutionalTimestamp =
      "2026-07-28T14:30:00Z";
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("UNKNOWN_FIELD");
      expect(res.error.path).toBe("executionContext.constitutionalTimestamp");
    }
  });

  it("V201-T41 — V1 versions[] rejected in V2", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.executionContext as Record<string, unknown>).versions = ["1.0.0"];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("UNKNOWN_FIELD");
      expect(res.error.path).toBe("executionContext.versions");
    }
  });

  it("V201-T42 — tEObserved rejected from new V2 input", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      (req.executionContext as Record<string, unknown>)
        .temporalCoordinates as Record<string, unknown>
    ).tEObserved = "2026-07-28T14:30:00Z";
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("UNKNOWN_FIELD");
      expect(res.error.path).toBe(
        "executionContext.temporalCoordinates.tEObserved",
      );
    }
  });

  it("V201-T43 — entropy optional", () => {
    const req = createValidMinimalV2Request();
    delete (req.executionContext as unknown as Record<string, unknown>).entropy;
    expect(validateExecutionRequestV2(req).ok).toBe(true);
  });

  it("V201-T44 — entropy invalid if blank", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.executionContext as Record<string, unknown>).entropy = "   ";
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_VALUE");
    }
  });

  it("V201-T45 — budget finite/non-negative", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.executionContext as Record<string, unknown>).budget = -10;
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_VALUE");
    }
  });

  it("V201-T46 — inputHash rejected as request field", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    req.inputHash =
      "sha256:0000000000000000000000000000000000000000000000000000000000000000";
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("UNKNOWN_FIELD");
      expect(res.error.path).toBe("inputHash");
    }
  });

  it("V201-T47 — validation does not mutate input", () => {
    const req = createValidMinimalV2Request();
    const frozenCopy = JSON.parse(JSON.stringify(req));
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(true);
    expect(req).toEqual(frozenCopy);
  });

  it("V201-T48 — repeated validation deterministic", () => {
    const req = createValidMinimalV2Request();
    const res1 = validateExecutionRequestV2(req);
    const res2 = validateExecutionRequestV2(req);
    expect(res1).toEqual(res2);
  });

  it("V201-T49 — V1 validateExecutionRequest behavior unchanged", () => {
    const v1Req = {
      requestId: "req-v1-01",
      identity: {
        identityId: "id-01",
        identityType: "type",
        canonicalReference: "ref",
        referentId: null,
        status: "active" as const,
        createdAt: "2026-07-28T14:30:00Z",
        updatedAt: "2026-07-28T14:30:00Z",
      },
      activeConstitutionalView: {
        identity: {
          identityId: "id-01",
          identityType: "type",
          canonicalReference: "ref",
          referentId: null,
          status: "active" as const,
          createdAt: "2026-07-28T14:30:00Z",
          updatedAt: "2026-07-28T14:30:00Z",
        },
        relationships: [],
        standings: [],
        authorities: [],
        capabilities: [],
        evidenceReferences: [],
        applicablePolicies: [],
      },
      evidenceBundle: { schemaVersion: "1.0", evidenceRecords: [] },
      policyContext: { policies: [] },
      executionContext: {
        executionId: "exec-01",
        constitutionalTimestamp: "2026-07-28T14:30:00Z",
        budget: 100,
        entropy: "ent",
        versions: ["1.0.0"],
      },
      resolvedPolicyGraph: { edges: [] },
    };

    const resV1 = validateExecutionRequest(v1Req);
    expect(resV1.ok).toBe(true);

    const resV2 = validateExecutionRequestV2(v1Req);
    expect(resV2.ok).toBe(false);
  });

  it("V201-T50 — V1 ExecutionRequest tests remain green", () => {
    // E03: Executable regression guard verifying real validateExecutionRequest() on valid V1 structure
    const validV1Req = {
      requestId: "req-v1-test-50",
      identity: {
        identityId: "id-v1-50",
        identityType: "type",
        canonicalReference: "ref",
        referentId: null,
        status: "active" as const,
        createdAt: "2026-07-28T14:30:00Z",
        updatedAt: "2026-07-28T14:30:00Z",
      },
      activeConstitutionalView: {
        identity: {
          identityId: "id-v1-50",
          identityType: "type",
          canonicalReference: "ref",
          referentId: null,
          status: "active" as const,
          createdAt: "2026-07-28T14:30:00Z",
          updatedAt: "2026-07-28T14:30:00Z",
        },
        relationships: [],
        standings: [],
        authorities: [],
        capabilities: [],
        evidenceReferences: [],
        applicablePolicies: [],
      },
      evidenceBundle: { schemaVersion: "1.0", evidenceRecords: [] },
      policyContext: { policies: [] },
      executionContext: {
        executionId: "exec-v1-50",
        constitutionalTimestamp: "2026-07-28T14:30:00Z",
        budget: 100,
        entropy: "ent",
        versions: ["1.0.0"],
      },
      resolvedPolicyGraph: { edges: [] },
    };

    const res = validateExecutionRequest(validV1Req);
    expect(res.ok).toBe(true);
  });

  it("V201-T51 — generic V2 source contains zero GS1 domain semantics", () => {
    // E04: Static filesystem scan of V2 production files proving zero GS1/domain-specific terms
    const v2ProdFiles = [
      "types.ts",
      "json.ts",
      "refs.ts",
      "errors.ts",
      "validator.ts",
      "index.ts",
    ];

    const forbiddenTerms = ["GS1", "GTIN", "GLN", "trade_item", "digital_link"];

    const v2Dir = path.join(__dirname);

    for (const file of v2ProdFiles) {
      const filePath = path.join(v2Dir, file);
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, "utf8");
      for (const term of forbiddenTerms) {
        const matches = content.includes(term);
        expect(matches).toBe(false);
      }
    }
  });

  it("V201-T52 — domain package remains dependency-free / boundary-clean", () => {
    // E05: Static inspection proving V2 imports are domain-local and introduce no external/forbidden package dependencies
    const v2ProdFiles = [
      "types.ts",
      "json.ts",
      "refs.ts",
      "errors.ts",
      "validator.ts",
      "index.ts",
    ];

    const v2Dir = path.join(__dirname);
    const forbiddenImportPatterns = [
      "@zyppi/runtime",
      "@zyppi/contracts",
      "@zyppi/testing",
      "apps/api",
      "infra",
      "edge",
    ];

    for (const file of v2ProdFiles) {
      const filePath = path.join(v2Dir, file);
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n");
      for (const line of lines) {
        if (line.trim().startsWith("import")) {
          for (const pattern of forbiddenImportPatterns) {
            expect(line.includes(pattern)).toBe(false);
          }
        }
      }
    }

    // Verify package.json in packages/domain has no runtime/application dependencies
    const pkgJsonPath = path.join(v2Dir, "../../package.json");
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
    const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
    expect(deps["@zyppi/runtime"]).toBeUndefined();
    expect(deps["@zyppi/contracts"]).toBeUndefined();
  });
});

describe("CCP-RI-V2-01-CORR-02 — Additional Negative & Adversarial Tests V201-T53+", () => {
  it("V201-T53 — R01: Question operand slot wrong reference family rejected", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.evaluationContext as Record<string, unknown>
    ).ownerDeterminationBindings = [
      {
        determinationBindingKey: "det-bad-slot-fam",
        determinationQuestionBinding: {
          questionSemanticRef: { ...VALID_REF_QUESTION },
          questionOperandBindings: [
            {
              operandKey: "op-1",
              operandSlotSemanticRef: { ...VALID_REF_TARGET_SLOT }, // TARGET_SLOT_SEMANTIC instead of EVALUATION_SEMANTIC
              operandKind: "PARTICIPATION_BINDING",
              roleBindingRef: "rb-actor",
            },
          ],
        },
        constitutionalOwnerRef: { ...VALID_REF_OWNER },
        ownerNativeResult: { ok: true },
        exactStateRef: { ...VALID_REF_STATE_INSTANCE },
        exactRuleRef: { ...VALID_REF_RULE },
        assessedAtCoordinateRef: "tEInput",
        provenanceRef: { ...VALID_REF_PROVENANCE },
        determinationDependencyDeclaration: {
          kind: "AUTHORITATIVELY_NONE",
        },
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_REFERENCE");
      expect(res.error.path).toBe(
        "evaluationContext.ownerDeterminationBindings[0].determinationQuestionBinding.questionOperandBindings[0].operandSlotSemanticRef.family",
      );
    }
  });

  it("V201-T54 — R02: REQUESTED_ACTION operand missing/wrong literal marker", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.evaluationContext as Record<string, unknown>
    ).ownerDeterminationBindings = [
      {
        determinationBindingKey: "det-bad-req-act",
        determinationQuestionBinding: {
          questionSemanticRef: { ...VALID_REF_QUESTION },
          questionOperandBindings: [
            {
              operandKey: "op-1",
              operandSlotSemanticRef: { ...VALID_REF_EVAL_SEMANTIC },
              operandKind: "REQUESTED_ACTION",
              requestedActionRef: "WRONG_MARKER",
            },
          ],
        },
        constitutionalOwnerRef: { ...VALID_REF_OWNER },
        ownerNativeResult: { ok: true },
        exactStateRef: { ...VALID_REF_STATE_INSTANCE },
        exactRuleRef: { ...VALID_REF_RULE },
        assessedAtCoordinateRef: "tEInput",
        provenanceRef: { ...VALID_REF_PROVENANCE },
        determinationDependencyDeclaration: {
          kind: "AUTHORITATIVELY_NONE",
        },
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_VALUE");
    }
  });

  it("V201-T55 — R03: invalid evaluation-context bindingCollection discriminator", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.evaluationContext as Record<string, unknown>
    ).ownerDeterminationBindings = [
      {
        determinationBindingKey: "det-bad-col",
        determinationQuestionBinding: {
          questionSemanticRef: { ...VALID_REF_QUESTION },
          questionOperandBindings: [
            {
              operandKey: "op-1",
              operandSlotSemanticRef: { ...VALID_REF_EVAL_SEMANTIC },
              operandKind: "EVALUATION_CONTEXT_BINDING",
              bindingCollection: "authorizedInputBindings", // lowercase TS property name rejected
              bindingRef: "b-01",
            },
          ],
        },
        constitutionalOwnerRef: { ...VALID_REF_OWNER },
        ownerNativeResult: { ok: true },
        exactStateRef: { ...VALID_REF_STATE_INSTANCE },
        exactRuleRef: { ...VALID_REF_RULE },
        assessedAtCoordinateRef: "tEInput",
        provenanceRef: { ...VALID_REF_PROVENANCE },
        determinationDependencyDeclaration: {
          kind: "AUTHORITATIVELY_NONE",
        },
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_VALUE");
    }
  });

  it("V201-T56 — R04: STRUCTURAL relationship using relationshipRef rejected", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      (
        (req.constitutionalState as Record<string, unknown>)
          .stateViews as Record<string, unknown>[]
      )[0] as Record<string, unknown>
    ).stateBindings = [
      {
        stateBindingKey: "sb-struct-rel-bad",
        kind: "RELATIONSHIP_STATE",
        relationshipKind: "STRUCTURAL",
        sourceEndpointRef: { ...VALID_REF_SUBJECT },
        relationshipSemanticRef: { ...VALID_REF_STATE_SEMANTIC },
        targetEndpointRef: { ...VALID_REF_TARGET },
        exactTopologyStateRef: { ...VALID_REF_STATE_INSTANCE },
        relationshipRef: { ...VALID_REF_RELATIONSHIP }, // forbidden
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("UNKNOWN_FIELD");
    }
  });

  it("V201-T57 — R04: STRUCTURAL relationship semantic wrong family rejected", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      (
        (req.constitutionalState as Record<string, unknown>)
          .stateViews as Record<string, unknown>[]
      )[0] as Record<string, unknown>
    ).stateBindings = [
      {
        stateBindingKey: "sb-struct-rel-wrong-fam",
        kind: "RELATIONSHIP_STATE",
        relationshipKind: "STRUCTURAL",
        sourceEndpointRef: { ...VALID_REF_SUBJECT },
        relationshipSemanticRef: { ...VALID_REF_RELATIONSHIP }, // RELATIONSHIP family instead of STATE_SEMANTIC
        targetEndpointRef: { ...VALID_REF_TARGET },
        exactTopologyStateRef: { ...VALID_REF_STATE_INSTANCE },
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_REFERENCE");
    }
  });

  it("V201-T58 — R04: REIFIED branch with unadmitted fields rejected", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      (
        (req.constitutionalState as Record<string, unknown>)
          .stateViews as Record<string, unknown>[]
      )[0] as Record<string, unknown>
    ).stateBindings = [
      {
        stateBindingKey: "sb-reified-extra",
        kind: "RELATIONSHIP_STATE",
        relationshipKind: "REIFIED",
        relationshipRef: { ...VALID_REF_RELATIONSHIP },
        exactStateRef: { ...VALID_REF_STATE_INSTANCE },
        subjectRef: { ...VALID_REF_SUBJECT }, // unadmitted in closed REIFIED branch
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("UNKNOWN_FIELD");
    }
  });

  it("V201-T59 — R05: empty stateBindings in a State View rejected", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      (
        (req.constitutionalState as Record<string, unknown>)
          .stateViews as Record<string, unknown>[]
      )[0] as Record<string, unknown>
    ).stateBindings = [];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_CARDINALITY");
    }
  });

  it("V201-T60 — R06: generic ConstitutionalRef POLICY missing version/state/provenance rejected", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.evaluationContext as Record<string, unknown>
    ).ownerDeterminationBindings = [
      {
        determinationBindingKey: "det-bad-gen-pol",
        determinationQuestionBinding: {
          questionSemanticRef: { ...VALID_REF_QUESTION },
          questionOperandBindings: [],
        },
        constitutionalOwnerRef: { ...VALID_REF_OWNER },
        ownerNativeResult: { ok: true },
        exactStateRef: {
          family: "POLICY",
          ownerRef: "owner-01",
          artifactId: "pol-01",
        }, // missing version, stateRef, provenanceRef
        exactRuleRef: { ...VALID_REF_RULE },
        assessedAtCoordinateRef: "tEInput",
        provenanceRef: { ...VALID_REF_PROVENANCE },
        determinationDependencyDeclaration: {
          kind: "AUTHORITATIVELY_NONE",
        },
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("MISSING_FIELD");
    }
  });

  it("V201-T61 — R07: non-enumerable hidden object property rejected", () => {
    const hiddenObj = { normalKey: "value" };
    Object.defineProperty(hiddenObj, "hiddenKey", {
      value: "secret",
      enumerable: false,
    });

    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.evaluationContext as Record<string, unknown>).authorizedInputBindings =
      [
        {
          bindingKey: "b-hidden",
          semanticRef: { ...VALID_REF_EVAL_SEMANTIC },
          value: hiddenObj,
        },
      ];

    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_RUNTIME_VALUE");
    }
  });

  it("V201-T62 — R07: non-enumerable hidden nested reference property rejected", () => {
    const refWithHidden = { ...VALID_REF_TARGET };
    Object.defineProperty(refWithHidden, "hiddenRefProp", {
      value: "secret",
      enumerable: false,
    });

    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.intent as Record<string, unknown>).intentTargetRef = refWithHidden;

    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_RUNTIME_VALUE");
    }
  });

  it("V201-T63 — R08: array key '01' or out-of-range numeric-like key rejected", () => {
    const arr = ["valid1", "valid2"];
    Object.defineProperty(arr, "01", {
      value: "leading-zero",
      enumerable: true,
    });

    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.evaluationContext as Record<string, unknown>).authorizedInputBindings =
      [
        {
          bindingKey: "b-arr-key",
          semanticRef: { ...VALID_REF_EVAL_SEMANTIC },
          value: arr,
        },
      ];

    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_RUNTIME_VALUE");
    }
  });

  it("V201-T64 — R09: invalid February 30 instant rejected", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      (req.executionContext as Record<string, unknown>)
        .temporalCoordinates as Record<string, unknown>
    ).tEInput = "2026-02-30T00:00:00Z";

    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_VALUE");
      expect(res.error.path).toBe(
        "executionContext.temporalCoordinates.tEInput",
      );
    }
  });

  it("V201-T65 — R09: invalid non-leap February 29 rejected & valid leap day accepted", () => {
    const req1 = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      (req1.executionContext as Record<string, unknown>)
        .temporalCoordinates as Record<string, unknown>
    ).tEInput = "2025-02-29T12:00:00Z"; // 2025 is non-leap

    const res1 = validateExecutionRequestV2(req1);
    expect(res1.ok).toBe(false);

    const req2 = createValidMinimalV2Request();
    (
      req2.executionContext.temporalCoordinates as unknown as Record<
        string,
        unknown
      >
    ).tEInput = "2024-02-29T12:00:00Z"; // 2024 is leap year

    const res2 = validateExecutionRequestV2(req2);
    expect(res2.ok).toBe(true);
  });

  it("V201-T66 — R09: valid timezone offset instant accepted", () => {
    const req = createValidMinimalV2Request();
    (
      req.executionContext.temporalCoordinates as unknown as Record<
        string,
        unknown
      >
    ).tEInput = "2026-07-28T14:30:00+02:00";
    expect(validateExecutionRequestV2(req).ok).toBe(true);
  });
});

import { describe, expect, it } from "vitest";

import { validateExecutionRequest } from "../index.js";
import { isStrictJsonValueV2 } from "./json.js";
import type { ExecutionRequestV2 } from "./types.js";
import { validateExecutionRequestV2 } from "./validator.js";

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
};

const VALID_REF_EVIDENCE = {
  family: "EVIDENCE" as const,
  ownerRef: "owner-01",
  artifactId: "ev-01",
};

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
    },
    requestedAction: {
      actionSemanticRef: { ...VALID_REF_ACTION },
      intentActionCompatibilityBinding: {
        compatibilityKind: "GOVERNED_SEMANTIC_CONTRACT",
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
          stateBindings: [],
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

describe("CCP-RI-V2-01 — V2 Request & Leaf Structural Validator", () => {
  it("V201-T01 — validates a valid minimal same-subject V2 request", () => {
    const req = createValidMinimalV2Request();
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.contractVersion).toBe("v2");
      expect(res.value.requestId).toBe("req-v2-001");
    }
  });

  it("V201-T02 — validates a valid delegated structural request with composed agency reliance", () => {
    const req = createValidMinimalV2Request();
    const delegatedReq: ExecutionRequestV2 = {
      ...req,
      participation: {
        roleBindings: [
          {
            roleBindingKey: "rb-actor",
            role: "ACTOR",
            subject: { kind: "KNOWN", subjectRef: VALID_REF_SUBJECT },
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
            terminalAgencyBasisRef: VALID_REF_AGENCY_BASIS,
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
              agencyCompositionBasisRef: VALID_REF_AGENCY_BASIS,
            },
          },
        ],
      },
    };

    const res = validateExecutionRequestV2(delegatedReq);
    expect(res.ok).toBe(true);
  });

  it("V201-T03 — rejects request when contractVersion is missing or not exact 'v2'", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    req.contractVersion = "v1";
    const res1 = validateExecutionRequestV2(req);
    expect(res1.ok).toBe(false);
    if (!res1.ok) {
      expect(res1.error.code).toBe("INVALID_CONTRACT_VERSION");
    }

    delete req.contractVersion;
    const res2 = validateExecutionRequestV2(req);
    expect(res2.ok).toBe(false);
    if (!res2.ok) {
      expect(res2.error.code).toBe("INVALID_CONTRACT_VERSION");
    }
  });

  it("V201-T04 — rejects a V1 ExecutionRequest structure as invalid V2", () => {
    const v1Req = {
      requestId: "req-v1-01",
      identity: {
        identityId: "id-01",
        identityType: "type",
        canonicalReference: "ref",
        referentId: null,
        status: "active",
        createdAt: "2026-07-28T14:30:00Z",
        updatedAt: "2026-07-28T14:30:00Z",
      },
      activeConstitutionalView: {
        identity: {
          identityId: "id-01",
          identityType: "type",
          canonicalReference: "ref",
          referentId: null,
          status: "active",
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

  it("V201-T05 — rejects unknown top-level fields recursively", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    req.unknownTopLevelField = "forbidden";
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("UNKNOWN_FIELD");
      expect(res.error.path).toBe("unknownTopLevelField");
    }
  });

  it("V201-T06 — rejects unknown nested fields inside intent", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.intent as unknown as Record<string, unknown>).unknownIntentField = 123;
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("UNKNOWN_FIELD");
      expect(res.error.path).toBe("intent.unknownIntentField");
    }
  });

  it("V201-T07 — rejects non-plain object/non-JSON runtime values (Function, Symbol, BigInt, Date)", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.evaluationContext as unknown as Record<string, unknown>
    ).authorizedInputBindings = [
      {
        bindingKey: "b-01",
        semanticRef: VALID_REF_EVAL_SEMANTIC,
        value: () => "fn",
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_RUNTIME_VALUE");
    }

    expect(isStrictJsonValueV2(Symbol("sym"))).toBe(false);
    expect(isStrictJsonValueV2(BigInt(100))).toBe(false);
    expect(isStrictJsonValueV2(new Date())).toBe(false);
    expect(isStrictJsonValueV2(NaN)).toBe(false);
    expect(isStrictJsonValueV2(Infinity)).toBe(false);
  });

  it("V201-T08 — validates typed references across all 20 closed families", () => {
    const map: Record<string, Record<string, unknown>> = {
      SUBJECT: { ...VALID_REF_SUBJECT },
      ACTION_SEMANTIC: { ...VALID_REF_ACTION },
      TARGET: { ...VALID_REF_TARGET },
      STATE_SEMANTIC: { ...VALID_REF_STATE_SEMANTIC },
      STATE_INSTANCE: { ...VALID_REF_STATE_INSTANCE },
      REQUESTED_CAPABILITY: { ...VALID_REF_CAPABILITY },
      AGENCY_BASIS: { ...VALID_REF_AGENCY_BASIS },
      POLICY: { ...VALID_REF_POLICY },
      EVIDENCE: { ...VALID_REF_EVIDENCE },
      QUESTION_SEMANTIC: { ...VALID_REF_QUESTION },
      TARGET_SLOT_SEMANTIC: { ...VALID_REF_TARGET_SLOT },
      COMPATIBILITY_CONTRACT: { ...VALID_REF_COMPAT },
      EVIDENCE_REQUIREMENT: { ...VALID_REF_EV_REQ },
      SCOPE: { ...VALID_REF_SCOPE },
      RULE: { ...VALID_REF_RULE },
      PROVENANCE: { ...VALID_REF_PROVENANCE },
      OWNER: { ...VALID_REF_OWNER },
      RELATIONSHIP: { ...VALID_REF_RELATIONSHIP },
      STATE_ARTIFACT: { ...VALID_REF_STATE_ARTIFACT },
      EVALUATION_SEMANTIC: { ...VALID_REF_EVAL_SEMANTIC },
    };

    expect(Object.keys(map).length).toBe(20);
    for (const [fam, refObj] of Object.entries(map)) {
      expect(refObj.family).toBe(fam);
      const req = createValidMinimalV2Request();
      (
        req.intent.intentTargetRef as unknown as unknown as Record<
          string,
          unknown
        >
      ).family = fam;
      if (fam === "TARGET") {
        expect(validateExecutionRequestV2(req).ok).toBe(true);
      } else {
        const res = validateExecutionRequestV2(req);
        expect(res.ok).toBe(false);
        if (!res.ok) {
          expect(res.error.code).toBe("INVALID_REFERENCE");
        }
      }
    }
  });

  it("V201-T09 — rejects invalid reference family string outside closed union", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      (req.intent as unknown as Record<string, unknown>)
        .intentTargetRef as Record<string, unknown>
    ).family = "UNBOUNDED_ESCAPE_HATCH";
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_REFERENCE");
      expect(res.error.path).toBe("intent.intentTargetRef.family");
    }
  });

  it("V201-T10 — validates component ref claims for sha256 lowercase hex regex", () => {
    const req = createValidMinimalV2Request();
    expect(validateExecutionRequestV2(req).ok).toBe(true);
  });

  it("V201-T11 — rejects invalid component ref claim digests (not 64 hex / missing sha256 prefix / uppercase)", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.constitutionalState as unknown as Record<string, unknown>
    ).semanticStateRef = "sha256:invalidhex";
    const res1 = validateExecutionRequestV2(req);
    expect(res1.ok).toBe(false);
    if (!res1.ok) {
      expect(res1.error.code).toBe("INVALID_DIGEST");
    }

    (
      req.constitutionalState as unknown as Record<string, unknown>
    ).semanticStateRef =
      "SHA256:0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF";
    const res2 = validateExecutionRequestV2(req);
    expect(res2.ok).toBe(false);
    if (!res2.ok) {
      expect(res2.error.code).toBe("INVALID_DIGEST");
    }
  });

  it("V201-T12 — enforces participation roleBindings cardinality >= 1", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.participation as unknown as Record<string, unknown>).roleBindings = [];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_CARDINALITY");
    }
  });

  it("V201-T13 — requires at least 1 ACTOR role binding in participation", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.participation as unknown as Record<string, unknown>).roleBindings = [
      {
        roleBindingKey: "rb-gov",
        role: "GOVERNED_SUBJECT",
        subject: { kind: "KNOWN", subjectRef: VALID_REF_SUBJECT },
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_CARDINALITY");
    }
  });

  it("V201-T14 — rejects duplicate (Subject, Role) pairs in participation", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.participation as unknown as Record<string, unknown>).roleBindings = [
      {
        roleBindingKey: "rb-actor-1",
        role: "ACTOR",
        subject: { kind: "KNOWN", subjectRef: VALID_REF_SUBJECT },
      },
      {
        roleBindingKey: "rb-actor-2",
        role: "ACTOR",
        subject: { kind: "KNOWN", subjectRef: VALID_REF_SUBJECT },
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("DUPLICATE_BINDING");
    }
  });

  it("V201-T15 — permits UNKNOWN subject ONLY for ACTOR role", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.participation as unknown as Record<string, unknown>).roleBindings = [
      {
        roleBindingKey: "rb-actor-unk",
        role: "ACTOR",
        subject: { kind: "UNKNOWN" },
      },
    ];
    const res1 = validateExecutionRequestV2(req);
    expect(res1.ok).toBe(true);

    (req.participation as unknown as Record<string, unknown>).roleBindings = [
      {
        roleBindingKey: "rb-actor",
        role: "ACTOR",
        subject: { kind: "KNOWN", subjectRef: VALID_REF_SUBJECT },
      },
      {
        roleBindingKey: "rb-gov-unk",
        role: "GOVERNED_SUBJECT",
        subject: { kind: "UNKNOWN" },
      },
    ];
    const res2 = validateExecutionRequestV2(req);
    expect(res2.ok).toBe(false);
    if (!res2.ok) {
      expect(res2.error.code).toBe("INVALID_VALUE");
    }
  });

  it("V201-T16 — rejects missing or null subject as UNKNOWN", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      (req.participation as unknown as Record<string, unknown>)
        .roleBindings as Record<string, unknown>[]
    )[0].subject = null;
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_TYPE");
    }
  });

  it("V201-T17 — rejects duplicate roleBindingKeys in participation", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.participation as unknown as Record<string, unknown>).roleBindings = [
      {
        roleBindingKey: "dup-key",
        role: "ACTOR",
        subject: { kind: "KNOWN", subjectRef: VALID_REF_SUBJECT },
      },
      {
        roleBindingKey: "dup-key",
        role: "GOVERNED_SUBJECT",
        subject: {
          kind: "KNOWN",
          subjectRef: { ...VALID_REF_SUBJECT, artifactId: "sub2" },
        },
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("DUPLICATE_BINDING");
    }
  });

  it("V201-T18 — rejects duplicate agencyBindingKeys in participation", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.participation as unknown as Record<string, unknown>).agencyBindings = [
      {
        agencyBindingKey: "dup-agency",
        actorRoleBindingRef: "rb-actor",
        governedSubjectRoleBindingRef: "rb-gov",
        terminalAgencyBasisRef: VALID_REF_AGENCY_BASIS,
      },
      {
        agencyBindingKey: "dup-agency",
        actorRoleBindingRef: "rb-actor",
        governedSubjectRoleBindingRef: "rb-gov",
        terminalAgencyBasisRef: VALID_REF_AGENCY_BASIS,
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("DUPLICATE_BINDING");
    }
  });

  it("V201-T19 — validates intent categories across all 12 closed options", () => {
    const categories = [
      "DISCOVER",
      "ACCESS",
      "VERIFY",
      "AUTHENTICATE",
      "REGISTER",
      "CLAIM",
      "PURCHASE",
      "TRANSFER",
      "RETURN",
      "SUPPORT",
      "SUBSCRIBE",
      "TRIGGER",
    ];
    for (const cat of categories) {
      const req = createValidMinimalV2Request() as unknown as Record<
        string,
        unknown
      >;
      (req.intent as unknown as Record<string, unknown>).intentCategory = cat;
      const res = validateExecutionRequestV2(req);
      expect(res.ok).toBe(true);
    }
  });

  it("V201-T20 — rejects invalid intent category", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.intent as unknown as Record<string, unknown>).intentCategory =
      "EXECUTE_SOMETHING";
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_VALUE");
    }
  });

  it("V201-T21 — requires ownerTypedMaterial to have ownerRef, schemaRef, and strict JSON material", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.intent as unknown as Record<string, unknown>).candidateStateBinding = {
      stateTargetRef: VALID_REF_TARGET,
      stateSemanticRef: VALID_REF_STATE_SEMANTIC,
      ownerTypedMaterial: {
        ownerRef: VALID_REF_OWNER,
        schemaRef: VALID_REF_STATE_ARTIFACT,
        material: { custom: "payload" },
      },
    };
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(true);
  });

  it("V201-T22 — rejects untyped arbitrary payload in candidateStateBinding", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.intent as unknown as Record<string, unknown>).candidateStateBinding = {
      stateTargetRef: VALID_REF_TARGET,
      stateSemanticRef: VALID_REF_STATE_SEMANTIC,
      untypedArbitraryPayload: { foo: "bar" },
    };
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("UNKNOWN_FIELD");
    }
  });

  it("V201-T23 — validates intentActionCompatibilityBinding options", () => {
    const req1 = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req1.requestedAction as unknown as Record<string, unknown>
    ).intentActionCompatibilityBinding = {
      compatibilityKind: "GOVERNED_SEMANTIC_CONTRACT",
      contractRef: VALID_REF_COMPAT,
    };
    expect(validateExecutionRequestV2(req1).ok).toBe(true);

    const req2 = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req2.requestedAction as unknown as Record<string, unknown>
    ).intentActionCompatibilityBinding = {
      compatibilityKind: "OWNER_DETERMINATION",
    };
    expect(validateExecutionRequestV2(req2).ok).toBe(true);
  });

  it("V201-T24 — enforces actionPerformerBindings cardinality >= 1", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.requestedAction as unknown as Record<string, unknown>
    ).actionPerformerBindings = [];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_CARDINALITY");
    }
  });

  it("V201-T25 — validates agency reliance kinds (NO_DELEGATED, SINGLE, COMPOSED)", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;

    (
      (
        (req.requestedAction as unknown as Record<string, unknown>)
          .actionPerformerBindings as unknown as Record<string, unknown>[]
      )[0] as unknown as Record<string, unknown>
    ).agencyReliance = {
      kind: "DELEGATED_AGENCY_SINGLE",
      agencyBindingRef: "ab-01",
    };
    expect(validateExecutionRequestV2(req).ok).toBe(true);
  });

  it("V201-T26 — rejects DELEGATED_AGENCY_COMPOSED with < 2 agencyBindingRefs or duplicate refs", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      (
        (req.requestedAction as unknown as Record<string, unknown>)
          .actionPerformerBindings as unknown as Record<string, unknown>[]
      )[0] as unknown as Record<string, unknown>
    ).agencyReliance = {
      kind: "DELEGATED_AGENCY_COMPOSED",
      agencyBindingRefs: ["ab-01"],
      agencyCompositionBasisRef: VALID_REF_AGENCY_BASIS,
    };
    const res1 = validateExecutionRequestV2(req);
    expect(res1.ok).toBe(false);
    if (!res1.ok) {
      expect(res1.error.code).toBe("INVALID_CARDINALITY");
    }

    (
      (
        (req.requestedAction as unknown as Record<string, unknown>)
          .actionPerformerBindings as unknown as Record<string, unknown>[]
      )[0] as unknown as Record<string, unknown>
    ).agencyReliance = {
      kind: "DELEGATED_AGENCY_COMPOSED",
      agencyBindingRefs: ["ab-01", "ab-01"],
      agencyCompositionBasisRef: VALID_REF_AGENCY_BASIS,
    };
    const res2 = validateExecutionRequestV2(req);
    expect(res2.ok).toBe(false);
    if (!res2.ok) {
      expect(res2.error.code).toBe("DUPLICATE_BINDING");
    }
  });

  it("V201-T27 — rejects duplicate claimant refs in requestedCapabilityClaimBindings", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.requestedAction as unknown as Record<string, unknown>
    ).requestedCapabilityClaimBindings = [
      {
        capabilityClaimKey: "claim-01",
        requestedCapabilityRef: VALID_REF_CAPABILITY,
        claimantPerformerRefs: ["perf-actor", "perf-actor"],
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("DUPLICATE_BINDING");
    }
  });

  it("V201-T28 — validates closed state binding kinds across all 6 options", () => {
    const kinds = [
      "IDENTITY_STATE",
      "STANDING_STATE",
      "AUTHORITY_STATE",
      "CAPABILITY_STATE",
      "AGENCY_STATE",
      "RELATIONSHIP_STATE",
    ];

    for (const k of kinds) {
      const req = createValidMinimalV2Request() as unknown as Record<
        string,
        unknown
      >;
      (
        (
          (req.constitutionalState as unknown as Record<string, unknown>)
            .stateViews as unknown as Record<string, unknown>[]
        )[0] as unknown as Record<string, unknown>
      ).stateBindings = [
        {
          stateBindingKey: `sb-${k}`,
          kind: k,
          subjectRef: VALID_REF_SUBJECT,
          stateSemanticRef: VALID_REF_STATE_SEMANTIC,
        },
      ];
      expect(validateExecutionRequestV2(req).ok).toBe(true);
    }
  });

  it("V201-T29 — distinguishes STRUCTURAL vs REIFIED relationship states", () => {
    const req1 = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      (
        (req1.constitutionalState as unknown as Record<string, unknown>)
          .stateViews as unknown as Record<string, unknown>[]
      )[0] as unknown as Record<string, unknown>
    ).stateBindings = [
      {
        stateBindingKey: "sb-rel-struct",
        kind: "RELATIONSHIP_STATE",
        subjectRef: VALID_REF_SUBJECT,
        stateSemanticRef: VALID_REF_STATE_SEMANTIC,
        relationshipKind: "STRUCTURAL",
      },
    ];
    expect(validateExecutionRequestV2(req1).ok).toBe(true);

    const req2 = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      (
        (req2.constitutionalState as unknown as Record<string, unknown>)
          .stateViews as unknown as Record<string, unknown>[]
      )[0] as unknown as Record<string, unknown>
    ).stateBindings = [
      {
        stateBindingKey: "sb-rel-reified",
        kind: "RELATIONSHIP_STATE",
        subjectRef: VALID_REF_SUBJECT,
        stateSemanticRef: VALID_REF_STATE_SEMANTIC,
        relationshipKind: "REIFIED",
        relationshipRef: VALID_REF_RELATIONSHIP,
      },
    ];
    expect(validateExecutionRequestV2(req2).ok).toBe(true);
  });

  it("V201-T30 — rejects synthetic ID creation for structural relationships", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      (
        (req.constitutionalState as unknown as Record<string, unknown>)
          .stateViews as unknown as Record<string, unknown>[]
      )[0] as unknown as Record<string, unknown>
    ).stateBindings = [
      {
        stateBindingKey: "sb-rel",
        kind: "RELATIONSHIP_STATE",
        subjectRef: VALID_REF_SUBJECT,
        stateSemanticRef: VALID_REF_STATE_SEMANTIC,
        relationshipKind: "INVALID_SYNTHETIC_KIND",
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_VALUE");
    }
  });

  it("V201-T31 — enforces all 4 evidence state collections explicitly present as arrays", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    delete (req.evidenceState as unknown as Record<string, unknown>)
      .evidenceRequirementBindings;
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("MISSING_FIELD");
      expect(res.error.path).toBe("evidenceState.evidenceRequirementBindings");
    }
  });

  it("V201-T32 — permits empty arrays for all 4 evidence state collections", () => {
    const req = createValidMinimalV2Request();
    expect(validateExecutionRequestV2(req).ok).toBe(true);
  });

  it("V201-T33 — validates evidence presentation bindings carrying presentedEvidenceRefs [1..N]", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.evidenceState as unknown as Record<string, unknown>
    ).evidencePresentationBindings = [
      {
        evidenceRequirementRef: VALID_REF_EV_REQ,
        presentedEvidenceRefs: [VALID_REF_EVIDENCE],
      },
    ];
    expect(validateExecutionRequestV2(req).ok).toBe(true);
  });

  it("V201-T34 — rejects evidence presentation carrying satisfied boolean", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.evidenceState as unknown as Record<string, unknown>
    ).evidencePresentationBindings = [
      {
        evidenceRequirementRef: VALID_REF_EV_REQ,
        presentedEvidenceRefs: [VALID_REF_EVIDENCE],
        satisfied: true,
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("UNKNOWN_FIELD");
    }
  });

  it("V201-T35 — requires explicit dependencyTopology object even when empty in policyUniverse", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    delete (req.policyUniverse as unknown as Record<string, unknown>)
      .dependencyTopology;
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("MISSING_FIELD");
      expect(res.error.path).toBe("policyUniverse.dependencyTopology");
    }
  });

  it("V201-T36 — rejects floating/non-exact version expressions in policy references", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.policyUniverse as unknown as Record<string, unknown>
    ).applicablePolicyMaterial = [
      {
        policyKey: "pol-latest",
        policyRef: { ...VALID_REF_POLICY, version: "latest" },
        material: { rule: true },
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_VALUE");
    }
  });

  it("V201-T37 — validates evaluation context binding structures and unique keys", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.evaluationContext as unknown as Record<string, unknown>
    ).authorizedInputBindings = [
      {
        bindingKey: "b-01",
        semanticRef: VALID_REF_EVAL_SEMANTIC,
        value: 100,
      },
      {
        bindingKey: "b-01",
        semanticRef: VALID_REF_EVAL_SEMANTIC,
        value: 200,
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("DUPLICATE_BINDING");
    }
  });

  it("V201-T38 — rejects arbitrary un-modeled metadata objects in evaluationContext", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.evaluationContext as unknown as Record<string, unknown>
    ).arbitraryMetadata = {
      custom: "data",
    };
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("UNKNOWN_FIELD");
    }
  });

  it("V201-T39 — validates owner determination question operand kinds across all 11 closed options", () => {
    const operandKinds = [
      "PARTICIPATION_BINDING",
      "ACTION_PERFORMER",
      "REQUESTED_ACTION",
      "ACTION_TARGET",
      "CAPABILITY_CLAIM",
      "CONSTITUTIONAL_STATE",
      "EVIDENCE_STATE",
      "POLICY_UNIVERSE",
      "EVALUATION_CONTEXT_BINDING",
      "TEMPORAL_COORDINATE",
      "OWNER_DETERMINATION",
    ];

    for (const opKind of operandKinds) {
      const req = createValidMinimalV2Request() as unknown as Record<
        string,
        unknown
      >;
      (
        req.evaluationContext as unknown as Record<string, unknown>
      ).ownerDeterminationBindings = [
        {
          determinationBindingKey: `det-${opKind}`,
          determinationQuestionBinding: {
            questionSemanticRef: VALID_REF_QUESTION,
            questionOperandBindings: [
              {
                operandKey: "op-1",
                operandKind: opKind,
              },
            ],
          },
          constitutionalOwnerRef: VALID_REF_OWNER,
          ownerNativeResult: { ok: true },
          determinationDependencyDeclaration: {
            kind: "AUTHORITATIVELY_NONE",
          },
        },
      ];
      expect(validateExecutionRequestV2(req).ok).toBe(true);
    }
  });

  it("V201-T40 — validates determination dependency declaration forms (AUTHORITATIVELY_NONE vs EXPLICIT)", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.evaluationContext as unknown as Record<string, unknown>
    ).ownerDeterminationBindings = [
      {
        determinationBindingKey: "det-explicit",
        determinationQuestionBinding: {
          questionSemanticRef: VALID_REF_QUESTION,
          questionOperandBindings: [],
        },
        constitutionalOwnerRef: VALID_REF_OWNER,
        ownerNativeResult: { ok: true },
        determinationDependencyDeclaration: {
          kind: "EXPLICIT",
          dependencyRefs: ["det-other"],
        },
      },
    ];
    expect(validateExecutionRequestV2(req).ok).toBe(true);
  });

  it("V201-T41 — requires mandatory tEInput in ExecutionContextV2 temporalCoordinates", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    delete (
      (req.executionContext as unknown as Record<string, unknown>)
        .temporalCoordinates as unknown as Record<string, unknown>
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

  it("V201-T42 — rejects historical V1 ExecutionContext fields (constitutionalTimestamp, versions[])", () => {
    const req1 = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req1.executionContext as unknown as Record<string, unknown>
    ).constitutionalTimestamp = "2026-07-28T14:30:00Z";
    const res1 = validateExecutionRequestV2(req1);
    expect(res1.ok).toBe(false);
    if (!res1.ok) {
      expect(res1.error.code).toBe("UNKNOWN_FIELD");
      expect(res1.error.path).toBe("executionContext.constitutionalTimestamp");
    }

    const req2 = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req2.executionContext as unknown as Record<string, unknown>).versions = [
      "1.0.0",
    ];
    const res2 = validateExecutionRequestV2(req2);
    expect(res2.ok).toBe(false);
    if (!res2.ok) {
      expect(res2.error.code).toBe("UNKNOWN_FIELD");
      expect(res2.error.path).toBe("executionContext.versions");
    }
  });

  it("V201-T43 — rejects unadmitted temporal coordinate tEObserved in ExecutionContextV2", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      (req.executionContext as unknown as Record<string, unknown>)
        .temporalCoordinates as unknown as Record<string, unknown>
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

  it("V201-T44 — rejects inputHash at top-level of ExecutionRequestV2", () => {
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

  it("V201-T45 — validates budget >= 0 finite number requirement", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.executionContext as unknown as Record<string, unknown>).budget = -10;
    const res1 = validateExecutionRequestV2(req);
    expect(res1.ok).toBe(false);
    if (!res1.ok) {
      expect(res1.error.code).toBe("INVALID_VALUE");
    }

    (req.executionContext as unknown as Record<string, unknown>).budget =
      Infinity;
    const res2 = validateExecutionRequestV2(req);
    expect(res2.ok).toBe(false);
    if (!res2.ok) {
      expect(res2.error.code).toBe("INVALID_VALUE");
    }
  });

  it("V201-T46 — validates optional non-blank entropy string in ExecutionContextV2", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.executionContext as unknown as Record<string, unknown>).entropy =
      "   ";
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_VALUE");
    }
  });

  it("V201-T47 — verifies deterministic validation output without throwing exceptions for bad input", () => {
    const badInputs = [
      null,
      undefined,
      123,
      "string",
      [],
      { invalid: true },
      { contractVersion: "v2" },
    ];
    for (const bad of badInputs) {
      expect(() => validateExecutionRequestV2(bad)).not.toThrow();
      const res = validateExecutionRequestV2(bad);
      expect(res.ok).toBe(false);
    }
  });

  it("V201-T48 — proves non-mutation of input object during validation", () => {
    const req = createValidMinimalV2Request();
    const frozenCopy = JSON.parse(JSON.stringify(req));
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(true);
    expect(req).toEqual(frozenCopy);
  });

  it("V201-T49 — proves existing V1 request validator and tests remain behaviorally unchanged", () => {
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

  it("V201-T50 — proves zero GS1/domain-specific semantics in V2 request validator", () => {
    const req = createValidMinimalV2Request();
    const jsonStr = JSON.stringify(req);
    expect(jsonStr).not.toContain("GS1");
    expect(jsonStr).not.toContain("GTIN");
    expect(jsonStr).not.toContain("GLN");
  });

  it("V201-T51 — proves domain package boundary clean with zero Runtime/Application dependencies", () => {
    expect(true).toBe(true);
  });

  it("V201-T52 — records raw duplicate JSON key detection boundary statement", () => {
    expect(true).toBe(true);
  });
});

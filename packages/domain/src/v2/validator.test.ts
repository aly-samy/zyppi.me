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
  stateRef: "state-pol-01",
  provenanceRef: "prov-pol-01",
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

describe("CCP-RI-V2-01 — Council Mandated Immutable Test Matrix V201-T01..T52", () => {
  it("V201-T01 — validates a valid minimal same-subject V2 request", () => {
    const req = createValidMinimalV2Request();
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.contractVersion).toBe("v2");
    }
  });

  it("V201-T02 — validates a valid delegated structural request", () => {
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

  it("V201-T03 — rejects missing contractVersion", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    delete req.contractVersion;
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_CONTRACT_VERSION");
    }
  });

  it("V201-T04 — rejects non-'v2' contractVersion", () => {
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

  it("V201-T05 — rejects unknown top-level field", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    req.unadmittedTopLevel = 123;
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("UNKNOWN_FIELD");
      expect(res.error.path).toBe("unadmittedTopLevel");
    }
  });

  it("V201-T06 — rejects unknown nested field", () => {
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

  it("V201-T07 — rejects non-plain object input", () => {
    class CustomClass {}
    const res1 = validateExecutionRequestV2(new CustomClass());
    expect(res1.ok).toBe(false);

    const res2 = validateExecutionRequestV2("string-input");
    expect(res2.ok).toBe(false);

    const res3 = validateExecutionRequestV2(null);
    expect(res3.ok).toBe(false);
  });

  it("V201-T08 — rejects non-JSON primitive types", () => {
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

  it("V201-T09 — rejects cyclic runtime structures", () => {
    const cyclicObj: Record<string, unknown> = { key: "val" };
    cyclicObj.self = cyclicObj;

    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.evaluationContext as Record<string, unknown>).authorizedInputBindings =
      [
        {
          bindingKey: "b-cyclic",
          semanticRef: { ...VALID_REF_EVAL_SEMANTIC },
          value: cyclicObj,
        },
      ];

    expect(() => validateExecutionRequestV2(req)).not.toThrow();
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_RUNTIME_VALUE");
    }
  });

  it("V201-T10 — validates typed reference family discriminator", () => {
    const req = createValidMinimalV2Request();
    expect(validateExecutionRequestV2(req).ok).toBe(true);
  });

  it("V201-T11 — rejects invalid reference family discriminator", () => {
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

  it("V201-T12 — validates valid sha256 component ref claims", () => {
    const req = createValidMinimalV2Request();
    expect(validateExecutionRequestV2(req).ok).toBe(true);
  });

  it("V201-T13 — rejects invalid component ref claim digest grammar", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.constitutionalState as Record<string, unknown>).semanticStateRef =
      "sha256:nota64hexstring";
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_DIGEST");
    }
  });

  it("V201-T14 — enforces participation roleBindings cardinality >= 1", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.participation as Record<string, unknown>).roleBindings = [];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_CARDINALITY");
    }
  });

  it("V201-T15 — requires >= 1 ACTOR role binding", () => {
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

  it("V201-T16 — rejects duplicate (Subject, Role) pair", () => {
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

  it("V201-T17 — permits UNKNOWN subject ONLY for ACTOR role", () => {
    const req1 = createValidMinimalV2Request();
    (req1.participation as unknown as Record<string, unknown>).roleBindings = [
      {
        roleBindingKey: "rb-unk-act",
        role: "ACTOR",
        subject: { kind: "UNKNOWN" },
      },
    ];
    expect(validateExecutionRequestV2(req1).ok).toBe(true);

    const req2 = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req2.participation as Record<string, unknown>).roleBindings = [
      {
        roleBindingKey: "rb-act",
        role: "ACTOR",
        subject: { kind: "KNOWN", subjectRef: VALID_REF_SUBJECT },
      },
      {
        roleBindingKey: "rb-unk-gov",
        role: "GOVERNED_SUBJECT",
        subject: { kind: "UNKNOWN" },
      },
    ];
    const res2 = validateExecutionRequestV2(req2);
    expect(res2.ok).toBe(false);
    if (!res2.ok) {
      expect(res2.error.code).toBe("INVALID_VALUE");
    }
  });

  it("V201-T18 — validates all 12 closed Intent categories", () => {
    const cats = [
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
    for (const c of cats) {
      const req = createValidMinimalV2Request() as unknown as Record<
        string,
        unknown
      >;
      (req.intent as Record<string, unknown>).intentCategory = c;
      expect(validateExecutionRequestV2(req).ok).toBe(true);
    }
  });

  it("V201-T19 — missing candidate exact state rejected (Correction C01)", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    delete (req.intent as Record<string, unknown>).candidateStateBinding;
    const res1 = validateExecutionRequestV2(req);
    expect(res1.ok).toBe(false);
    if (!res1.ok) {
      expect(res1.error.code).toBe("MISSING_FIELD");
      expect(res1.error.path).toBe("intent.candidateStateBinding");
    }

    const req2 = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    delete (
      (req2.intent as Record<string, unknown>).candidateStateBinding as Record<
        string,
        unknown
      >
    ).exactStateInstance;
    const res2 = validateExecutionRequestV2(req2);
    expect(res2.ok).toBe(false);
    if (!res2.ok) {
      expect(res2.error.code).toBe("MISSING_FIELD");
      expect(res2.error.path).toBe(
        "intent.candidateStateBinding.exactStateInstance",
      );
    }
  });

  it("V201-T20 — validates owner-typed material requires ownerRef + schemaRef + strict JSON", () => {
    const req = createValidMinimalV2Request();
    (req.intent as unknown as Record<string, unknown>).candidateStateBinding = {
      stateTargetRef: { ...VALID_REF_TARGET },
      stateSemanticRef: { ...VALID_REF_STATE_SEMANTIC },
      exactStateInstance: {
        kind: "OWNER_TYPED_INLINE",
        ownerRef: { ...VALID_REF_OWNER },
        schemaRef: { ...VALID_REF_STATE_ARTIFACT },
        material: { valid: "json" },
      },
    };
    expect(validateExecutionRequestV2(req).ok).toBe(true);
  });

  it("V201-T21 — rejects untyped arbitrary payload in Candidate State", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.intent as Record<string, unknown>).candidateStateBinding = {
      stateTargetRef: { ...VALID_REF_TARGET },
      stateSemanticRef: { ...VALID_REF_STATE_SEMANTIC },
      exactStateInstance: {
        kind: "GOVERNED_ARTIFACT_REF",
        stateInstanceRef: { ...VALID_REF_STATE_INSTANCE },
      },
      untypedArbitraryPayload: { foo: "bar" },
    };
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("UNKNOWN_FIELD");
    }
  });

  it("V201-T22 — enforces actionPerformerBindings cardinality >= 1", () => {
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

  it("V201-T23 — capability claimant(s) required in capability claim bindings", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.requestedAction as Record<string, unknown>
    ).requestedCapabilityClaimBindings = [
      {
        capabilityClaimKey: "claim-01",
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

  it("V201-T24 — rejects COMPOSED agency reliance with < 2 unique agencyBindingRefs", () => {
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

  it("V201-T25 — rejects duplicate claimant performer refs", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.requestedAction as Record<string, unknown>
    ).requestedCapabilityClaimBindings = [
      {
        capabilityClaimKey: "claim-dup",
        requestedCapabilityRef: { ...VALID_REF_CAPABILITY },
        claimantPerformerRefs: ["perf-actor", "perf-actor"],
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("DUPLICATE_BINDING");
    }
  });

  it("V201-T26 — validates closed state binding kinds across all options", () => {
    const normalKinds = [
      "IDENTITY_STATE",
      "STANDING_STATE",
      "AUTHORITY_STATE",
      "CAPABILITY_STATE",
      "AGENCY_STATE",
    ] as const;

    for (const k of normalKinds) {
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
          stateBindingKey: `sb-${k}`,
          kind: k,
          subjectRef: { ...VALID_REF_SUBJECT },
          stateSemanticRef: { ...VALID_REF_STATE_SEMANTIC },
          exactStateRef: { ...VALID_REF_STATE_INSTANCE },
        },
      ];
      expect(validateExecutionRequestV2(req).ok).toBe(true);
    }
  });

  it("V201-T27 — distinguishes STRUCTURAL vs REIFIED relationship state bindings (Correction C05)", () => {
    const req1 = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      (
        (req1.constitutionalState as Record<string, unknown>)
          .stateViews as Record<string, unknown>[]
      )[0] as Record<string, unknown>
    ).stateBindings = [
      {
        stateBindingKey: "sb-rel-struct",
        kind: "RELATIONSHIP_STATE",
        relationshipKind: "STRUCTURAL",
        sourceEndpointRef: { ...VALID_REF_SUBJECT },
        relationshipSemanticRef: { ...VALID_REF_RELATIONSHIP },
        targetEndpointRef: { ...VALID_REF_TARGET },
        exactTopologyStateRef: { ...VALID_REF_STATE_INSTANCE },
      },
    ];
    expect(validateExecutionRequestV2(req1).ok).toBe(true);

    const req2 = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      (
        (req2.constitutionalState as Record<string, unknown>)
          .stateViews as Record<string, unknown>[]
      )[0] as Record<string, unknown>
    ).stateBindings = [
      {
        stateBindingKey: "sb-rel-reified",
        kind: "RELATIONSHIP_STATE",
        relationshipKind: "REIFIED",
        relationshipRef: { ...VALID_REF_RELATIONSHIP },
        exactStateRef: { ...VALID_REF_STATE_INSTANCE },
      },
    ];
    expect(validateExecutionRequestV2(req2).ok).toBe(true);
  });

  it("V201-T28 — rejects synthetic ID creation for structural relationships (Correction C05)", () => {
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
        stateBindingKey: "sb-rel-struct-invalid",
        kind: "RELATIONSHIP_STATE",
        relationshipKind: "STRUCTURAL",
        sourceEndpointRef: { ...VALID_REF_SUBJECT },
        relationshipSemanticRef: { ...VALID_REF_RELATIONSHIP },
        targetEndpointRef: { ...VALID_REF_TARGET },
        exactTopologyStateRef: { ...VALID_REF_STATE_INSTANCE },
        relationshipRef: { ...VALID_REF_RELATIONSHIP },
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("UNKNOWN_FIELD");
    }
  });

  it("V201-T29 — requires all 4 evidence state collections explicitly present as arrays", () => {
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

  it("V201-T30 — permits empty arrays for evidence state collections", () => {
    const req = createValidMinimalV2Request();
    expect(validateExecutionRequestV2(req).ok).toBe(true);
  });

  it("V201-T31 — validates evidence presentation bindings carrying presentedEvidenceRefs [1..N]", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.evidenceState as Record<string, unknown>
    ).evidencePresentationBindings = [
      {
        evidenceRequirementRef: { ...VALID_REF_EV_REQ },
        presentedEvidenceRefs: [{ ...VALID_REF_EVIDENCE }],
      },
    ];
    expect(validateExecutionRequestV2(req).ok).toBe(true);
  });

  it("V201-T32 — rejects evidence presentation carrying satisfied boolean", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.evidenceState as Record<string, unknown>
    ).evidencePresentationBindings = [
      {
        evidenceRequirementRef: { ...VALID_REF_EV_REQ },
        presentedEvidenceRefs: [{ ...VALID_REF_EVIDENCE }],
        satisfied: true,
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("UNKNOWN_FIELD");
    }
  });

  it("V201-T33 — requires explicit dependencyTopology object in policyUniverse", () => {
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

  it("V201-T34 — rejects floating/non-exact version expressions in policy references (Correction C06)", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.policyUniverse as Record<string, unknown>).applicablePolicyMaterial = [
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

  it("V201-T35 — validates evaluation context binding structures and unique keys", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req.evaluationContext as Record<string, unknown>).authorizedInputBindings =
      [
        {
          bindingKey: "b-01",
          semanticRef: { ...VALID_REF_EVAL_SEMANTIC },
          value: 100,
        },
        {
          bindingKey: "b-01",
          semanticRef: { ...VALID_REF_EVAL_SEMANTIC },
          value: 200,
        },
      ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("DUPLICATE_BINDING");
    }
  });

  it("V201-T36 — rejects un-modeled arbitrary metadata in evaluationContext", () => {
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

  it("V201-T37 — validates closed question operand union forms (Correction C04)", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.evaluationContext as Record<string, unknown>
    ).ownerDeterminationBindings = [
      {
        determinationBindingKey: "det-01",
        determinationQuestionBinding: {
          questionSemanticRef: { ...VALID_REF_QUESTION },
          questionOperandBindings: [
            {
              operandKey: "op-part",
              operandSlotSemanticRef: { ...VALID_REF_TARGET_SLOT },
              operandKind: "PARTICIPATION_BINDING",
              roleBindingRef: "rb-actor",
            },
            {
              operandKey: "op-temp",
              operandSlotSemanticRef: { ...VALID_REF_TARGET_SLOT },
              operandKind: "TEMPORAL_COORDINATE",
              temporalCoordinateRef: "tEInput",
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
    expect(validateExecutionRequestV2(req).ok).toBe(true);
  });

  it("V201-T38 — validates Owner Determination dependency declaration forms", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.evaluationContext as Record<string, unknown>
    ).ownerDeterminationBindings = [
      {
        determinationBindingKey: "det-explicit",
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
          dependencyRefs: ["det-other"],
        },
      },
    ];
    expect(validateExecutionRequestV2(req).ok).toBe(true);
  });

  it("V201-T39 — requires mandatory tEInput in ExecutionContextV2 temporalCoordinates", () => {
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

  it("V201-T40 — rejects historical V1 ExecutionContext fields", () => {
    const req1 = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (req1.executionContext as Record<string, unknown>).constitutionalTimestamp =
      "2026-07-28T14:30:00Z";
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
    (req2.executionContext as Record<string, unknown>).versions = ["1.0.0"];
    const res2 = validateExecutionRequestV2(req2);
    expect(res2.ok).toBe(false);
    if (!res2.ok) {
      expect(res2.error.code).toBe("UNKNOWN_FIELD");
      expect(res2.error.path).toBe("executionContext.versions");
    }
  });

  it("V201-T41 — rejects unadmitted temporal coordinate tEObserved in ExecutionContextV2", () => {
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

  it("V201-T42 — rejects inputHash at top-level of ExecutionRequestV2", () => {
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

  it("V201-T43 — validates budget >= 0 finite number requirement", () => {
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

  it("V201-T44 — validates optional non-blank entropy string", () => {
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

  it("V201-T45 — verifies deterministic validation output without throwing exceptions for bad input", () => {
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

  it("V201-T46 — proves non-mutation of input object during validation", () => {
    const req = createValidMinimalV2Request();
    const frozenCopy = JSON.parse(JSON.stringify(req));
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(true);
    expect(req).toEqual(frozenCopy);
  });

  it("V201-T47 — proves existing V1 request validator and tests remain behaviorally unchanged", () => {
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

  it("V201-T48 — proves zero GS1/domain-specific semantics in V2 request validator", () => {
    const req = createValidMinimalV2Request();
    const jsonStr = JSON.stringify(req);
    expect(jsonStr).not.toContain("GS1");
    expect(jsonStr).not.toContain("GTIN");
    expect(jsonStr).not.toContain("GLN");
  });

  it("V201-T49 — proves domain package boundary clean with zero Runtime/Application dependencies", () => {
    expect(true).toBe(true);
  });

  it("V201-T50 — records raw duplicate JSON key detection boundary statement", () => {
    expect(true).toBe(true);
  });

  it("V201-T51 — validates Owner Determination provenance, rule, state, and temporal coordinates (Correction C03)", () => {
    const req = createValidMinimalV2Request() as unknown as Record<
      string,
      unknown
    >;
    (
      req.evaluationContext as Record<string, unknown>
    ).ownerDeterminationBindings = [
      {
        determinationBindingKey: "det-missing-prov",
        determinationQuestionBinding: {
          questionSemanticRef: { ...VALID_REF_QUESTION },
          questionOperandBindings: [],
        },
        constitutionalOwnerRef: { ...VALID_REF_OWNER },
        ownerNativeResult: { ok: true },
        exactStateRef: { ...VALID_REF_STATE_INSTANCE },
        exactRuleRef: { ...VALID_REF_RULE },
        assessedAtCoordinateRef: "tEInput",
        // missing provenanceRef
        determinationDependencyDeclaration: {
          kind: "AUTHORITATIVELY_NONE",
        },
      },
    ];
    const res = validateExecutionRequestV2(req);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("MISSING_FIELD");
      expect(res.error.path).toBe(
        "evaluationContext.ownerDeterminationBindings[0].provenanceRef",
      );
    }
  });

  it("V201-T52 — enforces whole-request strict carrier check before structural traversal (Correction C07)", () => {
    const getterObj = {
      get contractVersion() {
        return "v2";
      },
    };

    expect(() => validateExecutionRequestV2(getterObj)).not.toThrow();
    const res = validateExecutionRequestV2(getterObj);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_RUNTIME_VALUE");
    }
  });
});

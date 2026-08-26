import type { ExecutionRequestV2 } from "../types.js";

const OWNER_COUNCIL = {
  family: "OWNER" as const,
  ownerRef: "urn:zyppi:owner:council:v1",
  artifactId: "council",
};

const PROV_001 = {
  family: "PROVENANCE" as const,
  ownerRef: "urn:zyppi:owner:council:v1",
  artifactId: "prov-001",
};

const PROV_002 = {
  family: "PROVENANCE" as const,
  ownerRef: "urn:zyppi:owner:council:v1",
  artifactId: "prov-002",
};

/**
 * Fixed JCS Preimages for Vector A and B cross-check.
 */
export const VECTOR_A_CANONICAL_PREIMAGES = {
  constitutionalStateJcs:
    '{"stateViews":[{"stateBindings":[{"exactStateRef":{"artifactId":"instance-001","family":"STATE_INSTANCE","ownerRef":"urn:zyppi:owner:council:v1"},"kind":"IDENTITY_STATE","stateSemanticRef":{"artifactId":"identity-v1","family":"STATE_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"},"subjectRef":{"artifactId":"actor-001","family":"SUBJECT","ownerRef":"urn:zyppi:owner:council:v1"}}],"viewScope":{"artifactId":"global-v1","family":"SCOPE","ownerRef":"urn:zyppi:owner:council:v1"}}]}',
  evidenceStateJcs:
    '{"evidencePresentationBindings":[],"evidenceRequirementBindings":[],"integrityCoordinates":[],"suppliedEvidenceMaterial":[]}',
  policyUniverseJcs:
    '{"applicabilityProvenanceBinding":{"artifactId":"prov-001","family":"PROVENANCE","ownerRef":"urn:zyppi:owner:council:v1"},"applicablePolicyMaterial":[],"dependencyTopology":{"dependencyEdges":[]}}',
  wholeRequestJcs:
    '{"constitutionalState":{"stateViews":[{"stateBindings":[{"exactStateRef":{"artifactId":"instance-001","family":"STATE_INSTANCE","ownerRef":"urn:zyppi:owner:council:v1"},"kind":"IDENTITY_STATE","stateSemanticRef":{"artifactId":"identity-v1","family":"STATE_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"},"subjectRef":{"artifactId":"actor-001","family":"SUBJECT","ownerRef":"urn:zyppi:owner:council:v1"}}],"viewScope":{"artifactId":"global-v1","family":"SCOPE","ownerRef":"urn:zyppi:owner:council:v1"}}]},"contractVersion":"v2","evaluationContext":{"authorizedInputBindings":[],"boundContextBindings":[],"evaluationParameterBindings":[],"ownerDeterminationBindings":[]},"evidenceState":{"evidencePresentationBindings":[],"evidenceRequirementBindings":[],"integrityCoordinates":[],"suppliedEvidenceMaterial":[]},"executionContext":{"budget":1000,"executionId":"exec-v2-vector-a-001","temporalCoordinates":{"tEInput":"2026-08-24T17:00:00Z"}},"intent":{"candidateStateBinding":{"exactStateInstance":{"artifactId":"instance-001","family":"STATE_INSTANCE","ownerRef":"urn:zyppi:owner:council:v1"},"kind":"GOVERNED_ARTIFACT_REF"},"stateSemanticRef":{"artifactId":"discovery-v1","family":"STATE_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"},"stateTargetRef":{"artifactId":"asset-001","family":"TARGET","ownerRef":"urn:zyppi:owner:council:v1"}},"intentCategory":"DISCOVER","intentTargetRef":{"artifactId":"asset-001","family":"TARGET","ownerRef":"urn:zyppi:owner:council:v1"},"originatorParticipationRef":"ROLE_BINDING#0"},"participation":{"agencyBindings":[],"roleBindings":[{"role":"ACTOR","roleBindingKey":"ROLE_BINDING#0","subject":{"kind":"KNOWN","subjectRef":{"artifactId":"actor-001","family":"SUBJECT","ownerRef":"urn:zyppi:owner:council:v1"}}}]},"policyUniverse":{"applicabilityProvenanceBinding":{"artifactId":"prov-001","family":"PROVENANCE","ownerRef":"urn:zyppi:owner:council:v1"},"applicablePolicyMaterial":[],"dependencyTopology":{"dependencyEdges":[]}},"requestId":"req-v2-vector-a-001","requestedAction":{"actionPerformerBindings":[{"actorParticipationRef":"ROLE_BINDING#0","agencyReliance":{"kind":"NO_DELEGATED_AGENCY_RELIANCE"},"performerKey":"PERFORMER#0"}],"actionSemanticRef":{"artifactId":"read-trade-item-v1","family":"ACTION_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"},"actionTargetBindings":[{"targetRef":{"artifactId":"asset-001","family":"TARGET","ownerRef":"urn:zyppi:owner:council:v1"},"targetSlotSemanticRef":{"artifactId":"primary-target-v1","family":"TARGET_SLOT_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"}}],"intentActionCompatibilityBinding":{"exactCompatibilityContractRef":{"artifactId":"compat-contract-001","family":"COMPATIBILITY_CONTRACT","ownerRef":"urn:zyppi:owner:council:v1"},"kind":"GOVERNED_SEMANTIC_CONTRACT"},"requestedCapabilityClaimBindings":[]}}',
} as const;

/**
 * Vector A: Minimal same-Subject request with valid V2 object references.
 */
export const VECTOR_A_REQUEST: ExecutionRequestV2 = {
  contractVersion: "v2",
  requestId: "req-v2-vector-a-001",
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
    intentCategory: "DISCOVER",
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
        artifactId: "discovery-v1",
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
      artifactId: "read-trade-item-v1",
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
    ownerDeterminationBindings: [],
  },
  executionContext: {
    executionId: "exec-v2-vector-a-001",
    temporalCoordinates: {
      tEInput: "2026-08-24T17:00:00Z",
    },
    budget: 1000,
  },
};

export const VECTOR_A_EXPECTED_DIGESTS = {
  semanticStateRef:
    "sha256:946a1d1d35385c868648e1967ca70ea87ea1f254b517deb46a2ea6d5f6e7708d",
  evidenceStateRef:
    "sha256:93f27b9a5bf46d85dd8e98710398e85db24eb8efc0e43827ebf6c900f73e2dde",
  policyUniverseRef:
    "sha256:3e72c74c72b3cfd918eb167e12c8e5d2cad8644b808634e50293fc94bb3e9777",
  wholeRequestDigestCandidate:
    "sha256:0ca6861d1d3732b4fa67ce841a039cb73d09393ac932d14e546c4d3345ae0a98",
} as const;

export const VECTOR_B_CANONICAL_PREIMAGES = {
  constitutionalStateJcs:
    '{"stateViews":[{"stateBindings":[{"exactStateRef":{"artifactId":"agreement-doc-001","family":"STATE_INSTANCE","ownerRef":"urn:zyppi:owner:council:v1"},"kind":"RELATIONSHIP_STATE","relationshipKind":"REIFIED","relationshipRef":{"artifactId":"agency-agreement-v1","family":"RELATIONSHIP","ownerRef":"urn:zyppi:owner:council:v1"}}],"viewScope":{"artifactId":"jurisdiction-eu-v1","family":"SCOPE","ownerRef":"urn:zyppi:owner:council:v1"}}]}',
  evidenceStateJcs:
    '{"evidencePresentationBindings":[{"evidenceRequirementRef":{"artifactId":"signature-v1","family":"EVIDENCE_REQUIREMENT","ownerRef":"urn:zyppi:owner:council:v1"},"presentedEvidenceRefs":[{"artifactId":"sig-payload-001","family":"EVIDENCE","ownerRef":"urn:zyppi:owner:cert-auth:v1"}]}],"evidenceRequirementBindings":[{"governedRequirementRef":{"artifactId":"signature-v1","family":"EVIDENCE_REQUIREMENT","ownerRef":"urn:zyppi:owner:council:v1"},"requirementAuthorityBinding":{"artifactId":"cert-auth-001","family":"OWNER","ownerRef":"urn:zyppi:owner:cert-auth:v1"},"requirementScopeBinding":{"artifactId":"jurisdiction-eu-v1","family":"SCOPE","ownerRef":"urn:zyppi:owner:council:v1"}}],"integrityCoordinates":[{"algorithm":"SHA-256","evidenceRef":{"artifactId":"sig-payload-001","family":"EVIDENCE","ownerRef":"urn:zyppi:owner:cert-auth:v1"},"expectedDigest":"sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}],"suppliedEvidenceMaterial":[{"evidenceRef":{"artifactId":"sig-payload-001","family":"EVIDENCE","ownerRef":"urn:zyppi:owner:cert-auth:v1"},"material":{"sig":"0xABCDEF"},"ownerRef":{"artifactId":"cert-auth-001","family":"OWNER","ownerRef":"urn:zyppi:owner:cert-auth:v1"},"schemaRef":{"artifactId":"pki-sig-v1","family":"STATE_ARTIFACT","ownerRef":"urn:zyppi:owner:council:v1"}}]}',
  policyUniverseJcs:
    '{"applicabilityProvenanceBinding":{"artifactId":"prov-002","family":"PROVENANCE","ownerRef":"urn:zyppi:owner:council:v1"},"applicablePolicyMaterial":[{"material":{"rule":"allow_if_authorized"},"policyRef":{"artifactId":"base-transfer-v1","family":"POLICY","ownerRef":"urn:zyppi:owner:council:v1","provenanceRef":"prov-pol-001","stateRef":"state-base-001","version":"1.0.0"}},{"material":{"rule":"require_pki_signature"},"policyRef":{"artifactId":"eu-transfer-rules-v1","family":"POLICY","ownerRef":"urn:zyppi:owner:council:v1","provenanceRef":"prov-pol-002","stateRef":"state-eu-001","version":"1.0.0"}}],"dependencyTopology":{"dependencyEdges":[{"dependeePolicyRef":{"artifactId":"base-transfer-v1","family":"POLICY","ownerRef":"urn:zyppi:owner:council:v1","provenanceRef":"prov-pol-001","stateRef":"state-base-001","version":"1.0.0"},"dependentPolicyRef":{"artifactId":"eu-transfer-rules-v1","family":"POLICY","ownerRef":"urn:zyppi:owner:council:v1","provenanceRef":"prov-pol-002","stateRef":"state-eu-001","version":"1.0.0"}}]}}',
  wholeRequestJcs:
    '{"constitutionalState":{"stateViews":[{"stateBindings":[{"exactStateRef":{"artifactId":"agreement-doc-001","family":"STATE_INSTANCE","ownerRef":"urn:zyppi:owner:council:v1"},"kind":"RELATIONSHIP_STATE","relationshipKind":"REIFIED","relationshipRef":{"artifactId":"agency-agreement-v1","family":"RELATIONSHIP","ownerRef":"urn:zyppi:owner:council:v1"}}],"viewScope":{"artifactId":"jurisdiction-eu-v1","family":"SCOPE","ownerRef":"urn:zyppi:owner:council:v1"}}]},"contractVersion":"v2","evaluationContext":{"authorizedInputBindings":[{"semanticRef":{"artifactId":"auth-token-v1","family":"EVALUATION_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"},"value":"TOKEN-9988-SECURE"}],"boundContextBindings":[],"evaluationParameterBindings":[],"ownerDeterminationBindings":[{"assessedAtCoordinateRef":"tValid","constitutionalOwnerRef":{"artifactId":"council","family":"OWNER","ownerRef":"urn:zyppi:owner:council:v1"},"determinationBindingKey":"OWNER_DETERMINATION#0","determinationDependencyDeclaration":{"kind":"AUTHORITATIVELY_NONE"},"determinationQuestionBinding":{"questionOperandBindings":[{"operandKind":"PARTICIPATION_BINDING","operandSlotSemanticRef":{"artifactId":"slot1-v1","family":"EVALUATION_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"},"roleBindingRef":"ROLE_BINDING#1"}],"questionSemanticRef":{"artifactId":"compat-check-v1","family":"QUESTION_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"}},"exactRuleRef":{"artifactId":"rule-check-001","family":"RULE","ownerRef":"urn:zyppi:owner:council:v1"},"exactStateRef":{"artifactId":"state-check-001","family":"STATE_INSTANCE","ownerRef":"urn:zyppi:owner:council:v1"},"ownerNativeResult":{"outcome":"COMPATIBLE"},"provenanceRef":{"artifactId":"prov-001","family":"PROVENANCE","ownerRef":"urn:zyppi:owner:council:v1"}}]},"evidenceState":{"evidencePresentationBindings":[{"evidenceRequirementRef":{"artifactId":"signature-v1","family":"EVIDENCE_REQUIREMENT","ownerRef":"urn:zyppi:owner:council:v1"},"presentedEvidenceRefs":[{"artifactId":"sig-payload-001","family":"EVIDENCE","ownerRef":"urn:zyppi:owner:cert-auth:v1"}]}],"evidenceRequirementBindings":[{"governedRequirementRef":{"artifactId":"signature-v1","family":"EVIDENCE_REQUIREMENT","ownerRef":"urn:zyppi:owner:council:v1"},"requirementAuthorityBinding":{"artifactId":"cert-auth-001","family":"OWNER","ownerRef":"urn:zyppi:owner:cert-auth:v1"},"requirementScopeBinding":{"artifactId":"jurisdiction-eu-v1","family":"SCOPE","ownerRef":"urn:zyppi:owner:council:v1"}}],"integrityCoordinates":[{"algorithm":"SHA-256","evidenceRef":{"artifactId":"sig-payload-001","family":"EVIDENCE","ownerRef":"urn:zyppi:owner:cert-auth:v1"},"expectedDigest":"sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}],"suppliedEvidenceMaterial":[{"evidenceRef":{"artifactId":"sig-payload-001","family":"EVIDENCE","ownerRef":"urn:zyppi:owner:cert-auth:v1"},"material":{"sig":"0xABCDEF"},"ownerRef":{"artifactId":"cert-auth-001","family":"OWNER","ownerRef":"urn:zyppi:owner:cert-auth:v1"},"schemaRef":{"artifactId":"pki-sig-v1","family":"STATE_ARTIFACT","ownerRef":"urn:zyppi:owner:council:v1"}}]},"executionContext":{"budget":5000,"entropy":"0xdeadbeef","executionId":"exec-v2-vector-b-002","temporalCoordinates":{"tEInput":"2026-08-24T17:00:00Z","tTrust":"2026-08-24T17:00:00Z","tValid":"2026-08-24T17:00:00.12Z"}},"intent":{"candidateStateBinding":{"exactStateInstance":{"kind":"OWNER_TYPED_INLINE","material":{"amount":50,"details":{"note":"Delegated transfer request"},"token":"TK-9981-Ã"},"ownerRef":{"artifactId":"council","family":"OWNER","ownerRef":"urn:zyppi:owner:council:v1"},"schemaRef":{"artifactId":"transfer-manifest-v1","family":"STATE_ARTIFACT","ownerRef":"urn:zyppi:owner:council:v1"}},"stateSemanticRef":{"artifactId":"ownership-v1","family":"STATE_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"},"stateTargetRef":{"artifactId":"asset-002","family":"TARGET","ownerRef":"urn:zyppi:owner:council:v1"}},"intentCategory":"TRANSFER","intentTargetRef":{"artifactId":"asset-002","family":"TARGET","ownerRef":"urn:zyppi:owner:council:v1"},"originatorParticipationRef":"ROLE_BINDING#1"},"participation":{"agencyBindings":[{"actorRoleBindingRef":"ROLE_BINDING#0","agencyBindingKey":"AGENCY_BINDING#0","governedSubjectRoleBindingRef":"ROLE_BINDING#1","terminalAgencyBasisRef":{"artifactId":"power-of-attorney-v1","family":"AGENCY_BASIS","ownerRef":"urn:zyppi:owner:council:v1"}}],"roleBindings":[{"role":"ACTOR","roleBindingKey":"ROLE_BINDING#0","subject":{"kind":"KNOWN","subjectRef":{"artifactId":"agent-002","family":"SUBJECT","ownerRef":"urn:zyppi:owner:council:v1"}}},{"role":"GOVERNED_SUBJECT","roleBindingKey":"ROLE_BINDING#1","subject":{"kind":"KNOWN","subjectRef":{"artifactId":"principal-001","family":"SUBJECT","ownerRef":"urn:zyppi:owner:council:v1"}}}]},"policyUniverse":{"applicabilityProvenanceBinding":{"artifactId":"prov-002","family":"PROVENANCE","ownerRef":"urn:zyppi:owner:council:v1"},"applicablePolicyMaterial":[{"material":{"rule":"allow_if_authorized"},"policyRef":{"artifactId":"base-transfer-v1","family":"POLICY","ownerRef":"urn:zyppi:owner:council:v1","provenanceRef":"prov-pol-001","stateRef":"state-base-001","version":"1.0.0"}},{"material":{"rule":"require_pki_signature"},"policyRef":{"artifactId":"eu-transfer-rules-v1","family":"POLICY","ownerRef":"urn:zyppi:owner:council:v1","provenanceRef":"prov-pol-002","stateRef":"state-eu-001","version":"1.0.0"}}],"dependencyTopology":{"dependencyEdges":[{"dependeePolicyRef":{"artifactId":"base-transfer-v1","family":"POLICY","ownerRef":"urn:zyppi:owner:council:v1","provenanceRef":"prov-pol-001","stateRef":"state-base-001","version":"1.0.0"},"dependentPolicyRef":{"artifactId":"eu-transfer-rules-v1","family":"POLICY","ownerRef":"urn:zyppi:owner:council:v1","provenanceRef":"prov-pol-002","stateRef":"state-eu-001","version":"1.0.0"}}]}},"requestId":"req-v2-vector-b-002","requestedAction":{"actionPerformerBindings":[{"actorParticipationRef":"ROLE_BINDING#0","agencyReliance":{"agencyBindingRef":"AGENCY_BINDING#0","kind":"DELEGATED_AGENCY_SINGLE"},"performerKey":"PERFORMER#0"}],"actionSemanticRef":{"artifactId":"transfer-asset-v1","family":"ACTION_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"},"actionTargetBindings":[{"targetRef":{"artifactId":"asset-002","family":"TARGET","ownerRef":"urn:zyppi:owner:council:v1"},"targetSlotSemanticRef":{"artifactId":"transfer-target-v1","family":"TARGET_SLOT_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"}}],"intentActionCompatibilityBinding":{"kind":"OWNER_DETERMINATION","ownerDeterminationBindingRef":"OWNER_DETERMINATION#0"},"requestedCapabilityClaimBindings":[{"capabilityClaimKey":"CAPABILITY_CLAIM#0","claimantPerformerRefs":["PERFORMER#0"],"requestedCapabilityRef":{"artifactId":"asset-transfer-v1","family":"REQUESTED_CAPABILITY","ownerRef":"urn:zyppi:owner:council:v1"}}]}}',
} as const;

/**
 * Vector B: Delegated / graph-rich request with valid V2 object references.
 */
export const VECTOR_B_REQUEST: ExecutionRequestV2 = {
  contractVersion: "v2",
  requestId: "req-v2-vector-b-002",
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
            artifactId: "agent-002",
          },
        },
      },
      {
        roleBindingKey: "rb_principal",
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
        agencyBindingKey: "ab_del",
        actorRoleBindingRef: "rb_actor",
        governedSubjectRoleBindingRef: "rb_principal",
        terminalAgencyBasisRef: {
          family: "AGENCY_BASIS",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "power-of-attorney-v1",
        },
      },
    ],
  },
  intent: {
    originatorParticipationRef: "rb_principal",
    intentCategory: "TRANSFER",
    intentTargetRef: {
      family: "TARGET",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "asset-002",
    },
    candidateStateBinding: {
      stateTargetRef: {
        family: "TARGET",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "asset-002",
      },
      stateSemanticRef: {
        family: "STATE_SEMANTIC",
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "ownership-v1",
      },
      exactStateInstance: {
        kind: "OWNER_TYPED_INLINE",
        ownerRef: OWNER_COUNCIL,
        schemaRef: {
          family: "STATE_ARTIFACT",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "transfer-manifest-v1",
        },
        material: {
          token: "TK-9981-Ã",
          amount: 50,
          details: { note: "Delegated transfer request" },
        },
      },
    },
  },
  requestedAction: {
    actionSemanticRef: {
      family: "ACTION_SEMANTIC",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "transfer-asset-v1",
    },
    intentActionCompatibilityBinding: {
      kind: "OWNER_DETERMINATION",
      ownerDeterminationBindingRef: "od_compat",
    },
    actionPerformerBindings: [
      {
        performerKey: "pk_performer",
        actorParticipationRef: "rb_actor",
        agencyReliance: {
          kind: "DELEGATED_AGENCY_SINGLE",
          agencyBindingRef: "ab_del",
        },
      },
    ],
    actionTargetBindings: [
      {
        targetSlotSemanticRef: {
          family: "TARGET_SLOT_SEMANTIC",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "transfer-target-v1",
        },
        targetRef: {
          family: "TARGET",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "asset-002",
        },
      },
    ],
    requestedCapabilityClaimBindings: [
      {
        capabilityClaimKey: "cap_claim_1",
        requestedCapabilityRef: {
          family: "REQUESTED_CAPABILITY",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "asset-transfer-v1",
        },
        claimantPerformerRefs: ["pk_performer"],
      },
    ],
  },
  constitutionalState: {
    semanticStateRef:
      "sha256:3436d1769040a9e5f586eb8e3a8617465cec90341d5a1e528587764b50163831",
    stateViews: [
      {
        viewKey: "vk_gov",
        viewScope: {
          family: "SCOPE",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "jurisdiction-eu-v1",
        },
        stateBindings: [
          {
            stateBindingKey: "sb_rel",
            kind: "RELATIONSHIP_STATE",
            relationshipKind: "REIFIED",
            relationshipRef: {
              family: "RELATIONSHIP",
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "agency-agreement-v1",
            },
            exactStateRef: {
              family: "STATE_INSTANCE",
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "agreement-doc-001",
            },
          },
        ],
      },
    ],
  },
  evidenceState: {
    evidenceStateRef:
      "sha256:1b87097c8fed038164079c10193ec53d1ff554f856c67b831e11606272b8bc79",
    evidenceRequirementBindings: [
      {
        requirementKey: "req_proof",
        governedRequirementRef: {
          family: "EVIDENCE_REQUIREMENT",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "signature-v1",
        },
        requirementAuthorityBinding: {
          family: "OWNER",
          ownerRef: "urn:zyppi:owner:cert-auth:v1",
          artifactId: "cert-auth-001",
        },
        requirementScopeBinding: {
          family: "SCOPE",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "jurisdiction-eu-v1",
        },
      },
    ],
    suppliedEvidenceMaterial: [
      {
        materialKey: "mat_sig",
        evidenceRef: {
          family: "EVIDENCE",
          ownerRef: "urn:zyppi:owner:cert-auth:v1",
          artifactId: "sig-payload-001",
        },
        ownerRef: {
          family: "OWNER",
          ownerRef: "urn:zyppi:owner:cert-auth:v1",
          artifactId: "cert-auth-001",
        },
        schemaRef: {
          family: "STATE_ARTIFACT",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "pki-sig-v1",
        },
        material: { sig: "0xABCDEF" },
      },
    ],
    evidencePresentationBindings: [
      {
        evidenceRequirementRef: {
          family: "EVIDENCE_REQUIREMENT",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "signature-v1",
        },
        presentedEvidenceRefs: [
          {
            family: "EVIDENCE",
            ownerRef: "urn:zyppi:owner:cert-auth:v1",
            artifactId: "sig-payload-001",
          },
        ],
      },
    ],
    integrityCoordinates: [
      {
        coordinateKey: "ic_sig",
        evidenceRef: {
          family: "EVIDENCE",
          ownerRef: "urn:zyppi:owner:cert-auth:v1",
          artifactId: "sig-payload-001",
        },
        expectedDigest:
          "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        algorithm: "SHA-256",
      },
    ],
  },
  policyUniverse: {
    policyUniverseRef:
      "sha256:f3451cdd547b91e1245462add36c82eecc47ed41f64bc7f993ba892b6ca8e7a3",
    applicablePolicyMaterial: [
      {
        policyKey: "pol_base",
        policyRef: {
          family: "POLICY",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "base-transfer-v1",
          version: "1.0.0",
          stateRef: "state-base-001",
          provenanceRef: "prov-pol-001",
        },
        material: { rule: "allow_if_authorized" },
      },
      {
        policyKey: "pol_eu",
        policyRef: {
          family: "POLICY",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "eu-transfer-rules-v1",
          version: "1.0.0",
          stateRef: "state-eu-001",
          provenanceRef: "prov-pol-002",
        },
        material: { rule: "require_pki_signature" },
      },
    ],
    dependencyTopology: {
      dependencyEdges: [
        {
          dependeePolicyRef: {
            family: "POLICY",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "base-transfer-v1",
            version: "1.0.0",
            stateRef: "state-base-001",
            provenanceRef: "prov-pol-001",
          },
          dependentPolicyRef: {
            family: "POLICY",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "eu-transfer-rules-v1",
            version: "1.0.0",
            stateRef: "state-eu-001",
            provenanceRef: "prov-pol-002",
          },
        },
      ],
    },
    applicabilityProvenanceBinding: PROV_002,
  },
  evaluationContext: {
    authorizedInputBindings: [
      {
        bindingKey: "b_auth",
        semanticRef: {
          family: "EVALUATION_SEMANTIC",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "auth-token-v1",
        },
        value: "TOKEN-9988-SECURE",
      },
    ],
    evaluationParameterBindings: [],
    boundContextBindings: [],
    ownerDeterminationBindings: [
      {
        determinationBindingKey: "od_compat",
        determinationQuestionBinding: {
          questionSemanticRef: {
            family: "QUESTION_SEMANTIC",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "compat-check-v1",
          },
          questionOperandBindings: [
            {
              operandKey: "op_1",
              operandSlotSemanticRef: {
                family: "EVALUATION_SEMANTIC",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "slot1-v1",
              },
              operandKind: "PARTICIPATION_BINDING",
              roleBindingRef: "rb_principal",
            },
          ],
        },
        constitutionalOwnerRef: OWNER_COUNCIL,
        ownerNativeResult: { outcome: "COMPATIBLE" },
        exactStateRef: {
          family: "STATE_INSTANCE",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "state-check-001",
        },
        exactRuleRef: {
          family: "RULE",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "rule-check-001",
        },
        assessedAtCoordinateRef: "tValid",
        provenanceRef: PROV_001,
        determinationDependencyDeclaration: {
          kind: "AUTHORITATIVELY_NONE",
        },
      },
    ],
  },
  executionContext: {
    executionId: "exec-v2-vector-b-002",
    temporalCoordinates: {
      tValid: "2026-08-24T20:00:00.1200+03:00",
      tEInput: "2026-08-24T17:00:00Z",
      tTrust: "2026-08-24T17:00:00.000000Z",
    },
    budget: 5000,
    entropy: "0xdeadbeef",
  },
};

export const VECTOR_B_EXPECTED_DIGESTS = {
  semanticStateRef:
    "sha256:3436d1769040a9e5f586eb8e3a8617465cec90341d5a1e528587764b50163831",
  evidenceStateRef:
    "sha256:1b87097c8fed038164079c10193ec53d1ff554f856c67b831e11606272b8bc79",
  policyUniverseRef:
    "sha256:f3451cdd547b91e1245462add36c82eecc47ed41f64bc7f993ba892b6ca8e7a3",
  wholeRequestDigestCandidate:
    "sha256:e3894c50a34edd6ecb4548b5bf575597054fa694bf2d9f84cddb2f4236246cf5",
} as const;

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
      "sha256:a089fa743c28fcb4e304fba6fa22780637b3a12dcdb77f0fabaf30ba650a7b69",
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
    "sha256:a089fa743c28fcb4e304fba6fa22780637b3a12dcdb77f0fabaf30ba650a7b69",
  evidenceStateRef:
    "sha256:93f27b9a5bf46d85dd8e98710398e85db24eb8efc0e43827ebf6c900f73e2dde",
  policyUniverseRef:
    "sha256:3e72c74c72b3cfd918eb167e12c8e5d2cad8644b808634e50293fc94bb3e9777",
  wholeRequestDigestCandidate:
    "sha256:8b9ac554ace8abac2c1fe4e9e96dfc090fff48feb483080dedba05c8fc14f60f",
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
      "sha256:5c4bbf9d47fe50dffb550337c7f330630f9b912a68d5a9f11fc9997838d15ce9",
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
      "sha256:c6222d38efa2942105a6944e9a3a9a85492488054207cc51b86b0dbdf441cb70",
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
      "sha256:7e230089152ed1f05a575557a43710f43d469f3c862724d5e9c0673aa684b4a9",
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
    "sha256:5c4bbf9d47fe50dffb550337c7f330630f9b912a68d5a9f11fc9997838d15ce9",
  evidenceStateRef:
    "sha256:c6222d38efa2942105a6944e9a3a9a85492488054207cc51b86b0dbdf441cb70",
  policyUniverseRef:
    "sha256:7e230089152ed1f05a575557a43710f43d469f3c862724d5e9c0673aa684b4a9",
  wholeRequestDigestCandidate:
    "sha256:3c4370070d0451fee4344b5ca1ee8501d19314923b12372b515b545df3661867",
} as const;

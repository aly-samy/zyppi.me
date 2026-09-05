import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  deriveEvidenceStateRefV2,
  deriveExecutionRequestV2DigestCandidate,
  derivePolicyUniverseRefV2,
  deriveSemanticStateRefV2,
  validateExecutionRequestV2,
  type ExecutionRequestV2,
} from "@zyppi/domain";
import { buildEvaluationCoordinate } from "./ec.js";
import {
  materializeExecutionRequestV2,
  type ExecutionRequestV2MaterializationInput,
} from "./v2ExecutionMaterialization.js";

/**
 * Local test vectors derived from authoritative V2-02 identity vector set.
 */
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

const VECTOR_A_REQUEST: ExecutionRequestV2 = {
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

const VECTOR_B_REQUEST: ExecutionRequestV2 = {
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

const VECTOR_B_EXPECTED_DIGESTS = {
  wholeRequestDigestCandidate:
    "sha256:214125eecac496e72e1ca85acd6221e395620edf269bcb7facca548e253c0491",
} as const;

/**
 * Domain-neutral synthetic fixture for V203-T01 & V203-T18 genericity proofs.
 * Contains zero GS1, GTIN, GLN, Digital Link, DPP, or commerce terms.
 */
const SYNTHETIC_PROV = {
  family: "PROVENANCE" as const,
  ownerRef: "urn:zyppi:owner:synthetic:v1",
  artifactId: "synthetic-prov-001",
};

const rawSyntheticConstitutionalState = {
  semanticStateRef: "",
  stateViews: [
    {
      viewKey: "synthetic_view_1",
      viewScope: {
        family: "SCOPE" as const,
        ownerRef: "urn:zyppi:owner:synthetic:v1",
        artifactId: "generic-scope-v1",
      },
      stateBindings: [
        {
          stateBindingKey: "synthetic_binding_1",
          kind: "IDENTITY_STATE" as const,
          subjectRef: {
            family: "SUBJECT" as const,
            ownerRef: "urn:zyppi:owner:synthetic:v1",
            artifactId: "actor-001",
          },
          stateSemanticRef: {
            family: "STATE_SEMANTIC" as const,
            ownerRef: "urn:zyppi:owner:synthetic:v1",
            artifactId: "generic-state-v1",
          },
          exactStateRef: {
            family: "STATE_INSTANCE" as const,
            ownerRef: "urn:zyppi:owner:synthetic:v1",
            artifactId: "instance-001",
          },
        },
      ],
    },
  ],
};

const derivedSyntheticSemanticStateRef = deriveSemanticStateRefV2(
  rawSyntheticConstitutionalState as unknown as Parameters<
    typeof deriveSemanticStateRefV2
  >[0],
);

const syntheticConstitutionalState = {
  ...rawSyntheticConstitutionalState,
  semanticStateRef: derivedSyntheticSemanticStateRef.ok
    ? derivedSyntheticSemanticStateRef.value
    : "",
};

const rawSyntheticEvidenceState = {
  evidenceStateRef: "",
  evidenceRequirementBindings: [],
  suppliedEvidenceMaterial: [],
  evidencePresentationBindings: [],
  integrityCoordinates: [],
};

const derivedSyntheticEvidenceStateRef = deriveEvidenceStateRefV2(
  rawSyntheticEvidenceState as unknown as Parameters<
    typeof deriveEvidenceStateRefV2
  >[0],
);

const syntheticEvidenceState = {
  ...rawSyntheticEvidenceState,
  evidenceStateRef: derivedSyntheticEvidenceStateRef.ok
    ? derivedSyntheticEvidenceStateRef.value
    : "",
};

const rawSyntheticPolicyUniverse = {
  policyUniverseRef: "",
  applicablePolicyMaterial: [],
  dependencyTopology: {
    dependencyEdges: [],
  },
  applicabilityProvenanceBinding: SYNTHETIC_PROV,
};

const derivedSyntheticPolicyUniverseRef = derivePolicyUniverseRefV2(
  rawSyntheticPolicyUniverse as unknown as Parameters<
    typeof derivePolicyUniverseRefV2
  >[0],
);

const syntheticPolicyUniverse = {
  ...rawSyntheticPolicyUniverse,
  policyUniverseRef: derivedSyntheticPolicyUniverseRef.ok
    ? derivedSyntheticPolicyUniverseRef.value
    : "",
};

const SYNTHETIC_NEUTRAL_REQUEST: ExecutionRequestV2 = {
  contractVersion: "v2",
  requestId: "req-v2-synthetic-001",
  participation: {
    roleBindings: [
      {
        roleBindingKey: "rb_actor",
        role: "ACTOR",
        subject: {
          kind: "KNOWN",
          subjectRef: {
            family: "SUBJECT",
            ownerRef: "urn:zyppi:owner:synthetic:v1",
            artifactId: "actor-001",
          },
        },
      },
    ],
    agencyBindings: [],
  },
  intent: {
    originatorParticipationRef: "rb_actor",
    intentCategory: "DISCOVER",
    intentTargetRef: {
      family: "TARGET",
      ownerRef: "urn:zyppi:owner:synthetic:v1",
      artifactId: "resource-001",
    },
    candidateStateBinding: {
      stateTargetRef: {
        family: "TARGET",
        ownerRef: "urn:zyppi:owner:synthetic:v1",
        artifactId: "resource-001",
      },
      stateSemanticRef: {
        family: "STATE_SEMANTIC",
        ownerRef: "urn:zyppi:owner:synthetic:v1",
        artifactId: "generic-state-v1",
      },
      exactStateInstance: {
        kind: "GOVERNED_ARTIFACT_REF",
        stateInstanceRef: {
          family: "STATE_INSTANCE",
          ownerRef: "urn:zyppi:owner:synthetic:v1",
          artifactId: "instance-001",
        },
      },
    },
  },
  requestedAction: {
    actionSemanticRef: {
      family: "ACTION_SEMANTIC",
      ownerRef: "urn:zyppi:owner:synthetic:v1",
      artifactId: "inspect-resource-v1",
    },
    intentActionCompatibilityBinding: {
      kind: "GOVERNED_SEMANTIC_CONTRACT",
      exactCompatibilityContractRef: {
        family: "COMPATIBILITY_CONTRACT",
        ownerRef: "urn:zyppi:owner:synthetic:v1",
        artifactId: "compat-contract-001",
      },
    },
    actionPerformerBindings: [
      {
        performerKey: "pk_performer",
        actorParticipationRef: "rb_actor",
        agencyReliance: {
          kind: "NO_DELEGATED_AGENCY_RELIANCE",
        },
      },
    ],
    actionTargetBindings: [
      {
        targetSlotSemanticRef: {
          family: "TARGET_SLOT_SEMANTIC",
          ownerRef: "urn:zyppi:owner:synthetic:v1",
          artifactId: "generic-target-slot-v1",
        },
        targetRef: {
          family: "TARGET",
          ownerRef: "urn:zyppi:owner:synthetic:v1",
          artifactId: "resource-001",
        },
      },
    ],
    requestedCapabilityClaimBindings: [],
  },
  constitutionalState: syntheticConstitutionalState,
  evidenceState: syntheticEvidenceState,
  policyUniverse: syntheticPolicyUniverse,
  evaluationContext: {
    authorizedInputBindings: [],
    evaluationParameterBindings: [],
    boundContextBindings: [],
    ownerDeterminationBindings: [],
  },
  executionContext: {
    executionId: "exec-v2-synthetic-001",
    temporalCoordinates: {
      tEInput: "2026-09-01T00:00:00Z",
    },
    budget: 1000,
  },
};

/**
 * Helper to convert an ExecutionRequestV2 into ExecutionRequestV2MaterializationInput by omitting contractVersion.
 */
function toMaterializationInput(
  req: ExecutionRequestV2,
): ExecutionRequestV2MaterializationInput {
  const input = { ...req } as Record<string, unknown>;
  delete input.contractVersion;
  return input as unknown as ExecutionRequestV2MaterializationInput;
}

describe("CCP-RI-V2-03 — Application V2 Materialization Seam", () => {
  describe("Core materialization", () => {
    it("V203-T01 — Valid generic materialization", () => {
      const input = toMaterializationInput(SYNTHETIC_NEUTRAL_REQUEST);
      const res = materializeExecutionRequestV2(input);

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.executionRequest.contractVersion).toBe("v2");

      const expectedDigest = deriveExecutionRequestV2DigestCandidate(
        res.executionRequest,
      );
      expect(expectedDigest.ok).toBe(true);
      if (!expectedDigest.ok) return;

      expect(res.wholeRequestDigestCandidate).toBe(expectedDigest.value);
    });

    it("V203-T02 — V2 generation marker", () => {
      const input = toMaterializationInput(VECTOR_A_REQUEST);
      const res = materializeExecutionRequestV2(input);

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.executionRequest.contractVersion).toBe("v2");
    });

    it("V203-T03 — Structural validity", () => {
      const input = toMaterializationInput(VECTOR_A_REQUEST);
      const res = materializeExecutionRequestV2(input);

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const structVal = validateExecutionRequestV2(res.executionRequest);
      expect(structVal.ok).toBe(true);
    });
  });

  describe("Component identity", () => {
    it("V203-T04 — Constitutional identity mismatch", () => {
      const input = toMaterializationInput(VECTOR_A_REQUEST);
      const badInput: ExecutionRequestV2MaterializationInput = {
        ...input,
        constitutionalState: {
          ...input.constitutionalState,
          semanticStateRef:
            "sha256:0000000000000000000000000000000000000000000000000000000000000000",
        },
      };

      const res = materializeExecutionRequestV2(badInput);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("SEMANTIC_STATE_IDENTITY");
      expect(res.error.code).toBe("COMPONENT_DIGEST_MISMATCH");
      expect(res.error.path).toBe("constitutionalState.semanticStateRef");
    });

    it("V203-T05 — Evidence identity mismatch", () => {
      const input = toMaterializationInput(VECTOR_A_REQUEST);
      const badInput: ExecutionRequestV2MaterializationInput = {
        ...input,
        evidenceState: {
          ...input.evidenceState,
          evidenceStateRef:
            "sha256:0000000000000000000000000000000000000000000000000000000000000000",
        },
      };

      const res = materializeExecutionRequestV2(badInput);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("EVIDENCE_STATE_IDENTITY");
      expect(res.error.code).toBe("COMPONENT_DIGEST_MISMATCH");
      expect(res.error.path).toBe("evidenceState.evidenceStateRef");
    });

    it("V203-T06 — Policy identity mismatch", () => {
      const input = toMaterializationInput(VECTOR_A_REQUEST);
      const badInput: ExecutionRequestV2MaterializationInput = {
        ...input,
        policyUniverse: {
          ...input.policyUniverse,
          policyUniverseRef:
            "sha256:0000000000000000000000000000000000000000000000000000000000000000",
        },
      };

      const res = materializeExecutionRequestV2(badInput);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("POLICY_UNIVERSE_IDENTITY");
      expect(res.error.code).toBe("COMPONENT_DIGEST_MISMATCH");
      expect(res.error.path).toBe("policyUniverse.policyUniverseRef");
    });

    it("V203-T07 — No silent identity repair", () => {
      const input = toMaterializationInput(VECTOR_A_REQUEST);
      const badRef =
        "sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
      const badInput: ExecutionRequestV2MaterializationInput = {
        ...input,
        constitutionalState: {
          ...input.constitutionalState,
          semanticStateRef: badRef,
        },
      };

      const res = materializeExecutionRequestV2(badInput);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      // Prove Application fails closed at stage SEMANTIC_STATE_IDENTITY
      expect(res.stage).toBe("SEMANTIC_STATE_IDENTITY");
      // Prove input ref was not silently repaired
      expect(badInput.constitutionalState.semanticStateRef).toBe(badRef);
    });
  });

  describe("Whole-request identity", () => {
    it("V203-T08 — Root candidate equality", () => {
      const input = toMaterializationInput(VECTOR_A_REQUEST);
      const res = materializeExecutionRequestV2(input);

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const directRes = deriveExecutionRequestV2DigestCandidate(
        res.executionRequest,
      );
      expect(directRes.ok).toBe(true);
      if (!directRes.ok) return;

      expect(res.wholeRequestDigestCandidate).toBe(directRes.value);
    });

    it("V203-T09 — Repeatability", () => {
      const input1 = toMaterializationInput(VECTOR_A_REQUEST);
      const input2 = toMaterializationInput(VECTOR_A_REQUEST);

      const res1 = materializeExecutionRequestV2(input1);
      const res2 = materializeExecutionRequestV2(input2);

      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);
      if (!res1.ok || !res2.ok) return;

      expect(res1.executionRequest).toEqual(res2.executionRequest);
      expect(res1.wholeRequestDigestCandidate).toBe(
        res2.wholeRequestDigestCandidate,
      );
    });

    it("V203-T10 — Lawful transport permutation", () => {
      const input1 = toMaterializationInput(VECTOR_B_REQUEST);

      // Perform an actual multi-element collection order permutation on VECTOR_B_REQUEST
      expect(input1.participation.roleBindings.length).toBeGreaterThan(1);
      const input2: ExecutionRequestV2MaterializationInput = {
        ...input1,
        participation: {
          ...input1.participation,
          roleBindings: [
            input1.participation.roleBindings[1]!,
            input1.participation.roleBindings[0]!,
          ],
        },
      };

      const res1 = materializeExecutionRequestV2(input1);
      const res2 = materializeExecutionRequestV2(input2);

      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);
      if (!res1.ok || !res2.ok) return;

      expect(res1.wholeRequestDigestCandidate).toBe(
        res2.wholeRequestDigestCandidate,
      );
    });

    it("V203-T11 — Meaningful mutation", () => {
      const input1 = toMaterializationInput(VECTOR_A_REQUEST);
      const input2: ExecutionRequestV2MaterializationInput = {
        ...input1,
        executionContext: {
          ...input1.executionContext,
          budget: 2000,
        },
      };

      const res1 = materializeExecutionRequestV2(input1);
      const res2 = materializeExecutionRequestV2(input2);

      expect(res1.ok).toBe(true);
      expect(res2.ok).toBe(true);
      if (!res1.ok || !res2.ok) return;

      expect(res1.wholeRequestDigestCandidate).not.toBe(
        res2.wholeRequestDigestCandidate,
      );
    });
  });

  describe("Epistemic / ownership preservation", () => {
    it("V203-T12 — UNKNOWN preservation", () => {
      const input = toMaterializationInput(VECTOR_A_REQUEST);
      const unknownInput: ExecutionRequestV2MaterializationInput = {
        ...input,
        participation: {
          ...input.participation,
          roleBindings: [
            {
              roleBindingKey: "rb1",
              role: "ACTOR",
              subject: { kind: "UNKNOWN" },
            },
          ],
        },
      };

      const res = materializeExecutionRequestV2(unknownInput);
      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(
        res.executionRequest.participation.roleBindings[0].subject,
      ).toEqual({ kind: "UNKNOWN" });
    });

    it("V203-T13 — Owner determination pass-through", () => {
      const input = toMaterializationInput(VECTOR_B_REQUEST);
      const res = materializeExecutionRequestV2(input);

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.wholeRequestDigestCandidate).toBe(
        VECTOR_B_EXPECTED_DIGESTS.wholeRequestDigestCandidate,
      );
      expect(
        res.executionRequest.evaluationContext.ownerDeterminationBindings,
      ).toEqual(VECTOR_B_REQUEST.evaluationContext.ownerDeterminationBindings);
    });

    it("V203-T14 — No semantic fallback", () => {
      const input = toMaterializationInput(VECTOR_A_REQUEST);
      const inputCopy = { ...input };
      delete (inputCopy as Record<string, unknown>).requestedAction;

      const res = materializeExecutionRequestV2(
        inputCopy as ExecutionRequestV2MaterializationInput,
      );
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("STRUCTURAL_VALIDATION");
      expect(res.error.code).toBe("INVALID_RUNTIME_VALUE");
    });

    it("V203-T15 — Temporal explicitness", () => {
      const input = toMaterializationInput(VECTOR_A_REQUEST);
      const invalidTimeInput: ExecutionRequestV2MaterializationInput = {
        ...input,
        executionContext: {
          ...input.executionContext,
          temporalCoordinates: {
            tEInput: "not-an-iso-date-string",
          },
        },
      };

      const res = materializeExecutionRequestV2(invalidTimeInput);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("STRUCTURAL_VALIDATION");
      expect(res.error.code).toBe("INVALID_VALUE");
      expect(res.error.path).toBe(
        "executionContext.temporalCoordinates.tEInput",
      );
    });
  });

  describe("Generation separation", () => {
    it("V203-T16 — V1-shaped material rejected", () => {
      const v1ShapedMaterial = {
        requestId: "req-v1-001",
        executionId: "exec-v1-001",
        activeConstitutionalView: {},
        evidenceBundle: {},
      } as unknown as ExecutionRequestV2MaterializationInput;

      const res = materializeExecutionRequestV2(v1ShapedMaterial);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("STRUCTURAL_VALIDATION");
    });

    it("V203-T17 — Existing V1 path preserved", () => {
      // Directly invoke existing V1 EvaluationCoordinate builder to prove V1 pathway remains operational
      const ecRes = buildEvaluationCoordinate({
        sccId:
          "sha256:1111111111111111111111111111111111111111111111111111111111111111",
        bcgId:
          "sha256:2222222222222222222222222222222222222222222222222222222222222222",
        pinnedSemanticStateRef: {
          ref: "sha256:3333333333333333333333333333333333333333333333333333333333333333",
        },
        boundContext: { policies: [] },
        evidenceIntegrityCoordinates: [],
        temporalCoordinates: { tEInput: "2026-08-24T17:00:00Z" },
      });
      expect(ecRes.ok).toBe(true);
      if (ecRes.ok) {
        expect(ecRes.coordinate.sccId).toBe(
          "sha256:1111111111111111111111111111111111111111111111111111111111111111",
        );
      }
    });
  });

  describe("Genericity / boundary", () => {
    it("V203-T18 — Synthetic non-GS1 twin", () => {
      const input = toMaterializationInput(SYNTHETIC_NEUTRAL_REQUEST);
      const res = materializeExecutionRequestV2(input);

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      // Verify request uses generic non-GS1 synthetic artifacts
      expect(res.executionRequest.intent.intentTargetRef.artifactId).toBe(
        "resource-001",
      );
      expect(
        res.executionRequest.requestedAction.actionSemanticRef.artifactId,
      ).toBe("inspect-resource-v1");
    });

    it("V203-T19 — No source mutation", () => {
      const input = toMaterializationInput(VECTOR_A_REQUEST);
      const snapshot = JSON.stringify(input);

      const res = materializeExecutionRequestV2(input);
      expect(res.ok).toBe(true);

      const postCallSnapshot = JSON.stringify(input);
      expect(postCallSnapshot).toBe(snapshot);
    });

    it("V203-T20 — Exact assembly", () => {
      const input = toMaterializationInput(VECTOR_A_REQUEST);
      const res = materializeExecutionRequestV2(input);

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const { contractVersion, ...assembledSections } = res.executionRequest;
      expect(contractVersion).toBe("v2");
      expect(assembledSections).toEqual(input);
    });

    it("V203-T21 — Runtime independence", () => {
      const sourcePath = resolve(__dirname, "v2ExecutionMaterialization.ts");
      const content = readFileSync(sourcePath, "utf8");

      expect(content).not.toContain("@zyppi/runtime");
      expect(content).not.toContain("runInternalPipeline");
      expect(content).not.toContain("StageOverrideConfig");
    });

    it("V203-T22 — Domain neutrality", () => {
      const sourcePath = resolve(__dirname, "v2ExecutionMaterialization.ts");
      const content = readFileSync(sourcePath, "utf8");

      const prohibitedVocabulary = [
        "GS1",
        "GTIN",
        "GLN",
        "digital_link",
        "trade_item",
        "DPP",
      ];

      for (const vocab of prohibitedVocabulary) {
        expect(content).not.toContain(vocab);
      }
    });
  });
});

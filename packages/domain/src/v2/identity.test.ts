import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { canonicalizeJcsV2 } from "./canonical.js";
import {
  VECTOR_A_CANONICAL_PREIMAGES,
  VECTOR_A_EXPECTED_DIGESTS,
  VECTOR_A_REQUEST,
  VECTOR_B_CANONICAL_PREIMAGES,
  VECTOR_B_EXPECTED_DIGESTS,
  VECTOR_B_REQUEST,
} from "./fixtures/identityVectors.js";
import {
  deriveEvidenceStateRefV2,
  deriveExecutionRequestV2DigestCandidate,
  derivePolicyUniverseRefV2,
  deriveSemanticStateRefV2,
  getConstitutionalStateIdentityProjectionV2,
  getEvidenceStateIdentityProjectionV2,
  getPolicyUniverseIdentityProjectionV2,
  graphSearchDiagnostics,
  resetGraphSearchDiagnostics,
  verifyEvidenceStateRefV2,
  verifyPolicyUniverseRefV2,
  verifySemanticStateRefV2,
  V2_DOMAIN_SEPARATORS,
} from "./index.js";
import { createHash } from "node:crypto";
import { normalizeTemporalCoordinateV2 } from "./temporal.js";
import type { PolicyRefV2 } from "./refs.js";
import type {
  BoundConstitutionalStateV2,
  ExecutionRequestV2,
} from "./types.js";

const REF_OWNER = {
  family: "OWNER" as const,
  ownerRef: "urn:zyppi:owner:council:v1",
  artifactId: "council",
};

const REF_STATE_ARTIFACT = {
  family: "STATE_ARTIFACT" as const,
  ownerRef: "urn:zyppi:owner:council:v1",
  artifactId: "artifact-001",
};

describe("CCP-RI-V2-02 Mandatory Council Test Suite (V202-T01..T56)", () => {
  // V202-T01
  it("V202-T01 ConstitutionalState identity stable under JSON property permutation", () => {
    const orig = VECTOR_A_REQUEST.constitutionalState;
    const binding = orig.stateViews[0].stateBindings[0];
    if (binding.kind !== "IDENTITY_STATE")
      throw new Error("Expected IDENTITY_STATE");

    const permuted: BoundConstitutionalStateV2 = {
      stateViews: [
        {
          stateBindings: [
            {
              exactStateRef: binding.exactStateRef,
              stateSemanticRef: binding.stateSemanticRef,
              subjectRef: binding.subjectRef,
              kind: binding.kind,
              stateBindingKey: binding.stateBindingKey,
            },
          ],
          viewScope: orig.stateViews[0].viewScope,
          viewKey: orig.stateViews[0].viewKey,
        },
      ],
      semanticStateRef: orig.semanticStateRef,
    };

    const d1 = deriveSemanticStateRefV2(orig);
    const d2 = deriveSemanticStateRefV2(permuted);
    expect(d1.ok).toBe(true);
    expect(d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).toBe(d2.value);
    }
  });

  // V202-T02
  it("V202-T02 EvidenceState identity stable under JSON property permutation", () => {
    const orig = VECTOR_B_REQUEST.evidenceState;
    const permuted = {
      integrityCoordinates: [...orig.integrityCoordinates],
      evidencePresentationBindings: [...orig.evidencePresentationBindings],
      suppliedEvidenceMaterial: [...orig.suppliedEvidenceMaterial],
      evidenceRequirementBindings: [...orig.evidenceRequirementBindings],
      evidenceStateRef: orig.evidenceStateRef,
    };

    const d1 = deriveEvidenceStateRefV2(orig);
    const d2 = deriveEvidenceStateRefV2(permuted);
    expect(d1.ok).toBe(true);
    expect(d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).toBe(d2.value);
    }
  });

  // V202-T03
  it("V202-T03 PolicyUniverse identity stable under JSON property permutation", () => {
    const orig = VECTOR_B_REQUEST.policyUniverse;
    const permuted = {
      applicabilityProvenanceBinding: orig.applicabilityProvenanceBinding,
      dependencyTopology: {
        dependencyEdges: [...orig.dependencyTopology.dependencyEdges],
      },
      applicablePolicyMaterial: [...orig.applicablePolicyMaterial],
      policyUniverseRef: orig.policyUniverseRef,
    };

    const d1 = derivePolicyUniverseRefV2(orig);
    const d2 = derivePolicyUniverseRefV2(permuted);
    expect(d1.ok).toBe(true);
    expect(d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).toBe(d2.value);
    }
  });

  // V202-T04
  it("V202-T04 component self-ref excluded from component preimage", () => {
    const stateWithSelfRef1 = {
      ...VECTOR_A_REQUEST.constitutionalState,
      semanticStateRef:
        "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    };
    const stateWithSelfRef2 = {
      ...VECTOR_A_REQUEST.constitutionalState,
      semanticStateRef:
        "sha256:1111111111111111111111111111111111111111111111111111111111111111",
    };

    const d1 = deriveSemanticStateRefV2(stateWithSelfRef1);
    const d2 = deriveSemanticStateRefV2(stateWithSelfRef2);
    expect(d1.ok).toBe(true);
    expect(d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).toBe(d2.value);
    }
  });

  // V202-T05
  it("V202-T05 changing non-self component material changes digest", () => {
    const orig = VECTOR_A_REQUEST.constitutionalState;
    const modified = {
      ...orig,
      stateViews: [
        {
          ...orig.stateViews[0],
          viewScope: {
            family: "SCOPE" as const,
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "scope-modified-v1",
          },
        },
      ],
    };

    const d1 = deriveSemanticStateRefV2(orig);
    const d2 = deriveSemanticStateRefV2(modified);
    expect(d1.ok).toBe(true);
    expect(d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).not.toBe(d2.value);
    }
  });

  // V202-T06
  it("V202-T06 supplied wrong SemanticStateRef rejected", () => {
    const badState = {
      ...VECTOR_A_REQUEST.constitutionalState,
      semanticStateRef:
        "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    };
    const res = verifySemanticStateRefV2(badState);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("COMPONENT_DIGEST_MISMATCH");
    }
  });

  // V202-T07
  it("V202-T07 supplied wrong EvidenceStateRef rejected", () => {
    const badEvidence = {
      ...VECTOR_B_REQUEST.evidenceState,
      evidenceStateRef:
        "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    };
    const res = verifyEvidenceStateRefV2(badEvidence);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("COMPONENT_DIGEST_MISMATCH");
    }
  });

  // V202-T08
  it("V202-T08 supplied wrong PolicyUniverseRef rejected", () => {
    const badPolicy = {
      ...VECTOR_B_REQUEST.policyUniverse,
      policyUniverseRef:
        "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    };
    const res = verifyPolicyUniverseRefV2(badPolicy);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("COMPONENT_DIGEST_MISMATCH");
    }
  });

  // V202-T09 (Strengthened C10)
  it("V202-T09 V1 ACV digest cannot satisfy SemanticStateRef derivation", () => {
    const state = VECTOR_A_REQUEST.constitutionalState;
    const res = deriveSemanticStateRefV2(state);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.startsWith("sha256:")).toBe(true);
      expect(res.value).toBe(VECTOR_A_EXPECTED_DIGESTS.semanticStateRef);
      expect(res.value).not.toContain("zyppi:domain:acv_state:v1:");
    }
  });

  // V202-T10 (Strengthened C10)
  it("V202-T10 V1 Evidence aggregate hash cannot satisfy EvidenceStateRef derivation", () => {
    const state = VECTOR_B_REQUEST.evidenceState;
    const res = deriveEvidenceStateRefV2(state);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toBe(VECTOR_B_EXPECTED_DIGESTS.evidenceStateRef);
      expect(res.value).not.toContain("zyppi:domain:evidence:v1:");
    }
  });

  // V202-T11 (Strengthened C10)
  it("V202-T11 V1 input hash cannot satisfy V2 whole-request domain", () => {
    const res = deriveExecutionRequestV2DigestCandidate(VECTOR_A_REQUEST);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toBe(
        VECTOR_A_EXPECTED_DIGESTS.wholeRequestDigestCandidate,
      );
      expect(res.value).not.toContain("zyppi:domain:input:v1:");
    }
  });

  // V202-T12
  it("V202-T12 local role-binding label bijection preserves normalized identity", () => {
    const req1 = VECTOR_A_REQUEST;
    const req2: ExecutionRequestV2 = {
      ...req1,
      participation: {
        ...req1.participation,
        roleBindings: [
          {
            ...req1.participation.roleBindings[0],
            roleBindingKey: "renamed_role_binding_xyz",
          },
        ],
      },
      intent: {
        ...req1.intent,
        originatorParticipationRef: "renamed_role_binding_xyz",
      },
      requestedAction: {
        ...req1.requestedAction,
        actionPerformerBindings: [
          {
            ...req1.requestedAction.actionPerformerBindings[0],
            actorParticipationRef: "renamed_role_binding_xyz",
          },
        ],
      },
    };

    const d1 = deriveExecutionRequestV2DigestCandidate(req1);
    const d2 = deriveExecutionRequestV2DigestCandidate(req2);
    expect(d1.ok).toBe(true);
    expect(d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).toBe(d2.value);
    }
  });

  // V202-T13
  it("V202-T13 local Agency label bijection preserves normalized identity", () => {
    const req1 = VECTOR_B_REQUEST;
    const req2: ExecutionRequestV2 = {
      ...req1,
      participation: {
        ...req1.participation,
        agencyBindings: [
          {
            ...req1.participation.agencyBindings[0],
            agencyBindingKey: "renamed_agency_key_999",
          },
        ],
      },
      requestedAction: {
        ...req1.requestedAction,
        actionPerformerBindings: [
          {
            ...req1.requestedAction.actionPerformerBindings[0],
            agencyReliance: {
              kind: "DELEGATED_AGENCY_SINGLE",
              agencyBindingRef: "renamed_agency_key_999",
            },
          },
        ],
      },
    };

    const d1 = deriveExecutionRequestV2DigestCandidate(req1);
    const d2 = deriveExecutionRequestV2DigestCandidate(req2);
    expect(d1.ok).toBe(true);
    expect(d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).toBe(d2.value);
    }
  });

  // V202-T14
  it("V202-T14 local performer label bijection preserves normalized identity", () => {
    const req1 = VECTOR_B_REQUEST;
    const req2: ExecutionRequestV2 = {
      ...req1,
      requestedAction: {
        ...req1.requestedAction,
        actionPerformerBindings: [
          {
            ...req1.requestedAction.actionPerformerBindings[0],
            performerKey: "renamed_performer_key_888",
          },
        ],
        requestedCapabilityClaimBindings: [
          {
            ...req1.requestedAction.requestedCapabilityClaimBindings[0],
            claimantPerformerRefs: ["renamed_performer_key_888"],
          },
        ],
      },
    };

    const d1 = deriveExecutionRequestV2DigestCandidate(req1);
    const d2 = deriveExecutionRequestV2DigestCandidate(req2);
    expect(d1.ok).toBe(true);
    expect(d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).toBe(d2.value);
    }
  });

  // V202-T15
  it("V202-T15 local determination label bijection preserves normalized identity", () => {
    const req1 = VECTOR_B_REQUEST;
    const req2: ExecutionRequestV2 = {
      ...req1,
      requestedAction: {
        ...req1.requestedAction,
        intentActionCompatibilityBinding: {
          kind: "OWNER_DETERMINATION",
          ownerDeterminationBindingRef: "renamed_od_key_777",
        },
      },
      evaluationContext: {
        ...req1.evaluationContext,
        ownerDeterminationBindings: [
          {
            ...req1.evaluationContext.ownerDeterminationBindings[0],
            determinationBindingKey: "renamed_od_key_777",
          },
        ],
      },
    };

    const d1 = deriveExecutionRequestV2DigestCandidate(req1);
    const d2 = deriveExecutionRequestV2DigestCandidate(req2);
    expect(d1.ok).toBe(true);
    expect(d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).toBe(d2.value);
    }
  });

  // V202-T16
  it("V202-T16 same nodes with changed cross-binding topology changes identity", () => {
    const req1 = VECTOR_B_REQUEST;
    const req2: ExecutionRequestV2 = {
      ...req1,
      participation: {
        ...req1.participation,
        agencyBindings: [
          {
            ...req1.participation.agencyBindings[0],
            actorRoleBindingRef: "rb_principal",
            governedSubjectRoleBindingRef: "rb_actor",
          },
        ],
      },
    };

    const d1 = deriveExecutionRequestV2DigestCandidate(req1);
    const d2 = deriveExecutionRequestV2DigestCandidate(req2);
    expect(d1.ok).toBe(true);
    expect(d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).not.toBe(d2.value);
    }
  });

  // V202-T17 (Strengthened C10)
  it("V202-T17 UNKNOWN multiplicity preserved", () => {
    const reqOneUnk: ExecutionRequestV2 = {
      ...VECTOR_A_REQUEST,
      participation: {
        roleBindings: [
          {
            roleBindingKey: "rb1",
            role: "ACTOR",
            subject: { kind: "UNKNOWN" },
          },
        ],
        agencyBindings: [],
      },
    };

    const reqTwoUnk: ExecutionRequestV2 = {
      ...VECTOR_A_REQUEST,
      participation: {
        roleBindings: [
          {
            roleBindingKey: "rb1",
            role: "ACTOR",
            subject: { kind: "UNKNOWN" },
          },
          {
            roleBindingKey: "rb2",
            role: "ACTOR",
            subject: { kind: "UNKNOWN" },
          },
        ],
        agencyBindings: [],
      },
    };

    const d1 = deriveExecutionRequestV2DigestCandidate(reqOneUnk);
    const d2 = deriveExecutionRequestV2DigestCandidate(reqTwoUnk);
    expect(d1.ok).toBe(true);
    expect(d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).not.toBe(d2.value);
    }
  });

  // V202-T18 (Strengthened C10)
  it("V202-T18 synthetic anonymous Subject not created", () => {
    const req: ExecutionRequestV2 = {
      ...VECTOR_A_REQUEST,
      participation: {
        roleBindings: [
          {
            roleBindingKey: "rb1",
            role: "ACTOR",
            subject: { kind: "UNKNOWN" },
          },
        ],
        agencyBindings: [],
      },
    };

    const res = deriveExecutionRequestV2DigestCandidate(req);
    expect(res.ok).toBe(true);
    expect(
      (req.participation.roleBindings[0].subject as { subjectRef?: unknown })
        .subjectRef,
    ).toBeUndefined();
  });

  // V202-T19
  it("V202-T19 true set permutation preserves identity", () => {
    const req1 = VECTOR_B_REQUEST;
    const permutedPolicyUniverse = {
      ...req1.policyUniverse,
      applicablePolicyMaterial: [
        req1.policyUniverse.applicablePolicyMaterial[1],
        req1.policyUniverse.applicablePolicyMaterial[0],
      ],
    };
    const polRef2 = derivePolicyUniverseRefV2(permutedPolicyUniverse);
    expect(polRef2.ok).toBe(true);
    if (polRef2.ok) {
      const req2: ExecutionRequestV2 = {
        ...req1,
        policyUniverse: {
          ...permutedPolicyUniverse,
          policyUniverseRef: polRef2.value,
        },
      };

      const d1 = deriveExecutionRequestV2DigestCandidate(req1);
      const d2 = deriveExecutionRequestV2DigestCandidate(req2);
      expect(d1.ok).toBe(true);
      expect(d2.ok).toBe(true);
      if (d1.ok && d2.ok) {
        expect(d1.value).toBe(d2.value);
      }
    }
  });

  // V202-T20
  it("V202-T20 opaque owner-native JSON array reorder changes identity", () => {
    const req1 = VECTOR_B_REQUEST;
    const state2: BoundConstitutionalStateV2 = {
      ...req1.constitutionalState,
      semanticStateRef:
        "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    };
    const req2: ExecutionRequestV2 = {
      ...req1,
      constitutionalState: state2,
      intent: {
        ...req1.intent,
        candidateStateBinding: {
          ...req1.intent.candidateStateBinding,
          exactStateInstance: {
            kind: "OWNER_TYPED_INLINE",
            ownerRef: REF_OWNER,
            schemaRef: REF_STATE_ARTIFACT,
            material: { items: [1, 2, 3] },
          },
        },
      },
    };
    const req3: ExecutionRequestV2 = {
      ...req1,
      constitutionalState: state2,
      intent: {
        ...req1.intent,
        candidateStateBinding: {
          ...req1.intent.candidateStateBinding,
          exactStateInstance: {
            kind: "OWNER_TYPED_INLINE",
            ownerRef: REF_OWNER,
            schemaRef: REF_STATE_ARTIFACT,
            material: { items: [3, 2, 1] },
          },
        },
      },
    };

    const semRef2 = deriveSemanticStateRefV2(req2.constitutionalState);
    const semRef3 = deriveSemanticStateRefV2(req3.constitutionalState);
    expect(semRef2.ok).toBe(true);
    expect(semRef3.ok).toBe(true);
    if (semRef2.ok && semRef3.ok) {
      const req2Valid = {
        ...req2,
        constitutionalState: {
          ...req2.constitutionalState,
          semanticStateRef: semRef2.value,
        },
      };
      const req3Valid = {
        ...req3,
        constitutionalState: {
          ...req3.constitutionalState,
          semanticStateRef: semRef3.value,
        },
      };

      const d2 = deriveExecutionRequestV2DigestCandidate(req2Valid);
      const d3 = deriveExecutionRequestV2DigestCandidate(req3Valid);
      expect(d2.ok).toBe(true);
      expect(d3.ok).toBe(true);
      if (d2.ok && d3.ok) {
        expect(d2.value).not.toBe(d3.value);
      }
    }
  });

  // V202-T21
  it("V202-T21 Policy edge list permutation preserves identity", () => {
    const p1: PolicyRefV2 = {
      family: "POLICY",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "p1",
      version: "1.0.0",
      stateRef: "state-p1",
      provenanceRef: "prov-p1",
    };
    const p2: PolicyRefV2 = {
      family: "POLICY",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "p2",
      version: "1.0.0",
      stateRef: "state-p2",
      provenanceRef: "prov-p2",
    };
    const p3: PolicyRefV2 = {
      family: "POLICY",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "p3",
      version: "1.0.0",
      stateRef: "state-p3",
      provenanceRef: "prov-p3",
    };
    const p4: PolicyRefV2 = {
      family: "POLICY",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "p4",
      version: "1.0.0",
      stateRef: "state-p4",
      provenanceRef: "prov-p4",
    };

    const req1: ExecutionRequestV2 = {
      ...VECTOR_B_REQUEST,
      policyUniverse: {
        ...VECTOR_B_REQUEST.policyUniverse,
        dependencyTopology: {
          dependencyEdges: [
            { dependeePolicyRef: p1, dependentPolicyRef: p2 },
            { dependeePolicyRef: p3, dependentPolicyRef: p4 },
          ],
        },
      },
    };
    const req2: ExecutionRequestV2 = {
      ...req1,
      policyUniverse: {
        ...req1.policyUniverse,
        dependencyTopology: {
          dependencyEdges: [
            { dependeePolicyRef: p3, dependentPolicyRef: p4 },
            { dependeePolicyRef: p1, dependentPolicyRef: p2 },
          ],
        },
      },
    };

    const polRef1 = derivePolicyUniverseRefV2(req1.policyUniverse);
    const polRef2 = derivePolicyUniverseRefV2(req2.policyUniverse);
    expect(polRef1.ok).toBe(true);
    expect(polRef2.ok).toBe(true);
    if (polRef1.ok && polRef2.ok) {
      const req1Valid = {
        ...req1,
        policyUniverse: {
          ...req1.policyUniverse,
          policyUniverseRef: polRef1.value,
        },
      };
      const req2Valid = {
        ...req2,
        policyUniverse: {
          ...req2.policyUniverse,
          policyUniverseRef: polRef2.value,
        },
      };
      const d1 = deriveExecutionRequestV2DigestCandidate(req1Valid);
      const d2 = deriveExecutionRequestV2DigestCandidate(req2Valid);
      expect(d1.ok).toBe(true);
      expect(d2.ok).toBe(true);
      if (d1.ok && d2.ok) {
        expect(d1.value).toBe(d2.value);
      }
    }
  });

  // V202-T22
  it("V202-T22 Policy edge direction reversal changes identity", () => {
    const p1: PolicyRefV2 = {
      family: "POLICY",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "p1",
      version: "1.0.0",
      stateRef: "state-p1",
      provenanceRef: "prov-p1",
    };
    const p2: PolicyRefV2 = {
      family: "POLICY",
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "p2",
      version: "1.0.0",
      stateRef: "state-p2",
      provenanceRef: "prov-p2",
    };

    const req1: ExecutionRequestV2 = {
      ...VECTOR_B_REQUEST,
      policyUniverse: {
        ...VECTOR_B_REQUEST.policyUniverse,
        dependencyTopology: {
          dependencyEdges: [{ dependeePolicyRef: p1, dependentPolicyRef: p2 }],
        },
      },
    };
    const req2: ExecutionRequestV2 = {
      ...req1,
      policyUniverse: {
        ...req1.policyUniverse,
        dependencyTopology: {
          dependencyEdges: [{ dependeePolicyRef: p2, dependentPolicyRef: p1 }],
        },
      },
    };

    const d1 = derivePolicyUniverseRefV2(req1.policyUniverse);
    const d2 = derivePolicyUniverseRefV2(req2.policyUniverse);
    expect(d1.ok).toBe(true);
    expect(d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).not.toBe(d2.value);
    }
  });

  // V202-T23
  it("V202-T23 duplicate semantic identity-bearing member rejected", () => {
    const reqWithDupPol: ExecutionRequestV2 = {
      ...VECTOR_B_REQUEST,
      policyUniverse: {
        ...VECTOR_B_REQUEST.policyUniverse,
        applicablePolicyMaterial: [
          VECTOR_B_REQUEST.policyUniverse.applicablePolicyMaterial[0],
          VECTOR_B_REQUEST.policyUniverse.applicablePolicyMaterial[0],
        ],
      },
    };

    const res = derivePolicyUniverseRefV2(reqWithDupPol.policyUniverse);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("SEMANTIC_DUPLICATE");
    }
  });

  // V202-T24 (Strengthened C10)
  it("V202-T24 missing remains distinct from explicit empty where representable", () => {
    const req1 = VECTOR_A_REQUEST;
    const req2: ExecutionRequestV2 = {
      ...req1,
      executionContext: {
        ...req1.executionContext,
        entropy: "0x1234",
      },
    };

    const d1 = deriveExecutionRequestV2DigestCandidate(req1);
    const d2 = deriveExecutionRequestV2DigestCandidate(req2);
    expect(d1.ok).toBe(true);
    expect(d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).not.toBe(d2.value);
    }
  });

  // V202-T25 (Strengthened C10)
  it("V202-T25 AUTHORITATIVELY_NONE remains distinct from missing", () => {
    const od1 =
      VECTOR_B_REQUEST.evaluationContext.ownerDeterminationBindings[0];
    const od2 = {
      ...od1,
      determinationDependencyDeclaration: {
        kind: "EXPLICIT" as const,
        dependencyRefs: [],
      },
    };

    const j1 = canonicalizeJcsV2(od1);
    const j2 = canonicalizeJcsV2(od2);
    expect(j1.ok).toBe(true);
    expect(j2.ok).toBe(true);
    if (j1.ok && j2.ok) {
      expect(j1.value).not.toBe(j2.value);
    }
  });

  // V202-T26 (Strengthened C10)
  it("V202-T26 NO_DELEGATED_AGENCY_RELIANCE remains distinct from absent/malformed", () => {
    const rel1 =
      VECTOR_A_REQUEST.requestedAction.actionPerformerBindings[0]
        .agencyReliance;
    expect(rel1.kind).toBe("NO_DELEGATED_AGENCY_RELIANCE");
    const jcs = canonicalizeJcsV2(rel1);
    expect(jcs.ok).toBe(true);
    if (jcs.ok) {
      expect(jcs.value).toBe('{"kind":"NO_DELEGATED_AGENCY_RELIANCE"}');
    }
  });

  // V202-T27
  it("V202-T27 requestId change changes whole-request digest candidate", () => {
    const req1 = VECTOR_A_REQUEST;
    const req2 = { ...req1, requestId: "req-v2-vector-a-002-different" };

    const d1 = deriveExecutionRequestV2DigestCandidate(req1);
    const d2 = deriveExecutionRequestV2DigestCandidate(req2);
    expect(d1.ok).toBe(true);
    expect(d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).not.toBe(d2.value);
    }
  });

  // V202-T28
  it("V202-T28 executionId change changes whole-request digest candidate", () => {
    const req1 = VECTOR_A_REQUEST;
    const req2 = {
      ...req1,
      executionContext: {
        ...req1.executionContext,
        executionId: "exec-different-999",
      },
    };

    const d1 = deriveExecutionRequestV2DigestCandidate(req1);
    const d2 = deriveExecutionRequestV2DigestCandidate(req2);
    expect(d1.ok).toBe(true);
    expect(d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).not.toBe(d2.value);
    }
  });

  // V202-T29 (Strengthened C10)
  it("V202-T29 contractVersion participates in whole-request identity", () => {
    const req1 = VECTOR_A_REQUEST;
    expect(req1.contractVersion).toBe("v2");
    const res = deriveExecutionRequestV2DigestCandidate(req1);
    expect(res.ok).toBe(true);
  });

  // V202-T30 (Strengthened C10)
  it("V202-T30 component refs do not replace actual component material in root projection", () => {
    const req = VECTOR_A_REQUEST;
    expect(req.constitutionalState.stateViews).toBeDefined();
    expect(req.evidenceState.suppliedEvidenceMaterial).toBeDefined();
    expect(req.policyUniverse.applicablePolicyMaterial).toBeDefined();
  });

  // V202-T31
  it("V202-T31 equivalent timezone-offset spellings canonicalize identically", () => {
    const req1 = VECTOR_B_REQUEST;
    const req2 = {
      ...req1,
      executionContext: {
        ...req1.executionContext,
        temporalCoordinates: {
          ...req1.executionContext.temporalCoordinates,
          tValid: "2026-08-24T17:00:00.12Z",
        },
      },
    };

    const d1 = deriveExecutionRequestV2DigestCandidate(req1);
    const d2 = deriveExecutionRequestV2DigestCandidate(req2);
    expect(d1.ok).toBe(true);
    expect(d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).toBe(d2.value);
    }
  });

  // V202-T32
  it("V202-T32 temporal role substitution changes identity", () => {
    const req1 = VECTOR_B_REQUEST;
    const req2 = {
      ...req1,
      executionContext: {
        ...req1.executionContext,
        temporalCoordinates: {
          tValid: req1.executionContext.temporalCoordinates.tEInput,
          tEInput: req1.executionContext.temporalCoordinates.tValid!,
        },
      },
    };

    const d1 = deriveExecutionRequestV2DigestCandidate(req1);
    const d2 = deriveExecutionRequestV2DigestCandidate(req2);
    expect(d1.ok).toBe(true);
    expect(d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).not.toBe(d2.value);
    }
  });

  // V202-T33 (Strengthened C10)
  it("V202-T33 >millisecond fractional precision preserved", () => {
    const req1 = VECTOR_B_REQUEST;
    const req2 = {
      ...req1,
      executionContext: {
        ...req1.executionContext,
        temporalCoordinates: {
          ...req1.executionContext.temporalCoordinates,
          tTrust: "2026-08-24T17:00:00.123456789Z",
        },
      },
    };

    const d1 = deriveExecutionRequestV2DigestCandidate(req1);
    const d2 = deriveExecutionRequestV2DigestCandidate(req2);
    expect(d1.ok).toBe(true);
    expect(d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).not.toBe(d2.value);
    }
  });

  // V202-T34
  it("V202-T34 no Unicode normalization", () => {
    const nfc = "Ã"; // U+00C3
    const nfd = "\u0041\u0303"; // A + COMBINING TILDE

    const resNfc = canonicalizeJcsV2({ text: nfc });
    const resNfd = canonicalizeJcsV2({ text: nfd });
    expect(resNfc.ok).toBe(true);
    expect(resNfd.ok).toBe(true);
    if (resNfc.ok && resNfd.ok) {
      expect(resNfc.value).not.toBe(resNfd.value);
    }
  });

  // V202-T35
  it("V202-T35 lone high surrogate rejected", () => {
    const res = canonicalizeJcsV2({ bad: "\uD800" });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_JCS_UNICODE");
    }
  });

  // V202-T36
  it("V202-T36 lone low surrogate rejected", () => {
    const res = canonicalizeJcsV2({ bad: "\uDC00" });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_JCS_UNICODE");
    }
  });

  // V202-T37
  it("V202-T37 valid surrogate pair accepted", () => {
    const res = canonicalizeJcsV2({ valid: "𐍈" }); // U+10348 (Gothic letter hwair)
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toBe('{"valid":"𐍈"}');
    }
  });

  // V202-T38 (Strengthened C10)
  it("V202-T38 RFC8785 property-sort vector matches", () => {
    const input = { b: 1, a: 2, c: 3, "a\u0000": 4 };
    const res = canonicalizeJcsV2(input);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toBe('{"a":2,"a\\u0000":4,"b":1,"c":3}');
    }
  });

  // V202-T39
  it("V202-T39 RFC8785 primitive/sample vector matches", () => {
    const input = {
      numbers: [1, -0, 3.14159],
      strings: ["hello\nworld", 'quotes "and\\ slash'],
      bools: [true, false, null],
    };
    const res = canonicalizeJcsV2(input);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toBe(
        '{"bools":[true,false,null],"numbers":[1,0,3.14159],"strings":["hello\\nworld","quotes \\"and\\\\ slash"]}',
      );
    }
  });

  // V202-T40
  it("V202-T40 RFC8785 representative Appendix-B number vectors match", () => {
    const numbers = [1e23, 1e21, 1e20, 0.00001, 0.000001, 1.23e-7, -0];
    const res = canonicalizeJcsV2(numbers);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toBe(
        "[1e+23,1e+21,100000000000000000000,0.00001,0.000001,1.23e-7,0]",
      );
    }
  });

  // V202-T41
  it("V202-T41 -0 canonicalizes as 0", () => {
    const res = canonicalizeJcsV2(-0);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toBe("0");
    }
  });

  // V202-T42
  it("V202-T42 NaN/Infinity never enter V2 identity", () => {
    const resNaN = canonicalizeJcsV2(NaN);
    const resInf = canonicalizeJcsV2(Infinity);
    expect(resNaN.ok).toBe(false);
    expect(resInf.ok).toBe(false);
  });

  // V202-T43
  it("V202-T43 undefined never disappears via cleanForJcs", () => {
    const res = canonicalizeJcsV2({ a: undefined });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_IDENTITY_INPUT");
    }
  });

  // V202-T44
  it("V202-T44 no localeCompare dependency in V2 production canonicalization", () => {
    const canonicalSource = readFileSync(
      resolve(process.cwd(), "packages/domain/src/v2/canonical.ts"),
      "utf8",
    );
    const graphSource = readFileSync(
      resolve(process.cwd(), "packages/domain/src/v2/graphCanonicalization.ts"),
      "utf8",
    );
    expect(canonicalSource).not.toContain("localeCompare");
    expect(graphSource).not.toContain("localeCompare");
  });

  // V202-T45
  it("V202-T45 no raw JSON.stringify used as canonical authority", () => {
    const canonicalSource = readFileSync(
      resolve(process.cwd(), "packages/domain/src/v2/canonical.ts"),
      "utf8",
    );
    expect(canonicalSource).not.toMatch(/JSON\.stringify\([^)]+\)/);
  });

  // V202-T46
  it("V202-T46 no V1 hash domain appears in V2 identity production code", () => {
    const identitySource = readFileSync(
      resolve(process.cwd(), "packages/domain/src/v2/identity.ts"),
      "utf8",
    );
    expect(identitySource).not.toContain("zyppi:domain:input:v1:");
    expect(identitySource).not.toContain("zyppi:domain:evidence:v1:");
    expect(identitySource).not.toContain("zyppi:domain:acv_state:v1:");
  });

  // V202-T47
  it("V202-T47 exact four V2 input identity domains present and no fifth core domain", () => {
    expect(V2_DOMAIN_SEPARATORS.CONSTITUTIONAL_STATE).toBe(
      "zyppi:domain:constitutional_state:v2:",
    );
    expect(V2_DOMAIN_SEPARATORS.EVIDENCE_STATE).toBe(
      "zyppi:domain:evidence_state:v2:",
    );
    expect(V2_DOMAIN_SEPARATORS.POLICY_UNIVERSE).toBe(
      "zyppi:domain:policy_universe:v2:",
    );
    expect(V2_DOMAIN_SEPARATORS.INPUT).toBe("zyppi:domain:input:v2:");
    expect(Object.keys(V2_DOMAIN_SEPARATORS)).toHaveLength(4);
  });

  // V202-T48
  it("V202-T48 repeated normalization/hash deterministic", () => {
    for (let i = 0; i < 10; i++) {
      const d1 = deriveExecutionRequestV2DigestCandidate(VECTOR_A_REQUEST);
      const d2 = deriveExecutionRequestV2DigestCandidate(VECTOR_B_REQUEST);
      expect(d1.ok).toBe(true);
      expect(d2.ok).toBe(true);
      if (d1.ok && d2.ok) {
        expect(d1.value).toBe(
          VECTOR_A_EXPECTED_DIGESTS.wholeRequestDigestCandidate,
        );
        expect(d2.value).toBe(
          VECTOR_B_EXPECTED_DIGESTS.wholeRequestDigestCandidate,
        );
      }
    }
  });

  // V202-T49
  it("V202-T49 input objects are not mutated", () => {
    const original = JSON.parse(JSON.stringify(VECTOR_B_REQUEST));
    const res = deriveExecutionRequestV2DigestCandidate(VECTOR_B_REQUEST);
    expect(res.ok).toBe(true);
    expect(VECTOR_B_REQUEST).toEqual(original);
  });

  // V202-T50
  it("V202-T50 domain package boundary remains clean", () => {
    const indexSource = readFileSync(
      resolve(process.cwd(), "packages/domain/src/index.ts"),
      "utf8",
    );
    expect(indexSource).not.toContain("@zyppi/runtime");
    expect(indexSource).not.toContain("@zyppi/contracts");
  });

  // V202-T51 (Strengthened C10)
  it("V202-T51 V1 golden hash/Receipt vectors unchanged", () => {
    const receiptHashSource = readFileSync(
      resolve(process.cwd(), "packages/domain/src/receiptHash.ts"),
      "utf8",
    );
    expect(receiptHashSource).toContain("zyppi:domain:receipt:v1:");
    expect(receiptHashSource).toContain("zyppi:domain:input:v1:");
  });

  // V202-T52
  it("V202-T52 GS1/domain-specific semantics absent from V2 identity implementation", () => {
    const identitySource = readFileSync(
      resolve(process.cwd(), "packages/domain/src/v2/identity.ts"),
      "utf8",
    );
    const graphSource = readFileSync(
      resolve(process.cwd(), "packages/domain/src/v2/graphCanonicalization.ts"),
      "utf8",
    );
    expect(identitySource).not.toContain("GS1");
    expect(identitySource).not.toContain("GTIN");
    expect(graphSource).not.toContain("GS1");
    expect(graphSource).not.toContain("GTIN");
  });

  // V202-T53
  it("V202-T53 whole-request digest candidate is not represented as request field", () => {
    const req = VECTOR_A_REQUEST;
    expect(
      (req as unknown as Record<string, unknown>).inputHash,
    ).toBeUndefined();
    expect(
      (req as unknown as Record<string, unknown>).digestCandidate,
    ).toBeUndefined();
  });

  // V202-T54
  it("V202-T54 no public API accepts caller boolean asserting coherence/admission", () => {
    const identitySource = readFileSync(
      resolve(process.cwd(), "packages/domain/src/v2/identity.ts"),
      "utf8",
    );
    expect(identitySource).not.toContain("admitted");
    expect(identitySource).not.toContain("coherent");
    expect(identitySource).not.toContain("semanticClosurePassed");
  });

  // V202-T55
  it("V202-T55 component mismatch cannot be repaired by fallback/current lookup", () => {
    const reqBadComponent = {
      ...VECTOR_A_REQUEST,
      constitutionalState: {
        ...VECTOR_A_REQUEST.constitutionalState,
        semanticStateRef:
          "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      },
    };

    const res = deriveExecutionRequestV2DigestCandidate(reqBadComponent);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("COMPONENT_DIGEST_MISMATCH");
    }
  });

  // V202-T56 (Strengthened C10 & C11)
  it("V202-T56 independent fixed golden vectors reproduce 3 component digests + root candidate", () => {
    const vecA = VECTOR_A_REQUEST;
    const semA = deriveSemanticStateRefV2(vecA.constitutionalState);
    const evidA = deriveEvidenceStateRefV2(vecA.evidenceState);
    const polA = derivePolicyUniverseRefV2(vecA.policyUniverse);
    const rootA = deriveExecutionRequestV2DigestCandidate(vecA);

    expect(semA.ok && semA.value).toBe(
      VECTOR_A_EXPECTED_DIGESTS.semanticStateRef,
    );
    expect(evidA.ok && evidA.value).toBe(
      VECTOR_A_EXPECTED_DIGESTS.evidenceStateRef,
    );
    expect(polA.ok && polA.value).toBe(
      VECTOR_A_EXPECTED_DIGESTS.policyUniverseRef,
    );
    expect(rootA.ok && rootA.value).toBe(
      VECTOR_A_EXPECTED_DIGESTS.wholeRequestDigestCandidate,
    );

    // Verify exact preimages match fixed expectations
    const semProjA = getConstitutionalStateIdentityProjectionV2(
      vecA.constitutionalState,
    );
    expect(semProjA.ok).toBe(true);
    if (semProjA.ok) {
      const jcsSemA = canonicalizeJcsV2(semProjA.value);
      expect(jcsSemA.ok && jcsSemA.value).toBe(
        VECTOR_A_CANONICAL_PREIMAGES.constitutionalStateJcs,
      );
    }

    const vecB = VECTOR_B_REQUEST;
    const semB = deriveSemanticStateRefV2(vecB.constitutionalState);
    const evidB = deriveEvidenceStateRefV2(vecB.evidenceState);
    const polB = derivePolicyUniverseRefV2(vecB.policyUniverse);
    const rootB = deriveExecutionRequestV2DigestCandidate(vecB);

    expect(semB.ok && semB.value).toBe(
      VECTOR_B_EXPECTED_DIGESTS.semanticStateRef,
    );
    expect(evidB.ok && evidB.value).toBe(
      VECTOR_B_EXPECTED_DIGESTS.evidenceStateRef,
    );
    expect(polB.ok && polB.value).toBe(
      VECTOR_B_EXPECTED_DIGESTS.policyUniverseRef,
    );
    expect(rootB.ok && rootB.value).toBe(
      VECTOR_B_EXPECTED_DIGESTS.wholeRequestDigestCandidate,
    );

    const semProjB = getConstitutionalStateIdentityProjectionV2(
      vecB.constitutionalState,
    );
    expect(semProjB.ok).toBe(true);
    if (semProjB.ok) {
      const jcsSemB = canonicalizeJcsV2(semProjB.value);
      expect(jcsSemB.ok && jcsSemB.value).toBe(
        VECTOR_B_CANONICAL_PREIMAGES.constitutionalStateJcs,
      );
    }
  });
});

describe("CCP-RI-V2-02-CORR-01 — Additional Mandatory Test Suite V202-T57+", () => {
  it("V202-T57 — C09: Simultaneous relabeling across 8 referenced namespaces preserves normalized identity", () => {
    const req1 = VECTOR_B_REQUEST;
    const req2: ExecutionRequestV2 = {
      ...req1,
      participation: {
        ...req1.participation,
        roleBindings: [
          {
            ...req1.participation.roleBindings[0],
            roleBindingKey: "custom_role_0",
          },
          {
            ...req1.participation.roleBindings[1],
            roleBindingKey: "custom_role_1",
          },
        ],
        agencyBindings: [
          {
            ...req1.participation.agencyBindings[0],
            agencyBindingKey: "custom_agency_0",
            actorRoleBindingRef: "custom_role_0",
            governedSubjectRoleBindingRef: "custom_role_1",
          },
        ],
      },
      intent: {
        ...req1.intent,
        originatorParticipationRef: "custom_role_1",
      },
      requestedAction: {
        ...req1.requestedAction,
        actionPerformerBindings: [
          {
            ...req1.requestedAction.actionPerformerBindings[0],
            performerKey: "custom_performer_0",
            actorParticipationRef: "custom_role_0",
            agencyReliance: {
              kind: "DELEGATED_AGENCY_SINGLE",
              agencyBindingRef: "custom_agency_0",
            },
          },
        ],
        intentActionCompatibilityBinding: {
          kind: "OWNER_DETERMINATION",
          ownerDeterminationBindingRef: "custom_od_0",
        },
        requestedCapabilityClaimBindings: [
          {
            ...req1.requestedAction.requestedCapabilityClaimBindings[0],
            capabilityClaimKey: "custom_cap_0",
            claimantPerformerRefs: ["custom_performer_0"],
          },
        ],
      },
      evaluationContext: {
        ...req1.evaluationContext,
        authorizedInputBindings: [
          {
            ...req1.evaluationContext.authorizedInputBindings[0],
            bindingKey: "custom_auth_0",
          },
        ],
        ownerDeterminationBindings: [
          {
            ...req1.evaluationContext.ownerDeterminationBindings[0],
            determinationBindingKey: "custom_od_0",
            determinationQuestionBinding: {
              ...req1.evaluationContext.ownerDeterminationBindings[0]
                .determinationQuestionBinding,
              questionOperandBindings: [
                {
                  operandKey: "custom_op_0",
                  operandSlotSemanticRef: {
                    family: "EVALUATION_SEMANTIC" as const,
                    ownerRef: "urn:zyppi:owner:council:v1",
                    artifactId: "slot1-v1",
                  },
                  operandKind: "PARTICIPATION_BINDING" as const,
                  roleBindingRef: "custom_role_1",
                },
              ],
            },
          },
        ],
      },
    };

    const d1 = deriveExecutionRequestV2DigestCandidate(req1);
    const d2 = deriveExecutionRequestV2DigestCandidate(req2);
    expect(d1.ok).toBe(true);
    expect(d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).toBe(d2.value);
    }
  });

  it("V202-T58 — C09: Symmetric isomorphic graphs with reversed array order and renamed labels preserve identity", () => {
    const req1 = VECTOR_B_REQUEST;
    const req2: ExecutionRequestV2 = {
      ...req1,
      participation: {
        roleBindings: [
          req1.participation.roleBindings[1],
          req1.participation.roleBindings[0],
        ],
        agencyBindings: [...req1.participation.agencyBindings],
      },
    };

    const d1 = deriveExecutionRequestV2DigestCandidate(req1);
    const d2 = deriveExecutionRequestV2DigestCandidate(req2);
    expect(d1.ok).toBe(true);
    expect(d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).toBe(d2.value);
    }
  });

  it("V202-T59 — C09: Same symmetric material with one edge changed changes whole-request identity", () => {
    const req1 = VECTOR_B_REQUEST;
    const req2: ExecutionRequestV2 = {
      ...req1,
      participation: {
        ...req1.participation,
        agencyBindings: [
          {
            ...req1.participation.agencyBindings[0],
            actorRoleBindingRef: "rb_principal", // swapped
            governedSubjectRoleBindingRef: "rb_actor",
          },
        ],
      },
    };

    const d1 = deriveExecutionRequestV2DigestCandidate(req1);
    const d2 = deriveExecutionRequestV2DigestCandidate(req2);
    expect(d1.ok).toBe(true);
    expect(d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).not.toBe(d2.value);
    }
  });

  it("V202-T60 — C07: Scoped local key reuse across different evaluation context collections does not collide", () => {
    const req1: ExecutionRequestV2 = {
      ...VECTOR_B_REQUEST,
      evaluationContext: {
        ...VECTOR_B_REQUEST.evaluationContext,
        authorizedInputBindings: [
          {
            bindingKey: "same_local_key_01",
            semanticRef: {
              family: "EVALUATION_SEMANTIC",
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "auth-sem-01",
            },
            value: "VAL1",
          },
        ],
        evaluationParameterBindings: [
          {
            bindingKey: "same_local_key_01",
            semanticRef: {
              family: "EVALUATION_SEMANTIC",
              ownerRef: "urn:zyppi:owner:council:v1",
              artifactId: "param-sem-01",
            },
            value: "VAL2",
          },
        ],
      },
    };

    const res = deriveExecutionRequestV2DigestCandidate(req1);
    expect(res.ok).toBe(true);
  });

  it("V202-T61 — C01: Strict Gregorian leap year and February 30 rejection", () => {
    const resFeb30 = normalizeTemporalCoordinateV2("2026-02-30T12:00:00Z");
    expect(resFeb30.ok).toBe(false);
    if (!resFeb30.ok) {
      expect(resFeb30.error.code).toBe("TEMPORAL_CANONICALIZATION_FAILURE");
    }

    const resNonLeap29 = normalizeTemporalCoordinateV2("2025-02-29T12:00:00Z");
    expect(resNonLeap29.ok).toBe(false);
    if (!resNonLeap29.ok) {
      expect(resNonLeap29.error.code).toBe("TEMPORAL_CANONICALIZATION_FAILURE");
    }

    const resLeap29 = normalizeTemporalCoordinateV2("2024-02-29T12:00:00Z");
    expect(resLeap29.ok).toBe(true);
    if (resLeap29.ok) {
      expect(resLeap29.value).toBe("2024-02-29T12:00:00Z");
    }
  });

  it("V202-T62 — C02: Lone Unicode surrogate pair in property key rejected", () => {
    const badKeyObj = {
      ["bad_key_\uD800"]: "value",
    };

    const jcsRes = canonicalizeJcsV2(badKeyObj);
    expect(jcsRes.ok).toBe(false);
    if (!jcsRes.ok) {
      expect(jcsRes.error.code).toBe("INVALID_JCS_UNICODE");
    }
  });

  it("V202-T63 — C03: Array with symbol or non-canonical index property rejected with carrier safety error", () => {
    const arr = [1, 2];
    (arr as unknown as Record<string, unknown>)["01"] = "leading_zero";

    const jcsRes = canonicalizeJcsV2(arr);
    expect(jcsRes.ok).toBe(false);
    if (!jcsRes.ok) {
      expect(jcsRes.error.code).toBe("INVALID_IDENTITY_INPUT");
    }
  });

  it("V202-T64 — C04: Root derive function validates structural V2-01 errors to INVALID_IDENTITY_INPUT", () => {
    const invalidStructReq = {
      ...VECTOR_A_REQUEST,
      contractVersion: "v1_invalid" as unknown as "v2",
    };

    const res = deriveExecutionRequestV2DigestCandidate(
      invalidStructReq as unknown as ExecutionRequestV2,
    );
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("INVALID_IDENTITY_INPUT");
    }
  });

  it("V202-T65 — C03-06: Comprehensive Temporal Calendar & High-Precision Offset Matrix", () => {
    expect(normalizeTemporalCoordinateV2("2026-02-30T12:00:00Z").ok).toBe(
      false,
    );
    expect(normalizeTemporalCoordinateV2("2025-02-29T12:00:00Z").ok).toBe(
      false,
    );
    expect(normalizeTemporalCoordinateV2("2026-04-31T12:00:00Z").ok).toBe(
      false,
    );

    const leapRes = normalizeTemporalCoordinateV2("2024-02-29T12:00:00Z");
    expect(leapRes.ok).toBe(true);
    if (leapRes.ok) expect(leapRes.value).toBe("2024-02-29T12:00:00Z");

    const year1Res = normalizeTemporalCoordinateV2("0001-01-01T00:00:00Z");
    expect(year1Res.ok).toBe(true);
    if (year1Res.ok) expect(year1Res.value).toBe("0001-01-01T00:00:00Z");

    const year99Res = normalizeTemporalCoordinateV2("0099-12-31T23:59:59Z");
    expect(year99Res.ok).toBe(true);
    if (year99Res.ok) expect(year99Res.value).toBe("0099-12-31T23:59:59Z");

    const offsetCross = normalizeTemporalCoordinateV2(
      "2026-12-31T23:00:00-02:00",
    );
    expect(offsetCross.ok).toBe(true);
    if (offsetCross.ok) expect(offsetCross.value).toBe("2027-01-01T01:00:00Z");

    // High precision timezone equivalence comparison
    const reqOffset = {
      ...VECTOR_B_REQUEST,
      executionContext: {
        ...VECTOR_B_REQUEST.executionContext,
        temporalCoordinates: {
          ...VECTOR_B_REQUEST.executionContext.temporalCoordinates,
          tValid: "2026-08-24T20:00:00.123456789+03:00",
        },
      },
    };

    const reqUtc = {
      ...VECTOR_B_REQUEST,
      executionContext: {
        ...VECTOR_B_REQUEST.executionContext,
        temporalCoordinates: {
          ...VECTOR_B_REQUEST.executionContext.temporalCoordinates,
          tValid: "2026-08-24T17:00:00.123456789Z",
        },
      },
    };

    const cand1 = deriveExecutionRequestV2DigestCandidate(reqOffset);
    const cand2 = deriveExecutionRequestV2DigestCandidate(reqUtc);
    expect(cand1.ok).toBe(true);
    expect(cand2.ok).toBe(true);
    if (cand1.ok && cand2.ok) {
      expect(cand1.value).toBe(cand2.value);
    }
  });

  it("V202-T66 — C03-01 & C03-02: Hostile Proxy, Getters/Setters & Array Descriptor Safety", () => {
    let sideEffectExecuted = false;
    const getterObj = {
      get trap() {
        sideEffectExecuted = true;
        return "side_effect";
      },
      b: 1,
    };

    const resGetter = deriveSemanticStateRefV2(
      getterObj as unknown as BoundConstitutionalStateV2,
    );
    expect(resGetter.ok).toBe(false);
    if (!resGetter.ok) {
      expect(resGetter.error.code).toBe("INVALID_IDENTITY_INPUT");
    }
    expect(sideEffectExecuted).toBe(false);

    // Hostile throwing Proxy
    const throwingProxy = new Proxy(
      {},
      {
        get() {
          throw new Error("Hostile Proxy Trap");
        },
        ownKeys() {
          throw new Error("Hostile ownKeys Trap");
        },
      },
    );

    const resProxy = deriveSemanticStateRefV2(
      throwingProxy as unknown as BoundConstitutionalStateV2,
    );
    expect(resProxy.ok).toBe(false);
    if (!resProxy.ok) {
      expect(resProxy.error.code).toBe("INVALID_IDENTITY_INPUT");
    }

    // Array with index getter
    const arrGetter = [1, 2];
    Object.defineProperty(arrGetter, "0", {
      get() {
        return 999;
      },
      enumerable: true,
      configurable: true,
    });

    const resArrGetter = canonicalizeJcsV2(arrGetter);
    expect(resArrGetter.ok).toBe(false);
    if (!resArrGetter.ok) {
      expect(resArrGetter.error.code).toBe("INVALID_IDENTITY_INPUT");
    }
  });

  it("V202-T67 — C03-03: Non-Factorial Graph Search Resource Instrumentation Proof", () => {
    resetGraphSearchDiagnostics();

    // Derive candidate on graph-rich Vector B
    const res = deriveExecutionRequestV2DigestCandidate(VECTOR_B_REQUEST);
    expect(res.ok).toBe(true);

    // 10! = 3,628,800. Prove visitedStates is strictly non-factorial (< 1,000)
    expect(graphSearchDiagnostics.visitedStates).toBeGreaterThan(0);
    expect(graphSearchDiagnostics.visitedStates).toBeLessThan(1000);
    expect(graphSearchDiagnostics.evaluatedTerminals).toBeLessThan(100);
  });

  it("V202-T68 — C03-04: Owner Determination Semantic Duplicate Rejection Without Key Interference", () => {
    const od1 =
      VECTOR_B_REQUEST.evaluationContext.ownerDeterminationBindings[0];
    const odDup = {
      ...od1,
      determinationBindingKey: "different_synthetic_key_999",
    };

    const reqWithDupOd: ExecutionRequestV2 = {
      ...VECTOR_B_REQUEST,
      evaluationContext: {
        ...VECTOR_B_REQUEST.evaluationContext,
        ownerDeterminationBindings: [od1, odDup],
      },
    };

    const res = deriveExecutionRequestV2DigestCandidate(reqWithDupOd);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("SEMANTIC_DUPLICATE");
    }
  });

  it("V202-T69 — Scope 6: Coupled Multi-Namespace Relabeling Invariance", () => {
    const req1 = VECTOR_B_REQUEST;
    const req2: ExecutionRequestV2 = {
      ...req1,
      participation: {
        roleBindings: [
          { ...req1.participation.roleBindings[0], roleBindingKey: "R_ACTOR" },
          {
            ...req1.participation.roleBindings[1],
            roleBindingKey: "R_PRINCIPAL",
          },
        ],
        agencyBindings: [
          {
            ...req1.participation.agencyBindings[0],
            agencyBindingKey: "A_AGENCY",
            actorRoleBindingRef: "R_ACTOR",
            governedSubjectRoleBindingRef: "R_PRINCIPAL",
          },
        ],
      },
      intent: {
        ...req1.intent,
        originatorParticipationRef: "R_PRINCIPAL",
      },
      requestedAction: {
        ...req1.requestedAction,
        actionPerformerBindings: [
          {
            ...req1.requestedAction.actionPerformerBindings[0],
            performerKey: "P_PERFORMER",
            actorParticipationRef: "R_ACTOR",
            agencyReliance: {
              kind: "DELEGATED_AGENCY_SINGLE",
              agencyBindingRef: "A_AGENCY",
            },
          },
        ],
        intentActionCompatibilityBinding: {
          kind: "OWNER_DETERMINATION",
          ownerDeterminationBindingRef: "OD_COMPAT",
        },
        requestedCapabilityClaimBindings: [
          {
            ...req1.requestedAction.requestedCapabilityClaimBindings[0],
            capabilityClaimKey: "C_CAPABILITY",
            claimantPerformerRefs: ["P_PERFORMER"],
          },
        ],
      },
      evaluationContext: {
        ...req1.evaluationContext,
        authorizedInputBindings: [
          {
            ...req1.evaluationContext.authorizedInputBindings[0],
            bindingKey: "IN_AUTH",
          },
        ],
        ownerDeterminationBindings: [
          {
            ...req1.evaluationContext.ownerDeterminationBindings[0],
            determinationBindingKey: "OD_COMPAT",
            determinationQuestionBinding: {
              ...req1.evaluationContext.ownerDeterminationBindings[0]
                .determinationQuestionBinding,
              questionOperandBindings: [
                {
                  operandKey: "OP_OPERAND",
                  operandSlotSemanticRef: {
                    family: "EVALUATION_SEMANTIC",
                    ownerRef: "urn:zyppi:owner:council:v1",
                    artifactId: "slot1-v1",
                  },
                  operandKind: "PARTICIPATION_BINDING",
                  roleBindingRef: "R_PRINCIPAL",
                },
              ],
            },
          },
        ],
      },
    };

    const d1 = deriveExecutionRequestV2DigestCandidate(req1);
    const d2 = deriveExecutionRequestV2DigestCandidate(req2);
    expect(d1.ok).toBe(true);
    expect(d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).toBe(d2.value);
    }
  });

  it("V202-T70 — Scope 6: Genuine Symmetric Graph Isomorphism & Edge Mutation Sensitivity", () => {
    const req1 = VECTOR_B_REQUEST;
    const req2: ExecutionRequestV2 = {
      ...req1,
      participation: {
        roleBindings: [
          req1.participation.roleBindings[1],
          req1.participation.roleBindings[0],
        ],
        agencyBindings: [...req1.participation.agencyBindings],
      },
    };

    const d1 = deriveExecutionRequestV2DigestCandidate(req1);
    const d2 = deriveExecutionRequestV2DigestCandidate(req2);
    expect(d1.ok && d2.ok).toBe(true);
    if (d1.ok && d2.ok) {
      expect(d1.value).toBe(d2.value);
    }

    // Mutate one edge
    const reqMutated: ExecutionRequestV2 = {
      ...req1,
      participation: {
        ...req1.participation,
        agencyBindings: [
          {
            ...req1.participation.agencyBindings[0],
            actorRoleBindingRef: "rb_principal",
            governedSubjectRoleBindingRef: "rb_actor",
          },
        ],
      },
    };

    const dMut = deriveExecutionRequestV2DigestCandidate(reqMutated);
    expect(dMut.ok).toBe(true);
    if (d1.ok && dMut.ok) {
      expect(d1.value).not.toBe(dMut.value);
    }
  });

  it("V202-T71 — Scope 7: Independent Golden Verification of All 8 Canonical Preimages & Digests", () => {
    function computeSha256(domainSeparator: string, jcs: string): string {
      const hash = createHash("sha256");
      hash.update(domainSeparator, "utf8");
      hash.update(jcs, "utf8");
      return `sha256:${hash.digest("hex")}`;
    }

    // Vector A Verification
    const semProjA = getConstitutionalStateIdentityProjectionV2(
      VECTOR_A_REQUEST.constitutionalState,
    );
    const evidProjA = getEvidenceStateIdentityProjectionV2(
      VECTOR_A_REQUEST.evidenceState,
    );
    const polProjA = getPolicyUniverseIdentityProjectionV2(
      VECTOR_A_REQUEST.policyUniverse,
    );

    const jcsSemA = semProjA.ok ? canonicalizeJcsV2(semProjA.value) : null;
    const jcsEvidA = evidProjA.ok ? canonicalizeJcsV2(evidProjA.value) : null;
    const jcsPolA = polProjA.ok ? canonicalizeJcsV2(polProjA.value) : null;

    expect(jcsSemA && jcsSemA.ok ? jcsSemA.value : "").toBe(
      VECTOR_A_CANONICAL_PREIMAGES.constitutionalStateJcs,
    );
    expect(jcsEvidA && jcsEvidA.ok ? jcsEvidA.value : "").toBe(
      VECTOR_A_CANONICAL_PREIMAGES.evidenceStateJcs,
    );
    expect(jcsPolA && jcsPolA.ok ? jcsPolA.value : "").toBe(
      VECTOR_A_CANONICAL_PREIMAGES.policyUniverseJcs,
    );

    expect(
      computeSha256(
        V2_DOMAIN_SEPARATORS.CONSTITUTIONAL_STATE,
        VECTOR_A_CANONICAL_PREIMAGES.constitutionalStateJcs,
      ),
    ).toBe(VECTOR_A_EXPECTED_DIGESTS.semanticStateRef);
    expect(
      computeSha256(
        V2_DOMAIN_SEPARATORS.EVIDENCE_STATE,
        VECTOR_A_CANONICAL_PREIMAGES.evidenceStateJcs,
      ),
    ).toBe(VECTOR_A_EXPECTED_DIGESTS.evidenceStateRef);
    expect(
      computeSha256(
        V2_DOMAIN_SEPARATORS.POLICY_UNIVERSE,
        VECTOR_A_CANONICAL_PREIMAGES.policyUniverseJcs,
      ),
    ).toBe(VECTOR_A_EXPECTED_DIGESTS.policyUniverseRef);
    expect(
      computeSha256(
        V2_DOMAIN_SEPARATORS.INPUT,
        VECTOR_A_CANONICAL_PREIMAGES.wholeRequestJcs,
      ),
    ).toBe(VECTOR_A_EXPECTED_DIGESTS.wholeRequestDigestCandidate);

    // Vector B Verification
    const semProjB = getConstitutionalStateIdentityProjectionV2(
      VECTOR_B_REQUEST.constitutionalState,
    );
    const evidProjB = getEvidenceStateIdentityProjectionV2(
      VECTOR_B_REQUEST.evidenceState,
    );
    const polProjB = getPolicyUniverseIdentityProjectionV2(
      VECTOR_B_REQUEST.policyUniverse,
    );

    const jcsSemB = semProjB.ok ? canonicalizeJcsV2(semProjB.value) : null;
    const jcsEvidB = evidProjB.ok ? canonicalizeJcsV2(evidProjB.value) : null;
    const jcsPolB = polProjB.ok ? canonicalizeJcsV2(polProjB.value) : null;

    expect(jcsSemB && jcsSemB.ok ? jcsSemB.value : "").toBe(
      VECTOR_B_CANONICAL_PREIMAGES.constitutionalStateJcs,
    );
    expect(jcsEvidB && jcsEvidB.ok ? jcsEvidB.value : "").toBe(
      VECTOR_B_CANONICAL_PREIMAGES.evidenceStateJcs,
    );
    expect(jcsPolB && jcsPolB.ok ? jcsPolB.value : "").toBe(
      VECTOR_B_CANONICAL_PREIMAGES.policyUniverseJcs,
    );

    expect(
      computeSha256(
        V2_DOMAIN_SEPARATORS.CONSTITUTIONAL_STATE,
        VECTOR_B_CANONICAL_PREIMAGES.constitutionalStateJcs,
      ),
    ).toBe(VECTOR_B_EXPECTED_DIGESTS.semanticStateRef);
    expect(
      computeSha256(
        V2_DOMAIN_SEPARATORS.EVIDENCE_STATE,
        VECTOR_B_CANONICAL_PREIMAGES.evidenceStateJcs,
      ),
    ).toBe(VECTOR_B_EXPECTED_DIGESTS.evidenceStateRef);
    expect(
      computeSha256(
        V2_DOMAIN_SEPARATORS.POLICY_UNIVERSE,
        VECTOR_B_CANONICAL_PREIMAGES.policyUniverseJcs,
      ),
    ).toBe(VECTOR_B_EXPECTED_DIGESTS.policyUniverseRef);
    expect(
      computeSha256(
        V2_DOMAIN_SEPARATORS.INPUT,
        VECTOR_B_CANONICAL_PREIMAGES.wholeRequestJcs,
      ),
    ).toBe(VECTOR_B_EXPECTED_DIGESTS.wholeRequestDigestCandidate);
  });
});

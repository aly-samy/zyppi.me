import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  deriveEvidenceStateRefV2,
  deriveExecutionRequestV2DigestCandidate,
  derivePolicyUniverseRefV2,
  deriveSemanticStateRefV2,
  validateExecutionRequest,
  type ExecutionRequest,
  type ExecutionRequestV2,
} from "@zyppi/domain";
import { dispatchRawExecutionRequest } from "./executionGenerationBoundary.js";
import {
  materializeExecutionRequestV2,
  type ExecutionRequestV2MaterializationInput,
} from "./v2ExecutionMaterialization.js";

/**
 * Historical V1 valid fixture from repository domain tests.
 */
const VALID_V1_REQUEST_OBJ: ExecutionRequest = {
  requestId: "req-v1-001",
  identity: {
    identityId: "id-001",
    identityType: "product",
    canonicalReference: "urn:gtin:00012345678905",
    referentId: "ref-001",
    status: "active",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  activeConstitutionalView: {
    identity: {
      identityId: "id-001",
      identityType: "product",
      canonicalReference: "urn:gtin:00012345678905",
      referentId: "ref-001",
      status: "active",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
    relationships: [],
    standings: [],
    authorities: [],
    capabilities: [],
    evidenceReferences: [],
    applicablePolicies: [],
  },
  evidenceBundle: {
    schemaVersion: "1.0",
    evidenceRecords: [],
  },
  policyContext: {
    policies: [],
  },
  executionContext: {
    executionId: "exec-v1-001",
    constitutionalTimestamp: "2026-01-01T00:00:00Z",
    budget: 100,
    entropy: "entropy-001",
    versions: ["1.0.0"],
  },
  resolvedPolicyGraph: {
    edges: [],
  },
};

const VALID_V1_RAW_JSON = JSON.stringify(VALID_V1_REQUEST_OBJ);

/**
 * Dynamically construct valid V2 synthetic request with correct component digests.
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

const derivedSemanticRef = deriveSemanticStateRefV2(
  rawSyntheticConstitutionalState as unknown as Parameters<
    typeof deriveSemanticStateRefV2
  >[0],
);

const syntheticConstitutionalState = {
  ...rawSyntheticConstitutionalState,
  semanticStateRef: derivedSemanticRef.ok ? derivedSemanticRef.value : "",
};

const rawSyntheticEvidenceState = {
  evidenceStateRef: "",
  evidenceRequirementBindings: [],
  suppliedEvidenceMaterial: [],
  evidencePresentationBindings: [],
  integrityCoordinates: [],
};

const derivedEvidenceRef = deriveEvidenceStateRefV2(
  rawSyntheticEvidenceState as unknown as Parameters<
    typeof deriveEvidenceStateRefV2
  >[0],
);

const syntheticEvidenceState = {
  ...rawSyntheticEvidenceState,
  evidenceStateRef: derivedEvidenceRef.ok ? derivedEvidenceRef.value : "",
};

const rawSyntheticPolicyUniverse = {
  policyUniverseRef: "",
  applicablePolicyMaterial: [],
  dependencyTopology: {
    dependencyEdges: [],
  },
  applicabilityProvenanceBinding: SYNTHETIC_PROV,
};

const derivedPolicyRef = derivePolicyUniverseRefV2(
  rawSyntheticPolicyUniverse as unknown as Parameters<
    typeof derivePolicyUniverseRefV2
  >[0],
);

const syntheticPolicyUniverse = {
  ...rawSyntheticPolicyUniverse,
  policyUniverseRef: derivedPolicyRef.ok ? derivedPolicyRef.value : "",
};

const VALID_V2_REQUEST_OBJ: ExecutionRequestV2 = {
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

const VALID_V2_RAW_JSON = JSON.stringify(VALID_V2_REQUEST_OBJ);

describe("CCP-RI-V2-04 — Generation Dispatch + Raw Boundary", () => {
  describe("Raw JSON integrity", () => {
    it("V204-T01 — Valid historical V1 raw JSON", () => {
      const res = dispatchRawExecutionRequest(VALID_V1_RAW_JSON);
      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.generation).toBe("v1");
      expect(res.executionRequest.requestId).toBe("req-v1-001");
    });

    it("V204-T02 — Valid explicit V2 raw JSON", () => {
      const res = dispatchRawExecutionRequest(VALID_V2_RAW_JSON);
      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.generation).toBe("v2");
      if (res.generation !== "v2") return;
      expect(res.executionRequest.requestId).toBe("req-v2-synthetic-001");
      expect(res.wholeRequestDigestCandidate).toMatch(/^sha256:[0-9a-f]{64}$/);
    });

    it("V204-T03 — Invalid JSON syntax", () => {
      const malformedJson = '{ "requestId": "req-1", ';
      const res = dispatchRawExecutionRequest(malformedJson);

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("RAW_JSON");
      if (res.stage !== "RAW_JSON") return;
      expect(res.code).toBe("INVALID_RAW_JSON");
    });

    it("V204-T04 — Root array rejected", () => {
      const arrayJson = "[1, 2, 3]";
      const res = dispatchRawExecutionRequest(arrayJson);

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("GENERATION_CLASSIFICATION");
      if (res.stage !== "GENERATION_CLASSIFICATION") return;
      expect(res.code).toBe("INVALID_ROOT");
    });

    it("V204-T05 — Root scalar rejected", () => {
      const scalarJson = '"just a string"';
      const res = dispatchRawExecutionRequest(scalarJson);

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("GENERATION_CLASSIFICATION");
      if (res.stage !== "GENERATION_CLASSIFICATION") return;
      expect(res.code).toBe("INVALID_ROOT");
    });

    it("V204-T06 — Whitespace is lawful", () => {
      const paddedJson = `\n\t  ${VALID_V1_RAW_JSON}  \r\n`;
      const res = dispatchRawExecutionRequest(paddedJson);

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.generation).toBe("v1");
      expect(res.executionRequest.requestId).toBe("req-v1-001");
    });
  });

  describe("Duplicate-key boundary", () => {
    it("V204-T07 — Duplicate root V1 field", () => {
      const dupRootJson = '{"requestId":"A","requestId":"B"}';
      const res = dispatchRawExecutionRequest(dupRootJson);

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("RAW_JSON");
      if (res.stage !== "RAW_JSON") return;
      expect(res.code).toBe("DUPLICATE_JSON_KEY");
    });

    it("V204-T08 — Duplicate contractVersion", () => {
      const dupCvJson =
        '{"contractVersion":"v2","contractVersion":"v1","requestId":"r1"}';
      const res = dispatchRawExecutionRequest(dupCvJson);

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("RAW_JSON");
      if (res.stage !== "RAW_JSON") return;
      expect(res.code).toBe("DUPLICATE_JSON_KEY");
    });

    it("V204-T09 — Duplicate V2 semantic section", () => {
      const dupSectionJson =
        '{"contractVersion":"v2","requestedAction":{},"requestedAction":{}}';
      const res = dispatchRawExecutionRequest(dupSectionJson);

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("RAW_JSON");
      if (res.stage !== "RAW_JSON") return;
      expect(res.code).toBe("DUPLICATE_JSON_KEY");
    });

    it("V204-T10 — Nested duplicate", () => {
      const dupNestedRaw =
        '{"requestId":"r1","identity":{"identityId":"i1","identityId":"i2"}}';
      const res = dispatchRawExecutionRequest(dupNestedRaw);

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("RAW_JSON");
      if (res.stage !== "RAW_JSON") return;
      expect(res.code).toBe("DUPLICATE_JSON_KEY");
    });

    it("V204-T11 — Escaped-equivalent duplicate", () => {
      const escapedDupRaw = '{"a": 1, "\\u0061": 2}';
      const res = dispatchRawExecutionRequest(escapedDupRaw);

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("RAW_JSON");
      if (res.stage !== "RAW_JSON") return;
      expect(res.code).toBe("DUPLICATE_JSON_KEY");
    });

    it("V204-T12 — Equal duplicate values still fail", () => {
      const equalDupRaw = '{"requestId": "r1", "requestId": "r1"}';
      const res = dispatchRawExecutionRequest(equalDupRaw);

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("RAW_JSON");
      if (res.stage !== "RAW_JSON") return;
      expect(res.code).toBe("DUPLICATE_JSON_KEY");
    });

    it("V204-T13 — Same key in different objects allowed", () => {
      const diffObjRaw = '{"left":{"id":1},"right":{"id":2}}';
      const res = dispatchRawExecutionRequest(diffObjRaw);

      // Syntax and duplicate checks pass, fails on classification/validation because it's not a valid request
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("V1_VALIDATION");
    });

    it("V204-T14 — Repeated array values allowed", () => {
      const arrayDupValuesRaw = JSON.stringify({
        ...VALID_V1_REQUEST_OBJ,
        executionContext: {
          ...VALID_V1_REQUEST_OBJ.executionContext,
          versions: ["1.0.0", "1.0.0"],
        },
      });

      const res = dispatchRawExecutionRequest(arrayDupValuesRaw);
      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.generation).toBe("v1");
    });
  });

  describe("Generation classification", () => {
    it("V204-T15 — Historical V1 remains markerless", () => {
      const res = dispatchRawExecutionRequest(VALID_V1_RAW_JSON);
      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.generation).toBe("v1");
      expect("contractVersion" in res.executionRequest).toBe(false);
    });

    it("V204-T16 — Explicit 'v1' rejected", () => {
      const v1ExplicitCvRaw = JSON.stringify({
        ...VALID_V1_REQUEST_OBJ,
        contractVersion: "v1",
      });

      const res = dispatchRawExecutionRequest(v1ExplicitCvRaw);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("GENERATION_CLASSIFICATION");
      if (res.stage !== "GENERATION_CLASSIFICATION") return;
      expect(res.code).toBe("UNSUPPORTED_EXPLICIT_GENERATION");
    });

    it("V204-T17 — Unknown explicit generation rejected", () => {
      const v3Raw = JSON.stringify({
        contractVersion: "v3",
        requestId: "req-v3-001",
      });

      const res = dispatchRawExecutionRequest(v3Raw);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("GENERATION_CLASSIFICATION");
      if (res.stage !== "GENERATION_CLASSIFICATION") return;
      expect(res.code).toBe("UNSUPPORTED_EXPLICIT_GENERATION");
    });

    it("V204-T18 — Non-string explicit generation rejected", () => {
      const numericCvRaw = JSON.stringify({
        contractVersion: 2,
        requestId: "req-v2-001",
      });

      const res = dispatchRawExecutionRequest(numericCvRaw);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("GENERATION_CLASSIFICATION");
      if (res.stage !== "GENERATION_CLASSIFICATION") return;
      expect(res.code).toBe("UNSUPPORTED_EXPLICIT_GENERATION");
    });

    it("V204-T19 — V2 missing marker rejected", () => {
      const unversionedV2 = { ...VALID_V2_REQUEST_OBJ } as Record<
        string,
        unknown
      >;
      delete unversionedV2.contractVersion;
      const unversionedV2Raw = JSON.stringify(unversionedV2);

      const res = dispatchRawExecutionRequest(unversionedV2Raw);
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("GENERATION_CLASSIFICATION");
      if (res.stage !== "GENERATION_CLASSIFICATION") return;
      expect(res.code).toBe("MISSING_V2_GENERATION_MARKER");
    });

    it("V204-T20 — Partial V2 missing marker rejected", () => {
      const partialV2 = {
        requestId: "req-partial-001",
        participation: VALID_V2_REQUEST_OBJ.participation,
      };
      const res = dispatchRawExecutionRequest(JSON.stringify(partialV2));

      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("GENERATION_CLASSIFICATION");
      if (res.stage !== "GENERATION_CLASSIFICATION") return;
      expect(res.code).toBe("MISSING_V2_GENERATION_MARKER");
    });

    it("V204-T21 — Hybrid V1 + V2 marker field rejected", () => {
      const hybridObj = {
        ...VALID_V1_REQUEST_OBJ,
        requestedAction: VALID_V2_REQUEST_OBJ.requestedAction,
      };

      const res = dispatchRawExecutionRequest(JSON.stringify(hybridObj));
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("GENERATION_CLASSIFICATION");
      if (res.stage !== "GENERATION_CLASSIFICATION") return;
      expect(res.code).toBe("MISSING_V2_GENERATION_MARKER");
    });
  });

  describe("Branch isolation", () => {
    it("V204-T22 — Malformed explicit V2 stays V2", () => {
      const malformedV2 = {
        contractVersion: "v2",
        requestId: "req-v2-malformed",
      };

      const res = dispatchRawExecutionRequest(JSON.stringify(malformedV2));
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("V2_VALIDATION");
    });

    it("V204-T23 — V2 identity mismatch stays V2", () => {
      const badIdentityV2 = {
        ...VALID_V2_REQUEST_OBJ,
        constitutionalState: {
          ...VALID_V2_REQUEST_OBJ.constitutionalState,
          semanticStateRef:
            "sha256:0000000000000000000000000000000000000000000000000000000000000000",
        },
      };

      const res = dispatchRawExecutionRequest(JSON.stringify(badIdentityV2));
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("V2_MATERIALIZATION");
      if (res.stage !== "V2_MATERIALIZATION") return;
      expect(res.error.stage).toBe("SEMANTIC_STATE_IDENTITY");
    });

    it("V204-T24 — Invalid markerless V1 stays V1 failure", () => {
      const malformedV1 = {
        requestId: "req-v1-invalid",
        identity: { identityId: "id-bad" },
      };

      const res = dispatchRawExecutionRequest(JSON.stringify(malformedV1));
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).toBe("V1_VALIDATION");
    });

    it("V204-T25 — Validator-success order is irrelevant", () => {
      // Prove that explicit V2 classification failure is determined BEFORE V1 validator is invoked
      const malformedV2 = {
        contractVersion: "v2",
        requestId: "req-v2-invalid",
      };

      const res = dispatchRawExecutionRequest(JSON.stringify(malformedV2));
      expect(res.ok).toBe(false);
      if (res.ok) return;

      expect(res.stage).not.toBe("V1_VALIDATION");
      expect(res.stage).toBe("V2_VALIDATION");
    });
  });

  describe("V2 capability reuse", () => {
    it("V204-T26 — V2 dispatch reuses V2-03 materialization", () => {
      const dispatchRes = dispatchRawExecutionRequest(VALID_V2_RAW_JSON);
      expect(dispatchRes.ok).toBe(true);
      if (!dispatchRes.ok) return;

      expect(dispatchRes.generation).toBe("v2");
      if (dispatchRes.generation !== "v2") return;

      const matInput = { ...VALID_V2_REQUEST_OBJ } as Record<string, unknown>;
      delete matInput.contractVersion;
      const directMatRes = materializeExecutionRequestV2(
        matInput as unknown as ExecutionRequestV2MaterializationInput,
      );
      expect(directMatRes.ok).toBe(true);
      if (!directMatRes.ok) return;

      expect(dispatchRes.executionRequest).toEqual(
        directMatRes.executionRequest,
      );
      expect(dispatchRes.wholeRequestDigestCandidate).toBe(
        directMatRes.wholeRequestDigestCandidate,
      );
    });

    it("V204-T27 — V2 root digest equality", () => {
      const res = dispatchRawExecutionRequest(VALID_V2_RAW_JSON);
      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.generation).toBe("v2");
      if (res.generation !== "v2") return;

      const directDigest = deriveExecutionRequestV2DigestCandidate(
        res.executionRequest,
      );
      expect(directDigest.ok).toBe(true);
      if (!directDigest.ok) return;

      expect(res.wholeRequestDigestCandidate).toBe(directDigest.value);
    });

    it("V204-T28 — Historical V1 validator preservation", () => {
      const res = dispatchRawExecutionRequest(VALID_V1_RAW_JSON);
      expect(res.ok).toBe(true);
      if (!res.ok) return;

      expect(res.generation).toBe("v1");
      expect(res.executionRequest).toEqual(VALID_V1_REQUEST_OBJ);

      const directV1Res = validateExecutionRequest(
        JSON.parse(VALID_V1_RAW_JSON),
      );
      expect(directV1Res.ok).toBe(true);
      if (!directV1Res.ok) return;

      expect(res.executionRequest).toEqual(directV1Res.value);
    });

    it("V204-H01 — Inherited generation properties ignored", () => {
      const proto = Object.prototype as Record<string, unknown>;
      const originalCv = proto.contractVersion;
      const originalIntent = proto.intent;

      try {
        proto.contractVersion = "v2";
        proto.intent = { someKey: "someValue" };

        // Even with Object.prototype polluted, valid markerless V1 raw JSON must still dispatch to V1
        const res = dispatchRawExecutionRequest(VALID_V1_RAW_JSON);
        expect(res.ok).toBe(true);
        if (!res.ok) return;

        expect(res.generation).toBe("v1");
        expect(res.executionRequest.requestId).toBe("req-v1-001");
      } finally {
        if (originalCv === undefined) {
          delete proto.contractVersion;
        } else {
          proto.contractVersion = originalCv;
        }
        if (originalIntent === undefined) {
          delete proto.intent;
        } else {
          proto.intent = originalIntent;
        }
      }
    });
  });

  describe("Purity / boundary / neutrality", () => {
    it("V204-T29 — Determinism", () => {
      const res1 = dispatchRawExecutionRequest(VALID_V2_RAW_JSON);
      const res2 = dispatchRawExecutionRequest(VALID_V2_RAW_JSON);

      expect(res1).toEqual(res2);
    });

    it("V204-T30 — Runtime independence", () => {
      const sourcePath = resolve(__dirname, "executionGenerationBoundary.ts");
      const content = readFileSync(sourcePath, "utf8");

      expect(content).not.toContain("@zyppi/runtime");
      expect(content).not.toContain("runInternalPipeline");
      expect(content).not.toContain("StageOverrideConfig");
    });

    it("V204-T31 — Domain neutrality", () => {
      const sourcePath = resolve(__dirname, "executionGenerationBoundary.ts");
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

    it("V204-T32 — Internal duplicate guard not public", async () => {
      const publicExports = await import("./index.js");
      expect("checkRawJsonDuplicateKeys" in publicExports).toBe(false);
      expect("dispatchRawExecutionRequest" in publicExports).toBe(true);
    });
  });
});

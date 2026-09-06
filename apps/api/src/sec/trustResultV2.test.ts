import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  canonicalizeJcs,
  deriveEvidenceStateRefV2,
  derivePolicyUniverseRefV2,
  deriveSemanticStateRefV2,
  type BoundEvidenceStateV2,
  type ExecutionRequestV2,
  type OwnerDeterminationBindingV2,
} from "@zyppi/domain";
import { evaluateExecutabilityAndOutcomeV2 } from "@zyppi/runtime";

import {
  produceSecTrustResultV2,
  type SecTrustResultProductionV2Result,
} from "./trustResultV2.js";

function computeSha256(text: string): string {
  const hex = crypto
    .createHash("sha256")
    .update(text, "utf8")
    .digest("hex")
    .toLowerCase();
  return `sha256:${hex}`;
}

function createValidBoundEvidenceState(
  partial?: Partial<Omit<BoundEvidenceStateV2, "evidenceStateRef">>,
): BoundEvidenceStateV2 {
  const reqRef = {
    family: "EVIDENCE_REQUIREMENT" as const,
    ownerRef: "urn:zyppi:owner:council:v1",
    artifactId: "req-001",
  };

  const evidRef = {
    family: "EVIDENCE" as const,
    ownerRef: "urn:zyppi:owner:cert-auth:v1",
    artifactId: "ev-001",
  };

  const ownerRef = {
    family: "OWNER" as const,
    ownerRef: "urn:zyppi:owner:cert-auth:v1",
    artifactId: "cert-auth-001",
  };

  const scopeRef = {
    family: "SCOPE" as const,
    ownerRef: "urn:zyppi:owner:council:v1",
    artifactId: "scope-global",
  };

  const schemaRef = {
    family: "STATE_ARTIFACT" as const,
    ownerRef: "urn:zyppi:owner:council:v1",
    artifactId: "schema-001",
  };

  const materialContent = { sig: "0x123456" };
  const materialJcs = canonicalizeJcs(materialContent);
  const expectedDigest = computeSha256(materialJcs);

  const defaultState: Omit<BoundEvidenceStateV2, "evidenceStateRef"> = {
    evidenceRequirementBindings: [
      {
        requirementKey: "req_key_1",
        governedRequirementRef: reqRef,
        requirementAuthorityBinding: ownerRef,
        requirementScopeBinding: scopeRef,
      },
    ],
    suppliedEvidenceMaterial: [
      {
        materialKey: "mat_key_1",
        evidenceRef: evidRef,
        ownerRef,
        schemaRef,
        material: materialContent,
      },
    ],
    evidencePresentationBindings: [
      {
        evidenceRequirementRef: reqRef,
        presentedEvidenceRefs: [evidRef],
      },
    ],
    integrityCoordinates: [
      {
        coordinateKey: "coord_key_1",
        evidenceRef: evidRef,
        expectedDigest,
        algorithm: "sha256",
      },
    ],
  };

  const merged = {
    ...defaultState,
    ...partial,
  };

  const dummyState: BoundEvidenceStateV2 = {
    evidenceStateRef:
      "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    ...merged,
  };

  const derived = deriveEvidenceStateRefV2(dummyState);
  if (!derived.ok) {
    throw new Error(
      `Failed to derive evidenceStateRef: ${derived.error.message}`,
    );
  }

  return {
    ...dummyState,
    evidenceStateRef: derived.value,
  };
}

describe("CCP-SEC-PROD-01 Native V2 TrustResult Production (SEC01-T01..T30)", () => {
  // SEC01-T01 — Fully covered + verified evidence → definite
  it("SEC01-T01 — Fully covered + verified evidence → definite", () => {
    const evidenceState = createValidBoundEvidenceState();
    const res = produceSecTrustResultV2({
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.determination.ownerNativeResult).toEqual({
        trustStatus: "definite",
        degradationFactors: [],
      });
    }
  });

  // SEC01-T02 — Missing required evidence → uncertain
  it("SEC01-T02 — Missing required evidence → uncertain", () => {
    const evidenceState = createValidBoundEvidenceState({
      evidencePresentationBindings: [],
    });
    const res = produceSecTrustResultV2({
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.determination.ownerNativeResult).toEqual({
        trustStatus: "uncertain",
        degradationFactors: ["MISSING_REQUIRED_EVIDENCE"],
      });
    }
  });

  // SEC01-T03 — Presented material missing → uncertain
  it("SEC01-T03 — Presented material missing → uncertain", () => {
    const evidenceState = createValidBoundEvidenceState({
      suppliedEvidenceMaterial: [],
    });
    const res = produceSecTrustResultV2({
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.determination.ownerNativeResult).toEqual({
        trustStatus: "uncertain",
        degradationFactors: ["PRESENTED_EVIDENCE_MATERIAL_MISSING"],
      });
    }
  });

  // SEC01-T04 — Integrity coordinate missing → uncertain
  it("SEC01-T04 — Integrity coordinate missing → uncertain", () => {
    const evidenceState = createValidBoundEvidenceState({
      integrityCoordinates: [],
    });
    const res = produceSecTrustResultV2({
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.determination.ownerNativeResult).toEqual({
        trustStatus: "uncertain",
        degradationFactors: ["INTEGRITY_COORDINATE_MISSING"],
      });
    }
  });

  // SEC01-T05 — Unsupported integrity algorithm → uncertain
  it("SEC01-T05 — Unsupported integrity algorithm → uncertain", () => {
    const valid = createValidBoundEvidenceState();
    const evidenceState = createValidBoundEvidenceState({
      integrityCoordinates: [
        {
          ...valid.integrityCoordinates[0],
          algorithm: "sha512",
        },
      ],
    });

    const res = produceSecTrustResultV2({
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.determination.ownerNativeResult).toEqual({
        trustStatus: "uncertain",
        degradationFactors: ["INTEGRITY_ALGORITHM_UNSUPPORTED"],
      });
    }
  });

  // SEC01-T06 — Hash mismatch → speculative
  it("SEC01-T06 — Hash mismatch → speculative", () => {
    const valid = createValidBoundEvidenceState();
    const evidenceState = createValidBoundEvidenceState({
      integrityCoordinates: [
        {
          ...valid.integrityCoordinates[0],
          expectedDigest:
            "sha256:0000000000000000000000000000000000000000000000000000000000000000",
        },
      ],
    });

    const res = produceSecTrustResultV2({
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.determination.ownerNativeResult).toEqual({
        trustStatus: "speculative",
        degradationFactors: ["INTEGRITY_MISMATCH"],
      });
    }
  });

  // SEC01-T07 — No evidence requirements → uncertain
  it("SEC01-T07 — No evidence requirements → uncertain", () => {
    const evidenceState = createValidBoundEvidenceState({
      evidenceRequirementBindings: [],
    });

    const res = produceSecTrustResultV2({
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.determination.ownerNativeResult).toEqual({
        trustStatus: "uncertain",
        degradationFactors: ["NO_EVIDENCE_REQUIREMENTS_DECLARED"],
      });
    }
  });

  // SEC01-T08 — Multiple degradation factors deterministic
  it("SEC01-T08 — Multiple degradation factors deterministic", () => {
    const reqRef1 = {
      family: "EVIDENCE_REQUIREMENT" as const,
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "req-001",
    };
    const reqRef2 = {
      family: "EVIDENCE_REQUIREMENT" as const,
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "req-002",
    };
    const evidRef1 = {
      family: "EVIDENCE" as const,
      ownerRef: "urn:zyppi:owner:cert-auth:v1",
      artifactId: "ev-001",
    };
    const evidRef2 = {
      family: "EVIDENCE" as const,
      ownerRef: "urn:zyppi:owner:cert-auth:v1",
      artifactId: "ev-002",
    };
    const ownerRef = {
      family: "OWNER" as const,
      ownerRef: "urn:zyppi:owner:cert-auth:v1",
      artifactId: "cert-auth-001",
    };
    const scopeRef = {
      family: "SCOPE" as const,
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "scope-global",
    };
    const schemaRef = {
      family: "STATE_ARTIFACT" as const,
      ownerRef: "urn:zyppi:owner:council:v1",
      artifactId: "schema-001",
    };

    const mat1 = { sig: "0x123456" };

    const evidenceState = createValidBoundEvidenceState({
      evidenceRequirementBindings: [
        {
          requirementKey: "req_key_1",
          governedRequirementRef: reqRef1,
          requirementAuthorityBinding: ownerRef,
          requirementScopeBinding: scopeRef,
        },
        {
          requirementKey: "req_key_2",
          governedRequirementRef: reqRef2,
          requirementAuthorityBinding: ownerRef,
          requirementScopeBinding: scopeRef,
        },
      ],
      suppliedEvidenceMaterial: [
        {
          materialKey: "mat_key_1",
          evidenceRef: evidRef1,
          ownerRef,
          schemaRef,
          material: mat1,
        },
      ],
      evidencePresentationBindings: [
        {
          evidenceRequirementRef: reqRef1,
          presentedEvidenceRefs: [evidRef1],
        },
        {
          evidenceRequirementRef: reqRef2,
          presentedEvidenceRefs: [evidRef2], // evidRef2 has no supplied material -> PRESENTED_EVIDENCE_MATERIAL_MISSING
        },
      ],
      integrityCoordinates: [
        {
          coordinateKey: "coord_key_1",
          evidenceRef: evidRef1,
          expectedDigest: computeSha256(canonicalizeJcs(mat1)),
          algorithm: "sha512", // Unsupported algorithm -> INTEGRITY_ALGORITHM_UNSUPPORTED
        },
      ],
    });

    const res = produceSecTrustResultV2({
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      const factors = (
        res.determination.ownerNativeResult as {
          degradationFactors: readonly string[];
        }
      ).degradationFactors;
      expect(factors).toEqual(
        [
          "INTEGRITY_ALGORITHM_UNSUPPORTED",
          "PRESENTED_EVIDENCE_MATERIAL_MISSING",
        ].sort(),
      );
    }
  });

  // SEC01-T09 — No probable output under RuleSet01
  it("SEC01-T09 — No probable output under RuleSet01", () => {
    const validState = createValidBoundEvidenceState();
    const missingReqState = createValidBoundEvidenceState({
      evidencePresentationBindings: [],
    });
    const mismatchState = createValidBoundEvidenceState({
      integrityCoordinates: [
        {
          ...validState.integrityCoordinates[0],
          expectedDigest:
            "sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        },
      ],
    });

    for (const state of [validState, missingReqState, mismatchState]) {
      const res = produceSecTrustResultV2({
        evidenceState: state,
        tEInput: "2026-08-08T14:30:00Z",
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        const status = (
          res.determination.ownerNativeResult as { trustStatus: string }
        ).trustStatus;
        expect(status).not.toBe("probable");
      }
    }
  });

  // SEC01-T10 — No possible output under RuleSet01
  it("SEC01-T10 — No possible output under RuleSet01", () => {
    const validState = createValidBoundEvidenceState();
    const missingReqState = createValidBoundEvidenceState({
      evidencePresentationBindings: [],
    });
    const mismatchState = createValidBoundEvidenceState({
      integrityCoordinates: [
        {
          ...validState.integrityCoordinates[0],
          expectedDigest:
            "sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        },
      ],
    });

    for (const state of [validState, missingReqState, mismatchState]) {
      const res = produceSecTrustResultV2({
        evidenceState: state,
        tEInput: "2026-08-08T14:30:00Z",
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        const status = (
          res.determination.ownerNativeResult as { trustStatus: string }
        ).trustStatus;
        expect(status).not.toBe("possible");
      }
    }
  });

  // SEC01-T11 — Evidence-state identity exactness
  it("SEC01-T11 — Evidence-state identity exactness", () => {
    const validState = createValidBoundEvidenceState();
    const tamperedState: BoundEvidenceStateV2 = {
      ...validState,
      evidenceStateRef:
        "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    };

    const res = produceSecTrustResultV2({
      evidenceState: tamperedState,
      tEInput: "2026-08-08T14:30:00Z",
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("SEC_EVIDENCE_STATE_IDENTITY_FAILED");
    }
  });

  // SEC01-T12 — Exact SEC owner
  it("SEC01-T12 — Exact SEC owner", () => {
    const evidenceState = createValidBoundEvidenceState();
    const res = produceSecTrustResultV2({
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.determination.constitutionalOwnerRef).toEqual({
        family: "OWNER",
        ownerRef: "urn:zyppi:owner:sec:v1",
        artifactId: "SEC-001",
      });
    }
  });

  // SEC01-T13 — Exact EVIDENCE_STATE operand
  it("SEC01-T13 — Exact EVIDENCE_STATE operand", () => {
    const evidenceState = createValidBoundEvidenceState();
    const res = produceSecTrustResultV2({
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      const operands =
        res.determination.determinationQuestionBinding.questionOperandBindings;
      expect(operands).toHaveLength(1);
      expect(operands[0]).toEqual({
        operandKey: "op:sec:evidence_state:1",
        operandSlotSemanticRef: {
          family: "EVALUATION_SEMANTIC",
          ownerRef: "urn:zyppi:owner:sec:v1",
          artifactId: "SEC-EVIDENCE-STATE-OPERAND-01",
        },
        operandKind: "EVIDENCE_STATE",
        evidenceStateRef: evidenceState.evidenceStateRef,
      });
    }
  });

  // SEC01-T14 — Exact ruleset reference
  it("SEC01-T14 — Exact ruleset reference", () => {
    const evidenceState = createValidBoundEvidenceState();
    const res = produceSecTrustResultV2({
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.determination.exactRuleRef).toEqual({
        family: "RULE",
        ownerRef: "urn:zyppi:owner:sec:v1",
        artifactId: "SEC-TRUSTRESULT-RULESET-01",
      });
    }
  });

  // SEC01-T15 — assessedAtCoordinateRef
  it("SEC01-T15 — assessedAtCoordinateRef", () => {
    const evidenceState = createValidBoundEvidenceState();
    const res = produceSecTrustResultV2({
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.determination.assessedAtCoordinateRef).toBe("tEInput");
    }
  });

  // SEC01-T16 — No system clock
  it("SEC01-T16 — No system clock", () => {
    const code = readFileSync(
      resolve(process.cwd(), "apps/api/src/sec/trustResultV2.ts"),
      "utf8",
    );
    expect(code).not.toContain("Date.now");
    expect(code).not.toContain("new Date");
    expect(code).not.toContain("system clock");

    const evidenceState = createValidBoundEvidenceState();
    const res1 = produceSecTrustResultV2({
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    });
    const res2 = produceSecTrustResultV2({
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    });

    expect(res1).toEqual(res2);
  });

  // SEC01-T17 — No owner dependencies
  it("SEC01-T17 — No owner dependencies", () => {
    const evidenceState = createValidBoundEvidenceState();
    const res = produceSecTrustResultV2({
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.determination.determinationDependencyDeclaration).toEqual({
        kind: "AUTHORITATIVELY_NONE",
      });
    }
  });

  // SEC01-T18 — Deterministic replay
  it("SEC01-T18 — Deterministic replay", () => {
    const evidenceState = createValidBoundEvidenceState();
    const input = {
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    };

    const res1 = produceSecTrustResultV2(input);
    const res2 = produceSecTrustResultV2(input);

    expect(res1).toEqual(res2);
    if (res1.ok && res2.ok) {
      expect(res1.determination.determinationBindingKey).toBe(
        res2.determination.determinationBindingKey,
      );
    }
  });

  // SEC01-T19 — Property-order invariance
  it("SEC01-T19 — Property-order invariance", () => {
    const matA = { b: 2, a: 1 };
    const matB = { a: 1, b: 2 };

    const stateA = createValidBoundEvidenceState({
      suppliedEvidenceMaterial: [
        {
          materialKey: "mat_key_1",
          evidenceRef: {
            family: "EVIDENCE",
            ownerRef: "urn:zyppi:owner:cert-auth:v1",
            artifactId: "ev-001",
          },
          ownerRef: {
            family: "OWNER",
            ownerRef: "urn:zyppi:owner:cert-auth:v1",
            artifactId: "cert-auth-001",
          },
          schemaRef: {
            family: "STATE_ARTIFACT",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "schema-001",
          },
          material: matA,
        },
      ],
      integrityCoordinates: [
        {
          coordinateKey: "coord_key_1",
          evidenceRef: {
            family: "EVIDENCE",
            ownerRef: "urn:zyppi:owner:cert-auth:v1",
            artifactId: "ev-001",
          },
          expectedDigest: computeSha256(canonicalizeJcs(matA)),
          algorithm: "sha256",
        },
      ],
    });

    const stateB = createValidBoundEvidenceState({
      suppliedEvidenceMaterial: [
        {
          materialKey: "mat_key_1",
          evidenceRef: {
            family: "EVIDENCE",
            ownerRef: "urn:zyppi:owner:cert-auth:v1",
            artifactId: "ev-001",
          },
          ownerRef: {
            family: "OWNER",
            ownerRef: "urn:zyppi:owner:cert-auth:v1",
            artifactId: "cert-auth-001",
          },
          schemaRef: {
            family: "STATE_ARTIFACT",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "schema-001",
          },
          material: matB,
        },
      ],
      integrityCoordinates: [
        {
          coordinateKey: "coord_key_1",
          evidenceRef: {
            family: "EVIDENCE",
            ownerRef: "urn:zyppi:owner:cert-auth:v1",
            artifactId: "ev-001",
          },
          expectedDigest: computeSha256(canonicalizeJcs(matB)),
          algorithm: "sha256",
        },
      ],
    });

    expect(stateA.evidenceStateRef).toBe(stateB.evidenceStateRef);

    const resA = produceSecTrustResultV2({
      evidenceState: stateA,
      tEInput: "2026-08-08T14:30:00Z",
    });
    const resB = produceSecTrustResultV2({
      evidenceState: stateB,
      tEInput: "2026-08-08T14:30:00Z",
    });

    expect(resA).toEqual(resB);
  });

  // SEC01-T20 — Input mutation isolation
  it("SEC01-T20 — Input mutation isolation", () => {
    const evidenceState = createValidBoundEvidenceState();
    const input = {
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    };

    const res = produceSecTrustResultV2(input);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const origDet = JSON.parse(JSON.stringify(res.determination));

      // Mutate caller input objects
      (input as unknown as Record<string, unknown>).tEInput =
        "2099-01-01T00:00:00Z";
      (evidenceState as unknown as Record<string, unknown>).evidenceStateRef =
        "sha256:MUTATED";

      expect(JSON.parse(JSON.stringify(res.determination))).toEqual(origDet);
    }
  });

  // SEC01-T21 — Deep freeze
  it("SEC01-T21 — Deep freeze", () => {
    const evidenceState = createValidBoundEvidenceState();
    const res = produceSecTrustResultV2({
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(Object.isFrozen(res.determination)).toBe(true);
      expect(Object.isFrozen(res.determination.constitutionalOwnerRef)).toBe(
        true,
      );
      expect(Object.isFrozen(res.determination.ownerNativeResult)).toBe(true);
      expect(
        Object.isFrozen(
          res.determination.determinationQuestionBinding
            .questionOperandBindings,
        ),
      ).toBe(true);
      expect(
        Object.isFrozen(
          (
            res.determination.ownerNativeResult as {
              degradationFactors: readonly string[];
            }
          ).degradationFactors,
        ),
      ).toBe(true);
    }
  });

  // SEC01-T22 — No CurrentlyTrusted
  it("SEC01-T22 — No CurrentlyTrusted", () => {
    const evidenceState = createValidBoundEvidenceState();
    const res = produceSecTrustResultV2({
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.determination).not.toHaveProperty("currentlyTrusted");
      expect(res.determination.ownerNativeResult).not.toHaveProperty(
        "currentlyTrusted",
      );
    }
  });

  // SEC01-T23 — No Authorization
  it("SEC01-T23 — No Authorization", () => {
    const evidenceState = createValidBoundEvidenceState();
    const res = produceSecTrustResultV2({
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.determination).not.toHaveProperty("authorizationDecision");
      expect(res.determination.ownerNativeResult).not.toHaveProperty(
        "authorizationDecision",
      );
      expect(res.determination.ownerNativeResult).not.toHaveProperty(
        "Authorized",
      );
    }
  });

  // SEC01-T24 — No Executability / Outcome
  it("SEC01-T24 — No Executability / Outcome", () => {
    const evidenceState = createValidBoundEvidenceState();
    const res = produceSecTrustResultV2({
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.determination).not.toHaveProperty("executability");
      expect(res.determination).not.toHaveProperty("outcome");
      expect(res.determination).not.toHaveProperty("verified");
    }
  });

  // SEC01-T25 — No GS1 vocabulary in production SEC module
  it("SEC01-T25 — No GS1 vocabulary in production SEC module", () => {
    const code = readFileSync(
      resolve(process.cwd(), "apps/api/src/sec/trustResultV2.ts"),
      "utf8",
    );

    expect(code).not.toContain("GS1");
    expect(code).not.toContain("GTIN");
    expect(code).not.toContain("GLN");
    expect(code).not.toContain("Digital Link");
    expect(code).not.toContain("trade item");
    expect(code).not.toContain("DPP");
  });

  // SEC01-T26 — No Runtime import in production SEC module
  it("SEC01-T26 — No Runtime import in production SEC module", () => {
    const code = readFileSync(
      resolve(process.cwd(), "apps/api/src/sec/trustResultV2.ts"),
      "utf8",
    );

    expect(code).not.toContain("@zyppi/runtime");
    expect(code).not.toContain("packages/runtime");
    expect(code).not.toContain("runInternalPipeline");
  });

  // SEC01-T27 — No Registry / DB / network / fs / env authority
  it("SEC01-T27 — No Registry / DB / network / fs / env authority", () => {
    const code = readFileSync(
      resolve(process.cwd(), "apps/api/src/sec/trustResultV2.ts"),
      "utf8",
    );

    expect(code).not.toContain("process.env");
    expect(code).not.toContain("fetch(");
    expect(code).not.toContain("database");
    expect(code).not.toContain("registry");
    expect(code).not.toContain("node:fs");
  });

  // SEC01-T28 — Extra JavaScript argument immunity
  it("SEC01-T28 — Extra JavaScript argument immunity", () => {
    const evidenceState = createValidBoundEvidenceState();
    const input = {
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    };

    const res1 = produceSecTrustResultV2(input);

    const fn = produceSecTrustResultV2 as (
      a: unknown,
      b: unknown,
      c: unknown,
    ) => SecTrustResultProductionV2Result;

    const res2 = fn(
      input,
      { trustStatus: "definite" },
      { degradationFactors: [] },
    );

    expect(res1).toEqual(res2);
  });

  // SEC01-T29 — Native V2-08 recognition
  it("SEC01-T29 — Native V2-08 recognition", () => {
    const evidenceState = createValidBoundEvidenceState();
    const secRes = produceSecTrustResultV2({
      evidenceState,
      tEInput: "2026-08-08T14:30:00Z",
    });

    expect(secRes.ok).toBe(true);
    if (!secRes.ok) return;

    const secBinding: OwnerDeterminationBindingV2 = secRes.determination;

    // Create a base valid ExecutionRequestV2 containing secBinding in evaluationContext
    let req: ExecutionRequestV2 = {
      contractVersion: "v2",
      requestId: "req-v2-sec01-t29",
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
        ],
        agencyBindings: [],
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
            agencyReliance: { kind: "NO_DELEGATED_AGENCY_RELIANCE" },
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
        requestedCapabilityClaimBindings: [],
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
      evidenceState,
      policyUniverse: {
        policyUniverseRef:
          "sha256:0000000000000000000000000000000000000000000000000000000000000000",
        applicablePolicyMaterial: [],
        dependencyTopology: { dependencyEdges: [] },
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
        ownerDeterminationBindings: [secBinding],
      },
      executionContext: {
        executionId: "exec-v2-sec01-t29",
        temporalCoordinates: {
          tEInput: "2026-08-08T14:30:00Z",
        },
        budget: 1000,
      },
    };

    const semRef = deriveSemanticStateRefV2(req.constitutionalState);
    const polRef = derivePolicyUniverseRefV2(req.policyUniverse);

    req = {
      ...req,
      constitutionalState: {
        ...req.constitutionalState,
        semanticStateRef: semRef.ok
          ? semRef.value
          : req.constitutionalState.semanticStateRef,
      },
      policyUniverse: {
        ...req.policyUniverse,
        policyUniverseRef: polRef.ok
          ? polRef.value
          : req.policyUniverse.policyUniverseRef,
      },
    };

    const execRes = evaluateExecutabilityAndOutcomeV2(req);
    expect(execRes.ok).toBe(true);
    if (execRes.ok) {
      expect(execRes.frame.ownerResults.trustResult).toEqual(secBinding);
      expect(execRes.frame.executability.status).toBe("UNAVAILABLE");
      if (execRes.frame.executability.status === "UNAVAILABLE") {
        expect(execRes.frame.executability.missingOwnerResults).toContain(
          "POLICY_AGGREGATE",
        );
        expect(execRes.frame.executability.missingOwnerResults).toContain(
          "AUTHORIZATION",
        );
      }
    }
  });

  // SEC01-T30 — Trust status does not become RI threshold
  it("SEC01-T30 — Trust status does not become RI threshold", () => {
    const validState = createValidBoundEvidenceState();
    const mismatchState = createValidBoundEvidenceState({
      integrityCoordinates: [
        {
          ...validState.integrityCoordinates[0],
          expectedDigest:
            "sha256:0000000000000000000000000000000000000000000000000000000000000000",
        },
      ],
    });

    const secDefinite = produceSecTrustResultV2({
      evidenceState: validState,
      tEInput: "2026-08-08T14:30:00Z",
    });
    const secSpeculative = produceSecTrustResultV2({
      evidenceState: mismatchState,
      tEInput: "2026-08-08T14:30:00Z",
    });

    expect(secDefinite.ok).toBe(true);
    expect(secSpeculative.ok).toBe(true);
    if (!secDefinite.ok || !secSpeculative.ok) return;

    // Build two V2 requests with identical test context except the secTrust binding
    const buildReq = (
      secBinding: OwnerDeterminationBindingV2,
      evidState: BoundEvidenceStateV2,
    ): ExecutionRequestV2 => {
      const dummyReq: ExecutionRequestV2 = {
        contractVersion: "v2",
        requestId: "req-v2-sec01-t30",
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
          requestedCapabilityClaimBindings: [],
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
        evidenceState: evidState,
        policyUniverse: {
          policyUniverseRef:
            "sha256:0000000000000000000000000000000000000000000000000000000000000000",
          applicablePolicyMaterial: [],
          dependencyTopology: { dependencyEdges: [] },
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
          ownerDeterminationBindings: [],
        },
        executionContext: {
          executionId: "exec-v2-sec01-t30",
          temporalCoordinates: {
            tEInput: "2026-08-08T14:30:00Z",
          },
          budget: 1000,
        },
      };

      const semRef = deriveSemanticStateRefV2(dummyReq.constitutionalState);
      const polRef = derivePolicyUniverseRefV2(dummyReq.policyUniverse);

      const derivedSemRef = semRef.ok
        ? semRef.value
        : dummyReq.constitutionalState.semanticStateRef;
      const derivedPolRef = polRef.ok
        ? polRef.value
        : dummyReq.policyUniverse.policyUniverseRef;

      const polAgg: OwnerDeterminationBindingV2 = {
        determinationBindingKey: "pol_agg_1",
        determinationQuestionBinding: {
          questionSemanticRef: {
            family: "QUESTION_SEMANTIC",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "q-pol-agg",
          },
          questionOperandBindings: [
            {
              operandKey: "op_pol_uni",
              operandSlotSemanticRef: {
                family: "EVALUATION_SEMANTIC",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "slot-pol-uni",
              },
              operandKind: "POLICY_UNIVERSE",
              policyUniverseRef: derivedPolRef,
            },
            {
              operandKey: "op_req_act",
              operandSlotSemanticRef: {
                family: "EVALUATION_SEMANTIC",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "slot-req-act",
              },
              operandKind: "REQUESTED_ACTION",
              requestedActionRef: "REQUESTED_ACTION",
            },
          ],
        },
        constitutionalOwnerRef: {
          family: "OWNER",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "POL-001",
        },
        ownerNativeResult: { aggregateResult: "ALLOW" },
        exactStateRef: {
          family: "STATE_INSTANCE",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "inst-pol-agg",
        },
        exactRuleRef: {
          family: "RULE",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "rule-pol-agg",
        },
        assessedAtCoordinateRef: "tEInput",
        provenanceRef: {
          family: "PROVENANCE",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "prov-pol-agg",
        },
        determinationDependencyDeclaration: { kind: "AUTHORITATIVELY_NONE" },
      };

      const polAuth: OwnerDeterminationBindingV2 = {
        determinationBindingKey: "pol_auth_1",
        determinationQuestionBinding: {
          questionSemanticRef: {
            family: "QUESTION_SEMANTIC",
            ownerRef: "urn:zyppi:owner:council:v1",
            artifactId: "q-pol-auth",
          },
          questionOperandBindings: [
            {
              operandKey: "op_req_act",
              operandSlotSemanticRef: {
                family: "EVALUATION_SEMANTIC",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "slot-req-act",
              },
              operandKind: "REQUESTED_ACTION",
              requestedActionRef: "REQUESTED_ACTION",
            },
            {
              operandKey: "op_pol_uni",
              operandSlotSemanticRef: {
                family: "EVALUATION_SEMANTIC",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "slot-pol-uni",
              },
              operandKind: "POLICY_UNIVERSE",
              policyUniverseRef: derivedPolRef,
            },
            {
              operandKey: "op_perf",
              operandSlotSemanticRef: {
                family: "EVALUATION_SEMANTIC",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "slot-perf",
              },
              operandKind: "ACTION_PERFORMER",
              performerRef: "performer_1",
            },
            {
              operandKey: "op_target",
              operandSlotSemanticRef: {
                family: "EVALUATION_SEMANTIC",
                ownerRef: "urn:zyppi:owner:council:v1",
                artifactId: "slot-target",
              },
              operandKind: "ACTION_TARGET",
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
        },
        constitutionalOwnerRef: {
          family: "OWNER",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "POL-001",
        },
        ownerNativeResult: { authorizationDecision: "Authorized" },
        exactStateRef: {
          family: "STATE_INSTANCE",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "inst-pol-auth",
        },
        exactRuleRef: {
          family: "RULE",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "rule-pol-auth",
        },
        assessedAtCoordinateRef: "tEInput",
        provenanceRef: {
          family: "PROVENANCE",
          ownerRef: "urn:zyppi:owner:council:v1",
          artifactId: "prov-pol-auth",
        },
        determinationDependencyDeclaration: { kind: "AUTHORITATIVELY_NONE" },
      };

      return {
        ...dummyReq,
        constitutionalState: {
          ...dummyReq.constitutionalState,
          semanticStateRef: derivedSemRef,
        },
        policyUniverse: {
          ...dummyReq.policyUniverse,
          policyUniverseRef: derivedPolRef,
        },
        evaluationContext: {
          ...dummyReq.evaluationContext,
          ownerDeterminationBindings: [polAgg, polAuth, secBinding],
        },
      };
    };

    const reqDef = buildReq(secDefinite.determination, validState);
    const reqSpec = buildReq(secSpeculative.determination, mismatchState);

    const resDef = evaluateExecutabilityAndOutcomeV2(reqDef);
    const resSpec = evaluateExecutabilityAndOutcomeV2(reqSpec);

    expect(resDef.ok).toBe(true);
    expect(resSpec.ok).toBe(true);

    if (resDef.ok && resSpec.ok) {
      // Both are executable = true and outcome = "verified" because POL is ALLOW/Authorized
      expect(resDef.frame.executability.status).toBe(
        resSpec.frame.executability.status,
      );
      if (
        resDef.frame.executability.status === "DETERMINED" &&
        resSpec.frame.executability.status === "DETERMINED"
      ) {
        expect(resDef.frame.executability.value).toBe(
          resSpec.frame.executability.value,
        );
        expect(resDef.frame.executability.blockers).toEqual(
          resSpec.frame.executability.blockers,
        );
      }

      expect(resDef.frame.outcome.status).toBe(resSpec.frame.outcome.status);
      if (
        resDef.frame.outcome.status === "PRODUCED" &&
        resSpec.frame.outcome.status === "PRODUCED"
      ) {
        expect(resDef.frame.outcome.outcome).toBe(
          resSpec.frame.outcome.outcome,
        );
      }

      // Prove Runtime preserves exact status without rewriting it into currentlyTrusted
      expect(resDef.frame.ownerResults.trustResult?.ownerNativeResult).toEqual({
        trustStatus: "definite",
        degradationFactors: [],
      });
      expect(resSpec.frame.ownerResults.trustResult?.ownerNativeResult).toEqual(
        {
          trustStatus: "speculative",
          degradationFactors: ["INTEGRITY_MISMATCH"],
        },
      );

      expect(
        resDef.frame.ownerResults.trustResult?.ownerNativeResult,
      ).not.toHaveProperty("currentlyTrusted");
      expect(
        resSpec.frame.ownerResults.trustResult?.ownerNativeResult,
      ).not.toHaveProperty("currentlyTrusted");
    }
  });

  describe("Council Corrective 01 Adversarial Cases (SEC01-H01 & SEC01-H02)", () => {
    // SEC01-H01 — Inherited SEC semantic inputs rejected
    it("SEC01-H01 — Inherited SEC semantic inputs rejected", () => {
      const proto = {
        evidenceState: createValidBoundEvidenceState(),
        tEInput: "2026-08-08T14:30:00Z",
      };
      const inheritedInput = Object.create(proto);

      const res = produceSecTrustResultV2(inheritedInput);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("SEC_INPUT_INVALID");
      }
    });

    // SEC01-H02 — Same evidenceRef with multiple distinct supplied entries fails closed
    it("SEC01-H02 — Same evidenceRef with multiple distinct supplied entries fails closed", () => {
      const evidRef = {
        family: "EVIDENCE" as const,
        ownerRef: "urn:zyppi:owner:cert-auth:v1",
        artifactId: "ev-001",
      };

      const ownerRef1 = {
        family: "OWNER" as const,
        ownerRef: "urn:zyppi:owner:cert-auth:v1",
        artifactId: "cert-auth-001",
      };

      const ownerRef2 = {
        family: "OWNER" as const,
        ownerRef: "urn:zyppi:owner:cert-auth:v1",
        artifactId: "cert-auth-002",
      };

      const schemaRef = {
        family: "STATE_ARTIFACT" as const,
        ownerRef: "urn:zyppi:owner:council:v1",
        artifactId: "schema-001",
      };

      const matContent = { sig: "0x123456" };

      const evidenceState = createValidBoundEvidenceState({
        suppliedEvidenceMaterial: [
          {
            materialKey: "mat_key_1",
            evidenceRef: evidRef,
            ownerRef: ownerRef1,
            schemaRef,
            material: matContent,
          },
          {
            materialKey: "mat_key_2",
            evidenceRef: evidRef, // same evidenceRef!
            ownerRef: ownerRef2, // distinct ownerRef!
            schemaRef,
            material: matContent,
          },
        ],
      });

      const res = produceSecTrustResultV2({
        evidenceState,
        tEInput: "2026-08-08T14:30:00Z",
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("SEC_EVIDENCE_BINDING_AMBIGUOUS");
      }
    });
  });
});

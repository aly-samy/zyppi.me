import crypto from "node:crypto";
import {
  canonicalizeJcs,
  verifyEvidenceStateRefV2,
  type BoundEvidenceStateV2,
  type ConstitutionalRefV2,
  type EvaluationSemanticRefV2,
  type OwnerDeterminationBindingV2,
  type OwnerRefV2,
  type ProvenanceRefV2,
  type QuestionSemanticRefV2,
  type RuleRefV2,
  type SuppliedEvidenceMaterialV2,
} from "@zyppi/domain";

export type SecTrustResultErrorCode =
  | "SEC_INPUT_INVALID"
  | "SEC_EVIDENCE_STATE_IDENTITY_FAILED"
  | "SEC_EVIDENCE_BINDING_AMBIGUOUS"
  | "SEC_TRUST_EVALUATION_FAILED";

export type SecTrustResultProductionV2Result =
  | {
      readonly ok: true;
      readonly determination: OwnerDeterminationBindingV2;
    }
  | {
      readonly ok: false;
      readonly error: {
        readonly code: SecTrustResultErrorCode;
        readonly message: string;
      };
    };

function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Object.isFrozen(obj)) {
    return obj;
  }
  Object.freeze(obj);
  for (const key of Reflect.ownKeys(obj)) {
    const val = (obj as Record<string | symbol, unknown>)[key];
    if (val !== null && typeof val === "object") {
      deepFreeze(val);
    }
  }
  return obj;
}

function safeCanonicalizeJcs(
  val: unknown,
): { ok: true; value: string } | { ok: false; error: string } {
  try {
    const s = canonicalizeJcs(val);
    return { ok: true, value: s };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function refKey(ref: unknown): string {
  if (!ref || typeof ref !== "object") return "";
  const res = safeCanonicalizeJcs(ref);
  return res.ok ? res.value : "";
}

function compareUtf16(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function produceSecTrustResultV2(
  input: unknown,
): SecTrustResultProductionV2Result {
  if (
    input === null ||
    typeof input !== "object" ||
    Array.isArray(input) ||
    !Object.prototype.hasOwnProperty.call(input, "tEInput") ||
    !Object.prototype.hasOwnProperty.call(input, "evidenceState")
  ) {
    return {
      ok: false,
      error: {
        code: "SEC_INPUT_INVALID",
        message:
          "Input must be an object containing non-empty string own-property 'tEInput' and own-property 'evidenceState'.",
      },
    };
  }

  const { tEInput, evidenceState } = input as {
    tEInput?: unknown;
    evidenceState?: unknown;
  };

  if (typeof tEInput !== "string" || tEInput.trim() === "") {
    return {
      ok: false,
      error: {
        code: "SEC_INPUT_INVALID",
        message: "'tEInput' must be a non-empty string.",
      },
    };
  }

  if (
    evidenceState === null ||
    typeof evidenceState !== "object" ||
    Array.isArray(evidenceState)
  ) {
    return {
      ok: false,
      error: {
        code: "SEC_INPUT_INVALID",
        message: "'evidenceState' must be a valid object.",
      },
    };
  }

  const boundEvidenceState = evidenceState as BoundEvidenceStateV2;
  const identityCheck = verifyEvidenceStateRefV2(boundEvidenceState);
  if (!identityCheck.ok) {
    return {
      ok: false,
      error: {
        code: "SEC_EVIDENCE_STATE_IDENTITY_FAILED",
        message: `Evidence state identity verification failed: ${identityCheck.error.message}`,
      },
    };
  }

  const {
    evidenceRequirementBindings = [],
    suppliedEvidenceMaterial = [],
    evidencePresentationBindings = [],
    integrityCoordinates = [],
  } = boundEvidenceState;

  // Check for ambiguous supplied evidence material
  const materialByRefKey = new Map<string, SuppliedEvidenceMaterialV2[]>();
  for (const mat of suppliedEvidenceMaterial) {
    if (!mat || typeof mat !== "object" || !mat.evidenceRef) {
      return {
        ok: false,
        error: {
          code: "SEC_EVIDENCE_BINDING_AMBIGUOUS",
          message: "Supplied evidence material entry is malformed.",
        },
      };
    }
    const rKey = refKey(mat.evidenceRef);
    if (!rKey) {
      return {
        ok: false,
        error: {
          code: "SEC_EVIDENCE_BINDING_AMBIGUOUS",
          message: "Supplied evidence material evidenceRef is malformed.",
        },
      };
    }
    const existing = materialByRefKey.get(rKey) ?? [];
    existing.push(mat);
    materialByRefKey.set(rKey, existing);
  }

  for (const [keyStr, mats] of materialByRefKey.entries()) {
    if (mats.length > 1) {
      return {
        ok: false,
        error: {
          code: "SEC_EVIDENCE_BINDING_AMBIGUOUS",
          message: `Multiple supplied evidence material entries found for evidenceRef key '${keyStr}'.`,
        },
      };
    }
  }

  const degradationFactorsSet = new Set<string>();

  if (evidenceRequirementBindings.length === 0) {
    degradationFactorsSet.add("NO_EVIDENCE_REQUIREMENTS_DECLARED");
  }

  const relevantEvidenceRefKeys = new Set<string>();

  for (const req of evidenceRequirementBindings) {
    const reqKey = refKey(req.governedRequirementRef);
    const pBindings = evidencePresentationBindings.filter(
      (pb) => refKey(pb.evidenceRequirementRef) === reqKey,
    );

    let hasPresented = false;
    for (const pb of pBindings) {
      if (
        Array.isArray(pb.presentedEvidenceRefs) &&
        pb.presentedEvidenceRefs.length > 0
      ) {
        hasPresented = true;
        for (const pRef of pb.presentedEvidenceRefs) {
          const pKey = refKey(pRef);
          if (pKey) {
            relevantEvidenceRefKeys.add(pKey);
          }
        }
      }
    }

    if (!hasPresented) {
      degradationFactorsSet.add("MISSING_REQUIRED_EVIDENCE");
    }
  }

  // Integrity and closure evaluation over relevant presented evidence
  for (const pKey of relevantEvidenceRefKeys) {
    const mats = materialByRefKey.get(pKey);
    if (!mats || mats.length === 0) {
      degradationFactorsSet.add("PRESENTED_EVIDENCE_MATERIAL_MISSING");
      continue;
    }

    const coords = integrityCoordinates.filter(
      (ic) => refKey(ic.evidenceRef) === pKey,
    );
    if (coords.length === 0) {
      degradationFactorsSet.add("INTEGRITY_COORDINATE_MISSING");
      continue;
    }

    for (const coord of coords) {
      if (
        typeof coord.algorithm !== "string" ||
        coord.algorithm.toLowerCase() !== "sha256"
      ) {
        degradationFactorsSet.add("INTEGRITY_ALGORITHM_UNSUPPORTED");
        continue;
      }

      const mat = mats[0];
      const canonRes = safeCanonicalizeJcs(mat.material);
      if (!canonRes.ok) {
        degradationFactorsSet.add("INTEGRITY_MISMATCH");
        continue;
      }

      const hashHex = crypto
        .createHash("sha256")
        .update(canonRes.value, "utf8")
        .digest("hex")
        .toLowerCase();
      const computedDigest = `sha256:${hashHex}`;

      if (
        typeof coord.expectedDigest !== "string" ||
        computedDigest !== coord.expectedDigest.toLowerCase()
      ) {
        degradationFactorsSet.add("INTEGRITY_MISMATCH");
      }
    }
  }

  const sortedDegradationFactors = Array.from(degradationFactorsSet).sort(
    compareUtf16,
  );

  let trustStatus: "definite" | "uncertain" | "speculative";
  if (degradationFactorsSet.has("INTEGRITY_MISMATCH")) {
    trustStatus = "speculative";
  } else if (sortedDegradationFactors.length > 0) {
    trustStatus = "uncertain";
  } else {
    trustStatus = "definite";
  }

  const ownerNativeResult = {
    trustStatus,
    degradationFactors: sortedDegradationFactors,
  };

  const preimage = {
    ownerRef: "urn:zyppi:owner:sec:v1",
    ruleRef: "SEC-TRUSTRESULT-RULESET-01",
    evidenceStateRef: boundEvidenceState.evidenceStateRef,
    tEInput,
    trustStatus,
    degradationFactors: sortedDegradationFactors,
  };

  const preimageCanon = safeCanonicalizeJcs(preimage);
  if (!preimageCanon.ok) {
    return {
      ok: false,
      error: {
        code: "SEC_TRUST_EVALUATION_FAILED",
        message: `Failed to canonicalize SEC determination preimage: ${preimageCanon.error}`,
      },
    };
  }

  const rawHex = crypto
    .createHash("sha256")
    .update(`zyppi:sec:trust_result:v1:${preimageCanon.value}`, "utf8")
    .digest("hex")
    .toLowerCase();

  const constitutionalOwnerRef: OwnerRefV2 = {
    family: "OWNER",
    ownerRef: "urn:zyppi:owner:sec:v1",
    artifactId: "SEC-001",
  };

  const exactStateRef: ConstitutionalRefV2 = {
    family: "STATE_INSTANCE",
    ownerRef: "urn:zyppi:owner:sec:v1",
    artifactId: `sec-trust-result-state:${rawHex}`,
  };

  const exactRuleRef: RuleRefV2 = {
    family: "RULE",
    ownerRef: "urn:zyppi:owner:sec:v1",
    artifactId: "SEC-TRUSTRESULT-RULESET-01",
  };

  const provenanceRef: ProvenanceRefV2 = {
    family: "PROVENANCE",
    ownerRef: "urn:zyppi:owner:sec:v1",
    artifactId: `sec-trust-result-provenance:${rawHex}`,
  };

  const questionSemanticRef: QuestionSemanticRefV2 = {
    family: "QUESTION_SEMANTIC",
    ownerRef: "urn:zyppi:owner:sec:v1",
    artifactId: "SEC-TRUSTRESULT-QUESTION-01",
  };

  const operandSlotSemanticRef: EvaluationSemanticRefV2 = {
    family: "EVALUATION_SEMANTIC",
    ownerRef: "urn:zyppi:owner:sec:v1",
    artifactId: "SEC-EVIDENCE-STATE-OPERAND-01",
  };

  const determination: OwnerDeterminationBindingV2 = {
    determinationBindingKey: `sec:trust-result:${rawHex}`,
    determinationQuestionBinding: {
      questionSemanticRef,
      questionOperandBindings: [
        {
          operandKey: "op:sec:evidence_state:1",
          operandSlotSemanticRef,
          operandKind: "EVIDENCE_STATE",
          evidenceStateRef: boundEvidenceState.evidenceStateRef,
        },
      ],
    },
    constitutionalOwnerRef,
    ownerNativeResult,
    exactStateRef,
    exactRuleRef,
    assessedAtCoordinateRef: "tEInput",
    provenanceRef,
    determinationDependencyDeclaration: {
      kind: "AUTHORITATIVELY_NONE",
    },
  };

  return {
    ok: true,
    determination: deepFreeze(determination),
  };
}

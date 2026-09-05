import {
  canonicalizeReceiptDecisionSummaryV2,
  deriveExecutionOutputHashV2,
  deriveExecutionRequestV2DigestCandidate,
  deriveReceiptDeterministicHashV2,
  deriveReceiptEvidenceHashV2,
  deriveReceiptIdV2,
  getEvidenceStateIdentityProjectionV2,
  normalizeTemporalCoordinateV2,
  type OwnerDeterminationBindingV2,
} from "@zyppi/domain";
import {
  evaluateExecutabilityAndOutcomeV2,
  type ExecutabilityOutcomeFrameV2,
  type ExecutabilityOutcomeV2Result,
} from "./executabilityOutcome.js";

export interface ExecutionReceiptV2 {
  readonly receiptId: string;
  readonly executionId: string;
  readonly runtimeVersion: string;
  readonly inputHash: string;
  readonly outputHash: string;
  readonly evidenceHash: string;
  readonly policyVersion: string;
  readonly decisionSummary: string;
  readonly executionTime: string;
  readonly deterministicHash: string;
}

export interface ReceiptMaterializationFrameV2 {
  readonly kind: "RECEIPT_MATERIALIZATION_V2";
  readonly executabilityOutcomeFrame: ExecutabilityOutcomeFrameV2;
  readonly executionReceipt: ExecutionReceiptV2;
}

export type ReceiptMaterializationV2Success = {
  readonly ok: true;
  readonly frame: ReceiptMaterializationFrameV2;
};

export type ReceiptMaterializationV2ErrorCode =
  | "RECEIPT_INPUT_HASH_CONTINUITY_FAILED"
  | "RECEIPT_TEMPORAL_CANONICALIZATION_FAILED"
  | "RECEIPT_EVIDENCE_MATERIALIZATION_FAILED"
  | "RECEIPT_DECISION_SUMMARY_MATERIALIZATION_FAILED"
  | "RECEIPT_CRYPTOGRAPHIC_MATERIALIZATION_FAILED";

export type ReceiptMaterializationV2Failure = {
  readonly ok: false;
  readonly stage: "RECEIPT_MATERIALIZATION";
  readonly error: {
    readonly code: ReceiptMaterializationV2ErrorCode;
    readonly message: string;
  };
};

export type ExecutabilityOutcomeV2FailureResult = Exclude<
  ExecutabilityOutcomeV2Result,
  { readonly ok: true }
>;

export type ReceiptMaterializationV2Result =
  | ReceiptMaterializationV2Success
  | ReceiptMaterializationV2Failure
  | ExecutabilityOutcomeV2FailureResult;

/**
 * Recursively freezes an object graph in-place.
 */
function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Object.isFrozen(obj)) {
    return obj;
  }
  Object.freeze(obj);
  const keys = Reflect.ownKeys(obj as object);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const val = Reflect.get(obj as object, key);
    if (val !== null && typeof val === "object") {
      deepFreeze(val);
    }
  }
  return obj;
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === "object" && !Array.isArray(val);
}

/**
 * Constructs a bounded JCS canonical string representation of the POL Aggregate Policy Result.
 * If no POL Aggregate determination exists, returns '{"status":"NOT_PRODUCED"}'.
 */
function constructDecisionSummary(
  policyAggregate: OwnerDeterminationBindingV2 | null,
): { ok: true; summaryString: string } | { ok: false; message: string } {
  if (policyAggregate === null) {
    const canonRes = canonicalizeReceiptDecisionSummaryV2({
      status: "NOT_PRODUCED",
    });
    if (!canonRes.ok) {
      return { ok: false, message: canonRes.error.message };
    }
    return { ok: true, summaryString: canonRes.value };
  }

  const res = policyAggregate.ownerNativeResult;
  if (!isPlainObject(res) || typeof res.aggregateResult !== "string") {
    return {
      ok: false,
      message: "POL Aggregate ownerNativeResult is missing aggregateResult",
    };
  }

  const aggregateResult = res.aggregateResult;
  if (
    aggregateResult !== "ALLOW" &&
    aggregateResult !== "DENY" &&
    aggregateResult !== "INDETERMINATE"
  ) {
    return {
      ok: false,
      message: `Invalid POL aggregateResult value: '${aggregateResult}'`,
    };
  }

  const summaryObj = {
    status: "PRODUCED",
    aggregateResult,
    determinationBindingKey: policyAggregate.determinationBindingKey,
    questionSemanticRef:
      policyAggregate.determinationQuestionBinding.questionSemanticRef,
    constitutionalOwnerRef: policyAggregate.constitutionalOwnerRef,
    exactStateRef: policyAggregate.exactStateRef,
    exactRuleRef: policyAggregate.exactRuleRef,
    assessedAtCoordinateRef: policyAggregate.assessedAtCoordinateRef,
    provenanceRef: policyAggregate.provenanceRef,
  };

  const canonRes = canonicalizeReceiptDecisionSummaryV2(summaryObj);
  if (!canonRes.ok) {
    return { ok: false, message: canonRes.error.message };
  }

  return { ok: true, summaryString: canonRes.value };
}

/**
 * Native V2 Runtime capability that delegates first to V2-08,
 * preserves predecessor failures unchanged, and materializes the exact ten-field
 * constitutional V2 ExecutionReceipt under JCS + UTF-8 + SHA-256.
 */
export function materializeExecutionReceiptV2(
  input: unknown,
): ReceiptMaterializationV2Result {
  // Step 1 — Predecessor delegation (V2-08)
  const v208Result = evaluateExecutabilityAndOutcomeV2(input);
  if (!v208Result.ok) {
    return v208Result;
  }

  const executabilityOutcomeFrame = v208Result.frame;
  const ownerIntegrationFrame = executabilityOutcomeFrame.ownerIntegrationFrame;
  const productionFrame = ownerIntegrationFrame.productionFrame;
  const executionRequest = productionFrame.executionRequest;

  // Step 2 — Verify V2 input digest continuity
  const rederivedDigestRes = deriveExecutionRequestV2DigestCandidate(
    productionFrame.executionRequest,
  );
  if (
    !rederivedDigestRes.ok ||
    rederivedDigestRes.value !== productionFrame.wholeRequestDigestCandidate
  ) {
    return {
      ok: false,
      stage: "RECEIPT_MATERIALIZATION",
      error: {
        code: "RECEIPT_INPUT_HASH_CONTINUITY_FAILED",
        message:
          "Defensive re-derivation of whole-request digest candidate failed or mismatched predecessor",
      },
    };
  }

  const inputHash = productionFrame.wholeRequestDigestCandidate;
  const executionId = executionRequest.executionContext.executionId;
  const runtimeVersion = "2.0.0";
  const policyVersion = executionRequest.policyUniverse.policyUniverseRef;

  // Step 3 — Temporal canonicalization for executionTime
  const rawTeInput =
    executionRequest.executionContext.temporalCoordinates.tEInput;
  const normTimeRes = normalizeTemporalCoordinateV2(
    rawTeInput,
    "executionContext.temporalCoordinates.tEInput",
  );
  if (!normTimeRes.ok) {
    return {
      ok: false,
      stage: "RECEIPT_MATERIALIZATION",
      error: {
        code: "RECEIPT_TEMPORAL_CANONICALIZATION_FAILED",
        message: `Temporal canonicalization of tEInput failed: ${normTimeRes.error.message}`,
      },
    };
  }
  const executionTime = normTimeRes.value;

  // Step 4 — Evidence hash derivation
  const evidenceProjRes = getEvidenceStateIdentityProjectionV2(
    executionRequest.evidenceState,
  );
  if (!evidenceProjRes.ok) {
    return {
      ok: false,
      stage: "RECEIPT_MATERIALIZATION",
      error: {
        code: "RECEIPT_EVIDENCE_MATERIALIZATION_FAILED",
        message: `Evidence state projection failed: ${evidenceProjRes.error.message}`,
      },
    };
  }

  const evidenceHashRes = deriveReceiptEvidenceHashV2(evidenceProjRes.value);
  if (!evidenceHashRes.ok) {
    return {
      ok: false,
      stage: "RECEIPT_MATERIALIZATION",
      error: {
        code: "RECEIPT_EVIDENCE_MATERIALIZATION_FAILED",
        message: `Evidence hash derivation failed: ${evidenceHashRes.error.message}`,
      },
    };
  }
  const evidenceHash = evidenceHashRes.value;

  // Step 5 — Output hash derivation
  const outputMaterial = {
    executability: executabilityOutcomeFrame.executability,
    outcome: executabilityOutcomeFrame.outcome,
  };
  const outputHashRes = deriveExecutionOutputHashV2(outputMaterial);
  if (!outputHashRes.ok) {
    return {
      ok: false,
      stage: "RECEIPT_MATERIALIZATION",
      error: {
        code: "RECEIPT_CRYPTOGRAPHIC_MATERIALIZATION_FAILED",
        message: `Output hash derivation failed: ${outputHashRes.error.message}`,
      },
    };
  }
  const outputHash = outputHashRes.value;

  // Step 6 — Decision summary materialization
  const decisionSummaryRes = constructDecisionSummary(
    executabilityOutcomeFrame.ownerResults.policyAggregate,
  );
  if (!decisionSummaryRes.ok) {
    return {
      ok: false,
      stage: "RECEIPT_MATERIALIZATION",
      error: {
        code: "RECEIPT_DECISION_SUMMARY_MATERIALIZATION_FAILED",
        message: decisionSummaryRes.message,
      },
    };
  }
  const decisionSummary = decisionSummaryRes.summaryString;

  // Step 7 — Derivation of receiptId
  const receiptIdPreimage = {
    executionId,
    runtimeVersion,
    inputHash,
    outputHash,
    evidenceHash,
    policyVersion,
    decisionSummary,
    executionTime,
  };
  const receiptIdRes = deriveReceiptIdV2(receiptIdPreimage);
  if (!receiptIdRes.ok) {
    return {
      ok: false,
      stage: "RECEIPT_MATERIALIZATION",
      error: {
        code: "RECEIPT_CRYPTOGRAPHIC_MATERIALIZATION_FAILED",
        message: `Receipt ID derivation failed: ${receiptIdRes.error.message}`,
      },
    };
  }
  const receiptId = receiptIdRes.value;

  // Step 8 — Derivation of deterministicHash
  const deterministicHashPreimage = {
    receiptId,
    executionId,
    runtimeVersion,
    inputHash,
    outputHash,
    evidenceHash,
    policyVersion,
    decisionSummary,
    executionTime,
  };
  const deterministicHashRes = deriveReceiptDeterministicHashV2(
    deterministicHashPreimage,
  );
  if (!deterministicHashRes.ok) {
    return {
      ok: false,
      stage: "RECEIPT_MATERIALIZATION",
      error: {
        code: "RECEIPT_CRYPTOGRAPHIC_MATERIALIZATION_FAILED",
        message: `Deterministic hash derivation failed: ${deterministicHashRes.error.message}`,
      },
    };
  }
  const deterministicHash = deterministicHashRes.value;

  // Step 9 — Materialize exact ten-field ExecutionReceiptV2
  const executionReceipt: ExecutionReceiptV2 = {
    receiptId,
    executionId,
    runtimeVersion,
    inputHash,
    outputHash,
    evidenceHash,
    policyVersion,
    decisionSummary,
    executionTime,
    deterministicHash,
  };

  // Step 10 — Construct frame and deep-freeze
  const frame: ReceiptMaterializationFrameV2 = deepFreeze({
    kind: "RECEIPT_MATERIALIZATION_V2",
    executabilityOutcomeFrame,
    executionReceipt: deepFreeze(executionReceipt),
  });

  return deepFreeze({
    ok: true,
    frame,
  });
}

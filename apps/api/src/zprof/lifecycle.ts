import {
  canonicalizeJcs,
  cleanForJcs,
  computeSha256,
  validateExecutionReceipt,
  validateExecutionRequest,
  type ExecutionReceipt,
  type ExecutionRequest,
  type PolicyContext,
  type ResolvedPolicyGraph,
} from "@zyppi/domain";
import { runInternalPipeline } from "@zyppi/runtime/dist/pipeline.js";
import type { PipelineResult } from "@zyppi/runtime/dist/types.js";
import { validateEvaluationCoordinatePayload } from "./ec.js";
import type {
  AssessmentRequestCoordinate,
  AssessmentResult,
  AssessmentResultOutcome,
  BoundConstitutionalPayload,
  CompositionError,
  CurrentlyAdmissibleDetermination,
  CurrentlyTrustedDetermination,
  EvaluationCoordinate,
  ExecutableDetermination,
  HistoricalProvenanceLink,
  MapEcToExecutionRequestOptions,
  ReceiptVerificationDetails,
  ReceiptVerificationResult,
  ReproducibleDetermination,
} from "./types.js";

/**
 * Mechanically maps a validated EvaluationCoordinate (EC) and its BoundConstitutionalPayload
 * into an existing RI ExecutionRequest per AMS-0860-C §10 / CORR-0860-C-1 §1–§3.
 *
 * Laws:
 * 1. Mechanical adapter: performs NO version resolution, NO Registry queries, NO SEC/POL lookups, NO ambient clock reads.
 * 2. T_e_input Integrity (CORR-0860-C-1 §1): NO fallback! tEInput MUST be explicitly present on EvaluationCoordinate.
 * 3. Context Non-Synthesis (CORR-0860-C-1 §2): NO synthesis of PolicyContext from ACV.boundContext must map structurally to PolicyContext.
 * 4. Evaluation-Input Closure (CORR-0860-C-1 §3): budget, entropy, and versions are extracted directly from boundPayload.executionContext.
 */
export function mapEvaluationCoordinateToExecutionRequest(
  options: MapEcToExecutionRequestOptions,
):
  | { readonly ok: true; readonly executionRequest: ExecutionRequest }
  | { readonly ok: false; readonly error: CompositionError } {
  const { coordinate, boundPayload, requestId, executionId } = options;

  // 1. EC Completeness Check before RI
  const ecValidation = validateEvaluationCoordinatePayload(
    coordinate,
    "coordinate",
  );
  if (!ecValidation.ok) {
    return {
      ok: false,
      error: ecValidation.error,
    };
  }

  // 2. Strict T_e_input Enforcement (CORR-0860-C-1 §1 — No Fallback!)
  const explicitTEInput = coordinate.temporalCoordinates.tEInput;
  if (
    !explicitTEInput ||
    typeof explicitTEInput !== "string" ||
    explicitTEInput.trim().length === 0
  ) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message:
          "Required T_e_input (tEInput) is absent from EvaluationCoordinate.",
      },
    };
  }

  // 3. Strict PolicyContext Structural Verification (CORR-0860-C-1 §2 — No Synthesis from ACV!)
  const rawContext = coordinate.boundContext;
  let policyContext: PolicyContext;
  if (
    rawContext &&
    typeof rawContext === "object" &&
    "policies" in rawContext &&
    Array.isArray((rawContext as Record<string, unknown>).policies)
  ) {
    policyContext = rawContext as unknown as PolicyContext;
  } else {
    return {
      ok: false,
      error: {
        code: "incompatible",
        category: "Composition Failure",
        message:
          "boundContext does not structurally contain a valid PolicyContext policies collection.",
      },
    };
  }

  // 4. Extract Evaluation-Effective Execution Parameters strictly from BoundPayload (CORR-0860-C-1 §3)
  const boundContext = boundPayload.executionContext;
  const resolvedPolicyGraph: ResolvedPolicyGraph =
    options.resolvedPolicyGraph ?? { edges: [] };

  // 5. Construct candidate ExecutionRequest
  const candidateRequest: unknown = {
    requestId,
    identity: boundPayload.resolvedActiveConstitutionalView.identity,
    activeConstitutionalView: boundPayload.resolvedActiveConstitutionalView,
    evidenceBundle: boundPayload.resolvedEvidenceBundle,
    policyContext,
    executionContext: {
      executionId,
      constitutionalTimestamp: explicitTEInput,
      budget: boundContext.budget,
      entropy: boundContext.entropy,
      versions: boundContext.versions,
    },
    resolvedPolicyGraph,
  };

  // 6. Structural validation via @zyppi/domain validator
  const reqValidation = validateExecutionRequest(candidateRequest);
  if (!reqValidation.ok) {
    return {
      ok: false,
      error: {
        code: "incompatible",
        category: "Composition Failure",
        message: `EvaluationCoordinate cannot map to required RI input: ${reqValidation.error.message}`,
      },
    };
  }

  return {
    ok: true,
    executionRequest: reqValidation.value,
  };
}

/**
 * Invokes the existing RI execution seam for an EvaluationCoordinate per AMS-0860-C §2 / CORR-0860-C-1 §10–§11.
 * Captures T_e_observed separately from T_e_input and constructs a HistoricalProvenanceLink
 * binding the resulting ExecutionReceipt to sccId, bcgId, inputHash, evidenceHash, and EC at the Application layer.
 */
export async function executeEvaluationCoordinate(options: {
  readonly coordinate: EvaluationCoordinate;
  readonly boundPayload: BoundConstitutionalPayload;
  readonly requestId: string;
  readonly executionId: string;
  readonly resolvedPolicyGraph?: ResolvedPolicyGraph;
  readonly evidencePayloads?: ReadonlyMap<string, unknown>;
  readonly overrides?: import("@zyppi/runtime/dist/types.js").StageOverrideConfig;
}): Promise<
  | {
      readonly ok: true;
      readonly pipelineResult: PipelineResult;
      readonly executionRequest: ExecutionRequest;
      readonly provenanceLink?: HistoricalProvenanceLink;
      readonly observedExecutionTime?: string;
    }
  | {
      readonly ok: false;
      readonly error: CompositionError;
    }
> {
  const mapRes = mapEvaluationCoordinateToExecutionRequest({
    coordinate: options.coordinate,
    boundPayload: options.boundPayload,
    requestId: options.requestId,
    executionId: options.executionId,
    resolvedPolicyGraph: options.resolvedPolicyGraph,
  });

  if (!mapRes.ok) {
    return mapRes;
  }

  const executionRequest = mapRes.executionRequest;

  // Execute through existing pure Runtime entrypoint
  const pipelineResult = runInternalPipeline(
    executionRequest,
    options.overrides,
    options.evidencePayloads,
  );

  if (!pipelineResult.ok) {
    return {
      ok: true,
      pipelineResult,
      executionRequest,
    };
  }

  // Capture T_e_observed from actual runtime execution fact
  let observedExecutionTime: string | undefined;
  let provenanceLink: HistoricalProvenanceLink | undefined;

  if (pipelineResult.outcome.kind === "materialized") {
    const executionOutput = pipelineResult.outcome.executionOutput;
    const rcpt = executionOutput.executionReceipt;

    // Convert numeric execution time back to ISO-8601 UTC string for observed time representation
    observedExecutionTime = new Date(rcpt.executionTime).toISOString();

    const frozenReceipt = Object.freeze({ ...rcpt });

    // Provenance link carries exact execution input digests (inputHash, evidenceHash) without fake createdTimestamp (CORR-0860-C-1 §10–§11)
    provenanceLink = Object.freeze({
      receiptId: frozenReceipt.receiptId,
      executionId: frozenReceipt.executionId,
      sccId: options.coordinate.sccId,
      bcgId: options.coordinate.bcgId,
      inputHash: frozenReceipt.inputHash,
      evidenceHash: frozenReceipt.evidenceHash,
      coordinate: options.coordinate,
      executionReceipt: frozenReceipt,
      observedExecutionTime,
    });
  }

  return {
    ok: true,
    pipelineResult,
    executionRequest,
    provenanceLink,
    observedExecutionTime,
  };
}

/**
 * Verifies the structural and cryptographic binding of an ExecutionReceipt per AMS-0860-C §20 / CORR-0860-C-1 §4–§5.
 * Operates purely offline without mutating historical receipts, fabricating preimages, or claiming full verification when preimages are absent.
 */
export function verifyExecutionReceiptIntegrity(
  receipt: unknown,
  executionRequest?: ExecutionRequest,
): ReceiptVerificationResult {
  // 1. Structural validation
  const valRes = validateExecutionReceipt(receipt);
  if (!valRes.ok) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message: `ExecutionReceipt structural validation failed: ${valRes.error.message}`,
      },
    };
  }

  const rcpt = valRes.value;

  // 2. Cryptographic binding verification against ExecutionRequest if supplied
  let inputBindingStatus: "VERIFIED" | "MISMATCH" | "UNAVAILABLE" =
    "UNAVAILABLE";
  let evidenceBindingStatus: "VERIFIED" | "MISMATCH" | "UNAVAILABLE" =
    "UNAVAILABLE";

  if (executionRequest) {
    const expectedInputHash = computeSha256(
      "zyppi:domain:input:v1:" + canonicalizeJcs(cleanForJcs(executionRequest)),
    );
    const expectedEvidenceHash = computeSha256(
      "zyppi:domain:evidence:v1:" +
        canonicalizeJcs(cleanForJcs(executionRequest.evidenceBundle)),
    );

    inputBindingStatus =
      rcpt.inputHash === expectedInputHash ? "VERIFIED" : "MISMATCH";
    evidenceBindingStatus =
      rcpt.evidenceHash === expectedEvidenceHash ? "VERIFIED" : "MISMATCH";
  }

  const verification: ReceiptVerificationDetails = Object.freeze({
    structuralValidity: true,
    inputBinding: inputBindingStatus,
    evidenceBinding: evidenceBindingStatus,
    fullReceiptIntegrity: "UNAVAILABLE", // Full receipt integrity requires complete historical execution preimages (CORR-0860-C-1 §5)
  });

  return {
    ok: true,
    verification,
    receiptId: rcpt.receiptId,
    deterministicHash: rcpt.deterministicHash,
    details: executionRequest
      ? "Receipt input and evidence bindings verified against supplied ExecutionRequest."
      : "Receipt structurally valid; full input binding requires ExecutionRequest preimage.",
  };
}

/**
 * Evaluates a 4-Dimensional Assessment Request Coordinate (ARC) per AMS-0860-C §24–§30 / CORR-0860-C-1 §6–§9.
 * Preserves four independent determinations with explicit authority provenance without defaulting absence of authority output to false.
 */
export function evaluateAssessmentRequest(options: {
  readonly arc: AssessmentRequestCoordinate;
  readonly historicalCoordinate?: EvaluationCoordinate;
  readonly executionReceipt?: ExecutionReceipt;
  readonly executionRequest?: ExecutionRequest;
  readonly authorityOutputs?: {
    readonly executable?: {
      readonly value: boolean;
      readonly authorityRef: string;
      readonly details?: string;
    };
    readonly currentlyTrusted?: {
      readonly value: boolean;
      readonly authorityRef: string;
      readonly details?: string;
    };
    readonly currentlyAdmissible?: {
      readonly value: boolean;
      readonly authorityRef: string;
      readonly details?: string;
    };
  };
}): AssessmentResultOutcome {
  const {
    arc,
    historicalCoordinate,
    executionReceipt,
    executionRequest,
    authorityOutputs,
  } = options;

  const stateRef = arc.pinnedAssessmentStateRef;
  const ruleRef =
    arc.applicableAssessmentRules && arc.applicableAssessmentRules.length > 0
      ? arc.applicableAssessmentRules[0]
      : undefined;

  // 1. Reproducible determination (Grounded in historical material presence, CORR-0860-C-1 §6)
  let reproducible: ReproducibleDetermination;

  if (
    historicalCoordinate ||
    (arc.target.kind === "EVALUATION_COORDINATE" && arc.target.coordinate)
  ) {
    const targetCoord =
      historicalCoordinate ??
      (arc.target.kind === "EVALUATION_COORDINATE"
        ? arc.target.coordinate
        : undefined);
    if (targetCoord) {
      const payloadVal = validateEvaluationCoordinatePayload(targetCoord);
      if (payloadVal.ok) {
        reproducible = Object.freeze({
          status: "DETERMINED",
          value: true,
          stateRef,
          ruleRef,
          assessedAtCoordinate: arc.tTrust,
          details:
            "Complete historical evaluation coordinate available and structurally valid.",
        });
      } else {
        reproducible = Object.freeze({
          status: "UNAVAILABLE",
          reason: `Historical evaluation coordinate structurally invalid: ${payloadVal.error.message}`,
        });
      }
    } else {
      reproducible = Object.freeze({
        status: "UNAVAILABLE",
        reason: "Target historical evaluation coordinate is absent.",
      });
    }
  } else if (executionReceipt && executionRequest) {
    const rcptVerification = verifyExecutionReceiptIntegrity(
      executionReceipt,
      executionRequest,
    );
    if (
      rcptVerification.ok &&
      rcptVerification.verification.inputBinding === "VERIFIED"
    ) {
      reproducible = Object.freeze({
        status: "DETERMINED",
        value: true,
        stateRef,
        ruleRef,
        assessedAtCoordinate: arc.tTrust,
        details:
          "Execution receipt and input request cryptographically verified.",
      });
    } else {
      reproducible = Object.freeze({
        status: "UNAVAILABLE",
        reason:
          "Execution receipt input binding verification failed or unavailable.",
      });
    }
  } else {
    reproducible = Object.freeze({
      status: "UNAVAILABLE",
      reason: "Required historical material or coordinate is unavailable.",
    });
  }

  // 2. Executable determination (Sourced strictly from RI / admission authority, CORR-0860-C-1 §7–§8)
  let executable: ExecutableDetermination;
  if (authorityOutputs?.executable) {
    executable = Object.freeze({
      status: "DETERMINED",
      value: authorityOutputs.executable.value,
      authorityRef: authorityOutputs.executable.authorityRef,
      stateRef,
      ruleRef,
      assessedAtCoordinate: arc.tTrust,
      details: authorityOutputs.executable.details,
    });
  } else {
    executable = Object.freeze({
      status: "UNAVAILABLE",
      reason: "No governed RI admission authority output provided.",
    });
  }

  // 3. CurrentlyTrusted determination (Sourced strictly from SEC / trust authority, CORR-0860-C-1 §7–§8)
  let currentlyTrusted: CurrentlyTrustedDetermination;
  if (authorityOutputs?.currentlyTrusted) {
    currentlyTrusted = Object.freeze({
      status: "DETERMINED",
      value: authorityOutputs.currentlyTrusted.value,
      authorityRef: authorityOutputs.currentlyTrusted.authorityRef,
      stateRef,
      ruleRef,
      assessedAtCoordinate: arc.tTrust,
      details: authorityOutputs.currentlyTrusted.details,
    });
  } else {
    currentlyTrusted = Object.freeze({
      status: "UNAVAILABLE",
      reason: "No governed SEC trust authority output provided.",
    });
  }

  // 4. CurrentlyAdmissible determination (Sourced strictly from POL / policy authority, CORR-0860-C-1 §7–§8)
  let currentlyAdmissible: CurrentlyAdmissibleDetermination;
  if (authorityOutputs?.currentlyAdmissible) {
    currentlyAdmissible = Object.freeze({
      status: "DETERMINED",
      value: authorityOutputs.currentlyAdmissible.value,
      authorityRef: authorityOutputs.currentlyAdmissible.authorityRef,
      stateRef,
      ruleRef,
      assessedAtCoordinate: arc.tTrust,
      details: authorityOutputs.currentlyAdmissible.details,
    });
  } else {
    currentlyAdmissible = Object.freeze({
      status: "UNAVAILABLE",
      reason: "No governed POL policy authority output provided.",
    });
  }

  const assessment: AssessmentResult = Object.freeze({
    reproducible,
    executable,
    currentlyTrusted,
    currentlyAdmissible,
    arc,
  });

  return {
    ok: true,
    assessment,
  };
}

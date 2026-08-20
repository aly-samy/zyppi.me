import {
  generateReceiptHashes,
  validateExecutionReceipt,
  validateExecutionRequest,
  type ExecutionReceipt,
  type ExecutionRequest,
  type Outcome,
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
  ReceiptVerificationResult,
  ReproducibleDetermination,
} from "./types.js";

/**
 * Mechanically maps a validated EvaluationCoordinate (EC) and its BoundConstitutionalPayload
 * into an existing RI ExecutionRequest per AMS-0860-C §10.
 *
 * Laws:
 * - Mechanical adapter: performs NO version resolution, NO Registry queries, NO SEC/POL lookups, NO ambient clock reads.
 * - Enforces EC completeness before RI: incomplete ECs fail closed immediately.
 * - Preserves explicit T_e_input as constitutionalTimestamp when supplied.
 */
export function mapEvaluationCoordinateToExecutionRequest(
  options: MapEcToExecutionRequestOptions,
):
  | { readonly ok: true; readonly executionRequest: ExecutionRequest }
  | { readonly ok: false; readonly error: CompositionError } {
  const {
    coordinate,
    boundPayload,
    requestId,
    executionId,
    budget,
    entropy,
    versions,
    resolvedPolicyGraph,
  } = options;

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

  // Determine T_e_input: explicit evaluation time input from coordinate or bound payload
  const explicitTEInput =
    coordinate.temporalCoordinates.tEInput ??
    boundPayload.executionContext.constitutionalTimestamp;

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
          "Required T_e_input (constitutionalTimestamp) is absent from EvaluationCoordinate and bound payload.",
      },
    };
  }

  // 2. Map directly into existing RI ExecutionRequest contract
  const candidateRequest: unknown = {
    requestId,
    identity: boundPayload.resolvedActiveConstitutionalView.identity,
    activeConstitutionalView: boundPayload.resolvedActiveConstitutionalView,
    evidenceBundle: boundPayload.resolvedEvidenceBundle,
    policyContext:
      "policies" in coordinate.boundContext &&
      Array.isArray(coordinate.boundContext.policies)
        ? coordinate.boundContext
        : {
            policies:
              boundPayload.resolvedActiveConstitutionalView.applicablePolicies,
          },
    executionContext: {
      executionId,
      constitutionalTimestamp: explicitTEInput,
      budget,
      entropy,
      versions,
    },
    resolvedPolicyGraph,
  };

  // 3. Structural validation via @zyppi/domain validator
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
 * Invokes the existing RI execution seam for an EvaluationCoordinate per AMS-0860-C §2.
 * Captures T_e_observed separately from T_e_input and constructs a HistoricalProvenanceLink
 * binding the resulting ExecutionReceipt to sccId, bcgId, and EC at the Application layer.
 */
export async function executeEvaluationCoordinate(options: {
  readonly coordinate: EvaluationCoordinate;
  readonly boundPayload: BoundConstitutionalPayload;
  readonly requestId: string;
  readonly executionId: string;
  readonly budget: number;
  readonly entropy: string;
  readonly versions: readonly string[];
  readonly resolvedPolicyGraph: import("@zyppi/domain").ResolvedPolicyGraph;
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
    budget: options.budget,
    entropy: options.entropy,
    versions: options.versions,
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

    provenanceLink = Object.freeze({
      receiptId: frozenReceipt.receiptId,
      executionId: frozenReceipt.executionId,
      sccId: options.coordinate.sccId,
      bcgId: options.coordinate.bcgId,
      coordinate: options.coordinate,
      executionReceipt: frozenReceipt,
      observedExecutionTime,
      createdTimestamp: observedExecutionTime,
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
 * Verifies the structural and cryptographic integrity of an ExecutionReceipt per AMS-0860-C §20.
 * Operates purely offline without mutating historical receipts, querying Registry, or evaluating current trust/admissibility.
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

  // 2. Cryptographic verification against ExecutionRequest if supplied
  if (executionRequest) {
    let outcomeStr: Outcome = "unverified";
    if (rcpt.decisionSummary.includes('"aggregateResult":"authorized"')) {
      outcomeStr = "verified";
    } else if (rcpt.decisionSummary.includes('"aggregateResult":"denied"')) {
      outcomeStr = "rejected";
    }

    const computedHashes = generateReceiptHashes(
      executionRequest,
      outcomeStr,
      { trustStatus: "definite", degradationFactors: [] },
      [],
      [],
      rcpt.policyVersion,
      rcpt.executionTime,
      rcpt.executionId,
      rcpt.runtimeVersion,
    );

    const hashesMatch =
      rcpt.inputHash === computedHashes.inputHash &&
      rcpt.evidenceHash === computedHashes.evidenceHash;

    if (!hashesMatch) {
      return {
        ok: true,
        verified: false,
        receiptId: rcpt.receiptId,
        deterministicHash: rcpt.deterministicHash,
        details: "Receipt hash mismatch against supplied ExecutionRequest.",
      };
    }
  }

  return {
    ok: true,
    verified: true,
    receiptId: rcpt.receiptId,
    deterministicHash: rcpt.deterministicHash,
  };
}

/**
 * Evaluates a 4-Dimensional Assessment Request Coordinate (ARC) per AMS-0860-C §24–§30.
 * Preserves four independent determinations with explicit authority provenance without collapsing into a single status.
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

  const assessedAtCoordinate = arc.tTrust;
  const stateRef = arc.pinnedAssessmentStateRef;
  const ruleRef =
    arc.applicableAssessmentRules && arc.applicableAssessmentRules.length > 0
      ? arc.applicableAssessmentRules[0]
      : undefined;

  // 1. Reproducible determination
  let reproducibleVal = false;
  let reproducibleDetails =
    "Historical coordinate or required dependencies unavailable.";

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
        reproducibleVal = true;
        reproducibleDetails =
          "Complete historical evaluation coordinate available and structurally valid.";
      } else {
        reproducibleDetails = `Historical evaluation coordinate structurally invalid: ${payloadVal.error.message}`;
      }
    }
  } else if (executionReceipt && executionRequest) {
    const rcptVerification = verifyExecutionReceiptIntegrity(
      executionReceipt,
      executionRequest,
    );
    if (rcptVerification.ok && rcptVerification.verified) {
      reproducibleVal = true;
      reproducibleDetails =
        "Execution receipt and input request cryptographically verified.";
    }
  }

  const reproducible: ReproducibleDetermination = Object.freeze({
    value: reproducibleVal,
    authorityRef: "authority:zprof:reproducibility",
    stateRef,
    ruleRef,
    assessedAtCoordinate,
    details: reproducibleDetails,
  });

  // 2. Executable determination (Sourced strictly from RI / admission authority)
  const execAuth = authorityOutputs?.executable;
  const executable: ExecutableDetermination = Object.freeze({
    value: execAuth ? execAuth.value : false,
    authorityRef: execAuth ? execAuth.authorityRef : "authority:ri:admission",
    stateRef,
    ruleRef,
    assessedAtCoordinate,
    details:
      execAuth?.details ??
      (execAuth
        ? "Evaluated against RI admission authority."
        : "No explicit RI admission authority output provided."),
  });

  // 3. CurrentlyTrusted determination (Sourced strictly from SEC / trust authority)
  const trustAuth = authorityOutputs?.currentlyTrusted;
  const currentlyTrusted: CurrentlyTrustedDetermination = Object.freeze({
    value: trustAuth ? trustAuth.value : false,
    authorityRef: trustAuth ? trustAuth.authorityRef : "authority:sec:trust",
    stateRef,
    ruleRef,
    assessedAtCoordinate,
    details:
      trustAuth?.details ??
      (trustAuth
        ? "Evaluated against SEC trust authority."
        : "No explicit SEC trust authority output provided."),
  });

  // 4. CurrentlyAdmissible determination (Sourced strictly from POL / policy authority)
  const admAuth = authorityOutputs?.currentlyAdmissible;
  const currentlyAdmissible: CurrentlyAdmissibleDetermination = Object.freeze({
    value: admAuth ? admAuth.value : false,
    authorityRef: admAuth
      ? admAuth.authorityRef
      : "authority:pol:admissibility",
    stateRef,
    ruleRef,
    assessedAtCoordinate,
    details:
      admAuth?.details ??
      (admAuth
        ? "Evaluated against POL policy authority."
        : "No explicit POL policy authority output provided."),
  });

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

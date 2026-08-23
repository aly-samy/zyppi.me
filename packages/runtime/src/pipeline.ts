import {
  validateExecutionRequest,
  verifyEvidenceBundle,
  validateExecutionReceipt,
  generateReceiptHashes,
} from "@zyppi/domain";
import type { ExecutionContext, Outcome } from "@zyppi/domain";
import type {
  LifecycleStage,
  PipelineResult,
  PipelineError,
  StageOverrideConfig,
  TrustStatus,
  TrustResult,
  ExecutionOutput,
} from "./types.js";
import {
  materializeResolutionGraph,
  evaluatePolicies,
  type ExecutionSequence,
  type PolicyDecision,
} from "./evaluator.js";

export function runInternalPipeline(
  input: unknown,
  overrides?: StageOverrideConfig,
  evidencePayloads?: ReadonlyMap<string, unknown>,
): PipelineResult {
  const trace: LifecycleStage[] = [];
  let retainedStatus: "authorized" | "denied" | "unavailable" =
    "unavailable" as "authorized" | "denied" | "unavailable";

  // Helper function to handle a stage traversal for post-Admission stages
  function executePostAdmissionStage(
    stage: LifecycleStage,
    performAction: (
      context: ExecutionContext,
    ) => { ok: true } | { ok: false; code: string; message: string },
    context: ExecutionContext,
  ): { ok: true } | { ok: false; error: PipelineError } {
    trace.push(stage);

    // Apply internal test instrumentation overrides if provided
    if (overrides && overrides[stage]) {
      const stageOverride = overrides[stage];
      if (stageOverride.ok) {
        return { ok: true };
      } else {
        return {
          ok: false,
          error: {
            stage,
            code: stageOverride.code,
            message: stageOverride.message,
          },
        };
      }
    }

    // Default execution logic
    const result = performAction(context);
    if (result.ok) {
      return { ok: true };
    } else {
      return {
        ok: false,
        error: {
          stage,
          code: result.code,
          message: result.message,
        },
      };
    }
  }

  // 1. Admission
  trace.push("Admission");

  // Perform structural validation using the audited domain validator first
  const validation = validateExecutionRequest(input);
  if (!validation.ok) {
    return {
      ok: false,
      error: {
        stage: "Admission",
        code: "INVALID_EXECUTION_REQUEST",
        message: validation.error.message,
      },
      trace,
    };
  }

  // Authoritative context extraction
  const executionRequest = validation.value;
  const context = executionRequest.executionContext;
  const policyContext = executionRequest.policyContext;

  if (overrides && overrides["Admission"]) {
    const stageOverride = overrides["Admission"];
    if (!stageOverride.ok) {
      return {
        ok: false,
        error: {
          stage: "Admission",
          code: stageOverride.code,
          message: stageOverride.message,
        },
        trace,
      };
    }
  }

  type StageAction = (
    context: ExecutionContext,
  ) => { ok: true } | { ok: false; code: string; message: string };

  // Helper to standardise failing subsequent unimplemented stages
  function makeUnimplementedAction(stageName: string): StageAction {
    if (stageName === "Receipt Generation") {
      return () => ({ ok: true });
    }
    return () => ({
      ok: false,
      code: `${stageName.toUpperCase().replace(/\s+/g, "_")}_UNAVAILABLE`,
      message: `Substantive ${stageName.toLowerCase()} implementation is not available.`,
    });
  }

  // 2. Bundle Discovery
  const discoveryRes = executePostAdmissionStage(
    "Bundle Discovery",
    () => {
      const required =
        executionRequest.activeConstitutionalView.evidenceReferences;
      const supplied = executionRequest.evidenceBundle.evidenceRecords;

      const suppliedSet = new Set(supplied.map((rec) => rec.evidenceId));
      const missingIds: string[] = [];

      for (const reqRec of required) {
        if (!suppliedSet.has(reqRec.evidenceId)) {
          missingIds.push(reqRec.evidenceId);
        }
      }

      if (missingIds.length > 0) {
        missingIds.sort();
        return {
          ok: false,
          code: "BUNDLE_DISCOVERY_MISSING_REQUIRED_MATERIAL",
          message: `Missing required evidence material: ${missingIds.join(", ")}`,
        };
      }

      return { ok: true };
    },
    context,
  );
  if (!discoveryRes.ok) {
    return { ok: false, error: discoveryRes.error, trace };
  }

  // 3. Bundle Verification
  const verificationRes = executePostAdmissionStage(
    "Bundle Verification",
    () => {
      const payloads = evidencePayloads ?? new Map<string, unknown>();
      const report = verifyEvidenceBundle(
        executionRequest.evidenceBundle,
        payloads,
      );

      if (report.isValid) {
        return { ok: true };
      }

      if (report.errorCode === "BUNDLE_LIMIT_EXCEEDED") {
        return {
          ok: false,
          code: "BUNDLE_LIMIT_EXCEEDED",
          message: "Evidence bundle exceeds the canonical size limit.",
        };
      }

      const failedRecords = report.records.filter((r) => !r.valid);
      if (failedRecords.length > 0) {
        const sorted = [...failedRecords].sort((a, b) =>
          a.evidenceId < b.evidenceId
            ? -1
            : a.evidenceId > b.evidenceId
              ? 1
              : 0,
        );
        const selected = sorted[0];
        const code = selected.errorCode ?? "BUNDLE_VERIFICATION_FAILED";
        return {
          ok: false,
          code,
          message: `Runtime evidence verification failed: ${code}`,
        };
      }

      return {
        ok: false,
        code: "BUNDLE_VERIFICATION_FAILED",
        message: "Runtime evidence verification failed.",
      };
    },
    context,
  );
  if (!verificationRes.ok) {
    return { ok: false, error: verificationRes.error, trace };
  }

  // 4. Dependency Resolution
  const dependencyRes = executePostAdmissionStage(
    "Dependency Resolution",
    () => ({ ok: true }),
    context,
  );
  if (!dependencyRes.ok) {
    return { ok: false, error: dependencyRes.error, trace };
  }

  // 5. Compatibility Validation
  const compatibilityRes = executePostAdmissionStage(
    "Compatibility Validation",
    makeUnimplementedAction("Compatibility Validation"),
    context,
  );
  if (!compatibilityRes.ok) {
    return { ok: false, error: compatibilityRes.error, trace };
  }

  // 6. ACV Activation
  const acvRes = executePostAdmissionStage(
    "ACV Activation",
    () => {
      if (!executionRequest || !executionRequest.activeConstitutionalView) {
        return {
          ok: false,
          code: "MISSING_ACV",
          message: "Active Constitutional View is missing.",
        };
      }
      return { ok: true };
    },
    context,
  );
  if (!acvRes.ok) {
    return { ok: false, error: acvRes.error, trace };
  }

  let executionSequence: ExecutionSequence | undefined;

  // 7. Resolution Graph Construction
  const resGraphRes = executePostAdmissionStage(
    "Resolution Graph Construction",
    () => {
      const result = materializeResolutionGraph(
        executionRequest.activeConstitutionalView.applicablePolicies,
        executionRequest.resolvedPolicyGraph,
      );
      if (!result.ok) {
        return {
          ok: false,
          code: result.code,
          message: result.message,
        };
      }
      executionSequence = result.sequence;
      return { ok: true };
    },
    context,
  );
  if (!resGraphRes.ok) {
    return { ok: false, error: resGraphRes.error, trace };
  }

  let policyDecisions: readonly PolicyDecision[] = [];
  let evaluatedPolicyVersion = "0.0.0";
  let pipelineDiagnostics: readonly string[] = [];

  // 8. Active Execution
  const activeExecRes = executePostAdmissionStage(
    "Active Execution",
    () => {
      const seq = executionSequence || {
        orderedPolicies:
          executionRequest.activeConstitutionalView.applicablePolicies,
      };
      const result = evaluatePolicies(seq, policyContext, context);

      policyDecisions = result.policyDecisions;
      evaluatedPolicyVersion = result.policyVersion;
      pipelineDiagnostics = result.diagnostics;

      // Update retainedStatus based on aggregate policy result
      if (result.aggregateResult === "ALLOW") {
        retainedStatus = "authorized";
      } else if (result.aggregateResult === "DENY") {
        retainedStatus = "denied";
      } else {
        retainedStatus = "unavailable"; // maps INDETERMINATE to unavailable
      }

      return { ok: true };
    },
    context,
  );
  if (!activeExecRes.ok) {
    return { ok: false, error: activeExecRes.error, trace };
  }

  // 9. Receipt Generation
  const receiptRes = executePostAdmissionStage(
    "Receipt Generation",
    makeUnimplementedAction("Receipt Generation"),
    context,
  );
  if (!receiptRes.ok) {
    return { ok: false, error: receiptRes.error, trace };
  }

  // --- STAGE 9: RECEIPT MATERIALIZATION ---

  // Determine explicit Outcome & TrustResult (allowing testing overrides)
  let outcome: Outcome = overrides?.outcome ?? "unverified";
  let trustStatus: TrustStatus =
    overrides?.trustResult?.trustStatus ?? "speculative";
  let degradationFactors: readonly string[] =
    overrides?.trustResult?.degradationFactors ?? [];

  if (!overrides?.outcome) {
    if (retainedStatus === "authorized") {
      outcome = "verified";
    } else if (retainedStatus === "denied") {
      outcome = "rejected";
    } else {
      outcome = "unverified";
    }
  }

  if (!overrides?.trustResult) {
    if (retainedStatus === "authorized") {
      trustStatus = "definite";
      degradationFactors = [];
    } else if (retainedStatus === "denied") {
      trustStatus = "speculative";
      degradationFactors = ["POLICY_DENIED"];
    } else {
      trustStatus = "uncertain";
      degradationFactors = ["POLICY_INDETERMINATE"];
    }
  }

  const trustResult: TrustResult = {
    trustStatus,
    degradationFactors,
  };

  // Convert explicit constitutional timestamp to numeric evaluation time coordinate
  let executionTime = 0;
  try {
    const parsedTime = Date.parse(context.constitutionalTimestamp);
    if (!Number.isNaN(parsedTime) && parsedTime >= 0) {
      executionTime = parsedTime;
    }
  } catch {
    // Fall back to 0 if parsing fails
  }

  // Invoke pure, domain-separated cryptographic hashing and summary construction (G-0803, G-0809, G-0816)
  const hashes = generateReceiptHashes(
    executionRequest,
    outcome,
    trustResult,
    policyDecisions,
    pipelineDiagnostics,
    evaluatedPolicyVersion,
    executionTime,
    context.executionId,
    "1.0.0",
  );

  const executionReceipt = {
    receiptId: hashes.receiptId,
    executionId: context.executionId,
    runtimeVersion: "1.0.0",
    inputHash: hashes.inputHash,
    outputHash: hashes.outputHash,
    evidenceHash: hashes.evidenceHash,
    policyVersion: evaluatedPolicyVersion,
    decisionSummary: hashes.decisionSummary,
    executionTime,
    deterministicHash: hashes.deterministicHash,
  };

  // Perform a safety validation check to guarantee receipt schema compliance
  const validationReceipt = validateExecutionReceipt(executionReceipt);
  if (!validationReceipt.ok) {
    return {
      ok: false,
      error: {
        stage: "Receipt Generation",
        code: "INVALID_GENERATED_RECEIPT",
        message: validationReceipt.error.message,
      },
      trace,
    };
  }

  const executionOutput: ExecutionOutput = {
    outcome,
    executionReceipt: validationReceipt.value,
    evidenceReferences:
      executionRequest.activeConstitutionalView.evidenceReferences,
    trustResult,
    policyDecisions,
    diagnostics: pipelineDiagnostics,
  };

  return {
    ok: true,
    stage: "Receipt Generation",
    trace,
    outcome: {
      kind: "materialized",
      executionOutput,
    },
  };
}

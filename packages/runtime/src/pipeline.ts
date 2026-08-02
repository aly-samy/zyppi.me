import { validateExecutionRequest } from "@zyppi/domain";
import type { ExecutionContext } from "@zyppi/domain";
import type {
  LifecycleStage,
  PipelineResult,
  PipelineError,
  StageOverrideConfig,
} from "./types.js";

/**
 * Executes the internal pipeline traverse through all 9 required constitutional lifecycle stages.
 * Guaranteed to be pure, in-memory, synchronous, and completely deterministic.
 *
 * @param input Raw ExecutionRequest input or similar
 * @param overrides Tightly constrained test override configurations (none in production)
 */
export function runInternalPipeline(
  input: unknown,
  overrides?: StageOverrideConfig,
): PipelineResult {
  const trace: LifecycleStage[] = [];

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

  // Process Admission stage outcome under overrides or default closed behavior
  let admissionSucceeded = false;
  let admissionError: PipelineError | undefined;

  if (overrides && overrides["Admission"]) {
    const stageOverride = overrides["Admission"];
    if (stageOverride.ok) {
      admissionSucceeded = true;
    } else {
      admissionError = {
        stage: "Admission",
        code: stageOverride.code,
        message: stageOverride.message,
      };
    }
  } else {
    // Since no substantive admission engine or authorized implementation exists yet,
    // the production/default execution path MUST fail closed at the Admission stage.
    admissionError = {
      stage: "Admission",
      code: "ADMISSION_UNAVAILABLE",
      message: "Substantive admission engine is not authorized or implemented.",
    };
  }

  if (!admissionSucceeded && admissionError) {
    return {
      ok: false,
      error: admissionError,
      trace,
    };
  }

  // Helper to standardise failing subsequent unimplemented stages
  function makeUnimplementedAction(stageName: string) {
    return () => ({
      ok: false as const,
      code: `${stageName.toUpperCase().replace(/\s+/g, "_")}_UNAVAILABLE`,
      message: `Substantive ${stageName.toLowerCase()} implementation is not available.`,
    });
  }

  // 2. Bundle Discovery
  const discoveryRes = executePostAdmissionStage(
    "Bundle Discovery",
    makeUnimplementedAction("Bundle Discovery"),
    context,
  );
  if (!discoveryRes.ok) {
    return { ok: false, error: discoveryRes.error, trace };
  }

  // 3. Bundle Verification
  const verificationRes = executePostAdmissionStage(
    "Bundle Verification",
    makeUnimplementedAction("Bundle Verification"),
    context,
  );
  if (!verificationRes.ok) {
    return { ok: false, error: verificationRes.error, trace };
  }

  // 4. Dependency Resolution
  const dependencyRes = executePostAdmissionStage(
    "Dependency Resolution",
    makeUnimplementedAction("Dependency Resolution"),
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
    makeUnimplementedAction("ACV Activation"),
    context,
  );
  if (!acvRes.ok) {
    return { ok: false, error: acvRes.error, trace };
  }

  // 7. Resolution Graph Construction
  const resGraphRes = executePostAdmissionStage(
    "Resolution Graph Construction",
    makeUnimplementedAction("Resolution Graph Construction"),
    context,
  );
  if (!resGraphRes.ok) {
    return { ok: false, error: resGraphRes.error, trace };
  }

  // 8. Active Execution
  const activeExecRes = executePostAdmissionStage(
    "Active Execution",
    makeUnimplementedAction("Active Execution"),
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

  return {
    ok: true,
    stage: "Receipt Generation",
    trace,
  };
}

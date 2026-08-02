import { validateExecutionRequest } from "@zyppi/domain";
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

  // Helper function to handle a stage traversal and determine whether to proceed
  function executeStage(
    stage: LifecycleStage,
    performAction: () =>
      { ok: true } | { ok: false; code: string; message: string },
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
    const result = performAction();
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
  const admissionRes = executeStage("Admission", () => {
    // Perform structural validation using the audited domain validator
    const validation = validateExecutionRequest(input);
    if (!validation.ok) {
      return {
        ok: false,
        code: "INVALID_EXECUTION_REQUEST",
        message: validation.error.message,
      };
    }

    // Since no substantive admission engine or authorized implementation exists yet,
    // the production/default execution path MUST fail closed at the Admission stage.
    return {
      ok: false,
      code: "ADMISSION_UNAVAILABLE",
      message: "Substantive admission engine is not authorized or implemented.",
    };
  });

  if (!admissionRes.ok) {
    return { ok: false, error: admissionRes.error, trace };
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
  const discoveryRes = executeStage(
    "Bundle Discovery",
    makeUnimplementedAction("Bundle Discovery"),
  );
  if (!discoveryRes.ok) {
    return { ok: false, error: discoveryRes.error, trace };
  }

  // 3. Bundle Verification
  const verificationRes = executeStage(
    "Bundle Verification",
    makeUnimplementedAction("Bundle Verification"),
  );
  if (!verificationRes.ok) {
    return { ok: false, error: verificationRes.error, trace };
  }

  // 4. Dependency Resolution
  const dependencyRes = executeStage(
    "Dependency Resolution",
    makeUnimplementedAction("Dependency Resolution"),
  );
  if (!dependencyRes.ok) {
    return { ok: false, error: dependencyRes.error, trace };
  }

  // 5. Compatibility Validation
  const compatibilityRes = executeStage(
    "Compatibility Validation",
    makeUnimplementedAction("Compatibility Validation"),
  );
  if (!compatibilityRes.ok) {
    return { ok: false, error: compatibilityRes.error, trace };
  }

  // 6. ACV Activation
  const acvRes = executeStage(
    "ACV Activation",
    makeUnimplementedAction("ACV Activation"),
  );
  if (!acvRes.ok) {
    return { ok: false, error: acvRes.error, trace };
  }

  // 7. Resolution Graph Construction
  const resGraphRes = executeStage(
    "Resolution Graph Construction",
    makeUnimplementedAction("Resolution Graph Construction"),
  );
  if (!resGraphRes.ok) {
    return { ok: false, error: resGraphRes.error, trace };
  }

  // 8. Active Execution
  const activeExecRes = executeStage(
    "Active Execution",
    makeUnimplementedAction("Active Execution"),
  );
  if (!activeExecRes.ok) {
    return { ok: false, error: activeExecRes.error, trace };
  }

  // 9. Receipt Generation
  const receiptRes = executeStage(
    "Receipt Generation",
    makeUnimplementedAction("Receipt Generation"),
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

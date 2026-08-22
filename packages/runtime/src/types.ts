import type { Outcome, EvidenceRecord, ExecutionReceipt } from "@zyppi/domain";
import type { PolicyDecision } from "./evaluator.js";

/**
 * Closed, internal union of all nine required constitutional lifecycle stages.
 */
export type LifecycleStage =
  | "Admission"
  | "Bundle Discovery"
  | "Bundle Verification"
  | "Dependency Resolution"
  | "Compatibility Validation"
  | "ACV Activation"
  | "Resolution Graph Construction"
  | "Active Execution"
  | "Receipt Generation";

/**
 * Structured, deterministic internal error contract for pipeline blockages or failures.
 */
export interface PipelineError {
  readonly code: string;
  readonly stage: LifecycleStage;
  readonly message: string;
}

export type ReceiptFieldName =
  | "receiptId"
  | "executionId"
  | "runtimeVersion"
  | "inputHash"
  | "outputHash"
  | "evidenceHash"
  | "policyVersion"
  | "executionTime"
  | "deterministicHash";

export type TrustStatus =
  "definite" | "probable" | "possible" | "uncertain" | "speculative";

export interface TrustResult {
  readonly trustStatus: TrustStatus;
  readonly degradationFactors: readonly string[];
}

export interface ExecutionOutput {
  readonly outcome: Outcome;
  readonly executionReceipt: ExecutionReceipt;
  readonly evidenceReferences: readonly EvidenceRecord[];
  readonly trustResult: TrustResult;
  readonly policyDecisions: readonly PolicyDecision[];
  readonly diagnostics: readonly string[];
}

export type ReceiptOutcome =
  | {
      readonly kind: "deferred";
      readonly decisionSummary: "authorized" | "denied" | "unavailable";
      readonly unresolvedFields: readonly ReceiptFieldName[];
    }
  | {
      readonly kind: "blocked";
      readonly reason: string;
    }
  | {
      readonly kind: "materialized";
      readonly executionOutput: ExecutionOutput;
    };

/**
 * Discriminated union representing the outcome of a pipeline execution.
 * Does not contain any timestamps, random values, or system environment attributes.
 */
export type PipelineResult =
  | {
      readonly ok: true;
      readonly stage: "Receipt Generation";
      readonly trace: readonly LifecycleStage[];
      readonly outcome: ReceiptOutcome;
    }
  | {
      readonly ok: false;
      readonly error: PipelineError;
      readonly trace: readonly LifecycleStage[];
    };

/**
 * Configuration options to control deterministic stage behavior during testing.
 */
export interface StageOverrideConfig {
  /**
   * Overrides the generated Outcome.
   */
  readonly outcome?: Outcome;

  /**
   * Overrides the generated TrustResult.
   */
  readonly trustResult?: TrustResult;

  /**
   * Overrides Admission stage behavior. By default, Admission fails closed.
   */
  readonly Admission?:
    | { readonly ok: true }
    | { readonly ok: false; readonly code: string; readonly message: string };

  /**
   * Overrides Bundle Discovery stage behavior.
   */
  readonly "Bundle Discovery"?:
    | { readonly ok: true }
    | { readonly ok: false; readonly code: string; readonly message: string };

  /**
   * Overrides Bundle Verification stage behavior.
   */
  readonly "Bundle Verification"?:
    | { readonly ok: true }
    | { readonly ok: false; readonly code: string; readonly message: string };

  /**
   * Overrides Dependency Resolution stage behavior.
   */
  readonly "Dependency Resolution"?:
    | { readonly ok: true }
    | { readonly ok: false; readonly code: string; readonly message: string };

  /**
   * Overrides Compatibility Validation stage behavior.
   */
  readonly "Compatibility Validation"?:
    | { readonly ok: true }
    | { readonly ok: false; readonly code: string; readonly message: string };

  /**
   * Overrides ACV Activation stage behavior.
   */
  readonly "ACV Activation"?:
    | { readonly ok: true }
    | { readonly ok: false; readonly code: string; readonly message: string };

  /**
   * Overrides Resolution Graph Construction stage behavior.
   */
  readonly "Resolution Graph Construction"?:
    | { readonly ok: true }
    | { readonly ok: false; readonly code: string; readonly message: string };

  /**
   * Overrides Active Execution stage behavior.
   */
  readonly "Active Execution"?:
    | { readonly ok: true }
    | { readonly ok: false; readonly code: string; readonly message: string };

  /**
   * Overrides Receipt Generation stage behavior.
   */
  readonly "Receipt Generation"?:
    | { readonly ok: true }
    | { readonly ok: false; readonly code: string; readonly message: string };
}

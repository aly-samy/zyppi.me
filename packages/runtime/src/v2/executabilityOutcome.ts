import type { OwnerDeterminationBindingV2 } from "@zyppi/domain";
import type { ExecutionEnvelopeCompatibilityV2Failure } from "./executionEnvelopeCompatibility.js";
import {
  integrateOwnerDeterminationsV2,
  type OwnerDeterminationIntegrationFrameV2,
  type OwnerDeterminationIntegrationV2Failure,
} from "./ownerDeterminationIntegration.js";
import type { ProductionExecutionIsolationV2Failure } from "./productionExecutionBoundary.js";

export interface ExecutionOwnerResultBindingsV2 {
  readonly policyAggregate: OwnerDeterminationBindingV2 | null;
  readonly authorization: OwnerDeterminationBindingV2 | null;
  readonly trustResult: OwnerDeterminationBindingV2 | null;
}

export type ExecutabilityBlockerV2 =
  | "BUDGET_EXHAUSTED"
  | "POLICY_DENIED"
  | "POLICY_INDETERMINATE"
  | "AUTHORIZATION_DENIED"
  | "AUTHORIZATION_CONDITIONAL"
  | "AUTHORIZATION_DEFERRED";

export type ExecutabilityDeterminationV2 =
  | {
      readonly status: "DETERMINED";
      readonly value: boolean;
      readonly blockers: readonly ExecutabilityBlockerV2[];
      readonly basisBindingKeys: readonly string[];
      readonly assessedAtCoordinateRef: "tEInput";
    }
  | {
      readonly status: "UNAVAILABLE";
      readonly missingOwnerResults: readonly (
        "POLICY_AGGREGATE" | "AUTHORIZATION" | "TRUST_RESULT"
      )[];
      readonly blockers: readonly ExecutabilityBlockerV2[];
      readonly basisBindingKeys: readonly string[];
      readonly assessedAtCoordinateRef: "tEInput";
    };

export type OutcomeMaterializationV2 =
  | {
      readonly status: "PRODUCED";
      readonly outcome: "verified" | "unverified" | "rejected";
      readonly basisBindingKeys: readonly string[];
    }
  | {
      readonly status: "NOT_PRODUCED";
      readonly reason:
        | "OUTCOME_NOT_APPLICABLE_TO_INTENT"
        | "EXECUTABILITY_UNAVAILABLE"
        | "EXECUTION_NOT_ADMITTED_TO_TERMINAL_VERIFICATION";
      readonly basisBindingKeys: readonly string[];
    };

export interface ExecutabilityOutcomeFrameV2 {
  readonly kind: "EXECUTABILITY_OUTCOME_V2";
  readonly ownerIntegrationFrame: OwnerDeterminationIntegrationFrameV2;
  readonly ownerResults: ExecutionOwnerResultBindingsV2;
  readonly executability: ExecutabilityDeterminationV2;
  readonly outcome: OutcomeMaterializationV2;
}

export type ExecutabilityOutcomeV2ErrorCode =
  | "OWNER_RESULT_ROLE_AMBIGUOUS"
  | "OWNER_RESULT_CONTRACT_INVALID"
  | "OWNER_RESULT_REFERENCE_INTEGRITY_FAILED";

export type ExecutabilityOutcomeV2Failure = {
  readonly ok: false;
  readonly stage: "EXECUTABILITY_OUTCOME";
  readonly error: {
    readonly code: ExecutabilityOutcomeV2ErrorCode;
    readonly message: string;
  };
};

export type ExecutabilityOutcomeV2Success = {
  readonly ok: true;
  readonly frame: ExecutabilityOutcomeFrameV2;
};

export type ExecutabilityOutcomeV2Result =
  | ExecutabilityOutcomeV2Success
  | ExecutionEnvelopeCompatibilityV2Failure
  | ProductionExecutionIsolationV2Failure
  | OwnerDeterminationIntegrationV2Failure
  | ExecutabilityOutcomeV2Failure;

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

function hasOwnProperty(obj: Record<string, unknown>, prop: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * Native V2 Runtime capability that consumes already-integrated owner determinations
 * from V2-07 and evaluates RI-owned Executability and CAW terminal verification Outcome
 * without collapsing Policy Result, Authorization, Trust, Executability, or Outcome.
 */
export function evaluateExecutabilityAndOutcomeV2(
  input: unknown,
): ExecutabilityOutcomeV2Result {
  // Step 1 — Predecessor delegation (V2-07)
  const v207Result = integrateOwnerDeterminationsV2(input);
  if (!v207Result.ok) {
    return v207Result;
  }

  const ownerIntegrationFrame = v207Result.frame;
  const productionFrame = ownerIntegrationFrame.productionFrame;
  const executionRequest = productionFrame.executionRequest;
  const productionBindings =
    executionRequest.evaluationContext.ownerDeterminationBindings;

  // Step 2 — Classify owner determination bindings into V2-08 roles
  const polyAggregateCandidates: OwnerDeterminationBindingV2[] = [];
  const authorizationCandidates: OwnerDeterminationBindingV2[] = [];
  const trustResultCandidates: OwnerDeterminationBindingV2[] = [];

  for (let i = 0; i < productionBindings.length; i++) {
    const b = productionBindings[i];

    // Role A: POL Aggregate Policy Result
    if (
      b.constitutionalOwnerRef.family === "OWNER" &&
      b.constitutionalOwnerRef.artifactId === "POL-001" &&
      isPlainObject(b.ownerNativeResult) &&
      hasOwnProperty(b.ownerNativeResult, "aggregateResult")
    ) {
      const agg = b.ownerNativeResult.aggregateResult;
      const operands = b.determinationQuestionBinding.questionOperandBindings;
      const hasPolicyUniverse = operands.some(
        (op) => op.operandKind === "POLICY_UNIVERSE",
      );
      const hasRequestedAction = operands.some(
        (op) => op.operandKind === "REQUESTED_ACTION",
      );

      if (
        (agg !== "ALLOW" && agg !== "DENY" && agg !== "INDETERMINATE") ||
        !hasPolicyUniverse ||
        !hasRequestedAction
      ) {
        return {
          ok: false,
          stage: "EXECUTABILITY_OUTCOME",
          error: {
            code: "OWNER_RESULT_CONTRACT_INVALID",
            message:
              "POL Aggregate Policy Result contract invalid or missing required question operands",
          },
        };
      }
      polyAggregateCandidates.push(b);
    }

    // Role B: POL Authorization
    if (
      b.constitutionalOwnerRef.family === "OWNER" &&
      b.constitutionalOwnerRef.artifactId === "POL-001" &&
      isPlainObject(b.ownerNativeResult) &&
      hasOwnProperty(b.ownerNativeResult, "authorizationDecision")
    ) {
      const authDec = b.ownerNativeResult.authorizationDecision;
      const operands = b.determinationQuestionBinding.questionOperandBindings;
      const hasRequestedAction = operands.some(
        (op) => op.operandKind === "REQUESTED_ACTION",
      );
      const hasPolicyUniverse = operands.some(
        (op) => op.operandKind === "POLICY_UNIVERSE",
      );
      const hasActionPerformer = operands.some(
        (op) => op.operandKind === "ACTION_PERFORMER",
      );
      const hasActionTarget = operands.some(
        (op) => op.operandKind === "ACTION_TARGET",
      );

      if (
        (authDec !== "Authorized" &&
          authDec !== "Denied" &&
          authDec !== "Conditionally Authorized" &&
          authDec !== "Deferred") ||
        !hasRequestedAction ||
        !hasPolicyUniverse ||
        !hasActionPerformer ||
        !hasActionTarget
      ) {
        return {
          ok: false,
          stage: "EXECUTABILITY_OUTCOME",
          error: {
            code: "OWNER_RESULT_CONTRACT_INVALID",
            message:
              "POL Authorization contract invalid or missing required question operands",
          },
        };
      }
      authorizationCandidates.push(b);
    }

    // Role C: SEC TrustResult
    if (
      b.constitutionalOwnerRef.family === "OWNER" &&
      b.constitutionalOwnerRef.artifactId === "SEC-001" &&
      isPlainObject(b.ownerNativeResult) &&
      (hasOwnProperty(b.ownerNativeResult, "trustStatus") ||
        hasOwnProperty(b.ownerNativeResult, "degradationFactors"))
    ) {
      const res = b.ownerNativeResult;
      const operands = b.determinationQuestionBinding.questionOperandBindings;
      const hasEvidenceState = operands.some(
        (op) => op.operandKind === "EVIDENCE_STATE",
      );

      const hasStatusProp = hasOwnProperty(res, "trustStatus");
      const hasFactorsProp = hasOwnProperty(res, "degradationFactors");

      const validStatus =
        hasStatusProp &&
        (res.trustStatus === "definite" ||
          res.trustStatus === "probable" ||
          res.trustStatus === "possible" ||
          res.trustStatus === "uncertain" ||
          res.trustStatus === "speculative");

      const validFactors =
        hasFactorsProp &&
        Array.isArray(res.degradationFactors) &&
        res.degradationFactors.every((f) => typeof f === "string");

      if (!validStatus || !validFactors || !hasEvidenceState) {
        return {
          ok: false,
          stage: "EXECUTABILITY_OUTCOME",
          error: {
            code: "OWNER_RESULT_CONTRACT_INVALID",
            message:
              "SEC TrustResult contract invalid or missing required question operands",
          },
        };
      }
      trustResultCandidates.push(b);
    }
  }

  // Step 3 — Ambiguity checks
  if (
    polyAggregateCandidates.length > 1 ||
    authorizationCandidates.length > 1 ||
    trustResultCandidates.length > 1
  ) {
    return {
      ok: false,
      stage: "EXECUTABILITY_OUTCOME",
      error: {
        code: "OWNER_RESULT_ROLE_AMBIGUOUS",
        message:
          "Multiple owner determination bindings qualified for a single V2-08 role",
      },
    };
  }

  const policyAggregate = polyAggregateCandidates[0] ?? null;
  const authorization = authorizationCandidates[0] ?? null;
  const trustResult = trustResultCandidates[0] ?? null;

  // Step 4 — Reference integrity checks
  if (
    (policyAggregate !== null &&
      !productionBindings.includes(policyAggregate)) ||
    (authorization !== null && !productionBindings.includes(authorization)) ||
    (trustResult !== null && !productionBindings.includes(trustResult))
  ) {
    return {
      ok: false,
      stage: "EXECUTABILITY_OUTCOME",
      error: {
        code: "OWNER_RESULT_REFERENCE_INTEGRITY_FAILED",
        message:
          "Recognized owner result binding is not referentially identical to production frame binding",
      },
    };
  }

  // Step 5 — Compute RI Executability
  const blockers: ExecutabilityBlockerV2[] = [];

  if (executionRequest.executionContext.budget === 0) {
    blockers.push("BUDGET_EXHAUSTED");
  }

  if (policyAggregate !== null) {
    const agg = (policyAggregate.ownerNativeResult as Record<string, unknown>)
      .aggregateResult;
    if (agg === "DENY") {
      blockers.push("POLICY_DENIED");
    } else if (agg === "INDETERMINATE") {
      blockers.push("POLICY_INDETERMINATE");
    }
  }

  if (authorization !== null) {
    const authDec = (authorization.ownerNativeResult as Record<string, unknown>)
      .authorizationDecision;
    if (authDec === "Denied") {
      blockers.push("AUTHORIZATION_DENIED");
    } else if (authDec === "Conditionally Authorized") {
      blockers.push("AUTHORIZATION_CONDITIONAL");
    } else if (authDec === "Deferred") {
      blockers.push("AUTHORIZATION_DEFERRED");
    }
  }

  const execBasisKeysSet = new Set<string>();
  if (policyAggregate !== null) {
    execBasisKeysSet.add(policyAggregate.determinationBindingKey);
  }
  if (authorization !== null) {
    execBasisKeysSet.add(authorization.determinationBindingKey);
  }
  if (trustResult !== null) {
    execBasisKeysSet.add(trustResult.determinationBindingKey);
  }
  const executabilityBasisBindingKeys = Array.from(execBasisKeysSet).sort(
    (a, b) => (a < b ? -1 : a > b ? 1 : 0),
  );

  let executability: ExecutabilityDeterminationV2;

  if (blockers.length > 0) {
    executability = {
      status: "DETERMINED",
      value: false,
      blockers,
      basisBindingKeys: executabilityBasisBindingKeys,
      assessedAtCoordinateRef: "tEInput",
    };
  } else {
    const missingOwnerResults: (
      "POLICY_AGGREGATE" | "AUTHORIZATION" | "TRUST_RESULT"
    )[] = [];
    if (policyAggregate === null) {
      missingOwnerResults.push("POLICY_AGGREGATE");
    }
    if (authorization === null) {
      missingOwnerResults.push("AUTHORIZATION");
    }
    if (trustResult === null) {
      missingOwnerResults.push("TRUST_RESULT");
    }

    if (missingOwnerResults.length > 0) {
      executability = {
        status: "UNAVAILABLE",
        missingOwnerResults,
        blockers: [],
        basisBindingKeys: executabilityBasisBindingKeys,
        assessedAtCoordinateRef: "tEInput",
      };
    } else {
      executability = {
        status: "DETERMINED",
        value: true,
        blockers: [],
        basisBindingKeys: executabilityBasisBindingKeys,
        assessedAtCoordinateRef: "tEInput",
      };
    }
  }

  // Step 6 — Compute CAW Outcome
  const outcomeBasisKeysSet = new Set<string>();
  if (policyAggregate !== null) {
    outcomeBasisKeysSet.add(policyAggregate.determinationBindingKey);
  }
  if (authorization !== null) {
    outcomeBasisKeysSet.add(authorization.determinationBindingKey);
  }
  if (trustResult !== null) {
    outcomeBasisKeysSet.add(trustResult.determinationBindingKey);
  }
  const outcomeBasisBindingKeys = Array.from(outcomeBasisKeysSet).sort(
    (a, b) => (a < b ? -1 : a > b ? 1 : 0),
  );

  let outcome: OutcomeMaterializationV2;

  if (executionRequest.intent.intentCategory !== "VERIFY") {
    outcome = {
      status: "NOT_PRODUCED",
      reason: "OUTCOME_NOT_APPLICABLE_TO_INTENT",
      basisBindingKeys: outcomeBasisBindingKeys,
    };
  } else {
    // Intent is VERIFY
    if (
      policyAggregate !== null &&
      (policyAggregate.ownerNativeResult as Record<string, unknown>)
        .aggregateResult === "DENY"
    ) {
      outcome = {
        status: "PRODUCED",
        outcome: "rejected",
        basisBindingKeys: outcomeBasisBindingKeys,
      };
    } else if (
      executability.status === "DETERMINED" &&
      executability.value === true
    ) {
      outcome = {
        status: "PRODUCED",
        outcome: "verified",
        basisBindingKeys: outcomeBasisBindingKeys,
      };
    } else if (
      policyAggregate !== null &&
      (policyAggregate.ownerNativeResult as Record<string, unknown>)
        .aggregateResult === "INDETERMINATE" &&
      authorization !== null &&
      trustResult !== null
    ) {
      outcome = {
        status: "PRODUCED",
        outcome: "unverified",
        basisBindingKeys: outcomeBasisBindingKeys,
      };
    } else if (executability.status === "UNAVAILABLE") {
      outcome = {
        status: "NOT_PRODUCED",
        reason: "EXECUTABILITY_UNAVAILABLE",
        basisBindingKeys: outcomeBasisBindingKeys,
      };
    } else {
      outcome = {
        status: "NOT_PRODUCED",
        reason: "EXECUTION_NOT_ADMITTED_TO_TERMINAL_VERIFICATION",
        basisBindingKeys: outcomeBasisBindingKeys,
      };
    }
  }

  // Step 7 — Construct and deepFreeze success frame and wrapper
  const ownerResults: ExecutionOwnerResultBindingsV2 = {
    policyAggregate,
    authorization,
    trustResult,
  };

  const frame: ExecutabilityOutcomeFrameV2 = deepFreeze({
    kind: "EXECUTABILITY_OUTCOME_V2",
    ownerIntegrationFrame,
    ownerResults: deepFreeze(ownerResults),
    executability: deepFreeze(executability),
    outcome: deepFreeze(outcome),
  });

  return deepFreeze({
    ok: true,
    frame,
  });
}

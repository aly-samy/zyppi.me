import type { CompositionErrorCode } from "./types.js";
import type { Participant } from "./participant.js";
import type { StructuralEdge, BindingEdge } from "./topology.js";

/**
 * Diagnostic category taxonomy per AMS-0859 §5.
 * Internal diagnostic explanation of WHY validation encountered a problem.
 * SHALL NOT replace the closed outward-facing CONTRACT-12 validation taxonomy.
 */
export type ConflictDiagnosticCategory =
  | "STRUCTURAL_CONFLICT"
  | "SEMANTIC_REQUIREMENT_CONFLICT"
  | "JURISDICTION_CONFLICT"
  | "VERSION_CONFLICT"
  | "CONTEXT_CONFLICT"
  | "EVIDENCE_CONFLICT"
  | "AUTHORITY_CONFLICT"
  | "AMBIGUITY"
  | "ABSENCE"
  | "UNRESOLVED_CONFLICT";

/**
 * Explicit Governed Incompatibility Rule supplied to evaluation per CORR-0859-1 §4 / CORR-0859-2 §2, §3 / CORR-0859-3 §2.
 * Z-PROF compares values strictly against target-scoped declarations; it does NOT guess or infer conflict.
 */
export interface ExplicitIncompatibilityRule {
  readonly ruleId: string;
  readonly diagnostic: ConflictDiagnosticCategory;
  readonly disposition: CompositionErrorCode;
  readonly targetReferences: readonly string[];
  readonly condition: {
    readonly mutuallyExclusiveValues?: readonly unknown[];
    readonly mutuallyExclusiveJurisdictions?: readonly string[];
    readonly mutuallyExclusiveAuthorities?: readonly string[];
    readonly mutuallyExclusiveContexts?: readonly string[];
    readonly coordinate?: string;
  };
}

/**
 * Explicit Governed Conflict Assertion supplied from upstream per CORR-0859-1 §5 / CORR-0859-2 §4 / CORR-0859-3 §1.
 * Carries already-determined incompatibility into Z-PROF without Z-PROF inventing facts.
 */
export interface ExplicitConflictAssertion {
  readonly assertionId: string;
  readonly diagnostic: ConflictDiagnosticCategory;
  readonly disposition: CompositionErrorCode;
  readonly involvedReferences: readonly string[];
  readonly governingRuleRef: string;
  readonly details: string;
}

/**
 * Structural representation of an explicit resolution rule supplied to evaluation per AMS-0859 §8, §25 / CORR-0859-2 §1 / CORR-0859-3 §3.
 * Resolution candidates remain identified but fail closed as UNRESOLVED because authority/application contracts are not materialized.
 */
export interface AuthorizedResolutionRule {
  readonly ruleRef: string;
  readonly authorityRef: string;
  readonly conflictCategory: ConflictDiagnosticCategory;
  readonly targetReferences: readonly string[];
  readonly resolutionResult: string;
  readonly condition?: Readonly<Record<string, unknown>>;
}

/**
 * Declaration input item for evaluation.
 */
export interface GovernedDeclaration {
  readonly id: string;
  readonly kind?: string;
  readonly requirementKey?: string;
  readonly requiredValue?: unknown;
  readonly jurisdiction?: string;
  readonly authorityRef?: string;
  readonly versionReq?: string;
  readonly contextCoordinate?: string;
  readonly contextValue?: string;
  readonly isMissing?: boolean;
  readonly epistemicStatus?:
    "UNKNOWN" | "UNAVAILABLE" | "UNVERIFIED" | "CONFLICTING";
}

/**
 * Inputs supplied to deterministic conflict evaluation per AMS-0859 §12, §13, §14 and CORR-0859-1 / CORR-0859-2 / CORR-0859-3.
 */
export interface ConflictEvaluationInputs {
  readonly participants?: readonly Participant[];
  readonly structuralEdges?: readonly StructuralEdge[];
  readonly bindingEdges?: readonly BindingEdge[];
  readonly versionRequirements?: readonly {
    readonly id: string;
    readonly version: string;
  }[];
  readonly contextRequirements?: readonly {
    readonly key: string;
    readonly value: string;
  }[];
  readonly evidenceRequirements?: readonly {
    readonly id: string;
    readonly status?: string;
    readonly isConflicting?: boolean;
    readonly isMissing?: boolean;
  }[];
  readonly declarations?: readonly GovernedDeclaration[];
  readonly ambiguousInterpretations?: readonly {
    readonly key: string;
    readonly candidates: readonly string[];
  }[];
  readonly explicitIncompatibilityRules?: readonly ExplicitIncompatibilityRule[];
  readonly explicitConflictAssertions?: readonly ExplicitConflictAssertion[];
  readonly authorizedRules?: readonly AuthorizedResolutionRule[];
}

/**
 * Diagnostic conflict evaluation outcome per AMS-0859 §5, §6, §8, §12 and CORR-0859-3 §3.
 * RESOLVED is removed from the active runtime execution model because resolution authority
 * and structural outcome transformation contracts are not materialized.
 */
export type ConflictEvaluationResult =
  | {
      readonly status: "NO_CONFLICT";
    }
  | {
      readonly status: "DIAGNOSTIC";
      readonly diagnostic: ConflictDiagnosticCategory;
      readonly disposition: CompositionErrorCode;
      readonly details: string;
      readonly involvedReferences?: readonly string[];
    }
  | {
      readonly status: "UNRESOLVED";
      readonly diagnostic: ConflictDiagnosticCategory;
      readonly disposition: CompositionErrorCode;
      readonly reason: string;
      readonly involvedReferences?: readonly string[];
    };

/**
 * Recursively deep freezes an object/array structure per AMS-0859 §19.
 */
function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== "object" || Object.isFrozen(obj)) {
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

const VALID_DISPOSITIONS: readonly CompositionErrorCode[] = [
  "unsupported",
  "unavailable",
  "missing",
  "incompatible",
  "conflicting",
  "unauthorized",
  "unverified",
  "invalid",
];

const VALID_DIAGNOSTICS: readonly ConflictDiagnosticCategory[] = [
  "STRUCTURAL_CONFLICT",
  "SEMANTIC_REQUIREMENT_CONFLICT",
  "JURISDICTION_CONFLICT",
  "VERSION_CONFLICT",
  "CONTEXT_CONFLICT",
  "EVIDENCE_CONFLICT",
  "AUTHORITY_CONFLICT",
  "AMBIGUITY",
  "ABSENCE",
  "UNRESOLVED_CONFLICT",
];

/**
 * Validates structural integrity of an ExplicitConflictAssertion per CORR-0859-2 §4 / CORR-0859-3 §1.
 */
function validateConflictAssertion(
  assertion: ExplicitConflictAssertion,
): boolean {
  if (!assertion) return false;
  if (
    !assertion.assertionId ||
    typeof assertion.assertionId !== "string" ||
    assertion.assertionId.trim() === ""
  )
    return false;
  if (
    !assertion.governingRuleRef ||
    typeof assertion.governingRuleRef !== "string" ||
    assertion.governingRuleRef.trim() === ""
  )
    return false;
  if (
    !assertion.involvedReferences ||
    !Array.isArray(assertion.involvedReferences) ||
    assertion.involvedReferences.length === 0
  )
    return false;
  if (
    !assertion.disposition ||
    !VALID_DISPOSITIONS.includes(assertion.disposition)
  )
    return false;
  if (
    !assertion.diagnostic ||
    !VALID_DIAGNOSTICS.includes(assertion.diagnostic)
  )
    return false;
  return true;
}

/**
 * Validates structural integrity of an ExplicitIncompatibilityRule per CORR-0859-3 §2.
 */
function validateIncompatibilityRule(
  rule: ExplicitIncompatibilityRule,
): boolean {
  if (!rule) return false;
  if (
    !rule.ruleId ||
    typeof rule.ruleId !== "string" ||
    rule.ruleId.trim() === ""
  )
    return false;
  if (!rule.diagnostic || !VALID_DIAGNOSTICS.includes(rule.diagnostic))
    return false;
  if (!rule.disposition || !VALID_DISPOSITIONS.includes(rule.disposition))
    return false;
  if (
    !rule.targetReferences ||
    !Array.isArray(rule.targetReferences) ||
    rule.targetReferences.length === 0
  )
    return false;
  if (!rule.condition || typeof rule.condition !== "object") return false;

  const hasJur =
    Array.isArray(rule.condition.mutuallyExclusiveJurisdictions) &&
    rule.condition.mutuallyExclusiveJurisdictions.length > 0;
  const hasAuth =
    Array.isArray(rule.condition.mutuallyExclusiveAuthorities) &&
    rule.condition.mutuallyExclusiveAuthorities.length > 0;
  const hasVal =
    Array.isArray(rule.condition.mutuallyExclusiveValues) &&
    rule.condition.mutuallyExclusiveValues.length > 0;
  const hasCtx =
    Array.isArray(rule.condition.mutuallyExclusiveContexts) &&
    rule.condition.mutuallyExclusiveContexts.length > 0;

  if (!hasJur && !hasAuth && !hasVal && !hasCtx) return false;

  if (
    (hasVal || hasCtx) &&
    (!rule.condition.coordinate ||
      typeof rule.condition.coordinate !== "string" ||
      rule.condition.coordinate.trim() === "")
  ) {
    return false;
  }

  return true;
}

/**
 * Attempts to apply explicit authorized resolution rules to a detected conflict per CORR-0859-2 §1 / CORR-0859-3 §3.
 * Resolution candidates remain identified but fail closed as UNRESOLVED with BLOCKED — RESOLUTION AUTHORITY/APPLICATION CONTRACT NOT MATERIALIZED.
 */
export function resolveConflictWithRules(
  diagnostic: ConflictDiagnosticCategory,
  disposition: CompositionErrorCode,
  involvedReferences: readonly string[],
  details: string,
  authorizedRules?: readonly AuthorizedResolutionRule[],
): ConflictEvaluationResult {
  if (!authorizedRules || authorizedRules.length === 0) {
    return deepFreeze({
      status: "UNRESOLVED",
      diagnostic,
      disposition,
      reason: `No authorized resolution rules provided for conflict diagnostic '${diagnostic}': ${details}`,
      involvedReferences: Object.freeze([...involvedReferences]),
    });
  }

  for (const rule of authorizedRules) {
    if (
      !rule.authorityRef ||
      typeof rule.authorityRef !== "string" ||
      rule.authorityRef.trim() === "" ||
      !rule.ruleRef ||
      typeof rule.ruleRef !== "string" ||
      rule.ruleRef.trim() === ""
    ) {
      continue;
    }

    if (rule.conflictCategory !== diagnostic) {
      continue;
    }

    const ruleTargets = new Set(rule.targetReferences || []);
    const targetsMatch =
      involvedReferences.length > 0 &&
      involvedReferences.every((ref) => ruleTargets.has(ref));

    if (targetsMatch) {
      return deepFreeze({
        status: "UNRESOLVED",
        diagnostic,
        disposition,
        reason: `BLOCKED — RESOLUTION AUTHORITY/APPLICATION CONTRACT NOT MATERIALIZED: Identified resolution rule candidate ('${rule.ruleRef}' by '${rule.authorityRef}') cannot be verified without substrate authority standing mechanism`,
        involvedReferences: Object.freeze([...involvedReferences]),
      });
    }
  }

  return deepFreeze({
    status: "UNRESOLVED",
    diagnostic,
    disposition,
    reason: `Supplied authorized rules did not match target references for conflict diagnostic '${diagnostic}': ${details}`,
    involvedReferences: Object.freeze([...involvedReferences]),
  });
}

/**
 * Evaluates composition inputs for deterministic conflicts per AMS-0859, CORR-0859-1, CORR-0859-2, and CORR-0859-3.
 * Z-PROF NEVER infers conflict solely because values, jurisdictions, authorities, or contexts differ.
 * Malformed explicit inputs fail closed with disposition `invalid`.
 */
export function evaluateConflict(
  inputs: ConflictEvaluationInputs,
): ConflictEvaluationResult {
  const {
    versionRequirements,
    evidenceRequirements,
    declarations,
    explicitIncompatibilityRules,
    explicitConflictAssertions,
    authorizedRules,
  } = inputs;

  // 1. Explicit Governed Conflict Assertions (CORR-0859-1 §5 / CORR-0859-2 §4 / CORR-0859-3 §1)
  if (explicitConflictAssertions && explicitConflictAssertions.length > 0) {
    for (const assertion of explicitConflictAssertions) {
      if (!validateConflictAssertion(assertion)) {
        return deepFreeze({
          status: "DIAGNOSTIC",
          diagnostic: "AMBIGUITY",
          disposition: "invalid",
          details: `Malformed explicitly supplied conflict assertion: ${JSON.stringify(assertion)}`,
          involvedReferences: Object.freeze(
            assertion?.involvedReferences || [],
          ),
        });
      }
      const involved = assertion.involvedReferences;
      const details = `Explicit conflict assertion '${assertion.assertionId}' under rule '${assertion.governingRuleRef}': ${assertion.details}`;
      return resolveConflictWithRules(
        assertion.diagnostic,
        assertion.disposition,
        involved,
        details,
        authorizedRules,
      );
    }
  }

  // 2. Explicit Incompatibility Rule Structural Validation & Evaluation (CORR-0859-3 §2)
  if (explicitIncompatibilityRules && explicitIncompatibilityRules.length > 0) {
    for (const rule of explicitIncompatibilityRules) {
      if (!validateIncompatibilityRule(rule)) {
        return deepFreeze({
          status: "DIAGNOSTIC",
          diagnostic: "STRUCTURAL_CONFLICT",
          disposition: "invalid",
          details: `Malformed explicitly supplied incompatibility rule: ${JSON.stringify(rule)}`,
          involvedReferences: Object.freeze(rule?.targetReferences || []),
        });
      }

      if (declarations && declarations.length > 0) {
        const targetSet = new Set(rule.targetReferences);
        const targetDecls = declarations.filter((d) => targetSet.has(d.id));

        const foundTargetIds = new Set(targetDecls.map((d) => d.id));
        const allTargetsPresent = rule.targetReferences.every((ref) =>
          foundTargetIds.has(ref),
        );
        if (!allTargetsPresent) {
          continue;
        }

        // 2A. Mutually Exclusive Jurisdictions
        if (
          rule.condition.mutuallyExclusiveJurisdictions &&
          rule.condition.mutuallyExclusiveJurisdictions.length > 0
        ) {
          const matchingDecls = targetDecls.filter(
            (d) =>
              d.jurisdiction &&
              rule.condition.mutuallyExclusiveJurisdictions!.includes(
                d.jurisdiction,
              ),
          );
          const uniqueJur = new Set(matchingDecls.map((f) => f.jurisdiction!));
          if (uniqueJur.size > 1) {
            const involved = matchingDecls.map((f) => f.id).sort();
            const details = `Explicit incompatibility rule '${rule.ruleId}' triggered for mutually exclusive jurisdictions [${Array.from(uniqueJur).sort().join(", ")}] on targets [${rule.targetReferences.slice().sort().join(", ")}]`;
            return resolveConflictWithRules(
              rule.diagnostic,
              rule.disposition,
              involved,
              details,
              authorizedRules,
            );
          }
        }

        // 2B. Mutually Exclusive Authorities
        if (
          rule.condition.mutuallyExclusiveAuthorities &&
          rule.condition.mutuallyExclusiveAuthorities.length > 0
        ) {
          const matchingDecls = targetDecls.filter(
            (d) =>
              d.authorityRef &&
              rule.condition.mutuallyExclusiveAuthorities!.includes(
                d.authorityRef,
              ),
          );
          const uniqueAuth = new Set(matchingDecls.map((f) => f.authorityRef!));
          if (uniqueAuth.size > 1) {
            const involved = matchingDecls.map((f) => f.id).sort();
            const details = `Explicit incompatibility rule '${rule.ruleId}' triggered for mutually exclusive authorities [${Array.from(uniqueAuth).sort().join(", ")}] on targets [${rule.targetReferences.slice().sort().join(", ")}]`;
            return resolveConflictWithRules(
              rule.diagnostic,
              rule.disposition,
              involved,
              details,
              authorizedRules,
            );
          }
        }

        // 2C. Mutually Exclusive Values for Coordinate
        if (
          rule.condition.coordinate &&
          rule.condition.mutuallyExclusiveValues &&
          rule.condition.mutuallyExclusiveValues.length > 0
        ) {
          const matchingDecls = targetDecls.filter(
            (d) =>
              d.requirementKey === rule.condition.coordinate &&
              d.requiredValue !== undefined &&
              rule.condition.mutuallyExclusiveValues!.includes(d.requiredValue),
          );
          const uniqueVals = new Set(
            matchingDecls.map((f) => JSON.stringify(f.requiredValue)),
          );
          if (uniqueVals.size > 1) {
            const involved = matchingDecls.map((f) => f.id).sort();
            const details = `Explicit incompatibility rule '${rule.ruleId}' triggered for coordinate '${rule.condition.coordinate}' with mutually exclusive values on targets [${rule.targetReferences.slice().sort().join(", ")}]`;
            return resolveConflictWithRules(
              rule.diagnostic,
              rule.disposition,
              involved,
              details,
              authorizedRules,
            );
          }
        }

        // 2D. Mutually Exclusive Context Values for Context Coordinate
        if (
          rule.condition.coordinate &&
          rule.condition.mutuallyExclusiveContexts &&
          rule.condition.mutuallyExclusiveContexts.length > 0
        ) {
          const matchingDecls = targetDecls.filter(
            (d) =>
              d.contextCoordinate === rule.condition.coordinate &&
              d.contextValue !== undefined &&
              rule.condition.mutuallyExclusiveContexts!.includes(
                d.contextValue,
              ),
          );
          const uniqueContexts = new Set(
            matchingDecls.map((f) => f.contextValue!),
          );
          if (uniqueContexts.size > 1) {
            const involved = matchingDecls.map((f) => f.id).sort();
            const details = `Explicit incompatibility rule '${rule.ruleId}' triggered for context coordinate '${rule.condition.coordinate}' with mutually exclusive context values [${Array.from(uniqueContexts).sort().join(", ")}] on targets [${rule.targetReferences.slice().sort().join(", ")}]`;
            return resolveConflictWithRules(
              rule.diagnostic,
              rule.disposition,
              involved,
              details,
              authorizedRules,
            );
          }
        }
      }
    }
  }

  // 3. Structural Version Conflict Detection (AMS-0859 §5.4 / CORR-0859-1 §9)
  if (versionRequirements && versionRequirements.length > 1) {
    const versionMap = new Map<string, Set<string>>();
    for (const vReq of versionRequirements) {
      if (!versionMap.has(vReq.id)) {
        versionMap.set(vReq.id, new Set());
      }
      versionMap.get(vReq.id)!.add(vReq.version);
    }

    for (const [id, versions] of versionMap.entries()) {
      if (versions.size > 1) {
        const sortedVersions = Array.from(versions).sort();
        const involved = [id];
        const details = `Incompatible version requirements bound to same identifier '${id}': [${sortedVersions.join(", ")}]`;
        return resolveConflictWithRules(
          "VERSION_CONFLICT",
          "incompatible",
          involved,
          details,
          authorizedRules,
        );
      }
    }
  }

  // 4. Evidence Conflict Detection (AMS-0859 §5.6 / CORR-0859-1 §9)
  if (evidenceRequirements && evidenceRequirements.length > 0) {
    for (const eReq of evidenceRequirements) {
      if (eReq.isConflicting || eReq.status === "CONFLICTING") {
        const involved = [eReq.id];
        const details = `Explicit conflicting evidence state declared for evidence '${eReq.id}'`;
        return resolveConflictWithRules(
          "EVIDENCE_CONFLICT",
          "conflicting",
          involved,
          details,
          authorizedRules,
        );
      }
    }
  }

  // 5. Explicit Absence Detection (AMS-0859 §5.8 / CORR-0859-1 §9)
  if (declarations) {
    const missingDecls = declarations.filter((d) => d.isMissing);
    if (missingDecls.length > 0) {
      const involved = missingDecls.map((d) => d.id).sort();
      const details = `Explicitly declared missing required inputs for [${involved.join(", ")}]`;
      return resolveConflictWithRules(
        "ABSENCE",
        "missing",
        involved,
        details,
        authorizedRules,
      );
    }
  }

  return deepFreeze({ status: "NO_CONFLICT" });
}

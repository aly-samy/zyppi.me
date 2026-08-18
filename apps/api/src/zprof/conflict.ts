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
 * Structural representation of an explicit authorized resolution rule supplied to evaluation per AMS-0859 §8, §25.
 * RESOLVED requires explicit authorityRef AND explicit ruleRef.
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
 * Declaration input item for semantic, jurisdiction, context, or authority evaluation.
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
 * Inputs supplied to deterministic conflict evaluation per AMS-0859 §12, §13, §14.
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
  readonly authorizedRules?: readonly AuthorizedResolutionRule[];
}

/**
 * Diagnostic conflict evaluation outcome per AMS-0859 §5, §6, §8, §12.
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
      readonly status: "RESOLVED";
      readonly diagnostic: ConflictDiagnosticCategory;
      readonly disposition: CompositionErrorCode;
      readonly authorityRef: string;
      readonly ruleRef: string;
      readonly result: string;
      readonly details?: string;
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

/**
 * Maps an internal conflict diagnostic category to its canonical CONTRACT-12 validation disposition per AMS-0859 §6.
 */
export function mapDiagnosticToDisposition(
  category: ConflictDiagnosticCategory,
  context?: {
    readonly epistemicStatus?: string;
    readonly isMissing?: boolean;
    readonly isUnauthorized?: boolean;
  },
): CompositionErrorCode {
  switch (category) {
    case "ABSENCE":
      return "missing";

    case "STRUCTURAL_CONFLICT":
      return "incompatible";

    case "VERSION_CONFLICT":
      return "incompatible";

    case "CONTEXT_CONFLICT":
      return "incompatible";

    case "SEMANTIC_REQUIREMENT_CONFLICT":
      return "conflicting";

    case "AMBIGUITY":
      return "conflicting";

    case "JURISDICTION_CONFLICT":
      return context?.isUnauthorized ? "unauthorized" : "conflicting";

    case "AUTHORITY_CONFLICT":
      return context?.isUnauthorized ? "unauthorized" : "conflicting";

    case "EVIDENCE_CONFLICT":
      if (context?.epistemicStatus === "UNAVAILABLE") return "unavailable";
      if (context?.epistemicStatus === "UNVERIFIED") return "unverified";
      if (context?.epistemicStatus === "UNKNOWN" || context?.isMissing)
        return "missing";
      return "conflicting";

    case "UNRESOLVED_CONFLICT":
      return "conflicting";

    default: {
      const _exhaustiveCheck: never = category;
      return _exhaustiveCheck;
    }
  }
}

/**
 * Attempts to apply explicit authorized resolution rules to a detected conflict per AMS-0859 §8, §25.
 * Fail closed if authorityRef missing, ruleRef missing, rule not applicable, or authority not applicable.
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

  // Find a matching rule
  for (const rule of authorizedRules) {
    // AuthorityRef and RuleRef must both be non-empty strings (§8)
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

    // Verify target references match
    const ruleTargets = new Set(rule.targetReferences || []);
    const targetsMatch =
      involvedReferences.length > 0 &&
      involvedReferences.every((ref) => ruleTargets.has(ref));

    if (targetsMatch) {
      return deepFreeze({
        status: "RESOLVED",
        diagnostic,
        disposition,
        authorityRef: rule.authorityRef,
        ruleRef: rule.ruleRef,
        result: rule.resolutionResult,
        details: `Resolved by authority '${rule.authorityRef}' under rule '${rule.ruleRef}': ${rule.resolutionResult}`,
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
 * Evaluates composition inputs for deterministic conflicts per AMS-0859 §12, §13, §14.
 * Deterministic, explicit-input-driven, side-effect-free, independent of ambient state/time/randomness.
 */
export function evaluateConflict(
  inputs: ConflictEvaluationInputs,
): ConflictEvaluationResult {
  const {
    versionRequirements,
    contextRequirements,
    evidenceRequirements,
    declarations,
    ambiguousInterpretations,
    authorizedRules,
  } = inputs;

  // 1. Version Conflict Detection (§5.4)
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
        const details = `Incompatible version requirements for '${id}': [${sortedVersions.join(", ")}]`;
        const diag = "VERSION_CONFLICT";
        const disp = mapDiagnosticToDisposition(diag);

        return resolveConflictWithRules(
          diag,
          disp,
          involved,
          details,
          authorizedRules,
        );
      }
    }
  }

  // 2. Semantic Requirement Conflict Detection (§5.2)
  if (declarations && declarations.length > 0) {
    const semMap = new Map<string, Map<string, string[]>>(); // key -> (valueStr -> id[])
    for (const d of declarations) {
      if (d.requirementKey && d.requiredValue !== undefined) {
        if (!semMap.has(d.requirementKey)) {
          semMap.set(d.requirementKey, new Map());
        }
        const valStr = JSON.stringify(d.requiredValue);
        const valMap = semMap.get(d.requirementKey)!;
        if (!valMap.has(valStr)) {
          valMap.set(valStr, []);
        }
        valMap.get(valStr)!.push(d.id);
      }
    }

    for (const [reqKey, valMap] of semMap.entries()) {
      if (valMap.size > 1) {
        const involvedIds = Array.from(valMap.values()).flat().sort();
        const details = `Mutually incompatible requirement values declared for key '${reqKey}' across [${involvedIds.join(", ")}]`;
        const diag = "SEMANTIC_REQUIREMENT_CONFLICT";
        const disp = mapDiagnosticToDisposition(diag);

        return resolveConflictWithRules(
          diag,
          disp,
          involvedIds,
          details,
          authorizedRules,
        );
      }
    }

    // 3. Jurisdiction Conflict Detection (§5.3)
    const jurDeclarations = declarations.filter(
      (d) => d.jurisdiction !== undefined,
    );
    if (jurDeclarations.length > 1) {
      const jurSet = new Set(jurDeclarations.map((d) => d.jurisdiction!));
      if (jurSet.size > 1) {
        const involvedIds = jurDeclarations.map((d) => d.id).sort();
        const details = `Conflicting jurisdictional declarations [${Array.from(jurSet).sort().join(", ")}] across participants [${involvedIds.join(", ")}]`;
        const diag = "JURISDICTION_CONFLICT";
        const disp = mapDiagnosticToDisposition(diag);

        return resolveConflictWithRules(
          diag,
          disp,
          involvedIds,
          details,
          authorizedRules,
        );
      }
    }

    // 4. Authority Conflict Detection (§5.7)
    const authDeclarations = declarations.filter(
      (d) => d.authorityRef !== undefined,
    );
    if (authDeclarations.length > 1) {
      const authSet = new Set(authDeclarations.map((d) => d.authorityRef!));
      if (authSet.size > 1) {
        const involvedIds = authDeclarations.map((d) => d.id).sort();
        const details = `Conflicting authority declarations [${Array.from(authSet).sort().join(", ")}] across participants [${involvedIds.join(", ")}]`;
        const diag = "AUTHORITY_CONFLICT";
        const disp = mapDiagnosticToDisposition(diag);

        return resolveConflictWithRules(
          diag,
          disp,
          involvedIds,
          details,
          authorizedRules,
        );
      }
    }
  }

  // 5. Context Conflict Detection (§5.5)
  if (contextRequirements && contextRequirements.length > 1) {
    const ctxMap = new Map<string, Set<string>>();
    for (const cReq of contextRequirements) {
      if (!ctxMap.has(cReq.key)) {
        ctxMap.set(cReq.key, new Set());
      }
      ctxMap.get(cReq.key)!.add(cReq.value);
    }

    for (const [key, values] of ctxMap.entries()) {
      if (values.size > 1) {
        const sortedValues = Array.from(values).sort();
        const involved = [key];
        const details = `Incompatible context requirement values for key '${key}': [${sortedValues.join(", ")}]`;
        const diag = "CONTEXT_CONFLICT";
        const disp = mapDiagnosticToDisposition(diag);

        return resolveConflictWithRules(
          diag,
          disp,
          involved,
          details,
          authorizedRules,
        );
      }
    }
  }

  // 6. Evidence Conflict Detection (§5.6)
  if (evidenceRequirements && evidenceRequirements.length > 0) {
    for (const eReq of evidenceRequirements) {
      if (eReq.isConflicting || eReq.status === "CONFLICTING") {
        const involved = [eReq.id];
        const details = `Conflicting evidence state declared for evidence '${eReq.id}'`;
        const diag = "EVIDENCE_CONFLICT";
        const disp = mapDiagnosticToDisposition(diag, {
          epistemicStatus: "CONFLICTING",
        });

        return resolveConflictWithRules(
          diag,
          disp,
          involved,
          details,
          authorizedRules,
        );
      }
    }
  }

  // 7. Ambiguity Detection (§5.9)
  if (ambiguousInterpretations && ambiguousInterpretations.length > 0) {
    for (const amb of ambiguousInterpretations) {
      if (amb.candidates && amb.candidates.length > 1) {
        const involved = [amb.key];
        const details = `Ambiguous governed declarations for key '${amb.key}' with candidates [${amb.candidates.slice().sort().join(", ")}]`;
        const diag = "AMBIGUITY";
        const disp = mapDiagnosticToDisposition(diag);

        return resolveConflictWithRules(
          diag,
          disp,
          involved,
          details,
          authorizedRules,
        );
      }
    }
  }

  // 8. Absence Detection (§5.8)
  if (declarations) {
    const missingDecls = declarations.filter((d) => d.isMissing);
    if (missingDecls.length > 0) {
      const involved = missingDecls.map((d) => d.id).sort();
      const details = `Required declarations missing for [${involved.join(", ")}]`;
      const diag = "ABSENCE";
      const disp = mapDiagnosticToDisposition(diag, { isMissing: true });

      return resolveConflictWithRules(
        diag,
        disp,
        involved,
        details,
        authorizedRules,
      );
    }
  }

  return deepFreeze({ status: "NO_CONFLICT" });
}

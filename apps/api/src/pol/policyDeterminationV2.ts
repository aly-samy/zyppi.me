import crypto from "node:crypto";
import {
  canonicalizeJcs,
  verifyEvidenceStateRefV2,
  verifyPolicyUniverseRefV2,
  verifySemanticStateRefV2,
  type ActionSemanticRefV2,
  type BoundConstitutionalStateV2,
  type BoundEvidenceStateV2,
  type BoundPolicyMaterialV2,
  type BoundPolicyUniverseV2,
  type ConstitutionalRefBaseV2,
  type ConstitutionalRefV2,
  type JsonValueV2,
  type OwnerDeterminationBindingV2,
  type OwnerRefV2,
  type ParticipationV2,
  type PolicyRefV2,
  type ProvenanceRefV2,
  type QuestionOperandBindingV2,
  type QuestionSemanticRefV2,
  type RequestedActionBindingV2,
  type RoleBindingV2,
  type RuleRefV2,
  type StateInstanceRefV2,
  type StateSemanticRefV2,
  type TargetRefV2,
  type TargetSlotSemanticRefV2,
} from "@zyppi/domain";
import { produceSecTrustResultV2 } from "../sec/index.js";

export type PolErrorCode =
  | "POL_INPUT_INVALID"
  | "POL_POLICY_UNIVERSE_IDENTITY_FAILED"
  | "POL_EVIDENCE_STATE_IDENTITY_FAILED"
  | "POL_CONSTITUTIONAL_STATE_IDENTITY_FAILED"
  | "POL_POLICY_GRAPH_INVALID"
  | "POL_POLICY_MATERIAL_INVALID"
  | "POL_SEC_DEPENDENCY_INVALID"
  | "POL_AGGREGATE_DEPENDENCY_INVALID"
  | "POL_EVALUATION_FAILED";

export interface IndividualPolicyDecisionV2 {
  readonly policyRef: PolicyRefV2;
  readonly result: "ALLOW" | "DENY" | "INDETERMINATE";
  readonly reasonCodes: readonly string[];
}

export interface PolAggregateOwnerNativeResultV2 {
  readonly aggregateResult: "ALLOW" | "DENY" | "INDETERMINATE";
  readonly policyDecisions: readonly IndividualPolicyDecisionV2[];
}

export interface PolAuthorizationOwnerNativeResultV2 {
  readonly authorizationDecision: "Authorized" | "Denied" | "Deferred";
  readonly reasonCodes: readonly string[];
}

export type PolAggregatePolicyResultProductionV2Result =
  | {
      readonly ok: true;
      readonly determination: OwnerDeterminationBindingV2;
    }
  | {
      readonly ok: false;
      readonly error: {
        readonly code: PolErrorCode;
        readonly message: string;
      };
    };

export type PolAuthorizationProductionV2Result =
  | {
      readonly ok: true;
      readonly determination: OwnerDeterminationBindingV2;
    }
  | {
      readonly ok: false;
      readonly error: {
        readonly code: PolErrorCode;
        readonly message: string;
      };
    };

export interface PolRuleSet01Material {
  readonly ruleset: "POL-POLICY-RULESET-01";
  readonly ruleEffect: "PERMIT" | "PROHIBIT";
  readonly requiredTrustStatuses: readonly (
    "definite" | "probable" | "possible" | "uncertain" | "speculative"
  )[];
  readonly authorization: null | {
    readonly actionSemanticRef: ActionSemanticRefV2;
    readonly authorizedTargets: readonly {
      readonly targetSlotSemanticRef: TargetSlotSemanticRefV2;
      readonly targetRef: TargetRefV2;
    }[];
    readonly requiredPerformerStates: readonly {
      readonly kind: "STANDING_STATE" | "AUTHORITY_STATE" | "CAPABILITY_STATE";
      readonly stateSemanticRef: StateSemanticRefV2;
      readonly exactStateRef: StateInstanceRefV2;
    }[];
  };
}

function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Object.isFrozen(obj)) {
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

function safeCanonicalizeJcs(
  val: unknown,
): { ok: true; value: string } | { ok: false; error: string } {
  try {
    const s = canonicalizeJcs(val);
    return { ok: true, value: s };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function compareUtf16(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function hasOwnProp(obj: unknown, prop: string): boolean {
  return (
    obj !== null &&
    typeof obj === "object" &&
    Object.prototype.hasOwnProperty.call(obj, prop)
  );
}

function isPlainObject(obj: unknown): obj is Record<string, unknown> {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return false;
  }
  const proto = Object.getPrototypeOf(obj);
  return proto === null || proto === Object.prototype;
}

function refEquals(a: unknown, b: unknown): boolean {
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  const resA = safeCanonicalizeJcs(a);
  const resB = safeCanonicalizeJcs(b);
  return resA.ok && resB.ok && resA.value === resB.value;
}

function isValidConstitutionalRef(ref: unknown, family?: string): boolean {
  if (!isPlainObject(ref)) return false;
  const allowedRefKeys = new Set([
    "family",
    "ownerRef",
    "artifactId",
    "version",
    "stateRef",
    "provenanceRef",
  ]);
  for (const k of Reflect.ownKeys(ref)) {
    if (typeof k !== "string" || !allowedRefKeys.has(k)) {
      return false;
    }
  }

  const r = ref as Record<string, unknown>;
  if (typeof r.family !== "string" || r.family.trim() === "") return false;
  if (family !== undefined && r.family !== family) return false;
  if (typeof r.ownerRef !== "string" || r.ownerRef.trim() === "") return false;
  if (typeof r.artifactId !== "string" || r.artifactId.trim() === "")
    return false;

  if (
    hasOwnProp(r, "version") &&
    (typeof r.version !== "string" || r.version.trim() === "")
  )
    return false;
  if (
    hasOwnProp(r, "stateRef") &&
    (typeof r.stateRef !== "string" || r.stateRef.trim() === "")
  )
    return false;
  if (
    hasOwnProp(r, "provenanceRef") &&
    (typeof r.provenanceRef !== "string" || r.provenanceRef.trim() === "")
  )
    return false;

  return true;
}

function parseAndValidateRuleSet01Material(
  material: unknown,
):
  | { ok: true; kind: "RULESET_01"; data: PolRuleSet01Material }
  | { ok: true; kind: "UNSUPPORTED"; ruleset: string }
  | { ok: false; error: string } {
  if (!isPlainObject(material)) {
    return { ok: false, error: "Policy material must be a plain JSON object." };
  }

  if (!hasOwnProp(material, "ruleset")) {
    return {
      ok: false,
      error: "Policy material missing own property 'ruleset'.",
    };
  }

  if (typeof material.ruleset !== "string" || material.ruleset.trim() === "") {
    return { ok: false, error: "'ruleset' must be a non-empty string." };
  }

  if (material.ruleset !== "POL-POLICY-RULESET-01") {
    return { ok: true, kind: "UNSUPPORTED", ruleset: material.ruleset };
  }

  // Material declares ruleset = POL-POLICY-RULESET-01
  // Enforce closed-world top-level own-key set: ruleset, ruleEffect, requiredTrustStatuses, authorization
  const allowedMaterialKeys = new Set([
    "ruleset",
    "ruleEffect",
    "requiredTrustStatuses",
    "authorization",
  ]);
  for (const k of Reflect.ownKeys(material)) {
    if (typeof k !== "string" || !allowedMaterialKeys.has(k)) {
      return {
        ok: false,
        error: `RuleSet01 material contains unadmitted own property '${String(k)}'.`,
      };
    }
  }

  if (
    !hasOwnProp(material, "ruleEffect") ||
    !hasOwnProp(material, "requiredTrustStatuses") ||
    !hasOwnProp(material, "authorization")
  ) {
    return {
      ok: false,
      error:
        "RuleSet01 material must have own properties 'ruleEffect', 'requiredTrustStatuses', and 'authorization'.",
    };
  }

  const { ruleEffect, requiredTrustStatuses, authorization } = material;

  if (ruleEffect !== "PERMIT" && ruleEffect !== "PROHIBIT") {
    return {
      ok: false,
      error: "'ruleEffect' must be 'PERMIT' or 'PROHIBIT'.",
    };
  }

  if (!Array.isArray(requiredTrustStatuses)) {
    return {
      ok: false,
      error: "'requiredTrustStatuses' must be an array.",
    };
  }

  const validTrustStatuses = new Set([
    "definite",
    "probable",
    "possible",
    "uncertain",
    "speculative",
  ]);

  const seenStatuses = new Set<string>();
  for (const st of requiredTrustStatuses) {
    if (typeof st !== "string" || !validTrustStatuses.has(st)) {
      return {
        ok: false,
        error: `Invalid trust status '${String(st)}'.`,
      };
    }
    if (seenStatuses.has(st)) {
      return {
        ok: false,
        error: `Duplicate trust status '${st}' in requiredTrustStatuses.`,
      };
    }
    seenStatuses.add(st);
  }

  if (ruleEffect === "PROHIBIT") {
    if (requiredTrustStatuses.length > 0 || authorization !== null) {
      return {
        ok: false,
        error:
          "PROHIBIT rule must have requiredTrustStatuses = [] and authorization = null.",
      };
    }
    return {
      ok: true,
      kind: "RULESET_01",
      data: {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PROHIBIT",
        requiredTrustStatuses: [],
        authorization: null,
      },
    };
  }

  // ruleEffect === "PERMIT"
  if (authorization !== null) {
    if (!isPlainObject(authorization)) {
      return {
        ok: false,
        error: "'authorization' must be null or a plain object.",
      };
    }

    // Enforce closed-world keys on authorization object
    const allowedAuthKeys = new Set([
      "actionSemanticRef",
      "authorizedTargets",
      "requiredPerformerStates",
    ]);
    for (const k of Reflect.ownKeys(authorization)) {
      if (typeof k !== "string" || !allowedAuthKeys.has(k)) {
        return {
          ok: false,
          error: `authorization object contains unadmitted own property '${String(k)}'.`,
        };
      }
    }

    if (
      !hasOwnProp(authorization, "actionSemanticRef") ||
      !hasOwnProp(authorization, "authorizedTargets") ||
      !hasOwnProp(authorization, "requiredPerformerStates")
    ) {
      return {
        ok: false,
        error:
          "authorization object must have own properties 'actionSemanticRef', 'authorizedTargets', and 'requiredPerformerStates'.",
      };
    }

    if (
      !isValidConstitutionalRef(
        authorization.actionSemanticRef,
        "ACTION_SEMANTIC",
      )
    ) {
      return {
        ok: false,
        error: "authorization.actionSemanticRef is malformed or invalid.",
      };
    }

    if (!Array.isArray(authorization.authorizedTargets)) {
      return {
        ok: false,
        error: "authorization.authorizedTargets must be an array.",
      };
    }

    const seenTargets = new Set<string>();
    const parsedTargets: {
      targetSlotSemanticRef: TargetSlotSemanticRefV2;
      targetRef: TargetRefV2;
    }[] = [];

    for (const tgt of authorization.authorizedTargets) {
      if (!isPlainObject(tgt)) {
        return {
          ok: false,
          error: "Element in authorizedTargets must be a plain object.",
        };
      }

      // Enforce closed-world keys on authorizedTarget entry
      const allowedTgtKeys = new Set(["targetSlotSemanticRef", "targetRef"]);
      for (const k of Reflect.ownKeys(tgt)) {
        if (typeof k !== "string" || !allowedTgtKeys.has(k)) {
          return {
            ok: false,
            error: `authorizedTarget entry contains unadmitted own property '${String(k)}'.`,
          };
        }
      }

      if (
        !hasOwnProp(tgt, "targetSlotSemanticRef") ||
        !hasOwnProp(tgt, "targetRef")
      ) {
        return {
          ok: false,
          error:
            "Element in authorizedTargets missing own property 'targetSlotSemanticRef' or 'targetRef'.",
        };
      }
      if (
        !isValidConstitutionalRef(
          tgt.targetSlotSemanticRef,
          "TARGET_SLOT_SEMANTIC",
        )
      ) {
        return {
          ok: false,
          error: "targetSlotSemanticRef in authorizedTargets is malformed.",
        };
      }
      if (!isValidConstitutionalRef(tgt.targetRef, "TARGET")) {
        return {
          ok: false,
          error: "targetRef in authorizedTargets is malformed.",
        };
      }

      const keyRes = safeCanonicalizeJcs(tgt);
      if (!keyRes.ok) {
        return {
          ok: false,
          error: "Failed to canonicalize authorized target.",
        };
      }
      if (seenTargets.has(keyRes.value)) {
        return {
          ok: false,
          error: "Duplicate authorized target entry in policy material.",
        };
      }
      seenTargets.add(keyRes.value);
      parsedTargets.push({
        targetSlotSemanticRef:
          tgt.targetSlotSemanticRef as unknown as TargetSlotSemanticRefV2,
        targetRef: tgt.targetRef as unknown as TargetRefV2,
      });
    }

    if (!Array.isArray(authorization.requiredPerformerStates)) {
      return {
        ok: false,
        error: "authorization.requiredPerformerStates must be an array.",
      };
    }

    const seenStates = new Set<string>();
    const parsedStates: {
      kind: "STANDING_STATE" | "AUTHORITY_STATE" | "CAPABILITY_STATE";
      stateSemanticRef: StateSemanticRefV2;
      exactStateRef: StateInstanceRefV2;
    }[] = [];

    for (const reqSt of authorization.requiredPerformerStates) {
      if (!isPlainObject(reqSt)) {
        return {
          ok: false,
          error: "Element in requiredPerformerStates must be a plain object.",
        };
      }

      // Enforce closed-world keys on requiredPerformerState entry
      const allowedStateKeys = new Set([
        "kind",
        "stateSemanticRef",
        "exactStateRef",
      ]);
      for (const k of Reflect.ownKeys(reqSt)) {
        if (typeof k !== "string" || !allowedStateKeys.has(k)) {
          return {
            ok: false,
            error: `requiredPerformerState entry contains unadmitted own property '${String(k)}'.`,
          };
        }
      }

      if (
        !hasOwnProp(reqSt, "kind") ||
        !hasOwnProp(reqSt, "stateSemanticRef") ||
        !hasOwnProp(reqSt, "exactStateRef")
      ) {
        return {
          ok: false,
          error:
            "Element in requiredPerformerStates missing own property 'kind', 'stateSemanticRef', or 'exactStateRef'.",
        };
      }

      if (
        reqSt.kind !== "STANDING_STATE" &&
        reqSt.kind !== "AUTHORITY_STATE" &&
        reqSt.kind !== "CAPABILITY_STATE"
      ) {
        return {
          ok: false,
          error:
            "kind in requiredPerformerStates must be 'STANDING_STATE', 'AUTHORITY_STATE', or 'CAPABILITY_STATE'.",
        };
      }

      if (!isValidConstitutionalRef(reqSt.stateSemanticRef, "STATE_SEMANTIC")) {
        return {
          ok: false,
          error: "stateSemanticRef in requiredPerformerStates is malformed.",
        };
      }
      if (!isValidConstitutionalRef(reqSt.exactStateRef, "STATE_INSTANCE")) {
        return {
          ok: false,
          error: "exactStateRef in requiredPerformerStates is malformed.",
        };
      }

      const keyRes = safeCanonicalizeJcs(reqSt);
      if (!keyRes.ok) {
        return {
          ok: false,
          error: "Failed to canonicalize requiredPerformerState requirement.",
        };
      }
      if (seenStates.has(keyRes.value)) {
        return {
          ok: false,
          error:
            "Duplicate requiredPerformerStates requirement entry in policy material.",
        };
      }
      seenStates.add(keyRes.value);
      parsedStates.push({
        kind: reqSt.kind,
        stateSemanticRef:
          reqSt.stateSemanticRef as unknown as StateSemanticRefV2,
        exactStateRef: reqSt.exactStateRef as unknown as StateInstanceRefV2,
      });
    }

    return {
      ok: true,
      kind: "RULESET_01",
      data: {
        ruleset: "POL-POLICY-RULESET-01",
        ruleEffect: "PERMIT",
        requiredTrustStatuses: requiredTrustStatuses as (
          "definite" | "probable" | "possible" | "uncertain" | "speculative"
        )[],
        authorization: {
          actionSemanticRef:
            authorization.actionSemanticRef as unknown as ActionSemanticRefV2,
          authorizedTargets: parsedTargets,
          requiredPerformerStates: parsedStates,
        },
      },
    };
  }

  return {
    ok: true,
    kind: "RULESET_01",
    data: {
      ruleset: "POL-POLICY-RULESET-01",
      ruleEffect: "PERMIT",
      requiredTrustStatuses: requiredTrustStatuses as (
        "definite" | "probable" | "possible" | "uncertain" | "speculative"
      )[],
      authorization: null,
    },
  };
}

interface ProcessedPolicyNode {
  policyKey: string;
  policyRef: PolicyRefV2;
  canonRefKey: string;
  parsedMaterial:
    | { kind: "RULESET_01"; data: PolRuleSet01Material }
    | { kind: "UNSUPPORTED"; ruleset: string };
}

function traversePolicyGraphDeterministically(
  materials: readonly BoundPolicyMaterialV2[],
  topology: {
    dependencyEdges: readonly {
      dependeePolicyRef: PolicyRefV2;
      dependentPolicyRef: PolicyRefV2;
    }[];
  },
):
  | { ok: true; orderedNodes: ProcessedPolicyNode[] }
  | { ok: false; error: string } {
  const nodeMap = new Map<string, ProcessedPolicyNode>();

  for (const mat of materials) {
    if (!mat || typeof mat !== "object" || !mat.policyRef) {
      return {
        ok: false,
        error: "BoundPolicyMaterialV2 entry is missing policyRef.",
      };
    }
    const cRes = safeCanonicalizeJcs(mat.policyRef);
    if (!cRes.ok) {
      return { ok: false, error: "Failed to canonicalize PolicyRefV2." };
    }
    const refKeyStr = cRes.value;
    if (nodeMap.has(refKeyStr)) {
      return {
        ok: false,
        error: "Duplicate PolicyRefV2 in applicablePolicyMaterial.",
      };
    }

    const parsedMatRes = parseAndValidateRuleSet01Material(mat.material);
    if (!parsedMatRes.ok) {
      return { ok: false, error: parsedMatRes.error };
    }

    const node: ProcessedPolicyNode = {
      policyKey: mat.policyKey,
      policyRef: mat.policyRef,
      canonRefKey: refKeyStr,
      parsedMaterial: parsedMatRes,
    };
    nodeMap.set(refKeyStr, node);
  }

  // Build DAG
  // Edge: dependeePolicyRef -> dependentPolicyRef (dependee must be evaluated before dependent)
  const inDegree = new Map<string, number>();
  const adj = new Map<string, Set<string>>();

  for (const key of nodeMap.keys()) {
    inDegree.set(key, 0);
    adj.set(key, new Set());
  }

  for (const edge of topology.dependencyEdges || []) {
    const cDependee = safeCanonicalizeJcs(edge.dependeePolicyRef);
    const cDependent = safeCanonicalizeJcs(edge.dependentPolicyRef);
    if (!cDependee.ok || !cDependent.ok) {
      return {
        ok: false,
        error: "Malformed policy dependency edge PolicyRefV2.",
      };
    }

    const dependeeKey = cDependee.value;
    const dependentKey = cDependent.value;

    if (!nodeMap.has(dependeeKey) || !nodeMap.has(dependentKey)) {
      return {
        ok: false,
        error:
          "Policy dependency edge references policy not in applicablePolicyMaterial.",
      };
    }

    const targets = adj.get(dependeeKey)!;
    if (!targets.has(dependentKey)) {
      targets.add(dependentKey);
      inDegree.set(dependentKey, inDegree.get(dependentKey)! + 1);
    }
  }

  const ready: string[] = [];
  for (const [key, deg] of inDegree.entries()) {
    if (deg === 0) {
      ready.push(key);
    }
  }

  const orderedNodes: ProcessedPolicyNode[] = [];

  while (ready.length > 0) {
    ready.sort(compareUtf16);
    const currKey = ready.shift()!;
    orderedNodes.push(nodeMap.get(currKey)!);

    for (const neighborKey of adj.get(currKey)!) {
      const newDeg = inDegree.get(neighborKey)! - 1;
      inDegree.set(neighborKey, newDeg);
      if (newDeg === 0) {
        ready.push(neighborKey);
      }
    }
  }

  if (orderedNodes.length !== nodeMap.size) {
    return { ok: false, error: "Cycle detected in policy dependency graph." };
  }

  return { ok: true, orderedNodes };
}

export function producePolAggregatePolicyResultV2(
  input: unknown,
): PolAggregatePolicyResultProductionV2Result {
  if (
    input === null ||
    typeof input !== "object" ||
    Array.isArray(input) ||
    !hasOwnProp(input, "policyUniverse") ||
    !hasOwnProp(input, "requestedAction") ||
    !hasOwnProp(input, "evidenceState") ||
    !hasOwnProp(input, "tEInput")
  ) {
    return {
      ok: false,
      error: {
        code: "POL_INPUT_INVALID",
        message:
          "Input must be an object with own properties 'policyUniverse', 'requestedAction', 'evidenceState', and 'tEInput'.",
      },
    };
  }

  const { policyUniverse, requestedAction, evidenceState, tEInput } = input as {
    policyUniverse?: unknown;
    requestedAction?: unknown;
    evidenceState?: unknown;
    tEInput?: unknown;
  };

  const secTrustResultSupplied = hasOwnProp(input, "secTrustResult");
  const secTrustResult = secTrustResultSupplied
    ? (input as Record<string, unknown>).secTrustResult
    : undefined;

  if (typeof tEInput !== "string" || tEInput.trim() === "") {
    return {
      ok: false,
      error: {
        code: "POL_INPUT_INVALID",
        message: "'tEInput' must be a non-empty string.",
      },
    };
  }

  if (!isPlainObject(policyUniverse)) {
    return {
      ok: false,
      error: {
        code: "POL_INPUT_INVALID",
        message: "'policyUniverse' must be a valid plain object.",
      },
    };
  }

  if (!isPlainObject(requestedAction)) {
    return {
      ok: false,
      error: {
        code: "POL_INPUT_INVALID",
        message: "'requestedAction' must be a valid plain object.",
      },
    };
  }

  if (!isPlainObject(evidenceState)) {
    return {
      ok: false,
      error: {
        code: "POL_INPUT_INVALID",
        message: "'evidenceState' must be a valid plain object.",
      },
    };
  }

  const boundPolicyUniverse =
    policyUniverse as unknown as BoundPolicyUniverseV2;
  const boundEvidenceState = evidenceState as unknown as BoundEvidenceStateV2;
  const boundRequestedAction =
    requestedAction as unknown as RequestedActionBindingV2;

  // Verify identity claims
  const puIdentityCheck = verifyPolicyUniverseRefV2(boundPolicyUniverse);
  if (!puIdentityCheck.ok) {
    return {
      ok: false,
      error: {
        code: "POL_POLICY_UNIVERSE_IDENTITY_FAILED",
        message: `Policy universe identity verification failed: ${puIdentityCheck.error.message}`,
      },
    };
  }

  const esIdentityCheck = verifyEvidenceStateRefV2(boundEvidenceState);
  if (!esIdentityCheck.ok) {
    return {
      ok: false,
      error: {
        code: "POL_EVIDENCE_STATE_IDENTITY_FAILED",
        message: `Evidence state identity verification failed: ${esIdentityCheck.error.message}`,
      },
    };
  }

  // Traversal & evaluation
  const graphRes = traversePolicyGraphDeterministically(
    boundPolicyUniverse.applicablePolicyMaterial || [],
    boundPolicyUniverse.dependencyTopology || { dependencyEdges: [] },
  );

  if (!graphRes.ok) {
    return {
      ok: false,
      error: {
        code: "POL_POLICY_MATERIAL_INVALID",
        message: `Policy material/graph invalid: ${graphRes.error}`,
      },
    };
  }

  const { orderedNodes } = graphRes;

  // Check if any PERMIT policy requires SEC
  let secRequiredByAny = false;
  for (const node of orderedNodes) {
    if (
      node.parsedMaterial.kind === "RULESET_01" &&
      node.parsedMaterial.data.ruleEffect === "PERMIT" &&
      node.parsedMaterial.data.requiredTrustStatuses.length > 0
    ) {
      secRequiredByAny = true;
      break;
    }
  }

  // A2: Distinguish absent SEC dependency from invalid supplied SEC dependency
  let verifiedSecBinding: OwnerDeterminationBindingV2 | null = null;
  if (secRequiredByAny) {
    if (!secTrustResultSupplied) {
      // secTrustResult property was NOT supplied on input -> absent dependency
      // verifiedSecBinding remains null; policies requiring SEC yield INDETERMINATE with reason SEC_TRUST_RESULT_MISSING
    } else {
      // secTrustResult property WAS explicitly supplied on input
      if (
        secTrustResult === undefined ||
        secTrustResult === null ||
        !isPlainObject(secTrustResult)
      ) {
        return {
          ok: false,
          error: {
            code: "POL_SEC_DEPENDENCY_INVALID",
            message:
              "Explicitly supplied secTrustResult is null or not a valid object.",
          },
        };
      }

      const secBinding =
        secTrustResult as unknown as OwnerDeterminationBindingV2;

      // 1. Owner verification
      if (
        !secBinding.constitutionalOwnerRef ||
        secBinding.constitutionalOwnerRef.family !== "OWNER" ||
        secBinding.constitutionalOwnerRef.ownerRef !==
          "urn:zyppi:owner:sec:v1" ||
        secBinding.constitutionalOwnerRef.artifactId !== "SEC-001"
      ) {
        return {
          ok: false,
          error: {
            code: "POL_SEC_DEPENDENCY_INVALID",
            message:
              "Supplied secTrustResult constitutionalOwnerRef is invalid.",
          },
        };
      }

      // 2. Question operand correspondence
      const operands =
        secBinding.determinationQuestionBinding?.questionOperandBindings || [];
      const evOp = operands.find((op) => op.operandKind === "EVIDENCE_STATE");
      if (!evOp || evOp.operandKind !== "EVIDENCE_STATE") {
        return {
          ok: false,
          error: {
            code: "POL_SEC_DEPENDENCY_INVALID",
            message:
              "Supplied secTrustResult missing EVIDENCE_STATE question operand.",
          },
        };
      }
      if (evOp.evidenceStateRef !== boundEvidenceState.evidenceStateRef) {
        return {
          ok: false,
          error: {
            code: "POL_SEC_DEPENDENCY_INVALID",
            message:
              "Supplied secTrustResult EVIDENCE_STATE operand mismatch with bound evidence state.",
          },
        };
      }

      // 3. Assessed coordinate
      if (secBinding.assessedAtCoordinateRef !== "tEInput") {
        return {
          ok: false,
          error: {
            code: "POL_SEC_DEPENDENCY_INVALID",
            message:
              "Supplied secTrustResult assessedAtCoordinateRef is not 'tEInput'.",
          },
        };
      }

      // 4. Recompute SEC determination
      const recomputedSecRes = produceSecTrustResultV2({
        evidenceState: boundEvidenceState,
        tEInput,
      });

      if (!recomputedSecRes.ok) {
        return {
          ok: false,
          error: {
            code: "POL_SEC_DEPENDENCY_INVALID",
            message: `SEC recomputation failed: ${recomputedSecRes.error.message}`,
          },
        };
      }

      // 5. Require exact equality
      if (
        secBinding.determinationBindingKey !==
          recomputedSecRes.determination.determinationBindingKey ||
        !refEquals(secBinding, recomputedSecRes.determination)
      ) {
        return {
          ok: false,
          error: {
            code: "POL_SEC_DEPENDENCY_INVALID",
            message:
              "Supplied secTrustResult does not match recomputed SEC determination.",
          },
        };
      }

      verifiedSecBinding = secBinding;
    }
  }

  // Evaluate policies in topological order
  const policyDecisions: IndividualPolicyDecisionV2[] = [];

  for (const node of orderedNodes) {
    if (node.parsedMaterial.kind === "UNSUPPORTED") {
      policyDecisions.push({
        policyRef: node.policyRef,
        result: "INDETERMINATE",
        reasonCodes: ["UNSUPPORTED_POLICY_RULESET"],
      });
      continue;
    }

    const rule = node.parsedMaterial.data;

    if (rule.ruleEffect === "PROHIBIT") {
      policyDecisions.push({
        policyRef: node.policyRef,
        result: "DENY",
        reasonCodes: ["POLICY_PROHIBITION"],
      });
      continue;
    }

    // PERMIT rule
    if (rule.requiredTrustStatuses.length > 0) {
      if (!verifiedSecBinding) {
        policyDecisions.push({
          policyRef: node.policyRef,
          result: "INDETERMINATE",
          reasonCodes: ["SEC_TRUST_RESULT_MISSING"],
        });
        continue;
      }

      const secNative = verifiedSecBinding.ownerNativeResult as unknown as {
        trustStatus: string;
      };
      const actualStatus = secNative.trustStatus;

      if (
        !rule.requiredTrustStatuses.includes(
          actualStatus as
            "definite" | "probable" | "possible" | "uncertain" | "speculative",
        )
      ) {
        policyDecisions.push({
          policyRef: node.policyRef,
          result: "DENY",
          reasonCodes: ["SEC_TRUST_REQUIREMENT_NOT_SATISFIED"],
        });
        continue;
      }
    }

    policyDecisions.push({
      policyRef: node.policyRef,
      result: "ALLOW",
      reasonCodes: [],
    });
  }

  // Aggregate Precedence: DENY > INDETERMINATE > ALLOW
  // Empty set -> ALLOW
  let aggregateResult: "ALLOW" | "DENY" | "INDETERMINATE" = "ALLOW";
  if (policyDecisions.some((d) => d.result === "DENY")) {
    aggregateResult = "DENY";
  } else if (policyDecisions.some((d) => d.result === "INDETERMINATE")) {
    aggregateResult = "INDETERMINATE";
  }

  const ownerNativeResult: PolAggregateOwnerNativeResultV2 = {
    aggregateResult,
    policyDecisions,
  };

  const preimage = {
    ownerRef: "urn:zyppi:owner:pol:v1",
    ruleRef: "POL-AGGREGATE-RULESET-01",
    policyUniverseRef: boundPolicyUniverse.policyUniverseRef,
    requestedAction: boundRequestedAction,
    tEInput,
    secDependencyBindingKey: verifiedSecBinding
      ? verifiedSecBinding.determinationBindingKey
      : null,
    aggregateResult,
    policyDecisions,
  };

  const preimageCanon = safeCanonicalizeJcs(preimage);
  if (!preimageCanon.ok) {
    return {
      ok: false,
      error: {
        code: "POL_EVALUATION_FAILED",
        message: `Failed to canonicalize Aggregate determination preimage: ${preimageCanon.error}`,
      },
    };
  }

  const rawHex = crypto
    .createHash("sha256")
    .update(`zyppi:pol:aggregate:v1:${preimageCanon.value}`, "utf8")
    .digest("hex")
    .toLowerCase();

  const constitutionalOwnerRef: OwnerRefV2 = {
    family: "OWNER",
    ownerRef: "urn:zyppi:owner:pol:v1",
    artifactId: "POL-001",
  };

  const exactStateRef: ConstitutionalRefV2 = {
    family: "STATE_INSTANCE",
    ownerRef: "urn:zyppi:owner:pol:v1",
    artifactId: `pol-aggregate-state:${rawHex}`,
  };

  const exactRuleRef: RuleRefV2 = {
    family: "RULE",
    ownerRef: "urn:zyppi:owner:pol:v1",
    artifactId: "POL-AGGREGATE-RULESET-01",
  };

  const provenanceRef: ProvenanceRefV2 = {
    family: "PROVENANCE",
    ownerRef: "urn:zyppi:owner:pol:v1",
    artifactId: `pol-aggregate-provenance:${rawHex}`,
  };

  const questionSemanticRef: QuestionSemanticRefV2 = {
    family: "QUESTION_SEMANTIC",
    ownerRef: "urn:zyppi:owner:pol:v1",
    artifactId: "POL-AGGREGATE-QUESTION-01",
  };

  const questionOperandBindings: QuestionOperandBindingV2[] = [
    {
      operandKey: "op:pol:policy_universe:1",
      operandSlotSemanticRef: {
        family: "EVALUATION_SEMANTIC",
        ownerRef: "urn:zyppi:owner:pol:v1",
        artifactId: "POL-POLICY-UNIVERSE-OPERAND-01",
      },
      operandKind: "POLICY_UNIVERSE",
      policyUniverseRef: boundPolicyUniverse.policyUniverseRef,
    },
    {
      operandKey: "op:pol:requested_action:1",
      operandSlotSemanticRef: {
        family: "EVALUATION_SEMANTIC",
        ownerRef: "urn:zyppi:owner:pol:v1",
        artifactId: "POL-REQUESTED-ACTION-OPERAND-01",
      },
      operandKind: "REQUESTED_ACTION",
      requestedActionRef: "REQUESTED_ACTION",
    },
  ];

  if (verifiedSecBinding) {
    questionOperandBindings.push({
      operandKey: "op:pol:sec_dependency:1",
      operandSlotSemanticRef: {
        family: "EVALUATION_SEMANTIC",
        ownerRef: "urn:zyppi:owner:pol:v1",
        artifactId: "POL-SEC-DEPENDENCY-OPERAND-01",
      },
      operandKind: "OWNER_DETERMINATION",
      ownerDeterminationBindingRef: verifiedSecBinding.determinationBindingKey,
    });
  }

  const determinationDependencyDeclaration = verifiedSecBinding
    ? {
        kind: "EXPLICIT" as const,
        dependencyRefs: [verifiedSecBinding.determinationBindingKey],
      }
    : {
        kind: "AUTHORITATIVELY_NONE" as const,
      };

  const determination: OwnerDeterminationBindingV2 = {
    determinationBindingKey: `pol:aggregate:${rawHex}`,
    determinationQuestionBinding: {
      questionSemanticRef,
      questionOperandBindings,
    },
    constitutionalOwnerRef,
    ownerNativeResult: ownerNativeResult as unknown as JsonValueV2,
    exactStateRef,
    exactRuleRef,
    assessedAtCoordinateRef: "tEInput",
    provenanceRef,
    determinationDependencyDeclaration,
  };

  return {
    ok: true,
    determination: deepFreeze(determination),
  };
}

export function producePolAuthorizationV2(
  input: unknown,
): PolAuthorizationProductionV2Result {
  if (
    input === null ||
    typeof input !== "object" ||
    Array.isArray(input) ||
    !hasOwnProp(input, "policyUniverse") ||
    !hasOwnProp(input, "requestedAction") ||
    !hasOwnProp(input, "participation") ||
    !hasOwnProp(input, "constitutionalState") ||
    !hasOwnProp(input, "evidenceState") ||
    !hasOwnProp(input, "tEInput") ||
    !hasOwnProp(input, "policyAggregate")
  ) {
    return {
      ok: false,
      error: {
        code: "POL_INPUT_INVALID",
        message:
          "Input must be an object with own properties 'policyUniverse', 'requestedAction', 'participation', 'constitutionalState', 'evidenceState', 'tEInput', and 'policyAggregate'.",
      },
    };
  }

  const {
    policyUniverse,
    requestedAction,
    participation,
    constitutionalState,
    evidenceState,
    tEInput,
    policyAggregate,
  } = input as {
    policyUniverse?: unknown;
    requestedAction?: unknown;
    participation?: unknown;
    constitutionalState?: unknown;
    evidenceState?: unknown;
    tEInput?: unknown;
    policyAggregate?: unknown;
  };

  const secTrustResult = hasOwnProp(input, "secTrustResult")
    ? (input as Record<string, unknown>).secTrustResult
    : undefined;

  if (typeof tEInput !== "string" || tEInput.trim() === "") {
    return {
      ok: false,
      error: {
        code: "POL_INPUT_INVALID",
        message: "'tEInput' must be a non-empty string.",
      },
    };
  }

  if (!isPlainObject(policyUniverse)) {
    return {
      ok: false,
      error: {
        code: "POL_INPUT_INVALID",
        message: "'policyUniverse' must be a valid plain object.",
      },
    };
  }

  if (!isPlainObject(requestedAction)) {
    return {
      ok: false,
      error: {
        code: "POL_INPUT_INVALID",
        message: "'requestedAction' must be a valid plain object.",
      },
    };
  }

  if (!isPlainObject(participation)) {
    return {
      ok: false,
      error: {
        code: "POL_INPUT_INVALID",
        message: "'participation' must be a valid plain object.",
      },
    };
  }

  if (!isPlainObject(constitutionalState)) {
    return {
      ok: false,
      error: {
        code: "POL_INPUT_INVALID",
        message: "'constitutionalState' must be a valid plain object.",
      },
    };
  }

  if (!isPlainObject(evidenceState)) {
    return {
      ok: false,
      error: {
        code: "POL_INPUT_INVALID",
        message: "'evidenceState' must be a valid plain object.",
      },
    };
  }

  if (!isPlainObject(policyAggregate)) {
    return {
      ok: false,
      error: {
        code: "POL_INPUT_INVALID",
        message: "'policyAggregate' must be a valid plain object.",
      },
    };
  }

  const boundPolicyUniverse =
    policyUniverse as unknown as BoundPolicyUniverseV2;
  const boundEvidenceState = evidenceState as unknown as BoundEvidenceStateV2;
  const boundConstitutionalState =
    constitutionalState as unknown as BoundConstitutionalStateV2;
  const boundRequestedAction =
    requestedAction as unknown as RequestedActionBindingV2;
  const boundParticipation = participation as unknown as ParticipationV2;
  const suppliedAggregateBinding =
    policyAggregate as unknown as OwnerDeterminationBindingV2;

  // Identity gates
  const puCheck = verifyPolicyUniverseRefV2(boundPolicyUniverse);
  if (!puCheck.ok) {
    return {
      ok: false,
      error: {
        code: "POL_POLICY_UNIVERSE_IDENTITY_FAILED",
        message: `Policy universe identity verification failed: ${puCheck.error.message}`,
      },
    };
  }

  const esCheck = verifyEvidenceStateRefV2(boundEvidenceState);
  if (!esCheck.ok) {
    return {
      ok: false,
      error: {
        code: "POL_EVIDENCE_STATE_IDENTITY_FAILED",
        message: `Evidence state identity verification failed: ${esCheck.error.message}`,
      },
    };
  }

  const csCheck = verifySemanticStateRefV2(boundConstitutionalState);
  if (!csCheck.ok) {
    return {
      ok: false,
      error: {
        code: "POL_CONSTITUTIONAL_STATE_IDENTITY_FAILED",
        message: `Constitutional state identity verification failed: ${csCheck.error.message}`,
      },
    };
  }

  // Verify suppliedAggregateBinding
  if (
    !suppliedAggregateBinding.constitutionalOwnerRef ||
    suppliedAggregateBinding.constitutionalOwnerRef.family !== "OWNER" ||
    suppliedAggregateBinding.constitutionalOwnerRef.ownerRef !==
      "urn:zyppi:owner:pol:v1" ||
    suppliedAggregateBinding.constitutionalOwnerRef.artifactId !== "POL-001" ||
    !suppliedAggregateBinding.exactRuleRef ||
    suppliedAggregateBinding.exactRuleRef.artifactId !==
      "POL-AGGREGATE-RULESET-01"
  ) {
    return {
      ok: false,
      error: {
        code: "POL_AGGREGATE_DEPENDENCY_INVALID",
        message: "Supplied policyAggregate owner or rule ref is invalid.",
      },
    };
  }

  // Recompute Aggregate determination
  const recomputedAggregateRes = producePolAggregatePolicyResultV2({
    policyUniverse: boundPolicyUniverse,
    requestedAction: boundRequestedAction,
    evidenceState: boundEvidenceState,
    tEInput,
    ...(secTrustResult ? { secTrustResult } : {}),
  });

  if (!recomputedAggregateRes.ok) {
    return {
      ok: false,
      error: {
        code: "POL_AGGREGATE_DEPENDENCY_INVALID",
        message: `Aggregate recomputation failed: ${recomputedAggregateRes.error.message}`,
      },
    };
  }

  if (
    suppliedAggregateBinding.determinationBindingKey !==
      recomputedAggregateRes.determination.determinationBindingKey ||
    !refEquals(suppliedAggregateBinding, recomputedAggregateRes.determination)
  ) {
    return {
      ok: false,
      error: {
        code: "POL_AGGREGATE_DEPENDENCY_INVALID",
        message:
          "Supplied policyAggregate does not match recomputed Aggregate determination.",
      },
    };
  }

  // Map Aggregate Result to Authorization basis
  const aggResult = (
    suppliedAggregateBinding.ownerNativeResult as unknown as PolAggregateOwnerNativeResultV2
  ).aggregateResult;

  if (aggResult === "DENY") {
    return buildAuthorizationSuccessResult({
      authorizationDecision: "Denied",
      reasonCodes: ["POLICY_AGGREGATE_DENY"],
      boundPolicyUniverse,
      boundRequestedAction,
      boundConstitutionalState,
      suppliedAggregateBinding,
      tEInput,
      usedRoleBindingKeys: [],
      resolvedPerformerParticipation: [],
    });
  }

  if (aggResult === "INDETERMINATE") {
    return buildAuthorizationSuccessResult({
      authorizationDecision: "Deferred",
      reasonCodes: ["POLICY_AGGREGATE_INDETERMINATE"],
      boundPolicyUniverse,
      boundRequestedAction,
      boundConstitutionalState,
      suppliedAggregateBinding,
      tEInput,
      usedRoleBindingKeys: [],
      resolvedPerformerParticipation: [],
    });
  }

  // Aggregate result is ALLOW -> evaluate contributing authorization clauses
  const graphRes = traversePolicyGraphDeterministically(
    boundPolicyUniverse.applicablePolicyMaterial || [],
    boundPolicyUniverse.dependencyTopology || { dependencyEdges: [] },
  );

  if (!graphRes.ok) {
    return {
      ok: false,
      error: {
        code: "POL_POLICY_MATERIAL_INVALID",
        message: `Policy graph invalid: ${graphRes.error}`,
      },
    };
  }

  const contributingClauses: NonNullable<
    PolRuleSet01Material["authorization"]
  >[] = [];
  for (const node of graphRes.orderedNodes) {
    if (
      node.parsedMaterial.kind === "RULESET_01" &&
      node.parsedMaterial.data.ruleEffect === "PERMIT" &&
      node.parsedMaterial.data.authorization !== null
    ) {
      contributingClauses.push(node.parsedMaterial.data.authorization);
    }
  }

  if (contributingClauses.length === 0) {
    return buildAuthorizationSuccessResult({
      authorizationDecision: "Denied",
      reasonCodes: ["NO_AUTHORIZATION_BASIS"],
      boundPolicyUniverse,
      boundRequestedAction,
      boundConstitutionalState,
      suppliedAggregateBinding,
      tEInput,
      usedRoleBindingKeys: [],
      resolvedPerformerParticipation: [],
    });
  }

  // Resolve Performers
  const actionPerformerBindings =
    boundRequestedAction.actionPerformerBindings || [];
  const roleBindings = boundParticipation.roleBindings || [];

  const performerSubjects: {
    actorParticipationRef: string;
    subjectRef: ConstitutionalRefBaseV2<"SUBJECT">;
    roleBindingKey: string;
  }[] = [];

  const usedRoleBindingKeys: string[] = [];
  const resolvedPerformerParticipation: {
    performerKey: string;
    roleBinding: RoleBindingV2;
  }[] = [];

  for (const perfBinding of actionPerformerBindings) {
    if (
      !perfBinding ||
      typeof perfBinding !== "object" ||
      typeof perfBinding.actorParticipationRef !== "string"
    ) {
      return {
        ok: false,
        error: {
          code: "POL_INPUT_INVALID",
          message: "Action performer binding is missing actorParticipationRef.",
        },
      };
    }

    const matches = roleBindings.filter(
      (rb) => rb.roleBindingKey === perfBinding.actorParticipationRef,
    );

    if (matches.length !== 1) {
      return {
        ok: false,
        error: {
          code: "POL_INPUT_INVALID",
          message: `Performer role binding '${perfBinding.actorParticipationRef}' matches ${matches.length} entries (expected exactly 1).`,
        },
      };
    }

    const rb = matches[0];
    if (rb.role !== "ACTOR") {
      return {
        ok: false,
        error: {
          code: "POL_INPUT_INVALID",
          message: `Performer role binding '${rb.roleBindingKey}' role is '${rb.role}', expected 'ACTOR'.`,
        },
      };
    }

    if (rb.subject.kind === "UNKNOWN") {
      return buildAuthorizationSuccessResult({
        authorizationDecision: "Denied",
        reasonCodes: ["PERFORMER_SUBJECT_UNKNOWN"],
        boundPolicyUniverse,
        boundRequestedAction,
        boundConstitutionalState,
        suppliedAggregateBinding,
        tEInput,
        usedRoleBindingKeys: [],
        resolvedPerformerParticipation: [],
      });
    }

    performerSubjects.push({
      actorParticipationRef: perfBinding.actorParticipationRef,
      subjectRef: rb.subject.subjectRef,
      roleBindingKey: rb.roleBindingKey,
    });
    usedRoleBindingKeys.push(rb.roleBindingKey);
    resolvedPerformerParticipation.push({
      performerKey: perfBinding.performerKey,
      roleBinding: rb,
    });
  }

  // Flatten state bindings from constitutionalState
  const availableStateBindings: {
    subjectRef?: ConstitutionalRefBaseV2<"SUBJECT">;
    kind: string;
    stateSemanticRef: StateSemanticRefV2;
    exactStateRef: StateInstanceRefV2;
  }[] = [];

  for (const view of boundConstitutionalState.stateViews || []) {
    for (const sb of view.stateBindings || []) {
      if (
        sb.kind === "STANDING_STATE" ||
        sb.kind === "AUTHORITY_STATE" ||
        sb.kind === "CAPABILITY_STATE"
      ) {
        availableStateBindings.push({
          subjectRef: sb.subjectRef,
          kind: sb.kind,
          stateSemanticRef: sb.stateSemanticRef,
          exactStateRef: sb.exactStateRef,
        });
      }
    }
  }

  // Check each contributing clause
  const requestedTargets = boundRequestedAction.actionTargetBindings || [];

  for (const clause of contributingClauses) {
    // 1. Action exactness
    if (
      !refEquals(
        clause.actionSemanticRef,
        boundRequestedAction.actionSemanticRef,
      )
    ) {
      return buildAuthorizationSuccessResult({
        authorizationDecision: "Denied",
        reasonCodes: ["ACTION_NOT_AUTHORIZED"],
        boundPolicyUniverse,
        boundRequestedAction,
        boundConstitutionalState,
        suppliedAggregateBinding,
        tEInput,
        usedRoleBindingKeys,
        resolvedPerformerParticipation,
      });
    }

    // 2. Target exactness
    for (const reqTgt of requestedTargets) {
      const isCovered = clause.authorizedTargets.some(
        (authtgt) =>
          refEquals(
            authtgt.targetSlotSemanticRef,
            reqTgt.targetSlotSemanticRef,
          ) && refEquals(authtgt.targetRef, reqTgt.targetRef),
      );
      if (!isCovered) {
        return buildAuthorizationSuccessResult({
          authorizationDecision: "Denied",
          reasonCodes: ["TARGET_NOT_AUTHORIZED"],
          boundPolicyUniverse,
          boundRequestedAction,
          boundConstitutionalState,
          suppliedAggregateBinding,
          tEInput,
          usedRoleBindingKeys,
          resolvedPerformerParticipation,
        });
      }
    }

    // 3. Required Performer State exactness
    for (const perfSub of performerSubjects) {
      for (const reqState of clause.requiredPerformerStates) {
        const hasState = availableStateBindings.some(
          (st) =>
            st.subjectRef &&
            refEquals(st.subjectRef, perfSub.subjectRef) &&
            st.kind === reqState.kind &&
            refEquals(st.stateSemanticRef, reqState.stateSemanticRef) &&
            refEquals(st.exactStateRef, reqState.exactStateRef),
        );

        if (!hasState) {
          return buildAuthorizationSuccessResult({
            authorizationDecision: "Denied",
            reasonCodes: ["REQUIRED_POL_STATE_UNSATISFIED"],
            boundPolicyUniverse,
            boundRequestedAction,
            boundConstitutionalState,
            suppliedAggregateBinding,
            tEInput,
            usedRoleBindingKeys,
            resolvedPerformerParticipation,
          });
        }
      }
    }
  }

  // All contributing clauses satisfied -> Authorized
  return buildAuthorizationSuccessResult({
    authorizationDecision: "Authorized",
    reasonCodes: [],
    boundPolicyUniverse,
    boundRequestedAction,
    boundConstitutionalState,
    suppliedAggregateBinding,
    tEInput,
    usedRoleBindingKeys,
    resolvedPerformerParticipation,
  });
}

function buildAuthorizationSuccessResult(params: {
  authorizationDecision: "Authorized" | "Denied" | "Deferred";
  reasonCodes: readonly string[];
  boundPolicyUniverse: BoundPolicyUniverseV2;
  boundRequestedAction: RequestedActionBindingV2;
  boundConstitutionalState: BoundConstitutionalStateV2;
  suppliedAggregateBinding: OwnerDeterminationBindingV2;
  tEInput: string;
  usedRoleBindingKeys: readonly string[];
  resolvedPerformerParticipation: readonly {
    performerKey: string;
    roleBinding: RoleBindingV2;
  }[];
}): PolAuthorizationProductionV2Result {
  const {
    authorizationDecision,
    reasonCodes,
    boundPolicyUniverse,
    boundRequestedAction,
    boundConstitutionalState,
    suppliedAggregateBinding,
    tEInput,
    usedRoleBindingKeys,
    resolvedPerformerParticipation,
  } = params;

  const ownerNativeResult: PolAuthorizationOwnerNativeResultV2 = {
    authorizationDecision,
    reasonCodes,
  };

  const actionPerformerBindings =
    boundRequestedAction.actionPerformerBindings || [];
  const actionTargetBindings = boundRequestedAction.actionTargetBindings || [];

  // A3: Include exact resolved performer participation material in deterministic preimage
  const preimage = {
    ownerRef: "urn:zyppi:owner:pol:v1",
    ruleRef: "POL-AUTHORIZATION-RULESET-01",
    policyUniverseRef: boundPolicyUniverse.policyUniverseRef,
    requestedAction: boundRequestedAction,
    resolvedPerformerParticipation,
    usedRoleBindingKeys,
    semanticStateRef: boundConstitutionalState.semanticStateRef,
    aggregateBindingKey: suppliedAggregateBinding.determinationBindingKey,
    tEInput,
    authorizationDecision,
    reasonCodes,
  };

  const preimageCanon = safeCanonicalizeJcs(preimage);
  if (!preimageCanon.ok) {
    return {
      ok: false,
      error: {
        code: "POL_EVALUATION_FAILED",
        message: `Failed to canonicalize Authorization determination preimage: ${preimageCanon.error}`,
      },
    };
  }

  const rawHex = crypto
    .createHash("sha256")
    .update(`zyppi:pol:authorization:v1:${preimageCanon.value}`, "utf8")
    .digest("hex")
    .toLowerCase();

  const constitutionalOwnerRef: OwnerRefV2 = {
    family: "OWNER",
    ownerRef: "urn:zyppi:owner:pol:v1",
    artifactId: "POL-001",
  };

  const exactStateRef: ConstitutionalRefV2 = {
    family: "STATE_INSTANCE",
    ownerRef: "urn:zyppi:owner:pol:v1",
    artifactId: `pol-authorization-state:${rawHex}`,
  };

  const exactRuleRef: RuleRefV2 = {
    family: "RULE",
    ownerRef: "urn:zyppi:owner:pol:v1",
    artifactId: "POL-AUTHORIZATION-RULESET-01",
  };

  const provenanceRef: ProvenanceRefV2 = {
    family: "PROVENANCE",
    ownerRef: "urn:zyppi:owner:pol:v1",
    artifactId: `pol-authorization-provenance:${rawHex}`,
  };

  const questionSemanticRef: QuestionSemanticRefV2 = {
    family: "QUESTION_SEMANTIC",
    ownerRef: "urn:zyppi:owner:pol:v1",
    artifactId: "POL-AUTHORIZATION-QUESTION-01",
  };

  const questionOperandBindings: QuestionOperandBindingV2[] = [
    {
      operandKey: "op:pol_auth:policy_universe:1",
      operandSlotSemanticRef: {
        family: "EVALUATION_SEMANTIC",
        ownerRef: "urn:zyppi:owner:pol:v1",
        artifactId: "POL-AUTH-POLICY-UNIVERSE-OPERAND-01",
      },
      operandKind: "POLICY_UNIVERSE",
      policyUniverseRef: boundPolicyUniverse.policyUniverseRef,
    },
    {
      operandKey: "op:pol_auth:requested_action:1",
      operandSlotSemanticRef: {
        family: "EVALUATION_SEMANTIC",
        ownerRef: "urn:zyppi:owner:pol:v1",
        artifactId: "POL-AUTH-REQUESTED-ACTION-OPERAND-01",
      },
      operandKind: "REQUESTED_ACTION",
      requestedActionRef: "REQUESTED_ACTION",
    },
  ];

  let perfIdx = 1;
  for (const perf of actionPerformerBindings) {
    questionOperandBindings.push({
      operandKey: `op:pol_auth:performer:${perfIdx++}`,
      operandSlotSemanticRef: {
        family: "EVALUATION_SEMANTIC",
        ownerRef: "urn:zyppi:owner:pol:v1",
        artifactId: "POL-AUTH-PERFORMER-OPERAND-01",
      },
      operandKind: "ACTION_PERFORMER",
      performerRef: perf.performerKey,
    });
  }

  let tgtIdx = 1;
  for (const tgt of actionTargetBindings) {
    questionOperandBindings.push({
      operandKey: `op:pol_auth:target:${tgtIdx++}`,
      operandSlotSemanticRef: {
        family: "EVALUATION_SEMANTIC",
        ownerRef: "urn:zyppi:owner:pol:v1",
        artifactId: "POL-AUTH-TARGET-OPERAND-01",
      },
      operandKind: "ACTION_TARGET",
      targetSlotSemanticRef: tgt.targetSlotSemanticRef,
      targetRef: tgt.targetRef,
    });
  }

  questionOperandBindings.push({
    operandKey: "op:pol_auth:constitutional_state:1",
    operandSlotSemanticRef: {
      family: "EVALUATION_SEMANTIC",
      ownerRef: "urn:zyppi:owner:pol:v1",
      artifactId: "POL-AUTH-CONSTITUTIONAL-STATE-OPERAND-01",
    },
    operandKind: "CONSTITUTIONAL_STATE",
    semanticStateRef: boundConstitutionalState.semanticStateRef,
  });

  questionOperandBindings.push({
    operandKey: "op:pol_auth:aggregate:1",
    operandSlotSemanticRef: {
      family: "EVALUATION_SEMANTIC",
      ownerRef: "urn:zyppi:owner:pol:v1",
      artifactId: "POL-AUTH-AGGREGATE-OPERAND-01",
    },
    operandKind: "OWNER_DETERMINATION",
    ownerDeterminationBindingRef:
      suppliedAggregateBinding.determinationBindingKey,
  });

  let partIdx = 1;
  for (const rKey of usedRoleBindingKeys) {
    questionOperandBindings.push({
      operandKey: `op:pol_auth:participation:${partIdx++}`,
      operandSlotSemanticRef: {
        family: "EVALUATION_SEMANTIC",
        ownerRef: "urn:zyppi:owner:pol:v1",
        artifactId: "POL-AUTH-PARTICIPATION-OPERAND-01",
      },
      operandKind: "PARTICIPATION_BINDING",
      roleBindingRef: rKey,
    });
  }

  const determination: OwnerDeterminationBindingV2 = {
    determinationBindingKey: `pol:authorization:${rawHex}`,
    determinationQuestionBinding: {
      questionSemanticRef,
      questionOperandBindings,
    },
    constitutionalOwnerRef,
    ownerNativeResult: ownerNativeResult as unknown as JsonValueV2,
    exactStateRef,
    exactRuleRef,
    assessedAtCoordinateRef: "tEInput",
    provenanceRef,
    determinationDependencyDeclaration: {
      kind: "EXPLICIT",
      dependencyRefs: [suppliedAggregateBinding.determinationBindingKey],
    },
  };

  return {
    ok: true,
    determination: deepFreeze(determination),
  };
}

import type {
  PolicyRecord,
  PolicyContext,
  ExecutionContext,
  ResolvedPolicyGraph,
} from "@zyppi/domain";

export interface PolicyDecision {
  readonly policyId: string;
  readonly policyVersion: string;
  readonly result: "ALLOW" | "DENY" | "INDETERMINATE";
  readonly diagnostic?: string;
}

export interface ExecutionSequence {
  readonly orderedPolicies: readonly PolicyRecord[];
}

export type Stage7Result =
  | {
      readonly ok: true;
      readonly sequence: ExecutionSequence;
    }
  | {
      readonly ok: false;
      readonly code: string;
      readonly message: string;
    };

/**
 * Stage 7 — Resolution Graph Materialization
 * Consumes the resolved policy graph and applicable policies, validates referential
 * integrity, performs cycle detection, and produces a deterministic execution sequence
 * using Kahn's topological sort with lexicographical Policy ID tie-breaking on the ready set.
 */
export function materializeResolutionGraph(
  applicablePolicies: readonly PolicyRecord[],
  resolvedPolicyGraph: ResolvedPolicyGraph,
): Stage7Result {
  const policyMap = new Map<string, PolicyRecord>();
  for (const p of applicablePolicies) {
    policyMap.set(p.policyId, p);
  }

  // 1. Referential Integrity Verification
  for (const edge of resolvedPolicyGraph.edges) {
    if (!policyMap.has(edge.dependeeId)) {
      return {
        ok: false,
        code: "REFERENTIAL_INTEGRITY_VIOLATION",
        message: `Referenced dependee policy ${edge.dependeeId} not found in applicable policies.`,
      };
    }
    if (!policyMap.has(edge.dependentId)) {
      return {
        ok: false,
        code: "REFERENTIAL_INTEGRITY_VIOLATION",
        message: `Referenced dependent policy ${edge.dependentId} not found in applicable policies.`,
      };
    }
  }

  // 2. Self-dependency detection
  for (const edge of resolvedPolicyGraph.edges) {
    if (edge.dependeeId === edge.dependentId) {
      return {
        ok: false,
        code: "CYCLIC_POLICY_GRAPH",
        message: `Self-dependency detected for policy ${edge.dependeeId}.`,
      };
    }
  }

  // 3. Build adjacency lists and compute in-degrees
  const adj = new Map<string, Set<string>>();
  const inDegree = new Map<string, number>();

  for (const p of applicablePolicies) {
    adj.set(p.policyId, new Set<string>());
    inDegree.set(p.policyId, 0);
  }

  for (const edge of resolvedPolicyGraph.edges) {
    const u = edge.dependeeId;
    const v = edge.dependentId;
    if (!adj.get(u)!.has(v)) {
      adj.get(u)!.add(v);
      inDegree.set(v, inDegree.get(v)! + 1);
    }
  }

  // 4. Initialize ready queue
  const ready: string[] = [];
  for (const p of applicablePolicies) {
    if (inDegree.get(p.policyId) === 0) {
      ready.push(p.policyId);
    }
  }

  // 5. Deterministic topological traversal with ready set tie-breaking
  const sortedOrder: string[] = [];
  while (ready.length > 0) {
    // Sort ready set lexicographically ascendingly for deterministic tie-breaking
    ready.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    const u = ready.shift()!;
    sortedOrder.push(u);

    for (const v of adj.get(u)!) {
      inDegree.set(v, inDegree.get(v)! - 1);
      if (inDegree.get(v) === 0) {
        ready.push(v);
      }
    }
  }

  // 6. Cycle detection
  if (sortedOrder.length !== applicablePolicies.length) {
    return {
      ok: false,
      code: "CYCLIC_POLICY_GRAPH",
      message: "Cyclic dependency detected in policy graph.",
    };
  }

  const orderedPolicies = sortedOrder.map((id) => policyMap.get(id)!);

  return {
    ok: true,
    sequence: {
      orderedPolicies,
    },
  };
}

export interface PolicyEvaluationResult {
  readonly aggregateResult: "ALLOW" | "DENY" | "INDETERMINATE";
  readonly policyDecisions: readonly PolicyDecision[];
  readonly policyVersion: string;
  readonly remainingBudget: number;
  readonly diagnostics: readonly string[];
}

/**
 * Stage 8 — Active Execution / Policy Evaluation
 * Evaluates the deterministic ExecutionSequence produced by Stage 7.
 * Manages the resolution-step budget sequentially and conjunctively aggregates the results.
 */
export function evaluatePolicies(
  sequence: ExecutionSequence,
  policyContext: PolicyContext,
  executionContext: ExecutionContext,
): PolicyEvaluationResult {
  let currentBudget = executionContext.budget;
  const policyDecisions: PolicyDecision[] = [];
  const diagnostics: string[] = [];
  let aggregateResult: "ALLOW" | "DENY" | "INDETERMINATE" = "ALLOW";

  // Deterministically sort the whole governing policy universe by policyId
  // ascendingly to generate the order-independent G-0815 composite version
  const sortedAdmittedPolicies = [...sequence.orderedPolicies].sort((a, b) =>
    a.policyId < b.policyId ? -1 : a.policyId > b.policyId ? 1 : 0,
  );

  const policyVersion =
    sortedAdmittedPolicies.length > 0
      ? sortedAdmittedPolicies
          .map((p) => `${p.policyId}:${p.version}`)
          .join(",")
      : "0.0.0";

  for (const p of sequence.orderedPolicies) {
    // Skip inactive policies (they do not consume budget or produce a decision)
    if (!p.active) {
      continue;
    }

    // Pre-consumption budget checking before initiating the governed resolution step
    if (currentBudget < 1) {
      diagnostics.push(
        `Budget exhausted before evaluating policy: ${p.policyId}`,
      );
      aggregateResult = "INDETERMINATE";
      // Terminate traversal immediately
      break;
    }

    // Consume exactly once for each admitted policy-node evaluation
    currentBudget -= 1;

    let result: "ALLOW" | "DENY" | "INDETERMINATE" = "INDETERMINATE";
    let diagnostic: string | undefined;

    const def = p.definition;
    if (
      def &&
      typeof def === "object" &&
      !Array.isArray(def) &&
      "mockResult" in def
    ) {
      const mockVal = (def as Record<string, unknown>).mockResult;
      if (
        mockVal === "ALLOW" ||
        mockVal === "DENY" ||
        mockVal === "INDETERMINATE"
      ) {
        result = mockVal;
      } else {
        result = "INDETERMINATE";
        diagnostic = `Invalid mockResult value: ${String(mockVal)}`;
      }
    } else {
      // Unsupported policy semantics / no authoritative rules in catalog
      result = "INDETERMINATE";
      diagnostic = `Unsupported policy semantics for type: ${p.policyType}`;
    }

    policyDecisions.push({
      policyId: p.policyId,
      policyVersion: p.version,
      result,
      ...(diagnostic ? { diagnostic } : {}),
    });

    // Aggregation is conjunctive with precedence DENY > INDETERMINATE > ALLOW
    if (result === "DENY") {
      aggregateResult = "DENY";
    } else if (result === "INDETERMINATE" && aggregateResult !== "DENY") {
      aggregateResult = "INDETERMINATE";
    }
  }

  return {
    aggregateResult,
    policyDecisions,
    policyVersion,
    remainingBudget: currentBudget,
    diagnostics,
  };
}

import { describe, it, expect } from "vitest";
import {
  materializeResolutionGraph,
  evaluatePolicies,
  type ExecutionSequence,
} from "./evaluator.js";
import type {
  PolicyRecord,
  PolicyContext,
  ExecutionContext,
} from "@zyppi/domain";

describe("Stage 7 — Resolution Graph Materialization", () => {
  const pA: PolicyRecord = {
    policyId: "pol-A",
    policyType: "test",
    version: "1.0.0",
    definition: { mockResult: "ALLOW" },
    active: true,
  };

  const pB: PolicyRecord = {
    policyId: "pol-B",
    policyType: "test",
    version: "1.0.0",
    definition: { mockResult: "ALLOW" },
    active: true,
  };

  const pC: PolicyRecord = {
    policyId: "pol-C",
    policyType: "test",
    version: "1.0.0",
    definition: { mockResult: "ALLOW" },
    active: true,
  };

  it("handles valid edgeless graph (CAW-011 baseline)", () => {
    const policies = [pC, pA, pB];
    const graph = { edges: [] };
    const res = materializeResolutionGraph(policies, graph);

    expect(res.ok).toBe(true);
    if (res.ok) {
      // With zero edges, Kahn's algorithm processes nodes based on in-degree = 0.
      // Simultaneously ready nodes [pol-C, pol-A, pol-B] are sorted lexicographically by Policy ID:
      // pol-A -> pol-B -> pol-C
      const order = res.sequence.orderedPolicies.map((p) => p.policyId);
      expect(order).toEqual(["pol-A", "pol-B", "pol-C"]);
    }
  });

  it("handles valid multi-node DAG and respects topological dependencies", () => {
    // pol-C depends on pol-A
    const policies = [pC, pB, pA];
    const graph = {
      edges: [{ dependeeId: "pol-A", dependentId: "pol-C" }],
    };
    const res = materializeResolutionGraph(policies, graph);

    expect(res.ok).toBe(true);
    if (res.ok) {
      // In-degree 0 set starts with [pol-B, pol-A]. Tie-breaker sorts them lexicographically:
      // pol-A is popped first, reducing pol-C in-degree to 0 (pol-C joins ready queue).
      // Remaining queue is [pol-B]. pol-B popped next. Then pol-C.
      // Expected: pol-A -> pol-B -> pol-C
      const order = res.sequence.orderedPolicies.map((p) => p.policyId);
      expect(order).toEqual(["pol-A", "pol-B", "pol-C"]);
    }
  });

  it("rejects referential integrity violations (unreferenced policy ID in edges)", () => {
    const policies = [pA, pB];
    const graph = {
      edges: [{ dependeeId: "pol-A", dependentId: "pol-MISSING" }],
    };
    const res = materializeResolutionGraph(policies, graph);

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("REFERENTIAL_INTEGRITY_VIOLATION");
      expect(res.message).toContain("pol-MISSING");
    }
  });

  it("rejects self-dependencies structurally", () => {
    const policies = [pA];
    const graph = {
      edges: [{ dependeeId: "pol-A", dependentId: "pol-A" }],
    };
    const res = materializeResolutionGraph(policies, graph);

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("CYCLIC_POLICY_GRAPH");
      expect(res.message).toContain("Self-dependency");
    }
  });

  it("detects and rejects cycles structurally", () => {
    const policies = [pA, pB];
    const graph = {
      edges: [
        { dependeeId: "pol-A", dependentId: "pol-B" },
        { dependeeId: "pol-B", dependentId: "pol-A" },
      ],
    };
    const res = materializeResolutionGraph(policies, graph);

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("CYCLIC_POLICY_GRAPH");
      expect(res.message).toContain("Cyclic dependency");
    }
  });
});

describe("Stage 8 — Active Execution / Policy Evaluation", () => {
  const pAllow: PolicyRecord = {
    policyId: "pol-allow",
    policyType: "test",
    version: "1.0.0",
    definition: { mockResult: "ALLOW" },
    active: true,
  };

  const pDeny: PolicyRecord = {
    policyId: "pol-deny",
    policyType: "test",
    version: "1.1.0",
    definition: { mockResult: "DENY" },
    active: true,
  };

  const pIndet: PolicyRecord = {
    policyId: "pol-indet",
    policyType: "test",
    version: "1.2.0",
    definition: { mockResult: "INDETERMINATE" },
    active: true,
  };

  const pUnsupported: PolicyRecord = {
    policyId: "pol-unsupported",
    policyType: "caw:complex",
    version: "1.0.0",
    definition: { rules: ["unsupported"] },
    active: true,
  };

  const dummyContext: PolicyContext = { policies: [] };
  const dummyExecContext = (budget: number): ExecutionContext => ({
    executionId: "exec-123",
    constitutionalTimestamp: "2026-08-08T14:30:00Z",
    budget,
    entropy: "seed",
    versions: ["1.0.0"],
  });

  it("evaluates empty policy set vacuously as ALLOW", () => {
    const sequence: ExecutionSequence = { orderedPolicies: [] };
    const res = evaluatePolicies(sequence, dummyContext, dummyExecContext(100));

    expect(res.aggregateResult).toBe("ALLOW");
    expect(res.policyDecisions).toEqual([]);
    expect(res.policyVersion).toBe("0.0.0");
    expect(res.remainingBudget).toBe(100);
  });

  it("respects aggregate conjunctive precedence DENY > INDETERMINATE > ALLOW", () => {
    // Case 1: All ALLOW -> ALLOW
    const seq1 = { orderedPolicies: [pAllow, pAllow] };
    const res1 = evaluatePolicies(seq1, dummyContext, dummyExecContext(10));
    expect(res1.aggregateResult).toBe("ALLOW");
    expect(res1.remainingBudget).toBe(8);

    // Case 2: INDETERMINATE over ALLOW -> INDETERMINATE
    const seq2 = { orderedPolicies: [pAllow, pIndet] };
    const res2 = evaluatePolicies(seq2, dummyContext, dummyExecContext(10));
    expect(res2.aggregateResult).toBe("INDETERMINATE");

    // Case 3: DENY over INDETERMINATE -> DENY
    const seq3 = { orderedPolicies: [pIndet, pDeny] };
    const res3 = evaluatePolicies(seq3, dummyContext, dummyExecContext(10));
    expect(res3.aggregateResult).toBe("DENY");
  });

  it("performs complete evaluation and does not short-circuit after DENY", () => {
    const seq = { orderedPolicies: [pDeny, pAllow, pIndet] };
    const res = evaluatePolicies(seq, dummyContext, dummyExecContext(10));

    expect(res.aggregateResult).toBe("DENY");
    expect(res.policyDecisions.length).toBe(3); // All 3 policies evaluated
    expect(res.remainingBudget).toBe(7); // Bounded resolution-step budget consumed for all 3
  });

  it("excludes inactive policies from evaluation and budget consumption", () => {
    const inactivePolicy = { ...pAllow, active: false };
    const seq = { orderedPolicies: [pAllow, inactivePolicy] };
    const res = evaluatePolicies(seq, dummyContext, dummyExecContext(10));

    expect(res.aggregateResult).toBe("ALLOW");
    expect(res.policyDecisions.length).toBe(1); // Only active one evaluated
    expect(res.remainingBudget).toBe(9); // Only 1 budget unit consumed
  });

  it("enforces resolution-step budget pre-consumption checking", () => {
    const seq = { orderedPolicies: [pAllow, pAllow] };

    // Budget of 1: First evaluated successfully (budget reduces to 0), second cannot be admitted
    const res = evaluatePolicies(seq, dummyContext, dummyExecContext(1));
    expect(res.aggregateResult).toBe("INDETERMINATE");
    expect(res.policyDecisions.length).toBe(1); // Only the first node was admitted
    expect(res.remainingBudget).toBe(0);
    expect(res.diagnostics).toContain(
      "Budget exhausted before evaluating policy: pol-allow",
    );
  });

  it("handles zero budget execution correctly", () => {
    const seq = { orderedPolicies: [pAllow] };
    const res = evaluatePolicies(seq, dummyContext, dummyExecContext(0));

    expect(res.aggregateResult).toBe("INDETERMINATE");
    expect(res.policyDecisions.length).toBe(0); // None admitted
    expect(res.remainingBudget).toBe(0);
  });

  it("unsupported policy semantics produce INDETERMINATE with diagnostics", () => {
    const seq = { orderedPolicies: [pUnsupported] };
    const res = evaluatePolicies(seq, dummyContext, dummyExecContext(10));

    expect(res.aggregateResult).toBe("INDETERMINATE");
    expect(res.policyDecisions[0].result).toBe("INDETERMINATE");
    expect(res.policyDecisions[0].diagnostic).toContain(
      "Unsupported policy semantics",
    );
  });

  it("generates deterministic order-independent policyVersion", () => {
    const seqA = { orderedPolicies: [pAllow, pDeny, pIndet] };
    const seqB = { orderedPolicies: [pIndet, pAllow, pDeny] };

    const resA = evaluatePolicies(seqA, dummyContext, dummyExecContext(10));
    const resB = evaluatePolicies(seqB, dummyContext, dummyExecContext(10));

    // The composite version must be identical regardless of evaluation traversal sequence
    expect(resA.policyVersion).toBe(resB.policyVersion);
    expect(resA.policyVersion).toContain("pol-allow:1.0.0");
    expect(resA.policyVersion).toContain("pol-deny:1.1.0");
    expect(resA.policyVersion).toContain("pol-indet:1.2.0");
  });
});

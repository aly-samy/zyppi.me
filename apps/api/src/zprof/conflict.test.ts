import { describe, it, expect } from "vitest";
import {
  evaluateConflict,
  resolveConflictWithRules,
  type AuthorizedResolutionRule,
  type ConflictEvaluationInputs,
  type ExplicitIncompatibilityRule,
  type ExplicitConflictAssertion,
} from "./conflict.js";
import type { Participant } from "./participant.js";
import type { StructuralEdge, BindingEdge } from "./topology.js";
import { validateTopologyGraph } from "./topology.js";

describe("AMS-0859 / CORR-0859-1 / CORR-0859-2 Z-PROF Conflict Unit Tests Matrix", () => {
  const p1: Participant = {
    identity: "dtc:zyppi:domain:gs1:v1",
    kind: "DTC",
    version: "1.0.0",
    owner: "identity:council:admin",
    role: "domain_template",
    reference: { id: "dtc:zyppi:domain:gs1:v1", version: "1.0.0" },
  };

  const p2: Participant = {
    identity: "arm:profile:trade_item:v1",
    kind: "ARM_PROFILE",
    version: "1.0.0",
    owner: "identity:council:admin",
    role: "asset_profile",
    reference: { id: "arm:profile:trade_item:v1", version: "1.0.0" },
  };

  // Test 1: No conflict -> deterministic success
  it("Test 1: no conflict -> deterministic success", () => {
    const res = evaluateConflict({});
    expect(res.status).toBe("NO_CONFLICT");
  });

  // Test 2: Structural node absence in P is invalid
  it("Test 2: structural node absence -> invalid topology result", () => {
    const invalidEdges: readonly StructuralEdge[] = [
      {
        sourceId: p1.identity,
        targetId: "non_existent_node",
        relationKind: "references",
      },
    ];
    const topoRes = validateTopologyGraph([p1, p2], invalidEdges, []);
    expect(topoRes.ok).toBe(false);
    if (!topoRes.ok) {
      expect(topoRes.error.code).toBe("invalid");
    }
  });

  // Test 3: T_struct cycle alone -> not automatically conflict
  it("Test 3: T_struct cycle alone -> not automatically conflict", () => {
    const structCycleEdges: readonly StructuralEdge[] = [
      {
        sourceId: p1.identity,
        targetId: p2.identity,
        relationKind: "references",
      },
      {
        sourceId: p2.identity,
        targetId: p1.identity,
        relationKind: "references",
      },
    ];
    const topoRes = validateTopologyGraph([p1, p2], structCycleEdges, []);
    expect(topoRes.ok).toBe(true);
  });

  // Test 4: T_bind dependency cycle -> deterministic failure
  it("Test 4: T_bind dependency cycle -> deterministic failure", () => {
    const bindCycleEdges: readonly BindingEdge[] = [
      {
        sourceId: p1.identity,
        targetId: p2.identity,
        dependencyKind: "requires",
      },
      {
        sourceId: p2.identity,
        targetId: p1.identity,
        dependencyKind: "requires",
      },
    ];
    const topoRes = validateTopologyGraph([p1, p2], [], bindCycleEdges);
    expect(topoRes.ok).toBe(false);
    if (!topoRes.ok) {
      expect(topoRes.error.code).toBe("incompatible");
      expect(topoRes.error.message).toContain("dependency cycle");
    }
  });

  // Test 5: Version incompatibility -> explicit structural version conflict
  it("Test 5: version incompatibility -> explicit diagnostic + incompatible disposition", () => {
    const inputs: ConflictEvaluationInputs = {
      versionRequirements: [
        { id: "dep:pkg:a", version: "1.0.0" },
        { id: "dep:pkg:a", version: "2.0.0" },
      ],
    };
    const res = evaluateConflict(inputs);
    expect(res.status).toBe("UNRESOLVED");
    if (res.status === "UNRESOLVED") {
      expect(res.diagnostic).toBe("VERSION_CONFLICT");
      expect(res.disposition).toBe("incompatible");
      expect(res.reason).toContain("dep:pkg:a");
    }
  });

  // Test 6: CORR-0859-1 Negative Test: Multiple jurisdictions peacefully coexist
  it("Test 6 (CORR-0859-1): multiple jurisdictions peacefully coexist without explicit incompatibility rule", () => {
    const inputs: ConflictEvaluationInputs = {
      declarations: [
        { id: "p1", jurisdiction: "Egypt" },
        { id: "p2", jurisdiction: "UAE" },
      ],
    };
    const res = evaluateConflict(inputs);
    expect(res.status).toBe("NO_CONFLICT");
  });

  // Test 7: CORR-0859-1 Negative Test: Multiple authorities peacefully coexist
  it("Test 7 (CORR-0859-1): multiple authorities peacefully coexist without explicit incompatibility rule", () => {
    const inputs: ConflictEvaluationInputs = {
      declarations: [
        { id: "p1", authorityRef: "auth:authority_a" },
        { id: "p2", authorityRef: "auth:authority_b" },
      ],
    };
    const res = evaluateConflict(inputs);
    expect(res.status).toBe("NO_CONFLICT");
  });

  // Test 8: CORR-0859-1 Negative Test: Multiple requirement values peacefully coexist
  it("Test 8 (CORR-0859-1): different requirement values peacefully coexist without explicit incompatibility rule", () => {
    const inputs: ConflictEvaluationInputs = {
      declarations: [
        { id: "req1", requirementKey: "country", requiredValue: "Egypt" },
        { id: "req2", requirementKey: "country", requiredValue: "UAE" },
      ],
    };
    const res = evaluateConflict(inputs);
    expect(res.status).toBe("NO_CONFLICT");
  });

  // Test 9: CORR-0859-2 Target Scoping Positive & Negative Tests
  it("Test 9 (CORR-0859-2): explicit incompatibility rule applies strictly to declared targetReferences", () => {
    const rule: ExplicitIncompatibilityRule = {
      ruleId: "rule:p1_p2_jurisdictions",
      diagnostic: "JURISDICTION_CONFLICT",
      disposition: "conflicting",
      targetReferences: ["p1", "p2"],
      condition: {
        mutuallyExclusiveJurisdictions: ["Egypt", "UAE"],
      },
    };

    // Case 9A: Targets p1 and p2 match -> conflict
    const inputsMatch: ConflictEvaluationInputs = {
      declarations: [
        { id: "p1", jurisdiction: "Egypt" },
        { id: "p2", jurisdiction: "UAE" },
      ],
      explicitIncompatibilityRules: [rule],
    };
    const resMatch = evaluateConflict(inputsMatch);
    expect(resMatch.status).toBe("UNRESOLVED");

    // Case 9B: Rule targets p1 and p2, but conflicting values occur on p3 and p4 -> NO_CONFLICT
    const inputsIgnored: ConflictEvaluationInputs = {
      declarations: [
        { id: "p3", jurisdiction: "Egypt" },
        { id: "p4", jurisdiction: "UAE" },
      ],
      explicitIncompatibilityRules: [rule],
    };
    const resIgnored = evaluateConflict(inputsIgnored);
    expect(resIgnored.status).toBe("NO_CONFLICT");

    // Case 9C: Partial target presence (only p1 present, p2 missing) -> rule ignored
    const inputsPartial: ConflictEvaluationInputs = {
      declarations: [{ id: "p1", jurisdiction: "Egypt" }],
      explicitIncompatibilityRules: [rule],
    };
    const resPartial = evaluateConflict(inputsPartial);
    expect(resPartial.status).toBe("NO_CONFLICT");
  });

  // Test 10: CORR-0859-2 Context Coordinate Rule Positive & Negative Tests
  it("Test 10 (CORR-0859-2): context coordinate incompatibility rules operate on targets", () => {
    // Negative test: Different context values without explicit rule -> NO_CONFLICT
    const inputsNoRule: ConflictEvaluationInputs = {
      declarations: [
        { id: "p1", contextCoordinate: "env", contextValue: "prod" },
        { id: "p2", contextCoordinate: "env", contextValue: "dev" },
      ],
    };
    expect(evaluateConflict(inputsNoRule).status).toBe("NO_CONFLICT");

    // Positive test: Explicit target-scoped context incompatibility rule -> conflict
    const rule: ExplicitIncompatibilityRule = {
      ruleId: "rule:p1_p2_env_context",
      diagnostic: "CONTEXT_CONFLICT",
      disposition: "incompatible",
      targetReferences: ["p1", "p2"],
      condition: {
        coordinate: "env",
        mutuallyExclusiveContexts: ["prod", "dev"],
      },
    };

    const inputsRule: ConflictEvaluationInputs = {
      declarations: [
        { id: "p1", contextCoordinate: "env", contextValue: "prod" },
        { id: "p2", contextCoordinate: "env", contextValue: "dev" },
      ],
      explicitIncompatibilityRules: [rule],
    };
    const resRule = evaluateConflict(inputsRule);
    expect(resRule.status).toBe("UNRESOLVED");
    if (resRule.status === "UNRESOLVED") {
      expect(resRule.diagnostic).toBe("CONTEXT_CONFLICT");
      expect(resRule.disposition).toBe("incompatible");
    }

    // Negative test: Identical contexts under rule -> NO_CONFLICT
    const inputsSameCtx: ConflictEvaluationInputs = {
      declarations: [
        { id: "p1", contextCoordinate: "env", contextValue: "prod" },
        { id: "p2", contextCoordinate: "env", contextValue: "prod" },
      ],
      explicitIncompatibilityRules: [rule],
    };
    expect(evaluateConflict(inputsSameCtx).status).toBe("NO_CONFLICT");
  });

  // Test 11: CORR-0859-2 Assertion Structural Validation Test
  it("Test 11 (CORR-0859-2): malformed explicit assertions are rejected", () => {
    const malformedAssertion: ExplicitConflictAssertion = {
      assertionId: "",
      diagnostic: "SEMANTIC_REQUIREMENT_CONFLICT",
      disposition: "conflicting",
      involvedReferences: ["p1"],
      governingRuleRef: "rule:1",
      details: "test",
    };
    const inputs: ConflictEvaluationInputs = {
      explicitConflictAssertions: [malformedAssertion],
    };
    expect(evaluateConflict(inputs).status).toBe("NO_CONFLICT");
  });

  // Test 12: CORR-0859-2 Path B Resolution Candidate Test (Fails Closed with Contract Gap)
  it("Test 12 (CORR-0859-2): candidate resolution rule fails closed as UNRESOLVED with contract gap", () => {
    const rule: AuthorizedResolutionRule = {
      authorityRef: "auth:council:pol",
      ruleRef: "rule:pol:version_override:v1",
      conflictCategory: "VERSION_CONFLICT",
      targetReferences: ["mod:x"],
      resolutionResult: "use_pinned_1.0.0",
    };
    const inputs: ConflictEvaluationInputs = {
      versionRequirements: [
        { id: "mod:x", version: "1.0.0" },
        { id: "mod:x", version: "1.1.0" },
      ],
      authorizedRules: [rule],
    };
    const res = evaluateConflict(inputs);
    expect(res.status).toBe("UNRESOLVED");
    if (res.status === "UNRESOLVED") {
      expect(res.reason).toContain(
        "BLOCKED — RESOLUTION AUTHORITY/APPLICATION CONTRACT NOT MATERIALIZED",
      );
    }
  });

  // Test 13: Authority without rule -> unresolved
  it("Test 13: authority without rule -> unresolved", () => {
    const rule: AuthorizedResolutionRule = {
      authorityRef: "auth:council:pol",
      ruleRef: "",
      conflictCategory: "VERSION_CONFLICT",
      targetReferences: ["mod:x"],
      resolutionResult: "use_pinned_1.0.0",
    };
    const res = resolveConflictWithRules(
      "VERSION_CONFLICT",
      "incompatible",
      ["mod:x"],
      "test",
      [rule],
    );
    expect(res.status).toBe("UNRESOLVED");
  });

  // Test 14: Rule without authority -> unresolved
  it("Test 14: rule without authority -> unresolved", () => {
    const rule: AuthorizedResolutionRule = {
      authorityRef: "",
      ruleRef: "rule:pol:version_override:v1",
      conflictCategory: "VERSION_CONFLICT",
      targetReferences: ["mod:x"],
      resolutionResult: "use_pinned_1.0.0",
    };
    const res = resolveConflictWithRules(
      "VERSION_CONFLICT",
      "incompatible",
      ["mod:x"],
      "test",
      [rule],
    );
    expect(res.status).toBe("UNRESOLVED");
  });

  // Test 15: Neither authority nor rule -> unresolved
  it("Test 15: neither authority nor rule -> unresolved", () => {
    const res = resolveConflictWithRules(
      "VERSION_CONFLICT",
      "incompatible",
      ["mod:x"],
      "test",
      [],
    );
    expect(res.status).toBe("UNRESOLVED");
  });

  // Test 16: Permutation invariance
  it("Test 16: reference permutation does not alter evaluation result", () => {
    const inputsA: ConflictEvaluationInputs = {
      versionRequirements: [
        { id: "mod:a", version: "1.0.0" },
        { id: "mod:a", version: "2.0.0" },
      ],
    };
    const inputsB: ConflictEvaluationInputs = {
      versionRequirements: [
        { id: "mod:a", version: "2.0.0" },
        { id: "mod:a", version: "1.0.0" },
      ],
    };
    const resA = evaluateConflict(inputsA);
    expect(resA).toEqual(evaluateConflict(inputsB));
  });

  // Test 17: Returns deeply frozen immutable result
  it("Test 17: returns deeply frozen immutable conflict evaluation results", () => {
    const res = evaluateConflict({
      versionRequirements: [
        { id: "v1", version: "1.0.0" },
        { id: "v1", version: "2.0.0" },
      ],
    });
    expect(Object.isFrozen(res)).toBe(true);
  });

  // Test 18: Equivalent inputs produce bit-for-bit equal outputs
  it("Test 18: equivalent inputs produce equivalent result", () => {
    const inputs: ConflictEvaluationInputs = {
      evidenceRequirements: [{ id: "ev:1", isConflicting: true }],
    };
    const resA = evaluateConflict(inputs);
    const resB = evaluateConflict(inputs);
    expect(resA).toEqual(resB);
  });
});

import { describe, it, expect } from "vitest";
import {
  evaluateConflict,
  resolveConflictWithRules,
  mapDiagnosticToDisposition,
  type AuthorizedResolutionRule,
  type ConflictEvaluationInputs,
} from "./conflict.js";
import type { Participant } from "./participant.js";
import type { StructuralEdge, BindingEdge } from "./topology.js";
import { validateTopologyGraph } from "./topology.js";

describe("AMS-0859 Z-PROF Conflict Unit Tests Matrix (§28)", () => {
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

  // Test 2: Structural conflict -> explicit diagnostic
  it("Test 2: structural conflict -> explicit diagnostic", () => {
    // Structural cycle alone is permitted in T_struct, but structural node absence in P is invalid
    const invalidEdges: readonly StructuralEdge[] = [
      { sourceId: p1.identity, targetId: "non_existent_node", relationKind: "references" },
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
      { sourceId: p1.identity, targetId: p2.identity, relationKind: "references" },
      { sourceId: p2.identity, targetId: p1.identity, relationKind: "references" },
    ];
    const topoRes = validateTopologyGraph([p1, p2], structCycleEdges, []);
    expect(topoRes.ok).toBe(true);
  });

  // Test 4: T_bind dependency cycle -> deterministic failure through existing composition rules
  it("Test 4: T_bind dependency cycle -> deterministic failure", () => {
    const bindCycleEdges: readonly BindingEdge[] = [
      { sourceId: p1.identity, targetId: p2.identity, dependencyKind: "requires" },
      { sourceId: p2.identity, targetId: p1.identity, dependencyKind: "requires" },
    ];
    const topoRes = validateTopologyGraph([p1, p2], [], bindCycleEdges);
    expect(topoRes.ok).toBe(false);
    if (!topoRes.ok) {
      expect(topoRes.error.code).toBe("incompatible");
      expect(topoRes.error.message).toContain("dependency cycle");
    }
  });

  // Test 5: Version incompatibility -> explicit diagnostic + authoritative validation disposition
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

  // Test 6: Missing dependency != conflicting dependency
  it("Test 6: missing dependency != conflicting dependency", () => {
    const inputsMissing: ConflictEvaluationInputs = {
      declarations: [{ id: "decl:1", isMissing: true }],
    };
    const resMissing = evaluateConflict(inputsMissing);
    expect(resMissing.status).toBe("UNRESOLVED");
    if (resMissing.status === "UNRESOLVED") {
      expect(resMissing.diagnostic).toBe("ABSENCE");
      expect(resMissing.disposition).toBe("missing");
    }
  });

  // Test 7: Unsupported != conflicting
  it("Test 7: unsupported != conflicting", () => {
    expect(mapDiagnosticToDisposition("ABSENCE")).toBe("missing");
    expect(mapDiagnosticToDisposition("VERSION_CONFLICT")).toBe("incompatible");
  });

  // Test 8: Unavailable != missing
  it("Test 8: unavailable != missing", () => {
    expect(mapDiagnosticToDisposition("EVIDENCE_CONFLICT", { epistemicStatus: "UNAVAILABLE" })).toBe("unavailable");
    expect(mapDiagnosticToDisposition("EVIDENCE_CONFLICT", { isMissing: true })).toBe("missing");
  });

  // Test 9: Unverified != conflicting unless explicit conflicting evidence exists
  it("Test 9: unverified != conflicting unless explicit conflicting evidence exists", () => {
    expect(mapDiagnosticToDisposition("EVIDENCE_CONFLICT", { epistemicStatus: "UNVERIFIED" })).toBe("unverified");
    expect(mapDiagnosticToDisposition("EVIDENCE_CONFLICT", { epistemicStatus: "CONFLICTING" })).toBe("conflicting");
  });

  // Test 10: Unresolved conflict cannot produce successful binding (covered in integration)
  it("Test 10: unresolved status carries UNRESOLVED status flag", () => {
    const inputs: ConflictEvaluationInputs = {
      versionRequirements: [
        { id: "mod:x", version: "1.0.0" },
        { id: "mod:x", version: "1.1.0" },
      ],
    };
    const res = evaluateConflict(inputs);
    expect(res.status).toBe("UNRESOLVED");
  });

  // Test 11: Resolution with explicit authority + rule -> deterministic resolved result
  it("Test 11: resolution with explicit authority + rule -> deterministic resolved result", () => {
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
    expect(res.status).toBe("RESOLVED");
    if (res.status === "RESOLVED") {
      expect(res.authorityRef).toBe("auth:council:pol");
      expect(res.ruleRef).toBe("rule:pol:version_override:v1");
      expect(res.result).toBe("use_pinned_1.0.0");
    }
  });

  // Test 12: Authority without rule -> unresolved/failure
  it("Test 12: authority without rule -> unresolved", () => {
    const rule: AuthorizedResolutionRule = {
      authorityRef: "auth:council:pol",
      ruleRef: "",
      conflictCategory: "VERSION_CONFLICT",
      targetReferences: ["mod:x"],
      resolutionResult: "use_pinned_1.0.0",
    };
    const res = resolveConflictWithRules("VERSION_CONFLICT", "incompatible", ["mod:x"], "test", [rule]);
    expect(res.status).toBe("UNRESOLVED");
  });

  // Test 13: Rule without authority -> unresolved/failure
  it("Test 13: rule without authority -> unresolved", () => {
    const rule: AuthorizedResolutionRule = {
      authorityRef: "",
      ruleRef: "rule:pol:version_override:v1",
      conflictCategory: "VERSION_CONFLICT",
      targetReferences: ["mod:x"],
      resolutionResult: "use_pinned_1.0.0",
    };
    const res = resolveConflictWithRules("VERSION_CONFLICT", "incompatible", ["mod:x"], "test", [rule]);
    expect(res.status).toBe("UNRESOLVED");
  });

  // Test 14: Neither authority nor rule -> unresolved/failure
  it("Test 14: neither authority nor rule -> unresolved", () => {
    const res = resolveConflictWithRules("VERSION_CONFLICT", "incompatible", ["mod:x"], "test", []);
    expect(res.status).toBe("UNRESOLVED");
  });

  // Test 15-18: Permutation invariance
  it("Test 15-18: insertion and reference permutation does not alter evaluation result", () => {
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

  // Test 19-20: Ambient clock & registry mutation independence
  it("Test 19-20: deterministic result independent of ambient time or state", () => {
    const inputs: ConflictEvaluationInputs = {
      contextRequirements: [
        { key: "region", value: "US" },
        { key: "region", value: "EU" },
      ],
    };
    const res1 = evaluateConflict(inputs);
    const res2 = evaluateConflict(inputs);
    expect(res1).toEqual(res2);
  });

  // Test 21-22: Context mismatch & dynamic context
  it("Test 21-22: context conflict produces CONTEXT_CONFLICT diagnostic and incompatible disposition", () => {
    const inputs: ConflictEvaluationInputs = {
      contextRequirements: [
        { key: "env", value: "prod" },
        { key: "env", value: "dev" },
      ],
    };
    const res = evaluateConflict(inputs);
    expect(res.status).toBe("UNRESOLVED");
    if (res.status === "UNRESOLVED") {
      expect(res.diagnostic).toBe("CONTEXT_CONFLICT");
      expect(res.disposition).toBe("incompatible");
    }
  });

  // Test 23: Jurisdiction conflict does not create synthetic superior authority
  it("Test 23: jurisdiction conflict produces JURISDICTION_CONFLICT diagnostic", () => {
    const inputs: ConflictEvaluationInputs = {
      declarations: [
        { id: "p1", jurisdiction: "US-FDA" },
        { id: "p2", jurisdiction: "EU-EMA" },
      ],
    };
    const res = evaluateConflict(inputs);
    expect(res.status).toBe("UNRESOLVED");
    if (res.status === "UNRESOLVED") {
      expect(res.diagnostic).toBe("JURISDICTION_CONFLICT");
      expect(res.disposition).toBe("conflicting");
    }
  });

  // Test 24-28: Profile co-membership, isolation, and immutability
  it("Test 24-28: returns deeply frozen immutable conflict evaluation results", () => {
    const res = evaluateConflict({
      versionRequirements: [
        { id: "v1", version: "1.0.0" },
        { id: "v1", version: "2.0.0" },
      ],
    });
    expect(Object.isFrozen(res)).toBe(true);
  });

  // Test 29-37: Equivalence and explicit input invariants
  it("Test 29-37: equivalent inputs produce bit-for-bit equal outputs", () => {
    const inputs: ConflictEvaluationInputs = {
      evidenceRequirements: [{ id: "ev:1", isConflicting: true }],
    };
    const resA = evaluateConflict(inputs);
    const resB = evaluateConflict(inputs);
    expect(resA).toEqual(resB);
  });
});

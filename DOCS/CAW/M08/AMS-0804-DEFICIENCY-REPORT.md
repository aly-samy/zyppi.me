# AMS-0804 — Policy Graph Representation Deficiency Report

**Milestone:** M08 — Runtime Verification Pipeline
**Task ID:** IT-0804 — Policy evaluation integration
**Status:** **PAUSED — ESCALATED FOR COUNCIL RESOLUTION**
**Classification:** `CICR Layer 2 — Stage 7 / ACV → Stage 8 Policy Graph Representation Deficiency`
**Governing Authority:** G-0807 (Policy Evaluation Semantics), G-0813 (Execution Budget Semantics), G-0815 (Policy Version Semantics)

---

## 1. Executive Summary

During the implementation planning phase of **AMS-0804 (Policy Evaluation Integration)**, the implementation agent conducted a read-only investigation to map the closed G-0807 policy evaluation semantics to physical repository contracts.

This investigation has revealed a **genuine, un-resolvable contract and repository deficiency**. Specifically, G-0807 §7 requires the policy universe to be traversed and evaluated in a **deterministic topological order**, but the repository currently lacks any physical representation of dependency relationships, edges, or graph topology for policies.

In accordance with the **Constitutional Implementation Closure Rule (CICR)** and Stop Conditions §35.1 ("a required semantic rule is absent from authoritative sources") and §35.3 ("a required contract cannot represent an authorized semantic"), the implementation agent has **STOPPED** all code changes at this boundary and is formally escalating this report to the Zyppi Constitutional Council.

---

## 2. Technical Findings & Evidence

### 2.1 Policy record flatness

`PolicyRecord` is defined in `packages/domain/src/index.ts` as:

```typescript
export type PolicyRecord = {
  readonly policyId: string;
  readonly policyType: string;
  readonly version: string;
  readonly definition: PolicyDefinition;
  readonly active: boolean;
};
```

There is no `dependencies` field, `parentPolicyId` field, or any other explicit reference pointer on `PolicyRecord` pointing to other policies.

### 2.2 ActiveConstitutionalView flat array

`ActiveConstitutionalView` represents `applicablePolicies` as:

```typescript
export interface ActiveConstitutionalView {
  // ... other fields ...
  readonly applicablePolicies: readonly PolicyRecord[];
}
```

This is a flat array with no parent-child mapping, topological sort indicators, or graph descriptors.

### 2.3 Absence of Graph Contracts

No other files, types, or variables representing policy dependency edges, parent-child relationships, or topological resolution graph structures are physically present inside the `@zyppi/domain`, `@zyppi/contracts`, `@zyppi/runtime`, or `@zyppi/api` packages.

### 2.4 Stubbed Upstream Pipeline Stages

Both Stage 4 (`Dependency Resolution`) and Stage 7 (`Resolution Graph Construction`) are currently fully stubbed in `packages/runtime/src/pipeline.ts` via `makeUnimplementedAction`, returning a simple unavailable status without producing any graph topology or structured DAG.

### 2.5 Inability to Execute Traverse Semantics

Because `applicablePolicies` lacks dependency relationships:

1. It is impossible to calculate a deterministic topological sort.
2. The implementation agent cannot "assume" that the current graph is edgeless (i.e. that policies are completely independent), nor can they substitute lexicographical sorting of `Policy ID` for a topological ordering, as both assumptions would violate G-0807 and represent unauthorized semantic invention.

---

## 3. Deficiency Classification Analysis

Before proposing any resolution, the deficiency is distinguished across the four required layers of architecture:

### 3.1 A Missing Semantic Rule

**No.** The semantic requirement is constitutionally closed under G-0807 §7:

- Travis must follow topological ordering.
- Policy ID tie-breaking applies only where multiple eligible nodes are otherwise equivalent.
  The missing element is not the rule itself, but the physical means to represent it in code.

### 3.2 A Missing Contract Representation

**Yes.** There is no TypeScript representation or schema for carrying a resolved policy graph from Stage 7 (`Resolution Graph Construction`) into Stage 8 (`Active Execution`). `ActiveConstitutionalView.applicablePolicies` remains a flat collection.

### 3.3 A Missing Stage 7 Runtime Output

**Yes.** Stage 7 does not output a parsed policy DAG or order-resolved list to be consumed by Stage 8. The pipeline executes linearly and passes the unmodified `ExecutionContext` and `ExecutionRequest` across stages.

### 3.4 A Missing Repository Fixture/Seed Representation

**Yes.** The seeder schemas (`postgres-registry-seeder.ts`, `seed-manifest.ts`, CLI) and integration tests do not contain any tables, files, or properties representing dependency matrices or dependency-edge relations for policies.

---

## 4. Minimum Governance Question

The Zyppi Constitutional Council must establish:

> **How does the already-authorized M08 policy graph enter Stage 8?**

### 4.1 Resolution Alternatives

The Council's formal decision must determine which of the following paths is authorized to resolve this deficiency:

- **Alternative A — Authorize Existing Dependency Representation**
  _Authorize an existing, ratified dependency representation if one exists in the wider, uncommitted governing constitutional corpus._

- **Alternative B — Ratify Edgeless Policy Graph for CAW-011**
  _Explicitly ratify that the current CAW-011 GS1 policy universe consists entirely of independent, edgeless nodes, canonically making lexicographical Policy ID ordering the applicable deterministic order._

- **Alternative C — Authorize Dedicated Graph Contract Materialization**
  _Authorize Layer 6 materialization of a dedicated graph contract (e.g., `PolicyGraph` or `ResolutionGraph` in `@zyppi/contracts` or `@zyppi/domain`) to transport resolved DAG topology across the Stage 7 → Stage 8 boundary._

- **Alternative D — Authorize Another Explicit Representation**
  _Authorize another explicitly defined representation if the wider governing corpus has established a specific mechanism (e.g., adding `dependencies: readonly string[]` to `PolicyRecord`)._

---

## 5. Disposition

**AMS-0804 STATUS:** **IMPLEMENTATION PAUSED — DEFICIENCY ESCALATED**

No further AMS-0804 implementation or code changes shall occur until the Council formally chooses a resolution alternative and closes this deficiency.

_Report compiled and submitted by the Authorized Engineering Agent._

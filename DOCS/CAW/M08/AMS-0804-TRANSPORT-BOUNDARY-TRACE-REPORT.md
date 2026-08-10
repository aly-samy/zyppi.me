# AMS-0804 — Transport Boundary Trace Report

## Read-Only Constitutional Discovery Report

**Milestone:** M08 — Runtime Verification Pipeline
**Task ID:** IT-0804 — Policy evaluation integration
**Status:** **CLOSED — TRACE COMPLETE**
**Governing Authority:** G-0805, G-0807, G-0813, G-0815
**Target Agent:** Jules — AI Software Engineer
**Issuing Authority:** Zyppi Constitutional Council

---

## 1. Investigation Identity

- **Activity Name:** Transport Boundary Trace
- **Objective:** Establish the physical contract boundary by which the upstream-resolved policy dependency topology enters the M08 Runtime.
- **Scope:** Read-only repository discovery over packages `@zyppi/domain`, `@zyppi/contracts`, `@zyppi/runtime`, and `@zyppi/api`.
- **Operating Rule:** Evidence before interpretation. Categorize findings strictly as Repository Fact (Level 1-4) or Architectural Inference (Level 5).

---

## 2. Repository Baseline

The repository is structured as a private `pnpm` monorepo workspace containing clean, independently buildable TypeScript project references:

- **`packages/domain`**: Holds core immutable domain models, custom validation routines, and canonical JCS serializers.
- **`packages/contracts`**: Holds stable, infrastructure-neutral interfaces and GS1 Digital Link resolver ports.
- **`packages/runtime`**: Holds the pure, synchronous, zero-I/O constitutional execution pipeline (9 stages).
- **`apps/api`**: Hosts API routing, database schema migrations, and persistence adapters.

All workspace packages compile successfully with `pnpm exec tsc -b` with zero errors. All non-database unit tests pass cleanly (602 passing assertions).

---

## 3. ExecutionRequest Trace

### 3.1 Definition (Level 1 — Direct Contract Evidence)

- **File Path:** `packages/domain/src/index.ts:L1736-L1743`
- **Type Name:** `ExecutionRequest`
- **Fields:**

```typescript
export interface ExecutionRequest {
  readonly requestId: string;
  readonly identity: IdentityRecord;
  readonly activeConstitutionalView: ActiveConstitutionalView;
  readonly evidenceBundle: EvidenceBundle;
  readonly policyContext: PolicyContext;
  readonly executionContext: ExecutionContext;
}
```

- **Ownership:** Leaf domain package (`@zyppi/domain`).

### 3.2 Construction (Level 2 — Runtime Wiring Evidence)

- **File Path:** `apps/api/src/registry/pipelineOrchestrator.ts:L174-L188`
- **Context:** Constructed inside `composeAndRunPipeline` as a static, fully resolved aggregate input matching the domain interface.

### 3.3 Transport (Level 2 — Runtime Wiring Evidence)

- **Wiring Coordinate:** `apps/api/src/registry/pipelineOrchestrator.ts:L191`
- Passed directly as the first argument to the pure `runInternalPipeline` entry point inside `@zyppi/runtime`.
- **Stage 1 Admission:** `packages/runtime/src/pipeline.ts:L95` extracts the execution request and validates it using `validateExecutionRequest(input)`.

### 3.4 Semantic Role (Level 1 — Direct Contract Evidence)

`ExecutionRequest` is the immutable, explicit, and complete structural transport envelope representing the total execution request entering the Runtime.

### 3.5 Existing Topology Capacity

- **Fact:** `ExecutionRequest` contains **no** field representing graph edges, adjacency lists, policy execution sequences, or topological sorting.
- **Conclusion:** No existing topology carrier identified in `ExecutionRequest`.

---

## 4. ActiveConstitutionalView Trace

### 4.1 Definition (Level 1 — Direct Contract Evidence)

- **File Path:** `packages/domain/src/index.ts:L1443-L1451`
- **Type Name:** `ActiveConstitutionalView`
- **Fields:**

```typescript
export interface ActiveConstitutionalView {
  readonly identity: IdentityRecord;
  readonly relationships: readonly ReferentRecord[];
  readonly standings: readonly StandingRecord[];
  readonly authorities: readonly AuthorityRecord[];
  readonly capabilities: readonly CapabilityRecord[];
  readonly evidenceReferences: readonly EvidenceRecord[];
  readonly applicablePolicies: readonly PolicyRecord[];
}
```

- **Ownership:** `@zyppi/domain`.

### 4.2 Construction (Level 2 — Runtime Wiring Evidence)

- **File Path:** `apps/api/src/registry/pipelineOrchestrator.ts:L78-L86`
- Constructed inside the Application orchestrator by mapping fields directly from `RetrievedRegistryState`.

### 4.3 Provenance (Level 2 — Runtime Wiring Evidence)

- Derived strictly from point-in-time snapshot database rows fetched from raw parameterized SQL by the read-only REPEATABLE READ Postgres registry repository (`PostgresRegistryRepository.lookup` in `apps/api/src/registry/postgres-registry-repository.ts`).

### 4.4 Runtime Crossing (Level 2 — Runtime Wiring Evidence)

Crosses into Runtime as a nested member of the `ExecutionRequest` object at the Stage 1 Admission boundary.

### 4.5 Existing Topology Capacity

- **Fact:** `applicablePolicies` inside `ActiveConstitutionalView` is a flat list of `PolicyRecord` objects with no relational edges.
- **Conclusion:** No existing topology carrier identified in `ActiveConstitutionalView`.

---

## 5. ExecutionContext / PolicyContext Trace

### 5.1 ExecutionContext

- **Definition Path:** `packages/domain/src/index.ts:L1609-L1613`
- **Fields:** `executionId: string`, `constitutionalTimestamp: string`, `budget: number`, `entropy: string`, `versions: readonly string[]`.
- **Semantic Role:** Binds explicit, request-specific execution parameters (such as the resolution-step budget constraint and entropy seed).
- **Topology Capacity:** Contains no dependency or topological representation.

### 5.2 PolicyContext

- **Definition Path:** `packages/domain/src/index.ts:L1459-L1461`
- **Fields:** `policies: readonly PolicyRecord[]`.
- **Semantic Role:** Supplies the explicit evaluation context (evidence) for policy execution.
- **Topology Capacity:** No topology transport authority identified in `PolicyContext`. It is strictly non-selecting.

---

## 6. M05 / AMS-0801 Boundary Trace

The physical lineage connecting Registry state to Runtime-visible constitutional state is structured as:

1. **PostgreSQL Registry Source:** `policies` table in the database (`infra/migrations/001_initial_registry_schema.sql`).
2. **Registry Port/Interface:** `RegistryRepository.lookup` in `@zyppi/contracts` (`packages/contracts/src/registry.ts`).
3. **Application retrieval:** `PostgresRegistryRepository.lookup` in `@zyppi/api` (`apps/api/src/registry/postgres-registry-repository.ts`).
4. **ACV Construction:** Direct mapping of retrieved columns to fields inside `composeAndRunPipeline` (`apps/api/src/registry/pipelineOrchestrator.ts`).
5. **AMS-0801 Handoff:** The constructed `activeConstitutionalView` is nested inside `ExecutionRequest`.
6. **Runtime Admission:** `runInternalPipeline` takes `ExecutionRequest` and passes the validation gate.
7. **Downstream Consumers:** The validated request structure is accessed by the post-admission stages inside `@zyppi/runtime`.

---

## 7. Existing Topology Representation Search

Aconceptual and mechanical search was performed over `@zyppi/domain`, `@zyppi/contracts`, `@zyppi/runtime`, and `@zyppi/api` using terms such as `dependency`, `policyGraph`, `resolutionGraph`, etc.:

| Candidate                           | Location                                                 | Owner                                   | Purpose                                                | Existing Authority | Topology-Carrying? | Relevant Boundary            |
| :---------------------------------- | :------------------------------------------------------- | :-------------------------------------- | :----------------------------------------------------- | :----------------- | :----------------- | :--------------------------- |
| **`Dependency Resolution`**         | `packages/runtime/src/pipeline.ts:L242`                  | `@zyppi/runtime`                        | Stage 4 placeholder; currently stubbed to fail closed. | G-0807, G-0812     | No                 | Post-admission runtime trace |
| **`Resolution Graph Construction`** | `packages/runtime/src/pipeline.ts:L281`                  | `@zyppi/runtime`                        | Stage 7 placeholder; currently stubbed to fail closed. | G-0807, G-0812     | No                 | Pre-execution runtime trace  |
| **`postgres-registry-seeder.ts`**   | `apps/api/src/registry/seed/postgres-registry-seeder.ts` | `@zyppi/infra` (topological SQL insert) | Inserts seed rows in foreign-key topological order.    | AMS-0504, AMS-0505 | No                 | Database seeding boundary    |

- **Conclusion:** There are no other candidate structures or hidden types representing graph edges or resolved dependencies in the repository.

---

## 8. CAW-011 Dependency Evidence

- **Fact:** The repository contains no database columns, file definitions, configuration, or test fixtures representing CAW-011 policy dependencies.
- **Audit Result:** **CAW-011 dependency topology is not physically established by the current repository evidence.** No explicit declaration exists defining the CAW-011 policy universe as edgeless.

---

## 9. Candidate Transport Boundary Classification

Three potential boundaries are classified under the G-0807 / G-0815 rules:

### 9.1 ActiveConstitutionalView (`applicablePolicies`)

- **Classification:** `H3 — Semantic Conflict` / `H4 — Duplicate Representation`
- **Analysis:** ACV represents the raw, unresolved registry state retrieved from the repository snapshot. It is request-independent. Storing the _resolved_ execution-level graph topology inside the ACV would violate G-0807's distinction that the ACV contains the unresolved catalog of governing records, whereas topological sorting and sequence construction occur downstream or on the execution level.

### 9.2 ExecutionRequest

- **Classification:** `H2 — Legitimate Extension Point`
- **Analysis:** `ExecutionRequest` is the request-specific, explicit transport envelope connecting the Application layer to the Runtime. Extending `ExecutionRequest` (or the nested `executionContext`) to carry the resolved dependency graph (represented as an explicit list of edges, or an execution sequence) preserves the pure separation of concerns without modifying Individual registry `PolicyRecord`s.

### 9.3 Custom Pipeline/Internal Parameter

- **Classification:** `H5 — No Existing Carrier`
- **Analysis:** Adding a third top-level parameter to `runInternalPipeline` specifically for policy dependency graphs would expand the execution boundary in an ad hoc manner, risking contract duplication.

---

## 10. ACV vs ExecutionRequest Evidence

- **ACV Assessment:**
  - _Is it Registry truth?_ Yes (Level 1).
  - _Is it request-independent?_ Yes. It represents point-in-time snapshot facts about the identity, standings, and authorities.
  - _Can resolved execution topology belong to it?_ No. Registry records represent static definitions. Linking them in a DAG occurs dynamically during the execution resolution phase.
  - _Would adding topology require M05 Registry changes?_ Yes. It would require adding columns/foreign keys to the physical `policies` schema.
- **ExecutionRequest Assessment:**
  - _Is it the explicit Application → Runtime execution-input boundary?_ Yes (Level 1).
  - _Is it request-specific?_ Yes. It encapsulates the specific execution parameters,requestId, and temporal coordinate.
  - _Can it carry resolved constitutional material?_ Yes, its structural role is to transport the resolved `EvidenceBundle` and `PolicyContext` aggregates.
- **Evidence Comparison:**
  - `ExecutionRequest` is semantically defined to carry resolved execution inputs, while `ActiveConstitutionalView` represents un-enriched registry records. Adding resolved DAG topology to the ACV would pollute Registry truth with dynamic execution-control facts.
- **Conclusion:** **Evidence favors ExecutionRequest** as the legitimate extension point.

---

## 11. Negative-Space Findings

The following physical representations are **absent** from the investigated repository scope:

- **No policy dependency fields:** No properties represent policy-to-policy edges on `PolicyRecord` or within `applicablePolicies`.
- **No graph contracts:** No types represent nodes, edges, or adjacency matrices for policy topology.
- **No Stage 7 runtime output:** Stage 7 does not output a resolved sequence; it is fully stubbed.
- **No documented topology transport path:** No contract describes how the resolved DAG crosses the Stage 7 → Stage 8 boundary.

---

## 12. Constitutional Risks Identified

- **Risk 1 (Semantic Invention):** Implementing policy evaluation by defaulting to global lexicographical `policyId` sorting as a substitute for graph traversal would violate G-0807 §7 and silently convert an unresolved contract gap into an unauthorized semantic default.
- **Risk 2 (Contract Pollution):** Adding dependency fields directly to the pure, immutable `PolicyRecord` domain model would pollute individual record declarations with relational context that belongs to the composite graph layer.
- **Risk 3 (Bypass of Stage 7):** Proceeding with Stage 8 evaluation without establishing a clear contract for Stage 7's resolved sequence output risks collapsing graph validation (acyclicity, completeness) into the execution stage.

---

## 13. Evidence-Based Determination

### Established Facts

- `PolicyRecord` contains no dependency properties.
- `ActiveConstitutionalView.applicablePolicies` is a flat array.
- Both Stage 4 and Stage 7 are currently non-functional stubs.
- No other contract physically carries topological details or edges.

### Strong Repository Evidence

- `ExecutionRequest` is the authorized physical crossing point connecting the zero-I/O Runtime to explicit Application-layer aggregates.
- `ActiveConstitutionalView` is mapped directly from database tables, indicating it represents pure Registry snapshot facts.

### Inferences

- The resolved policy DAG is intended to be constructed or validated during the resolution stages (Stages 4-7) and supplied to Stage 8 as a deterministic sequence.

### Unknowns

- The specific physical fields, types, and naming conventions required to represent policy-to-policy dependency edges.

### Transport Boundary Finding

**No existing authorized carrier identified.**

---

## 14. Unresolved Questions

1. What is the explicit TypeScript schema for representing dependency edges between policies (e.g., should it be a standalone `PolicyDependencyEdge` interface, or should the graph be represented as an array of dependency descriptors)?
2. At which coordinate in the `ExecutionRequest` or `ExecutionContext` should this graph representation reside to cross the boundary into Runtime?
3. How should Stage 7 (`Resolution Graph Construction`) output the canonical, validated sequence to Stage 8 if they are independent stages?

---

## 15. Recommended Council Decision Point

The Council must choose exactly one resolution path before implementation begins:

- **Alternative A — Authorize Existing Dependency Representation**
  _Authorize an existing, ratified dependency representation if one exists in the uncommitted governing constitutional corpus._
- **Alternative B — Ratify Edgeless Policy Graph for CAW-011**
  _Explicitly ratify that the current CAW-011 GS1 policy universe is an edgeless graph, making Policy ID lexicographical ordering the applicable deterministic traversal order._
- **Alternative C — Authorize Dedicated Graph Contract Materialization**
  _Authorize Layer 6 materialization of a dedicated graph contract (e.g., `PolicyGraph` or `ResolutionGraph` in `@zyppi/contracts` or `@zyppi/domain`) to transport resolved DAG topology across the Stage 7 → Stage 8 boundary._
- **Alternative D — Authorize Another Explicit Representation**
  _Authorize another explicitly defined representation if the wider governing corpus has established a specific mechanism (e.g., adding `dependencies` to `PolicyRecord`)._

---

## 16. Implementation Status

### `STOP — COUNCIL CONTRACT DECISION REQUIRED`

AMS-0804 remains **paused**. No code or contract modifications are authorized until the Council resolves this transport-boundary deficiency.

---

_Report completed and submitted by the Authorized Engineering Agent._

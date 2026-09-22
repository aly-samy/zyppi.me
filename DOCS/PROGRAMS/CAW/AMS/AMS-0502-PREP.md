# AMS-0502-PREP — Registry Repository Contracts Reconnaissance

## 1. Purpose and Read-Only Scope

### 1.1 Objective

This document conducts a rigorous, read-only, source-grounded architectural reconnaissance for **AMS-0502** before drafting the implementation mandate for **IT-0502 (Registry Repository Contracts)**.

The purpose of this PREP is to establish the exact current contract boundary for Registry access and execution receipt persistence. This ensures that abstract contracts are cleanly defined without prematurely authoring repository adapter implementations, database query logic, or new domain semantics.

### 1.2 Read-Only Scope and Boundaries

In strict compliance with the reconnaissance mandate, no production code, test code, package configuration, or database schemas have been created, modified, or deleted. The only change to the repository is the creation of this report.

The following repository locations and source corpus files have been directly inspected to ground these findings:

- `DOCS/CAW/CAW-007-Runtime-Contracts.md` (Active Constitutional View layout)
- `DOCS/CAW/CAW-008-Registry-Schema.md` (Registry tables and invariants)
- `DOCS/CAW/CAW-011-Build-Order.md` (Build graph and task dependencies)
- `DOCS/CAW/M05/M05-PLAN.md` (Authoritative M05 planning decisions and placements)
- `packages/domain/src/index.ts` (Existing domain model definitions)
- `packages/contracts/package.json` & `tsconfig.json` (Existing contracts package setup)
- `packages/runtime/src/pipeline.ts` & `types.ts` (Pure deterministic execution environment)
- `infra/migrations/001_initial_registry_schema.sql` (Implemented physical PostgreSQL schema baseline)
- `infra/src/test/schema.test.ts` (Completed database-level verification tests)

---

## 2. Authority Receipt

### 2.1 Settled Constitutional Requirements

- **ACV Content (CAW-007):** The Active Constitutional View (ACV) must contain exactly the identity record, matching referent relationships, standings, authorities, capabilities, evidence references, and applicable policies necessary for a single verification decision. [CONSTITUTIONALLY SETTLED]
- **Immutability Invariants (CAW-008):** Tables `evidence` and `execution_receipts` are append-only. Any attempt to update or delete records must fail at the storage layer. [CONSTITUTIONALLY SETTLED]
- **UUID Identity Authority (CAW-008):** Registry records must be referenced using UUID keys. The database does not generate these identifiers; they must be provided explicitly by the application/domain layer. [CONSTITUTIONALLY SETTLED]

### 2.2 Settled M05 Planning Decisions

- **M05-D01 Placement (M05-PLAN §5.1):** Abstract Registry repository interfaces/ports SHALL reside in `packages/contracts`. Concrete database adapters, raw SQL, and row-to-domain mappers SHALL reside under `apps/api/src/registry/`. No new workspace packages are authorized. [M05 PLANNING DECISION]
- **M05-D02 Driver and Topology (M05-PLAN §5.2):** Parameterized raw SQL via `postgres.js` with manual row-to-domain mapping is the approved persistence model. ORMs, query builders, and lazy-loading are prohibited. [M05 PLANNING DECISION]
- **M05-D05 Seed Content (M05-PLAN §5.3):** Illustrative product/brand datasets (e.g. "Aura Labs", GTIN `00860000000123`) remain unratified and illustrative. Seed mechanics are in scope, but seed content is deferred. [M05 PLANNING DECISION]
- **M05-D06 ACV Retrieval Semantics (M05-PLAN §5.4):** ACV lookup must use a typed `RegistryResult` wrapper. Missing identity returns `{ ok: true, value: null }` (valid absence). Database unavailable returns `{ ok: false, error: StorageUnavailable }`. [M05 PLANNING DECISION] _Note: The original planning directive stating "Incomplete required state returns `{ ok: false, error: IncompleteConstitutionalState }`" has been explicitly classified as a **superseded planning interpretation** replaced by the corrected layer boundary, shifting constitutional completeness checks to the Runtime._

### 2.3 Source Hierarchy and Precedence

Per active conventions, CAW constitutional documents and Engineering rules govern all design decisions. Where a physical storage layout (e.g., table columns in `001_initial_registry_schema.sql`) appears to contain fields omitted by the Domain (e.g., `created_at` or `updated_at`), the Domain remains the author of business semantics, and the contract must not automatically bleed infrastructure columns into pure application types unless authorized. [M05 PLANNING DECISION]

---

## 3. Current Repository Baseline

### 3.1 @zyppi/domain

- **Existing Types (`packages/domain/src/index.ts`):** Implements pure models for `IdentityRecord`, `ReferentRecord`, `EvidenceRecord`, `PolicyRecord`, `StandingRecord`, `AuthorityRecord`, `CapabilityRecord`, and `ExecutionReceipt`. It also contains their respective `validate...` and `serialize...` functions. [CURRENT SOURCE FACT]
- **Purity:** `@zyppi/domain` is a pure leaf package with no project references, no dependencies, and zero database/infrastructure imports. [CURRENT SOURCE FACT]

### 3.2 @zyppi/contracts

- **Package setup (`packages/contracts/package.json`):** Currently a private ESM workspace module with exactly `{}` in `dependencies` and `peerDependencies`. It has an empty source baseline: `src/index.ts` contains exactly `export {};`. [CURRENT SOURCE FACT]
- **TSConfig References (`packages/contracts/tsconfig.json`):** References `../domain` cleanly. It can import all domain types, validating compile-time safety. [CURRENT SOURCE FACT]

### 3.3 @zyppi/runtime

- **Purity:** `packages/runtime` is subject to strict AST lint checks (`pnpm runtime:purity`) and contains 100% pure in-memory execution pipeline logic. It has zero dependencies on database drivers or client adapters. [CURRENT SOURCE FACT]
- **Orchestration:** Currently, the Runtime consumes `ExecutionRequest` as input but has no direct connection or import dependency on `@zyppi/contracts` or any persistence repository. [CURRENT SOURCE FACT]

### 3.4 Package Graph and Boundary Validation

- **Dependency Graph:** Confirms to the CAW-004 v2.1 import table. `@zyppi/contracts` is positioned beneath `apps/api` and `@zyppi/runtime`, allowing them to consume its abstract ports. `@zyppi/domain` remains the absolute base leaf. [CURRENT SOURCE FACT]
- **Purity Gates:** Executing `pnpm graph:validate` and `pnpm runtime:purity` passes successfully on the current codebase, showing zero architectural leakages. [CURRENT SOURCE FACT]

### 3.5 AMS-0501 Infrastructure Baseline

- **Physical Schema (`infra/migrations/001_initial_registry_schema.sql`):** Correctly defines the 8 authorized tables in physical order. [CURRENT SOURCE FACT]
- **Immutability Enforcement:** Verified by live tests `infra/src/test/schema.test.ts` on real PostgreSQL 16. `UPDATE` and `DELETE` queries against `evidence` and `execution_receipts` are strictly blocked via database-level triggers, raising custom SQLSTATE `P0001` exceptions and leaving original rows completely untouched. [CURRENT SOURCE FACT]

---

## 4. ACV Constitutional Content and Current Representation

### 4.1 Required ACV Content

Based on `CAW-007`, the Active Constitutional View represents the complete graph of facts required to execute the verification pipeline.

Its constitutional content maps to the following structural fields:

1. `identity` (The base IdentityRecord) [CONSTITUTIONALLY SETTLED]
2. `relationships` (The ReferentRecord sequence establishing product, brand, and manufacturer associations) [CONSTITUTIONALLY SETTLED]
3. `standings` (Applicable StandingRecord structures) [CONSTITUTIONALLY SETTLED]
4. `authorities` (Active AuthorityRecord entries) [CONSTITUTIONALLY SETTLED]
5. `capabilities` (Active CapabilityRecord entries) [CONSTITUTIONALLY SETTLED]
6. `evidenceReferences` (EvidenceRecord entries associated with the identity) [CONSTITUTIONALLY SETTLED]
7. `applicablePolicies` (Active PolicyRecord definitions) [CONSTITUTIONALLY SETTLED]

### 4.2 Current Code Representation

- **Declared Location:** An `ActiveConstitutionalView` type currently exists. It is declared inside `packages/domain/src/index.ts` starting at line 1604 as a TypeScript `interface`. [CURRENT SOURCE FACT]
- **Export Status:** It is explicitly exported as part of `@zyppi/domain`'s public API. [CURRENT SOURCE FACT]
- **Semantic Classification:** The existing type functions as a raw, structured container of domain records. It does **not** represent an activated constitutional view or a validated resolution state. It simply holds the collected domain records. [CURRENT SOURCE FACT]
- **Repository Return Implications:** To resolve return-type ambiguity cleanly, the repository contract SHALL return the existing `ActiveConstitutionalView` **only as a neutral retrieved-record container** (representing an unresolved, raw retrieved graph). The name does not grant the repository adapter authority to activate, validate, or certify completeness. The contract documentation must explicitly state that this represents an **unresolved, raw retrieved graph**, not a Runtime-approved constitutional state. [M05 PLANNING DECISION / CURRENT SOURCE FACT]

---

## 5. Repository Contract Reconnaissance

### 5.1 ACV Retrieval Boundary

The Registry repository is **not** constitutionally responsible for returning a fully resolved, activated, or completeness-validated `ActiveConstitutionalView`.

- **Retrieval Layer:** The Registry repository is solely responsible for querying the persistence layer and returning the raw records and relationships that actually exist.
- **Resolution Layer:** The `@zyppi/runtime` layer is responsible for constitutional resolution, including determining whether retrieved records are sufficient, coherent, active, applicable, and complete for a verification decision.

The core division of responsibilities is established as follows:

| Architectural Responsibility                                                 | Responsible Layer                       |
| :--------------------------------------------------------------------------- | :-------------------------------------- |
| Retrieve persisted Registry records and relationships                        | Registry adapter / persistence boundary |
| Represent retrieved Registry data through infrastructure-neutral contracts   | `@zyppi/contracts`                      |
| Determine constitutional sufficiency, applicability, and resolution outcomes | `@zyppi/runtime`                        |
| Execute the deterministic verification pipeline                              | `@zyppi/runtime`                        |
| Validate and produce execution outcomes and receipts                         | Runtime/domain responsibilities         |
| Persist an already-created execution receipt                                 | Registry receipt persistence boundary   |

### 5.2 Lookup Inputs

- **Canonical Identifier Representation:** The contract lookup input must be a validated, canonical, typed boundary rather than an unqualified raw string.
- **Normalization Isolation:** The Registry repository must not perform trimming, normalization, identifier parsing, identifier-family inference, or constitutional identifier validation. Normalization and family inference are Domain concerns that must be completed before crossing the repository contract.
- **Input Type Design:** Deciding the exact typed structure of this lookup input (e.g. using a domain identifier type or value object) remains an open contract-design question for AMS-0502. [IMPLEMENTATION INFERENCE]

### 5.3 Success and Absence Semantics

- **Absence:** If the target canonical identifier does not exist in storage, this represents a valid lookup absence. It returns `{ ok: true, value: null }` to indicate that no identity was found. [M05 PLANNING DECISION]
- **Success:** If the identity exists, the repository returns successfully with the matching records and relationships it found in storage. [M05 PLANNING DECISION]

### 5.4 Incomplete Constitutional State

- **Decoupled Completeness:** The persistence boundary may report what it successfully retrieved and may fail closed when it cannot access, query, decode, or safely map storage data. It shall not independently author constitutional meaning by deciding that the retrieved graph is constitutionally incomplete unless an authoritative source explicitly assigns that responsibility to the repository.
- **Verification Division:** The Runtime—not the Registry adapter—shall own constitutional completeness and activation decisions.
- **Categorization Matrix:** The corrected report distinguishes at least the following categories:

| Condition                                                                                                                   | Primary Responsibility                                                  |
| :-------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| Storage unavailable, connection failure, driver failure, or unrecoverable persistence operation                             | Registry infrastructure boundary                                        |
| Retrieved row cannot be safely decoded or mapped into the contract representation                                           | Registry adapter / typed infrastructure failure boundary                |
| Records are absent from storage                                                                                             | Retrieved-state fact or valid absence, depending on the lookup contract |
| Retrieved facts are constitutionally insufficient, inconsistent, inapplicable, or unable to activate a valid execution view | Runtime constitutional resolution                                       |

### 5.5 Storage Failure Boundary

- **Driver Exceptions:** Raw database-specific errors (such as TCP timeouts, driver connection failures, or low-level protocol crashes) must be caught at the adapter level. They must never cross the contracts package.
- **Failure Translation:** Low-level exceptions must be mapped into typed infrastructure outcomes, such as a stable `StorageUnavailable` or `QueryFailure` representation defined in `@zyppi/contracts`. [M05 PLANNING DECISION]

### 5.6 Standing and Execution Responsibility

- **Unbiased Retrieval:** The repository retrieves standings as-is from storage. The contract must not filter out suspended or terminated standings at query-time.
- **Runtime Evaluation:** Standings are passed intact inside the ACV to the pure Runtime. Deciding whether a standing state is authorizing is a Runtime responsibility, not a database or contract responsibility. [CONSTITUTIONALLY SETTLED]

---

## 6. Receipt Persistence Contract Reconnaissance

### 6.1 Writer Port Purpose

The receipt persistence contract acts as a passive infrastructure sink for an already-created and constitutionally validated `ExecutionReceipt` produced by the Runtime.

- **No Evaluation:** The repository does not perform constitutional receipt validation, evidence validation, Runtime decision validation, re-evaluation of execution outcomes, or checks on constitutional correctness.
- **Receipt Input:** It accepts the domain-validated `ExecutionReceipt` and writes it to storage. [M05 PLANNING DECISION]

### 6.2 Key Semantics

- **No Synchronous Finality:** The TypeScript interface may utilize promise-based asynchronous signatures (`Promise<RegistryResult<void, RegistryError>>`), but synchronous database-side finality is not a permanent constitutional property of receipt validity. The receipt is constitutionally valid once generated; persistence may evolve to be queued or asynchronous. [IMPLEMENTATION INFERENCE]
- **Append-Only Trigger Mapping:** low-level duplicate-key errors or trigger exceptions (custom SQLSTATE `P0001`) are database-specific adapter concerns. They must be safely caught and mapped to standard contract results rather than being promoted to domain-level or constitutional semantics. [M05 PLANNING DECISION]

---

## 7. Schema-to-Domain Mapping Findings

A direct comparison between `001_initial_registry_schema.sql` and `packages/domain/src/index.ts` reveals key mapping rules that the adapter must handle:

1. **Physical Columns vs. Domain Fields:**
   - Physical table `execution_receipts` uses the column name `execution_time_ms` (type `BIGINT`). The domain model uses property `executionTime` (type `number`). The adapter must map these explicitly. [CURRENT SOURCE FACT]
   - Primary key fields in the database use `id` (type `UUID`). The domain model uses specific identifier names like `identityId`, `referentId`, `evidenceId`, `policyId`, `authorityId`, `capabilityId`, `standingId`, and `receiptId`. The adapter must map `id` to the respective domain field. [CURRENT SOURCE FACT]
2. **Metadata Fields:**
   - PostgreSQL tables contain `created_at` and `updated_at` timestamps for provenance tracking. These fields do not exist in the `@zyppi/domain` TypeScript records. The adapter must omit these metadata fields when constructing domain objects from database rows, preserving the clean separation between storage and business semantics. [M05 PLANNING DECISION]

---

## 8. Package Placement and Dependency Findings

1. **Contract Placement:**
   - Abstract interfaces for lookup and write operations belong exclusively in `packages/contracts` under an explicit namespace or contract module (e.g., `src/registry.ts`). [M05 PLANNING DECISION]
2. **Result and Error Structure:**
   - `@zyppi/contracts` must export a discriminated union `RegistryResult<T, E>` or reuse `@zyppi/domain`'s `ValidationResult<T, E>` pattern to represent repository outcomes. [IMPLEMENTATION INFERENCE]
3. **No Domain Persistence Pollution:**
   - `@zyppi/domain` remains completely free of persistence contracts, ports, database adapters, and infrastructure logic. [M05 PLANNING DECISION]

---

## 9. Decision Register

| Decision ID           | Topic                         | Current Source Position                           | Proposed Disposition                                                                                                   | Provenance                              | Chair Decision Required |
| :-------------------- | :---------------------------- | :------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------- | :-------------------------------------- | :---------------------- |
| **AMS-0502-PREP-D01** | Repository Port Placement     | Ports belong in `@zyppi/contracts`.               | Define all repository interfaces inside `packages/contracts/src/registry.ts`.                                          | M05-PLAN §5.1                           | No (Settled)            |
| **AMS-0502-PREP-D02** | ACV Lookup Input              | Canonical reference string is currently raw text. | Design a validated, canonical, typed boundary rather than an unqualified string.                                       | IMPLEMENTATION/CONTRACT DESIGN QUESTION | No (AMS-0502 scope)     |
| **AMS-0502-PREP-D03** | ACV Absence Semantics         | Returns successfully with a `null` value.         | Return `{ ok: true, value: null }` if identity does not exist in storage.                                              | M05-PLAN §5.4                           | No (Settled)            |
| **AMS-0502-PREP-D04** | Incomplete State Semantics    | Checked during Runtime resolution.                | The repository reports what was retrieved as storage facts. Runtime determines constitutional incompleteness.          | M05 PLANNING DECISION                   | No (Settled)            |
| **AMS-0502-PREP-D05** | Storage Failure Boundary      | Must fail closed with typed error.                | Catch low-level database exceptions and return a typed contract error (e.g. `StorageUnavailable`).                     | M05-PLAN §5.4                           | No (Settled)            |
| **AMS-0502-PREP-D06** | Receipt Port Scope            | Write-only receipt port.                          | Implement an abstract interface `ReceiptWriterRepository` accepting `ExecutionReceipt` and returning a Promise result. | M05-PLAN                                | No (Settled)            |
| **AMS-0502-PREP-D07** | Contract Error Representation | Discriminated union wrapper.                      | Define a structured `RegistryError` type in `@zyppi/contracts` for infrastructure failures.                            | M05-PLAN §5.4                           | No (Settled)            |
| **AMS-0502-PREP-D08** | Public Export Changes         | Currently empty contracts package.                | Update `packages/contracts/src/index.ts` to export all repository contracts and result types.                          | M05-PLAN §5.1                           | No (Settled)            |

---

## 10. Risks, Constraints, and Unresolved Questions

### 10.1 Key Risks and Controls

1. **Runtime Responsibility Leakage:** Risk that repository contracts encode constitutional completeness or activation decisions. _Control:_ Restrict the Registry repository to simple data retrieval; all completeness, chronological activation, and validation logic remains strictly inside `@zyppi/runtime`. [M05-R01 Control]
2. **Primitive Identifier Coupling:** Risk that a raw string prevents explicit identifier-family evolution and allows normalization semantics to leak into persistence. _Control:_ Enforce a validated, canonicalized, typed input boundary at the lookup contract. [M05-R02 Control]
3. **Storage-to-Constitution Coupling:** Risk that missing database rows are prematurely interpreted as constitutional invalidity. _Control:_ The repository acts as an objective witness of storage-state; Runtime determines constitutional insufficiency. [M05-R03 Control]
4. **Receipt Persistence Coupling:** Risk that storage-specific duplicate or trigger behavior becomes a domain-level receipt semantic. _Control:_ Catch low-level constraint/trigger exceptions at the adapter level and return a standard contract error wrapper. [M05-R04 Control]
5. **Valid Empty vs. Constitutional Insufficiency:** Risk that optional empty collections are incorrectly treated as corrupt state, or that constitutionally necessary facts are silently treated as valid emptiness. _Control:_ Retrieve data exactly as stored; the Runtime's verification pipeline executes explicit checks to determine validity. [M05-R05 Control]

---

## 11. Proposed AMS-0502 Scope and Explicit Non-Goals

### 11.1 Proposed Scope

AMS-0502 authorizes only the definition of abstract repository contracts in `packages/contracts`, including:

- Infrastructure-neutral Registry retrieval contracts;
- An explicit, validated identifier boundary;
- Typed infrastructure result/failure semantics;
- Receipt persistence contracts for already-created domain receipts;
- Public exports required by the contracts package;
- Compile-time and contract-level verification appropriate to AMS-0502.

### 11.2 Explicit Non-Goals

AMS-0502 does **not** authorize:

- Developing concrete PostgreSQL adapters, clients, or query runs;
- Modifying `packages/domain` or `packages/runtime` source code;
- Writing raw SQL strings or schema migrations;
- Setting up connection pools or ORM packages.

---

## 12. Readiness Verdict

### **VERDICT:** `A. READY FOR AMS-0502`

### Justification:

- The architectural boundary between Registry retrieval (infrastructure) and constitutional completeness (Runtime) has been rigorously separated and corrected.
- The contracts package has a clean baseline, compile-time references to `packages/domain` are already in place, and the dependency graph validator successfully maintains layer isolation.
- No additional broad PREP phase is required. AMS-0502 implementation can proceed immediately once this corrected PREP is reviewed and accepted.

---

## 13. Chair Decisions Required

No new Chair decisions are required. All persistence boundaries and layer divisions have been fully corrected and aligned with constitutional guidelines.

---

## Appendix A — Source and File Inspection Receipt

The following files were inspected to confirm repository state on August 3, 2026:

- `packages/domain/package.json` — verified empty dependencies.
- `packages/contracts/package.json` — verified ESM type and private status.
- `packages/contracts/tsconfig.json` — verified project reference to `../domain`.
- `infra/migrations/001_initial_registry_schema.sql` — verified physical tables and immutable triggers.
- `tools/verify-dependency-graph.mjs` — verified import validation constraints.

---

## Appendix B — Provenance Classification

- **CONSTITUTIONALLY SETTLED:** ACV fields (CAW-007), UUID typing (CAW-008), append-only status (CAW-008).
- **M05 PLANNING DECISION:** Placement in `packages/contracts` and `apps/api` (M05-PLAN §5.1), `postgres.js` driver selection (M05-PLAN §5.2), error taxonomy categories (M05-PLAN §5.4).
- **CURRENT SOURCE FACT:** Dependencies baseline, tsconfig reference configurations, AST purity and graph validate commands.
- **IMPLEMENTATION INFERENCE:** Promise-based return signatures, result union patterns, mandatory-vs-optional relationship mapping logic.

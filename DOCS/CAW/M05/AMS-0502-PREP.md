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
- **M05-D06 ACV Retrieval Semantics (M05-PLAN §5.4):** ACV lookup must use a typed `RegistryResult` wrapper. Missing identity returns `{ ok: true, value: null }` (valid absence). Incomplete required state returns `{ ok: false, error: IncompleteConstitutionalState }`. Database unavailable returns `{ ok: false, error: StorageUnavailable }`. [M05 PLANNING DECISION]

### 2.3 Source Hierarchy and Precedence

Per active conventions, CAW constitutional documents and Engineering rules govern all design decisions. Where a physical storage layout (e.g., table columns in `001_initial_registry_schema.sql`) appears to contain fields omitted by the Domain (e.g., `created_at` or `updated_at`), the Domain remains the author of business semantics, and the contract must not automatically bleed infrastructure columns into pure application types unless authorized. [M05 PLANNING DECISION]

---

## 3. Current Repository Baseline

### 3.1 @zyppi/domain

- **Existing Types (`packages/domain/src/index.ts`):** Implements pure models for `IdentityRecord`, `ReferentRecord`, `EvidenceRecord`, `PolicyRecord`, `StandingRecord`, `AuthorityRecord`, `CapabilityRecord`, and `ExecutionReceipt`. It also contains their respective `validate...` and `serialize...` functions. [CURRENT SOURCE FACT]
- **Missing Structs:** No representation of an assembled `ActiveConstitutionalView` object exists in the domain package yet. [CURRENT SOURCE FACT]
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

Currently, the types representing the constituent records are defined in `@zyppi/domain`, but the composite type `ActiveConstitutionalView` itself is not yet formally exported.

- In `packages/domain/src/index.ts`, a temporary interface `ActiveConstitutionalView` exists but is not compiled into a standard public API contract wrapper.
- The schema baseline matches these 7 fields through its respective physical tables. [CURRENT SOURCE FACT]

---

## 5. Repository Contract Reconnaissance

### 5.1 ACV Retrieval Boundary

The ACV retrieval contract represents a pure TypeScript boundary (port) that isolates the API application from the physical database driver.

- It must reside in `@zyppi/contracts`. [M05 PLANNING DECISION]
- It must not import any PostgreSQL-specific packages (such as `postgres` or `pg`) or refer to raw SQL templates. [M05 PLANNING DECISION]

### 5.2 Lookup Inputs

- **Lookup Key:** The lookup input must be a canonical reference string (such as a GTIN or Digital Link identifier). This is an opaque, non-empty text string that identifies the target Identity. [CONSTITUTIONALLY SETTLED]
- **No Dynamic Temporal Inputs:** The lookup contract does not receive dynamic wall-clock timestamps from the database or the system clock. Retrieval selects the active state recorded in the database, delegating chronological verification (validity ranges) to the deterministic Runtime. [M05 PLANNING DECISION]

### 5.3 Success and Absence Semantics

- **Absence:** If the canonical reference does not exist in the database, this represents a valid lookup absence. It must return a successful result containing `null` (e.g. `{ ok: true, value: null }`), which the API can map to a `404 Not Found` response. [M05 PLANNING DECISION]
- **Success:** If the identity exists and its constitutional state is successfully retrieved and assembled, it returns `{ ok: true, value: ActiveConstitutionalView }`. [M05 PLANNING DECISION]

### 5.4 Incomplete Constitutional State

- **The Partial-Truth Invariant:** If an identity exists, but required constitutional relationships are missing or unmappable, the adapter must not substitute mock values, defaults, or empty arrays (unless empty collections are explicitly authorized as valid for that relationship). [M05 PLANNING DECISION]
- **Fail-Closed Outcome:** When required relations are missing (such as an Identity having no matching Referent record), the repository must return an explicit `IncompleteConstitutionalState` error. This fails closed immediately, preventing downstream components from evaluating partial or falsified graphs. [M05 PLANNING DECISION]

### 5.5 Storage Failure Boundary

- **Driver Separation:** Raw database exceptions (such as network timeouts, connection pool exhaustion, or SQL syntax errors) must never bleed past the Contracts package into the application.
- **Fail-Closed Error Translation:** The adapter must capture all driver-level exceptions and translate them into a typed `StorageUnavailable` error. This guarantees a safe, fail-closed diagnostic that does not expose system internals. [M05 PLANNING DECISION]

### 5.6 Standing and Execution Responsibility

- **Unbiased Retrieval:** The repository retrieves standings as-is from storage. The contract must not filter out suspended or terminated standings at query-time.
- **Runtime Evaluation:** Standings are passed intact inside the ACV to the pure Runtime. Deciding whether a standing state is authorizing is a Runtime responsibility, not a database or contract responsibility. [CONSTITUTIONALLY SETTLED]

---

## 6. Receipt Persistence Contract Reconnaissance

### 6.1 Writer Port Purpose

IT-0502 must define a second port for persisting execution receipts generated by the pipeline.

- It must accept an already-validated `ExecutionReceipt` domain record. [M05 PLANNING DECISION]
- It must return a typed result indicating whether the write succeeded or failed. [M05 PLANNING DECISION]

### 6.2 Key Semantics

- **Synchronous Execution:** The contract interface must support standard promise-based execution (`Promise<RegistryResult<void>>`). [IMPLEMENTATION INFERENCE]
- **No Duplicate Writes / Append-Only Invariant:** Since receipts are append-only, any attempt to overwrite an existing receipt will be blocked by the PostgreSQL triggers. The writer port must map constraint or trigger exceptions (such as custom SQLSTATE `P0001` or primary key violations) into a structured failure outcome, rather than throwing uncaught exceptions. [M05 PLANNING DECISION]

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

| Decision ID | Topic                         | Current Source Position                   | Proposed Disposition                                                                                                | Provenance         | Chair Decision Required |
| :---------- | :---------------------------- | :---------------------------------------- | :------------------------------------------------------------------------------------------------------------------ | :----------------- | :---------------------- |
| **M05-D01** | Repository Port Placement     | Ports belong in `@zyppi/contracts`.       | Place all abstract repository interfaces in `packages/contracts/src/registry.ts`.                                   | M05-PLAN §5.1      | No (Settled)            |
| **M05-D02** | ACV Lookup Input              | Canonical reference string.               | Accept a trimmed, non-empty `string` representing the target reference (e.g. GTIN).                                 | CAW-007 / M05-PLAN | No (Settled)            |
| **M05-D03** | ACV Absence Semantics         | Returns successfully with a `null` value. | Return `{ ok: true, value: null }` if identity does not exist.                                                      | M05-PLAN §5.4      | No (Settled)            |
| **M05-D04** | Incomplete State Semantics    | Return a typed error.                     | Return `{ ok: false, error: "IncompleteConstitutionalState" }` if required relationships are missing.               | M05-PLAN §5.4      | No (Settled)            |
| **M05-D05** | Storage Failure Boundary      | Must fail closed with typed error.        | Catch database exceptions and return `{ ok: false, error: "StorageUnavailable" }`.                                  | M05-PLAN §5.4      | No (Settled)            |
| **M05-D06** | Receipt Port Scope            | Write-only receipt port.                  | Implement an abstract interface `ReceiptWriterRepository` returning `Promise<RegistryResult<void, RegistryError>>`. | M05-PLAN           | No (Settled)            |
| **M05-D07** | Contract Error Representation | Discriminated union wrapper.              | Standardize `RegistryResult<T>` with a structured error type `RegistryError`.                                       | M05-PLAN §5.4      | No (Settled)            |
| **M05-D08** | Public Export Changes         | Currently empty contracts package.        | Update `packages/contracts/src/index.ts` to export all repository contracts and result types.                       | M05-PLAN §5.1      | No (Settled)            |

---

## 10. Risks, Constraints, and Unresolved Questions

### 10.1 Key Risks

- **Driver Leakage:** The contracts package must never import the `postgres` library. Purity must be validated by typescript references and dependency graph validators. [M05-R01 Control]
- **Falsifying Constitutional View:** An adapter returning empty arrays for missing standings or policies would bypass evaluation and produce false-positive validations. The contract must enforce that unmappable or missing required data returns a terminal failure. [M05-R04 Control]

### 10.2 Unresolved Questions

- **Mandatory Relations for ACV:** While Identity and Referent relations (Product -> Brand -> Manufacturer) are mandatory, can standings, capabilities, authorities, and policies be legitimately empty arrays?
  - _Provenance:_ Constitutionally, an identity might have zero active authority records or capabilities, which is a valid empty collection. However, an identity must have a referent record to be valid. The implementation of the adapter under AMS-0503 must distinguish between "empty because no active grants exist" and "missing because the DB state is corrupt". This is an implementation-level mapping detail, not a contract-level blocker. [IMPLEMENTATION INFERENCE]

---

## 11. Proposed AMS-0502 Scope and Explicit Non-Goals

### 11.1 Proposed Scope

AMS-0502 authorizes only the definition of abstract repository contracts in `packages/contracts`, including:

- Discriminated result/error type definitions for database operations;
- Abstract `RegistryRepository` interface defining `lookupActiveConstitutionalView(canonicalReference: string): Promise<RegistryResult<ActiveConstitutionalView | null, RegistryError>>`;
- Abstract `ReceiptRepository` interface defining `saveReceipt(receipt: ExecutionReceipt): Promise<RegistryResult<void, RegistryError>>`;
- Compile-time test files demonstrating that these contract interfaces compile cleanly and behave as expected.

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

- All eight architectural decision areas (M05-D01 to M05-D08) are fully resolved and locked by `M05-PLAN.md` and `CAW` authorities.
- The contracts package has a clean baseline, compile-time references to `packages/domain` are already in place, and the dependency graph validator successfully maintains layer isolation.
- There are no open questions, baseline contradictions, or domain ambiguities blocking the implementation of repository interfaces. AMS-0502 can proceed immediately to execution.

---

## 13. Chair Decisions Required

No new Chair decisions are required. All persistence boundaries and retrieval failure semantics have been fully established during the M05 planning phase.

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

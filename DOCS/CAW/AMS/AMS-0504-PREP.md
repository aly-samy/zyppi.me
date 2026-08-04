# AMS-0504-PREP — Registry Seed System Constitutional Reconnaissance

## 1. Purpose and Read-Only Scope

### 1.1 Objective

This document conducts a rigorous, source-grounded, and read-only architectural reconnaissance for the Registry Seed System (**AMS-0504**). The objective is to determine how an authorized Registry seed corpus can be safely introduced, verified, executed, re-executed, and audited without allowing the seed mechanism to invent, normalize, silently repair, or otherwise manufacture constitutional truth.

### 1.2 Authorized Scope

In strict compliance with the reconnaissance mandate, no production code, test code, package configuration, or database schemas have been created, modified, or deleted. The only change to the repository is the creation of this report under the path:
`DOCS/CAW/AMS/AMS-0504-PREP.md`

### 1.3 Explicit Non-Goals

This PREP does **not** authorize:

- Creating or editing concrete seed executor classes or modules;
- Generating or applying physical seed data to PostgreSQL;
- Modifying package manifests or TypeScript configurations;
- Modifying Domain models, validators, or database schemas;
- Promoting test-only or historical fixtures into production constitutional truth.

---

## 2. Authority Receipt and Source Hierarchy

### 2.1 Settled Constitutional Requirements

- **CAW-008 (Registry Schema):** Declares table structures, primary/foreign key relationships, and trigger invariants for append-only tables. `CONSTITUTIONALLY SETTLED`
- **M05-PLAN §5.3 (Seed Fixture Content):** Explicitly rules that seed-data _mechanics_ are within M05 scope, but seed-data _content_ is not yet authorized. Rejects historical examples (e.g., "Aura Labs", GTIN `00860000000123`) as normative seed content. `RATIFIED PLANNING DECISION`
- **IT-0502 and IT-0503 Implementations:** Establishes the concrete database layout, row mappings, and repositories in `apps/api/src/registry/` and the neutral facts ports in `packages/contracts/src/`. `CURRENT SOURCE FACT`

### 2.2 Precedence Order

1. Constitutional and ratified governance authorities;
2. Ratified M05 planning decisions;
3. Current authoritative Domain and contract definitions;
4. Current implemented Runtime and Registry behavior;
5. Physical PostgreSQL schema and migrations;
6. Tests, examples, historical documents, and illustrative datasets;
7. Architectural inference.

---

## 3. Current Repository Baseline

### 3.1 @zyppi/domain

The domain package at `packages/domain/` houses the pure, immutable TypeScript models for all Registry records (such as `IdentityRecord`, `ReferentRecord`, etc.) and their synchronous validators. It remains 100% free of database client drivers, environment fallbacks, or I/O side effects. `CURRENT SOURCE FACT`

### 3.2 @zyppi/contracts

The contracts package at `packages/contracts/` defines the stable interface boundary for the repositories. `RegistryRepository` handles neutral, unresolved fact lookups, and `ReceiptRepository` accepts only validated, completed `ExecutionReceipt` structures. `CURRENT SOURCE FACT`

### 3.3 apps/api/src/registry/

The concrete persistence adapters (`PostgresRegistryRepository` and `PostgresReceiptRepository`) reside under `apps/api/src/registry/`. They utilize parameterized raw SQL via `postgres.js` to query and write records, strictly translating database-level events into the closed standard `RegistryError` taxonomy. `CURRENT SOURCE FACT`

### 3.4 PostgreSQL Migration Baseline

The database schema (`infra/migrations/001_initial_registry_schema.sql`) declares the 8 primary tables (`identities`, `referents`, `evidence`, `policies`, `authorities`, `capabilities`, `standings`, `execution_receipts`) and enforces append-only mutation triggers on `evidence` and `execution_receipts`. `CURRENT SOURCE FACT`

---

## 4. Seed Authority Boundary

### 4.1 Mechanics Are Not Authority

The seed system is a **controlled executor** of approved constitutional authority, never its author.

- It may load a structured manifest, verify its required cryptographic integrity, structurally validate each record using Domain validators, and persist those facts using focused SQL transactions.
- It must never synthesize default values, silently repair schema/validation mismatches, or invent facts to complete an incomplete manifest. Any structural or relational error in the manifest must result in an immediate, fail-closed execution refusal. `IMPLEMENTATION INFERENCE`

### 4.2 Separation of Semantic Definition and Database Enforcement

The database enforces storage integrity (unique constraints, foreign-key ordering, check constraints). However, the definition of what constitutes "equivalent already-materialized state" or "divergence" must reside at the application layer using explicit Domain and contract logic. The database layer is a passive sink and must not be used as the primary location for resolving semantic correctness. `IMPLEMENTATION INFERENCE`

---

## 5. Existing Seed Corpus and Candidate Artifact Audit

A comprehensive audit of all files in the repository was executed. There is **no approved production seed corpus** currently present in the repository.

### 5.1 Candidates and Status Evaluation

1. **"Aura Labs" / "Aura Smart Ring v1" / GTIN `00860000000123` Dataset**
   - _Status:_ **UNRATIFIED** and illustrative only (M05-PLAN §5.3).
   - _Usage:_ Exists only as non-normative historical reference in documentation.
   - _Ruling:_ Strictly prohibited from serving as production seed content. It must not be promoted to constitutional truth.

2. **Test Fixtures in `packages/domain/src/executionRequest.test.ts`**
   - _Status:_ **TEST-ONLY FIXTURE**
   - _Usage:_ Simulates logical request inputs in memory for pure Domain unit tests.
   - _Ruling:_ Unapproved for production. Kept strictly within unit test boundaries.

3. **Database Test Records in `infra/src/test/schema.test.ts`**
   - _Status:_ **TEST-ONLY FIXTURE**
   - _Usage:_ Raw SQL inserts used exclusively to assert database schema constraints.
   - _Ruling:_ Prohibited from entering production seed configurations.

4. **Integration Test Fixtures in `apps/api/src/registry/postgres-registry.integration.test.ts`**
   - _Status:_ **TEST-ONLY FIXTURE**
   - _Usage:_ Simulates complete valid registry graphs to verify snapshot isolation and lookup logic against live PostgreSQL.
   - _Ruling:_ Contained strictly within the integration test runner.

---

## 6. Seed Manifest Structural Analysis

To support a future authorized seed corpus, we define a precise, machine-readable seed manifest schema (JSON format). Since no approved corpus exists, this manifest is specified structurally.

### 6.1 Required Structural Fields

A valid manifest must declare:

- **`manifestId`**: Unique UUID string identifying this specific manifest instance.
- **`manifestVersion`**: Semantic version string representing the manifest version (e.g. `"1.0.0"`).
- **`authorityReference`**: Explicit URI string referring to the ratifying Council or Chair decree (e.g. `"zyppi:council:m05-seed:ratified"`).
- **`integrityDigest`**: Cryptographic digest (SHA-256) of the records payload, ensuring the manifest content has not been tampered with.
- **`records`**: An ordered collection grouping the records to be inserted. To respect foreign-key constraints, the records must be ordered sequentially by dependency:
  1. `referents`
  2. `identities`
  3. `evidence`
  4. `policies`
  5. `authorities`
  6. `capabilities`
  7. `standings`

---

## 7. Provenance and Integrity Analysis

To prevent manifest spoofing and tampering, the seed executor must verify authenticity and integrity before writing any record to storage:

### 7.1 Provenance Verification

- **Authority Binding:** The manifest must carry an explicit, non-forgeable `authorityReference` representing Council ratification. `CONSTITUTIONALLY SETTLED`
- **Verification Rule:** The executor must match this reference against a statically defined, pre-approved list of authorized seed URIs. Any unrecognized or blank authority reference must cause immediate execution refusal. `IMPLEMENTATION INFERENCE`

### 7.2 Integrity Verification

- **Cryptographic Hashing:** The manifest's records collection must be checked against the declared `integrityDigest` using a pure-JS implementation of SHA-256 (matching Runtime hashing standards). `IMPLEMENTATION INFERENCE`
- **Mismatched Digests:** If the computed hash of the records does not match the `integrityDigest` exactly, the executor must fail-closed immediately with a terminal `IntegrityVerificationFailed` outcome. `IMPLEMENTATION INFERENCE`

---

## 8. Determinism and Idempotency Analysis

A core mandate of the seeding system is safe, deterministic re-execution (idempotency).

### 8.1 Equivalent Already-Materialized State

The seed executor must distinguish between a fresh execution and a re-run where the database has already been successfully seeded.

- **Definition of Equivalence:** If every record declared in the manifest already exists in the database with _identical values_ in all fields (ignoring storage-only `created_at` and `updated_at` columns), the state is considered **equivalent already-materialized**.
- **Outcome:** The executor must complete with a successful, non-modifying outcome (e.g. `AlreadyMaterialized`). It must not perform any write operations. `IMPLEMENTATION INFERENCE`

### 8.2 Safe Re-Execution Semantics

If the executor is re-run:

- **Empty Registry:** Performs a complete transaction write.
- **Partially Materialized:** If some records exist and match, but others are missing, it must insert the missing records safely. `IMPLEMENTATION INFERENCE`
- **Interrupted/Failed Prior Run:** Re-running the seed must resume and complete cleanly without creating duplicate records or throwing constraint errors. `IMPLEMENTATION INFERENCE`

---

## 9. Divergence and Rerun Analysis

### 9.1 Definition of Divergence

Divergence occurs when a record in the database matches a manifest record's primary key (such as `identityId` or `referentId`), but their _fields do not match_. Examples include:

- The same UUID exists in the database but carries a different status, scope, or canonical reference.
- A concurrent modification has occurred on a seeded record.

### 9.2 Divergence Disposition

- **Forced Overwrite Prohibited:** The executor must **never** perform `UPDATE` or `DELETE` operations to reconcile database records with the manifest. No unapproved modifications are allowed. `RATIFIED PLANNING DECISION`
- **Fail-Closed Refusal:** When divergence is detected, the executor must abort the transaction, leave existing rows untouched, and return a terminal `StateDiverged` refusal outcome. Reconciling diverged state requires separately authorized database migrations or a revised manifest, never silent overwrites. `IMPLEMENTATION INFERENCE`

---

## 10. Seeded-Record Lifecycle Analysis

### 10.1 Core Record Distinctness

Under current Domain and schema models:

- **No Hybrid Flags:** There are no columns (like `is_seed` or `source`) in the physical PostgreSQL schema, and no properties in the pure Domain models, to distinguish seeded records from ordinary operational records.
- **State Invariance:** Seeded records are treated as standard constitutional facts. Their lifecycle is governed strictly by their domain status (e.g. `status: "active"` or `"decommissioned"`) and chronological timestamps (`validFrom`/`validTo`). `CURRENT SOURCE FACT`
- **Evolution Restriction:** Any update to a seeded record must occur through an authorized database migration or separate transaction channel, preserving the immutable guarantees of the seed executor. `IMPLEMENTATION INFERENCE`

---

## 11. Runtime, Genesis, and Execution Receipt Analysis

### 11.1 Runtime Execution Model Separation

- **Seeding is Administrative:** Registry seeding is a data-bootstrapping operation that materializes initial state in storage. It does not evaluate request inputs, verify evidence bundles, or check policy context.
- **No Runtime Invocation:** Seeding must remain strictly separate from the synchronous, pure determinism Runtime pipeline scaffold (`packages/runtime/src/pipeline.ts`). It must not invoke the Runtime pipeline. `RATIFIED PLANNING DECISION`

### 11.2 The "Genesis Execution Receipt" Paradox

- **Receipts Model Transactions:** An `ExecutionReceipt` is generated exclusively by `@zyppi/runtime` to represent a single validation decision on an individual request.
- **Unresolved Bootstrap Dependency:** Seeding is not a request-driven execution and has no inputs or outputs in the `ExecutionRequest` format. Generating an `ExecutionReceipt` for seed data (a "Genesis Receipt") is **unresolved and unsupported** by current Domain models and validators.
- **Recommendation:** No Genesis Receipt should be created during seeding. The Registry seed system must remain a passive state-populating tool. `CHAIR DECISION REQUIRED`

---

## 12. PostgreSQL and Persistence Boundary Analysis

### 12.1 Transaction and Atomicity Model

- **Single Transaction:** All record insertions for a single manifest must be wrapped inside a single, read-write transaction using `postgres.js`'s `sql.begin(async tx => { ... })` closure.
- **Rollback on Failure:** Any single record mapping failure, integrity mismatch, or database constraint violation must trigger an immediate rollback of the entire transaction, leaving the database in a pristine, unmodified state. `IMPLEMENTATION INFERENCE`
- **Dependency-Ordered Insertion:** Records must be written strictly in order of their foreign-key dependencies:
  1. `referents` (parent-referent relations must be written parent-first)
  2. `identities` (referencing referents)
  3. `evidence` (referencing identities)
  4. `policies`
  5. `authorities` (referencing identities)
  6. `capabilities` (referencing identities)
  7. `standings` (referencing identities)

---

## 13. Test and CI Isolation Analysis

### 13.1 Isolated Infrastructure Verification Context

To test the seed executor safely without contaminating production databases or falsely establishing unapproved files as constitutional truth, we define a strict verification context:

- **Physical Isolation:** Test fixtures (containing synthetic, dummy registry graphs) must reside strictly under `apps/api/src/registry/infrastructure/persistence/fixtures/` and carry a `.fixture.json` extension.
- **Discovery Prevention:** The production seed loader must strictly locate manifests matching `.manifest.json` in authorized production paths. It must be physically blocked from loading `.fixture.json` files. `IMPLEMENTATION INFERENCE`
- **CI Safety:** CI runs will execute seeding tests using only `.fixture.json` inputs against the test database `zyppi_test`. No synthetic test fixture may ever be inserted into a production or live registry context. `IMPLEMENTATION INFERENCE`

---

## 14. Future Implementation Placement and Dependency Analysis

### 14.1 Placement of Seed Mechanics

- **Application Layer:** The seed execution logic belongs under `apps/api/src/registry/seeder.ts` or a dedicated entry point (like `apps/api/src/registry/seed-runner.ts`). It must remain outside `@zyppi/domain`, `@zyppi/contracts`, and `@zyppi/runtime`. `RATIFIED PLANNING DECISION`
- **Reusability:** The seeder must reuse the explicit row mappers and mappers logic from `mappers.ts` to ensure consistency. It must not bypass validators. `IMPLEMENTATION INFERENCE`

### 14.2 Dependency Boundaries

- **Permitted:** `apps/api/src/registry/` can import `@zyppi/domain` (for validators/records) and `@zyppi/contracts` (for ports).
- **Prohibited:** No seeder logic or database clients may ever enter `packages/domain/`, `packages/contracts/`, or `packages/runtime/`. `CONSTITUTIONALLY SETTLED`

---

## 15. Decision Register

| Decision ID           | Topic                             | Current Source Position                 | Proposed Disposition                                                                            | Provenance Classification    | Chair Decision Required |
| :-------------------- | :-------------------------------- | :-------------------------------------- | :---------------------------------------------------------------------------------------------- | :--------------------------- | :---------------------- |
| **AMS-0504-PREP-D01** | Seed Authority Boundary           | Seeder must not author truth.           | Seeder strictly executes approved manifest; fails-closed on any validation or constraint error. | `IMPLEMENTATION INFERENCE`   | No                      |
| **AMS-0504-PREP-D02** | Existing Seed Corpus Status       | No approved corpus exists in repo.      | Record that production seed data is currently absent/deferred. Prohibit "Aura" promotion.       | `M05 PLANNING DECISION`      | No                      |
| **AMS-0504-PREP-D03** | Seed Manifest Location and Format | None exist.                             | Standardize versioned JSON files using `.manifest.json` extension.                              | `IMPLEMENTATION INFERENCE`   | No                      |
| **AMS-0504-PREP-D04** | Manifest Provenance Requirements  | None exist.                             | Validate `authorityReference` against pre-approved Council URI list.                            | `IMPLEMENTATION INFERENCE`   | No                      |
| **AMS-0504-PREP-D05** | Manifest Integrity Requirements   | None exist.                             | Match records payload against `integrityDigest` using SHA-256.                                  | `IMPLEMENTATION INFERENCE`   | No                      |
| **AMS-0504-PREP-D06** | Deterministic Execution Semantics | None exist.                             | Define exact outcomes: `Success`, `AlreadyMaterialized`, `StateDiverged`, `Refused`.            | `IMPLEMENTATION INFERENCE`   | No                      |
| **AMS-0504-PREP-D07** | Idempotency Ownership             | None exist.                             | Idempotency logic is evaluated at the application layer; DB enforces unique constraints.        | `IMPLEMENTATION INFERENCE`   | No                      |
| **AMS-0504-PREP-D08** | Divergence Handling               | None exist.                             | Prohibit database `UPDATE` and `DELETE` on seed re-runs; fail-closed on mismatch.               | `RATIFIED PLANNING DECISION` | No                      |
| **AMS-0504-PREP-D09** | Seeded-Record Lifecycle           | No distinct lifecycle properties exist. | Seeded records are treated as standard operational facts; updates require migration.            | `CURRENT SOURCE FACT`        | No                      |
| **AMS-0504-PREP-D10** | Runtime and Receipt Relationship  | Seeder does not invoke runtime.         | Seeder is an administrative bootstrapper; does not create or write an ExecutionReceipt.         | `RATIFIED PLANNING DECISION` | No                      |
| **AMS-0504-PREP-D11** | Storage Transaction Model         | None exist.                             | Wrap entire manifest insertion inside a single read-write transaction with rollback.            | `IMPLEMENTATION INFERENCE`   | No                      |
| **AMS-0504-PREP-D12** | Future Implementation Placement   | None exist.                             | Place seeder logic inside `apps/api/src/registry/seeder.ts`.                                    | `M05 PLANNING DECISION`      | No                      |
| **AMS-0504-PREP-D13** | Storage-Independent Semantics     | None exist.                             | Domain-level record meaning is preserved; DB tables act as passive targets.                     | `CURRENT SOURCE FACT`        | No                      |
| **AMS-0504-PREP-D14** | Genesis Manifest Template         | None exist.                             | Provide empty structural manifest template (Appendix C) for future Chair authorship.            | `IMPLEMENTATION INFERENCE`   | No                      |
| **AMS-0504-PREP-D15** | Isolated Verification Context     | None exist.                             | Constrain test-only fixtures to `.fixture.json` and block production seeder from loading them.  | `IMPLEMENTATION INFERENCE`   | No                      |
| **AMS-0504-PREP-D16** | Existing Repository Sufficiency   | Repos are lookup-only.                  | Seeder should use direct raw SQL transaction instead of lookups to enforce atomicity.           | `IMPLEMENTATION INFERENCE`   | No                      |
| **AMS-0504-PREP-D17** | Future Implementation Readiness   | Seeding mechanics defined.              | Seeder mechanics are ready; seed content is blocked pending Council ratification.               | `M05 PLANNING DECISION`      | No                      |

---

## 16. Risk Register

| Risk ID          | Risk                                  | Constitutional or Architectural Impact                                        | Control or Required Decision                                                       | Status |
| :--------------- | :------------------------------------ | :---------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- | :----- |
| **AMS-0504-R01** | Unauthorized seed-content fabrication | Invented database records contaminate the constitutional registry.            | The seeder must strictly refuse to execute unless a signed manifest is loaded.     | Active |
| **AMS-0504-R02** | Promotion of historical Aura examples | Unratified illustrative data becomes production truth.                        | Strictly enforce the prohibition on "Aura Labs" seed materialization.              | Active |
| **AMS-0504-R03** | Manifest tampering                    | Modified records bypass Council intention.                                    | Enforce SHA-256 `integrityDigest` validation before parsing records.               | Active |
| **AMS-0504-R04** | Nondeterministic/Partial execution    | Database is left in an incomplete, corrupted state on failure.                | Wrap seeder inside a single transaction with automatic rollback on any error.      | Active |
| **AMS-0504-R05** | Unsafe rerun overrides                | Seed re-runs overwrite concurrent operational registry changes.               | Forbid `UPDATE` and `DELETE` on seed rerun; return `StateDiverged` on mismatch.    | Active |
| **AMS-0504-R06** | Test-fixture contamination            | Test-only dummy graphs are loaded in production.                              | Constrain test fixtures to `.fixture.json` and block the seeder from loading them. | Active |
| **AMS-0504-R07** | Genesis Receipt circularity           | Attempting to build an execution receipt during seeding causes runtime crash. | Confirm that seeding is passive bootstrapping and does not produce a receipt.      | Active |

---

## 17. Unresolved Questions and Chair Decisions

### 17.1 Genesis Receipt and Bootstrap Dependency

- **Issue:** Does the initial materialization of the Registry require an administrative "Genesis Execution Receipt" to authenticate the system state?
- **Current Position:** The current `ExecutionReceipt` model only represents runtime verification transactions on individual requests.
- **Chair Decision Required:** Confirm whether seed bootstrapping is purely administrative (no receipt written) or if a future milestone must define a custom "Genesis Receipt" model.

---

## 18. Proposed AMS-0504 Implementation Scope and Explicit Non-Goals

### 18.1 Proposed Scope

The future implementation of **AMS-0504** shall authorize:

- Developing the `PostgresRegistrySeeder` class in `apps/api/src/registry/seeder.ts` to read, verify, and write seed manifest records.
- Creating the manifest loader verifying SHA-256 integrity and `authorityReference` bindings.
- Implementing safe transaction execution with dependency-ordered insertion and full rollback.
- Implementing test-only fixtures (`.fixture.json`) under `apps/api/src/registry/infrastructure/persistence/fixtures/` to demonstrate mechanics without injecting unapproved data.

### 18.2 Explicit Non-Goals

- Modifying `@zyppi/domain` or `@zyppi/runtime` packages;
- Creating or materializing unapproved production datasets;
- Supporting database `UPDATE` or `DELETE` on seeder re-runs.

---

## 19. Readiness Verdict

### **VERDICT:** `B. MECHANICS ARCHITECTURALLY DEFINED, AUTHORITY CORPUS MISSING`

### Justification:

- Seeding mechanics (idempotency, transaction safety, dependency-ordered insertions, and validation) are fully specified and ready for implementation.
- However, **no approved production seed corpus currently exists** in the repository. Implementation of production seeding remains blocked until the Council ratifies and signs an authoritative manifest.
- The next step may proceed with implementing the seeder _mechanics_ and verifying them using test-only fixtures, keeping production materialization blocked.

---

## 20. Appendix A — Source Inspection Receipt

The following files were inspected on August 4, 2026:

- `infra/migrations/001_initial_registry_schema.sql` (verified table order and triggers)
- `packages/domain/src/index.ts` (verified validation rules and timestamps)
- `apps/api/src/registry/` (verified repositories and row mappers)

---

## 21. Appendix B — Provenance Classification

- **CONSTITUTIONALLY SETTLED:** CAW-008 schema layouts, immutable trigger protections, and dependency graph boundaries.
- **RATIFIED PLANNING DECISION:** M05 placement rules, raw parameterized SQL selection, and seeder-runtime isolation.
- **CURRENT SOURCE FACT:** Existence of domain models, validators, and database schema tables.
- **IMPLEMENTATION INFERENCE:** SHA-256 digest checks, repeatable-read read-only queries, and seeder transaction rollback closures.
- **CHAIR DECISION REQUIRED:** Genesis Receipt necessity and authority approval reference structures.

---

## 22. Appendix C — Empty Seed Manifest Template

This structural template is a drafting aid for future Chair authorship. It carries no approved constitutional truth.

```json
{
  "manifestId": "00000000-0000-0000-0000-000000000000",
  "manifestVersion": "0.1.0",
  "authorityReference": "zyppi:council:m05-seed:pending-chair-authorship",
  "integrityDigest": "sha256-0000000000000000000000000000000000000000000000000000000000000000",
  "records": {
    "referents": [],
    "identities": [],
    "evidence": [],
    "policies": [],
    "authorities": [],
    "capabilities": [],
    "standings": []
  }
}
```

**End of Report**

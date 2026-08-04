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

The application layer owns the definition and evaluation of manifest validity, record identity, semantic equivalence, and permitted seed outcomes. The persistence adapter supplies authoritative stored facts and provides atomic commit and rollback. Database constraints may enforce physical integrity but do not define constitutional equivalence or seed authority. `IMPLEMENTATION INFERENCE`

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

### 6.1 Proposed Shape — Chair Ratification Required

The structure of a seed manifest represents a **PROPOSED IMPLEMENTATION SHAPE — CHAIR RATIFICATION REQUIRED**. It does not represent an approved seed-manifest contract and must not be implemented as a binding public interface without explicit Chair authorization.

To analyze the separation of concerns:

- **Constitutional Requirement:** Seed authority must be explicit, traceable, and attributable to a ratified Council decree.
- **Architectural Requirement:** The seed executor must be a passive materialization tool; it must never invent or silently alter content.
- **Proposed Technical Mechanism:** A structured JSON file.
- **Proposed Fields:** `manifestId`, `manifestVersion`, `authorityReference`, `integrityDigest`, and `records` collection (sequential dependency ordering).

These specific fields and semantic layouts are proposed conventions, not settled.

---

## 7. Provenance and Integrity Analysis

### 7.1 Provenance Verification Alternatives

The seed system must establish that a manifest originates from explicitly authorized constitutional authority. The concrete representation, storage, verification mechanism, and lifecycle of that authority binding remain unresolved. The following technical alternatives must be evaluated:

1. **Statically Compiled Allow-List**
   - _Governance:_ Governed by hardcoded configurations inside the API codebase.
   - _Impacts:_ Introduces code-level trust roots; creates configuration drift between environments; can be verified deterministically in-code; requires no new database tables.
2. **Externally Configured Authority Registry**
   - _Governance:_ Governed by environment variables or deployment secrets.
   - _Impacts:_ Trust root is moved to environment orchestrator; prone to deployment drift; easily verifiable; requires external configuration management.
3. **Signed Manifest with an Authorized Public Key**
   - _Governance:_ Cryptographic signature verification using public keys.
   - _Impacts:_ Introduces public-key infrastructure (PKI) trust roots; highly secure and immune to database drift; highly deterministic; requires a signature validation module.
4. **Chair- or Council-Ratified Manifest Identifier**
   - _Governance:_ Database table recording approved manifest hashes.
   - _Impacts:_ Relies on database-side bootstrap records; eliminates code coupling; easily audited; requires database write access during bootstrap.

Each alternative requires a separate, explicit architectural decision.

### 7.2 Integrity Verification and Canonicalization Gaps

Integrity verification is a **proposed control**, not yet a settled implementation requirement. Before SHA-256 can be adopted, several canonicalization questions must be resolved:

- **Hash Scope:** Does the digest cover only the `records` payload or the entire manifest excluding the digest field?
- **Key & Array Ordering:** How are keys sorted recursively? Are array elements sorted?
- **Text & Numeric Encoding:** Is UTF-8 standard? How are numbers represented (finite float formats vs integers)?
- **Whitespace & Newlines:** Does formatting or indentation alter the digest?
- **Digest Format:** Hexadecimal vs Base64 encoding.

#### Reuse Evaluation

The `@zyppi/domain` package implements flat record canonicalization (`serializeIdentityRecord`, etc.) by sorting top-level keys alphabetically and using `JSON.stringify`. However, it lacks a generic recursive object canonicalization standard.

- **Disposition:** Relying on standard `JSON.stringify()` on arbitrary nested objects is fragile. If recursive JSON canonicalization is required, it must be declared as a missing Domain-layer capability rather than inventing a seed-specific canonicalization standard inside the adapter.

---

## 8. Determinism and Idempotency Analysis

### 8.1 Definition of Semantic Equivalence

Storage-level equality is not automatically constitutional equivalence.

- **Mapping Gaps:** A database field might represent bigint numbers (which postgres.js returns as strings), while the Domain model represents them as primitive numbers. Similarly, Timestamps are retrieved as JS `Date` objects but represent ISO-8601 UTC strings in the Domain.
- **Verification Rule:** Direct byte-level or column-level database comparison is insufficient. Semantic equivalence must be calculated after the database rows are loaded, mapped, and parsed through their respective Domain validators.
- **Missing Capability:** The current Domain layer does not provide a canonical equivalence comparator. Defining this algorithm inside the database adapter is prohibited; it remains a design dependency on `@zyppi/domain`.

### 8.2 Safe Re-Execution and Concurrency Models

The application seeder must coordinate state inspection, equivalence verification, and row insertion safely under concurrency:

- **Transaction Flow:**
  1. Open a Read-Write transaction block.
  2. Query existing records for all candidate manifest IDs.
  3. Load and map rows to Domain records; perform semantic equivalence comparison.
  4. Perform dependency-ordered inserts of missing records.
  5. Commit transaction.
- **Concurrency Risks:** If another registry mutation occurs concurrently between step 2 and step 4, insertions might fail with duplicate key constraint violations. The transaction closure ensures these trigger automatic rollbacks, preventing partial materialization.

---

## 9. Divergence and Rerun Analysis

### 9.1 State Model and Dispositions

We establish a source-grounded state model for seed re-runs:

1. **Empty State**
   - _Condition:_ No manifest records exist in the database.
   - _Disposition:_ Perform a complete atomic insertion of all records.
2. **Fully Equivalent State**
   - _Condition:_ Every record in the manifest exists in the database with semantically equivalent values.
   - _Disposition:_ No-op; complete successfully with `AlreadyMaterialized` outcome.
3. **Unexpected Partial State**
   - _Condition:_ Some records from the manifest exist in the database while others are missing.
   - _Disposition:_ **Fail closed as an integrity anomaly; perform no automatic completion, reconciliation, UPDATE, or DELETE operation.** Because the seeder runs atomically, a prior successful run should not have left partial state.
4. **Diverged State**
   - _Condition:_ A record with a matching primary key exists in the database but contains non-equivalent values.
   - _Disposition:_ Fail closed immediately with `StateDiverged` refusal. Database `UPDATE` and `DELETE` on seed re-runs are strictly prohibited under current authority.

---

## 10. Seeded-Record Lifecycle Analysis

### 10.1 Invariance and Lifecycle Limits

Under current Domain and schema models:

- **No Hybrid Metadata:** There are no columns (like `is_seed` or `source`) in the physical PostgreSQL schema, and no properties in the pure Domain models, to distinguish seeded records from ordinary operational records.
- **State Invariance:** Seeded records are treated as standard constitutional facts. Their lifecycle is governed strictly by their domain status (e.g. `status: "active"` or `"decommissioned"`) and chronological timestamps (`validFrom`/`validTo`). `CURRENT SOURCE FACT`
- **Evolution Restriction:** Any update to a seeded record must occur through an authorized database migration or separate transaction channel, preserving the immutable guarantees of the seed executor. `IMPLEMENTATION INFERENCE`

---

## 11. Runtime, Genesis, and Execution Receipt Analysis

### 11.1 Seeder-Runtime Isolation

Seeding is a passive administrative data-bootstrapping process that populates initial facts. It remains strictly separate from the synchronous, pure determinism Runtime pipeline scaffold (`packages/runtime/src/pipeline.ts`). It must not invoke the Runtime pipeline. `RATIFIED PLANNING DECISION`

### 11.2 Audit Evidence Alternatives

Generating an `ExecutionReceipt` (a "Genesis Receipt") for seed bootstrapping is unresolved and unsupported by current Domain contracts. We identify three distinct alternatives for administrative audit evidence:

1. **Runtime Execution Receipt (Unresolved Dependency)**
   - _Mechanism:_ Creating a pseudo-execution request to force the seeder through `ExecutionReceipt` structures.
   - _Impact:_ Highly coupled; violates the request-driven model of the Runtime; requires major Domain changes.
2. **Administrative Seed Audit Evidence (Proposed Artifact)**
   - _Mechanism:_ Storing seeder-specific audit records (e.g., seeder manifest execution logs) in a separate administrative database table.
   - _Impact:_ Decoupled from the Runtime; provides clean bootstrap audit trails; requires a separate table schema.
3. **No New Audit Artifact (Baseline)**
   - _Mechanism:_ Rely on manifest provenance signatures, deterministic execution logs, git history, and deployment/container logs.
   - _Impact:_ Zero code complexity; fully compliant with current models.

---

## 12. PostgreSQL and Persistence Boundary Analysis

### 12.1 Transaction boundaries and Row Encoders

- **Atomic Transactions:** Seeder insertions must be wrapped inside a single read-write transaction using `postgres.js`'s `sql.begin` closure.
- **Directional Encoders Required:** The row mappers defined in `mappers.ts` are strictly **one-way decoders** (Row -> Domain). Seeder execution requires inserting records, which requires **Domain-to-Row encoders** (encoding Domain types into database-compatible columns, serializing JSON, etc.).
- **Unnecessary Coupling:** Creating a generic, shared "bidirectional mapper" should be avoided as it tightly couples retrieval mappers with writing mappers. Direct parameterized SQL inside the seeder module remains the cleanest and most robust persistence pattern. `IMPLEMENTATION INFERENCE`

---

## 13. Test and CI Isolation Analysis

### 13.1 Isolated Infrastructure Verification Context

To test the seeder safely, we recommend a defense-in-depth isolation strategy rather than relying solely on file name extensions:

- **Isolated Directory Paths:** Test-only fixtures must reside strictly under `apps/api/src/registry/infrastructure/persistence/fixtures/` and carry a `.fixture.json` extension. Production manifests reside in distinct production paths.
- **Execution Entry Points:** The CLI or test-runner must use distinct execution commands that cannot resolve production paths during test suites.
- **Environment Safeguards:** The loader must check the database connection. If `PGDATABASE` is not `zyppi_test` during a fixture test run, the execution must fail-closed immediately.
- **Explicit Loader Allow-Listing:** The seeder loader must be physically blocked from loading `.fixture.json` files when running in non-test environments.

---

## 14. Future Implementation Placement and Dependency Analysis

### 14.1 Responsibility Separation

The seed system comprises several distinct responsibilities:

- **Orchestration:** Manifest loading, provenance verification, integrity hashing, Domain validation, semantic state comparison.
- **Persistence:** Database transaction execution, ordered SQL insertions.

To maintain strict modular boundaries:

- **Application Orchestration:** Belongs under a dedicated command-line/runtime entry point, such as `apps/api/src/registry/seed-runner.ts` or `apps/api/src/registry/seeder.ts`.
- **Infrastructure Persistence:** Belongs in the database adapter module.
- **Prohibited:** No seeder logic, file system I/O, or database clients may ever enter `packages/domain/`, `packages/contracts/`, or `packages/runtime/`. `CONSTITUTIONALLY SETTLED`

---

## 15. Decision Register

| Decision ID           | Topic                             | Current Source Position                 | Proposed Disposition                                                                            | Provenance Classification         | Chair Decision Required |
| :-------------------- | :-------------------------------- | :-------------------------------------- | :---------------------------------------------------------------------------------------------- | :-------------------------------- | :---------------------- |
| **AMS-0504-PREP-D01** | Seed Authority Boundary           | Seeder must not author truth.           | Seeder strictly executes approved manifest; fails-closed on any validation or constraint error. | `IMPLEMENTATION INFERENCE`        | No                      |
| **AMS-0504-PREP-D02** | Existing Seed Corpus Status       | No approved corpus exists in repo.      | Record that production seed data is currently absent/deferred. Prohibit "Aura" promotion.       | `M05 PLANNING DECISION`           | No                      |
| **AMS-0504-PREP-D03** | Seed Manifest Location and Format | None exist.                             | **CHAIR DECISION REQUIRED** (Proposed: versioned JSON manifests).                               | `CHAIR DECISION REQUIRED`         | Yes                     |
| **AMS-0504-PREP-D04** | Manifest Provenance Requirements  | None exist.                             | **CHAIR DECISION REQUIRED** (Review PKI vs static Allow-lists).                                 | `CHAIR DECISION REQUIRED`         | Yes                     |
| **AMS-0504-PREP-D05** | Manifest Integrity Requirements   | None exist.                             | **ARCHITECTURAL DECISION REQUIRED** (Define canonical bytes/digests).                           | `ARCHITECTURAL DECISION REQUIRED` | Yes                     |
| **AMS-0504-PREP-D06** | Seed Outcome Taxonomy             | None exist.                             | **CHAIR DECISION REQUIRED** (Define terminal and partial outcomes).                             | `CHAIR DECISION REQUIRED`         | Yes                     |
| **AMS-0504-PREP-D07** | Idempotency Ownership             | None exist.                             | Application layer defines validity and equivalence; DB transaction enforces atomic commits.     | `IMPLEMENTATION INFERENCE`        | No                      |
| **AMS-0504-PREP-D08** | Divergence Handling               | None exist.                             | Prohibit database `UPDATE` and `DELETE` on seed re-runs; fail-closed on mismatch.               | `RATIFIED PLANNING DECISION`      | No                      |
| **AMS-0504-PREP-D09** | Seeded-Record Lifecycle           | No distinct lifecycle properties exist. | Seeded records are treated as standard operational facts; updates require migration.            | `CURRENT SOURCE FACT`             | No                      |
| **AMS-0504-PREP-D10** | Runtime and Receipt Relationship  | Seeder does not invoke runtime.         | **CHAIR DECISION REQUIRED** (Verify Genesis Receipt necessity).                                 | `CHAIR DECISION REQUIRED`         | Yes                     |
| **AMS-0504-PREP-D11** | Storage Transaction Model         | None exist.                             | Wrap entire manifest insertion inside a single read-write transaction with rollback.            | `IMPLEMENTATION INFERENCE`        | No                      |
| **AMS-0504-PREP-D12** | File Placement                    | None exist.                             | **ARCHITECTURAL DECISION REQUIRED** (Orchestration vs Persistence split).                       | `ARCHITECTURAL DECISION REQUIRED` | Yes                     |
| **AMS-0504-PREP-D13** | Storage-Independent Semantics     | None exist.                             | Domain-level record meaning is preserved; DB tables act as passive targets.                     | `CURRENT SOURCE FACT`             | No                      |
| **AMS-0504-PREP-D14** | Genesis Manifest Template         | None exist.                             | Provide empty structural manifest template (Appendix C) for future Chair authorship.            | `IMPLEMENTATION INFERENCE`        | No                      |
| **AMS-0504-PREP-D15** | Verification Isolation            | None exist.                             | **PROPOSED CONTROL — IMPLEMENTATION REVIEW REQUIRED**                                           | `IMPLEMENTATION INFERENCE`        | Yes                     |
| **AMS-0504-PREP-D16** | Mapper & SQL Reuse                | Repos are lookup-only.                  | **REQUIRES SOURCE INSPECTION** (Mappers are decoders; requires encoders).                       | `IMPLEMENTATION INFERENCE`        | Yes                     |
| **AMS-0504-PREP-D17** | Seeder Readiness                  | Seeding mechanics defined.              | Seeder mechanics are ready; seed content is blocked pending Council ratification.               | `M05 PLANNING DECISION`           | No                      |
| **AMS-0504-PREP-D18** | Partial-State Handling            | None exist.                             | Unexpected partial state fails-closed as an integrity anomaly; perform no automatic completion. | `IMPLEMENTATION INFERENCE`        | No                      |
| **AMS-0504-PREP-D19** | Canonical Equivalence             | None exist.                             | Identify canonical record comparator inside `@zyppi/domain` as a design dependency.             | `IMPLEMENTATION INFERENCE`        | Yes                     |
| **AMS-0504-PREP-D20** | Manifest Canonicalization         | None exist.                             | Define exact bytes, spacing, key sort order, and whitespace rules for SHA-256 digests.          | `IMPLEMENTATION INFERENCE`        | Yes                     |
| **AMS-0504-PREP-D21** | Authority Trust Root              | None exist.                             | Select public key vs statically compiled trust roots for Council authentication.                | `CHAIR DECISION REQUIRED`         | Yes                     |
| **AMS-0504-PREP-D22** | Seed Audit Evidence               | None exist.                             | Determine whether administrative seed runs require separate tables or logs.                     | `CHAIR DECISION REQUIRED`         | Yes                     |
| **AMS-0504-PREP-D23** | Concurrency Model                 | None exist.                             | Evaluate Read-Write locks or transaction rollback boundaries to prevent partial writes.         | `IMPLEMENTATION INFERENCE`        | No                      |

---

## 16. Risk Register

| Risk ID          | Risk                                  | Constitutional or Architectural Impact                                        | Control or Required Decision                                                           | Status |
| :--------------- | :------------------------------------ | :---------------------------------------------------------------------------- | :------------------------------------------------------------------------------------- | :----- |
| **AMS-0504-R01** | Unauthorized seed-content fabrication | Invented database records contaminate the constitutional registry.            | The seeder must strictly refuse to execute unless a signed manifest is loaded.         | Active |
| **AMS-0504-R02** | Promotion of historical Aura examples | Unratified illustrative data becomes production truth.                        | Strictly enforce the prohibition on "Aura Labs" seed materialization.                  | Active |
| **AMS-0504-R03** | Manifest tampering                    | Modified records bypass Council intention.                                    | Enforce SHA-256 `integrityDigest` validation before parsing records.                   | Active |
| **AMS-0504-R04** | Nondeterministic/Partial execution    | Database is left in an incomplete, corrupted state on failure.                | Wrap seeder inside a single transaction with automatic rollback on any error.          | Active |
| **AMS-0504-R05** | Unsafe rerun overrides                | Seed re-runs overwrite concurrent operational registry changes.               | Forbid `UPDATE` and `DELETE` on seed rerun; return `StateDiverged` on mismatch.        | Active |
| **AMS-0504-R06** | Test-fixture contamination            | Test-only dummy graphs are loaded in production.                              | Constrain test fixtures to `.fixture.json` and block the seeder from loading them.     | Active |
| **AMS-0504-R07** | Genesis Receipt circularity           | Attempting to build an execution receipt during seeding causes runtime crash. | Confirm that seeding is passive bootstrapping and does not produce a receipt.          | Active |
| **AMS-0504-R08** | Inexact JSON stringification          | Different JS runtimes yield distinct SHA-256 digests on identical objects.    | Explicitly define canonical byte sorting, encoding, and numbers spacing.               | Active |
| **AMS-0504-R09** | Unexpected partial state              | Operational database contains partial state from an unlogged run.             | Fail-closed immediately on unexpected partial states; do not perform partial recovery. | Active |

---

## 17. Unresolved Questions and Chair Decisions

- **Seed Manifest Schema:** What is the final ratified JSON structure of the seed manifest?
- **Authority Trust Root:** Should the seeder use PKI signature verification or compile-time allow-lists to authorize the `authorityReference`?
- **Equivalence Model:** Does `@zyppi/domain` need to provide a canonical comparison algorithm before seeder implementation?
- **Audit Trails:** Is administrative seed execution logged as system provenance, or is transaction-level database state sufficient?

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

### **VERDICT:** `OUTCOME B — MECHANICS PARTIALLY SPECIFIED; CHAIR DECISIONS REQUIRED`

### Justification:

- Seeding mechanics (idempotency, transaction safety, dependency-ordered insertions, and validation) are specified conceptually.
- However, the concrete manifest contract, authority trust root, equivalence model, and audit model still require explicit Chair ratification and Council decisions before production code can be written.
- Seeding content remains blocked pending Council ratification of approved manifests.

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
- **CHAIR DECISION REQUIRED:** Genesis Receipt necessity, manifest schemas, trust roots, and outcomes.

---

## 22. Appendix C — Empty Seed Manifest Template

This structural template is a non-authoritative drafting template. It is not yet an approved seed-manifest contract and must not be implemented as a binding public interface without explicit Chair authorization.

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

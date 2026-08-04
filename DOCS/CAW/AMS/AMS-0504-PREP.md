# AMS-0504-PREP — Registry Seed System Constitutional Reconnaissance

## 1. Purpose and Read-Only Scope

### 1.1 Objective

This document conducts a rigorous, source-grounded, and read-only architectural reconnaissance for the Registry Seed System (**AMS-0504**). The purpose of this PREP is to establish how an authorized Registry seed corpus can be safely introduced, verified, executed, re-executed, and audited without allowing the seed mechanism to invent, normalize, silently repair, or otherwise manufacture constitutional truth.

This amended report is fully reconciled with the ratified rulings of **AMS-0504-CDR (Registry Seed System Chair Decision Resolution)**, converting the previous open-ended reconnaissance alternatives into a precise, implementation-readiness artifact.

### 1.2 Authorized Scope

In strict compliance with the reconnaissance and CDR reconciliation mandates, no production code, test code, package configuration, or database schemas have been created, modified, or deleted. The only change to the repository is the creation and reconciliation of this report under the path:
`DOCS/CAW/AMS/AMS-0504-PREP.md`

### 1.3 Explicit Non-Goals

This PREP does **not** authorize:

- Creating or editing concrete seed executor classes or modules;
- Generating or applying physical seed data to PostgreSQL;
- Modifying package manifests or TypeScript configurations;
- Modifying Domain models, validators, or database schemas;
- Promoting test-only or historical fixtures into production constitutional truth;
- Implementing RFC 8785 (JSON Canonicalization Scheme) or key-management infrastructure during this phase.

---

## 2. Authority Receipt and Source Hierarchy

### 2.1 Settled Constitutional & Chair Authorities

- **AMS-0504-CDR (Chair Decision Resolution):** Authoritatively resolves all previous manifest-contract, cryptographic trust-root, JCS canonicalization, equivalence ownership, and seeder-runtime isolation questions. `BINDING CHAIR DECISION`
- **CAW-008 (Registry Schema):** Declares table structures, primary/foreign key relationships, and trigger invariants for append-only tables. `CONSTITUTIONALLY SETTLED`
- **M05-PLAN §5.3 (Seed Fixture Content):** Explicitly rules that seed-data _mechanics_ are within M05 scope, but seed-data _content_ is not yet authorized. Rejects historical examples (e.g., "Aura Labs", GTIN `00860000000123`) as normative seed content. `RATIFIED PLANNING DECISION`

### 2.2 Source Hierarchy

1. Constitutional authorities and ratified governance instruments;
2. `AMS-0504-CDR` Chair rulings;
3. Ratified M05 planning decisions;
4. Current authoritative Domain and contract definitions;
5. Current implemented Runtime and Registry behavior;
6. Physical PostgreSQL schema and migrations;
7. Tests, examples, historical documents, and illustrative datasets;
8. Architectural inference, only where no higher authority settles the matter.

---

## 3. Current Repository Baseline

### 3.1 @zyppi/domain

The domain package at `packages/domain/` houses the pure, immutable TypeScript models for all Registry records (such as `IdentityRecord`, `ReferentRecord`, etc.) and their synchronous validators. It remains 100% free of database client drivers, environment fallbacks, or I/O side effects. `CURRENT SOURCE FACT`

### 3.2 @zyppi/contracts

The contracts package at `packages/contracts/` defines the stable interface boundary for the repositories. `RegistryRepository` handles neutral lookup, and `ReceiptRepository` accepts only validated `ExecutionReceipt` structures. `CURRENT SOURCE FACT`

### 3.3 apps/api/src/registry/

The concrete persistence adapters (`PostgresRegistryRepository` and `PostgresReceiptRepository`) reside under `apps/api/src/registry/`. They utilize parameterized raw SQL via `postgres.js` to query and write records, strictly translating database-level events into the closed standard `RegistryError` taxonomy. `CURRENT SOURCE FACT`

---

## 4. Seed Authority Boundary

### 4.1 Mechanics Are Not Authority

The seed system is a **controlled executor** of approved constitutional authority, never its author.

- It may load a signed manifest, verify its cryptographic authenticity, structurally validate each record using Domain validators, and persist those facts using focused SQL transactions.
- It must never synthesize default values, silently repair schema/validation mismatches, or invent facts to complete an incomplete manifest. Any structural or relational error in the manifest must result in an immediate, fail-closed execution refusal. `BINDING CHAIR DECISION (AMS-0504-CDR)`

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

### 6.1 Ratified Manifest Contract

Under **AMS-0504-CDR (R-0504-01)**, the JSON manifest format is the **ratified and binding structural contract** for all seed operations.

#### Structural Separation of Concerns

The seeder must strictly separate the **manifest mechanism** (which is structurally ratified and defined) from the **manifest content** (which remains entirely unratified and deferred).

- The seeder is authorized to parse and verify manifests matching this contract structurally.
- The seeder must strictly refuse to invent, complete, normalize, or silently repair missing or unapproved manifest content.

The manifest format requires the exact schema fields detailed in Appendix C, including `manifestId` (UUID string), `manifestVersion` (Semantic Version string), `authorityReference` (ratified governance URI string), `integrityDigest` (cryptographic SHA-256 string), and dependency-ordered `records` collections.

---

## 7. Provenance and Integrity Analysis

### 7.1 Provenance and Authority Trust Root

Under the ratified rulings of **AMS-0504-CDR**, the seed system must verify the cryptographic provenance of a manifest before attempting any database writes.

- **Cryptographic Trust Root:** The seeder must verify signatures using authorized public-key trust material (PKI) configured as a verified trust root.
- **Non-Repository Material:** Private signing material is strictly external to the application repository and seeder binaries.
- **Source Prohibitions:** The database cannot act as the authority source for the seed that initializes it. Environment configuration is also prohibited from acting as the authoritative source of seed legitimacy.
- **Fail-Closed Verification:** Any unsigned, unverifiable, unknown-authority, malformed, or cryptographically invalid manifest must be rejected with `AuthorityRefusal` before any database write is attempted.
- **Superseded Reconnaissance Alternatives:** Static allow-lists and environment-based authority registries are rejected as insecure and are no longer active implementation options.

#### Unresolved Cryptographic Specifications

While the PKI authority model is constitutionally settled, the following **technical implementation details** remain unresolved engineering dependencies to be specified in the implementation phase:

- signature algorithm (e.g. RSASSA-PKCS1-v1_5, Ed25519, etc.);
- public-key algorithm and encoding (e.g., PEM, DER, JWK);
- signature encoding (e.g., Base64, Hexadecimal);
- signed payload boundaries (whether the signature covers the entire manifest or a detached canonical payload);
- key identifier format (e.g., Key ID `kid` or SHA-256 fingerprint);
- authorized public-key registry location (distribution of trusted public keys);
- key rotation and revocation behavior.

### 7.2 Integrity and JCS Canonicalization

Under **AMS-0504-CDR**, manifest integrity must be validated against a cryptographic digest using a standardized, formal canonicalization process.

- **Governing Standard:** **RFC 8785 (JSON Canonicalization Scheme / JCS)** is the governing canonicalization standard.
- **Arbitrary Serialization Prohibited:** Incidental or native `JSON.stringify()` serialization is prohibited as the basis of integrity verification.
- **Verification Execution:** Integrity verification is executed by computing the SHA-256 hash over the exact RFC 8785 JCS-serialized bytes of the `records` payload. If the computed hash does not match the `integrityDigest` field exactly, the seeder must refuse execution with `IntegrityRefusal`.
- **Domain Compatibility:** The implementation must verify that the actual Domain record shapes and values are fully compatible with RFC 8785. Any incompatible Domain representation (such as specific float representations) must immediately halt implementation for constitutional review; adapter-level coercion or custom normalization is prohibited.
- **No Adapter-Local Hacks:** Seed-specific, adapter-local canonicalization standards are prohibited.

---

## 8. Determinism and Idempotency Analysis

### 8.1 Domain-Owned Semantic Equivalence

Under **AMS-0504-CDR**, record identity, semantic equivalence, and divergence are strictly application/domain concerns.

- **Database Limits:** Storage-level primary-key or column equality is not sufficient to establish constitutional equivalence. PostgreSQL types, SQL representations, row ordering, and database-specific coercions (e.g. bigint strings) must not define equivalence.
- **Defensive Comparison:** Stored records must be fully retrieved, decoded into Domain structures, and validated before executing semantic comparison. Storage-only metadata (`created_at`, `updated_at`) must be excluded from comparison.
- **Missing Capability:** The current Domain layer lacks a canonical comparison comparator. Implementing a seeder-local comparison hack is prohibited; the comparator must be introduced as an authorized, narrowly-scoped Domain capability under `@zyppi/domain`.

### 8.2 Concurrency Model

The seeder must coordinate state inspection and insertion transactionally to avoid concurrency drift:

- The seeder must perform state inspection, semantic comparison, and missing record materialization within a single atomic transaction.
- If a concurrent mutation occurs during seeder execution, database-level unique constraints will throw an error, causing a full transaction rollback and returning the terminal outcome cleanly.

---

## 9. Divergence and Rerun Analysis

### 9.1 State Model and Dispositions

We establish the ratified four-state seeder execution model under the atomic transaction guarantee:

1. **Empty State**
   - _Condition:_ No manifest records exist in the database.
   - _Disposition:_ Perform a complete, dependency-ordered atomic insertion.
2. **Fully Equivalent State**
   - _Condition:_ Every record in the manifest exists in storage and is semantically equivalent.
   - _Disposition:_ Successful non-modifying idempotent outcome (`AlreadyMaterialized`).
3. **Unexpected Partial State**
   - _Condition:_ Some declared records from the manifest exist in storage while others are absent.
   - _Disposition:_ **Fail closed as an integrity anomaly (`PartialStateAnomaly`); perform no automatic completion, reconciliation, UPDATE, or DELETE operation.** Because the seeder runs atomically, partial state indicates a corrupt database environment or an unauthorized concurrent mutation.
   - _Scope Rule:_ The definition of "unexpected partial state" applies **strictly and exclusively** to the records declared within the manifest being loaded. Unrelated operational records in the database (e.g. existing identities from other manifests or normal operations) are ignored by this seeder run and do not trigger a partial-state anomaly.
4. **Diverged State**
   - _Condition:_ A record with matching identity exists in storage but is not semantically equivalent.
   - _Disposition:_ Fail closed immediately with `StateDiverged` outcome. Seed re-runs must never perform `UPDATE` or `DELETE` operations to force database conformance.

---

## 10. Seeded-Record Lifecycle Analysis

### 10.1 State Invariance

Seeded records are standard constitutional facts. Their lifecycle is governed strictly by their domain status (e.g. `status: "active"` or `"decommissioned"`) and chronological timestamps (`validFrom`/`validTo`). They contain no hybrid database flags (like `is_seed`). `CURRENT SOURCE FACT`

### 10.2 Evolution Restriction

Any update to a seeded record must occur through an authorized database migration or separate transaction channel, preserving the immutable guarantees of the seed seeder. `IMPLEMENTATION INFERENCE`

---

## 11. Runtime, Genesis, and Execution Receipt Analysis

### 11.1 Seeder-Runtime Isolation

Registry seeding is an administrative bootstrap operation. It is strictly isolated from the request-driven verification Runtime. Seeder execution must not invoke the Runtime pipeline, and must not fabricate pseudo-requests to obtain a Runtime decision. `RATIFIED PLANNING DECISION`

### 11.2 Audit Evidence Taxonomy

Seeding must not create a standard `ExecutionReceipt`. Under **AMS-0504-CDR**, we distinguish three distinct evidence concepts:

1. **Runtime Execution Receipt:** The request-driven receipt model generated exclusively for individual Runtime decisions.
2. **Administrative Seed Audit Evidence:** A possible future audit artifact (such as a database log) for seed execution.
3. **No New Audit Artifact (CDR Baseline):** The seeder relies entirely on manifest provenance signatures, cryptographic verification digests, deterministic execution logs, deployment records, and transaction-level database states. AMS-0504 requires no new table schemas or Genesis receipts in this milestone. `BINDING CHAIR DECISION (AMS-0504-CDR)`

---

## 12. PostgreSQL and Persistence Boundary Analysis

### 12.1 Transaction atomicity and Directional Encoders

- **Atomic Transactions:** Seeder insertions must be wrapped inside a single read-write transaction using `postgres.js`'s `sql.begin` closure.
- **Directional Encoders Required:** The row mappers defined in `mappers.ts` are strictly **one-way decoders** (Row -> Domain). Seeder execution requires inserting records, which requires **Domain-to-Row encoders** (encoding Domain types into database-compatible columns, serializing JSON, etc.).
- **Unnecessary Coupling:** Creating a generic, shared "bidirectional mapper" should be avoided as it tightly couples retrieval mappers with writing mappers. Direct parameterized SQL inside the seeder module remains the cleanest and most robust persistence pattern. `IMPLEMENTATION INFERENCE`

---

## 13. Test and CI Isolation Analysis

### 13.1 Isolated Infrastructure Verification Context

To test the seeder safely, the seeder loader must implement a robust defense-in-depth isolation policy:

- **Isolated Directory Paths:** Test-only fixtures must reside strictly under `apps/api/src/registry/infrastructure/persistence/fixtures/` and carry a `.fixture.json` extension. Production manifests reside in distinct production paths.
- **Execution Entry Points:** The CLI or test-runner must use distinct execution commands that cannot resolve production paths during test suites.
- **Environment Safeguards:** The loader must check the database connection. If `PGDATABASE` is not `zyppi_test` during a fixture test run, the execution must fail-closed immediately.
- **Explicit Loader Allow-Listing:** The seeder loader must be physically blocked from loading `.fixture.json` files when running in non-test environments.
- **Content Restriction:** No production seed content may exist in the test fixture corpus, and no test fixture may be promoted to constitutional authority.

---

## 14. Future Implementation Placement and Dependency Analysis

### 14.1 Responsibility Separation

The seed system comprises several distinct responsibilities:

- **Seed Orchestration and Verification:** Manifest loading, provenance validation, signature verification, canonicalization integrity verification, Domain validation, semantic comparison.
- **Mechanical Persistence:** Ordered SQL insertion, atomic transaction commit/rollback.

### 14.2 Package and File Boundaries

- **Orchestration:** Belongs under a dedicated command-line/runtime entry point, such as `apps/api/src/registry/seeder.ts` or `apps/api/src/registry/seed-runner.ts` (exact filenames represent implementation-level choices).
- **Prohibited:** No seed logic, file system I/O, or database clients may ever enter `packages/domain/`, `packages/contracts/`, or `packages/runtime/` (except where the CDR explicitly authorizes a narrowly scoped Domain capability required for JCS canonicalization or semantic equivalence). `CONSTITUTIONALLY SETTLED`
- **Permitted Domain Hooks:** We are authorized to implement only the following narrowly scoped helpers inside `@zyppi/domain`:
  1. `canonicalizeJcs(record: unknown): string` (RFC 8785 canonical serialization)
  2. `areRecordsEqual(a: unknown, b: unknown): boolean` (deterministic semantic record equivalence)
     These must remain strictly pure, deterministic, and free of database, file system, or infrastructure imports.

---

## 15. Seed Outcome Taxonomy

Under **AMS-0504-CDR (R-0504-04)**, the seeder's execution outcomes and refusal states are strictly defined. These represent contract-level types returned as a discriminated union result from the seeder interfaces, mapping to specific command-line (CLI) exit codes:

1. **`Success`**
   - _Meaning:_ Seeding completes successfully; all manifest records are written and committed.
   - _Type:_ `Result` path, CLI exit code `0`.
2. **`AlreadyMaterialized`**
   - _Meaning:_ Every declared record in the manifest already exists and is semantically equivalent (idempotent no-op).
   - _Type:_ `Result` path, CLI exit code `0`.
3. **`StateDiverged`**
   - _Meaning:_ A record with a matching primary key exists in storage but is not semantically equivalent.
   - _Type:_ Terminal Refusal, CLI exit code `2`.
4. **`PartialStateAnomaly`**
   - _Meaning:_ Some declared records from the manifest exist in storage while others are absent (integrity anomaly).
   - _Type:_ Terminal Refusal, CLI exit code `3`.
5. **`IntegrityRefusal`**
   - _Meaning:_ Integrity digest (JCS SHA-256) verification fails.
   - _Type:_ Terminal Refusal, CLI exit code `4`.
6. **`AuthorityRefusal`**
   - _Meaning:_ Cryptographic signature or provenance verification fails under the public-key trust root.
   - _Type:_ Terminal Refusal, CLI exit code `5`.
7. **`ValidationRefusal`**
   - _Meaning:_ One of the Domain validators fails when processing a manifest record.
   - _Type:_ Terminal Refusal, CLI exit code `6`.
8. **`InfrastructureFailure`**
   - _Meaning:_ Low-level database connection failure, socket crash, or connection timeout.
   - _Type:_ Terminal Refusal, CLI exit code `1`.

---

## 16. Decision Register

| Decision ID           | Topic                             | Current Source Position                 | Proposed Disposition                                                                                              | Provenance Classification    | Chair Decision Required |
| :-------------------- | :-------------------------------- | :-------------------------------------- | :---------------------------------------------------------------------------------------------------------------- | :--------------------------- | :---------------------- |
| **AMS-0504-PREP-D01** | Seed Authority Boundary           | Seeder must not author truth.           | Seeder strictly executes approved manifest; fails-closed on any validation or constraint error.                   | `IMPLEMENTATION INFERENCE`   | No                      |
| **AMS-0504-PREP-D02** | Existing Seed Corpus Status       | No approved corpus exists in repo.      | Record that production seed data is currently absent/deferred. Prohibit "Aura" promotion.                         | `M05 PLANNING DECISION`      | No                      |
| **AMS-0504-PREP-D03** | Seed Manifest Location and Format | None exist.                             | **RATIFIED BY AMS-0504-CDR** (R-0504-01: Authoritative JSON manifest schema).                                     | `BINDING CHAIR DECISION`     | No                      |
| **AMS-0504-PREP-D04** | Manifest Provenance Requirements  | None exist.                             | **RATIFIED BY AMS-0504-CDR** (R-0504-02: Cryptographic PKI signature trust root verification).                    | `BINDING CHAIR DECISION`     | No                      |
| **AMS-0504-PREP-D05** | Manifest Integrity Requirements   | None exist.                             | **RATIFIED BY AMS-0504-CDR** (R-0504-03: RFC 8785 JSON Canonicalization Scheme).                                  | `BINDING CHAIR DECISION`     | No                      |
| **AMS-0504-PREP-D06** | Seed Outcome Taxonomy             | None exist.                             | **RATIFIED BY AMS-0504-CDR** (R-0504-04: Closed 8-outcome seeder taxonomy).                                       | `BINDING CHAIR DECISION`     | No                      |
| **AMS-0504-PREP-D07** | Idempotency Ownership             | None exist.                             | Application layer defines validity and equivalence; DB transaction enforces atomic commits.                       | `IMPLEMENTATION INFERENCE`   | No                      |
| **AMS-0504-PREP-D08** | Divergence Handling               | None exist.                             | Prohibit database `UPDATE` and `DELETE` on seed re-runs; fail-closed on mismatch.                                 | `RATIFIED PLANNING DECISION` | No                      |
| **AMS-0504-PREP-D09** | Seeded-Record Lifecycle           | No distinct lifecycle properties exist. | Seeded records are treated as standard operational facts; updates require migration.                              | `CURRENT SOURCE FACT`        | No                      |
| **AMS-0504-PREP-D10** | Runtime and Receipt Relationship  | Seeder does not invoke runtime.         | **RATIFIED BY AMS-0504-CDR** (R-0504-05: Seeding is administrative; no receipt created).                          | `BINDING CHAIR DECISION`     | No                      |
| **AMS-0504-PREP-D11** | Storage Transaction Model         | None exist.                             | Wrap entire manifest insertion inside a single read-write transaction with rollback.                              | `IMPLEMENTATION INFERENCE`   | No                      |
| **AMS-0504-PREP-D12** | File Placement                    | None exist.                             | **RATIFIED BY AMS-0504-CDR** (R-0504-06: Seeder orchestration under `apps/api/src/registry/`).                    | `BINDING CHAIR DECISION`     | No                      |
| **AMS-0504-PREP-D13** | Storage-Independent Semantics     | None exist.                             | Domain-level record meaning is preserved; DB tables act as passive targets.                                       | `CURRENT SOURCE FACT`        | No                      |
| **AMS-0504-PREP-D14** | Genesis Manifest Template         | None exist.                             | Provide empty structural manifest template (Appendix C) as the ratified manifest contract.                        | `IMPLEMENTATION INFERENCE`   | No                      |
| **AMS-0504-PREP-D15** | Verification Isolation            | None exist.                             | **RATIFIED BY AMS-0504-CDR** (R-0504-07: Defense-in-depth isolation controls).                                    | `BINDING CHAIR DECISION`     | No                      |
| **AMS-0504-PREP-D16** | Mapper & SQL Reuse                | Repos are lookup-only.                  | **REQUIRES SOURCE INSPECTION** (Mappers are decoders; requires encoders).                                         | `IMPLEMENTATION INFERENCE`   | Yes                     |
| **AMS-0504-PREP-D17** | Seeder Readiness                  | Seeding mechanics defined.              | Seeder mechanics are ready; seed content is blocked pending Council ratification.                                 | `M05 PLANNING DECISION`      | No                      |
| **AMS-0504-PREP-D18** | Partial-State Handling            | None exist.                             | **RATIFIED BY AMS-0504-CDR** (R-0504-08: Partial state is an integrity failure `PartialStateAnomaly`).            | `BINDING CHAIR DECISION`     | No                      |
| **AMS-0504-PREP-D19** | Canonical Equivalence             | None exist.                             | **RATIFIED BY AMS-0504-CDR** (R-0504-09: Equivalence is Domain-owned; comparator under `@zyppi/domain`).          | `BINDING CHAIR DECISION`     | No                      |
| **AMS-0504-PREP-D20** | Manifest Canonicalization         | None exist.                             | **RATIFIED BY AMS-0504-CDR** (R-0504-10: JCS RFC 8785 byte canonicalization).                                     | `BINDING CHAIR DECISION`     | No                      |
| **AMS-0504-PREP-D21** | Authority Trust Root              | None exist.                             | **RATIFIED BY AMS-0504-CDR** (R-0504-11: Cryptographic signature trust root).                                     | `BINDING CHAIR DECISION`     | No                      |
| **AMS-0504-PREP-D22** | Seed Audit Evidence               | None exist.                             | **RATIFIED BY AMS-0504-CDR** (R-0504-12: Audit relies on seeder logs, git, and provenance hashes; no new tables). | `BINDING CHAIR DECISION`     | No                      |
| **AMS-0504-PREP-D23** | Concurrency Model                 | None exist.                             | Evaluate Read-Write locks or transaction rollback boundaries to prevent partial writes.                           | `IMPLEMENTATION INFERENCE`   | No                      |

---

## 17. Unresolved Questions and Implementation Dependencies

### 17.1 Unresolved Constitutional/Chair Decisions

None. All governing constitutional decisions for Registry seed mechanics have been resolved by **AMS-0504-CDR**.

### 17.2 Unresolved Engineering & Implementation Dependencies

The following items remain **unresolved engineering details** that must be finalized as technical specifications during the implementation phase:

- **Exact Manifest Schema:** Final mapping of nested arrays and keys to typescript interfaces.
- **Exact Cryptographic Envelope:** Defining public-key encoding formats, signature algorithms, and key identifier structures (kid, fingerprints).
- **Eight-Outcome Definitions:** Mapping result return values to explicit CLI exit codes.
- **Domain Comparator API:** The structural design of the record-equivalence helper.
- **Domain JCS Capability:** The implementation of JCS (RFC 8785) formatting within `@zyppi/domain` (using standard alphabetical own keys formatting).
- **Public-Key Trust-Material:** Technical configuration of public keys in environment configurations or registries.
- **Dependency Insertion Order:** Physical seeder execution sequence matching SQL foreign keys.
- **Concurrency Behavior:** Transaction isolation locks and rollback triggers on live systems.
- **Test execution & loading contract:** Setup details for `.fixture.json` and loader paths.

---

## 18. Proposed AMS-0504 Implementation Scope and Explicit Non-Goals

### 18.1 Proposed Scope

The future implementation of **AMS-0504** shall authorize:

- Developing the seeder orchestration logic in `apps/api/src/registry/seeder.ts`.
- Implementing JCS canonicalization and PKI signature verification under the approved public-key trust root.
- Implementing safe transaction execution with dependency-ordered insertion and full rollback.
- Implementing test-only fixtures (`.fixture.json`) under `apps/api/src/registry/infrastructure/persistence/fixtures/` using the defense-in-depth isolation policy.

### 18.2 Explicit Non-Goals

- Modifying `@zyppi/domain` or `@zyppi/runtime` packages (except for the authorized pure JCS and equivalence hooks: `canonicalizeJcs` and `areRecordsEqual`);
- Creating or materializing unapproved production datasets;
- Supporting database `UPDATE` or `DELETE` on seeder re-runs.

---

## 19. Readiness Verdict

### **VERDICT:** `OUTCOME A-C — CONSTITUTIONAL MECHANICS AUTHORIZED; IMPLEMENTATION CONTRACT RECONCILIATION REQUIRED; PRODUCTION SEED CONTENT NOT RATIFIED`

### Justification:

- **AMS-0504-CDR** has authoritatively resolved all constitutional and architectural decisions required to authorize implementation of seed mechanics.
- However, the PREP must still consolidate those rulings into non-contradictory, implementation-complete technical specifications (such as the exact cryptographic algorithms, comparator signatures, and CLI exit maps).
- No production implementation is authorized until this technical reconciliation is complete and reviewed.
- Production seed content remains explicitly outside scope and blocked.

---

## 20. Appendix A — Source Inspection Receipt

The following files were inspected on August 4, 2026:

- `infra/migrations/001_initial_registry_schema.sql` (verified table order and triggers)
- `packages/domain/src/index.ts` (verified validation rules and timestamps)
- `apps/api/src/registry/` (verified repositories and row mappers)

---

## 21. Appendix B — Provenance Classification

- **CONSTITUTIONALLY SETTLED:** CAW-008 schema layouts, immutable trigger protections, and dependency graph boundaries.
- **RATIFIED BY AMS-0504-CDR:** JCS RFC 8785 byte canonicalization, PKI trust root signature verification, closed 8-outcome seeder outcomes, and Domain-owned semantic equivalence.
- **RATIFIED PLANNING DECISION:** M05 placement rules, raw parameterized SQL selection, and seeder-runtime isolation.
- **CURRENT SOURCE FACT:** Existence of domain models, validators, and database schema tables.
- **IMPLEMENTATION INFERENCE:** seeder transaction rollback closures and directional encoding details.

---

## 22. Appendix C — Ratified Manifest Contract Schema

This schema blueprint is the ratified manifest contract structurally. It carries no approved production data content.

```json
{
  "manifestId": "00000000-0000-0000-0000-000000000000",
  "manifestVersion": "0.1.0",
  "authorityReference": "zyppi:council:m05-seed:pending-chair-authorship",
  "integrityDigest": "sha256-0000000000000000000000000000000000000000000000000000000000000000",
  "signature": "base64-cryptographic-signature-string",
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

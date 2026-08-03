# AMS-0503-PREP — PostgreSQL Registry Adapters Reconnaissance

## 1. Purpose and Read-Only Scope

### 1.1 Objective

This document conducts a rigorous, read-only, source-grounded architectural reconnaissance for **AMS-0503**, the upcoming implementation phase responsible for PostgreSQL-backed Registry adapters. The purpose of this PREP is to establish the concrete boundaries, mappings, transactional semantics, error translations, and testing strategies necessary to implement high-integrity PostgreSQL adapters under milestone **AMS-0503**.

### 1.2 Authorized Scope

In strict compliance with the reconnaissance mandate, no production code, test code, package configuration, or database schemas have been created, modified, or deleted. The only change to the repository is the creation of this report under the path:
`DOCS/CAW/AMS/AMS-0503-PREP.md`

### 1.3 Explicit Non-Goals

This PREP does **not** authorize:

- Creating or editing concrete adapter classes or modules;
- Generating production SQL queries or query runs;
- Modifying package manifests or TypeScript configuration;
- Adding external or workspace dependencies;
- Running schema migrations or applying physical changes to the database.

---

## 2. Authority Receipt

### 2.1 Constitutional Authorities

- **CAW-007 (Runtime Contracts):** Establishes that the raw input contains the collected record graph representing identity, referents, standings, capabilities, authorities, evidence, and policies.
- **CAW-008 (Registry Schema):** Declares table schemas, primary/foreign key structures, and strictly mandates that the `evidence` and `execution_receipts` tables are immutable and append-only, enforced via trigger rejections.
- **CEngS-001 v2.0 (Engineering Constitution):** Codifies import boundary enforcement, static purity validations, and layer-aware dependency isolation rules.

### 2.2 M05 and AMS-0502 Authorities

- **M05-PLAN §5.1 / §5.2:** Mandates that abstract contracts reside in `@zyppi/contracts`, while concrete persistence adapters and row mappers reside in `apps/api/src/registry`. Prohibits ORMs, query builders, lazy loading, and implicit mappings in favor of parameterized raw SQL via `postgres.js`.
- **AMS-0502-PREP:** Defines the clear architectural boundary separating neutral facts retrieval (infrastructure) from constitutional activation/validation (Runtime).
- **IT-0502 Contracts (Current Source):** Formally implements `ValidatedCanonicalIdentifier`, `RetrievedRegistryState`, `RegistryResult`, `RegistryError`, `RegistryRepository`, `ReceiptRepository`, and `PersistenceAcknowledgement`.

### 2.3 Source Hierarchy and Precedence

Constitutional and Engineering guidelines (CEngS-001, CAW-008) represent the highest authority in the repository. Source code implementations of domain models represent business-logical truth. Low-level database row columns in physical migrations are storage artifacts that must be mapped explicitly and defensively to domain records, with storage metadata stripped completely.

---

## 3. Current Repository Baseline

### 3.1 Domain Baseline

- `packages/domain/src/index.ts` exports pure models and validators (such as `validateIdentityRecord` and `validateExecutionReceipt`) which return `ValidationResult<T, E>`.
- The Domain layer is completely pure, has zero workspace project references, and is entirely free of database-driver or framework concepts.

### 3.2 Contracts Baseline

- `packages/contracts/src/registry.ts` establishes:
  - `ValidatedCanonicalIdentifier` (opaque branded string);
  - `createValidatedCanonicalIdentifier` (narrow construction helper);
  - `RetrievedRegistryState` (structural interface containing domain records);
  - `RegistryError` (exact closed union: `InfrastructureUnavailable` | `DataCorruption` | `OperationFailed`);
  - `RegistryRepository` and `ReceiptRepository` (behavioral interfaces using TS `interface`).
- `packages/contracts/package.json` declares empty dependencies, and peerDependencies, referencing `@zyppi/domain` in its `devDependencies` section.

### 3.3 Runtime Baseline

- `packages/runtime/src/pipeline.ts` implements a pure determinism synchronous pipeline using `@zyppi/domain` models.
- It is subject to strict static purity checking and has no dependency on `@zyppi/contracts` or any persistence adapter.

### 3.4 API Application Baseline

- `apps/api/src/main.ts` is currently an empty placeholder (`export {};`).
- There are no existing database client initializations, dependency-injection frameworks, or transaction-provider abstractions defined in `apps/api/src/`.
- The directory `apps/api/src/registry/` does not yet exist, presenting a clean slate for the adapter module.

### 3.5 PostgreSQL Infrastructure Baseline

- `infra/migrations/001_initial_registry_schema.sql` defines 8 authorized tables: `referents`, `identities`, `evidence`, `policies`, `authorities`, `capabilities`, `standings`, and `execution_receipts`.
- Trigger function `reject_append_only_mutation()` is bound to `evidence` and `execution_receipts` to reject `UPDATE` and `DELETE` queries with SQLSTATE `P0001`.

### 3.6 Test and CI Baseline

- Live tests are defined in `infra/src/test/schema.test.ts` verifying tables and trigger behaviors using `postgres.js` connecting to `127.0.0.1:5432` with username, password, and database `zyppi_test`.
- The CI pipeline service container at `.github/workflows/ci.yml` is configured with `postgres:16-alpine` mapping to port 5432 to initialize a live database for automated verifications.

---

## 4. Registry Retrieval Boundary

### 4.1 RetrievedRegistryState Ownership

`RetrievedRegistryState` is declared inside `packages/contracts/src/registry.ts` as a pure, semantically neutral payload container:

```typescript
export interface RetrievedRegistryState {
  readonly identity: IdentityRecord;
  readonly relationships: readonly ReferentRecord[];
  readonly standings: readonly StandingRecord[];
  readonly authorities: readonly AuthorityRecord[];
  readonly capabilities: readonly CapabilityRecord[];
  readonly evidenceReferences: readonly EvidenceRecord[];
  readonly applicablePolicies: readonly PolicyRecord[];
}
```

The concrete retrieval adapter `PostgresRegistryRepository` is responsible solely for querying storage and assembling these raw records exactly as they exist.

### 4.2 Runtime Ownership of Resolution and ACV Activation

The transformation from `RetrievedRegistryState` (neutral facts retrieved) to `ActiveConstitutionalView` (validated, chronologically activated view) belongs exclusively to `@zyppi/runtime`.

- The adapter does **not** evaluate whether the retrieved standings are suspended, whether policies are applicable, or whether the retrieved records are sufficient for verification.
- The adapter does **not** filter records based on chronological validity ranges; it retrieves facts exactly as-is.
- The Domain layer remains entirely unaware of persistence retrieval representations.

### 4.3 ValidatedCanonicalIdentifier Boundary

- `ValidatedCanonicalIdentifier` is an opaque branded string that ensures the input to the repository has been pre-validated and normalized upstream.
- The PostgreSQL adapter must treat the identifier as already canonical. It must not trim, parse, or infer identifier families (such as GTIN vs Digital Link) from it.

### 4.4 Absence, Empty Collections, and Retrieved Facts

- **Valid Absence:** If an identifier does not exist in the `identities` table, it represents a valid absence. The lookup method must return `{ ok: true, value: null }`. This is not an error or exception.
- **Empty Collections:** If an identity is found but has no associated standings, authorities, or capabilities, the adapter must return those fields as empty arrays `readonly []`, not as `null` or omitted fields.
- **No Fabrication:** The adapter must never synthesize, default, or fabricate records to make a retrieved graph appear "complete".

---

## 5. Transactional Snapshot Analysis

### 5.1 Multi-Table Temporal Drift Risk

Because assembling one `RetrievedRegistryState` requires querying multiple tables (`identities`, `referents`, `standings`, `authorities`, `capabilities`, `evidence`, and `policies`) associated with a canonical reference, executing independent queries without an explicit transaction poses a critical risk.

- **Temporal Drift:** Under concurrent mutation, tables may be updated between individual query boundaries. For example, a new standing record or a policy change might be committed after the adapter queries `identities` but before it queries `standings` or `policies`.
- **Card-Assembling Incoherence:** The resulting `RetrievedRegistryState` would represent a mixed snapshot of facts that never existed simultaneously in persistence, violating the core constitutional guarantee of execution integrity.

### 5.2 Isolation-Level Evaluation

- `READ COMMITTED` (PostgreSQL default): Prevents reading dirty data but permits non-repeatable reads. Queries executed within the same transaction can observe different states if concurrent transactions commit changes in between. This does **not** resolve temporal drift across multi-table reads.
- `REPEATABLE READ`: Guarantees that all queries executed within a single transaction observe a consistent snapshot of the database taken at the transaction's start. Concurrent commits after the transaction begins are completely invisible.
- `SERIALIZABLE`: Guarantees strict transactional ordering, but incurs significant locking overhead and serialization failure retry risks. Since the retrieval operation is purely read-only, `SERIALIZABLE` introduces unnecessary performance penalties.

### 5.3 Recommended Retrieval Transaction Model

It is recommended that **AMS-0503** strictly mandates:

- **One read-only PostgreSQL transaction using `REPEATABLE READ` isolation** for the complete assembly of a `RetrievedRegistryState`.

### 5.4 Provenance and Classification of the Recommendation

This recommendation is classified as an **IMPLEMENTATION INFERENCE** necessary to preserve the constitutional guarantees of deterministic execution (CAW-007, CAW-008). While the schemas and trigger invariants are `CONSTITUTIONALLY SETTLED`, the specific use of a `REPEATABLE READ` transaction represents a high-integrity architectural choice to eliminate temporal drift in the retrieval adapter.

---

## 6. PostgreSQL Adapter Architecture

### 6.1 Proposed Placement

The concrete repository adapters shall be implemented under:
`apps/api/src/registry/infrastructure/persistence/`
This matches **M05 PLANNING DECISIONS** and preserves package-boundary purity, as `@zyppi/contracts` remains 100% infrastructure-neutral.

### 6.2 Read and Write Adapter Separation

The retrieval adapter and receipt-persistence adapter have distinct operational scopes:

- `PostgresRegistryRepository` (Implements `RegistryRepository`): Handles multi-table read queries under a `REPEATABLE READ` transaction snapshot.
- `PostgresReceiptRepository` (Implements `ReceiptRepository`): Handles single-row, append-only receipt writes.
- **Recommendation:** Implement them as separate classes or modules to ensure high-cohesion, while injecting the shared `postgres.js` database client.

### 6.3 Database Client Ownership and Construction

- Access to PostgreSQL shall be provided via direct injection of a narrowly typed `postgres.js` client (`postgres.Sql`) into the constructors of the adapters.
- The database client instance itself is created at the API's composition root (`apps/api/src/main.ts`) using standard environment variables (`PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`).

### 6.4 Dependency and Composition Boundaries

- `@zyppi/api` depends on `@zyppi/contracts` and `@zyppi/domain`.
- Adapters import `@zyppi/contracts` to implement the interfaces and `@zyppi/domain` for the core records.
- No database driver or PostgreSQL types may ever leak into `@zyppi/contracts` or `@zyppi/runtime`.

### 6.5 Prohibited Premature Abstractions

- Prohibit introducing a "Unit of Work" or a complex custom "Transaction Provider" abstraction during **AMS-0503**.
- Parameterized raw SQL via `postgres.js` natively supports scoping queries under transactions using its closure-based client syntax (e.g. `sql.begin(async sql => { ... })`). This is the cleanest, simplest, and most robust composition model.

---

## 7. Schema-to-Domain Mapping Analysis

### 7.1 Table-to-Record Mapping

Assembling a `RetrievedRegistryState` maps table rows directly to the following domain models:

- Table `identities` -> `IdentityRecord`
- Table `referents` -> `ReferentRecord` (Queried recursively or flatly for the product, brand, and manufacturer associations)
- Table `standings` -> `StandingRecord` (Filtered by subjectId matching the identity's referentId/manufacturer/brand subjects)
- Table `authorities` -> `AuthorityRecord`
- Table `capabilities` -> `CapabilityRecord`
- Table `evidence` -> `EvidenceRecord`
- Table `policies` -> `PolicyRecord`

### 7.2 Physical-to-Domain Field Mapping

The adapter must perform explicit, defensive row mapping where column names and property names differ. Under no circumstances should rows be directly cast without mapping.

- **Primary Keys:** Physical columns are named `id` across all tables, whereas domain records use specific ID properties (e.g. `identityId`, `referentId`, `evidenceId`).
- **Receipt Hashing & Timings:** Physical table `execution_receipts` column `execution_time_ms` (integer/bigint) maps to domain property `executionTime` (number).

### 7.3 Storage Metadata Stripping

All physical tables contain metadata columns used exclusively for storage tracking and provenance. These columns do **not** exist in the `@zyppi/domain` record definitions and must be stripped during decoding:

- Column `created_at` (TIMESTAMPTZ) in `referents`, `identities`, `evidence`, `policies`, `authorities`, `capabilities`, `standings`, and `execution_receipts`.
- Column `updated_at` (TIMESTAMPTZ) in `identities` and `policies`.

### 7.4 Nullability and Missing-Field Semantics

- **Nullability Translation:** PostgreSQL `NULL` must be mapped explicitly to TypeScript `null`. Missing values must never silently become `undefined`.
- **Validation Assertions:** The adapter must route each decoded object through the domain's corresponding `validate...` helper (e.g. `validateIdentityRecord`) to ensure type and invariant correctness before returning.

### 7.5 JSONB Decoding

- Columns utilizing the `JSONB` data type (e.g., `policies.definition`, `execution_receipts.decision_summary`) are decoded by the `postgres.js` driver into standard JavaScript object trees.
- The adapter must verify that these definitions are valid recursive, finite structures, ensuring they pass through the domain's recursive JSON validators safely.

### 7.6 Existing Domain Validation Reuse

The adapter must reuse:

- `validateIdentityRecord`
- `validateReferentRecord`
- `validateStandingRecord`
- `validateAuthorityRecord`
- `validateCapabilityRecord`
- `validateEvidenceRecord`
- `validatePolicyRecord`
- `validateExecutionReceipt`

### 7.7 Identified Mapping Gaps

- **Referent Resolution Mapping:** A lookup by canonical reference yields a single `IdentityRecord`. That identity references a `referent_id` (representing a Product). The Product referent may reference a `parent_referent_id` (representing a Brand), which in turn may reference a parent `parent_referent_id` (representing a Manufacturer). The adapter must recursively fetch the complete referent ancestor chain to populate the `relationships` array. Since the Domain layer does not provide recursive lookup utilities, the adapter must implement this fetching logic in SQL/TypeScript natively.

---

## 8. Registry Error Taxonomy

### 8.1 InfrastructureUnavailable

Mapped when PostgreSQL cannot be reached. Examples include:

- `ECONNREFUSED` connection rejections;
- Connection timeout exceptions;
- Low-level network socket crashes or driver termination events.

### 8.2 DataCorruption

Mapped when database rows exist but cannot be parsed or validated into pure domain structures. Examples include:

- A column value failing the domain regex validation (e.g., an invalid ISO-8601 UTC timestamp in `valid_from`);
- A required column returning `NULL` in storage when the domain field is mandatory;
- Incomplete referent graphs or invalid enum values;
- Malformed or cyclic JSONB data in a policy definition.

### 8.3 OperationFailed

Mapped when storage is reached and data is intact, but the request cannot be completed. Examples include:

- A unique key constraint violation on `execution_receipts.id` during receipt save;
- An append-only trigger rejection (SQLSTATE `P0001`) during an unauthorized update/delete attempt;
- Transient locks or transaction contentions.

### 8.4 Prohibited Error Leakage

To preserve strict isolation, the adapter must catch all low-level exceptions and map them to the closed three-kind union. The following details must **never** escape the adapter boundary:

- Driver error types (e.g. from `postgres.js`);
- SQL query fragments or raw database text;
- SQLSTATE values (e.g., `P0001`, `23505`);
- Constraint names, trigger names, or database table structures.

### 8.5 DataCorruption Runtime Consequences

- **Terminal Outcome:** A `DataCorruption` result is strictly terminal for the current execution. The Runtime must fail-closed immediately.
- **No Salvage or Fallbacks:** The Runtime must not activate partial graphs, fabricate missing records, or fall back to default values. No alternate-source or federated fallback mechanism is authorized under **AMS-0503**.

---

## 9. Receipt Persistence Boundary

### 9.1 Passive Sink Semantics

`PostgresReceiptRepository` acts as a pure, passive storage sink. It accepts a domain-valid `ExecutionReceipt` and inserts it. It does **not** evaluate verification outcomes, check evidence, or recalculate cryptographic hashes.

### 9.2 Append-Only Insert Semantics

- Receipts are strictly write-once. The adapter must perform an `INSERT`, never an upsert or update-or-insert.
- Original rows must remain completely untouched in the database, guaranteed by both application logic and database triggers.

### 9.3 PersistenceAcknowledgement Meaning

A successful acknowledgment signifies only that the database transaction completed and the receipt is written. It carries no implication of global durability, distributed replication, federation synchronization, or chronological execution approval.

### 9.4 Duplicate and Trigger Failure Classification

- Inserting a receipt with a duplicate `receiptId` (violating primary key constraints) must map to `OperationFailed` (not `DataCorruption`), as the receipt data itself is uncorrupted but the operation cannot complete.
- Append-only trigger failures throwing SQLSTATE `P0001` must map strictly to `OperationFailed`.

---

## 10. Query Topology Analysis

### 10.1 Retrieval Graph

The retrieval topology for assembling a `RetrievedRegistryState` begins with a `ValidatedCanonicalIdentifier` lookup on `identities`:

```
ValidatedCanonicalIdentifier
  ↳ lookup in 'identities' on 'canonical_reference'
      ↳ Get identity.id & identity.referent_id
          ↳ Query ancestor referents recursively (relationships)
          ↳ Query 'standings' matching referent IDs or subject IDs
          ↳ Query 'authorities' matching subject IDs
          ↳ Query 'capabilities' matching subject IDs
          ↳ Query 'evidence' matching 'identity_id'
          ↳ Query 'policies' active in the system
```

### 10.2 Single Join vs. Focused Queries

- **Single Join:** Querying all tables through a single query with extensive `LEFT JOIN` structures.
- **Multiple Focused Queries:** Querying tables individually or in logical groups (e.g., standings, capabilities, authorities) inside a single `REPEATABLE READ` transaction closure.
- **JSON Aggregation:** Using PostgreSQL JSON aggregation (`jsonb_agg`) to fetch nested collections directly in SQL.

### 10.3 Cardinality and Row-Multiplication Risks

Using a single joined query introduces massive **row multiplication**. Because relationships, standings, capabilities, and authorities are one-to-many collections, joining them flatly causes a combinatorial explosion of returned rows. For example, if an identity has 3 referents, 4 standings, 5 capabilities, and 2 evidence records, a flat left-join query would return $3 \times 4 \times 5 \times 2 = 120$ row duplicates, creating complex, error-prone deduplication and decoding logic in the adapter.

### 10.4 Recommended Query Topology

To ensure correctness, cardinality preservation, and maintainability, the following topology is recommended:

- **Execute multiple focused, parameterized queries inside a single, read-only `REPEATABLE READ` transaction.**
  - Query 1: Fetch the active `IdentityRecord` by canonical reference.
  - Query 2: Fetch the Product, Brand, and Manufacturer records by tracing `parent_referent_id` recursively (using a CTE or controlled sequential queries).
  - Query 3: Fetch associated standings, authorities, and capabilities matching the resolved subjects.
  - Query 4: Fetch evidence records matching the identity ID.
  - Query 5: Fetch active policies.
- This approach completely eliminates row multiplication, preserves natural cardinality, allows direct row-to-domain mapping, and utilizes the consistent snapshot guaranteed by the `REPEATABLE READ` transaction isolation.

---

## 11. Integration Testing and Verification Strategy

### 11.1 Real PostgreSQL Requirement

The adapters must be tested against a real PostgreSQL 16 database. Mocking the database driver or connections is prohibited, as it cannot verify actual SQL execution, transaction boundaries, constraint enforcements, trigger rejections, and binary column mapping correctness.

### 11.2 Retrieval Success and Absence

- **Success Case:** Populate tables with a complete valid graph of an identity, referents, standings, capabilities, and policies. Assert that `lookup` resolves a complete, correct `RetrievedRegistryState`.
- **Absence Case:** Query a non-existent identifier. Assert that the returned payload is exactly `{ ok: true, value: null }` (not throwing or failing with an error).

### 11.3 Empty Collection Preservation

Assert that if an identity exists but has empty tables for standings or authorities, the returned `RetrievedRegistryState` contains explicit empty arrays `readonly []` for those fields rather than omission or `null` values.

### 11.4 Snapshot Consistency

Construct a test where a parallel connection inserts a new standing record after the transaction begins. Assert that the adapter's read-only transaction (operating under `REPEATABLE READ`) does **not** see the new standing, proving correct snapshot consistency.

### 11.5 DataCorruption

Inject malformed values into columns (e.g., inserting a malformed date string into `valid_from` or corrupting a JSONB policy definition). Assert that the lookup returns `{ ok: false, error: { kind: "DataCorruption" } }` with no partial state exposed.

### 11.6 InfrastructureUnavailable

Instantiate an adapter with an invalid host or port (e.g. `127.0.0.1:5433`). Assert that calling its methods returns `{ ok: false, error: { kind: "InfrastructureUnavailable" } }` and does not throw raw driver exceptions.

### 11.7 Receipt Persistence

- Assert that saving a valid `ExecutionReceipt` succeeds, returns `{ ok: true, value: {} }`, and maps the properties to the physical table columns exactly.
- Assert that saving a duplicate receipt ID fails with `{ ok: false, error: { kind: "OperationFailed" } }`.
- Attempt to `UPDATE` or `DELETE` an inserted receipt. Assert that the operation fails with trigger-raised errors, and verify the original row remains unchanged.

### 11.8 Boundary and Dependency Validation

Assert that executing `pnpm graph:validate` and `pnpm boundary:all` passes cleanly post-implementation, ensuring zero database dependencies leaked into `@zyppi/contracts` or `@zyppi/runtime`.

---

## 12. Decision Register

| Decision ID           | Topic                              | Current Source Position          | Proposed Disposition                                                                                                             | Provenance                        | Chair Decision Required |
| :-------------------- | :--------------------------------- | :------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------- | :---------------------- |
| **AMS-0503-PREP-D01** | Concrete Adapter Placement         | No adapters exist yet.           | Implement Postgres adapters inside `apps/api/src/registry/infrastructure/persistence/`.                                          | `M05 PLANNING DECISION`           | No                      |
| **AMS-0503-PREP-D02** | Adapter Modules Separation         | Interfaces are separated.        | Implement `PostgresRegistryRepository` and `PostgresReceiptRepository` as separate files, sharing a constructor-injected client. | `IMPLEMENTATION INFERENCE`        | No                      |
| **AMS-0503-PREP-D03** | `RetrievedRegistryState`           | Struct is defined in contracts.  | Retrieve facts as-is and map them directly into `RetrievedRegistryState` fields.                                                 | `AMS-0502 CONTRACT FACT`          | No                      |
| **AMS-0503-PREP-D04** | ACV Activation Ownership           | No resolution exists.            | Confirm that `@zyppi/runtime` remains the sole owner of ACV activation/resolution.                                               | `CONSTITUTIONALLY SETTLED`        | No                      |
| **AMS-0503-PREP-D05** | Transactional Snapshot Model       | No transaction model exists.     | Mandate one read-only `REPEATABLE READ` transaction closure for `RetrievedRegistryState` assembly.                               | `IMPLEMENTATION INFERENCE`        | No                      |
| **AMS-0503-PREP-D06** | Database Client Injection          | No client injection exists.      | Inject `postgres.Sql` instance directly into adapter constructors from the composition root.                                     | `M05 PLANNING DECISION`           | No                      |
| **AMS-0503-PREP-D07** | Strict Row Decoding                | Rows are unmapped.               | Row properties must be mapped explicitly to domain types and verified via domain validators.                                     | `M05 PLANNING DECISION`           | No                      |
| **AMS-0503-PREP-D08** | Storage Metadata Stripping         | Columns exist in schema.         | Omit physical columns `created_at` and `updated_at` when constructing domain objects.                                            | `M05 PLANNING DECISION`           | No                      |
| **AMS-0503-PREP-D09** | Empty Collection Preservation      | Collections are undefined.       | Return empty collections as `readonly []` arrays, never as `null` or omitted fields.                                             | `M05 PLANNING DECISION`           | No                      |
| **AMS-0503-PREP-D10** | Error Translation Taxonomy         | Errors defined in contracts.     | Map database errors, connection faults, and triggers exactly to the closed three-kind union.                                     | `AMS-0502 CONTRACT FACT`          | No                      |
| **AMS-0503-PREP-D11** | `DataCorruption` terminal behavior | Runtime is uncoupled.            | A `DataCorruption` result halts the pipeline immediately; no fallback or partial execution.                                      | `CURRENT SOURCE FACT` (via Chair) | No                      |
| **AMS-0503-PREP-D12** | Receipt Append-Only Semantics      | trigger enforces immutability.   | Receipt adapter performs write-only `INSERT` operations; updates/deletes are blocked.                                            | `CONSTITUTIONALLY SETTLED`        | No                      |
| **AMS-0503-PREP-D13** | Query Topology                     | Query path is unmapped.          | Execute multiple focused queries within one repeatable-read transaction closure to prevent row multiplication.                   | `IMPLEMENTATION INFERENCE`        | No                      |
| **AMS-0503-PREP-D14** | Integration Testing Strategy       | Real Postgres in schema.test.ts. | Mandate real PostgreSQL 16 database verification for all happy and error paths during AMS-0503.                                  | `CURRENT SOURCE FACT`             | No                      |

---

## 13. Risks, Constraints, and Unresolved Questions

### 13.1 Risks and Controls

- **Temporal Drift (AMS-0503-PREP-R01):** _Control:_ Enforce read-only `REPEATABLE READ` transaction snapshot containment for fact assemblies.
- **Persistence-to-Runtime Semantic Leakage (AMS-0503-PREP-R02):** _Control:_ Keep adapter output strictly as a neutral, unprocessed retrieved facts state; Runtime retains exclusive activation ownership.
- **Unsafe Row Decoding (AMS-0503-PREP-R03):** _Control:_ Ensure strict field-by-field decoding and pass objects through Domain validators; map failures to `DataCorruption`.
- **Storage Metadata Leakage (AMS-0503-PREP-R04):** _Control:_ Discard `created_at` and `updated_at` fields completely during Row-to-Record mapping.
- **Database Error Leakage (AMS-0503-PREP-R05):** _Control:_ Catch raw exceptions inside the adapter and translate them into standard contract error kinds.
- **Partial-State Execution (AMS-0503-PREP-R06):** _Control:_ Fail closed immediately on `DataCorruption` results; no salvaging or default substitution.
- **Receipt Persistence Semantic Leakage (AMS-0503-PREP-R07):** _Control:_ Treat receipt persistence as a passive write sink; map constraint rejections to `OperationFailed`.
- **Query Cardinality Distortion (AMS-0503-PREP-R08):** _Control:_ Prefer focused queries inside a transaction over massive left-joins.
- **Premature Infrastructure Abstraction (AMS-0503-PREP-R09):** _Control:_ Inject standard `postgres.Sql` client directly; do not author Unit of Work or transaction providers.

### 13.2 Unresolved Questions

None. All mapping definitions, transactional requirements, and placement rules are completely aligned with the constitutional schema and IT-0502 contracts.

### 13.3 Chair Decisions Required

No Chair decisions are required. The architectural specifications are fully settled and ready for implementation.

---

## 14. Proposed AMS-0503 Scope and Explicit Non-Goals

### 14.1 Authorized Scope

The proposed scope for **AMS-0503** includes:

- Implementing `PostgresRegistryRepository` and `PostgresReceiptRepository` inside `apps/api/src/registry/infrastructure/persistence/`;
- Writing clean parameterized SQL queries using `postgres.js`;
- Creating row mappers that defensively map rows to domain records and strip storage metadata;
- Implementing error translators to return the correct `RegistryError` kinds;
- Creating robust integration tests against real PostgreSQL 16 verifying all happy and failure paths.

### 14.2 Explicit Non-Goals

- Introducing ORM, query-builder, or transaction-provider abstractions;
- Implementing ACV activation, standing evaluations, or policy resolution inside the adapters;
- Modifying `@zyppi/domain`, `@zyppi/contracts`, or `@zyppi/runtime` source files.

---

## 15. Readiness Verdict

### **VERDICT:** `A. READY FOR AMS-0503`

### Justification:

- The abstract repository contract surface (`IT-0502`) is fully established and passing all verification checks;
- The database schema and trigger invariants are completely initialized and tested on real PostgreSQL 16;
- All risks (including temporal drift and row multiplication) have been thoroughly analyzed, resulting in clear, high-integrity implementation recommendations (read-only `REPEATABLE READ` transaction containment with multiple focused queries).
- There are no outstanding design contradictions or unresolved questions. Implementation can proceed immediately under the proposed guidelines.

---

## Appendix A — Source Inspection Receipt

Inspected on August 3, 2026:

- `packages/contracts/src/registry.ts` (confirmed RetrievedRegistryState and error structure).
- `infra/migrations/001_initial_registry_schema.sql` (confirmed physical columns and append-only triggers).
- `tools/verify-dependency-graph.mjs` (confirmed package dependency boundaries).
- `packages/domain/src/index.ts` (confirmed domain model properties and validator functions).

---

## Appendix B — Provenance Classification

- **CONSTITUTIONALLY SETTLED:** CAW-008 schema layouts, immutable triggers, and append-only constraints.
- **M05 PLANNING DECISION:** Port placement rules, no ORM/query builders, and `postgres.js` client usage.
- **AMS-0502 CONTRACT FACT:** Exact types of `RetrievedRegistryState`, `RegistryError`, and `RegistryResult`.
- **CURRENT SOURCE FACT:** Existences of domain models, validators, and vitest configs.
- **IMPLEMENTATION INFERENCE:** Multi-query topology, repeatable-read read-only transactions, and adapter-to-receipt separation.

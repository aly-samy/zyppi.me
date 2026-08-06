# M05-PREP — Registry Layer Planning Readiness

## 1. Purpose and Read-Only Scope

### 1.1 Mandate and Scope Definition

This document is a formal repository reconnaissance report and planning-readiness assessment for **Milestone M05 — Registry Layer**. It has been prepared by the Repository Reconnaissance Agent under the sole authority of **CAW-007**, **CAW-008**, **CAW-011**, **CAW-004**, active engineering standards, and the current repository state.

- **Mandate Type:** Read-only architectural reconnaissance and planning-readiness assessment.
- **Milestone:** M05 — Registry Layer.
- **Authority basis:** CAW-007, CAW-008, CAW-011, CAW-004, active engineering standards (including CEngS-001, CEngS-002, and CEngS-102), and the verified repository state.
- **Status:** **RATIFIED**.
- **Implementation Authority:** **NONE** (No code changes may be made beyond writing this report).

### 1.2 Strict Read-Only Boundaries

In accordance with section 2 of the M05-PREP Mandate, the agent has strictly observed the read-only boundary constraints. Specifically, the agent has **not**:

- Modified production source code or tests;
- Created or modified database schemas or migrations;
- Installed or removed dependencies or selected/integrated a database driver;
- Created repository interfaces, PostgreSQL adapters, or seed data;
- Modified package scripts or CI workflows;
- Altered dependency-boundary rules;
- Created package directories or stub files for future implementation;
- Committed any implementation work.

The only file created or modified in the repository is:

- `DOCS/CAW/M05/M05-PREP.md`

No other tracked file in the monorepo has been modified, created, or deleted.

---

## 2. Authority Receipt

This section establishes the authoritative receipts derived directly from ratified documents, citing precise document identifiers and section references where applicable.

### 2.1 CAW-011 — M05 Task Graph

Based on `DOCS/CAW/CAW-011-Build-Order.md` (Version 2.0, Status: ACTIVE), the task graph for Milestone M05 is established verbatim. No re-ordering, splitting, or reinterpretation has been introduced.

| ID          | Title                       | Depends On | Size | AMS      | Status    | Required Outputs / Deliverables                                                         |
| :---------- | :-------------------------- | :--------- | :--- | :------- | :-------- | :-------------------------------------------------------------------------------------- |
| **IT-0501** | PostgreSQL schema (CAW-008) | M03        | M    | AMS-0501 | ☐ Planned | PostgreSQL schema definition, tables matching CAW-008, foreign key definitions.         |
| **IT-0502** | Repository interfaces       | IT-0501    | S    | AMS-0502 | ☐ Planned | Abstract pure TypeScript interfaces/contracts for Registry persistence and ACV loading. |
| **IT-0503** | Registry adapter            | IT-0502    | M    | AMS-0503 | ☐ Planned | PostgreSQL adapter implementation satisfying the abstract repository interfaces.        |
| **IT-0504** | Seed data                   | IT-0501    | S    | AMS-0504 | ☐ Planned | Seeding scripts / migrations for inserting the approved demo dataset.                   |
| **IT-0505** | Migration framework         | IT-0501    | S    | AMS-0505 | ☐ Planned | Tooling for executing, reverting, tracking, and verifying schema changes.               |

#### Cross-Milestone and Task Sequencing Context:

- **Upstream Milestone:** M03 (Domain Foundation) must be fully complete (Status: ☑ Complete) before IT-0501 can begin. Under active repository facts, M03 is indeed fully complete, as established by the closure report `DOCS/CAW/AMS/M03-Closure-Report.md`.
- **Parallel Execution:** M05 may run in parallel with M04 (Runtime Skeleton) and M06 (GS1 Digital Link Resolution) as indicated by the Parallel Execution Map in CAW-011:
  ```
  M03 Domain Foundation ─┬─→ M04 Runtime Skeleton
                         ├─→ M05 Registry Layer
                         └─→ M06 GS1 Digital Link Resolution
  ```
- **Downstream Milestones:** M05 serves as a direct input to M08 (Runtime Verification Pipeline), where IT-0801 ("Wire ACV loading into pipeline") depends directly on the PostgreSQL adapter from IT-0503.

---

### 2.2 CAW-008 — Registry Schema and Persistence Invariants

Based on `DOCS/CAW/CAW-008-Registry-Schema.md` (Version 1.0, Status: ACTIVE), the database persistence requirements are defined under the following constraints:

#### Table Scope & Schema Specification:

The registry schema is strictly restricted to the minimum tables required to serve **one verification flow** (No multi-tenant columns, no future-proofing columns).

1. **`identities`**
   - Fields: `id (pk, uuid)`, `identity_type`, `canonical_reference` (Digital Link / GTIN), `referent_id (fk → referents)`, `status` (draft/active/decommissioned), `created_at`, `updated_at`.
2. **`referents`**
   - Fields: `id (pk, uuid)`, `referent_type` (product/brand/manufacturer), `name`, `parent_referent_id (fk, nullable)`, `created_at`.
3. **`evidence`**
   - Fields: `id (pk, uuid)`, `identity_id (fk)`, `evidence_type`, `hash`, `storage_ref` (R2 object key), `retrieved_at`.
   - **Invariants:** `immutable: true` (enforced at the application level, never updated after insertion).
4. **`policies`**
   - Fields: `id (pk, uuid)`, `policy_type`, `version`, `definition (jsonb)`, `active: boolean`.
5. **`authorities`** / **`capabilities`** / **`standings`**
   - Fields: `id (pk, uuid)`, `subject_id`, `scope`, `valid_from`, `valid_to`.
6. **`execution_receipts`**
   - Fields: `id (pk, uuid)`, `execution_id`, `runtime_version`, `input_hash`, `output_hash`, `evidence_hash`, `policy_version`, `decision_summary (jsonb)`, `execution_time_ms`, `deterministic_hash`, `created_at`.
   - **Invariants:** Append-only, never updated or deleted.

#### Database-Level Persistence Constraints & Invariants:

- **Foreign Keys:** Must be strictly enforced at the database level, not merely at the application level.
- **Insert-Only (Append-Only) Enforcement:** Tables `execution_receipts` and `evidence` must be insert-only. No `UPDATE` or `DELETE` grants shall be assigned to the database application role. This represents a storage-layer enforcement of the CEngS-001 §4 replay and immutability guarantee.
- **Timestamping:** Every table must contain a `created_at` timestamp. Mutable tables (`identities`, `policies`) must also contain `updated_at`.

---

### 2.3 CAW-007 — Active Constitutional View Scope

Based on `DOCS/CAW/CAW-007-Runtime-Contracts.md` (Version 1.0, Status: ACTIVE) and `DOCS/CAW/CAW-003-Domain-Model.md` (Version 1.0, Status: ACTIVE):

- **ACV Scope:** The Active Constitutional View (ACV) must contain only the minimum constitutional state required for a single verification decision.
- **Verbatim ACV Content:**
  ```
  ActiveConstitutionalView {
    identity: Identity
    relationships: ReferentRecord[]                      // e.g., Product → Brand → Manufacturer relations
    standings: StandingRecord[]
    authorities: AuthorityRecord[]
    capabilities: CapabilityRecord[]
    evidenceReferences: string[]                         // References mapping to the evidence bundle
    applicablePolicies: PolicyRecord[]
  }
  ```
- **Retrieval and Failure Boundaries (The Semantic Divide):**
  - **What the ACV contains:** Explicitly defined by the CAW-007 model layout shown above.
  - **How the ACV is retrieved:** **Unspecified by ratified sources.** This is an open planning gap that must be resolved prior to M05 implementation.
  - **What happens when retrieval fails or ACV is absent:** **Unspecified by ratified sources.** The boundary must distinguish clearly between a database/network failure (storage unavailable) and a functional state failure (e.g., identity not found).

---

### 2.4 Runtime and Infrastructure Boundaries

Based on `DOCS/CEngS-v2/CEngS-001-Engineering-Constitution.md` (§4 - Determinism and Isolation), `DOCS/CEngS-v2/CEngS-002-Engineering-Rules.md` (§4 - Boundary Purity), and `DOCS/CAW/CAW-004-Repository-Map.md`:

1. **Runtime Purity Constraint:** `@zyppi/runtime` is a completely pure execution environment. It is subject to strict AST lint checks (`pnpm runtime:purity`) and must contain **zero** host-level I/O, zero database connection files, no raw SQL string execution, and no network or filesystem operations.
2. **Infrastructure Isolation:** Database connection setup, client driver pool management, SQL migration execution, and schema migrations belong exclusively to the **Application and Infrastructure Layers** (`apps/api` and `infra/`), keeping `@zyppi/runtime` completely decoupled from physical persistence concerns.
3. **Dependency Direction Constraint:**
   - `@zyppi/domain` and `@zyppi/shared` are leaf packages with empty production dependencies.
   - `@zyppi/runtime` may depend only on `@zyppi/domain` and `@zyppi/shared`.
   - Infrastructure adapter packages or API apps may depend on `@zyppi/runtime`, `@zyppi/domain`, and `@zyppi/shared`.
   - Under no circumstances may `@zyppi/runtime` depend on any database driver, repository adapter implementation, or SQL runner.
4. **Constitutional Truth Ownership:** The database/storage layer is an _operational container_ for facts, but is **never** the author or definer of constitutional truth or domain logic. All domain schemas and rules are authored and validated in the pure leaf package `@zyppi/domain`. The database schema must conform to the domain models—not vice versa.

---

## 3. Current Repository Baseline

The active codebase has been thoroughly inspected. Below is a comprehensive record of the monorepo's active package topology and tooling.

### 3.1 Workspace Package Inventory and Structure

The monorepo contains exactly 8 declared packages under `pnpm-workspace.yaml`. The physical layout and baseline facts are documented in the table below:

| Area / Package           | Current Source-Grounded State                                                                                                                         | Relevant Constraint                                   | M05 Implication                                                                        |
| :----------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------- | :------------------------------------------------------------------------------------- |
| **`packages/domain`**    | **Active.** Contains full TypeScript source files for core types and validation functions (`index.ts`, `referent.test.ts`, `standing.test.ts`, etc.). | Pure leaf package. Zero external dependencies.        | Used as the source of truth for schema mappings and domain entities in IT-0501.        |
| **`packages/shared`**    | **Active.** Private leaf package. Contains only `index.ts` with `export {};`. Zero dependencies.                                                      | Pure leaf package. Zero external dependencies.        | Available for general-purpose serialization or formatting utilities.                   |
| **`packages/contracts`** | **Active.** Private package. Entry point contains only `export {};`. Zero production dependencies.                                                    | Compiles via TypeScript project references.           | Plausible candidate for abstract repository contracts/interfaces, but currently empty. |
| **`packages/runtime`**   | **Active.** Contains pipeline and determinism evaluation logic (`pipeline.ts`, `types.ts`, `pipeline.test.ts`). Depends on `domain` and `shared`.     | Must remain 100% pure-deterministic. No I/O.          | Must not reference any database client or SQL logic. Consumes ACV.                     |
| **`packages/testing`**   | **Active.** Private testing helper package. Contains migrated test files (`m03Closure.test.ts`).                                                      | Dev-only test utilities. Cannot be a prod dependency. | Hosts validation tests and mock fixtures.                                              |
| **`apps/api`**           | **Active.** Private ESM fastify app skeleton. Entrypoint `main.ts` contains exactly `export {};`.                                                     | Application layer. May orchestrate connection pools.  | Plausible connection owner and orchestration target for the database.                  |
| **`apps/web`**           | **Active.** Private ESM web app skeleton. Entrypoint `main.ts` contains exactly `export {};`.                                                         | Presentation layer. Cannot bypass `apps/api`.         | No direct M05 implications; completely out of database scope.                          |
| **`infra/`**             | **Active.** Contains only a `.gitkeep` placeholder. No Terraform, SQL files, or tooling present.                                                      | Reserved for IaC, migration definitions.              | IT-0501 SQL schemas and migrations must live here.                                     |

---

### 3.2 Workspace Dependencies, Tooling, and Validation Baseline

A detailed inspection of configuration files reveals the following:

- **PostgreSQL / SQL Tooling:** **No database client, ORM, query builder, migration CLI, or driver dependencies exist** anywhere in the active `package.json` manifests of root, `apps/api`, or `infra`.
- **TypeScript Project References:** References are fully configured. For example, `packages/runtime/tsconfig.json` correctly references `packages/domain` and `packages/shared`.
- **Testing Infrastructure:** Vitest is used for testing. The configuration `vitest.config.ts` recursively excludes `node_modules` to prevent test duplication. All tests run sequentially (`maxConcurrency: 1`).

### 3.3 Execution of Baseline Verification Commands

On March 9, 2025, the canonical repository verification pipeline was run. The baseline commands passed with zero errors, confirming a clean, green, and stable workspace.

1. **`pnpm format:check`**
   - **Result:** `PASS`
   - **Output Summary:** `All matched files use Prettier code style!`
2. **`pnpm lint`**
   - **Result:** `PASS`
   - **Output Summary:** Checked workspace with zero lint errors or warnings (excluding standard ESLint Flat config ignore deprecation warning).
3. **`pnpm exec tsc -b`**
   - **Result:** `PASS`
   - **Output Summary:** Compiles monorepo and dependencies with zero TypeScript compilation errors.
4. **`pnpm runtime:purity`**
   - **Result:** `PASS`
   - **Output Summary:** Static analyzer verified `packages/runtime` source files are pure from system clocks, Math.random(), and unauthorized I/O packages.
5. **`pnpm boundary:all`**
   - **Result:** `PASS`
   - **Output Summary:** All monorepo publishable packages pass manifest-level boundary validation.
6. **`pnpm graph:validate`**
   - **Result:** `PASS`
   - **Output Summary:** verified zero cycles and exact conformance to the CAW-004 v2.1 dependency graph.
7. **`pnpm test --run`**
   - **Result:** `PASS`
   - **Output Summary:** `16 passed (16 files, 414 tests)`.

---

## 4. Resolution of Planning Gap A — Repository and Adapter Placement

Establishing clear physical and dependency boundaries for persistence is critical to preserving Runtime Purity (CEngS-002 §4). This section evaluates the candidate placements for database components.

### 4.1 Boundary Analysis of Monorepo Layout

The active repository layout contains no physical package dedicated to databases or repository adapters. Based on active dependency rules (CAW-004 §2.1), we classify each component's location as either **prescribed**, **compatible but undecided**, or **requiring an architectural decision**:

1. **Pure Registry Repository Interfaces (TypeScript Contracts):**
   - _Status:_ **Compatible but undecided.**
   - _Analysis:_ Interfaces represent abstract contracts consumed by the Application layer to load ACV data or persist receipts.
   - _Option 1:_ `packages/contracts`. While historically proposed, `packages/contracts` is intended for HTTP request/response DTOs and OpenAPI schemas. Including database-repository contracts there risks mixing HTTP schemas with persistence contracts.
   - _Option 2:_ `packages/domain` or a dedicated package like `packages/registry-contracts`. Placing interfaces in `packages/domain` is highly pure because interfaces are pure TypeScript and express the pure "needs" of the business model. However, `packages/domain` has zero dependencies and is a strict leaf package.
   - _Option 3:_ `packages/runtime`. The runtime consumes ACV. But loading the ACV is an _input_ to the pipeline. The runtime should not care where the ACV comes from.
   - _Recommendation:_ Define abstract repository interfaces within `packages/domain` or `packages/contracts` to express structural mappings cleanly, but ensure they remain entirely decoupled from any PostgreSQL driver types.

2. **ACV Retrieval Contracts:**
   - _Status:_ **Compatible but undecided.**
   - _Analysis:_ Consumed by `apps/api` to load domain entities. Must return pure domain records defined by `@zyppi/domain`.

3. **PostgreSQL Adapter Implementations:**
   - _Status:_ **Requiring an architectural decision.**
   - _Analysis:_ Adapters require importing database client drivers (e.g. `pg`, `postgres.js`) and raw SQL / query builder libraries.
   - _Prohibited Location:_ `@zyppi/runtime` (violates CEngS purity).
   - _Option 1:_ Inline inside `apps/api`. Compatible with dependency graph, but forces `apps/api` to house SQL-adapter logic alongside REST routing.
   - _Option 2:_ A new workspace package, e.g. `packages/registry-postgres`. Highly modular, enforces clear package boundaries, but is **not authorized** under the current package set in CAW-004.
   - _Recommendation:_ Place adapter source files in a dedicated subdirectory of `apps/api/src/adapters/` or create a database package only if authorized by a Chair decision.

4. **Database Connection Ownership:**
   - _Status:_ **Prescribed (Application Layer).**
   - _Analysis:_ Connection pooling, lifecycle events, and client instantiation must live in the executable target `apps/api`, as it is the only deployment target in the system that executes the verification flow.

5. **Row-to-Domain Mapping Logic:**
   - _Status:_ **Compatible but undecided.**
   - _Analysis:_ Converts raw database rows into strictly-typed `@zyppi/domain` records. Must run inside the Adapter.

6. **Migration Execution Code:**
   - _Status:_ **Prescribed (Infrastructure Layer).**
   - _Analysis:_ Migration DDL and runner scripts must be managed in `infra/` and executed via standard CLI tools, keeping application binaries free of schema-management overhead.

---

### 4.2 Placement Evaluation Matrix

| Concern                   | Current Repository Evidence | Candidate Location                                            | Recommended Location                                         | Dependency Direction                                            | Decision Status                        |
| :------------------------ | :-------------------------- | :------------------------------------------------------------ | :----------------------------------------------------------- | :-------------------------------------------------------------- | :------------------------------------- |
| **Repository Interfaces** | None exist.                 | `packages/domain`<br>`packages/contracts`                     | `packages/domain` (under a `ports` namespace)                | `@zyppi/domain` is imported by `apps/api` and `@zyppi/runtime`. | Compatible but undecided.              |
| **PostgreSQL Adapter**    | No adapters exist.          | `apps/api/src/adapters`<br>`packages/registry-postgres` (new) | `apps/api/src/adapters` (to avoid unauthorized new packages) | `apps/api` imports `@zyppi/domain` and `@zyppi/runtime`.        | Requires Chair Decision (**M05-D01**). |
| **Connection Pooling**    | No db drivers exist.        | `apps/api/src/infra`                                          | `apps/api/src/infra/postgres`                                | Confined entirely inside `apps/api`.                            | Prescribed.                            |
| **Migrations**            | `infra/` is empty.          | `infra/migrations`                                            | `infra/migrations`                                           | Controlled outside of the JS/TS dependency graph.               | Prescribed.                            |

---

## 5. Resolution of Planning Gap B — Driver, Query Layer, and Migration Tooling

### 5.1 Technology Assessment

Because the repository currently contains no database dependencies, the entire persistence stack is an open design area. No client, query tool, or migration framework is pre-ratified. Below is a source-grounded evaluation of viable options:

1. **PostgreSQL Driver / Client:**
   - _Option A:_ `pg` (node-postgres). The traditional, battle-tested standard. Robust connection pooling.
   - _Option B:_ `postgres.js`. Fast, pure ESM, excellent connection-lifecycle management, and native SQL tag template literals.
   - _Option C:_ `pg-mem`. In-memory PG driver for fast, pure-deterministic isolated unit tests.
   - _Recommendation:_ Recommend `postgres.js` for production due to its native ESM design and lightweight signature, and `pg-mem` or a real localized Docker-based Postgres instance for tests.

2. **Query Layer & ORMs:**
   - _Option A:_ Prisma / Drizzle ORM. Excellent TS safety but introduces heavy build artifacts, code-generation files, and complex build-pipeline steps.
   - _Option B:_ Kysely. A lightweight, type-safe SQL query builder. Compiles directly in TypeScript without code generation, operating solely on local interfaces.
   - _Option C:_ Raw SQL with templating. Maximum transparency, zero magic, highly auditable, but leaves row-mapping entirely manual.
   - _Recommendation:_ Recommend raw SQL or a lightweight query builder like `Kysely` to ensure maximum dependency transparency and prevent complex ORM query-caching layers from obscuring deterministic execution behavior.

3. **Migration Tooling & Frameworks:**
   - _Option A:_ Prisma Migrate / db-migrate. High dependency footprint.
   - _Option B:_ Custom pure SQL migration runner. A minimal 50-line JS script in `scripts/` or `infra/` that executes raw `.sql` files using the database client driver, tracking applied versions in a `schema_migrations` table.
   - _Recommendation:_ Recommend a minimal, dependency-free custom migration runner that parses plain SQL migrations sequentially. This guarantees maximum auditability and deterministic execution during CI verification.

---

### 5.2 Tooling and Driver Evaluation Matrix

| Decision Area           | Ratified Constraint                             | Current Repository Evidence | Viable Options                        | Recommendation                                     | Chair Decision Required |
| :---------------------- | :---------------------------------------------- | :-------------------------- | :------------------------------------ | :------------------------------------------------- | :---------------------- |
| **PostgreSQL Client**   | Must be PostgreSQL (CAW-008).                   | Zero database dependencies. | `postgres.js`<br>`pg` (node-postgres) | `postgres.js` (native ESM, clean pool management). | Yes (**M05-D02**).      |
| **Query & ORM Layer**   | No leak into Runtime (CEngS-001).               | Zero query packages.        | Raw SQL<br>`Kysely`<br>`Drizzle ORM`  | Raw SQL or `Kysely` (prevents bloated generation). | Yes (**M05-D03**).      |
| **Migration Format**    | Reversible, reversible, tested (CEngS-102 §10). | `infra/` is empty.          | SQL files<br>TS/JS files              | Plain SQL migrations in `infra/migrations/`.       | Yes (**M05-D04**).      |
| **Migration Execution** | Tracked and verified in CI.                     | No CI migration step.       | Custom script<br>Prisma/Drizzle CLI   | Custom lightweight JS script in `infra/`.          | Yes (**M05-D04**).      |

---

## 6. Resolution of Planning Gap C — Seed-Data Provenance

### 6.1 Audit of the Seed Data Corpus

A thorough repository-wide search was executed for the following terms:

- `"Aura Labs"` — **Zero results.**
- `"Aura Smart Ring"` — **Zero results.**
- `"00860000000123"` — **Zero results.**

### 6.2 Provenance Classification

Because these values do not exist in any tracked source, documentation, or active configuration, they must be classified as:
**«ILLUSTRATIVE ONLY — UNRATIFIED — NOT AUTHORIZED AS AN M05 REQUIREMENT»**

These examples are historical design illustrations from Council discussions and do not represent a ratified wedge seed fixture or a normative input for M05-PLAN. Therefore, no seed dataset may be synthesized or invented during M05 planning.

To resolve this gap, we establish a strict separation between **Seed-Data Mechanics** (the runner) and **Seed-Data Content** (the actual data):

1. **Seed Mechanics:** IT-0504 will design a deterministic, idempotent seed execution script (e.g., executing SQL `INSERT INTO ... ON CONFLICT DO NOTHING`) that operates in the `infra` layer.
2. **Seed Content:** Will remain an unresolved planning dependency blocking IT-0504 task execution until an authoritative fixture source is approved by the Chair or committed to the repository.

---

### 6.3 Fixture Provenance Status

| Proposed Fixture                   | Source Evidence                                         | Provenance Status     | Permitted Use                                                             | Required Action                                              |
| :--------------------------------- | :------------------------------------------------------ | :-------------------- | :------------------------------------------------------------------------ | :----------------------------------------------------------- |
| **Brand ("Aura Labs")**            | Discussed in Council design chats.                      | **ILLUSTRATIVE ONLY** | Reference example in design docs; must not be written as production seed. | Await explicit Chair approval or commit of official fixture. |
| **Product ("Aura Smart Ring v1")** | Discussed in Council design chats.                      | **ILLUSTRATIVE ONLY** | Reference example; must not be written as production seed.                | Await explicit Chair approval or commit of official fixture. |
| **GTIN `00860000000123`**          | Discussed in Council design chats.                      | **ILLUSTRATIVE ONLY** | Reference example; must not be written as production seed.                | Await explicit Chair approval or commit of official fixture. |
| **Core Policies & Standings**      | CAW-008 describes enough tables to serve a single flow. | **UNRESOLVED**        | None. No rules exist defining specific policy definitions.                | Await explicit policy definition schema and records.         |

---

## 7. Resolution of Planning Gap D — ACV Retrieval Contract and Failure Semantics

CAW-007 and CAW-003 define the structural content of the Active Constitutional View (ACV), but the repository-retrieval contract and failure semantics remain completely undefined. This section maps out the concrete candidate options to resolve this planning gap.

### 7.1 Detailed Failure Semantic Options

We distinguish among three distinct concepts to prevent business logic from leaking into the storage layer:

1. **Registry Retrieval:** The operation of connecting, executing queries, assembling raw database rows, and mapping them into pure domain entities.
2. **Runtime Execution:** Consuming the pre-assembled ACV and validating inputs structurally.
3. **Policy Decision:** Evaluating the constitutional state to produce an authorized or denied outcome.

To prevent storage failures from silently converting into permissive or ambiguous outcomes, we outline the following candidate options:

#### 1. Identity Not Found (e.g., requested GTIN has no entry in database)

- _Option A (Typed Outcome):_ Return a typed result wrapper, e.g., `{ ok: true, value: null }`. This allows the application to handle missing data gracefully (e.g., returning a `GET /v1/resolve` `404 Not Found` response as prescribed in CAW-006).
- _Option B (Typed Error):_ Return a structured error, e.g., `RegistryError.IdentityNotFound`.
- _Recommendation:_ Return `{ ok: true, value: null }` as a standard repository lookup result. An absent record is a valid database state, not an infrastructure exception.

#### 2. Incomplete Constitutional State (e.g., Identity exists, but matching Referent or active Policy is missing)

- _Option A (Fail-Closed at Registry):_ The Registry adapter performs an inner join or verifies completeness, returning an error like `IncompleteConstitutionalState` and refusing to assemble the ACV.
- _Option B (Pass-through to Runtime):_ The Registry adapter returns whatever records are present (e.g. leaving missing relationships as empty arrays). The pipeline's structural validator (`validateExecutionRequest`) or policy engine will then naturally fail-closed at runtime.
- _Recommendation:_ Pass-through to the pipeline. The adapter should strictly query and map data; determining whether a constitutional view is "complete" for evaluation is a Runtime responsibility, not an infrastructure adapter responsibility.

#### 3. Inconsistent Relationships (e.g., circular parent relationships in referents table)

- _Option A:_ The database schema prevents circularity via tree triggers or unique constraints.
- _Option B:_ The domain mapping layer detects the cycle and returns a typed validation error.
- _Recommendation:_ Enforce validation at the domain layer during deserialization/mapping.

#### 4. Storage/Database Connection Unavailable (e.g., network timeout, connection pool exhausted)

- _Option A:_ Throw a standard runtime exception (`DatabaseConnectionException`) causing the API server to crash or return a generic `500 Internal Server Error`.
- _Option B:_ Catch and return a typed error wrapper, e.g., `{ ok: false, error: "RegistryError.StorageUnavailable" }`, ensuring the caller fail-closed with a controlled, non-leaking diagnostic.
- _Recommendation:_ Return `{ ok: false, error: "RegistryError.StorageUnavailable" }` to ensure controlled, fail-closed handling.

---

### 7.2 ACV Retrieval Specification Seam

Below is the structured catalog of semantic rules proposed as a candidate design for M05-PLAN:

```
Lookup input: A trimmed, non-empty canonical reference string (e.g., GTIN).
Successful result: { ok: true, value: ActiveConstitutionalView } containing verified domain records.
Not-found behavior: Returns { ok: true, value: null } to the calling application, triggering a 404 response.
Incomplete constitutional state: Adapter maps empty relations as empty arrays, delegating validation to @zyppi/runtime.
Inconsistent relationships: Handled during row-to-domain deserialization using pure domain validation rules.
Inactive or inapplicable records: Returned within the ACV. The runtime pipeline evaluates applicability, not the DB queries.
Standing-state treatment: Suspended or terminated standings are returned as-is inside the ACV for runtime evaluation.
Registry/storage unavailable: Returns { ok: false, error: "StorageUnavailable" }, ensuring application fails closed.
Contract form: Pure TypeScript interface (e.g. `RegistryRepository`) defined in @zyppi/domain or contracts.
Existing error/result convention: Conforms to the `ValidationResult<T, E> = { ok: true, value: T } | { ok: false, error: E }` union.
Fail-closed implication: Any query exception, connection failure, or mapping error results in immediate fail-closed state.
Version or snapshot semantics: ACV is queried at the current database wall-clock time; version tracking uses the database timestamps.
Unresolved decision: The concrete structural design of the interface and errors remains unratified pending M05-PLAN.
```

---

## 8. Decision Register

This register details every unresolved architectural decision required for Milestone M05.

### 8.1 Active M05 Decision Inventory

| Decision ID | Question                                                                       | Source-Grounded Fact                                                                                    | Why Unresolved                                                                                                                                | Decision Owner | Required Before M05-PLAN? | Consequence If Unresolved                                                                              |
| :---------- | :----------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------- | :------------- | :------------------------ | :----------------------------------------------------------------------------------------------------- |
| **M05-D01** | Where should the PostgreSQL adapter implementation reside?                     | CAW-004 defines package boundaries but does not specify database subfolders or custom db packages.      | Placing in `apps/api` is safe but mixes API route handlers with SQL adapters. A separate package requires modifying the approved package set. | **Chair**      | **Yes**                   | Blocks physical folder creation and dependency mapping during planning.                                |
| **M05-D02** | Which PostgreSQL driver/client should be integrated?                           | CAW-008 mandates PostgreSQL but does not select a driver. The repository currently has zero DB drivers. | Technology selection was deferred to avoid premature dependency lock-in.                                                                      | **Chair**      | **Yes**                   | Blocks the execution of `pnpm install` and driver setup in M05-PLAN.                                   |
| **M05-D03** | Should a query builder (e.g. Kysely), an ORM, or raw SQL be utilized?          | CEngS-001 forbids leakage of SQL into pure layers. No query tool is pre-approved.                       | Deferred to evaluate balance of TypeScript type safety against dependency bloating.                                                           | **Chair**      | **Yes**                   | Blocks write patterns and row-mapping implementation design.                                           |
| **M05-D04** | Which migration framework and execution model should be adopted?               | CEngS-102 §10 requires reversible, tested, and sequential migrations.                                   | Tooling has not been installed; no configuration exists.                                                                                      | **Chair**      | **Yes**                   | Blocks schema definition file layout and validation script planning.                                   |
| **M05-D05** | What is the authoritative seed fixture data?                                   | "Aura Labs" and GTIN "00860000000123" do not exist in the codebase or ratified documents.               | No approved product, brand, manufacturer, policy, or standing records have been committed.                                                    | **Chair**      | **No** (Deferred)         | IT-0504 (Seed Data) cannot complete without this, but M05-PLAN can define seed _mechanics_ beforehand. |
| **M05-D06** | What are the typed error and result signatures for the ACV retrieval contract? | CAW-007 defines ACV fields but is silent on retrieval failures, timeouts, and missing records.          | No repository interfaces have been defined yet.                                                                                               | **Chair**      | **Yes**                   | Blocks the definition of TypeScript signatures in IT-0502 and IT-0503.                                 |

---

### 8.2 Decision Classification and Ownership

To guarantee a structured resolution path, the six decisions are classified into three distinct tiers:

1. **Chair Decisions Required Before M05-PLAN:**
   - **M05-D01** (Adapter Placement), **M05-D02** (PG Driver), **M05-D03** (Query Layer), **M05-D04** (Migration Framework), and **M05-D06** (ACV Retrieval Semantics).
   - _Justification:_ These decisions materially dictate monorepo dependencies, package boundaries, file structures, and compile-time TypeScript interfaces. They must be resolved before M05-PLAN can be written.
2. **Planning Resolutions Required During M05-PLAN:**
   - Specific folder hierarchies, naming schemas, helper functions, and local test setups.
   - _Justification:_ These represent standard engineering details resolved during the drafting of M05-PLAN itself.
3. **Deferred Implementation Decisions:**
   - **M05-D05** (Seed-Data Content).
   - _Justification:_ Because the official wedge fixture is not yet committed to the corpus, seed-data _content_ is deferred. The M05-PLAN will detail seed-data _mechanics_ (the schema insertions), but executing the task is blocked until the fixture is approved.

---

## 9. Risks and Constraints

This section evaluates the structural risks associated with introducing database infrastructure into the monorepo.

| Risk / Constraint                                          | Source or Repository Basis               | Potential M05 Impact                                                                                      | Required Mitigation or Decision                                                                                                       |
| :--------------------------------------------------------- | :--------------------------------------- | :-------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| **1. Database Leak into Runtime**                          | CEngS-002 §4 (Boundary Purity).          | Impure DB dependencies or SQL utilities are accidentally imported into `@zyppi/runtime`.                  | Enforce strict AST validation (`pnpm runtime:purity`) to block all PG-related imports.                                                |
| **2. Storage-Generated Fields Redefining Truth**           | CAW-008 Schema Specs vs. CAW-003 Domain. | Database `DEFAULT` values, auto-increment IDs, or DB-triggers override domain validation rules.           | The Adapter must perform row-to-domain mapping. The database must accept raw UUIDs generated in the pure domain layer.                |
| **3. Infrastructure-Coupled Interfaces**                   | CEngS-001 §4 (Replay Immutability).      | Repository interfaces expose driver-specific classes (e.g. `pg.Pool` or `QueryBuilder` types).            | Interfaces must utilize standard, pure TypeScript types (e.g. primitive strings, arrays, domain types) and return `ValidationResult`. |
| **4. Adapter Placement Boundary Violations**               | CAW-004 Workspace Import Table.          | Creating a database package introduces circular dependencies or bypasses approved routes.                 | Restrict adapter implementation within `apps/api/src/adapters/` unless a dedicated package is approved.                               |
| **5. Migration Tooling Hidden Behavior**                   | CEngS-102 §10 (Reversible Migrations).   | ORMs silently execute destructive DDL commands, causing untracked changes in schema.                      | Utilize pure SQL files inside `infra/migrations/` and track execution via an auditable `schema_migrations` table.                     |
| **6. Unratified Seed Data as Pseudo-Truth**                | Missing terms in codebase ("Aura Labs"). | Fabricated test data is treated as normative validation criteria, causing downstream integration failure. | Formally classify demo data as illustrative. Implement seed-data mechanics to parse dynamic JSON inputs.                              |
| **7. ACV Retrieval State Synthesis**                       | CAW-007 (ACV Scope).                     | Adapter silently generates default/mock values when database state is missing, masking bad state.         | Enforce a strict "Pass-through" or "Fail-Closed" rule. The adapter must query what is in DB, never synthesize missing tables.         |
| **8. Storage Failures Converted into Permissive Outcomes** | CAW-006 (API Resolution Contracts).      | DB connection loss results in resolving unverified requests due to unhandled exceptions.                  | Standardize typed `{ ok: false, error: "StorageUnavailable" }` errors that fail-closed to an API error response.                      |
| **9. Premature Implementation of Future Milestones**       | CAW-011 (Build Order).                   | M05 attempts to implement R2 storage (M07), digital link resolution (M06), or API routes (M09).           | Strictly limit schema tables to those listed in CAW-008. Refuse to write API endpoints or routing logic during M05.                   |
| **10. Source-Corpus Duplication and Citation Drift**       | CAW-Series (V1.0 vs V2.0 Roadmaps).      | Divergent schema fields are designed in implementation that conflict with CAW-008.                        | Ground all database field names directly in the literal keys defined in CAW-008.                                                      |

---

## 10. M05 Scope and Non-Goal Boundary

To prevent scope creep, this section delineates the strict boundary of Milestone M05.

### 10.1 M05 Responsibility (In-Scope Goals)

- **IT-0501 (PostgreSQL Schema):** Authoring plain DDL files (e.g. `schema.sql`) inside `infra/` defining the tables specified in CAW-008.
- **IT-0502 (Repository Contracts):** Defining abstract TypeScript interfaces for loading and saving ACV and Receipts.
- **IT-0503 (Registry Adapter):** Developing the concrete database queries and row-to-domain mapping.
- **IT-0504 (Seed Data Mechanics):** Implementing an idempotent runner to load seed fixtures.
- **IT-0505 (Migration Execution):** Establishing a sequential, reversible, and trackable migration execution flow.

### 10.2 Non-Goals (Deferred or Out-of-Scope)

- **R2 Object Storage & File Uploads (Milestone M07):** Storing evidence PDF or media files in R2 is completely out of scope. M05-PREP database fields will store only string `storage_ref` values (R2 keys) as scalar text.
- **GS1 digital Link Parsing and Resolution (Milestone M06):** Mapping Digital Link URLs to GTINs or parsing GS1 sub-elements. M05 will perform direct database lookups using plain strings.
- **REST Routing & API Endpoints (Milestone M09):** Defining Fastify endpoints like `GET /v1/resolve` or JSON validators. `apps/api` remains an empty entry point.
- **Runtime Pipeline & Policy Orchestration (Milestone M08):** Wiring the database loader into the `pipeline.ts` executor. This is deferred until M08.
- **Edge Routing & Workers (Milestone M10):** Cloudflare Worker routing and edge caching are completely out of scope.

---

## 11. M05-PLAN Readiness Verdict

The final planning-readiness assessment of Milestone M05 is established:

### **VERDICT:** `B. READY FOR M05-PLAN AFTER NAMED CHAIR DECISIONS`

### Justification:

- All four planning gaps (A, B, C, D) have been exhaustively investigated, and their solutions have been mapped to specific technical candidate options.
- The repository baseline is fully clean and compilable, confirming that the current topology successfully supports M05 implementation once the target boundaries are resolved.
- The remaining planning blockers are narrow, clearly defined, and require explicit Chair-level decisions to establish monorepo package dependencies, driver selections, and database placement.
- No source conflicts or repository blocks exist that would require a second reconnaissance phase. Once the named Chair decisions are resolved, drafting the concrete `M05-PLAN` can begin immediately.

---

## 12. Chair Decisions Required

To unblock the creation of `M05-PLAN`, the following five decisions must be ratified by the Chair:

1. **M05-D01 (Adapter Placement):** Where should the PostgreSQL repository adapter source files live?
   - _Options:_ Inline in `apps/api/src/adapters/` (Recommended) OR in a new workspace package like `packages/registry-postgres` (requires authorizing an exception to CAW-004 package boundaries).
2. **M05-D02 (PostgreSQL Driver):** Which client driver package should be added?
   - _Options:_ `postgres.js` (Recommended for pure ESM) OR `pg` (node-postgres).
3. **M05-D03 (Query & ORM Layer):** Which database mapping/query layer should be utilized?
   - _Options:_ Raw SQL templates (Recommended for auditability and determinism) OR Kysely OR Drizzle ORM.
4. **M05-D04 (Migration Tooling):** What migration tracking framework and runner should be utilized?
   - _Options:_ Minimal custom JS runner parsing `.sql` files in `infra/migrations/` (Recommended for lightweight CI verification) OR Drizzle Kit OR db-migrate.
5. **M05-D06 (ACV Retrieval Failure Semantics):** What is the required signature and outcome mapping for ACV lookups?
   - _Options:_ Return `{ ok: true, value: null }` for missing entries and `{ ok: false, error: "StorageUnavailable" }` for database pool timeouts (Recommended) OR throw raw exceptions.

---

## 13. Provenance Classification

To preserve architectural integrity, every material claim in this report has been classified according to its grounding basis:

### 13.1 Source-Derived Claims

- **Claim:** Tables must include identities, referents, evidence, policies, authorities/capabilities/standings, and execution_receipts.
  - _Source:_ `DOCS/CAW/CAW-008-Registry-Schema.md`, Section "Tables".
- **Claim:** Tables `execution_receipts` and `evidence` must be append-only and insert-only (no update/delete grants).
  - _Source:_ `DOCS/CAW/CAW-008-Registry-Schema.md`, Section "Constraints".
- **Claim:** `@zyppi/runtime` must be 100% pure-deterministic and free of I/O.
  - _Source:_ `DOCS/CEngS-v2/CEngS-001-Engineering-Constitution.md`, Section 4 "Determinism and Isolation".
- **Claim:** M03 is complete and M05 is authorized to depend on M03.
  - _Source:_ `DOCS/CAW/CAW-011-Build-Order.md`, Milestone M05 Table and `DOCS/CAW/AMS/M03-Closure-Report.md`.

### 13.2 Repository-Observed Claims

- **Claim:** There are currently zero database dependencies or database-related directories under `infra/`.
  - _Basis:_ Factual search of root and package manifests; physical tree exploration of `infra/`.
- **Claim:** The illustrative Aura Smart Ring dataset does not exist in any file.
  - _Basis:_ Monorepo-wide case-insensitive recursive string search.
- **Claim:** The current workspace compiles cleanly and passes format, lint, tsc, and vitest testing.
  - _Basis:_ Successful execution of baseline commands.

### 13.3 Recommendations (Proposed Architecture only)

- **Claim:** PostgreSQL adapter should reside inline under `apps/api/src/adapters/` to respect the active CAW-004 workspace boundary.
- **Claim:** The query layer should use `postgres.js` and raw SQL or Kysely to avoid complex Prisma build artifacts.
- **Claim:** ACV lookups should map missing records as `{ ok: true, value: null }` and connection timeouts as `{ ok: false, error: "StorageUnavailable" }` to guarantee clean, fail-closed handling.

### 13.4 Chair Decisions Required

- **Claim:** The five decisions (M05-D01, M05-D02, M05-D03, M05-D04, M05-D06) cannot be derived from the source corpus or repository facts. They require explicit, external Chair authorization to unblock M05 planning.

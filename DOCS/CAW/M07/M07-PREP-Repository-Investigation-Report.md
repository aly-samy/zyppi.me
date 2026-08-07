# M07-PREP Repository Investigation Report

## 1. Executive Summary

This report presents a strictly factual repository readiness assessment performed on the Zyppi repository as of August 7, 2026. The mandate of this investigation (Mandate ID: `M07-PREP-INV-001`) is strictly read-only and evidentiary. No evaluation, design recommendations, compliance grading, or constitutional interpretations have been performed. All findings are derived directly from observable file paths, package structures, code comments, database definitions, and test runs.

### Core Metrics Summary

- **Verification Baseline Run**: `pnpm exec vitest run --fileParallelism=false` succeeded with **27/27 test files passed** and **564/564 individual tests passed**.
- **Evidence Domain State**: The baseline representation of an `EvidenceRecord` metadata-only model exists in the domain library (`packages/domain`). However, the components required to resolve, fetch, verify, or ingest raw evidence payloads are absent.
- **Repository Health**: The repository builds cleanly with `pnpm build` (ESM target), and custom validation suites (such as the Static Runtime Purity Validator) run cleanly. The dependency graph validator fails due to a self-import cycle in `packages/domain` benchmark files.

---

## 2. Repository Inventory

The Zyppi workspace is configured as a private pnpm monorepo containing nine workspace projects. Below is the factual inventory of the repository packages relevant to the Evidence domain:

| Package Name            | Layer Metadata | Directory Location   | Documented Purpose                                               | Exported Entrance / Files                                  |
| :---------------------- | :------------- | :------------------- | :--------------------------------------------------------------- | :--------------------------------------------------------- |
| `zyppi-monorepo` (Root) | N/A            | `/`                  | Root monorepo orchestrating tasks.                               | `package.json`, `vitest.config.ts`, `pnpm-workspace.yaml`  |
| `@zyppi/domain`         | `foundation`   | `packages/domain`    | Implements domain models, validators, and serialization formats. | `dist/index.js`, `dist/index.d.ts`, `src/index.ts`         |
| `@zyppi/contracts`      | `contracts`    | `packages/contracts` | Stable, infrastructure-neutral interfaces and boundaries.        | `dist/index.js`, `dist/index.d.ts`, `src/index.ts`         |
| `@zyppi/runtime`        | `runtime`      | `packages/runtime`   | Implements the pure-deterministic execution pipeline.            | `dist/index.js`, `dist/index.d.ts`, `src/index.ts` (Empty) |
| `@zyppi/shared`         | `foundation`   | `packages/shared`    | Leaf library for shared helpers.                                 | `dist/index.js`, `dist/index.d.ts`, `src/index.ts` (Empty) |
| `@zyppi/testing`        | `testing`      | `packages/testing`   | Contains replay testing & offline validation.                    | `dist/index.js`, `dist/index.d.ts`, `src/index.ts`         |
| `@zyppi/infra`          | N/A            | `infra`              | Custom schema migration CLI and runner.                          | `dist/cli.js`, `src/cli.ts`                                |
| `@zyppi/api`            | N/A            | `apps/api`           | API backend implementing concrete database mappers & seeding.    | `src/main.ts` (Empty)                                      |
| `@zyppi/web`            | N/A            | `apps/web`           | Independent front-end workspace.                                 | `src/main.ts` (Empty)                                      |

---

## 3. Findings by Investigation Section

### Section A — Evidence Domain

The Evidence domain's core representation is restricted to a **metadata-only** record. It does not handle actual binary payloads or files.

- **File Location**:
  - Source: `packages/domain/src/index.ts`
  - Tests: `packages/domain/src/evidence.test.ts`
  - Output Artifacts: `packages/domain/dist/index.js`, `packages/domain/dist/index.d.ts`
- **Exported Types & Interfaces**:
  - `EvidenceRecord`: Represents a metadata reference.
    ```typescript
    export type EvidenceRecord = {
      readonly evidenceId: string;
      readonly identityId: string;
      readonly evidenceType: string;
      readonly hash: string;
      readonly storageRef: string;
      readonly retrievedAt: string;
    };
    ```
  - `EvidenceValidationErrorCode`: Discriminated union of error codes (`"INVALID_EVIDENCE_ID" | "INVALID_IDENTITY_ID" | "INVALID_EVIDENCE_TYPE" | "INVALID_HASH" | "INVALID_STORAGE_REF" | "INVALID_RETRIEVED_AT"`).
  - `EvidenceValidationError`: Container for validation failures.
- **Exported Functions**:
  - `validateEvidenceRecord(input: unknown): ValidationResult<EvidenceRecord, EvidenceValidationError>`
  - `serializeEvidenceRecord(record: EvidenceRecord): string`
- **Schemas**: No raw schema validation files (such as JSON Schema or Zod) exist inside the packages. Schema enforcement is handled purely deterministically via custom TypeScript parsing functions inside `packages/domain/src/index.ts`.
- **Validators**: The function `validateEvidenceRecord` enforces strict UTC ISO-8601 calendar-level correctness (supporting leap years) and rejects non-string types, empty, or whitespace-only strings.
- **Documentation**:
  - `DOCS/CAW/AMS/AMS-0303-Evidence-Model-Implementation-Notes.md` (Implementation details).
- **Tests**: `packages/domain/src/evidence.test.ts` contains 16 assertions checking formatting, UTC leap years, empty strings, opaque string preservation, deterministic alphabetical serialization, and compile-time immutability.

---

### Section B — Evidence Bundle Model

The codebase contains a structural model for the `EvidenceBundle`, but lacks any runtime resolution or processing capabilities.

- **Location**: `packages/domain/src/index.ts` (and corresponding build outputs).
- **Public API / Data Structure**:
  - `EvidenceBundle` is exported as:
    ```typescript
    export interface EvidenceBundle {
      readonly evidenceRecords: readonly EvidenceRecord[];
    }
    ```
- **Relationships to Other Domain Objects**:
  - Contains a `readonly` array of `EvidenceRecord` items.
  - Linked to `ExecutionRequest` as a top-level property.
- **Serialization Formats**:
  - The `EvidenceBundle` itself has no standalone serialization function, but is serialized canonically as a child of `ExecutionRequest` inside `serializeExecutionRequest`. Key ordering for the bundle serializes as `{"evidenceRecords": [...]}` where each item is ordered alphabetically by properties.
- **Referenced Contracts**: No specific repository ports or interfaces referencing `EvidenceBundle` are declared.

---

### Section C — Evidence Reference Resolution

Components or drivers to resolve actual evidence records from references are **absent** from the contracts layer.

- **Interfaces**: None found.
- **Implementations**: None found.
- **Repository Adapters**: None found.
- **Lookup Mechanisms**: None found.
- **Exported APIs**: None found.
- **Dependency Graph**: No dependency on any external HTTP or object storage resolution client exists in `@zyppi/domain` or `@zyppi/contracts`.
- _Factual Summary_: No components for resolving evidence references exist in the current codebase.

---

### Section D — Registry Capabilities Used By Evidence

The PostgreSQL database schema includes a fast lookup mechanism to retrieve metadata references for Evidence.

- **Retrieval Interfaces & Repository Contracts**:
  - The interface `RegistryRepository` in `packages/contracts/src/registry.ts` defines standard lookup methods, but does not explicitly name an evidence retrieval method. It returns `RetrievedRegistryState` which has an unresolved graph representation `ActiveConstitutionalView`.
- **Immutable Read Interfaces**: `ActiveConstitutionalView` in `packages/domain/src/index.ts` defines `evidenceReferences` as a `readonly` array of `EvidenceRecord` items.
- **Adapters**: `PostgresRegistryRepository` in `apps/api/src/registry/postgres-registry-repository.ts` reads from the `evidence` table using `postgres.js`:
  ```typescript
  const evidenceRows = await tx<EvidenceRow[]>`
    SELECT id, identity_id, evidence_type, hash, storage_ref, retrieved_at, created_at
    FROM evidence
    WHERE identity_id = ${identityId}
  `;
  ```
- **Storage Abstractions**: Handled by custom mappers in `apps/api/src/registry/mappers.ts` via `mapEvidenceRow(row: EvidenceRow): EvidenceRecord`.
- **Exported Methods**: `mapEvidenceRow` is exported in `apps/api/src/registry/index.ts`.

---

### Section E — Cryptographic Infrastructure

The codebase features a custom canonicalization scheme and standard Node.js cryptographic bindings, but lacks high-level evidence-focused signature libraries.

- **SHA-256 / Hashing Utilities**:
  - Core Node.js `crypto` is used.
  - Location: `infra/src/runner.ts`, `packages/testing/src/replay/canonicalComparison.ts`, and `apps/api/src/registry/seed/seed-integrity.ts`.
  - Exported API: Handled using `crypto.createHash("sha256").update(data).digest("hex")`.
- **Canonical Serialization**:
  - Location: `packages/domain/src/seed-helpers.ts`.
  - Exported API: `canonicalizeJcs(value: unknown): string`. Fully implements RFC 8785 JSON Canonicalization Scheme (JCS).
- **Integrity Verification / Checksum Utilities**:
  - Location: `apps/api/src/registry/seed/seed-integrity.ts`.
  - Exported API: `verifySeedIntegrity(manifest: SeedManifest): RegistryResult<void>`.
  - Performs checksum matching by sorting manifest records and validating their JCS hashes against `manifest.integrityDigest`.

---

### Section F — Storage Infrastructure

Concrete object storage integration, R2 drivers, or binary blob retrieval abstractions are **absent**.

- **Object Storage / R2 Support**: None found.
- **Blob Storage / Binary Assets**: None found.
- **Evidence Storage & Retrieval Clients**: None found.
- **Contracts**: None found.
- _Factual Summary_: The repository contains no R2 client libraries, Cloudflare bindings, or storage-resolution contracts. Storage references (`r2://...`) are handled exclusively as opaque metadata strings.

---

### Section G — Existing Evidence Tests

Evidence testing is localized to structural domain validations and transactional schema migration rules.

- **File**: `packages/domain/src/evidence.test.ts`
  - **Test Suite**: `EvidenceRecord Domain Model`
  - **Purpose**: Asserts strict calendar validations for UTC retrieved-at timestamps, whitespace restrictions, string preservation, deterministic serialization, and compile-time readonly enforcement.
- **File**: `packages/domain/src/executionRequest.test.ts`
  - **Test Suite**: `ExecutionRequest Domain Model`
  - **Purpose**: Validates that an `ExecutionRequest` structurally embeds a valid `EvidenceBundle` and fails validation if missing or corrupted.
- **File**: `apps/api/src/registry/postgres-registry.integration.test.ts`
  - **Test Suite**: `PostgreSQL Registry Adapter Integration Tests — IT-0503`
  - **Purpose**: Asserts that `mapEvidenceRow` translates database rows correctly and that invalid rows trigger validation failures.
- **File**: `infra/src/test/schema.test.ts`
  - **Test Suite**: `PostgreSQL Registry Schema Verification — AMS-0501`
  - **Purpose**: Verifies that the physical `evidence` table enforces transactional constraints (such as append-only restrictions blocking `UPDATE` and `DELETE` via database triggers).

---

### Section H — Existing Runtime Dependencies

The pure execution pipeline structurally includes `EvidenceRecord` fields inside its diagnostic structures but executes no behavior on them.

- **Dependency Direction**: `packages/runtime` imports types from `@zyppi/domain`.
- **Imported Symbols**: `ExecutionContext`, `PolicyContext`, `validateExecutionRequest`, `ExecutionRequest` from `@zyppi/domain`.
- **Exported Symbols**: None (the public entrypoint `packages/runtime/src/index.ts` contains `export {};`).
- **Package Relationships**: `@zyppi/runtime` depends on `@zyppi/domain` and `@zyppi/shared` under the `workspace:*` protocol.
- _Factual Summary_: The runtime pipeline defaults to failing-closed. While it receives an `ExecutionRequest` which contains an `EvidenceBundle`, it performs no custom operations, resolution, or evaluation on the evidence records.

---

### Section I — Existing Interpretation Dependencies

- _Factual Summary_: No components or directory references matching "Interpretation" or "M06 Interpretation" exist in the repository. No interpretation dependencies were found.

---

### Section J — Existing API Dependencies

The API layer references evidence records purely for the purpose of seeding initial demo configurations and mapping database rows.

- **File**: `apps/api/src/registry/seed/postgres-registry-seeder.ts`
  - Imports: `validateEvidenceRecord` from `@zyppi/domain`.
  - Behavior: Maps and inserts initial `EvidenceRecord` seed records into the transactional database sequentially.
- **File**: `apps/api/src/registry/postgres-registry-repository.ts`
  - Imports: `mapEvidenceRow` from `apps/api/src/registry/mappers.ts`.
  - Behavior: Maps SQL `EvidenceRow` entries directly to domain-validated `EvidenceRecord` models.

---

### Section K — Repository Structure

Below is a factual inventory of directories and packages in the repository:

- **`packages/domain`** (`@zyppi/domain`): Core foundation layer defining `EvidenceRecord`, `validateEvidenceRecord`, `canonicalizeJcs`, and general validation types.
- **`packages/contracts`** (`@zyppi/contracts`): Neutral interface layer defining the `RegistryRepository` boundaries and resolver types.
- **`packages/runtime`** (`@zyppi/runtime`): Engine modeling the execution trace.
- **`packages/testing`** (`@zyppi/testing`): Replay framework validating replay determinism offline.
- **`infra`** (`@zyppi/infra`): Custom schema-ledger CLI tool and database migrations.
- **`apps/api`** (`@zyppi/api`): Backend application providing repositories and seeder implementations.

---

### Section L — Existing Documentation

Factual summary of documentation containing keywords relevant to Evidence:

1. **`DOCS/CAW/CAW-009-Evidence-Model.md`**:
   - _Summary_: Explains the architectural division of evidence. Fast-lookup metadata is stored in the PostgreSQL `evidence` table, and actual raw binary blobs are stored in Cloudflare R2 (addressed deterministically by hash).
2. **`DOCS/CAW/AMS/AMS-0303-Evidence-Model-Implementation-Notes.md`**:
   - _Summary_: Documents that hash generation, key resolution, and binary payload fetches are completely deferred to M07. Confirms that `hash` and `storageRef` are treated as opaque strings in the foundation layer.
3. **`DOCS/CAW/CAW-008-Registry-Schema.md`**:
   - _Summary_: Defines table fields, types, and primary-key indexes for the `evidence` database ledger.

---

## 4. File References

The following files explicitly define, use, map, seed, or test Evidence:

- `packages/domain/src/index.ts` (Domain models, types, and validators)
- `packages/domain/src/evidence.test.ts` (Domain-level validations and serialization tests)
- `packages/domain/src/seed-helpers.ts` (JCS Canonicalizer and Equivalence assertions)
- `infra/migrations/001_initial_registry_schema.sql` (Creates the append-only `evidence` table)
- `apps/api/src/registry/rows.ts` (Defines `EvidenceRow`)
- `apps/api/src/registry/mappers.ts` (Defines `mapEvidenceRow`)
- `apps/api/src/registry/postgres-registry-repository.ts` (Implements PG fetch for evidence rows)
- `apps/api/src/registry/seed/postgres-registry-seeder.ts` (Topological seed script mapping `evidence` collection)

---

## 5. Public APIs Found

Below are the exact public exports found in the repository related to Evidence:

### `packages/domain` (from `packages/domain/src/index.ts`)

- `type EvidenceRecord`: Deeply immutable metadata representation.
- `type EvidenceValidationErrorCode`: Union of 6 exact validation failure codes.
- `type EvidenceValidationError`: Typed validation failure container.
- `function validateEvidenceRecord(input: unknown): ValidationResult<EvidenceRecord, EvidenceValidationError>`: Synchronous, pure validator.
- `function serializeEvidenceRecord(record: EvidenceRecord): string`: Deterministic JSON stringifier using alphabetical key ordering.
- `interface EvidenceBundle`: Holds a collection of evidence records.
- `function canonicalizeJcs(value: unknown): string`: Pure RFC 8785 implementation.

### `apps/api` (from `apps/api/src/registry/index.ts`)

- `function mapEvidenceRow(row: EvidenceRow): EvidenceRecord`: DB-row-to-domain mapper.

---

## 6. Dependency Inventory

The following factual dependencies exist in the repository relative to `@zyppi/domain`:

```
@zyppi/contracts (DevDependency) -> @zyppi/domain (Workspace Link)
@zyppi/runtime (Dependency)    -> @zyppi/domain (Workspace Link)
@zyppi/testing (DevDependency) -> @zyppi/domain (Workspace Link)
@zyppi/infra (DevDependency)   -> @zyppi/domain (Workspace Link)
@zyppi/api (Dependency)        -> @zyppi/domain (Workspace Link)
```

No external cryptographic libraries or file storage APIs are referenced in production `dependencies` files.

---

## 7. Tests Found

### Domain Verification (Vitest)

- **`packages/domain/src/evidence.test.ts`**:
  - `accepts a well-formed input`: Asserts parsing success on valid configurations.
  - `rejects non-object inputs`: Ensures primitive bounds checking.
  - `rejects empty or whitespace-only evidenceId`: Asserts structural string constraints.
  - `rejects invalid or non-UTC ISO-8601 retrievedAt`: Asserts UTC strictness.
  - `serializes deterministically in exact alphabetical key order`: Confirms `serializeEvidenceRecord` outputs properties alphabetically.
- **`packages/domain/src/executionRequest.test.ts`**:
  - `rejects invalid evidenceBundle structure or sub-elements`: Confirms request validation fails on corrupt bundles.

### Physical Constraints (Integration / Migration)

- **`infra/src/test/schema.test.ts`**:
  - `evidence table rejects UPDATE and DELETE`: Verifies database triggers prevent mutation of existing records.

---

## 8. Documentation Found

- `DOCS/CAW/CAW-009-Evidence-Model.md` (Metadata and R2 split blueprint).
- `DOCS/CAW/AMS/AMS-0303-Evidence-Model-Implementation-Notes.md` (Opaque bounds and deferred behaviors).
- `DOCS/CAW/CAW-008-Registry-Schema.md` (SQL representation parameters).

---

## 9. Observable Gaps

The following expected M07 components were investigated and identified as **absent / Not Found** in the current repository:

1. **Evidence Reference Resolver (IT-0702)**: No interfaces, classes, or lookup handlers to resolve references are implemented.
2. **Hash Verification Module (IT-0703)**: No cryptographic functions exist to perform matching or validation of actual evidence assets against metadata hash pointers.
3. **Cloudflare R2 Object Storage Integration (IT-0704)**: No R2 client, bindings, storage configurations, or Cloudflare worker integrations exist.
4. **Binary Assets / Payloads Handling**: No binary parser or payload handling logic is declared.
5. **Dynamic Evidence Retrieval Pipeline**: The Runtime pipeline passes evidence records unmodified and performs no retrieval logic.

---

## 10. Verification & CI Appendix

This section contains complete evidence of the baseline check, database health, migration verification, and final working tree status.

### Execution Command

The canonical verification suite was executed using:
`pnpm exec vitest run --fileParallelism=false`

### Environment Specifications

- **Node.js**: `v22.22.1`
- **pnpm**: `10.30.3`
- **PostgreSQL**: `PostgreSQL 16.3 on x86_64-pc-linux-musl, compiled by gcc (Alpine 13.2.1_git20240309) 13.2.1 20240309, 64-bit` (Docker Container `pg16`)

### Database Initialization & Migration Verification

Schema migrations were applied successfully. `pnpm db:status` outputted:

```
Database is up-to-date.
```

### Test Run Execution Summary

```
 RUN  v4.1.10 /app

 ✓ infra/src/test/migration.test.ts (15 tests) (1328ms)
 ✓ apps/api/src/registry/postgres-registry.integration.test.ts (8 tests) (526ms)
 ✓ apps/api/src/registry/seed/seed.test.ts (10 tests) (510ms)
 ✓ infra/src/test/schema.test.ts (9 tests) (211ms)
 ✓ tools/verify-dependency-graph.test.ts (10 tests) (126ms)
 ✓ tools/runtime-purity/validate-runtime-purity.test.ts (43 tests) (68ms)
 ✓ packages/domain/src/executionReceipt.test.ts (75 tests) (34ms)
 ✓ packages/runtime/src/pipeline.test.ts (31 tests) (34ms)
 ✓ packages/testing/src/replay/replay.test.ts (2 tests) (30ms)
 ✓ packages/testing/src/m03Closure.test.ts (31 tests) (28ms)
 ✓ packages/domain/src/gs1Parser.test.ts (30 tests) (25ms)
 ✓ packages/domain/src/policy.test.ts (55 tests) (23ms)
 ✓ packages/domain/src/gs1Validator.test.ts (22 tests) (20ms)
 ✓ packages/domain/src/executionRequest.test.ts (14 tests) (17ms)
 ✓ packages/domain/src/referent.test.ts (30 tests) (20ms)
 ✓ packages/contracts/src/gs1Resolver.test.ts (13 tests) (17ms)
 ✓ packages/domain/src/standing.test.ts (22 tests) (16ms)
 ✓ packages/domain/src/capability.test.ts (18 tests) (15ms)
 ✓ packages/domain/src/executionContext.test.ts (28 tests) (15ms)
 ✓ packages/domain/src/authority.test.ts (17 tests) (14ms)
 ✓ packages/domain/src/outcome.test.ts (11 tests) (14ms)
 ✓ packages/domain/src/evidence.test.ts (16 tests) (13ms)
 ✓ packages/domain/src/gs1Normalizer.test.ts (16 tests) (14ms)
 ✓ packages/domain/src/index.test.ts (12 tests) (12ms)
 ✓ packages/domain/src/seed-helpers.test.ts (15 tests) (13ms)
 ✓ packages/contracts/src/registry.test.ts (10 tests) (12ms)
 ✓ packages/runtime/src/bootstrap.test.ts (1 test) (5ms)

 Test Files  27 passed (27)
      Tests  564 passed (564)
   Start at  01:13:57
   Duration  11.26s
```

### Static Purity Check Summary

`pnpm runtime:purity` succeeded:

```
Zyppi Static Runtime Purity & Determinism Validator: PASS
```

### Package Boundary Verification

`pnpm boundary:all` executed cleanly across `@zyppi/domain`, `@zyppi/shared`, `@zyppi/contracts`, `@zyppi/runtime`, and `@zyppi/testing`.

### Final Working Tree Status

A dry-run git check shows no uncommitted code changes other than the expected addition of this investigation report.

---

## 11. Appendix: Complete Reference File List

The following files represent the complete evidentiary codebase footprint reviewed for this report:

1. `packages/domain/src/index.ts`
2. `packages/domain/src/evidence.test.ts`
3. `packages/domain/src/executionRequest.test.ts`
4. `packages/domain/src/seed-helpers.ts`
5. `packages/contracts/src/registry.ts`
6. `packages/runtime/src/pipeline.ts`
7. `apps/api/src/registry/mappers.ts`
8. `apps/api/src/registry/postgres-registry-repository.ts`
9. `apps/api/src/registry/seed/postgres-registry-seeder.ts`
10. `infra/migrations/001_initial_registry_schema.sql`
11. `infra/src/test/schema.test.ts`
12. `DOCS/CAW/CAW-009-Evidence-Model.md`
13. `DOCS/CAW/AMS/AMS-0303-Evidence-Model-Implementation-Notes.md`
14. `DOCS/CAW/CAW-008-Registry-Schema.md`

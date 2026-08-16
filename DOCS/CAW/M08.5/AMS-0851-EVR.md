# AMS-0851 — Profile Architecture Semantic & Boundary Closure Preparation

## Evidence Verification Report (EVR)

**Program:** CAW-011 — Commerce Atlas Wedge
**Milestone:** M08.5 — Z-PROF Profile Architecture
**Mandate:** AMS-0851
**Status:** MATERIALIZED
**Implementation Authority:** NONE beyond authorized reconnaissance and EVR materialization
**Assigned Agent:** Jules — AI Software Engineer
**Mandate Type:** Repository reconnaissance, boundary mapping, and evidence materialization
**Primary Deliverable:** `DOCS/CAW/M08.5/AMS-0851-EVR.md`

---

## 1. Mission and Scope

### 1.1 Purpose

The purpose of AMS-0851 is **cartography before construction**. It establishes a precise, auditable, repository-level map of existing structures across all system layers that Milestone M08.5 (Z-PROF Profile Architecture) will eventually interact with or build upon.

### 1.2 Principles and Governance Boundary

Per the binding mandate and Council clarification:

- **Map what exists. Identify what is missing. Identify what is coupled. Preserve what must remain stable. Do not construct what has not been authorized.**
- AMS-0851 introduces **zero production code changes**, zero new runtime or domain semantics, zero contract modifications, zero mock interfaces, and zero placeholder production abstractions.
- Semantic authority resides solely with the Constitutional Council. Any semantic ambiguity, unratified construct, or unassigned boundary ownership encountered during reconnaissance is recorded strictly as **`UNRESOLVED — COUNCIL DECISION REQUIRED`**.

---

## 2. Repository Baseline

### 2.1 Git Baseline Details

- **Baseline HEAD SHA:** `d2a676917a76c1dd8fcd4bfa27d29a755717798d`
- **Working Branch:** `jules-13401536226888107624-96aec8dc`
- **Pre-execution Working Tree State:** Clean (`git status --short` returned empty).

### 2.2 Workspace Package Baseline

The monorepo workspace comprises 9 packages/applications defined in `pnpm-workspace.yaml`:

- `packages/domain` (`@zyppi/domain`)
- `packages/contracts` (`@zyppi/contracts`)
- `packages/runtime` (`@zyppi/runtime`)
- `packages/testing` (`@zyppi/testing`)
- `packages/shared` (`@zyppi/shared`)
- `apps/api` (`@zyppi/api`)
- `apps/web` (`@zyppi/web`)
- `infra` (`@zyppi/infra`)
- Root workspace (`zyppi-monorepo`)

---

## 3. Registry Map

- **Location:** `infra/migrations/001_initial_registry_schema.sql`, `apps/api/src/registry/`, `packages/contracts/src/registry.ts`.
- **Entities & Schema:** Defines 8 constitutional tables in PostgreSQL: `referents`, `identities`, `evidence`, `policies`, `authorities`, `capabilities`, `standings`, `execution_receipts`.
- **Interfaces & Adapters:** `RegistryRepository` interface (`packages/contracts/src/registry.ts`) implemented by `PostgresRegistryRepository` (`apps/api/src/registry/postgres-registry-repository.ts`) and `FrozenRegistryRepository` (`packages/testing/src/replay/replaySnapshot.ts`).
- **Retrieval & Resolution Mechanics:** `PostgresRegistryRepository.lookup(identityId)` fetches a single snapshot of `RetrievedRegistryState` matching strictly on `identityId` (GTIN/subject ID) inside a `REPEATABLE READ READ ONLY` transaction.
- **Versioning & Compatibility:** Tables store raw domain values without schema versioning columns except `schema_version` on Evidence and ExecutionReceipt JSON representations.
- **Domain Coupling:** Heavily coupled to GS1 GTIN product identity (`subject_id` = GTIN-14). No generic concept of non-GTIN identity types or multi-domain registration trees exists in the current Registry layer.

---

## 4. Domain Map

- **Location:** `packages/domain/src/`.
- **Records & Value Objects:** GS1 identifiers (`gs1Parser.ts`, `gs1Validator.ts`, `gs1Normalizer.ts`), Identity (`index.ts`), Evidence & EvidenceBundle (`evidenceVerification.ts`), Authority (`authority.test.ts`), Capability (`capability.test.ts`), Standing (`standing.test.ts`), Policy (`policy.test.ts`), ExecutionRequest (`executionRequest.test.ts`), ExecutionContext (`receiptHash.ts`), ExecutionOutput/Receipt (`executionReceipt.test.ts`).
- **Boundaries & Dependencies:** `packages/domain` is a pure ESM leaf package (depends only on `@zyppi/shared`). Contains zero side-effects and zero Node.js native standard library dependencies (e.g., no Node `crypto`).
- **Projection & Aggregation:** `RetrievedRegistryState` (`packages/contracts/src/registry.ts`) aggregates domain collections (`standings`, `authorities`, `capabilities`, `policies`) associated with a single `IdentityRecord`.

---

## 5. Application Orchestration Map

- **Location:** `apps/api/src/registry/pipelineOrchestrator.ts`, `apps/api/src/registry/evidenceResolver.ts`, `apps/api/src/evidence/objectStorageEvidencePayloadProvider.ts`.
- **Responsibilities:**
  1. Mechanics of fetching `RetrievedRegistryState` via `RegistryRepository`.
  2. Projecting `RetrievedRegistryState` directly to `ActiveConstitutionalView` (ACV).
  3. Extracting evidence references, resolving evidence metadata (`RegistryEvidenceResolver`), and loading raw payloads (`ObjectStorageEvidencePayloadProvider`).
  4. Performing Application-layer preflight hash verification.
  5. Constructing the explicit `ExecutionRequest` and passing transported payloads to `runInternalPipeline(...)` in `@zyppi/runtime`.
- **Domain Coupling:** Application code assumes the primary entity is a GS1 GTIN product scan. Domain mapping logic maps GTIN directly into the pipeline without multi-domain abstraction.

---

## 6. Runtime Boundary Map

- **Location:** `packages/runtime/src/pipeline.ts`, `packages/runtime/src/types.ts`.
- **Inputs:** `ExecutionRequest` (contains `ExecutionContext`, `ActiveConstitutionalView`, `evidenceBundle`), optional StageOverrides, and optional `evidencePayloads` transported as `ReadonlyMap<string, unknown>`.
- **Execution:** Pure 9-stage pipeline execution:
  - Stage 1: Request Integrity Validation
  - Stage 2: Temporal Boundary Verification (`_UNAVAILABLE`)
  - Stage 3: Evidence Bundle & Payload Verification
  - Stage 4: Revocation & Standing Check (`_UNAVAILABLE`)
  - Stage 5: Authority & Capability Verification (`_UNAVAILABLE`)
  - Stage 6: ACV Activation (Constitutional Boundary)
  - Stage 7: Policy Evaluation
  - Stage 8: Trust Determination (`_UNAVAILABLE`)
  - Stage 9: Deterministic Execution Receipt Materialization
- **Outputs:** `PipelineResult` returning `ReceiptOutcome` (`materialized` with `ExecutionOutput` or `failed`).
- **Domain Neutrality:** `packages/runtime` is completely domain-neutral. It evaluates generic AST-based policies and evidence bundles without knowing or assuming GS1, product, or retail semantics.

---

## 7. Testing / Replay Map

- **Location:** `packages/testing/src/replay/`.
- **Mechanisms:**
  - `validateReplayDeterminism(corpus, snapshot)`: Pure offline replay engine comparing expected vs actual digests over RFC 8785 (JCS) canonically serialized outputs.
  - `pipelineReplay.test.ts`: Verifies M04 pipeline stages with zero StageOverrides across REPLAY-001 through REPLAY-008.
- **Fixtures & Corpus:** Canonical test vectors (`packages/domain/benchmarks/corpus/canonical.json`, `packages/testing/src/replay/replaySnapshot.ts`) test single-domain (GS1 GTIN) resolution.

---

## 8. Profile-Like Structural Inventory

Per §5 and §8 of the mandate, the following inventory lists every relevant artifact in the repository that aggregates, composes, or projects data across more than one bounded domain or collection.

| Artifact Path / Symbol                                                                | Layer             | Current Function                                                                                                         | Domain Coupling                             | Cross-Domain Participation                                                               | Current Owner      | Consumed By                                         | Protected Boundary                      | M08.5 Relevance                                                | Evidence                                                 | Council Question                                                                                                                   |
| :------------------------------------------------------------------------------------ | :---------------- | :----------------------------------------------------------------------------------------------------------------------- | :------------------------------------------ | :--------------------------------------------------------------------------------------- | :----------------- | :-------------------------------------------------- | :-------------------------------------- | :------------------------------------------------------------- | :------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| `packages/contracts/src/registry.ts` (`RetrievedRegistryState`)                       | Contract / Domain | Aggregates single identity, standings, authorities, capabilities, policies, and evidence references from Registry lookup | Tied to GTIN `identity.identityId`          | Composes Standings, Authorities, Capabilities, Policies, Evidence                        | Domain / Contracts | `apps/api` (`pipelineOrchestrator.ts`)              | `packages/contracts/`                   | Primary existing cross-entity aggregation structure            | `packages/contracts/src/registry.ts:28-36`               | Does `RetrievedRegistryState` get replaced or wrapped by a Profile construct? (`UNRESOLVED — COUNCIL DECISION REQUIRED`)           |
| `packages/domain/src/index.ts` (`ActiveConstitutionalView`)                           | Domain            | Holds activated policies, authorities, capabilities, standings, and trust anchors for Runtime execution                  | Neutral schema, populated with GTIN records | Composes Standings, Authorities, Capabilities, Policies                                  | Domain             | Runtime (`packages/runtime/src/pipeline.ts`)        | `packages/domain/`                      | Target ACV activation structure populated by Application layer | `packages/domain/src/index.ts`                           | How will Profile composition map onto ACV? (`UNRESOLVED — COUNCIL DECISION REQUIRED`)                                              |
| `apps/api/src/registry/pipelineOrchestrator.ts` (`composeAndRunPipeline`)             | Application       | Orchestrates Registry lookup, ACV projection, evidence payload loading, and Runtime pipeline execution                   | Hardcoded to GTIN lookup (`identityId`)     | Links Registry state, Evidence payloads, and Runtime ExecutionRequest                    | Application        | API entrypoints (`apps/api/src/main.ts`)            | `apps/api/`                             | Main Application composition orchestrator                      | `apps/api/src/registry/pipelineOrchestrator.ts:40-110`   | Should Application layer handle Profile resolution or delegate to a dedicated resolver? (`UNRESOLVED — COUNCIL DECISION REQUIRED`) |
| `packages/domain/src/index.ts` (`ExecutionRequest`)                                   | Domain            | Top-level execution input containing `context`, `activeConstitutionalView`, `evidenceBundle`                             | Domain-neutral schema                       | Aggregates Context, ACV, Evidence Bundle                                                 | Domain             | Runtime (`packages/runtime/src/pipeline.ts`)        | `packages/domain/`, `packages/runtime/` | Immutable input contract for Runtime execution                 | `packages/domain/src/executionRequest.test.ts`           | Will Profile metadata be passed in `ExecutionRequest` or `ExecutionContext`? (`UNRESOLVED — COUNCIL DECISION REQUIRED`)            |
| `packages/domain/src/index.ts` (`ExecutionOutput`)                                    | Domain            | Top-level execution result containing `outcome`, `evidenceReceipt`, `trustResult`, `policyDecisions`, `diagnostics`      | Domain-neutral schema                       | Aggregates Outcome, Evidence Receipt, Policy Decisions, Diagnostics                      | Domain             | Application, API                                    | `packages/domain/`, `packages/runtime/` | Immutable output contract of Runtime pipeline                  | `packages/domain/src/executionReceipt.test.ts`           | Will execution receipts reference Profile IDs? (`UNRESOLVED — COUNCIL DECISION REQUIRED`)                                          |
| `packages/domain/src/evidenceVerification.ts` (`EvidenceBundle`)                      | Domain            | Collection of `EvidenceRecord` items validated against schema version `"1.0"`                                            | Domain-neutral                              | Composes multiple Evidence Records                                                       | Domain             | Runtime, Application                                | `packages/domain/`                      | Multi-record evidence container                                | `packages/domain/src/evidenceVerification.ts`            | None; EvidenceBundle is domain-neutral                                                                                             |
| `apps/api/src/registry/seed/postgres-registry-seeder.ts` (`seedRegistryFromManifest`) | Application       | Transactionally seeds PostgreSQL with complete Registry graph                                                            | GS1 GTIN seed content                       | Composes identities, referents, evidence, policies, authorities, capabilities, standings | Application        | Seed CLI (`apps/api/src/registry/seed/seed-cli.ts`) | `apps/api/`                             | Cross-entity DB materialization mechanism                      | `apps/api/src/registry/seed/postgres-registry-seeder.ts` | How will multi-domain seed manifests be structured? (`UNRESOLVED — COUNCIL DECISION REQUIRED`)                                     |
| `packages/testing/src/replay/replaySnapshot.ts` (`ReplaySnapshot`)                    | Testing           | Immutable in-memory snapshot of Registry records for offline replay testing                                              | GS1 GTIN fixtures                           | Composes identities, standings, authorities, capabilities, policies, evidence            | Testing            | Replay harness (`validateReplayDeterminism`)        | `packages/testing/`                     | Cross-domain mock/fixture snapshot structure                   | `packages/testing/src/replay/replaySnapshot.ts`          | How will Profile replay test vectors be represented? (`UNRESOLVED — COUNCIL DECISION REQUIRED`)                                    |

---

## 9. Domain Multiplication Findings

### 9.1 Single-Domain Assumptions & Hard-Coded Identifiers

1. **Registry Schema (`infra/migrations/001_initial_registry_schema.sql`):**
   - `identities.id` and `referents.id` store GTIN-14 strings directly as primary keys.
   - There is no domain type discriminator (e.g., `domain_type: 'GS1' | 'ISBN' | 'LEI'`).
2. **Application Pipeline (`apps/api/src/registry/pipelineOrchestrator.ts`):**
   - Assumes input is a parsed GS1 Digital Link or raw GTIN string.
   - Performs direct lookup via `registryRepo.lookup(identityId)` expecting a single GTIN identity record.
3. **GS1 Tooling (`packages/domain/src/gs1Parser.ts`, `gs1Validator.ts`, `gs1Normalizer.ts`):**
   - Handled as the primary domain in `packages/domain`. No common interface/abstraction exists for non-GS1 carrier parsers or normalizers.

### 9.2 Domain-Neutral Abstractions Already Existing

1. **Runtime Execution Engine (`packages/runtime/src/pipeline.ts`):**
   - Highly domain-neutral. Operates strictly on `ExecutionRequest`, `ActiveConstitutionalView`, `PolicyRecord`, and `EvidenceBundle`. Contains zero references to GTIN, GS1, or retail commerce.
2. **Policy Evaluation (`packages/runtime/src/evaluator.ts`):**
   - Generic JSON-Logic / AST-based evaluation engine. Evaluates policy statements against input facts without domain coupling.
3. **Evidence Engine (`packages/domain/src/evidenceVerification.ts`):**
   - Evidence records are referenced by generic SHA-256 digests (`sha256:...`) and string IDs.

---

## 10. Contract Preservation Findings

Reconnaissance explicitly verified that all existing core contracts remain intact, unchanged, and preserved:

- `ExecutionRequest`: Unchanged (`packages/domain/src/executionRequest.test.ts`).
- `ExecutionOutput`: Unchanged (`packages/domain/src/executionReceipt.test.ts`).
- `ExecutionContext`: Unchanged (`packages/domain/src/executionContext.test.ts`).
- `RegistryRecord` structures: Unchanged (`packages/contracts/src/registry.ts`).
- `EvidenceBundle` & `EvidenceRecord`: Unchanged (`packages/domain/src/evidenceVerification.ts`).
- `ExecutionReceipt`: Unchanged (`packages/domain/src/executionReceipt.test.ts`).

**Gap Identified — No modification authorized under AMS-0851.**

---

## 11. Boundary Preservation Findings

The end-to-end processing pipeline exhibits the following explicit boundary flow:

```
[Registry DB / Adapters]
       ↓ (RetrievedRegistryState: Identity, Standings, Authorities, Capabilities, Policies)
[Domain / Contract Structures]
       ↓ (ActiveConstitutionalView, EvidenceBundle, ExecutionContext)
[Application Orchestration] (apps/api/src/registry/pipelineOrchestrator.ts)
       ↓ (ExecutionRequest + transported evidencePayloads)
[Runtime Verification Pipeline] (packages/runtime/src/pipeline.ts)
       ↓ (PipelineResult / ExecutionOutput)
[Execution Output / Receipt] (ExecutionReceipt)
```

### Boundary Analysis

1. **Registry → Domain / Contracts:**
   - **Crosses:** Database rows mapped into `RetrievedRegistryState`.
   - **Owner:** `@zyppi/contracts` interface, `@zyppi/api` adapter implementation.
   - **Domain Specificity:** Domain-specific (hardcoded to GTIN `identityId`).
2. **Domain / Contracts → Application Orchestration:**
   - **Crosses:** Domain record collections projected into `ActiveConstitutionalView` and `EvidenceBundle`.
   - **Owner:** `apps/api/src/registry/pipelineOrchestrator.ts`.
   - **Domain Specificity:** Application orchestration contains GTIN-specific assumptions during lookup.
3. **Application Orchestration → Runtime:**
   - **Crosses:** `ExecutionRequest` and transported `evidencePayloads` (`ReadonlyMap<string, unknown>`).
   - **Owner:** Boundary interface defined by `packages/runtime/src/pipeline.ts`.
   - **Domain Specificity:** **Domain-Neutral**. The boundary is clean, explicit, and ready for future Profile participation.
4. **Runtime → Execution Output / Receipt:**
   - **Crosses:** `ExecutionOutput` containing `ExecutionReceipt`.
   - **Owner:** `@zyppi/runtime` (Stage 9 materialization).
   - **Domain Specificity:** **Domain-Neutral**.

---

## 12. Missing-Capability Register

The following missing capabilities were identified during reconnaissance:

| Missing Capability                    | Location / Layer                      | Impact on Future Z-PROF                                                                                                                                      | Status / Authority                         |
| :------------------------------------ | :------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------- |
| Profile / Domain Template Card Schema | Z-PROF / Application Seam             | Connective construct. Current quarantine is in Application/Z-PROF seam. Eventual package allocation subject to Gap 2. Not a missing `@zyppi/contracts` item. | **UNRESOLVED — COUNCIL DECISION REQUIRED** |
| CompositionManifest Definition        | Z-PROF / Application Seam             | Connective construct. Current quarantine is in Application/Z-PROF seam. Eventual package allocation subject to Gap 2. Not a missing `@zyppi/contracts` item. | **UNRESOLVED — COUNCIL DECISION REQUIRED** |
| Profile Resolver Interface            | Application Composition Seam          | No contract or adapter exists to resolve Profiles by ID or URI                                                                                               | **UNRESOLVED — COUNCIL DECISION REQUIRED** |
| Multi-Domain Identity Discriminator   | Registry Schema (`infra/migrations/`) | Registry schema lacks domain type discriminator columns for non-GTIN entities                                                                                | **UNRESOLVED — COUNCIL DECISION REQUIRED** |
| Interrogation Boundary Contract       | Application Composition Seam          | No interface exists for querying profile requirements prior to pipeline execution                                                                            | **UNRESOLVED — COUNCIL DECISION REQUIRED** |

_Clarification note (CORR-0851-1):_ Domain Template Cards and CompositionManifests are Z-PROF connective constructs. They are currently quarantined in the Application/Z-PROF composition seam (`apps/api/src/zprof/`). Their eventual physical package placement remains subject to Council decision (Gap 2) and they are not declared as missing capabilities of `@zyppi/contracts` or `@zyppi/domain`.

---

## 13. Unresolved Architectural Questions

Per §2 and §11 of the mandate, all unanswered architectural questions are recorded here for Council resolution:

1. **`UNRESOLVED — COUNCIL DECISION REQUIRED`**: What is the formal constitutional schema and ownership model for a Z-PROF Profile, Domain Template Card, and Composition Manifest?
2. **`UNRESOLVED — COUNCIL DECISION REQUIRED`**: Does Profile resolution occur entirely in the Application Layer before constructing the `ExecutionRequest`, or does the Runtime participate in Profile activation?
3. **`UNRESOLVED — COUNCIL DECISION REQUIRED`**: How will multi-domain identities (e.g., non-GS1 carriers) be indexed and stored in the PostgreSQL Registry schema?
4. **`UNRESOLVED — COUNCIL DECISION REQUIRED`**: How will Profile composition references at the Application boundary relate to down-stream execution metadata, given that Profile resolution occurs at the Application/Z-PROF boundary, ACV remains the pure Runtime input boundary, and existing `ExecutionReceipt` semantics remain authoritative without Runtime receipt schema modification?
5. **`UNRESOLVED — COUNCIL DECISION REQUIRED`**: What are the temporal, provenance, and epistemic decay rules governing Profile definitions over time?

---

## 14. Protected-Area Verification

Reconnaissance explicitly verified that all protected production paths were preserved without modification:

- `packages/runtime/` — **VERIFIED UNTOUCHED**
- `packages/domain/` — **VERIFIED UNTOUCHED**
- `packages/contracts/` — **VERIFIED UNTOUCHED**
- `apps/` (`apps/api`, `apps/web`) — **VERIFIED UNTOUCHED**
- `infra/` — **VERIFIED UNTOUCHED**

Zero production semantics, zero Z-PROF contracts, and zero mock interfaces were created or introduced in any protected path.

---

## 15. Repository Preservation Evidence

### 15.1 Git State Proof

- **Baseline HEAD SHA:** `d2a676917a76c1dd8fcd4bfa27d29a755717798d`
- **Final HEAD SHA:** `d2a676917a76c1dd8fcd4bfa27d29a755717798d` (uncommitted EVR)
- **Branch:** `jules-13401536226888107624-96aec8dc`

### 15.2 Working Tree Status (`git status --short`)

```
A  DOCS/CAW/M08.5/AMS-0851-EVR.md
```

### 15.3 Diff Summary

- **Production Code Changes (`packages/*`, `apps/*`, `infra/*`):** **ZERO (0 files modified)**
- **Constitutional/Contract Changes:** **ZERO (0 files modified)**
- **Documentation Materialized:** Exactly 1 file (`DOCS/CAW/M08.5/AMS-0851-EVR.md`).

---

## 16. Final Findings and Handoff

- **Mandate Status:** **MATERIALIZED**
- **Reconnaissance Status:** **VERIFIED**
- **Production Preservation:** **VERIFIED**
- **Handoff Target:** Constitutional Council for review of `DOCS/CAW/M08.5/AMS-0851-EVR.md` prior to authorization of IT-0852 / AMS-0852.

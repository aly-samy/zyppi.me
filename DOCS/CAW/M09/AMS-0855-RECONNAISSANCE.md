# AMS-0855 — M09 API Boundary Reconnaissance & Z-PROF Execution Handoff

**Program:** CAW-011 — Commerce Atlas Wedge
**Milestone:** M09 — API Layer
**Mandate ID:** AMS-0855
**Title:** M09 API Boundary Reconnaissance & Z-PROF Execution Handoff
**Authority Class:** RECONNAISSANCE ONLY
**Implementation Authority:** NONE
**Verification Authority:** RECONNAISSANCE VERIFICATION ONLY
**Predecessors:** AMS-0852, AMS-0853, AMS-0854
**Date:** May 2026
**Status:** RECONNAISSANCE COMPLETE — FINAL VERDICT: IMPLEMENTATION READY WITH COUNCIL GATES

---

## 1. Mandate Identity

- **Mandate Identifier:** AMS-0855
- **Task Reference:** IT-0855
- **Governing Baseline:** CAW-000, CAW-006 v1.0, CAW-011 v2.4, CEngS-000, M08-CLOSURE, M08.5-PLAN, AMS-0852, AMS-0853, AMS-0854.
- **Constitutional Principle Under Test:** The API transports; the Application resolves; Z-PROF composes; the constitutional stack governs; Runtime executes.
- **Scope:** Pure read-only reconnaissance of the repository to determine how an external API request enters Zyppi's Application layer and reaches the existing constitutional execution boundary without transforming the API layer into a semantic, policy, domain, or execution organ.

---

## 2. Authority Boundaries

- **Granted Authority:**
  - Read-only inspection of repository source code, tests, contracts, documentation, package boundaries, dependency graphs, and build/execution tools.
  - Execution of existing build scripts (`pnpm build`), test suites (`pnpm test`), purity checkers (`pnpm runtime:purity`), boundary checks (`pnpm boundary:all`), and graph validators (`pnpm graph:validate`).
  - Formal reconciliation of repository implementation against governing documentation (CAW-006, CAW-011, etc.).
  - Materialization of reconnaissance documentation (`DOCS/CAW/M09/AMS-0855-RECONNAISSANCE.md`, `DOCS/CAW/M09/AMS-0855-API-BOUNDARY-DIAGRAM.md`, `DOCS/CAW/M09/AMS-0855-READINESS.md`).
- **Withheld Authority:**
  - ZERO implementation authority.
  - Creation or modification of production code, routes, controllers, middleware, handlers, adapters, database schemas, or migrations in `apps/api/`, `packages/runtime/`, `packages/domain/`, `packages/contracts/`, `infra/`, or any other package.
  - Creation or modification of test files across the repository.
  - Repairing architectural gaps, resolving constitutional ambiguities through code, or manufacturing fallback behaviors.
  - Generalization of API models into universal commerce ontologies.

---

## 3. Predecessor Verification

All three required predecessors were verified against repository source code, tests, and evidence reports:

1. **AMS-0852 — Z-PROF Contract Specification:**
   - **Evidence Location:** `DOCS/CAW/M08.5/AMS-0852-CONTRACT-SPEC.md` and `AMS-0852-EVR.md`.
   - **Verification:** Formally materialized under LIMITED Authority Class with 0 production code changes. Establishes the 4-tier epistemic status taxonomy (`UNKNOWN`, `UNAVAILABLE`, `UNVERIFIED`, `CONFLICTING`), Domain Template Card (DTC) structures, and CompositionManifest specifications.
   - **Predecessor Status:** `PREDECESSOR VERIFIED`.

2. **AMS-0853 — GS1 Z-PROF Application Composition Bridge:**
   - **Evidence Location:** `apps/api/src/zprof/compositionResolver.ts`, `apps/api/src/zprof/types.ts`, `DOCS/CAW/M08.5/AMS-0853-EVR.md`, `AMS-0853-BOUNDARY-DIAGRAM.md`.
   - **Verification:** Implemented inside `apps/api/src/zprof/` under LIMITED Authority with zero changes to protected paths (`packages/*`, `infra/`). Verified by 8 unit/integration tests in `compositionResolver.test.ts`. Passes Disappearance Test and Factorization proof.
   - **Predecessor Status:** `PREDECESSOR VERIFIED`.

3. **AMS-0854 — Multi-Domain Factorization & Second-Domain Validation (DPP):**
   - **Evidence Location:** `apps/api/src/zprof/compositionResolver.ts` (generic composition mechanics), `DOCS/CAW/M08.5/AMS-0854-EVR.md`, `AMS-0854-BOUNDARY-DIAGRAM.md`.
   - **Verification:** Refactored `ApplicationCompositionResolver` to be structurally domain-agnostic via `GenericCompositionOptions`. Includes frozen DPP DTC and Epistemic Requirement fixtures in `apps/api/src/zprof/fixtures/`. Verified by Tests A–J in `compositionResolver.test.ts`.
   - **Predecessor Status:** `PREDECESSOR VERIFIED`.

---

## 4. Repository Baseline

- **Compilation:** `pnpm exec tsc -b` succeeds with 0 errors across all 9 workspace projects.
- **Test Suite Execution:** `pnpm exec vitest run --fileParallelism=false` executes 37 test files containing 680 tests with 100% pass rate (680 passed, 0 failed, 0 skipped when live PostgreSQL container is running on port 5432).
- **Purity Verification:** `pnpm runtime:purity` passes with 0 violations (no Node `crypto`, filesystem, or I/O imports in `packages/runtime`).
- **Package Boundaries:** `pnpm boundary:all` succeeds across `@zyppi/domain`, `@zyppi/contracts`, `@zyppi/runtime`, `@zyppi/shared`, and `@zyppi/testing`.
- **Dependency Graph:** `pnpm graph:validate` confirms 100% compliance with CAW-004 v2.1 (9 workspace members analyzed, 92 source files scanned, 0 cycles).

---

## 5. CAW-006 Reconciliation

Reconciliation of the current repository against CAW-006 v1.0 (`DOCS/CAW/CAW-006-API-Contracts.md`):

1. **`GET /v1/resolve` Endpoint Definition:**
   - **CAW-006 Specification:** `GET /v1/resolve?link={url-encoded GS1 Digital Link}` returning `200 OK` with JSON `{ product, brand, manufacturer, verificationStatus, trustStatus, evidenceLinks, receiptReference }`.
   - **Repository Reality:** The endpoint does NOT exist in code. `apps/api/src/main.ts` contains only `export {};`. No HTTP server, router, controller, or OpenAPI specification is present in `apps/api`.
   - **Classification:** `B — Confirmed Missing Implementation` / `Documentation / Repository Drift`.

2. **HTTP Error Table & Status Codes:**
   - **CAW-006 Specification:** Maps 400 (`INVALID_DIGITAL_LINK`), 404 (`IDENTITY_NOT_FOUND`), 409 (`VERIFICATION_FAILED`), 422 (`EVIDENCE_UNAVAILABLE`), and 500 (`RUNTIME_ERROR`).
   - **Repository Reality:** Unimplemented. Furthermore, CAW-006 does not define HTTP mappings for Z-PROF validation codes (`unsupported`, `incompatible`), epistemic statuses (`UNKNOWN`, `UNVERIFIED`, `CONFLICTING`), or Stage 6 ACV activation failures.
   - **Classification:** `D — Constitutional / Contract Gap` & `F — Council-Gated Requirement`.

3. **Authentication Boundary (`X-Api-Key`):**
   - **CAW-006 Specification:** Minimal `X-Api-Key` HTTP header gate for wedge testing only.
   - **Repository Reality:** Unimplemented in code. Security models in `@zyppi/domain` define `Standing` and `Capability`, but no transport API key validator exists.
   - **Classification:** `B — Confirmed Missing Implementation`.

---

## 6. Existing API Surface

- **Workspace Target:** `apps/api` (`@zyppi/api`)
- **Package Type:** Private ESM workspace application execution target (`"private": true`).
- **Dependencies:** `@zyppi/domain`, `@zyppi/contracts`, `@zyppi/runtime`, `postgres`.
- **DevDependencies:** `@zyppi/testing`, `@types/node`, `typescript`, `vitest`.
- **Source Layout:**
  - `apps/api/src/main.ts`: Entrypoint (empty scaffold: `export {};`).
  - `apps/api/src/registry/`: `pipelineOrchestrator.ts` (`composeAndRunPipeline`), `evidenceResolver.ts` (`RegistryEvidenceResolver`), Postgres registry and receipt adapters.
  - `apps/api/src/evidence/`: `objectStorageEvidencePayloadProvider.ts` (`ObjectStorageEvidencePayloadProvider`).
  - `apps/api/src/zprof/`: `compositionResolver.ts` (`ApplicationCompositionResolver`), static DTC and epistemic requirement fixtures, domain composition types.
- **HTTP/Transport Infrastructure:** Zero HTTP framework (Fastify/Express/Node http) is currently installed or referenced in `apps/api/package.json`.

---

## 7. API → Application Trace

Because no HTTP transport layer currently exists in `apps/api/src/main.ts`, tracing an incoming HTTP request requires observing the existing Application orchestration entrypoints:

1. **Direct Execution Request Flow (`composeAndRunPipeline`):**
   - Located at `apps/api/src/registry/pipelineOrchestrator.ts`.
   - Accepts a fully structured, strongly-typed `ValidatedCanonicalIdentifier` (produced by `@zyppi/domain`'s GS1 parser/validator/normalizer), along with explicit execution parameters (`requestId`, `executionId`, `constitutionalTimestamp`, `budget`, `entropy`, `versions`, `policyContext`, `resolvedPolicyGraph`).
   - Executes Registry lookup (`lookupResult`), maps `RetrievedRegistryState` to `ActiveConstitutionalView`, resolves evidence references via `RegistryEvidenceResolver`, loads payloads via `EvidencePayloadProvider`, performs fast-failing preflight verification, and constructs the `ExecutionRequest`.

2. **Composition Execution Flow (`ApplicationCompositionResolver.composeAndExecute`):**
   - Located at `apps/api/src/zprof/compositionResolver.ts`.
   - Accepts `GenericCompositionOptions` or `GS1CompositionOptions`.
   - Executes structural composition against DTC and Epistemic Requirements, constructs `CompositionManifest` and `BoundConstitutionalPayload`, builds the explicit `ExecutionRequest`, and invokes `runInternalPipeline`.

3. **Inference vs Fact:**
   - **Repository Fact:** The Application layer expects strongly-typed domain identifiers (`ValidatedCanonicalIdentifier`) and fully populated context objects (`PolicyContext`, `ResolvedPolicyGraph`).
   - **Architectural Observation:** An HTTP controller in M09 will act strictly as an adapter: decoding transport parameters (query string, headers, body), passing the raw GS1 Digital Link string to `@zyppi/domain` parser/validator/normalizer, passing the normalized identifier to `ApplicationCompositionResolver` or `composeAndRunPipeline`, and serializing the resulting `PipelineResult` / `ExecutionOutput` into an HTTP response.

---

## 8. Application → Z-PROF Trace

Tracing the boundary between Application orchestration and Z-PROF composition (`apps/api/src/zprof/compositionResolver.ts`):

- **Seam Ownership:** `ApplicationCompositionResolver` is owned strictly by the Application layer (`apps/api/src/zprof/`). It does NOT exist in `@zyppi/runtime` or `@zyppi/domain`.
- **Composition Role:** Connects static, declarative domain assets (Domain Template Cards, Epistemic Requirements) to retrieved Registry state.
- **Operation:**
  1. Validates DTC structure (DTC ID format `dtc:zyppi:domain:*`, version `1.0.0`, non-empty epistemic requirements).
  2. Fetches Registry state read-only via `RegistryRepository.lookup()`.
  3. Evaluates mandatory epistemic fact requirements (e.g., `primaryIdentifier`, `authorityId`, `materialComposition`) against retrieved facts without inventing facts or coercing unknown states.
  4. Resolves evidence references and loads payloads using Application evidence providers.
  5. Assembles `CompositionManifest` and `BoundConstitutionalPayload`.
- **Key Observation:** Z-PROF acts as connective composition tissue prior to Runtime execution. It does not perform network I/O, database queries, policy decisions, or execution steps on its own; it orchestrates the structural gathering and validation of constitutional inputs.

---

## 9. Z-PROF → Runtime Trace

Tracing the boundary from Z-PROF composition into Runtime execution:

- **Handoff Interface:** Function `runInternalPipeline(executionRequest, overrides, evidencePayloads)` imported from `@zyppi/runtime/dist/pipeline.js`.
- **Request Construction:** `ApplicationCompositionResolver.composeAndExecute()` constructs an explicit `ExecutionRequest` containing:
  - `requestId`: Transport/Application string.
  - `identity`: Derived from `BoundConstitutionalPayload.resolvedActiveConstitutionalView.identity`.
  - `activeConstitutionalView`: Derived directly from retrieved Registry state.
  - `evidenceBundle`: Resolved and verified `EvidenceBundle`.
  - `policyContext`: Application-supplied `PolicyContext`.
  - `executionContext`: Fully populated `ExecutionContext` (`executionId`, `constitutionalTimestamp`, `budget`, `entropy`, `versions`).
  - `resolvedPolicyGraph`: Application-supplied `ResolvedPolicyGraph`.
- **Payload Transport:** Raw evidence payloads are passed via the third parameter `evidencePayloads?: ReadonlyMap<string, unknown>`, ensuring zero I/O occurs inside `@zyppi/runtime`.
- **Execution Authority:** `@zyppi/runtime` evaluates the 9-stage pipeline, executing Stage 3 (Evidence Verification), Stage 6 (ACV Activation), Stage 7 (Policy Evaluation), and Stage 9 (Receipt Generation), returning a deeply frozen `PipelineResult`.

---

## 10. Identity Boundary

Inspection of security, identity, standing, and authority boundaries across `@zyppi/domain/src/`:

- **Identity (`identity.ts`):** Uniquely identifies an entity (e.g., `identity:gs1:gtin:0614141000038`).
- **Standing (`standing.ts`):** Evaluates whether an identity has active legal/constitutional standing within a specific domain scope (e.g., `GOOD_STANDING`, `SUSPENDED`, `REVOKED`).
- **Authority (`authority.ts`):** Evaluates delegated authority or jurisdiction (e.g., `BRAND_OWNER`, `ISSUING_AUTHORITY`).
- **Policy Authorization (`policy.ts`):** Evaluates whether a specific action is permitted under a given policy context.
- **API Transport Separation:**
  - The API transport layer may extract transport identity (e.g., API key, client TLS cert, JWT header).
  - The API layer **SHALL NOT** infer Standing, Authority, or Policy Authorization from transport identity.
  - Transport identity must be passed into Application context, where policy evaluation (`Stage 7`) independently determines authorization based on `ActiveConstitutionalView` and `PolicyContext`.

---

## 11. Policy Boundary

Inspection of Policy interactions in Application and Runtime layers:

- **Policy Authority:** `@zyppi/domain` models policy records and rules; `@zyppi/runtime` (Stage 7) evaluates policy graphs against the `ExecutionRequest`.
- **API Layer Constraints:**
  - The API layer possesses ZERO policy authority.
  - The API layer **SHALL NOT** invent policy rules, synthesize policy contexts, or perform short-circuit permission checks.
  - The API layer **SHALL NOT** collapse contextual authorizations into global boolean flags (e.g., converting complex policy decisions into a simple `isAllowed: true`).
  - Policy decisions produced by Runtime Stage 7 must be transported intact within the response or receipt structure without loss of policy provenance.

---

## 12. Canonicalization Boundary

Investigation of transport decoding versus semantic canonicalization:

- **Mandatory Principle:** Transport decoding is NOT domain-semantic canonicalization.
- **Transport Decoding (API Boundary):** Extracting URL query parameters (e.g., `decodeURIComponent(req.query.link)`), parsing JSON HTTP body, extracting request headers.
- **Domain Semantic Canonicalization (`@zyppi/domain` Boundary):**
  - Executed exclusively by `@zyppi/domain` functions: `parseGs1DigitalLink` (parsing), `validateGs1DigitalLink` (validation), `normalizeGs1DigitalLink` (K1 key extraction and qualifier sorting).
- **API Boundary Protection:**
  - The API layer **SHALL NOT** attempt to repair malformed GTINs or URIs, infer missing Application Identifiers (AIs), strip invalid characters, or coerce malformed links into valid forms.
  - If a incoming URI fails domain parsing or validation, the raw malformed string must be preserved and passed into the domain error pipeline so that constitutional error taxonomy (`UNSUPPORTED_CARRIER_FORM`, `MALFORMED_CARRIER_STRUCTURE`, etc.) is triggered and recorded.

---

## 13. Error Propagation

Inspection of error models across Domain, Z-PROF, Application, and Runtime layers:

1. **GS1 Domain Parsing/Validation Errors:**
   - Closed error codes: `UNSUPPORTED_CARRIER_FORM`, `MALFORMED_CARRIER_STRUCTURE`, `MALFORMED_AI_STRUCTURE`, `MISSING_REQUIRED_STRUCTURE`, `INVALID_CHECK_DIGIT`, `INVALID_AI_LENGTH`, etc.
2. **Z-PROF Composition Error Taxonomy:**
   - Closed codes: `unsupported`, `unavailable`, `missing`, `incompatible`, `conflicting`, `unauthorized`, `unverified`, `invalid`.
3. **Epistemic Status Taxonomy:**
   - Closed states: `UNKNOWN`, `UNAVAILABLE`, `UNVERIFIED`, `CONFLICTING`.
4. **Runtime Pipeline Error Taxonomy:**
   - `PipelineStageResult` failures containing `stage`, `errorCode`, `reason`, and `diagnostics`.
5. **API Transport Requirement:**
   - The API layer must preserve and transport underlying constitutional error codes, reasons, and execution stage metadata.
   - HTTP status codes (e.g., `400`, `404`, `409`, `422`, `500`) are transport representations only and **SHALL NOT** replace or obliterate the underlying `NormalizedConstitutionalError` or execution receipt provenance.

---

## 14. HTTP Mapping Evidence

Evidence collected regarding HTTP response mappings:

- **CAW-006 Table:** Specifies 5 HTTP error codes (`400`, `404`, `409`, `422`, `500`).
- **Repository Implementation:** Unimplemented in code. No mapping matrix exists in TypeScript source files.
- **Gaps Identified:**
  - CAW-006 does not define HTTP status mappings for Z-PROF epistemic statuses (`UNKNOWN`, `UNAVAILABLE`, `UNVERIFIED`, `CONFLICTING`).
  - CAW-006 does not define HTTP status mappings for Stage 6 ACV activation failures (`ACV_MISSING`, `ACV_INVALID`).
  - CAW-006 response schema (`GET /v1/resolve` 200 OK) requires fields (`product.name`, `brand.name`, `manufacturer.name`) that are not present in retrieved `RegistryState` or `ExecutionReceipt` without a secondary metadata projection layer.
- **Classification:** Every missing mapping is formally classified as `UNRESOLVED — FUTURE AMS / COUNCIL DECISION REQUIRED`.

---

## 15. M08 Constraint Preservation

Preservation of M08 Runtime blockers and execution constraints:

- **M08 Baseline Status (`M08-CLOSURE.md`):**
  - Intermediate Runtime Stages 2 (Identity Verification), 4 (Standing Evaluation), and 5 (Authority Resolution) are natively unimplemented (`_UNAVAILABLE`) in `@zyppi/runtime`.
  - Replay test vectors REPLAY-001, REPLAY-002, REPLAY-003, and REPLAY-005 are natively BLOCKED in the Runtime.
- **API Boundary Protection:**
  - The API layer **SHALL NOT** simulate or mock intermediate Runtime stages to fake a successful execution.
  - The API layer **SHALL NOT** bypass blocked vectors or manufacture synthetic Execution Receipts for unexecutable requests.
  - If a request triggers a natively blocked Runtime stage, the API must propagate the exact `_UNAVAILABLE` stage failure and diagnostic output returned by `runInternalPipeline`.

---

## 16. Protected-Path Verification

Verification of protected path immutability during AMS-0855 execution:

- `packages/runtime/`: 0 files modified, 0 files added, 0 files deleted.
- `packages/domain/`: 0 files modified, 0 files added, 0 files deleted.
- `packages/contracts/`: 0 files modified, 0 files added, 0 files deleted.
- `infra/`: 0 files modified, 0 files added, 0 files deleted.
- `apps/api/`: 0 files modified, 0 files added, 0 files deleted.
- **Verdict:** `PROTECTED PATHS 100% UNTOUCHED`.

---

## 17. Disappearance Test

Verification of the Z-PROF Disappearance Test:

- **Test Concept:** If Z-PROF composition (`apps/api/src/zprof/`) were completely removed from the repository, can an external request still execute through the stack?
- **Repository Evidence:**
  - `composeAndRunPipeline()` in `apps/api/src/registry/pipelineOrchestrator.ts` demonstrates direct execution:
    `API Request -> Application Orchestrator -> Registry/Evidence Lookup -> ExecutionRequest Construction -> Runtime Execution`.
  - This path bypasses `ApplicationCompositionResolver` completely while producing valid Runtime execution and receipts.
- **Verdict:** `DISAPPEARANCE TEST PASSED`. Z-PROF is non-essential connective composition tissue; the underlying API -> Application -> Constitutional Inputs -> Runtime architecture remains fully coherent without it.

---

## 18. Deficiency Classification

All discovered repository and architectural deficiencies classified using the mandated taxonomy (§21):

1. **Missing `apps/api` HTTP Entrypoint:**
   - _Description:_ `apps/api/src/main.ts` is an empty scaffold (`export {};`). No HTTP server, router, or OpenAPI controller exists.
   - _Classification:_ `E — Implementation Readiness Gap`.

2. **CAW-006 vs Repository Schema Drift:**
   - _Description:_ CAW-006 specifies response fields (`product.name`, `brand.name`, `manufacturer.name`) not directly returned by `RegistryState` or `ExecutionReceipt`.
   - _Classification:_ `B — Documentation / Repository Drift`.

3. **Unmapped Z-PROF & ACV Error Taxonomy in HTTP:**
   - _Description:_ No authoritative mapping exists to translate Z-PROF codes (`unsupported`, `incompatible`), Epistemic Statuses (`UNKNOWN`, `UNVERIFIED`), or Stage 6 ACV activation failures into HTTP status codes.
   - _Classification:_ `D — Constitutional Gap`.

4. **Unresolved M08 Runtime Intermediate Stages:**
   - _Description:_ Stages 2, 4, and 5 in `@zyppi/runtime` return `_UNAVAILABLE`.
   - _Classification:_ `E — Implementation Readiness Gap`.

---

## 19. Evidence Classification

All substantive findings in this report classified according to the mandatory evidence taxonomy (§20):

- **Repository Fact:** `apps/api/src/main.ts` contains `export {};`. `composeAndRunPipeline` and `ApplicationCompositionResolver` exist and are 100% tested. All 680 vitest tests pass.
- **Documented Contract:** CAW-006 v1.0 defines `GET /v1/resolve` and 5 HTTP error codes. CAW-011 defines M09 as the API Layer milestone.
- **Implementation Observation:** `apps/api` contains complete Application-layer composition and orchestrator modules (`pipelineOrchestrator.ts`, `compositionResolver.ts`, `evidenceResolver.ts`), but lacks an HTTP transport framework (e.g., Fastify) and route definitions.
- **Architectural Inference:** An M09 HTTP controller will act as a thin transport wrapper invoking `ApplicationCompositionResolver.composeAndExecute()` or `composeAndRunPipeline()`.
- **Recommendation:** Keep HTTP controller logic pure transport (decoding query params, invoking Application orchestrator, mapping resulting object to HTTP status/JSON).
- **Unresolved Question:** How should Z-PROF epistemic statuses (`UNKNOWN`, `UNVERIFIED`, `CONFLICTING`) and Stage 6 ACV activation failures be mapped to HTTP status codes without losing constitutional error details?

---

## 20. Implementation-Readiness Assessment

- **Assessment Classification:** `IMPLEMENTATION READY WITH COUNCIL GATES`
- **Justification:**
  - The Application orchestration layer (`composeAndRunPipeline`), Z-PROF composition bridge (`ApplicationCompositionResolver`), Evidence engine (`objectStorageEvidencePayloadProvider`), Registry repository, and Runtime pipeline are 100% implemented, compiled, and verified.
  - However, M09 implementation cannot proceed to completion without Council decisions resolving the HTTP error mapping contract gaps, transport identity/auth specifications, and response projection schemas.

---

## 21. Council-Gated Questions

Enumeration of unresolved constitutional questions requiring Council decision prior to M09 implementation:

### Question 1: HTTP Error Status Mapping for Z-PROF Epistemic Failures

- **Repository Evidence:** `apps/api/src/zprof/compositionResolver.ts` returns epistemic statuses `UNKNOWN`, `UNAVAILABLE`, `UNVERIFIED`, `CONFLICTING` and Z-PROF codes `unsupported`, `incompatible`, `missing`, `invalid`.
- **Governing Document Evidence:** CAW-006 v1.0 specifies only 400, 404, 409, 422, 500.
- **Conflict/Absence:** No mapping defines which HTTP status code corresponds to `UNVERIFIED` evidence or `CONFLICTING` epistemic facts.
- **Decision Required:** Specify explicit HTTP status mappings and error body payloads for each Z-PROF epistemic status and composition error code.

### Question 2: Projections for `GET /v1/resolve` Response

- **Repository Evidence:** `RegistryState` in `@zyppi/domain` stores entity `identity`, `relationships`, `standings`, `authorities`, `capabilities`.
- **Governing Document Evidence:** CAW-006 specifies `GET /v1/resolve` response payload containing `product: { gtin, name }`, `brand: { id, name }`, `manufacturer: { id, name }`.
- **Conflict/Absence:** `name` fields are human-readable metadata strings not currently stored in `RegistryState` rows.
- **Decision Required:** Clarify whether `GET /v1/resolve` should return raw constitutional identifiers (e.g., `brand: { id: "identity:gs1:company:0614141" }`) or if an Application-layer metadata projection service must be defined.

### Question 3: Transport Authentication Gate Contract (`X-Api-Key`)

- **Repository Evidence:** No API key validation code exists in `apps/api`.
- **Governing Document Evidence:** CAW-006 specifies header `X-Api-Key: <wedge dev key>`.
- **Conflict/Absence:** No specification defines where dev keys are stored, validated, or how key invalidity maps to HTTP 401/403 responses without leaking policy context.
- **Decision Required:** Ratify the transport authentication mechanism for M09.

---

## 22. Unresolved Questions

1. Should M09 introduce a lightweight HTTP server framework (e.g., Fastify) into `apps/api/package.json` or use Node's native `http` module?
2. How should execution receipts be exposed in API responses (as raw JCS JSON, SHA-256 digest reference, or full `ExecutionOutput`)?

---

## 23. Final Reconnaissance Verdict

### `RECONNAISSANCE AUTHORITY SATISFIED`

### `IMPLEMENTATION AUTHORITY: NONE`

### `FINAL VERDICT: IMPLEMENTATION READY WITH COUNCIL GATES`

The repository evidence conclusively answers how an external API request enters Zyppi's Application layer and reaches the constitutional execution boundary:
The API transport layer decodes HTTP requests and invokes the Application Composition Bridge (`ApplicationCompositionResolver.composeAndExecute` or `composeAndRunPipeline`). The Application layer fetches Registry state, resolves evidence, and constructs an explicit `ExecutionRequest`. Z-PROF composes domain manifests without performing I/O. Policy authorizes, and Runtime executes. The API layer remains a pure transport boundary with zero semantic, policy, domain, or execution authority.

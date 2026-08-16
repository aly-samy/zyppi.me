# AMS-0855 — M09 API Layer Implementation Readiness Assessment

**Program:** CAW-011 — Commerce Atlas Wedge
**Milestone:** M09 — API Layer
**Mandate ID:** AMS-0855
**Title:** Implementation Readiness Assessment & Council Handoff
**Authority Class:** RECONNAISSANCE ONLY
**Implementation Authority:** NONE
**Date:** May 2026

---

## 1. Readiness Classification

### **FINAL VERDICT:** `IMPLEMENTATION READY WITH COUNCIL GATES`

---

## 2. Executive Assessment Summary

Repository-grounded reconnaissance under AMS-0855 confirms that the underlying Application orchestration layer (`composeAndRunPipeline`), Z-PROF composition bridge (`ApplicationCompositionResolver`), Evidence retrieval engine (`ObjectStorageEvidencePayloadProvider`), Registry repository adapters (`PostgresRegistryRepository`), and Runtime execution substrate (`runInternalPipeline`) are **100% technically implemented, compiled, and verified**. All 680 vitest unit and integration tests pass with zero errors, zero package boundary violations, and zero dependency graph cycles.

However, substantive M09 HTTP API layer implementation **CANNOT** proceed immediately to production without explicit Council decisions resolving key contract gaps between CAW-006 v1.0 and the newly implemented Z-PROF epistemic status and Runtime Stage 6 ACV error taxonomies.

---

## 3. Component Readiness Breakdown

| Component / Layer                  | Implementation Location                         | Technical Readiness       | Governance Readiness     | Readiness Status           |
| :--------------------------------- | :---------------------------------------------- | :------------------------ | :----------------------- | :------------------------- |
| **Workspace Target (`apps/api`)**  | `apps/api/`                                     | Scaffolded (`export {};`) | Clear package boundary   | `READY FOR IMPLEMENTATION` |
| **Application Orchestrator**       | `apps/api/src/registry/pipelineOrchestrator.ts` | 100% Implemented & Tested | Ratified (IT-0801/0802)  | `IMPLEMENTATION READY`     |
| **Composition Bridge (Z-PROF)**    | `apps/api/src/zprof/compositionResolver.ts`     | 100% Implemented & Tested | Ratified (AMS-0853/0854) | `IMPLEMENTATION READY`     |
| **Evidence Retrieval Engine**      | `apps/api/src/evidence/`                        | 100% Implemented & Tested | Ratified (AMS-0704/0705) | `IMPLEMENTATION READY`     |
| **Registry Adapters**              | `apps/api/src/registry/`                        | 100% Implemented & Tested | Ratified (IT-0503/0702)  | `IMPLEMENTATION READY`     |
| **Runtime Pipeline**               | `packages/runtime/src/pipeline.ts`              | 100% Implemented & Tested | Ratified (M08 Baseline)  | `IMPLEMENTATION READY`     |
| **HTTP Transport Framework**       | `apps/api/package.json`                         | Not installed             | Unratified choice        | `REQUIRES AMS-0901`        |
| **HTTP Error Status Mapping**      | `apps/api/`                                     | Unimplemented             | **COUNCIL GATE M09-G1**  | `COUNCIL-GATED`            |
| **API Response Projection Schema** | `apps/api/`                                     | Unimplemented             | **COUNCIL GATE M09-G2**  | `COUNCIL-GATED`            |
| **Transport Security Gate**        | `apps/api/`                                     | Unimplemented             | **COUNCIL GATE M09-G3**  | `COUNCIL-GATED`            |

---

## 4. Prerequisite Council Gates

Before an M09 implementation mandate (e.g., AMS-0901) is issued, the Council must formally resolve three specific gates:

### Council Gate M09-G1: HTTP Error Mapping Contract

- **Problem:** CAW-006 v1.0 defines HTTP error codes 400, 404, 409, 422, 500, but does not define mappings for:
  - Z-PROF Epistemic Statuses: `UNKNOWN`, `UNAVAILABLE`, `UNVERIFIED`, `CONFLICTING`.
  - Composition Codes: `unsupported`, `incompatible`.
  - Stage 6 ACV Activation Failures: `ACV_MISSING`, `ACV_INVALID`.
- **Required Council Decision:** Approve an explicit HTTP Error Mapping Matrix mapping Z-PROF and Stage 6 error codes to HTTP status codes while mandating that the error response body includes the full `NormalizedConstitutionalError` JSON payload to preserve provenance.

### Council Gate M09-G2: Response Payload Projection Specification

- **Problem:** CAW-006 specifies `GET /v1/resolve` 200 OK returning human-readable strings (`product.name`, `brand.name`, `manufacturer.name`). However, `RegistryState` and `ExecutionReceipt` store raw constitutional identifiers (e.g., `identity:gs1:company:0614141`).
- **Required Council Decision:** Decide whether M09:
  - _Option A (Strict Constitutional):_ Returns raw constitutional identity identifiers in the HTTP response.
  - _Option B (Enriched Projection):_ Authorizes an Application-layer metadata projection service that hydrates raw identities into human-readable strings using registered attributes.

### Council Gate M09-G3: Transport Gate Ratification

- **Problem:** CAW-006 references an `X-Api-Key` transport gate for testing.
- **Required Council Decision:** Confirm whether `X-Api-Key` remains a minimal transport gate for M09 without creating an API-level authorization policy engine.

---

## 5. Next Steps for M09 Execution

Upon resolution of Council Gates M09-G1, M09-G2, and M09-G3, the following implementation sequence is recommended for mandate **AMS-0901 (M09 API Layer Implementation)**:

1. Add an ESM HTTP framework (e.g., Fastify) to `apps/api/package.json`.
2. Implement `GET /v1/resolve` controller inside `apps/api/src/routes/resolve.ts`.
3. Wire the controller to `ApplicationCompositionResolver.composeAndExecute()` and `composeAndRunPipeline()`.
4. Implement the ratified HTTP error mapping handler preserving constitutional error body payloads.
5. Add contract verification tests in `apps/api/src/routes/resolve.test.ts`.

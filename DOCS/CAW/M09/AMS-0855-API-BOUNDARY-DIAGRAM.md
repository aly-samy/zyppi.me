# AMS-0855 — API Boundary Diagram

**Program:** CAW-011 — Commerce Atlas Wedge
**Milestone:** M09 — API Layer
**Mandate ID:** AMS-0855
**Title:** API Boundary Architectural C4 / Structural Diagram
**Authority Class:** RECONNAISSANCE ONLY
**Implementation Authority:** NONE

---

## 1. Structural Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  EXTERNAL CLIENT                                  |
|               (HTTP GET /v1/resolve?link=https://id.gs1.org/01/...)               |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | HTTP Request
                                          v
+-----------------------------------------------------------------------------------+
|                             API TRANSPORT BOUNDARY                                |
|                                  (apps/api)                                       |
|                                                                                   |
|  * Transport Decoding (URL decode, JSON parse, Header extraction)                 |
|  * Transport Authentication Gate (X-Api-Key)                                      |
|  * Error Serialization (Maps errors to HTTP status + JCS error body)               |
|  * ZERO Domain Authority / ZERO Semantic Canonicalization / ZERO Policy Authority  |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | Raw Link String / Transport Context
                                          v
+-----------------------------------------------------------------------------------+
|                        APPLICATION ORCHESTRATION BOUNDARY                         |
|                         (apps/api/src/registry/ & zprof/)                         |
|                                                                                   |
|  * Domain GS1 Parsing/Validation (parseGs1DigitalLink, validateGs1DigitalLink)    |
|  * Domain Normalization & K1 Extraction (normalizeGs1DigitalLink)                 |
|  * Registry Reference Resolution (RegistryRepository.lookup)                      |
|  * Dynamic Evidence Payload Retrieval (ObjectStorageEvidencePayloadProvider)      |
|  * Preflight Evidence Verification (verifyEvidenceBundle)                         |
|  * ExecutionRequest Assembly (requestId, ACV, ExecutionContext)                  |
+--------------------+---------------------------------------+----------------------+
                     |                                       |
                     | Composition                           | Policy
                     | Options                               | Context
                     v                                       v
+--------------------+------------------+  +-----------------+----------------------+
|          Z-PROF COMPOSITION           |  |           POLICY BOUNDARY            |
|       CONNECTIVE TISSUE SEAM          |  |          (packages/domain)          |
| (ApplicationCompositionResolver)      |  |                                      |
|                                       |  |  * Policy Context Isolation          |
|  * DTC & Epistemic Requirement        |  |  * Standing & Capability Checks      |
|    Structural Validation              |  |  * Zero Policy Context Leakage       |
|  * Epistemic Deficit Detection        |  |  * Authorization Evaluation          |
|    (UNKNOWN, UNAVAILABLE, etc.)       |  +-----------------+----------------------+
|  * CompositionManifest Materialization|                    |
|  * BoundConstitutionalPayload Build   |                    | Evaluated Graph
+--------------------+------------------+                    |
                     |                                       |
                     +-------------------+-------------------+
                                         |
                                         | ExecutionRequest + Transported Payloads
                                         v
+-----------------------------------------------------------------------------------+
|                           RUNTIME EXECUTION BOUNDARY                              |
|                               (packages/runtime)                                  |
|                                                                                   |
|  * Pure, Zero-I/O Execution Pipeline (runInternalPipeline)                       |
|  * Stage 3: Bundle Hash Verification                                              |
|  * Stage 6: ACV Activation Boundary Verification                                  |
|  * Stage 7: Policy Graph Evaluation                                               |
|  * Stage 9: Deterministic Execution Receipt Generation (JCS + SHA-256)             |
|  * Returns Immutable PipelineResult / ExecutionOutput                             |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | ExecutionOutput / PipelineResult
                                          v
+-----------------------------------------------------------------------------------+
|                             API RESPONSE TRANSPORT                                |
|                                                                                   |
|  * Preserves Execution Receipt & Provenance                                       |
|  * Transports Constitutional Error Codes intact                                    |
|  * Serializes HTTP 200 / 4xx / 5xx Payload                                        |
+-----------------------------------------------------------------------------------+
```

---

## 2. Boundary Ownership Matrix

| Layer           | Component / Seam                                     | Authority / Ownership         | Permitted Actions                                                   | Prohibited Actions                                                   |
| :-------------- | :--------------------------------------------------- | :---------------------------- | :------------------------------------------------------------------ | :------------------------------------------------------------------- |
| **API**         | HTTP Router / Controller                             | Transport Boundary            | Transport decoding, header parsing, HTTP response formatting        | GTIN repair, domain inference, policy decisions, database queries    |
| **Application** | `pipelineOrchestrator.ts` / `compositionResolver.ts` | Orchestration Boundary        | Coordinates Registry, Evidence, Z-PROF, and Runtime calls           | Direct execution without ACV/Policy; modifying Runtime code          |
| **Z-PROF**      | `ApplicationCompositionResolver`                     | Composition Connective Tissue | Validates DTC structural compliance, constructs CompositionManifest | Executing I/O, network requests, database queries, policy evaluation |
| **Policy**      | `packages/domain/src/policy.ts`                      | Authorization Authority       | Evaluates policy rules against PolicyContext & ACV                  | Implicitly granting standing based on transport authentication       |
| **Runtime**     | `packages/runtime/src/pipeline.ts`                   | Execution Authority           | Executes 9-stage pipeline, computes receipt digest                  | Performing I/O, importing Node crypto/fs, altering ACV               |

---

## 3. Disappearance Test Isolation

```
                   WITHOUT Z-PROF COMPOSITION

+---------------------------------------------------------------+
|                    API TRANSPORT BOUNDARY                     |
+-------------------------------+-------------------------------+
                                |
                                v
+---------------------------------------------------------------+
|             APPLICATION ORCHESTRATION BOUNDARY                |
|              (composeAndRunPipeline Orchestrator)             |
+-------------------------------+-------------------------------+
                                |
                                v
+---------------------------------------------------------------+
|                 CONSTITUTIONAL INPUTS & ACV                   |
|           (Registry + Evidence + Policy Context)              |
+-------------------------------+-------------------------------+
                                |
                                v
+---------------------------------------------------------------+
|                  RUNTIME EXECUTION BOUNDARY                   |
+---------------------------------------------------------------+
```

_Proof:_ If Z-PROF composition is removed, the Application layer orchestrator (`composeAndRunPipeline`) directly constructs the `ExecutionRequest` from Registry and Evidence providers and submits it to `runInternalPipeline()`. The system architecture remains 100% constitutionally sound. Z-PROF is connective composition tissue, not an indispensable constitutional organ.

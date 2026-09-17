# AMS-0854 — Multi-Domain Boundary Diagram (C4 Level 2 / Level 3)

**Program:** CAW-011 — Commerce Atlas Wedge
**Milestone:** M08.5 — Z-PROF Profile Architecture
**Mandate ID:** AMS-0854
**Title:** Z-PROF Multi-Domain Factorization & Second-Domain Validation
**Deliverable ID:** D3

---

## 1. Multi-Domain Architecture Overview

AMS-0854 establishes that multiple commerce domains (GS1, DPP, etc.) compose over existing constitutional stack capabilities without duplicating constitutional organs, multiplying ARM Profiles, or altering Runtime execution contracts.

```
                                  SHARED ASSET REALITY
                             ┌────────────────────────────┐
                             │    Identity: 09501101530003│
                             │  Referent: Trade Item Asset│
                             └──────────────┬─────────────┘
                                            │
                                  CONSTITUTIONAL STACK
             ┌──────────────────────────────┼──────────────────────────────┐
             │                              │                              │
     ┌───────┴───────┐              ┌───────┴───────┐              ┌───────┴───────┐
     │  ARM Profile  │              │    Registry   │              │Evidence Engine│
     │   (Existing)  │              │   (Existing)  │              │   (Existing)  │
     └───────┬───────┘              └───────┬───────┘              └───────┬───────┘
             │                              │                              │
             └──────────────────────────────┼──────────────────────────────┘
                                            │
                             APPLICATION COMPOSITION BOUNDARY
                                (apps/api/src/zprof/)
                             ┌────────────────────────────┐
                             │ApplicationCompositionResolver│
                             └──────────────┬─────────────┘
                                            │
                   ┌────────────────────────┴────────────────────────┐
                   │                                                 │
        GS1 COMPOSITION                                   DPP COMPOSITION
  ┌───────────────────────────┐                     ┌───────────────────────────┐
  │ DTC: dtc:zyppi:domain:gs1 │                     │ DTC: dtc:zyppi:domain:dpp │
  │ Epistemic Requirements:   │                     │ Epistemic Requirements:   │
  │  - GTIN Identification    │                     │  - Passport Identification│
  │  - Brand Owner Authority  │                     │  - Material Composition   │
  └────────────┬──────────────┘                     └────────────┬──────────────┘
               │                                                 │
               └────────────────────────┬────────────────────────┘
                                        │
                             BOUND CONSTITUTIONAL PAYLOAD
                             ┌────────────────────────────┐
                             │ Active Constitutional View │
                             │      Evidence Bundle       │
                             │     Execution Context      │
                             └──────────────┬─────────────┘
                                            │
                             PURE RUNTIME SUBSTRATE
                             (packages/runtime/ — UNTOUCHED)
                             ┌────────────────────────────┐
                             │ Stage 1..9 Runtime Pipeline│
                             │      Execution Output      │
                             └────────────────────────────┘
```

---

## 2. Layer & Data Ownership Boundaries

| Layer / Component              | System Boundary                      | Ownership         | Role in AMS-0854 Multi-Domain Factorization                                                                                                                   |
| :----------------------------- | :----------------------------------- | :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Asset Reality**              | `@zyppi/domain`                      | Domain Core       | Singular reference point for physical assets. Retains absolute epistemic identity across domains.                                                             |
| **ARM Profile**                | `@zyppi/domain`                      | Domain Core       | Single profile (`arm:profile:trade_item:v1`) shared by both GS1 and DPP. ZERO new ARM profiles created.                                                       |
| **Registry Substrate**         | `@zyppi/contracts` / `@zyppi/domain` | Core State        | Read-only state provider (`RetrievedRegistryState`). ZERO new domain-specific tables or ontologies.                                                           |
| **Evidence Engine**            | `@zyppi/contracts` / `@zyppi/domain` | Evidence Core     | Provider of evidence references and verification reports. ZERO domain-specific evidence stores.                                                               |
| **Policy System**              | `@zyppi/domain`                      | Policy Boundary   | Enforces contextual authorization (`Subject x Action x Target x Context`). GS1 context $\neq$ DPP context.                                                    |
| **Application Composition**    | `apps/api/src/zprof/`                | Application Layer | Connective tissue resolving DTCs, Epistemic Requirements, and constructing Bound Constitutional Payloads.                                                     |
| **GS1 Composition**            | `apps/api/src/zprof/fixtures/`       | GS1 Domain        | Declarative DTC (`GS1_DOMAIN_TEMPLATE_CARD`) and Epistemic Requirements (`GTIN`, `Brand Owner`).                                                              |
| **DPP Composition**            | `apps/api/src/zprof/fixtures/`       | DPP Domain        | Declarative DTC (`DPP_DOMAIN_TEMPLATE_CARD`) and Epistemic Requirements (`Passport`, `Material`).                                                             |
| **Active Constitutional View** | `@zyppi/domain`                      | Domain Core       | Immutable 7-part view (`identity`, `relationships`, `standings`, `authorities`, `capabilities`, `evidenceReferences`, `applicablePolicies`). ZERO new fields. |
| **Runtime Substrate**          | `@zyppi/runtime`                     | Pure Engine       | Pure 9-stage pipeline execution engine. Zero awareness of GS1, DPP, DTCs, or Z-PROF.                                                                          |

---

## 3. Data Flow & Control Handoff

```
[ Domain Composition Call ]
        │
        ├─> (1) Load Static Fixture (GS1 DTC or DPP DTC)
        ├─> (2) Fetch Registry State (Read-only lookup via Canonical Identifier)
        ├─> (3) Verify Epistemic Requirements against retrieved facts
        │         └─> [If Fact Deficit] --> Return Epistemic Failure (UNAVAILABLE / UNVERIFIED)
        ├─> (4) Resolve Evidence Bundle & Load Payloads (Preflight verification)
        ├─> (5) Assemble Application CompositionManifest
        ├─> (6) Assemble Bound Constitutional Payload (ACV + Evidence Bundle + ExecutionContext)
        │
[ Execution Handoff Boundary ]
        │
        └─> (7) Pass explicit ExecutionRequest to runInternalPipeline() (packages/runtime/)
                  └─> Stage 1..9 Pipeline Execution
                  └─> Deterministic Execution Receipt & Execution Output
```

---

## 4. Key Architectural Invariants Verified

1. **Singular Asset Reality**: GS1 and DPP compose over the exact same `IdentityRecord` without creating competing asset representations or mutating underlying registry state.
2. **Epistemic Isolation**: Failure in DPP epistemic fact verification (`UNAVAILABLE`) does NOT degrade or invalidate a valid GS1 composition for the same asset.
3. **Policy Context Isolation**: GS1 authorization does NOT implicitly grant DPP authorization; policy contexts are independently evaluated.
4. **Structural Genericization**: `ApplicationCompositionResolver` provides domain-agnostic composition mechanics without hardcoded `if (domain === "...")` branching.
5. **Runtime Isolation**: The Runtime pipeline (`packages/runtime/`) remains 100% untouched and completely unaware of domain semantics.

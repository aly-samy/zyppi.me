# AMS-0853 — Deliverable D3: Application Resolver Component / Boundary Diagram

**Program:** CAW-011 — Commerce Atlas Wedge
**Milestone:** M08.5 — Z-PROF Profile Architecture
**Mandate:** AMS-0853
**Document ID:** `AMS-0853-BOUNDARY-DIAGRAM`
**Version:** v1.0
**Status:** MATERIALIZED

---

## 1. Architectural Component & Boundary Diagram

The following C4-style boundary diagram illustrates the ownership, retrieval, composition, and execution boundaries established by the GS1 Z-PROF Application Composition Bridge:

```text
                    ┌──────────────────────────┐
                    │ Static GS1 Z-PROF        │
                    │ Domain Template Card     │
                    │ (apps/api/src/zprof)     │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ Epistemic Requirements   │
                    │ Declarative / No DSL     │
                    │ (apps/api/src/zprof)     │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ Composition Resolver     │
                    │ Application Boundary     │
                    │ (Application Composition)│
                    └──────┬─────────┬─────────┘
                           │         │
                    Registry         Evidence
                   (Read-Only)      (Read-Only)
                           │         │
                           └────┬────┘
                                ▼
                    ┌──────────────────────────┐
                    │ CompositionManifest      │
                    │ Structural Binding Only  │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ Bound Constitutional     │
                    │ Payload                  │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ Existing ACV             │
                    │ (packages/domain)        │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ Existing M08 Runtime     │
                    │ (packages/runtime)       │
                    └──────────────────────────┘
```

---

## 2. Boundary Ownership Matrix

| Layer / Component                | Location                                    | Ownership           | Boundary Constraints                                                            |
| :------------------------------- | :------------------------------------------ | :------------------ | :------------------------------------------------------------------------------ |
| **Static GS1 Fixtures**          | `apps/api/src/zprof/fixtures/`              | Application Fixture | Pure, frozen, versioned V1 fixtures. No lifecycle state machine or persistence. |
| **Application Resolver**         | `apps/api/src/zprof/compositionResolver.ts` | Application Layer   | Reads Registry/Evidence read-only. Preserves epistemic uncertainty.             |
| **CompositionManifest**          | `apps/api/src/zprof/types.ts`               | Application Binding | Structural binding artifact only. Never enters `packages/runtime/`.             |
| **Bound Constitutional Payload** | `apps/api/src/zprof/types.ts`               | Application Payload | Derived application-layer payload containing ACV and EvidenceBundle.            |
| **ActiveConstitutionalView**     | `packages/domain/src/index.ts`              | Shared Domain Model | **UNTOUCHED**. Unaware of Z-PROF or GS1 semantics.                              |
| **M08 Pipeline Runtime**         | `packages/runtime/src/pipeline.ts`          | Execution Engine    | **UNTOUCHED**. Executes `ExecutionRequest` without Z-PROF awareness.            |

---

## 3. Disappearance Test Boundary Proof

```text
Path A: Z-PROF Composition Bridge
GS1 Request → Application Composition Resolver → CompositionManifest → ACV → Runtime → Receipt

Path B: Direct Constitutional Assembly
Equivalent Constitutional Inputs → ACV → Runtime → Receipt
```

**Verdict:** Path A and Path B produce identical execution outcomes (`materialized`), identical trust results, identical ACV/policy/bundle digests, and identical receipt structures. Removing Z-PROF does not alter downstream execution or constitutional validity.

---

**END OF BOUNDARY DIAGRAM SPECIFICATION**

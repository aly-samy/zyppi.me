# AMS-0855 — Registry Generalization Boundary Specification

**Program:** CAW-011 — Commerce Atlas Wedge
**Milestone:** M08.5 — Z-PROF Profile Architecture
**Mandate ID:** AMS-0855
**Deliverable:** D1
**Title:** Registry Generalization Boundary Specification
**Implementation Authority:** **AUTHORIZED — LIMITED TO THIS MANDATE**
**Production Code Authority:** **Application layer only (`apps/api/src/zprof/`)**
**Runtime Authority:** **NONE**
**Registry Semantic Modification Authority:** **NONE**
**API / HTTP Authority:** **NONE — DEFERRED TO M09 / AMS-0901**

---

## 1. Executive Summary & Purpose

AMS-0855 establishes the generalized Application-layer composition boundary required to demonstrate that Z-PROF scales across multiple commerce domains (including GS1 and Digital Product Passport / DPP) without:
1. creating a domain-specific Registry architecture;
2. creating a parallel constitutional substrate or second Registry database;
3. adding domain-specific schema tables or persistence adapters;
4. introducing executable interrogation languages or Shadow DSLs;
5. altering the M08 Runtime or Runtime execution pipeline.

This document materializes Deliverable D1 for AMS-0855. It defines what AMS-0855 consumes from the Registry, what it does not own, how domain-neutral retrieval is performed, how references are resolved, why GS1 and DPP use the exact same resolution mechanism, and the governing Application vs. Infrastructure ownership boundaries.

---

## 2. Governing Invariant: Registry Truth vs Z-PROF Composition vs Application Retrieval

AMS-0855 maintains a strict distinction between three distinct operational concepts:

```
┌──────────────────────────────┐
│        Registry Truth        │  Owned by Infrastructure & Constitutional Substrate
│ (Read-only, sovereign, state)│  (IdentityRecords, Capabilities, Standings, Authorities)
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│    Application Retrieval     │  Owned by Application Layer
│   (Read-only, I/O, Seam)     │  (RegistryRepository.lookup, EvidenceReferenceResolver)
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      Z-PROF Composition      │  Owned by Application Z-PROF Seam
│ (Declarative, Pure, Bound)   │  (CompositionManifest, BoundConstitutionalPayload)
└──────────────────────────────┘
```

1. **Registry Truth $\neq$ Z-PROF Composition:** The Registry stores sovereign facts regarding identities, relationships, authorities, standings, capabilities, evidence references, and policies. Z-PROF does not own or alter these facts; it declares, composes, validates, and explicitly version-binds them into a `BoundConstitutionalPayload`.
2. **Z-PROF Composition $\neq$ Application Retrieval:** Application Retrieval performs I/O against persistence layers via `RegistryRepository` interfaces. Z-PROF composition receives retrieved state, performs deterministic compatibility and version validation, and produces a pure, declarative bound output.
3. **Registry Truth $\neq$ Application Retrieval:** Application retrieval is an operational bridge to fetch state; it does not dictate or alter what constitutes sovereign Registry truth.

---

## 3. What AMS-0855 Consumes from the Registry

The generalized Application composition resolver (`ApplicationCompositionResolver` in `apps/api/src/zprof/compositionResolver.ts`) consumes existing Registry interfaces and structures read-only:

1. `RegistryRepository.lookup(identifier: ValidatedCanonicalIdentifier)`: Retrieves `RetrievedRegistryState` consisting of:
   - `identity`: Sovereign `IdentityRecord` for the requested referent.
   - `relationships`: Readonly collection of `ReferentRecord` structures (brand, manufacturer, product).
   - `standings`: Readonly collection of `StandingRecord` structures.
   - `authorities`: Readonly collection of `AuthorityRecord` structures.
   - `capabilities`: Readonly collection of `CapabilityRecord` structures.
   - `evidenceReferences`: Readonly collection of `EvidenceRecord` structures.
   - `applicablePolicies`: Readonly collection of `PolicyRecord` structures.
2. `RegistryEvidenceResolver`: Resolves metadata for referenced evidence items.
3. `ObjectStorageEvidencePayloadProvider`: Retrieves physical evidence payloads read-only.

---

## 4. What Z-PROF Does NOT Own

Z-PROF acts strictly as connective architecture. Per `CONTRACT-R1` and AMS-0852, Z-PROF does **not** own:

- **Reality or Physical Goods:** Asset reality is anchored in Registry state.
- **Registry Truth or Persistence:** Managed by `infra/` and `@zyppi/contracts`.
- **Evidence or Payload Storage:** Managed by R2/Object Storage and `@zyppi/contracts`.
- **ARM Profiles:** Owned by Asset Reality Model authorities (`arm:profile:trade_item:v1`).
- **PRJ Projection Specs:** Owned by PRJ authorities.
- **RSN Reasoning Blueprints:** Owned by RSN authorities.
- **POL Policy Requirements:** Owned by Policy authorities.
- **SEC Security Requirements:** Owned by Security authorities.
- **RI Capability Requirements:** Owned by Runtime Infrastructure authorities.
- **Runtime Execution:** Owned by `@zyppi/runtime`.
- **Infrastructure or Transport:** Owned by API/HTTP transport layers in M09.

---

## 5. Domain-Neutral Retrieval & Reference Resolution

Retrieval is performed without domain-specific branching or dedicated database queries:

```
Identifier (e.g. GTIN / Canonical ID)
               │
               ▼
  RegistryRepository.lookup()
               │
               ▼
    RetrievedRegistryState
               │
               ├──────────────────────────┐
               ▼                          ▼
     GS1 Composition Path       DPP Composition Path
               │                          │
               └────────────┬─────────────┘
                            ▼
           Generalized Compatibility & Version Validation
                            │
                            ▼
              Validated Bound Composition
```

- **Single Query Interface:** Both GS1 and DPP compositions pass the same `ValidatedCanonicalIdentifier` to `RegistryRepository.lookup()`.
- **Zero Domain Query Logic:** The database query does not filter on "GS1" or "DPP". It returns the complete `RetrievedRegistryState` graph associated with the identifier.
- **Generic Fact Evaluation:** Epistemic facts required by DTCs (primaryIdentifier, authorityId, materialComposition, etc.) are evaluated structurally over the returned `RetrievedRegistryState` without custom SQL queries or domain-specific DB tables.

---

## 6. Why No Second Registry or Domain-Specific Schema Is Required

Building a domain-specific Registry for each new commerce domain creates exponential complexity ($N \text{ domains} \times M \text{ schemas}$). AMS-0855 proves that domain expansion requires zero new Registry infrastructure because:

1. **Uniform Identity Substrate:** All commerce entities (trade items, passports, organizations) are represented as standard `IdentityRecord`s in the existing Registry `identity` table.
2. **Extensible Capabilities:** Domain-specific facts (e.g., material composition for DPP, brand owner for GS1) are stored as standard `CapabilityRecord` entries with explicit `scope` strings.
3. **Generic Epistemic Requirement Contracts:** Epistemic requirements declare what facts are mandatory (`MANDATORY` / `OPTIONAL`). The generalized resolver matches declared facts against retrieved capabilities without schema modifications.
4. **Single Application Seam:** `ApplicationCompositionResolver` handles both GS1 and DPP declarations using identical code paths.

---

## 7. Application / Infrastructure Ownership Boundaries

| Operational Seam | Responsible Layer | Permitted Authority in AMS-0855 |
| :--- | :--- | :--- |
| Database Persistence & Schema | `infra/` / PostgreSQL | **NONE** — Read-only consumption via `RegistryRepository` |
| Infrastructure Data Retrieval | Application (`apps/api/src/`) | **AUTHORIZED** — via `RegistryRepository` and evidence resolvers |
| Z-PROF Declaration & Binding | Application (`apps/api/src/zprof/`) | **AUTHORIZED** — Generalized composition, version & compatibility validation |
| Pipeline Execution & Verification | Runtime (`packages/runtime/`) | **NONE** — Zero modifications to Runtime |
| HTTP Route / API Exposure | API Transport (M09 / `apps/api/src/http`) | **NONE** — Deferred to M09 / AMS-0901 |

---

## 8. Summary & Conclusion

AMS-0855 establishes that Registry Generalization is achieved by keeping the Registry substrate sovereign and domain-neutral, while generalizing the Application composition seam to evaluate any domain declaration (GS1, DPP, etc.) deterministically.

This completes Deliverable D1 for AMS-0855.

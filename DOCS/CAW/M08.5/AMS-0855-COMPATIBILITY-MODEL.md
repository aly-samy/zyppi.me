# AMS-0855 — Z-PROF Compatibility Model Specification

**Program:** CAW-011 — Commerce Atlas Wedge
**Milestone:** M08.5 — Z-PROF Profile Architecture
**Mandate ID:** AMS-0855
**Deliverable:** D2
**Title:** Compatibility Model Specification
**Implementation Authority:** **AUTHORIZED — LIMITED TO THIS MANDATE**
**Production Code Authority:** **Application layer only (`apps/api/src/zprof/`)**
**Runtime Authority:** **NONE**

---

## 1. Executive Summary & Purpose

AMS-0855 defines and implements the deterministic, 10-point structural and contractual compatibility model required for Z-PROF compositions. Compatibility is **not** generic SemVer range guesswork or floating version overlap. It is the deterministic evaluation of declared structural, contractual, epistemic, and authority relationships across all referenced capabilities prior to producing a `BoundConstitutionalPayload` or crossing toward Runtime.

This document materializes Deliverable D2 for AMS-0855, restoring exact traceability to the 10 canonical compatibility checks established by AMS-0852.

---

## 2. Compatibility Is Not SemVer Guesswork

Generic SemVer range resolution (e.g. `^1.0.0` overlapping with `>=1.2.0`) is prohibited in Z-PROF compositions for three reasons:

1. **Determinism Hazard:** Floating ranges permit ambient version movement where identical composition requests resolve to different concrete artifacts over time.
2. **Authority Hazard:** SemVer range syntax assumes ambient package registry discovery, which violates explicit version binding and explicit authorization.
3. **Semantic Inadequacy:** Two artifacts may share compatible SemVer numbers while being contractually, epistemically, or domain-scoped as incompatible.

Compatibility in AMS-0855 is evaluated strictly from the **declared structural and contractual relationships** materialized in the DTC, Epistemic Requirements, and retrieved Registry state.

---

## 3. Canonical 10-Check Compatibility Traceability Matrix

The generalized Application composition resolver (`ApplicationCompositionResolver` in `apps/api/src/zprof/compositionResolver.ts`) executes `validateCompositionCompatibility()` in `apps/api/src/zprof/compatibilityValidator.ts`, evaluating the exact 10 canonical AMS-0852 checks:

```
┌────────────────────────────────────────────────────────────────────────────────┐
│               Canonical 10-Check Compatibility Traceability Matrix             │
├────────────────────────────────────────────────────────────────────────────────┤
│  1. Referenced Artifact Existence    │  6. Absence of Prohibited Capabilities  │
│  2. Authorized References            │  7. Profile Isolation Preservation      │
│  3. Version Compatibility            │  8. No New Constitutional Primitive     │
│  4. Satisfiable Dependencies         │  9. Provenance Satisfaction            │
│  5. Unambiguous Ownership            │ 10. Declared Domain Scope Boundary      │
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       │
                                       ▼
                 Pass: Validated Bound Composition
                 Fail: Closed Rejection (Closed 8-Code Error Taxonomy)
```

| Canonical AMS-0852 Check                  | Implementation Subchecks in `compatibilityValidator.ts`                                                                         | Test Evidence          | Failure Code                                            |
| :---------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ | :--------------------- | :------------------------------------------------------ |
| **1. Referenced Artifact Existence**      | Verifies DTC fixture and Epistemic Requirement contracts are defined and populated.                                             | Test C, Test P         | `missing` / `unavailable`                               |
| **2. Authorized References**              | Verifies retrieved identity and authority status are active (rejects `revoked`, `suspended`, `unauthorized`, `decommissioned`). | Test N                 | `unauthorized`                                          |
| **3. Version Compatibility**              | Validates strict `X.Y.Z` SemVer explicit version binding and verifies `dtc.versionConstraints`.                                 | Test K, Test L, Test M | `invalid` (floating syntax) / `incompatible` (mismatch) |
| **4. Satisfiable Dependencies**           | Verifies dependency nodes and edges form a closed graph without dangling references.                                            | Test A, Test B         | `invalid`                                               |
| **5. Unambiguous Ownership**              | Inspects referents/relationships for conflicting brand or manufacturer claims over the identity.                                | Test O                 | `conflicting`                                           |
| **6. Absence of Prohibited Capabilities** | Validates mandatory facts against retrieved state capabilities without requesting prohibited scopes.                            | Test C, Test D, Test P | `missing` / `incompatible`                              |
| **7. Profile Isolation Preservation**     | Enforces mutual profile isolation (e.g. Trade Item profile cannot compose with Patient profile).                                | Test P                 | `conflicting` / `incompatible`                          |
| **8. No New Constitutional Primitive**    | Verifies composition output contains only authorized schema fields and no invented primitives.                                  | Test A, Test B         | `invalid`                                               |
| **9. Provenance Satisfaction**            | Verifies required author identity and evidence references/payloads pass preflight verification.                                 | Test A, Test B         | `unverified`                                            |
| **10. Declared Domain Scope Boundary**    | Verifies domain scope compatibility (rejects combining Healthcare Patient requirements with GS1/DPP DTCs).                      | Test P (AC-16)         | `incompatible`                                          |

---

## 4. Closed 8-Code Failure Taxonomy Mapping

Per Council decisions and AMS-0852, no new failure code may be created. AMS-0855 maps all composition failure conditions into the closed eight-code taxonomy according to failure semantics:

| Failure Condition                                            | Required Failure Code | Error Category      |
| :----------------------------------------------------------- | :-------------------- | :------------------ |
| Requested domain or DTC format unsupported                   | `unsupported`         | Composition Failure |
| Registry or evidence storage temporarily unavailable         | `unavailable`         | Composition Failure |
| Mandatory artifact, fact, or evidence record missing         | `missing`             | Composition Failure |
| Structurally valid version or domain scope incompatible      | `incompatible`        | Composition Failure |
| Contradictory ownership, policy, or profile declarations     | `conflicting`         | Composition Failure |
| Identity or authority revoked, suspended, or unauthorized    | `unauthorized`        | Composition Failure |
| Evidence verification or required provenance unverified      | `unverified`          | Composition Failure |
| Prohibited floating version, malformed specifier or topology | `invalid`             | Composition Failure |

---

## 5. No New Cryptographic Semantics (Council Gap 4 Preserved)

In accordance with Council Gap 4:

- Compatibility validation **does not** depend on creating a new manifest hash domain, digest prefix, canonicalization protocol, or cryptographic key scheme.
- Cryptographic identity is **not** used as a substitute for structural compatibility semantics.
- Manifest canonicalization and hashing remain explicitly deferred to later Council decisions.

---

## 6. Summary & Conclusion

The AMS-0855 Compatibility Model restores exact 1-to-1 traceability to the 10 canonical AMS-0852 checks, replacing floating SemVer speculation with a pure, deterministic structural and contractual validation procedure that fails closed before crossing toward the M08 Runtime.

This completes Deliverable D2 for AMS-0855.

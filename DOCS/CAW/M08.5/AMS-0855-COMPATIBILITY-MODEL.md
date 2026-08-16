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

This document materializes Deliverable D2 for AMS-0855. It documents the 10 compatibility checks, the failure taxonomy mapping, and the quarantine of cryptographic semantics.

---

## 2. Compatibility Is Not SemVer Guesswork

Generic SemVer range resolution (e.g. `^1.0.0` overlapping with `>=1.2.0`) is prohibited in Z-PROF compositions for three reasons:
1. **Determinism Hazard:** Floating ranges permit ambient version movement where identical composition requests resolve to different concrete artifacts over time.
2. **Authority Hazard:** SemVer range syntax assumes ambient package registry discovery, which violates explicit version binding and explicit authorization.
3. **Semantic Inadequacy:** Two artifacts may share compatible SemVer numbers while being contractually, epistemically, or domain-scoped as incompatible.

Compatibility in AMS-0855 is evaluated strictly from the **declared structural and contractual relationships** materialized in the DTC, Epistemic Requirements, and retrieved Registry state.

---

## 3. The 10-Point Compatibility Validation Procedure

The generalized Application composition resolver (`ApplicationCompositionResolver` in `apps/api/src/zprof/compositionResolver.ts`) executes `validateCompositionCompatibility()` in `apps/api/src/zprof/compatibilityValidator.ts`, evaluating the following ten checks in order:

```
┌────────────────────────────────────────────────────────────────────────┐
│               10-Point Compatibility Validation Procedure               │
├────────────────────────────────────────────────────────────────────────┤
│  1. Artifact Existence          │  6. Dependency Closure               │
│  2. Authorization              │  7. Ownership Uniqueness             │
│  3. Explicit Version Binding    │  8. Domain-Scope Compatibility       │
│  4. Declared Version Constraints│  9. Profile Isolation                │
│  5. Capability Compatibility   │ 10. Provenance Satisfaction         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
             Pass: Validated Bound Composition
             Fail: Closed Rejection (Closed 8-Code Error Taxonomy)
```

### 3.1 Check 1 — Artifact Existence
- **Evaluation:** Verifies that the requested DTC, Epistemic Requirements contracts, ARM Profiles, PRJ specifications, and RSN blueprints exist in the authorized substrate.
- **Failure Code:** `missing` (or `unavailable` if temporary network/repository retrieval failure).

### 3.2 Check 2 — Authorization
- **Evaluation:** Verifies that the retrieved referent identity and authorities are currently active and authorized. Rejects identities with status `revoked`, `suspended`, `unauthorized`, or `decommissioned`.
- **Failure Code:** `unauthorized`.

### 3.3 Check 3 — Explicit Version Binding
- **Evaluation:** Verifies that every version specifier across DTCs, options, epistemic requirements, and profiles is explicit (e.g. `"1.0.0"`). Rejects floating or wildcard specifiers (`latest`, `*`, `^1.x`, `>=1.0`, etc.).
- **Failure Code:** `invalid`.

### 3.4 Check 4 — Declared Version Constraints
- **Evaluation:** Compares provided explicit versions against explicit version constraints declared in `dtc.versionConstraints`.
- **Failure Code:** `incompatible` if explicit versions do not satisfy explicit constraint requirements. (`invalid` if constraint syntax itself is malformed or floating).

### 3.5 Check 5 — Capability / Requirement Compatibility
- **Evaluation:** Evaluates mandatory facts declared in Epistemic Requirements against facts and capabilities in `RetrievedRegistryState` (e.g. GTIN identity, authorityId, materialComposition capability).
- **Failure Code:** `missing` if mandatory fact is absent; `incompatible` if capability scope is incompatible.

### 3.6 Check 6 — Dependency Closure
- **Evaluation:** Verifies that all dependency nodes and edges declared in `dtc.dependencyTopology` form a closed, valid graph without dangling references.
- **Failure Code:** `invalid`.

### 3.7 Check 7 — Ownership Uniqueness
- **Evaluation:** Inspects referents and relationships in `RetrievedRegistryState` for conflicting ownership or multiple distinct brand/manufacturer claims over the same identity.
- **Failure Code:** `conflicting`.

### 3.8 Check 8 — Domain-Scope Compatibility
- **Evaluation:** Verifies that epistemic requirements and target dimensions match the DTC's domain identifier and scope. For example, attempting to combine a `HEALTHCARE_PATIENT` epistemic requirement with a `GS1 Trade Item` DTC is rejected deterministically.
- **Failure Code:** `incompatible`.

### 3.9 Check 9 — Profile Isolation
- **Evaluation:** Verifies that ARM profiles across combined declarations do not violate mutual profile isolation (e.g., Trade Item profile combined with Patient profile).
- **Failure Code:** `conflicting` or `incompatible`.

### 3.10 Check 10 — Provenance Satisfaction
- **Evaluation:** Evaluates DTC provenance requirements (`requireAuthorIdentity`, `requireRegistrationReceipt`) and evidence verification reports.
- **Failure Code:** `unverified`.

---

## 4. Closed 8-Code Failure Taxonomy Mapping

Per Council decisions and AMS-0852, no new failure code may be created. AMS-0855 maps all composition failure conditions into the closed eight-code taxonomy according to failure semantics:

| Failure Condition | Required Failure Code | Error Category |
| :--- | :--- | :--- |
| Requested domain or DTC format unsupported | `unsupported` | Composition Failure |
| Registry or evidence storage temporarily unavailable | `unavailable` | Composition Failure |
| Mandatory artifact, fact, or evidence record missing | `missing` | Composition Failure |
| Structurally valid version or domain scope incompatible | `incompatible` | Composition Failure |
| Contradictory ownership, policy, or profile declarations | `conflicting` | Composition Failure |
| Identity or authority revoked, suspended, or unauthorized | `unauthorized` | Composition Failure |
| Evidence verification or required provenance unverified | `unverified` | Composition Failure |
| Prohibited floating version, malformed specifier or topology | `invalid` | Composition Failure |

---

## 5. No New Cryptographic Semantics (Council Gap 4 Preserved)

In accordance with Council Gap 4:
- Compatibility validation **does not** depend on creating a new manifest hash domain, digest prefix, canonicalization protocol, or cryptographic key scheme.
- Cryptographic identity is **not** used as a substitute for structural compatibility semantics.
- Manifest canonicalization and hashing remain explicitly deferred to later Council decisions.

---

## 6. Summary & Conclusion

The AMS-0855 Compatibility Model replaces floating SemVer speculation with a pure, deterministic 10-check structural and contractual validation procedure, enforcing fail-closed composition safety before anything can cross toward the M08 Runtime.

This completes Deliverable D2 for AMS-0855.

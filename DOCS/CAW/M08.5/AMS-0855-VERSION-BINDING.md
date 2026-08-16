# AMS-0855 — Z-PROF Explicit Version Binding Specification

**Program:** CAW-011 — Commerce Atlas Wedge
**Milestone:** M08.5 — Z-PROF Profile Architecture
**Mandate ID:** AMS-0855
**Deliverable:** D3
**Title:** Explicit Version Binding Specification
**Implementation Authority:** **AUTHORIZED — LIMITED TO THIS MANDATE**
**Production Code Authority:** **Application layer only (`apps/api/src/zprof/`)**
**Runtime Authority:** **NONE**

---

## 1. Executive Summary & Purpose

AMS-0855 operationalizes the ratified constitutional requirement that **all referenced capabilities in a Z-PROF composition SHALL be explicitly version-bound; floating, wildcard, and unversioned references are strictly prohibited**.

This document materializes Deliverable D3 for AMS-0855. It documents explicit version binding rules, strict `X.Y.Z` semantic version grammar, prohibited floating forms, validation mechanics, and the fundamental architectural distinction between Version Compatibility and Constitutional Validity.

---

## 2. Ratified Constitutional Requirement

AMS-0852 records as `[RATIFIED / EXISTING]` the invariant:

> _All referenced capabilities in a CompositionManifest SHALL be explicitly version-bound; floating and wildcard references are prohibited._

AMS-0855 converts this specification into executable Application-layer validation (`versionValidator.ts` and `compatibilityValidator.ts`).

---

## 3. Strict SemVer Grammar & Prohibited Floating Forms

The Application composition layer enforces strict concrete Semantic Versioning (`X.Y.Z`) and rejects any composition input containing floating, range-based, wildcard, partial, or unversioned references.

### Strict Concrete SemVer Grammar (Required)

```regex
^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$
```

- **Accepted Forms:** Concrete 3-part SemVer strings e.g. `"1.0.0"`, `"1.0.1"`, `"2.1.0-alpha.1"`.

### Prohibited Forms (Failure Code: `invalid`)

- **`latest`**: Ambient/default version discovery.
- **`*`**: Unconstrained wildcard.
- **`^1.x`**, **`^1.0.0`**: Caret SemVer range.
- **`~1.0.0`**: Tilde SemVer range.
- **`>=1.0`**, **`<=2.0`**: Comparison operators.
- **`1.x`**, **`1.0.x`**: Wildcard positions.
- **`v1`**, **`1.0`**: Partial/non-standard major-only or minor-only forms.
- **`unversioned reference`**: Missing version field or empty string.
- **`ambient version discovery`**: Inferring versions from external environment or filesystem.

---

## 4. Version Compatibility vs Constitutional Validity

AMS-0855 enforces a strict conceptual and operational distinction between Resolution Compatibility and Constitutional Validity:

```
┌───────────────────────────────┐
│        Version Exists         │  Artifact is present in repository/substrate
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│      Version Compatible       │  Artifact satisfies explicit version binding & structural constraints
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│      Version Authorized       │  Identity & authority status is active (not revoked/suspended/decommissioned)
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│       Version Verified        │  Evidence payload & hashes match registered evidence bundle
└──────────────┬────────────────┘
```

$$\text{Existence} \neq \text{Compatibility} \neq \text{Authorization / Constitutional Validity} \neq \text{Verification}$$

- An artifact version may **exist** in storage, yet be **incompatible** with requested DTC constraints.
- An artifact version may be structurally **compatible**, yet **unauthorized** because the issuing authority is revoked or decommissioned.
- An artifact version may be **authorized**, yet **unverified** because evidence hash verification failed.

AMS-0855 respects existing authoritative identity statuses (`active`, `draft`, `decommissioned`) from `@zyppi/domain` without creating new lifecycle state machines. Each condition maps to its distinct error code in the closed taxonomy (`missing`, `incompatible`, `unauthorized`, `unverified`).

---

## 5. DTC Lifecycle & Revocation (Council Gap 1 Preserved)

In accordance with Council Gap 1:

- AMS-0855 **does not** create a DTC lifecycle state machine, deprecation engine, or registration authority.
- DTC status defaults to static authorized fixtures (`version: "1.0.0"`).
- If an artifact's status cannot be established from retrieved Registry state, the Application fails closed using `unauthorized` or `unavailable` without inventing a lifecycle state machine.

---

## 6. Deterministic Rule of Silence

If a referenced version or capability cannot be resolved from the authorized substrate, the Application layer fails explicitly.

Per the **Rule of Silence**, the Application SHALL NOT:

- infer the artifact;
- substitute another version;
- substitute the latest version;
- construct a stub or mock;
- synthesize a capability;
- silently omit the dependency;
- continue with partial authorization.

---

## 7. Summary & Conclusion

Explicit Version Binding in AMS-0855 guarantees that Z-PROF compositions are 100% deterministic and replayable across time and environments, eliminating ambient version movement and floating dependencies.

This completes Deliverable D3 for AMS-0855.

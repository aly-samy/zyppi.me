# AMS-0852 — Z-PROF Contract Specification

**Program:** CAW-011 — Commerce Atlas Wedge
**Milestone:** M08.5 — Z-PROF Profile Architecture
**Mandate:** AMS-0852
**Document ID:** `AMS-0852-CONTRACT-SPEC`
**Version:** v1.0
**Status:** MATERIALIZED
**Implementation Authority:** **NONE**
**Documentation / Contract-Specification Materialization Authority:** **LIMITED TO THE DELIVERABLES EXPLICITLY AUTHORIZED BY AMS-0852.**
**Predecessors:** `CONTRACT-R1`, `Z-PROF-001`, `M08.5-PLAN` v1.1, `AMS-0851-EVR`
**Assigned Agent:** Jules — AI Software Engineer

---

## 1. Executive Summary & Constitutional Position

### 1.1 Purpose

This document materializes the implementation-ready contract specification for the **Z-PROF Profile Architecture** under the ratified and closed contract boundary established by `CONTRACT-R1`.

Z-PROF is **connective architecture**, not a new constitutional organ. Its purpose is to define how governed domain participation is declared, composed, validated, and traced across existing Zyppi constitutional capabilities without acquiring ownership of those capabilities or creating competing ontologies, Reality models, Asset Profile systems, execution engines, or security constitutions.

### 1.2 Non-Authority & Strict Boundary Directive

Per `CONTRACT-R1`, `M08.5-PLAN` v1.1, and the binding Council execution order for AMS-0852:

1. **Implementation Authority is NONE.** AMS-0852 does NOT authorize production package creation (`packages/`), production DTCs, production CompositionManifests, Runtime modifications (`packages/runtime/`), Registry schema alterations (`infra/`), or code changes in `apps/`.
2. **`CONTRACT-R1` is RATIFIED — CLOSED.** AMS-0852 does NOT reopen, redesign, replace, or alter `CONTRACT-R1`.
3. **Four-Tier Status Taxonomy.** Every material contractual element, field, boundary, and constraint in this specification carries an explicit status badge:
   - `[RATIFIED / EXISTING]` — Formally ratified by `CONTRACT-R1`, `Z-PROF-001`, or earlier constitutional baselines.
   - `[DEFINED BY AMS-0852]` — Materialized and specified under the explicit authority of AMS-0852.
   - `[DEFERRED TO LATER AMS]` — Recognized as a necessary implementation step, deferred to a future authorized AMS.
   - `[UNRESOLVED — COUNCIL DECISION REQUIRED]` — Recognized as a genuine semantic or architectural gap requiring Council decision.

---

## 2. Governing Baseline & Contract Lineage

```
                          ZYPPI CONSTITUTION
                                  │
                                  ▼
                         Z-PROF-001 (v1.2)
                     [Integrated Constitution]
                                  │
                                  ▼
                            CONTRACT-R1
                   [Closed Contract Set Boundary]
                                  │
                                  ▼
                          M08.5-PLAN (v1.1)
                 [Implementation-Governance Plan]
                                  │
                                  ▼
                              AMS-0852
               [Contract Specification Materialization]
                                  │
            ┌─────────────────────┴─────────────────────┐
            ▼                                           ▼
AMS-0852-CONTRACT-SPEC.md                       AMS-0852-EVR.md
       (Deliverable D2)                               (Deliverable D1)
```

The governing execution separation across layers remains:

```
Z-PROF declares
       ↓
Application resolves
       ↓
Existing constitutional authorities govern
       ↓
Runtime executes
```

---

## 3. CONTRACT-01 — Domain Template Card (DTC) Specification

### 3.1 Definition & Nature

- **Status:** `[RATIFIED / EXISTING]`
- **Authority:** Z-PROF.
- **Nature:** Standardized authoring and registration instrument; declarative; non-executable; non-Runtime; non-infrastructural; non-ontological.
- **Governing Question:** _What is this domain, what does it require from Zyppi, and which existing constitutional capabilities satisfy those requirements?_

### 3.2 Sovereignty & ARM Profile Boundary

- **Status:** `[RATIFIED / EXISTING]`
- **Constraint:** `Domain Template Card ≠ ARM Profile`.
- The DTC preserves ARM Profile sovereignty. ARM Profiles remain asset-class specializations owned by ARM. The DTC defines domain participation requirements over existing Asset Realities without creating asset-class specializations or duplicating ARM Profiles.

### 3.3 Authoritative Fields & Specification Schema

The structural specification of a Domain Template Card is defined as follows:

```json
{
  "$schema": "https://zyppi.org/schemas/v1/dtc.json",
  "dtcId": "dtc:zyppi:domain:gs1:v1",
  "domainIdentifier": "domain:gs1",
  "domainName": "GS1 Commerce Atlas Domain",
  "version": "1.0.0",
  "scope": "Retail commerce, GTIN identification, and GS1 Digital Link resolution",
  "applicableAssetClasses": ["asset:class:trade_item:v1"],
  "applicableArmProfiles": ["arm:profile:trade_item:v1"],
  "epistemicRequirements": [
    "epistemic:req:gtin_identification:v1",
    "epistemic:req:brand_owner_authority:v1"
  ],
  "requiredPrjSpecifications": ["prj:spec:gs1_digital_link_projection:v1"],
  "requiredRsnBlueprints": ["rsn:blueprint:gs1_identity_verification:v1"],
  "requiredContextDimensions": [
    "context:dimension:valid_time",
    "context:dimension:jurisdiction"
  ],
  "applicablePolRequirements": ["pol:req:active_standing:v1"],
  "applicableSecRequirements": ["sec:req:sha256_payload_integrity:v1"],
  "requiredRiCapabilities": ["ri:capability:stage7_ast_evaluation:v1"],
  "versionConstraints": {
    "armProfileMinVersion": "1.0.0",
    "prjSpecMinVersion": "1.0.0"
  },
  "provenanceRequirements": {
    "requireRegistrationReceipt": true,
    "requireAuthorIdentity": true
  }
}
```

### 3.4 Normative Field Classification Matrix

| Field                       | Status                  | Owner            | Description                                                      |
| :-------------------------- | :---------------------- | :--------------- | :--------------------------------------------------------------- |
| `dtcId`                     | `[DEFINED BY AMS-0852]` | Z-PROF           | Globally unique URN identifying the Domain Template Card.        |
| `domainIdentifier`          | `[RATIFIED / EXISTING]` | Z-PROF           | Reference to the registered domain identity (e.g. `domain:gs1`). |
| `version`                   | `[RATIFIED / EXISTING]` | Z-PROF           | Explicit semantic version string (`X.Y.Z`).                      |
| `applicableArmProfiles`     | `[RATIFIED / EXISTING]` | ARM / Z-PROF     | List of authorized ARM Profile references.                       |
| `epistemicRequirements`     | `[DEFINED BY AMS-0852]` | Shared Substrate | References to declared Epistemic Requirement Contracts.          |
| `requiredPrjSpecifications` | `[RATIFIED / EXISTING]` | PRJ              | References to PRJ-owned projection specifications.               |
| `requiredRsnBlueprints`     | `[RATIFIED / EXISTING]` | RSN              | References to RSN-owned reasoning blueprints.                    |
| `applicablePolRequirements` | `[RATIFIED / EXISTING]` | POL              | Policy requirements declared for domain participation.           |
| `applicableSecRequirements` | `[RATIFIED / EXISTING]` | SEC              | Security / trust requirements declared for domain participation. |
| `requiredRiCapabilities`    | `[RATIFIED / EXISTING]` | RI               | Runtime execution capabilities required by the domain.           |

### 3.5 Prohibited DTC Capabilities

- **Status:** `[RATIFIED / EXISTING]`
- A DTC SHALL NOT:
  - create or redefine Reality;
  - create or redefine an ARM Profile;
  - define projection mathematics;
  - define reasoning algorithms;
  - contain executable code or scripting;
  - perform infrastructure retrieval or issue SQL/REST queries;
  - grant authorization or evaluate security access.

### 3.6 Lifecycle Classification (Council Gap #1)

- **Status:** `[UNRESOLVED — COUNCIL DECISION REQUIRED]`
- **Boundary Record:** The governing corpus (`CONTRACT-R1`, `Z-PROF-001`) establishes the DTC as a registered authoring instrument, but does NOT establish its state-transition lifecycle model (e.g. `DRAFT -> PROPOSED -> RATIFIED -> DEPRECATED -> REVOKED`), registration authority mechanisms, or persistence schema. Per §16 of AMS-0852, this detail is recorded strictly as `UNRESOLVED — COUNCIL DECISION REQUIRED` and is NOT resolved by inference.

---

## 4. CONTRACT-02 & CONTRACT-03 — Epistemic Requirement and Interrogation Contract Specification

### 4.1 Epistemic Requirement Contract Definition

- **Status:** `[RATIFIED / EXISTING]`
- **Nature:** Shared constitutional substrate (not a Z-PROF-owned semantic primitive). Z-PROF references and composes it.
- **Governing Distinction:**
  $$\text{What information is required?} \neq \text{How infrastructure retrieves it?}$$

### 4.2 Interrogation Contract Definition

- **Status:** `[RATIFIED / EXISTING]`
- **Authority:** Z-PROF semantic composition boundary.
- **Nature:** Declarative expression of what information must be known or established from the authorized constitutional substrate before a domain composition can proceed.

### 4.3 Normative Specification Representation

```json
{
  "$schema": "https://zyppi.org/schemas/v1/epistemic_requirement.json",
  "requirementId": "epistemic:req:gtin_identification:v1",
  "version": "1.0.0",
  "targetDimension": "Subject",
  "goldenQuestionRef": "Who",
  "requiredFacts": [
    {
      "factKey": "primaryIdentifier.gtin14",
      "optionality": "MANDATORY",
      "expectedType": "string:gtin14"
    },
    {
      "factKey": "brandOwner.gln",
      "optionality": "OPTIONAL",
      "expectedType": "string:gln"
    }
  ],
  "evidenceConstraints": {
    "requireSignedReceipt": true,
    "allowedDigestAlgorithms": ["sha256"]
  },
  "temporalConstraints": {
    "validTimeRequired": true
  }
}
```

### 4.4 Explicit Prohibition — No Shadow DSL

- **Status:** `[RATIFIED / EXISTING]`
- AMS-0852 explicitly PROHIBITS:
  1. A Turing-complete DSL;
  2. A query language (SQL, GraphQL, SPARQL, etc.);
  3. An executable predicate language;
  4. Infrastructure retrieval instructions or network protocol specs;
  5. A second policy or evaluation language;
  6. An alternative reasoning language.
- Interrogation describes **what must be known**, leaving infrastructure retrieval entirely to the Application layer.

### 4.5 Contract Ownership (Council Gap #2)

- **Status:** `[RATIFIED / EXISTING]` for shared substrate classification; `[UNRESOLVED — COUNCIL DECISION REQUIRED]` for exact repository package allocation.
- **Boundary Record:** While `CONTRACT-R1` and `Z-PROF-D5` establish that Epistemic Requirement Contracts belong to a shared constitutional substrate (usable by PRJ, RSN, and Z-PROF), the physical repository package location (e.g. `@zyppi/contracts` vs `@zyppi/epistemic`) remains `UNRESOLVED — COUNCIL DECISION REQUIRED`.

---

## 5. CONTRACT-06 — CompositionManifest Specification

### 5.1 Definition & Nature

- **Status:** `[RATIFIED / EXISTING]`
- **Authority:** Z-PROF.
- **Nature:** The concrete, validated, version-bound representation of a particular domain composition.
- **Governing Question:** _Which governed constitutional artifacts satisfy the requirements of this domain composition, and how are they bound?_

### 5.2 Authoritative Field Structure

```json
{
  "$schema": "https://zyppi.org/schemas/v1/composition_manifest.json",
  "manifestId": "manifest:zyppi:gs1_trade_item:v1:2026-08-10",
  "dtcReference": {
    "dtcId": "dtc:zyppi:domain:gs1:v1",
    "version": "1.0.0"
  },
  "armProfileReference": {
    "profileId": "arm:profile:trade_item:v1",
    "version": "1.2.0"
  },
  "boundEpistemicRequirements": [
    {
      "requirementId": "epistemic:req:gtin_identification:v1",
      "version": "1.0.0"
    }
  ],
  "boundPrjSpecifications": [
    {
      "specId": "prj:spec:gs1_digital_link_projection:v1",
      "version": "1.0.0"
    }
  ],
  "boundRsnBlueprints": [
    {
      "blueprintId": "rsn:blueprint:gs1_identity_verification:v1",
      "version": "1.0.0"
    }
  ],
  "boundPolRequirements": [
    {
      "policyId": "pol:req:active_standing:v1",
      "version": "1.0.0"
    }
  ],
  "boundSecRequirements": [
    {
      "securityReqId": "sec:req:sha256_payload_integrity:v1",
      "version": "1.0.0"
    }
  ],
  "boundRiCapabilities": [
    {
      "capabilityId": "ri:capability:stage7_ast_evaluation:v1",
      "version": "1.0.0"
    }
  ],
  "dependencyTopology": {
    "nodes": [
      "dtc:zyppi:domain:gs1:v1",
      "arm:profile:trade_item:v1",
      "prj:spec:gs1_digital_link_projection:v1"
    ],
    "edges": [
      {
        "from": "dtc:zyppi:domain:gs1:v1",
        "to": "arm:profile:trade_item:v1"
      }
    ]
  },
  "provenanceReferences": {
    "manifestAuthor": "identity:council:admin",
    "createdTimestamp": "2026-08-10T00:00:00Z"
  }
}
```

### 5.3 Prohibited Manifest Contents

- **Status:** `[RATIFIED / EXISTING]`
- A CompositionManifest SHALL NOT contain:
  - canonical Reality or evidence payloads;
  - executable business logic or scripting;
  - a second Registry;
  - Policy authorization overrides;
  - Security key management or trust overrides;
  - Runtime execution authority;
  - Projection generation algorithms.

### 5.4 Canonicalization and Hashing (Council Gap #4)

- **Status:** `[UNRESOLVED — COUNCIL DECISION REQUIRED]`
- **Boundary Record:** While `CompositionManifest` instances require deterministic identification and replayability, the exact domain separation string prefix (e.g. `zyppi:domain:manifest:v1:`) and canonicalization pipeline for manifest digests are not authorized by `CONTRACT-R1` and are recorded as `UNRESOLVED — COUNCIL DECISION REQUIRED`.

---

## 6. CONTRACT-11 & CONTRACT-12 — Composition Validation & Failure Taxonomy

### 6.1 Validation Boundary

- **Status:** `[RATIFIED / EXISTING]`
- Every `CompositionManifest` SHALL be validated before downstream admission. Validation is a structural, reference-based checking process performed prior to constructing Runtime inputs.

### 6.2 Ten Mandatory Validation Checks

1. **Referenced Artifact Existence:** `[RATIFIED / EXISTING]` — All referenced DTCs, ARM Profiles, PRJ Specs, RSN Blueprints, POL requirements, and SEC capabilities exist in the authorized substrate.
2. **Authorized References:** `[RATIFIED / EXISTING]` — All references are explicitly authorized for participation in the declared domain.
3. **Version Compatibility:** `[RATIFIED / EXISTING]` — Bound versions satisfy declared version constraints.
4. **Satisfiable Dependencies:** `[RATIFIED / EXISTING]` — The dependency graph is complete, closed, and contains zero missing edges.
5. **Unambiguous Ownership:** `[RATIFIED / EXISTING]` — Every capability in the composition has exactly one authoritative owner.
6. **Absence of Prohibited Capabilities:** `[RATIFIED / EXISTING]` — The manifest contains no executable code, SQL queries, or unauthorized authority.
7. **Profile Isolation Preservation:** `[RATIFIED / EXISTING]` — No ARM Profile is mutated or cross-contaminated by another Profile.
8. **No New Constitutional Primitive:** `[RATIFIED / EXISTING]` — The composition introduces zero unratified primitives or ontologies.
9. **Provenance Satisfaction:** `[RATIFIED / EXISTING]` — All required provenance references are attached and verified.
10. **Declared Domain Scope Boundary:** `[RATIFIED / EXISTING]` — The composition remains strictly within its declared domain boundaries.

### 6.3 Closed Validation Failure Taxonomy (Council Gap #3)

- **Status:** `[RATIFIED / EXISTING]`
- Per `CONTRACT-R1` §15–16 and AMS-0852 instructions, validation failures SHALL reuse the existing Z-PROF error taxonomy. No parallel error constitution shall be created.

| Validation Error Code | Category            | Cause / Meaning                                                                    |
| :-------------------- | :------------------ | :--------------------------------------------------------------------------------- |
| `unsupported`         | Composition Failure | Requested domain or feature is not supported by the composition substrate.         |
| `unavailable`         | Composition Failure | A referenced constitutional artifact or dependency is currently unavailable.       |
| `missing`             | Composition Failure | A mandatory referenced artifact, field, or dependency is missing.                  |
| `incompatible`        | Composition Failure | Referenced versions or capability contracts are mutually incompatible.             |
| `conflicting`         | Composition Failure | Two or more referenced capabilities assert contradictory composition requirements. |
| `unauthorized`        | Composition Failure | A referenced artifact or capability is not authorized for use by the domain.       |
| `unverified`          | Composition Failure | Provenance or signature requirements for a referenced artifact cannot be verified. |
| `invalid`             | Composition Failure | Manifest structure, syntax, or schema validation failed.                           |

---

## 7. CONTRACT-07 — Bound Constitutional Payload Specification

### 7.1 Definition & Nature

- **Status:** `[RATIFIED / EXISTING]`
- **Nature:** The derived, validated, version-bound, provenance-preserving set of constitutional inputs produced by successful Application-layer resolution of a `CompositionManifest`.

### 7.2 Non-Authoritative Status

- **Status:** `[RATIFIED / EXISTING]`
- The Bound Constitutional Payload is **derived and non-authoritative** over its source artifacts. It does not become a new source of Reality, Identity, or Policy.

### 7.3 Structure & Downstream Admission

```json
{
  "$schema": "https://zyppi.org/schemas/v1/bound_payload.json",
  "payloadId": "bound:payload:gs1_scan:2026-08-10:001",
  "manifestId": "manifest:zyppi:gs1_trade_item:v1:2026-08-10",
  "resolvedActiveConstitutionalView": {
    "policies": [],
    "authorities": [],
    "capabilities": [],
    "standings": []
  },
  "resolvedEvidenceBundle": {
    "schemaVersion": "1.0",
    "evidenceRecords": []
  },
  "executionContext": {
    "executionId": "exec:2026-08-10:001",
    "constitutionalTimestamp": "2026-08-10T00:00:00Z"
  }
}
```

---

## 8. Application / Runtime Boundary & ACV Constraint

### 8.1 Boundary Separation Directive

- **Status:** `[RATIFIED / EXISTING]`
- The governing execution separation is absolute:

```
Z-PROF DECLARES
       ↓
APPLICATION RESOLVES / BINDS
       ↓ (produces Bound Constitutional Payload / ACV inputs)
RUNTIME EXECUTES
```

- **Runtime Non-Responsibility:** The Runtime (`packages/runtime/`) SHALL NOT perform Profile discovery, Registry lookup, Evidence retrieval, infrastructure interrogation, or domain orchestration.

### 8.2 Relationship between CompositionManifest and ACV

- **Status:** `[DEFINED BY AMS-0852]`
- The relationship between a validated `CompositionManifest` / Bound Constitutional Payload and the existing `ActiveConstitutionalView` (ACV) is defined as follows:

```
CompositionManifest (Z-PROF Declarative Composition)
       ↓
Application Layer Resolution (Fetches Registry, Evidence, POL, SEC)
       ↓
ActiveConstitutionalView (Populated pure Domain Input)
       ↓
Runtime Pipeline Stage 6 ACV Activation
```

- **Mandatory Constraints:**
  1. The `CompositionManifest` DOES NOT replace the ACV.
  2. The `CompositionManifest` DOES NOT wrap the ACV as a superior construct.
  3. The `CompositionManifest` DOES NOT override the ACV.
  4. The `CompositionManifest` DOES NOT create a parallel ACV.
  5. The `CompositionManifest` DOES NOT transfer ACV authority to Z-PROF.

---

## 9. Existing Constitutional Ownership Matrix

- **Status:** `[RATIFIED / EXISTING]`

| Capability / Concern            | Constitutional Owner       | Z-PROF Role            |
| :------------------------------ | :------------------------- | :--------------------- |
| **Reality**                     | ZRM                        | Consume / Reference    |
| **Asset Reality / ARM Profile** | ARM / ZRM                  | Reference              |
| **Evidence**                    | Evidence Authority         | Require / Reference    |
| **Epistemic Requirement**       | Shared Substrate           | Reference / Compose    |
| **Projection**                  | PRJ                        | Require / Reference    |
| **Reasoning / Intelligence**    | RSN                        | Require / Reference    |
| **Policy**                      | POL                        | Require / Reference    |
| **Security / Trust**            | SEC                        | Require / Reference    |
| **Execution**                   | RI                         | Require / Reference    |
| **Retrieval / Assembly**        | Application                | Never Own              |
| **Storage / Persistence**       | Infrastructure             | Never Own              |
| **User Interface**              | EXP / Application          | Never Own              |
| **Domain Judgment**             | RSN / Downstream Authority | Never Own as Primitive |

---

## 10. Factorization Verification Criterion

### 10.1 Principle

- **Status:** `[RATIFIED / EXISTING]`
- Z-PROF mandates **domain multiplication without Profile multiplication**:

$$\text{1 Asset Reality} \times \text{1 ARM Profile} \times N \text{ Domains}$$

### 10.2 Factorization Matrix Proof

```
                     ┌────────────────────────┐
                     │ Product Asset Reality  │
                     └───────────┬────────────┘
                                 │
                     ┌───────────▼────────────┐
                     │    ARM Trade Item      │
                     │        Profile         │
                     └───────────┬────────────┘
                                 │
      ┌──────────────┬───────────┼───────────┬──────────────┐
      ▼              ▼           ▼           ▼              ▼
┌───────────┐  ┌───────────┐ ┌───────┐ ┌───────────┐  ┌───────────┐
│   GS1     │  │   DPP     │ │Customs│ │ Logistics │  │Healthcare │
│Domain Card│  │Domain Card│ │ Card  │ │   Card    │  │   Card    │
└───────────┘  └───────────┘ └───────┘ └───────────┘  └───────────┘
```

### 10.3 Verification Criterion

- **Status:** `[DEFINED BY AMS-0852]`
- An implementation architecture passes the **Factorization Criterion** if and only if adding an $(N+1)$-th domain requires creating only a new `Domain Template Card` and `CompositionManifest`, with **ZERO** changes to the underlying `ARM Profile`, `ZRM Reality`, or `Runtime` pipeline.

---

## 11. Disappearance Test Verification Method

### 11.1 Principle

- **Status:** `[RATIFIED / EXISTING]`
- **The Disappearance Test:** _If Z-PROF disappeared tomorrow, would the underlying constitutional artifacts remain valid, governed, and independently usable?_

### 11.2 Verification Step Sequence

- **Status:** `[DEFINED BY AMS-0852]`

```
Step 1: Isolate Constitutional Artifacts (ZRM, ARM, PRJ, RSN, POL, SEC, RI)
Step 2: Hypothetically Remove All Z-PROF Components (DTC, CompositionManifest)
Step 3: Verify Independent Usability:
  ├── ARM Profiles remain valid asset-class specializations? [PASS]
  ├── PRJ Projections compile and transform independently?   [PASS]
  ├── RSN Reasoning Blueprints evaluate independently?       [PASS]
  ├── POL Policies evaluate authorization independently?     [PASS]
  ├── RI Runtime executes ExecutionRequests independently?   [PASS]
Step 4: Final Verdict: Disappearance Test SATISFIED
```

---

## 12. Golden Question & Naked Reality Invariants

### 12.1 Golden Question Mapping

- **Status:** `[RATIFIED / EXISTING]`

$$\text{WHO? (Subject)} \quad \text{DID WHAT? (Event)} \quad \text{TO WHOM? (Object)} \quad \text{WHERE? (Place)} \quad \text{WHEN? (Valid Time)} \quad \text{HOW DO WE KNOW? (Evidence)}$$

### 12.2 Naked Reality Gate & Epistemic Distinctions

- **Status:** `[RATIFIED / EXISTING]`
- No Z-PROF composition or downstream representation shall make a claim stronger than the Reality and Evidence supporting it.

```text
UNKNOWN       ≠ FALSE
UNAVAILABLE   ≠ FALSE
CONFLICTING   ≠ RESOLVED
UNVERIFIED    ≠ VERIFIED
INTERPRETED   ≠ OCCURRED
AUTHORIZED    ≠ OCCURRED
EXECUTED      ≠ AUTHORIZED
INFERRED      ≠ OBSERVED
```

### 12.3 Conflict & Degraded Domain Semantics (Council Gap #5)

- **Status:** `[RATIFIED / EXISTING]`
- Where evidence is missing, conflicting, or unavailable, Z-PROF preserves the exact epistemic state (`UNKNOWN`, `UNAVAILABLE`, `CONFLICTING`). Z-PROF SHALL NOT invent a new degraded-domain semantic state or silently convert `UNKNOWN` into `FALSE`.

---

## 13. Provenance, Versioning, and Replay

### 13.1 Provenance Requirements

- **Status:** `[RATIFIED / EXISTING]`
- Resolved compositions must record: governing DTC ID/version, CompositionManifest ID/version, referenced ARM Profile version, bound PRJ/RSN/POL/SEC capability versions, declared evidence digests, and Application context.

### 13.2 Explicit Version Binding

- **Status:** `[RATIFIED / EXISTING]`
- All referenced capabilities in a `CompositionManifest` SHALL be explicitly version-bound. Floating or wildcard version references are prohibited.

### 13.3 Replay Determinism Equation

- **Status:** `[RATIFIED / EXISTING]`

$$\text{CompositionManifest}_{v} + \text{Capabilities}_{v} + \text{Context} + \text{Evidence} + \text{Inputs} \implies \text{Identical Output}$$

---

## 14. Federation Boundary Constraint

- **Status:** `[DEFINED BY AMS-0852]`
- Z-PROF composition SHALL NOT create unratified mechanisms for crossing sovereign federation boundaries. Where a composition crosses federation boundaries, it SHALL preserve explicit FED-001 recognition and authority requirements as established by higher-order constitutional baselines.

---

## 15. Summary of Specification Gaps & Council Decision Register

The five specification gaps identified during Council review are formally registered as follows:

| Gap #     | Area                                     | Status                                                     | Governance Action / Finding                                                                                                                                 |
| :-------- | :--------------------------------------- | :--------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gap 1** | **Domain Template Card Lifecycle**       | `[UNRESOLVED — COUNCIL DECISION REQUIRED]`                 | DTC state transitions (draft, active, deprecated, revoked) are not authorized under `CONTRACT-R1` and require Council resolution.                           |
| **Gap 2** | **Epistemic Requirement Ownership**      | `[RATIFIED / EXISTING]` (Substrate) / `[UNRESOLVED]` (Pkg) | Shared substrate status is ratified; physical repository package placement requires Council decision.                                                       |
| **Gap 3** | **Validation Failure Taxonomy**          | `[RATIFIED / EXISTING]`                                    | Bound to the 8 closed Z-PROF error codes (`unsupported`, `unavailable`, `missing`, `incompatible`, `conflicting`, `unauthorized`, `unverified`, `invalid`). |
| **Gap 4** | **Manifest Canonicalization & Hashing**  | `[UNRESOLVED — COUNCIL DECISION REQUIRED]`                 | Manifest hashing prefix and canonicalization authority require explicit Council authorization.                                                              |
| **Gap 5** | **Conflict & Degraded Domain Semantics** | `[RATIFIED / EXISTING]`                                    | Preserves raw epistemic states (`UNKNOWN`, `UNAVAILABLE`, `CONFLICTING`); no invented degraded state.                                                       |

---

## 16. Final Constitutional Invariant

> **Z-PROF defines how governed domain participation is declared, composed, validated, and traced across existing Zyppi constitutional capabilities. It does not become the owner of those capabilities.**
>
> **Z-PROF IS CONNECTIVE TISSUE, NEVER A NEW ORGAN.**

---

**END OF CONTRACT SPECIFICATION**

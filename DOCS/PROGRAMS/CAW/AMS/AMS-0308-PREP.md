# AMS-0308-PREP — ExecutionRequest Domain Model Implementation Preparation

**Milestone:** M03 · **Size:** S · **Depends On:** IT-0301 through IT-0307 · **Status:** PREPARATION / NO IMPLEMENTATION AUTHORIZED

---

## 1. Purpose and Scope

This preparation record establishes what the currently available governing sources actually define for `ExecutionRequest` before the Council makes architectural, drafting, or implementation decisions. It acts as an evidence-backed decision surface for the Chair and Council, strictly separating direct source evidence from design-level inferences.

### Evidence vs. Inference Legend

- **Authoritative Source Statement [Evidence]**: Directly supported by verbatim text in an available governing document.
- **Implemented Repository Fact [Fact]**: Current state of the codebase (`packages/domain/src`) or unit tests at baseline.
- **Cross-Entity Convention [Convention]**: Consistently established by prior M03 Wave A implementations but not necessarily mandated for `ExecutionRequest`.
- **Inference or Recommendation [Inference]**: Proposed by this preparation review, requiring Chair/Council approval before drafting.
- **Unresolved / Not Specified**: No available source support or definition exists.

---

## 2. Discovery Boundary and Source Hierarchy

This preparation record operates strictly within the available repository corpus.

### Strict Boundaries:

1. **Unavailable Constitutional Documents**: Governing documents outside the working environment (such as `POL-001`, `SEC-001`, `RI-006`, and other non-CAW series) are completely unavailable. They must not be treated as available authorities or reconstructed from prior discussions, summaries, or commentary. References to them in available sources (e.g. `RI-006` in `CAW-007`) are recorded as external dependencies or unresolved external authorities, but their missing contents are not inferred or guessed.
2. **Implementation Status**: While prior AMS tasks provide helpful precedents, they do not constitute constitutional authority for `ExecutionRequest` unless explicitly stated in a governing source.
3. **No Code/Roadmap Alterations**: This task is discovery and preparation only. No production files, implementation code, tests, roadmap statuses (`CAW-011`), or existing documentation are modified.

---

## 3. Sources Reviewed

The following available sources were reviewed as part of this discovery:

1. **`DOCS/CEngS-v2/CAW-001.md`**: Wedge vision, input categorization, and pipeline sequence.
2. **`DOCS/CAW/CAW-002-System-Architecture.md`**: Architecture layer boundaries and normalized inputs.
3. **`DOCS/CAW/CAW-003-Domain-Model.md`**: High-level domain entities and cross-entity consistency conventions.
4. **`DOCS/CAW/CAW-007-Runtime-Contracts.md`**: Authority contract defining the fields, comments, and outputs of `ExecutionRequest`.
5. **`DOCS/CAW/CAW-008-Registry-Schema.md`**: PostgreSQL table schemas, mutable vs. immutable table rules, and storage-layer persistence.
6. **`DOCS/CAW/CAW-009-Evidence-Model.md`**: Evidence assembly and bundle resolution.
7. **`DOCS/CAW/CAW-011-Build-Order.md`**: Living roadmap build ordering, milestone definitions, and dependencies.
8. **Completed M03 Wave A Implementations (`packages/domain/src/`)**: The actual types and schemas built under the baseline commit `11b55e5110287bb7538b4eda21ab6ea0d86b7999`.
9. **M03 Implementation Notes (`DOCS/CAW/AMS/AMS-0301-Identity-Model-Implementation-Notes.md` through `AMS-0307-Policy-Model-Implementation-Notes.md`)**: Implementation summaries defining code structures, validations, and serialization rules.
10. **`DOCS/CAW/AMS/M03-Closure-Record.md`**: Summary of finalized Wave A types and audit facts.

_Note on Wave A Baseline Status:_
«The M03 Wave A closure audit is complete and ready for Chair ratification. It must not be described as formally ratified unless the repository contains an explicit Chair-ratification record.»

---

## 4. Verbatim ExecutionRequest Source Extraction

The following exact passages and context were extracted from the available corpus:

### A. Inputs and Normalized Input Stream

- **Source Document**: `DOCS/CAW/CAW-002-System-Architecture.md` (Section: Gateway Layer / Execution Input)
- **Exact Wording**:
  > "Everything above the Runtime line may change per carrier or technology. The Runtime never knows or cares whether the request originated from a QR scan, an NFC tap, or a future carrier — it only ever sees a normalized `ExecutionRequest` (CAW-007). This is what makes adding a new carrier a Gateway-layer change, never a Runtime change."
- **Direct Conclusion**: The `ExecutionRequest` represents a normalized, protocol-agnostic, and carrier-independent input payload to the Runtime layer.
- **Status**: Explicit.

### B. Input Schema Structure

- **Source Document**: `DOCS/CAW/CAW-007-Runtime-Contracts.md` (Section: Input — `ExecutionRequest`)
- **Exact Wording**:
  ```
  ExecutionRequest {
    requestId: string
    identity: Identity
    activeConstitutionalView: ActiveConstitutionalView   // Identity, Relationships, Standing,
                                                            // Authorities, Capabilities, Evidence
                                                            // References, Applicable Policies —
                                                            // minimum state required, nothing more
    evidenceBundle: EvidenceBundle
    policyContext: PolicyContext
    executionContext: ExecutionContext                    // budget, entropy, versions — explicit only
  }
  ```
- **Direct Conclusion**: An `ExecutionRequest` structure consists of six explicit fields: `requestId`, `identity`, `activeConstitutionalView`, `evidenceBundle`, `policyContext`, and `executionContext`.
- **Status**: Explicit.

### C. Pure Explicit Inputs Constraint

- **Source Document**: `DOCS/CEngS-v2/CAW-001.md` (Section 9. Runtime Inputs)
- **Exact Wording**:
  > "The Runtime receives only explicit inputs. ... No hidden inputs are permitted."
- **Direct Conclusion**: The fields of `ExecutionRequest` must represent the total sum of context available during verification; any implicit state reads (clock, randomness) are banned.
- **Status**: Explicit.

### D. Evidence Assembly Sequence

- **Source Document**: `DOCS/CAW/CAW-009-Evidence-Model.md` (Section 2)
- **Exact Wording**:
  > "2. Application layer resolves the evidence record(s) from Postgres, fetches the blob from R2, and assembles the `EvidenceBundle` passed into `ExecutionRequest` (CAW-007)."
- **Direct Conclusion**: The `EvidenceBundle` is assembled by the application/client layer prior to passing it to the Runtime inside the `ExecutionRequest`.
- **Status**: Explicit.

---

## 5. Field and Schema Reconciliation

The complete source-defined `ExecutionRequest` contract extracted verbatim from available sources yields the following schema profile:

### Source-Defined ExecutionRequest Contract

| Field                          | Exact source type or description | Required / Optional / Nullable | Format or constraints explicitly stated                                                                                                            | Relationship to another entity                | Source evidence                | Evidence status |
| :----------------------------- | :------------------------------- | :----------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------- | :----------------------------- | :-------------- |
| **`requestId`**                | `string`                         | Required                       | Unspecified                                                                                                                                        | None                                          | `CAW-007 §Input`               | Explicit        |
| **`identity`**                 | `Identity`                       | Required                       | Unspecified                                                                                                                                        | Represents target entity identity             | `CAW-007 §Input`               | Explicit        |
| **`activeConstitutionalView`** | `ActiveConstitutionalView`       | Required                       | `// Identity, Relationships, Standing, Authorities, Capabilities, Evidence References, Applicable Policies — minimum state required, nothing more` | Aggregates references/records of Wave A       | `CAW-007 §Input`               | Explicit        |
| **`evidenceBundle`**           | `EvidenceBundle`                 | Required                       | Unspecified                                                                                                                                        | Contains the verified binary/material payload | `CAW-007 §Input`, `CAW-009 §2` | Explicit        |
| **`policyContext`**            | `PolicyContext`                  | Required                       | Unspecified                                                                                                                                        | Parameters for evaluation                     | `CAW-007 §Input`               | Explicit        |
| **`executionContext`**         | `ExecutionContext`               | Required                       | `// budget, entropy, versions — explicit only`                                                                                                     | Unspecified (scheduled for IT-0309)           | `CAW-007 §Input`               | Explicit        |

### Findings:

- No complete TypeScript field schema or nested-field type declarations are present in any available source.
- Type names such as `Identity`, `ActiveConstitutionalView`, `EvidenceBundle`, `PolicyContext`, and `ExecutionContext` are referenced, but their physical structures are unspecified or deferred to other milestones.

---

## 6. Composition and Wave A Relationship Analysis

No available source defines whether `ExecutionRequest` holds primitive identifier references, embedded Wave A records, or a hybrid of both. We analyze the composition modes below.

### Field Composition Matrix

| Field                          | Exact source wording                                 | Declared or implied type   | Relationship to Wave A             | Composition mode supported by source | Status      |
| :----------------------------- | :--------------------------------------------------- | :------------------------- | :--------------------------------- | :----------------------------------- | :---------- |
| **`requestId`**                | `requestId: string`                                  | `string`                   | None                               | Not specified                        | Unspecified |
| **`identity`**                 | `identity: Identity`                                 | `Identity`                 | `IdentityRecord`                   | Not specified                        | Ambiguous   |
| **`activeConstitutionalView`** | `activeConstitutionalView: ActiveConstitutionalView` | `ActiveConstitutionalView` | Aggregates multiple Wave A records | Not specified                        | Ambiguous   |
| **`evidenceBundle`**           | `evidenceBundle: EvidenceBundle`                     | `EvidenceBundle`           | `EvidenceRecord`                   | Not specified                        | Ambiguous   |
| **`policyContext`**            | `policyContext: PolicyContext`                       | `PolicyContext`            | `PolicyRecord`                     | Not specified                        | Ambiguous   |
| **`executionContext`**         | `executionContext: ExecutionContext`                 | `ExecutionContext`         | None                               | Not specified                        | Ambiguous   |

### Composition Evidence: References, Embedded Records, or Hybrid

| Candidate relationship                        | Source evidence | Explicitly required | Explicitly prohibited | Unspecified | Notes                                                                            |
| :-------------------------------------------- | :-------------- | :-----------------: | :-------------------: | :---------: | :------------------------------------------------------------------------------- |
| **`IdentityRecord` / identity reference**     | `CAW-007`       |         No          |          No           |     Yes     | `identity: Identity` could refer to the full embedded record or an ID reference. |
| **`AuthorityRecord` / authority reference**   | `CAW-007`       |         No          |          No           |     Yes     | Contained in `activeConstitutionalView`. Composition mode is unspecified.        |
| **`CapabilityRecord` / capability reference** | `CAW-007`       |         No          |          No           |     Yes     | Contained in `activeConstitutionalView`. Composition mode is unspecified.        |
| **`StandingRecord` / standing reference**     | `CAW-007`       |         No          |          No           |     Yes     | Contained in `activeConstitutionalView`. Composition mode is unspecified.        |
| **`PolicyRecord` / policy reference**         | `CAW-007`       |         No          |          No           |     Yes     | Contained in `activeConstitutionalView` or `policyContext`.                      |
| **Other Wave A type or identifier**           | `CAW-007`       |         No          |          No           |     Yes     | Includes `EvidenceRecord` or `ReferentRecord`.                                   |

### Scope Determination:

«Composition mechanism is not determinable from the currently available governing sources and requires a Chair/Council decision before AMS-0308 is drafted.»

---

## 7. Nested-Type Dependency Analysis

To avoid absorbing downstream or separate architectural mandates, we isolate the dependencies of nested types:

1.  **`Identity` vs `IdentityRecord` [Unspecified]**:
    `CAW-007` refers to `identity: Identity`, while the actual Wave A codebase exports `IdentityRecord`. The relationship between these two is unconfirmed by available sources.
2.  **`ActiveConstitutionalView` [Unspecified]**:
    No available source defines the structural signature of `ActiveConstitutionalView`. The text `// Identity, Relationships, Standing, Authorities, Capabilities, Evidence References, Applicable Policies — minimum state required, nothing more` implies it is an aggregate structure, but its layout is unspecified.
3.  **`EvidenceBundle` [Deferred]**:
    As established by `AMS-0303 §8`, `EvidenceBundle` is completely out of scope for the domain model layer at this stage. Its definition and validation are scheduled for `IT-0701` in Milestone M07.
4.  **`PolicyContext` [Unspecified]**:
    No available source defines the fields of `PolicyContext` or maps it to `PolicyRecord`.
5.  **`ExecutionContext` [Deferred]**:
    As established by `CAW-011`, `ExecutionContext` represents a separate model scheduled for `IT-0309` and handled under `IT-0403`. It must not be designed early or absorbed during `IT-0308`.

---

## 8. Validation and Purity Boundary

The Runtime is strictly pure and isolated, but the source does not address every validation behavior. We categorize validation concerns and assign their treatment below.

### Validation Concerns & Treatment Matrix

| Concern                              | Source status            | Treatment in PREP             | Exact evidence / Source Basis                                                                                                                                                                     |
| :----------------------------------- | :----------------------- | :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Root input structure**             | Not specified            | Open question; do not decide  | Available sources provide no schema validator or root-level contract format.                                                                                                                      |
| **Field presence**                   | Structurally implied     | Flag for Chair confirmation   | The `ExecutionRequest` struct block in `CAW-007` lists six fields.                                                                                                                                |
| **Primitive type validation**        | Structurally implied     | Flag for Chair confirmation   | `requestId: string` is explicitly typed as a string primitive.                                                                                                                                    |
| **String emptiness or whitespace**   | Not specified            | Open question; do not decide  | Available sources do not specify if `requestId` can be empty or whitespace.                                                                                                                       |
| **Identifier format**                | Not specified            | Open question; do not decide  | No UUID or specific string format constraint is listed for `requestId`.                                                                                                                           |
| **Timestamp format**                 | Not specified            | Open question; do not decide  | No top-level timestamp fields are defined on `ExecutionRequest`.                                                                                                                                  |
| **Chronological ordering**           | Not specified            | Open question; do not decide  | No top-level chronological ordering is applicable.                                                                                                                                                |
| **Nested-record validation**         | Not specified            | Open question; do not decide  | Validation of nested types like `Identity` or `ActiveConstitutionalView` is unstated.                                                                                                             |
| **Referential existence checks**     | Structurally implied     | Flag for Chair confirmation   | Purity constraints imply database reads are banned in runtime; thus, referential checks are structurally prohibited in the pure domain layer but may exist in adapters.                           |
| **Authority evaluation**             | Deferred to another task | Record dependency             | Evaluation is a Runtime behavioral concern, not a domain-model validation concern.                                                                                                                |
| **Capability evaluation**            | Deferred to another task | Record dependency             | Behavioral concern.                                                                                                                                                                               |
| **Standing evaluation**              | Deferred to another task | Record dependency             | Behavioral concern.                                                                                                                                                                               |
| **Policy parsing / evaluation**      | Deferred to another task | Record dependency             | Behavioral concern.                                                                                                                                                                               |
| **Signature verification**           | Not specified            | Open question; do not decide  | No available source mentions cryptographic signature structures.                                                                                                                                  |
| **Runtime-state checks**             | Not specified            | Open question; do not decide  | No runtime-state parameters are defined.                                                                                                                                                          |
| **Payload-size limits**              | Not specified            | Open question; do not decide  | No limits are defined in CAW or codebase.                                                                                                                                                         |
| **No I/O, SQL, HTTP, or filesystem** | Explicitly prohibited    | Candidate mandatory exclusion | `CAW-007`: "No hidden reads of time, randomness, network, or filesystem. ... No I/O, no SQL, no HTTP, no filesystem, no hidden state, no randomness, no implicit timestamps, fully deterministic" |

---

## 9. Canonical Serialization Analysis

The deterministic nature of the Runtime implies that identical inputs must yield identical execution receipts, but the specific serialization contract of `ExecutionRequest` is not universally defined.

### Serialization Requirements Classification

- **Top-level key ordering [Unspecified]**:
  No available source defines top-level alphabetical ordering for `ExecutionRequest` (e.g. `activeConstitutionalView`, `evidenceBundle`, etc.). While this is an _existing implementation precedent_ for flat Wave A records, it is not yet established as an `ExecutionRequest` requirement.
- **Nested object ordering [Unspecified]**:
  No available source defines recursive object ordering for `ExecutionRequest` nested objects.
- **Array-order preservation [Unspecified]**:
  No available source defines whether lists inside `activeConstitutionalView` must preserve order or be sorted during serialization.
- **Compact versus formatted JSON [Unspecified]**:
  The format of the generated string output is not defined.
- **Treatment of arbitrary JSON values [Unspecified]**:
  No rules are defined for arbitrary input values.
- **Deterministic serialization [Structurally Implied]**:
  `CAW-007` states: `"Same input → same receipt → same hash, always."` This strongly entails deterministic serialization of `ExecutionRequest` to generate the input hash.
- **Hashing [Structurally Implied]**:
  `CAW-007` receipt requires an `"Input Hash"`, indicating that the `ExecutionRequest` must be hashed.
- **Canonicalization [Structurally Implied]**:
  Implied by the deterministic hashing requirement, but the specific algorithm is unstated.
- **Preservation of original values [Unspecified]**:
  No available source addresses whether original whitespace or casing must be preserved.
- **Prototype-safe object construction [Unspecified]**:
  No available source establishes this for `ExecutionRequest`. It exists only as an `IT-0307` implementation decision for `PolicyRecord` and is classified as an _existing implementation precedent — not yet established as an ExecutionRequest requirement_.
- **Cyclic-value rejection [Unspecified]**:
  No rules are defined.
- **Non-finite numbers [Unspecified]**:
  No rules are defined.
- **Unsupported JavaScript values [Unspecified]**:
  No rules are defined.

---

## 10. Current Repository Precedents

We review the current exported shapes from `packages/domain/src/index.ts` under the baseline commit `11b55e5110287bb7538b4eda21ab6ea0d86b7999` to assess potential relationship mapping and compatibility:

### Wave A Compatibility Matrix

| Wave A type            | Potential relevance to ExecutionRequest        | Source-required relationship                    | Current exported shape                                                      | Compatibility status                               | Issue or question                                                                    |
| :--------------------- | :--------------------------------------------- | :---------------------------------------------- | :-------------------------------------------------------------------------- | :------------------------------------------------- | :----------------------------------------------------------------------------------- |
| **`IdentityRecord`**   | Represents the target identity.                | `identity: Identity` in `CAW-007`               | `{ readonly identityId: string; readonly identityType: string; ... }`       | Potentially compatible — Council decision required | Does `Identity` correspond to the full `IdentityRecord` type or an abstract wrapper? |
| **`GS1Identifier`**    | Part of commercial identity but not top-level. | None direct                                     | `{ readonly gtin: string; }`                                                | Not applicable                                     | No direct field mapping.                                                             |
| **`ReferentRecord`**   | Real-world entity referenced by Identity.      | None direct                                     | `{ readonly referentId: string; readonly name: string; ... }`               | Not applicable                                     | No direct field mapping.                                                             |
| **`EvidenceRecord`**   | Verification data corresponding to claims.     | Part of `EvidenceBundle` / ACV                  | `{ readonly evidenceId: string; readonly hash: string; ... }`               | Cannot determine from available sources            | `EvidenceBundle` is deferred to `IT-0701`.                                           |
| **`AuthorityRecord`**  | Part of permissions verification context.      | Contained in ACV ("Authorities")                | `{ readonly authorityId: string; readonly subjectId: string; ... }`         | Potentially compatible — Council decision required | How are authorities structured inside `ActiveConstitutionalView`?                    |
| **`CapabilityRecord`** | Part of permissions verification context.      | Contained in ACV ("Capabilities")               | `{ readonly capabilityId: string; readonly subjectId: string; ... }`        | Potentially compatible — Council decision required | How are capabilities structured inside `ActiveConstitutionalView`?                   |
| **`StandingRecord`**   | Actor eligibility state.                       | Contained in ACV ("Standing")                   | `{ readonly standingId: string; readonly subjectId: string; ... }`          | Potentially compatible — Council decision required | How is standing structured inside `ActiveConstitutionalView`?                        |
| **`PolicyRecord`**     | Governs validation/compliance.                 | Contained in ACV ("Policies") / `policyContext` | `{ readonly policyId: string; readonly policyType: string; ... }`           | Potentially compatible — Council decision required | Is `policyContext` identical to `PolicyRecord`?                                      |
| **`PolicyDefinition`** | Nested schema structure of `PolicyRecord`.     | None direct                                     | `null \| boolean \| number \| string \| readonly PolicyDefinition[] \| ...` | Not applicable                                     | No direct field mapping.                                                             |

---

## 11. Source Gaps, Ambiguities, and Conflicts

The available sources present several gaps and ambiguities when attempting to form a complete implementation contract:

### CAW-003 / CAW-008 Agreement and Difference Matrix

| Field or requirement                                | CAW-003 evidence                                      | CAW-008 evidence                                              | Relationship               | Required Council action                                                                                    |
| :-------------------------------------------------- | :---------------------------------------------------- | :------------------------------------------------------------ | :------------------------- | :--------------------------------------------------------------------------------------------------------- |
| **`ExecutionRequest` Table Mapping**                | Defined as explicit input to Runtime (See `CAW-007`). | Not present in PostgreSQL schema.                             | Present in one source only | Confirm that `ExecutionRequest` is an ephemeral in-memory domain model and has no database representation. |
| **`ExecutionReceipt` / `execution_receipts` table** | Defined as immutable output artifact of Runtime.      | Table `execution_receipts` defined with ten specific columns. | Complementary              | Ensure that `ExecutionReceipt` (IT-0310) matches the schema definitions in `CAW-008`.                      |
| **`Identity` / `identities` table**                 | Defined as persistent digital representation.         | Table `identities` defined with seven columns.                | Complementary              | None (resolved in Wave A).                                                                                 |

### Structural Ambiguities:

1.  **Terminology Difference**: Sources refer to `Identity`, while Wave A implemented `IdentityRecord`.
2.  **No Structural Declarations**: There are no structural definitions or field types for `ActiveConstitutionalView`, `EvidenceBundle`, or `PolicyContext` in any available CAW document.

---

## 12. Chair/Council Decision Register

Before drafting `AMS-0308`, the following unresolved questions must be answered by the Chair and Council to establish a stable decision surface:

| ID                    | Question                                                                                                                     | Source evidence                                                                               | Why it matters                                                                                     | Available options                                                                                                                                         | Recommended disposition                                                                                             | Decision owner  |
| :-------------------- | :--------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ | :-------------- |
| **AMS-0308-PREP-Q01** | Should `identity` inside `ExecutionRequest` embed the full `IdentityRecord` or hold a reference identifier?                  | `CAW-007` lists `identity: Identity`                                                          | Affects compile-time types, AST purity validation, and package boundaries.                         | **Option A**: Embed full `IdentityRecord`. <br>**Option B**: Hold string `identityId` reference.                                                          | **Option A** (allows pure evaluation of identity properties without DB queries).                                    | Chair / Council |
| **AMS-0308-PREP-Q02** | What is the structural layout and composition mode of `ActiveConstitutionalView`?                                            | `CAW-007` comment lists multiple entities                                                     | It is completely unspecified. If not defined, `ExecutionRequest` validation cannot be typed.       | **Option A**: Keyed object mapping to arrays of Wave A records (e.g. `standings: StandingRecord[]`). <br>**Option B**: String references.                 | **Option A** (strongly implied by comment list and purity rules).                                                   | Chair / Council |
| **AMS-0308-PREP-Q03** | How should `ExecutionRequest` handle deferred types (`EvidenceBundle`, `ExecutionContext`, `PolicyContext`) during drafting? | `EvidenceBundle` is deferred to `IT-0701` (M07); `ExecutionContext` is deferred to `IT-0309`. | Prevents blocking the build order while avoiding breaking changes when those models are finalized. | **Option A**: Use placeholder/`unknown` types during `IT-0308`. <br>**Option B**: Delay `IT-0308` drafting. <br>**Option C**: Co-design all three models. | **Option A** (preserves roadmap build-order and limits scope creep).                                                | Chair / Council |
| **AMS-0308-PREP-Q04** | Which canonical serialization algorithm should be applied to `ExecutionRequest`?                                             | `CAW-007` requires input hash but defines no algorithm.                                       | Essential to achieve platform-independent deterministic hashing.                                   | **Option A**: Top-level sorted JSON serialization (default). <br>**Option B**: PolicyRecord's recursive prototype-safe serialization.                     | **Option A** (keeps leaf-package simple; recursive serialization is only warranted for arbitrary JSON definitions). | Chair / Council |

---

## 13. AMS-0308 Drafting Readiness Gate

Based on the evidence collected and the findings of this preparation record, we conclude:

### **B. Conditionally Ready — Chair Decisions Required**

**Justification:**
The core top-level contract of `ExecutionRequest` is highly stable and explicitly defined by `CAW-007`. However, because the nested types are either deferred to future tasks (`EvidenceBundle`, `ExecutionContext`) or structurally unspecified (`ActiveConstitutionalView`, `PolicyContext`), drafting the final mandate cannot proceed without resolving how these types will be represented.

Once the Chair/Council provides a determination on the registered decisions:

- `AMS-0308-PREP-Q01` (Identity representation)
- `AMS-0308-PREP-Q02` (ActiveConstitutionalView structure)
- `AMS-0308-PREP-Q03` (Deferred types handling)
- `AMS-0308-PREP-Q04` (Serialization algorithm)

the `AMS-0308` mandate can be cleanly drafted and executed.

---

## 14. Recommended Next Action

1.  **Review the Decision Surface**: The Chair and Council should review the proposed options in the **Chair/Council Decision Register** (Section 12).
2.  **Authorize Drafting**: Select the preferred options for Q01 through Q04 and instruct the drafting agent to write the formal `AMS-0308` mandate with those decisions embedded.

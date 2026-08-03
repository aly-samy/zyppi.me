# AMS-0311-PREP — Outcome Domain Model Constitutional Discovery & Scope Resolution

**Milestone:** M03 — Domain Foundation
**Task:** IT-0311 — Outcome Model
**Status:** ☐ PREP — DISCOVERY ONLY; NOT AUTHORIZED FOR IMPLEMENTATION

---

## 1. Executive Finding

Based on a exhaustive, source-grounded constitutional discovery audit of all available governing and completed M03 documents, this PREP concludes that the **Outcome Domain Model is currently NOT implementation-ready and is Constitutionally Underspecified (Disposition C)**.

While the semantic intent of "Outcome" is established as a lightweight, independent domain construct representing the decision or result produced by policy evaluation, the available sources do not authorize a concrete structural representation (e.g., whether it is a scalar string, a specific object wrap, or has a specific closed vocabulary). Defining any concrete TypeScript shape or status enumeration at this stage would require speculative invention rather than constitutional implementation.

We recommend that the Council maintain a strict boundary between `Outcome` and its sibling fields in `ExecutionOutput` (to prevent duplicate semantics/scope bloat), and block implementation of `IT-0311` until the Chair issues explicit rulings on the remaining structural and vocabulary options.

---

## 2. Sources Reviewed

The following sources were read fresh and analyzed without reliance on prior interpretations or summaries:

1. **"CEngS-000"**: Engineering Navigation Index.
2. **"CEngS-001"**: Engineering Constitution (specifically: §3 Constitutional Layer separation; §4 Runtime isolation, purity, determinism, explicit-input constraints; §7 Errors are explicit).
3. **"CEngS-002"**: Engineering Rules (specifically: §4 Runtime package rules, forbidden imports; §5 Package boundaries).
4. **"CAW-000"**: Navigation Index.
5. **"CAW-003 — Domain Model"**: Defines Outcome as the decision/result produced by policy evaluation, which feeds into the Verified Response.
6. **"CAW-004 — Repository Map"**: Enforces import and ownership boundaries.
7. **"CAW-006 — API Contracts"**: Outlines `verificationStatus` and `trustStatus` vocabularies at the public API layer.
8. **"CAW-007 — Runtime Contracts"**: Establishes `ExecutionOutput` structure, proving `Outcome` is a sibling to trust, policy decisions, receipts, and diagnostics.
9. **"CAW-008 — Registry Schema"**: Illustrates PostgreSQL tables, demonstrating absence of an `Outcome` persistence model.
10. **"CAW-011 — Build Order"**: Confirms M03 role and implementation sequence.
11. **Completed M03 Domain Models**: Completed code in `packages/domain/src/index.ts` and associated implementation notes (from `AMS-0301` through `AMS-0310`).

---

## 3. Exact Source-Evidence Extraction

The following matrix extracts every governing statement that defines, constrains, consumes, persists, or distinguishes `Outcome`:

| Source | Section | Exact Quotation / Extraction | Classification | Implementation Consequence | Sufficient to Authorize Shape/Vocabulary? |
| :------------ | :-------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------- | :--------------------------------------------- | :----------------------------------------------------------------------- | ----------------------------------------------------------- |
| **CAW-003** | §Entities Table | `Outcome` | `The decision/result produced by policy evaluation` | Direct Requirement | Defines semantic role; maps to policy evaluation. | **No** — does not specify field names, type, or vocabulary. |
| **CAW-003** | §Entities Table | `Feeds into the Verified Response` | Direct Requirement | Downstream relationship | **No** — does not specify internal structure. |
| **CAW-006** | §Response 200 | `"verificationStatus": "verified \| unverified \| rejected"` | Direct Boundary / External Contract | API status contract | **No** — does not explicitly map 1:1 to internal Domain layer. |
| **CAW-006** | §Response 200 | `"trustStatus": "definite \| probable \| possible \| uncertain \| speculative"` | Direct Boundary / External Contract | API trust contract | **No** — belongs to sibling `TrustResult`. |
| **CAW-007** | §Output | `ExecutionOutput { outcome: Outcome; executionReceipt: ExecutionReceipt; evidenceReferences: string[]; trustResult: TrustResult; policyDecisions: PolicyDecision[]; diagnostics: Diagnostics; }` | Direct Structural Boundary | Defines siblings of `Outcome` | **No** — establishes what `Outcome` is _not_, but not what it _is_. |
| **CAW-008** | §Tables | _No `outcomes` table exists._ | Direct Absence | No dedicated persistence schema | **No** — indicates `Outcome` is in-memory or transient/nested in output. |
| **CAW-011** | §M03 | `IT-0311 \| Outcome model \| IT-0301–0307 \| S \| AMS-0311 \| ☐` | Direct Planning Constraint | Role in M03 build order | **No** — task placement only. |
| **CEngS-001** | §4 | `The Constitutional Runtime (Layer 4) is a single, isolated package. ... Every Runtime function is deterministic. Identical inputs always produce identical outputs.` | Direct Engineering Constraint | Requires absolute purity & determinism | **No** — governs execution behavior, not model semantics. |
| **CEngS-002** | §4 | `Forbidden imports: HTTP frameworks, database libraries, ORMs... Only pure computation is permitted.` | Direct Engineering Constraint | Restricts model to pure data + pure validation | **No** — limits placement, not content. |

---

## 4. Outcome Semantic Definition

Per **CAW-003**, the authoritative definition of `Outcome` is:

> «"The decision/result produced by policy evaluation" and states that it feeds into the Verified Response.»

### Analytical Synthesis:

1. **Source of Truth**: The outcome is a direct product of policy evaluation. It represents the _judgment_ or _status_ resulting from testing the active constitutional view against relevant rules.
2. **Role**: It acts as the core logical conclusion of an execution cycle, distinct from the audit trail (the receipt), the proof of facts (the evidence), the warning system (diagnostics), and the trust model.
3. **Consumer**: It "feeds" the Verified Response. This means the Application layer uses the `Outcome` to resolve what public-facing statuses to render to the client.

---

## 5. Sibling-Boundary Analysis

A key constitutional constraint is the exact structure of `ExecutionOutput` defined in **CAW-007**:

```typescript
ExecutionOutput {
  outcome: Outcome
  executionReceipt: ExecutionReceipt
  evidenceReferences: string[]
  trustResult: TrustResult
  policyDecisions: PolicyDecision[]
  diagnostics: Diagnostics
}
```

This sibling structure is constitutionally significant. Because each item is a top-level sibling, `Outcome` **must not** absorb, duplicate, or collapse any of the following:

- It is not a container for policy decisions (`PolicyDecision[]` is separate).
- It is not a container for diagnostic tracing or execution errors (`Diagnostics` is separate).
- It is not a container for execution telemetry, timing, or versioning hashes (`ExecutionReceipt` is separate).
- It is not a container for underlying evidence links (`evidenceReferences` is separate).
- It is not a container for the probabilistic trust rating (`TrustResult` is separate).

If `Outcome` were to contain any of these, it would bypass the sibling structure, violating the system's clean separation of concerns and expanding its scope into a composite execution result wrapper.

---

## 6. Sibling Relationships & Boundary Deep-Dives

### 6.1 Outcome vs. TrustResult

- **Does `Outcome` contain trust classification?** No. Trust is probabilistic (e.g., definite, probable, uncertain) and evaluates identity metadata or entity relationships. `Outcome` is binary or deterministic based on policy compliance.
- **Does `trustStatus` in CAW-006 belong to `TrustResult` or `Outcome`?** It belongs to `TrustResult`. Merging them or embedding trust inside `Outcome` would collapse the sibling boundary in `CAW-007`.
- **Boundary:** `Outcome` must remain entirely independent from trust classification.

### 6.2 Outcome vs. PolicyDecision

- **Does `Outcome` contain policy-decision details or logic?** No. Sibling `policyDecisions: PolicyDecision[]` holds individual rule evaluation results.
- **Is `Outcome` a summary or projection of decisions?** `Outcome` is the final resolution (the "result" of evaluation). While it depends on the decisions, it does not embed them.
- **Boundary:** No policy evaluator, policy aggregation logic, or decision reasoning should exist in M03.

### 6.3 Outcome vs. ExecutionReceipt

- **Does `Outcome` duplicate receipt fields?** No. `ExecutionReceipt` is an immutable, append-only audit record containing execution times, hashes, and a `decisionSummary`.
- **Is `decisionSummary` in `ExecutionReceipt` the same as `Outcome`?** No. `decisionSummary` is a serialized JSONb audit blob designed for database indexing and replay verification. `Outcome` is a localized Domain entity representing the logical output.
- **Boundary:** Hashes, runtime versions, and execution times belong solely to the receipt, never to `Outcome`.

### 6.4 Outcome vs. Evidence References

- **Does `Outcome` contain evidence links?** No. Links to storage are siblings via `ExecutionOutput.evidenceReferences: string[]`.
- **Boundary:** `Outcome` does not perform evidence-loading, retrieval, or verification checks.

### 6.5 Outcome vs. Diagnostics

- **Does `Outcome` contain traces or execution errors?** No. Warnings, evaluation traces, and detailed failure explanations belong exclusively to `Diagnostics`.
- **Boundary:** `Outcome` should stay silent regarding system diagnostics or trace messages.

---

## 7. Outcome vs. API-Layer Statuses

**CAW-006** exposes two distinct API fields:

1. `verificationStatus`: `verified | unverified | rejected`
2. `trustStatus`: `definite | probable | possible | uncertain | speculative`

### 7.1 Verification Status Analysis

Are the `verificationStatus` values the direct authoritative vocabulary for `Outcome`?

- **Hypothesis 1 (API is the Domain):** `Outcome` is exactly the string enum `"verified" | "unverified" | "rejected"`.
- **Hypothesis 2 (API is a Projection):** `Outcome` is a distinct Domain structure that the Gateway/Application layer projects into `verificationStatus`.
- **Discovery finding:** The available corpus does not mandate that the API enum is the Domain enum. In fact, CEngS-001 §3 explicitly bans constitutional logic in the Gateway layer (which owns the API endpoint). If the Gateway has to map complex domain rules into these three simple statuses, then `Outcome` might be a richer model. Alternatively, if `Outcome` is identical, the relationship remains constitutionally unresolved in writing.

### 7.2 Trust Status Analysis

Does the `Outcome` proposal overlap with trust status?

- No. Trust status belongs entirely to the `TrustResult` sibling. Any proposal for `Outcome` must explicitly reject containing trust enums.

---

## 8. Candidate-Shape Comparison

The PREP has evaluated six potential representations for the `Outcome` model:

### Candidate A — Closed Verification Status

```typescript
type Outcome = "verified" | "unverified" | "rejected";
```

- **Pros:** Highly simple, direct match to `CAW-006` API response.
- **Cons:** Lack of extensibility. Cannot carry policy-specific reasons or metadata. Assumes API vocabulary directly binds the Domain layer (which is discouraged by CEngS-001 boundary rules).
- **Source support:** Inferential only.

### Candidate B — Narrow Object with a Closed Status

```typescript
interface Outcome {
  readonly status: "verified" | "unverified" | "rejected";
}
```

- **Pros:** Standardizes on object wrapper pattern utilized by other M03 models.
- **Cons:** Provides no extra semantic utility over Candidate A while adding wrapping overhead unless other fields are authorized.
- **Source support:** Inferential only.

### Candidate C — Narrow Object with an Open Status String

```typescript
interface Outcome {
  readonly status: string;
}
```

- **Pros:** Extremely extensible. Preserves future flexibility for policy-defined status vocabularies.
- **Cons:** Weakens contract safety; permits arbitrary unvalidated strings.
- **Source support:** Inferential only.

### Candidate D — Structured Decision Result

```typescript
interface Outcome {
  readonly status: string;
  readonly summary: string;
}
```

- **Pros:** Richer; allows presenting a human-readable judgment.
- **Cons:** Substantially duplicates `ExecutionReceipt.decisionSummary`.
- **Source support:** Rejected.

### Candidate E — Composite Result Bundle

```typescript
interface Outcome {
  readonly status: string;
  readonly trustResult: TrustResult;
  readonly policyDecisions: readonly PolicyDecision[];
  readonly evidenceReferences: readonly string[];
}
```

- **Pros:** None.
- **Cons:** **Prohibited.** This candidate completely collapses the sibling structures defined in `CAW-007` §Output.
- **Source support:** Explicitly Prohibited.

### Candidate F — No Implementation-Ready Shape (Recommended)

The corpus authorizes only the _semantic_ role of `Outcome` (representing the evaluation decision feeding into the response) but provides _zero_ concrete structures or fields.

- **Pros:** Strictly adheres to constitutional principles; avoids inventing placeholder/speculative APIs to force closure of a milestone.
- **Cons:** Keeps `IT-0311` blocked until the Chair issues a specific ruling.
- **Source support:** Supported by the absence of explicit definitions in the available corpus.

---

## 9. Provenance Classification Matrix

To maintain extreme rigor, every potential property, status value, and rule is classified below:

| Property / Concept / Rule | Classification | Source Basis / Explanation |
| :------------------------------------------------ | :------------------------------- | :--------------------------------------------------- | ---------------------------------- | ------------------------------------------------------- |
| **`Outcome` exists as a distinct type** | Direct CAW Requirement | Explicitly listed in `CAW-003` and `CAW-007`. |
| **`Outcome` is a sibling of `TrustResult` etc.** | Direct CAW Requirement | Formally structured in the output of `CAW-007`. |
| **`Outcome` is pure and deterministic** | Direct CEngS Constraint | Mandatory for Layer 4 per `CEngS-001` §4. |
| **`Outcome` has no database representation** | Necessary Structural Implication | Omitted from PostgreSQL schema in `CAW-008`. |
| **`Outcome` utilizes `ValidationResult<T, E>`** | Inherited M03 Convention | Established validation standard for all M03 models. |
| **Alphabetical serialization key ordering** | Inherited M03 Convention | Canonical serialization standard for all M03 models. |
| \*\*The status vocabulary `verified               | unverified                       | rejected`\*\* | Chair-Authorized Decision Required | Unresolved if this API contract binds the Domain model. |
| **Adding timestamps, versions, or execution IDs** | Explicitly Rejected Speculation | Belongs to `ExecutionReceipt`, not `Outcome`. |
| **Embedding underlying policy decisions** | Explicitly Rejected Speculation | Belongs to `PolicyDecision[]`, not `Outcome`. |
| **Embedding diagnostic traces or messages** | Explicitly Rejected Speculation | Belongs to `Diagnostics`, not `Outcome`. |

---

## 10. Required Decision Matrix

The following table presents the key architectural decisions that remain unresolved:

| Decision                                   | Source Evidence                              | Classification                     | Options         | Recommended Resolution                                                      | Confidence | Implementation Consequence                            |
| :----------------------------------------- | :------------------------------------------- | :--------------------------------- | :-------------- | :-------------------------------------------------------------------------- | :--------- | :---------------------------------------------------- |
| **Is Outcome a distinct Domain type?**     | `CAW-003`, `CAW-007`                         | Direct CAW Requirement             | Yes / No        | **Yes** (Represented as a distinct TS type)                                 | High       | Clean separation in `ExecutionOutput`.                |
| **Is Outcome a scalar or object?**         | None                                         | Chair-Authorized Decision Required | Scalar / Object | **Object** (To allow future expansion without breaking changes)             | Medium     | Impacts validation & serialization footprint.         |
| **Does Outcome use API vocab?**            | `CAW-006` lists `verificationStatus`         | Chair-Authorized Decision Required | Same / Distinct | **Distinct** (Outcome represents evaluation, projected later to API status) | Medium     | Requires Gateway-layer mapping logic.                 |
| **Is the verification vocabulary closed?** | `CAW-006` is closed                          | Chair-Authorized Decision Required | Closed / Open   | **Open string status** (To support domain policy flexibility)               | High       | Avoids hardcoding status enums in core Domain layer.  |
| **Does Outcome contain trust status?**     | `CAW-007` shows `TrustResult` sibling        | Explicitly Rejected                | Yes / No        | **No** (Exclude trust completely)                                           | High       | Prevents merging with `TrustResult`.                  |
| **Does Outcome contain policy decisions?** | `CAW-007` shows `policyDecisions` sibling    | Explicitly Rejected                | Yes / No        | **No** (Exclude details)                                                    | High       | Prevents sibling duplication.                         |
| **Does Outcome contain evidence refs?**    | `CAW-007` shows `evidenceReferences` sibling | Explicitly Rejected                | Yes / No        | **No** (Exclude refs)                                                       | High       | Keeps evidence boundaries distinct.                   |
| **Does Outcome contain diagnostics?**      | `CAW-007` shows `diagnostics` sibling        | Explicitly Rejected                | Yes / No        | **No** (Exclude diagnostics)                                                | High       | Keeps warnings/traces separate.                       |
| **Is the model implementation-ready?**     | Lack of structural specifications            | Chair-Authorized Decision Required | Yes / No        | **No** (Constitutionally Underspecified)                                    | High       | Blocks `IT-0311` completion until rulings are issued. |

---

## 11. Validation and Serialization Discovery

If/when a concrete `Outcome` contract is authorized by the Council, the following conventions and limitations will apply to preserve consistency with the completed M03 models:

### 11.1 Reusable M03 Validation Conventions

- **Synchronous & Non-Throwing:** Must return `ValidationResult<Outcome, OutcomeValidationError>` without raising JavaScript exceptions.
- **Type-Strict Verification:** Reject non-object inputs at the root, mapping the failure to a top-level code (e.g., `"INVALID_OUTCOME_ID"`).
- **Whitespace Preservation:** Any string validation must reject whitespace-only inputs using `val.trim() === ""` while preserving the original input string verbatim.

### 11.2 Reusable Serialization Conventions

- **Top-Level Alphabetical Ordering:** Fields must be serialized in strict alphabetical key order (e.g., `status` -> `summary`).
- **Non-Mutating:** Serialization must not mutate the input object.

### 11.3 Prohibited Premature Rules

- No validation of status enums before they are officially ratified.
- No clock, I/O, database, or cryptographic hashing inside the validator or serializer.

---

## 12. Negative-Scope Audit

To prevent `Outcome` from absorbing engineering responsibilities assigned to later Milestones, the following audit matrix is established:

| Proposed Behavior            | Proper Owner    | Milestone          | Allowed in IT-0311? | Reason                                                             |
| :--------------------------- | :-------------- | :----------------- | :------------------ | :----------------------------------------------------------------- |
| **Outcome type declaration** | Domain          | M03                | Yes                 | Allowed once shape is structurally authorized.                     |
| **Outcome validation**       | Domain          | M03                | Yes                 | Allowed once shape is structurally authorized.                     |
| **Outcome serialization**    | Domain          | M03                | Yes                 | Allowed once shape is structurally authorized.                     |
| **Policy evaluation**        | Runtime         | Later Runtime work | **No**              | Runtime behavior belongs to `packages/runtime` (M04/M08).          |
| **Trust calculation**        | Trust subsystem | Later work         | **No**              | Belongs in the dedicated Trust subsystem.                          |
| **Evidence loading**         | Evidence Engine | M07                | **No**              | Belongs in Evidence Engine.                                        |
| **Outcome generation**       | Runtime         | M08                | **No**              | Evaluation-time behavior; Domain layer is declarative only.        |
| **API response mapping**     | API / Contracts | M09                | **No**              | Mapping to `GET /v1/resolve` belongs to Application/Gateway layer. |

---

## 13. M03 Cross-Model Consistency Review

Before M03 can close, the proposed `Outcome` model must be audited against completed models (`ExecutionRequest`, `ExecutionContext`, `ExecutionReceipt`):

1. **Responsibility Duplication:** Ensure `Outcome` does not attempt to replicate execution budget/telemetry (owned by `ExecutionContext`) or input arrays (owned by `ExecutionRequest`).
2. **Circular Dependencies:** `ExecutionRequest` receives the input; `Outcome` is part of the output. There are no circular dependencies.
3. **Pure-Validation and Deterministic Serialization:** `Outcome` must rely purely on primitive-level validations, matching the structure of `ExecutionReceipt` and `ExecutionRequest`.

---

## 14. Recommended Implementation Path & Chair Rulings

To unlock `IT-0311`, the Chair must authorize the following specific determinations:

1. **Vocabulary Determination:** Decide whether `Outcome` represents a closed set of statuses or an open-ended policy status string.
2. **Structure Determination:** Direct whether `Outcome` is a primitive scalar type or a formal TypeScript `interface`.
3. **Mapping Rule:** Formally establish the relationship mapping between the Domain-level `Outcome` and the API-level `verificationStatus` in `CAW-006`.

---

## 15. Final PREP Disposition

Based on the evidence-backed findings of this record, this PREP concludes with:

### **Disposition C — Constitutionally Underspecified**

**Justification:**
While the logical boundaries and exclusions of `Outcome` are successfully resolved by structural implication (i.e., it must be a sibling to receipt, trust, policy decisions, and diagnostics), the available corpus provides zero evidence authorizing a concrete TypeScript shape or status vocabulary. Attempting to implement any concrete model under `IT-0311` at this stage would represent speculative invention rather than evidence-based engineering.

`IT-0311` must remain **blocked** pending a formal Chair ruling that establishes the physical contract for the `Outcome` model.

# AMS-0302 — GS1 / Referent Domain Scope Reconciliation & Implementation Preparation

**Implements:** IT-0302 · **Milestone:** M03 · **Size:** S–M · **Depends On:** IT-0202 ☑, IT-0301 ☑ · **Status:** PREPARATION / NO IMPLEMENTATION AUTHORIZED

## Purpose

Prepare AMS-0302 for implementation by reconciling the exact constitutional scope of the next Domain model.

A terminology ambiguity has been identified:

- `CAW-011` identifies IT-0302 as the **GS1 identifier model**.
- `CAW-003` identifies **Referent (Product / Brand / Manufacturer)** as the domain entity represented by Identity.
- AMS-0301 established `referentId` as a forward reference but did not implement the Referent or GS1 model.

Do **not** resolve this ambiguity by silently renaming the task, expanding its scope, or implementing both concepts without an explicit constitutional basis.

Your task in this mandate is to inspect the governing corpus, reconcile the terminology, and produce a precise implementation plan. **Do not modify production source code, package manifests, schemas, or constitutional documents during this preparation phase.**

---

## Load and Treat as Governing Sources

Read the relevant sections of:

- `CEngS-000`
- `CEngS-001`
- `CEngS-002`
- `CAW-000`
- `CAW-003 — Domain Model`
- `CAW-008` — especially the relevant data-model tables and identity/referent definitions
- `CAW-011 — Build Order` — especially the exact wording and dependencies of IT-0302
- `AMS-0301 — Identity Domain Model`
- `DOCS/CAW/AMS/AMS-0301-Identity-Model-Implementation-Notes.md`
- `packages/domain/src/index.ts`
- `packages/domain/src/index.test.ts`
- Any directly cited constitutional definitions required to interpret Identity, Referent, GS1 identifiers, or canonical references

Trace requirements through the existing corpus before proposing any new abstraction. Do not re-derive the Domain architecture from first principles if the governing documents already answer the question.

---

## Constitutional Context

AMS-0301 / IT-0301 is complete and remains unchanged.

The completed Identity model established the following M03 implementation precedent:

- `IdentityRecord` is a pure, immutable, JSON-safe domain type.
- Validation is pure and non-throwing.
- Validation returns the discriminated `ValidationResult<T, E>` pattern.
- Validation errors are structured and machine-readable.
- Timestamps are explicit UTC ISO-8601 string inputs and are never generated inside Domain.
- Domain performs no I/O and uses no database, HTTP, filesystem, framework, environment, clock, or randomness APIs.
- Deterministic serialization is tested.
- Identity remains distinct from Referent.
- Entity identifiers follow the CAW-003 naming convention.
- No speculative UUID requirements, external schema libraries, branded-type framework, or shared dependency was introduced.

AMS-0302 must reuse compatible conventions where applicable. It must not create a competing validation, serialization, or naming pattern without identifying an explicit constitutional reason.

---

## Required Reconciliation

Determine the exact relationship among these concepts:

1. **GS1 identifier**
2. **GS1 Digital Link / canonical reference**
3. **Referent**
4. **Product**
5. **Brand**
6. **Manufacturer**
7. **Identity**
8. **`referentId`**, already established by AMS-0301

Answer the following questions directly from the governing sources.

### A. Canonical Task Name

What is the exact canonical name of IT-0302 in `CAW-011`?

Report the wording exactly and identify whether it describes:

- only a GS1 identifier value object;
- a Referent domain entity;
- both;
- or an ambiguous/incomplete scope.

### B. Canonical Domain Concept

Is **Referent** a canonical Domain term in `CAW-003` and/or other governing documents?

If yes, determine whether:

- a Referent is the entity being modeled by IT-0302;
- a GS1 identifier is a property or value object belonging to a Referent;
- a GS1 identifier is an independent Domain value object;
- or the corpus establishes another relationship.

Do not infer that an identifier and the entity carrying it are the same thing merely because the task name uses “GS1.”

### C. Required Domain Types

Identify the minimum required types for IT-0302.

For each proposed type, provide:

| Proposed Type             | Source Basis          | Required or Optional | Responsibility     |
| ------------------------- | --------------------- | -------------------- | ------------------ |
| Example: `ReferentRecord` | Exact source citation | Required / Optional  | What it represents |
| Example: `GS1Identifier`  | Exact source citation | Required / Optional  | What it validates  |

Do not treat the example names above as authorization. Use only names supported by the corpus or explicitly label a proposed name as an implementation recommendation.

### D. Relationship to AMS-0301

Determine:

- whether AMS-0302 must consume or formalize the existing `ReferentId`;
- whether `ReferentId` should remain a string alias or become a stronger domain type;
- whether changing the existing AMS-0301 public type would be required;
- whether any such change is actually necessary for IT-0302.

Do not modify AMS-0301 during this preparation phase.

If a change to the completed Identity implementation appears necessary, classify it explicitly as:

- **No change required**
- **Backward-compatible clarification**
- **AMS-0301 amendment required**
- **Constitutional/documentation correction required**

Do not recommend an amendment merely because a stronger design is possible. Recommend one only when the current implementation conflicts with an explicit governing requirement.

### E. GS1 Validation Boundary

Determine what GS1-specific validation is explicitly required by the corpus.

Separate:

- structural validation required now;
- GS1 syntax validation required now;
- Digital Link parsing required now;
- GTIN validation required now;
- check-digit validation required now;
- normalization or canonicalization required now;
- future validation that is out of scope.

Do not invent regex rules, check-digit algorithms, length restrictions, or identifier formats unless the governing documents explicitly require them.

If the corpus requires GS1 validation but does not define the exact accepted formats or algorithms, report that as a bounded specification gap. Do not silently fill the gap with external assumptions.

### F. Referent Scope

Determine whether IT-0302 must model:

- Product only;
- Product, Brand, and Manufacturer;
- a generic Referent with a discriminated subtype;
- separate records;
- or only an identifier primitive with no Referent record.

Identify the minimum shape required by the wedge and the source supporting each field.

Do not add speculative commerce fields such as price, inventory, category, descriptions, images, merchant ownership, or catalog metadata unless explicitly required.

---

## Required Decision Memo

Before proposing implementation, produce a concise decision memo containing:

1. **Canonical task name**
2. **Canonical scope**
3. **Resolved relationship between GS1 and Referent**
4. **Whether `ReferentRecord` is in scope**
5. **Whether a `GS1Identifier` value object is in scope**
6. **Minimum required domain types**
7. **Minimum required fields**
8. **Required validation rules**
9. **Explicitly out-of-scope behavior**
10. **Relationship to the completed `IdentityRecord`**
11. **Whether AMS-0301 requires any amendment**
12. **Whether CAW-003, CAW-008, or CAW-011 requires a correction**
13. **Recommended strict implementation boundary**

For every conclusion, distinguish:

- **Directly supported by the corpus**
- **Reasonable implementation inference**
- **Unresolved specification gap**

Do not present an inference as a ratified requirement.

---

## Required Implementation Plan

After the decision memo, provide a proposed AMS-0302 implementation plan containing:

- proposed canonical mandate title;
- objective;
- exact files expected to be created or modified;
- proposed exported types and functions;
- validation-result and error conventions;
- serialization requirements;
- test plan;
- package-boundary requirements;
- dependency-graph requirements;
- acceptance criteria;
- definition of done;
- explicit out-of-scope list;
- any blocking question requiring Chair approval.

The plan must preserve the completed AMS-0301 conventions unless the governing corpus requires a justified variation.

---

## Non-Negotiable Constraints

- **Do not implement production code during this mandate.**
- **Do not rename IT-0302 unilaterally.**
- **Do not silently expand IT-0302 to include both a full Referent aggregate and a GS1 identifier model.**
- **Do not modify `packages/domain/src/index.ts` or its tests.**
- **Do not modify `CAW-003`, `CAW-008`, or `CAW-011`.**
- **Do not create new shared utilities or dependencies.**
- **Do not introduce UUID libraries, GS1 libraries, schema-validation libraries, or framework dependencies without explicit constitutional support.**
- **Do not add infrastructure, persistence, Runtime, policy evaluation, authority, capability, or application behavior.**
- **Do not reinterpret the completed AMS-0301 implementation as defective without identifying an exact conflict with a governing requirement.**
- **Do not submit or commit changes.**

---

## Deliverable

Return only:

1. the constitutional scope-reconciliation findings;
2. the required decision memo;
3. the proposed AMS-0302 implementation plan;
4. a clear recommendation of one of the following:

> **A. Scope confirmed — ready for implementation**

> **B. Scope confirmed with documented assumptions — Chair approval required**

> **C. Constitutional ambiguity remains — documentation decision required before implementation**

Do not begin implementation until the Chair reviews and approves the decision memo and implementation plan.

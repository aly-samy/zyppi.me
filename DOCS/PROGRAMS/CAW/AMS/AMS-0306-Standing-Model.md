# AMS-0306 — Standing Domain Model

**Implements:** IT-0306 · **Milestone:** M03 · **Size:** S · **Depends On:** IT-0202 (☑) · **Status:** ☐ Planned

## Load

- `CEngS-000`, `CEngS-001 §4`, `CEngS-002 §4`, `CAW-000`
- `CAW-003 — Domain Model` — Standing entity definition ("the state of the Identity" — minimal wedge scope)
- `CAW-008 — Registry Schema` — `standings` table (same minimal shape as `authorities`/`capabilities`)
- `CAW-011 — Build Order` — `IT-0306`
- Existing `packages/domain/src/index.ts`, `authority.test.ts`, `capability.test.ts`, and all AMS-0301–0305 implementation notes
- This mandate's Council ruling (below) — fully settled, do not reopen

This is the sixth entity and the third of three near-identical minimal-shape records. Reuse the established pattern exactly.

## Objective

Implement `StandingRecord` as a pure, immutable, JSON-safe Domain representation. Per the ratified boundary statement:

> The record structurally asserts a standing scope and its declared validity window. Whether that assertion is currently applicable or sufficient is determined only by Runtime and Policy evaluation.

Do not embed eligibility interpretation, state-machine transitions, or evaluation logic here.

## Constitutional Grounding

CAW-008's `standings` table has the identical shape to `authorities`/`capabilities`:

```text
id          → standingId
subject_id  → subjectId
scope       → scope
valid_from  → validFrom
valid_to    → validTo
```

`scope` remains an **open, opaque string — not a closed eligibility-state enum** (e.g., no `Active | Suspended | Revoked`). POL-001.A notes Standing conditions are jurisdiction-aware; a global closed vocabulary at the Domain layer would hardcode a specific jurisdiction's state machine into a layer that must remain agnostic to it. Evaluation of what a scope value currently means belongs to Runtime/Policy, not Domain.

## Required Domain Shape

```typescript
export type StandingRecord = {
  readonly standingId: string;
  readonly subjectId: string;
  readonly scope: string;
  readonly validFrom: string;
  readonly validTo: string;
};
```

Same five-field shape and same field rules as `AuthorityRecord`/`CapabilityRecord` — see AMS-0304/0305 for full justification, not repeated here.

## Field Contracts

Identical to `AuthorityRecord`/`CapabilityRecord`, with one point made explicit per this task's Council review:

### `scope` — explicit emptiness ruling

Required, non-empty **after trimming**, preserved **exactly as supplied** (trimming is used only to test emptiness — it never mutates the stored value, same convention as AMS-0303 onward):

| Input         | Result                                               |
| ------------- | ---------------------------------------------------- |
| `""`          | invalid                                              |
| `" "`         | invalid                                              |
| `"\t\n"`      | invalid                                              |
| `"default"`   | valid, stored as `"default"`                         |
| `" default "` | valid, stored exactly as `" default "` — not trimmed |

There is no special "default standing" represented by an empty string. If such a concept is needed later, it must be an explicit non-empty scope value defined by the relevant jurisdiction/policy — not inferred from absence.

No length limit, pattern restriction, or wildcard semantics — same OPEN-001-G tracking as `AuthorityRecord`/`CapabilityRecord`'s `scope`, not re-litigated here.

`validFrom`/`validTo`: same rules as AMS-0304/0305 — required, strict ISO-8601 UTC, `validTo` not before `validFrom`, equal permitted, no referential lookup of `subjectId`.

## Validation Contract

```typescript
export function validateStandingRecord(
  candidate: unknown,
): ValidationResult<StandingRecord, StandingValidationError>;

export type StandingValidationErrorCode =
  | "INVALID_STANDING_ID"
  | "INVALID_SUBJECT_ID"
  | "INVALID_SCOPE"
  | "INVALID_VALID_FROM"
  | "INVALID_VALID_TO"
  | "VALID_TO_BEFORE_VALID_FROM";

export type StandingValidationError = {
  readonly code: StandingValidationErrorCode;
  readonly field: keyof StandingRecord;
  readonly message: string;
};
```

Sequential validation order: `standingId → subjectId → scope → validFrom → validTo → temporal-range check` — matches the Council's exact specification. Reuse `ValidationResult<T, E>`; this is the sixth entity, no new abstraction.

## Canonical Serialization

```typescript
export function serializeStandingRecord(record: StandingRecord): string;
```

Alphabetical: `scope`, `standingId`, `subjectId`, `validFrom`, `validTo`. Deterministic, insertion-order independent, round-trip tested.

## Out of Scope

- Status, suspension, revocation, lifecycle transitions, reputation, scoring, delegation, or any policy evaluation
- A closed eligibility-state vocabulary of any kind
- A `scope` length limit (tracked as OPEN-001-G, not decided here)
- Referential validation of `subjectId`
- Changes to any previously completed entity

## Test Requirements

Create `packages/domain/src/standing.test.ts`, mirroring `capability.test.ts`'s coverage. Additionally required:

- The full `scope`-emptiness table above, tested explicitly (all five rows)
- **Compile-time negative assignability tests against both prior sibling types** — a raw `AuthorityRecord` value must not be assignable to `StandingRecord` and vice versa; same check against `CapabilityRecord`. Use `@ts-expect-error` for both, not just one — this task is where the three-way structural distinction actually gets proven, since AMS-0305 only checked against `AuthorityRecord`.
- Regression: full existing Domain suite passes, all five prior entities unchanged.

## Acceptance Criteria

- `StandingRecord` exists with exactly five `readonly` fields, matching CAW-008.
- `scope` emptiness table enforced exactly as specified; trimming never mutates stored value.
- Sequential validation order matches the Council specification exactly.
- Negative assignability tests exist against **both** `AuthorityRecord` and `CapabilityRecord`.
- No status/lifecycle/delegation/evaluation logic present anywhere.
- Canonical serialization alphabetical, deterministic, round-trip tested.
- All five prior entities' behavior unchanged.
- `pnpm format:check`, `lint`, `tsc -b`, `test`, `boundary:all`, `graph:validate`, `runtime:purity` all pass — exact results reported.
- `CAW-011` marks `IT-0306` complete only after verification passes.

## Out-of-Band Note (not part of this task)

The Node.js 20 deprecation warning observed in GitHub Actions is an infrastructure concern, unrelated to this domain task — log it as a separate platform maintenance item, do not fold a runtime-version bump into this mandate's diff.

## Documentation

Create `DOCS/CAW/AMS/AMS-0306-Standing-Model-Implementation-Notes.md`, including the ratified boundary statement verbatim:

> "The record structurally asserts a standing scope and its declared validity window. Whether that assertion is currently applicable or sufficient is determined only by Runtime and Policy evaluation."

Also document: field mapping from CAW-008; the jurisdictional-sovereignty reasoning for rejecting a closed vocabulary (POL-001.A); the full `scope`-emptiness table; the three-way structural distinction and its test coverage; pointer to OPEN-001-G for the length question; the Domain-purity mechanical enforcement gap, if still open.

Update `CAW-011` — mark `IT-0306` complete only after implementation and verification pass.

## Pre-Commit Review

Confirm: no unrelated files changed (including no CI/Node-version changes); no closed vocabulary or length limit introduced; no evaluation/lifecycle logic present; negative assignability tests present against both sibling types; all five prior entities unchanged; `scope` trimming never mutates the stored value.

## Definition of Done

Complete only when: the Standing Domain model, validation types, validator, serializer, and tests exist; the implementation matches CAW-008's five-field contract exactly; the ratified boundary statement is recorded verbatim; three-way structural distinction is proven by compile-time tests; deterministic serialization and round-trip behavior are proven; documentation and CAW-011 are updated; all applicable repository checks have been run and reported; the diff contains no unrelated changes.

## Next

IT-0307 (Policy) closes Wave A. As flagged in AMS-0305, expect a genuinely different shape here — rules/definitions, not a subject+scope+time-window grant. Do not assume the Authority/Capability/Standing pattern transfers directly; re-derive from CAW-003's actual Policy definition and CAW-008's `policies` table before drafting.

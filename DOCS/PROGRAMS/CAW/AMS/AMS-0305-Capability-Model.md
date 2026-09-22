# AMS-0305 — Capability Domain Model

**Implements:** IT-0305 · **Milestone:** M03 · **Size:** S · **Depends On:** IT-0202 (☑) · **Status:** ☐ Planned

## Load

- `CEngS-000`, `CEngS-001 §4`, `CEngS-002 §4`, `CAW-000`
- `CAW-003 — Domain Model` — Capability entity definition ("the specific bounded actions permitted by the Authority" — minimal wedge scope)
- `CAW-008 — Registry Schema` — `capabilities` table (same minimal shape as `authorities`: `id`, `subject_id`, `scope`, `valid_from`, `valid_to`)
- `CAW-011 — Build Order` — `IT-0305`
- Existing `packages/domain/src/index.ts` and all AMS-0301–0304 implementation notes/tests
- This mandate's Council ruling on `scope` length (below) — already settled, do not reopen it

The existing Domain implementation is the immediate coding precedent. This is the fifth entity using the established pattern — reuse it exactly.

## Objective

Implement `CapabilityRecord` as a pure, immutable, JSON-safe Domain representation of a bounded permission grant. **This record asserts that a permission boundary exists. It does not interpret whether an action falls within that boundary — capability matching and policy evaluation belong exclusively to the Runtime**, per the Council's exact wording. Do not embed matching, wildcard, or evaluation logic here.

## Constitutional Grounding

CAW-008's `capabilities` table has the identical shape to `authorities`:

```text
id          → capabilityId
subject_id  → subjectId
scope       → scope
valid_from  → validFrom
valid_to    → validTo
```

Because `AuthorityRecord` and `CapabilityRecord` are structurally near-identical, the distinct identifier field name (`capabilityId`, never a bare `id`) is a deliberate defense against accidental structural cross-assignment between the two types in TypeScript's structural type system — not a stylistic choice. Do not weaken this by naming the field anything else.

## Required Domain Shape

```typescript
export type CapabilityRecord = {
  readonly capabilityId: string;
  readonly subjectId: string;
  readonly scope: string;
  readonly validFrom: string;
  readonly validTo: string;
};
```

Same five-field shape as `AuthorityRecord`, same field rules, same rationale — see AMS-0304 for the full field-by-field justification; it is not repeated here except where Capability differs.

## Field Contracts

Identical to `AuthorityRecord`'s (AMS-0304 §Field Contracts), applied to `CapabilityRecord`:

- `capabilityId`, `subjectId`: required, non-empty after trim, preserved exactly, no existence checks.
- `validFrom`, `validTo`: required (not nullable — same default assumption and same "unresolved gap, report if contradicted" status as AMS-0304), strict ISO-8601 UTC, `validTo` not before `validFrom` (equal is allowed), reuse the existing timestamp validator.

### `scope` — ratified boundary from Council review

- Required, non-empty after trimming, preserved exactly.
- **Open string, no closed vocabulary** — same treatment as `AuthorityRecord.scope` and `EvidenceRecord.evidenceType`.
- **No maximum length is enforced by this task.** This was explicitly considered and rejected by Council ruling: a length limit would be an invented domain rule with no governing source, and would risk a hidden cross-layer contract mismatch against CAW-008's eventual column width and CAW-006's API request-size limits. Do not add one, even a "reasonable-looking" one like 255 or 512. This is tracked as **OPEN-001-G** — do not re-derive or re-argue it inside this task.
- No wildcard interpretation, no `*` or glob semantics — `scope` is an opaque string, matched or not matched entirely by whatever Runtime logic consumes it later (not this task's concern).

## Validation Contract

```typescript
export function validateCapabilityRecord(
  candidate: unknown,
): ValidationResult<CapabilityRecord, CapabilityValidationError>;

export type CapabilityValidationErrorCode =
  | "INVALID_CAPABILITY_ID"
  | "INVALID_SUBJECT_ID"
  | "INVALID_SCOPE"
  | "INVALID_VALID_FROM"
  | "INVALID_VALID_TO"
  | "VALID_TO_BEFORE_VALID_FROM";

export type CapabilityValidationError = {
  readonly code: CapabilityValidationErrorCode;
  readonly field: keyof CapabilityRecord;
  readonly message: string;
};
```

Reuse `ValidationResult<T, E>` — this is the fifth entity; if there's any temptation to build a sixth abstraction, stop and use the existing one. Non-object/`null` root input returns `{code: "INVALID_CAPABILITY_ID", field: "capabilityId"}`, same first-field convention as every prior entity.

## Canonical Serialization

```typescript
export function serializeCapabilityRecord(record: CapabilityRecord): string;
```

Alphabetical key order:

```text
capabilityId
scope
subjectId
validFrom
validTo
```

Deterministic, insertion-order independent, round-trips through `JSON.parse` → `validateCapabilityRecord`.

## Out of Scope

- Capability matching, evaluation, or wildcard/pattern logic — Runtime's job, not Domain's
- A `scope` length limit (ruled out — see above, tracked as OPEN-001-G)
- Delegation, revocation, or lifecycle-status fields — same rejection as AMS-0304, for the same reason
- Relationship modeling between a `CapabilityRecord` and the `AuthorityRecord` that granted it (no `authorityId` field — CAW-008 doesn't link them at this layer; if a governing source requires this link, report it, don't add it silently)
- Changes to `IdentityRecord`, `ReferentRecord`, `GS1Identifier`, `EvidenceRecord`, or `AuthorityRecord`

## Test Requirements

Create `packages/domain/src/capability.test.ts`, mirroring `authority.test.ts`'s coverage exactly (valid record, invalid root values, per-field validation, ordering boundary cases including `validFrom === validTo`, serialization determinism and round-trip, regression against all prior entities). Additionally test: a `CapabilityRecord` and an `AuthorityRecord` built from the same raw values are not interchangeable at the type level (TypeScript compile-time check, not a runtime test — confirms the structural-typing defense from CAW-008's grounding section actually works).

## Acceptance Criteria

- `CapabilityRecord` exists with exactly five `readonly` fields, matching CAW-008.
- `scope` has no length limit, no closed vocabulary, no wildcard semantics.
- `validTo` not-before-`validFrom` check implemented and tested; equal values accepted.
- `ValidationResult` convention reused; no new generic abstraction introduced.
- Canonical serialization implemented, alphabetical, deterministic, round-trip tested.
- Distinct field name (`capabilityId`) confirmed to prevent structural cross-assignment with `AuthorityRecord`.
- All prior entities' behavior unchanged.
- `pnpm format:check`, `lint`, `tsc -b`, `test`, `boundary:all`, `graph:validate`, `runtime:purity` all pass — exact results reported.
- `CAW-011` marks `IT-0305` complete only after verification passes.

## Documentation

Create `DOCS/CAW/AMS/AMS-0305-Capability-Model-Implementation-Notes.md`, including the exact boundary statement from Council review:

> "The CapabilityRecord asserts that a permission boundary exists. It does not interpret whether an action falls within that boundary. Capability matching and policy evaluation belong exclusively to the Runtime."

Also document: the field mapping from CAW-008; the rejected `scope` length limit and pointer to OPEN-001-G; the `validTo` nullability assumption (same status as AMS-0304); the structural cross-assignment defense rationale; the Domain-purity mechanical enforcement gap, if still open.

Update `CAW-011` — mark `IT-0305` complete only after implementation and verification pass.

## Pre-Commit Review

Confirm: no unrelated files changed; no `scope` length limit was added under any framing; no delegation/revocation/lifecycle fields present; no matching/evaluation logic present; prior entities unchanged; `CapabilityRecord` and `AuthorityRecord` remain structurally distinct at the type level despite identical shape.

## Definition of Done

Complete only when: the Capability Domain model, validation types, validator, serializer, and tests exist; the implementation matches CAW-008's five-field contract exactly with no invented length constraint; the Council's boundary statement is recorded verbatim in implementation notes; deterministic serialization and round-trip behavior are proven; documentation and CAW-011 are updated; all applicable repository checks have been run and reported; the diff contains no unrelated changes.

## Next

IT-0306 (Standing) is the last of the near-identical minimal-shape entities before IT-0307 (Policy), which will likely be the first Wave-A entity with a genuinely different shape (rules/definitions rather than a subject+scope+time-window grant) — expect the established pattern to need real adaptation there, not just a renamed copy.

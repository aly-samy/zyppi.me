# AMS-0305 — Capability Domain Model Implementation Notes

## 1. Field Mapping: CAW-008 Storage-to-Domain

The wedge's `capabilities` database storage row (from CAW-008's registry schema) is mapped to TypeScript field names exactly as defined:

- `id` → `capabilityId`
- `subject_id` → `subjectId`
- `scope` → `scope`
- `valid_from` → `validFrom`
- `valid_to` → `validTo`

## 2. Capability Assertion vs. Capability Evaluation

As ratified during Council review:

> "The CapabilityRecord asserts that a permission boundary exists. It does not interpret whether an action falls within that boundary. Capability matching and policy evaluation belong exclusively to the Runtime."

This record is a pure data-carrying representation. No glob pattern matching, prefix evaluation, allowance/denial policy semantics, or capability-inheritance/composition rules exist at this level.

## 3. Opaque and Open Scope

The `scope` field is treated as an open, opaque, non-empty, trimmed string.

- **No closed vocabulary or finite enum** is enforced.
- **No length limit is imposed.** This constraint was rejected in Council review to avoid hidden cross-layer contract mismatches (OPEN-001-G). No limits (like 255 or 512) are checked or enforced.
- **No wildcard/glob semantics** are supported. The string is preserved exactly.

## 4. Required validTo Nullability Assumption

Like `AuthorityRecord`, `validTo` is required and non-nullable to avoid speculative open-ended validation logic and to prioritize concrete, deterministic contracts.

## 5. Chronological Validity-Range Check

The validity window is checked at compile-time and validated sequentially:

- `validTo` must not be chronologically before `validFrom`. If it is, `VALID_TO_BEFORE_VALID_FROM` is returned for `validTo`.
- Equal timestamps (`validFrom === validTo`) are considered valid, representing a zero-duration validity window.

## 6. Structural Type System Defenses (Non-Assignability)

Because `AuthorityRecord` and `CapabilityRecord` are structurally near-identical, TypeScript's structural type system could otherwise allow them to be accidentally interchanged.

To defend against this, distinct unique identifier field names are used:
- `capabilityId` (never a bare `id`) for `CapabilityRecord`
- `authorityId` (never a bare `id`) for `AuthorityRecord`

This creates a compile-time assignability mismatch, verified via negative compile-time tests (`@ts-expect-error` assertions) checking assignment in both directions.

## 7. Canonical Serialization & Round-Trip Behavior

`CapabilityRecord` is serialized deterministically in strict alphabetical field order:

1. `capabilityId`
2. `scope`
3. `subjectId`
4. `validFrom`
5. `validTo`

This preserves the original representations exactly and supports successful round-trips (`CapabilityRecord` → `serializeCapabilityRecord` → `JSON.parse` → `validateCapabilityRecord`).

## 8. Domain-Purity Mechanical Enforcement Gap

The monorepo-level static purity checker (`tools/validate-runtime-purity.mjs`) scans `packages/runtime`, which leaves a mechanical gap for automated purity enforcement on leaf packages like `packages/domain`. Purity is instead verified through rigorous review, deterministic unit tests, and the exclusion of clock or filesystem side-effects.

## 9. Explicitly Excluded Scopes

The implementation rigorously excludes:
- Any `authorityId` linkage or Capability-to-Authority relationship mapping.
- Delegation, grantor, sponsor, or provenance fields.
- Revocation status, revocation cascade, or lifecycle fields.
- Runtime wildcard matching or evaluation engine components.

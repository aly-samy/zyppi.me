# AMS-0306 Standing Model Implementation Notes

## Verbatim Boundary Statement

The ratified boundary statement for the Standing model is recorded verbatim below:

> "The record structurally asserts a standing scope and its declared validity window. Whether that assertion is currently applicable or sufficient is determined only by Runtime and Policy evaluation."

No interpretation logic, eligibility determination, or evaluation state machines are embedded inside the `packages/domain` package.

## Field Mapping from CAW-008

The field mapping between the CAW-008 registry database `standings` schema and the `StandingRecord` TypeScript representation is configured as follows:

| DB Column (`standings` table) | `StandingRecord` Field | Type     | Description                                          |
| ----------------------------- | ---------------------- | -------- | ---------------------------------------------------- |
| `id`                          | `standingId`           | `string` | Unique identifier for this standing grant.           |
| `subject_id`                  | `subjectId`            | `string` | Reference identifier for the subject entity.         |
| `scope`                       | `scope`                | `string` | Open, opaque string asserting the scope of standing. |
| `valid_from`                  | `validFrom`            | `string` | Strict ISO-8601 UTC timestamp of start of validity.  |
| `valid_to`                    | `validTo`              | `string` | Strict ISO-8601 UTC timestamp of end of validity.    |

## Jurisdictional Sovereignty (POL-001.A)

Per POL-001.A, Standing conditions are highly jurisdiction-aware. Therefore, a closed eligibility vocabulary/enum (e.g. `Active | Suspended | Revoked`) has been rejected. Modeling a closed vocabulary at the Domain level would hardcode a specific jurisdiction's state machine into a layer that must remain agnostic to it. Instead, `scope` remains an open, opaque string, deferring any interpretation to Policy and Runtime layers.

## Scope-Emptiness Table

The explicit emptiness validation and preservation table is enforced exactly as follows (trimming is used only to test for emptiness and never mutates the stored value):

| Input         | Validation Result         | Saved Value   | Description                                                      |
| ------------- | ------------------------- | ------------- | ---------------------------------------------------------------- |
| `""`          | Invalid (`INVALID_SCOPE`) | —             | Empty string is rejected                                         |
| `" "`         | Invalid (`INVALID_SCOPE`) | —             | Single space is rejected                                         |
| `"\t\n"`      | Invalid (`INVALID_SCOPE`) | —             | Whitespace escapes are rejected                                  |
| `"default"`   | Valid                     | `"default"`   | Preserved exactly as input                                       |
| `" default "` | Valid                     | `" default "` | Preserved exactly as input (leading/trailing whitespace remains) |

There is no special "default standing" represented by an empty string.

## Three-Way Structural Distinction

Since AMS-0304/0305 introduced sibling entities with similar five-field shapes, a robust type defense has been established to ensure complete compile-time type-safety:

- `StandingRecord` has the unique field `standingId`.
- `AuthorityRecord` has the unique field `authorityId`.
- `CapabilityRecord` has the unique field `capabilityId`.

These unique field names prevent structural cross-assignment in TypeScript. Bidirectional negative assignability tests (using `@ts-expect-error`) have been implemented in `standing.test.ts` to cover all four directions:

- `StandingRecord` assigned to `AuthorityRecord` (and vice-versa)
- `StandingRecord` assigned to `CapabilityRecord` (and vice-versa)

## Tracking & References

- **OPEN-001-G Pointer**: The question of whether to enforce a maximum length limit or pattern match on `scope` is deferred to `OPEN-001-G` tracking and is not resolved in M03.
- **Domain-Purity Mechanical Enforcement Gap**: Note that the static runtime purity validator (`tools/validate-runtime-purity.mjs`) is currently bound to `packages/runtime`. There is an open gap in automated enforcement of purity rules across `packages/domain` via programmatic AST checks, though the `packages/domain` layer itself is maintained pure by design and manual discipline.

# AMS-0304 — Authority Domain Model Implementation Notes

## 1. Field Mapping: CAW-008 Storage-to-Domain

The wedge's `authorities` database storage row is mapped to TypeScript field names as defined by CAW-008:

- `id` → `authorityId`
- `subject_id` → `subjectId`
- `scope` → `scope`
- `valid_from` → `validFrom`
- `valid_to` → `validTo`

## 2. Explicitly Rejected Scope

To avoid scope expansion, all delegation, revocation, organization, or cascading logic has been explicitly excluded from both the code and the tests under Chair-level instructions:

- No `delegatedBy` / `grantedBy` / `sponsorId` or any delegation-chain references exist.
- No `delegationDepth` or hierarchy fields.
- No revocation status, revocation reason, or revocation cascade logic.
- No distinction between human and agent subjects.
- No `status` field or any reference to POL-001's Authority lifecycle (such as Established/Active/Suspended/Revoked) is added; authority validity is determined purely by the chronological time window.

## 3. Open Scope Vocabulary

The `scope` field is preserved as an open, non-empty, trimmed string. Because no ratified finite vocabulary exists in the schema (CAW-003 / CAW-008), we do not restrict `scope` to a closed union or introduce custom literals (e.g. `"read:product"`).

## 4. Required validTo Nullability Assumption

`validTo` is required and non-nullable. This satisfies the wedge's preference for explicit, non-speculative fields, and avoids unresolved specification gaps regarding open-ended authorities.

## 5. Chronological Validity-Range Ordering Check

As a reasonable pure structural inference, `validTo` must not be chronologically before `validFrom`.

- If `validTo` is before `validFrom`, validation returns `VALID_TO_BEFORE_VALID_FROM` mapped to the field `validTo`.
- Zero-duration authorities (`validTo === validFrom`) are considered valid.

## 6. Canonical Serialization & Round-Trip Behavior

`AuthorityRecord` is serialized deterministically in alphabetical order:

1. `authorityId`
2. `scope`
3. `subjectId`
4. `validFrom`
5. `validTo`

The serialization preserves original string representations exactly. Tests verify that `serialize -> JSON.parse -> validate` round-trips correctly without value changes.

## 7. Domain-Purity Mechanical Enforcement Gap

The repository-level purity validator (`tools/validate-runtime-purity.mjs`) evaluates only `packages/runtime` files and manifest configurations. It does not scan `packages/domain` for purity violations (such as clock or filesystem accesses). Domain purity is verified via strict review and deterministic test assertions.

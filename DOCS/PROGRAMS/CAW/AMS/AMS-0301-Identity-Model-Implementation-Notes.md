# AMS-0301 — Identity Domain Model Implementation Notes

## Conventions Established for M03 (IT-0301–0307)

### 1. Timestamp Representation

- Timestamps must be typed as required ISO-8601 UTC strings:
  ```typescript
  createdAt: string;
  updatedAt: string;
  ```
- No implicit state or clocks: the Domain layer must never generate dates or timestamps using `Date.now()`, `new Date()`, or any implicit timezone rules.
- Pure calendar-level calendar validation of ISO-8601 strings is done to prevent invalid dates (such as "February 30th") from being parsed as valid overflowing Dates.

### 2. Validation and Typed Error Convention

- Uses the `ValidationResult<T, E>` discriminated union:
  ```typescript
  export type ValidationResult<T, E> =
    { ok: true; value: T } | { ok: false; error: E };
  ```
- Errors are structured as:
  ```typescript
  export type IdentityValidationError = {
    code: IdentityValidationErrorCode;
    field: keyof IdentityRecord;
    message: string;
  };
  ```
- Normal validation does not throw exceptions.

### 3. Canonical Serialization (RI-001)

- `IdentityRecord` is composed exclusively of JSON-safe primitive values and `null`.
- Serializer (`serializeIdentityRecord`) enforces strict alphabetic key ordering for deterministic output across implementations:
  `canonicalReference` -> `createdAt` -> `identityId` -> `identityType` -> `referentId` -> `status` -> `updatedAt`

### 4. Naming Convention

- Follows the cross-entity rule from CAW-003:
  - Identity's identifier field: `identityId`
  - References use exact identifier names: `referentId`

## Enforced Security and Architectural Boundaries

- **Leaf-Package Boundaries:** `packages/domain` maintains an empty dependencies list in `package.json` and zero typescript project references in `tsconfig.json`.
- **Enforcement Gap Flagged:**
  The static purity and determinism validator located at `tools/validate-runtime-purity.mjs` (run via `pnpm runtime:purity`) only scans `packages/runtime` (and its manifest `packages/runtime/package.json`). It currently **does not** scan `packages/domain` files or manifests. This is a potential enforcement gap worth flagging for extension in future milestones.

# AMS-0308 — ExecutionRequest Domain Model Implementation Notes

**Milestone:** M03 — Domain Foundation
**Task:** IT-0308 — ExecutionRequest
**Status:** IMPLEMENTED AND VERIFIED

---

## 1. Top-Level Field Mapping (CAW-007)

The `ExecutionRequest` implementation strictly preserves the exact six-field contract required by CAW-007:

```typescript
export interface ExecutionRequest {
  readonly requestId: string;
  readonly identity: IdentityRecord;
  readonly activeConstitutionalView: ActiveConstitutionalView;
  readonly evidenceBundle: EvidenceBundle;
  readonly policyContext: PolicyContext;
  readonly executionContext: ExecutionContext;
}
```

No field has been renamed, removed, merged, or duplicated.

---

## 2. Identity Mapping

The CAW-007 abstract `Identity` type maps directly to the existing Wave A `IdentityRecord`.

- Mapped as: `readonly identity: IdentityRecord`
- Validation calls `validateIdentityRecord` directly. No speculative wrapper types or identifier-only replacements were introduced.

---

## 3. Active Constitutional View (ACV) Structure

`ActiveConstitutionalView` represents a Runtime-facing composition boundary of the minimum necessary constitutional state. We map each of the seven categories identified by CAW-007 verbatim to the existing Wave A Domain structures:

```typescript
export interface ActiveConstitutionalView {
  readonly identity: IdentityRecord;
  readonly relationships: readonly ReferentRecord[];
  readonly standings: readonly StandingRecord[];
  readonly authorities: readonly AuthorityRecord[];
  readonly capabilities: readonly CapabilityRecord[];
  readonly evidenceReferences: readonly EvidenceRecord[];
  readonly applicablePolicies: readonly PolicyRecord[];
}
```

No speculative fields or generic escape hatches (such as `any` or `unknown`) are used.

---

## 4. EvidenceBundle Boundary

As established by `AMS-0303`, `EvidenceBundle` resolution, blob loading (R2), and Postgres fetching are out of scope for the pure Domain layer and deferred to Milestone M07.
We define a narrow, explicit, and type-safe structure carrying fully-validated `EvidenceRecord`s:

```typescript
export interface EvidenceBundle {
  readonly evidenceRecords: readonly EvidenceRecord[];
}
```

---

## 5. PolicyContext Boundary

The policy context is a required input distinct from policy execution. We reuse the existing Wave A `PolicyRecord` within a narrow, structured contract:

```typescript
export interface PolicyContext {
  readonly policies: readonly PolicyRecord[];
}
```

---

## 6. ExecutionContext Boundary

`ExecutionContext` carries explicit execution parameters (such as `budget`, `entropy`, and `versions`) without any implicit version resolution, randomness, or clock state.

```typescript
export interface ExecutionContext {
  readonly budget: number;
  readonly entropy: string;
  readonly versions: readonly string[];
}
```

- `budget`: Validated as a non-negative finite number.
- `entropy`: Validated as a non-empty string.
- `versions`: Validated as a string array where each item is non-empty.

---

## 7. Structural Validation Boundary

Validation of `ExecutionRequest` is pure, synchronous, deterministic, non-coercive, non-mutating, and free of I/O.
It ensures that:

- The root value has the required object structure.
- All six required top-level fields are present.
- Every nested object/array strictly satisfies its respective validator.

---

## 8. Exclusion of Evaluation and Runtime State

The Domain validator strictly isolates model validity from behavioral evaluation.

- No registry or database lookups (PostgreSQL, Redis, etc.) are performed.
- No evidence fetching, file operations, or network calls (HTTP, R2, etc.) are made.
- No policy interpretation, execution budgets, or cryptographic signature verifications are performed.

---

## 9. Canonical Serialization

Canonical serialization is implemented deterministically using explicit, sorted property key ordering for the top-level request and each nested record type. It preserves array element ordering and complies with the Domain leaf-package constraints.

Top-level alphabetical field ordering:

1. `activeConstitutionalView`
2. `evidenceBundle`
3. `executionContext`
4. `identity`
5. `policyContext`
6. `requestId`

No duplicate serializer architecture or package-boundary violations (such as importing from `packages/shared`) were introduced.

---

## 10. Package-Boundary & Purity Compliance

- **Leaf-Package Boundaries:** `packages/domain` maintains an empty dependencies list in `package.json` and zero TypeScript project references in `tsconfig.json`.
- **Static Verification:** Verified using the repo-wide `pnpm boundary:all` and `pnpm graph:validate` scripts.
- **Purity:** Pure functions do not reference clock times, global state, or environmental entropy sources.

---

## 11. Files Changed

- `packages/domain/src/index.ts` — Added types/interfaces, `validateExecutionRequest`, and `serializeExecutionRequest`.
- `packages/domain/src/executionRequest.test.ts` — Created comprehensive test suite.
- `DOCS/CAW/AMS/AMS-0308-ExecutionRequest-Model-Implementation-Notes.md` — Created this documentation file.

---

## 12. Verification and Tests Executed

At review time, the following checks were executed successfully:

- `pnpm format:check` — Completed successfully.
- `pnpm lint` — Completed successfully with zero linting issues.
- `pnpm exec tsc -b` — Completed successfully with zero compiler diagnostics.
- `pnpm test` — Completed successfully; 210 of 210 unit tests passing.
- `pnpm boundary:all` — Completed successfully.
- `pnpm graph:validate` — Completed successfully.
- `pnpm runtime:purity` — Completed successfully.

---

## 13. Ambiguities and Resolutions

No source ambiguities or implementation deviations were encountered. The requirements of the AMS-0308 mandate aligned perfectly with the existing Wave A Domain precedents and design constraints.

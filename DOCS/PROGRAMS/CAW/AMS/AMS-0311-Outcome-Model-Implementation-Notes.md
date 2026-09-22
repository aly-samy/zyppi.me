# AMS-0311 — Outcome Model Implementation Notes

**Milestone:** M03 — Domain Foundation
**Task ID:** IT-0311 — Outcome Model
**Status:** COMPLETE (RESOLVED BY IMPLEMENTATION)
**Target Package:** `@zyppi/domain` (`packages/domain`)

---

## 1. Final Outcome Contract

The final model contract is implemented as a set of strict, type-safe primitives and functions exported directly from `packages/domain/src/index.ts`:

```typescript
export type Outcome = "verified" | "unverified" | "rejected";

export type OutcomeValidationErrorCode = "INVALID_OUTCOME";

export interface OutcomeValidationError {
  readonly code: OutcomeValidationErrorCode;
  readonly message: string;
}

export function validateOutcome(
  input: unknown,
): ValidationResult<Outcome, OutcomeValidationError>;

export function serializeOutcome(outcome: Outcome): string;
```

---

## 2. Constitutional Semantic Boundary

As mandated by CAW-003 and CAW-011, `Outcome` represents the terminal verification disposition produced by the Runtime’s constitutional evaluation process. It represents the ultimate logical conclusion of the integrated wedge runtime evaluation, resolving the wedge's constitutional inputs (including identity validity, evidence validity, policy compliance, trust requirements, capability requirements, and authority requirements) into a terminal state.

---

## 3. Exact Vocabulary

The authorized vocabulary consists exactly of the three lowercase literals:

- `"verified"`: The Runtime's constitutional evaluation produced a verified disposition.
- `"unverified"`: The Runtime's constitutional evaluation did not establish a verified disposition.
- `"rejected"`: The Runtime's constitutional evaluation produced a rejected disposition.

---

## 4. Validation Behavior

The validator (`validateOutcome`):

1. Is pure, synchronous, deterministic, and non-throwing.
2. Performs no environmental/clock state reads, I/O, or random generation.
3. Is strictly non-coercive and non-mutating.
4. Uses exact primitive-literal equality mapping against the three authorized strings.
5. Rejects all invalid strings (including empty strings, leading/trailing whitespace variants, upper/mixed-case variants, unrecognized strings, and synonyms), non-string primitive types, boxed strings, objects, and arrays.

---

## 5. Error Structure

For every invalid input, the validator returns a standardized `ValidationResult` with:

```typescript
{
  ok: false,
  error: {
    code: "INVALID_OUTCOME",
    message: "outcome must be one of: verified, unverified, rejected"
  }
}
```

Because `Outcome` is a primitive scalar, `OutcomeValidationError` does not contain a `field` property.

---

## 6. Scalar Serialization Behavior

Canonical serialization (`serializeOutcome`) is implemented exactly as:

```typescript
export function serializeOutcome(outcome: Outcome): string {
  return JSON.stringify(outcome);
}
```

And produces:

- `serializeOutcome("verified")` -> `'"verified"'`
- `serializeOutcome("unverified")` -> `'"unverified"'`
- `serializeOutcome("rejected")` -> `'"rejected"'`

---

## 7. No Object-Key Ordering

Because `Outcome` is a primitive string-literal union and serialized as a JSON scalar, object-key ordering and alphabetical field ordering are completely inapplicable. No synthetic object wrappers are introduced.

---

## 8. Sibling-Boundary Analysis

`Outcome` acts as an independent sibling of other properties inside the runtime's execution output:

- **TrustResult**: Probabilistic trust classification (e.g. `definite`, `speculative`) belongs entirely to `TrustResult`. `Outcome` contains no trust values.
- **PolicyDecision[]**: Individual policy decisions and detailed reasoning are tracked under `policyDecisions`. `Outcome` only represents the terminal conclusion.
- **ExecutionReceipt**: Audit hashes, run times, and execution IDs are stored in `ExecutionReceipt`. `Outcome` remains clean of execution telemetry.
- **evidenceReferences**: Storage URLs, payload hashes, and reference IDs are stored in `evidenceReferences`.
- **Diagnostics**: Trace outputs, execution errors, and warning logs belong in `Diagnostics`.

---

## 9. Distinction from Sibling Entities

- **TrustResult**: Trust evaluations are independent of terminal verification dispositions. They remain physically and logically segregated.
- **PolicyDecision[]**: `Outcome` encapsulates the result of evaluations but does not embed the underlying decision trace.
- **ExecutionReceipt**: Timing and versioning metadata belong only in the receipt.
- **Evidence References**: The list of validated/referenced evidence IDs is tracked separately.
- **Diagnostics**: Human-readable messages or errors do NOT populate the primitive `Outcome`.

---

## 10. Policy Authorization vs. Verification

`Outcome` represents the terminal verification disposition of the Runtime, not a general-purpose Policy authorization disposition.
This model does NOT define, replace, or constrain future policy vocabularies (e.g., `Authorized`, `Denied`, `Conditionally Authorized`, or `Deferred`), which remain independent.

---

## 11. Outcome is Not a SEC-Only Artifact

While verification relies on underlying security factors (such as identity or cryptographic proofs), `Outcome` is defined by CAW-003 as the decision/result produced by integrated policy evaluation. It represents the final synthesis of the wedge, not an isolated security-only attestation.

---

## 12. Scope Exclusions

The following behaviors are strictly excluded from this implementation task:

- Policy evaluation, rules priority, and policy aggregation algorithms.
- Evidence-loading, trust calculation, or receipt generation.
- Database, filesystem, API response mapping, clock, or network access.

---

## 13. Files Changed

- `packages/domain/src/index.ts`: Added types, validator, and serializer.
- `packages/domain/src/outcome.test.ts`: Added full unit test suite.
- `DOCS/CAW/CAW-011-Build-Order.md`: Updated `IT-0311` status.

---

## 14. Verification Commands and Results

- **TypeScript Compilation Check**: `pnpm exec tsc -b` -> Passed
- **Unit Test Suite**: `pnpm test` -> All 324 tests passed
- **Dependency Boundary Validator**: `pnpm boundary:all` & `pnpm graph:validate` -> Passed
- **Runtime Purity Check**: `pnpm runtime:purity` -> Passed

---

## 15. Provenance Classification

- **Direct CAW Requirements**: `Outcome` is a primitive scalar union; distinct sibling structure; exact literals list (`"verified"`, `"unverified"`, `"rejected"`); deterministic serialization.
- **Engineering Constraints**: Synchronous non-throwing validation; strict primitive-literal equality; non-coercive; JSON scalar JSON.stringify serialization.
- **Chair-Authorized Decisions**: `OutcomeValidationError` lacks `field` property; exact string comparison; exact `INVALID_OUTCOME` error mapping.

# AMS-0307 — Policy Domain Model

**Implements:** IT-0307 · **Milestone:** M03 (final Wave-A entity) · **Size:** M · **Depends On:** IT-0202 (☑) · **Status:** ☐ Planned

## Load

- `CEngS-000`, `CEngS-001 §4`, `CEngS-002 §4`, `CAW-000`
- `CAW-003 — Domain Model` — Policy entity definition ("a rule evaluated by the Runtime... read-only for this wedge")
- `CAW-008 — Registry Schema` — `policies` table (`id`, `policy_type`, `version`, `definition (jsonb)`, `active`)
- `CAW-011 — Build Order` — `IT-0307`
- Existing `packages/domain/src/index.ts` and all AMS-0301–0306 implementation notes
- This mandate's Council ruling (below) — fully ratified, do not reopen

**This entity does not share the Authority/Capability/Standing shape.** Do not copy those three as a template — Policy has a different field set and, critically, a recursive JSON-value field with its own validation discipline. Read this mandate in full before starting.

## Objective

Implement `PolicyRecord` as a pure, immutable, JSON-safe Domain representation of a policy row. **`definition` is a structural JSON-value carrier, not a policy-language schema.** This task validates that `definition` is well-formed JSON-shaped data. It does not parse, interpret, evaluate, execute, or assign any meaning to what that data represents — that is Runtime's job, in a future milestone, not this one.

## Constitutional Grounding

CAW-008 field mapping:

```text
id           → policyId
policy_type  → policyType
version      → version
definition   → definition   (recursive JSON value — see below)
active       → active       (strict boolean)
```

CAW-003: Policy is read-only for this wedge — no policy authoring UI, no policy-writing logic. This task builds the pure representation only.

## Required Domain Shape

```typescript
export type PolicyDefinition =
  | null
  | boolean
  | number
  | string
  | readonly PolicyDefinition[]
  | { readonly [key: string]: PolicyDefinition };

export type PolicyRecord = {
  readonly policyId: string;
  readonly policyType: string;
  readonly version: string;
  readonly definition: PolicyDefinition;
  readonly active: boolean;
};
```

## Field Contracts

### `policyId`, `policyType`, `version`

Required strings, non-empty after trimming (trim tests emptiness only — never mutates the stored value, same convention since AMS-0303). Preserved exactly.

### `definition` — the recursive JSON-value boundary

Accepts any recursively valid, **finite** JSON value:

- `null`

- `boolean`

- `number` — valid only if `Number.isFinite(value) === true`. Rejects `NaN`, `Infinity`, `-Infinity`. Permits negative numbers and zero.

- `string` — accepted as an opaque JSON string. **Do not decode, inspect, parse, or validate its content** — a Base64-encoded blob or a WASM-related string is carried structurally and untouched. Interpreting string content is a policy-semantics concern, out of this task's boundary entirely.

- `readonly PolicyDefinition[]` — array order is preserved, never sorted, never mutated.

- `{ readonly [key: string]: PolicyDefinition }` — a plain JSON object only. Reject anything that isn't a plain object: class instances, `Map`/`Set`, functions, symbols, `undefined` values, `bigint`.

  For this task, a plain JSON object is an object whose prototype is either `Object.prototype` or `null`. Objects with any other prototype are invalid, including class instances and built-in object types.

  A null-prototype object is accepted because it is structurally an ordinary key/value container and has no executable or inherited behavior. Canonical serialization must enumerate its own enumerable string keys directly and must not rely on instance methods such as `hasOwnProperty`.

**Cycle detection is required.** If `candidate.definition` is a raw JavaScript object (not necessarily derived from `JSON.parse`), it may contain a circular reference that JSON text itself never could. The recursive validator must detect cycles and return a structured validation error — never allow unbounded recursion to crash the process with a stack overflow.

Cycle detection must be **path-sensitive**: track container references currently on the active recursion path, adding a reference when descending into it and removing it when returning. A repeated reference encountered through a separate completed branch is not, by itself, a cycle and must not be rejected merely because the same object or array instance appears more than once.

`CYCLIC_DEFINITION` reports against `field: "definition"`. This is a validator-robustness requirement, not a policy-semantics decision.

### `active`

Required, **strictly boolean** — no coercion. `1`, `"true"`, `0`, `"false"` are all invalid; only literal `true`/`false` are accepted.

## Validation Contract

Sequential validation order, exactly: `policyId → policyType → version → definition → active`.

```typescript
export function validatePolicyRecord(
  candidate: unknown,
): ValidationResult<PolicyRecord, PolicyValidationError>;

export type PolicyValidationErrorCode =
  | "INVALID_POLICY_ID"
  | "INVALID_POLICY_TYPE"
  | "INVALID_VERSION"
  | "INVALID_DEFINITION"
  | "CYCLIC_DEFINITION"
  | "INVALID_ACTIVE";

export type PolicyValidationError = {
  readonly code: PolicyValidationErrorCode;
  readonly field: keyof PolicyRecord;
  readonly message: string;
};
```

Non-object/`null` root input returns `{code: "INVALID_POLICY_ID", field: "policyId"}` — same first-field convention as every prior entity. `CYCLIC_DEFINITION` reports against `field: "definition"`. Reuse `ValidationResult<T, E>` — seventh entity, no new abstraction.

**No policy semantics are inferred from any `definition` value.** The validator answers "is this structurally valid JSON-shaped data," never "is this a valid policy," "does this allow or deny an action," or "is this executable."

## Canonical Serialization

```typescript
export function serializePolicyRecord(record: PolicyRecord): string;
```

- Top-level key order (alphabetical, same convention as every prior entity): `active`, `definition`, `policyId`, `policyType`, `version`.
- Within `definition`: object keys are recursively sorted at every nesting level; array element order is always preserved, never sorted.
- Deterministic, does not mutate the supplied record, round-trips through `JSON.parse` → `validatePolicyRecord` without value changes.
- Arbitrary JSON property names are data and must be preserved exactly, including keys such as `__proto__`, `constructor`, and `prototype`. Canonicalization must not assign untrusted keys through prototype-sensitive property assignment. Construct canonical objects using a prototype-safe mechanism so these keys remain ordinary own data properties and cannot alter an object's prototype.

## Out of Scope

- Parsing, decoding, or interpreting the _content_ of any `definition` string, number, or structure
- Policy evaluation, matching, execution, or any Runtime logic
- A policy-language schema or grammar of any kind
- Policy authoring, versioning workflow, or activation/deactivation logic beyond storing the `active` boolean as given
- Relationship modeling to `AuthorityRecord`/`CapabilityRecord`/`StandingRecord`
- Changes to any previously completed entity

## Test Requirements

Create `packages/domain/src/policy.test.ts`:

- **Valid records** — `definition` as each of: `null`, `true`/`false`, `0`, a negative number, a large-but-finite number, an empty string, a non-empty string (including a Base64-looking string, confirmed _not_ decoded), an empty array, a nested array, an empty object, a deeply nested object, a mixed structure combining all of the above. The implementation must not introduce an arbitrary maximum nesting depth. It must correctly handle the repository's representative deeply nested test case without throwing or mutating input. If the implementation requires a depth limit or an iterative traversal to satisfy repository robustness requirements, stop and report the exact technical constraint rather than inventing a limit silently.

- **Invalid `definition`** — `NaN`, `Infinity`, `-Infinity`, `undefined` (as a value inside an object/array), a function, a symbol, a `bigint`, a `Map`/`Set`/class instance, a **cyclic object** (construct one deliberately, e.g. `const o = {}; o.self = o;`) — confirm `CYCLIC_DEFINITION` is returned, not a stack overflow or thrown exception.

- **Semantic-neutrality boundary (explicit, required)** — write a test asserting that a `definition` value of `false`, `null`, a scalar, an array, or an object is _structurally accepted_, and explicitly assert nothing about what it means, whether it allows/denies anything, or whether it's "valid policy logic." This test exists specifically to prevent a future contributor from adding semantic assertions here by mistake.

- **`active`** — `true`/`false` accepted; `1`, `0`, `"true"`, `"false"`, `null`, missing, rejected.

- **`policyId`/`policyType`/`version`** — same missing/empty/whitespace-only pattern as every prior entity.

- **Serialization** — deterministic recursive key-sorting for objects at every depth; array order preserved at every depth; round-trip fidelity for every valid-record test case above, including deeply nested ones; no mutation of the input record.

Add an explicit prototype-pollution safety requirement:

```{
{
  "__proto__": { marker: true },
  "constructor": "data",
  "prototype": "data",
}
```

The test should verify:

1. validation succeeds;
2. serialization is deterministic;
3. the keys survive round-trip as ordinary data;
4. no prototype mutation occurs.

- **Regression** — full existing Domain suite passes, all six prior entities unchanged.

## Acceptance Criteria

- `PolicyRecord`/`PolicyDefinition` exist matching the types above exactly.
- `definition` accepts the full recursive JSON domain (with finite-number and cycle-detection constraints) and nothing else.
- No string content within `definition` is ever decoded or interpreted.
- `active` is strictly boolean, no coercion.
- Cyclic `definition` values are rejected cleanly (`CYCLIC_DEFINITION`), never crash the process.
- Sequential validation order matches exactly: `policyId → policyType → version → definition → active`.
- Canonical serialization: top-level alphabetical, recursive object-key sorting within `definition`, array order always preserved.
- The semantic-neutrality test exists and passes.
- All six prior entities' behavior unchanged.
- `pnpm format:check`, `lint`, `tsc -b`, `test`, `boundary:all`, `graph:validate`, `runtime:purity` all pass — exact results reported.
- `CAW-011` marks `IT-0307` complete only after verification passes. This completes the planned Wave-A domain-foundation implementation set. The subsequent M03 closure pass must verify the authoritative task inventory and must not infer the entity count from this mandate.

## Documentation

Create `DOCS/CAW/AMS/AMS-0307-Policy-Model-Implementation-Notes.md`, documenting: the CAW-008 field mapping; the exact `PolicyDefinition` recursive JSON domain and its finite-number/cycle-detection constraints; the explicit string-as-opaque-carrier rule; the semantic-neutrality boundary and why the test for it exists; canonical serialization's recursive-vs-array-preserving key ordering; the Domain-purity mechanical enforcement gap, if still open.

Update `CAW-011` — mark `IT-0307` complete, and note that this closes Wave A of M03's domain foundation.

## Pre-Commit Review

Confirm: no unrelated files changed; no interpretation, decoding, or evaluation logic touches `definition` anywhere; cyclic input is handled without crashing; the semantic-neutrality test is present and doesn't assert meaning; all six prior entities unchanged; `active` has zero coercion paths.

## Definition of Done

Complete only when: `PolicyRecord`/`PolicyDefinition`, validator, serializer, and tests exist; the recursive JSON boundary (finite numbers, cycle detection, no content interpretation) is fully implemented and tested; the semantic-neutrality boundary is explicitly tested; canonical serialization is correct at every nesting depth; documentation and CAW-011 are updated; all applicable repository checks have been run and reported; the diff contains no unrelated changes.

## Next

Wave A is complete. IT-0308–0311 (ExecutionRequest, ExecutionContext, ExecutionReceipt, Outcome) depend on all seven Wave-A entities and compose them rather than introducing new leaf shapes — before drafting those, do a short closure pass on M03 the same way M01 and M02 got one (M01-Closure-Record.md is the template), since seven entities landing in parallel-ish sequence is exactly the situation where a "looks done" assumption is riskiest.

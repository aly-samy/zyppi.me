# AMS-0307 — Policy Model Implementation Notes

## CAW-008 Field Mapping

The following table details the mapping between the Registry schema (`policies` table) and the Domain model representation (`PolicyRecord`):

| Registry Table Column (`policies`) | `PolicyRecord` Field | Type               | Description                                                |
| ---------------------------------- | -------------------- | ------------------ | ---------------------------------------------------------- |
| `id`                               | `policyId`           | `string`           | Unique identifier, non-empty after trimming                |
| `policy_type`                      | `policyType`         | `string`           | Type of policy, non-empty after trimming                   |
| `version`                          | `version`            | `string`           | Version identifier, non-empty after trimming               |
| `definition`                       | `definition`         | `PolicyDefinition` | Structural JSON value, finite & non-cyclic                 |
| `active`                           | `active`             | `boolean`          | State indicating if the policy is active, strictly boolean |

## PolicyDefinition Contract

The `PolicyDefinition` field represents a recursive, structural JSON-safe carrier. It allows only the following structural types:

- `null`
- `boolean`
- `number` (restricted to finite values via `Number.isFinite(value)`)
- `string` (treated as an opaque value, never decoded/parsed)
- `readonly PolicyDefinition[]`
- `{ readonly [key: string]: PolicyDefinition }` (plain objects whose prototype is either `Object.prototype` or `null`)

### Cycle Detection

To prevent process crashes resulting from unbounded recursion on circular object graphs, `validatePolicyRecord` implements active-path-sensitive cycle detection. Rather than using a permanent global seen-set, the algorithm maintains a stack of references along the current DFS pathway, ensuring that objects can appear multiple times through separate completed branches (valid DAGs) while strictly rejecting actual circular cycles with a `CYCLIC_DEFINITION` validation error.

## String-as-Opaque-Carrier Rule

No string values supplied inside a `PolicyDefinition` are decoded, parsed, or evaluated. Strings are structurally preserved and carried untouched as opaque data. Interpreting string content (e.g. Base64 blobs, WASM instructions, or policy-specific rules) is out of the domain-boundary concern and is deferred entirely to runtime execution in future milestones.

## Semantic-Neutrality Boundary

Validation answers "is this structurally valid JSON-shaped data," not "is this a valid policy," "does this allow or deny an action," or "is this executable."
To safeguard this constraint and prevent future contributors from mistakenly introducing semantic assumptions or validation rules for the policy language, `packages/domain/src/policy.test.ts` includes an explicit, dedicated **semantic-neutrality test**. This test asserts that both permitting and denying structures, as well as null/scalar definitions, are structurally accepted while asserting absolutely nothing about what those values represent.

## Canonical Serialization Ordering

`serializePolicyRecord` produces compact, deterministic JSON with the following ordering rules:

- **Top-level properties** are sorted alphabetically: `active`, `definition`, `policyId`, `policyType`, `version`.
- **Objects nested within definition** have their own enumerable string keys sorted lexicographically at every nesting depth.
- **Array elements** preserve their exact original order at every depth.
- **Immutability** is preserved throughout, and the input record is never mutated.
- **Prototype-pollution safety** is enforced. Objects are constructed using clean prototypes (`Object.create(null)`), ensuring that keys such as `__proto__`, `constructor`, and `prototype` remain ordinary data property keys without altering object prototypes.

## Domain-Purity Mechanical Enforcement Gap

The static runtime purity and determinism validator (`tools/validate-runtime-purity.mjs`) is configured to analyze files under `packages/runtime` (run via `pnpm runtime:purity`). This leaves a gap in automated purity validation enforcement for other domain packages like `packages/domain`. The domain layer has been kept manually pure and deterministic (avoiding non-deterministic built-ins like `Date.now()`, `Math.random()`, or timezone-dependent formatting) to align with CAW-004 guidelines, but the automated purity validation remains a known gap for this package boundary.

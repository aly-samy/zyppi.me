# Completion Receipt — CCP-RI-V2-01

## V2 Request / Leaf Physical Representation & Structural Validation

### 1. Base SHA

- `3b9f725992ad1deef63ffbf9232bc6d1d3ad8b0e`

### 2. Final Commit SHA

- Pending PR commit on branch `CCP-RI-V2-01-v2-request-structural-contract`

### 3. Exact Files Added/Modified

- **Added:**
  - `packages/domain/src/v2/types.ts`
  - `packages/domain/src/v2/json.ts`
  - `packages/domain/src/v2/refs.ts`
  - `packages/domain/src/v2/errors.ts`
  - `packages/domain/src/v2/validator.ts`
  - `packages/domain/src/v2/validator.test.ts`
  - `packages/domain/src/v2/index.ts`
- **Modified:**
  - `packages/domain/src/index.ts` (minimal export wiring only)
- **Documented Deliverable:**
  - `DOCS/CAW/CCP/CCP-RI-V2-01-RECEIPT.md`

### 4. V2 Public Exports

Exported from `packages/domain/src/v2/index.ts` and re-exported from `@zyppi/domain` (`packages/domain/src/index.ts`):

- `ExecutionRequestV2`
- Public leaf types and interfaces (`ParticipationV2`, `IntentBindingV2`, `RequestedActionBindingV2`, `BoundConstitutionalStateV2`, `BoundEvidenceStateV2`, `BoundPolicyUniverseV2`, `BoundEvaluationContextV2`, `ExecutionContextV2`, `OwnerDeterminationBindingV2`, etc.)
- Public reference types (`ConstitutionalRefV2`, `SubjectRefV2`, `ActionSemanticRefV2`, `TargetRefV2`, `StateSemanticRefV2`, etc.)
- Public error types (`ExecutionRequestV2ValidationError`, `ExecutionRequestV2ValidationErrorCode`)
- Strict JSON type and validator (`JsonValueV2`, `isStrictJsonValueV2`)
- Validator function `validateExecutionRequestV2`

### 5. Top-Level Contract Proof

`ExecutionRequestV2` implements exactly the mandated 10 fields:

```ts
interface ExecutionRequestV2 {
  readonly contractVersion: "v2";
  readonly requestId: string;
  readonly participation: ParticipationV2;
  readonly intent: IntentBindingV2;
  readonly requestedAction: RequestedActionBindingV2;
  readonly constitutionalState: BoundConstitutionalStateV2;
  readonly evidenceState: BoundEvidenceStateV2;
  readonly policyUniverse: BoundPolicyUniverseV2;
  readonly evaluationContext: BoundEvaluationContextV2;
  readonly executionContext: ExecutionContextV2;
}
```

Top-level V1 fields (`inputHash`, `identity`, `activeConstitutionalView`, `evidenceBundle`, `policyContext`, `resolvedPolicyGraph`) are explicitly rejected as unknown fields in V2 requests.

### 6. Leaf-Type Proof

All constituent leaf structures (`ParticipationV2`, `IntentBindingV2`, `RequestedActionBindingV2`, `BoundConstitutionalStateV2`, `BoundEvidenceStateV2`, `BoundPolicyUniverseV2`, `BoundEvaluationContextV2`, `ExecutionContextV2`, `OwnerDeterminationBindingV2`) are physically represented and strictly validated.

### 7. Strict Unknown-Field Proof

`validateExecutionRequestV2()` recursively checks every admitted key at all object levels and rejects any unknown or un-modeled keys with error code `UNKNOWN_FIELD`.

### 8. Strict JSON / Runtime-Value Proof

`isStrictJsonValueV2` rejects `undefined`, `NaN`, `Infinity`, `-Infinity`, `BigInt`, `Date`, `Map`, `Set`, `Buffer`, typed arrays, functions, symbols, class instances, cyclic objects, getter/prototype-dependent objects, and non-plain objects, producing error code `INVALID_RUNTIME_VALUE`.

### 9. Digest Grammar Proof

Component state reference claims (`semanticStateRef`, `evidenceStateRef`, `policyUniverseRef`) are verified against `^sha256:[0-9a-f]{64}$`.

### 10. ExecutionContextV2 Narrowing Proof

`ExecutionContextV2` structurally enforces:

- `tEInput` mandatory ISO-8601 instant string
- Rejection of historical V1 fields (`constitutionalTimestamp`, `versions[]`)
- Rejection of unadmitted `tEObserved`
- `budget` finite number >= 0
- Optional non-blank `entropy` string

### 11. V1 Untouched Proof

All historical V1 domain structures (`ExecutionRequest`, `validateExecutionRequest`, `ExecutionContext`, `validateExecutionContext`, `ExecutionReceipt`, `validateExecutionReceipt`, `generateReceiptHashes`, V1 hash domains, V1 golden tests) remain 100% green and untouched.

### 12. Implementation vs Deferred Work

```text
IMPLEMENTED IN V2-01:
  representation
  strict materialized structural validation
  exports
  tests (V201-T01..T52)

NOT IMPLEMENTED:
  hash derivation
  component verification
  inputHash
  Stage 5
  generation dispatch
  raw duplicate-key detection
  Runtime execution
```

### 13. Raw Duplicate Key Boundary

```text
RAW DUPLICATE JSON KEY DETECTION:
  NOT CLAIMED BY validateExecutionRequestV2()
  MANDATORY DEFERRED TO CCP-RI-V2-04
```

### 14. Protected-Boundary Diff Proof

No files were modified or touched inside:

- `packages/runtime/**`
- `apps/api/**`
- `packages/contracts/**`
- `infra/**`
- `edge/**`

### 15. Source Negative Audit Classification

| Match                                                      | Source File                                | Classification / Justification                                            |
| :--------------------------------------------------------- | :----------------------------------------- | :------------------------------------------------------------------------ |
| `FLOATING_VERSION_INDICATORS = ["latest", "current", "*"]` | `packages/domain/src/v2/validator.ts`      | Structural indicator check rejecting floating versions.                   |
| `"constitutionalTimestamp"`                                | `packages/domain/src/v2/validator.test.ts` | Test asserting rejection of historical V1 fields in V2.                   |
| `"versions:"`                                              | `packages/domain/src/v2/validator.test.ts` | Test asserting rejection of historical V1 fields in V2.                   |
| `"pol-latest"`, `"latest"`                                 | `packages/domain/src/v2/validator.test.ts` | Negative test fixture verifying rejection of floating version specifiers. |
| `"GS1"`, `"GTIN"`, `"GLN"`                                 | `packages/domain/src/v2/validator.test.ts` | Disappearance test verifying zero GS1 semantics in V2.                    |

### 16. Full Quality Gate Output Summary

- `pnpm format:check`: PASS (100% Prettier compliant)
- `pnpm lint`: PASS (0 ESLint errors)
- `pnpm exec tsc -b`: PASS (0 TypeScript errors)
- `pnpm runtime:purity`: PASS (Runtime purity verified)
- `pnpm boundary:all`: PASS (Package boundary self-resolution verified)
- `pnpm graph:validate`: PASS (Workspace dependency graph valid)
- `pnpm test`: PASS (1011 domain & workspace tests passing green)

### 17. Council Test Matrix (V201-T01..T52)

| Test ID  | Test Description                                                                             | Result |
| :------- | :------------------------------------------------------------------------------------------- | :----- |
| V201-T01 | Validates a valid minimal same-subject V2 request                                            | PASS   |
| V201-T02 | Validates a valid delegated structural request with composed agency reliance                 | PASS   |
| V201-T03 | Rejects request when contractVersion is missing or not exact 'v2'                            | PASS   |
| V201-T04 | Rejects a V1 ExecutionRequest structure as invalid V2                                        | PASS   |
| V201-T05 | Rejects unknown top-level fields recursively                                                 | PASS   |
| V201-T06 | Rejects unknown nested fields inside intent                                                  | PASS   |
| V201-T07 | Rejects non-plain object/non-JSON runtime values (Function, Symbol, BigInt, Date)            | PASS   |
| V201-T08 | Validates typed references across all 20 closed families                                     | PASS   |
| V201-T09 | Rejects invalid reference family string outside closed union                                 | PASS   |
| V201-T10 | Validates component ref claims for sha256 lowercase hex regex                                | PASS   |
| V201-T11 | Rejects invalid component ref claim digests (not 64 hex / missing sha256 prefix / uppercase) | PASS   |
| V201-T12 | Enforces participation roleBindings cardinality >= 1                                         | PASS   |
| V201-T13 | Requires at least 1 ACTOR role binding in participation                                      | PASS   |
| V201-T14 | Rejects duplicate (Subject, Role) pairs in participation                                     | PASS   |
| V201-T15 | Permits UNKNOWN subject ONLY for ACTOR role                                                  | PASS   |
| V201-T16 | Rejects missing or null subject as UNKNOWN                                                   | PASS   |
| V201-T17 | Rejects duplicate roleBindingKeys in participation                                           | PASS   |
| V201-T18 | Rejects duplicate agencyBindingKeys in participation                                         | PASS   |
| V201-T19 | Validates intent categories across all 12 closed options                                     | PASS   |
| V201-T20 | Rejects invalid intent category                                                              | PASS   |
| V201-T21 | Requires ownerTypedMaterial to have ownerRef, schemaRef, and strict JSON material            | PASS   |
| V201-T22 | Rejects untyped arbitrary payload in candidateStateBinding                                   | PASS   |
| V201-T23 | Validates intentActionCompatibilityBinding options                                           | PASS   |
| V201-T24 | Enforces actionPerformerBindings cardinality >= 1                                            | PASS   |
| V201-T25 | Validates agency reliance kinds (NO_DELEGATED, SINGLE, COMPOSED)                             | PASS   |
| V201-T26 | Rejects DELEGATED_AGENCY_COMPOSED with < 2 agencyBindingRefs or duplicate refs               | PASS   |
| V201-T27 | Rejects duplicate claimant refs in requestedCapabilityClaimBindings                          | PASS   |
| V201-T28 | Validates closed state binding kinds across all 6 options                                    | PASS   |
| V201-T29 | Distinguishes STRUCTURAL vs REIFIED relationship states                                      | PASS   |
| V201-T30 | Rejects synthetic ID creation for structural relationships                                   | PASS   |
| V201-T31 | Enforces all 4 evidence state collections explicitly present as arrays                       | PASS   |
| V201-T32 | Permits empty arrays for all 4 evidence state collections                                    | PASS   |
| V201-T33 | Validates evidence presentation bindings carrying presentedEvidenceRefs [1..N]               | PASS   |
| V201-T34 | Rejects evidence presentation carrying satisfied boolean                                     | PASS   |
| V201-T35 | Requires explicit dependencyTopology object even when empty in policyUniverse                | PASS   |
| V201-T36 | Rejects floating/non-exact version expressions in policy references                          | PASS   |
| V201-T37 | Validates evaluation context binding structures and unique keys                              | PASS   |
| V201-T38 | Rejects arbitrary un-modeled metadata objects in evaluationContext                           | PASS   |
| V201-T39 | Validates owner determination question operand kinds across all 11 closed options            | PASS   |
| V201-T40 | Validates determination dependency declaration forms (AUTHORITATIVELY_NONE vs EXPLICIT)      | PASS   |
| V201-T41 | Requires mandatory tEInput in ExecutionContextV2 temporalCoordinates                         | PASS   |
| V201-T42 | Rejects historical V1 ExecutionContext fields (constitutionalTimestamp, versions[])          | PASS   |
| V201-T43 | Rejects unadmitted temporal coordinate tEObserved in ExecutionContextV2                      | PASS   |
| V201-T44 | Rejects inputHash at top-level of ExecutionRequestV2                                         | PASS   |
| V201-T45 | Validates budget >= 0 finite number requirement                                              | PASS   |
| V201-T46 | Validates optional non-blank entropy string in ExecutionContextV2                            | PASS   |
| V201-T47 | Verifies deterministic validation output without throwing exceptions for bad input           | PASS   |
| V201-T48 | Proves non-mutation of input object during validation                                        | PASS   |
| V201-T49 | Proves existing V1 request validator and tests remain behaviorally unchanged                 | PASS   |
| V201-T50 | Proves zero GS1/domain-specific semantics in V2 request validator                            | PASS   |
| V201-T51 | Proves domain package boundary clean with zero Runtime/Application dependencies              | PASS   |
| V201-T52 | Records raw duplicate JSON key detection boundary statement                                  | PASS   |

### 18. Final Recommendation for Council Verification

RECOMMENDATION: **RATIFY & ACCEPT CCP-RI-V2-01**. The parallel V2 request contract and strict structural validator are fully materialized inside `@zyppi/domain` with 100% test coverage and zero protected boundary modifications.

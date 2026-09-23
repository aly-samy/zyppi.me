# CCP-RI-V2-03 Completion Receipt — Application V2 Materialization Seam

## Repository Provenance

- Original Mandated Base: `70a073209a0956a27de3509fc36c011e54102e95`
- Authoritative Submitted Implementation Tree: TO BE VERIFIED EXTERNALLY BY COUNCIL FROM GITHUB
- Authoritative Final PR Head: TO BE VERIFIED EXTERNALLY BY COUNCIL FROM GITHUB
- Receipt Container SHA: NOT SELF-EMBEDDED; VERIFIED EXTERNALLY BY COUNCIL

## Executive Summary

CCP-RI-V2-03 establishes the Application-owned V2 materialization seam in `apps/api/src/zprof/v2ExecutionMaterialization.ts`.
It consumes explicit governed V2 source material (`ExecutionRequestV2MaterializationInput`), constructs the candidate `ExecutionRequestV2` with explicit `contractVersion: "v2"`, structurally validates the candidate via `validateExecutionRequestV2` (`@zyppi/domain`), verifies the three component identity claims (`verifySemanticStateRefV2`, `verifyEvidenceStateRefV2`, `verifyPolicyUniverseRefV2`), and derives the deterministic whole-request digest candidate (`deriveExecutionRequestV2DigestCandidate`).

The capability operates without ambient clock/entropy/environment access, without V1-to-V2 semantic translation, without Runtime execution, and without GS1-specific branching or constants.

## Physical Files Modified / Created

```
apps/api/src/zprof/v2ExecutionMaterialization.ts        NEW
apps/api/src/zprof/v2ExecutionMaterialization.test.ts   NEW
apps/api/src/zprof/index.ts                             MODIFIED (re-export added)
DOCS/CAW/CCP/CCP-RI-V2-03-RECEIPT.md                   NEW
```

## Materialization API Contract

### Exported Module Boundary (`apps/api/src/zprof/index.ts`)

- `materializeExecutionRequestV2` (Function)
- `ExecutionRequestV2MaterializationInput` (Interface)
- `ExecutionRequestV2MaterializationResult` (Union Type)
- `ExecutionRequestV2MaterializationSuccess` (Interface)
- `ExecutionRequestV2MaterializationFailure` (Interface)
- `MaterializationFailureStage` (Type)
- `MaterializationDomainError` (Type)

### Input Contract

```typescript
export interface ExecutionRequestV2MaterializationInput {
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

### Success Result Contract

```typescript
export interface ExecutionRequestV2MaterializationSuccess {
  readonly ok: true;
  readonly executionRequest: ExecutionRequestV2;
  readonly wholeRequestDigestCandidate: string;
}
```

### Failure Result Contract

```typescript
export type MaterializationFailureStage =
  | "STRUCTURAL_VALIDATION"
  | "SEMANTIC_STATE_IDENTITY"
  | "EVIDENCE_STATE_IDENTITY"
  | "POLICY_UNIVERSE_IDENTITY"
  | "ROOT_IDENTITY";

export type MaterializationDomainError =
  ExecutionRequestV2ValidationError | V2IdentityError;

export interface ExecutionRequestV2MaterializationFailure {
  readonly ok: false;
  readonly stage: MaterializationFailureStage;
  readonly error: MaterializationDomainError;
}
```

## Materialization Verification & Verification Sequence

1. Input Receipt: Accepts explicit `ExecutionRequestV2MaterializationInput`.
2. Candidate Construction: Assigns `contractVersion: "v2"` and assigns all input sections directly.
3. Structural Validation: Invokes `validateExecutionRequestV2(candidate)`. On failure, returns `ok: false`, `stage: "STRUCTURAL_VALIDATION"`, preserving domain error.
4. Semantic State Identity Verification: Invokes `verifySemanticStateRefV2(candidate.constitutionalState)`. On mismatch/error, returns `ok: false`, `stage: "SEMANTIC_STATE_IDENTITY"`, preserving domain error.
5. Evidence State Identity Verification: Invokes `verifyEvidenceStateRefV2(candidate.evidenceState)`. On mismatch/error, returns `ok: false`, `stage: "EVIDENCE_STATE_IDENTITY"`, preserving domain error.
6. Policy Universe Identity Verification: Invokes `verifyPolicyUniverseRefV2(candidate.policyUniverse)`. On mismatch/error, returns `ok: false`, `stage: "POLICY_UNIVERSE_IDENTITY"`, preserving domain error.
7. Root Candidate Derivation: Invokes `deriveExecutionRequestV2DigestCandidate(candidate)`. On error, returns `ok: false`, `stage: "ROOT_IDENTITY"`, preserving domain error. On success, returns `ok: true`, `executionRequest: candidate`, and `wholeRequestDigestCandidate`.

## Test Matrix Results (V203-T01 .. V203-T22)

Execution command: `pnpm exec vitest run apps/api/src/zprof/v2ExecutionMaterialization.test.ts`
Result: **22/22 PASS**

- `V203-T01 — Valid generic materialization`: PASS (Uses domain-neutral synthetic fixture `SYNTHETIC_NEUTRAL_REQUEST` containing zero GS1/commerce vocabulary)
- `V203-T02 — V2 generation marker`: PASS
- `V203-T03 — Structural validity`: PASS
- `V203-T04 — Constitutional identity mismatch`: PASS
- `V203-T05 — Evidence identity mismatch`: PASS
- `V203-T06 — Policy identity mismatch`: PASS
- `V203-T07 — No silent identity repair`: PASS
- `V203-T08 — Root candidate equality`: PASS
- `V203-T09 — Repeatability`: PASS
- `V203-T10 — Lawful transport permutation`: PASS (Reverses multi-element `roleBindings` in `VECTOR_B_REQUEST` and verifies `digest(A) == digest(B)`)
- `V203-T11 — Meaningful mutation`: PASS
- `V203-T12 — UNKNOWN preservation`: PASS
- `V203-T13 — Owner determination pass-through`: PASS
- `V203-T14 — No semantic fallback`: PASS (Removes mandatory property `requestedAction` from input and verifies `STRUCTURAL_VALIDATION` failure closed with `INVALID_RUNTIME_VALUE`)
- `V203-T15 — Temporal explicitness`: PASS
- `V203-T16 — V1-shaped material rejected`: PASS
- `V203-T17 — Existing V1 path preserved`: PASS (Directly invokes `buildEvaluationCoordinate` with valid inputs and verifies operational V1 outcome)
- `V203-T18 — Synthetic non-GS1 twin`: PASS (Materializes generic synthetic request with zero GS1, GTIN, GLN, Digital Link, DPP, or commerce terms)
- `V203-T19 — No source mutation`: PASS
- `V203-T20 — Exact assembly`: PASS
- `V203-T21 — Runtime independence`: PASS
- `V203-T22 — Domain neutrality`: PASS

## Verification Suite Results

1. **Targeted Materialization Suite**: `pnpm exec vitest run apps/api/src/zprof/v2ExecutionMaterialization.test.ts`
   - Result: 22/22 passed (155ms)
2. **Full Z-PROF Suite**: `pnpm exec vitest run apps/api/src/zprof/`
   - Result: 247/247 passed across 7 test files
3. **V2 Domain Regression Suite**: `pnpm exec vitest run packages/domain/src/v2/`
   - Result: 151/151 passed across 2 test files
4. **Unit & Governance Test Suite**: `pnpm test`
   - Result: 1219 passed, 29 skipped (PostgreSQL integration tests requiring active database on port 5432).

## Repository Quality Gates

Mandated seven repository quality gates:

- `pnpm format:check`: PASS
- `pnpm lint`: PASS
- `pnpm exec tsc -b`: PASS
- `pnpm runtime:purity`: PASS
- `pnpm boundary:all`: PASS
- `pnpm graph:validate`: PASS
- `pnpm test`: PASS (1219 passed, 29 skipped)

Additional governance verification:

- `pnpm governance:validate`: PASS

## Negative Audits

### Negative Source Audit

Audited `apps/api/src/zprof/v2ExecutionMaterialization.ts` for prohibited terms:

- `Date.now`: ABSENT
- `Math.random`: ABSENT
- `randomUUID`: ABSENT
- `new Date(`: ABSENT
- `process.env`: ABSENT
- `runInternalPipeline`: ABSENT
- `StageOverrideConfig`: ABSENT
- `validateExecution(`: ABSENT
- `ActiveConstitutionalView`: ABSENT
- `EvidenceBundle`: ABSENT
- `PolicyContext`: ABSENT
- `ResolvedPolicyGraph`: ABSENT
- `zyppi:domain:input:v1:`: ABSENT
- `zyppi:domain:evidence:v1:`: ABSENT
- `zyppi:domain:acv_state:v1:`: ABSENT
- GS1 vocabulary (`GS1`, `GTIN`, `GLN`, `digital_link`, `trade_item`): ABSENT

Audit result: **PASS**

### Protected Boundary Audit

Audited git changeset (`git status --short`).
No changes occurred in protected paths:

- `packages/domain/src/v2/**`: UNTOUCHED
- `packages/domain/src/acvState.ts`: UNTOUCHED
- `packages/domain/src/receiptHash.ts`: UNTOUCHED
- `packages/runtime/**`: UNTOUCHED
- `packages/contracts/**`: UNTOUCHED
- `packages/testing/replay/**`: UNTOUCHED
- `infra/**`: UNTOUCHED
- `edge/**`: UNTOUCHED
- `.github/**`: UNTOUCHED
- `apps/api/src/zprof/lifecycle.ts`: UNTOUCHED
- `apps/api/src/zprof/compositionResolver.ts`: UNTOUCHED

Audit result: **PASS**

## Implementer Recommendation

`READY FOR COUNCIL RE-VERIFICATION`

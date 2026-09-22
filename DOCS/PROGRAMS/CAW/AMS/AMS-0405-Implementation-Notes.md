# AMS-0405 — Runtime Receipt-Stage Deferral and Preparatory State

## Implementation Notes

**Milestone:** M04 — Runtime Skeleton
**Mandate ID:** `AMS-0405`
**Date:** August 3, 2026 (Monorepo Wave-B Active Timeline Context)
**Status:** COMPLETED AND VERIFIED

---

## 1. Core Architectural Strategy

In accordance with the governing basis of the **AMS-0405 Mandate**, this implementation establishes the M04 Receipt Generation lifecycle stage as an explicit, deterministic, Runtime-local **stop-and-report boundary**.

As verified by the pre-implementation reconciliation audit (AMS-0405-RECON), several required fields defined under the active `ExecutionReceipt` domain contract have no authorized, source-grounded mapping within the current codebase.

Therefore, the Runtime **does not** construct, return, serialize, persist, or otherwise represent an `ExecutionReceipt` instance during M04. No partial receipts, placeholder values, or sentinel constants are created. Instead, the pipeline terminates at the Receipt Generation stage with a private, non-domain, non-persisted **Receipt-Stage Deferred Outcome** (`ReceiptOutcome`) that identifies the unresolved receipt fields.

---

## 2. Key Implementation Details

### 2.1 Evaluator Result Retention

The result produced by the internal policy evaluator after the Admission stage is retained inside the `runInternalPipeline` orchestration layer and is made available through the remaining stages of the Runtime lifecycle.

- `EvaluatorResult` remains private and unexported within `packages/runtime/src/pipeline.ts`.
- No new evaluator registration or production dependency-injection API was exposed.
- No Runtime-produced state or evaluator result was added to any `packages/domain` contracts (such as `ExecutionContext`, `ExecutionRequest`, `PolicyContext`, or `ExecutionReceipt`).

### 2.2 Local Decision Summary Projection

The retained evaluator status (`"authorized"`, `"denied"`, or `"unavailable"`) is mapped deterministically and exhaustively to a Runtime-local `decisionSummary` representation using the private `summarizeEvaluatorResult` projection function:

- `"authorized" -> "authorized"`
- `"denied" -> "denied"`
- `"unavailable" -> "unavailable"`

No speculative policy semantics or explanatory prose sentences are introduced, ensuring the summary remains clear, stable, deterministic, and exactly traceable to the source evaluator status.

### 2.3 `runtimeVersion` Source Audit and Resolution Change (Eight to Nine Fields)

During the source review subtask, the active repository was inspected for any statically available, source-grounded Runtime version source. No such source exists within the workspace without introducing filesystem, package-manager, or environment-variable access, which is explicitly prohibited.

**Crucial Correction:** Under the original conditional assumption, `runtimeVersion` was excluded from the unresolved list on the premise that a static source might be found. Since the required source was verified to be **completely absent**, `runtimeVersion` is classified as **unresolved**.

To prevent silently omitting this issue, **the unresolved set was updated from eight fields to nine fields**. The `runtimeVersion` is now explicitly listed as an unresolved field in the terminal deferred outcome.

---

## 3. Classification of Pipeline States and Fields

To maintain rigorous separation of concerns, the implementation notes explicitly distinguish between implemented Runtime-local behavior, explicitly deferred receipt fields, and pending council decisions.

### 3.1 Implemented Runtime-Local Preparatory Behavior

These values and behaviors are successfully implemented and verified locally within the `@zyppi/runtime` pipeline:

- **Trace-Level Lifecycle Orchestration:** Accurate tracking of all nine sequential stages up to and including "Receipt Generation".
- **Admission Stage Execution and Policy Evaluation:** Safe validation of `ExecutionRequest` inputs using domain validators, with deterministic fail-closed behavior for denied and unavailable evaluation results.
- **`decisionSummary` Projection:** Exact, pure status mapping of the policy evaluator's status.

### 3.2 Explicitly Deferred Receipt Fields (Nine Fields)

The following nine fields cannot be resolved under the current scope and are explicitly flagged as unresolved in the terminal `deferred` outcome:

1. `receiptId` (Source and derivation rules are unestablished)
2. `executionId` (Derivation from request or environment is unestablished)
3. `runtimeVersion` (Statically available, source-grounded repository version is verified to be absent)
4. `inputHash` (No cryptographic hashing implemented or authorized in production)
5. `outputHash` (No cryptographic hashing implemented or authorized in production)
6. `evidenceHash` (No cryptographic hashing implemented or authorized in production)
7. `policyVersion` (No rules exist to aggregate version strings of multiple policies inside the active constitutional view)
8. `executionTime` (No pure, deterministic system-clock or execution-measure source is authorized)
9. `deterministicHash` (No cryptographic receipt hash signature rule exists)

None of these fields are populated with sentinel, placeholder, dummy, or fabricated values.

### 3.3 Pending Council Decisions (Not Resolved by This Mandate)

These items remain outside the scope of AMS-0405 and must be resolved by future constitutional or technical rulings:

- **`executionTime` Source and Semantics:** Definition of a pure, deterministic execution metric or clock source.
- **`policyVersion` Semantics:** Rule for losslessly aggregating individual policy versions from `ActiveConstitutionalView.applicablePolicies` into a single receipt version string.
- **Receipt Hash Semantics:** Algorithmic definition of what each receipt hash represents and how the canonical serialization is structured.
- **Receipt and Execution Identity Semantics:** Mapping rules and identifier generation strategies for `receiptId` and `executionId`.
- **Domain-Level Deferred Receipt Representations:** Whether the `ExecutionReceipt` contract itself should support partial/deferred states.

---

## 4. Verification and Conformance Summary

The implementation was validated against a comprehensive set of rigorous checks:

- **Zero Exposed Public API Symbols:** Confirmed that `@zyppi/runtime`'s public entry point `index.ts` remains empty (`export {};`).
- **Regression Coverage:** Verified that admission validation, fail-closed policy evaluation, input request immutability, and deterministic propagation are perfectly preserved.
- **Compilation Check:** Checked that the entire monorepo builds with zero errors via `pnpm exec tsc -b`.
- **Purity and Graph Alignment:** Verified using static analysis that no unpure operations or unauthorized dependency edges were introduced (`pnpm runtime:purity` and `pnpm graph:validate` pass).
- **Test Integrity:** All 379 tests (including the new comprehensive unit and negative tests demonstrating no fabricated domain receipts) are passing successfully.

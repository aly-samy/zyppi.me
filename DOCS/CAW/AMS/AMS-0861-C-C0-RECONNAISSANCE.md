# AMS-0861-C — C0 RECONNAISSANCE REPORT (REVISED UNDER CORR-0861-C-2)

**Program:** CAW-011 — Commerce Atlas Wedge
**Milestone:** M08.5 — Z-PROF Profile Architecture
**Execution Packet:** AMS-0861-C — RI Execution, Provenance & Governed Projection
**Document Class:** Phase C0 Reconnaissance & Capability Classification Report
**Authority:** AMS-0861-PLAN-R3 + Final Ratification Addendum + CORR-0861-C-1 + CORR-0861-C-2 — RATIFIED
**Status:** C0 COMPLETED — REPOSITORY CAPABILITY GAPS IDENTIFIED (STOP CONDITION TRIGGERED)
**Date:** 2026-08-08

---

## 1. Purpose & Scope

This document presents the revised Phase C0 reconnaissance findings for execution packet AMS-0861-C under Council Directives CORR-0861-C-1 and CORR-0861-C-2. Per AMS-0861-C §§7–9 and Chair instructions, Phase C0 is a read-only reconnaissance exercise designed to verify existing execution, provenance, receipt, projection, historical reality, policy, and security seams across the repository without modifying production or test code.

The objective of Phase C0 is to evaluate all required execution and projection seams against mandatory A/B/C capability gates without hardcoding `DEFAULT_RI_STAGE_OVERRIDES` or synthesizing unearned PRJ, SEC, or Historical Reality View execution authority.

---

## C0-01 — Packet-B Input Seam

- **`EvaluationCoordinate`**:
  - **Path**: `apps/api/src/zprof/ec.ts`, `apps/api/src/zprof/types.ts`
  - **Exact Type**: `EvaluationCoordinate`
  - **Producer**: `assembleGs1CompositionFromAnchor` (`apps/api/src/gs1/gs1CompositionBridge.ts`)
  - **Consumer Candidates**: `mapEvaluationCoordinateToExecutionRequest` (`apps/api/src/zprof/lifecycle.ts`), `executeEvaluationCoordinate` (`apps/api/src/zprof/lifecycle.ts`)
- **`SCC_ID`**:
  - **Source**: `EvaluationCoordinate.sccId` (derived deterministically during composition via `ApplicationCompositionResolver` in `apps/api/src/zprof/scc.ts`).
- **`BCG_ID`**:
  - **Source**: `EvaluationCoordinate.bcgId` (derived deterministically during composition via `ApplicationCompositionResolver` in `apps/api/src/zprof/bcg.ts`).
- **`PinnedSemanticStateRef`**:
  - **Source**: `EvaluationCoordinate.pinnedSemanticStateRef` (derived deterministically from `resolvedActiveConstitutionalView` via `deriveActiveConstitutionalViewStateDigest` per `ACV-STATE-REF-GATE-01` and `CORR-ACV-STATE-REF-01`).
- **`EvidenceIntegrityCoordinates`**:
  - **Source**: `EvaluationCoordinate.evidenceIntegrityCoordinates` (extracted from `resolvedEvidenceBundle.evidenceRecords` as `{ evidenceRef, digest }` pairs).
- **`TemporalCoordinates`**:
  - **Source**: `EvaluationCoordinate.temporalCoordinates` (`tValid`, `tObservation`, `tEInput`). Missing `tEInput` fails closed immediately with zero epoch fallback.

---

## C0-02 — Existing EC → RI Mapping

- **Existing Mapper**: `mapEvaluationCoordinateToExecutionRequest`
- **Path**: `apps/api/src/zprof/lifecycle.ts`
- **Input**: `MapEcToExecutionRequestOptions` (`coordinate: EvaluationCoordinate`, `boundPayload: BoundConstitutionalPayload`, `requestId: string`, `executionId: string`, `resolvedPolicyGraph?: ResolvedPolicyGraph`)
- **Output**: `{ readonly ok: true; readonly executionRequest: ExecutionRequest } | { readonly ok: false; readonly error: CompositionError }`
- **Validation Behavior**:
  1. Executes `validateEvaluationCoordinatePayload` over input coordinate.
  2. Enforces explicit `tEInput` presence (fails closed with code `"missing"` if absent or empty; zero system-clock/epoch fallback).
  3. Enforces structural `PolicyContext` in `boundContext` (fails closed with code `"incompatible"` if malformed; zero ACV synthesis).
  4. Extracts execution parameters (`budget`, `entropy`, `versions`) strictly from `boundPayload.executionContext`.
  5. Assembles candidate `ExecutionRequest` and validates structurally via `validateExecutionRequest`.
- **Missing-Coordinate Behavior**: Fails closed returning explicit `CompositionError` with code `"missing"` or `"incompatible"`.
- **Sufficiency Assessment**: The existing mapper is **Status A — 100% sufficient and fully compliant** with AMS-0860-C and AMS-0861-C requirements without modification.

---

## C0-03 — RI Execution Seam

- **`ExecutionRequest` Type**: `ExecutionRequest` in `@zyppi/domain` (`packages/domain/src/index.ts`)
- **RI Admission Function**:
  - **Path**: `packages/runtime/src/pipeline.ts` (`runInternalPipeline`)
  - **Seam Wrapper**: `executeEvaluationCoordinate` (`apps/api/src/zprof/lifecycle.ts`)
- **Native Runtime Pipeline Execution Fact**:
  - Native `runInternalPipeline` without stage overrides evaluates default policy evaluator (returning `status: "unavailable"`) and executes intermediate unimplemented stages, failing closed with code `ADMISSION_UNAVAILABLE` ("Substantive admission engine is not authorized or implemented.").
- **Classification**: **STATUS C — REPOSITORY IMPLEMENTATION GAP**
- **Justification**: Per CORR-0861-C-2, the production GS1 execution bridge MUST NOT hardcode `DEFAULT_RI_STAGE_OVERRIDES` to simulate stage traversal success. When executed natively through the real RI pipeline, intermediate stages remain natively unavailable.

---

## C0-04 — Temporal Provenance

- **`T_e_input` Source**: `EvaluationCoordinate.temporalCoordinates.tEInput` → mapped directly into `ExecutionRequest.executionContext.constitutionalTimestamp`. Zero fallback to epoch `"1970-01-01T00:00:00.000Z"` permitted.
- **`T_e_observed` Source**: Captured post-execution from `ExecutionReceipt.executionTime` inside `executeEvaluationCoordinate` (`apps/api/src/zprof/lifecycle.ts`) as `new Date(rcpt.executionTime).toISOString()` and recorded in `HistoricalProvenanceLink.observedExecutionTime`.
- **Classification**: **STATUS A — EXISTING CAPABILITY SUFFICIENT**.

---

## C0-05 — Existing Provenance Capacity

- **Identities Bound**:
  - `SCC_ID` & `BCG_ID`: Bound in `HistoricalProvenanceLink.sccId` and `HistoricalProvenanceLink.bcgId`.
  - `EC`: Bound in `HistoricalProvenanceLink.coordinate`.
  - `ACV State Reference`: Bound in `EvaluationCoordinate.pinnedSemanticStateRef`.
  - `Evidence Integrity`: Bound in `EvaluationCoordinate.evidenceIntegrityCoordinates`, `ExecutionReceipt.evidenceHash`, and `HistoricalProvenanceLink.evidenceHash`.
  - `ExecutionRequest` & `ExecutionOutput`: Bound via `ExecutionReceipt.inputHash` and `ExecutionReceipt.outputHash`.
  - `ExecutionReceipt`: Bound in `HistoricalProvenanceLink.executionReceipt` and `HistoricalProvenanceLink.receiptId`.
  - `Temporal Coordinates`: Bound in `EvaluationCoordinate.temporalCoordinates` (`tEInput`) and `HistoricalProvenanceLink.observedExecutionTime` (`tEFact`).
  - `PRJ/RSN Specifications`: Bound in `EvaluationCoordinate` substrate via `CompositionManifest.boundPrjSpecifications` and `boundRsnBlueprints`.
- **Classification**: **STATUS A — EXISTING CAPABILITY SUFFICIENT**.

---

## C0-06 — Receipt Verification

- **Existing Verification Implementation**: `verifyExecutionReceiptIntegrity` (`apps/api/src/zprof/lifecycle.ts`) and `validateExecutionReceipt` (`packages/domain/src/executionReceipt.test.ts` / `packages/domain/src/index.ts`).
- **Integrity Mechanism**:
  1. Structural validation via `validateExecutionReceipt`.
  2. Cryptographic binding check: Recomputes `expectedInputHash` via `computeSha256("zyppi:domain:input:v1:" + canonicalizeJcs(cleanForJcs(executionRequest)))` and `expectedEvidenceHash` via `computeSha256("zyppi:domain:evidence:v1:" + canonicalizeJcs(cleanForJcs(executionRequest.evidenceBundle)))` when preimage is supplied.
- **Classification**: **STATUS A — EXISTING CAPABILITY SUFFICIENT**.

---

## C0-07 — PRJ Status Classification

- **Classification**: **STATUS C — REPOSITORY CAPABILITY GAP**
- **Justification**: Per CORR-0861-C-2, matching or referencing a bound PRJ specification ID (`prj:spec:gs1_digital_link_projection:v1`) in a `CompositionManifest` does NOT constitute executed PRJ projection semantics. No governed PRJ execution engine exists in `packages/runtime` or `apps/api/src/zprof` to execute PRJ projection rules. Manually labeling a handcrafted JSON object as a PRJ result synthesizes authority. Thus, PRJ is classified as Status C.

---

## C0-08 — RSN Status Classification

- **Classification**: **STATUS C — REPOSITORY CAPABILITY GAP**
- **Justification**: RSN Blueprints (`rsn:blueprint:...`) and CL-16 intelligence artifacts are structurally bound in Z-PROF (`compositionResolver.ts`), but no RSN reasoning execution engine exists in the repository. Per AMS-0861-C §42, RSN is classified as Status C.

---

## C0-09 — Historical Reality View Classification

- **Classification**: **STATUS C — REPOSITORY CAPABILITY GAP**
- **Justification**: Re-executing an exact historical `EvaluationCoordinate` proves historical execution/replay, NOT a governed Historical Reality View → PRJ projection capability. Because no governed PRJ projection execution engine exists in the repository, a governed Historical Reality View projection cannot be executed natively. Thus, Historical Reality View is classified as Status C.

---

## C0-10 — POL Classification

- **Classification**: **STATUS B — PARTIAL IMPLEMENTATION (CONTRACTS & EVALUATOR MATRICES EXIST)**
- **Justification**: `evaluatePolicies` in `packages/runtime/src/evaluator.ts` conjunctively aggregates policy rules with precedence `DENY > INDETERMINATE > ALLOW` and records attributions. When a policy definition specifies `{ mockResult: "DENY" }`, the pipeline produces `outcome: "rejected"` and `trustResult.degradationFactors: ["POLICY_DENIED"]`.

---

## C0-11 — SEC Classification

- **Classification**: **STATUS B — PARTIAL IMPLEMENTATION (CONTRACTS & ASSESSMENT CONSUMERS EXIST)**
- **Justification**: `runInternalPipeline` calculates `trustResult` (`definite`, `speculative`, `uncertain`) and degradation factors. `evaluateAssessmentRequest` in `apps/api/src/zprof/lifecycle.ts` consumes explicit `authorityOutputs.currentlyTrusted`. However, no physical SEC authority engine exists in the repository to produce current trust determinations dynamically during execution without manually supplied authority outputs. Thus, SEC trust authority integration is classified as Status B / C.

---

## C0-12 — Projection Capability Surface

Report of all capabilities available to post-RI domain projection execution:

- **Available Inputs**: Explicit, immutable parameters (`ExecutionOutput`, `ExecutionReceipt`, `EvaluationCoordinate`, `CompositionManifest`, `BoundConstitutionalPayload`).
- **Access Audit**:
  - **Registry Client**: NO (0 references)
  - **Database Client**: NO (0 references)
  - **Network Client**: NO (0 references)
  - **Filesystem**: NO (0 references)
  - **Process Environment (`process.env`)**: NO (0 references)
  - **System Clock (`Date.now()`)**: NO (0 references)
  - **Unrestricted Randomness (`Math.random()`)**: NO (0 references)
  - **Mutable Global State**: NO (0 references)
  - **Application Service Container**: NO (0 references)
- **Finding**: Zero unauthorized ambient capabilities.

---

## C0-13 — Domain Neutrality

- **Generic → GS1 Dependency Audit**:
  - `packages/runtime/` → GS1 imports: **0**
  - `@zyppi/domain` → GS1 imports: **0**
  - `@zyppi/contracts` → GS1 imports: **0**
  - `apps/api/src/zprof/` → GS1 imports: **0**
  - Generic EC → RI Mapper (`mapEvaluationCoordinateToExecutionRequest`) → GS1 imports: **0**
  - Generic Provenance (`HistoricalProvenanceLink`, `verifyExecutionReceiptIntegrity`) → GS1 imports: **0**
  - Generic Receipt (`ExecutionReceipt`) → GS1 imports: **0**
- **Generic → GS1 Dependency Count**: **0**

---

## C0-14 — Expected File-Level Implementation Plan (CORR-0861-C-2)

### Files to Add:

1. `apps/api/src/gs1/gs1ExecutionBridge.ts`
   - Production GS1 execution bridge executing strictly through native RI (`executeEvaluationCoordinate`) with ZERO stage overrides (`DEFAULT_RI_STAGE_OVERRIDES` removed).
   - Fails closed with `ADMISSION_UNAVAILABLE` when native RI pipeline intermediate stages are un-stubbed.
2. `apps/api/src/gs1/gs1ExecutionBridge.test.ts`
   - Physical test suite implementing C-0861-01 through C-0861-32, testing native RI fail-closed behavior, offline receipt/assessment verification, and capability gap handling.

### Files to Modify:

1. `apps/api/src/gs1/index.ts`
   - Re-export `gs1ExecutionBridge` functions and types.
2. `apps/api/src/gs1/types.ts`
   - Define `GS1ExecutionBridgeInputOptions`, `GS1ExecutionBridgeResult`, and `GS1DomainResult` types without caller or default stage overrides.

### Protected Files Touched:

- **NONE**. `packages/runtime/`, `packages/domain/`, `packages/contracts/`, `infra/`, and `edge/` remain 100% untouched.

---

## C0-15 — Stop Conditions

- **CONTRACT REPRESENTATION GAP**: YES (PRJ Projection Engine absent in repository)
- **PRJ/RSN CAPABILITY GAP**: YES (PRJ projection and RSN reasoning engines absent)
- **HISTORICAL REALITY VIEW CAPABILITY GAP**: YES (Governed Historical Reality View PRJ projection engine absent)
- **POL/SEC CAPABILITY GAP**: NO (Contracts and evaluators exist; dynamic SEC authority engine un-stubbed)
- **TEMPORAL PROVENANCE GAP**: NO
- **PROTECTED-BOUNDARY GAP**: NO

### Summary Verdict:

**STOP CONDITION TRIGGERED PER CORR-0861-C-2. NATIVE RI PIPELINE INTERMEDIATE STAGES AND GOVERNED PRJ PROJECTION ENGINE ARE CLASSIFIED AS STATUS C (REPOSITORY CAPABILITY GAPS). PRODUCTION BRIDGE DOES NOT HARDCODE STAGE OVERRIDES OR SYNTHESIZE PRJ PROJECTION AUTHORITY.**

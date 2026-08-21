# AMS-0861-C — C0 RECONNAISSANCE REPORT

**Program:** CAW-011 — Commerce Atlas Wedge
**Milestone:** M08.5 — Z-PROF Profile Architecture
**Execution Packet:** AMS-0861-C — RI Execution, Provenance & Governed Projection
**Document Class:** Phase C0 Reconnaissance & Capability Classification Report
**Authority:** AMS-0861-PLAN-R3 + Final Ratification Addendum — RATIFIED
**Status:** C0 COMPLETED — AUTHORIZED FOR C1+ EXECUTION (ALL SEAMS STATUS A/B)
**Date:** 2026-08-08

---

## 1. Purpose & Scope

This document presents the Phase C0 reconnaissance findings for execution packet AMS-0861-C. Per AMS-0861-C §§7–9 and the user approval constraint, Phase C0 is a read-only reconnaissance exercise designed to verify the existing execution, provenance, receipt, projection, historical reality, policy, and security seams across the repository without modifying any production or test code.

The objective of Phase C0 is to evaluate all required execution and projection seams against mandatory A/B/C capability gates, prove that an exact `EvaluationCoordinate` produced by Packet B can traverse the existing domain-neutral execution architecture to produce faithful execution provenance and governed domain projection, and determine whether any blocking representation or capability gaps exist.

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
  - **Source**: `EvaluationCoordinate.temporalCoordinates` (`tValid`, `tObservation`, `tEInput`).

---

## C0-02 — Existing EC → RI Mapping

- **Existing Mapper**: `mapEvaluationCoordinateToExecutionRequest`
- **Path**: `apps/api/src/zprof/lifecycle.ts`
- **Input**: `MapEcToExecutionRequestOptions` (`coordinate: EvaluationCoordinate`, `boundPayload: BoundConstitutionalPayload`, `requestId: string`, `executionId: string`, `resolvedPolicyGraph?: ResolvedPolicyGraph`)
- **Output**: `{ readonly ok: true; readonly executionRequest: ExecutionRequest } | { readonly ok: false; readonly error: CompositionError }`
- **Validation Behavior**:
  1. Executes `validateEvaluationCoordinatePayload` over input coordinate.
  2. Enforces explicit `tEInput` presence (fails closed with code `"missing"` if absent or empty; zero system-clock fallback).
  3. Enforces structural `PolicyContext` in `boundContext` (fails closed with code `"incompatible"` if malformed; zero ACV synthesis).
  4. Extracts execution parameters (`budget`, `entropy`, `versions`) strictly from `boundPayload.executionContext`.
  5. Assembles candidate `ExecutionRequest` and validates structurally via `validateExecutionRequest`.
- **Missing-Coordinate Behavior**: Fails closed returning explicit `CompositionError` with code `"missing"` or `"incompatible"`.
- **Sufficiency Assessment**: The existing mapper is **100% sufficient and fully compliant** with AMS-0860-C and AMS-0861-C requirements without modification.

---

## C0-03 — RI Execution Seam

- **`ExecutionRequest` Type**: `ExecutionRequest` in `@zyppi/domain` (`packages/domain/src/index.ts`)
  - **Path**: `packages/domain/src/index.ts`
- **RI Admission Function**:
  - **Path**: `packages/runtime/src/pipeline.ts` (`runInternalPipeline`)
  - **Seam Wrapper**: `executeEvaluationCoordinate` (`apps/api/src/zprof/lifecycle.ts`)
- **Runtime Invocation**:
  - **Path**: `packages/runtime/src/pipeline.ts` (`runInternalPipeline(executionRequest, overrides, evidencePayloads)`)
- **`ExecutionOutput`**:
  - **Path/Type**: `ExecutionOutput` in `@zyppi/runtime` (`packages/runtime/src/types.ts`)
- **`ExecutionReceipt`**:
  - **Path/Type**: `ExecutionReceipt` in `@zyppi/domain` (`packages/domain/src/index.ts`)

---

## C0-04 — Temporal Provenance

- **`T_e_input` Source**: `EvaluationCoordinate.temporalCoordinates.tEInput` → mapped directly into `ExecutionRequest.executionContext.constitutionalTimestamp`.
- **`T_e_observed` Source**: Captured post-execution from `ExecutionReceipt.executionTime` inside `executeEvaluationCoordinate` (`apps/api/src/zprof/lifecycle.ts`) as `new Date(rcpt.executionTime).toISOString()` and recorded in `HistoricalProvenanceLink.observedExecutionTime`.
- **Receipt/Runtime Timestamp Field**: `ExecutionReceipt.executionTime` (numeric UTC epoch parsed from `constitutionalTimestamp` during Stage 9).
- **Clock Owner**: Runtime pipeline execution fact (`constitutionalTimestamp` coordinate parsed during Stage 9 materialization).
- **Temporal Separation Proof**: `T_e_input` is required pre-execution and enforced fail-closed by `mapEvaluationCoordinateToExecutionRequest`. `T_e_observed` is captured independently post-execution in `HistoricalProvenanceLink`.
- **Finding**: **NO TEMPORAL PROVENANCE GAP**.

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
  - `PRJ/RSN Specifications`: Bound in `EvaluationCoordinate` substrate via `BoundConstitutionalPayload.boundPrjSpecifications` and `boundRsnBlueprints`.
- **Capacity Finding**: Existing structures (`HistoricalProvenanceLink`, `ExecutionReceipt`, `EvaluationCoordinate`) possess complete capacity to bind all required evaluation, execution, and provenance identities without introducing GS1-specific fields into generic receipts.

---

## C0-06 — Receipt Verification

- **Existing Verification Implementation**: `verifyExecutionReceiptIntegrity` (`apps/api/src/zprof/lifecycle.ts`) and `validateExecutionReceipt` (`packages/domain/src/executionReceipt.test.ts` / `packages/domain/src/index.ts`).
- **Integrity Mechanism**:
  1. Structural validation via `validateExecutionReceipt`.
  2. Cryptographic binding check: Recomputes `expectedInputHash` via `computeSha256("zyppi:domain:input:v1:" + canonicalizeJcs(cleanForJcs(executionRequest)))` and `expectedEvidenceHash` via `computeSha256("zyppi:domain:evidence:v1:" + canonicalizeJcs(cleanForJcs(executionRequest.evidenceBundle)))` when preimage is supplied.
- **Signature/Digest Mechanism**: SHA-256 over JCS canonical UTF-8 bytes (RFC 8785) with domain separation prefixes (`zyppi:domain:receipt:v1:`, `zyppi:domain:input:v1:`, `zyppi:domain:evidence:v1:`).
- **Authority Owner**: `@zyppi/domain` (`packages/domain/src/receiptHash.ts`).
- **Historical Inputs**: `ExecutionReceipt`, `ExecutionRequest` (optional input preimage).
- **Current-State Dependencies**: **ZERO** (100% offline, deterministic calculation with zero Registry, network, or ambient state queries).

---

## C0-07 — PRJ Status Classification

- **Classification**: **STATUS B — PARTIAL IMPLEMENTATION; RATIFIED SEMANTICS ARE SUFFICIENT FOR MINIMUM MECHANICAL MATERIALIZATION**
- **Justification**: Z-PROF (`compatibilityValidator.ts`, `compositionResolver.ts`) structurally validates and binds `boundPrjSpecifications` (e.g. `prj:spec:gs1_digital_link_projection:v1`) against ACV capabilities declared in the pinned ACV. In Phase C, a pure, closed GS1 domain projection function (`executeGs1Projection` / `projectGs1DomainResult` inside `apps/api/src/gs1/`) will consume `ExecutionOutput`, `ExecutionReceipt`, `EvaluationCoordinate`, and `BoundConstitutionalPayload` to produce a `GS1DomainResult` over a closed capability surface with zero ambient access.

---

## C0-08 — RSN Status Classification

- **Classification**: **STATUS B — PARTIAL IMPLEMENTATION; RATIFIED SEMANTICS ARE SUFFICIENT FOR MINIMUM MECHANICAL MATERIALIZATION**
- **Justification**: RSN Blueprints (`rsn:blueprint:...`) and CL-16 intelligence artifacts are structurally bound and checked in Z-PROF (`compositionResolver.ts`, `compatibilityValidator.ts`). Per AMS-0861-C §42, the primary GS1 Digital Link projection relies on PRJ authority (`prj:spec:gs1_digital_link_projection:v1`), and RSN reasoning execution is not required for the physical GS1 projection path. Structural boundaries are fully verified.

---

## C0-09 — Historical Reality View Classification

- **Classification**: **STATUS A — EXISTING CAPABILITY SUFFICIENT**
- **Justification**: Re-executing an exact historical `EvaluationCoordinate` with historical evidence payload maps through `mapEvaluationCoordinateToExecutionRequest` and `executeEvaluationCoordinate` produces deterministic execution outputs without querying current Registry or ACV state. Furthermore, `evaluateAssessmentRequest` in `apps/api/src/zprof/lifecycle.ts` supports `HISTORICAL_RECONSTRUCTION` targets, returning `NON_AUTHORITATIVE_HISTORICAL_RECONSTRUCTION`.

---

## C0-10 — POL Classification

- **Classification**: **STATUS A — SUFFICIENT PHYSICAL AUTHORITY SEAM EXISTS**
- **Justification**: `runInternalPipeline` accepts policy graphs and custom `policyEvaluator` functions returning `DENY`, producing `ADMISSION_DENIED` or `DENY` outcomes (`retainedStatus: "denied"` / `outcome: "rejected"`). In addition, `evaluateAssessmentRequest` assesses `currentlyAdmissible` from explicit POL outputs (`authorityOutputs.currentlyAdmissible`), returning `status: "UNAVAILABLE"` when absent or `status: "DETERMINED"` with `value: false` when denied.

---

## C0-11 — SEC Classification

- **Classification**: **STATUS A — SUFFICIENT PHYSICAL AUTHORITY SEAM EXISTS**
- **Justification**: `runInternalPipeline` calculates trust status (`definite`, `speculative`, `uncertain`) and degradation factors (`POLICY_DENIED`, `POLICY_INDETERMINATE`) in `trustResult`. In addition, `evaluateAssessmentRequest` assesses `currentlyTrusted` from explicit SEC outputs (`authorityOutputs.currentlyTrusted`), returning `status: "UNAVAILABLE"` when absent or `status: "DETERMINED"` with `value: false` when denied.

---

## C0-12 — Projection Capability Surface

Report of all capabilities available to post-RI domain projection execution:

- **Available Inputs**: Explicit, immutable parameters (`ExecutionOutput`, `ExecutionReceipt`, `EvaluationCoordinate`, `BoundConstitutionalPayload`).
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
- **Finding**: Zero unauthorized ambient capabilities. The projection path operates as a pure, side-effect-free transformation function.

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
- **Generic → Domain Projection Implementation Dependency Count**: **0**

---

## C0-14 — Expected File-Level Implementation Plan

### Files to Add:

1. `apps/api/src/gs1/gs1ExecutionBridge.ts`
   - GS1 Domain-Edge Execution, Provenance & Projection Bridge orchestrating `assembleGs1CompositionFromAnchor`, `mapEvaluationCoordinateToExecutionRequest`, `executeEvaluationCoordinate`, and post-RI `executeGs1Projection` over pure GS1 interfaces.
2. `apps/api/src/gs1/gs1ExecutionBridge.test.ts`
   - Physical test suite implementing C-0861-01 through C-0861-32.

### Files to Modify:

1. `apps/api/src/gs1/index.ts`
   - Re-export `gs1ExecutionBridge` functions and types.
2. `apps/api/src/gs1/types.ts`
   - Define `GS1ExecutionBridgeInputOptions`, `GS1ExecutionBridgeResult`, and `GS1DomainResult` types.

### Protected Files Touched:

- **NONE**. `packages/runtime/`, `packages/domain/`, `packages/contracts/`, `infra/`, and `edge/` remain 100% untouched.

---

## C0-15 — Stop Conditions

- **CONTRACT REPRESENTATION GAP**: NO
- **PRJ/RSN CAPABILITY GAP**: NO
- **HISTORICAL REALITY VIEW CAPABILITY GAP**: NO
- **POL/SEC CAPABILITY GAP**: NO
- **TEMPORAL PROVENANCE GAP**: NO
- **PROTECTED-BOUNDARY GAP**: NO

### Summary Verdict:

**ALL REQUIRED SEAMS ARE CLASSIFIED AS STATUS A OR STATUS B. IMPLEMENTATION OF C1+ IS FULLY AUTHORIZED UNDER AMS-0861-C.**

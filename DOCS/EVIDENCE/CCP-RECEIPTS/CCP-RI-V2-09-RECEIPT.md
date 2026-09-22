# CCP-RI-V2-09 — Completion Receipt

**Program:** CAW / M08.5 / AMS-0861 / CCP-RI-V2
**Packet:** CCP-RI-V2-09
**Title:** Receipt V2
**Subtitle:** Native V2 Constitutional Receipt Materialization, Cryptographic Binding & Historical Attribution
**Status:** READY FOR COUNCIL RE-VERIFICATION

---

## 1. Executive Summary

CCP-RI-V2-09 materializes the first native V2 constitutional `ExecutionReceipt` from the exact V2-08 execution-disposition frame. It delegates first to V2-08 (`evaluateExecutabilityAndOutcomeV2`), preserves every predecessor failure unchanged, consumes only the immutable V2-08 success frame, materializes the exact ten-field constitutional Receipt surface, creates native V2 cryptographic domains under JCS (RFC 8785) + UTF-8 + SHA-256 in a pure Domain V2 helper (`packages/domain/src/v2/receiptCrypto.ts`), preserves the existing V2 input digest directly as `inputHash`, cryptographically binds RI-owned V2 output semantics (`executability` and `outcome`) in a separate output domain without recursively hashing the Receipt, cryptographically binds the normalized V2 Evidence state in a separate Evidence domain, preserves the exact supplied `executionId`, deterministically identifies the admitted V2 policy state through `policyUniverseRef`, constructs a bounded canonical policy `decisionSummary` using `canonicalizeReceiptDecisionSummaryV2` without re-evaluating POL, maps `executionTime` to canonical UTC-Z `tEInput`, derives deterministic non-circular `receiptId` and `deterministicHash`, preserves Participant historical attribution through exact V2 input binding, and stops before V2-10 end-to-end proof, persistence, PRJ, or public API work.

---

## 2. Repository Provenance

- **Original Mandated Base:** `92888af3b9ec0ea03bc0844c6f95a06490b47626`
- **Authoritative Submitted Implementation Tree:** TO BE VERIFIED EXTERNALLY BY COUNCIL FROM GITHUB
- **Authoritative Final PR Head:** TO BE VERIFIED EXTERNALLY BY COUNCIL FROM GITHUB
- **Receipt Container SHA:** NOT SELF-EMBEDDED; VERIFIED EXTERNALLY BY COUNCIL

---

## 3. Public Capability Surface & Result Union (Corrective A2)

- **Module:** `packages/runtime/src/v2/receiptMaterialization.ts`
- **Re-exported via:** `packages/runtime/src/v2/index.ts` and `packages/runtime/src/index.ts`
- **Public Entry Point:**
  ```ts
  materializeExecutionReceiptV2(input: unknown): ReceiptMaterializationV2Result
  ```
- **Declared Parameters:** Exactly 1 (`input: unknown`). Extra JS arguments have zero effect.
- **Predecessor Delegation:** First operation is `evaluateExecutabilityAndOutcomeV2(input)`. Predecessor failures returned unchanged.
- **Result Union (Corrective A2):**
  ```ts
  export type ExecutabilityOutcomeV2FailureResult = Exclude<
    ExecutabilityOutcomeV2Result,
    { readonly ok: true }
  >;

  export type ReceiptMaterializationV2Result =
    | ReceiptMaterializationV2Success
    | ReceiptMaterializationV2Failure
    | ExecutabilityOutcomeV2FailureResult;
  ```
  When `result.ok === true`, `result.frame.kind` statically narrows strictly to `"RECEIPT_MATERIALIZATION_V2"`. Predecessor success (`EXECUTABILITY_OUTCOME_V2`) is excluded.

---

## 4. Constitutional Ten-Field Receipt Surface

The materialized `ExecutionReceiptV2` contains exactly ten fields:

1. `receiptId`: `sha256:<64 lowercase hex>` derived under domain `zyppi:domain:receipt_id:v2:` over 8-field preimage (excluding `receiptId` and `deterministicHash`).
2. `executionId`: Preserved string directly from `executionRequest.executionContext.executionId`.
3. `runtimeVersion`: Frozen literal `"2.0.0"`.
4. `inputHash`: Preserved string directly from `wholeRequestDigestCandidate` (defensively re-verified).
5. `outputHash`: `sha256:<64 lowercase hex>` derived under domain `zyppi:domain:output:v2:` over `{ executability, outcome }`.
6. `evidenceHash`: `sha256:<64 lowercase hex>` derived under domain `zyppi:domain:evidence:v2:` over normalized evidence projection.
7. `policyVersion`: Preserved string directly from `executionRequest.policyUniverse.policyUniverseRef`.
8. `decisionSummary`: JCS canonical string derived via `canonicalizeReceiptDecisionSummaryV2` representing bounded POL aggregate result (`status: "PRODUCED"`) or `{"status":"NOT_PRODUCED"}` (Corrective A1).
9. `executionTime`: Canonical normalized UTC-Z ISO-8601 string of `tEInput` via `normalizeTemporalCoordinateV2`.
10. `deterministicHash`: `sha256:<64 lowercase hex>` derived under domain `zyppi:domain:receipt:v2:` over 9-field preimage (excluding `deterministicHash`).

---

## 5. Cryptographic Domain & Non-Circularity Audit

All cryptographic hashing is performed in pure Domain V2 helper (`packages/domain/src/v2/receiptCrypto.ts`) under RFC 8785 JCS + UTF-8 + SHA-256:

- `zyppi:domain:input:v2:` — Existing whole-request input domain (reused without duplicate definition).
- `zyppi:domain:output:v2:` — Dedicated output disposition domain over `{ executability, outcome }`.
- `zyppi:domain:evidence:v2:` — Dedicated evidence domain over normalized evidence projection excluding `evidenceStateRef`.
- `zyppi:domain:receipt_id:v2:` — Dedicated receipt identity domain over 8-field preimage.
- `zyppi:domain:receipt:v2:` — Dedicated deterministic receipt domain over 9-field preimage.

Non-circularity verified:

- `inputHash` does not hash the Receipt.
- `outputHash` does not hash the Receipt.
- `evidenceHash` does not hash itself or the Receipt.
- `receiptId` preimage excludes `receiptId` and `deterministicHash`.
- `deterministicHash` preimage excludes `deterministicHash`.
- Parameterized 9-field sensitivity test for `deriveReceiptDeterministicHashV2` verified in `receiptCrypto.test.ts` (Corrective B2).

---

## 6. Participant Foundation Audit (PFG-R01..PFG-R09)

- **PFG-R01 Exact V2 Input Binding:** Historical participation, agency, roles, and subject state bound through `inputHash`.
- **PFG-R02 No Account Identity Promotion:** Zero account, user, tenant, or participant fields added to Receipt.
- **PFG-R03 Historical Reconstruction Without Current Re-Evaluation:** Materialization relies strictly on the bound execution frame.
- **PFG-R04 Historical Attribution Survives Offboarding:** Historical execution remains bound without current-state lookups.
- **PFG-R05 Receipt Validity Is Not Current Authority:** Materializing a valid receipt does not imply current standing or authority.
- **PFG-R06 Unknown Preservation:** `UNKNOWN` subject bindings remain preserved as bound historical facts.
- **PFG-R07 No Receipt Identity Dossier:** No participant profiles, credentials, or membership graphs embedded.
- **PFG-R08 No Current-State Substitution:** Zero current-state resolution, registry queries, or network lookups.
- **PFG-R09 Existing Receipt Field Membership Preserved:** Exactly the ten canonical receipt field names preserved.

---

## 7. Predecessor Preservation Audit (Corrective B3)

- **V2-01 Structural Validation:** Malformed input fails closed at `STRUCTURAL_VALIDATION`.
- **V2-02 Identity Validation:** Component digest mismatch fails closed at `IDENTITY_VALIDATION`.
- **V2-05 Envelope Compatibility:** Envelope incompatibility fails closed at `EXECUTION_ENVELOPE_COMPATIBILITY`.
- **V2-06 Production Isolation:** `prepareProductionExecutionV2` snapshot re-validation failures propagate as `PRODUCTION_EXECUTION_V2` / `SNAPSHOT_REVALIDATION_FAILED` or `SNAPSHOT_DIGEST_MISMATCH`. (Note: Public V2-05 inputs produce valid inert snapshots; structural failures are caught at `STRUCTURAL_VALIDATION`).
- **V2-07 Owner Determination Integration:** `integrateOwnerDeterminationsV2` dependency scheduling failures propagate as `OWNER_DETERMINATION_INTEGRATION_V2` / `OWNER_DEPENDENCY_SCHEDULING_FAILED`. (Note: V2-05 Law G evaluates and catches dependency cycles at `EXECUTION_ENVELOPE_COMPATIBILITY`).
- **V2-08 Executability / Outcome:** Executability and Outcome failures propagate as `EXECUTABILITY_OUTCOME`.

---

## 8. Verification Matrix & Test Execution

### Mandatory Test Matrix & Adversarial Suite — 44/44 PASS

- `V209-T01`: Positive Receipt Materialization (PASS)
- `V209-T02`: Structural Failure Preserved (PASS)
- `V209-T03`: Identity Failure Preserved (PASS)
- `V209-T04`: V2-05 Failure Preserved (PASS)
- `V209-T05`: V2-06 Failure Preserved (PASS)
- `V209-T06`: V2-07 Failure Preserved (PASS)
- `V209-T07`: V2-08 Failure Preserved (PASS)
- `V209-T08`: Exact Input Hash Promotion (PASS)
- `V209-T09`: Input Digest Continuity (PASS)
- `V209-T10`: Exact Execution ID (PASS)
- `V209-T11`: Native Runtime Version (PASS)
- `V209-T12`: Exact Policy State Identity (PASS)
- `V209-T13`: Canonical executionTime (PASS)
- `V209-T14`: Equivalent Offset Replay (PASS)
- `V209-T15`: Fractional Precision Preservation (PASS)
- `V209-T16`: No Ambient Time (PASS)
- `V209-T17`: Evidence Hash Determinism (PASS)
- `V209-T18`: Evidence Semantic Permutation Invariance (PASS)
- `V209-T19`: Evidence Semantic Change (PASS)
- `V209-T20`: Output Hash Determinism (PASS)
- `V209-T21`: Executability Changes Output Hash (PASS)
- `V209-T22`: Outcome Changes Output Hash (PASS)
- `V209-T23`: Receipt Excluded From Output Hash (PASS)
- `V209-T24`: ALLOW Decision Summary (PASS)
- `V209-T25`: DENY Decision Summary (PASS)
- `V209-T26`: INDETERMINATE Decision Summary (PASS)
- `V209-T27`: No Policy Aggregate (PASS)
- `V209-T28`: Decision Summary Separation (PASS)
- `V209-T29`: Receipt ID Determinism (PASS)
- `V209-T30`: Distinct Execution Identity (PASS)
- `V209-T31`: Receipt ID Non-Circularity (PASS)
- `V209-T32`: Deterministic Hash Stability (PASS)
- `V209-T33`: Deterministic Hash Field Sensitivity (PASS)
- `V209-T34`: Deterministic Hash Non-Circularity (PASS)
- `V209-T35`: Full Replay Stability (PASS)
- `V209-T36`: Caller Mutation Isolation (PASS)
- `V209-T37`: Deep Immutability (PASS)
- `V209-T38`: Extra JS Arguments Ignored (PASS)
- `V209-T39`: Participant / Agency Binding Changes Input Identity (PASS)
- `V209-T40`: UNKNOWN Subject Preservation (PASS)
- `V209-T41`: V1 Isolation (PASS)
- `V209-T42`: Public API Exactness (PASS)
- `V209-H01`: Nested Decision Summary Property-Order Invariance (PASS - Corrective A1)
- `A2`: Static type assertion proving `ok: true` narrows `frame.kind` strictly to `RECEIPT_MATERIALIZATION_V2` (PASS - Corrective A2)

### Seven Mandatory Quality Gates (Corrective B1)

1. `pnpm format:check` — PASS
2. `pnpm lint` — PASS
3. `pnpm exec tsc -b` — PASS
4. `pnpm runtime:purity` — PASS
5. `pnpm boundary:all` — PASS
6. `pnpm graph:validate` — PASS
7. `pnpm test` — PASS

Additional: `pnpm governance:validate` — PASS

---

## 9. Final Implementer Recommendation

**READY FOR COUNCIL RE-VERIFICATION**

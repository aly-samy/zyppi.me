# Completion Receipt — CCP-RI-V2-01

## V2 Request / Leaf Physical Representation & Structural Validation (With Corrective CCP-RI-V2-01-CORR-02)

### 1. Base SHA

- `3b9f725992ad1deef63ffbf9232bc6d1d3ad8b0e`

### 2. CORR-02 Implementation Commit SHA (Commit A)

- `142e51cdb6943e3d6d85ec7366223f56e0e15459`

### 3. Receipt Container Commit SHA (Commit B)

- NOT SELF-EMBEDDED
- VERIFIED EXTERNALLY BY COUNCIL / GIT

### 4. PR Head at Council Verification

- TO BE RECORDED BY COUNCIL ON PR #114

### 5. Actual Branch Name

- `CCP-RI-V2-01-v2-request-structural-contract-1431857625134782151`

### 6. Exact Files Added/Modified per Commit

- **Commit A (`142e51cdb6943e3d6d85ec7366223f56e0e15459`):**
  - `packages/domain/src/v2/types.ts`
  - `packages/domain/src/v2/json.ts`
  - `packages/domain/src/v2/refs.ts`
  - `packages/domain/src/v2/errors.ts`
  - `packages/domain/src/v2/validator.ts`
  - `packages/domain/src/v2/validator.test.ts`
  - `packages/domain/src/v2/index.ts`
- **Commit B (Receipt Commit):**
  - `DOCS/CAW/CCP/CCP-RI-V2-01-RECEIPT.md`

### 7. Corrective Refinements Applied (R01–R10)

- **R01 (Question Operand Slot Semantic Type):** `QuestionOperandBindingV2.operandSlotSemanticRef` is updated to `EvaluationSemanticRefV2` (`EVALUATION_SEMANTIC`).
- **R02 (Exact Requested Action Instance Marker):** `REQUESTED_ACTION` question operands carry literal `requestedActionRef: "REQUESTED_ACTION"`.
- **R03 (Semantic Evaluation-Context Collection Discriminator):** `EVALUATION_CONTEXT_BINDING` uses `bindingCollection: "AUTHORIZED_INPUT" | "EVALUATION_PARAMETER" | "BOUND_CONTEXT"`.
- **R04 (Structural Relationship Semantic Type):** `RELATIONSHIP_STATE / STRUCTURAL` uses `relationshipSemanticRef: StateSemanticRefV2` (`STATE_SEMANTIC`). `REIFIED` is closed on `relationshipRef` and `exactStateRef`.
- **R05 (StateBindings [1..N] Per State View):** `StateViewV2.stateBindings` mandates at least 1 state binding. Minimal valid fixture includes an `IDENTITY_STATE` binding.
- **R06 (PolicyRef Exactness via Generic ConstitutionalRef):** Any `ConstitutionalRefV2` with `family: "POLICY"` requires mandatory `version`, `stateRef`, and `provenanceRef`.
- **R07 (Rejection of Non-Enumerable Hidden Properties):** `isStrictJsonValueV2` rejects own properties with `desc.enumerable !== true`.
- **R08 (Rejection of Non-Canonical Array Own Keys):** Array validation rejects own keys other than `length` and `"0"`..`String(length - 1)`, rejecting sparse/undefined elements and extra numeric-like keys (`"01"`, `"4294967295"`).
- **R09 (Rejection of Impossible Calendar Dates):** Instant validation strictly checks calendar bounds, rejecting impossible dates like `2026-02-30` or non-leap `2025-02-29`, while accepting valid leap days and offset-bearing instants.
- **R10 (Immutable Council Test Matrix Restoration):** Test IDs `V201-T01` through `V201-T52` are restored to their exact Council definitions. Extra tests are assigned `V201-T53+`.

### 8. V2 Public Exports

Exported from `packages/domain/src/v2/index.ts` and re-exported from `@zyppi/domain` (`packages/domain/src/index.ts`):

- `ExecutionRequestV2`
- Public leaf types and interfaces (`ParticipationV2`, `IntentBindingV2`, `RequestedActionBindingV2`, `BoundConstitutionalStateV2`, `BoundEvidenceStateV2`, `BoundPolicyUniverseV2`, `BoundEvaluationContextV2`, `ExecutionContextV2`, `OwnerDeterminationBindingV2`, `ExactStateInstanceV2`, `IntentActionCompatibilityBindingV2`, `QuestionOperandBindingV2`, `EvaluationContextBindingCollectionV2`, etc.)
- Public reference types (`ConstitutionalRefV2`, `SubjectRefV2`, `ActionSemanticRefV2`, `TargetRefV2`, `StateSemanticRefV2`, `PolicyRefV2`, etc.)
- Public error types (`ExecutionRequestV2ValidationError`, `ExecutionRequestV2ValidationErrorCode`)
- Strict JSON type and validator (`JsonValueV2`, `isStrictJsonValueV2`)
- Validator function `validateExecutionRequestV2`

### 9. Implementation vs Deferred Work

```text
IMPLEMENTED IN V2-01:
  representation
  strict materialized structural validation (R01–R09)
  exports
  tests (V201-T01..T66)

NOT IMPLEMENTED:
  hash derivation
  component verification
  inputHash
  Stage 5
  generation dispatch
  raw duplicate-key detection
  Runtime execution
```

### 10. Raw Duplicate Key Boundary

```text
RAW DUPLICATE JSON KEY DETECTION:
  NOT CLAIMED BY validateExecutionRequestV2()
  MANDATORY DEFERRED TO CCP-RI-V2-04
```

### 11. Protected-Boundary Diff Proof

No files were modified or touched inside:

- `packages/runtime/**`
- `apps/api/**`
- `packages/contracts/**`
- `infra/**`
- `edge/**`

### 12. Source Negative Audit Classification

| Match                                                      | Source File                                | Classification / Justification                                            |
| :--------------------------------------------------------- | :----------------------------------------- | :------------------------------------------------------------------------ |
| `FLOATING_VERSION_INDICATORS = ["latest", "current", "*"]` | `packages/domain/src/v2/validator.ts`      | Structural indicator check rejecting floating versions.                   |
| `"constitutionalTimestamp"`                                | `packages/domain/src/v2/validator.test.ts` | Test asserting rejection of historical V1 fields in V2.                   |
| `"versions:"`                                              | `packages/domain/src/v2/validator.test.ts` | Test asserting rejection of historical V1 fields in V2.                   |
| `"pol-latest"`, `"latest"`                                 | `packages/domain/src/v2/validator.test.ts` | Negative test fixture verifying rejection of floating version specifiers. |
| `"GS1"`, `"GTIN"`, `"GLN"`                                 | `packages/domain/src/v2/validator.test.ts` | Disappearance test verifying zero GS1 semantics in V2.                    |

### 13. Full Quality Gate Output Summary

- `pnpm format:check`: PASS (100% Prettier compliant)
- `pnpm lint`: PASS (0 ESLint errors)
- `pnpm exec tsc -b`: PASS (0 TypeScript errors)
- `pnpm runtime:purity`: PASS (Runtime purity verified)
- `pnpm boundary:all`: PASS (Package boundary self-resolution verified)
- `pnpm graph:validate`: PASS (Workspace dependency graph valid)
- `pnpm test`: PASS (1025 domain & workspace tests passing green)

### 14. Restored Council Test Matrix Mapping (V201-T01..T52)

| Test ID  | Test Description                                            | Result |
| :------- | :---------------------------------------------------------- | :----- |
| V201-T01 | valid minimal same-Subject request accepted                 | PASS   |
| V201-T02 | valid delegated structural request accepted                 | PASS   |
| V201-T03 | contractVersion exactly "v2"                                | PASS   |
| V201-T04 | V1 request rejected by V2 validator                         | PASS   |
| V201-T05 | unknown top-level field rejected                            | PASS   |
| V201-T06 | unknown nested field rejected                               | PASS   |
| V201-T07 | undefined rejected                                          | PASS   |
| V201-T08 | non-plain runtime values rejected                           | PASS   |
| V201-T09 | non-finite numbers rejected                                 | PASS   |
| V201-T10 | unknown reference family rejected                           | PASS   |
| V201-T11 | malformed typed reference rejected                          | PASS   |
| V201-T12 | component digest grammar enforced                           | PASS   |
| V201-T13 | at least one ACTOR required                                 | PASS   |
| V201-T14 | UNKNOWN allowed only for ACTOR                              | PASS   |
| V201-T15 | known duplicate Subject+Role rejected                       | PASS   |
| V201-T16 | duplicate Participation key rejected                        | PASS   |
| V201-T17 | malformed Agency Binding rejected                           | PASS   |
| V201-T18 | invalid Intent category rejected                            | PASS   |
| V201-T19 | missing candidate exact state rejected                      | PASS   |
| V201-T20 | Requested Action requires performer(s)                      | PASS   |
| V201-T21 | COMPOSED agency requires >=2 unique refs + basis            | PASS   |
| V201-T22 | target binding requires slot semantic + target              | PASS   |
| V201-T23 | capability claim requires claimant performer(s)             | PASS   |
| V201-T24 | Constitutional State requires >=1 view                      | PASS   |
| V201-T25 | State binding kind is closed                                | PASS   |
| V201-T26 | Evidence State requires all explicit collections            | PASS   |
| V201-T27 | Evidence presentation requires >=1 Evidence ref             | PASS   |
| V201-T28 | duplicate Evidence requirement key rejected                 | PASS   |
| V201-T29 | Policy dependencyTopology field required                    | PASS   |
| V201-T30 | explicit empty policy graph accepted structurally           | PASS   |
| V201-T31 | applicability provenance required even for empty policy set | PASS   |
| V201-T32 | Evaluation Context rejects arbitrary metadata field         | PASS   |
| V201-T33 | Owner Determination exact question required                 | PASS   |
| V201-T34 | OwnerNativeResult strict JSON only                          | PASS   |
| V201-T35 | dependency declaration required                             | PASS   |
| V201-T36 | AUTHORITATIVELY_NONE rejects dependencyRefs                 | PASS   |
| V201-T37 | EXPLICIT requires >=1 unique dependency ref                 | PASS   |
| V201-T38 | operand binding kinds are closed                            | PASS   |
| V201-T39 | tEInput required                                            | PASS   |
| V201-T40 | V1 constitutionalTimestamp rejected in V2                   | PASS   |
| V201-T41 | V1 versions[] rejected in V2                                | PASS   |
| V201-T42 | tEObserved rejected from new V2 input                       | PASS   |
| V201-T43 | entropy optional                                            | PASS   |
| V201-T44 | entropy invalid if blank                                    | PASS   |
| V201-T45 | budget finite/non-negative                                  | PASS   |
| V201-T46 | inputHash rejected as request field                         | PASS   |
| V201-T47 | validation does not mutate input                            | PASS   |
| V201-T48 | repeated validation deterministic                           | PASS   |
| V201-T49 | V1 validateExecutionRequest behavior unchanged              | PASS   |
| V201-T50 | V1 ExecutionRequest tests remain green                      | PASS   |
| V201-T51 | generic V2 source contains zero GS1 domain semantics        | PASS   |
| V201-T52 | domain package remains dependency-free / boundary-clean     | PASS   |

### 15. Extra Corrective Tests (V201-T53+)

- **V201-T53:** R01 — Question operand slot wrong reference family rejected
- **V201-T54:** R02 — REQUESTED_ACTION operand missing/wrong literal marker
- **V201-T55:** R03 — Invalid evaluation-context bindingCollection discriminator
- **V201-T56:** R04 — STRUCTURAL relationship using relationshipRef rejected
- **V201-T57:** R04 — STRUCTURAL relationship semantic wrong family rejected
- **V201-T58:** R04 — REIFIED branch with unadmitted fields rejected
- **V201-T59:** R05 — Empty stateBindings in a State View rejected
- **V201-T60:** R06 — Generic ConstitutionalRef POLICY missing version/state/provenance rejected
- **V201-T61:** R07 — Non-enumerable hidden object property rejected
- **V201-T62:** R07 — Non-enumerable hidden nested reference property rejected
- **V201-T63:** R08 — Array key '01' or out-of-range numeric-like key rejected
- **V201-T64:** R09 — Invalid February 30 instant rejected
- **V201-T65:** R09 — Invalid non-leap February 29 rejected & valid leap day accepted
- **V201-T66:** R09 — Valid timezone offset instant accepted

### 16. Final Implementer Disposition

FINAL IMPLEMENTER RECOMMENDATION:
READY FOR COUNCIL RE-VERIFICATION

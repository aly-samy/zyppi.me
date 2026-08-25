# CCP-RI-V2-02 Completion Receipt
## V2 Canonicalization, Component Identity & Whole-Request Digest Candidate

---

## 1. Executive Summary

This completion receipt materializes the execution proof for **CCP-RI-V2-02** ("V2 Canonicalization, Component Identity & Whole-Request Input Binding") inside `@zyppi/domain`.

The implementation establishes a generation-distinct, deterministic V2 identity layer:
- **Strict RFC 8785 / JCS Canonicalization & Unicode Validation** (`packages/domain/src/v2/canonical.ts`)
- **Temporal UTC `Z` Instant Canonicalization** (`packages/domain/src/v2/temporal.ts`)
- **Graph Local-Label Canonicalization & Collection Normalization** (`packages/domain/src/v2/graphCanonicalization.ts`)
- **Three V2 Component Identity Projections & Whole-Request Candidate Derivation** (`packages/domain/src/v2/identity.ts`)
- **Fixed Independent Golden Identity Vectors** (`packages/domain/src/v2/fixtures/identityVectors.ts`)
- **Mandatory Council Test Suite V202-T01..T56** (`packages/domain/src/v2/identity.test.ts`)

Historical V1 contracts, receipt hashing, and test suites remain 100% untouched and preserved.

---

## 2. Commit Anchor & Repository Metadata

1. **Repository Base SHA:** `17406f6034631d7f2cd988c5e0ec8e95d09a5121` (`main`)
2. **Implementation Tree Anchor (Commit A SHA):** `41649a8f7663fc727ac413453368374d8a8d8288`
3. **Receipt Container Self-Reference Rule:** Materialized in Commit B, maintaining Commit A as an un-embedded, pure implementation tree anchor for Council audit.
4. **Target Branch:** `CCP-RI-V2-02-v2-canonicalization-identity`

---

## 3. Exact Files Modified & Added

```text
packages/domain/src/v2/canonical.ts                (NEW)
packages/domain/src/v2/temporal.ts                 (NEW)
packages/domain/src/v2/graphCanonicalization.ts     (NEW)
packages/domain/src/v2/identity.ts                 (NEW)
packages/domain/src/v2/fixtures/identityVectors.ts (NEW)
packages/domain/src/v2/identity.test.ts            (NEW)
packages/domain/src/v2/index.ts                    (MODIFIED - re-exports V2 identity)
packages/domain/src/index.ts                       (UNTOUCHED - already exports ./v2/index.js)
```

No files modified in `packages/runtime/`, `apps/api/`, `packages/contracts/`, `infra/`, or `edge/`.

---

## 4. Public V2 Identity Exports

Exported via `@zyppi/domain` (via `packages/domain/src/v2/index.ts`):

- **Types & Result Containers:**
  - `V2IdentityResult<T>`, `V2IdentityError`, `V2IdentityErrorCode`
  - `SemanticStateRefV2`, `EvidenceStateRefV2`, `PolicyUniverseRefV2`
- **Domain Separator Map:**
  - `V2_DOMAIN_SEPARATORS`
- **Component Identity Functions:**
  - `getConstitutionalStateIdentityProjectionV2()`, `deriveSemanticStateRefV2()`, `verifySemanticStateRefV2()`
  - `getEvidenceStateIdentityProjectionV2()`, `deriveEvidenceStateRefV2()`, `verifyEvidenceStateRefV2()`
  - `getPolicyUniverseIdentityProjectionV2()`, `derivePolicyUniverseRefV2()`, `verifyPolicyUniverseRefV2()`
- **Whole-Request Candidate Derivation:**
  - `deriveExecutionRequestV2DigestCandidate()`

---

## 5. Domain Separators & Component Projections

### 5.1 Exact Domain Separators
```ts
export const V2_DOMAIN_SEPARATORS = {
  CONSTITUTIONAL_STATE: "zyppi:domain:constitutional_state:v2:",
  EVIDENCE_STATE:       "zyppi:domain:evidence_state:v2:",
  POLICY_UNIVERSE:      "zyppi:domain:policy_universe:v2:",
  INPUT:                "zyppi:domain:input:v2:",
} as const;
```

### 5.2 Component Identity Projections
1. **`SemanticStateRefV2` Projection:** `BoundConstitutionalStateV2` excluding `semanticStateRef`.
2. **`EvidenceStateRefV2` Projection:** `BoundEvidenceStateV2` excluding `evidenceStateRef`.
3. **`PolicyUniverseRefV2` Projection:** `BoundPolicyUniverseV2` excluding `policyUniverseRef`.

### 5.3 Component Verification Failure
Component verification mismatch returns `{ ok: false, error: { code: "COMPONENT_DIGEST_MISMATCH", path: "...", message: "..." } }`.
It does not throw exceptions, perform fallback Registry/V1 lookups, or repair inconsistent requests.

---

## 6. Graph Local-Label Canonicalization

Local-label canonicalization is performed using partition refinement with single-label target signatures and Cartesian permutation evaluation to pick the lexicographically smallest JCS output across 13 typed local label namespaces:

1. `ROLE_BINDING`
2. `AGENCY_BINDING`
3. `PERFORMER`
4. `CAPABILITY_CLAIM`
5. `VIEW`
6. `STATE_BINDING`
7. `EVIDENCE_REQUIREMENT`
8. `EVIDENCE_MATERIAL`
9. `INTEGRITY_COORDINATE`
10. `POLICY_MATERIAL`
11. `EVALUATION_BINDING`
12. `QUESTION_OPERAND`
13. `OWNER_DETERMINATION`

**Topology Preservation:** Invariant under any lawful bijective local-label renaming. Preserves `UNKNOWN` participant multiplicity and directed edge orientations.
**Opaque Owner Material:** Arrays in opaque owner-native result payloads, inline material, or `JsonValueV2` remain JSON sequences (order preserved).

---

## 7. Collection Semantics & Duplicate Handling

- Semantically unordered collections are normalized by JCS-serializing each member and sorting by unsigned UTF-8 bytes (`compareUtf8Bytes`).
- Identical members resulting from normalization return `{ ok: false, error: { code: "SEMANTIC_DUPLICATE", path: "..." } }`. Silent deduplication is prohibited.

---

## 8. Temporal UTC Z Canonicalization

- Parses ISO-8601 temporal instant strings (`tEInput`, `tValid`, `tObservation`, `tTrust`).
- Converts non-UTC timezone offsets (e.g. `+03:00`) to UTC `Z`.
- Preserves exact sub-millisecond fractional precision (e.g. `2026-08-24T17:00:00.123456789Z`).
- Omits fractional seconds when zero.

---

## 9. RFC 8785 / JCS & Unicode Conformance Evidence

- **Property Sorting:** UTF-16 code units (`"a" < "b"`).
- **Number Serialization:** IEEE-754 numbers serialized without exponent where standard allows; `-0` canonicalizes to `0`. Non-finite numbers (`NaN`, `Infinity`) fail closed with `INVALID_IDENTITY_INPUT`.
- **Unicode Validation:** Lone high surrogates (`\uD800`) and lone low surrogates (`\uDC00`) fail closed with `INVALID_JCS_UNICODE`. Valid surrogate pairs (e.g. Gothic `𐍈`) pass natively.
- **Undefined Handling:** `undefined` values return `INVALID_IDENTITY_INPUT` rather than disappearing via `cleanForJcs`.

---

## 10. Independent Golden Identity Vectors

Materialized in `packages/domain/src/v2/fixtures/identityVectors.ts`:

### Vector A (Minimal Same-Subject)
- `semanticStateRef`: `sha256:a089fa743c28fcb4e304fba6fa22780637b3a12dcdb77f0fabaf30ba650a7b69`
- `evidenceStateRef`: `sha256:93f27b9a5bf46d85dd8e98710398e85db24eb8efc0e43827ebf6c900f73e2dde`
- `policyUniverseRef`: `sha256:3e72c74c72b3cfd918eb167e12c8e5d2cad8644b808634e50293fc94bb3e9777`
- `wholeRequestDigestCandidate`: `sha256:8b9ac554ace8abac2c1fe4e9e96dfc090fff48feb483080dedba05c8fc14f60f`

### Vector B (Delegated / Graph-Rich)
- `semanticStateRef`: `sha256:5c4bbf9d47fe50dffb550337c7f330630f9b912a68d5a9f11fc9997838d15ce9`
- `evidenceStateRef`: `sha256:c6222d38efa2942105a6944e9a3a9a85492488054207cc51b86b0dbdf441cb70`
- `policyUniverseRef`: `sha256:7e230089152ed1f05a575557a43710f43d469f3c862724d5e9c0673aa684b4a9`
- `wholeRequestDigestCandidate`: `sha256:3c4370070d0451fee4344b5ca1ee8501d19314923b12372b515b545df3661867`

---

## 11. Mandatory Council Test Suite Matrix (V202-T01..T56)

Executed in `packages/domain/src/v2/identity.test.ts`:

| Test ID | Description | Status |
| :--- | :--- | :--- |
| `V202-T01` | ConstitutionalState identity stable under JSON property permutation | **PASS** |
| `V202-T02` | EvidenceState identity stable under JSON property permutation | **PASS** |
| `V202-T03` | PolicyUniverse identity stable under JSON property permutation | **PASS** |
| `V202-T04` | component self-ref excluded from component preimage | **PASS** |
| `V202-T05` | changing non-self component material changes digest | **PASS** |
| `V202-T06` | supplied wrong SemanticStateRef rejected | **PASS** |
| `V202-T07` | supplied wrong EvidenceStateRef rejected | **PASS** |
| `V202-T08` | supplied wrong PolicyUniverseRef rejected | **PASS** |
| `V202-T09` | V1 ACV digest cannot satisfy SemanticStateRef derivation | **PASS** |
| `V202-T10` | V1 Evidence aggregate hash cannot satisfy EvidenceStateRef derivation | **PASS** |
| `V202-T11` | V1 input hash cannot satisfy V2 whole-request domain | **PASS** |
| `V202-T12` | local role-binding label bijection preserves normalized identity | **PASS** |
| `V202-T13` | local Agency label bijection preserves normalized identity | **PASS** |
| `V202-T14` | local performer label bijection preserves normalized identity | **PASS** |
| `V202-T15` | local determination label bijection preserves normalized identity | **PASS** |
| `V202-T16` | same nodes with changed cross-binding topology changes identity | **PASS** |
| `V202-T17` | UNKNOWN multiplicity preserved | **PASS** |
| `V202-T18` | synthetic anonymous Subject not created | **PASS** |
| `V202-T19` | true set permutation preserves identity | **PASS** |
| `V202-T20` | opaque owner-native JSON array reorder changes identity | **PASS** |
| `V202-T21` | Policy edge list permutation preserves identity | **PASS** |
| `V202-T22` | Policy edge direction reversal changes identity | **PASS** |
| `V202-T23` | duplicate semantic identity-bearing member rejected | **PASS** |
| `V202-T24` | missing remains distinct from explicit empty where representable | **PASS** |
| `V202-T25` | AUTHORITATIVELY_NONE remains distinct from missing | **PASS** |
| `V202-T26` | NO_DELEGATED_AGENCY_RELIANCE remains distinct from absent/malformed | **PASS** |
| `V202-T27` | requestId change changes whole-request digest candidate | **PASS** |
| `V202-T28` | executionId change changes whole-request digest candidate | **PASS** |
| `V202-T29` | contractVersion participates in whole-request identity | **PASS** |
| `V202-T30` | component refs do not replace actual component material in root projection | **PASS** |
| `V202-T31` | equivalent timezone-offset spellings canonicalize identically | **PASS** |
| `V202-T32` | temporal role substitution changes identity | **PASS** |
| `V202-T33` | >millisecond fractional precision preserved | **PASS** |
| `V202-T34` | no Unicode normalization | **PASS** |
| `V202-T35` | lone high surrogate rejected | **PASS** |
| `V202-T36` | lone low surrogate rejected | **PASS** |
| `V202-T37` | valid surrogate pair accepted | **PASS** |
| `V202-T38` | RFC8785 property-sort vector matches | **PASS** |
| `V202-T39` | RFC8785 primitive/sample vector matches | **PASS** |
| `V202-T40` | RFC8785 representative Appendix-B number vectors match | **PASS** |
| `V202-T41` | -0 canonicalizes as 0 | **PASS** |
| `V202-T42` | NaN/Infinity never enter V2 identity | **PASS** |
| `V202-T43` | undefined never disappears via cleanForJcs | **PASS** |
| `V202-T44` | no localeCompare dependency in V2 production canonicalization | **PASS** |
| `V202-T45` | no raw JSON.stringify used as canonical authority | **PASS** |
| `V202-T46` | no V1 hash domain appears in V2 identity production code | **PASS** |
| `V202-T47` | exact four V2 input identity domains present and no fifth core domain | **PASS** |
| `V202-T48` | repeated normalization/hash deterministic | **PASS** |
| `V202-T49` | input objects are not mutated | **PASS** |
| `V202-T50` | domain package boundary remains clean | **PASS** |
| `V202-T51` | V1 golden hash/Receipt vectors unchanged | **PASS** |
| `V202-T52` | GS1/domain-specific semantics absent from V2 identity implementation | **PASS** |
| `V202-T53` | whole-request digest candidate is not represented as request field | **PASS** |
| `V202-T54` | no public API accepts caller boolean asserting coherence/admission | **PASS** |
| `V202-T55` | component mismatch cannot be repaired by fallback/current lookup | **PASS** |
| `V202-T56` | independent fixed golden vectors reproduce 3 component digests + root candidate | **PASS** |

---

## 12. V1 Preservation & Protected Boundary Verification

1. **V1 Historical Domain Preservation:**
   `packages/domain/src/receiptHash.ts`, `acvState.ts`, `evidenceVerification.ts`, and `seed-helpers.ts` are 100% untouched. All 504 `@zyppi/domain` tests pass without regressions.
2. **Protected Workspace Surface:**
   Zero changes to `packages/runtime/`, `apps/api/`, `packages/contracts/`, `infra/`, or `edge/`.

---

## 13. Quality Gate Results

- `pnpm format:check` — **PASS**
- `pnpm lint` — **PASS**
- `pnpm exec tsc -b` — **PASS**
- `pnpm runtime:purity` — **PASS**
- `pnpm boundary:all` — **PASS**
- `pnpm graph:validate` — **PASS**
- `pnpm exec vitest run packages/domain/` — **PASS** (560 tests green)

---

## 14. Explicit Deferrals & Scope Boundaries

1. **Raw Serialized Duplicate Key Detection:** Deferred to **CCP-RI-V2-04** (operates on raw byte/string stream before JSON object deserialization).
2. **Admitted `inputHash` Binding & Cross-Leaf Coherence Gate:** Deferred to **CCP-RI-V2-05** (`deriveExecutionRequestV2DigestCandidate` computes candidate digest only, exposing no caller boolean or admission override).

---

## 15. Final Implementer Verdict

```text
READY FOR COUNCIL VERIFICATION
```

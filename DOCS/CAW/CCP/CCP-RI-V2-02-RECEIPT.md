# CCP-RI-V2-02 Completion Receipt

## V2 Canonicalization, Component Identity & Whole-Request Digest Candidate

---

## 1. Executive Summary

This completion receipt materializes the execution proof for **CCP-RI-V2-02** ("V2 Canonicalization, Component Identity & Whole-Request Input Binding") and corrective mandate **CCP-RI-V2-02-CORR-01** inside `@zyppi/domain`.

The implementation establishes a generation-distinct, deterministic V2 identity layer:

- **C01 Strict Gregorian Temporal Validity:** Real calendar bounds (month/day/leap-year) validated before UTC shift; four-digit years preserved without JS `Date(0..99)` remapping bug (`packages/domain/src/v2/temporal.ts`).
- **C02 Unicode Object Key Validation:** Surrogate pair validation applied to every property key and string value (`packages/domain/src/v2/canonical.ts`).
- **C03 Strict Carrier Safety:** Plain object/array carrier safety enforcing own enumerable properties, canonical array indices `0..length-1`, no sparse elements, and returning `INVALID_IDENTITY_INPUT` without uncontrolled runtime exceptions (`packages/domain/src/v2/canonical.ts`).
- **C04 V2-01 Root Structural Boundary:** Invokes `validateExecutionRequestV2(req)` at the entrypoint of `deriveExecutionRequestV2DigestCandidate()` mapping structural defects to `INVALID_IDENTITY_INPUT` (`packages/domain/src/v2/identity.ts`).
- **C05 Incidental Key Erasure:** Unreferenced local keys (`viewKey`, `stateBindingKey`, `requirementKey`, `materialKey`, `coordinateKey`, `policyKey`, `operandKey`) are omitted from normalized component projections.
- **C06 Semantic Duplicates After Key Erasure:** Identity-bearing members that become identical after key erasure return `SEMANTIC_DUPLICATE` (`packages/domain/src/v2/graphCanonicalization.ts`).
- **C07 Local Namespace Scoping:** Evaluation context binding namespaces are strictly separated by collection (`AUTHORIZED_INPUT`, `EVALUATION_PARAMETER`, `BOUND_CONTEXT`).
- **C08 Individualization & Partition Refinement:** Label canonicalization uses DFS individualization-refinement over equivalence signature buckets with branch-and-bound pruning instead of eager full permutations (`packages/domain/src/v2/graphCanonicalization.ts`).
- **C09..C11 Test Suite & Fixed Preimages:** Strengthened mandatory test matrix `V202-T01..T56`, added corrective tests `V202-T57..T64` (`packages/domain/src/v2/identity.test.ts`), and recorded fixed JCS preimages in `packages/domain/src/v2/fixtures/identityVectors.ts`.

Historical V1 contracts, receipt hashing, and test suites remain 100% untouched and preserved.

---

## 2. Commit Anchor & Repository Metadata

1. **Repository Base SHA:** `17406f6034631d7f2cd988c5e0ec8e95d09a5121` (`main`)
2. **Implementation/Evidence Tree Anchor (Commit G SHA):** `53a6b0759e74dd59e2bb34eebe91c02de88e311f`
3. **Receipt Container (Commit H / PR Head SHA):** Materialized in Commit H.
4. **Target Branch:** `CCP-RI-V2-02-v2-canonicalization-identity`

---

## 3. Exact Files Modified & Added

### Commit C (Implementation & Evidence):

```text
packages/domain/src/v2/canonical.ts                (MODIFIED/NEW)
packages/domain/src/v2/temporal.ts                 (MODIFIED/NEW)
packages/domain/src/v2/graphCanonicalization.ts     (MODIFIED/NEW)
packages/domain/src/v2/identity.ts                 (MODIFIED/NEW)
packages/domain/src/v2/fixtures/identityVectors.ts (MODIFIED/NEW)
packages/domain/src/v2/identity.test.ts            (MODIFIED/NEW)
packages/domain/src/v2/index.ts                    (MODIFIED)
```

### Commit D (Receipt Container):

```text
DOCS/CAW/CCP/CCP-RI-V2-02-RECEIPT.md               (NEW)
```

---

## 4. Public V2 Identity Exports

Exported via `@zyppi/domain` (`packages/domain/src/v2/index.ts`):

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
  EVIDENCE_STATE: "zyppi:domain:evidence_state:v2:",
  POLICY_UNIVERSE: "zyppi:domain:policy_universe:v2:",
  INPUT: "zyppi:domain:input:v2:",
} as const;
```

### 5.2 Component Identity Projections (C05 Incidental Key Erasure)

1. **`SemanticStateRefV2` Projection:** `BoundConstitutionalStateV2` excluding `semanticStateRef`, `viewKey`, and `stateBindingKey`.
2. **`EvidenceStateRefV2` Projection:** `BoundEvidenceStateV2` excluding `evidenceStateRef`, `requirementKey`, `materialKey`, and `coordinateKey`.
3. **`PolicyUniverseRefV2` Projection:** `BoundPolicyUniverseV2` excluding `policyUniverseRef` and `policyKey`.

---

## 6. Independent Golden Identity Vectors & Preimages (C11)

Independent SHA-256 verification command:

```bash
python3 -c "import hashlib; print('sha256:' + hashlib.sha256(('domain_sep' + 'jcs_preimage').encode('utf-8')).hexdigest())"
```

### 6.1 Vector A (Minimal Same-Subject)

- **`constitutionalStateJcs`:**
  `{"stateViews":[{"stateBindings":[{"exactStateRef":{"artifactId":"instance-001","family":"STATE_INSTANCE","ownerRef":"urn:zyppi:owner:council:v1"},"kind":"IDENTITY_STATE","stateSemanticRef":{"artifactId":"identity-v1","family":"STATE_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"},"subjectRef":{"artifactId":"actor-001","family":"SUBJECT","ownerRef":"urn:zyppi:owner:council:v1"}}],"viewScope":{"artifactId":"global-v1","family":"SCOPE","ownerRef":"urn:zyppi:owner:council:v1"}}]}`,
- **`semanticStateRef`:** `sha256:946a1d1d35385c868648e1967ca70ea87ea1f254b517deb46a2ea6d5f6e7708d`
- **`evidenceStateRef`:** `sha256:93f27b9a5bf46d85dd8e98710398e85db24eb8efc0e43827ebf6c900f73e2dde`
- **`policyUniverseRef`:** `sha256:3e72c74c72b3cfd918eb167e12c8e5d2cad8644b808634e50293fc94bb3e9777`
- **`wholeRequestDigestCandidate`:** `sha256:0ca6861d1d3732b4fa67ce841a039cb73d09393ac932d14e546c4d3345ae0a98`

### 6.2 Vector B (Delegated / Graph-Rich)

- **`constitutionalStateJcs`:**
  `{"stateViews":[{"stateBindings":[{"exactStateRef":{"artifactId":"agreement-doc-001","family":"STATE_INSTANCE","ownerRef":"urn:zyppi:owner:council:v1"},"kind":"RELATIONSHIP_STATE","relationshipKind":"REIFIED","relationshipRef":{"artifactId":"agency-agreement-v1","family":"RELATIONSHIP","ownerRef":"urn:zyppi:owner:council:v1"}}],"viewScope":{"artifactId":"jurisdiction-eu-v1","family":"SCOPE","ownerRef":"urn:zyppi:owner:council:v1"}}]}`,
- **`semanticStateRef`:** `sha256:3436d1769040a9e5f586eb8e3a8617465cec90341d5a1e528587764b50163831`
- **`evidenceStateRef`:** `sha256:1b87097c8fed038164079c10193ec53d1ff554f856c67b831e11606272b8bc79`
- **`policyUniverseRef`:** `sha256:f3451cdd547b91e1245462add36c82eecc47ed41f64bc7f993ba892b6ca8e7a3`
- **`wholeRequestDigestCandidate`:** `sha256:e3894c50a34edd6ecb4548b5bf575597054fa694bf2d9f84cddb2f4236246cf5`

---

## 7. Mandatory Council Test Suite Matrix (V202-T01..T64)

Executed in `packages/domain/src/v2/identity.test.ts`:

| Test ID    | Description                                                                                     | Status   |
| :--------- | :---------------------------------------------------------------------------------------------- | :------- |
| `V202-T01` | ConstitutionalState identity stable under JSON property permutation                             | **PASS** |
| `V202-T02` | EvidenceState identity stable under JSON property permutation                                   | **PASS** |
| `V202-T03` | PolicyUniverse identity stable under JSON property permutation                                  | **PASS** |
| `V202-T04` | component self-ref excluded from component preimage                                             | **PASS** |
| `V202-T05` | changing non-self component material changes digest                                             | **PASS** |
| `V202-T06` | supplied wrong SemanticStateRef rejected                                                        | **PASS** |
| `V202-T07` | supplied wrong EvidenceStateRef rejected                                                        | **PASS** |
| `V202-T08` | supplied wrong PolicyUniverseRef rejected                                                       | **PASS** |
| `V202-T09` | V1 ACV digest cannot satisfy SemanticStateRef derivation                                        | **PASS** |
| `V202-T10` | V1 Evidence aggregate hash cannot satisfy EvidenceStateRef derivation                           | **PASS** |
| `V202-T11` | V1 input hash cannot satisfy V2 whole-request domain                                            | **PASS** |
| `V202-T12` | local role-binding label bijection preserves normalized identity                                | **PASS** |
| `V202-T13` | local Agency label bijection preserves normalized identity                                      | **PASS** |
| `V202-T14` | local performer label bijection preserves normalized identity                                   | **PASS** |
| `V202-T15` | local determination label bijection preserves normalized identity                               | **PASS** |
| `V202-T16` | same nodes with changed cross-binding topology changes identity                                 | **PASS** |
| `V202-T17` | UNKNOWN multiplicity preserved                                                                  | **PASS** |
| `V202-T18` | synthetic anonymous Subject not created                                                         | **PASS** |
| `V202-T19` | true set permutation preserves identity                                                         | **PASS** |
| `V202-T20` | opaque owner-native JSON array reorder changes identity                                         | **PASS** |
| `V202-T21` | Policy edge list permutation preserves identity                                                 | **PASS** |
| `V202-T22` | Policy edge direction reversal changes identity                                                 | **PASS** |
| `V202-T23` | duplicate semantic identity-bearing member rejected                                             | **PASS** |
| `V202-T24` | missing remains distinct from explicit empty where representable                                | **PASS** |
| `V202-T25` | AUTHORITATIVELY_NONE remains distinct from missing                                              | **PASS** |
| `V202-T26` | NO_DELEGATED_AGENCY_RELIANCE remains distinct from absent/malformed                             | **PASS** |
| `V202-T27` | requestId change changes whole-request digest candidate                                         | **PASS** |
| `V202-T28` | executionId change changes whole-request digest candidate                                       | **PASS** |
| `V202-T29` | contractVersion participates in whole-request identity                                          | **PASS** |
| `V202-T30` | component refs do not replace actual component material in root projection                      | **PASS** |
| `V202-T31` | equivalent timezone-offset spellings canonicalize identically                                   | **PASS** |
| `V202-T32` | temporal role substitution changes identity                                                     | **PASS** |
| `V202-T33` | >millisecond fractional precision preserved                                                     | **PASS** |
| `V202-T34` | no Unicode normalization                                                                        | **PASS** |
| `V202-T35` | lone high surrogate rejected                                                                    | **PASS** |
| `V202-T36` | lone low surrogate rejected                                                                     | **PASS** |
| `V202-T37` | valid surrogate pair accepted                                                                   | **PASS** |
| `V202-T38` | RFC8785 property-sort vector matches                                                            | **PASS** |
| `V202-T39` | RFC8785 primitive/sample vector matches                                                         | **PASS** |
| `V202-T40` | RFC8785 representative Appendix-B number vectors match                                          | **PASS** |
| `V202-T41` | -0 canonicalizes as 0                                                                           | **PASS** |
| `V202-T42` | NaN/Infinity never enter V2 identity                                                            | **PASS** |
| `V202-T43` | undefined never disappears via cleanForJcs                                                      | **PASS** |
| `V202-T44` | no localeCompare dependency in V2 production canonicalization                                   | **PASS** |
| `V202-T45` | no raw JSON.stringify used as canonical authority                                               | **PASS** |
| `V202-T46` | no V1 hash domain appears in V2 identity production code                                        | **PASS** |
| `V202-T47` | exact four V2 input identity domains present and no fifth core domain                           | **PASS** |
| `V202-T48` | repeated normalization/hash deterministic                                                       | **PASS** |
| `V202-T49` | input objects are not mutated                                                                   | **PASS** |
| `V202-T50` | domain package boundary remains clean                                                           | **PASS** |
| `V202-T51` | V1 golden hash/Receipt vectors unchanged                                                        | **PASS** |
| `V202-T52` | GS1/domain-specific semantics absent from V2 identity implementation                            | **PASS** |
| `V202-T53` | whole-request digest candidate is not represented as request field                              | **PASS** |
| `V202-T54` | no public API accepts caller boolean asserting coherence/admission                              | **PASS** |
| `V202-T55` | component mismatch cannot be repaired by fallback/current lookup                                | **PASS** |
| `V202-T56` | independent fixed golden vectors reproduce 3 component digests + root candidate                 | **PASS** |
| `V202-T57` | C09: Simultaneous relabeling across 8 referenced namespaces preserves normalized identity       | **PASS** |
| `V202-T58` | C09: Symmetric isomorphic graphs with reversed array order and renamed labels preserve identity | **PASS** |
| `V202-T59` | C09: Same symmetric material with one edge changed changes whole-request identity               | **PASS** |
| `V202-T60` | C07: Scoped local key reuse across different evaluation context collections does not collide    | **PASS** |
| `V202-T61` | C01: Strict Gregorian leap year and February 30 rejection                                       | **PASS** |
| `V202-T62` | C02: Lone Unicode surrogate pair in property key rejected                                       | **PASS** |
| `V202-T63` | C03: Array with symbol or non-canonical index property rejected with carrier safety error       | **PASS** |
| `V202-T64` | C04: Root derive function validates structural V2-01 errors to INVALID_IDENTITY_INPUT           | **PASS** |

---

## 8. Quality Gate Results

- `pnpm format:check` — **PASS**
- `pnpm lint` — **PASS**
- `pnpm exec tsc -b` — **PASS**
- `pnpm runtime:purity` — **PASS**
- `pnpm boundary:all` — **PASS**
- `pnpm graph:validate` — **PASS**
- `pnpm exec vitest run packages/domain/` — **PASS** (All 568 domain tests green)

---

## 9. Final Implementer Recommendation

```text
READY FOR COUNCIL RE-VERIFICATION
```

# CCP-RI-V2-02 Completion Receipt

## V2 Canonicalization, Component Identity & Whole-Request Digest Candidate

---

## 1. Executive Summary

This completion receipt materializes the execution proof for **CCP-RI-V2-02** ("V2 Canonicalization, Component Identity & Whole-Request Input Binding") and corrective mandates **CCP-RI-V2-02-CORR-01** through **CCP-RI-V2-02-CORR-07** inside `@zyppi/domain`.

The implementation establishes a generation-distinct, deterministic V2 identity layer:

- **C01 Strict Gregorian Temporal Validity:** Real calendar bounds (month/day/leap-year) validated before UTC shift; four-digit years preserved without JS `Date(0..99)` remapping bug (`packages/domain/src/v2/temporal.ts`).
- **C02 Unicode Object Key Validation:** Surrogate pair validation applied to every property key and string value (`packages/domain/src/v2/canonical.ts`).
- **C03 Strict Carrier Safety & Descriptor-Only Trusted Snapshotting (CORR-06-01..03 / CORR-07-01..03):** Refactored `buildTrustedInertSnapshot` to be purely descriptor/reflection-driven without property reads like `val.constructor` or `array[i]` before snapshotting. Public verify APIs (`verifySemanticStateRefV2`, `verifyEvidenceStateRefV2`, `verifyPolicyUniverseRefV2`) snapshot input components once at their entry boundary, operating strictly on trusted material to prevent re-entry into hostile caller objects/Proxies. Added stateful Proxy regression proofs `V202-T66` and `V202-T72..T75`.
- **C04 V2-01 Root Structural Boundary:** Invokes `validateExecutionRequestV2(req)` at the entrypoint of `deriveExecutionRequestV2DigestCandidate()` mapping structural defects to `INVALID_IDENTITY_INPUT` (`packages/domain/src/v2/identity.ts`).
- **C05 Incidental Key Erasure:** Unreferenced local keys (`viewKey`, `stateBindingKey`, `requirementKey`, `materialKey`, `coordinateKey`, `policyKey`, `operandKey`) are omitted from normalized component projections.
- **C06 Semantic Duplicates After Key Erasure:** Identity-bearing members that become identical after key erasure return `SEMANTIC_DUPLICATE` (`packages/domain/src/v2/graphCanonicalization.ts`).
- **C07 Local Namespace Scoping:** Evaluation context binding namespaces are strictly separated by collection (`AUTHORIZED_INPUT`, `EVALUATION_PARAMETER`, `BOUND_CONTEXT`).
- **C08 Exact Search-State Equivalence & Order-Independent Refinement (CORR-07-01..08):** Unsafe memoization/pruning (`memoMap` based on collapsed `__UNRESOLVED__` search-state keys) was completely removed to prevent incorrect state collapsing across distinct individualization paths. The graph canonicalization algorithm partitions remaining labels into equivalence buckets using 1-refinement target signatures (`__0_TARGET__` vs `__1_OTHER__`), explores branches MSB-first, and selects the lexicographically least JCS canonical representation (`bestResultJcs`) among candidate terminals without heuristic or lossy pruning.
- **C09 Fail-Closed Dangling Reference Handling (CORR-07-07..08):** Namespace extraction failures from `extractAndValidateNamespaceKeys` propagate directly as `GRAPH_CANONICALIZATION_FAILURE` instead of converting to empty namespaces. Verified across tests `V202-T81..T85`.
- **C10 Shared Internal Production Root-Normalization Path (CORR-07-12..13):** Factored production root normalization into `normalizeExecutionRequestV2IdentityMaterial` in `identity.ts`, ensuring tests observe the exact same production normalization path used by `deriveExecutionRequestV2DigestCandidate`.
- **C11 Historical V1 Golden Preservation & Root Material Proofs (CORR-07-09..17):**
  - **T09:** Executed `deriveActiveConstitutionalViewStateDigest` from `acvState.ts` on actual authoritative V1 ACV fixture (`VALID_V1_REQUEST_INPUT`), asserting exact match to `sha256:a8ba7d413099aee9161a5c37983ec6bd961b15700e7f58c43b06353b469cbb69` and generation distinction from V2 `SemanticStateRef`.
  - **T10:** Executed `generateReceiptHashes` from `receiptHash.ts` on actual authoritative V1 fixture (`VALID_V1_REQUEST_INPUT`), asserting exact match to `sha256:2a7cc6ce4aad15c5459f3040c4555acc37ebb84d18ac6c2ae17b9354ffd125f2` and distinction from V2 `EvidenceStateRef`.
  - **T11:** Executed `generateReceiptHashes` to verify V1 `inputHash` `sha256:207d860052d8c4ec4adec4c17718df04877a4ce5f29bc70b32ecb4c7442d336c` and distinction from V2 whole-request digest candidate.
  - **T18:** Verified `UNKNOWN` subject representation in production normalized root without `subjectRef` or synthetic anonymous Subject creation.
  - **T29/T30:** Verified `\"contractVersion\":\"v2\"` in production root JCS, non-v2 structural rejection, exact `zyppi:domain:input:v2:` prefix, and physical presence of both component refs and material in root projection matching `VECTOR_A_CANONICAL_PREIMAGES.wholeRequestJcs`.
  - **T51:** Executed `generateReceiptHashes()` with authoritative V1 request fixture (`VALID_V1_REQUEST_INPUT`), verifying exact match to `sha256:207d860052d8c4ec4adec4c17718df04877a4ce5f29bc70b32ecb4c7442d336c`.
  - **T56 & T71:** Verified production JCS normalization path reproduces all 8 fixed preimages and expected digests for Vector A and B, confirmed by independent Python `hashlib.sha256` execution.

Historical V1 contracts, receipt hashing, and test suites remain 100% untouched and preserved.

---

## 2. Repository Provenance

- **Original Mandated Base:** `17406f6034631d7f2cd988c5e0ec8e95d09a5121`
- **CORR-07 Starting GitHub Head:** `ecaa20fe3fba5784a51897989263e3a5ec385767`
- **Authoritative Submitted Implementation Tree:** TO BE VERIFIED EXTERNALLY BY COUNCIL FROM GITHUB
- **Authoritative Final PR Head:** TO BE VERIFIED EXTERNALLY BY COUNCIL FROM GITHUB
- **Receipt Container SHA:** NOT SELF-EMBEDDED; VERIFIED EXTERNALLY BY COUNCIL

---

## 3. Exact Files Modified & Added

```text
packages/domain/src/v2/canonical.ts                (MODIFIED)
packages/domain/src/v2/temporal.ts                 (MODIFIED)
packages/domain/src/v2/graphCanonicalization.ts     (MODIFIED)
packages/domain/src/v2/identity.ts                 (MODIFIED)
packages/domain/src/v2/fixtures/identityVectors.ts (MODIFIED)
packages/domain/src/v2/identity.test.ts            (MODIFIED)
packages/domain/src/v2/index.ts                    (MODIFIED)
DOCS/CAW/CCP/CCP-RI-V2-02-RECEIPT.md               (MODIFIED)
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

Internal test/diagnostic helpers (`graphSearchDiagnostics`, `resetGraphSearchDiagnostics`, `normalizeExecutionRequestV2IdentityMaterial`, `canonicalizeReferencedNamespace`) are strictly unexported from `packages/domain/src/v2/index.ts`.

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

## 6. Independent Golden Identity Vectors & Preimages (C11 / CORR-07-19)

Reproducible independent Python SHA-256 verification command (Option A - self-contained script):

```python
import hashlib, json

vectors = [
    ("Vector A Constitutional", "zyppi:domain:constitutional_state:v2:", '{"stateViews":[{"stateBindings":[{"exactStateRef":{"artifactId":"instance-001","family":"STATE_INSTANCE","ownerRef":"urn:zyppi:owner:council:v1"},"kind":"IDENTITY_STATE","stateSemanticRef":{"artifactId":"identity-v1","family":"STATE_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"},"subjectRef":{"artifactId":"actor-001","family":"SUBJECT","ownerRef":"urn:zyppi:owner:council:v1"}}],"viewScope":{"artifactId":"global-v1","family":"SCOPE","ownerRef":"urn:zyppi:owner:council:v1"}}]}', "sha256:946a1d1d35385c868648e1967ca70ea87ea1f254b517deb46a2ea6d5f6e7708d"),
    ("Vector A Evidence", "zyppi:domain:evidence_state:v2:", '{"evidencePresentationBindings":[],"evidenceRequirementBindings":[],"integrityCoordinates":[],"suppliedEvidenceMaterial":[]}', "sha256:93f27b9a5bf46d85dd8e98710398e85db24eb8efc0e43827ebf6c900f73e2dde"),
    ("Vector A Policy", "zyppi:domain:policy_universe:v2:", '{"applicabilityProvenanceBinding":{"artifactId":"prov-001","family":"PROVENANCE","ownerRef":"urn:zyppi:owner:council:v1"},"applicablePolicyMaterial":[],"dependencyTopology":{"dependencyEdges":[]}}', "sha256:3e72c74c72b3cfd918eb167e12c8e5d2cad8644b808634e50293fc94bb3e9777"),
    ("Vector A Root Candidate", "zyppi:domain:input:v2:", '{"constitutionalState":{"semanticStateRef":"sha256:946a1d1d35385c868648e1967ca70ea87ea1f254b517deb46a2ea6d5f6e7708d","stateViews":[{"stateBindings":[{"exactStateRef":{"artifactId":"instance-001","family":"STATE_INSTANCE","ownerRef":"urn:zyppi:owner:council:v1"},"kind":"IDENTITY_STATE","stateSemanticRef":{"artifactId":"identity-v1","family":"STATE_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"},"subjectRef":{"artifactId":"actor-001","family":"SUBJECT","ownerRef":"urn:zyppi:owner:council:v1"}}],"viewScope":{"artifactId":"global-v1","family":"SCOPE","ownerRef":"urn:zyppi:owner:council:v1"}}]},"contractVersion":"v2","evaluationContext":{"authorizedInputBindings":[],"boundContextBindings":[],"evaluationParameterBindings":[],"ownerDeterminationBindings":[]},"evidenceState":{"evidencePresentationBindings":[],"evidenceRequirementBindings":[],"evidenceStateRef":"sha256:93f27b9a5bf46d85dd8e98710398e85db24eb8efc0e43827ebf6c900f73e2dde","integrityCoordinates":[],"suppliedEvidenceMaterial":[]},"executionContext":{"budget":1000,"executionId":"exec-v2-vector-a-001","temporalCoordinates":{"tEInput":"2026-08-24T17:00:00Z"}},"intent":{"candidateStateBinding":{"exactStateInstance":{"kind":"GOVERNED_ARTIFACT_REF","stateInstanceRef":{"artifactId":"instance-001","family":"STATE_INSTANCE","ownerRef":"urn:zyppi:owner:council:v1"}},"stateSemanticRef":{"artifactId":"discovery-v1","family":"STATE_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"},"stateTargetRef":{"artifactId":"asset-001","family":"TARGET","ownerRef":"urn:zyppi:owner:council:v1"}},"intentCategory":"DISCOVER","intentTargetRef":{"artifactId":"asset-001","family":"TARGET","ownerRef":"urn:zyppi:owner:council:v1"},"originatorParticipationRef":"ROLE_BINDING#0"},"participation":{"agencyBindings":[],"roleBindings":[{"role":"ACTOR","roleBindingKey":"ROLE_BINDING#0","subject":{"kind":"KNOWN","subjectRef":{"artifactId":"actor-001","family":"SUBJECT","ownerRef":"urn:zyppi:owner:council:v1"}}}]},"policyUniverse":{"applicabilityProvenanceBinding":{"artifactId":"prov-001","family":"PROVENANCE","ownerRef":"urn:zyppi:owner:council:v1"},"applicablePolicyMaterial":[],"dependencyTopology":{"dependencyEdges":[]},"policyUniverseRef":"sha256:3e72c74c72b3cfd918eb167e12c8e5d2cad8644b808634e50293fc94bb3e9777"},"requestId":"req-v2-vector-a-001","requestedAction":{"actionPerformerBindings":[{"actorParticipationRef":"ROLE_BINDING#0","agencyReliance":{"kind":"NO_DELEGATED_AGENCY_RELIANCE"},"performerKey":"PERFORMER#0"}],"actionSemanticRef":{"artifactId":"read-trade-item-v1","family":"ACTION_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"},"actionTargetBindings":[{"targetRef":{"artifactId":"asset-001","family":"TARGET","ownerRef":"urn:zyppi:owner:council:v1"},"targetSlotSemanticRef":{"artifactId":"primary-target-v1","family":"TARGET_SLOT_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"}}],"intentActionCompatibilityBinding":{"exactCompatibilityContractRef":{"artifactId":"compat-contract-001","family":"COMPATIBILITY_CONTRACT","ownerRef":"urn:zyppi:owner:council:v1"},"kind":"GOVERNED_SEMANTIC_CONTRACT"},"requestedCapabilityClaimBindings":[]}}', "sha256:0ca6861d1d3732b4fa67ce841a039cb73d09393ac932d14e546c4d3345ae0a98"),
    ("Vector B Constitutional", "zyppi:domain:constitutional_state:v2:", '{"stateViews":[{"stateBindings":[{"exactStateRef":{"artifactId":"agreement-doc-001","family":"STATE_INSTANCE","ownerRef":"urn:zyppi:owner:council:v1"},"kind":"RELATIONSHIP_STATE","relationshipKind":"REIFIED","relationshipRef":{"artifactId":"agency-agreement-v1","family":"RELATIONSHIP","ownerRef":"urn:zyppi:owner:council:v1"}}],"viewScope":{"artifactId":"jurisdiction-eu-v1","family":"SCOPE","ownerRef":"urn:zyppi:owner:council:v1"}}]}', "sha256:3436d1769040a9e5f586eb8e3a8617465cec90341d5a1e528587764b50163831"),
    ("Vector B Evidence", "zyppi:domain:evidence_state:v2:", '{"evidencePresentationBindings":[{"evidenceRequirementRef":{"artifactId":"signature-v1","family":"EVIDENCE_REQUIREMENT","ownerRef":"urn:zyppi:owner:council:v1"},"presentedEvidenceRefs":[{"artifactId":"sig-payload-001","family":"EVIDENCE","ownerRef":"urn:zyppi:owner:cert-auth:v1"}]}],"evidenceRequirementBindings":[{"governedRequirementRef":{"artifactId":"signature-v1","family":"EVIDENCE_REQUIREMENT","ownerRef":"urn:zyppi:owner:council:v1"},"requirementAuthorityBinding":{"artifactId":"cert-auth-001","family":"OWNER","ownerRef":"urn:zyppi:owner:cert-auth:v1"},"requirementScopeBinding":{"artifactId":"jurisdiction-eu-v1","family":"SCOPE","ownerRef":"urn:zyppi:owner:council:v1"}}],"integrityCoordinates":[{"algorithm":"SHA-256","evidenceRef":{"artifactId":"sig-payload-001","family":"EVIDENCE","ownerRef":"urn:zyppi:owner:cert-auth:v1"},"expectedDigest":"sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}],"suppliedEvidenceMaterial":[{"evidenceRef":{"artifactId":"sig-payload-001","family":"EVIDENCE","ownerRef":"urn:zyppi:owner:cert-auth:v1"},"material":{"sig":"0xABCDEF"},"ownerRef":{"artifactId":"cert-auth-001","family":"OWNER","ownerRef":"urn:zyppi:owner:cert-auth:v1"},"schemaRef":{"artifactId":"pki-sig-v1","family":"STATE_ARTIFACT","ownerRef":"urn:zyppi:owner:council:v1"}}]}', "sha256:1b87097c8fed038164079c10193ec53d1ff554f856c67b831e11606272b8bc79"),
    ("Vector B Policy", "zyppi:domain:policy_universe:v2:", '{"applicabilityProvenanceBinding":{"artifactId":"prov-002","family":"PROVENANCE","ownerRef":"urn:zyppi:owner:council:v1"},"applicablePolicyMaterial":[{"material":{"rule":"allow_if_authorized"},"policyRef":{"artifactId":"base-transfer-v1","family":"POLICY","ownerRef":"urn:zyppi:owner:council:v1","provenanceRef":"prov-pol-001","stateRef":"state-base-001","version":"1.0.0"}},{"material":{"rule":"require_pki_signature"},"policyRef":{"artifactId":"eu-transfer-rules-v1","family":"POLICY","ownerRef":"urn:zyppi:owner:council:v1","provenanceRef":"prov-pol-002","stateRef":"state-eu-001","version":"1.0.0"}}],"dependencyTopology":{"dependencyEdges":[{"dependeePolicyRef":{"artifactId":"base-transfer-v1","family":"POLICY","ownerRef":"urn:zyppi:owner:council:v1","provenanceRef":"prov-pol-001","stateRef":"state-base-001","version":"1.0.0"},"dependentPolicyRef":{"artifactId":"eu-transfer-rules-v1","family":"POLICY","ownerRef":"urn:zyppi:owner:council:v1","provenanceRef":"prov-pol-002","stateRef":"state-eu-001","version":"1.0.0"}}]}}', "sha256:f3451cdd547b91e1245462add36c82eecc47ed41f64bc7f993ba892b6ca8e7a3"),
    ("Vector B Root Candidate", "zyppi:domain:input:v2:", '{"constitutionalState":{"semanticStateRef":"sha256:3436d1769040a9e5f586eb8e3a8617465cec90341d5a1e528587764b50163831","stateViews":[{"stateBindings":[{"exactStateRef":{"artifactId":"agreement-doc-001","family":"STATE_INSTANCE","ownerRef":"urn:zyppi:owner:council:v1"},"kind":"RELATIONSHIP_STATE","relationshipKind":"REIFIED","relationshipRef":{"artifactId":"agency-agreement-v1","family":"RELATIONSHIP","ownerRef":"urn:zyppi:owner:council:v1"}}],"viewScope":{"artifactId":"jurisdiction-eu-v1","family":"SCOPE","ownerRef":"urn:zyppi:owner:council:v1"}}]},"contractVersion":"v2","evaluationContext":{"authorizedInputBindings":[{"semanticRef":{"artifactId":"auth-token-v1","family":"EVALUATION_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"},"value":"TOKEN-9988-SECURE"}],"boundContextBindings":[],"evaluationParameterBindings":[],"ownerDeterminationBindings":[{"assessedAtCoordinateRef":"tValid","constitutionalOwnerRef":{"artifactId":"council","family":"OWNER","ownerRef":"urn:zyppi:owner:council:v1"},"determinationBindingKey":"OWNER_DETERMINATION#0","determinationDependencyDeclaration":{"kind":"AUTHORITATIVELY_NONE"},"determinationQuestionBinding":{"questionOperandBindings":[{"operandKind":"PARTICIPATION_BINDING","operandSlotSemanticRef":{"artifactId":"slot1-v1","family":"EVALUATION_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"},"roleBindingRef":"ROLE_BINDING#1"}],"questionSemanticRef":{"artifactId":"compat-check-v1","family":"QUESTION_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"}},"exactRuleRef":{"artifactId":"rule-check-001","family":"RULE","ownerRef":"urn:zyppi:owner:council:v1"},"exactStateRef":{"artifactId":"state-check-001","family":"STATE_INSTANCE","ownerRef":"urn:zyppi:owner:council:v1"},"ownerNativeResult":{"outcome":"COMPATIBLE"},"provenanceRef":{"artifactId":"prov-001","family":"PROVENANCE","ownerRef":"urn:zyppi:owner:council:v1"}}]},"evidenceState":{"evidencePresentationBindings":[{"evidenceRequirementRef":{"artifactId":"signature-v1","family":"EVIDENCE_REQUIREMENT","ownerRef":"urn:zyppi:owner:council:v1"},"presentedEvidenceRefs":[{"artifactId":"sig-payload-001","family":"EVIDENCE","ownerRef":"urn:zyppi:owner:cert-auth:v1"}]}],"evidenceRequirementBindings":[{"governedRequirementRef":{"artifactId":"signature-v1","family":"EVIDENCE_REQUIREMENT","ownerRef":"urn:zyppi:owner:council:v1"},"requirementAuthorityBinding":{"artifactId":"cert-auth-001","family":"OWNER","ownerRef":"urn:zyppi:owner:cert-auth:v1"},"requirementScopeBinding":{"artifactId":"jurisdiction-eu-v1","family":"SCOPE","ownerRef":"urn:zyppi:owner:council:v1"}}],"evidenceStateRef":"sha256:1b87097c8fed038164079c10193ec53d1ff554f856c67b831e11606272b8bc79","integrityCoordinates":[{"algorithm":"SHA-256","evidenceRef":{"artifactId":"sig-payload-001","family":"EVIDENCE","ownerRef":"urn:zyppi:owner:cert-auth:v1"},"expectedDigest":"sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}],"suppliedEvidenceMaterial":[{"evidenceRef":{"artifactId":"sig-payload-001","family":"EVIDENCE","ownerRef":"urn:zyppi:owner:cert-auth:v1"},"material":{"sig":"0xABCDEF"},"ownerRef":{"artifactId":"cert-auth-001","family":"OWNER","ownerRef":"urn:zyppi:owner:cert-auth:v1"},"schemaRef":{"artifactId":"pki-sig-v1","family":"STATE_ARTIFACT","ownerRef":"urn:zyppi:owner:council:v1"}}]},"executionContext":{"budget":5000,"entropy":"0xdeadbeef","executionId":"exec-v2-vector-b-002","temporalCoordinates":{"tEInput":"2026-08-24T17:00:00Z","tTrust":"2026-08-24T17:00:00Z","tValid":"2026-08-24T17:00:00.12Z"}},"intent":{"candidateStateBinding":{"exactStateInstance":{"kind":"OWNER_TYPED_INLINE","material":{"amount":50,"details":{"note":"Delegated transfer request"},"token":"TK-9981-Ã"},"ownerRef":{"artifactId":"council","family":"OWNER","ownerRef":"urn:zyppi:owner:council:v1"},"schemaRef":{"artifactId":"transfer-manifest-v1","family":"STATE_ARTIFACT","ownerRef":"urn:zyppi:owner:council:v1"}},"stateSemanticRef":{"artifactId":"ownership-v1","family":"STATE_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"},"stateTargetRef":{"artifactId":"asset-002","family":"TARGET","ownerRef":"urn:zyppi:owner:council:v1"}},"intentCategory":"TRANSFER","intentTargetRef":{"artifactId":"asset-002","family":"TARGET","ownerRef":"urn:zyppi:owner:council:v1"},"originatorParticipationRef":"ROLE_BINDING#1"},"participation":{"agencyBindings":[{"actorRoleBindingRef":"ROLE_BINDING#0","agencyBindingKey":"AGENCY_BINDING#0","governedSubjectRoleBindingRef":"ROLE_BINDING#1","terminalAgencyBasisRef":{"artifactId":"power-of-attorney-v1","family":"AGENCY_BASIS","ownerRef":"urn:zyppi:owner:council:v1"}}],"roleBindings":[{"role":"ACTOR","roleBindingKey":"ROLE_BINDING#0","subject":{"kind":"KNOWN","subjectRef":{"artifactId":"agent-002","family":"SUBJECT","ownerRef":"urn:zyppi:owner:council:v1"}}},{"role":"GOVERNED_SUBJECT","roleBindingKey":"ROLE_BINDING#1","subject":{"kind":"KNOWN","subjectRef":{"artifactId":"principal-001","family":"SUBJECT","ownerRef":"urn:zyppi:owner:council:v1"}}}]},"policyUniverse":{"applicabilityProvenanceBinding":{"artifactId":"prov-002","family":"PROVENANCE","ownerRef":"urn:zyppi:owner:council:v1"},"applicablePolicyMaterial":[{"material":{"rule":"allow_if_authorized"},"policyRef":{"artifactId":"base-transfer-v1","family":"POLICY","ownerRef":"urn:zyppi:owner:council:v1","provenanceRef":"prov-pol-001","stateRef":"state-base-001","version":"1.0.0"}},{"material":{"rule":"require_pki_signature"},"policyRef":{"artifactId":"eu-transfer-rules-v1","family":"POLICY","ownerRef":"urn:zyppi:owner:council:v1","provenanceRef":"prov-pol-002","stateRef":"state-eu-001","version":"1.0.0"}}],"dependencyTopology":{"dependencyEdges":[{"dependeePolicyRef":{"artifactId":"base-transfer-v1","family":"POLICY","ownerRef":"urn:zyppi:owner:council:v1","provenanceRef":"prov-pol-001","stateRef":"state-base-001","version":"1.0.0"},"dependentPolicyRef":{"artifactId":"eu-transfer-rules-v1","family":"POLICY","ownerRef":"urn:zyppi:owner:council:v1","provenanceRef":"prov-pol-002","stateRef":"state-eu-001","version":"1.0.0"}}]},"policyUniverseRef":"sha256:f3451cdd547b91e1245462add36c82eecc47ed41f64bc7f993ba892b6ca8e7a3"},"requestId":"req-v2-vector-b-002","requestedAction":{"actionPerformerBindings":[{"actorParticipationRef":"ROLE_BINDING#0","agencyReliance":{"agencyBindingRef":"AGENCY_BINDING#0","kind":"DELEGATED_AGENCY_SINGLE"},"performerKey":"PERFORMER#0"}],"actionSemanticRef":{"artifactId":"transfer-asset-v1","family":"ACTION_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"},"actionTargetBindings":[{"targetRef":{"artifactId":"asset-002","family":"TARGET","ownerRef":"urn:zyppi:owner:council:v1"},"targetSlotSemanticRef":{"artifactId":"transfer-target-v1","family":"TARGET_SLOT_SEMANTIC","ownerRef":"urn:zyppi:owner:council:v1"}}],"intentActionCompatibilityBinding":{"kind":"OWNER_DETERMINATION","ownerDeterminationBindingRef":"OWNER_DETERMINATION#0"},"requestedCapabilityClaimBindings":[{"capabilityClaimKey":"CAPABILITY_CLAIM#0","claimantPerformerRefs":["PERFORMER#0"],"requestedCapabilityRef":{"artifactId":"asset-transfer-v1","family":"REQUESTED_CAPABILITY","ownerRef":"urn:zyppi:owner:council:v1"}}]}}', "sha256:e3894c50a34edd6ecb4548b5bf575597054fa694bf2d9f84cddb2f4236246cf5"),
]

for label, sep, jcs, expected in vectors:
    digest = "sha256:" + hashlib.sha256((sep + jcs).encode("utf-8")).hexdigest()
    assert digest == expected, f"Mismatch on {label}: got {digest}, expected {expected}"
    print(f"{label}: {digest} MATCH")
```

### Verification Output:

```text
Vector A Constitutional: sha256:946a1d1d35385c868648e1967ca70ea87ea1f254b517deb46a2ea6d5f6e7708d MATCH
Vector A Evidence:       sha256:93f27b9a5bf46d85dd8e98710398e85db24eb8efc0e43827ebf6c900f73e2dde MATCH
Vector A Policy:         sha256:3e72c74c72b3cfd918eb167e12c8e5d2cad8644b808634e50293fc94bb3e9777 MATCH
Vector A Root Candidate: sha256:0ca6861d1d3732b4fa67ce841a039cb73d09393ac932d14e546c4d3345ae0a98 MATCH
Vector B Constitutional: sha256:3436d1769040a9e5f586eb8e3a8617465cec90341d5a1e528587764b50163831 MATCH
Vector B Evidence:       sha256:1b87097c8fed038164079c10193ec53d1ff554f856c67b831e11606272b8bc79 MATCH
Vector B Policy:         sha256:f3451cdd547b91e1245462add36c82eecc47ed41f64bc7f993ba892b6ca8e7a3 MATCH
Vector B Root Candidate: sha256:e3894c50a34edd6ecb4548b5bf575597054fa694bf2d9f84cddb2f4236246cf5 MATCH
```

---

## 7. Mandatory Council Test Suite Matrix (V202-T01..T71)

Executed in `packages/domain/src/v2/identity.test.ts`:

| Test ID    | Description                                                                                                 | Status   |
| :--------- | :---------------------------------------------------------------------------------------------------------- | :------- |
| `V202-T01` | ConstitutionalState identity stable under JSON property permutation                                         | **PASS** |
| `V202-T02` | EvidenceState identity stable under JSON property permutation                                               | **PASS** |
| `V202-T03` | PolicyUniverse identity stable under JSON property permutation                                              | **PASS** |
| `V202-T04` | component self-ref excluded from component preimage                                                         | **PASS** |
| `V202-T05` | changing non-self component material changes digest                                                         | **PASS** |
| `V202-T06` | supplied wrong SemanticStateRef rejected                                                                    | **PASS** |
| `V202-T07` | supplied wrong EvidenceStateRef rejected                                                                    | **PASS** |
| `V202-T08` | supplied wrong PolicyUniverseRef rejected                                                                   | **PASS** |
| `V202-T09` | V1 ACV digest cannot satisfy SemanticStateRef derivation                                                    | **PASS** |
| `V202-T10` | V1 Evidence aggregate hash cannot satisfy EvidenceStateRef derivation                                       | **PASS** |
| `V202-T11` | V1 input hash cannot satisfy V2 whole-request domain                                                        | **PASS** |
| `V202-T12` | local role-binding label bijection preserves normalized identity                                            | **PASS** |
| `V202-T13` | local Agency label bijection preserves normalized identity                                                  | **PASS** |
| `V202-T14` | local performer label bijection preserves normalized identity                                               | **PASS** |
| `V202-T15` | local determination label bijection preserves normalized identity                                           | **PASS** |
| `V202-T16` | same nodes with changed cross-binding topology changes identity                                             | **PASS** |
| `V202-T17` | UNKNOWN multiplicity preserved                                                                              | **PASS** |
| `V202-T18` | synthetic anonymous Subject not created                                                                     | **PASS** |
| `V202-T19` | true set permutation preserves identity                                                                     | **PASS** |
| `V202-T20` | opaque owner-native JSON array reorder changes identity                                                     | **PASS** |
| `V202-T21` | Policy edge list permutation preserves identity                                                             | **PASS** |
| `V202-T22` | Policy edge direction reversal changes identity                                                             | **PASS** |
| `V202-T23` | duplicate semantic identity-bearing member rejected                                                         | **PASS** |
| `V202-T24` | missing remains distinct from explicit empty where representable                                            | **PASS** |
| `V202-T25` | AUTHORITATIVELY_NONE remains distinct from missing                                                          | **PASS** |
| `V202-T26` | NO_DELEGATED_AGENCY_RELIANCE remains distinct from absent/malformed                                         | **PASS** |
| `V202-T27` | requestId change changes whole-request digest candidate                                                     | **PASS** |
| `V202-T28` | executionId change changes whole-request digest candidate                                                   | **PASS** |
| `V202-T29` | contractVersion participates in whole-request identity                                                      | **PASS** |
| `V202-T30` | component refs do not replace actual component material in root projection                                  | **PASS** |
| `V202-T31` | equivalent timezone-offset spellings canonicalize identically                                               | **PASS** |
| `V202-T32` | temporal role substitution changes identity                                                                 | **PASS** |
| `V202-T33` | >millisecond fractional precision preserved                                                                 | **PASS** |
| `V202-T34` | no Unicode normalization                                                                                    | **PASS** |
| `V202-T35` | lone high surrogate rejected                                                                                | **PASS** |
| `V202-T36` | lone low surrogate rejected                                                                                 | **PASS** |
| `V202-T37` | valid surrogate pair accepted                                                                               | **PASS** |
| `V202-T38` | RFC8785 property-sort vector matches                                                                        | **PASS** |
| `V202-T39` | RFC8785 primitive/sample vector matches                                                                     | **PASS** |
| `V202-T40` | RFC8785 representative Appendix-B number vectors match                                                      | **PASS** |
| `V202-T41` | -0 canonicalizes as 0                                                                                       | **PASS** |
| `V202-T42` | NaN/Infinity never enter V2 identity                                                                        | **PASS** |
| `V202-T43` | undefined never disappears via cleanForJcs                                                                  | **PASS** |
| `V202-T44` | no localeCompare dependency in V2 production canonicalization                                               | **PASS** |
| `V202-T45` | no raw JSON.stringify used as canonical authority                                                           | **PASS** |
| `V202-T46` | no V1 hash domain appears in V2 identity production code                                                    | **PASS** |
| `V202-T47` | exact four V2 input identity domains present and no fifth core domain                                       | **PASS** |
| `V202-T48` | repeated normalization/hash deterministic                                                                   | **PASS** |
| `V202-T49` | input objects are not mutated                                                                               | **PASS** |
| `V202-T50` | domain package boundary remains clean                                                                       | **PASS** |
| `V202-T51` | V1 golden hash/Receipt vectors unchanged                                                                    | **PASS** |
| `V202-T52` | GS1/domain-specific semantics absent from V2 identity implementation                                        | **PASS** |
| `V202-T53` | whole-request digest candidate is not represented as request field                                          | **PASS** |
| `V202-T54` | no public API accepts caller boolean asserting coherence/admission                                          | **PASS** |
| `V202-T55` | component mismatch cannot be repaired by fallback/current lookup                                            | **PASS** |
| `V202-T56` | independent fixed golden vectors reproduce 3 component digests + root candidate                             | **PASS** |
| `V202-T57` | C09: Simultaneous relabeling across 8 referenced namespaces preserves normalized identity                   | **PASS** |
| `V202-T58` | C09: Symmetric isomorphic graphs with reversed array order and renamed labels preserve identity             | **PASS** |
| `V202-T59` | C09: Same symmetric material with one edge changed changes whole-request identity                           | **PASS** |
| `V202-T60` | C07: Scoped local key reuse across different evaluation context collections does not collide                | **PASS** |
| `V202-T61` | C01: Strict Gregorian leap year and February 30 rejection                                                   | **PASS** |
| `V202-T62` | C02: Lone Unicode surrogate pair in property key rejected                                                   | **PASS** |
| `V202-T63` | C03: Array with symbol or non-canonical index property rejected with carrier safety error                   | **PASS** |
| `V202-T64` | C04: Root derive function validates structural V2-01 errors to INVALID_IDENTITY_INPUT                       | **PASS** |
| `V202-T65` | C03-06: Comprehensive Temporal Calendar & High-Precision Offset Matrix                                      | **PASS** |
| `V202-T66` | C05-02: Stateful Proxy Regression Proof & Zero Post-Snapshot Access                                         | **PASS** |
| `V202-T67` | C03-03: Non-Factorial Graph Search Resource Instrumentation Proof on Genuine Symmetric 8-Cycle Fixture      | **PASS** |
| `V202-T68` | C03-04: Owner Determination Semantic Duplicate Rejection Without Key Interference                           | **PASS** |
| `V202-T69` | Scope 6: Coupled Multi-Namespace Relabeling Invariance                                                      | **PASS** |
| `V202-T70` | Scope 6: Genuine Symmetric Graph Isomorphism & Edge Mutation Sensitivity                                    | **PASS** |
| `V202-T71` | Scope 7: Independent Golden Verification of All 8 Canonical Preimages & Digests                             | **PASS** |
| `V202-T72` | descriptor-only snapshot: hostile ordinary get trap executes zero times                                     | **PASS** |
| `V202-T73` | verifySemanticStateRefV2: same-invocation zero original-carrier get access                                  | **PASS** |
| `V202-T74` | verifyEvidenceStateRefV2: same-invocation zero original-carrier get access                                  | **PASS** |
| `V202-T75` | verifyPolicyUniverseRefV2: same-invocation zero original-carrier get access                                 | **PASS** |
| `V202-T76` | genuine symmetric 8-node Graph A/B: full relabel + transport-order permutation canonical(A) == canonical(B) | **PASS** |
| `V202-T77` | genuine symmetric 8-node Graph C: one topology mutation canonical(C) != canonical(A)                        | **PASS** |
| `V202-T78` | genuine symmetric graph resource proof: visitedStates < 1,000, evaluatedTerminals << 40,320, pruneHits >= 0 | **PASS** |
| `V202-T79` | graph diagnostics and test helpers absent from public v2/index.ts                                           | **PASS** |
| `V202-T80` | all 8 production-generated V2 JCS preimages exactly equal fixed golden preimages                            | **PASS** |
| `V202-T81` | dangling ROLE_BINDING fails closed                                                                          | **PASS** |
| `V202-T82` | dangling AGENCY_BINDING fails closed                                                                        | **PASS** |
| `V202-T83` | dangling PERFORMER / CAPABILITY reference fails closed                                                      | **PASS** |
| `V202-T84` | dangling OWNER_DETERMINATION fails closed                                                                   | **PASS** |
| `V202-T85` | dangling evaluation-context binding reference fails closed                                                  | **PASS** |

---

## 8. Quality Gate Results

- `pnpm format:check` — **PASS**
- `pnpm lint` — **PASS**
- `pnpm exec tsc -b` — **PASS**
- `pnpm runtime:purity` — **PASS**
- `pnpm boundary:all` — **PASS**
- `pnpm graph:validate` — **PASS**
- `pnpm exec vitest run packages/domain/` — **PASS** (All 589 domain unit tests green across 20 test files, including 85 V2 identity tests)

---

## 9. Protected Boundaries & Negative Source Audits

- `packages/domain/src/acvState.ts` — **UNTOUCHED**
- `packages/domain/src/acvState.test.ts` — **UNTOUCHED**
- `packages/domain/src/receiptHash.ts` — **UNTOUCHED**
- `packages/domain/src/seed-helpers.ts` — **UNTOUCHED**
- `packages/testing/replay/receipts/latest.json` — **UNTOUCHED**
- `packages/runtime/**`, `apps/**`, `infra/**`, `packages/contracts/**` — **UNTOUCHED**

Negative source audit confirms zero production imports of `localeCompare`, `Intl.Collator`, `Date.now()`, `Math.random()`, `GS1`, `GTIN`, `cleanForJcs()`, or V1 domain prefixes in V2 identity production code.

---

## 10. Final Implementer Recommendation

```text
FINAL IMPLEMENTER RECOMMENDATION:
  READY FOR COUNCIL RE-VERIFICATION
```

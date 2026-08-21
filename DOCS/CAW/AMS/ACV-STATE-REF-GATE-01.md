# ACV-STATE-REF-GATE-01 — Implementation Mandate

**Program:** CAW-011 — Commerce Atlas Wedge **Milestone:** M08.5 — Z-PROF Profile Architecture **Gate:** ACV-STATE-REF-GATE-01 — Deterministic Active Constitutional View State Reference **Status:** RATIFIED — AUTHORIZED FOR IMPLEMENTATION **Implementation Agent:** Jules — AI Software Engineer **Implementation Scope:** Narrow constitutional capability closure only **Implementation Authority:** GRANTED WITHIN THIS MANDATE

## 1. Objective

Implement the ratified ACV State Reference mechanism so an exact `ActiveConstitutionalView` can deterministically produce the `PinnedStateReference` required by:

`EvaluationCoordinate.pinnedSemanticStateRef`

The implementation SHALL resolve the representation gap discovered during AMS-0861-B without introducing caller-authored state pins, new constitutional authority, new Runtime semantics, GS1-specific logic, or new persistence architecture.

The governing invariant is:

An evaluation SHALL never merely claim which constitutional state it used. The exact `ActiveConstitutionalView` supplied to that evaluation SHALL deterministically identify itself.

## 2. Required Ownership and Placement

Semantic ownership SHALL remain in:

`@zyppi/domain`

because `ActiveConstitutionalView` and the existing canonicalization/hash primitives are owned there.

Application SHALL invoke the derivation after assembling the exact ACV and before Z-PROF constructs the `EvaluationCoordinate`.

The implementation flow SHALL remain:
`Registry State       ↓ Application assembles exact ActiveConstitutionalView       ↓ derive ACV State Reference       ↓ PinnedStateReference       ↓ EvaluationCoordinate.pinnedSemanticStateRef       ↓ future Runtime consumption `
Do not move derivation authority into Runtime.

Do not create a new ACV service, package, Registry entity, or constitutional organ.

## 3. Mandatory Repository Reconnaissance

Before modifying code, inspect and report the exact current surfaces for:

1. `ActiveConstitutionalView` type and export path.

2. `IdentityRecord`.

3. relationship / `ReferentRecord` representation.

4. `StandingRecord`.

5. `AuthorityRecord`.

6. `CapabilityRecord`.

7. `PolicyRecord`.

8. `applicablePolicies` exact nested shape.

9. `canonicalizeJcs`.

10. `cleanForJcs`.

11. `computeSha256`.

12. existing SHA-256 reference format.

13. `PinnedStateReference`.

14. existing `EvaluationCoordinate` builder.

15. current Application ACV assembly seam.

16. existing SCC identity derivation.

17. existing BCG identity derivation.

18. existing domain-separation prefixes used by receipt hashing.

19. any existing ACV/state digest implementation.

20. whether any set-like nested `PolicyRecord` collections require semantic normalization.

If any required representation contradicts the ratified Gate, stop and report the exact contradiction.

Do not reinterpret the Gate to fit implementation convenience.

# 4. Implement ACV State Projection

Implement a domain-neutral projection equivalent to:
`ACV_STATE_PROJECTION_V1 = {     identity,     relationships,     standings,     authorities,     capabilities,     applicablePolicies } `
Explicitly exclude:
`evidenceReferences `
Do not hash the uncontrolled entire `ActiveConstitutionalView` object.

Use a strict allowlist projection.

Future fields added to `ActiveConstitutionalView` SHALL NOT automatically enter V1 identity.

# 5. Projection Versioning

V1 semantics are frozen.

The implementation SHALL treat:
`ACV_STATE_PROJECTION_V1 `
as a permanent historical contract.

If future constitutional amendments require new identity-bearing fields, they SHALL be introduced through a future projection version, for example:
`ACV_STATE_PROJECTION_V2 `
V1 SHALL NOT silently change.

# 6. Deterministic Normalization

Normalize only collections whose governing semantics are set-like.

At minimum, normalize the top-level collections:

- `relationships`;

- `standings`;

- `authorities`;

- `capabilities`;

- `applicablePolicies`.

Use complete stable coordinates rather than insertion order or database order.

Do not mutate the supplied ACV while sorting.

Do not blindly sort arbitrary nested arrays inside `PolicyRecord`.

For nested policy structures:

- preserve semantically ordered arrays;

- normalize only nested collections whose existing contracts clearly establish order-insensitive semantics;

- if this distinction cannot be determined from current contracts, do not invent sorting semantics; report it.

# 7. Canonicalization

Use the existing governed JCS infrastructure.

Conceptually:
`projection → deterministic normalization → cleanForJcs → canonicalizeJcs `
Do not create a second canonicalizer.

Do not use:

- raw `JSON.stringify`;

- incidental property ordering;

- database serialization;

- custom ad hoc canonicalization.

# 8. Cryptographic Derivation

Use the existing governed SHA-256 helper.

The V1 domain separator SHALL be exactly:
`zyppi:domain:acv_state:v1: `
Conceptually:
`canonical =     canonicalizeJcs(         cleanForJcs(             normalize(                 ACV_STATE_PROJECTION_V1(acv)             )         )     )  digest =     computeSha256(         "zyppi:domain:acv_state:v1:" + canonical     ) `
The resulting representation SHALL follow the existing repository convention:
`sha256:<64 lowercase hex> `
Do not introduce a URN, `acv:` namespace, or parallel identifier grammar.

# 9. Public Capability

Implement the minimum lawful public capability needed for Application consumption.

Conceptually equivalent to:
`projectActiveConstitutionalViewState(...) deriveActiveConstitutionalViewStateReference(...) `
Exact function and file names may follow repository conventions.

The public capability SHALL:

- accept a valid `ActiveConstitutionalView`;

- derive the exact deterministic V1 state reference;

- not accept a caller-supplied state reference;

- not accept override hashes;

- not query Registry;

- not perform I/O;

- not inspect runtime results;

- not mutate the ACV.

# 10. `PinnedStateReference` Materialization

Provide the minimum contract-compatible representation required by the existing `PinnedStateReference`.

Do not invent a new state-reference type if the existing one suffices.

The derived content-addressed reference must become the value ultimately bound into:
`EvaluationCoordinate.pinnedSemanticStateRef `
If existing contracts require both `ref` and `digest`, populate them only from the same lawful derived ACV state digest.

Do not fabricate `version` unless an existing ratified contract explicitly requires and supplies one.

# 11. Evidence Separation

Prove mechanically that changing only:
`ActiveConstitutionalView.evidenceReferences `
does not change the ACV State Reference.

This is mandatory.

The implementation SHALL preserve:
`ACV State Reference ≠ Evidence Integrity Coordinate `
No Evidence payload or Evidence digest may enter `ACV_STATE_PROJECTION_V1`.

# 12. Relationship Sensitivity

Prove that changing an identity-bearing relationship changes the ACV State Reference.

Relationships are part of V1 state identity.

Do not exclude them for convenience.

# 13. Policy Sensitivity

Bind the actual current identity/evaluation-bearing `PolicyRecord` representation present in `applicablePolicies`.

Do not reduce policies to only:
`policyId + version `
unless repository contracts already prove those coordinates uniquely bind the complete executable policy definition.

If actual executable policy content changes while ID/version remain the same, the ACV State Reference SHALL change.

# 14. Empty-Collection Determinism

Implement the Council-added invariant:

An ACV with empty set-like collections SHALL still produce a valid deterministic ACV State Reference.

Explicit empty collections SHALL remain explicit empty collections.

Do not:

- omit them;

- convert them to `null`;

- interpret them as missing ACV state.

# 15. Mandatory Tests

Implement at minimum the following tests.

### ACV-REF-T01 — Repeatability

Same ACV state repeatedly derives the same reference.

### ACV-REF-T02 — Collection Permutation Invariance

Permutation of set-like top-level collections produces the same reference.

### ACV-REF-T03 — Identity Mutation Sensitivity

Identity-bearing state change changes the reference.

### ACV-REF-T04 — Relationship Mutation Sensitivity

Relationship change changes the reference.

### ACV-REF-T05 — Standing Mutation Sensitivity

Standing change changes the reference.

### ACV-REF-T06 — Authority Mutation Sensitivity

Authority change changes the reference.

### ACV-REF-T07 — Capability Mutation Sensitivity

Capability change changes the reference.

### ACV-REF-T08 — Applicable Policy Mutation Sensitivity

Applicable policy state/content change changes the reference.

### ACV-REF-T09 — Evidence Independence

Only `evidenceReferences` change → reference remains unchanged.

### ACV-REF-T10 — Execution Independence

Changing request/execution metadata outside ACV does not affect the reference.

### ACV-REF-T11 — Non-Mutation

Derivation does not mutate or reorder the supplied ACV.

### ACV-REF-T12 — Digest Grammar

Result matches:
`^sha256:[0-9a-f]{64}$ `

### ACV-REF-T13 — Empty Collections

Minimal ACV with empty set-like collections derives valid deterministic reference.

### ACV-REF-T14 — No Caller Substitution

No public derivation path accepts an arbitrary caller-authored state reference.

### ACV-REF-T15 — Domain Separator Sensitivity

The derived digest uses the ratified V1 domain separator and does not equal the naked canonical JSON hash where the hashes would otherwise differ.

### ACV-REF-T16 — Future Field Exclusion

Add a synthetic non-V1 metadata field through a test-compatible fixture/cast where lawful and prove it does not alter the V1 state reference.

Do not weaken type safety in production code to create this test.

# 16. Application Integration

Update the existing generic Application ACV assembly path only as necessary to invoke the new derivation after exact ACV assembly.

Do not add GS1 semantics.

Do not modify Runtime.

Do not modify Registry schema.

Do not modify Evidence semantics.

Do not create a new orchestration layer.

The Application integration SHALL provide the derived ACV State Reference to the lawful pre-execution coordinate construction path.

# 17. AMS-0861-B Integration

After the domain capability is implemented and verified:

1. remove the `PINNED_SEMANTIC_STATE_REPRESENTATION_GAP` workaround from `gs1CompositionBridge.ts`;

2. do not reintroduce `explicitPinnedStateRef`;

3. derive the ACV State Reference from the exact `boundPayload.resolvedActiveConstitutionalView`;

4. bind the derived result into `EvaluationCoordinate.pinnedSemanticStateRef`;

5. restore the structural pre-RI `mapEvaluationCoordinateToExecutionRequest` compatibility proof;

6. retain all temporal enforcement introduced by CORR-0861-B-2.

The bridge SHALL never permit callers to override the derived pin.

# 18. Required Negative Source Audit

Verify zero production occurrences of patterns equivalent to:
`explicitPinnedStateRef callerPinnedState overrideAcvDigest acvDigest ?? suppliedDigest canonicalReference as pinnedSemanticStateRef manifestId as pinnedSemanticStateRef sccId as pinnedSemanticStateRef bcgId as pinnedSemanticStateRef "current" ACV fallback "latest" ACV fallback `
False positives in comments/tests describing prohibitions may be documented.

# 19. Protected Boundaries

Do not modify the following unless repository evidence proves the ratified domain capability cannot otherwise be expressed:
`packages/runtime/ infra/ edge/ `
Changes to `packages/domain/` are expressly authorized only for the narrow ACV State Reference utility and its tests/exports.

Changes to `packages/contracts/` are not authorized unless reconnaissance proves the existing `PinnedStateReference` cannot lawfully carry the derived reference.

If such a contract gap exists:
`STOP REPORT CONTRACT REPRESENTATION GAP `
Do not silently widen the contract.

# 20. Pre-Commit Verification

Run the repository's actual applicable quality gates, including at minimum:
`pnpm format:check pnpm lint pnpm exec tsc -b pnpm boundary:all pnpm graph:validate pnpm test `
plus:

- domain ACV State Reference tests;

- AMS-0861-B GS1 bridge tests;

- Z-PROF lifecycle/versioning tests;

- SCC/BCG tests;

- relevant replay/determinism tests.

If canonical repository commands differ, use the real commands discovered during reconnaissance.

# 21. Completion Receipt

Return a structured completion receipt containing:

1. branch;

2. final commit SHA;

3. changed files;

4. reconnaissance findings;

5. exact ACV type used;

6. exact V1 projection fields;

7. explicit excluded fields;

8. relationship normalization rule;

9. standing normalization rule;

10. authority normalization rule;

11. capability normalization rule;

12. applicable policy normalization rule;

13. nested policy normalization determination;

14. canonicalization utility reused;

15. hash utility reused;

16. exact domain separator;

17. resulting reference grammar;

18. `PinnedStateReference` mapping;

19. caller-substitution prevention proof;

20. evidence-independence proof;

21. permutation-invariance proof;

22. mutation-sensitivity proofs;

23. empty-collection proof;

24. non-mutation proof;

25. Application integration proof;

26. AMS-0861-B integration proof;

27. restored EC materialization proof;

28. restored pre-RI mapper compatibility proof;

29. Runtime non-modification proof;

30. Registry non-modification proof;

31. Evidence-separation proof;

32. negative source audit result;

33. domain tests result;

34. GS1 tests result;

35. Z-PROF tests result;

36. full relevant workspace test result;

37. format result;

38. lint result;

39. typecheck/build result;

40. boundary result;

41. graph validation result;

42. hosted CI result if available;

- domain ACV State Reference tests;

- AMS-0861-B GS1 bridge tests;

- Z-PROF lifecycle/versioning tests;

- SCC/BCG tests;

- relevant replay/determinism tests.

If canonical repository commands differ, use the real commands discovered during reconnaissance.

# 21. Completion Receipt

Return a structured completion receipt containing:

1. branch;

2. final commit SHA;

3. changed files;

4. reconnaissance findings;

5. exact ACV type used;

6. exact V1 projection fields;

7. explicit excluded fields;

8. relationship normalization rule;

9. standing normalization rule;

10. authority normalization rule;

11. capability normalization rule;

12. applicable policy normalization rule;

13. nested policy normalization determination;

14. canonicalization utility reused;

15. hash utility reused;

16. exact domain separator;

17. resulting reference grammar;

18. `PinnedStateReference` mapping;

19. caller-substitution prevention proof;

20. evidence-independence proof;

21. permutation-invariance proof;

22. mutation-sensitivity proofs;

23. empty-collection proof;

24. non-mutation proof;

25. Application integration proof;

26. AMS-0861-B integration proof;

27. restored EC materialization proof;

28. restored pre-RI mapper compatibility proof;

29. Runtime non-modification proof;

30. Registry non-modification proof;

31. Evidence-separation proof;

32. negative source audit result;

33. domain tests result;

34. GS1 tests result;

35. Z-PROF tests result;

36. full relevant workspace test result;

37. format result;

38. lint result;

39. typecheck/build result;

40. boundary result;

41. graph validation result;

42. hosted CI result if available;

43. unresolved issues;

44. stop-condition status.

# 22. Stop Conditions

Stop and report if implementation requires:

- caller-authored ACV State References;

- a new ACV Registry;

- a new ACV authority service;

- Runtime derivation authority;

- Runtime ACV discovery;

- Evidence inclusion in V1 projection;

- GS1-specific derivation behavior;

- new persistence schema;

- a new identifier namespace;

- a new cryptographic primitive;

- changes to SCC or BCG semantics;

- mutation of historical reference semantics;

- silent modification of V1 projection semantics;

- a new `PinnedStateReference` contract;

- arbitrary sorting of semantically ordered policy arrays;

- hashing implementation metadata unrelated to constitutional state.

# 23. Definition of Done

This mandate is complete only when the repository proves:
`Exact ActiveConstitutionalView         ↓ ACV_STATE_PROJECTION_V1         ↓ deterministic normalization         ↓ JCS         ↓ SHA-256         ↓ ACV_STATE_REF         ↓ PinnedStateReference         ↓ EvaluationCoordinate.pinnedSemanticStateRef `
with:
`caller invention          = impossible Evidence coupling         = absent GS1 semantics             = absent Runtime derivation        = absent ambient/latest state      = absent permutation dependence    = absent historical V1 mutation    = absent  determinism               = proven constitutional sensitivity = proven Evidence independence     = proven non-mutation              = proven pre-RI compatibility      = proven `

# 24. Final Instruction to Jules

Execute the reconnaissance first.

If no stop condition is encountered, implement ACV-STATE-REF-GATE-01 exactly as ratified, integrate the derived reference into the existing Application/Z-PROF pre-execution path, remove the AMS-0861-B representation-gap workaround, restore lawful `EvaluationCoordinate` materialization, run all mandatory tests and quality gates, produce the Completion Receipt, and submit the change.

Do not return for another design approval unless a defined stop condition or genuine contract representation gap is discovered.

# AMS-0860-CONTRACT-CLOSURE — Lifecycle, Version Binding, Trust & Operation Contracts

**Program:** CAW-011 — Commerce Atlas Wedge
**Milestone:** M08.5 — Z-PROF Profile Architecture
**Workstream:** IT-0860 / AMS-0860 — Lifecycle & Versioning
**Document Class:** Contract Closure
**Status:** **DRAFT — FOR COUNCIL REVIEW**
**Authority:** Zyppi Constitutional Council
**Semantic Authority:** `Z-PROF-D5-R4-R3 — RATIFIED / SEMANTICALLY CLOSED`
**Architecture Authority:** `AMS-0860-ARCH-CLOSURE — RATIFIED / ARCHITECTURALLY CLOSED`
**Governing Contract Baseline:** `CONTRACT-R1` and existing Z-PROF contract family
**Implementation Authority:** **NONE**
**Target Next Stage:** Contract Ratification → AMS-0860 Implementation Mandate
**Date:** 2026-08-18

---

# 1. Purpose

`AMS-0860-CONTRACT-CLOSURE` converts the ratified AMS-0860 semantic and architectural model into exact implementation-facing contract requirements.

The governing architecture is:

```text
Validated CompositionManifest
        │
        ▼
Semantic Configuration Identity
        SCC
        │
        ▼
Bound Configuration Graph
        BCG
        │
        ▼
Evaluation Coordinate
        EC
        │
        ├──────────────► RI execution
        │                    │
        │                    ▼
        │             ExecutionReceipt
        │
        ▼
Assessment Request Coordinate
        ARC
        │
        ▼
SEC / POL / applicable sovereign authorities
        │
        ▼
AssessmentResult
```

The governing equations remain:

```text
EC  = what was evaluated
ARC = what is being asked about it now
ExecutionReceipt = what actually happened
AssessmentResult = what governing authorities determine now
```

This Contract Closure SHALL determine:

1. how SCC identity is derived without creating a second manifest;
2. the exact contract shape of BCG;
3. the exact contract shape of EC;
4. the exact contract shape of ARC;
5. the closed primitive operation vocabulary;
6. Target × Operation compatibility;
7. temporal-coordinate contracts;
8. the distinction between T_e_input and T_e_observed;
9. pinned semantic-state and pinned assessment-state references;
10. historical reconstruction boundaries;
11. deterministic identity/canonicalization rules;
12. failure mapping into the existing CONTRACT-12 taxonomy;
13. the Z-PROF → existing RI execution-request seam;
14. the minimum contract changes required to implement AMS-0860 without contract sprawl.

This document does not authorize implementation.

---

# 2. Contract Closure Strategy

The Council ratifies the following contract strategy:

> AMS-0860 SHALL extend the existing Z-PROF contract family rather than create seven independent constitutional contract systems.

The seven architectural requirement groups identified in Architecture Closure remain valid:

- CR-0860-A — Semantic Configuration Identity
- CR-0860-B — Bound Configuration Graph
- CR-0860-C — Evaluation Coordinate
- CR-0860-D — Assessment Request Coordinate
- CR-0860-E — Temporal Binding
- CR-0860-F — Historical Reconstruction Boundary
- CR-0860-G — Failure Mapping

However:

7 requirement groups ≠ 7 new constitutional authorities

The default materialization SHALL be:

```text
existing CONTRACT-R1
        +
minimal schema/type extensions
        +
application-layer Z-PROF structures
```

A standalone new constitutional contract is prohibited unless reuse proves structurally impossible.

---

# 3. No-New-Primitive Determination

AMS-0860 introduces no new Reality primitive and no new sovereign authority.

The following terms are architectural/contractual constructs only:

- SCC
- BCG
- EC
- ARC
- AssessmentResult

They SHALL NOT be interpreted as new ZRM Reality primitives.

Specifically:

- SCC is derived semantic configuration identity.
- BCG is an immutable configuration-closure representation.
- EC is an immutable evaluation input coordinate.
- ARC is an immutable assessment request coordinate.
- AssessmentResult is derived output aggregating sovereign determinations.

None acquires independent constitutional sovereignty merely because it receives a schema.

---

# 4. Contract Amendment Model

Contract Closure adopts the following model:

```text
CONTRACT-R1
    │
    ├── existing CompositionManifest contract
    ├── existing version-binding requirements
    ├── existing Context contract
    ├── existing provenance requirements
    ├── existing failure taxonomy
    │
    └── AMS-0860 extension clauses
           ├── SCC Identity Projection
           ├── BCG
           ├── EC
           ├── ARC
           ├── Temporal Binding
           ├── Reconstruction Boundary
           └── Failure Mapping
```

AMS-0860 SHALL NOT create a parallel CONTRACT-R2 solely for naming convenience unless repository contract lineage requires such an identifier during final materialization.

The Council closes semantics and shapes here; final repository filename/section placement may follow the established contract corpus convention.

---

# 5. CR-0860-A — Semantic Configuration Identity Contract

## 5.1 SCC is an identity, not a duplicate manifest

The contract SHALL NOT create a separately authored mutable SemanticConfigurationCoordinate payload that duplicates the validated CompositionManifest.

Instead:

```text
Validated CompositionManifest
        │
        ▼
identity-bearing projection
        │
        ▼
canonical representation
        │
        ▼
SCC Identity
```

Formally:

```text
SCC_ID = DIGEST(
    CANONICALIZE(
        SCC_IDENTITY_PROJECTION(
            ValidatedCompositionManifest
        )
    )
)
```

---

# 6. SCC Identity-Bearing Projection

The SCC identity projection SHALL contain only fields whose change alters reusable semantic configuration identity.

The projection SHALL include, where present in the governing manifest:

- Composition identity/version coordinates;
- exact DTC reference/version;
- exact ARM Profile reference/version;
- exact Epistemic Requirement references/versions;
- exact Projection requirement/specification references/versions;
- exact RSN Blueprint/reasoning requirement references/versions;
- exact Context definition references/versions;
- exact POL requirement references/versions;
- exact SEC requirement references/versions;
- exact RI capability requirement references/versions;
- exact Temporal Applicability Rule references/versions;
- exact Federation Policy/interface requirement references/versions;
- other already-governed structural requirement signatures that affect reusable semantic meaning.

The projection SHALL NOT contain ordinary instance/runtime coordinates such as:

- bound Context values;
- tenant ID;
- request ID;
- session ID;
- transaction ID;
- execution ID;
- observed execution timestamp;
- T_trust;
- mutable trust determination;
- current lifecycle state;
- current Policy outcome;
- current Security outcome;
- runtime output;
- ExecutionReceipt ID merely because execution occurred;
- runtime provenance not defining semantic configuration.

---

# 7. SCC Identity Invariants

## SCC-I-001 — Determinism

Equivalent identity-bearing Manifest semantics SHALL produce equivalent SCC identity.

```text
Equivalent semantic projection
        ↓
same SCC_ID
```

---

## SCC-I-002 — Sensitivity

An identity-bearing semantic change SHALL produce a different SCC identity.

```text
Profile@1 → Profile@2
        ↓
different SCC_ID
```

where the Profile reference is part of semantic identity.

---

## SCC-I-003 — Context Factorization

Changing ordinary bound Context values SHALL NOT change SCC identity where the Context definition remains unchanged.

```text
ContextDefinition@3
ContextValue = Egypt
```

and:

```text
ContextDefinition@3
ContextValue = UAE
```

may use the same SCC identity.

Their ECs may differ.

---

## SCC-I-004 — No Floating Reference

Any SCC identity-bearing artifact reference SHALL be exact.

The following are invalid inside the identity projection:

- latest
- current
- ^2
- 2.x
- > =2
- -
- compatible

---

# 8. SCC Canonicalization

SCC identity generation SHALL use the repository's established canonical JSON mechanism compatible with JCS / RFC 8785.

Contract Closure does not authorize another canonicalization standard.

Before canonicalization:

- unordered reference collections SHALL be normalized deterministically;
- order-insensitive sets SHALL use canonical ordering;
- duplicate identity-equivalent references SHALL fail or canonicalize according to the governing CompositionManifest contract;
- implementation insertion order SHALL have no effect.

The digest algorithm SHALL reuse the existing constitutional hashing mechanism already used by the platform where available.

No random salt, machine identifier, process identifier, or current timestamp may participate.

---

# 9. CR-0860-B — Bound Configuration Graph Contract

The BCG SHALL represent the exact evaluation-affecting dependency closure.

Conceptually:

```text
BoundConfigurationGraph
├── schemaVersion
├── semanticConfigurationRef
├── nodes[]
├── bindingEdges[]
├── opacityBoundaries[]
├── externalIntegrityReferences[]
└── deterministicIdentity
```

Concrete property naming may follow existing repository conventions, but the semantic contract is closed by this document.

---

# 10. BCG Node Contract

Each BCG node SHALL contain sufficient information to identify one exact governed dependency.

Minimum semantics:

```text
BCGNode
├── reference
├── kind
├── version / exact identity coordinate
└── authority / owner reference where required by governing substrate
```

A BCG node SHALL NOT contain mutable current lifecycle or trust state.

---

# 11. BCG Binding Edge Contract

A binding edge SHALL express an explicit evaluation-affecting dependency:

```text
BCGBindingEdge
├── sourceRef
├── targetRef
└── relationKind
```

The edge means:

> sourceRef requires the exact governed binding represented by targetRef for the semantic configuration to close deterministically.

It does not mean:

- authority transfer;
- semantic inheritance;
- Runtime activation;
- ownership transfer.

---

# 12. BCG Closure Contract

For every required binding dependency:

```text
A → B
B → C
```

the BCG SHALL contain:

- A
- B
- C
- A → B
- B → C

unless closure terminates at a recognized Constitutional Opacity Boundary.

An undeclared or unresolved mandatory dependency SHALL cause failure.

Z-PROF SHALL NOT:

- silently omit it;
- replace it with a newer dependency;
- select a "compatible" replacement;
- consult ambient Registry state during evaluation.

---

# 13. BCG Opacity Boundary Contract

A governed opacity boundary SHALL contain enough exact information to terminate local transitive visibility without losing deterministic local meaning.

Minimum semantics:

```text
OpacityBoundary
├── foreignInterfaceRef@exact
├── foreignAuthorityRef
├── localFederationPolicyRef@exact
└── externalIntegrityRef
```

externalIntegrityRef SHALL identify the exact foreign result/receipt interaction that affected local evaluation.

It SHALL represent integrity identity only.

It SHALL NOT embed mutable foreign Runtime state into BCG.

---

# 14. BCG External Integrity Reference

An external integrity reference SHALL be an immutable digest or constitutionally equivalent exact integrity identifier.

The following relation is mandatory:

```text
Foreign interface unchanged
+
foreign result digest H1
        ≠
same foreign interface
+
foreign result digest H2
```

if the foreign result materially participated in local evaluation.

Thus the local BCG cannot float merely because the foreign interface version stayed unchanged.

---

# 15. BCG Identity Contract

BCG identity SHALL be calculated over the canonical normalized configuration graph.

Conceptually:

```text
BCG_ID = DIGEST(
    CANONICALIZE(
        {
            semanticConfigurationRef,
            nodes,
            bindingEdges,
            opacityBoundaries,
            externalIntegrityReferences
        }
    )
)
```

Current trust/lifecycle/runtime state SHALL NOT participate.

---

# 16. BCG Canonical Graph Ordering

Before canonical serialization:

Nodes: SHALL be deterministically ordered by canonical exact participant/reference identity.

Binding edges: SHALL be deterministically ordered by:

```text
sourceRef
→ targetRef
→ relationKind
```

or a contractually equivalent canonical tuple order.

Opacity boundaries: SHALL be deterministically ordered by their canonical foreign interface/reference identity.

External integrity references: SHALL be deterministically ordered by canonical reference/digest.

Permutation of input arrays SHALL NOT alter BCG_ID.

---

# 17. BCG Invariants

- **BCG-I-001 — Closure**: All mandatory evaluation-affecting dependencies are bound.
- **BCG-I-002 — No Ambient State**: Registry changes after binding cannot mutate BCG.
- **BCG-I-003 — No Runtime State**: BCG contains no Runtime output or current trust result.
- **BCG-I-004 — Deterministic Identity**: Equivalent closures produce the same BCG identity.
- **BCG-I-005 — Opacity Integrity**: Foreign opacity may hide internals but may not create floating consumed output.

---

# 18. CR-0860-C — Evaluation Coordinate Contract

The EC SHALL identify the exact configuration and explicit instance inputs used for a constitutional evaluation.

Conceptually:

```text
EvaluationCoordinate
├── semanticConfigurationRef
├── boundConfigurationRef
├── pinnedSemanticStateRef
├── boundContext
├── evidenceIntegrityCoordinates[]
├── authorizedInputs
├── evaluationParameters
└── evaluationTemporalCoordinates
```

OP SHALL NOT be present.

---

# 19. EC Semantic Configuration Reference

semanticConfigurationRef SHALL reference the exact SCC identity derived under CR-0860-A.

It SHALL NOT be a floating Composition name or version range.

---

# 20. EC Bound Configuration Reference

boundConfigurationRef SHALL reference the exact BCG identity derived under CR-0860-B.

Changing BCG changes EC.

A historical EC can therefore never silently acquire a newly resolved transitive dependency graph.

---

# 21. EC Pinned Semantic State

pinnedSemanticStateRef SHALL identify the exact constitutional semantic state used by the evaluation.

Where the existing ACV is the authoritative representation, the contract SHALL reuse the existing ACV identity/digest.

A new parallel constitutional-state object SHALL NOT be created merely for AMS-0860.

---

# 22. Bound Context Contract

boundContext SHALL contain explicit instance-bearing Context coordinates required by the evaluation.

It SHALL reference the applicable exact Context definition where required.

Z-PROF MAY structurally carry and validate Context coordinates.

Z-PROF SHALL NOT invent Context meaning.

Two ECs may share the same SCC and BCG but differ in boundContext.

---

# 23. Evidence Integrity Coordinate Contract

Historical EC evidence binding SHALL use exact integrity coordinates established by the existing Evidence authority.

Permitted forms may include:

- EvidenceRef
- EvidenceDigest
- EvidenceBundleDigest

as governed by existing contracts.

AMS-0860 SHALL NOT create mutable Evidence version semantics.

Evidence trust and availability are not EC identity state unless an already-governed immutable artifact explicitly belongs to the evaluated configuration.

---

# 24. Authorized Inputs Contract

authorizedInputs SHALL contain explicit inputs that have already crossed the appropriate authorization boundary.

Z-PROF SHALL NOT determine sovereign authorization merely by receiving a value.

The contract SHALL preserve authority provenance where required.

An "authorized input" SHALL NOT mean:

caller says it is authorized

unless the caller itself is the constitutionally authorized authority represented by the governing contract.

Concrete authorization verification remains with POL/SEC/application admission boundaries.

---

# 25. Evaluation Parameters Contract

evaluationParameters SHALL contain explicit parameters that can affect deterministic evaluation but are not reusable SCC identity.

Examples may include exact governed evaluation mode/parameters already allowed by the relevant contract.

They SHALL NOT include:

- randomness;
- ambient host state;
- implicit defaults that alter semantics;
- mutable system configuration.

If an evaluation-affecting parameter is required, absence SHALL fail closed rather than synthesize a default.

---

# 26. CR-0860-E — Evaluation Temporal Coordinate Contract

The EC temporal structure SHALL distinguish at minimum:

- T_v
- T_o
- T_e_input

where applicable.

The Runtime / ExecutionReceipt layer may separately record:

- T_e_observed

The assessment layer separately carries:

- T_trust

---

# 27. T_v Contract

T_v represents Reality Valid Time.

Where an evaluation or governed temporal rule requires Valid Time, it SHALL be explicit.

No other timestamp may be substituted without an explicit governing rule.

---

# 28. T_o Contract

T_o represents Observation / Evidence acquisition time.

Where required by the governing Evidence/temporal contract, it SHALL be explicit or derivable only through an explicitly governed Evidence artifact.

---

# 29. T_e_input Contract

T_e_input is the evaluation-effective execution-time coordinate where a Temporal Applicability Rule uses execution time semantically.

If a bound temporal rule requires T_e:

T_e_input is REQUIRED

If absent:

FAIL CLOSED

The following fallbacks are prohibited:

- Date.now()
- new Date()
- system clock
- request-arrival time
- database clock
- server startup time
- T_e_observed

unless an explicit authorized upstream layer materializes such a value as the declared T_e_input before evaluation.

---

# 30. T_e_observed Contract

T_e_observed is the historical observed execution timestamp recorded by the execution/receipt authority.

It does not retroactively become semantic input to an already-completed evaluation.

The following is valid:

T_e_input value == T_e_observed value

but the roles remain distinct.

---

# 31. Temporal Applicability Rule Contract

If temporal precedence/applicability affects evaluation, the applicable rule SHALL itself be exactly bound through SCC/BCG.

Example:

```text
Policy@7
+
TemporalApplicabilityRule@2
```

The rule—not Z-PROF—determines whether applicability uses:

- T_v
- T_o
- T_e_input
- effective interval
- retroactive interval

If the required Temporal Applicability Rule cannot be resolved exactly:

FAIL CLOSED

---

# 32. CR-0860-D — Assessment Request Coordinate Contract

ARC SHALL represent a present constitutional inquiry against an exact Target.

Conceptually:

```text
AssessmentRequestCoordinate
├── target
├── operation
├── pinnedAssessmentStateRef
├── T_trust
└── applicableAssessmentRuleRefs[]
```

ARC SHALL be immutable for one assessment request.

---

# 33. Closed Operation Vocabulary

The primitive operation set is:

- NEW_COMPOSITION
- NEW_EVALUATION
- HISTORICAL_RECONSTRUCTION
- RECEIPT_VERIFICATION

The representation SHALL be a closed enum / equivalent closed schema.

Arbitrary strings are prohibited.

Unknown values SHALL fail structurally.

There is no:

CURRENT_TRUSTED_REPLAY

primitive.

---

# 34. Target Contract

target SHALL be an exact typed reference.

Minimum target classes:

- COMPOSITION_DEFINITION
- EVALUATION_CONFIGURATION
- HISTORICAL_EVALUATION
- EXECUTION_RECEIPT

These are contract roles, not necessarily new persisted artifact classes.

Contract implementation SHOULD reuse existing repository types/references wherever possible.

---

# 35. Target × Operation Matrix

The following combinations are valid:

| Operation                 | Required Target Semantics                                    |
| ------------------------- | ------------------------------------------------------------ |
| NEW_COMPOSITION           | governed composition-definition / authoring inputs           |
| NEW_EVALUATION            | exact validated pre-execution evaluation configuration       |
| HISTORICAL_RECONSTRUCTION | exact historical EC / historical configuration               |
| RECEIPT_VERIFICATION      | exact ExecutionReceipt plus required verification references |

Invalid combinations SHALL return structural failure.

Examples:

NEW_EVALUATION + ExecutionReceipt → invalid
RECEIPT_VERIFICATION + SCC → invalid
HISTORICAL_RECONSTRUCTION + floating current Composition → invalid

Z-PROF SHALL NOT reinterpret one operation into another.

---

# 36. NEW_EVALUATION Representation

Contract Closure SHALL NOT create a new ambiguous constitutional primitive named ExecutableConfiguration.

For implementation, NEW_EVALUATION SHALL operate over an exact pre-execution evaluation configuration assembled from:

```text
SCC_ID
+
BCG_ID
+
PinnedSemanticStateRef
+
BoundContext
+
EvidenceIntegrityCoordinates
+
AuthorizedInputs
+
EvaluationParameters
+
required EvaluationTemporalCoordinates
```

That configuration is the pre-execution EC.

Therefore the preferred contract is:

NEW_EVALUATION Target → pre-execution EC

provided this remains compatible with the existing RI execution request boundary.

---

# 37. EC → RI ExecutionRequest Contract

AMS-0860 SHALL NOT create a second Runtime request system.

The Application layer SHALL adapt the exact EC into the already-governed RI execution request/admission interface.

Conceptually:

```text
EC
    │
    ▼
Application Adapter
    │
    ▼
existing RI ExecutionRequest / runInternalPipeline boundary
```

The adapter SHALL:

- preserve exact inputs;
- preserve pinned semantic state;
- preserve applicable version references;
- preserve explicit temporal inputs;
- add no semantic inference.

The adapter SHALL NOT:

- perform hidden version resolution;
- read ambient Registry state;
- invent Runtime stages;
- alter RI admission semantics;
- generate a parallel receipt.

If existing RI interfaces cannot consume the required information without semantic loss, implementation SHALL stop and report the contract gap rather than redesign RI.

---

# 38. Pinned Assessment State Contract

pinnedAssessmentStateRef SHALL identify the exact trust/admissibility state under which the ARC is evaluated.

It MAY refer to the same underlying ACV/state as pinnedSemanticStateRef.

But these roles remain distinct:

```text
EC.pinnedSemanticStateRef
    = semantic evaluation state

ARC.pinnedAssessmentStateRef
    = present assessment/trust state
```

Equal reference value does not collapse their roles.

---

# 39. T_trust Contract

T_trust SHALL be explicit when current trust/admissibility evaluation depends on assessment time.

It SHALL NOT be inferred from:

- current system clock
- Date.now()
- request-arrival time

inside deterministic ARC processing.

A live SEC/POL query may use current time under its own authority, but the resulting assessment state/time coordinate SHALL become explicit in ARC before deterministic Z-PROF assessment composition.

---

# 40. Applicable Assessment Rule Contract

applicableAssessmentRuleRefs[] SHALL contain exact governed references to the rules used for the current assessment where such rules are required.

No rule shall be inferred by:

- name;
- latest version;
- current default;
- domain proximity;
- caller preference.

Missing required rule:

FAIL CLOSED

---

# 41. Assessment Result Contract

Z-PROF MAY present an aggregate assessment view:

```text
AssessmentResult
├── reproducibility
├── executability
├── currentTrust
└── currentAdmissibility
```

Each component SHALL retain independent sovereign provenance.

Minimum conceptual shape:

```text
AssessmentDetermination
├── outcome
├── authorityRef
├── governingRuleRef
├── assessmentStateRef
├── temporalCoordinate
└── provenanceRefs[]
```

where applicable.

---

# 42. Assessment Sovereignty

The dimensions are not determined by one universal Z-PROF function.

Conceptually:

| Determination         | Governing source                            |
| --------------------- | ------------------------------------------- |
| Reproducibility       | configuration/provenance/Evidence contracts |
| Executability         | RI / execution authority                    |
| Current Trust         | SEC / applicable trust authority            |
| Current Admissibility | POL / applicable governing authority        |

Z-PROF MAY structurally aggregate the outputs.

It SHALL NOT fabricate a determination where no authoritative result exists.

---

# 43. CR-0860-F — Historical Reconstruction Contract

Historical reconstruction SHALL consume exact historical coordinates.

Minimum historical source:

```text
HistoricalReconstructionRequest
├── historicalEvaluationRef
├── exact SCC reference
├── exact BCG reference
├── exact pinned semantic state
├── historical bound Context
├── historical Evidence integrity coordinates
├── historical evaluation parameters
└── historical temporal coordinates
```

The exact implementation may obtain these through EC/provenance references rather than duplicate them physically.

---

# 44. Historical Reconstruction Disposition

Successful reconstruction SHALL be labeled contractually as:

NON_AUTHORITATIVE_HISTORICAL_RECONSTRUCTION

or an exact equivalent closed disposition.

It SHALL NOT be represented as:

- NEW_EVALUATION
- EXECUTION_RECEIPT
- CURRENT_TRUST_RESULT
- CURRENT_ADMISSIBILITY_RESULT

---

# 45. Historical Reconstruction Prohibitions

A reconstruction output SHALL NOT:

- replace the original ExecutionReceipt;
- claim it is the historical Runtime execution;
- create current authorization;
- create current trust;
- create current admissibility;
- trigger RI execution merely by existing;
- create a new attestation claiming historical identity with the original execution;
- mutate EC;
- mutate BCG;
- mutate SCC.

---

# 46. Revoked Historical Material Contract

Revocation alone SHALL NOT automatically prohibit analytical reconstruction.

The sequence is:

```text
historical reconstruction requested
        ↓
bind exact ARC / applicable sovereign rules
        ↓
explicit reconstruction prohibition?
        │
        ├── YES → fail closed
        └── NO  → analytical reconstruction may proceed
```

Z-PROF SHALL NOT infer a universal SEC prohibition from the word/state revoked.

---

# 47. Current Execution from Historical Inputs

Using historical inputs for present execution SHALL always create:

NEW_EVALUATION

It SHALL therefore produce a new EC appropriate to the current evaluation request.

Historical EC identity remains unchanged.

No "replay mode" may bypass current execution admission.

---

# 48. Receipt Verification Boundary

Receipt verification remains separate from reconstruction.

A valid architectural outcome is:

ReceiptVerified = true
HistoricalReconstructionComplete = false

if the governing receipt/Evidence contract permits cryptographic receipt verification without complete historical payload availability.

Exact sufficiency rules remain governed by AMS-0863 / Evidence / SEC contracts.

AMS-0860 SHALL NOT invent them.

---

# 49. CR-0860-G — Failure Mapping Contract

AMS-0860 SHALL use the existing closed CONTRACT-12 outward taxonomy:

- unsupported
- unavailable
- missing
- incompatible
- conflicting
- unauthorized
- unverified
- invalid

No new outward lifecycle/version taxonomy is authorized.

---

# 50. Internal Diagnostic → CONTRACT-12 Mapping

The following mapping SHALL govern AMS-0860 unless an existing ratified contract already requires a more specific mapping.

| Internal Diagnostic                                                     | CONTRACT-12 Disposition |
| ----------------------------------------------------------------------- | ----------------------- |
| Floating / non-exact required version                                   | invalid                 |
| Required exact artifact absent                                          | missing                 |
| Exact historical artifact known but payload unavailable                 | unavailable             |
| Required dependency closure incomplete                                  | missing                 |
| Bound versions structurally incompatible                                | incompatible            |
| Conflicting exact version constraints with no satisfiable closure       | conflicting             |
| Required Temporal Applicability Rule missing                            | missing                 |
| Temporal rule structurally incompatible                                 | incompatible            |
| Required T_e_input absent                                               | missing                 |
| Invalid Target × OP pair                                                | invalid                 |
| Unknown/unratified OP                                                   | unsupported             |
| Required pinned semantic state absent                                   | missing                 |
| Required pinned assessment state absent                                 | missing                 |
| Assessment state cannot be verified                                     | unverified              |
| Required authority not permitted                                        | unauthorized            |
| Reconstruction explicitly prohibited by governing rule                  | unauthorized            |
| Foreign dependency interface unavailable                                | unavailable             |
| Foreign result integrity cannot be verified                             | unverified              |
| BCG closure cycle/internally invalid binding structure where prohibited | invalid                 |
| Historical coordinate structurally malformed                            | invalid                 |

The implementation SHALL NOT expose internal diagnostic names as a competing public error constitution.

---

# 51. Version Lifecycle Consumption Contract

Z-PROF MAY consume lifecycle information from the owning authority.

It SHALL distinguish:

- ACTIVE
- SUPERSEDED
- REVOKED

only when such states are already provided by the governing authority/contracts.

AMS-0860 SHALL NOT establish a universal lifecycle enum merely because several authorities use similar concepts.

Accordingly, lifecycle interpretation is:

```text
artifact authority state
        +
OP
        +
applicable sovereign rules
        ↓
eligibility / assessment
```

not:

Z-PROF lifecycle state machine

---

# 52. Supersession Contract

A superseded artifact:

- MAY remain valid in an immutable historical EC;
- SHALL NOT be silently upgraded;
- MAY be disallowed for a new composition/evaluation according to governing lifecycle rules.

Z-PROF does not choose the successor.

---

# 53. Revocation Contract

A revoked artifact:

- remains historically identifiable;
- does not mutate historical EC/receipt;
- MAY affect current trust/admissibility through explicit ARC assessment;
- MAY participate in non-authoritative historical reconstruction unless an explicit governing prohibition applies.

Z-PROF does not create or lift revocation.

---

# 54. Canonicalization Contract

AMS-0860 canonical identity mechanics SHALL use existing repository constitutional canonicalization.

Where JSON structures are canonicalized:

RFC 8785 / JCS-compatible canonicalization

SHALL be reused.

Normalization SHALL occur before JCS when graph/set semantics require order-insensitive equivalence.

Canonicalization SHALL NOT depend on:

- object insertion order;
- array insertion order for semantic sets;
- database row order;
- filesystem order;
- hash-map order;
- host language iteration order;
- locale-specific sorting;
- machine identity.

---

# 55. Hashing Domain Separation

If SCC and BCG use hashes, they SHALL use distinct identity domains.

Conceptually:

```text
ZYPPI:SCC:<canonical-digest>
ZYPPI:BCG:<canonical-digest>
```

or an equivalent domain-separated scheme established by existing repository conventions.

The exact string prefix is an implementation/contract-detail choice and SHALL reuse existing identity conventions where available.

The critical contract requirement is:

SCC digest domain ≠ BCG digest domain

to prevent cross-type hash ambiguity.

---

# 56. Immutability Contract

Once successfully produced:

- SCC identity
- BCG
- EC
- ARC

SHALL be immutable.

In-place semantic mutation is prohibited.

A changed coordinate creates a new object/identity.

Code-level mechanisms may include deep immutability/freeze or immutable data construction as appropriate.

Shallow immutability that allows nested semantic mutation SHALL NOT satisfy the contract.

---

# 57. Pinned-State Isolation Contract

The following coordinates SHALL remain independently identifiable:

- PinnedSemanticStateRef
- PinnedAssessmentStateRef

A resolver SHALL NOT populate one from the other through implicit fallback.

The following is prohibited:

```text
pinnedAssessmentStateRef
    ?? pinnedSemanticStateRef
```

unless an explicit caller/governing contract declares that exact state as both coordinates.

Even then, both roles SHALL be explicitly represented.

---

# 58. No Defaults Contract

AMS-0860 implementation SHALL fail closed rather than synthesize semantic defaults for:

- missing exact artifact version;
- missing BCG dependency;
- missing temporal rule;
- missing required T_e_input;
- missing pinned semantic state;
- missing pinned assessment state;
- missing foreign integrity reference;
- missing operation;
- missing Target;
- missing governing reconstruction prohibition/permission information where required by the applicable rule.

No default latest, default timestamp, default authority, default Context, or default trust state is permitted.

---

# 59. RI Compatibility Contract

AMS-0860 SHALL consume only available RI interfaces.

The implementation SHALL inspect existing:

- ExecutionRequest/input types;
- ACV representation;
- Runtime pipeline entry point;
- Stage override/test seams;
- ExecutionReceipt output.

If a required RI capability is stubbed or absent:

DOCUMENT CONTRACT GAP

not:

IMPLEMENT NEW RI FEATURE

unless separately authorized.

---

# 60. ExecutionReceipt Non-Mutation Contract

Nothing in AMS-0860 may modify an existing historical ExecutionReceipt to reflect:

- new Policy;
- new trust state;
- revocation;
- supersession;
- later assessment;
- historical reconstruction.

A new assessment receives a new assessment output/provenance relation.

The historical receipt remains unchanged.

---

# 61. Replay Receipt Boundary

The repository's normal deterministic replay verification receipt mechanics remain separate from AMS-0860's constitutional ExecutionReceipt semantics.

Normal pre-commit updates to:

`packages/testing/replay/receipts/latest.json`

are procedural test evidence and SHALL NOT be confused with EC/ARC lifecycle semantics.

Where the established pre-commit process regenerates this receipt, normal metadata updates remain permitted according to the repository's existing procedures.

---

# 62. Contract Closure Mandatory Verification Tests

Any AMS-0860 implementation mandate SHALL require the following tests.

---

## TEST 0860.1 — SCC Permutation Invariance

Reorder semantically unordered manifest references.

Expected: same SCC_ID

---

## TEST 0860.2 — SCC Semantic Sensitivity

Change exact Profile version.

Expected: different SCC_ID

---

## TEST 0860.3 — SCC Context Factorization

Same Context definition, different bound Context value.

Expected: same SCC_ID, different EC

---

## TEST 0860.4 — Floating Version Rejection

Provide a required latest / compatible/range version at evaluation binding.

Expected: invalid

---

## TEST 0860.5 — BCG Participant Permutation

Reorder graph nodes.

Expected: same BCG_ID

---

## TEST 0860.6 — BCG Edge Permutation

Reorder binding edges.

Expected: same BCG_ID

---

## TEST 0860.7 — BCG Closure

A → B → C, omit C.

Expected: missing

---

## TEST 0860.8 — Registry Drift

Construct BCG against pinned inputs, mutate ambient Registry.

Expected: existing BCG_ID unchanged, evaluation unaffected

---

## TEST 0860.9 — Opacity Determinism

Same foreign interface, different foreign receipt digest.

Expected: different BCG_ID

---

## TEST 0860.10 — Same SCC / Different BCG

Same top-level manifest identity, different valid exact transitive closure where governing inputs differ.

Expected: same or governed SCC identity, different BCG_ID, different EC

No closure may float invisibly.

---

## TEST 0860.11 — Explicit Semantic State

Missing required pinnedSemanticStateRef.

Expected: missing

---

## TEST 0860.12 — Context Instance Difference

Same SCC/BCG, different bound Context.

Expected: different EC

---

## TEST 0860.13 — Evidence Digest Difference

Same configuration, different evaluation-affecting Evidence digest.

Expected: different EC

---

## TEST 0860.14 — Required T_e_input

Temporal rule requires T_e_input, none supplied.

Expected: missing

---

## TEST 0860.15 — Ambient Clock Independence

Change system clock while explicit T_e_input remains fixed.

Expected: same evaluation coordinate/result

---

## TEST 0860.16 — T_e_observed Independence

Same EC, different post-execution observed timestamp.

Expected: historical execution evidence differs, EC identity unchanged

provided T_e_observed was not the explicit evaluation input.

---

## TEST 0860.17 — OP Not in EC

Same EC used with:

- HISTORICAL_RECONSTRUCTION
- NEW_EVALUATION

Expected: same target EC, different ARC

---

## TEST 0860.18 — Unknown OP

Provide unratified operation.

Expected: unsupported

---

## TEST 0860.19 — Invalid Target × OP

RECEIPT_VERIFICATION against SCC.

Expected: invalid

---

## TEST 0860.20 — Missing Assessment State

Trust/admissibility assessment requires state but none supplied.

Expected: missing

---

## TEST 0860.21 — Assessment State Drift

Same historical EC, two explicit pinned assessment states.

Expected: same EC, different ARC, potentially different sovereign assessment

---

## TEST 0860.22 — No Ambient Trust Lookup

Mutate ambient SEC/Registry trust state after ARC is pinned.

Expected: existing ARC assessment unaffected

---

## TEST 0860.23 — Superseded Historical Profile

Historical EC references Profile@1 later superseded by Profile@2.

Expected: EC remains Profile@1, no implicit upgrade

---

## TEST 0860.24 — Revoked Historical Profile / Receipt Verification

Historical Profile later revoked.

Receipt still cryptographically verifiable.

Expected: receipt verification may succeed, current trust may independently fail

---

## TEST 0860.25 — Revoked Historical Reconstruction

No explicit sovereign reconstruction prohibition.

Expected: NON_AUTHORITATIVE_HISTORICAL_RECONSTRUCTION

---

## TEST 0860.26 — Reconstruction Explicitly Prohibited

Applicable exact sovereign rule prohibits reconstruction.

Expected: unauthorized

---

## TEST 0860.27 — Reconstruction Cannot Execute

Attempt to send reconstruction output directly into RI as if it were NEW_EVALUATION.

Expected: rejected

A separate NEW_EVALUATION must be constructed.

---

## TEST 0860.28 — Retroactive Assessment

Historical result exists; newer retroactive Policy applies to current assessment.

Expected: historical receipt unchanged, new AssessmentResult created

---

## TEST 0860.29 — Missing Historical Evidence

Known historical Evidence digest exists but payload unavailable.

Expected: full reconstruction unavailable/incomplete, no newer Evidence substitution

---

## TEST 0860.30 — Foreign State Opacity

Foreign internals change but exact historical foreign integrity reference remains H1.

Expected: historical BCG unchanged

---

## TEST 0860.31 — Pinned State Role Separation

Set both semantic and assessment state to the same ACV exact reference.

Expected: same underlying ref accepted, roles remain separate fields/coordinates

No implicit aliasing/fallback.

---

## TEST 0860.32 — Deep Immutability

Attempt nested mutation of BCG, EC, ARC.

Expected: mutation impossible / original unchanged

---

## TEST 0860.33 — RI Boundary

EC passes through authorized Application mapping.

Expected: existing RI request path used, no second runtime request engine

---

## TEST 0860.34 — Disappearance

Remove Z-PROF lifecycle coordinate machinery conceptually.

Expected:

- ARM state remains valid;
- PRJ remains valid;
- POL remains valid;
- SEC remains valid;
- Evidence remains valid;
- RI remains valid;
- historical ExecutionReceipt remains valid.

---

# 63. Mandatory Negative Search Review

Implementation verification SHALL search for prohibited lifecycle/version shortcuts including, as applicable:

- "latest"
- "currentVersion"
- "latestCompatible"
- "fallback"
- "defaultVersion"
- "Date.now"
- "Math.random"
- "CURRENT_TRUSTED_REPLAY"

The existence of an ordinary programming fallback unrelated to semantic choice does not automatically constitute a violation, but every match inside AMS-0860 logic SHALL be manually reviewed.

No semantic fallback may remain.

---

# 64. Protected Boundaries

Default authorized implementation scope SHALL remain:

- `apps/api/src/zprof/`
- `DOCS/CAW/M08.5/`

Normal replay receipt regeneration under established repository pre-commit procedure is permitted.

The following remain protected unless separately authorized:

- `packages/runtime/`
- `packages/domain/`
- `packages/contracts/`
- `infra/`
- `edge/`
- `.github/`

Important distinction:

The contract semantics in this document may conceptually extend CONTRACT-R1, but Jules SHALL NOT modify protected constitutional/contract files unless the eventual implementation mandate explicitly provides the exact authorized change or Chair-authored replacement content.

---

# 65. Contract Materialization Strategy for Jules

The future AMS-0860 Implementation Mandate SHALL instruct Jules to begin with repository reconnaissance.

It SHALL determine whether existing `apps/api/src/zprof/` structures already provide:

- CompositionManifest identity projection inputs;
- exact version references;
- canonicalization/JCS utilities;
- graph normalization mechanics;
- pinned ACV;
- Evidence integrity coordinates;
- Runtime request adapter/interface;
- closed CONTRACT-12 error codes.

Jules SHALL reuse them where contract-conforming.

Jules SHALL NOT create duplicate abstractions merely because this Contract Closure uses conceptual names such as SCC or BCG.

---

# 66. Mandatory Stop Conditions

Implementation SHALL halt and report to the Chair if repository reality requires any of the following:

1. a new universal lifecycle state machine;
2. a second trust-state authority;
3. a new revocation authority;
4. mutation of `packages/runtime/` to make EC work;
5. a parallel RI request model;
6. a parallel ExecutionReceipt;
7. a duplicate independently authored SCC manifest;
8. semantic inference of hidden BCG dependencies;
9. evaluation-time latest version selection;
10. ambient clock as evaluation-effective T_e;
11. ambient trust state inside ARC processing;
12. a new Evidence versioning system;
13. a superior cross-federation lifecycle authority;
14. rewriting historical receipts or ECs;
15. a new public error taxonomy outside CONTRACT-12;
16. inability to distinguish pre-execution EC from historical ExecutionReceipt;
17. inability to make SCC or BCG canonicalization permutation-invariant.

A stop condition SHALL NOT be bypassed for test convenience.

---

# 67. Contract Decisions

The Council is asked to ratify the following contract decisions.

## C0860-01 — SCC Representation

Decision: SCC SHALL be a deterministic identity derived from the canonical identity-bearing projection of the validated CompositionManifest, not a separately maintained duplicate manifest.

---

## C0860-02 — SCC Canonicalization

Decision: SCC identity SHALL reuse established JCS-compatible deterministic canonicalization and constitutional hashing infrastructure.

---

## C0860-03 — BCG Representation

Decision: BCG SHALL contain exact nodes, explicit binding edges, governed opacity boundaries, and immutable external integrity references only.

---

## C0860-04 — BCG Identity

Decision: BCG SHALL possess deterministic, permutation-invariant identity over its normalized configuration closure.

---

## C0860-05 — EC

Decision: EC SHALL bind exact SCC, exact BCG, pinned semantic state, bound Context, Evidence integrity coordinates, authorized inputs, evaluation parameters, and evaluation temporal coordinates.

OP ∉ EC.

---

## C0860-06 — NEW_EVALUATION Target

Decision: NEW_EVALUATION SHALL operate over the exact pre-execution EC/evaluation coordinate rather than introduce a separate redundant ExecutableConfiguration constitutional primitive.

---

## C0860-07 — RI Boundary

Decision: Application-layer adaptation SHALL map EC to the existing RI execution request path. Z-PROF SHALL NOT implement a parallel Runtime request system.

---

## C0860-08 — ARC

Decision: ARC SHALL bind exact Target, closed primitive OP, pinned assessment state, T_trust, and applicable exact assessment rules.

---

## C0860-09 — Operation Set

Decision:

- NEW_COMPOSITION
- NEW_EVALUATION
- HISTORICAL_RECONSTRUCTION
- RECEIPT_VERIFICATION

form the closed AMS-0860 primitive operation vocabulary.

---

## C0860-10 — T_e

Decision: Evaluation-effective T_e_input and observed Runtime T_e_observed are distinct contract roles.

Required T_e_input SHALL never fall back to the ambient clock.

---

## C0860-11 — Historical Reconstruction

Decision: Historical reconstruction is non-authoritative analytical output and cannot itself acquire present execution/trust/admissibility authority.

---

## C0860-12 — Revoked Material

Decision: Revoked historical material may be reconstructed analytically unless an explicit exact applicable sovereign rule prohibits reconstruction.

---

## C0860-13 — Assessment Sovereignty

Decision: Reproducibility, executability, current trust, and current admissibility remain independently sourced determinations; Z-PROF may aggregate but does not own them.

---

## C0860-14 — Failure Taxonomy

Decision: AMS-0860 SHALL reuse CONTRACT-12; no parallel outward lifecycle/version error taxonomy is authorized.

---

## C0860-15 — Contract Consolidation

Decision: AMS-0860 requirements SHALL be materialized as minimal extensions/reuse of the existing Z-PROF contract family before considering any standalone new constitutional contract.

---

# 68. Contract Closure Assessment

With the decisions above, the following are closed:

| Dimension                            | Status |
| ------------------------------------ | ------ |
| Lifecycle authority boundary         | CLOSED |
| Exact version binding                | CLOSED |
| SCC identity domain                  | CLOSED |
| CompositionManifest/SCC relationship | CLOSED |
| Transitive closure / BCG             | CLOSED |
| BCG canonical identity               | CLOSED |
| Federation opacity                   | CLOSED |
| EC shape                             | CLOSED |
| EC/OP separation                     | CLOSED |
| EC → RI boundary                     | CLOSED |
| Context instance binding             | CLOSED |
| Evidence integrity binding           | CLOSED |
| Temporal coordinates                 | CLOSED |
| T_e_input vs T_e_observed            | CLOSED |
| ARC shape                            | CLOSED |
| Primitive OP vocabulary              | CLOSED |
| Target × OP matrix                   | CLOSED |
| Pinned assessment state              | CLOSED |
| Historical reconstruction            | CLOSED |
| Revoked reconstruction behavior      | CLOSED |
| Current assessment sovereignty       | CLOSED |
| Failure taxonomy                     | CLOSED |
| Contract reuse strategy              | CLOSED |

No semantic or architectural question remains that requires Jules to invent an answer.

---

# 69. Implementation Readiness Gate

AMS-0860 SHALL be eligible for Implementation Mandate drafting only after Council confirms:

C0860-01 through C0860-15

and confirms that no contract gap requires reopening Architecture Closure.

Upon ratification:

```text
AMS-0860-CONTRACT-CLOSURE
        ↓
RATIFIED — CONTRACTUALLY CLOSED
        ↓
AMS-0860 Implementation Mandate
        ↓
Jules
```

---

# 70. Proposed Final Contract Disposition

AMS-0860-CONTRACT-CLOSURE — LIFECYCLE, VERSION BINDING, TRUST & OPERATION CONTRACTS

STATUS: DRAFT — FOR COUNCIL REVIEW

SEMANTIC FOUNDATION: RATIFIED — CLOSED

ARCHITECTURE: RATIFIED — CLOSED

CONTRACT MODEL: PROPOSED — READY FOR COUNCIL RATIFICATION

IMPLEMENTATION AUTHORITY: NONE

The Council is requested to review primarily:

1. whether SCC should indeed remain a derived CompositionManifest identity rather than a separate payload;
2. whether the BCG normalization/identity domain is complete;
3. whether pre-execution EC is sufficient as the NEW_EVALUATION target;
4. whether the EC → existing RI execution-request seam preserves Runtime sovereignty;
5. whether pinned semantic-state versus pinned assessment-state role separation is sufficiently mechanical;
6. whether the T_e_input contract fully eliminates ambient-clock semantics;
7. whether the four primitive operations are sufficient and appropriately closed;
8. whether historical reconstruction remains both auditable and non-authoritative;
9. whether CONTRACT-12 mappings are appropriate;
10. whether any proposed representation still duplicates an existing ratified contract unnecessarily.

No implementation work is authorized by this draft.

END OF AMS-0860-CONTRACT-CLOSURE

---

# AMS-0860-CONTRACT-CLOSURE — FINAL RATIFICATION AMENDMENT

**Program:** CAW-011 — Commerce Atlas Wedge
**Milestone:** M08.5 — Z-PROF Profile Architecture
**Workstream:** IT-0860 / AMS-0860 — Lifecycle & Versioning
**Document Class:** Contract Closure
**Status:** **RATIFIED — CONTRACTUALLY CLOSED**
**Authority:** Zyppi Constitutional Council
**Semantic Authority:** `Z-PROF-D5-R4-R3 — RATIFIED / SEMANTICALLY CLOSED`
**Architecture Authority:** `AMS-0860-ARCH-CLOSURE — RATIFIED / ARCHITECTURALLY CLOSED`
**Governing Contract Baseline:** `CONTRACT-R1` and existing Z-PROF contract family
**Implementation Authority:** **NONE**
**Next Stage:** `AMS-0860 — Implementation Mandate`
**Date:** 2026-08-18

---

# 71. Council Contract Review Disposition

The Council reviews establish broad agreement on all fifteen proposed contract decisions:

```text
C0860-01 through C0860-15
```

No review identifies a semantic or architectural contradiction requiring reopening:

- `Z-PROF-D5-R4-R3`;
- `AMS-0860-ARCH-CLOSURE`;
- the SCC / BCG / EC / ARC separation;
- the exact-version model;
- the historical non-rewrite model;
- the sovereign trust/admissibility boundary;
- the no-ambient-state rules;
- the closed primitive operation vocabulary.

The remaining Council findings are contract-precision clarifications.

They are closed below.

---

# 72. C0860-16 — SCC May Be Derived Only From a Validated CompositionManifest

SCC identity SHALL NOT be calculated from:

- a draft CompositionManifest;
- a partially validated CompositionManifest;
- a structurally invalid CompositionManifest;
- a CompositionManifest containing unresolved mandatory dependencies;
- a CompositionManifest containing floating identity-bearing references.

The required sequence is:

```text
Composition Definition / DTC
        ↓
authorized exact binding
        ↓
CompositionManifest
        ↓
CONTRACT-11 validation
        ↓
VALIDATED CompositionManifest
        ↓
SCC identity projection
        ↓
SCC_ID
```

Formally:

```text
SCC_IDENTITY_PROJECTION(M)
```

is constitutionally defined only when:

```text
VALIDATE_COMPOSITION_MANIFEST(M) = VALID
```

If the Manifest is invalid:

```text
SCC_ID SHALL NOT BE PRODUCED
```

This prevents invalid semantic configurations from acquiring canonical identity merely because they can be serialized.

---

# 73. C0860-17 — SCC Identity Projection SHALL Use an Explicit Allowlist

The SCC projection SHALL be implemented by explicit inclusion of authorized identity-bearing fields.

It SHALL NOT be implemented by:

```text
entire manifest - known non-semantic fields
```

or any equivalent blocklist model.

Required architecture:

```text
Validated CompositionManifest
        ↓
explicit allowlisted identity-bearing fields
        ↓
normalized SCC identity projection
        ↓
canonicalization
        ↓
SCC_ID
```

This means a future field added to `CompositionManifest`:

```text
newField
```

does **not** automatically affect SCC identity.

It may participate in SCC identity only after explicit constitutional/contract authorization.

Therefore:

```text
Unknown Manifest Field ≠ Automatic SCC Identity Field
```

This protects SCC identity stability against future schema expansion.

---

# 74. C0860-18 — Identity-Bearing Field Registry Is Closed

The implementation SHALL maintain a closed identity-bearing projection definition derived from the ratified contract.

The projection SHALL include only the semantic categories authorized in §6 of this Contract Closure.

Addition of a new identity-bearing class requires explicit contract amendment.

Jules SHALL NOT decide that a new Manifest property is identity-bearing based on:

- field name;
- TypeScript type;
- apparent importance;
- current usage;
- test convenience.

---

# 75. C0860-19 — BCG Authority Metadata Rule

A BCG node SHALL carry an `authorityRef` / owner reference only where the referenced artifact's governing contract establishes an authoritative owner or authority coordinate.

The BCG SHALL NOT manufacture a generic owner merely because BCG nodes share one interface.

Conceptually:

```text
BCGNode
├── reference
├── kind
├── exactVersionCoordinate
└── authorityRef?   // required only by governing artifact contract
```

Examples:

- `ARM Profile` → use authoritative ARM ownership/authority reference
- `RSN Blueprint` → use governing RSN methodology/authority reference where required
- `POL Rule` → use governing Policy authority reference
- `SEC-governed artifact` → use existing SEC authority/trust reference

The BCG SHALL consume authority metadata.

It SHALL NOT create a universal BCG ownership constitution.

If a governing contract requires authority metadata and that metadata is absent:

```text
FAIL CLOSED
```

---

# 76. C0860-20 — Authorized Inputs Admission Boundary

`authorizedInputs` in an EC means:

> Explicit evaluation inputs that have already crossed the governing Application / POL / SEC admission boundary appropriate to their class.

The Application admission layer is responsible for assembling the authorized input set before EC construction.

Conceptually:

```text
Caller Input
        ↓
Application Admission
        ├── POL authorization where applicable
        ├── SEC verification where applicable
        └── other governing authority checks
        ↓
Authorized Input
        ↓
EC
```

Z-PROF SHALL NOT infer authorization from possession of a value.

Therefore the following is prohibited:

```text
caller supplied input
        ↓
automatically treated as authorized
```

unless the governing contract explicitly defines that caller as the authoritative source.

AMS-0860 SHALL NOT duplicate POL or SEC verification.

---

# 77. C0860-21 — NEW_COMPOSITION Contract Boundary

`NEW_COMPOSITION` SHALL NOT mean:

> Create an arbitrary CompositionManifest from unvalidated input.

Its contract role is:

```text
Governed composition-definition inputs
        ↓
authorized version resolution
        ↓
CompositionManifest construction
        ↓
Composition validation
        ↓
validated CompositionManifest
```

A successful `NEW_COMPOSITION` operation therefore produces or establishes a **validated governed composition**.

It SHALL NOT:

- bypass CONTRACT-11 validation;
- assign SCC identity before validation;
- silently repair missing semantics;
- resolve floating references using ambient Registry state after binding;
- create a CompositionManifest from arbitrary caller content without authorization.

Whether persistent Registry registration occurs after validation remains governed by the Registry/application contract and is not made a Z-PROF sovereign responsibility by AMS-0860.

---

# 78. C0860-22 — T_bind / BCG Binding Cycles Are Always Invalid

Binding dependency topology remains distinct from structural-reference topology.

Structural references may contain cycles where the governing composition model permits them.

BCG binding edges represent evaluation-affecting dependency:

```text
source REQUIRES target
```

Therefore a directed cycle such as:

```text
A → B
B → C
C → A
```

is always invalid for BCG binding closure.

Formally:

```text
T_bind SHALL be a DAG
```

and:

```text
BCG.bindingEdges SHALL be acyclic
```

There is no:

```text
"cycle permitted where convenient"
```

exception.

If a binding cycle is detected:

```text
CONTRACT-12 disposition = invalid
```

Structural-reference cycles remain governed separately by the AMS-0858 composition topology contract.

---

# 79. C0860-23 — Closed BCG relationKind Vocabulary

For AMS-0860, BCG binding topology SHALL NOT use arbitrary free-form relationship strings.

The core contract relation is:

```text
REQUIRES
```

meaning:

> the source configuration constituent requires the exact target binding for deterministic closure.

Additional relation kinds SHALL NOT be introduced during AMS-0860 implementation merely for convenience.

Federated opacity participation SHALL remain represented through:

- `OpacityBoundary`
- `ExternalIntegrityReference`

rather than inventing semantic edge types such as:

- `FEDERATED_RESULT`
- `TRUSTS`
- `SUPERSEDES`
- `DEPENDS_SEMANTICALLY_ON`

unless separately ratified.

Accordingly, the initial BCG binding-edge vocabulary is:

```text
relationKind = REQUIRES
```

closed for AMS-0860.

This preserves one unambiguous dependency meaning.

---

# 80. C0860-24 — BCG Is Not the M08 / RI Resolution Graph

The Council explicitly closes the distinction:

```text
BCG ≠ RI / M08 Resolution Graph
```

### BCG

Represents:

```text
exact configuration dependency closure
```

before constitutional execution.

It answers:

> Which exact governed artifacts and dependencies constitute this evaluation configuration?

### RI / M08 Resolution Graph

Represents Runtime/execution resolution or evaluation ordering according to RI authority.

It answers the Runtime-specific question defined by RI.

The BCG SHALL NOT:

- replace RI dependency resolution;
- prescribe Runtime execution ordering;
- become an RI stage;
- become the M08 Resolution Graph.

The Application layer may use BCG-bound information while constructing the existing RI execution request, but the two graph concepts remain distinct.

---

# 81. C0860-25 — BCG Shall Not Be Embedded as Runtime Execution State

The Application adapter may consume:

- `EC`
- `SCC_ID`
- `BCG_ID`
- required exact references

to assemble the existing RI request surface.

The BCG SHALL NOT automatically become an entire Runtime payload merely because it precedes execution.

Only information required by the existing RI contract SHALL cross the RI seam.

Therefore:

```text
BCG is configuration provenance / closure
```

not:

```text
BCG is Runtime execution graph
```

If RI requires additional contract data that cannot be supplied through its existing request model without changing RI semantics, Jules SHALL stop and report the gap.

---

# 82. C0860-26 — EC / ExecutionReceipt Relationship

The Evaluation Coordinate and ExecutionReceipt remain distinct:

```text
EC               = exact pre-execution coordinate
ExecutionReceipt = evidence/proof of what execution actually occurred
```

The governing provenance chain SHALL make their relationship explicit.

At minimum, the execution/provenance system SHALL be capable of identifying the exact EC associated with a receipt through an immutable identity/provenance relation.

Conceptually:

```text
EC_ID
    ↓
ExecutionRequest / execution provenance
    ↓
ExecutionReceipt
```

AMS-0860 does **not** require that the complete EC payload be duplicated inside the ExecutionReceipt.

Nor does AMS-0860 prohibit a future ratified receipt schema from carrying additional EC-related provenance.

The normative requirement is:

```text
Receipt → exact EC identity/provenance relationship
```

without schema duplication.

The exact receipt/provenance mechanics are delegated to AMS-0863 and existing RI/Evidence contracts.

---

# 83. C0860-27 — Historical Reconstruction Source Rule

Historical reconstruction SHALL recover or resolve the exact historical EC through governed provenance references.

It SHALL NOT assume that the complete historical EC must be physically embedded in the ExecutionReceipt.

Therefore:

```text
ExecutionReceipt + governed provenance
        ↓
Historical EC identity / required exact inputs
```

is the required conceptual relation.

If required historical EC components cannot be recovered:

```text
full historical reconstruction is unavailable
```

even where receipt integrity itself remains verifiable.

---

# 84. C0860-28 — Corrected TEST 0860.10

The earlier wording:

> Same SCC / Different BCG — Same top-level manifest identity, different valid exact transitive closure where governing inputs differ.

is withdrawn because it could imply nondeterministic closure from an identical configuration.

The corrected invariant is:

## TEST 0860.10 — SCC / BCG Deterministic Closure

Given:

- `same validated CompositionManifest`
- `same SCC_ID`
- `same exact dependency declarations`
- `same applicable opacity-boundary definitions`

then any two complete successful closures SHALL produce:

```text
same BCG_ID
```

If a different pinned substrate is supplied:

### Case A — Both substrates contain the same exact required dependencies

Expected: `same BCG_ID`

### Case B — One substrate is missing a required dependency

Expected: `closure fails for that substrate`

not: `a different valid BCG is invented`

### Case C — An explicit different exact dependency is constitutionally bound by a different validated Manifest/configuration

Expected: `different SCC and/or different governed configuration`, `different BCG_ID`

The implementation SHALL NOT derive two different valid BCGs from the same fully closed semantic configuration merely because ambient Registry state differs.

---

# 85. C0860-29 — BCG Identity Uses an Allowlist

BCG canonicalization SHALL use an explicit allowlist of identity-bearing graph properties.

The identity domain is limited to:

- `semanticConfigurationRef`
- `nodes`
- `bindingEdges`
- `opacityBoundaries`
- `externalIntegrityReferences`

and the exact authorized fields inside those structures.

Future metadata SHALL NOT automatically enter the BCG hash.

This mirrors the SCC allowlist rule and prevents future schema growth from silently changing BCG identity.

---

# 86. C0860-30 — Federation Integrity Churn Is Accepted

The Council explicitly accepts the deterministic consequence:

```text
same ForeignInterface@exact + different ForeignResultIntegrityRef
        ↓
different bound foreign interaction
        ↓
different BCG identity
```

even where the foreign result is claimed to be semantically equivalent.

Z-PROF SHALL NOT attempt semantic deduplication of cryptographically distinct foreign results.

The product/application layer may provide usability tooling around resulting BCG identity churn.

The constitutional contract prioritizes exactness over convenience.

---

# 87. C0860-31 — Pinned State Equality Does Not Create Implicit Fallback

The following is valid:

```text
pinnedSemanticStateRef   = ACV@17
pinnedAssessmentStateRef = ACV@17
```

when both are explicitly supplied.

The following remains prohibited:

```text
pinnedAssessmentStateRef ?? pinnedSemanticStateRef
```

The implementation SHALL distinguish:

```text
explicit equality
```

from:

```text
implicit fallback
```

Tests SHALL cover both.

---

# 88. C0860-32 — No Semantic Defaults as CI Gate

The AMS-0860 implementation verification SHALL include explicit negative tests proving that semantic defaults are absent.

At minimum:

- missing exact version → failure;
- missing dependency → failure;
- missing Temporal Rule → failure where required;
- missing `T_e_input` → failure where required;
- missing pinned semantic state → failure;
- missing pinned assessment state → failure where assessment requires it;
- unknown OP → failure;
- invalid Target × OP → failure;
- missing foreign integrity reference → failure where opacity boundary requires it.

The implementation SHALL NOT pass CI solely because happy-path tests succeed.

Fail-closed negative-path tests are mandatory merge criteria.

---

# 89. Corrected Contract Verification Matrix

The mandatory AMS-0860 verification suite SHALL include the existing `0860.1` through `0860.34` tests with the following clarifications:

- **0860.1**: SCC calculated only from successfully validated Manifest.
- **0860.2**: Identity-bearing exact reference change changes SCC.
- **0860.3**: Instance Context changes EC, not SCC.
- **0860.5 / 0860.6**: BCG node and edge permutations remain identity-invariant.
- **0860.7**: Missing transitive dependency fails closed.
- **0860.8**: Ambient Registry drift cannot alter a pinned BCG.
- **0860.9**: Foreign integrity-reference change changes BCG.
- **0860.10**: Use the corrected deterministic-closure test in C0860-28.
- **0860.14**: Required `T_e_input` absence fails closed.
- **0860.15**: Ambient clock has no effect with explicit temporal coordinate.
- **0860.17**: Changing OP changes ARC, not EC.
- **0860.18**: Unknown OP is rejected.
- **0860.19**: Invalid Target × OP is rejected.
- **0860.20**: Missing required assessment state fails closed.
- **0860.21 / 0860.22**: Pinned assessment state is deterministic and ambient-state independent.
- **0860.25 / 0860.26 / 0860.27**: Historical reconstruction remains non-authoritative and subject to explicit prohibition.
- **0860.31**: Same ACV may explicitly fill both state roles, with no alias fallback.
- **0860.32**: Deep immutability.
- **0860.33**: Existing RI request path remains sovereign.

### Additional mandatory tests

- `TEST 0860.35 — Invalid Manifest Cannot Produce SCC`
- `TEST 0860.36 — SCC Projection Future-Field Exclusion`
- `TEST 0860.37 — BCG Future-Metadata Exclusion`
- `TEST 0860.38 — Binding Cycle Rejected`
- `TEST 0860.39 — Free-Form relationKind Rejected`
- `TEST 0860.40 — Explicit Same-State Dual Binding Accepted`
- `TEST 0860.41 — Implicit State Fallback Rejected`
- `TEST 0860.42 — EC-to-Receipt Provenance Reference Preserved`

---

# 90. Final Contract Decisions

The Council hereby ratifies:

`C0860-01 through C0860-15`

from the original Contract Closure, together with:

`C0860-16 through C0860-32`

defined by this Final Ratification Amendment.

These decisions are mutually consistent and collectively establish the implementation boundary for AMS-0860.

---

# 91. Final No-New-Primitive Determination

Contract Closure confirms that AMS-0860 requires no new:

- Reality primitive;
- Profile primitive;
- lifecycle authority;
- trust authority;
- Evidence authority;
- Runtime;
- ExecutionReceipt constitution;
- federation sovereign;
- universal status system;
- public failure taxonomy;
- duplicate semantic manifest.

The required mechanics can be represented through:

```text
existing CompositionManifest
+ derived SCC identity
+ BCG closure structure
+ EC
+ ARC
+ existing ACV / Evidence / POL / SEC / RI references
+ existing CONTRACT-12 taxonomy
```

subject to repository reconnaissance.

---

# 92. Contract Surface Determination

The physical contract strategy is:

```text
REUSE FIRST
EXTEND MINIMALLY
DO NOT DUPLICATE
```

Specifically:

- **SCC**: Derived identity, not separately authored manifest.
- **BCG**: New application-level structural configuration representation where not already available.
- **EC**: Application/Z-PROF pre-execution coordinate.
- **ARC**: Application/Z-PROF assessment-request coordinate.
- **RI**: Existing execution path reused.
- **SEC/POL**: Existing authority outputs/references consumed.
- **Evidence**: Existing integrity model consumed.
- **CONTRACT-12**: Existing outward failure taxonomy reused.

---

# 93. Implementation Stop Conditions Reaffirmed

Jules SHALL stop rather than invent if repository reconnaissance shows implementation requires:

1. a duplicate SCC manifest;
2. a floating version resolver inside evaluation;
3. a second Runtime request system;
4. a second Resolution Graph replacing RI;
5. an ambient clock for semantic `T_e_input`;
6. ambient trust lookup during ARC processing;
7. a BCG whose identity depends on iteration order;
8. free-form BCG dependency semantics;
9. a universal lifecycle enum not supplied by governing authorities;
10. a parallel trust-state object replacing SEC/ACV;
11. mutation of historical ExecutionReceipts;
12. a new Evidence version system;
13. automatic inference of identity-bearing Manifest fields;
14. automatic inference of BCG dependencies from arbitrary structural references;
15. an unauthorized change to protected constitutional packages.

---

# 94. Contract Closure Verification

The Council finds:

| Contract Dimension                        | Final Status |
| ----------------------------------------- | ------------ |
| SCC source                                | CLOSED       |
| SCC validation prerequisite               | CLOSED       |
| SCC identity projection                   | CLOSED       |
| SCC allowlist rule                        | CLOSED       |
| SCC canonicalization                      | CLOSED       |
| BCG structure                             | CLOSED       |
| BCG authority metadata                    | CLOSED       |
| BCG edge semantics                        | CLOSED       |
| BCG cycle semantics                       | CLOSED       |
| BCG canonical identity                    | CLOSED       |
| BCG allowlist rule                        | CLOSED       |
| BCG / RI Resolution Graph distinction     | CLOSED       |
| Federation opacity                        | CLOSED       |
| EC structure                              | CLOSED       |
| authorizedInputs admission boundary       | CLOSED       |
| NEW_COMPOSITION boundary                  | CLOSED       |
| NEW_EVALUATION target                     | CLOSED       |
| EC → RI seam                              | CLOSED       |
| EC → ExecutionReceipt provenance relation | CLOSED       |
| temporal coordinates                      | CLOSED       |
| `T_e_input`                               | CLOSED       |
| `T_e_observed`                            | CLOSED       |
| ARC                                       | CLOSED       |
| OP vocabulary                             | CLOSED       |
| Target × OP matrix                        | CLOSED       |
| assessment-state pinning                  | CLOSED       |
| historical reconstruction                 | CLOSED       |
| revoked reconstruction                    | CLOSED       |
| assessment sovereignty                    | CLOSED       |
| CONTRACT-12 mapping                       | CLOSED       |
| deterministic test model                  | CLOSED       |
| protected boundary model                  | CLOSED       |

No unresolved contract question remains that would require Jules to choose constitutional meaning.

---

# 95. Final Contract Ratification

**AMS-0860-CONTRACT-CLOSURE — LIFECYCLE, VERSION BINDING, TRUST & OPERATION CONTRACTS**

**STATUS: RATIFIED — CONTRACTUALLY CLOSED**

**SEMANTIC FOUNDATION:** `RATIFIED — CLOSED`
**ARCHITECTURE:** `RATIFIED — CLOSED`
**CONTRACTS:** `RATIFIED — CLOSED`
**IMPLEMENTATION AUTHORITY:** `NONE — UNTIL AMS-0860 MANDATE IS ISSUED`

The constitutional sequence is now:

```text
Z-PROF-D5-R4-R3     RATIFIED — SEMANTICALLY CLOSED
        ↓
AMS-0860-ARCH-CLOSURE     RATIFIED — ARCHITECTURALLY CLOSED
        ↓
AMS-0860-CONTRACT-CLOSURE     RATIFIED — CONTRACTUALLY CLOSED
        ↓
AMS-0860     IMPLEMENTATION MANDATE
        ↓
Jules
        ↓
Verification / EVR
```

The next legitimate action is:

> **Draft and issue the final AMS-0860 Implementation Mandate.**

No further D5, Architecture Closure, or Contract Closure round is required unless repository reconnaissance reveals a genuine Stop Condition.

**END OF AMS-0860-CONTRACT-CLOSURE**

# AMS-0860-ARCH-CLOSURE — Lifecycle, Version Binding, Trust & Operation Architecture

**Program:** CAW-011 — Commerce Atlas Wedge
**Milestone:** M08.5 — Z-PROF Profile Architecture
**Workstream:** IT-0860 / AMS-0860 — Lifecycle & Versioning
**Document Class:** Architecture Closure
**Status:** **DRAFT — FOR COUNCIL REVIEW**
**Authority:** Zyppi Constitutional Council
**Semantic Authority:** `Z-PROF-D5-R4-R3 — RATIFIED / SEMANTICALLY CLOSED`
**Implementation Authority:** **NONE**
**Constitutional Modification Authority:** **NONE**
**Target Next Stage:** Contract Closure → AMS-0860 Implementation Mandate
**Date:** 2026-08-18

---

# 1. Purpose

`AMS-0860-ARCH-CLOSURE` converts the ratified lifecycle, version-binding, trust, historical-reconstruction, and assessment semantics of `Z-PROF-D5-R4-R3` into an implementation-facing architecture.

The governing semantic model establishes:

```text
Artifact Lifecycle
        ≠
Semantic Configuration
        ≠
Bound Configuration
        ≠
Evaluation Coordinate
        ≠
Assessment Request
        ≠
ExecutionReceipt
        ≠
Current Assessment
```

and:

```text
EC  = what was evaluated
ARC = what is being asked about it now
```

This Architecture Closure SHALL define:

1. where `SCC`, `BCG`, `EC`, and `ARC` live;
2. how they relate to the existing `CompositionManifest`;
3. how exact version binding is enforced;
4. how transitive dependency closure is represented;
5. how lifecycle and trust state enter Z-PROF without becoming Z-PROF-owned state;
6. how `T_v`, `T_o`, `T_e`, and `T_trust` are carried;
7. how historical reconstruction differs mechanically from new evaluation;
8. how federated opacity boundaries remain deterministic;
9. how missing or unresolved configuration fails closed;
10. how these structures remain compatible with RI, SEC, POL, Evidence, and future replay/provenance architecture.

This document SHALL NOT define new lifecycle semantics or new trust authority.

---

# 2. Governing Semantic Baseline

The following semantic laws are treated as closed architecture inputs.

## 2.1 Historical Coordinates Are Immutable

Once an Evaluation Coordinate exists, a later operation SHALL NOT mutate it.

## 2.2 Operation Is External to EC

```text
OP ∉ EC
```

Operation belongs to `ARC`.

## 2.3 No Floating Versions

Evaluation-time references SHALL NOT use:

```text
latest
current
compatible
^x.y
>=x
ambient Registry head
```

Exact references SHALL already be bound.

## 2.4 No Hidden Dependencies

Every evaluation-affecting binding dependency SHALL be explicitly closed or terminate at an explicitly governed Constitutional Opacity Boundary.

## 2.5 No Ambient Trust State

Trust/admissibility assessment SHALL consume an explicitly pinned assessment state.

## 2.6 No Historical Rewrite

Subsequent Policy, Security, Evidence, Federation, lifecycle, or revocation changes create new assessments.

They SHALL NOT rewrite historical ECs or ExecutionReceipts.

## 2.7 Sovereign Authority Remains External

Z-PROF SHALL NOT become:

- lifecycle authority;
- trust authority;
- Policy authority;
- revocation authority;
- Evidence authority;
- Federation authority;
- Runtime execution authority.

---

# 3. Architectural Layers

AMS-0860 adopts the following architecture:

```text
                    AUTHORING / DOMAIN INPUT
                               │
                               ▼
                     Domain Template Card
                               │
                               ▼
                   Composition Requirements
                               │
                     authorized resolution
                               ▼
                    CompositionManifest
                     exact version-bound
                               │
                               ▼
                 Semantic Configuration
                            SCC
                               │
                               ▼
                  Dependency Closure
                               │
                               ▼
                  Bound Configuration
                            BCG
                               │
                               ▼
                  Evaluation Assembly
                               │
                               ▼
                  Evaluation Coordinate
                            EC
                               │
                  ┌────────────┴────────────┐
                  ▼                         ▼
           RI / Evaluation             Historical target
                  │                         │
                  ▼                         ▼
           ExecutionReceipt        Assessment Request
                                           ARC
                                            │
                             ┌──────────────┼──────────────┐
                             ▼              ▼              ▼
                            SEC            POL         Federation /
                          Trust          Admiss.       other authority
                             └──────────────┼──────────────┘
                                            ▼
                                   Assessment Result
```

Each stage has a distinct responsibility.

---

# 4. A-0860-01 — Semantic Configuration Coordinate Architecture

The `SemanticConfigurationCoordinate` (`SCC`) SHALL be a declarative immutable structure identifying the exact reusable semantic configuration.

It SHALL contain exact references to all identity-bearing semantic dimensions applicable to that configuration.

Conceptually:

```text
SemanticConfigurationCoordinate
├── compositionIdentity
├── compositionVersion
├── profileReferences[]
├── domainTemplateCardReference
├── epistemicRequirementReferences[]
├── projectionRequirementReferences[]
├── reasoningRequirementReferences[]
├── contextDefinitionReferences[]
├── policyRequirementReferences[]
├── securityRequirementReferences[]
├── runtimeCapabilityRequirementReferences[]
├── temporalApplicabilityRuleReferences[]
├── federationPolicyRequirementReferences[]
└── semanticParameterSignatures[]
```

The exact field names are deferred to Contract Closure.

## 4.1 SCC SHALL contain references, not owned semantic payloads

The SCC SHALL NOT become a duplicate repository of:

- ARM Profile definitions;
- Policy documents;
- RSN Blueprints;
- PRJ Specifications;
- SEC trust state;
- Evidence payloads.

It contains governed identity/version references.

## 4.2 SCC identity

The SCC SHALL be deterministically identifiable.

The exact identity mechanism is deferred to Contract Closure.

Acceptable architectural possibilities include:

- deterministic digest;
- existing manifest-derived identity;
- another already-ratified canonical identity mechanism.

No random or environment-dependent SCC identity is permitted.

---

# 5. A-0860-02 — CompositionManifest Relationship

The `CompositionManifest` and SCC SHALL remain distinct.

## CompositionManifest

The CompositionManifest is the concrete validated exact binding produced from composition requirements.

It answers:

> Which exact governed artifacts are bound for this composition?

## SCC

The SCC identifies the resulting reusable semantic configuration.

It answers:

> Which exact governed semantic configuration does this manifest establish?

Conceptually:

```text
DTC / Requirements
        │
        ▼
exact resolution
        │
        ▼
CompositionManifest
        │
        ├── validates exact bindings
        │
        ▼
       SCC
```

The architecture SHALL NOT introduce a second manifest merely to restate the same references.

Contract Closure SHALL determine whether the SCC:

1. is derived from the CompositionManifest;
2. is embedded as a canonical identity coordinate within it;
3. or is represented by a distinct immutable structure.

The semantic distinction SHALL remain regardless of representation.

---

# 6. A-0860-03 — Exact Version Resolution Boundary

Version constraints may exist during authoring.

Examples:

```text
Profile ^2.x
Policy compatible with 4.x
```

But these SHALL NOT survive into evaluation.

The architecture therefore requires:

```text
Authoring Constraint
        │
        ▼
Application / Registry Resolution
        │
        ▼
Exact Governed Reference
        │
        ▼
Validated CompositionManifest
```

Example:

```text
Profile ^2.x
        ↓
Profile@2.4.1
```

Z-PROF SHALL NOT perform a `latest` lookup during evaluation.

## 6.1 Authority boundary

Resolution of ranges to exact versions belongs to authorized Application / Registry / resolution capabilities.

Z-PROF:

- validates exactness;
- validates compatibility against explicit inputs;
- fails closed where exact binding is absent.

Z-PROF does not choose the version.

---

# 7. A-0860-04 — Bound Configuration Graph Architecture

The `BoundConfigurationGraph` (`BCG`) represents the exact evaluation-affecting dependency closure.

Conceptually:

```text
BCG
├── nodes[]
├── bindingEdges[]
├── opacityBoundaries[]
└── externalIntegrityReferences[]
```

where:

### `nodes[]`

Contain exact governed artifact identities/versions.

### `bindingEdges[]`

Represent explicit evaluation-affecting dependency relationships.

### `opacityBoundaries[]`

Represent explicit constitutional boundaries where local transitive visibility legitimately terminates.

### `externalIntegrityReferences[]`

Bind the exact integrity identity of a foreign result/receipt where required.

---

# 8. A-0860-05 — BCG Scope

The BCG SHALL contain only configuration/binding information.

The BCG MAY contain:

- exact artifact identity;
- exact artifact version/reference;
- exact binding dependency;
- exact temporal applicability rule reference;
- exact federation policy reference;
- exact foreign interface reference;
- immutable foreign result/receipt digest.

The BCG SHALL NOT contain:

- current lifecycle state;
- current trust state;
- current admissibility state;
- runtime execution output;
- mutable SEC state;
- mutable Policy state;
- ambient Registry state;
- unresolved dynamic results.

This prevents the BCG from becoming runtime state.

---

# 9. A-0860-06 — Evaluation-Affecting Dependency Closure

The architecture SHALL derive BCG closure only from explicit governed dependency declarations.

Sources may include:

- `T_bind`;
- CompositionManifest dependency declarations;
- exact Profile requirements;
- exact temporal applicability rules;
- Policy requirements;
- Security requirements;
- RSN requirements;
- Projection requirements;
- federation contract/interface requirements.

Z-PROF SHALL NOT discover semantic dependencies by inspecting arbitrary payload content or source code.

## 9.1 Closure invariant

For any declared evaluation-affecting dependency:

```text
A@1 → B@3
B@3 → C@7
```

the BCG SHALL contain:

```text
A@1
B@3
C@7
```

unless closure legitimately terminates at a governed opacity boundary.

Missing required closure SHALL fail closed.

---

# 10. A-0860-07 — Constitutional Opacity Boundary

A federated or sovereign boundary may terminate local dependency visibility.

Example:

```text
Local Configuration
        │
        ▼
ForeignInterface@4
        │
        ├── ForeignAuthorityRef
        ├── ForeignReceiptDigest
        └── LocalFederationPolicy@2
        │
        ▼
Foreign internals remain opaque
```

The local architecture SHALL NOT require ingestion of the foreign domain's internal graph.

However:

```text
Opacity ≠ Floating Identity
```

The consumed foreign interaction SHALL remain exact and integrity-bound.

---

# 11. A-0860-08 — BCG Deterministic Identity

Equivalent bound configurations SHALL have equivalent BCG identity.

Formally:

```text
Equivalent nodes
+ Equivalent binding edges
+ Equivalent opacity-boundary references
+ Equivalent external integrity references
        ↓
Equivalent BCG identity
```

The exact canonicalization/hash mechanism is deferred to Contract Closure.

It SHOULD reuse existing canonicalization infrastructure rather than invent a competing identity mechanism.

---

# 12. A-0860-09 — Evaluation Coordinate Architecture

The `EvaluationCoordinate` (`EC`) identifies the exact semantic and instance inputs used for one evaluation.

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

`OP` SHALL NOT be included.

---

# 13. A-0860-10 — Evaluation Temporal Coordinates

The architecture distinguishes:

```text
T_v       Reality Valid Time
T_o       Observation / Evidence Time
T_e       evaluation-effective execution time coordinate
```

`T_trust` SHALL NOT be part of the historical EC.

It belongs to assessment.

---

# 14. A-0860-11 — Explicit Evaluation-Effective T_e

Where a bound Temporal Applicability Rule makes `T_e` evaluation-affecting, the value SHALL be explicitly supplied before semantic evaluation.

The architecture SHALL distinguish:

```text
T_e_input
```

from:

```text
T_e_observed
```

### `T_e_input`

Explicit authorized semantic input used by the evaluation.

### `T_e_observed`

Actual execution timestamp recorded during/after Runtime execution.

They may be equal as values.

They remain different architectural roles.

The Runtime SHALL NOT silently satisfy a required `T_e_input` by reading the ambient system clock.

---

# 15. A-0860-12 — Temporal Applicability Rules

The rule determining temporal applicability SHALL itself be exactly bound.

Example:

```text
Policy@7 + TemporalApplicabilityRule@2
```

The rule may establish application according to:

- `T_v`;
- `T_o`;
- `T_e`;
- effective interval;
- retroactive interval;
- another authorized temporal coordinate.

Z-PROF SHALL NOT choose which temporal dimension controls applicability.

## 15.1 Temporal rule dependencies

Temporal applicability rules themselves SHALL participate in BCG closure where they have dependencies.

Example:

```text
TemporalRule@2 → RuleDependency@5
```

requires exact binding of both unless a governed opacity boundary applies.

---

# 16. A-0860-13 — Evidence Coordinate Architecture

Evidence participation SHALL be separated into:

```text
EvidenceIntegrityCoordinate
EvidenceAvailabilityState
EvidenceTrustDetermination
```

Only the exact Evidence integrity identity belongs in the historical EC/BCG where the Evidence affected the evaluation.

Availability and current trust SHALL NOT mutate historical configuration identity.

## 16.1 Evidence integrity

The EC MAY contain:

- `evidenceReference`
- `evidenceDigest`
- `evidenceBundleDigest`

as established by the governing Evidence contracts.

AMS-0860 SHALL NOT invent an Evidence versioning model.

---

# 17. A-0860-14 — Pinned Semantic State

Every evaluation SHALL operate against an explicitly identified constitutional semantic state.

Conceptually:

```text
PinnedSemanticStateRef
```

This may correspond to an existing ACV or exact equivalent established by the governing architecture.

No evaluation may depend upon:

> whatever Registry currently contains

after coordinate closure.

---

# 18. A-0860-15 — Assessment Request Coordinate Architecture

The `AssessmentRequestCoordinate` (`ARC`) SHALL be structurally separate from EC.

Conceptually:

```text
AssessmentRequestCoordinate
├── targetRef
├── operation
├── pinnedAssessmentStateRef
├── trustAssessmentTime
└── applicableAssessmentRuleRefs[]
```

The ARC answers:

> What constitutional question is being asked about this target now?

---

# 19. A-0860-16 — Primitive Operation Set

For AMS-0860:

- `NEW_COMPOSITION`
- `NEW_EVALUATION`
- `HISTORICAL_RECONSTRUCTION`
- `RECEIPT_VERIFICATION`

are the closed primitive operation set.

No implementation may create new primitives such as:

- `CURRENT_TRUSTED_REPLAY`
- `AUDIT_REPLAY`
- `REFRESH`
- `RECHECK`
- `MIGRATION_REPLAY`

without constitutional authorization.

Such workflows must compose existing operations or belong to future mandates.

---

# 20. A-0860-17 — ARC Target Compatibility

ARC SHALL enforce valid `Target × OP` combinations.

Initial architecture:

| OP                          | Permitted Target                                               |
| --------------------------- | -------------------------------------------------------------- |
| `NEW_COMPOSITION`           | governed composition authoring/definition inputs               |
| `NEW_EVALUATION`            | exact validated executable configuration                       |
| `HISTORICAL_RECONSTRUCTION` | historical EC or exact historical configuration                |
| `RECEIPT_VERIFICATION`      | ExecutionReceipt plus required provenance/integrity references |

Invalid combinations SHALL fail structurally.

Examples:

```text
RECEIPT_VERIFICATION + SCC → invalid
NEW_EVALUATION + ExecutionReceipt → invalid
```

Z-PROF SHALL NOT silently reinterpret the operation.

---

# 21. A-0860-18 — Pinned Assessment State

Any trust/admissibility assessment SHALL consume:

```text
PinnedAssessmentStateRef
```

The representation SHALL reuse existing constitutional trust/state infrastructure where possible.

Potential sources may include:

- ACV;
- SEC-governed state;
- Registry constitutional view;
- other already-ratified representation.

No new trust primitive is authorized by this architecture.

## 21.1 Live state query boundary

A live authority may be queried before assessment.

Example:

```text
SEC current state query
        ↓
TrustState@31
        ↓
ARC binds TrustState@31
        ↓
assessment
```

But assessment itself SHALL NOT contain hidden live lookups.

---

# 22. A-0860-19 — T_trust Architecture

`T_trust` belongs to ARC.

```text
T_trust
```

represents the time at which trust/admissibility is being assessed.

It is distinct from:

```text
T_v
T_o
T_e
```

The trust authority defines the meaning of trust at `T_trust`.

Z-PROF only carries the coordinate.

---

# 23. A-0860-20 — Assessment Result Architecture

Assessment may conceptually expose:

- `Reproducible`
- `Executable`
- `CurrentlyTrusted`
- `CurrentlyAdmissible`

However, these SHALL be independently sourced determinations.

Architecturally:

```text
AssessmentResult
├── reproducibility
│   ├── outcome
│   ├── authority/provenance
│   └── governing references
├── executability
│   ├── outcome
│   ├── authority/provenance
│   └── governing references
├── trust
│   ├── outcome
│   ├── authority/provenance
│   └── governing references
└── admissibility
    ├── outcome
    ├── authority/provenance
    └── governing references
```

The aggregate SHALL NOT become a new Z-PROF sovereign state object.

---

# 24. A-0860-21 — Historical Reconstruction Architecture

Historical reconstruction SHALL operate against exact historical coordinates.

Required source data includes, as applicable:

- historical SCC
- historical BCG
- historical pinned semantic state
- historical Context
- historical Evidence integrity references
- historical evaluation parameters
- historical temporal coordinates

It SHALL NOT silently substitute current versions.

## 24.1 Non-authoritative output

Historical reconstruction output SHALL be explicitly distinguishable from:

- historical ExecutionReceipt;
- current new evaluation;
- current trust determination;
- current admissibility determination.

It SHALL NOT:

- generate replacement historical truth;
- issue current trust;
- create current execution authorization;
- overwrite the original receipt;
- trigger downstream execution as a new evaluation without a separate `NEW_EVALUATION` operation.

---

# 25. A-0860-22 — Revoked Material in Reconstruction

Historical reconstruction of revoked material SHALL be architecturally permitted as a non-authoritative analytical operation unless an explicitly bound applicable sovereign rule prohibits it.

Flow:

```text
historical EC + HISTORICAL_RECONSTRUCTION + PinnedAssessmentState + ApplicableAssessmentRules
        ↓
check explicit sovereign prohibition
        │
        ├── prohibited → FAIL CLOSED
        └── not prohibited → reconstruct analytically
```

Z-PROF SHALL NOT infer prohibition solely from `revoked`.

---

# 26. A-0860-23 — New Evaluation from Historical Inputs

A present execution using historical configuration is still:

```text
NEW_EVALUATION
```

It SHALL NOT use a special replay path.

Flow:

```text
Historical SCC / BCG / Context / Evidence
        │
        ▼
new current evaluation request
        │
        ▼
current admission / trust / policy requirements
        │
        ▼
NEW_EVALUATION
```

Historical reproducibility does not bypass current execution admission.

---

# 27. A-0860-24 — Receipt Verification Architecture

Receipt Verification targets:

```text
ExecutionReceipt
```

plus whatever exact provenance/integrity artifacts the governing replay/evidence architecture requires.

It SHALL remain independent from historical reconstruction.

Possible state:

```text
ReceiptVerified = true
HistoricalReconstructionComplete = false
```

is constitutionally valid.

The exact verification mechanics remain delegated to AMS-0863 / SEC / Evidence contracts.

---

# 28. A-0860-25 — Historical Result and Current Assessment

The architecture SHALL treat later assessments as append-only relations.

```text
ExecutionReceipt@T1
    result = APPROVED
```

may later have:

```text
Assessment@T2
    result = NON_COMPLIANT
```

and:

```text
Assessment@T3
    result = REVOKED / OTHER GOVERNED STATE
```

No later assessment SHALL mutate the original ExecutionReceipt.

---

# 29. A-0860-26 — Retroactive Rule Architecture

Retroactive applicability SHALL be represented by exact:

- `PolicyReference`
- `TemporalApplicabilityRuleReference`
- `AssessmentTemporalCoordinates`

A retroactive rule produces a new assessment.

It does not modify the historical evaluation coordinate.

---

# 30. A-0860-27 — Federation Architecture

Federated participation SHALL preserve:

- `ForeignInterface@exact`
- `ForeignAuthorityRef`
- `ForeignResultIntegrityRef`
- `LocalFederationPolicy@exact`

where applicable.

Foreign internals remain under foreign authority.

Local admissibility remains under local authority.

Z-PROF creates no superior federation lifecycle authority.

---

# 31. A-0860-28 — Missing Historical Artifact Behavior

If an exact historical artifact is unavailable:

```text
known exact identity + payload unavailable
```

SHALL NOT trigger:

```text
substitute newer version
```

The applicable existing failure taxonomy SHALL be used.

Contract Closure SHALL map exact failure conditions to existing `CONTRACT-12` states.

---

# 32. A-0860-29 — Determinism Architecture

Two separate determinism domains SHALL exist.

## Evaluation determinism

```text
same complete EC
        ↓
same deterministic evaluation result
```

for deterministic constitutional capabilities.

## Assessment determinism

```text
same complete ARC
        ↓
same deterministic assessment result
```

for deterministic assessment capabilities.

No ambient semantic or trust state may affect either.

---

# 33. A-0860-30 — Immutability Requirements

The following SHALL be immutable after successful construction:

- SCC;
- BCG;
- EC;
- ARC for a particular assessment request;
- historical ExecutionReceipt.

Mutation SHALL require creation of a new governed object/coordinate rather than in-place alteration.

Exact code-level immutability mechanisms are deferred to Contract Closure.

---

# 34. A-0860-31 — Failure Model

AMS-0860 SHALL reuse the closed `CONTRACT-12` outward validation taxonomy:

- `unsupported`
- `unavailable`
- `missing`
- `incompatible`
- `conflicting`
- `unauthorized`
- `unverified`
- `invalid`

No lifecycle-specific public parallel failure constitution is authorized.

Internal diagnostics MAY distinguish cases such as:

- `FLOATING_VERSION`
- `INCOMPLETE_BINDING_CLOSURE`
- `MISSING_TEMPORAL_RULE`
- `MISSING_ASSESSMENT_STATE`
- `INVALID_OPERATION_TARGET`
- `HISTORICAL_ARTIFACT_UNAVAILABLE`
- `RECONSTRUCTION_PROHIBITED`

but outward disposition SHALL map to the existing contract taxonomy.

---

# 35. A-0860-32 — No Runtime Replacement

AMS-0860 SHALL NOT implement an alternative Runtime.

Specifically Z-PROF SHALL NOT:

- execute RI bundles;
- activate Runtime stages;
- produce Runtime lifecycle state;
- replace RI Dependency Resolution;
- create alternative ExecutionReceipts;
- create new execution admission semantics.

It supplies exact coordinates and validates structural closure.

RI executes according to its own authority.

---

# 36. A-0860-33 — No SEC/POL Replacement

Z-PROF SHALL NOT decide:

- "this artifact is trusted"
- "this actor is authorized"
- "this Policy permits execution"
- "this revocation is valid"

except to consume already-authoritative determinations or explicit governed assessment capabilities.

---

# 37. A-0860-34 — No Evidence Authority

Z-PROF may carry:

- `EvidenceRef`
- `EvidenceDigest`
- `EvidenceBundleDigest`

but SHALL NOT:

- determine Evidence truth;
- mutate Evidence;
- create Evidence trust state;
- invent Evidence lifecycle.

---

# 38. A-0860-35 — Architecture Disappearance Test

If the AMS-0860 Z-PROF architecture disappears:

- ARM lifecycle remains valid;
- PRJ lifecycle remains valid;
- POL lifecycle remains valid;
- SEC revocation/trust remains valid;
- RSN artifacts remain valid;
- Evidence remains valid;
- Registry state remains valid;
- RI execution remains valid;
- ExecutionReceipts remain valid.

Only the Z-PROF composition/evaluation coordinate machinery disappears.

This confirms connective rather than sovereign architecture.

---

# 39. Architectural Data-Flow Summary

```text
                        AUTHORING
                            │
                            ▼
                   Domain Template Card
                            │
                            ▼
                Authorized Version Resolution
                            │
                            ▼
                  CompositionManifest
                    exact references
                            │
                            ▼
                          SCC
                            │
                            ▼
                     BCG Closure
                            │
                            ▼
             ┌─────────────────────────┐
             │                         │
             ▼                         ▼
          NEW EVAL               HISTORICAL TARGET
             │                         │
             ▼                         ▼
            EC                       ARC
             │                         │
             ▼               ┌─────────┼─────────┐
             RI              ▼         ▼         ▼
             │              SEC       POL      FED/OTHER
             ▼               └─────────┼─────────┘
      ExecutionReceipt                 ▼
                                AssessmentResult
```

---

# 40. Architecture Validation Matrix

Before Contract Closure, this architecture SHALL pass the following tests.

| Test                                                    | Expected Result                                              |
| ------------------------------------------------------- | ------------------------------------------------------------ |
| A — Profile v1 superseded                               | Historical SCC/EC unchanged                                  |
| B — Profile later revoked                               | Historical receipt unchanged; current assessment separate    |
| C — Floating version reaches evaluation                 | Fail closed                                                  |
| D — Transitive dependency missing                       | Fail closed                                                  |
| E — Transitive dependency upgraded in Registry          | Historical BCG unchanged                                     |
| F — Explicit opacity boundary                           | Closure terminates lawfully                                  |
| G — Foreign result changes                              | New foreign integrity ref / new bound interaction            |
| H — Same SCC, different Context                         | Same SCC, different EC where Context is instance-bearing     |
| I — Evaluation-effective `T_e` missing                  | Fail closed                                                  |
| J — Ambient Runtime clock differs                       | No semantic effect unless explicitly bound                   |
| K — Same EC, different OP                               | Same EC, different ARC                                       |
| L — Same ARC repeated                                   | Same deterministic assessment                                |
| M — Trust state changes                                 | Different pinned assessment state / different ARC            |
| N — Revoked historical artifact reconstruction          | Analytical reconstruction unless explicit rule prohibits     |
| O — Historical reconstruction used as current execution | Rejected; requires NEW_EVALUATION                            |
| P — Receipt Verification without full reconstruction    | Architecturally permitted where receipt contract supports it |
| Q — Retroactive Policy                                  | New append-only assessment                                   |
| R — Missing historical Evidence                         | No substitution                                              |
| S — Invalid OP/Target pair                              | Structural failure                                           |
| T — BCG contains mutable trust state                    | Invalid architecture                                         |
| U — Z-PROF computes trust itself                        | Prohibited                                                   |
| V — Z-PROF resolves latest version during evaluation    | Prohibited                                                   |
| W — Remove Z-PROF                                       | Sovereign subsystems remain valid                            |

---

# 41. Architecture-to-Contract Requirements

Contract Closure SHALL materialize at minimum the following contracts or contract amendments.

## AC-0860-01 — SemanticConfigurationCoordinate Contract

Defines:

- exact allowed identity-bearing references;
- identity determinism;
- immutability;
- relationship to CompositionManifest.

## AC-0860-02 — BoundConfigurationGraph Contract

Defines:

- node/reference shape;
- binding edge shape;
- closure rules;
- opacity boundary representation;
- deterministic identity;
- external integrity reference representation.

## AC-0860-03 — EvaluationCoordinate Contract

Defines:

- SCC/BCG references;
- pinned semantic state;
- bound Context;
- Evidence integrity coordinates;
- authorized inputs;
- evaluation parameters;
- temporal coordinates;
- immutability.

## AC-0860-04 — AssessmentRequestCoordinate Contract

Defines:

- target reference;
- primitive OP;
- OP/Target validation;
- pinned assessment state;
- `T_trust`;
- applicable assessment rules;
- immutability.

## AC-0860-05 — Temporal Binding Contract

Defines:

- `T_v`;
- `T_o`;
- evaluation-effective `T_e`;
- observed execution time distinction;
- `T_trust`;
- temporal applicability rule reference requirements.

## AC-0860-06 — Historical Reconstruction Boundary Contract

Defines:

- required historical inputs;
- explicit non-authoritative status;
- revoked-material handling;
- sovereign prohibition path;
- prohibition against new execution authority.

## AC-0860-07 — Lifecycle/Version Failure Mapping

Maps lifecycle/version structural failures to `CONTRACT-12`.

---

# 42. Contract Reuse Requirement

Contract Closure SHALL first determine whether these requirements can be materialized through:

- extension of `CONTRACT-R1`;
- existing `CompositionManifest`;
- existing ACV structures;
- existing provenance/evidence structures;
- existing RI/SEC/POL references.

A new primitive SHALL be introduced only if:

1. existing constitutional structures cannot express the required semantics;
2. reuse would materially conflate sovereign responsibilities;
3. the No-New-Primitive test is explicitly passed.

---

# 43. Contract Closure Stop Conditions

Contract Closure SHALL stop and return to Council if it discovers that implementation requires:

- a new universal lifecycle state machine;
- a new trust-state authority;
- a new revocation primitive;
- a new Runtime execution path;
- a new Evidence authority;
- a new federation sovereign;
- mutation of historical ExecutionReceipts;
- dynamic `latest` resolution at evaluation time;
- semantic inference of hidden dependencies;
- ambient trust lookup inside deterministic assessment.

No implementation convenience may override these stop conditions.

---

# 44. Implementation Scope Candidate

Subject to Contract Closure, implementation is expected primarily within:

```text
apps/api/src/zprof/
```

Potential implementation concerns include:

```text
semanticConfiguration.ts
boundConfiguration.ts
evaluationCoordinate.ts
assessmentRequest.ts
lifecycleValidation.ts
temporalBinding.ts
historicalReconstruction.ts
```

These filenames are illustrative only.

Architecture Closure does not authorize their creation.

The implementation mandate SHALL determine exact locations after repository reconnaissance.

---

# 45. Protected Boundaries

AMS-0860 implementation SHALL NOT modify without separate authority:

```text
packages/runtime/
packages/domain/
packages/contracts/
infra/
edge/
```

unless Contract Closure explicitly identifies an authorized required contract addition and the Chair separately authorizes that change.

Constitutional documents SHALL NOT be edited by Jules unless the Chair supplies exact replacement text.

---

# 46. Implementation Readiness Assessment

The semantic questions are closed.

The architecture establishes concrete ownership and data-flow boundaries.

However, implementation SHALL NOT begin yet because the following Contract Closure work remains:

1. exact SCC representation;
2. exact BCG representation;
3. exact relationship to CompositionManifest;
4. deterministic BCG/SCC identity mechanics;
5. EC shape;
6. ARC shape;
7. OP/Target validation contract;
8. temporal-coordinate representation;
9. pinned assessment state reference model;
10. historical reconstruction status/boundary representation;
11. `CONTRACT-12` failure mappings;
12. exact reuse versus extension of existing CONTRACT-R1 structures.

---

# 47. Council Review Questions

The Council should review only the architecture questions below.

## Q1 — SCC / CompositionManifest Representation

Does the architecture preserve their semantic distinction without unnecessarily duplicating structures?

## Q2 — BCG Boundary

Does the BCG contain only immutable configuration identity/binding information?

## Q3 — Opacity Boundary

Is binding the exact foreign interface plus authority plus result/receipt integrity reference sufficient to preserve deterministic local meaning without importing foreign internals?

## Q4 — Evaluation-Effective `T_e`

Does the explicit pre-execution binding model eliminate ambient clock dependence without conflating the semantic time input with observed Runtime execution time?

## Q5 — ARC

Does ARC cleanly isolate present operations/trust assessment from historical EC identity?

## Q6 — Reconstruction

Does the architecture permit historical auditability without allowing reconstruction to acquire present execution authority?

## Q7 — Authority Preservation

Does any proposed structure cause Z-PROF to become lifecycle, trust, Evidence, Policy, Federation, or Runtime authority?

## Q8 — Contract Sufficiency

Can these structures be expressed by extending the existing Z-PROF contract family, or is any genuinely new contract primitive constitutionally necessary?

---

# 48. Proposed Architecture Disposition

The architecture defined in `AMS-0860-ARCH-CLOSURE` is proposed for Council approval under the following interpretation:

```text
Semantic Configuration (SCC)
        ↓
Exact Dependency Binding (BCG)
        ↓
Evaluation Instance (EC)
        ↓
Execution / Historical Target
        ↓
Assessment Request (ARC)
        ↓
Sovereign Current Assessment
```

The architecture preserves the constitutional laws:

```text
No Floating
No Hidden Dependency
No Ambient Semantic State
No Ambient Trust State
No Implicit Upgrade
No Historical Rewrite
No Trust Invention
No Lifecycle Invention
No Special Replay Bypass
```

---

# 49. Current Disposition

**AMS-0860-ARCH-CLOSURE — LIFECYCLE, VERSION BINDING, TRUST & OPERATION ARCHITECTURE**

**STATUS: DRAFT — FOR COUNCIL REVIEW**

**SEMANTIC FOUNDATION: CLOSED**

**ARCHITECTURE CLOSURE: PENDING COUNCIL APPROVAL**

**CONTRACT CLOSURE: NOT YET COMPLETE**

**IMPLEMENTATION AUTHORITY: NONE**

If Council review confirms this architecture without identifying a constitutional contradiction, the next action SHALL be:

```text
AMS-0860-ARCH-CLOSURE
        ↓
RATIFIED — ARCHITECTURALLY CLOSED
        ↓
AMS-0860-CONTRACT-CLOSURE
        ↓
AMS-0860 Implementation Mandate
        ↓
Jules
```

**END OF AMS-0860-ARCH-CLOSURE**

---

# AMS-0860-ARCH-CLOSURE — FINAL RATIFICATION AMENDMENT

**Program:** CAW-011 — Commerce Atlas Wedge
**Milestone:** M08.5 — Z-PROF Profile Architecture
**Workstream:** IT-0860 / AMS-0860 — Lifecycle & Versioning
**Document Class:** Architecture Closure
**Status:** **RATIFIED — ARCHITECTURALLY CLOSED**
**Authority:** Zyppi Constitutional Council
**Semantic Authority:** `Z-PROF-D5-R4-R3 — RATIFIED / SEMANTICALLY CLOSED`
**Implementation Authority:** **NONE**
**Next Stage:** `AMS-0860-CONTRACT-CLOSURE`
**Date:** 2026-08-18

---

# 50. Council Review Disposition

Council review has identified no constitutional contradiction requiring reopening of the architecture.

The following architecture is therefore ratified:

```text
CompositionManifest
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
historical/configuration target
        │
        ▼
Assessment Request Coordinate
        ARC
        │
        ▼
independent sovereign determinations
        │
        ▼
AssessmentResult
```

The architecture remains governed by:

```text
No Floating Versions
No Hidden Dependencies
No Ambient Semantic State
No Ambient Trust State
No Implicit Upgrade
No Historical Rewrite
No Trust Invention
No Lifecycle Invention
No Special Replay Bypass
```

---

# 51. A-0860-36 — SCC Shall Not Duplicate CompositionManifest

The Council adopts the anti-duplication principle raised during Architecture Review.

`SCC` SHALL NOT become an independently maintained second manifest containing a duplicate copy of the semantic references already authoritatively represented by the validated `CompositionManifest`.

The architectural relationship is:

```text
Validated CompositionManifest
        │
        │ canonical identity-bearing projection
        ▼
   SCC Identity
```

Therefore:

> **The SCC SHALL be deterministically derivable from the identity-bearing semantic projection of the validated CompositionManifest.**

The exact projection and digest mechanics are Contract Closure concerns.

This architecture deliberately does **not** yet assert:

```text
SCC = Hash(entire CompositionManifest)
```

because Contract Closure must first determine which Manifest fields are:

- semantic identity-bearing;
- instance-bearing;
- provenance-only;
- derived;
- operational;
- excluded from SCC identity.

No implementation shall maintain a mutable `SCC` structure independently from its authoritative CompositionManifest source.

---

# 52. A-0860-37 — SCC Identity Projection

Contract Closure SHALL define a deterministic function conceptually equivalent to:

```text
SCC_IDENTITY_DOMAIN(
    ValidatedCompositionManifest
)
    ↓
canonical identity-bearing semantic representation
    ↓
SCC Identity
```

The projection SHALL exclude any field that does not alter reusable semantic configuration identity.

At minimum, Contract Closure SHALL explicitly classify Manifest fields before identity generation.

The resulting rule SHALL guarantee:

```text
semantically equivalent manifests
        ↓
equivalent SCC identity
```

and:

```text
identity-bearing semantic difference
        ↓
different SCC identity
```

Dynamic execution coordinates SHALL NOT contaminate SCC identity.

---

# 53. A-0860-38 — Contract Consolidation Principle

The proposed `AC-0860-01` through `AC-0860-07` items remain valid **contract requirements**, but SHALL NOT be presumed to require seven independent constitutional contracts.

Contract Closure SHALL first attempt to materialize AMS-0860 through:

1. extensions to `CONTRACT-R1`;
2. extension or refinement of the existing `CompositionManifest`;
3. existing ACV / pinned-state structures;
4. existing Evidence and provenance references;
5. existing RI / SEC / POL integration references.

The architecture therefore distinguishes:

```text
seven contract requirements
        ≠
seven new contracts
```

The Contract Closure objective is minimum constitutional surface area.

A new standalone contract may be introduced only where:

1. an existing contract cannot express the requirement cleanly;
2. extending it would conflate sovereign responsibilities;
3. the No-New-Primitive test passes;
4. the Council explicitly authorizes the new contract.

---

# 54. A-0860-39 — BCG Canonical Identity Domain

BCG identity SHALL be deterministic and independent of construction order.

The identity domain SHALL include, where present:

- exact node identities and versions;
- exact binding edges;
- exact Constitutional Opacity Boundary references;
- exact external integrity references.

It SHALL exclude:

- mutable trust state;
- current lifecycle state;
- execution results themselves;
- ambient Registry state;
- database row ordering;
- in-memory ordering.

Contract Closure SHALL define canonical normalization.

At minimum, the canonicalization SHALL guarantee permutation invariance:

```text
same nodes, different insertion order
        ↓
same BCG identity
```

```text
same edges, different insertion order
        ↓
same BCG identity
```

```text
same opacity boundaries, different insertion order
        ↓
same BCG identity
```

The implementation SHOULD reuse existing canonicalization infrastructure, including JCS/RFC 8785 where applicable, rather than create an alternative canonicalization regime.

The exact lexical ordering and serialized schema belong to Contract Closure.

---

# 55. A-0860-40 — Foreign Integrity Reference Clarification

At a Constitutional Opacity Boundary, the BCG binds the integrity identity of the foreign interaction.

Conceptually:

```text
ForeignInterface@exact + ForeignAuthorityRef + ForeignResultIntegrityRef + LocalFederationPolicy@exact
```

`ForeignResultIntegrityRef` SHALL represent an immutable cryptographic or constitutionally equivalent integrity reference.

It SHALL NOT mean that the foreign Runtime result becomes mutable BCG state.

Therefore:

```text
BCG references foreign result integrity
```

is permitted.

```text
BCG owns foreign Runtime output
```

is prohibited.

---

# 56. A-0860-41 — Pinned Semantic and Assessment State Role Isolation

The architecture confirms:

```text
EC.PinnedSemanticStateRef
        ≠
ARC.PinnedAssessmentStateRef
```

as architectural roles.

They MAY resolve to the same governed constitutional object.

For example:

```text
PinnedSemanticStateRef   = ACV@17
PinnedAssessmentStateRef = ACV@17
```

is permitted.

But their meanings remain distinct:

### PinnedSemanticStateRef

Answers:

> Which exact constitutional state governed the semantic evaluation?

### PinnedAssessmentStateRef

Answers:

> Which exact constitutional/trust state is being used to assess the target under this ARC?

Equality of reference does not collapse the two coordinate roles.

---

# 57. A-0860-42 — Pre-Execution NEW_EVALUATION Target

Contract Closure SHALL NOT invent an ambiguous new object named `ExecutableConfiguration`.

For `NEW_EVALUATION`, the target SHALL resolve to an exact validated pre-execution configuration assembled from already-authorized structures.

Conceptually:

```text
Validated CompositionManifest + SCC identity + BCG + instance-bound inputs + PinnedSemanticState + required temporal coordinates
        ↓
EC-ready evaluation configuration
```

Contract Closure SHALL determine whether this is represented:

1. directly as the pre-execution `EC`;
2. through the existing `ExecutionRequest` plus referenced Z-PROF coordinates;
3. through a minimal extension of an existing request structure.

It SHALL NOT create a redundant fourth configuration manifest without constitutional necessity.

---

# 58. A-0860-43 — EC / ExecutionRequest Boundary

Contract Closure SHALL explicitly map the ratified EC architecture to the existing M08 / RI execution request surface.

The mapping must establish:

```text
Z-PROF Evaluation Coordinate
        │
        ▼
existing RI admission/request boundary
```

without making EC a parallel Runtime request constitution.

Contract Closure SHALL determine whether EC:

- is referenced by `ExecutionRequest`;
- contributes fields to it;
- is transformed into it through the Application layer.

The following are prohibited:

- duplicate execution admission semantics;
- a second Runtime request system;
- Z-PROF directly activating Runtime stages;
- Z-PROF producing Runtime lifecycle state.

---

# 59. A-0860-44 — Mandatory T_e_input Rule

Where a bound Temporal Applicability Rule references evaluation-effective execution time:

```text
TemporalApplicabilityRule
requires T_e
```

then:

```text
T_e_input
```

is mandatory before evaluation.

Absence SHALL fail closed.

There is no fallback to:

- `Date.now()`;
- system clock;
- observed Runtime time;
- request arrival time;
- database time;
- ambient environment time.

The observed Runtime execution timestamp remains:

```text
T_e_observed
```

and is historical execution evidence, not a retroactive semantic input.

---

# 60. A-0860-45 — Primitive Operation Schema Freeze

The primitive operation set for AMS-0860 is architecturally frozen as:

```text
NEW_COMPOSITION
NEW_EVALUATION
HISTORICAL_RECONSTRUCTION
RECEIPT_VERIFICATION
```

Contract Closure SHALL encode this as a closed vocabulary.

Unrecognized operation values SHALL fail structurally.

No extension mechanism, arbitrary string operation, or runtime registration of new operation classes is authorized under AMS-0860.

Future operation classes require Council authorization.

---

# 61. A-0860-46 — Assessment Determinations Remain Independent

The architecture confirms that:

- `Reproducible`
- `Executable`
- `CurrentlyTrusted`
- `CurrentlyAdmissible`

are independently sourced determinations.

Contract Closure SHALL NOT create a single sovereign Z-PROF status field whose value replaces those authorities.

If represented together, each determination SHALL preserve:

- outcome
- authorityRef
- ruleRef / governingRef
- stateRef
- temporal coordinate
- provenance

as applicable.

The aggregate remains derived output.

---

# 62. A-0860-47 — Architecture Contract Requirements, Consolidated

Contract Closure SHALL satisfy the following seven requirement groups without presuming seven independent contracts.

### CR-0860-A — Semantic Configuration Identity

Must define:

- SCC identity domain;
- CompositionManifest identity-bearing projection;
- deterministic identity;
- immutability.

### CR-0860-B — Bound Configuration Graph

Must define:

- nodes;
- binding edges;
- opacity boundaries;
- foreign integrity references;
- closure;
- deterministic canonicalization/identity.

### CR-0860-C — Evaluation Coordinate

Must define:

- SCC reference;
- BCG reference;
- pinned semantic state;
- bound Context;
- Evidence integrity;
- authorized inputs;
- evaluation parameters;
- temporal coordinates.

### CR-0860-D — Assessment Request

Must define:

- target;
- closed OP;
- Target/OP compatibility;
- pinned assessment state;
- `T_trust`;
- applicable assessment rules.

### CR-0860-E — Temporal Binding

Must define:

```text
T_v
T_o
T_e_input
T_e_observed
T_trust
```

and the exact Temporal Applicability Rule relationship.

### CR-0860-F — Historical Reconstruction Boundary

Must define:

- reconstruction inputs;
- non-authoritative disposition;
- revoked-material handling;
- sovereign prohibition path;
- prohibition against current execution authority.

### CR-0860-G — Failure Mapping

Must map lifecycle/version/closure failures into the existing `CONTRACT-12` outward taxonomy.

---

# 63. Contract Closure Mandatory Tests

The following SHALL be proven before AMS-0860 implementation authorization.

## CC-01 — SCC Anti-Duplication

No independently maintained duplicate semantic manifest exists.

## CC-02 — SCC Identity Determinism

Equivalent semantic Manifest projections produce equivalent SCC identity.

## CC-03 — SCC Identity Sensitivity

Changing an identity-bearing semantic reference changes SCC identity.

## CC-04 — SCC Instance Independence

Changing ordinary bound Context values does not mutate SCC identity.

## CC-05 — BCG Permutation Invariance

Node/edge/boundary insertion order does not change BCG identity.

## CC-06 — BCG Drift Protection

Current Registry changes cannot mutate an already-bound BCG.

## CC-07 — Opacity Determinism

Changing a foreign integrity reference changes the bound interaction identity even if the foreign interface version is unchanged.

## CC-08 — State Role Separation

Pinned semantic and pinned assessment state remain separate coordinate roles even when they reference the same ACV.

## CC-09 — No Ambient T_e

Required `T_e_input` absence fails closed.

## CC-10 — EC/RI Boundary

No parallel Runtime request/admission architecture is introduced.

## CC-11 — Operation Closure

Unknown OP values fail structurally.

## CC-12 — Target/Operation Compatibility

Invalid Target × OP pairs fail structurally.

## CC-13 — Reconstruction Isolation

Historical reconstruction cannot masquerade as NEW_EVALUATION.

## CC-14 — Historical Non-Rewrite

Later ARC processing cannot mutate EC or ExecutionReceipt.

## CC-15 — Failure Taxonomy Reuse

No lifecycle-specific outward error constitution is introduced.

---

# 64. Architecture Closure Determination

The Council reviews establish:

| Dimension            | Status                          |
| -------------------- | ------------------------------- |
| Semantic Layer       | **CLOSED.**                     |
| Architecture Layer   | **CLOSED.**                     |
| Contract Layer       | **OPEN — NEXT REQUIRED STAGE.** |
| Implementation Layer | **NOT AUTHORIZED.**             |

The remaining questions are contract representation and mechanical integration questions.

They do not require reopening the lifecycle semantic model.

---

# 65. Final Architecture Laws

The following architecture laws are hereby ratified.

## Law A — Manifest Is Authoritative Binding Source

SCC identity derives from authoritative Manifest semantics rather than duplicating them.

## Law B — BCG Is Configuration Closure

BCG contains immutable bound configuration—not trust state and not Runtime output.

## Law C — EC Is Historical Evaluation Identity

```text
EC = what was evaluated
```

## Law D — ARC Is Present Inquiry

```text
ARC = what is being asked now
```

## Law E — Receipt Is Execution Proof

```text
ExecutionReceipt = what actually happened
```

## Law F — Assessment Is Derived and Append-Only

```text
AssessmentResult = what governing authorities determine under ARC
```

It cannot rewrite its Target.

## Law G — Live State Must Be Pinned

Live state may be acquired.

Ambient state may not be consumed.

## Law H — Opacity Does Not Permit Nondeterminism

Foreign internals may remain opaque.

Foreign interaction identity may not float.

## Law I — Runtime Clock Is Not Semantic Authority

Evaluation-affecting time must be explicit.

## Law J — Contract Surface Must Remain Minimal

Reuse existing constitutional contracts before creating new ones.

---

# 66. Final Disposition

**AMS-0860-ARCH-CLOSURE — LIFECYCLE, VERSION BINDING, TRUST & OPERATION ARCHITECTURE**

**STATUS: RATIFIED — ARCHITECTURALLY CLOSED**

**SEMANTIC FOUNDATION: RATIFIED — CLOSED**
**ARCHITECTURE: RATIFIED — CLOSED**
**CONTRACT CLOSURE: REQUIRED NEXT**
**IMPLEMENTATION AUTHORITY: NONE**

The authorized next step is:

```text
AMS-0860-ARCH-CLOSURE     RATIFIED
        ↓
AMS-0860-CONTRACT-CLOSURE
        ↓
Council Contract Review
        ↓
Contract Ratification
        ↓
AMS-0860 Implementation Mandate
        ↓
Jules
        ↓
Verification
```

No Jules implementation work is authorized before Contract Closure.

**END OF AMS-0860-ARCH-CLOSURE**

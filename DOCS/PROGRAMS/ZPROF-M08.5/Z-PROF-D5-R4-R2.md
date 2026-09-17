# Z-PROF-D5-R4-R2 — Lifecycle, Version Binding, Trust & Operation Semantics

**Program:** CAW-011 — Commerce Atlas Wedge
**Milestone:** M08.5 — Z-PROF Profile Architecture
**Target Workstream:** AMS-0860 — Lifecycle & Versioning
**Decision Class:** Council Semantic Closure — Round 2
**Status:** **DRAFT — FINAL TARGETED COUNCIL STRESS-TEST**
**Authority:** Zyppi Constitutional Council
**Implementation Authority:** **NONE**
**Predecessor:** `Z-PROF-D5-R4 — Lifecycle, Version Binding & Evaluation Coordinate`
**Relevant Predecessors:** `Z-PROF-D5-R3`, `Z-PROF-001`, `CONTRACT-R1`, `AMS-0858`, `AMS-0859`
**Downstream:** Semantic Closure → Architecture Closure → Contract Closure → `AMS-0860` → Jules Implementation
**Date:** 2026-08-18

---

# 1. Purpose

`Z-PROF-D5-R4-R2` refines the lifecycle and version-binding model required for reproducible Profile participation.

R4 established the fundamental separation:

```text
Artifact Lifecycle
        ≠
Semantic Configuration Identity
        ≠
Evaluation Instance
```

and further established:

```text
Supersession ≠ Revocation
Historical Reproducibility ≠ Current Trust
Exact Binding ⇒ Transitive Closure
Bound Evaluation ≠ Ambient State
```

The first Council stress-test confirmed these foundations but identified additional semantic dimensions required for deterministic real-world behavior.

R4-R2 therefore closes the following missing concepts:

1. **Operation semantics** — what operation is being attempted against a historical or current configuration?
2. **Trust-assessment separation** — historical semantic state and present trust state are not the same coordinate.
3. **Temporal trust** — trust assessment requires its own explicit time coordinate.
4. **Bound Configuration Graph** — exact transitive binding must be distinguished from RI Runtime resolution.
5. **Constitutional Opacity Boundaries** — federated closure cannot require importing another sovereign domain's entire internal graph.
6. **Temporal applicability rules** — the rule determining which time governs applicability must itself be explicitly bound.
7. **Federation policy binding** — local admissibility of foreign artifacts requires an exact local federation policy.
8. **Evidence state decomposition** — integrity, availability, and current trust are separate.
9. **Historical Result vs. Current Assessment** — later constitutional assessment SHALL NOT rewrite historical execution.
10. **Operation-specific admissibility** — reproducibility does not itself authorize execution.

The central objective remains:

> **The same authorized semantic configuration must be reconstructible without mutable hidden state, implicit upgrades, floating dependencies, or environment-dependent interpretation.**

---

# 2. Foundational Constitutional Model

R4-R2 establishes five distinct layers.

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. ARTIFACT LIFECYCLE                                      │
│    Sovereign lifecycle state of each governed artifact     │
├─────────────────────────────────────────────────────────────┤
│ 2. SEMANTIC CONFIGURATION                                  │
│    Exact reusable governed semantic definition             │
├─────────────────────────────────────────────────────────────┤
│ 3. BOUND CONFIGURATION                                     │
│    Transitively closed exact dependency configuration      │
├─────────────────────────────────────────────────────────────┤
│ 4. EVALUATION INSTANCE                                     │
│    Configuration + bound Context/Evidence/Time/etc.         │
├─────────────────────────────────────────────────────────────┤
│ 5. OPERATION + CURRENT ASSESSMENT                          │
│    What is being attempted now, under what trust state?     │
└─────────────────────────────────────────────────────────────┘
```

These layers SHALL NOT be collapsed.

---

# 3. Core Constitutional Distinctions

R4-R2 ratification is proposed around the following distinctions.

## 3.1 Lifecycle ≠ Configuration Identity

A lifecycle state change does not automatically mutate semantic identity.

```text
Profile@1 status changes externally
```

does not mean:

```text
Profile@1 silently becomes Profile@2
```

## 3.2 Configuration Identity ≠ Evaluation Instance

A reusable semantic definition and one particular evaluation of it remain distinct.

```text
same semantic configuration + different bound Context
```

may produce:

```text
same Semantic Configuration
different Evaluation Coordinate
```

## 3.3 Reproducibility ≠ Executability

The system may be capable of reconstructing an historical configuration while being prohibited from executing it as a new operation.

```text
REPRODUCIBLE = true
EXECUTABLE   = false
```

is constitutionally valid.

## 3.4 Historical Trust ≠ Current Trust

An execution may have been trusted when performed while being considered untrusted under a later trust assessment.

## 3.5 Historical Result ≠ Current Assessment

A later Policy, Security, Evidence, or Federation determination SHALL NOT mutate the original historical receipt.

```text
Historical Result ≠ Current Assessment of Historical Result
```

## 3.6 Supersession ≠ Revocation

Supersession is governed evolution.

Revocation is withdrawal or alteration of trust/authority.

Neither SHALL be inferred from the other.

## 3.7 Evidence Integrity ≠ Evidence Availability ≠ Evidence Trust

The following are distinct:

```text
Do we know exactly which Evidence object?
Can we retrieve it?
Do we currently trust it?
```

---

# 4. Lifecycle Sovereignty

## Proposed Decision D5-R4-R2-001 — Sovereign Lifecycle Ownership

Z-PROF SHALL NOT become the universal lifecycle authority for the artifacts it consumes.

Lifecycle ownership remains with the applicable sovereign constitutional authority.

Examples:

| Concern                       | Sovereign Authority                   |
| ----------------------------- | ------------------------------------- |
| ARM Profile lifecycle         | ARM / governing Registry authority    |
| Projection lifecycle          | PRJ                                   |
| Reasoning Blueprint lifecycle | RSN                                   |
| Policy lifecycle              | POL                                   |
| Security / trust / revocation | SEC                                   |
| Evidence integrity/trust      | Evidence / SEC authority              |
| RI capability lifecycle       | RI / governing Registry               |
| Federation recognition        | applicable federation / POL authority |

Z-PROF may:

- consume lifecycle state;
- validate explicit lifecycle requirements;
- fail closed where eligibility cannot be proven.

Z-PROF SHALL NOT:

- create lifecycle state;
- silently reinterpret lifecycle state;
- supersede artifacts;
- revoke artifacts;
- reactivate artifacts;
- invent universal lifecycle transitions.

---

# 5. Operation Coordinate

## Proposed Decision D5-R4-R2-002 — Explicit Operation Type

Lifecycle eligibility cannot be evaluated without identifying the operation being attempted.

R4-R2 therefore introduces the conceptual **Operation Coordinate (`OP`)**.

At minimum:

```text
OP ∈ {
    NEW_COMPOSITION,
    NEW_EVALUATION,
    HISTORICAL_RECONSTRUCTION,
    CURRENT_TRUSTED_REPLAY,
    RECEIPT_VERIFICATION
}
```

This enumeration is semantic, not yet an implementation enum.

## 5.1 NEW_COMPOSITION

Creation or validation of a new governed composition using currently admissible artifacts.

A historically valid but no-longer-admissible artifact may fail this operation.

## 5.2 NEW_EVALUATION

Execution of an already-defined configuration as a new current constitutional evaluation.

Current Policy, Security, lifecycle, and admissibility requirements may apply.

## 5.3 HISTORICAL_RECONSTRUCTION

Reconstruction of the exact historical semantic configuration and deterministic evaluation conditions for analytical/audit purposes.

This operation does not automatically claim current constitutional admissibility.

## 5.4 CURRENT_TRUSTED_REPLAY

A new execution intended to reproduce a prior coordinate while still producing a currently trusted/admissible execution result.

Current trust/admissibility rules apply.

## 5.5 RECEIPT_VERIFICATION

Verification that a historical receipt corresponds to a historical execution/configuration.

Receipt Verification does not require the historical configuration to remain currently admissible for new execution.

---

# 6. Operation-Specific Eligibility

## Proposed Decision D5-R4-R2-003 — Eligibility Function

R4-R2 establishes:

```text
Eligibility = f(
    Artifact Lifecycle State,
    Operation,
    Applicable Authority Rules,
    Temporal Coordinates,
    Trust State,
    Federation State
)
```

Z-PROF does **not** define this function semantically on behalf of the sovereign authorities.

Z-PROF:

1. carries the explicit inputs;
2. validates their structural presence and binding;
3. consumes governed determinations;
4. fails closed if required authority or applicability cannot be established.

Therefore:

```text
SUPERSEDED
```

does not universally mean:

```text
VALID
```

or:

```text
INVALID
```

Its consequence is operation-specific.

---

# 7. Evaluation Status Tuple

## Proposed Decision D5-R4-R2-004 — Four-Dimensional Status

A lifecycle-aware evaluation/reconstruction SHALL be capable of representing four independent questions:

```text
EvaluationStatus = (
    Reproducible,
    Executable,
    CurrentlyTrusted,
    CurrentlyAdmissible
)
```

These dimensions SHALL NOT be collapsed into one generic `VALID` flag.

Conceptually:

| Dimension             | Core Question                                                                        |
| --------------------- | ------------------------------------------------------------------------------------ |
| `Reproducible`        | Can the exact historical semantic/evaluation coordinate be reconstructed?            |
| `Executable`          | May this operation be executed under applicable runtime/governance constraints?      |
| `CurrentlyTrusted`    | Is the relevant configuration currently trusted under the governing trust authority? |
| `CurrentlyAdmissible` | Is this operation presently allowed by the applicable constitutional authorities?    |

These values SHALL have explicit authority/provenance sources.

Z-PROF SHALL NOT manufacture them from raw lifecycle strings.

---

# 8. Semantic State vs. Trust Assessment State

## Proposed Decision D5-R4-R2-005 — Two Constitutional Views

Historical semantic evaluation and current trust assessment SHALL NOT be forced into one state object.

Conceptually:

```text
PinnedSemanticState ≠ TrustAssessmentState
```

The first answers:

> What constitutional state governed the semantic evaluation?

The second answers:

> Under which trust/revocation state is this configuration being assessed now?

The implementation MAY ultimately use ACV or another existing governed representation where applicable.

R4-R2 does not prescribe that TrustAssessmentState must itself be an ACV.

---

# 9. Temporal Orthogonality

## Proposed Decision D5-R4-R2-006 — Four Temporal Coordinates

R4-R2 ratifies the need to distinguish:

\[ \boxed{ T_v \neq T_o \neq T_e \neq T_{trust} } \]

## 9.1 `T_v` — Valid Time

The time when the underlying Reality fact/state/event is valid.

## 9.2 `T_o` — Observation Time

The time when Evidence/Observation was acquired or established, where applicable.

## 9.3 `T_e` — Execution Time

The time when the constitutional evaluation actually executed.

## 9.4 `T_trust` — Trust Assessment Time

The time at which current trust/admissibility is being assessed.

Example:

```text
historical execution: T_e = 2026-01-15
current audit: T_trust = 2026-08-18
```

The artifact may have been trusted at execution while failing present trust assessment.

---

# 10. No Universal Temporal Precedence

## Proposed Decision D5-R4-R2-007 — Temporal Applicability Sovereignty

Z-PROF SHALL NOT establish a universal rule such as:

```text
always use T_v
```

or:

```text
always use T_e
```

The governing authority must declare which temporal coordinate controls applicability.

Examples may include:

```text
Policy A → governed by Valid Time
Policy B → governed by Execution Time
Policy C → retroactive applicability
Trust Rule D → governed by T_trust
```

Z-PROF consumes the rule.

It does not invent temporal precedence.

---

# 11. Temporal Applicability Rule Binding

## Proposed Decision D5-R4-R2-008 — Temporal Rule Is a Semantic Dependency

Any rule capable of determining which temporal coordinate governs applicability SHALL itself be exactly version-bound.

Conceptually:

```text
TemporalApplicabilityRule@exact
```

must participate in the Semantic Configuration or Bound Configuration where it can affect the evaluation.

Therefore:

```text
Policy@7
```

is not necessarily enough.

The configuration may also require:

```text
Policy@7 + TemporalApplicabilityRule@3
```

if Rule 3 determines whether Policy 7 applies by `T_v`, `T_e`, retroactive interval, or another governed coordinate.

No temporal applicability rule may float implicitly.

---

# 12. Semantic Configuration Coordinate

## Proposed Decision D5-R4-R2-009 — SCC

The **Semantic Configuration Coordinate (`SCC`)** identifies the exact reusable governed semantic definition.

Conceptually:

```text
SCC = (
    CompositionIdentity,
    ParticipantIdentities,
    DTC,
    EpistemicRequirements,
    ProjectionRequirements,
    RSNRequirements,
    ContextDefinitions,
    PolicyRequirements,
    SecurityRequirements,
    RICapabilityRequirements,
    TemporalApplicabilityRules,
    FederationPolicyRequirements,
    SemanticParameterSignatures
)
```

Only dimensions applicable to the composition are included.

---

# 13. SCC Classification

## Proposed Decision D5-R4-R2-010 — Coordinate Classes

R4-R2 classifies semantic dimensions into three categories.

### A. Identity-Bearing

A change creates a different semantic configuration.

Examples include:

- Composition definition;
- Profile identity/version;
- DTC identity/version;
- Epistemic Requirement definition/version;
- Projection definition/version;
- RSN Blueprint requirement/version;
- Context **definition** where semantically required;
- applicable Policy requirement/version;
- applicable Security requirement/version;
- RI capability requirement/version;
- temporal applicability rule;
- federation policy requirement;
- identity-bearing evaluation requirement signature.

### B. Instance-Bearing

A change creates a different Evaluation Coordinate but not necessarily a new SCC.

Examples include:

- bound Context values;
- specific Evidence inputs;
- actor/session constitutional inputs where legitimately semantic to the evaluation instance;
- specific valid/observation/execution/trust times;
- instance-level evaluation parameters;
- operation type.

### C. Infrastructure-Only

These SHALL NOT contaminate SCC or EC semantic identity unless separately constitutionalized:

- machine identity;
- container identity;
- arbitrary deployment region;
- worker identity;
- database connection;
- network path;
- filesystem path;
- request arrival mechanics;
- cache location;
- infrastructure retry count.

---

# 14. Bound Configuration Graph

## Proposed Decision D5-R4-R2-011 — BCG

R4-R2 renames the initial R4 `Resolved Configuration Graph (RCG)` to:

> **Bound Configuration Graph (`BCG`)**

to avoid confusion with the M08 / RI Resolution Graph.

The BCG represents the exact, immutable, transitively closed semantic dependency configuration supplied to evaluation.

Conceptually:

```text
BCG = (V, E_bind, BoundaryRefs)
```

where:

- `V` = exact governed artifact identities/versions;
- `E_bind` = explicit evaluation-affecting binding dependencies;
- `BoundaryRefs` = governed opacity/federation boundary references where closure legitimately terminates.

---

# 15. BCG ≠ RI Resolution Graph

## Proposed Decision D5-R4-R2-012 — Separation from Runtime Resolution

The BCG is not the RI Runtime Resolution Graph.

```text
BOUND CONFIGURATION GRAPH
        │
        │ exact semantic configuration
        ▼
RI / M08 Resolution & Execution
        │
        ▼
Runtime Resolution Graph / Execution
```

The BCG answers:

> What exact governed configuration was bound?

The RI Resolution Graph answers operational/runtime questions about executing constitutional state.

The two may overlap structurally.

They SHALL NOT be constitutionally conflated.

---

# 16. Evaluation-Affecting Dependency

## Proposed Decision D5-R4-R2-013 — Explicit Closure Rule

An **evaluation-affecting dependency** is:

> Any explicitly governed dependency whose identity, version, state, output, applicability, trust status, or resolution may constitutionally alter the evaluation result, admissibility, or evidentiary meaning.

Evaluation-affecting dependencies SHALL be identified from:

- explicit `T_bind`;
- governing contracts;
- explicitly bound requirements;
- sovereign policy/security/federation rules.

Z-PROF SHALL NOT scan arbitrary code or semantic content to guess hidden dependencies.

If a required dependency is undeclared, unresolved, or missing:

```text
FAIL CLOSED
```

No hidden dependency may be supplied from ambient state.

---

# 17. Transitive Closure

## Proposed Decision D5-R4-R2-014 — Exact Closure

Within the applicable constitutional authority boundary:

\[ \boxed{ Exact Binding \Rightarrow Transitive Closure } \]

Example:

```text
A@1
 └── B@2
      └── C@5
```

means:

```text
A@1 B@2 C@5
```

must all be fixed if they can affect evaluation.

The configuration SHALL NOT permit:

```text
A@1 B@latest C@current
```

after binding.

---

# 18. Constitutional Opacity Boundary

## Proposed Decision D5-R4-R2-015 — Federated Closure Boundary

Full transitive closure SHALL NOT require one constitutional domain to ingest the internal implementation graph of another sovereign domain.

A governed **Constitutional Opacity Boundary** may terminate local closure at an exact authoritative interface.

Conceptually:

```text
Local Domain
    │
    ├── local dependencies → full closure
    │
    ▼
Federated Interface@exact
    │
    ├── exact contract/version
    ├── exact response/result digest
    ├── authority identity
    └── federation policy
         │
         ▼
Foreign internal graph
    [opaque to local domain]
```

The opacity boundary must be explicit and governed.

It SHALL NOT be inferred merely because an artifact is external.

---

# 19. Federation Policy Binding

## Proposed Decision D5-R4-R2-016 — Local Federation Admissibility

Foreign lifecycle/trust state does not directly define local admissibility.

Local admissibility requires an exact applicable federation/policy rule.

Conceptually:

```text
Foreign Lifecycle / Trust State
        + Local Federation Policy@exact
        + Temporal Coordinates
        + Operation
        ↓
Local Admissibility Determination
```

Z-PROF does not invent a superior sovereign authority.

---

# 20. Evidence State Model

## Proposed Decision D5-R4-R2-017 — Evidence Decomposition

Evidence SHALL be represented through separate dimensions:

```text
Evidence Integrity
        ≠ Evidence Availability
        ≠ Evidence Current Trust
```

## 20.1 Integrity

Identifies the exact Evidence object/content.

Typical representation may involve an authoritative digest/hash.

Z-PROF SHALL NOT invent an Evidence version system.

## 20.2 Availability

Answers whether the exact Evidence payload can currently be obtained.

Known identity does not imply current availability.

## 20.3 Current Trust

Answers whether the exact Evidence is presently trusted by the governing Evidence/SEC authority.

Current trust is not derived by Z-PROF from hash equality alone.

---

# 21. Evaluation Coordinate

## Proposed Decision D5-R4-R2-018 — EC

The **Evaluation Coordinate (`EC`)** identifies one deterministic evaluation instance.

Conceptually:

```text
EC = (
    SCC,
    BCG,
    PinnedSemanticState,
    BoundContext,
    EvidenceIntegrityCoordinates,
    AuthorizedInputs,
    EvaluationParameters,
    TemporalCoordinates,
    OP
)
```

Trust assessment MAY require an additional:

```text
TrustAssessmentState
```

and `T_trust`.

The EC defines evaluation inputs.

It is not itself the execution result.

---

# 22. EC ≠ ExecutionReceipt

## Proposed Decision D5-R4-R2-019 — Input/Proof Separation

The Evaluation Coordinate and ExecutionReceipt serve different constitutional purposes.

```text
Evaluation Coordinate
        ↓ constitutional execution
        ↓
ExecutionReceipt
```

The EC answers:

> What exact explicit coordinate was evaluated?

The ExecutionReceipt answers:

> What actually happened during execution?

The receipt SHOULD ultimately bind or reference the Evaluation Coordinate through the appropriate AMS-0863 provenance architecture.

AMS-0860 SHALL NOT redesign the existing ExecutionReceipt format.

---

# 23. Historical Receipt Verification

## Proposed Decision D5-R4-R2-020 — History Preservation

Receipt Verification SHALL remain conceptually possible even if parts of the historical configuration are subsequently superseded or revoked, provided the historical receipt and required integrity evidence remain verifiable.

Receipt Verification asks:

> Did this historical execution/result actually occur under this historical coordinate?

It does not claim:

> This configuration is currently admissible for new execution.

Later lifecycle/trust changes SHALL NOT rewrite historical receipts.

---

# 24. Historical Reconstruction

## Proposed Decision D5-R4-R2-021 — Reconstruction Operation

Historical Reconstruction attempts to reconstruct the exact historical semantic/evaluation coordinate.

It SHALL use:

- historical SCC;
- historical BCG;
- historical pinned semantic state;
- historical Evidence integrity;
- original bound Context;
- historical temporal coordinates.

It SHALL NOT silently substitute current versions.

The result of Historical Reconstruction SHALL be explicitly distinguishable from a currently trusted new execution.

---

# 25. Current Trusted Replay

## Proposed Decision D5-R4-R2-022 — Present Admissibility Required

A Current Trusted Replay is a new execution.

Therefore present trust/admissibility requirements apply.

A historically reproducible configuration SHALL NOT automatically qualify for current trusted replay.

Conceptually:

```text
Historical Reproducibility = true
        │
        ├── Current Trust?
        ├── Current Admissibility?
        └── Operation permits execution?
                ↓
Current Trusted Replay
```

If the currently applicable sovereign authority rejects the configuration:

```text
FAIL CLOSED
```

Z-PROF SHALL NOT invent an override.

---

# 26. Revocation Semantics

## Proposed Decision D5-R4-R2-023 — Revocation Boundary

Revocation SHALL NOT erase historical fact.

A revoked artifact may therefore participate differently depending on operation.

Conceptually:

| Operation                   | Revoked historical artifact                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------------- |
| `RECEIPT_VERIFICATION`      | Historical verification may proceed if integrity/proof remains available                                  |
| `HISTORICAL_RECONSTRUCTION` | May reconstruct historical configuration subject to governing security rules                              |
| `CURRENT_TRUSTED_REPLAY`    | Requires current explicit admissibility; default is fail-closed where current trust cannot be established |
| `NEW_EVALUATION`            | Requires current admissibility                                                                            |
| `NEW_COMPOSITION`           | Requires current admissibility                                                                            |

The final execution eligibility determination remains with the appropriate SEC/POL/RI authorities.

Z-PROF SHALL NOT invent an `Emergency Override`.

---

# 27. Historical Result vs Current Assessment

## Proposed Decision D5-R4-R2-024 — Non-Rewriting Principle

A later Policy, Security, Evidence, or Federation determination SHALL NOT mutate the historical result.

Example:

```text
T1: EC₁ → APPROVED
```

Later:

```text
T2: POL@9 becomes retroactively applicable
```

The historical record remains:

```text
HistoricalExecution:
    EC = EC₁
    Result = APPROVED
    ExecutionTime = T1
```

A new current constitutional assessment may produce:

```text
CurrentAssessment:
    target = HistoricalExecution
    policy = POL@9
    assessmentTime = T_trust / T_assess
    disposition = <POL-owned determination>
```

These are two distinct constitutional facts.

Therefore:

\[ \boxed{ Historical Result \neq Current Assessment } \]

---

# 28. Retroactive Policy

## Proposed Decision D5-R4-R2-025 — Retroactivity Does Not Rewrite History

A retroactively applicable rule may govern current assessment of historical events where sovereign authority permits.

It SHALL NOT rewrite:

- original ExecutionReceipt;
- original EC;
- original bound artifact versions;
- original historical result.

Retroactivity therefore creates a new governed assessment relation rather than silently mutating the past.

---

# 29. No Implicit Upgrade

## Proposed Decision D5-R4-R2-026 — Exact Version Binding

After binding:

```text
latest
compatible
^1.2
>=1
ambient current
```

are prohibited as evaluation-time version semantics.

An exact historical configuration remains exact.

A new version requires creation/binding of a new configuration where the identity rules require it.

---

# 30. CompositionManifest Boundary

## Proposed Decision D5-R4-R2-027 — Exact Manifest Before Evaluation

Version/range resolution must complete before the validated `CompositionManifest` enters evaluation.

Conceptually:

```text
Declarative authoring requirement
        ↓
Application / authorized resolution
        ↓
exact governed references
        ↓
Validated CompositionManifest
        ↓
SCC / BCG
        ↓
Evaluation
```

Z-PROF evaluation SHALL NOT perform `latest` resolution.

---

# 31. Context Definition vs Bound Context

## Proposed Decision D5-R4-R2-028 — Context Factorization

```text
Context Definition ≠ Bound Context Value
```

Example:

```text
Definition: jurisdiction coordinate required
```

may belong to SCC.

While:

```text
jurisdiction = EG
```

belongs to the EC unless a higher contract explicitly establishes the value as identity-bearing.

Changing an ordinary bound Context value creates a new Evaluation Coordinate, not automatically a new Composition/SCC.

---

# 32. Parameter Classification

## Proposed Decision D5-R4-R2-029 — Evaluation Parameter Classes

Evaluation parameters SHALL be classified as:

### Semantic Configuration Parameters

Change governed semantic meaning.

→ SCC-bearing.

### Evaluation Instance Parameters

Bind one execution of an existing SCC.

→ EC-bearing.

### Infrastructure Parameters

Do not constitutionally alter meaning.

→ neither SCC nor EC semantic identity.

No implementation may infer this classification merely from variable names.

---

# 33. Ambient-State Prohibition

## Proposed Decision D5-R4-R2-030 — Closed Coordinate

No evaluation outcome may depend upon undeclared ambient state.

Prohibited unless explicitly constitutionalized as an authorized coordinate:

- current Registry head;
- `latest` Profile;
- `latest` Policy;
- current clock;
- current deployment;
- current database state;
- current machine;
- network route;
- random process;
- mutable cache;
- environment-dependent fallback.

---

# 34. Determinism Law

## Proposed Decision D5-R4-R2-031 — Evaluation Determinism

Given equivalent complete evaluation coordinates and equivalent applicable trust/authority coordinates:

\[ EC_1 \equiv EC_2 \Longrightarrow Result_1 \equiv Result_2 \]

for deterministic constitutional capabilities.

Trust assessment may differ if:

```text
T_trust
```

or the explicitly bound TrustAssessmentState differs.

That difference is not nondeterminism.

It is a different assessment coordinate.

---

# 35. Missing Historical Artifact

## Proposed Decision D5-R4-R2-032 — No Historical Substitution

If an EC/BCG references:

```text
Artifact A@1
```

and `A@1` is unavailable:

Z-PROF SHALL NOT substitute:

```text
A@2
```

even if `A@2` is currently active.

The system must report the applicable existing failure state.

Identity-known and payload-available are separate conditions.

---

# 36. Disappearance Test

If Z-PROF disappears:

- lifecycle authority remains with sovereign domains;
- Profile versions remain;
- PRJ versions remain;
- RSN versions remain;
- Policy lifecycle remains;
- SEC revocation remains;
- Evidence integrity/trust authority remains;
- Federation authority remains;
- RI Runtime remains;
- historical ExecutionReceipts remain.

Z-PROF owns the composition/evaluation coordinate relationship.

It does not own the authorities participating in that coordinate.

---

# 37. Revised Scenario Stress-Test Set

The following scenarios SHALL be evaluated using the R4-R2 model.

Each scenario now has a concrete expected Z-PROF constitutional outcome.

## S01 — Profile Supersession

### Facts

```text
Profile@1 used historically.
Profile@2 later supersedes Profile@1.
No revocation occurs.
```

### Historical operation

`RECEIPT_VERIFICATION`

### Expected Outcome

```text
Reproducible        = YES, if historical coordinate/evidence available
Executable          = NOT REQUIRED
CurrentlyTrusted    = authority-dependent but supersession alone does not revoke trust
CurrentlyAdmissible = irrelevant to receipt verification
```

Historical Profile@1 SHALL NOT be replaced by Profile@2.

**PASS CONDITION:** original result remains verifiable.

## S02 — Historical Profile Later Revoked

### Facts

```text
Profile@1 used at T_e1.
Profile@1 revoked at T_r > T_e1.
Audit occurs at T_trust > T_r.
```

### Operation A

`RECEIPT_VERIFICATION`

### Expected Outcome

Historical receipt MAY be verified if integrity/proof remains available.

Current trust assessment SHALL separately expose revocation.

### Operation B

`CURRENT_TRUSTED_REPLAY`

### Expected Outcome

FAIL CLOSED unless present governing SEC/POL authority explicitly establishes admissibility.

**Z-PROF SHALL NOT invent an override.**

## S03 — Policy Changes Between Valid and Execution Time

### Facts

```text
Reality Valid Time: T_v
Execution Time: T_e
Policy@7 applies according to TemporalRule@2.
```

### Expected Outcome

The exact bound `TemporalRule@2` determines which temporal coordinate applies.

Z-PROF SHALL NOT choose between `T_v` and `T_e`.

If TemporalRule is missing:

```text
FAIL CLOSED
```

## S04 — Evidence Acquired After Valid Time

### Facts

```text
Reality fact valid at T_v.
Evidence observed at T_o > T_v.
```

### Expected Outcome

No temporal contradiction is inferred merely because `T_o != T_v`.

Both coordinates are preserved.

Admissibility depends on the governing Evidence/Policy rule.

## S05 — Evidence Later Determined Untrustworthy

### Facts

```text
Evidence E hash fixed.
E was used historically.
Evidence authority later marks E untrusted.
```

### Receipt Verification

May remain reproducible/verifiable if original integrity evidence remains.

### Current Trusted Replay / New Evaluation

Current Evidence trust must be evaluated.

Potential state:

```text
Reproducible        = YES
CurrentlyTrusted    = NO
CurrentlyAdmissible = authority-determined
```

Historical receipt is not rewritten.

## S06 — Transitive Dependency Drift

### Facts

```text
Profile A@1   → Requirement B@3
Later: B@4 becomes current.
```

### Expected Outcome

BCG remains:

```text
A@1 → B@3
```

No upgrade to B@4.

Historical/new evaluation using the original SCC remains pinned to B@3 where admissible.

## S07 — Federated Domains Recognize Different Versions

### Facts

```text
Local domain recognizes ForeignInterface@4.
Foreign domain internally uses newer components.
```

### Expected Outcome

Local BCG binds:

```text
ForeignInterface@4 + exact federated result/interface integrity + LocalFederationPolicy@exact
```

Foreign private dependency graph need not be imported across the Constitutional Opacity Boundary.

No supranational lifecycle authority is created.

## S08 — Foreign Authority Becomes Unavailable

### Facts

A previously bound federated authority cannot currently be contacted.

### Receipt Verification

May proceed if the historical interface result, receipt, and required integrity evidence are locally available.

### Current Trusted Replay

If current federation/trust validation requires live authoritative state and that state cannot be obtained:

```text
FAIL CLOSED
```

No cached assumption of continuing authority.

## S09 — Exact Historical Dependency Cannot Be Retrieved

### Facts

BCG identifies:

```text
Dependency@3
```

but payload is unavailable.

### Expected Outcome

```text
Identity Known       = YES
Payload Available    = NO
```

No substitution.

Historical reconstruction fails explicitly according to existing taxonomy.

## S10 — Retroactive Policy

### Facts

```text
Execution at T1 → APPROVED
Policy@9 enacted at T2
Policy@9 explicitly declares retroactive applicability
```

### Expected Outcome

Original result remains:

```text
Historical Result = APPROVED
```

A new current assessment may be created under:

```text
Policy@9 + TemporalApplicabilityRule@exact + T_trust/T_assess
```

The original receipt SHALL NOT be mutated.

## S11 — Security Revocation After Successful Evaluation

### Facts

Execution succeeds at T1.

Signer/key/artifact revoked at T2.

### Expected Outcome

Historical execution remains historically recorded.

Current trust assessment reflects revocation.

```text
Historical fact      = preserved
Current trust        = authority-determined under T_trust
Current replay       = fail closed unless currently admissible
```

## S12 — Same Semantic Configuration, Different Context Values

### Facts

```text
SCC = identical
ContextDefinition = jurisdiction coordinate

EC1: jurisdiction = EG
EC2: jurisdiction = DE
```

### Expected Outcome

```text
SCC1 = SCC2
EC1 ≠ EC2
```

unless an explicit governing contract establishes the specific Context value as identity-bearing.

No Composition explosion.

## S13 — Same Configuration, Different Evaluation Parameter

### Facts

One evaluation parameter differs.

### Expected Outcome

If parameter is instance-bearing:

```text
same SCC
different EC
```

If semantic:

```text
different SCC
```

If infrastructure-only:

```text
same SCC
same semantic EC
```

Classification must come from governing contract.

Unknown classification:

```text
FAIL CLOSED / CONTRACT GAP
```

not inference.

## S14 — Same Evidence Through Different Retrieval Paths

### Facts

Same authoritative Evidence digest/content obtained from different infrastructure sources.

### Expected Outcome

Evidence semantic/integrity identity remains the same.

Infrastructure path SHALL NOT alter SCC or EC semantic meaning.

## S15 — Authoring Range Before Manifest Construction

### Facts

Authoring requirement says:

```text
Profile compatible with ^2.x
```

### Expected Outcome

Before evaluation, authorized resolution must produce:

```text
Profile@2.4.1
```

or another exact allowed version.

The validated CompositionManifest contains exact binding.

Evaluation SHALL reject floating range semantics.

## S16 — Historical ACV While New ACV Is Current

### Facts

```text
Original evaluation used SemanticState/ACV-17.
Current state is ACV-31.
```

### Historical Reconstruction

Uses ACV-17.

### Current Trust Assessment

May use an explicitly governed present TrustAssessmentState.

ACV-31 SHALL NOT silently replace ACV-17 in historical semantic evaluation.

## S17 — Artifact Valid at T_v but Revoked Before T_e

### Facts

```text
valid at T_v
revoked before T_e
```

### Expected Outcome

Temporal applicability rule determines whether historical validity at `T_v` is sufficient for semantic applicability.

Current execution/trust additionally consumes revocation state.

Z-PROF does not decide temporal precedence.

If required temporal or trust rule is missing:

```text
FAIL CLOSED
```

## S18 — Foreign Artifact Locally Accepted, Then Revoked by Origin

### Facts

```text
Foreign origin revokes artifact.
Local domain previously accepted it.
```

### Expected Outcome

Origin lifecycle/trust state is consumed.

Local admissibility is determined by:

```text
LocalFederationPolicy@exact
```

Z-PROF SHALL NOT invent a superior authority.

If local policy cannot determine admissibility:

```text
FAIL CLOSED
```

## S19 — Revoked Transitive Dependency

### Facts

```text
Top-level A@1 appears acceptable.
BCG contains A@1 → B@3.
B@3 is now revoked.
```

### Expected Outcome

The transitive dependency cannot be ignored.

Current trusted/new execution requires assessment of B@3.

Historical receipt verification may still establish what happened historically.

No reliance solely on top-level A@1 trust.

## S20 — Historical Configuration Missing One Evidence Artifact

### Facts

All semantic artifacts are reconstructible except Evidence E2.

### Expected Outcome

Exact historical configuration identity remains known.

Full deterministic reconstruction is not established if E2 materially affected the evaluation and cannot be recovered/verified.

No replacement Evidence may be silently substituted.

Receipt verification may still be possible if the historical receipt cryptographically proves the original result without requiring E2 payload reconstruction, subject to governing Evidence/receipt contract.

---

# 38. Additional Mandatory Stress Tests

R4-R2 adds four new cases.

## S21 — Same Historical EC, Different Operation

### Facts

Exact same EC.

Operations:

- `RECEIPT_VERIFICATION`
- `CURRENT_TRUSTED_REPLAY`

### Expected Outcome

Different admissibility is constitutionally permitted.

```text
same EC
different OP
different eligibility result
```

This proves Operation must be explicit.

## S22 — Malformed / Incomplete Dependency Closure

### Facts

A required `T_bind` dependency is absent from BCG.

### Expected Outcome

```text
FAIL CLOSED
```

The system SHALL NOT characterize the configuration as fully bound.

## S23 — Explicitly Governed Opacity Boundary

### Facts

Federated dependency crosses a governed interface.

Foreign internals are not visible.

### Expected Outcome

Local BCG may terminate closure at the exact governed interface if:

- boundary is explicitly authorized;
- interface/version is exact;
- authority is explicit;
- required result/integrity coordinate is bound;
- local federation policy is exact.

Otherwise:

```text
FAIL CLOSED
```

## S24 — Retroactive Rule Changes Present Assessment Only

### Facts

Historical execution result = `APPROVED`.

Later retroactive policy says the historical action is presently non-compliant.

### Expected Outcome

Store/preserve both:

```text
HistoricalExecutionResult = APPROVED
CurrentAssessment         = <POL-owned non-compliant state>
```

No historical rewrite.

---

# 39. Revised Closure Tests

Before Semantic Closure, R4-R2 SHALL satisfy:

- **Test A — Identity Stability**: Non-identity-bearing bound values do not mutate SCC.
- **Test B — Identity Change**: Identity-bearing semantic changes create a new SCC/configuration.
- **Test C — No Implicit Upgrade**: Exact versions remain exact.
- **Test D — Transitive Closure**: Every declared evaluation-affecting dependency is closed.
- **Test E — Opacity Boundary**: Federated closure terminates only at explicit governed boundaries.
- **Test F — Historical Receipt Integrity**: Later lifecycle/trust changes do not rewrite historical receipt.
- **Test G — Operation Separation**: Same EC may produce different eligibility under different OP.
- **Test H — Trust Separation**: Historical semantic state and current TrustAssessmentState remain distinct.
- **Test I — Temporal Orthogonality**: `T_v`, `T_o`, `T_e`, `T_trust` remain distinguishable.
- **Test J — Temporal Rule Binding**: Applicable temporal rule is explicitly version-bound.
- **Test K — Evidence Decomposition**: Integrity, availability, and trust cannot be conflated.
- **Test L — Federation Sovereignty**: No supranational lifecycle authority is inferred.
- **Test M — Missing Historical Input**: Missing exact artifact never causes silent substitution.
- **Test N — Ambient Independence**: Current Registry/head/network/machine cannot alter fixed coordinate meaning.
- **Test O — Historical vs Current Assessment**: Current assessment cannot mutate historical result.
- **Test P — Disappearance**: Removing Z-PROF leaves sovereign lifecycle/trust authorities independently valid.

---

# 40. Revised Decision Register

The following decisions are proposed for final targeted Council review.

| ID           | Proposed Decision                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| D5-R4-R2-001 | Z-PROF consumes sovereign lifecycle state; it does not own universal lifecycle.                      |
| D5-R4-R2-002 | Every lifecycle/admissibility operation is explicitly classified by OP.                              |
| D5-R4-R2-003 | Eligibility is operation-specific and authority-governed.                                            |
| D5-R4-R2-004 | Reproducible, Executable, CurrentlyTrusted, and CurrentlyAdmissible are distinct result dimensions.  |
| D5-R4-R2-005 | Pinned semantic state and current trust-assessment state are distinct.                               |
| D5-R4-R2-006 | `T_v`, `T_o`, `T_e`, and `T_trust` are distinct.                                                     |
| D5-R4-R2-007 | Z-PROF establishes no universal temporal precedence.                                                 |
| D5-R4-R2-008 | Temporal applicability rules are exact semantic dependencies.                                        |
| D5-R4-R2-009 | SCC identifies reusable governed semantic configuration.                                             |
| D5-R4-R2-010 | Semantic dimensions are classified as identity-, instance-, or infrastructure-bearing.               |
| D5-R4-R2-011 | BCG represents exact bound transitive semantic configuration.                                        |
| D5-R4-R2-012 | BCG is distinct from RI/M08 Runtime Resolution Graph.                                                |
| D5-R4-R2-013 | Evaluation-affecting dependencies come from explicit governed binding declarations/contracts.        |
| D5-R4-R2-014 | Exact internal binding requires transitive closure.                                                  |
| D5-R4-R2-015 | Federated closure may terminate only at explicit Constitutional Opacity Boundaries.                  |
| D5-R4-R2-016 | Foreign lifecycle state is mediated locally through exact federation/policy authority.               |
| D5-R4-R2-017 | Evidence integrity, availability, and current trust are distinct.                                    |
| D5-R4-R2-018 | EC identifies one explicit evaluation instance.                                                      |
| D5-R4-R2-019 | EC and ExecutionReceipt are distinct; EC is input coordinate, Receipt is execution proof.            |
| D5-R4-R2-020 | Historical Receipt Verification does not require present execution admissibility.                    |
| D5-R4-R2-021 | Historical Reconstruction preserves historical configuration without claiming present admissibility. |
| D5-R4-R2-022 | Current Trusted Replay requires present governed admissibility.                                      |
| D5-R4-R2-023 | Revocation does not erase historical fact but may affect current execution/trust.                    |
| D5-R4-R2-024 | Historical Result and Current Assessment are separate constitutional facts.                          |
| D5-R4-R2-025 | Retroactive authority produces a new current assessment rather than rewriting historical receipts.   |
| D5-R4-R2-026 | Evaluation-time floating or implicit upgrade is prohibited.                                          |
| D5-R4-R2-027 | CompositionManifest must contain exact bound references before evaluation.                           |
| D5-R4-R2-028 | Context definition and bound Context value are distinct.                                             |
| D5-R4-R2-029 | Evaluation parameters must be explicitly classified.                                                 |
| D5-R4-R2-030 | Undeclared ambient semantic state is prohibited.                                                     |
| D5-R4-R2-031 | Equivalent complete coordinates produce equivalent deterministic results.                            |
| D5-R4-R2-032 | Missing exact historical artifacts may never be silently substituted.                                |

---

# 41. Remaining Questions for Final Council Review

R4-R2 intentionally reduces the open question set.

The Council should focus only on genuine remaining constitutional issues.

## Q1 — Historical Reconstruction with Revoked Material

Should exact historical reconstruction involving revoked artifacts:

1. always be permitted as a non-authoritative analytical reconstruction;
2. require explicit SEC permission;
3. be prohibited while Receipt Verification remains available?

The Council must distinguish this from Current Trusted Replay.

## Q2 — Evaluation Status Ownership

Should the four-dimensional status be represented as one governed aggregate, or as independently sourced determinations?

The semantic requirement is already fixed:

```text
Reproducible
Executable
CurrentlyTrusted
CurrentlyAdmissible
```

The unresolved question is aggregation ownership.

## Q3 — TrustAssessmentState Representation

Does an existing SEC/ACV/Registry representation already provide sufficient trust state, or will Contract Closure need an explicit reference model?

No new constitutional trust primitive may be invented merely for Z-PROF convenience.

## Q4 — BCG Identity

Must BCG have a first-class independent identifier/digest, or is its identity sufficiently represented through an existing CompositionManifest / canonical binding artifact?

This is potentially Contract Closure rather than semantic closure.

## Q5 — Receipt Verification Without Evidence Payload

Under what exact existing receipt/evidence contract can an ExecutionReceipt be verified when the original Evidence payload is unavailable but its digest survives?

This should likely be delegated to AMS-0863 where appropriate.

---

# 42. Questions Explicitly Deferred

The following SHALL NOT block R4-R2 semantic closure if the conceptual invariants above are ratified:

- exact TypeScript interfaces;
- JSON Schema;
- database schema;
- hash algorithm;
- Merkle representation;
- JCS field layout;
- BCG storage;
- Registry index layout;
- ACV serialization details;
- concrete ExecutionReceipt changes;
- cache model;
- API design;
- infrastructure resolution;
- migration mechanics.

These belong to Architecture Closure, Contract Closure, or later AMS workstreams.

---

# 43. Relationship to AMS-0860

If R4-R2 closes successfully, AMS-0860 shall implement the mechanics necessary to enforce:

```text
Artifact Lifecycle
        ↓ observed only
Semantic Configuration
        ↓ exact identity
Bound Configuration Graph
        ↓ transitive closure
Evaluation Coordinate
        ↓ explicit instance
Operation
        ↓ explicit eligibility context
Trust Assessment
        ↓ sovereign determination
Deterministic Evaluation / Reconstruction
```

AMS-0860 SHALL NOT implement:

- universal lifecycle authority;
- revocation authority;
- Evidence trust authority;
- federation sovereignty;
- Policy temporal semantics;
- new Runtime execution semantics;
- replay/provenance architecture beyond what is necessary for version binding.

---

# 44. Constitutional Synthesis

R4-R2 proposes the following final semantic equation:

\[ \boxed{ \text{Deterministic Evaluation Instance} = SCC + BCG + PinnedSemanticState + BoundContext + EvidenceIntegrity + TemporalCoordinates + AuthorizedInputs + EvaluationParameters + OP } \]

while present trust/admissibility additionally depends upon:

\[ \boxed{ \text{Current Assessment} = \text{Historical / Current Coordinate} + TrustAssessmentState + T_{trust} + Applicable POL/SEC/Federation Rules } \]

These SHALL NOT be conflated.

---

# 45. Final Constitutional Laws

## Law 1 — No Ambient Upgrade

```text
Bound version ≠ current version
```

unless an authorized new binding operation produces a new configuration.

## Law 2 — No Hidden Dependency

Every declared evaluation-affecting dependency must be closed or terminate at a governed opacity boundary.

## Law 3 — No Historical Rewrite

Later constitutional authority may reassess history.

It may not mutate what historically occurred.

## Law 4 — No Trust Invention

Z-PROF carries trust coordinates and consumes trust determinations.

It does not create trust.

## Law 5 — No Universal Lifecycle

Lifecycle remains sovereign to the artifact's governing authority.

## Law 6 — Operation Matters

The same configuration may be:

```text
historically verifiable but currently non-executable
```

without contradiction.

## Law 7 — Reproducibility ≠ Admissibility

\[ \boxed{ \text{Configuration Reproducibility} \neq \text{Operation Admissibility} } \]

## Law 8 — Historical Result ≠ Current Assessment

\[ \boxed{ \text{Historical Result} \neq \text{Current Constitutional Assessment} } \]

## Law 9 — Exact Evaluation Requires Exact Closure

\[ \boxed{ \text{No Floating} + \text{No Hidden State} + \text{No Implicit Substitution} } \]

---

# 46. Targeted Council Instruction

The Council is requested to review R4-R2 through the revised scenario set.

Reviewers should specifically challenge:

1. whether any scenario still requires Z-PROF to invent lifecycle authority;
2. whether OP sufficiently separates historical verification, reconstruction, and current execution;
3. whether `T_trust` correctly resolves post-execution revocation cases;
4. whether Constitutional Opacity Boundaries prevent federation overreach without creating hidden dependencies;
5. whether BCG properly avoids duplication of RI Resolution Graph authority;
6. whether temporal applicability rules are sufficiently explicit;
7. whether Evidence integrity/trust separation is sufficient;
8. whether retroactive Policy is represented without historical rewriting;
9. whether the four-dimensional Evaluation Status creates a new authority or merely aggregates sovereign determinations;
10. whether any remaining question genuinely blocks Semantic Closure rather than belonging to Contract Closure.

The Council should not reopen already-stable invariants unless a concrete scenario demonstrates a contradiction.

---

# 47. Proposed Disposition

**Z-PROF-D5-R4-R2 — LIFECYCLE, VERSION BINDING, TRUST & OPERATION SEMANTICS**

**STATUS: DRAFT — FINAL TARGETED COUNCIL STRESS-TEST**

The document is intended to close the semantic foundation required for:

```text
AMS-0860 — Lifecycle & Versioning
```

No implementation authority is granted.

The next legitimate sequence remains:

```text
Z-PROF-D5-R4-R2
        ↓
Final Targeted Council Stress-Test
        ↓
Semantic Closure / Ratification
        ↓
AMS-0860-ARCH-CLOSURE
        ↓
Contract Closure
        ↓
AMS-0860 Implementation Mandate
        ↓
Jules Implementation
        ↓
Verification
```

**IMPLEMENTATION AUTHORITY: NONE**

**END OF Z-PROF-D5-R4-R2**

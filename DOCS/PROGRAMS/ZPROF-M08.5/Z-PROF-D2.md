# Z-PROF — D2-R3

## Contract Consumption, Attachment & Jurisdiction Matrix

**Document ID:** `Z-PROF-D2-R3` **Dimension:** D2 — Existing Repository Reality **Round:** 3 **Status:** `DRAFT — COUNCIL REVIEW REQUIRED` **Program:** Z-PROF **Authority:** Zyppi Constitutional Council **Implementation Authority:** `NONE` **Investigation Basis:** M03–M08 repository evidence, M08-PREP, M08-PLAN, M08-GDR, M08-Reconnaissance **Predecessor:** `Z-PROF-D2-R2` **Downstream Dimensions:** D5 — Profile Composition & Interrogation; D3 — Alternative Architectures; D4 — Application Stress Tests

# 1. Purpose

This document is the third investigation round of **Dimension 2 — Existing Repository Reality**.

Its purpose is to establish, with explicit boundaries:

1. what Z-PROF is permitted to consume from the existing Zyppi substrate;

2. what Z-PROF must not duplicate;

3. where a Profile may legally attach to the existing execution architecture;

4. what information a Profile may interrogate or project;

5. which responsibilities remain owned by existing constitutional layers;

6. which capabilities are genuinely absent and therefore candidates for Z-PROF;

7. which questions remain unresolved and must be transferred to D5 or D3.

This document is **not** an implementation plan.

It does not authorize creation of a Profile package, Profile Registry, semantic engine, DSL, WASM module, reasoning engine, or new constitutional contract.

Any new constitutional meaning identified here remains subject to Council decision.

# 2. Evidence Discipline

D2-R3 shall distinguish three states:

### 2.1 Implemented

A capability is classified as **IMPLEMENTED** only where repository evidence demonstrates that the relevant mechanism physically exists.

### 2.2 Constitutional / Architectural

A capability is classified as **ARCHITECTURALLY DEFINED** where governing documents establish the intended contract or boundary, but repository evidence does not establish equivalent completed implementation.

### 2.3 Missing

A capability is classified as **MISSING** where the investigated repository contains no established mechanism providing that capability.

Where documentation and implementation differ:

**Record the discrepancy. Do not silently reconcile it.**

M08 explicitly establishes evidence-before-interpretation discipline and requires implementation discrepancies to be surfaced rather than resolved by engineering convenience.

# 3. Existing Substrate

The current Zyppi substrate relevant to Z-PROF consists of:
`M03 Domain contracts and deterministic serialization         │ M04 Nine-stage Runtime structure and purity boundary         │ M05 Persistent Registry and retrieval adapters         │ M06 GS1 resolution / normalization         │ M07 Evidence resolution and verification         │ M08 Constitutional Runtime execution         │         ▼ ExecutionOutput / ExecutionReceipt `
The M08 planning baseline explicitly identifies existing source-of-truth contracts including:

- `IdentityRecord`

- `StandingRecord`

- `AuthorityRecord`

- `CapabilityRecord`

- `PolicyRecord`

- `PolicyContext`

- `EvaluatorResult`

- `PipelineResult`

- `ActiveConstitutionalView`

- `EvidenceBundle`

- `ExecutionContext`

- `ExecutionRequest`

- `ExecutionReceipt`

- `ExecutionOutput`

- `Outcome`

- `TrustResult`

- `ResolvedGs1DigitalLink`

- `RetrievedRegistryState`

- `RegistryRepository`

- `ReceiptRepository`

- `EvidenceReferenceResolver`

- `EvidencePayloadProvider`

M08 explicitly prohibits silently redefining, replacing, expanding, or duplicating these constitutional representations.

Therefore:

**Z-PROF shall be designed as a consumer and possible extension of the existing substrate, not as a replacement substrate.**

# 4. Contract Consumption Matrix

Existing Surface

Status

Z-PROF Relationship

Permitted Use

Duplication Risk

`ActiveConstitutionalView`

Existing contract

**PRIMARY INPUT**

Read constitutional state for projection/interrogation

Creating a second "Profile Reality"

`EvidenceBundle`

Existing contract

**INPUT / PROVENANCE**

Consume verified evidence available to the authorized execution

Re-verifying constitutional evidence independently

`EvidenceRecord`

Existing

**INPUT**

Read evidence metadata where contract permits

Creating parallel evidence records

`ExecutionRequest`

Existing

**BOUNDARY INPUT**

Consume only through established contract

Redefining request semantics

`ExecutionContext`

Existing

**BOUNDARY INPUT**

Consume permitted explicit context

Creating a second constitutional execution context

`ExecutionOutput`

Existing / M08 target result

**PRIMARY RESULT INPUT**

Interpret constitutional execution result

Creating parallel constitutional execution output

`Outcome`

Existing

**READ ONLY**

Consume constitutional outcome

Redefining Outcome vocabulary

`TrustResult`

Existing

**READ ONLY**

Consume constitutional trust result

Creating a competing constitutional trust model

`PolicyRecord`

Existing

**DEFER / CONSUME AS AUTHORIZED**

Use policy result/context only where jurisdiction permits

Turning Profile rules into authorization policy

`PolicyContext`

Existing

**DO NOT REDEFINE**

Respect M08 semantics

Using it as a domain-rule transport

`PolicyDecision` / evaluator result

Existing

**READ ONLY**

Consume authorization result

Creating a second authorization engine

`ExecutionReceipt`

Existing

**PROVENANCE ANCHOR**

Reference/hash-bind Profile-derived artifacts where later authorized

Creating an independent constitutional receipt

`RetrievedRegistryState`

Existing

**APPLICATION-SIDE INPUT**

Use through existing retrieval path

Rebuilding Registry

`ResolvedGs1DigitalLink`

Existing M06 capability

**CONSUME**

GS1 entry-point information

Reimplementing GS1 resolution

`RegistryRepository`

Existing

**CONSUME THROUGH APPLICATION**

Profile requirements may eventually inform retrieval, subject to D5 decision

Direct Profile-owned persistence

`EvidenceReferenceResolver`

Existing

**CONSUME THROUGH APPLICATION**

Resolve declared evidence requirements

Profile-owned evidence retrieval

`EvidencePayloadProvider`

Existing

**CONSUME THROUGH APPLICATION**

Retrieve explicit evidence payloads

Profile-owned I/O

JCS / RFC 8785 serialization

Existing

**CONSUME**

Canonicalize Profile artifacts if authorized

Parallel canonicalization system

SHA-256 / existing hash architecture

Existing

**CONSUME / EXTEND ONLY IF GOVERNED**

Hash Profile artifacts if required by final architecture

Unapproved new constitutional hash domain

M04 Runtime

Existing structural foundation

**DO NOT DUPLICATE**

Invoke/consume according to established boundary

Creating Z-PROF Runtime

M08 Runtime

Existing constitutional owner

**DO NOT REPLACE**

Supply/consume explicit artifacts only through governed interface

Embedding domain semantics into Runtime

# 5. Primary Consumption Boundary

D2-R3 identifies the following as the **candidate canonical consumption boundary**:
`                 CONSTITUTIONAL REALITY                            │                            ▼                   ActiveConstitutionalView                            │              ┌─────────────┴─────────────┐              │                           │         EvidenceBundle             Policy / Trust              │                           │              └─────────────┬─────────────┘                            │                            ▼                     ExecutionOutput                            │                            ▼                        Z-PROF                            │                  Semantic interpretation                            │                            ▼                  Domain-specific result`
This diagram is a **boundary hypothesis**, not a ratified architecture.

It establishes one important invariant:

Z-PROF shall not become the source of constitutional Reality.

# 6. Attachment Point Matrix

Z-PROF may theoretically attach at several locations.

Attachment Point

Architectural Fit

Main Benefit

Main Risk

D2 Disposition

**A. Before M08**

Application / Translation

Profile can influence what constitutional material is assembled

Could allow Profile to influence Reality retrieval without defined jurisdiction

**OPEN — D5**

**B. Between M08 stages**

Runtime

Deep integration with constitutional execution

High collision with M08 Runtime boundary

**PRESUMPTIVELY DISFAVORED**

**C. RSN / Reasoning boundary**

Constitutional architecture

Potentially aligns with existing Reasoning Layer concept

Requires determining what "reasoning artifact" constitutionally means

**OPEN — D1/D5/D3**

**D. After M08**

Application / Translation

Strong separation; consumes immutable constitutional output

Profile judgment may not automatically become constitutional execution evidence

**STRONG CANDIDATE**

**E. Application-hosted pure Profile evaluator**

Translation/Application

Pure deterministic logic without Runtime pollution

Requires separate profile lifecycle, registry and interrogation model

**STRONG CANDIDATE**

**F. Hybrid**

Application + constitutional artifact

Could separate interrogation from deterministic projection

Greater complexity and governance surface

**OPEN — D3/D5**

# 7. Current D2 Position on Attachment

D2-R3 does **not** authorize Z-PROF inside `packages/runtime`.

The existing M08 boundary requires the Runtime to remain:

- explicit-input driven;

- deterministic;

- synchronous;

- zero-I/O;

- infrastructure-independent;

- free from ambient clock/randomness;

- free from persistence.

The Application layer is explicitly responsible for retrieval, assembly, orchestration, and transport of explicit constitutional inputs.

Therefore:

**Any proposal to place Profile-specific domain semantics inside the Runtime requires explicit constitutional justification and cannot be inferred merely from implementation convenience.**

The existence of an architectural Reasoning Layer concept is evidence that a future attachment may exist, but it does not establish that a functioning Profile engine currently exists in the repository.

# 8. Jurisdiction Matrix

The central unresolved question is not initially:

"What technology should implement Profiles?"

It is:

**"What is a Profile constitutionally permitted to know, ask, derive, and conclude?"**

D2-R3 therefore proposes the following jurisdiction categories for Council/D5 interrogation.

Jurisdiction

Question

Current D2 Status

**Read**

What existing constitutional records may a Profile read?

**OPEN**

**Interrogate**

May a Profile declare requirements for additional Registry/Evidence retrieval?

**OPEN**

**Select**

May a Profile select which constitutional truth enters execution?

**OPEN / HIGH RISK**

**Transform**

May a Profile transform existing records into domain concepts?

**LIKELY REQUIRED — D5**

**Derive**

May a Profile derive new domain facts from verified inputs?

**OPEN — D5**

**Judge**

May a Profile produce domain judgments?

**OPEN — D5**

**Authorize**

May a Profile determine who may perform an action?

**NO — POL boundary**

**Mutate**

May a Profile alter constitutional Reality?

**NO**

**Verify**

May a Profile independently establish constitutional evidence validity?

**NO — M07/M08 boundary**

**Persist**

May a Profile directly persist constitutional artifacts?

**NO direct Runtime persistence; downstream persistence requires governance**

**Execute**

May a Profile perform arbitrary execution?

**OPEN only for bounded deterministic evaluation; technology belongs to D3**

**Compose**

May one Profile invoke/combine another Profile?

**OPEN — D5**

**Delegate**

May a Profile cause another Profile to interrogate additional data?

**OPEN — D5**

**Attest**

Can Profile artifacts receive constitutional attestation?

**OPEN — D1/D3**

# 9. The Critical Separation: Authorization vs Domain Interpretation

D2-R3 establishes a preliminary boundary that must be tested by D1 and D5.

Existing M08 Policy semantics govern constitutional authorization:
`Who / Subject       + Action       + Target       + Context       ↓ Authorization Decision `
Z-PROF is being investigated for a fundamentally different operation:
`Verified Constitutional Reality       + Profile       ↓ Domain Interpretation       ↓ Domain-specific meaning `
These must not be silently conflated.

In particular:

**A Profile must not become a second POL engine merely because its domain logic contains rules.**

Likewise:

**A domain conclusion must not automatically acquire constitutional authorization semantics merely because it is deterministic.**

This distinction remains unresolved at the level of exact constitutional vocabulary.

# 10. Projection vs Judgment

D2-R3 identifies an important conceptual split requiring D5 investigation.

### 10.1 Projection

A Profile maps existing Reality into a domain representation:
`ACV  ↓ Profile mapping  ↓ Domain object `
Example:
`Constitutional Referent         ↓ GS1 Profile         ↓ Trade Item `

### 10.2 Judgment

A Profile derives a conclusion:
`ACV + Evidence + Profile         ↓ Domain evaluation         ↓ Judgment `
Example:
`Trade Item + Verified evidence + GS1/DPP rules         ↓ "Identity sufficiently established" `
D2-R3 therefore refuses to assume that:

`Profile = Judgment Engine`

until D5 determines whether Profile composition consists of:
`Projection     ↓ Interpretation     ↓ Evaluation     ↓ Judgment `
or some other formal model.

# 11. Interrogation Boundary

The current repository already establishes that the Application layer retrieves and assembles explicit constitutional inputs.

The M06 → M05 → M07 → M08 composition analysis identified the Application layer as the required bridge between:
`GS1 resolution     ↓ Registry retrieval     ↓ ACV construction     ↓ Evidence resolution     ↓ Evidence payload retrieval     ↓ Evidence verification     ↓ ExecutionRequest     ↓ Runtime `
Therefore the future Profile interrogation mechanism must not assume direct access to PostgreSQL, R2, or other infrastructure.

The unresolved model is:
`Profile Requirement         ↓ Interrogation Contract         ↓ Application orchestration         ↓ Existing Registry / Evidence contracts         ↓ Explicit constitutional inputs `
The exact form of `Interrogation Contract` is **not yet established**.

D2-R3 explicitly transfers this question to D5.

# 12. Consumption vs Ownership Matrix

A crucial Z-PROF design rule emerges:

Capability

Existing Owner

Z-PROF

Constitutional identity

Domain / Constitution

Consume

Constitutional referent

Domain / Constitution

Consume

Registry truth

M05

Consume

Evidence truth

M07

Consume

Evidence verification

M07 / Runtime

Consume result

Constitutional policy

POL / M08

Consume result

Authorization

POL

Never own

Trust evaluation

M08

Consume result

Constitutional execution

M08 Runtime

Never own

Constitutional receipt

M08 Runtime

Consume/reference

Semantic projection

**Missing**

Candidate owner

Domain ontology

**Missing**

Candidate owner

Profile interrogation

**Missing**

Candidate owner / Application contract

Domain evaluation

**Missing**

Candidate owner

Domain judgment

**Missing**

Candidate owner, subject to D5

Profile composition

**Missing**

Candidate owner, subject to D5

Profile lifecycle

Existing constitutional lifecycle principles may apply

Must be determined

Profile attestation

Existing SEC principles may apply

Must be determined

Profile persistence

Existing Application/Registry infrastructure

Must be determined

# 13. What Z-PROF Must Not Duplicate

The following are now proposed as **D2 hard constraints**:

### Z-PROF SHALL NOT create:

1. a second Constitutional Reality representation;

2. a second Registry;

3. a second Evidence Engine;

4. a second constitutional Policy Engine;

5. a second Authorization Engine;

6. a second Trust Engine;

7. a second Runtime;

8. a second constitutional Receipt model;

9. a second canonical serialization authority;

10. a parallel identity primitive;

11. a parallel constitutional execution context.

Any apparent requirement for one of these shall be treated as an architectural conflict requiring Council review.

M08's source-of-truth baseline explicitly prohibits duplicate constitutional representations.

# 14. What D2 Has Actually Established as Missing

The following capabilities are not found in the investigated repository substrate:

### MISSING-01 — Semantic Projection

A governed mechanism for mapping constitutional Reality into domain-specific concepts.

### MISSING-02 — Profile Ontology

A formal representation of the semantic vocabulary and relationships a Profile operates upon.

### MISSING-03 — Profile Interrogation

A governed mechanism by which a Profile expresses the constitutional information/evidence it requires.

### MISSING-04 — Domain Evaluation

A deterministic mechanism for deriving domain-specific conclusions from authorized inputs.

### MISSING-05 — Domain Judgment Contract

A formally defined result representing a Profile-derived domain conclusion, if such a construct is ultimately required.

### MISSING-06 — Profile Composition

A formal mechanism for combining multiple Profiles without creating semantic ambiguity or authority conflicts.

### MISSING-07 — Profile Jurisdiction

A formal boundary defining what a Profile may read, request, derive, judge, or delegate.

### MISSING-08 — Profile Lifecycle / Attestation Semantics

A determined application of existing constitutional lifecycle/security mechanisms to Profile artifacts, if Profiles are governed artifacts.

These are **capability findings**, not implementation mandates.

# 15. Existing Repository Constraint: M08 Is Not Yet Permission to Assume Completion

The M08 documents define the intended nine-stage execution path:
`Admission  ↓ Bundle Discovery  ↓ Bundle Verification  ↓ Dependency Resolution  ↓ Compatibility Validation  ↓ ACV Activation  ↓ Resolution Graph Construction  ↓ Active Execution  ↓ Receipt Generation `
The M08 objective explicitly says this is to complete the existing M04 pipeline rather than create a parallel Runtime architecture.

However, repository reconnaissance independently identifies a historical composition gap between M06, M05, M07 and M08.

Therefore D2-R3 shall use:

**M08 constitutional contract = intended substrate**

and:

**M08 repository state = implementation evidence**

without assuming that the former proves the latter.

This distinction must be preserved in every subsequent Z-PROF round.

# 16. Proposed Z-PROF Boundary Model

The current best-supported model is:
`                   ZYPPI CONSTITUTION                            │                            ▼                 ┌─────────────────────┐                 │ Constitutional      │                 │ Reality / ACV       │                 └──────────┬──────────┘                            │                            ▼                 ┌─────────────────────┐                 │ M08 Constitutional  │                 │ Execution           │                 └──────────┬──────────┘                            │               ExecutionOutput / Receipt                            │                            ▼                 ┌─────────────────────┐                 │      Z-PROF         │                 │                     │                 │ Profile Ontology    │                 │ Projection          │                 │ Evaluation          │                 │ Judgment*           │                 └──────────┬──────────┘                            │                            ▼                 Domain-specific result`
`* Judgment remains subject to D5 determination.`

A separate interrogation path may exist:
`                Profile                     │                     ▼            Interrogation Contract                     │                     ▼               Application              /           \         M05 Registry     M07 Evidence              \           /               └────┬────┘                    ▼             Explicit Inputs                    │                    ▼                  M08`
Whether these two paths are one unified Profile architecture or two governed subsystems remains unresolved.

# 17. D2-R3 Findings

### F-D2R3-01 — Existing Constitutional Substrate

**Finding:** M03–M08 already provide the majority of the constitutional substrate Z-PROF requires.

**Status:** `CONFIRMED`

### F-D2R3-02 — No Permission to Duplicate

**Finding:** Existing M03–M08 contracts are source-of-truth surfaces and must be consumed rather than duplicated.

**Status:** `CONFIRMED`

### F-D2R3-03 — Runtime Boundary

**Finding:** Z-PROF cannot be placed inside the Runtime merely because it is deterministic. Runtime placement requires an explicit constitutional decision.

**Status:** `CONFIRMED AS CONSTRAINT`

### F-D2R3-04 — Application Interrogation Candidate

**Finding:** Application-layer orchestration is the currently evidenced location for retrieval and assembly of explicit constitutional inputs.

**Status:** `CONFIRMED`

### F-D2R3-05 — Semantic Projection Gap

**Finding:** No existing repository mechanism provides generalized semantic projection.

**Status:** `CONFIRMED MISSING CAPABILITY`

### F-D2R3-06 — Profile Jurisdiction Gap

**Finding:** No established mechanism defines the exact read/interrogate/derive/judge jurisdiction of a Profile.

**Status:** `CONFIRMED MISSING CAPABILITY`

### F-D2R3-07 — Domain Judgment Undefined

**Finding:** A `DomainJudgment` contract is not established by the existing substrate.

**Status:** `UNRESOLVED — D5`

### F-D2R3-08 — Profile Composition Undefined

**Finding:** No composition algebra exists in the investigated substrate.

**Status:** `UNRESOLVED — D5`

### F-D2R3-09 — RSN Attachment

**Finding:** A Reasoning Layer / reasoning-artifact concept exists architecturally, but repository evidence does not establish a completed Z-PROF reasoning engine.

**Status:** `ARCHITECTURAL POSSIBILITY — NOT IMPLEMENTATION FACT`

### F-D2R3-10 — Profile Technology

**Finding:** The repository evidence does not establish whether Z-PROF should use TypeScript, DSL, graph technology, WASM, OPA, or another mechanism.

**Status:** `TRANSFER TO D3`

# 18. Questions Transferred to D5

D5 shall answer:

1. What exactly is a Profile?

2. Is a Profile primarily:

- ontology;

- projection;

- evaluator;

- judgment engine;

- interrogation contract;

- or a composition of these?

3. What may a Profile read?

4. What may it request?

5. What may it derive?

6. What may it judge?

7. Can a Profile invoke another Profile?

8. How are Profiles composed?

9. What constitutes a Profile conflict?

10. What constitutes Profile authority?

11. Is a Domain Judgment a first-class constitutional artifact or an application derivative?

12. Does Profile output become evidence?

13. Does Profile output become part of a constitutional receipt?

14. What constitutes the semantic identity of a Profile?

15. What is the minimum Profile needed for CAW/GS1?

# 19. Questions Transferred to D3

D3 shall not start by asking:

"Which technology should we use?"

It shall start only after D5 defines the semantic object sufficiently to compare technologies.

D3 shall then investigate:

1. Pure deterministic evaluator;

2. declarative semantic DSL;

3. graph-based semantic engine;

4. rules engine;

5. WASM/sandboxed execution;

6. policy/rules technologies where appropriate;

7. ontology technologies;

8. hybrid architectures;

9. third-party Profile extensibility;

10. deterministic replay;

11. cryptographic attestation;

12. execution/resource constraints.

Technology selection shall follow semantic requirements rather than precede them.

# 20. Questions Transferred to D1

D1 shall determine whether the following distinctions are constitutionally valid:
`Constitutional Policy         ≠ Domain Rule  Authorization         ≠ Domain Judgment  Constitutional Trust         ≠ Domain Confidence  Constitutional Reality         ≠ Domain Projection  Execution Receipt         ≠ Domain Result `
If these distinctions are constitutionally valid, Z-PROF can be designed without colliding with POL, SEC, RI, or CEngS.

If they are not valid, the Z-PROF model requires constitutional redesign before implementation.

# 21. D2-R3 Preliminary Decision

### Decision D2-R3-01

**Proposed direction:**

Z-PROF SHALL be treated as a consumer and semantic extension of the existing Zyppi constitutional substrate, not as a replacement for M03–M08.

### Invariants

Z-PROF shall not:

- duplicate constitutional Reality;

- replace Registry truth;

- replace Evidence verification;

- replace Authorization;

- replace Trust;

- replace Runtime execution;

- create a parallel constitutional receipt system;

- move infrastructure access into the constitutional Runtime.

### Status

`PROPOSED — COUNCIL CONFIRMATION REQUIRED`

# 22. D2-R3 Closure Criteria

D2-R3 shall be considered complete when the Council has either ratified or rejected:

1. the consumption matrix;

2. the attachment-point boundary;

3. the ownership/duplication constraints;

4. the Profile jurisdiction categories;

5. the transfer of unresolved semantic questions to D1/D5;

6. the transfer of technology questions to D3;

7. the distinction between repository implementation reality and constitutional design intent.

D2-R3 does **not** require selection of a Profile implementation technology.

It does **not** require definition of the final Profile contract.

It does **not** authorize implementation.

# 23. Current State of Z-PROF Investigation

Following D2-R3, the investigation should be understood as:
`D1 — Constitutional Fit         │         │ determines legal/constitutional jurisdiction         ▼ D2 — Repository Reality         │         │ establishes existing substrate + hard boundaries         ▼ D5 — Profile Composition & Interrogation         │         │ defines what a Profile actually is         ▼ D3 — Alternative Architectures         │         │ selects the appropriate implementation family         ▼ D4 — Application Stress Tests         │         │ attempts to break the resulting architecture         ▼ Z-PROF Constitutional Design `

### D2-R3 conclusion

**The existing Zyppi repository already supplies the constitutional substrate. The genuinely new Z-PROF problem is not execution, authorization, evidence verification, registry management, or constitutional truth. It is the governed semantic boundary between constitutional Reality and domain-specific interpretation.**

The exact shape of that boundary remains intentionally unresolved until D1 and D5 complete their work.

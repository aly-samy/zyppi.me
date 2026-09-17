# Z-PROF-D3 — Alternative Architectures

## Final Council Closure

**Document ID:** `Z-PROF-D3` **Dimension:** D3 — Alternative Architectures **Program:** Z-PROF — Zyppi Profile Architecture **Round:** 1 **Version:** `1.0` **Status:** **CLOSED — FINDINGS RATIFIED** **Authority:** Zyppi Constitutional Council **Implementation Authority:** **NONE** **Decision Date:** `2026-08-13`

## 1. Purpose

D3 determines the architectural class appropriate for Z-PROF following the D1 Constitutional Fit investigation and D2 Repository Reality investigation.

The question is:

**How should Zyppi provide governed semantic projection and domain interpretation while preserving the constitutional ownership of Reality, Identity, Evidence, Security, Policy, Registry, and Runtime?**

D3 does **not** authorize implementation technology, repository placement, programming language, vendor, or execution mechanism.

Its purpose is to establish the architectural identity that all subsequent Z-PROF design and implementation must respect.

The central question is:

**What kind of thing is a Zyppi Profile?**

# 2. Constitutional Starting Position

D1 established that Z-PROF is constitutionally viable only if it does not become a parallel constitutional organ.

D2 established that the existing Zyppi substrate already provides substantial infrastructure that Z-PROF must consume rather than reproduce.

In particular, the existing M03–M08 architecture establishes a deterministic Runtime boundary that Z-PROF must not duplicate.

Conceptually:

```
Application     │     │ Explicit Constitutional Inputs     ▼ ┌──────────────────────────────────────┐ │              RI RUNTIME              │ │                                      │ │ Admission                            │ │ Bundle Discovery                     │ │ Bundle Verification                  │ │ Dependency Resolution                │ │ Compatibility Validation             │ │ ACV Activation                       │ │ Resolution Graph Construction        │ │ Active Execution                     │ │ Receipt Materialization              │ │                                      │ │ Pure · Deterministic · Zero-I/O      │ └──────────────────────────────────────┘     │     ▼ ExecutionOutput + ExecutionReceipt

```

Z-PROF therefore cannot become another Runtime merely because Profile evaluation requires deterministic computation.

# 3. Architectural Alternatives Examined

D3 evaluated ten architectural classes:

1. Plugin systems

2. Policy engines

3. Rules engines

4. Ontology / semantic systems

5. Semantic projection layers

6. Capability systems

7. Workflow / orchestration engines

8. Agent frameworks

9. Pure functional / deterministic evaluators

10. Hybrid architectures

The Council's conclusion is that **no existing technology category alone adequately describes Z-PROF**.

Several categories provide useful implementation mechanisms, but none should become Z-PROF's constitutional identity.

# 4. Alternative A — Plugin Architecture

### Assessment

A plugin architecture provides an effective distribution and extensibility mechanism:

```
Profile Host     ├── GS1     ├── DPP     ├── Customs     ├── Logistics     └── Healthcare

```

It supports independent Profile evolution and eventual third-party participation.

However, a plugin architecture answers:

"How do we load external functionality?"

It does not answer:

"What does that functionality mean?"

Arbitrary plugins can introduce:

- side effects;

- nondeterminism;

- uncontrolled data access;

- hidden dependencies;

- incompatible semantic models;

- difficult replay;

- unclear authority boundaries.

### Disposition

**REJECTED as the constitutional architectural identity.**

Plugin mechanisms may subsequently be used as a governed Profile distribution mechanism.

# 5. Alternative B — Policy Engine

A policy engine evaluates constructs such as:

```
Subject + Action + Target + Context                     │                     ▼              Policy Evaluation                     │                ALLOW / DENY
```

This belongs fundamentally to **POL**.

A domain conclusion such as:

"Product qualifies for market X"

is not equivalent to:

"Subject is authorized to perform Action."

Likewise:

"Shipment qualifies as refrigerated transport"

is not an authorization decision.

### Disposition

**REJECTED as the Z-PROF architectural identity.**

Z-PROF may consume governed Policy decisions where required, but SHALL NOT redefine Policy semantics or become a Policy engine.

# 6. Alternative C — Rules Engine

A rules engine provides:
`Facts + Rules       │       ▼   Conclusion `
This is substantially relevant to Z-PROF.

It provides useful properties:

- deterministic evaluation;

- inspectable rules;

- versioning;

- domain-specific logic;

- replayability;

- explainability.

However, rules alone do not establish:

- domain ontology;

- semantic identity;

- interrogation;

- projection;

- composition;

- jurisdiction;

- evidence provenance;

- Profile lifecycle.

A rules engine can answer:

"Given these facts, what conclusion follows?"

Z-PROF must additionally establish:

"Which governed facts are relevant, what do they mean in this domain, and how are the resulting domain capabilities composed?"

### Disposition

**ACCEPTED AS A POSSIBLE INTERNAL MECHANISM, REJECTED AS THE ARCHITECTURAL IDENTITY.**

# 7. Alternative D — Ontology / Semantic System

Ontology directly addresses the semantic problem:

```
Constitutional Reality         │         ▼ Domain Ontology         │         ▼ Concept Mapping         │         ▼ Domain Representation
```

It is particularly compatible with Zyppi's separation between Reality and interpretation.

It can represent:

- domain concepts;

- relationships;

- classifications;

- equivalence;

- inheritance;

- constraints;

- contextual meaning;

- vocabulary mappings.

However, ontology alone does not provide:

- deterministic execution;

- interrogation;

- resource control;

- lifecycle;

- policy integration;

- evidence verification;

- judgment generation.

### Disposition

**ACCEPTED AS A FIRST-CLASS SEMANTIC COMPONENT, BUT NOT SUFFICIENT AS THE COMPLETE Z-PROF ARCHITECTURE.**

# 8. Alternative E — Semantic Projection Layer

The semantic projection model most directly matches the constitutional problem:

```
                          Constitutional Reality                        │                        ▼               Semantic Projection                  │      │      │                  ▼      ▼      ▼                 GS1    DPP   Customs                  │      │      │                  ▼      ▼      ▼               Domain  Domain  Domain               Model   Model   Model
```

The central abstraction is:

**Projection is a governed mapping from Constitutional Reality into a domain-specific semantic representation.**

This preserves:

- Reality as authoritative;

- domain independence;

- semantic independence;

- simultaneous independent projections;

- separation from POL;

- separation from RI;

- deterministic interpretation.

### Disposition

**RATIFIED AS THE CORE ARCHITECTURAL IDENTITY OF Z-PROF.**

Projection is not, however, sufficient by itself. It must be combined with interrogation, deterministic evaluation, jurisdiction, and composition.

# 9. Alternative F — Capability System

Capability architecture answers:

"What may this Profile access?"

For example:
`GS1 Profile     │     ├── may inspect GTIN     ├── may inspect selected qualifiers     └── may inspect designated evidence classes `
This provides a strong least-privilege boundary and is particularly relevant to governed third-party Profiles.

However:

**Capability is not semantics.**

Capability determines the permitted surface; it does not determine what the accessed information means.

### Disposition

**RATIFIED AS A SUPPORTING ARCHITECTURAL MECHANISM.**

Capability restrictions remain subject to the SEC/Z-PROF boundary and SHALL NOT become a substitute for semantic governance.

# 10. Alternative G — Workflow / Orchestration Engine

Workflow systems naturally represent:
`Retrieve    ↓ Verify    ↓ Evaluate    ↓ Retrieve    ↓ Produce Result `
They are useful for Application-layer coordination.

However, workflow is procedural rather than semantic.

A workflow can execute:
`A → B → C → D `
without establishing what A, B, C, and D mean.

It also risks creating a second execution architecture parallel to RI.

### Disposition

**REJECTED as the Z-PROF architectural identity.**

Workflow/orchestration may be used by Application infrastructure for retrieval and assembly where constitutionally appropriate.

# 11. Alternative H — Agent Framework

An agent architecture could represent:
`Profile Agent     ↓ Observe Reality     ↓ Reason     ↓ Query     ↓ Interpret     ↓ Act `
This is attractive for complex domains but constitutionally unsuitable as the semantic authority.

Unconstrained agents introduce:

- nondeterministic reasoning;

- opaque intermediate state;

- uncontrolled interrogation;

- variable outputs;

- hidden dependencies;

- replay difficulty;

- unpredictable resource consumption.

The M08 constitutional model requires explicit inputs and deterministic execution.

### Disposition

**REJECTED AS THE CONSTITUTIONAL Z-PROF EVALUATION MODEL.**

AI may assist in authoring, discovery, analysis, or Experience/Application functions, but AI SHALL NOT become the constitutional semantic authority merely by being embedded inside a Profile.

# 12. Alternative I — Pure Functional / Deterministic Evaluator

The deterministic evaluator model is:
`Profile Definition         + Authorized Reality         + Explicit Context         │         ▼ Pure Profile Evaluation         │         ▼ Derived Domain Result `
Formally:
`J = F(P, R, C) `
where:

- `P` = Profile definition;

- `R` = authorized Reality;

- `C` = explicit contextual coordinates;

- `J` = derived domain result.

This provides:

- determinism;

- replayability;

- testability;

- absence of ambient state;

- bounded reasoning;

- compatibility with constitutional execution principles;

- suitability for cryptographic binding;

- suitability for property-based verification.

It does not independently solve ontology, interrogation, composition, jurisdiction, or distribution.

### Disposition

**RATIFIED AS THE PREFERRED EVALUATION MODEL WITHIN Z-PROF.**

It is a mechanism within the architecture, not the complete definition of Z-PROF.

# 13. Alternative J — Hybrid Architecture

The Council therefore rejects the premise that Z-PROF should be forced into one existing technology category.

The appropriate architecture is a **hybrid semantic architecture**:
`                        Z-PROF                            │              ┌─────────────┴─────────────┐              │                           │      Profile Definition          Profile Registry              │                           │              └─────────────┬─────────────┘                            ▼                     Domain Ontology                            │                            ▼                  Interrogation Contract                            │                            ▼               Authorized Reality Surface                            │                            ▼                  Semantic Projection                            │                            ▼               Deterministic Evaluation                            │                            ▼                  Derived Domain Result                            │                            ▼                   Evidence / Provenance`
Supporting constitutional organs retain their authority:
`POL  → Authorization SEC  → Identity / Trust / Attestation RI   → Constitutional Execution M05  → Registry / Persistence M07  → Evidence Retrieval / Evidence Infrastructure ZRM  → Constitutional Reality ARM  → Asset Reality / Asset Specialization PRJ  → Governed Projection RSN  → Governed Reasoning / Interpretation `
No single mechanism is permitted to absorb the responsibilities of the others.

### Disposition

**RATIFIED AS THE Z-PROF ARCHITECTURAL CLASS.**

# 14. Ratified Architectural Identity

The Council hereby establishes:

**Z-PROF is a governed semantic projection and deterministic domain interpretation architecture.**

A Zyppi Profile is therefore understood as a **governed semantic program/contract**, not as:

- a plugin;

- a policy;

- a workflow;

- an agent;

- a database schema;

- an API formatter;

- a second Runtime;

- a second Reality model.

Conceptually:
`PROFILE │ ├── Identity ├── Version ├── Jurisdiction ├── Ontology / Semantic Contract ├── Projection Requirements ├── Interrogation Contract ├── Evaluation Semantics ├── Composition Rules ├── Capability Requirements └── Governance / Attestation `
The semantic contract SHALL remain independent of the technology used to execute it.

# 15. Separation of What From How

A fundamental D3 finding is ratified:

**The Profile definition SHALL remain independent of the mechanism used to execute it.**

The same constitutional Profile semantics may eventually be implemented through:
`Profile Semantics       │       ├── TypeScript evaluator       ├── WASM evaluator       ├── Declarative rules evaluator       └── Future governed evaluator `
The Constitution governs the semantic contract and resulting governed artifacts.

It SHALL NOT prematurely constitutionalize a particular programming language, execution technology, or deployment mechanism.

Accordingly:

**Profile contract precedes execution technology.**

# 16. Interrogation Boundary

A Profile SHALL declare what it requires.

It SHALL NOT arbitrarily retrieve Reality.

Conceptually:
`Profile    │    │ Interrogation Contract    ▼ Application Retrieval Planner    │    ├── M05 Registry    ├── M07 Evidence    └── Other Authorized Sources    │    ▼ Canonical Profile Input    │    ▼ Z-PROF Deterministic Evaluation `
This preserves:

- authorized retrieval;

- infrastructure separation;

- deterministic assembly;

- zero ambient I/O inside the evaluator.

The Profile declares **what must be known**.

Application infrastructure determines **how authorized material is retrieved**.

# 17. Composition

Profile composition is hereby recognized as a **first-class Z-PROF requirement**.

The future Zyppi universe must support independent domains such as:
`GS1   + DPP   + Customs   + Logistics   + E-commerce   + Future Domains `
operating over the same underlying Reality.

Composition SHALL preserve:

1. shared Reality;

2. domain namespace separation;

3. independent semantic interpretation;

4. dependency ordering;

5. jurisdictional context;

6. evidence provenance;

7. version compatibility;

8. deterministic conflict behavior.

Composition SHALL NOT create a new universal semantic model.

A composite view is a composition of governed domain interpretations, not a new Reality.

# 18. Constitutional Collision Prohibitions

The following equations are constitutionally prohibited:
`Z-PROF ≠ new Runtime ` `Z-PROF ≠ new POL ` `Z-PROF ≠ new SEC ` `Z-PROF ≠ new Registry ` `Z-PROF ≠ new ZRM ` `Z-PROF ≠ generic Workflow Engine ` `Z-PROF ≠ arbitrary Plugin Host ` `Z-PROF ≠ AI Agent `
The constitutional identity is:
`Z-PROF = Governed Domain Semantic Projection + Declarative Interrogation + Deterministic Evaluation + Profile Composition `

# 19. Ownership Matrix

Capability

Constitutional Owner

Constitutional Reality

ZRM

Asset Reality / Asset specialization

ARM

Domain meaning

Z-PROF

Domain ontology / semantic contract

Z-PROF

Domain projection

PRJ / Z-PROF boundary

Interrogation requirements

Z-PROF

Authorized retrieval

Application + existing constitutional infrastructure

Authorization

POL

Identity / trust / attestation

SEC

Evidence infrastructure

M07 / SEC / RI as applicable

Deterministic constitutional execution

RI

Deterministic domain evaluation

Z-PROF

Reasoning / interpretation

RSN

Profile composition

Z-PROF

Persistence

M05 / Application

Transport / API / Edge

Application

Agentic assistance

Application / Experience / future governed mechanisms

This matrix is a boundary map, not an implementation prescription.

# 20. Third-Party Profiles

Third-party Profile authoring is constitutionally permissible in principle.

It SHALL require governed mechanisms including, as applicable:

- Profile validation;

- attestation;

- capability restriction;

- deterministic execution;

- lifecycle governance;

- versioning;

- compatibility validation.

Third-party participation SHALL NOT imply unrestricted access to Constitutional Reality or constitutional authority.

The execution technology may evolve from trusted internal implementation toward stronger isolation mechanisms such as WASM or a future declarative system.

The semantic contract remains authoritative over the mechanism.

# 21. AI and Agentic Participation

AI may participate in:

- Profile authoring assistance;

- Profile discovery;

- semantic analysis;

- Application orchestration;

- Experience;

- user interaction;

- higher-level reasoning.

However:

**An unconstrained AI agent SHALL NOT itself constitute the constitutional Z-PROF semantic evaluator.**

Any future probabilistic semantic mechanism would require an explicit constitutional architecture governing:

- determinism;

- provenance;

- boundedness;

- reproducibility;

- authority;

- evidence;

- error states;

- replay.

Until such an architecture exists, AI output remains a governed input or higher-level consumer artifact rather than constitutional semantic authority.

# 22. Relationship to RSN

D3 establishes the architectural distinction without prematurely assigning unresolved implementation placement.

Z-PROF owns the **domain semantic contract and composition architecture**.

RSN owns **governed reasoning and interpretation** where reasoning is invoked.

The exact mechanical relationship between Z-PROF and RSN, including whether particular evaluation artifacts are materialized through or alongside RI execution, remains a subsequent architectural concern.

This unresolved implementation question does **not** invalidate the D3 architectural identity.

No implementation agent may resolve it by assumption.

# 23. Relationship to RI / M08

Z-PROF SHALL NOT create a competing Runtime.

The existence of deterministic Profile evaluation does not authorize Z-PROF to modify the constitutional Runtime boundary.

The distinction is:
`Z-PROF     │     │ defines / binds domain semantics     ▼ Canonical Explicit Inputs     │     ▼ Existing Constitutional Execution Boundary     │     ▼ RI / M08 `
Z-PROF may require deterministic evaluation, but the architectural location of any particular execution step must remain governed by the subsequent M08.5 and implementation architecture decisions.

# 24. Technology Neutrality

D3 explicitly declines to constitutionalize:

- TypeScript;

- WASM;

- a domain-specific language;

- a specific rules engine;

- a specific ontology technology;

- a specific plugin mechanism;

- a specific orchestration framework.

TypeScript may be an appropriate initial implementation mechanism because of the existing repository environment.

WASM may become useful for stronger isolation.

A declarative DSL may eventually provide greater portability.

None is constitutionally selected by D3.

# 25. D3 Decision Register

### D3-01 — Architectural Identity

**Decision: RATIFIED**

Z-PROF is a governed semantic projection and deterministic domain interpretation architecture.

### D3-02 — Semantic Foundation

**Decision: RATIFIED**

Domain ontology / semantic contracts are first-class Profile components.

### D3-03 — Evaluation Model

**Decision: RATIFIED**

Semantic conclusions SHALL be produced through deterministic evaluation over explicit Profile inputs.

### D3-04 — Interrogation

**Decision: RATIFIED**

Profiles declare requirements.

Application infrastructure performs authorized retrieval and deterministic assembly.

### D3-05 — Authorization

**Decision: RATIFIED**

Z-PROF SHALL NOT implement domain authorization.

Authorization remains POL responsibility.

### D3-06 — Execution

**Decision: RATIFIED**

Z-PROF SHALL NOT create a new Runtime.

### D3-07 — Third-Party Profiles

**Decision: RATIFIED IN PRINCIPLE**

Third-party Profiles are architecturally permissible only through governed Profile mechanisms.

### D3-08 — AI / Agentic Profiles

**Decision: RATIFIED**

AI agents SHALL NOT constitute the unconstrained constitutional Profile evaluator.

### D3-09 — Composition

**Decision: RATIFIED**

Profile composition is a first-class Z-PROF capability.

### D3-10 — RSN Relationship

**Decision: DEFERRED WITHOUT BLOCKING D3 CLOSURE**

The exact mechanical relationship between Z-PROF and RSN remains subject to subsequent constitutional architecture.

This is an implementation/attachment question, not a reason to reopen the D3 architectural identity.

# 26. D3 Final Findings

The Council finds that:

1. Z-PROF requires a distinct architectural identity.

2. No generic technology category adequately defines that identity.

3. Semantic Projection is the central architectural concept.

4. Ontology provides the semantic foundation.

5. Declarative Interrogation defines what a Profile requires.

6. Authorized retrieval belongs outside the Profile evaluator.

7. Deterministic evaluation is the preferred evaluation model.

8. Capability restriction is a supporting governance mechanism.

9. Profile composition is foundational.

10. Z-PROF SHALL NOT duplicate RI.

11. Z-PROF SHALL NOT duplicate POL.

12. Z-PROF SHALL NOT duplicate SEC.

13. Z-PROF SHALL NOT duplicate ZRM.

14. Z-PROF SHALL NOT become a generic workflow engine.

15. Z-PROF SHALL NOT become an unconstrained plugin host.

16. Z-PROF SHALL NOT become an AI agent.

17. Profile semantics SHALL remain independent of implementation technology.

18. Third-party extensibility must remain governed.

19. Domain interpretations must remain distinct from Constitutional Reality.

20. Z-PROF exists to compose and bind governed semantic capabilities, not to create a new constitutional organ.

# 27. Ratified Architectural Principle

The Council hereby ratifies:

**Zyppi owns the meaning of a Profile; implementation technology merely provides the machinery by which that meaning is executed.**

And:

**Z-PROF is connective semantic architecture, never a new constitutional organ.**

Its purpose is to allow Zyppi to scale from one application and one wedge to potentially hundreds of domains and Profiles while preserving a single constitutional substrate.

The architecture therefore scales by **composition and factorization**, not by multiplication of independent semantic systems.

# 28. D3 Closure

D3 has fulfilled its constitutional purpose.

The architectural search space has been sufficiently narrowed to establish the Z-PROF architectural class without prematurely fixing implementation details.

The remaining questions belong to subsequent dimensions and implementation governance, including:

- detailed Profile composition;

- interrogation contracts;

- jurisdiction;

- composition algebra;

- exact RSN relationship;

- concrete artifact structure;

- execution attachment;

- implementation technology;

- repository architecture.

These questions SHALL NOT reopen the D3 architectural conclusion unless a higher-authority constitutional finding demonstrates that the ratified architectural class itself is incompatible with Zyppi's foundations.

# 29. Final Disposition

**Z-PROF-D3**

**STATUS: CLOSED — FINDINGS RATIFIED**

**Disposition:** **RATIFIED**

**Implementation Authority:** **NONE**

**Architectural Class:**

**Governed Semantic Projection + Declarative Interrogation + Deterministic Domain Evaluation + Profile Composition**

**Constitutional Identity:**

**Z-PROF is connective semantic architecture, not a new constitutional organ.**

**Closure Condition:** Satisfied.

**End of Z-PROF-D3.**

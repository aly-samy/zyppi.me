# CONTRACT-SIOS-ZPROF-001 — SIOS → Z-PROF Consumer Boundary

**Document ID:** `CONTRACT-SIOS-ZPROF-001` **Title:** SIOS → Z-PROF Consumer Boundary Contract **Program:** `CAW-011 — Commerce Atlas Wedge` **Milestone:** `M08.5 — Z-PROF Profile Architecture` **Version:** `v1.0` **Status:** `RATIFIED — CLOSED` **Authority:** Zyppi Constitutional Council **Implementation Authority:** `NONE` **Predecessors:** `M08.5-Dimentions`, `Z-PROF-001`, `CONTRACT-R1`, `AMS-0852-CONTRACT-SPEC` **Related Decision:** `D5-16 — SIOS Translation`

# 1. Purpose

This contract closes the constitutional boundary between:

- **SIOS Translation**, which is responsible for translating external domain language into constitutional concepts; and

- **Z-PROF**, which is responsible for composing and structurally binding already-governed constitutional capabilities.

The purpose of this contract is **not** to define or implement the SIOS Translation engine.

It defines only the **consumer-side relationship** required for an authoritative SIOS Translation result to participate in a Z-PROF Domain Composition.

The governing architectural distinction is:
`External Domain Language           │           ▼    SIOS Translation    Semantic Authority           │           ▼ Epistemic Requirement Contract    Shared Constitutional        Substrate           │           ▼       Z-PROF Structural Composition Authority           │           ▼  CompositionManifest           │           ▼ Bound Constitutional Payload           │      ┌────┼────┬────┬────┐      ▼    ▼    ▼    ▼    ▼     PRJ  RSN  POL  SEC   RI `
This contract therefore establishes the seam without transferring semantic authority from SIOS to Z-PROF.

The existing Z-PROF architecture establishes that Epistemic Requirement Contracts are a shared constitutional substrate and that Z-PROF references and composes them rather than owning the underlying epistemic requirement concept.

# 2. Constitutional Basis

This contract derives from the following already-ratified principles.

## 2.1 SIOS Translation Boundary

`D5-16 — SIOS Translation` establishes:

- Z-PROF is not the constitutional Translation Layer.

- SIOS Translation Layers remain responsible for translating domain language into constitutional concepts.

- Z-PROF provides the governed composition and registration substrate through which those requirements may be bound to existing constitutional capabilities.

Accordingly:

**Z-PROF SHALL NOT acquire semantic translation authority merely because it consumes a SIOS-produced result.**

## 2.2 Epistemic Requirement Contract

The existing constitutional model establishes the **Epistemic Requirement Contract** as a shared substrate.

It declares:

- facts that must be known;

- relationships that must be established;

- evidence classes;

- provenance conditions;

- freshness conditions; and

- other epistemic requirements needed by a consuming capability.

Z-PROF may reference and compose these contracts but SHALL NOT monopolize the underlying epistemic requirement concept.

This contract therefore adopts that existing substrate rather than creating a SIOS-specific constitutional primitive.

## 2.3 Composition Boundary

The existing Z-PROF contract establishes `CompositionManifest` as the canonical compiled/bound representation of a validated Domain Composition.

Its function is to answer:

**Which exact governed artifacts satisfy the requirements of this composition?**

It contains references and binding information rather than business logic.

Accordingly, a SIOS Translation result SHALL NOT become a parallel composition pathway.

# 3. Scope

This contract governs only:

1. the relationship between SIOS Translation and Z-PROF;

2. the representation through which a SIOS result participates in composition;

3. the relationship between that representation and the Domain Template Card;

4. provenance preservation;

5. version binding;

6. structural admission;

7. trust and security boundary;

8. failure handling; and

9. constitutional prohibitions at the seam.

This contract does **not** govern:

- the internal SIOS Translation methodology;

- domain-language parsing;

- semantic interpretation algorithms;

- SIOS internal execution;

- SIOS implementation architecture;

- SIOS-specific storage;

- Z-PROF semantic interpretation;

- policy decisions;

- security implementation;

- reasoning methodology;

- runtime execution;

- infrastructure retrieval.

Those responsibilities remain with their respective constitutional authorities.

# 4. Boundary Principle

The Council hereby establishes the following invariant:

**SIOS owns semantic translation. Z-PROF owns structural composition.**

SIOS determines how an external domain requirement is translated into constitutional terms.

Z-PROF determines which already-governed constitutional requirements and capabilities participate in a composition satisfying the declared domain requirement.

Z-PROF SHALL NOT:

- translate domain language;

- reinterpret a SIOS translation;

- judge the semantic correctness of a translation;

- repair an incomplete translation by inference;

- create an alternative translation;

- manufacture missing constitutional concepts;

- create a parallel Translation Layer.

The Z-PROF architecture already requires composition to remain declarative and prohibits it from acquiring authority over the semantics of the capabilities it references.

# 5. Consumer Representation

## 5.1 Ratified Decision

An authoritative SIOS Translation result SHALL participate in Z-PROF composition through the existing:

**`Epistemic Requirement Contract`**

It SHALL NOT require a new constitutional primitive such as:

- `TranslationBindingInput`;

- `TranslationReference` as a new constitutional primitive;

- `TranslatedRequirement` as a new constitutional primitive;

- `SIOSRequirement`;

- `TranslationPayload`; or

- another SIOS-specific parallel requirement class.

The Council deliberately chooses **substrate reuse over primitive proliferation**.

## 5.2 Meaning of the Representation

The resulting Epistemic Requirement represents **what must be known or established** in order to satisfy the translated domain requirement.

The fact that SIOS produced the requirement does not change the structural role of the Epistemic Requirement within Z-PROF.

Accordingly:
`Human-authored requirement           │           ├──────────────┐           ▼              │ Other authorized        │ producer                 │           │              │           └──────┐       │                  ▼       ▼              Epistemic Requirement                     Contract                        │                        ▼                     Z-PROF `
Z-PROF SHALL remain indifferent to the semantic producer of the requirement.

The authority and provenance of the producer remain separately governed.

# 6. Domain Template Card Relationship

## 6.1 DTC Responsibility

The Domain Template Card SHALL remain declarative.

It may declare:

- domain identity;

- domain vocabulary;

- semantic requirements;

- Epistemic Requirements;

- context requirements;

- projection requirements;

- reasoning requirements;

- policy requirements;

- security requirements;

- execution requirements; and

- composition references.

The DTC SHALL NOT hardcode:

"Invoke SIOS."

It SHALL NOT encode SIOS implementation mechanics.

## 6.2 Translation Satisfaction

The constitutional relationship is:
`Domain Template Card         │         │ declares         ▼ Domain Requirement         │         │ semantic translation         ▼       SIOS         │         │ produces         ▼ Epistemic Requirement Contract         │         │ referenced/bound by         ▼ CompositionManifest         │         ▼      Z-PROF `
The DTC therefore declares **what the domain requires**.

SIOS determines the constitutional representation necessary to express that domain requirement.

Z-PROF composes the resulting governed requirement.

This preserves the DTC's role as an authoring and registration instrument rather than an implementation orchestration mechanism. The existing DTC model explicitly distinguishes domain requirements from the algorithms that satisfy them.

# 7. Composition Placement

## 7.1 No Dedicated Translation Field

`CompositionManifest` SHALL NOT acquire a dedicated SIOS Translation binding field merely to accommodate this contract.

The existing CompositionManifest pathway already contains references to Epistemic Requirements alongside ARM, PRJ, RSN, POL, SEC, RI and other governed capabilities.

The SIOS-derived requirement therefore enters composition through the existing:
`CompositionManifest         │         ▼ boundEpistemicRequirements `
rather than:
`CompositionManifest         │         ├── boundEpistemicRequirements         ├── translationBinding         └── ... `
The latter would create an unnecessary second requirement pathway.

# 8. Provenance

## 8.1 Principle

A SIOS-produced Epistemic Requirement SHALL remain traceable to the governed source from which it originated.

Provenance SHALL be sufficient to establish, where applicable:

- originating domain;

- originating domain requirement;

- SIOS translation identity or reference;

- translation version or methodology identity;

- resulting Epistemic Requirement identity and version;

- governing DTC;

- governing CompositionManifest; and

- applicable downstream constitutional capabilities.

This extends the existing Z-PROF provenance requirement rather than creating a competing provenance system. `CONTRACT-R1` already requires resolved compositions to preserve the governing DTC, CompositionManifest, referenced constitutional artifacts, versions, evidence requirements and downstream capabilities.

# 8.2 Shared Substrate Purity

SIOS-specific provenance SHALL NOT redefine the semantic meaning of the shared Epistemic Requirement Contract.

The shared contract SHALL remain usable by:

- SIOS;

- human/domain authoring;

- PRJ;

- RSN;

- Z-PROF; and

- other subsequently authorized constitutional producers or consumers.

SIOS provenance is therefore **metadata about provenance**, not a new semantic dimension of the Epistemic Requirement itself.

# 9. Trust and Attestation Boundary

## 9.1 Authority

Z-PROF SHALL NOT create a SIOS-specific trust constitution.

Z-PROF SHALL NOT independently establish that a SIOS translation is semantically correct.

Security, identity, integrity and authorization remain within the existing security/governance authorities.

`CONTRACT-R1` explicitly establishes SEC as the authority for Security and requires Z-PROF to reference rather than replace that authority.

## 9.2 SEC Responsibility

Where a composition requires verification of the authority or integrity of a SIOS-produced artifact, the requirement SHALL be expressed through the existing governed SEC mechanism.

Z-PROF SHALL consume the resulting verification state.

Conceptually:
`SIOS Translation        │        ▼ Epistemic Requirement        │        ├──────────────► provenance        │        └──────────────► required security condition                               │                               ▼                              SEC                               │                               ▼                      verification state                               │                               ▼                            Z-PROF `
This contract does **not** establish a new SIOS-specific cryptographic primitive, signature format, attestation type, or cryptographic domain.

Any such mechanism requires authorization from the appropriate higher-order constitutional authority.

# 10. Version Binding

## 10.1 Explicit Binding

All relevant composition references SHALL remain explicitly version-bound.

The existing Z-PROF contract prohibits floating or wildcard references across constitutional capabilities, including Epistemic Requirement Contracts.

Accordingly, a SIOS-derived requirement SHALL NOT be consumed through:
`latest * ^1.2 unbounded `
or equivalent floating references.

## 10.2 Translation Lineage

Where the relevant SIOS contract exposes independently versioned components, the composition SHALL preserve their identities sufficiently to support deterministic replay, including:

1. the originating domain requirement version;

2. the SIOS translation methodology/version used to produce the result; and

3. the resulting Epistemic Requirement version.

These references SHALL remain distinguishable.

A change to the SIOS translation methodology SHALL NOT silently mutate an already-bound composition.

## 10.3 Replay

This requirement follows the existing Z-PROF replay invariant:
`Same composition + Same versions + Same context + Same evidence + Same authorized inputs         ↓ Same result `
The existing contract explicitly requires reproducibility from equivalent CompositionManifest versions, referenced constitutional versions, context, evidence and authorized inputs.

# 11. Structural Admission

Z-PROF SHALL treat the SIOS-derived Epistemic Requirement as a governed structural input.

Z-PROF SHALL verify only what belongs to its composition boundary.

At minimum, admission SHALL establish:

1. the referenced Epistemic Requirement exists;

2. the reference is authorized;

3. the required version is available;

4. dependencies are satisfiable;

5. ownership is unambiguous;

6. prohibited capabilities are absent;

7. no new constitutional primitive has been introduced;

8. required provenance is present;

9. applicable security requirements can be satisfied; and

10. the composition remains within its declared domain scope.

These requirements correspond to the existing ten mandatory Composition Validation checks in `CONTRACT-11`.

# 12. Semantic Validation Prohibition

Structural validation SHALL NOT become semantic validation.

Z-PROF SHALL NOT determine:

- whether SIOS chose the correct constitutional concept;

- whether the domain vocabulary was interpreted correctly;

- whether the translation is linguistically accurate;

- whether the SIOS methodology was intellectually correct;

- whether an alternative translation would be preferable.

Those questions remain outside Z-PROF authority.

Therefore:

**A structurally valid SIOS translation SHALL NOT become semantically validated merely because Z-PROF successfully composed it.**

Likewise:

**A structurally invalid SIOS result SHALL NOT be repaired by Z-PROF semantic inference.**

# 13. Failure Semantics

Translation-consumption failures SHALL use the existing closed Z-PROF failure taxonomy.

No Translation-specific error constitution SHALL be created.

Condition

Z-PROF classification

Required SIOS-derived requirement does not exist

`missing`

Required translation result is not currently available

`unavailable`

Referenced version cannot satisfy the composition

`incompatible`

Translation-derived requirements conflict structurally

`conflicting`

Required capability/domain is unsupported

`unsupported`

Artifact or capability lacks required authority

`unauthorized`

Required provenance/security verification cannot be established

`unverified`

Requirement or composition structure violates its contract

`invalid`

These eight categories are already the closed Z-PROF validation taxonomy.

## 13.1 Semantic Failure

Z-PROF SHALL NOT introduce a failure category such as:
`translation_incorrect translation_semantically_wrong translation_bad translation_low_quality `
If a translation is structurally valid and properly governed but semantically incorrect, that condition is **not a Z-PROF semantic judgment**.

The appropriate downstream authority must address it.

This preserves SIOS sovereignty and prevents Z-PROF from becoming a hidden semantic debugger.

# 14. Bound Constitutional Payload

The resulting `Bound Constitutional Payload` remains a downstream, non-authoritative input.

The SIOS-derived Epistemic Requirement SHALL NOT cause the Bound Constitutional Payload to become:

- a new Reality primitive;

- a Domain Judgment;

- an Evidence artifact;

- a Policy decision;

- a Reasoning result;

- a Projection;

- an Execution Receipt; or

- a new constitutional authority.

The existing Z-PROF architecture explicitly distinguishes the Bound Constitutional Payload from the underlying authoritative capabilities it references.

# 15. Ownership Matrix

Concern

Authority

Z-PROF Role

Domain language

Domain / SIOS boundary

Consume requirement

Semantic Translation

SIOS

Reference result

Epistemic Requirement

Shared constitutional substrate

Reference / compose

Domain Template Card

Z-PROF

Reference / govern composition

CompositionManifest

Z-PROF

Own

Composition Validation

Z-PROF

Perform structural validation

Provenance

Existing governing authorities

Preserve references

Security / Trust

SEC

Require / reference

Projection

PRJ

Reference

Reasoning / Intelligence

RSN

Reference

Policy / Authorization

POL

Require / reference

Execution

RI

Require / reference

Reality

ZRM / ARM

Never redefine

Evidence

Appropriate evidence authority

Require / reference

Infrastructure Retrieval

Application

Never own

Runtime

RI / Runtime architecture

Never redefine

This preserves the established Z-PROF ownership model, under which Epistemic Requirements are shared substrate and Z-PROF remains a composition authority rather than the owner of the underlying capabilities.

# 16. No-New-Primitive Rule

This contract SHALL NOT be interpreted as authorization to introduce a new constitutional primitive.

In particular, implementation SHALL NOT create a new primitive merely because SIOS is the producer.

The following are therefore **not authorized by this contract**:
`TranslationReference TranslationBindingInput TranslatedRequirement SIOSRequirement TranslationPayload DomainTranslation `
as new constitutional semantic primitives.

A repository implementation may require ordinary internal references, adapters or data-transfer structures, but such implementation structures SHALL NOT acquire constitutional meaning merely by existing in code.

Any genuinely new constitutional primitive requires separate Council authorization.

# 17. Disappearance Test

The SIOS → Z-PROF boundary SHALL pass the Disappearance Test.

If Z-PROF disappears:

- the SIOS Translation result SHALL remain independently meaningful;

- the Epistemic Requirement SHALL remain governed independently;

- the originating domain requirement SHALL remain valid;

- the applicable SEC/security record SHALL remain valid;

- the underlying constitutional capabilities SHALL remain authoritative.

Z-PROF SHALL therefore function as a composition mechanism, not as the owner of the translated knowledge.

This is consistent with the established Disappearance Test for Z-PROF contracts.

# 18. Runtime Isolation

SIOS Translation SHALL NOT become part of the Runtime merely because its output participates in a Z-PROF composition.

The sequence remains:
`Domain   ↓ SIOS Translation   ↓ Epistemic Requirement   ↓ Z-PROF Composition   ↓ Bound Constitutional Payload   ↓ Existing Constitutional Capabilities   ↓ RI / Runtime `
Z-PROF SHALL NOT:

- execute SIOS translation;

- embed SIOS methodology into Runtime;

- transform the Runtime into a semantic interpreter;

- introduce an alternative execution authority.

The existing M08.5 corpus explicitly preserves the Application/Runtime boundary and prohibits Z-PROF from assuming Runtime authority.

# 19. Domain Isolation

A SIOS-derived Epistemic Requirement SHALL remain scoped to the domain requirement that produced it.

It SHALL NOT cause:

- cross-domain semantic leakage;

- mutation of another domain's DTC;

- mutation of ARM Profiles;

- cross-domain requirement inheritance without authorization;

- implicit creation of shared domain semantics.

The existing Z-PROF contract requires domain isolation while allowing the same underlying Asset Reality to participate across multiple domains.

# 20. Factorization Principle

The SIOS → Z-PROF boundary SHALL preserve Zyppi's factorized architecture.

The existence of SIOS Translation for one domain SHALL NOT require:
`one SIOS bridge × one domain `
nor:
`one Z-PROF translation primitive × one domain `
Instead:
`N Domains    × Shared Epistemic Requirement Substrate    × Shared Z-PROF Composition    × Existing Constitutional Capabilities `
This preserves the broader Z-PROF scaling objective of reusing constitutional factors across many domains rather than multiplying Profiles and capabilities unnecessarily.

# 21. Golden Question Constraint

The SIOS → Z-PROF seam remains subordinate to Zyppi's Golden Question:
`WHO?        → Subject DID WHAT?   → Event TO WHOM?    → Object WHERE?      → Place WHEN?       → Valid Time HOW DO WE KNOW? → Evidence `
A SIOS Translation may establish requirements necessary to address one or more dimensions.

Z-PROF may compose the capabilities required to satisfy those requirements.

Neither SIOS Translation nor Z-PROF may manufacture a missing answer.

The existing contract explicitly establishes this Golden Question mapping and the associated Naked Reality constraint.

# 22. Naked Reality Constraint

Nothing crossing the SIOS → Z-PROF boundary SHALL strengthen Reality beyond the Reality and Evidence supporting it.

Therefore:
`UNKNOWN       ≠ FALSE UNAVAILABLE   ≠ FALSE CONFLICTING   ≠ RESOLVED UNVERIFIED    ≠ VERIFIED INTERPRETED   ≠ OCCURRED AUTHORIZED    ≠ OCCURRED EXECUTED      ≠ AUTHORIZED INFERRED      ≠ OBSERVED `
A translated requirement is a requirement.

It is not itself evidence that the required fact exists.

A successfully composed requirement is not evidence that the requirement has been satisfied.

This preserves the existing Naked Reality invariant.

# 23. Constitutional Invariants

The Council hereby ratifies the following invariants:

### SIOS Sovereignty

**SIOS SHALL own semantic translation.**

### Z-PROF Purity

**Z-PROF SHALL own structural composition and SHALL NOT acquire semantic translation authority.**

### Shared Substrate

**SIOS-derived requirements SHALL participate in composition through the existing Epistemic Requirement Contract rather than through a new Translation-specific constitutional primitive.**

### DTC Neutrality

**The Domain Template Card SHALL declare domain requirements without hardcoding SIOS implementation mechanics.**

### Composition Neutrality

**CompositionManifest SHALL remain ignorant of whether an Epistemic Requirement originated from SIOS, a human author, or another authorized producer.**

### Security Sovereignty

**SEC SHALL remain authoritative for applicable security, trust and attestation concerns.**

### Structural Validation

**Z-PROF SHALL validate structure, references, compatibility, ownership, provenance requirements and composition integrity; it SHALL NOT validate semantic translation correctness.**

### Failure Taxonomy

**Z-PROF SHALL use the existing eight-category failure taxonomy and SHALL NOT create a translation-specific error constitution.**

### Version Determinism

**Composition references SHALL remain explicitly version-bound.**

### Disappearance

**Removing Z-PROF SHALL NOT invalidate SIOS Translation, Epistemic Requirements or the underlying constitutional capabilities.**

### No New Authority

**This contract SHALL NOT create a new constitutional authority, ontology, Reality primitive, semantic interpreter, security system or execution authority.**

# 24. Implementation Boundary

This contract constitutes **contract closure only**.

It does **not** constitute implementation authorization.

No implementation agent is authorized by this document to:

- implement SIOS Translation;

- implement a SIOS Translation engine;

- invent a Translation-specific constitutional primitive;

- modify the Epistemic Requirement Contract semantics;

- modify SEC;

- create a new cryptographic domain;

- modify Z-PROF production code;

- modify Runtime semantics;

- modify Registry semantics;

- create production Domain Template Cards;

- create production CompositionManifests.

The governing sequence remains:
`Council defines meaning         ↓ Contract Closure         ↓ Architecture Closure         ↓ AMS Authorization         ↓ Implementation         ↓ Verification `
`CONTRACT-R1` explicitly establishes that contract closure does not itself constitute implementation authority and that implementation requires a subsequent AMS.

# 25. Implementation Constraint for Subsequent AMS

Any subsequent AMS authorizing implementation of this boundary SHALL require the implementation agent to:

1. consume the existing Epistemic Requirement Contract;

2. use the existing CompositionManifest pathway;

3. preserve the provenance requirements established here;

4. preserve explicit version binding;

5. use the existing structural validation boundary;

6. use the existing eight-category failure taxonomy;

7. delegate applicable security/trust verification to SEC;

8. avoid semantic interpretation of SIOS output;

9. avoid creating new constitutional primitives; and

10. stop and escalate if implementation requires a constitutional decision not closed by this contract.

The implementation agent SHALL NOT infer missing constitutional meaning from repository structure.

# 26. Council Closure

The Zyppi Constitutional Council hereby records:

### `CONTRACT-SIOS-ZPROF-001 — RATIFIED`

The Council accepts the consumer-side boundary defined by this document.

### `CONTRACT-SIOS-ZPROF-001 — CLOSED`

The specific contract gap concerning the participation of authoritative SIOS Translation results within Z-PROF composition is constitutionally closed.

The Council further records that:

- SIOS remains the semantic Translation authority;

- Epistemic Requirement Contract remains the shared substrate;

- Z-PROF remains the structural composition authority;

- CompositionManifest remains the canonical composition binding;

- DTC remains declarative and implementation-agnostic;

- SEC remains authoritative for applicable security and trust concerns;

- no new Translation-specific constitutional primitive is established by this contract.

Any genuinely new constitutional requirement discovered during implementation SHALL return to Council review rather than being inferred by the implementation agent.

# 27. Final Constitutional Statement

The SIOS → Z-PROF relationship is therefore:
`Domain Language       │       ▼ SIOS Translation       │       │ semantic authority       ▼ Epistemic Requirement Contract       │       │ shared constitutional substrate       ▼ Z-PROF       │       │ structural composition       ▼ CompositionManifest       │       ▼ Bound Constitutional Payload       │       ├────────► PRJ       ├────────► RSN       ├────────► POL       ├────────► SEC       └────────► RI `
The governing distinction is:

**SIOS determines what the domain requirement means in constitutional terms.**

**The Epistemic Requirement Contract carries what must be known or established.**

**Z-PROF determines which governed constitutional capabilities are composed to satisfy that requirement.**

**Z-PROF does not determine whether the SIOS translation is semantically correct.**

And the governing architectural invariant remains:

**Z-PROF is connective tissue, never a new organ.**

The ultimate epistemic constraint remains:

**Zyppi SHALL never make Reality stronger than the Reality and Evidence that establish it.**

**Status:** `RATIFIED — CLOSED` **Implementation Authority:** `NONE` **Next Governance Artifact:** `AMS-0857` or the applicable current CAW-011 implementation authorization under the operative task register.

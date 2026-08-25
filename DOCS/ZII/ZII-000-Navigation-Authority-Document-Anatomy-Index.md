# ZII-000 — Navigation, Authority & Document Anatomy Index

| Field                        | Value                                                    |
| :--------------------------- | :------------------------------------------------------- |
| **Version**                  | 1.0                                                      |
| **Status**                   | RATIFIED                                                 |
| **Lifecycle**                | ACTIVE                                                   |
| **Program**                  | ZII — Zyppi Interaction Infrastructure                   |
| **Authority Class**          | Navigation / Corpus Governance                           |
| **Higher Authority**         | Zyppi Constitution · CEngS · ZII-001                     |
| **Depends On**               | ZII-001 v1.0 — Integrated Architecture & Program Charter |
| **Supersedes**               | ZII-000 v0.1 Draft                                       |
| **Repository**               | `aly-samy/zyppi.me`                                      |
| **Implementation Authority** | NONE                                                     |
| **Effective Date**           | 23 August 2026                                           |

---

## 1. Purpose

ZII-000 is the navigation, authority, and document-anatomy index for the permanent ZII — Zyppi Interaction Infrastructure corpus.

Its purpose is to answer:

> _What ZII documents exist, what does each document own, how do the documents relate, how should they be structured, and where should a new rule live?_

ZII-000 exists to prevent the ZII corpus from becoming:

- a collection of overlapping authorities;
- a repetition of discovery notes;
- a shadow constitution;
- an implementation plan disguised as architecture;
- an architecture specification mixed with release procedure;
- a repository constitution duplicated inside a program;
- a QR-specific corpus masquerading as generic ZII architecture.

Its governing discipline is:

> **One rule, one home.**

ZII-000 does not redefine the substantive ZII architecture ratified by ZII-001.
It governs how that architecture is decomposed into durable, navigable, non-conflicting authority.

---

## 2. Authority and Scope

ZII-000 governs only the organization of the ZII documentation corpus.

**It owns:**

- document navigation;
- document identifiers;
- authority classes;
- responsibility boundaries;
- document dependency declarations;
- status visibility;
- lifecycle visibility;
- supersession navigation;
- subordinate engine namespace admission;
- minimum document anatomy;
- corpus conflict handling;
- placement of ZII-generic versus engine-specific rules.

**ZII-000 does not own:**

- constitutional Reality;
- Identity;
- Evidence;
- Trust;
- Policy;
- Runtime execution;
- generic Zyppi engineering law already owned by CEngS;
- CAW architecture;
- platform-wide repository governance;
- zTOUCH architecture;
- ZPI architecture;
- ZRB architecture;
- ZQE technical behavior;
- implementation mandates.

If ZII-000 conflicts with a higher authority, the higher authority governs.

---

## 3. Corpus Philosophy

The ZII corpus follows five permanent documentation principles.

### 3.1 One Rule, One Home

A normative rule **SHALL** have one primary authority home.
Other documents **MAY**:

- reference it;
- depend on it;
- summarize it for navigation;
- explain its consequence within their own scope.

They **SHALL NOT** independently redefine the same rule.
A rule appearing independently in multiple authority homes is a governance defect.

### 3.2 Authority Follows Responsibility

A rule belongs in the document whose responsibility would remain valid even if the current implementation disappeared.

For example:

- _No First-Engine Privilege_ → **ZII-001** (because it is a permanent ZII program invariant).
- _ZQE evaluates every applicable QR mask_ → **ZQE technical specification/profile** (because it is QR-specific).

The question is not: _Where is this rule convenient to write?_
The question is: _Who permanently owns the responsibility?_

### 3.3 Generic Before Specific

The architectural direction is:

```text
Zyppi Constitution / CEngS
      ↓
ZII Program Authority
      ↓
ZII Family Architecture
      ↓
Engine-Specific Architecture
      ↓
Roadmap / Task Authority
      ↓
Implementation
```

A lower-level implementation **SHALL NOT** silently promote its behavior upward into generic ZII law.

### 3.4 Planning Is Not Architecture

A roadmap may establish:

> _Build A before B_

without establishing:

> _A is architecturally superior to B_

Build order, dependency order, and architectural ownership are separate concepts.
Roadmap documents **SHALL NOT** acquire architectural sovereignty merely by sequencing implementation.

### 3.5 Historical Evidence Is Not Active Authority

Discovery reports, PREP documents, audits, Council discussions, implementation reports, evidence receipts, and superseded documents may remain valuable historical evidence.
They do not remain active authority merely because they are preserved.

The permanent distinction is:

```text
historical evidence  ≠  current governing authority
```

---

## 4. ZII Authority Hierarchy

The permanent ZII authority hierarchy is:

```text
Zyppi Constitution
      │
      ▼
CEngS
      │
      ▼
ZII-001
Integrated Architecture
& Program Charter
      │
      ├───────────────┐
      ▼               ▼
ZII-002         ZII-003
Interaction Engine   Technical Profiles,
Family Model         Standards &
                     Conformance
      │               │
      └───────┬───────┘
              ▼
         ZII-004
Repository &
Dependency Map
      │
      ▼
ZII-005
Milestone Roadmap
& Build Order
      │
      ▼
ZII-006
Validation,
Compatibility &
Release Contract
      │
      ▼
Subordinate Engine Series
e.g. ZQE
```

This diagram expresses responsibility decomposition.
It does not imply that every document mechanically depends on every document visually above it.
Each document **SHALL** declare its actual dependencies explicitly.

---

## 5. Permanent ZII Series

The initial permanent ZII corpus is intentionally bounded to:

```text
ZII-000 → ZII-006
```

No `ZII-007+` document **SHALL** be created merely because a new topic appears.

A new permanent ZII document is justified only when **all** of the following are true:

1. a durable ZII-wide responsibility exists;
2. no existing ZII document owns it;
3. placing it inside an existing document would create an authority collision or materially unclear responsibility;
4. the responsibility is generic to ZII rather than one engine;
5. the responsibility is expected to survive package and implementation changes.

### 5.1 Current ZII Series

| ID          | Title                                          | Authority Responsibility                                                                   | Status                                        |
| :---------- | :--------------------------------------------- | :----------------------------------------------------------------------------------------- | :-------------------------------------------- |
| **ZII-000** | Navigation, Authority & Document Anatomy Index | Corpus navigation, authority boundaries, status/lifecycle, document anatomy                | **RATIFIED · ACTIVE v1.0**                    |
| **ZII-001** | Integrated Architecture & Program Charter      | ZII identity, scope, sovereignty boundary, core invariants                                 | **RATIFIED · ACTIVE v1.0**                    |
| **ZII-002** | Interaction Engine Family Model                | Generic engine-family anatomy, operations, artifacts, adapters, lifecycles                 | PLANNED                                       |
| **ZII-003** | Technical Profiles, Standards & Conformance    | Standards authority, Technical Engine Profiles, determinism, conformance, interoperability | PLANNED                                       |
| **ZII-004** | Repository & Dependency Map                    | ZII-specific package topology and dependency authority                                     | **PLANNED** — _HARD PREREQUISITE: RGT CLOSED_ |
| **ZII-005** | Milestone Roadmap & Build Order                | Program sequencing, milestones, task decomposition, prerequisites                          | PLANNED                                       |
| **ZII-006** | Validation, Compatibility & Release Contract   | ZII-specific readiness, compatibility and release evidence                                 | PLANNED                                       |

_A PLANNED document has no normative authority merely because it is listed here._

### 5.2 RGT Dependency

ZII-004 **SHALL** remain blocked until the separately governed Repository Governance Transition — RGT closes.

The intended authority direction is:

```text
Zyppi Constitution / CEngS
      │
      ▼
Platform Repository Governance
      │
      ▼
RGT
      │
      ▼
Lawful multi-program
workspace-governance mechanism
      │
      ▼
ZII-004
```

RGT is not owned by ZII.
It is a platform-level repository-governance transition operating under Chair authority and applicable CEngS engineering law.

ZII-000 **SHALL NOT** describe proposed CEngS/RGT amendments as ratified until their own authority process closes.
No dependency loop is permitted in which ZII-004 defines the platform mechanism on which ZII-004 itself depends.

---

## 6. Responsibility of Each Permanent ZII Document

### 6.1 ZII-001 — What Is ZII?

ZII-001 owns permanent program-level questions.
It answers:

- What is ZII?
- Why does it exist?
- What does it own?
- What must it never own?
- What is its constitutional boundary?
- What are its permanent architectural invariants?
- How does it relate to CAW and adjacent initiatives?
- Why does ZQE receive no first-engine privilege?

ZII-001 is the highest ZII-specific architectural authority.
It **SHALL NOT** become a detailed engine specification, repository map, milestone plan, or release checklist.

### 6.2 ZII-002 — What Is a ZII Engine Family?

ZII-002 owns the generic engineering anatomy of an Interaction Engine Family.
Its expected responsibility includes:

- Interaction Engine Family
- Technical Operations
- Native Technical Artifact Type(s)
- Input / Acquisition Adapters
- Output / Realization Adapters
- Operation Plurality
- Lifecycle Plurality
- Logic / Environment Separation
- Acquisition
- Realization
- Technical Support Declarations

It answers:

> _What must be true for a technical implementation family to belong coherently under ZII?_

ZII-002 **SHALL** govern technical acquisition and realization architecture.
It **SHALL NOT** decide whether a captured technical observation is constitutionally an Event, Reality, Evidence, Trust, or any other semantic conclusion.

ZII-002 **SHALL** inherit ZII-001's rule:

```text
technical interaction  ≠  constitutional Event
```

and **SHALL NOT** reintroduce a universal historical Touch/Event gate into ZII infrastructure.

### 6.3 ZII-003 — How Does an Engine Make and Prove Technical Claims?

ZII-003 owns cross-cutting technical governance including:

- External Standards Authority
- Technical Engine Profiles
- Standards Version
- Package Version
- Profile Version
- Scoped Determinism
- Technical Support Manifest
- Conformance
- Interoperability
- Diagnostics
- Compatibility Evidence

It answers:

> _How does a ZII engine state what it implements, freeze reproducible behavior, and prove its technical claims?_

ZII-003 **SHALL** preserve distinctions such as:

```text
package version  ≠  Technical Engine Profile  ≠  external standard version  ≠  domain/application profile
```

### 6.4 ZII-004 — Where May ZII Software Live and Depend?

ZII-004 owns ZII-specific repository topology only.

After RGT establishes lawful platform-wide governance, ZII-004 may define:

- ZII-owned packages;
- package roles;
- permitted ZII-internal workspace edges;
- prohibited ZII dependency directions;
- explicitly authorized consumer relationships where needed;
- ZII-specific package ownership.

ZII-004 **SHALL NOT** define the global Zyppi repository constitution.

The intended relationship is:

```text
Platform-wide governance
      │
      ▼
composed global graph
      ▲           ▲
      │           │
CAW authority  ZII-004
```

Program-specific authorities feed the platform mechanism.
They do not compete to own the global graph.

### 6.5 ZII-005 — In What Order Is ZII Built?

ZII-005 owns:

- ZII milestones;
- milestone dependencies;
- implementation sequence;
- task decomposition;
- Implementation Task identifiers;
- engine admission sequencing;
- program roadmap status;
- build-order prerequisites.

It may reference RGT, ZII architectural authorities, and subordinate engine roadmaps.
It **SHALL NOT** redefine architectural semantics merely to simplify planning.

### 6.6 ZII-006 — How Do We Know a ZII Implementation Is Ready?

ZII-006 owns ZII-specific validation, compatibility, and release requirements such as:

- conformance evidence;
- interoperability evidence;
- deterministic regression;
- Technical Engine Profile preservation;
- compatibility guarantees;
- benchmark evidence;
- cross-runtime reproducibility where claimed;
- profile deprecation discipline;
- release evidence packages.

CEngS remains the higher authority for general Zyppi CI, review, testing, release, documentation, and engineering procedure.
ZII-006 **SHALL** add only the requirements specific to interaction-engine technical claims.

---

## 7. Subordinate Engine Series

Individual engine families **SHALL NOT** consume permanent `ZII-nnn` identifiers for engine-specific architecture.
Each admitted engine receives its own subordinate namespace.

Example:

```text
DOCS/
└── ZII/
    ├── ZII-000...
    ├── ZII-001...
    ├── ...
    │
    └── ZQE/
        ├── ZQE-000...
        ├── ZQE-001...
        ├── ZQE-002...
        └── ...
```

The rule is:

> **Program-level authority uses `ZII-*`; engine-specific authority uses the engine's own namespace.**

This prevents the first engine from consuming or defining the generic program namespace.

### 7.1 Subordinate Engine Namespace Admission

Every formally admitted ZII engine family **SHALL** receive a unique, stable document namespace.

The namespace **SHALL**:

- be explicitly approved when the engine family is formally admitted;
- be concise;
- be unambiguous;
- not collide with another active Zyppi namespace;
- remain stable across internal revisions of the engine;
- be recorded in ZII-000.

`ZQE-*` is the namespace of the first QR engine family.
It is not a mandatory naming template for future engine families.

ZII-000 v1.0 does not reserve speculative identifiers such as `ZNFC`, `ZBLE`, `ZDM`, or any equivalent future namespace.
Future engine namespaces **SHALL** emerge from their actual architecture and formal admission.

---

## 8. Initial ZQE Series

The current candidate ZQE corpus is:

| ID           | Candidate Responsibility                  |
| :----------- | :---------------------------------------- |
| **ZQE-000**  | Navigation & Authority Index              |
| **ZQE-001**  | Scope & Standards Profile                 |
| **ZQE-002**  | QR Compiler Architecture                  |
| **ZQE-003**  | QrSymbol Contract                         |
| **ZQE-004**  | zqe/1 Technical Engine Profile            |
| **ZQE-005**  | Canonical SVG Renderer                    |
| **ZQE-006**  | Conformance & Benchmark Contract          |
| **ZQE-PLAN** | Implementation roadmap and task hierarchy |

These identifiers remain provisional until the ZQE corpus is formally drafted.
Their appearance in ZII-000:

- does not ratify their contents;
- does not guarantee that every candidate survives;
- does not authorize implementation.

If two candidate documents prove to own the same responsibility, they **SHOULD** be merged rather than preserved for numbering symmetry.

---

## 9. Document Authority Classes

Every permanent ZII or subordinate-engine authority **SHALL** identify an Authority Class.
The initial authority classes are as follows.

### 9.1 Navigation / Corpus Governance

**Examples:** `ZII-000`, `ZQE-000`
**Owns:** corpus map, navigation, authority boundaries, status, lifecycle, dependencies, supersession.
It normally does not own detailed technical semantics.

### 9.2 Charter / Integrated Architecture

**Example:** `ZII-001`
**Owns:** program identity, scope, sovereignty boundary, permanent architectural position, highest program invariants.

### 9.3 Architecture Contract

**Examples:** `ZII-002`, `ZQE-002`, `ZQE-003`
**Owns:** structural technical contracts and architecture.

### 9.4 Standards / Profile Contract

**Examples:** `ZII-003`, `ZQE-001`, `ZQE-004`
**Owns:** normative technical basis, standards scope, profile behavior, reproducibility choices, technical conformance claims.

### 9.5 Repository Topology

**Example:** `ZII-004`
**Owns:** program-specific package topology and dependency authority.

### 9.6 Roadmap / Build Order

**Examples:** `ZII-005`, `ZQE-PLAN`
**Owns:** sequencing, milestones, tasks, prerequisites, implementation order.
It **SHALL NOT** redefine architecture.

### 9.7 Validation / Compatibility / Release Contract

**Examples:** `ZII-006`, `ZQE-006`
**Owns:** the evidence required to claim completion, compatibility, conformance, interoperability, or release readiness.

---

## 10. Document Status and Lifecycle

ZII distinguishes authority status from lifecycle state.
They are related but not identical.

### 10.1 Authority Status

| Status          | Meaning                                                                                                                                                                               |
| :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **EXPLORATORY** | An investigation, hypothesis, or proposal with no normative authority.                                                                                                                |
| **CANDIDATE**   | A sufficiently formed proposal under consideration for authority.                                                                                                                     |
| **DRAFT**       | A normative document under active construction or revision.                                                                                                                           |
| **RATIFIED**    | The normative content has been formally accepted by authorized human governance.                                                                                                      |
| **SUPERSEDED**  | A newer authority replaces the document within its stated scope. The superseded artifact may remain historical evidence but carries no current authority within the superseded scope. |
| **RETIRED**     | The responsibility itself is intentionally withdrawn or discontinued. Retirement is different from supersession.                                                                      |

### 10.2 Lifecycle State

A ratified document may separately declare a lifecycle state.

| State        | Meaning                                                                                      |
| :----------- | :------------------------------------------------------------------------------------------- |
| **ACTIVE**   | The document currently governs its declared scope.                                           |
| **INACTIVE** | The document remains preserved but does not currently govern implementation or architecture. |
| **FROZEN**   | The normative baseline has been explicitly locked by competent authority.                    |

A document is not automatically frozen merely because it is ratified.
Therefore:

```text
RATIFIED  ≠  automatically FROZEN
```

and:

```text
RATIFIED + ACTIVE
```

is the normal state for a living architectural authority.

### 10.3 Status Does Not Equal Implementation Authority

Normative authority and implementation permission are separate.

For example:

```text
Status:               RATIFIED
Lifecycle:            ACTIVE
Implementation Authority: NONE
```

is valid.

ZII-001 demonstrates this distinction: its architecture is ratified and active, while ZQE implementation remains separately gated.

---

## 11. Amendment Discipline

No ratified normative document may be silently rewritten.

A material change to a RATIFIED document requires:

1. an explicit proposed revision or amendment;
2. identification of affected rules and invariants;
3. compatibility, migration, or supersession analysis where applicable;
4. authorized human ratification;
5. an explicit new version;
6. update of ZII-000 navigation and dependency metadata.

A major-version bump is the result of an authorized normative amendment.
It is not permission to bypass amendment discipline.

For a FROZEN document, the amendment process must additionally satisfy whatever higher authority established the freeze.

---

## 12. Version Model

Document identity and document version are separate.

Example:

```text
ZII-001
Version 1.0
```

A revision remains:

```text
ZII-001
Version 1.1
```

or:

```text
ZII-001
Version 2.0
```

It does not become `ZII-007` merely because the original document changed.

### 12.1 Major Version

A major version is appropriate for a ratified normative amendment involving material change such as:

- changed authority boundary;
- changed invariant;
- incompatible architecture;
- changed permanent responsibility;
- substantial supersession of previous behavior.

_Example:_ `1.0 → 2.0`

### 12.2 Minor Version

A minor version is appropriate for a compatible clarification or expansion that does not reverse the existing architecture or authority boundary.

_Example:_ `1.0 → 1.1`

### 12.3 Draft Versions

Before ratification, drafts may use `0.1`, `0.2`, `0.3`, or a clearly identified candidate revision scheme.
Draft numbering does not create authority.

---

## 13. Minimum Document Header

Every permanent ZII or subordinate-engine authority **SHOULD** begin with sufficient metadata to answer:

> _What is this, who owns it, what authority does it have, what governs it, and what does it depend on?_

The standard ZII header is:

```text
<ID> — <Title>
Version:            `<version>`
Status:             `<status>`
Lifecycle:          `<ACTIVE / INACTIVE / FROZEN where applicable>`
Program:            `<program>`
Authority Class:    `<class>`
Higher Authority:   `<authority>`
Depends On:         `<documents or NONE>`
Supersedes:         `<documents or NONE>`
Repository:         `<scope if applicable>`
Implementation Authority: `<NONE / bounded authority>`
Effective Date:     `<date if applicable>`
```

Optional metadata **MAY** include:

- Parent Document;
- Source Basis;
- Parent Program;
- Normative Standards;
- Related Authorities;
- First Reference Implementation.

Parent Document is not mandatory where Higher Authority and Depends On describe the authority graph more accurately.

A ZII document **MAY** identify an external normative-language standard where such a standard has actually been adopted by the applicable governing authority.
ZII-000 does not invent a repository-wide RFC 2119 requirement.

---

## 14. Minimum Document Anatomy

Not every ZII document must use identical section names.
However, each normative document **SHALL** make the following concepts identifiable where applicable.

### 14.1 Purpose

Why does this document exist?

### 14.2 Authority and Scope

What responsibility does it own?
What responsibility does it explicitly not own?

### 14.3 Dependencies and Higher Authority

What governing context must be respected?

### 14.4 Definitions and Vocabulary

Only terminology genuinely required by the document.
Existing governed vocabulary **SHOULD** be referenced rather than unnecessarily redefined.

### 14.5 Normative Architecture / Rules

The substantive responsibility owned by the document.

### 14.6 Invariants

Durable fail-closed rules expected to survive implementation changes.

### 14.7 Relationships

How the authority interacts with adjacent authorities without absorbing them.

### 14.8 Non-Scope

What does not belong in the document.

### 14.9 Deferred / Open Questions

Legitimate unresolved questions.
An open question does not create implementation permission.

### 14.10 Validation / Acceptance

Where the document creates technical or completion claims that must later be demonstrated.

### 14.11 Supersession / Change Control

Where evolution could otherwise introduce ambiguity.

### 14.12 Final Authority Statement

A concise statement of exactly what becomes governed when the document is ratified.

---

## 15. Normative Language

Permanent ZII documents distinguish normative statements from explanatory material.

Preferred normative terms include:

- `SHALL`
- `SHALL NOT`
- `MUST`
- `MUST NOT`
- `MAY`
- `REQUIRED`
- `PROHIBITED`

ZII uses these uppercase normative terms according to the definitions established by the governing ZII corpus unless a higher authority explicitly adopts an external normative-language standard.
This document does not assert repository-wide adoption of RFC 2119 or any successor standard.

Explanatory prose, examples, diagrams, and tables **SHALL NOT** silently create a stronger rule than the normative text.

---

## 16. Invariant Discipline

A rule belongs in a permanent ZII invariant set only when it is expected to remain true across:

- implementations;
- package versions;
- consumers;
- supported execution environments;
- future engines.

**Examples appropriate for ZII-001 include:**

- No First-Engine Privilege
- Support ≠ Capability
- Parsing ≠ Semantic Translation
- Technical Success ≠ Physical Proof

**Examples inappropriate for ZII-001 include:**

- QR has eight mask patterns
- SVG attributes use a specific order
- NDEF record type X contains field Y

Those belong to technology-specific authorities.

---

## 17. Cross-Document Reference Discipline

When another document already owns a rule, subordinate documents **SHOULD** reference that authority.

**Preferred:**

> _Per ZII-001, ZQE receives no first-engine privilege._

**Not preferred:**

> _ZQE receives no first-engine privilege because..._
> followed by a separately maintained replacement definition.

The governing distinction is:

```text
reference  ≠  duplicate authority
```

A document **MAY** explain the consequence of another rule inside its own scope.
It **SHALL NOT** silently create a competing formulation.

---

## 18. Conflict Resolution

If two ZII documents appear to govern the same normative rule:

1. determine whether one statement is merely explanatory;
2. identify the intended primary authority home;
3. do not resolve the contradiction silently in implementation;
4. amend, supersede, or correct the conflicting authority;
5. update ZII-000 navigation;
6. verify downstream references after resolution.

> **No source code, validator, test suite, package manifest, or implementation behavior may become the architectural tie-breaker between conflicting governing documents.**

Implementation conforms to authority.
Authority is not inferred from implementation.

---

## 19. Open Question Placement

An unresolved question **SHOULD** live with the authority that will eventually own its answer.

**Examples:**

- _What makes a standards-compliant QR a zQR?_ → future zTOUCH / zQR authority, not ZII-002.
- _How does zqe/1 resolve a technically valid output tie?_ → ZQE Technical Engine Profile, not ZII-001.
- _Which workspace package may depend on qr-core?_ → ZII-004 / platform repository governance, not the QR compiler architecture.

An open question **SHALL NOT** migrate into whichever document happens to be edited next.

---

## 20. Implementation Artifact Hierarchy

The intended authority-to-implementation flow is:

```text
Zyppi Constitution / CEngS
      ↓
ZII Permanent Architecture
      ↓
Engine-Specific Architecture
      ↓
Roadmap
      ↓
Implementation Task
      ↓
AMS Mandate
      ↓
Code
      ↓
Tests / Evidence
      ↓
Acceptance / Closure
```

Implementation **SHALL NOT** reverse this hierarchy by silently redefining the authority above it.

---

## 21. CEngS Context-Loading Integration

ZII-000 does not replace the CEngS context-loading system.
CEngS owns global AI engineering navigation and context-loading discipline.

Before the first ZII or subordinate-engine implementation mandate is authorized, the applicable CEngS navigation authority **SHALL** contain an explicit loading route for ZII work.

The target principle is:

```text
ZII implementation task
      ↓
CEngS Core
+
ZII-001
+
only the relevant ZII family authority
+
only the relevant engine authority
+
task-specific operational standards
```

A ZII implementation task **SHALL NOT** require an AI agent to load the complete Zyppi, ZII, CAW, ZQE, or PREP corpus by default.

For example, a future `qr-core` implementation task may require conceptually:

- CEngS Core
- ZII-001
- relevant ZII-002 rules
- relevant ZII-003 rules
- relevant ZQE specification/profile
- the exact implementation mandate

Testing, performance, release, or documentation standards **SHALL** be loaded according to the canonical CEngS navigation rules rather than duplicated here.

The canonical task-to-document mapping **SHALL** live in:

> `CEngS-000` or its authorized successor

because CEngS already owns global AI context-loading navigation.
ZII-000 may define the need for ZII registration.
It **SHALL NOT** create a competing global loading table.

Therefore, before implementation:

- **Repository admission prerequisite** → RGT CLOSED
- **AI context-loading prerequisite** → ZII registered in the applicable CEngS navigation authority

These are separate gates.

---

## 22. PREP and Historical Material

`ZII-PREP-A` → `ZII-PREP-F` remains preserved as historical architectural discovery and reconciliation evidence.

PREP explains:

- why ZII was needed;
- which previous concepts were evaluated;
- which overlaps were discovered;
- why several abstractions were rejected;
- how ZII's scope was tested;
- why QR was denied first-engine privilege;
- how ZQE's initial entry boundary was established.

After ratification of ZII-001:

```text
ZII-PREP   = historical reasoning and discovery evidence
ZII-001+   = permanent active authority
```

PREP **SHALL NOT** be treated as a competing current architecture.
Where PREP differs from a ratified ZII authority, the ratified authority governs.

---

## 23. Documentation Repository Layout

The intended ZII documentation layout is:

```text
DOCS/
└── ZII/
    ├── ZII-000-Navigation-Authority-Document-Anatomy-Index.md
    ├── ZII-001-Integrated-Architecture-Program-Charter.md
    ├── ZII-002-Interaction-Engine-Family-Model.md
    ├── ZII-003-Technical-Profiles-Standards-Conformance.md
    ├── ZII-004-Repository-Dependency-Map.md
    ├── ZII-005-Milestone-Roadmap-Build-Order.md
    ├── ZII-006-Validation-Compatibility-Release.md
    │
    └── ZQE/
        ├── ZQE-000-...
        ├── ZQE-001-...
        └── ...
```

Exact filenames **MAY** be normalized during repository integration.
The document identifier and authority responsibility are more important than filename wording.

---

## 24. Current Program Board

```text
ZII DISCOVERY
│
└── PREP-A → PREP-F
    CLOSED
         │
         ▼
ZII PERMANENT AUTHORITY
│
├── ZII-000
│   Navigation / Authority / Anatomy
│   RATIFIED · ACTIVE v1.0
│
├── ZII-001
│   Integrated Architecture & Program Charter
│   RATIFIED · ACTIVE v1.0
│
├── ZII-002
│   Interaction Engine Family Model
│   NEXT
│
├── ZII-003
│   Technical Profiles / Standards / Conformance
│   PLANNED
│
├── ZII-004
│   Repository & Dependency Map
│   PLANNED
│   HARD PREREQUISITE: RGT CLOSED
│
├── ZII-005
│   Milestone Roadmap & Build Order
│   PLANNED
│
└── ZII-006
    Validation / Compatibility / Release
    PLANNED

PLATFORM PREREQUISITE
│
└── RGT
    ACTIVE

AI GOVERNANCE PREREQUISITE
│
└── CEngS navigation registration for ZII
    REQUIRED BEFORE IMPLEMENTATION

FIRST REFERENCE ENGINE
│
└── ZQE
    ARCHITECTURALLY IDENTIFIED
    FORMAL SPECIFICATION PENDING
    CODE NOT AUTHORIZED
```

---

## 25. Corpus Completion Criterion

The initial permanent ZII foundation is documentation-complete when:

- [ ] ZII-000 is ratified;
- [ ] ZII-001 is ratified;
- [ ] ZII-002 establishes the Interaction Engine Family Model;
- [ ] ZII-003 establishes profile, standards, and conformance law;
- [ ] RGT establishes lawful multi-program repository governance;
- [ ] ZII-004 establishes ZII-specific repository topology under that mechanism;
- [ ] ZII-005 establishes the program roadmap and build order;
- [ ] ZII-006 establishes ZII-specific validation and release evidence;
- [ ] no material normative ZII rule exists only in PREP;
- [ ] no permanent rule has competing active authority homes;
- [ ] subordinate-engine rules remain in subordinate-engine namespaces;
- [ ] the applicable CEngS navigation authority can route AI agents to the minimum correct ZII context.

Documentation completion does not itself authorize implementation.

---

## 26. New-Document Test

Before creating any future `ZII-007+`, the proposer **SHALL** answer the following.

### Question 1 — Is the rule already owned?

Is the responsibility already governed by:

- ZII-001 through ZII-006;
- CEngS;
- ZRM;
- SEC;
- POL;
- RI;
- SIOS;
- Z-PROF;
- CAW;
- another active program?

**If yes:** Do not create another ZII authority.

### Question 2 — Is the subject engine-specific?

**If yes:** Use the engine's subordinate namespace.

### Question 3 — Is the artifact temporary or procedural?

Is it merely:

- a milestone;
- implementation task;
- mandate;
- audit;
- evidence report;
- readiness review;
- temporary investigation?

**If yes:** Use the appropriate roadmap/task/mandate/audit artifact rather than permanent ZII architecture.

### Question 4 — Would the responsibility survive current implementations?

Would this responsibility still matter if every currently implemented ZII engine disappeared?

**If no:** It probably does not belong in the permanent generic ZII corpus.

### Question 5 — Does it need its own authority home?

Would combining the responsibility with an existing document create:

- conflicting ownership;
- unclear change control;
- incompatible lifecycle;
- inappropriate dependency;
- or significant semantic ambiguity?

**If no:** Extend the existing authority rather than creating a new identifier.

Only after passing these tests may a new permanent ZII identifier be considered.

---

## 27. Final Authority Statement

ZII-000 establishes the navigation, authority boundaries, lifecycle discipline, namespace discipline, and structural anatomy of the ZII documentation corpus.

Its essential responsibility map is:

| Document    | Answers                                           |
| :---------- | :------------------------------------------------ |
| **ZII-001** | WHAT ZII IS                                       |
| **ZII-002** | WHAT A ZII ENGINE FAMILY IS                       |
| **ZII-003** | HOW AN ENGINE DEFINES AND PROVES TECHNICAL CLAIMS |
| **ZII-004** | WHERE ZII SOFTWARE MAY LIVE AND DEPEND            |
| **ZII-005** | IN WHAT ORDER ZII IS BUILT                        |
| **ZII-006** | HOW ZII IMPLEMENTATIONS PROVE READINESS           |

Below those:

| Document                       | Answers                                                    |
| :----------------------------- | :--------------------------------------------------------- |
| **ZQE / future engine series** | WHAT EACH PARTICULAR ENGINE IS AND HOW THAT ENGINE BEHAVES |

The corpus **SHALL** remain intentionally small.
A new document is not progress by itself.
A new document is justified only when a genuinely new authority home is required.

---

## 28. Ratification Record

| Field                        | Value                                                    |
| :--------------------------- | :------------------------------------------------------- |
| **Decision**                 | RATIFY                                                   |
| **Document**                 | ZII-000 — Navigation, Authority & Document Anatomy Index |
| **Version**                  | 1.0                                                      |
| **Status**                   | RATIFIED                                                 |
| **Lifecycle**                | ACTIVE                                                   |
| **Authority Class**          | Navigation / Corpus Governance                           |
| **Implementation Authority** | NONE                                                     |
| **Effective Date**           | 23 August 2026                                           |

**Effective upon ratification:**

- ZII-000 v0.1 is superseded;
- this document becomes the active navigation and document-anatomy authority for ZII;
- ZII-001 remains the highest substantive ZII program architecture;
- ZII-PREP remains historical discovery evidence;
- subordinate engines **SHALL** receive independent namespaces;
- RGT remains the hard repository prerequisite for ZII-004;
- CEngS context-loading registration remains required before implementation mandates begin;
- no ZII or ZQE code is authorized by this document.

> **ZII-000 v1.0 is CLOSED — RATIFIED · ACTIVE.**

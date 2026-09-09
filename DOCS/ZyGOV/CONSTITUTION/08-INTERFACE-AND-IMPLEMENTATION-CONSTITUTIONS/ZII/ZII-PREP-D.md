# ZII-PREP-D — CEngS Layer Eligibility & Monorepo Governance Audit

| Field | Value |
| :--- | :--- |
| **Status** | COMPLETE FOR PREP PURPOSES — PASS WITH MANDATORY PRE-ZQE GOVERNANCE MIGRATION |
| **Implementation authority** | NONE |
| **Repository decision** | Use the existing `aly-samy/zyppi.me` monorepo |
| **Critical gate** | No ZII package should be created until the repository-governance transition defined below is authorized and implemented. |

---

## Executive Finding

PREP-D resolves the two questions differently:

1. **CEngS layers classify architectural concerns.** They are not a complete taxonomy of library/package types.
2. **The Zyppi monorepo is the correct home for ZII**, but its current dependency-governance implementation is still CAW-centric and cannot safely admit a second independently governed package family.

CEngS-001 requires six concern layers with downward dependencies:
```text
Presentation → Gateway → Application → Runtime → Persistence → Infrastructure
```

But CEngS-002 simultaneously defines a modular monorepo containing packages such as `runtime`, `sdk`, `core`, `policies`, `registry`, and `shared`; therefore a package does not have to masquerade as one of the six layers merely because it is a package.

This confirms our earlier concern:
```text
qr-core ≠ Application
qr-svg  ≠ Presentation
```
They are technical libraries which may be eligible for use from particular layers.

---

## Current Repository Reality

The monorepo already supports:
```text
apps/*
packages/*
edge/*
infra
```
so a new immediate package such as:
```text
packages/qr-core
packages/qr-svg
```
is already recognized by `pnpm` without changing the workspace glob.

The root TypeScript project, however, explicitly enumerates every current project, so new ZII packages would require explicit project references.

This distinction matters:

| Concern | Status |
| :--- | :--- |
| pnpm workspace admission | already scalable |
| TypeScript build registration | explicit / manual |
| architecture validation | currently hard-coded |

---

## The Current `zyppi.layer` Model Is Not the CEngS Layer Model

This is a concrete repository defect exposed by ZII.

`verify-package-boundary.mjs` currently declares:
```text
foundation
runtime
contracts
testing
```
as `ALLOWED_LAYERS`, defaults an unspecified package to `foundation`, and applies dependency rules from that classification.

But those are plainly not CEngS-001's six layers:
```text
Presentation
Gateway
Application
Runtime
Persistence
Infrastructure
```
Only `runtime` overlaps semantically.

Therefore:
> **The current `zyppi.layer` field is really an implementation package-class mechanism whose name incorrectly suggests that it expresses CEngS constitutional layer placement.**

We should not perpetuate that ambiguity by adding:
```json
{
  "zyppi": {
    "layer": "renderer"
  }
}
```
or by pretending:
```json
{
  "zyppi": {
    "layer": "runtime"
  }
}
```
is appropriate for `qr-svg`.

---

## PREP-D Decision

Future governance must distinguish at least:
```text
PACKAGE ROLE
      ≠
CEngS LAYER ELIGIBILITY
```

Example:
```text
@zyppi/qr-core
  Program: ZII
  Role: engine-core
  CEngS layer eligibility:
    - Presentation
    - Application
  Not:
    - Runtime
    - Persistence
```

No new CEngS constitutional layer is required.

---

## ZII Layer Eligibility Matrix

This is the PREP-D working model.

| ZII responsibility | Package / technical role | CEngS participation |
| :--- | :--- | :--- |
| Pure QR/NFC/etc. encoding core | Engine Core | Layer-neutral technical library; consumed only by authorized layers |
| Pure renderer such as SVG | Renderer | Layer-neutral technical library |
| CLI / developer-facing SDK | Client Surface | Presentation |
| HTTP/gRPC exposure of an engine | Gateway Adapter | Gateway |
| Provisioning/orchestration workflow | Application Service | Application |
| Constitutional Runtime | **Not ZII** | Runtime — presumed prohibited to ZII |
| Carrier record storage | Persistence Adapter (if ever required) | Persistence |
| Printer/NFC writer/radio/device driver | Physical / Device Adapter | Infrastructure |
| Capture ingestion endpoint | Gateway Adapter | Gateway |
| Hardware capture driver | Physical Adapter | Infrastructure |
| Conformance harness | Testing / Tooling | Development-only; not production layer |
| Benchmarks | Tooling | Development / release infrastructure |
| Engine profile registry data | Technical metadata | Depends on implementation; cannot become constitutional Registry authority |

The key rule is:
> **A layer-neutral library may be consumed from authorized layers without becoming that layer itself.**

This interpretation is consistent with CEngS-002 permitting `core`, `shared`, and `sdk` packages alongside the layer architecture.

---

## Initial ZQE Eligibility

For ZQE specifically, we can be stricter.

### `@zyppi/qr-core`
- **Role:** pure `engine-core`
- **Production dependencies:** NONE
- **May initially be consumed by:** Presentation, Application
- **Presumed prohibited:** Runtime, Persistence
- **Gateway:** not authorized until a real use case requires it
- **Infrastructure:** not authorized initially

**Why no Runtime?**
Because PREP-B already established that QR encoding is technical representation machinery, not constitutional execution. Purity alone does not make something Runtime.

### `@zyppi/qr-svg`
- **Role:** renderer
- **Production dependency:** `@zyppi/qr-core`
- **May initially be consumed by:** Presentation, Application
- **Presumed prohibited:** Runtime, Persistence, Infrastructure

This means:
```text
qr-svg
  ↓
qr-core
```
is valid without falsely calling `qr-svg` a Runtime package.

---

## Initial Repository Placement Is Now Decided

For the first ZII implementation, use the simple flat structure:
```text
packages/
├── domain/
├── shared/
├── contracts/
├── runtime/
├── testing/
│
├── qr-core/
└── qr-svg/

DOCS/
├── CAW/
├── CEngS-v2/
└── ZII/
    └── ZQE/
```

Do **not** initially use:
```text
packages/interaction/qr-core
```
because the current workspace only includes immediate `packages/*` members. A nested layout would require additional workspace configuration for no immediate architectural benefit.

CEngS-002 explicitly prefers simplicity and incremental evolution over unnecessary structural complexity. Family membership belongs in architectural governance, not necessarily directory nesting.

---

## The Real Blocker: `verify-dependency-graph.mjs`

The current graph validator is explicitly CAW-bound. Its own header says it enforces CAW-004 v2.1, and it hard-codes:
```text
NODES
PACKAGE_TO_NODE
POLICY
```
for the existing repository members.

Unknown `@zyppi/*` dependencies or project references are rejected as unrecognized workspace edges.

Therefore simply creating:
```text
@zyppi/qr-core
```
would not create a new valid peer package family. The validator would regard it as foreign.

That is correct fail-closed behavior under its current authority — but that authority must evolve before ZII enters.

---

## CAW-004 Really Is the Current Authority; We Cannot Silently Bypass It

This is stronger than an implementation accident.

CAW-004 explicitly declares its import table authoritative. More importantly, AMS-0208 explicitly instructed the dependency validator to treat CAW-004 v2.1 as the constitutional source of truth, encode that graph directly, fail closed on unknown edges, and specifically forbade creating an independently maintained `constitutional-graph.json`.

Therefore PREP-D rejects this shortcut:
```text
Create ZII packages
      ↓
quietly add them to validator constants
```
That would be implementation drift.

It also rejects:
```text
Create ZII-004
      ↓
let ZII-004 independently redefine the entire repo graph
```
because we would now have two global authorities.

---

## The Correct Governance Transition

The solution is a platform-level authority transition, not a second global repository constitution.

The target should be:
```text
CEngS-002
platform-wide repository engineering rules
      │
      ▼
GLOBAL WORKSPACE POLICY
machine-readable executable policy
      │
      ├────────────┴────────────┐
      │                         │
      ▼                         ▼
CAW-owned                 ZII-owned
topology                  topology
      │                         │
CAW-004                  future ZII-004
```

Where:

- **CEngS-002 owns** — Permanent/general repository rules: modular monorepo; one responsibility per package; public boundaries; no cycles; dependency discipline; generic registration/enforcement mechanism. It already owns these responsibilities.
- **Global workspace policy owns** — The executable current package graph: registered node, package path, package name, program/authority owner, role, production-authorized edges, dev-authorized edges, layer eligibility/restrictions.
- **CAW-004 owns** — Only CAW-specific repository topology and package responsibilities.
- **ZII-004, if eventually needed, owns** — Only ZII-specific package responsibilities/topology.

Neither CAW nor ZII becomes the global monorepo constitution.

---

## Machine-Readable Policy: How to Avoid Duplicating Law

AMS-0208 was right to reject a second independently maintained policy artifact under the old model. The new requirement is different: multiple programs now need one executable global registry.

I would therefore recommend **one executable policy module**, not multiple policy copies.

Working example only:
```javascript
tools/workspace-policy.mjs
```

Conceptually:
```javascript
export const workspacePolicy = {
  packages: {
    "@zyppi/domain": {
      path: "packages/domain",
      authority: "CAW-004",
      role: "domain",
      production: [],
      development: []
    },
    "@zyppi/qr-core": {
      path: "packages/qr-core",
      authority: "ZII-004",
      role: "engine-core",
      production: [],
      development: []
    }
  }
};
```

This would be:
> **the single executable representation of approved workspace package authority.**

Not a second Constitution. The current inline graph constant already serves essentially this function; PREP-D proposes extracting and generalizing it because one CAW document can no longer own the entire package universe.

This change requires human authorization and amendment of the existing CAW-004/AMS-0208 authority assumptions before implementation.

---

## Generic Graph Enforcement Must Be Separated from Domain-Specific Rules

Another important finding is that the current global dependency validator now contains a specific:
> **GS1 Domain-Edge Isolation Policy**

for generic Z-PROF/application modules. That rule may be entirely valid. But it is not a generic monorepo dependency rule.

Today the validator conceptually contains:
```text
GLOBAL PACKAGE GRAPH
+
CAW PACKAGE POLICY
+
GS1 / Z-PROF DOMAIN-EDGE POLICY
```

That does not scale to:
```text
ZII
DPP
healthcare
logistics
future wedges
```

### PREP-D Decision

Split responsibilities conceptually:
```text
verify-workspace-architecture
│
├── package registration
├── allowed package edges
├── project references
├── boundary skipping
└── cycles

CAW-specific validation
│
└── GS1 domain-edge isolation

future ZII-specific validation
│
└── interaction-engine constraints
```

Global architecture tooling may orchestrate all validators. It should not contain the business/domain rules of every program. This is the same architectural discipline ZII itself is trying to establish.

---

## `verify-package-boundary.mjs` Also Needs Generalization

AMS-0208 originally defined this validator more narrowly:
> *Is an individual publishable library package internally well-formed?*

The present implementation has expanded that responsibility by enforcing the pseudo-layer model:
```text
foundation
runtime
contracts
testing
```
and dependency behavior based on it. That creates duplication with the repository graph validator.

### Target Responsibility

`verify-package-boundary` should answer things such as:
- Does this library expose only declared public APIs?
- Do export targets exist?
- Does native package resolution work?
- Are private internals actually private?
- Is package metadata structurally valid?

The global graph validator should answer:
- May package A depend upon package B?

And Runtime purity remains separately enforced. This actually returns to the separation described by AMS-0208 itself.

---

## We Should Stop Using `zyppi.layer` in Its Present Meaning

**PREP-D recommendation:**
Do not expand the existing:
```json
"zyppi": {
  "layer": "foundation"
}
```
model into ZII.

Instead, any future metadata model should distinguish concepts explicitly. Working example:
```json
{
  "zyppi": {
    "program": "ZII",
    "role": "engine-core"
  }
}
```
while layer eligibility is governed by the workspace policy.

For example:
```text
@zyppi/qr-core
  role = engine-core
  eligible consumers:
    - Presentation
    - Application
  prohibited consumer:
    - Runtime
```

This prevents this semantic nonsense:
```json
"layer": "renderer"
```
where `renderer` is plainly not a CEngS layer.

Exact metadata syntax remains an implementation decision for the governance work item.

---

## Existing CI Currently Has a Governance Gap

The root package defines:
```text
boundary:all
graph:validate
```
and its `ci` script explicitly executes:
```text
format → lint → tsc → runtime purity → package boundaries → graph validation → tests
```

That is also exactly what AMS-0208 required as the blocking CI chain.

But the actual GitHub Actions workflow currently runs only:
```text
format → lint → tsc → runtime purity → tests
```

It does **not** invoke `boundary:all` or `graph:validate`.

Therefore repository architecture validation is currently stronger locally than on GitHub PR CI.

CEngS-102 says architecture validation and dependency analysis are required in the PR pipeline.

**PREP-D decision:**
Before ZII enters the repository:
> **GitHub CI must execute the full root architecture gate.**

The simplest target is for GitHub CI to call the authoritative root `pnpm ci` command, or equivalently include all its gates explicitly. PREP-D does not authorize that change yet; it identifies it as a mandatory repository-readiness correction.

---

## TypeScript Project References

TypeScript project membership is explicit today. I would not complicate this immediately with dynamic `tsconfig` generation.

Instead:
```text
create package
      ↓
register in global workspace policy
      ↓
add root TypeScript project reference
      ↓
validator checks policy ↔ workspace ↔ tsconfig consistency
```

The future generic validator should fail if:
- a workspace package exists but is unregistered;
- a registered package path does not exist;
- two registrations use the same package name/path;
- a TypeScript workspace package is omitted from the root project graph where compilation requires it;
- an unknown package edge appears.

This gives us fail-closed behavior without hiding the build graph.

---

## Initial ZQE Graph

The first ZQE implementation should begin with an extremely small graph:
```text
@zyppi/qr-core
│
│ no production dependency
│
▼
[leaf]
```

then:
```text
@zyppi/qr-svg
│
▼
@zyppi/qr-core
```

No existing CAW package needs to import either merely because they exist.

The first implementation graph should therefore be:
```text
qr-svg → qr-core
```
and nothing else.

Later, a separately authorized CAW integration could establish something like:
```text
CAW Application provisioning
      ↓
@zyppi/qr-svg
      ↓
@zyppi/qr-core
```
But that edge belongs to the integration work, not to ZQE bootstrap. This preserves the Disappearance Test.

---

## No Direct ZII → CAW Dependency

This should be a PREP-D hard boundary candidate:
```text
ZII engine packages
      X
      │
      ▼
CAW packages
```

ZII may not depend on CAW. Instead:
```text
CAW
  ↓ consumes
ZII
```
where specifically authorized.

Similarly:
> **ZQE must not import** `@zyppi/domain`, `@zyppi/runtime`, `@zyppi/contracts`, GS1 application modules, Z-PROF, or Registry for its engine work.

The current monorepo makes this easy to enforce mechanically once the global policy is generalized.

---

## Repository Governance Hierarchy After Migration

The final target is:
```text
CEngS-001
six-layer constitutional law
      │
      ▼
CEngS-002
global repository/package rules
      │
      ▼
Executable Workspace Policy
single machine-readable package authority
      │
      ├──────┼─────────┐
      │      │         │
    CAW    ZII      future
      │      │
   CAW-004 ZII-004
program-specific maps only
```

This avoids both bad extremes:

| Bad extreme A | Bad extreme B |
| :--- | :--- |
| CAW-004 owns every future Zyppi package | CAW-004 global graph + ZII-004 global graph + DPP-004 global graph + ... (competing constitutions) |

---

## Mandatory Governance Migration Before ZQE

I would define a small **Repository Governance Transition Gate** before the first ZQE package. It has six requirements:

1. **Authority correction** — CAW-004's authority is narrowed from "entire workspace universe" to its approved CAW topology, without changing existing CAW behavior.
2. **CEngS-002 clarification** — platform-wide package registration/dependency governance is explicitly recognized as a CEngS-002 responsibility.
3. **Generic workspace policy** — the currently approved graph is represented through one global executable policy mechanism.
4. **Validator separation** — generic package-graph enforcement is separated from CAW/GS1-specific semantic isolation rules.
5. **Boundary verifier correction** — package well-formedness is separated from the misleading `foundation/runtime/contracts/testing` pseudo-layer dependency policy.
6. **CI closure** — GitHub PR CI actually runs the full architecture/boundary gates.

Only then:
```text
packages/qr-core
```
may be introduced.

---

## What Must NOT Happen During This Migration

The governance work is infrastructure refactoring, not an opportunity to redesign existing CAW. Therefore it must preserve the current allowed CAW dependency graph exactly unless a separate authorized correction says otherwise.

No migration task may casually:
- add new CAW imports;
- remove existing legal imports;
- reinterpret Z-PROF;
- alter Runtime purity;
- move existing packages;
- rename current packages;
- refactor CAW source code;
- create QR packages simultaneously.

This should be its own atomic milestone/work item before ZQE bootstrap.

---

## PREP-D Invariants

The audit produces these candidate invariants:

| ID | Invariant |
| :--- | :--- |
| **ZII-D01** | **Layer Concern ≠ Package Role.** A package may be a technical library without pretending to be a constitutional layer. |
| **ZII-D02** | **Layer Eligibility Is Explicit.** Each ZII package must declare or be governed by which CEngS layers may consume it. |
| **ZII-D03** | **No ZII Runtime Privilege.** ZII packages are prohibited from Runtime by default; exceptions require explicit constitutional justification. |
| **ZII-D04** | **One Global Workspace Authority.** The monorepo may not have competing global dependency graphs. |
| **ZII-D05** | **Program Maps Are Scoped.** CAW maps CAW; ZII maps ZII. |
| **ZII-D06** | **Unknown Packages Fail Closed.** New workspace members require explicit registration. |
| **ZII-D07** | **Domain Validators Stay Domain-Scoped.** GS1/CAW rules do not become generic platform rules merely because they run in CI. |
| **ZII-D08** | **Dependency Authorization Is Non-Transitive.** Existing CAW rule remains valid globally unless explicitly superseded. |
| **ZII-D09** | **ZII Does Not Depend on CAW.** Consumption direction is application/wedge → infrastructure engine. |
| **ZII-D10** | **Repository Co-location Does Not Grant Dependency Authority.** Same monorepo never implies legal imports. |

---

## PREP-D Verdict

**PREP-D PASSES FOR PREPARATION PURPOSES.**

We now have a resolved repository strategy:

> **ZII will run inside the existing Zyppi monorepo as an independently governed program family.** CEngS remains the global engineering authority. A generalized single workspace-policy mechanism will replace CAW-004's accidental role as universal repository authority, while preserving its CAW-specific rules. ZII packages will have explicit technical roles and CEngS layer eligibility rather than being forced into false layer identities.

And the first implementation topology is provisionally:
```text
packages/qr-core
packages/qr-svg

DOCS/ZII/
DOCS/ZII/ZQE/
```

with initial dependency graph:
```text
qr-svg → qr-core
```
and **no CAW integration edge yet.**

> **The important consequence is that we have discovered a required pre-ZQE engineering step:**
> **Repository Governance Transition must occur before ZQE bootstrap.**
>
> This does not block the next PREP phase. PREP-E — Sibling Standards Stress Test can now proceed in parallel conceptually, because it is architectural research rather than repository modification.
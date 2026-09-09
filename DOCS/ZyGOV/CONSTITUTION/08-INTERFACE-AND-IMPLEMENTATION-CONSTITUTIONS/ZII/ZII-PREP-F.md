# ZII-PREP-F — ZQE Entry Contract

| Field | Value |
| :--- | :--- |
| **Status** | COMPLETE FOR PREP PURPOSES — PASS WITH PRE-IMPLEMENTATION CONDITIONS |
| **Implementation authority** | NONE |
| **Purpose** | Define the exact architectural, standards, repository, quality, and evidence conditions that must be satisfied before the first ZQE implementation mandate may be issued. |
| **Parent program** | ZII — Zyppi Interaction Infrastructure |
| **First reference implementation** | ZQE — Zyppi QR Engine |

---

## Entry-Contract Decision

PREP-A through PREP-E are now sufficiently coherent to define ZQE without letting QR redefine ZII.

The resulting hierarchy is:

```text
Zyppi Constitutional / Engineering Authority
│
CEngS
│
▼
ZII
Zyppi Interaction Infrastructure
│
▼
ZQE
Zyppi QR Engine
│
┌────────┴────────┐
▼                 ▼
QR Core          SVG Renderer
│
▼
QrSymbol
```

Critically:
- `ZII ≠ ZQE`
- `ZQE ≠ zQR`
- `zQR ≠ QR standard`
- `zTOUCH ≠ ZII`
- `ZPI ≠ ZII`
- `GS1 ≠ ZQE`

ZQE's task is deliberately narrower:
> **ZQE is a standards-conformant, deterministic, inspectable QR compilation engine that transforms explicitly supplied payload material into a canonical QR technical artifact and, through separate renderers, into delivery representations such as SVG.**
>
> It does not know what the payload means constitutionally.

---

## Constitutional Authority of ZQE

PREP-B established that ZII requires no new constitutional sovereignty.

ZQE therefore operates under this rule:
> **ZQE owns QR mechanics. It owns no Reality, Identity, Referent, Intent, Trust, Policy, Evidence, Context, Resolution, Authority, Capability, or constitutional execution semantics.**

The relevant ownership boundary is:

| Concern | Authority |
| :--- | :--- |
| QR encoding mechanics | ZQE / ISO standard |
| QrSymbol technical artifact | ZQE |
| QR renderer behavior | ZQE renderer specification |
| QR conformance | ZQE + external QR standard |
| Engineering quality | CEngS |
| Reality / Identity / Event / Evidence | ZRM / SIOS |
| Trust / security standing | SEC |
| Authorization / constitutional Capability | POL |
| Domain composition | Z-PROF / Application |
| Constitutional execution | RI |
| GS1 meaning | GS1 + relevant Zyppi domain/profile layer |
| zTOUCH meaning | Future zTOUCH specification |
| ZPI/zPIS meaning | Future ZPI/zPIS authority |

ZQE may carry bytes representing any of these things.
It may not interpret their constitutional meaning.

---

## Golden Question Entry Boundary

ZQE shall remain intentionally ignorant of most Golden Question dimensions.

| Dimension | ZQE status |
| :--- | :--- |
| **Who?** | Unknown; never inferred |
| **Did what?** | ZQE technically performed an encoding operation |
| **To whom/what?** | Supplied payload only; no Referent inferred |
| **Where?** | Unknown; never inferred |
| **When?** | No implicit constitutional time |
| **How do we know?** | Technical trace, deterministic regeneration, conformance evidence |

Therefore ZQE's API must not silently introduce:
- `actor`
- `user`
- `place`
- `currentTime`
- `identity`
- `authority`
- `policy`
- `trust`
- `evidence`

merely because higher Zyppi systems may eventually need those concepts.

This preserves the PREP-B principle:
> **ZII may know HOW. It may carry WHAT. It must not decide WHAT IT MEANS.**

---

## Standards Authority

The published normative baseline for ZQE is:
> **ISO/IEC 18004:2024** — QR code bar code symbology specification, Edition 4, published August 2024.

ISO identifies it as the current published International Standard covering encoding methods, symbol formats, dimensions, error correction, reference decoding and application parameters. ISO also shows Edition 5 as a working draft, not a published replacement.

Therefore:
```text
Normative baseline:
  ISO/IEC 18004:2024 Ed.4

Non-normative future input:
  ISO/IEC WD 18004 Ed.5
```

The draft must not silently alter `zqe/1`.
If a later published edition warrants behavioral change:
```text
zqe/1
```
remains reproducible, and a future technical engine profile may introduce the new behavior explicitly.

### Normative-Source Prerequisite
Before implementation of standards-sensitive algorithms begins, the implementation mandate must identify the complete authorized normative source used by Jules/developers.

ISO's public summary alone is enough for PREP architecture but not enough to reconstruct every normative encoding rule.

**No implementation may fill normative gaps from memory or assumptions.**

### Initial Standards Scope
ZQE's first implementation should target a deliberately bounded subset:
- **QR Code Model 2, Versions 1–40.**
- Initial scope includes the standard error-correction levels: **L, M, Q, H**
- And the relevant Model-2 encoding machinery necessary for standards-conformant symbols.

Other QR-family symbologies or future standard additions are excluded unless explicitly added by a later mandate.

> *That means ZQE-M01 does not automatically implement every symbology whose name contains "QR."*
> This is a scope boundary, not a claim about what ISO/IEC 18004 contains in total.

---

## ZQE Package Boundary

PREP-D established the initial topology:

```text
packages/
├── qr-core/
└── qr-svg/
```

with documentation under:
```text
DOCS/ZII/
└── ZQE/
```

The initial production dependency graph is:
```text
@zyppi/qr-svg
│
▼
@zyppi/qr-core
```

and:
```text
@zyppi/qr-core
  ↓
NOTHING
```
in production dependencies.

ZQE must not initially depend upon:
- `@zyppi/domain`
- `@zyppi/contracts`
- `@zyppi/runtime`
- `@zyppi/shared`
- `@zyppi/testing`
- `apps/api`
- CAW modules
- Z-PROF modules
- registry infrastructure
- database infrastructure
- network libraries

Shared development tooling may be authorized separately where it does not enter production dependency surfaces.

This implements the **Disappearance Test**:
> *If CAW vanished, ZQE would still be a complete QR engine.*

---

## Repository Prerequisite

Although PREP-F defines ZQE, the packages must not yet be created.

PREP-D discovered that `pnpm-workspace.yaml` is already broad enough for new `packages/*` members, but the TypeScript root references and architecture validators remain explicitly enumerated and CAW-centric.

The current dependency graph validator explicitly derives its authority from CAW-004 and hard-codes the present workspace graph.

Therefore the **Repository Governance Transition** is a hard prerequisite to ZQE package creation.

It must preserve all existing CAW behavior while establishing:
```text
CEngS platform authority
      ↓
single executable workspace policy
      ↓
┌────────────┼────────────┐
▼            ▼            ▼
CAW          ZII       future families
```

The live GitHub workflow also presently omits `boundary:all` and `graph:validate`, even though the root `ci` command includes both and AMS-0208 intended them as blocking gates.

**That enforcement gap must be closed before ZQE enters.**

---

## Core Architecture Contract

The ZQE core pipeline is:

```text
Payload
  ↓
Input normalization permitted by explicit API contract
  ↓
Segmentation / mode planning
  ↓
Bitstream construction
  ↓
Error-correction construction
  ↓
Version / capacity resolution
  ↓
Module placement
  ↓
Mask evaluation
  ↓
Format / version information
  ↓
Canonical QrSymbol
```

The core produces no image.

The canonical public technical artifact is conceptually:

```typescript
interface QrSymbol {
  readonly version: number;
  readonly size: number;
  readonly errorCorrection: ErrorCorrectionLevel;
  readonly mask: number;
  readonly modules: /* immutable matrix representation */;
}
```

*Exact TypeScript syntax and internal storage representation are implementation-design matters.*

The architectural contract is:
> **The canonical result is the QR symbol state necessary to reproduce the standards-conformant matrix—not SVG, PNG, PDF, Canvas, or a browser object.**

---

## QrSymbol Constitutional Status

PREP-B and PREP-E resolve this definitively:
> **QrSymbol is a native technical artifact of ZQE.**

It is **not**:
- Reality
- Identity
- Evidence
- constitutional Event
- Execution Receipt
- SEC artifact
- Z-PROF artifact

It is also **not** a universal ZII artifact.

Future siblings may have:
- `DataMatrixSymbol`
- `NdefMessage`
- `EpcEncoding`
- `TagMemoryLayout`
- `AdvertisingData`

without conforming themselves to `QrSymbol`.

Thus:
> **ZQE owns QrSymbol; ZII owns the pattern that engine families may define technology-native canonical technical artifacts.**

---

## Encoding Interface Principle

ZQE should expose explicit QR semantics, not Zyppi semantics.

Conceptually:
```typescript
qr.encode(payload, options)
```

may accept:
- `payload`
- `error-correction preference`
- `version constraint`
- `mask constraint`
- `technical engine profile`

where appropriate.

It should **not** accept:
- `identity`
- `intent`
- `trust`
- `user`
- `campaign`
- `GS1 product`
- `place`
- `authority`
- `zTouch envelope`

as QR-core concepts.

A higher layer may construct a string or bytes representing any of those and pass the resulting payload to ZQE.

---

## Input Semantics

ZQE must avoid "magic guessing."

The core should distinguish explicit input representation from convenience APIs.

At the lowest reliable boundary:
> **exact input bytes / explicitly encoded text**
must produce predictable encoding semantics.

Convenience handling of JavaScript strings must define its character encoding behavior exactly.

No silent:
- locale-dependent conversion
- platform-dependent encoding
- implicit lossy conversion

is permitted.

If ECI or other standards-defined character-set signaling is supported, its semantics must be explicit and tested rather than inferred magically.

---

## Segmentation Excellence Requirement

Automatic mode segmentation is not a cosmetic optimization.

For supported modes, ZQE should seek:
> **algorithmically optimal or explicitly bounded-optimal segmentation under the defined ZQE cost model.**

The model must account for the actual QR bit cost of:
- mode indicators
- character-count fields
- segment transitions
- payload encoding
- version-dependent count widths
- applicable ECI costs

where supported.

A greedy heuristic cannot be branded "optimal."

If ZQE claims global optimality, the algorithm and proof argument must make clear under which exact supported-mode/cost model that guarantee holds.

*This is one of ZQE's intended differentiators over ordinary utility libraries.*

---

## Version Selection

When no fixed version is supplied:
> ZQE shall select the **smallest standards-valid QR version** that accommodates the encoded payload under the selected technical parameters.

When a fixed version is supplied and capacity is insufficient:
> **typed capacity failure** must occur.

ZQE shall **not** silently:
- truncate payload
- change payload
- lower requested ECC
- change explicit semantic input

to force success.

Version boundaries—especially places where character-count widths or capacity behavior changes—must be explicitly tested.

---

## Error Correction

Error-correction level must be:
- **explicit**
- or governed by an explicitly documented Technical Engine Profile default.

The core must never hide an undocumented policy such as:
> *"we chose Q because it seemed better"*
from callers.

If future convenience APIs offer automatic ECC boosting, that must be an explicit profile/API behavior and remain reproducible.

---

## Mask Selection

When mask is not explicitly fixed, ZQE must evaluate all applicable QR masks according to the governing standard's penalty rules and choose deterministically.

If the normative standard leaves a genuine tie that permits multiple valid choices, the active Technical Engine Profile must define a deterministic tie-break rule.

For example, a profile may specify:
> *lowest mask index among equal minimum scores,*

but that becomes a ZQE profile decision only after confirming it does not contradict normative requirements.

**The tie rule must never remain ambient implementation behavior.**

---

## Technical Engine Profile

PREP-E established this as a generic ZII concept.

ZQE's behavior must therefore be bounded by an explicit profile such as:
```text
zqe/1
```

This is separate from:
- npm/package semver
- QR version 1–40
- payload protocol version
- zTouch binding version
- ZPI version
- GS1 standard version
- Z-PROF Domain Profile

Conceptually:
```text
@zyppi/qr-core v7.2.1
│
├── supports zqe/1
├── supports zqe/2
└── ...
```
would be possible in the future.

The package can evolve while continuing to regenerate old `zqe/1` artifacts.

### Profile Purpose
A Technical Engine Profile freezes all engine choices that could otherwise introduce multiple valid outputs, including where applicable:
- automatic segmentation behavior
- version selection behavior
- mask tie behavior
- default handling
- serialization/canonicalization choices

### Determinism Contract
For deterministic core operations:
> **Same exact input + same explicit technical parameters + same Technical Engine Profile shall produce the same canonical QrSymbol.**

This should ultimately hold:
- across runs
- across machines
- across supported environments

subject to a clearly defined canonical representation.

There must be **no dependence** on:
- current time
- randomness
- process ID
- filesystem ordering
- locale
- environment variables
- network state
- database state
- machine-specific floating behavior

unless a later specification explicitly permits it—which would require strong justification.

---

## Canonical Artifact Serialization

To make cross-runtime reproducibility testable, ZQE should define a canonical serialization/hash model for `QrSymbol`.

The exact byte format does not need to be chosen in PREP-F, but the eventual ZQE specification must permit:
```text
QrSymbol
  ↓
canonical serialization
  ↓
symbolHash
```
such that implementations in:
- TypeScript
- Rust
- Go
- WASM
- future runtimes

could prove artifact identity.

The hash algorithm itself must be explicitly versioned/defined when this feature is specified.
**No hash choice is ratified by PREP-F.**

---

## Compilation Diagnostics

ZQE should be inspectable, not an opaque encoder.

A diagnostic/compilation trace may expose technical information such as:
- chosen segments
- candidate segmentation costs
- selected version
- rejected lower versions
- data codewords
- ECC block structure
- interleaving
- mask scores
- selected mask
- format/version information
- function-module map

where practical.

The trace:
- is an optional technical diagnostic artifact.

It is **not**:
- constitutional reasoning
- SEC evidence
- Execution Receipt
- AI explanation

*This is particularly valuable for conformance, debugging, educational inspection and future cross-implementation verification.*

---

## Renderer Boundary

The first renderer is:
> **deterministic canonical SVG**

Conceptually:
```text
QrSymbol
  ↓
qr-svg
  ↓
SVG text/bytes
```

The SVG renderer may own representation options such as:
- quiet zone
- module scale / dimensions
- foreground/background representation
- SVG structural choices

within its specification.

It may **not** alter QR semantics.

The same `QrSymbol` should be renderable later as:
- PNG
- WebP
- PDF
- Canvas
- printer-native data

without recomputing QR encoding.

*That separation is one of ZQE's core architectural commitments.*

### Canonical SVG Requirement
For the same:
- `QrSymbol`
- renderer options
- renderer profile/version

the reference SVG renderer should emit **byte-identical canonical output**.

It must avoid accidental entropy such as:
- timestamps
- random IDs
- nondeterministic attribute ordering
- environment-specific formatting
- tool metadata

This enables:
- SVG hash
- reproducible artifacts
- regression testing
- historical reconstruction

The canonical renderer should favor a compact standards-valid structure without making visual cleverness part of core correctness.

### Quiet Zone and Visual Integrity
The renderer must preserve the QR technical requirements applicable to symbol presentation, including quiet-zone handling as defined by the governing standard/profile.

Decorative features such as:
- logos
- rounded modules
- gradients
- brand graphics
- embedded artwork
- frames

are **not** part of the reference ZQE core/SVG contract.

They may later exist in a styling or experience layer only if conformance and decode reliability remain explicitly governed.

The first reference renderer should optimize for:
- **correctness**
- **clarity**
- **determinism**
- **interoperability**

not decoration.

---

## Independent Decoding Requirement

The initial ZQE product need not ship its own production decoder.

Instead, conformance requires the inverse relationship to be tested independently:
```text
input payload
  ↓
ZQE
  ↓
QrSymbol / SVG
  ↓
independent decoder
  ↓
exact original payload
```

The independent decoder must **not** reuse ZQE's own encoding logic in a way that lets the same defect validate itself.

Where practical, more than one independent decoder ecosystem should be used during high-confidence conformance testing.

*A future ZQE decoder may be implemented later as a distinct scope.*

---

## Testing Contract

CEngS already requires layered testing and property-based testing for critical algorithms. The ZQE implementation should apply that rigor to QR boundaries.

The acceptance architecture should include:

| Test class | Purpose |
| :--- | :--- |
| **Normative/conformance vectors** | Standard correctness |
| **Unit tests** | Local algorithm correctness |
| **Property-based tests** | Broad invariant exploration |
| **Differential tests** | Compare against trusted independent implementations |
| **Round-trip tests** | ZQE encode → external decode |
| **Boundary tests** | Version/capacity/count-field transitions |
| **Determinism tests** | Identical artifact across repeated runs |
| **Renderer tests** | Canonical SVG identity and decodeability |
| **Mutation/negative tests** | Reject invalid states/options explicitly |
| **Performance benchmarks** | Detect pathological regressions |

Particularly important pathological cases include:
- minimum payload
- exact capacity boundary
- one unit above capacity
- v9 → v10 transition
- v26 → v27 transition
- maximum supported v40
- ECC block boundaries
- mixed-mode transitions
- Unicode/ECI boundaries where supported
- mask ties
- all eight masks

*The exact test vector corpus belongs in the ZQE implementation plan/specification.*

---

## Conformance Contract

A ZQE release may not call itself standards-conformant merely because third-party scanners happen to read a few samples.

Conformance evidence must distinguish:
- normative standards tests
- independent decoder interoperability
- differential implementation tests
- internal deterministic invariants

A competitor match alone is insufficient because two libraries can share the same mistake.

Conversely, producing a different valid symbol from another library is not automatically an error; QR may permit multiple valid representations.

*This is why `zqe/1` defines ZQE's reproducible choices independently of competitor output.*

---

## Competitive Excellence Contract

PREP work established that basic QR architecture is table stakes.

ZQE's aspirational position is:
> **A reference-grade QR compiler: standards-conformant, algorithmically disciplined, deterministic, reproducible, inspectable, independently verifiable, and operationally efficient.**

The initial excellence targets are therefore:

| ID | Target |
| :--- | :--- |
| **E1** | Strong/optimal supported-mode segmentation |
| **E2** | Complete declared QR Model-2 encoding semantics |
| **E3** | Explainable compilation trace |
| **E4** | Canonically serializable QrSymbol |
| **E5** | Frozen Technical Engine Profiles |
| **E6** | Cross-runtime reproducibility target |
| **E7** | Independent-decoder interoperability |
| **E8** | Exhaustive pathological/boundary testing |
| **E9** | Deterministic canonical SVG |
| **E10** | Competitive performance without sacrificing E1–E9 |

These are **quality obligations, not marketing claims.**
If a target has not been demonstrated, documentation must say so.

---

## Performance Contract

ZQE should be efficient enough for production and bulk generation, but **performance cannot override correctness.**

Benchmarks should eventually compare relevant operations against established QR libraries under equivalent workloads.

Metrics should separate:
- encoding throughput
- latency
- allocation/memory
- SVG generation
- large/version-40 cases
- mixed segmentation
- batch workloads

No benchmark target should encourage:
- dropping optimal segmentation
- skipping mask evaluation
- weakening validation
- changing output nondeterministically

to win throughput numbers.

**Correctness remains the gate.**

---

## Dependency Principle

The ZQE core should target:
> **zero runtime external dependencies where practical.**

For a foundational standards engine, that reduces:
- supply-chain surface
- version drift
- hidden behavior
- bundle size
- cross-runtime variability

But PREP-F does not turn "zero dependencies" into dogma for every future ZII engine.

It is a strong ZQE-specific target because the QR algorithms are bounded and implementable without a runtime library dependency.

*Development/test dependencies remain permitted where appropriately governed.*

---

## Error Model

ZQE must fail explicitly and typefully for technical failures.

Conceptual categories include:
- unsupported input semantics
- payload capacity exceeded
- invalid version constraint
- invalid ECC option
- invalid mask
- unsupported mode/feature
- invalid renderer option
- profile not supported
- internal invariant violation

*Exact class names are not fixed here.*

What is fixed:
> **ZQE must not silently coerce an invalid request into a different QR contract.**

And:
> **Errors describe technical QR failures, not business/domain failures.**

There is no ZQE error named:
- `IdentityNotFound`
- `NotAuthorized`
- `PolicyDenied`
- `TrustInvalid`
- `GS1InvalidProduct`

unless some future separate integration layer defines those.

---

## Generation Record

PREP brainstorming identified value in a technical generation record.

A future ZQE API may expose something like:
```text
encoder/profile
payload hash/reference
QR version
ECC
mask
symbol hash
```

This can support:
- historical regeneration
- diagnostics
- audit of technical generation
- reproducibility

But PREP-F formally preserves the distinction:
> **A ZQE Generation Record is not an RI Execution Receipt.**

If a Zyppi application later wants constitutional evidence that an authorized Actor provisioned a physical QR, that belongs outside the pure QR engine.

---

## Explicit Initial Non-Scope

The first ZQE implementation shall not implement the following merely because they are adjacent:

| Excluded concern | Reason |
| :--- | :--- |
| zQR semantic profile | Separate zTOUCH/product concern |
| zTouch Envelope | Separate future profile |
| ZPI / zPIS | Addressing/resolution |
| GS1 parsing/validation | Domain/standards application concern |
| GS1 Digital Link construction | Higher layer |
| CAW integration | Separate authorized integration |
| Redirect/resolution service | Not QR mechanics |
| QR analytics | Application/product concern |
| Dynamic redirects | Resolution infrastructure |
| Identity provisioning | ZRM/Application concern |
| Database storage | Not core |
| HTTP API | Gateway/Application concern |
| MCP/SDK product surface | Later consumer |
| Authentication/authorization | SEC/POL |
| Cryptographic zTouch signing | Higher profile |
| Physical anti-cloning | Future specialist/ZRB area |
| Printer drivers | Future ZII adapter |
| Physical printing | Infrastructure |
| Camera scanning | Input-adapter future scope |
| Production QR decoder | Not initial product requirement |
| PNG/PDF renderer | Later renderer milestones |
| Logo/styling engine | Presentation/product feature |
| AI-generated QR design | Out of core |
| ZyPub animated QR | Future consumer of ZQE |

*This non-scope is as important as the implementation scope.*

---

## First ZQE Implementation Decomposition

PREP-F does not yet create the milestone plan, but it establishes the logical construction order:

```text
Repository Governance Transition
      ↓
ZQE documentation/specification baseline
      ↓
@zyppi/qr-core scaffold
      ↓
QR normative primitives
      ↓
encoding pipeline
      ↓
QrSymbol
      ↓
conformance / diagnostics
      ↓
@zyppi/qr-svg
      ↓
independent interoperability
      ↓
benchmark / release gate
```

This prevents SVG or API convenience work from outrunning the encoding foundation.

---

## No First-Engine Privilege Test

Every architectural decision made during ZQE implementation must answer:
> *Does this belong specifically to QR, or is it being proposed as a ZII-wide rule?*

If specifically QR:
**ZQE owns it.**
*Examples:* mask, ECC level, finder patterns, quiet zone, version 1–40, QrSymbol, SVG renderer.

If proposed as generic ZII:
**it must survive PREP-E's sibling evidence.**
*Examples that survived:* Technical Engine Profile, native canonical technical artifact, conformance, diagnostics, explicit supported operations, input/output adapters, logic/I/O separation where applicable.

ZQE implementers must not promote QR internals into the ZII framework by convenience.

---

## First-Engine Reference Duty

Although ZQE receives no universal privilege, it does have a second responsibility:
> **ZQE is the first implementation that proves whether the proposed ZII engineering discipline is practical.**

Therefore ZQE should provide evidence for future engines around:
- package metadata
- engine profile declaration
- canonical artifact contracts
- diagnostic conventions
- conformance organization
- benchmark organization
- version freezing
- adapter separation
- documentation shape
- release evidence

Future NFC/BLE/etc. implementations may reuse those engineering patterns only where appropriate.
**They do not inherit QR semantics.**

---

## ZQE Entry Gate

The first ZQE implementation mandate may be issued only when the following conditions are satisfied:

| Gate | Required state |
| :--- | :--- |
| **F-G01 PREP-A** | Prior proposals reconciled |
| **F-G02 PREP-B** | Constitutional ownership audit closed |
| **F-G03 PREP-C** | zTOUCH collision audit closed with refactor |
| **F-G04 PREP-D** | Layer/repository model resolved |
| **F-G05 PREP-E** | Sibling stress test closed |
| **F-G06 Repository transition** | Global workspace governance ready for ZII |
| **F-G07 CI enforcement** | Architecture/boundary validation actually enforced in GitHub CI |
| **F-G08 Normative QR source** | Full normative implementation source identified/available |
| **F-G09 ZQE scope** | Model-2 initial scope and exclusions frozen |
| **F-G10 Technical profile** | Initial `zqe/1` behavioral decisions defined before ambiguous implementation choices |
| **F-G11 Conformance plan** | Independent verification strategy defined |
| **F-G12 Implementation plan** | ZQE milestone/build order created before code mandates |

PREP-A through PREP-E are conceptually satisfied by the work completed in this phase sequence.
**F-G06 onward remain implementation-entry prerequisites.**

---

## What PREP-F Does Not Require Before Planning

We should avoid turning the entry contract into waterfall paralysis.

Before drafting the ZQE milestone roadmap, we do **not** need to have already:
- implemented optimal segmentation
- selected every future renderer
- built NFC
- finished zTOUCH
- defined ZPI
- completed CAW
- implemented ZRB
- solved physical anti-cloning
- built ZyPub

The point of PREP-F is to know what ZQE is before coding it, not to solve all future Interaction Infrastructure first.

---

## ZQE's Concise Constitutional Contract

The entire PREP-F can be compressed into ten statements:

1. ZQE is a QR engine, not a Zyppi semantic engine.
2. ISO/IEC 18004:2024 Edition 4 is the initial normative QR authority.
3. ZQE initially targets QR Code Model 2, Versions 1–40.
4. `qr-core` transforms explicit payload input into canonical `QrSymbol`; it has no production dependency on Zyppi constitutional packages.
5. `QrSymbol` is a QR-native technical artifact, not Reality or a universal ZII artifact.
6. Rendering is separate; SVG is the first deterministic reference renderer.
7. Same input + parameters + Technical Engine Profile must regenerate the same canonical technical artifact.
8. Conformance, independent interoperability, diagnostics, boundary testing and reproducibility are release requirements, not optional polish.
9. zQR, zTOUCH, GS1, ZPI, CAW, Trust, Identity and Policy remain outside the QR core.
10. ZQE is ZII's first reference implementation but has no architectural privilege over future sibling engines.

---

## PREP-F Closure Result

**PREP-F PASSES.**

More importantly, the entire ZII-PREP investigation has now produced a coherent implementation boundary.

The sequence is:
```text
PREP-A  Reconciliation
      ↓
PREP-B  Constitutional Ownership
      ↓
PREP-C  zTOUCH Collision Audit
      ↓
PREP-D  Layer / Repository Governance
      ↓
PREP-E  Sibling Standards Stress Test
      ↓
PREP-F  ZQE Entry Contract
      ↓
   COMPLETE
```

We are not yet authorized to start ZQE code, because PREP-D uncovered a real repository prerequisite.

The immediate bridge from discovery to implementation should therefore be:
```text
ZII-PREP
      ↓
ZII Integrated Foundation / Architecture
      ↓
Repository Governance Transition
      ↓
ZII Roadmap
      ↓
ZQE Specification + Roadmap
      ↓
first AMS
      ↓
implementation
```

> **The important distinction is that the architecture discovery is now mature enough to stop asking what ZII/ZQE fundamentally are.**
>
> The next documentation should consolidate the findings into the permanent ZII foundation and then authorize the concrete repository transition and ZQE milestones—not reopen the foundational questions without new evidence.
# ZII-PREP — Zyppi Interaction Infrastructure Preparation & Reconciliation

| Field | Value |
| :--- | :--- |
| **Status** | ACTIVE DISCOVERY — NON-RATIFIED |
| **Date** | 22 August 2026 |
| **Authority** | Chair-initiated architectural preparation |
| **Implementation authority** | None |
| **Primary proving implementation** | ZQE — Zyppi QR Engine |
| **Repository target** | `aly-samy/zyppi.me` monorepo, subject to repository-governance reconciliation |

---

## PREP Mission

ZII-PREP shall answer:
> *What interaction infrastructure does Zyppi actually need, what does Zyppi already have, where should each previous proposal live, and what minimum architecture lets ZQE become the first implementation without making QR the universal model?*

It shall not begin by assuming that every brainstorming name deserves permanent architectural status.

The three uploaded proposals remain **evidence, not authority**:
- **zTOUCH / zQR** explores identity-native touchpoints and a possible carrier-independent envelope.
- **ZRB / ZPIF** explores a future constitutional physical-Reality boundary plus a technical device/interface ecosystem.
- **ZyPub / Zync** explores reference-based connected access versus bounded direct publication through arbitrary carriers.

CEngS supplies an important reconciliation rule: *implementation knowledge is distinct from constitutional law, and a rule appearing in two places is a defect—every rule gets one home.*

That becomes the governing discipline of PREP.

---

## Authority Order for Reconciliation

When sources disagree, ZII-PREP will use this order:

```text
1. Ratified Zyppi constitutional authority
      ↓
2. Ratified CEngS engineering law/standards
      ↓
3. Active architecture such as CAW / Z-PROF where applicable
      ↓
4. Repository implementation reality
      ↓
5. Exploratory proposals
      ↓
6. Prior Council brainstorming/recommendations
      ↓
7. External standards/research
      ↓
8. New ZII hypotheses
```

An exploratory proposal cannot override current architecture simply because its idea is newer. Likewise, current implementation does not automatically become constitutional truth.

---

## The Golden Question Becomes a PREP Instrument

The authoritative formulation we found is:

> **Who did what, to whom, where, when, and how do we know?**

Mapping to: **Subject**, **Event**, **Object**, **Place**, **Valid Time** and **Evidence**. Missing dimensions must remain missing; governance and authority do not become Reality merely because they govern it.

For ZII we will add a boundary analysis around that question. For every engine / adapter / profile / interaction:
- Which Golden Question dimensions does it **RECEIVE**?
- Which does it **REPRESENT**?
- Which does it **TRANSFORM** technically?
- Which does it **OBSERVE**?
- Which does it have **Evidence** for?
- Which is it **prohibited** from inventing?
- Where does constitutional interpretation begin?

This is better than forcing every engine to contain all six dimensions.

**For ZQE, for example:**
| Dimension | ZQE Boundary |
| :--- | :--- |
| **Who?** | Outside ZQE |
| **Did what?** | ZQE encoded supplied payload |
| **To whom?** | No constitutional Object inferred |
| **Where?** | Outside ZQE |
| **When?** | No implicit time |
| **How know?** | Technical conformance / deterministic artifact |

This already protects `qr-core` from accumulating user identity, policy, location, timestamps, ZPI semantics or Evidence responsibilities.

---

## Preliminary Reconciliation Ledger

*These are PREP dispositions, not ratifications.*

| Concept | PREP disposition | Reason |
| :--- | :--- | :--- |
| **ZII** | ADOPT as working program | Missing technical umbrella for interaction engines/utilities |
| **ZQE** | ADOPT as first reference implementation | Concrete, bounded first engine |
| **zTOUCH** | ADAPT / investigate | Valuable semantic interaction concept, but not the engine umbrella |
| **zQR** | ADAPT / separate from ZQE | Should mean Zyppi-aware QR usage/profile, not QR mathematics |
| **zTouch Envelope** | OPEN / investigate deeply | Strong hypothesis but may overlap existing composition/context/projection architecture |
| **ZRB** | PRESERVE + DEFER | Constitutional physical observation/actuation boundary is larger than ZII |
| **ZPIF** | ABSORB candidate | Most proposed technical responsibilities overlap ZII |
| **ZyPub** | PRESERVE / adjacent capability | Publication semantics can consume ZII carriers |
| **Zync** | PRESERVE / outside ZII | Connected resolution/access mode, not a carrier engine |
| **ZPI / zPIS** | PRESERVE separately | Addressing/resolution infrastructure, not carrier infrastructure |
| **Animated QR** | DEFER as experimental consumer | Potential ZyPub optical implementation using ZQE |
| **GS1 Digital Link QR** | FIRST external integration case | Important CAW/ZQE interoperability proof, not ZQE semantics |

This immediately removes the largest ambiguity:
**ZQE ≠ zQR** and **ZII ≠ zTOUCH**.

---

## Reconciliation Findings

### Finding A — zTOUCH versus ZII
The original `zTOUCH` proposal called zTOUCH a carrier-agnostic identity-touchpoint initiative and placed `zQR`, `zNFC`, `zRFID` and `zBLE` beneath it. The newer ZII idea reveals that this contains two different responsibilities.

- **ZII** answers: *How does Zyppi technically encode, render, materialize, transmit, capture, decode, inspect and validate interaction mechanisms?*
- **zTOUCH** potentially answers: *How does a Zyppi-aware touchpoint associate an interaction with persistent Identity and richer Zyppi semantics?*

Therefore the candidate relationship becomes:

```text
Semantic / product interaction
      zTOUCH
        │
   ┌────┴────┐
  zQR       zNFC
   │         │
   ▼         ▼
  ZQE      NFC Engine
   └────┬────┘
        ▼
       ZII
```
*This preserves zTOUCH's useful insight without making it the engineering framework.*

### Finding B — zQR versus ZQE
This must be made explicit immediately.

**ZQE — Zyppi QR Engine** (Technical)
```text
payload
  ↓
QR encoding
  ↓
QrSymbol
  ↓
renderer
```
*No Zyppi Identity semantics required.*

**zQR** (Potential higher-level Zyppi interaction profile)
```text
Identity / address / external identifier
  ↓
zQR semantics
  ↓
carrier payload
  ↓
ZQE
  ↓
QR
```
The original `zQR` proposal correctly requires ordinary QR compatibility and explicitly rejects dependence on proprietary matrices or Zyppi-only readers. That becomes a zQR/ZII interoperability constraint, not a change to QR itself. This resolves the earlier naming confusion without discarding either concept.

### Finding C — ZPIF Substantially Overlaps ZII
ZPIF proposed: adapters, module interfaces, protocols, SDKs, capability manifests, conformance tests, certification, compatibility, manufacturer tooling. These are overwhelmingly interaction-infrastructure responsibilities.

So the working hypothesis is:
```text
ZPIF
  ↓
technical responsibilities absorbed into
  ↓
ZII
```
However, one part should not be silently absorbed: *the future third-party/OEM certified-device ecosystem.* That could eventually become a specialized ZII program such as:
```text
ZII
 └── Device / OEM Integration
      ├── certification
      ├── module manifests
      ├── manufacturer tooling
      └── device adapters
```
Whether the public name ZPIF survives for that narrower subsystem remains OPEN. So PREP does not yet retire the name. It marks it **ABSORB-CANDIDATE**.

### Finding D — ZRB Remains Distinct
The ZRB proposal is qualitatively different. It asks:
```text
Physical Reality
  ↓
observation
  ↓
admissible digital representation

AND

authorized digital outcome
  ↓
actuation
  ↓
physical effect
```
And explicitly separates device assertions from proof of physical effects. That is constitutional territory involving Evidence, trust, authority and Reality. Therefore: **ZRB ≠ ZII**.

A useful future relationship may be:
```text
Constitutional systems
      │
     ZRB  (governed Reality boundary)
      │
     ZII  (technical engines / adapters / devices)
      │
physical mechanisms
```
But ZII development does not require ZRB ratification. This matters because the original ZRB proposal correctly deferred a generalized physical-interface constitution and explicitly said the current GS1 QR flow does not need it. We preserve that constraint.

### Finding E — ZyPub Uses ZII
ZyPub already concluded that optical communication is only a carrier and should not define the architecture. It envisioned carrier adapters including QR, NFC, BLE, LiFi, audio and future mechanisms. ZII now provides a natural implementation home for those mechanisms.

```text
ZyPub (publication semantics)
  │
  ▼
publication encoding/orchestration
  │
  ▼
ZII
 ├── QR
 ├── NFC
 ├── BLE
 └── ...
```
**For animated QR:**
```text
ZyPub Progressive
  ↓
fragmentation / sequencing / FEC
  ↓
series of payload frames
  ↓
ZQE
  ↓
series<QrSymbol>
  ↓
display adapter
```
ZQE should know nothing about publications, keyframes, fountain codes, epochs or constitutional state. The ZyPub proposal itself already requires transport mechanics to terminate before Runtime.

### Finding F — Zync Is Orthogonal
The strongest ZyPub/Zync refinement was:
> *Zync = resolve by reference. ZyPub = acquire by publication.*

That means Zync is not another engine family. Conceptually:
```text
Acquisition
  │
  ├──────────┴──────────┐
  ▼                     ▼
Zync                  ZyPub
(reference resolution)  (direct publication)
  │                     │
HTTP/API/etc.             ZII (carrier mechanisms)
```
We should preserve this distinction for later communication architecture work. No need to solve it during ZQE.

### Finding G — The zTouch Envelope Needs Special Scrutiny
This is the first major unresolved architectural issue. The proposed `zTouch Envelope` contains: **Identity, Stable Context, Intent Hints, Trust / Seal, Version** and was intentionally left conceptual rather than a schema. That remains promising.

But the newer Z-PROF architecture now creates a possible overlap. Z-PROF expressly forbids itself from redefining Identity, Evidence, Trust, Policy, Runtime or semantic projection, and treats composition primarily as declarative binding of independently owned capabilities.

Therefore PREP must answer:
> *Is zTouch Envelope truly a new semantic object, or merely a carrier/materialization envelope that references already governed Identity, Context, Evidence, intent vocabulary, trust material and profiles?*

My provisional direction is the latter. Potentially:
```text
zTouch Envelope
  ≠ new semantic ontology

zTouch Envelope
  = bounded carrier-facing composition/
    serialization of independently governed references
```
But this should not be ratified until the overlap audit is complete. This becomes one of ZII-PREP's highest-priority constitutional questions.

### Finding H — CAW Already Gives ZII a Strong Boundary
CAW currently says:
```text
Carrier Capture
  ↓
Gateway
  ↓
Normalize
  ↓
Identity resolution
  ↓
Runtime
```
And explicitly requires the Runtime to remain indifferent to QR, NFC, RFID, BLE or future carriers. ZII therefore should not replace that rule. Instead:
```text
ZII (provides carrier-specific machinery)
  ↓
CAW Gateway/Application (uses appropriate ZII machinery)
  ↓
Runtime (still receives normalized constitutional input)
```
That is a very strong integration boundary.

### Finding I — Repository Reality Supports ZII, but Governance Needs Correction
The current monorepo supports `apps/`, `packages/`, `edge/*`, and `infra`. But the dependency validator still hard-codes the existing CAW-era package graph and treats unknown `@zyppi/*` package dependencies as violations. The generic package-boundary verifier also currently understands architectural layers such as foundation, runtime, contracts, and testing; that vocabulary may not cleanly express a renderer like `qr-svg`.

Therefore ZII-PREP must solve:
```text
platform repository governance
  ↓
CAW package family
ZII package family
future package families
```
Without pretending every new package belongs to CAW. No ZQE package should be created before that decision is documented.

---

## ZII-PREP Workstreams

Rather than six permanent documents, these are sections/workstreams inside one living `ZII-PREP.md`.

| Workstream | Focus | Inputs / Outputs |
| :--- | :--- | :--- |
| **PREP-A** | Evidence & Prior-Work Reconciliation | **Inputs:** zTOUCH/zQR, ZRB/ZPIF, ZyPub/Zync, ZPI/zPIS, ZQE, CAW, Z-PROF, CEngS, repo reality, Council critiques. **Output:** Reconciliation Ledger. |
| **PREP-B** | Constitutional Ownership Audit | For each proposed responsibility: Who already owns this? Does ZII need it? Would ZII duplicate something? Is it infrastructure or constitutional meaning? Owners tested against ZRM, ARM, SIOS, SEC, POL, RI, PRJ, RSN, Z-PROF, CEngS, CAW. |
| **PREP-C** | Golden Question Boundary Audit | Test ZII, Engine, Renderer, Adapter, Capture, Decode, zTOUCH, ZyPub, future ZRB against all six Reality dimensions. |
| **PREP-D** | Repository Readiness Audit | Resolve workspace placement, package metadata, dependency graph authority, boundary tooling, TS references, CI enforcement, conformance infrastructure, release/version boundaries. |
| **PREP-E** | Standards & Sibling Research | Research official standards only where needed for architectural decisions (QR, Data Matrix, NFC/NDEF, RFID/EPC, BLE). Objective: ensure QR does not create a false universal abstraction. |
| **PREP-F** | ZQE Entry Contract | At PREP closure, determine the exact minimum specification needed before `ZQE-M01` can begin. Sibling stress test is mandatory (QR, NFC, RFID, BLE, Data Matrix). |

---

## Preliminary ZII Invariants Emerging from Reconciliation

*These are candidates for PREP testing, not yet ZII law:*

- **ZII-P01 — Interaction Technology Independence:** ZII must not structurally depend on QR.
- **ZII-P02 — Carrier Is Not Identity:** Carrier artifacts never become constitutional Identity.
- **ZII-P03 — Canonical Native Artifact:** Each engine exposes the technically appropriate native artifact.
- **ZII-P04 — Core / Materialization Separation:** Encoding or construction is separable from rendering, writing, broadcasting or device I/O where the technology permits.
- **ZII-P05 — Constitutional Non-Invention:** ZII must not invent Identity, Evidence, Policy, Authority, Trust, Reality or Intent semantics.
- **ZII-P06 — External Standards Authority:** Where a technology is externally standardized, ZII implements the applicable standard rather than redefining it.
- **ZII-P07 — Explicit Profiles:** Deterministic behavior is bounded by explicit engine/profile versions.
- **ZII-P08 — Conformance Is First-Class:** Every engine has independently verifiable conformance requirements.
- **ZII-P09 — Replaceability:** Removing one engine must not invalidate Zyppi's constitutional meaning.
- **ZII-P10 — No First-Engine Privilege:** ZQE may establish patterns but QR-specific concepts may not become generic ZII concepts without sibling validation.

*These are the first hypotheses PREP should attack, not celebrate.*

---

## Immediate Research / Clarification Docket

I see six questions requiring deeper work before ZII-D1:

1. **ZPIF disposition:** Is everything technical absorbed into ZII, or does ZPIF survive as the future certified OEM/device integration subset?
2. **zTouch Envelope:** Is it a legitimate carrier-facing envelope, or does it accidentally duplicate Z-PROF composition, Context, Identity, Evidence or SEC trust constructs?
3. **ZII scope boundary:** Does ZII cover both generation/materialization and capture/decoding, or do these become separate engine capabilities under one umbrella?
4. **Repository authority:** What platform-level mechanism replaces the present hard-coded CAW dependency universe without weakening mechanical boundaries?
5. **Engine contract:** What is truly common across QR, NFC, RFID, BLE and Data Matrix—and what only appears common because QR is first?
6. **ZQE relationship to current CAW:** What minimum integration point allows CAW to use ZQE for GS1 QR without making CAW an owner of ZQE or ZQE aware of GS1?

*These are specific enough to research; none is a generic "future question."*

---

## Council Questions to Prepare

For future Claude/Gemini/Qwen Council review, I would send narrowly separated questions rather than asking them to redesign ZII wholesale. For example:

- **Council Question ZII-CQ-01 — Constitutional Placement:** Given ZRM/RI/SEC/POL/CEngS/CAW/Z-PROF, does ZII require any new constitutional authority to operate as a technical interaction-engine infrastructure, or can it exist entirely as an execution/implementation series under existing law? Identify only concrete ownership conflicts.
- **Council Question ZII-CQ-02 — zTouch Envelope Collision Audit:** Does the proposed Identity + Stable Context + Intent Hints + Trust/Seal carrier envelope create duplicate semantic authority relative to ZRM, Z-PROF, Context, POL and SEC? Classify each field as reference, representation, governed semantic content, or invalid duplication.
- **Council Question ZII-CQ-03 — ZPIF Disposition:** Compare ZPIF's proposed responsibilities with ZII. Identify which should be absorbed into ZII, which remain uniquely physical-device/OEM concerns, and whether a separately named framework remains architecturally justified.
- **Council Question ZII-CQ-04 — First-Engine Privilege Test:** Stress the proposed ZII engine abstraction against QR, Data Matrix, NFC/NDEF, RFID/EPC and BLE. Identify every QR-specific assumption masquerading as a generic engine concept.

*Those are questions worth taking to independent Council members.*

---

## Current Phase Status

```text
ZII-PREP
 │
 ├── A. Evidence register                  STARTED
 ├── B. Prior concept reconciliation       STARTED
 ├── C. Golden Question audit              STARTED
 ├── D. Constitutional ownership audit     NEXT
 ├── E. Repository readiness               PARTIALLY EVIDENCED
 ├── F. Standards/sibling research         PENDING
 └── G. Integrated PREP disposition        PENDING
```

The next proper step is **PREP-B: Constitutional Ownership & Overlap Audit**.

That is where we take every candidate ZII responsibility—engine, renderer, adapter, conformance, touchpoint profile, envelope, publication, device integration, physical capture—and map it explicitly against ZRM, SIOS, SEC, POL, RI, Z-PROF, CEngS and CAW, marking each responsibility:

**OWNED / CONSUMED / REFERENCED / PROHIBITED / OPEN**

That audit should tell us whether the architecture we have sketched is genuinely clean before we begin writing `ZII-001`.
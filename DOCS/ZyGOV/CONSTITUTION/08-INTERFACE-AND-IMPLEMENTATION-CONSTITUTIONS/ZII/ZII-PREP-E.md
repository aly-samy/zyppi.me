# ZII-PREP-E — Sibling Standards Stress Test

| Field | Value |
| :--- | :--- |
| **Status** | COMPLETE FOR PREP PURPOSES — PASS WITH GENERIC MODEL REFINEMENT |
| **Implementation authority** | NONE |
| **Purpose** | Test proposed ZII abstractions against technologies materially different from QR before ZQE is allowed to establish accidental universal assumptions. |

The five stress siblings are:

```text
QR · Data Matrix · NFC/NDEF · RFID/EPC · Bluetooth LE
```

The result is significant:

> **ZII survives the sibling test, but the generic architecture must sit one level above the current ZQE architecture.**
>
> `Payload → Symbol → Renderer` is a valid ZQE pattern.
> It is **not** the universal ZII pattern.

---

## Standards Baseline Used for PREP-E

We are testing against the current official standards landscape as of August 22, 2026.

| Technology | Current architectural reference used |
| :--- | :--- |
| **QR** | ISO/IEC 18004:2024, Edition 4, covering encoding, symbol format, dimensions, error correction, decoding and application parameters. |
| **Data Matrix** | ISO/IEC 16022:2024, Edition 3, covering encodation, symbol formats, dimensions, error correction and decoding. |
| **NFC** | NFC Forum architecture including NDEF, tag types, Digital Protocol, Activities/Profiles, read/write and exchange protocols. NDEF was also adopted internationally as IEC 63652-2:2026. |
| **RFID/EPC** | GS1 EPC Tag Data Standard 2.3.0, current since October 31, 2025; defines EPC representation and Gen2 RFID tag memory contents. |
| **Bluetooth LE** | Bluetooth Core Specification 6.3, currently adopted; BLE advertising uses typed AD structures carried in advertising/scan-response data. |

This is enough for an architectural stress test. It is not enough to implement NFC/RFID/BLE later; those engines will require their complete normative specifications and relevant conformance materials.

---

## Test 1 — Is `Payload → Symbol → Renderer` generic?

### QR
**Yes.**
```text
payload
  ↓
encoder
  ↓
QrSymbol
  ↓
SVG / PNG / print
```
QR is explicitly a matrix symbology with encoding, symbol format, dimensions and error correction.

### Data Matrix
**Also yes.**
```text
payload
  ↓
encoder
  ↓
DataMatrixSymbol
  ↓
vector / raster / print
```
Data Matrix is likewise a two-dimensional matrix symbology built from modules within a finder pattern.

So QR and Data Matrix could tempt us into believing:
```text
Engine
  ↓
Symbol
  ↓
Renderer
```
is universal.

**It is not.**

### NFC
NDEF defines a message/record data format, while separate tag specifications define how NDEF messages are detected, read and written on different NFC Forum tag types. NFC also supports device-to-device protocols and multiple operating modes.

A more accurate shape is:
```text
application material
  ↓
NDEF construction
  ↓
NdefMessage
  ↓
tag/device-specific write protocol
  ↓
physical NFC tag/device
```
No renderer exists.

### RFID/EPC
GS1 TDS does two different things:

```text
identifier / GS1 data
  ↓
EPC encoding
  ↓
binary representation
```

and:

```text
encoded material
  ↓
defined RFID memory layout
  ↓
Gen2 tag
```

TDS covers EPC representation, User Memory, control information and tag-manufacture information.

Again, no useful universal notion of "renderer."

### BLE
BLE advertising consists of typed Advertising Data structures, sent in advertising or periodic-advertising events. Actual broadcast is temporal radio behavior.

Conceptually:
```text
application data
  ↓
AD structure construction
  ↓
Advertising Data
  ↓
controller/platform configuration
  ↓
repeated radio advertising events
```
A BLE advertisement is not a static rendered symbol.

### PREP-E Finding
**FAIL as generic abstraction.**

Keep `Symbol` and `Renderer` inside optical-symbol engines such as ZQE/Data Matrix.

**Do not promote them into ZII.**

---

## Test 2 — Does Canonical Technical Artifact survive?

**Yes. Strongly.**

But it must remain deliberately broad.

| Technology | Plausible native technical artifact |
| :--- | :--- |
| QR | `QrSymbol` |
| Data Matrix | `DataMatrixSymbol` |
| NFC | `NdefMessage`, tag encoding representation |
| RFID/EPC | EPC binary representation, memory-layout representation |
| BLE | Advertising Data / typed AD structures |

The artifact need not be visual.
It need not even describe the whole physical interaction.

For BLE, for example, the artifact can describe the bytes/structures to advertise while a separate adapter controls actual radio transmission.

For NFC, the `NdefMessage` can remain an immutable technical artifact even though the physical tag it is eventually written to is mutable.

### PREP-E Finding
**PASS.**

The generic term:
> **Canonical Technical Artifact**

survives.

But:
> *A Canonical Technical Artifact is the deterministic technical representation produced or consumed by an engine operation. It is not necessarily a symbol, file, physical medium, transmission, or constitutional Representation.*

---

## Test 3 — Can every ZII engine be a pure function?

**Not completely.**

The stronger distinction is:

```text
PURE TECHNICAL LOGIC
      │
      ▼
canonical artifact
      │
      ▼
I/O ADAPTER / PHYSICAL MECHANISM
```

- QR encoding can be pure.
- Data Matrix encoding can be pure.
- NDEF message construction can be pure.
- EPC encoding can be pure.
- BLE advertising-data construction can be pure.

**But:**
- write NFC tag
- write RFID memory
- broadcast BLE
- capture RF signal
- read physical tag
- print QR label

cannot be pure because they interact with physical/device state.

NFC's own specifications deliberately separate data format from tag-type read/write behavior and communication protocols.

### PREP-E Finding
The earlier principle:
> *"ZII engine core is pure."*

is **too strong** as a universal statement.

**Replace with:**
> *ZII SHALL separate deterministic technical transformation from I/O and physical interaction wherever the technology permits such separation.*

For ZQE, the stronger rule remains valid:
```text
qr-core = pure
```
But QR does not get to impose that exact internal decomposition on every future sibling.

---

## Test 4 — Does deterministic output survive?

**Yes, but only when scoped to deterministic technical transformations.**

For ZQE:
```text
same exact payload
same zqe profile
  →
same QrSymbol
```
remains excellent.

A deterministic NDEF serializer could similarly produce the same message bytes under the same explicit serialization profile.

An EPC translator can deterministically produce a given standard representation under an explicit encoding scheme.

**But:**
```text
same BLE broadcast request
  ≠
same physical radio observations
```

And:
```text
same NFC write request
  ≠
same physical outcome
```
because physical state, hardware, timing and environment are involved.

### PREP-E Finding
Refine ZII determinism to:

> *Same technical input + same explicit engine profile/version → same canonical technical artifact, where the underlying standard and operation permit deterministic construction.*

And separately:

> *ZII SHALL NOT extend artifact determinism into claims of deterministic physical delivery, capture, or effect.*

This aligns directly with PREP-B.

---

## Test 5 — Is there always one engine operation called `encode()`?

**No.**

This is another QR assumption.

Across our siblings we encounter:

| Technology | Natural operations |
| :--- | :--- |
| QR | `encode`; perhaps `decode` externally |
| Data Matrix | `encode` / `decode` |
| NFC | construct/serialize NDEF; read; write; exchange |
| RFID | encode/decode; translate; read/write tag memory |
| BLE | construct/parse advertising data; broadcast; scan; connect/exchange in broader profiles |

NFC Forum itself separates NDEF data format, tag read/write specifications, SNEP exchange, TNEP and connection handover.

### PREP-E Finding
ZII should not define one universal `Engine.encode()` interface.

Instead, an engine family should expose explicit technical operations appropriate to its standards and declare which operations it supports.

This connects directly to PREP-B's proposed:
> **Engine Support Manifest**

rather than constitutional Capability.

A future engine might support:
```text
CONSTRUCT
PARSE
ENCODE
DECODE
READ
WRITE
BROADCAST
SCAN
```
Those names are illustrative, not yet a frozen ZII vocabulary.

The important rule is:
> *An engine advertises supported technical operations; ZII does not pretend all interaction technologies have the same operation surface.*

---

## Test 6 — Does the renderer abstraction survive?

**No.**

Renderer is an optical/display concern.

What does survive is a broader distinction between:
```text
canonical artifact
```
and:
```text
environmental realization
```

For QR:
```text
QrSymbol
  ↓
SVG renderer
```

For NFC:
```text
NdefMessage
  ↓
tag writer
```

For RFID:
```text
memory representation
  ↓
RFID encoder/writer
```

For BLE:
```text
Advertising Data
  ↓
radio/platform broadcaster
```

The generic ZII term should therefore not be `Renderer`.

Candidate umbrella:
- `Output Adapter`
- or perhaps: `Materialization Adapter`

But PREP-E does not freeze the final name, because BLE broadcasting is arguably transmission rather than materialization.

What we can freeze for PREP purposes is the conceptual distinction:

```text
Technical Artifact
      ≠
its delivery into an environment
```

---

## Test 7 — Is there a symmetric input side?

**Yes, and this is something QR-generation-first thinking was underweighting.**

For every output path there may be an acquisition path:

```text
PHYSICAL / EXTERNAL MECHANISM
      ↓
acquisition adapter
      ↓
captured technical data
      ↓
parser / decoder
      ↓
Canonical Technical Artifact
or decoded material
```

Examples:
- camera → QR decode
- NFC controller → NDEF read
- RFID reader → EPC memory data
- BLE scanner → Advertising Data

This supports the original ZRB observation that Zyppi needs to think in both outward and inward directions, without moving constitutional Reality admission into ZII.

### PREP-E Finding
ZII is not merely a generation infrastructure.

**It is an interaction infrastructure.**

ZQE may initially implement only the construction side, but the umbrella must permit both.

---

## Test 8 — Can we assume one-shot interaction?

**No.**

QR and Data Matrix commonly behave as stable static symbols.

NFC may involve read/write exchanges or bidirectional protocols; TNEP explicitly enables bidirectional NDEF exchange for relevant tag/device types.

BLE is even clearer: advertising occurs through repeated advertising events, and Bluetooth encompasses many stateful connection and profile behaviors.

Therefore:
```text
input → output
```
cannot be the only ZII interaction model.

ZII must eventually accommodate:
- one-shot construction
- one-shot acquisition
- repeated emission
- repeated observation
- stateful exchange

without forcing them into one universal lifecycle.

### PREP-E Finding
ZII Engine ≠ necessarily one-shot codec.

This does not mean ZQE needs stateful machinery.

Quite the opposite: **keep ZQE simple because its standard permits it.**

---

## Test 9 — Does Profile survive?

**Very strongly.**

Each sibling demonstrates the need for explicit technical configuration/version boundaries.

- QR has user-selectable application parameters.
- NFC explicitly has Activities combined into Profiles, and separate profiles define particular communication use cases.
- RFID/EPC has multiple EPC schemes and evolving TDS/TDT versions.
- Bluetooth has a vast ecosystem of Core versions, services and profiles; Core 6.3 is currently adopted.

But the word is overloaded inside Zyppi because Z-PROF also uses profile semantics.

### PREP-E Finding
ZII needs the concept, but it should qualify it:

> **Technical Engine Profile**

For example:
```text
ZQE Technical Engine Profile: zqe/1
```

This is fundamentally different from:
- Z-PROF Domain Profile
- Bluetooth Profile
- NFC Forum Profile

External standards retain their own nomenclature.

---

## Test 10 — Does conformance survive as a universal concern?

**Yes. This is one of the strongest generic abstractions.**

- ISO's QR and Data Matrix specifications define the relevant symbology rules.
- NFC Forum maintains specifications covering digital protocols, data exchange, tag types and conformance-oriented interoperability.
- GS1 exposes TDS/TDT standards and even machine-readable normative TDT artefacts for translation.
- Bluetooth publishes the Core specification together with test suites, Implementation Conformance Statements and Test Case Reference Lists.

### PREP-E Finding
This survives almost unchanged:

> *Every ZII engine family must declare its external standards authority, its supported technical profile/version, and the conformance evidence required to claim support.*

This is a genuine ZII family rule.

---

## Test 11 — Does one canonical artifact per engine survive?

**Not necessarily.**

This needs refinement.

ZQE may have one excellent artifact:
```text
QrSymbol
```

But an NFC implementation might naturally expose:
```text
NdefMessage
TagEncodingPlan
```

An RFID implementation could expose:
```text
EpcEncoding
TagMemoryLayout
```

BLE might expose:
```text
AdvertisingData
AdvertisingConfiguration
```

Therefore:
> *An engine family may define one or more canonical technical artifact types.*

Do not force everything into:
```text
UniversalInteractionArtifact
```
That would recreate exactly the false abstraction PREP-E is meant to prevent.

---

## Test 12 — Is "carrier" itself universally correct?

**Not quite.**

QR/Data Matrix are naturally described as data carriers.

NFC tags and RFID tags can also function as carriers.

But BLE is a communication technology/protocol ecosystem, not merely a passive carrier; NFC itself spans reader/writer, card emulation, peer-to-peer, exchange protocols, and wireless charging.

Therefore our decision to use:
> **Zyppi Interaction Infrastructure**

rather than:
> **Carrier Infrastructure**

is validated.

### PREP-E Finding
**PASS.**

"Interaction" is broad enough to include:
- static codes
- tag memory
- proximity exchange
- radio broadcasting
- future mechanisms

without pretending all are equivalent.

---

## Sibling Comparison Matrix

| Property | QR | Data Matrix | NFC/NDEF | RFID/EPC | BLE |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Pure construction possible | Yes | Yes | Yes for message construction | Yes for encoding | Yes for AD construction |
| Native symbol | Yes | Yes | No | No | No |
| Native structured artifact | Yes | Yes | Yes | Yes | Yes |
| Renderer required | Often | Often | No | No | No |
| Physical writer possible | Print/display | Print/mark | Yes | Yes | No tag writer equivalent for advertising |
| Broadcast/transmit | No | No | Possible protocols | RF interrogation/response | Yes |
| Capture/read operation | Camera/scanner | Camera/scanner | Yes | Yes | Scan |
| Mutable physical medium | Printed generally no | Printed generally no | Often | Often | Not applicable in same sense |
| Stateful exchange possible | No at symbol level | No at symbol level | Yes | Reader/tag protocol interactions | Yes |
| Repeated emission intrinsic | No | No | Not baseline NDEF | Reader-dependent | Yes |
| Standards profile/version important | Yes | Yes | Strongly | Strongly | Strongly |
| Conformance/interoperability essential | Yes | Yes | Yes | Yes | Yes |

That table is the reason the generic architecture must be broader than ZQE.

---

## The Generic ZII Model After PREP-E

The earlier candidate:
```text
Input
  ↓
Engine
  ↓
Canonical Technical Artifact
  ↓
Materializer / Adapter
```
was close but still a little too linear.

The sibling-safe model is now:

```text
ZII ENGINE FAMILY
│
├──────────────┼──────────────┐
│              │              │
▼              ▼              ▼
Technical Logic   Artifact Types   Profiles
│
┌─────┴─────┐
│           │
construct     interpret
encode        parse/decode
│           │
└─────┬─────┘
      ▼
Canonical Technical Artifacts
│
┌───────┴────────┐
▼                ▼
Output Adapters   Input Adapters
render/write/     capture/read/
broadcast/etc.    scan/etc.
│                │
└───────┬────────┘
        ▼
External / Physical Mechanism

Cross-cutting:
  Technical Engine Profiles
  Conformance
  Diagnostics
  Interoperability
  Benchmarks
```

This is conceptual, not yet a ZII interface specification.

Most importantly:
> *An engine family uses only the branches relevant to its technology.*

- ZQE does not need a BLE-shaped API.
- BLE does not need a Symbol.

---

## ZQE Remains Beautifully Simple

Nothing in PREP-E weakens the ZQE architecture.

It actually protects it.

ZQE can remain:
```text
Exact payload
  ↓
ZQE QR Core
  ↓
QrSymbol
  ↓
SVG renderer
```

with:
```text
qr-core   = pure
QrSymbol  = immutable canonical technical artifact
qr-svg    = deterministic renderer
```

The difference is simply that ZII no longer declares those QR-specific properties universal.

This is exactly what *"first implementation, no first-engine privilege"* was meant to achieve.

---

## What Data Matrix Teaches Us About Future Reuse

Data Matrix is the closest sibling to ZQE.

It suggests a future engine may reuse patterns developed by ZQE:
- segmentation/encoding pipeline discipline
- canonical module representation principles
- vector renderer infrastructure
- conformance harness patterns
- property-based testing infrastructure

But it must not simply reuse:
- `QrSymbol`
- QR mask logic
- QR ECC assumptions
- QR finder-pattern semantics
- QR version semantics

because ISO/IEC 16022 defines its own symbology rules.

This is a useful distinction:
> *ZII may standardize engineering patterns without standardizing technology semantics.*

---

## What NFC Teaches Us

NFC is perhaps the most valuable sibling in this stress test because it breaks several QR assumptions simultaneously.

NFC has:
- a common NDEF data format;
- standardized record types;
- multiple tag types;
- tag detection/read/write procedures;
- device communication protocols;
- profiles and activities;
- bidirectional exchange possibilities;
- handover to Bluetooth/Wi-Fi.

It therefore proves that a future ZII engine may actually be a family of closely related technical components, rather than one encoder package.

Potentially:
```text
nfc-ndef
nfc-tag
nfc-platform-adapter
```
rather than one giant `nfc-engine`.

That is an important future lesson for package granularity.

---

## What RFID Teaches Us

RFID/EPC proves that:
```text
semantic identifier representation
```
and:
```text
physical tag memory representation
```
can be different technical layers.

GS1 TDS explicitly covers both EPC representation and memory contents of Gen2 RFID tags.

It also reinforces PREP-B:
> *ZII may perform technical translation/encoding under an external standard without thereby owning the domain semantics of the GS1 identifier.*

This makes the ZQE rule:
> *GS1-unaware QR engine*

even more important.

---

## What BLE Teaches Us

BLE is the strongest anti-QR stress case.

It demonstrates:
```text
interaction
  ≠
static carrier
```

and:
```text
canonical technical artifact
  ≠
physical result
```

Advertising Data is structured into typed AD structures, but its physical realization is repeated radio events.

Thus the engine might deterministically build:
```text
AdvertisingData
```
while the adapter performs:
```text
broadcast over time
```
and another adapter performs:
```text
scan
```

The physical observations remain environment-dependent.

This confirms our PREP-B distinction between deterministic technical artifact generation and physical effects/observations.

---

## Generic Concepts That Survive PREP-E

The stress test leaves a relatively small but strong common vocabulary:

| Candidate ZII concept | Result |
| :--- | :--- |
| Interaction Engine Family | **SURVIVES** |
| Technical Engine Profile | **SURVIVES** |
| Canonical Technical Artifact | **SURVIVES**, plural allowed |
| Pure technical transformation | SURVIVES where applicable, not mandatory universally |
| Input Adapter | SURVIVES conceptually |
| Output Adapter | SURVIVES conceptually |
| Conformance | **STRONGLY SURVIVES** |
| Interoperability | **STRONGLY SURVIVES** |
| Diagnostics / inspectability | SURVIVES |
| Technical Support Manifest | SURVIVES |
| Symbol | ENGINE-SPECIFIC |
| Renderer | ENGINE-SPECIFIC / optical family |
| `encode()` universal method | **REJECTED** |
| One canonical artifact only | **REJECTED** |
| One-shot pipeline | **REJECTED** |
| Universal pure engine | **REJECTED** |
| Universal carrier model | **REJECTED** |

This is the core output of PREP-E.

---

## Candidate ZII Invariants Produced by PREP-E

These now deserve consideration for the eventual ZII foundation:

| ID | Invariant |
| :--- | :--- |
| **ZII-E01** | **No First-Engine Privilege.** No QR-specific construct becomes generic merely because ZQE is first. |
| **ZII-E02** | **Native Artifact Principle.** Every engine family defines the technically appropriate artifact type or types for its standards; ZII shall not impose a universal artifact schema. |
| **ZII-E03** | **Operation Plurality.** Engine families expose only the technical operations their standards require; ZII shall not mandate a universal `encode()` lifecycle. |
| **ZII-E04** | **Logic / Environment Separation.** Deterministic technical logic shall be separated from device/network/physical I/O where practicable. |
| **ZII-E05** | **Scoped Determinism.** Determinism applies to canonical technical transformation, not automatically to delivery, capture, radio propagation, physical writing or observed effect. |
| **ZII-E06** | **Adapter Symmetry.** ZII may support both outward realization and inward acquisition without assuming every engine requires both. |
| **ZII-E07** | **Profile Explicitness.** Standards version, Technical Engine Profile and higher payload/domain protocol versions remain distinguishable. |
| **ZII-E08** | **External Semantic Authority.** Implementing a standards-defined representation does not transfer ownership of that standard's domain meaning to ZII. |
| **ZII-E09** | **Conformance First.** Standards and interoperability evidence are first-class requirements of every engine family. |
| **ZII-E10** | **Interaction, Not Carrier.** ZII shall remain broad enough for static, writable, broadcast, bidirectional and future interaction technologies. |

---

## PREP-E Effect on Our Original ZII Wording

Earlier we described ZII as infrastructure through which Zyppi:
> *creates, encodes, renders, transmits, captures, inspects and validates interaction mechanisms.*

That remains directionally good, but PREP-E suggests an even cleaner formulation:

> *Zyppi Interaction Infrastructure is the standards-aware technical infrastructure through which Zyppi **constructs, represents, realizes, acquires, interprets, inspects and validates** interactions across present and future technical mechanisms.*

**Why these verbs?**

| Verb | Coverage |
| :--- | :--- |
| **construct** | covers QR encoding, NDEF construction, EPC encoding, BLE AD building |
| **represent** | covers native technical artifacts |
| **realize** | covers render/write/broadcast without pretending all are rendering |
| **acquire** | covers scan/read/capture |
| **interpret** | means technical parse/decode, not constitutional meaning |
| **inspect / validate** | covers diagnostics and conformance |

This is a PREP candidate, not yet the ratified ZII definition.

### One Important Terminology Caution

`interpret` must remain explicitly technical.

PREP-B already established:
> *Parsing is not semantic Translation.*

Therefore future ZII wording should probably say:
> **technical interpretation**

whenever ambiguity exists.

For example:
```text
BLE bytes → typed AD structures
```
is ZII technical interpretation.

```text
those structures mean that Subject X has constitutional Capability Y
```
is **not**.

---

## Research Limitation and Implementation Consequence

PREP-E used official public summaries and current standards metadata. For QR and Data Matrix, ISO publicly exposes the scope but the normative standard text is commercially licensed. NFC Forum exposes extensive architecture summaries but many full technical specifications are similarly licensed.

That is sufficient for today's abstraction stress test.

It is **not** sufficient to implement an NFC, Data Matrix or future BLE engine.

Each future engine must acquire/use its full normative source set before its own implementation specification is frozen.

For ZQE specifically, the normative QR conformance baseline remains its own ZQE preparation responsibility.

---

## PREP-E Closure Verdict

**PREP-E PASSES.**

The Sibling Test has done what it was supposed to do: it found several QR-derived false abstractions before they entered ZII.

The most important correction is:

```text
ZQE PATTERN
Payload → Encoder → QrSymbol → Renderer

is valid and should remain.

But the ZII pattern is broader:

ENGINE FAMILY
      │
      technical operations
      │
      ▼
native technical artifacts
      │
      ┌──────────┴──────────┐
      ▼                     ▼
outward adapters       inward adapters
render/write/broadcast    capture/read/scan
      │                     │
      └──────────┬──────────┘
                 ▼
      interaction environment

cross-cut by:
  Technical Engine Profiles
  Standards Authority
  Conformance
  Interoperability
  Diagnostics
```

That means ZQE is now structurally positioned exactly as intended:

> *first implementation, first proving ground, but not the template that every future interaction technology must imitate.*

---

## Program Consequence

With PREP-E closed, **PREP-F — ZQE Entry Contract** is now unblocked.

It can consolidate PREP-A through PREP-E into the exact architectural and quality contract that must exist before:
- the first ZQE implementation mandate, and
- the Repository Governance Transition is executed.
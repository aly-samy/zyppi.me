# ZII-PREP-B — Constitutional Ownership Audit

| Field | Value |
| :--- | :--- |
| **Status** | COMPLETE FOR PREP PURPOSES |
| **Implementation authority** | NONE |

---

## Executive Result

> **ZII does not require new constitutional sovereignty to perform its core mission.**  
> Its legitimate ownership is technical interaction infrastructure. Existing Zyppi authorities already own Reality, Identity, Event/Evidence, Trust, Policy, constitutional execution, domain composition, and application-level resolution.

That conclusion is strongly supported by the corpus:
- **ZRM** makes Reality and Representation distinct and technology-independent; a QR symbol, NFC record, BLE frame, or similar artifact is therefore a Representation, never Reality itself.
- **SEC** assigns policy logic to POL and explicitly says transport alone never establishes constitutional trust.
- **RI** explicitly excludes compiler behavior, experience rendering, SDK implementation, and infrastructure from Runtime ownership.
- **CAW** already establishes the critical carrier boundary: carrier-specific parsing occurs before the carrier-blind Runtime.

---

## PREP-B Classification Vocabulary

For this audit:

| Classification | Meaning |
| :--- | :--- |
| **OWNED BY ZII** | ZII may define the technical contract/behavior |
| **CONSUMED BY ZII** | ZII may receive/use the artifact but does not own its meaning |
| **REFERENCED BY ZII** | ZII must respect the external authority without implementing its semantics |
| **PROHIBITED TO ZII** | ZII must not define, infer, or decide this meaning |
| **DEFERRED** | Legitimate issue, but owned by a later architectural investigation |

---

## Master Constitutional Ownership Matrix

| Responsibility | PREP-B classification | Existing authority | Decision |
| :--- | :--- | :--- | :--- |
| QR/Data Matrix/NFC/RFID/BLE encoding algorithms | **OWNED BY ZII** | External technology standards + CEngS | ZII may implement standards-bound technical algorithms |
| Carrier decoding algorithms | **OWNED BY ZII** | External standards + CEngS | Technical decode only |
| Native engine artifact (QrSymbol, NDEF representation, BLE frame, etc.) | **OWNED BY ZII** | CEngS subordinate | Technical Representation only |
| Renderers / serializers | **OWNED BY ZII** | CEngS | SVG, binary serialization, print representation, etc. |
| Diagnostic / explainability trace of encoding | **OWNED BY ZII** | CEngS | Technical explanation, not constitutional explanation |
| Engine profile/version contract | **OWNED BY ZII** | CEngS | e.g. `zqe/1`; independent of payload semantics |
| Standards conformance suite | **OWNED BY ZII** | External standards + CEngS | Technical conformance only |
| Interoperability tests | **OWNED BY ZII** | CEngS | Cross-engine/device/decoder testing |
| Performance benchmarks | **OWNED BY ZII** | CEngS | No constitutional meaning |
| Technical engine error taxonomy | **OWNED BY ZII** | constrained by CEngS | Explicit deterministic failures |
| Supported technical features | **OWNED BY ZII** | ZII | Use Support/Feature Manifest, not constitutional Capability |
| Device driver / writer / broadcaster mechanics | **OWNED BY ZII** technically | CEngS / Infrastructure | May perform I/O; does not establish constitutional meaning |
| Camera/NFC/RFID/BLE capture mechanics | **OWNED BY ZII** technically | CAW Gateway precedent / CEngS | Capture and parse technology-specific input |
| Technical carrier provenance | **OWNED/CONSUMED** narrowly | ZRM/SEC downstream | ZII may preserve raw device/process metadata, not decide its evidentiary weight |
| Identity semantics | **PROHIBITED TO ZII** | ZRM | ZII may carry an identifier as bytes; never define Identity |
| Referent semantics | **PROHIBITED TO ZII** | ZRM | Same |
| Touchpoint constitutional meaning | **PROHIBITED / REFERENCED** | ZRM-005 | zTOUCH may build on it; ZII must not redefine it |
| Event semantics | **PROHIBITED TO ZII** | ZRM | Physical/digital operation does not let ZII declare constitutional Event truth |
| Evidence semantics | **PROHIBITED TO ZII** | ZRM/SIOS | ZII outputs may later support Evidence; ZII does not decide Evidence truth |
| Current Reality/state | **PROHIBITED TO ZII** | ZRM | Encoded information may be stale or false |
| Place/context meaning | **PROHIBITED / CONSUMED** | ZRM / Z-PROF / relevant profiles | ZII may transport data but not determine Context |
| Intent semantics | **PROHIBITED TO ZII** | ZRM semantic architecture | No free-standing ZII Intent system |
| Intent authorization | **PROHIBITED TO ZII** | POL | Intent hints cannot authorize action |
| Policy evaluation | **PROHIBITED TO ZII** | POL | POL owns authorization/policy decisions |
| Constitutional Capability decisions | **PROHIBITED TO ZII** | POL/SEC | Technical feature support must remain distinct |
| Trust | **PROHIBITED TO ZII** | SEC | Never emit `trusted=true` as constitutional conclusion |
| Attestation meaning / security standing | **PROHIBITED TO ZII** | SEC | ZII may transport or technically validate crypto material only |
| Cryptographic implementation mechanics | **POTENTIALLY OWNED BY PROFILE** | implementation profile | SEC deliberately does not prescribe algorithms; profile may |
| Runtime execution | **PROHIBITED TO ZII** | RI | ZII is not Constitutional Runtime |
| Execution Receipt | **PROHIBITED TO ZII** | RI | ZII may generate technical generation records, not RI receipts |
| Replay/degraded constitutional execution | **PROHIBITED TO ZII** | RI | Physical transport replay protection may be technical, but constitutional replay remains RI |
| Domain translation | **PROHIBITED TO ZII** | SIOS | Carrier parsing ≠ domain-semantic translation |
| Constitutional composition/domain binding | **PROHIBITED TO ZII** | Z-PROF | ZII cannot become a composition engine |
| GS1 semantics | **REFERENCED / CONSUMED** | GS1 + Z-PROF/application | ZQE sees payload, not GS1 meaning |
| ZPI/zPIS addressing semantics | **REFERENCED / CONSUMED** | future ZPI/zPIS | ZII may encode an address but does not own it |
| zTOUCH semantics | **ADJACENT / NOT ZII CORE** | future zTOUCH | Potential higher interaction-profile layer |
| ZyPub publication semantics | **ADJACENT / NOT ZII CORE** | future ZyPub | Can consume ZII engines |
| Zync connected-resolution semantics | **OUTSIDE ZII** | future Zync/resolution architecture | Orthogonal |
| Physical-observation constitutional admission | **DEFERRED** | candidate future ZRB | ZII provides mechanics, not admission authority |
| Physical-actuation constitutional admission/proof | **DEFERRED** | candidate future ZRB + ZRM/SEC/POL/RI | ZII can actuate technically, but cannot prove Reality changed |
| OEM/manufacturer certification ecosystem | **DEFERRED** | future ZII/ZPIF investigation | Not initial ZII scope |

This largely confirms the responsibility split already hypothesized in the ZRB/ZPIF exploration, which assigned Reality/Event/Evidence to ZRM, trust/security to SEC, policy to POL, Runtime execution to RI, and technical interface mechanics to the implementation framework.

---

## The Constitutional Shape of ZII

The audit supports this boundary:

```text
EXISTING CONSTITUTIONAL / SEMANTIC AUTHORITY
────────────────────────────────────────────
ZRM        Reality · Identity · Event · Evidence
SIOS       Translation / information architecture
SEC        Trust · Attestation · Security
POL        Policy · Authorization · Capability decisions
Z-PROF     Governed composition / domain binding
RI         Constitutional execution / receipts / replay
────────────────────────────────────────────
                    │
                    │ governed inputs / references
                    ▼
────────────────────────────────────────────
ZII — TECHNICAL INTERACTION INFRASTRUCTURE
────────────────────────────────────────────
Engines
Encoding / decoding
Canonical technical artifacts
Renderers
Technical adapters
Device I/O
Conformance
Diagnostics
Versioned engine profiles
Interoperability
────────────────────────────────────────────
                    │
                    │ physical/digital mechanisms
                    ▼
QR · NFC · RFID · BLE · Data Matrix · future
```

The constitutional direction is intentionally one-way:  
> **ZII may materialize or observe governed representations. It does not create their constitutional meaning.**

This follows ZRM's rule that Representations may be accurate, incomplete, conflicting, obsolete, or false and must never be treated as Reality itself.

---

## Golden Question Ownership Audit

The Golden Question is useful precisely because it exposes what ZII must not infer.

| ZII component | Who | Did what | To whom/what | Where | When | How do we know |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Pure encoder** | unknown | technically encoded bytes | supplied payload | unknown | unknown | deterministic technical result |
| **Renderer** | unknown | rendered technical artifact | supplied symbol | unknown | unknown | deterministic renderer result |
| **Decoder** | unknown | decoded observed carrier | carrier/signal | unknown unless externally supplied | unknown unless supplied | decoder result only |
| **Capture adapter** | may preserve device ref | captured signal | observed carrier | may preserve raw location metadata | may preserve capture time | raw provenance, not constitutional Evidence automatically |
| **Writer/printer adapter** | caller supplied externally | attempted physical write/print | physical target supplied externally | may preserve device/site metadata | operation time | technical result only |
| **BLE broadcaster** | caller supplied externally | emitted frame | local radio environment | device location if supplied | transmission time | technical telemetry only |
| **Conformance harness** | irrelevant | tested implementation | engine/artifact | test environment | test run | technical proof of conformance |
| **ZQE** | none constitutionally | encoded payload → QrSymbol | no Referent inferred | none | none | exact deterministic reconstruction |

The key constitutional rule remains:  
> *Observation acquires Evidence; Reality is not created by observation, and a Representation never becomes Reality merely because a device produced it.*

---

## Critical Physical-Effect Boundary

PREP-B resolves the Qwen concern about physical actuation more precisely.

There are three different classes of operation:

### A. Representation Transformation
```text
payload → QrSymbol → SVG
```
No physical Reality claim required.

### B. Technical I/O
```text
NDEF bytes → NFC writer
BLE frame  → radio broadcaster
SVG        → printer command
```

### C. Constitutional Physical Claim
```text
"NFC tag X was successfully written"
"Label Y is physically attached to Product Z"
"Door physically opened"
"Robot moved Object A"
```

> **ZII may own A and the mechanics of B.**  
> **It does not own the constitutional truth of C.**

The earlier ZRB exploration states the rule correctly: a command and proof that its physical effect occurred are different things; device `success: true` does not automatically establish constitutional Reality.

Therefore the outbound long-term architecture remains:

```text
POL / RI authorized outcome
      ↓
Application orchestration
      ↓
ZII technical adapter
      ↓
physical device
      ↓
physical effect
      ↓
observation / provenance
      ↓
future ZRB admission boundary
      ↓
ZRM Event / Evidence
```

ZRB remains deferred; ZII does not need it to build ZQE. The original ZRB proposal itself explicitly says current GS1 QR interaction does not require generalized ZRB/ZPIF infrastructure.

---

## Inbound Observation Boundary

The mirror direction is equally important:

```text
Physical carrier / signal
      ↓
ZII capture adapter
      ↓
technology-specific decode
      ↓
technical payload + raw provenance
      ↓
Application / Gateway
      ↓
constitutional admission / resolution
      ↓
Runtime
```

CAW already proves this pattern. Its carrier capture lives in the Gateway, normalization/identity resolution in Application, while Evidence/Runtime/Policy/Receipt remain carrier-blind downstream.

This means:
- A ZII decoder can say *"these bytes were decoded."* It cannot say *"this Identity is authentic."*
- A ZII camera adapter can say *"this signal/image was captured."* It cannot say *"the claimed Event is constitutionally proven."*

That separation should become a permanent ZII invariant candidate.

---

## Policy and Capability Boundary

This audit produces an important vocabulary correction.

SEC explicitly states that POL-001 exclusively governs authorization rules, policy evaluation, capability decisions, and policy lifecycle.

Therefore ZII should avoid calling this:
```typescript
CapabilityManifest
```
for a simple declaration such as:
```text
supportsQrModel2
supportsEci
supportsNdefUri
supportsBleAdvertising
```

That invites collision with constitutional Capability.

**Preferred working terminology:**
```typescript
EngineSupportManifest
// or:
FeatureManifest
```

Then:
```text
Technical support:
"this engine can encode ECI"

      ≠

Constitutional capability:
"this Subject is authorized to perform action X"
```

This distinction should move forward into PREP-D and eventual ZII vocabulary.

---

## Trust and Cryptography Boundary

SEC creates a particularly useful separation.

SEC owns constitutional trust, identity integrity, attestation, revocation, and security invariants. But SEC deliberately does not prescribe signature algorithms, hash functions, encryption standards, key exchange, OAuth/JWT/TLS, or implementation infrastructure; those belong to implementation profiles.

Therefore ZII can eventually contain technical machinery such as:
- verify signature bytes
- compute hash
- parse certificate structure
- validate frame MAC

when an authorized carrier/profile requires it.

But its output must remain technical:
```text
signatureValid = true
```
**not** constitutional:
```text
trusted = true
```

The zTOUCH exploration itself reached the same conclusion: cryptographic signatures can prove integrity/issuer properties but do not automatically prove current authority or physical-instance authenticity.

---

## Runtime Boundary

RI gives us perhaps the strongest confirmation that ZII is outside the Constitutional Runtime.

RI-006 explicitly says Runtime does not define:
- compiler behavior;
- policy logic;
- experience rendering;
- SDK implementation;
- user interface behavior;
- infrastructure deployment.

And RI summarizes itself as executing constitutional truth without defining or creating constitutional authority.

Therefore:
- ZQE encoder
- SVG renderer
- NFC serializer
- BLE packet builder
- RFID encoder

**must not be placed inside Runtime merely because some are pure/deterministic.**

> *Purity does not equal Runtime membership.*

---

## Z-PROF / SIOS Boundary

Z-PROF is also cleanly separated.

It may declare required information and bind governed constitutional capabilities, but it does not become Evidence authority, authorization authority, projection engine, data-access layer, or universal Translation Layer. SIOS Translation Layers remain responsible for translating external/domain language into constitutional concepts.

Therefore:
```text
ZII decoder:
GS1 URI bytes → parsed technical structure

      does not imply:

ZII:
GS1 concept → constitutional semantic meaning
```

That latter operation belongs to existing translation/domain/profile architecture.

This is important for ZQE:
> **ZQE may encode a GS1 Digital Link without understanding a single GS1 business concept.**

---

## Domain-Specific Ownership Results

### zTOUCH Ownership Result
PREP-B confirms that zTOUCH cannot be part of ZII core semantics.

The exploratory document itself correctly says Touchpoint already exists in Zyppi and zTOUCH should enrich the Touchpoint→Identity boundary rather than create another primitive.

Therefore:
```text
zTOUCH  =  possible higher interaction profile/protocol family
ZII     =  technical engine infrastructure
```

The proposed *zTouch Envelope* remains unresolved and moves to PREP-C, because its Identity, Context, Intent Hints, and Trust/Seal fields risk duplicating existing constitutional ownership.

PREP-B does, however, establish one rule for PREP-C:
> *Any surviving zTouch Envelope must contain representations/references to governed concepts, never redefine them.*

### ZyPub / Zync Ownership Result
PREP-B confirms the earlier disposition:
```text
Zync    =  connected/reference acquisition concept
ZyPub   =  bounded direct-publication concept
ZII     =  carrier/interaction machinery either may use
```

The ZyPub proposal already insists that the transport can change while semantics remain canonical, and that physical carrier mechanics terminate before Runtime.

Thus neither ZyPub nor Zync belongs inside the ZII engine contract.

### ZPIF Ownership Result
PREP-B materially advances the ZPIF question.

The technical core of ZPIF is redundant with ZII:
- adapters
- module interfaces
- protocol integration
- SDK support
- technical manifests
- conformance
- compatibility tooling

Those can ultimately live under ZII.

However, this part remains distinct and deferred:
- manufacturer enrollment
- device certification
- operational attestation
- device trust lifecycle
- revocation
- "Zyppi Ready" ecosystem

because those concerns cross SEC, POL, Identity, Registry, and potentially future ZRB responsibilities. The exploratory ZPIF proposal itself separates certification eligibility from runtime trust.

**PREP-B disposition:**
- ZPIF as a general technical framework: **ABSORB INTO ZII.**
- ZPIF as an OEM/certified physical-device ecosystem: **DEFER**, name not yet retired.

That question no longer blocks core ZII/ZQE.

---

## PREP-B Constitutional Invariants Promoted for Further Testing

The audit supports strengthening several earlier hypotheses:

- **ZII-B01 — Technical Sovereignty Only**  
  ZII owns interaction mechanics, not constitutional meaning.

- **ZII-B02 — Representation Never Becomes Reality**  
  No carrier artifact or decoded payload is Reality merely by existing.

- **ZII-B03 — Carrier Is Not Identity**  
  ZII never creates Identity semantics from a carrier.

- **ZII-B04 — Technical Observation Is Not Constitutional Evidence**  
  Capture/decoding may produce candidate material/provenance; Evidence status belongs downstream.

- **ZII-B05 — Technical Success Is Not Physical Proof**  
  A successful device command does not prove the resulting Reality state.

- **ZII-B06 — Support Is Not Capability**  
  Engine feature support must remain distinct from POL/SEC Capability.

- **ZII-B07 — Cryptographic Validity Is Not Trust**  
  Technical crypto verification cannot emit constitutional Trust.

- **ZII-B08 — Parsing Is Not Semantic Translation**  
  Technology syntax belongs to ZII; constitutional/domain meaning does not.

- **ZII-B09 — Purity Does Not Imply Runtime Membership**  
  Pure engines remain outside RI unless they actually fulfill the Runtime role.

- **ZII-B10 — ZII Shall Remain Replaceable**  
  Replacing QR/NFC/BLE implementation cannot alter constitutional meaning.

*These are still PREP findings, not yet ratified ZII law.*

---

## PREP-B Outcome by Authority

The clean ownership model is now:

```text
ZRM
  owns Reality / Representation / Identity /
       Referent / Event / Evidence / Touchpoint semantics

SIOS
  owns constitutional information translation architecture

SEC
  owns Trust / Attestation / security guarantees

POL
  owns authorization / policy /
       constitutional Capability decisions

Z-PROF
  owns governed domain composition / binding

RI
  owns constitutional execution / receipts / replay

CAW
  owns its Commerce wedge application flow

CEngS
  owns engineering law / repository discipline

ZII
  owns technical interaction engines,
       artifacts, renderers, adapters,
       profiles, conformance and tooling
```

**No authority collision is necessary.**

---

## PREP-B Unresolved Items

PREP-B leaves only matters that correctly belong to later work:

| Item | Destination |
| :--- | :--- |
| Exact zTouch Envelope disposition | PREP-C |
| Trust/Seal field replacement | PREP-C |
| Context representation rules | PREP-C |
| Intent Hint representation rules | PREP-C |
| Exact package roles/layers | PREP-D |
| Global monorepo governance | PREP-D |
| Generic engine abstraction sibling test | PREP-E |
| NFC/RFID/BLE standards comparison | PREP-E |
| ZQE implementation entry contract | PREP-F |
| Constitutional physical observation/actuation admission | Future ZRB |
| OEM certification ecosystem | Deferred ZII/ZPIF exploration |

---

## PREP-B Closure Verdict

> **PREP-B PASSES.**
>
> The audit found no requirement for ZII to become a new constitutional authority.  
> It found a strong, defensible execution boundary:
>
> *ZII owns how interaction technologies are technically expressed, generated, rendered, transmitted, captured, decoded, inspected and tested. It does not own what those interactions mean constitutionally.*
>
> Or in the shortest form:
>
> **ZII may know HOW.**  
> **It may carry WHAT.**  
> **It must not decide WHAT IT MEANS.**

The next blocking phase is now clearly **PREP-C — zTOUCH / zTouch Envelope Constitutional Collision Audit**, because that is the first place where Identity, Context, Intent and Trust risk crossing from carried representation into duplicated semantic authority.
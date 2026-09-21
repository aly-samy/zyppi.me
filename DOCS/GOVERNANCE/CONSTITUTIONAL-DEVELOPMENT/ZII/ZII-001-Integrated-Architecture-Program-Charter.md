# ZII-001 — Zyppi Interaction Infrastructure

## Integrated Architecture & Program Charter

| Field                              | Value                                                                                                         |
| :--------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| **Version**                        | 1.0                                                                                                           |
| **Status**                         | **RATIFIED**                                                                                                  |
| **Ratification Date**              | 23 August 2026                                                                                                |
| **Authority**                      | Chair, Zyppi Constitutional Council                                                                           |
| **Program**                        | ZII — Zyppi Interaction Infrastructure                                                                        |
| **Authority Class**                | Program Architecture / Integrated Charter                                                                     |
| **Higher Authority**               | Zyppi Constitution · CEngS                                                                                    |
| **Peer Program**                   | CAW — Commerce Atlas Wedge                                                                                    |
| **First Reference Implementation** | ZQE — Zyppi QR Engine                                                                                         |
| **Source Basis**                   | ZII-PREP-A through ZII-PREP-F                                                                                 |
| **Repository**                     | `aly-samy/zyppi.me` monorepo                                                                                  |
| **Implementation Authority**       | **NONE** — implementation remains separately gated                                                            |
| **Supersedes**                     | ZII-001 v0.1, ZII-001 v0.2, and conflicting earlier ZT/OBS technical-interaction assumptions within ZII scope |

---

## Ratification Statement

> **The Zyppi Constitutional Council hereby ratifies ZII-001 — Zyppi Interaction Infrastructure: Integrated Architecture & Program Charter v1.0 as the permanent architectural foundation of the ZII program.**

ZII-PREP-A through ZII-PREP-F are closed as architectural discovery and reconciliation work. Their surviving findings are consolidated here.

Where this document intentionally refines, simplifies, or supersedes earlier exploratory interaction models, this document governs within the ZII technical-interaction domain.

In particular:

- ZII is **not** required to preserve an older ZT, OBS, Touch, carrier, or observation mechanism merely because that mechanism predates ZII.
- Where an earlier ZT/OBS rule conflicts with the cleaner technical boundary established here, **ZII-001 governs interaction-infrastructure architecture**.

This does **not** give ZII authority over constitutional Reality, Event, Evidence, Trust, Policy, or Runtime meaning, which remain governed by their respective higher authorities.

---

## 1. Purpose

ZII provides Zyppi with one coherent technical home for present and future interaction technologies.

It governs the infrastructure through which systems may:

- construct;
- encode;
- decode;
- represent technically;
- serialize;
- render;
- write;
- transmit;
- broadcast;
- capture;
- read;
- scan;
- parse;
- inspect;
- validate technically;
- test conformance;
- and test interoperability

across mechanisms such as:

- QR Code;
- Data Matrix;
- NFC / NDEF;
- RFID / EPC;
- Bluetooth Low Energy;
- future optical mechanisms;
- future radio mechanisms;
- future proximity mechanisms;
- future device-mediated interaction technologies.

ZII exists to prevent every new interaction technology from creating its own unrelated infrastructure or accidental constitutional system.

Its central rule is:

> **ZII may know HOW.**
> **It may carry WHAT.**
> **It must not decide WHAT IT MEANS.**

---

## 2. Program Position

ZII is a peer engineering program to CAW under CEngS.

```text
ZYPPI
│
Constitutional Core
│
CEngS
│
┌────────┴────────┐
│                 │
CAW               ZII
Commerce Wedge     Interaction Infrastructure
│
▼
ZQE
first reference engine
```

Therefore:

- CEngS governs reusable engineering law.
- CAW governs Commerce-specific architecture.
- ZII governs technical interaction infrastructure.
- ZQE is the first implementation used to prove ZII.

**CAW does not own ZII.**
**ZII does not own CAW.**
**Repository co-location does not imply architectural ownership.**

---

## 3. ZII Definition

> **Zyppi Interaction Infrastructure** is the standards-aware technical infrastructure through which Zyppi **constructs, represents, realizes, acquires, technically interprets, inspects, validates, and interoperates** across technical interaction mechanisms.

The word _interaction_ in ZII is primarily an engineering-domain term. It includes technical mechanisms such as:

- encode
- write
- broadcast
- capture
- read
- scan
- decode
- exchange

A technical interaction does not automatically instantiate any constitutional Event or other semantic object.

Accordingly:

```text
technical interaction  ≠  constitutional Event
```

and:

```text
technical operation  ≠  constitutional truth
```

ZII may produce material later used by constitutional systems. It does not make that material constitutionally meaningful merely by handling it.

---

## 4. Authority Boundary

ZII owns technical interaction mechanics.

ZII **shall not** become the governing authority for:

- Reality;
- Identity;
- Referent;
- Event truth;
- Evidence truth;
- Place;
- Context;
- Intent;
- Trust;
- constitutional Attestation standing;
- Policy;
- authorization;
- constitutional Capability;
- domain composition;
- constitutional execution;
- Execution Receipts;
- business/domain meaning;
- GS1 business semantics;
- ZPI addressing semantics.

### Primary Ownership Boundary

| Concern                      | Governing authority / ZII relationship                                                             |
| :--------------------------- | :------------------------------------------------------------------------------------------------- |
| Reality                      | ZRM — not created by ZII                                                                           |
| Identity / Referent          | ZRM — ZII may carry identifiers/references without defining them                                   |
| Event                        | ZRM — technical activity does not automatically establish Event truth                              |
| Evidence                     | ZRM/SIOS as applicable — ZII may preserve technical material without deciding evidentiary standing |
| Place / Context              | applicable constitutional authority — ZII does not infer them                                      |
| Intent                       | existing semantic authority — ZII does not infer actor Intent                                      |
| semantic translation         | SIOS — ZII technical parsing is not semantic Translation                                           |
| Trust                        | SEC — technical validity is not Trust                                                              |
| authorization / Capability   | POL/SEC as applicable — technical support is not authorization                                     |
| domain composition           | Z-PROF — ZII is not a composition engine                                                           |
| constitutional execution     | RI — ZII is not the Constitutional Runtime                                                         |
| Commerce semantics           | CAW — ZII may be consumed by CAW                                                                   |
| external technical semantics | applicable external standard                                                                       |

The governing rule is:

> **Handling a concept does not transfer ownership of that concept to ZII.**

---

## 5. Interaction Engine Family

ZII defines an **Interaction Engine Family** rather than one universal interaction engine interface.

A family may contain:

```text
Interaction Engine Family
│
├── Technical Operations
├── Native Technical Artifact Type(s)
├── Technical Engine Profile(s)
├── Input / Acquisition Adapter(s)
├── Output / Realization Adapter(s)
├── Diagnostics
├── Conformance
└── Interoperability
```

Only the branches required by a technology need to exist.

- A QR engine need not resemble BLE.
- An NFC implementation need not resemble Data Matrix.
- An RFID engine need not expose a QR-shaped abstraction.

### 5.1 Operation Plurality

ZII **shall not** prescribe one universal operation such as:

```typescript
encode();
```

Technology-appropriate operations may include:

- construct
- encode
- decode
- parse
- serialize
- read
- write
- capture
- scan
- broadcast
- exchange

The actual operation surface belongs to the applicable engine-family specification and external standards.

### 5.2 Lifecycle Plurality

ZII does not impose a universal:

```text
request
  ↓
engine
  ↓
artifact
  ↓
done
```

lifecycle.

Interaction technologies may involve:

- one-shot construction;
- one-shot acquisition;
- repeated emission;
- repeated observation;
- mutable physical storage;
- bidirectional exchange;
- stateful communication;
- temporal broadcast behavior;
- other standards-defined lifecycles.

Therefore:

> **No universal one-shot lifecycle exists at the ZII level.**

### 5.3 Native Technical Artifacts

Each engine family may define one or more technically appropriate native artifact types.

Illustrative examples include:

| Technology  | Example artifact(s)                |
| :---------- | :--------------------------------- |
| QR          | `QrSymbol`                         |
| Data Matrix | `DataMatrixSymbol`                 |
| NFC         | `NdefMessage`, `TagEncodingPlan`   |
| RFID        | `EpcEncoding`, `TagMemoryLayout`   |
| BLE         | `AdvertisingData`, `BroadcastPlan` |

These examples do not ratify future schemas.

An artifact may be:

- produced;
- consumed;
- transformed;
- inspected;
- parsed;
- serialized;
- realized;
- captured.

ZII **shall not** define a universal `InteractionArtifact` schema merely for architectural symmetry.

### 5.4 Technical Artifact Boundary

A native technical artifact is an engineering construct governed by its engine specification and applicable standards.

It may:

- encode a governed Representation;
- carry external information;
- contain opaque bytes;
- carry arbitrary caller-supplied material;
- support later constitutional interpretation.

ZII does not acquire authority to classify every implementation artifact as a constitutional ZRM Representation.

The permanent constitutional boundary is:

```text
Technical Artifact  ≠  Reality
```

and:

> **technical material does not gain constitutional authority merely because ZII produced or observed it.**

### 5.5 Technical Logic and Environmental Interaction

Where technically appropriate, ZII shall separate deterministic technical transformation from device, network, radio, or physical interaction.

**Outward example:**

```text
technical input
      ↓
technical logic
      ↓
native artifact
      ↓
output adapter
      ↓
external environment
```

**Inward example:**

```text
external environment
      ↓
input adapter
      ↓
captured technical material
      ↓
technical parse / decode
```

This is an engineering principle, not a requirement that all technologies expose identical package structures.

### 5.6 Technical Observation and Constitutional Admission

ZII may technically observe, capture, decode, or preserve material.

Such technical observation does not itself require ZII to manufacture a constitutional Event.

For example:

- camera captured image
- QR decoder recovered bytes
- NFC controller returned records
- BLE scanner observed advertisement

are valid technical outcomes.

They do **not** automatically establish:

- constitutional Interaction
- constitutional Event
- Identity authenticity
- Reality truth
- Evidence sufficiency

If a higher-level Zyppi application later admits that technical observation into constitutional Reality/Event/Evidence processing, the applicable constitutional authority governs that admission.

**ZII itself remains technically sovereign over acquisition mechanics and constitutionally non-sovereign over meaning.**

### 5.7 Supersession of Legacy Universal Touch/Observation Assumptions

Earlier ZT/OBS models may have assumed a universal pattern equivalent to:

```text
technical observation
      ↓
mandatory Touch
      ↓
mandatory Event
      ↓
resolution
```

ZII does not adopt that architecture as a universal interaction-infrastructure law.

Such a path may remain appropriate for a specific Zyppi application/profile. It is **not** a prerequisite for:

- encoding QR;
- decoding QR;
- reading arbitrary NDEF;
- writing NFC;
- parsing RFID;
- scanning BLE;
- processing arbitrary external technical input.

Therefore:

- **No universal Touch emission gate is imposed by ZII.**
- **No technical observation becomes a constitutional Event solely because an older touch architecture expected one.**

Where ZT/OBS documents prescribe a universal technical entry mechanism inconsistent with this charter, they are superseded within ZII scope. Their valid constitutional concepts may continue to be used where separately applicable.

---

## 6. Semantic Non-Invention

The following boundaries are permanent.

### 6.1 Technical Observation ≠ Evidence by Default

ZII may preserve:

- raw bytes;
- device identifiers;
- technical timestamps;
- operation metadata;
- capture metadata;
- diagnostic data;
- validation results.

Whether these become Evidence belongs to downstream authority.

### 6.2 Technical Success ≠ Physical Proof

For example:

```text
write command returned success
```

does not by itself prove:

```text
physical object now has the intended state
```

Likewise:

```text
printer accepted job
```

does not prove:

```text
label was physically attached to Object X
```

ZII owns the mechanics. It does not own the constitutional truth of the physical consequence.

### 6.3 Support ≠ Capability

A declaration such as:

```yaml
supports:
  - ECI
  - ECC-H
  - NDEF URI
  - BLE advertising
```

describes technical support.

It does **not** establish constitutional Capability or authorization.

### 6.4 Cryptographic Validity ≠ Trust

ZII may technically:

- hash;
- verify signatures;
- validate MACs;
- parse certificate material;
- preserve proof material

where required by an authorized technical profile.

A technical result:

```text
signatureValid = true
```

does not independently establish:

```text
trusted = true
```

Trust remains SEC-governed.

### 6.5 Parsing ≠ Semantic Translation

For example:

```text
NDEF bytes  →  NDEF records
```

is technical interpretation.

```text
NDEF content  →  constitutional Identity meaning
```

is not automatically ZII.

Likewise:

> **GS1 Digital Link** may be encoded perfectly by ZQE without ZQE understanding GS1 business meaning.

### 6.6 Purity ≠ Runtime Membership

A pure technical algorithm does not become part of RI merely because it is deterministic.

Examples may include:

- QR encoding;
- NDEF serialization;
- EPC encoding;
- deterministic Data Matrix construction.

ZII remains outside Constitutional Runtime ownership unless a separate constitutional authority explicitly assigns a Runtime responsibility.

---

## 7. Golden Question Boundary

ZII remains compatible with the Zyppi Golden Question:

> **Who did what, to whom, where, when, and how do we know?**

The Golden Question is a boundary instrument, not a mandatory ZII payload.

For a pure encoder:

| Dimension           | ZII boundary                                   |
| :------------------ | :--------------------------------------------- |
| **Who?**            | unknown unless supplied                        |
| **Did what?**       | technical encoding occurred                    |
| **To whom/what?**   | supplied technical input; no Referent inferred |
| **Where?**          | unknown unless supplied                        |
| **When?**           | no implicit constitutional Valid Time          |
| **How do we know?** | deterministic technical evidence / conformance |

Missing dimensions remain missing. ZII **shall not** invent them for completeness.

---

## 8. External Standards Authority

Where an interaction technology is governed by an external technical standard:

> **The external standard retains authority over the technical syntax, representation, behavior, and conformance requirements it defines.**

A ZII engine family shall identify:

- applicable normative standards;
- supported versions;
- supported technical scope;
- relevant technical profiles;
- required conformance evidence.

ZII implements external standards. It does not redefine them.

Implementing GS1/EPC representation, for example, does not transfer GS1 domain authority to ZII.

---

## 9. Technical Engine Profiles

A ZII engine family may define explicitly versioned:

> **Technical Engine Profiles**

A Technical Engine Profile exists to freeze engine-specific choices needed for:

- deterministic reproduction;
- compatibility;
- historical reconstruction;
- conformance;
- interoperability.

It is separate from:

- package semver;
- external-standard version;
- domain profile;
- payload protocol version;
- application version.

For example:

```text
package version
  @zyppi/qr-core 5.x
      │
      may support
      │
      ├── zqe/1
      └── zqe/2
```

without changing the historical meaning of `zqe/1`.

---

## 10. Scoped Determinism

Where the underlying operation permits deterministic construction:

> **Same technical input + same explicit parameters + same Technical Engine Profile SHALL produce the same canonical technical result.**

Deterministic operations shall not silently depend upon:

- current time;
- ambient location;
- uncontrolled randomness;
- locale;
- hidden environment variables;
- filesystem ordering;
- mutable global state.

Where nondeterminism is intrinsic, it must be explicit.

> **Deterministic artifact construction does not imply deterministic radio propagation, printing, physical write success, environmental observation, or physical effect.**

---

## 11. Conformance and Interoperability

Conformance is a first-class ZII concern.

Standards-based engine families must define appropriate evidence, potentially including:

- normative vectors;
- boundary tests;
- independent decoders/readers;
- differential implementations;
- cross-runtime tests;
- device interoperability;
- malformed-input tests;
- property tests;
- reproducibility checks.

> **Conformance proves technical behavior. It does not prove constitutional truth.**

---

## 12. ZQE — First Reference Implementation

ZQE — Zyppi QR Engine is the first ZII reference implementation.

At the ZII level, the following are ratified:

- ZQE is a technical QR engine.
- ZQE is not a Zyppi semantic engine.
- ZQE shall remain independent from CAW-specific meaning.
- ZQE shall remain independent from zTOUCH/zQR semantics.
- ZQE shall not own GS1 meaning.
- ZQE shall not own ZPI meaning.
- ZQE does not become Runtime merely because its core may be pure.

Detailed QR architecture belongs to separate ZQE authority.

**This charter does not ratify ZQE implementation code.**

---

## 13. No First-Engine Privilege

ZQE is first. It is not universal.

No QR-specific concept becomes a ZII-wide abstraction merely because QR is implemented first.

Examples remaining QR-specific include:

- QR Version;
- QR mask;
- QR ECC;
- finder patterns;
- quiet zone;
- `QrSymbol`;
- QR SVG semantics.

A proposed generic ZII abstraction must survive materially different sibling technologies.

At minimum, applicable generic proposals should remain defensible against:

- QR
- Data Matrix
- NFC / NDEF
- RFID / EPC
- BLE

Therefore:

> **First implementation ≠ universal model.**

---

## 14. Replaceability

A standards-conformant implementation of an interaction mechanism should remain replaceable without changing constitutional meaning.

Replacing:

```text
ZQE implementation A
      ↓
ZQE implementation B
```

must not itself alter:

- Reality;
- Identity;
- Trust;
- Evidence;
- Policy;
- Runtime semantics;
- CAW business meaning.

Therefore:

> **Interaction implementation is replaceable; constitutional meaning is not implementation-owned.**

---

## 15. Relationship to Adjacent Programs

This section defines boundaries only. It does not ratify the internal architecture of adjacent or deferred initiatives.

| System / concept | Relationship                                                                                                                                     |
| :--------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| CEngS            | Higher engineering authority                                                                                                                     |
| CAW              | Peer program; possible consumer of ZII                                                                                                           |
| ZQE              | First reference implementation                                                                                                                   |
| zTOUCH           | Adjacent higher interaction/profile initiative that may consume ZII                                                                              |
| zQR              | Future QR interaction/profile concept distinct from ZQE                                                                                          |
| ZPI / zPIS       | Separate addressing/resolution architecture that may use ZII mechanisms                                                                          |
| ZyPub            | Deferred publication concept that may use ZII                                                                                                    |
| Zync             | Deferred reference-resolution concept outside ZII                                                                                                |
| ZRB              | Deferred constitutional physical-Reality admission investigation                                                                                 |
| ZPIF             | Earlier generic technical responsibilities substantially absorbed conceptually into ZII; specialized OEM/certification question remains deferred |

### Permanent separations

- `ZII ≠ zTOUCH`
- `ZQE ≠ zQR`
- `ZII ≠ ZRB`
- `ZII ≠ ZPI`
- `ZII ≠ ZyPub`

### ZPIF / OEM Boundary

Any future OEM or physical-device ecosystem shall not create competing constitutional authority.

ZII may own, where separately authorized:

- technical adapter interfaces;
- protocol integration;
- device interoperability;
- conformance tooling;
- implementation manifests;
- standards testing.

But:

- Trust and security standing remain SEC-governed;
- authorization and constitutional Capability remain POL-governed;
- Reality/Event/Evidence admission remains outside ZII;
- manufacturer enrollment or certification status does not automatically establish constitutional Trust.

Therefore:

```text
Certification  ≠  Trust
```

and:

```text
technical conformance  ≠  constitutional authorization
```

The future public name and exact authority home of a specialized OEM ecosystem remain deferred.

---

## 16. Repository Position

ZII belongs in the existing Zyppi monorepo.

However, ZII does not own platform-wide repository governance.

The repository must first complete the separately governed:

> **Repository Governance Transition — RGT**

before ZII implementation packages are admitted.

This charter does not define:

- global workspace policy;
- global package registration;
- CAW package rules;
- CI graph mechanics;
- validator implementation;
- federated policy composition.

These belong to CEngS/RGT.

ZII-specific repository topology shall be defined separately after the platform governance transition establishes the lawful mechanism.

---

## 17. ZII Core Invariants

The following are hereby ratified as the initial ZII architectural invariants.

| ID          | Invariant                                                                                                                                                                                                                                 |
| :---------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ZII-I01** | **Technical Sovereignty Only.** ZII owns interaction mechanics, not constitutional meaning.                                                                                                                                               |
| **ZII-I02** | **Constitutional Non-Invention.** ZII shall not infer Reality, Identity, Referent, Event, Evidence, Context, Intent, Trust, Policy, Authority, or constitutional Capability from technical material or technical success.                 |
| **ZII-I03** | **Technical Artifact Is Not Reality.** No technical artifact becomes Reality merely because ZII produced, carried, stored, decoded, or observed it.                                                                                       |
| **ZII-I04** | **Technical Observation Is Not Evidence by Default.** Technical observations may support later Evidence evaluation; ZII does not determine evidentiary standing.                                                                          |
| **ZII-I05** | **Technical Success Is Not Physical Proof.** Successful technical I/O does not prove the resulting physical-world state.                                                                                                                  |
| **ZII-I06** | **External Standards Retain Authority.** A standards-based ZII engine implements applicable external technical authority rather than redefining it.                                                                                       |
| **ZII-I07** | **Native Artifact Plurality.** Each engine family may define one or more technology-appropriate native technical artifacts.                                                                                                               |
| **ZII-I08** | **Operation and Lifecycle Plurality.** ZII imposes no universal `encode()`, one-shot pipeline, or `request → artifact` lifecycle.                                                                                                         |
| **ZII-I09** | **Logic / Environment Separation.** Deterministic technical logic shall be separated from environmental/device I/O where technically appropriate.                                                                                         |
| **ZII-I10** | **Scoped Determinism.** Technical determinism does not imply deterministic physical delivery, capture, observation, or effect.                                                                                                            |
| **ZII-I11** | **Explicit Technical Profiles.** Engine-specific compatibility and deterministic choices shall be bounded by explicit Technical Engine Profiles where required.                                                                           |
| **ZII-I12** | **Conformance First.** Standards-based engine families shall identify normative authority, supported scope, and required conformance evidence.                                                                                            |
| **ZII-I13** | **Support Is Not Capability.** Technical support does not establish constitutional Capability or authorization.                                                                                                                           |
| **ZII-I14** | **Cryptographic Validity Is Not Trust.** Technical proof validation does not independently establish constitutional Trust.                                                                                                                |
| **ZII-I15** | **Parsing Is Not Semantic Translation.** Technical syntax interpretation does not confer ownership of domain or constitutional meaning.                                                                                                   |
| **ZII-I16** | **Purity Does Not Imply Runtime Membership.** Pure technical engines remain outside RI unless explicitly assigned a Runtime responsibility by higher authority.                                                                           |
| **ZII-I17** | **No First-Engine Privilege.** ZQE may not promote QR-specific concepts into generic ZII law without sibling justification.                                                                                                               |
| **ZII-I18** | **Replaceability.** Interaction implementations remain replaceable without altering constitutional meaning.                                                                                                                               |
| **ZII-I19** | **Consumer Independence.** ZII shall not structurally depend on its first application consumer merely because that consumer adopts it.                                                                                                    |
| **ZII-I20** | **No Universal Touch Gate.** ZII technical acquisition or realization does not require a universal ZT/OBS Touch/Event emission step.                                                                                                      |
| **ZII-I21** | **Admission Remains Separate.** Where technical material later participates in Reality, Event, Evidence, Trust, Policy, or Runtime processing, admission is performed by the applicable downstream authority rather than inferred by ZII. |

---

## 18. Deferred Questions

The following remain intentionally open.

| ID           | Question                                                                                                                                                   |
| :----------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ZT-OQ-01** | **zQR Conformance Identity.** What minimum condition makes a standard QR a future zQR? This does not block ZQE.                                            |
| —            | **Physical Reality Admission.** How physical observations and physical effects become constitutionally admissible Reality/Event/Evidence remains deferred. |
| —            | **ZPIF / OEM Ecosystem.** Whether a distinct ZPIF or other OEM/device certification program survives remains deferred.                                     |
| —            | **ZyPub / Zync.** Publication and connected-resolution architectures remain deferred.                                                                      |
| —            | **ZPI / zPIS.** Persistent addressing/resolution remains separately governed.                                                                              |

None is a prerequisite for the ZII technical foundation.

---

## 19. Required Follow-On Authorities

ZII-001 does not contain every implementation-level contract.

Separate authorities are still required for:

### ZII Engine Family Architecture

Detailed rules for:

- operations;
- technical artifacts;
- adapters;
- profiles;
- conformance;
- interoperability;
- diagnostics.

### ZII Repository Topology

Program-specific package/dependency authority after RGT.

### ZII Roadmap

Milestones, build order, and task decomposition.

### ZQE Specification

Including:

- QR standards scope;
- QR compiler architecture;
- `QrSymbol` contract;
- `zqe/1` Technical Engine Profile;
- renderer contract;
- conformance requirements.

### ZQE Roadmap

Implementation milestones and task mandates.

> **No code is authorized by ZII-001 alone.**

---

## 20. Program Success Criterion

ZII succeeds if Zyppi can add interaction technologies without:

- changing constitutional meaning;
- creating duplicate Identity;
- creating duplicate Trust;
- creating duplicate Evidence authority;
- creating duplicate Policy;
- creating a second Runtime;
- forcing all technologies into QR-shaped architecture;
- forcing all observations through one historical carrier/touch model;
- coupling engines to their first consumer;
- creating a new constitutional universe for each mechanism.

The long-term test is:

> **Can engine #2, engine #10, and engine #50 join ZII without requiring ZII itself to be fundamentally redefined?**

If not, the family model has failed.

---

## 21. Integrated Architecture

ZII may operate on material from several independent sources:

```text
Governed Zyppi material ──────────┐
                                  │
External standards material ──────┼────► ZII
                                  │
Opaque / arbitrary input ─────────┘
                                  │
                                  ▼
                    technical interaction
                         infrastructure
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
         outward realization          inward acquisition
         render/write/broadcast/etc.  capture/read/scan/etc.
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                      interaction environment
```

If constitutional systems later consume the technical result:

```text
ZII technical material
      ↓
applicable admission / resolution / evaluation
      ↓
ZRM / SIOS / SEC / POL / Z-PROF / RI
as applicable
```

**ZII itself remains usable even when none of those higher semantic systems participate.**

---

## 22. Concise Charter

ZII is governed by ten concise statements:

1. ZII is technical interaction infrastructure, not constitutional authority.
2. ZII is a peer to CAW under CEngS.
3. ZII may handle governed, external, or arbitrary technical material without owning its meaning.
4. Engine families retain technology-appropriate operations, artifacts, and lifecycles.
5. There is no universal `encode()`, Symbol, Renderer, artifact schema, Touch gate, or one-shot lifecycle.
6. External standards retain authority over the technologies they define.
7. Profiles, determinism, conformance, diagnostics, and interoperability are first-class technical concerns.
8. Technical observation, success, parsing, support, or cryptographic validity do not become Evidence, Reality, semantic Translation, Capability, or Trust merely through ZII.
9. ZQE is the first reference implementation and receives no first-engine privilege.
10. A new interaction mechanism shall not require a new constitutional universe.

---

## 23. Ratification and Effect

**ZII-001 v1.0 is RATIFIED.**

Effective immediately:

- ZII-PREP-A → F become historical discovery/reconciliation evidence.
- ZII-001 becomes the permanent authoritative ZII program charter.
- conflicting earlier ZII drafts are superseded.
- conflicting lower interaction-infrastructure assumptions in older ZT/OBS material are superseded within ZII scope.
- ZRM, SEC, POL, RI, SIOS, CEngS, and other higher authorities retain their respective constitutional domains.
- **ZII implementation remains NOT AUTHORIZED** until its separately required gates are satisfied.
- **ZQE implementation remains NOT AUTHORIZED.**

The immediate program blocker remains the separately governed **Repository Governance Transition** before ZII implementation packages can enter the monorepo.

---

## Chair Ratification Record

| Field                          | Value                                                                                 |
| :----------------------------- | :------------------------------------------------------------------------------------ |
| **Decision**                   | RATIFY                                                                                |
| **Document**                   | ZII-001 — Zyppi Interaction Infrastructure: Integrated Architecture & Program Charter |
| **Version**                    | 1.0                                                                                   |
| **Disposition**                | ACTIVE / RATIFIED                                                                     |
| **Implementation authority**   | NONE                                                                                  |
| **Council review**             | CLOSED                                                                                |
| **ZII discovery**              | CLOSED                                                                                |
| **Next platform prerequisite** | RGT                                                                                   |

> This ratification is consistent with the central PREP conclusions: ZII requires no new constitutional sovereignty, must not be shaped universally by QR, must support plural operations/artifacts/lifecycles, and must keep ZQE independent from CAW, GS1, zTOUCH, ZPI, Runtime, and other semantic systems.

**ZII-001 is now closed at v1.0.**

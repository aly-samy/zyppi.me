# ZyPub & Zync --- Connected and Disconnected Constitutional Communication

**Status:** Exploratory Proposal / Discussion Draft\
**Project:** Zyppi\
**Purpose:** Consolidate the findings, architectural directions,
technical observations, naming ideas, risks, and proposed approaches
developed during the brainstorming discussion.\
**Authority:** None. This document is not ratified, normative, or an
implementation mandate.

------------------------------------------------------------------------

## 1. Proposal Context

This exploration began with a question about whether Decimen-style
optical transfer could be useful to Zyppi beyond conventional file
transfer.

The discussion produced a broader proposition:

> Zyppi may benefit from complementary mechanisms for communicating
> representations of reality in both connected and disconnected
> conditions.

The emerging working brands are:

-   **Zync** --- proposed name for Zyppi's connected/online
    communication and access capability.
-   **ZyPub** --- proposed name for Zyppi's self-contained publication
    capability, especially useful where network connectivity is absent,
    unavailable, undesirable, or insufficient.

The central insight is that these should not represent two different
semantic systems. They should expose the same underlying Zyppi
constitutional semantics through different acquisition and communication
conditions.

A concise working formulation is:

> **Zync references living reality; ZyPub carries a materialized
> publication of reality.**

This remains a proposal rather than a ratified architectural rule.

------------------------------------------------------------------------

## 2. Starting Point: Optical Data Transfer

The original concept considered animated QR-like optical transfer.

A conventional QR Code can carry roughly 2.9 KB of binary data at its
theoretical maximum, with lower practical payloads once error correction
and protocol metadata are considered.

For practical animated optical transfer using ordinary displays and
smartphone cameras, the discussion used approximately:

-   1--2.5 KB useful payload per frame as an exploratory range;
-   roughly 8--15 reliably decodable frames per second for practical
    consumer hardware;
-   approximately 10--40 KB/s as a plausible practical range depending
    on conditions;
-   approximately 0.6--2.4 MB/minute as an indicative range.

These are engineering estimates, not benchmarked Zyppi requirements.

The important conclusion was that this throughput is unimpressive for
general file transfer but potentially substantial for structured
semantic data, attestations, identity information, product passports,
evidence, certificates, machine state, and selected graph material.

Therefore:

> The interesting problem is not faster file transfer. It is useful
> semantic communication when ordinary network resolution is unavailable
> or inappropriate.

------------------------------------------------------------------------

## 3. Optical Is a Carrier, Not the Architecture

An early idea was an "Optical Constitutional Transport Layer." The
discussion subsequently rejected optical transport as the correct
high-level abstraction.

Zyppi should not constitutionally depend on photons, QR codes, screens,
NFC, Bluetooth, USB, sound, or any other carrier.

Potential carriers include:

-   animated QR;
-   future visual matrices;
-   NFC;
-   BLE;
-   Wi-Fi Direct;
-   LiFi;
-   audio or ultrasonic communication;
-   USB or removable media;
-   e-ink;
-   future physical communication technologies.

The semantic system should remain independent of all of them.

The proposed architectural principle is:

> **Connectivity and carrier may change how an observation is acquired,
> but should not change the meaning of the constitutional information
> being observed.**

------------------------------------------------------------------------

## 4. Two Complementary Communication Conditions

### 4.1 Zync --- Connected Reality

**Zync** is the proposed working brand for connected Zyppi
communication.

Its role would be access to the current, network-resolved representation
of reality.

Conceptually:

``` text
Reality
   │
   ▼
Zync reference / connected access
   │
   ▼
Zyppi services, registries and graph
   │
   ▼
Current resolvable constitutional view
```

Potential characteristics include:

-   effectively large/unbounded remote payloads;
-   graph traversal;
-   live resolution;
-   current standing and authority checks;
-   synchronization;
-   API/SDK/MCP access;
-   server-side intelligence;
-   current evidence retrieval;
-   network-based policy and trust computation.

The existing Zyppi URL can remain an implementation mechanism within
this connected model without needing to become the product's conceptual
name.

The distinction is useful:

> A URL is a mechanism. Zync would be the capability.

### 4.2 ZyPub --- Published Reality

**ZyPub** is the proposed working brand for self-contained
constitutional publication.

Instead of requiring the observer to follow a pointer to remote data,
ZyPub would allow useful information itself to be carried in the
publication.

Conceptually:

``` text
Reality
   │
   ▼
Materialized constitutional publication
   │
   ▼
ZyPub
   │
   ▼
Carrier
   │
   ▼
Observer
```

ZyPub could therefore operate when:

-   there is no Internet connection;
-   Internet exists but cannot be trusted;
-   systems are deliberately air-gapped;
-   organizations have no shared API;
-   networks are restricted;
-   infrastructure has failed;
-   a device should expose state locally without a server round-trip.

This creates a useful symmetry:

``` text
                 Reality
                    │
          ┌─────────┴─────────┐
          │                   │
        Zync                ZyPub
     Connected             Published
       access                state
          │                   │
          ▼                   ▼
   Resolve the graph     Carry a bounded
      remotely           materialized slice
```

------------------------------------------------------------------------

## 5. ZyPub Is Not Necessarily an Animated QR Code

The brainstorming initially used "Zy Code" for an animated visual
representation.

The stronger conclusion is that **ZyPub should not be defined by a
particular visual code**.

Animated QR may be an excellent first optical implementation, but the
publication architecture should remain carrier-neutral.

Possible structure:

``` text
ZyPub
│
├── Publication semantics
├── Capsule / payload representation
├── Progressive publication
├── Integrity and security
├── Fragmentation and reconstruction
└── Carrier adapters
      ├── Animated QR
      ├── Visual matrix
      ├── NFC
      ├── BLE
      ├── LiFi
      ├── Audio
      └── Future carriers
```

The optical implementation can still have its own product-facing name
later if useful.

------------------------------------------------------------------------

## 6. Display-Bearing Physical Assets

Animated optical publication has an obvious physical limitation: it
requires a display capable of changing over time.

It therefore does not replace static identifiers for every physical
object.

The discussion identified a useful distinction.

### Static physical objects

May continue using:

-   GS1 QR;
-   barcode;
-   NFC;
-   RFID;
-   printed identifiers;
-   static labels.

### Interactive Physical Assets

Devices already containing screens are particularly suitable for dynamic
optical publication.

Examples include:

-   phones;
-   tablets;
-   laptops;
-   POS terminals;
-   ATMs;
-   vending machines;
-   EV chargers;
-   parking meters;
-   industrial machines;
-   medical equipment;
-   smart appliances;
-   robots;
-   kiosks;
-   vehicle displays;
-   digital signage;
-   e-ink logistics displays.

For such assets, the display can become an observable data surface
rather than merely showing a URL.

------------------------------------------------------------------------

## 7. Static Identity, Connected Resolution, and Dynamic Publication

A possible three-level model emerged.

### Level 1 --- Static Identity

The object exposes a stable identifier.

``` text
Object
  ↓
QR / barcode / NFC / RFID
  ↓
Identity
```

Primary question:

> Who or what am I?

### Level 2 --- Connected Resolution

The identifier resolves through Zync.

``` text
Object
  ↓
Reference
  ↓
Network
  ↓
Zyppi
  ↓
Current graph
```

Primary capability:

> Resolve my current representation.

### Level 3 --- Dynamic Publication

A display-bearing asset locally publishes richer state through ZyPub.

``` text
Device
  ↓
Dynamic publication
  ↓
Observer
  ↓
Local constitutional material
```

Primary capability:

> Observe what I can prove or expose here and now.

These levels are complementary rather than mutually exclusive. A single
device may support all three.

------------------------------------------------------------------------

## 8. Publication Rather Than File Transfer

A major conceptual shift was from **transfer** to **publication**.

Traditional networking assumes:

``` text
Sender → Transport → Receiver
```

The proposed ZyPub model can instead support:

``` text
Entity
   ↓
Publishes observable state
   ↓
Observer captures publication
   ↓
Observation is evaluated
```

This matters because a physical asset may publish without knowing who
will observe it.

Examples:

-   an EV charger publishes availability and fault state;
-   a machine publishes diagnostics;
-   a container publishes selected logistics evidence;
-   a kiosk publishes its capabilities;
-   emergency infrastructure publishes capacity and status.

This one-to-many model was described during the discussion as
**Constitutional Broadcasting**.

The term is useful conceptually even if it does not become formal
nomenclature.

------------------------------------------------------------------------

## 9. Observable Constitutional State

One proposed abstraction was **Observable Constitutional State (OCS)**.

The intention is not to create a new constitutional primitive
prematurely. It is a conceptual description of the material that an
entity can legitimately expose for observation at a given point in time.

A possible flow is:

``` text
Reality
   ↓
Observable state
   ↓
Publication
   ↓
Observation
   ↓
Evidence / information
   ↓
Trust computation
   ↓
Possible execution
```

The crucial distinction is:

> **Publication does not equal trust.**

A signed publication can prove properties about its origin and
integrity. It cannot automatically prove that every claim remains
globally current.

------------------------------------------------------------------------

## 10. Trust Is Computed, Not Transported

This became one of the strongest points of consensus.

Moving a signed object does not automatically establish current trust.

Disconnected operation introduces questions such as:

-   Has the issuer been revoked?
-   Has standing changed?
-   Has ownership already changed elsewhere?
-   Is this publication a replay?
-   How old is the evidence?
-   Does the observer possess the necessary authority keys?
-   Is the publication still within an acceptable freshness window?

Therefore ZyPub should communicate **evidence and attestations**, not
magically transport "trust."

Potential evaluation states discussed included:

``` text
Observed
   ↓
Authenticated
   ↓
Verified
   ↓
Resolved
   ↓
Settled
```

These labels remain exploratory.

A useful distinction is:

-   **Observed** --- information has been captured.
-   **Authenticated** --- cryptographic origin/integrity can be
    established using available keys.
-   **Verified/Resolved** --- broader authority, standing, policy, and
    current-state checks have been performed.
-   **Settled** --- any required state-changing execution has completed
    according to applicable rules.

An offline observer may not always be able to advance through every
state.

------------------------------------------------------------------------

## 11. The Offline Revocation and Double-Spend Problem

This is the primary trust challenge.

Suppose an offline device receives a signed ownership-transfer intent.
The receiver may be unable to determine whether:

-   the sender's standing was revoked minutes earlier;
-   another conflicting transfer already occurred;
-   the authority chain has changed.

The proposed direction is **not** to pretend this uncertainty does not
exist.

Instead:

1.  record what was actually observed;
2.  preserve timestamps, signatures and evidence;
3.  identify what could and could not be authenticated;
4.  apply explicit policy to any locally permitted action;
5.  defer global resolution or settlement when current state is
    required;
6.  reconcile conflicts deterministically after synchronization.

A useful principle is:

> **Offline uncertainty should be represented, not hidden.**

------------------------------------------------------------------------

## 12. Freshness and Replay Resistance

Dynamic publication requires a way to distinguish current publications
from recorded/replayed ones.

Candidate mechanisms discussed include:

-   publication sequence number;
-   signed timestamp;
-   expiry;
-   authority epoch;
-   previous-publication hash;
-   monotonic counters;
-   hash-chain ratchets.

Conceptually:

``` text
Publication 31827
       │
       ▼
      hash
       │
Publication 31828
       │
       ▼
      hash
       │
Publication 31829
```

This does not by itself solve global revocation, but it can make
freshness and replay properties much more explicit.

------------------------------------------------------------------------

## 13. Local Trust Anchors

Offline signature verification requires the observer to already possess
sufficient trust material.

Possible approaches include:

-   cached authority public keys;
-   periodically synchronized authority bundles;
-   compressed trust-root structures;
-   enterprise/government provisioned trust stores;
-   localized trust anchors;
-   Merkle-root-based synchronization approaches.

A working concept proposed during the discussion was a **Local Trust
Anchor Registry (LTAR)**.

This should be treated as a design question rather than an adopted
component.

Consumer devices may have weaker offline verification capability than
provisioned industrial, enterprise, customs, medical, or government
equipment.

------------------------------------------------------------------------

## 14. Progressive Publication

One of the strongest engineering ideas from the discussion is that ZyPub
should not behave like downloading a monolithic file.

The observer may scan for 300 milliseconds, two seconds, or twenty
seconds.

The publication should therefore provide useful information
progressively.

Illustrative layers:

### Layer 0 --- Bootstrap

Possible contents:

-   identity;
-   protocol version;
-   capabilities;
-   publication manifest;
-   transfer estimate;
-   integrity metadata.

### Layer 1 --- Current State

Possible contents:

-   status;
-   availability;
-   current operating state;
-   essential attributes.

### Layer 2 --- Evidence

Possible contents:

-   attestations;
-   certificates;
-   selected signatures;
-   essential provenance.

### Layer 3 --- Rich Domain Material

Possible contents:

-   Digital Product Passport;
-   warranty;
-   provenance;
-   GS1-related data;
-   chain-of-custody material.

### Layer 4+ --- Deep State

Possible contents:

-   diagnostics;
-   maintenance history;
-   logs;
-   richer graph fragments.

This allows the observer to obtain the most valuable information first.

------------------------------------------------------------------------

## 15. Partial Capture Must Not Become Partial Trust

Progressive publication introduces an important security distinction.

Transport-level partial data can be useful, but incomplete fragments
should not silently become trusted constitutional evidence.

A possible design rule is:

> Every independently usable progressive layer should be independently
> bounded and cryptographically verifiable.

This is preferable to signing only one enormous final payload if early
layers are intended to be independently consumed.

For example:

``` text
Layer 0
  └── Signed manifest

Layer 1
  └── Signed/committed state capsule

Layer 2
  └── Evidence bundle committed by manifest

Layer 3
  └── Rich material committed by manifest
```

This could reconcile progressive disclosure with the requirement that
the Runtime never infer trust from incomplete transport fragments.

------------------------------------------------------------------------

## 16. Keyframes, Delta Frames, and Cold-Start Scanning

Claude introduced the useful analogy of video codecs.

A scanner can begin observing at any point in a repeating optical
stream. It cannot assume it captured frame zero.

Therefore an optical ZyPub renderer may benefit from:

-   **keyframes** --- periodically repeated self-contained bootstrap
    information;
-   **delta/data frames** --- additional material between keyframes;
-   forward error correction;
-   fountain coding;
-   redundant fragments;
-   cyclic publication.

Illustrative sequence:

``` text
[K] [D] [D] [D] [K] [D] [D] [D] [K]
```

A new observer waits only until the next keyframe rather than an entire
long cycle.

The terminology belongs primarily to the transport/encoding layer rather
than the constitutional Runtime.

------------------------------------------------------------------------

## 17. Epochs and Channels

The discussion extended progressive publication into the idea of
separate publication **epochs** or **channels**.

For example:

``` text
Identity Channel
Status Channel
Safety Channel
Commerce Channel
Compliance Channel
Maintenance Channel
Telemetry Channel
AI Channel
```

A device need not broadcast every channel with equal frequency.

An EV charger might prioritize:

1.  identity;
2.  availability;
3.  fault/safety state;
4.  pricing;
5.  certificates;
6.  firmware and maintenance.

This creates a form of priority without requiring a request/response
channel.

The frequency and ordering of publications may itself communicate what
the publisher considers currently important.

------------------------------------------------------------------------

## 18. Publication Profiles

A possible ZyPub profile family emerged.

### Beacon

Very small, frequently repeated publication.

Suitable for:

-   identity;
-   status;
-   heartbeat;
-   capabilities.

### Snapshot

A self-contained bounded representation of current state.

### Progressive

A layered publication that reveals increasingly rich material as
observation continues.

### Stream

Continuous changing state or telemetry.

### Deep Publication

Larger evidence/history package intended for longer capture sessions.

These names remain proposals.

------------------------------------------------------------------------

## 19. Publication Versus Directed Exchange

There was disagreement during the discussion about whether ZyPub should
support transactions requiring a response.

The useful conclusion is to separate the semantic interaction from the
carrier.

### Publication

One-way:

``` text
Publisher → Observer
```

Suitable for:

-   identity;
-   status;
-   evidence;
-   capabilities;
-   provenance;
-   diagnostics.

### Directed interaction

Some activities inherently require another party to respond:

-   authentication challenges;
-   ownership-transfer acceptance;
-   payment;
-   authorization;
-   negotiation.

The proposal should not require the optical publication itself to become
bidirectional.

Instead, the publication may expose enough information to bootstrap a
separate interaction.

Possible backchannels include:

-   Zync/Internet;
-   BLE;
-   NFC;
-   Wi-Fi Direct;
-   UWB;
-   another optical channel;
-   another future carrier.

The constitutional semantics should remain independent of which
backchannel is used.

------------------------------------------------------------------------

## 20. Observation and Execution Must Remain Distinct

A recurring concern was that offline publication could accidentally blur
observation and execution.

A safer conceptual sequence is:

``` text
Publication
   ↓
Observation
   ↓
Authentication
   ↓
Policy / trust evaluation
   ↓
Intent
   ↓
Execution (if permitted)
   ↓
Receipt
   ↓
Synchronization / reconciliation where required
```

A publication should not automatically execute state change merely
because it was received.

This preserves the broader Zyppi distinction between evidence, trust,
policy, and execution.

------------------------------------------------------------------------

## 21. Potential Real-World Use Cases

The discussion identified a range of candidates. These should be treated
as opportunity hypotheses requiring validation.

### Industrial equipment

A machine could publish:

-   identity;
-   current fault;
-   operating status;
-   calibration state;
-   maintenance history;
-   spare-part information;
-   safety certificates.

### EV charging

A charger could publish:

-   identity;
-   availability;
-   current price;
-   power capability;
-   fault state;
-   payment capabilities;
-   inspection/certification information.

### Logistics and customs

Potential publications include:

-   product identities;
-   manifests;
-   origin evidence;
-   certificates;
-   chain-of-custody evidence;
-   handling history.

### Air-gapped and RF-restricted environments

Potentially relevant to:

-   secure facilities;
-   industrial networks;
-   maritime environments;
-   restricted operational technology networks.

### Disaster response

Potential publication of:

-   shelter capacity;
-   supply inventories;
-   water availability;
-   medical capabilities;
-   emergency instructions.

### Kiosks and infrastructure

Examples:

-   vending machines;
-   parking meters;
-   public kiosks;
-   ticketing equipment;
-   smart infrastructure.

### Medical and laboratory equipment

Potentially useful for:

-   device identity;
-   calibration;
-   maintenance;
-   certification;
-   locally available operational information.

Sensitive medical or personal information would require substantially
stronger privacy and authorization design.

------------------------------------------------------------------------

## 22. Where Optical Publication Is Probably Not the Best Choice

The discussion repeatedly warned against treating animated optical
transfer as a universal replacement for existing technologies.

For ordinary connected retail:

``` text
Static GS1 QR
      ↓
Zync
      ↓
Live graph resolution
```

may remain far simpler than requiring a consumer to hold a camera over
an animated stream.

Optical ZyPub is more compelling where:

-   connectivity is unavailable;
-   local state is more useful than remote state;
-   a display already exists;
-   RF communication is prohibited or unreliable;
-   cross-system integration is unavailable;
-   evidence must travel with the physical interaction.

The economic case should drive carrier selection.

------------------------------------------------------------------------

## 23. Security Considerations

ZyPub introduces significant security requirements.

### Broadcast interception

Visible optical publication can be captured by unintended cameras.

Possible responses:

-   publish only public information;
-   encrypt sensitive payloads;
-   use recipient-bound encrypted capsules;
-   restrict publication channels by sensitivity;
-   require authorization before exposing sensitive layers.

### Replay

Address through freshness metadata, counters, expiry, signed epochs, and
chain commitments.

### Truncation

Progressive layers should clearly declare completeness and integrity
boundaries.

### Spoofing

Cryptographic authentication must be independent of visual appearance.

### Revocation

Offline verification cannot pretend to know live revocation state unless
suitable fresh trust material exists.

### Privacy

PII, proprietary pricing, medical information, delegable capabilities,
and sensitive operational data should not be casually broadcast.

------------------------------------------------------------------------

## 24. Proposed Capsule Concept

Earlier discussion used **Constitutional Capsule (CCAP)**. After
adopting the ZyPub brand, **ZyPub Capsule (ZPC)** was suggested as a
friendlier product-family name.

A capsule could potentially include:

``` text
Header
├── protocol version
├── publication ID
├── publisher identity/reference
├── publication profile
├── channel
├── sequence/epoch
├── created time
├── expiry
└── manifest

Payload
├── identity material
├── state
├── evidence
├── attestations
├── domain projections
└── optional graph fragments

Integrity
├── hashes
├── signatures
├── authority references
└── previous-publication commitment

Security
├── encryption metadata
├── recipient restrictions
└── disclosure policy
```

This is conceptual and requires alignment with existing ZRM, runtime,
security, canonical serialization, and projection contracts before
adoption.

------------------------------------------------------------------------

## 25. Runtime and Gateway Separation

One important architectural suggestion was to keep physical transport
mechanics outside the pure constitutional Runtime.

For an optical implementation:

``` text
Camera
   ↓
Optical decoder
   ↓
Frame reconstruction
   ↓
Error correction
   ↓
Capsule reconstruction
   ↓
Integrity validation
   ↓
Constitutional boundary
   ↓
Zyppi Runtime
```

The Runtime should not need to understand:

-   QR frames;
-   camera timing;
-   RGB channels;
-   screen refresh;
-   fountain coding;
-   BLE packets.

Those belong to adapters/gateways.

The Runtime should receive canonical constitutional inputs after
transport normalization.

------------------------------------------------------------------------

## 26. Proposed Relationship Between Zync and ZyPub

The most important architectural conclusion is that Zync and ZyPub
should not evolve into independent semantic worlds.

They should converge on the same canonical representation.

Conceptually:

``` text
                    ZRM / Canonical Reality Model
                               │
                    ┌──────────┴──────────┐
                    │                     │
                  Zync                  ZyPub
             Connected access       Self-contained
                    │                publication
                    │                     │
                 Network              Any carrier
                    │                     │
                    └──────────┬──────────┘
                               │
                         Same semantics
```

A developer should ideally be able to process information without
rewriting business logic merely because the observation arrived through
ZyPub rather than Zync.

A possible long-term SDK abstraction might resemble:

``` typescript
const result = await zyppi.observe(source);
```

where `source` could represent connected resolution or a locally
acquired publication.

The exact API remains to be designed.

------------------------------------------------------------------------

## 27. Proposed Product Vocabulary

Current brainstorming vocabulary:

  -----------------------------------------------------------------------
  Working Name                        Proposed Meaning
  ----------------------------------- -----------------------------------
  **Zync**                            Connected access/communication with
                                      living Zyppi reality

  **ZyPub**                           Self-contained publication of Zyppi
                                      reality

  **ZyPub Capsule (ZPC)**             Canonical bounded publication
                                      payload

  **ZyPub Beacon**                    Small frequent publication

  **ZyPub Snapshot**                  Self-contained current-state
                                      publication

  **ZyPub Progressive**               Layered publication

  **ZyPub Stream**                    Continuous changing publication

  **ZyPub Exchange**                  Possible interaction/bootstrap
                                      capability; requires further
                                      definition

  **ZyPub Optical**                   Optical carrier/renderer family

  **Animated QR**                     Candidate first optical renderer
  -----------------------------------------------------------------------

These are proposed names only.

------------------------------------------------------------------------

## 28. Working Brand Language

Possible high-level language:

### Zync

> **Connect Reality.**

or:

> **Access living reality.**

### ZyPub

> **Publish Reality.**

or:

> **Reality, published.**

Together:

> **Zync when connected. ZyPub when disconnected. Same reality.**

A more technically accurate version may eventually avoid defining ZyPub
exclusively as "offline," because a self-contained publication can also
be valuable while online.

------------------------------------------------------------------------

## 29. Important Strategic Correction: ZyPub Is Not Only Offline

Although offline communication motivated the concept, ZyPub may
ultimately be useful in connected environments as well.

For example, a machine could publish local state directly even when both
devices have Internet access because:

-   local state may be fresher;
-   cloud round-trips may be unnecessary;
-   privacy may favor local disclosure;
-   the observer may need deterministic local evidence;
-   the asset may intentionally expose only a bounded view.

Therefore a stronger distinction may be:

> **Zync = resolve by reference.**\
> **ZyPub = acquire by publication.**

Connectivity becomes a common use-case distinction rather than the
formal semantic boundary.

This should be investigated before the terminology is frozen.

------------------------------------------------------------------------

## 30. Strategic Position

ZyPub should not be presented as:

-   a QR replacement;
-   a file-transfer product;
-   an offline blockchain;
-   an alternative Internet;
-   a universal replacement for NFC/BLE;
-   a new proprietary barcode merely for branding.

Its potential strategic position is:

> **A carrier-neutral method for publishing bounded, verifiable Zyppi
> representations directly to observers, including when remote
> resolution is unavailable.**

The optical implementation is valuable because modern screens and
cameras already provide ubiquitous compatible hardware.

------------------------------------------------------------------------

## 31. Potential Wedge

The discussion suggests that the strongest initial candidates are not
ordinary consumer retail.

Potential high-value wedges include:

1.  industrial equipment;
2.  infrastructure such as EV chargers and kiosks;
3.  logistics/customs;
4.  maritime or intermittently connected environments;
5.  enterprise compliance;
6.  RF-restricted or air-gapped environments;
7.  emergency/disaster infrastructure.

However, no market wedge has been selected or validated.

GS1 could provide useful prototype data because Zyppi's current
development already has GS1 context, but ZyPub itself should not become
GS1-specific.

------------------------------------------------------------------------

## 32. Suggested Prototype Direction

A minimal experiment could test the idea without prematurely creating a
new architecture.

### Prototype objective

Demonstrate that a normal display can publish a useful signed
Zyppi-compatible payload to an ordinary smartphone without Internet
connectivity.

### Candidate payload

For example:

-   GS1 identifier;
-   asset identity;
-   current status;
-   timestamp;
-   publication sequence;
-   small evidence record;
-   issuer signature;
-   manifest.

### Candidate optical implementation

-   standard animated QR;
-   approximately 5--10 fps initially;
-   conservative payload size;
-   redundant fragments;
-   periodic bootstrap/keyframes;
-   local signature verification.

### Questions to measure

-   acquisition time;
-   cold-start time;
-   successful decode rate;
-   distance;
-   viewing angle;
-   sunlight/glare performance;
-   low-end camera performance;
-   interrupted scan recovery;
-   payload size;
-   error-correction overhead;
-   battery/CPU cost;
-   replay detection;
-   user tolerance.

The prototype should validate the physics before Zyppi commits to a
bespoke optical encoder.

------------------------------------------------------------------------

## 33. Questions Still Open

Before any proposal is promoted into architecture, several questions
require investigation.

### Semantic

-   Is "Observable Constitutional State" necessary, or can existing ZRM
    concepts express everything?
-   Is a ZyPub Capsule a new object, a projection, an envelope, or
    merely serialization?
-   What constitutes an independently valid progressive layer?
-   How should uncertainty and freshness be represented using existing
    Zyppi semantics?

### Trust

-   How are offline trust roots provisioned?
-   How is revocation represented?
-   What operations can safely occur under bounded offline standing?
-   How are conflicting offline intents reconciled?
-   What freshness guarantees are actually achievable?

### Transport

-   What practical throughput is achievable on commodity phones?
-   Is animated QR sufficient?
-   Are fountain codes necessary?
-   How frequently should bootstrap frames repeat?
-   Is RGB encoding worth its reliability cost?
-   How should different display refresh rates be handled?

### Security

-   Which publications are public?
-   Which require encryption?
-   How does recipient-specific disclosure work?
-   How are replay and truncation attacks detected?
-   What metadata itself may leak sensitive information?

### Product

-   Which use case has enough pain to justify ZyPub?
-   Is "Zync" globally defensible as a brand?
-   Should ZyPub be marketed as offline capability or direct
    publication?
-   Does the optical renderer need a separate consumer-facing name?

### Governance

-   Where should this concept live in the existing Zyppi corpus?
-   Does it require any constitutional change at all?
-   Which parts are architecture, runtime specification, gateway
    implementation, and product branding?
-   How can the proposal avoid creating a shadow architecture alongside
    existing ZRM/RI/CAW structures?

------------------------------------------------------------------------

## 34. Proposed Principles for Further Exploration

The discussion suggests the following candidate principles.

### P1 --- Carrier Agnosticism

Zyppi semantics should not depend on a physical communication medium.

### P2 --- Same Reality, Different Acquisition

Connected resolution and direct publication should converge on the same
canonical semantics.

### P3 --- Trust Is Computed

A publication carries claims, evidence, attestations, and cryptographic
material. Trust remains an evaluated result.

### P4 --- Observation Before Execution

Receiving a publication should not itself cause an unrelated
state-changing execution.

### P5 --- Explicit Freshness

Disconnected observations must expose the limits of what is known about
current standing.

### P6 --- Progressive but Verifiable

Progressive disclosure should maximize usefulness without allowing
incomplete transport fragments to masquerade as verified evidence.

### P7 --- Runtime Purity

Physical carrier mechanics should terminate before the canonical Runtime
boundary.

### P8 --- Economic Fit Before Technical Novelty

Optical publication should be used where it solves a real problem better
than static QR, NFC, BLE, or ordinary network resolution.

### P9 --- Open Carrier Ecosystem

ZyPub should be capable of supporting multiple encoders and carriers
rather than depending on a proprietary visual matrix.

### P10 --- Graceful Degradation

Interrupted or low-quality observation should produce an explicit,
bounded result rather than ambiguous success.

------------------------------------------------------------------------

## 35. Proposed Conceptual Architecture

``` text
                           REALITY
                              │
                              ▼
                 ZRM / Canonical Representation
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
              Zync                        ZyPub
        Connected resolution        Direct publication
                │                           │
          Zyppi URL/API                ZyPub Capsule
          SDK / MCP / Web                    │
                │                    Publication profile
                │                           │
                │                    Exchange / Gateway
                │                           │
                │                   Carrier adapters
                │                 ┌─────┼─────┬─────┐
                │                 QR   NFC   BLE   ...
                │                           │
                └─────────────┬─────────────┘
                              ▼
                         OBSERVATION
                              │
                              ▼
                     Constitutional Runtime
                              │
                    Evidence / Policy / Trust
                              │
                              ▼
                         EXECUTION
                      when authorized
```

This is an exploratory architecture diagram, not an approved stack.

------------------------------------------------------------------------

## 36. The Central Proposition

The entire brainstorming session can be reduced to one proposition:

> **Zyppi should investigate whether every useful constitutional
> representation can be made observable through two complementary modes:
> connected resolution through Zync and bounded direct publication
> through ZyPub. The semantics remain canonical; only the method of
> acquisition changes.**

This would allow Zyppi to operate across a continuum:

``` text
Fully Connected
      │
      │ Zync
      │
Intermittently Connected
      │
      │ Zync + ZyPub
      │
Disconnected
      │
      │ ZyPub
      │
Air-Gapped
```

The architectural value is not merely offline support.

It is **communication independence**.

------------------------------------------------------------------------

## 37. Closing Proposal

The original question concerned animated QR codes.

The resulting idea is considerably broader.

**ZyPub** could become a direct-publication capability through which
physical and digital entities expose bounded, verifiable representations
of themselves without requiring the observer to resolve a remote
pointer.

**Zync** could represent the complementary connected capability through
which an observer accesses the current living representation maintained
across Zyppi's networked systems.

Together they suggest a future in which:

> **Zyppi's representation of reality is not dependent on the network
> being present.**

When connected, resolve reality.

When direct publication is preferable, publish reality.

The transport can change.

The semantics should not.

------------------------------------------------------------------------

## 38. Status and Next Step

This document intentionally records **proposals, hypotheses, and
suggested directions only**.

It does **not**:

-   ratify ZyPub or Zync;
-   create constitutional primitives;
-   amend ZRM, SIOS, CAW, RI, SEC, POL, or other governing series;
-   authorize implementation;
-   establish milestone scope;
-   select a market wedge;
-   mandate an optical protocol;
-   declare the proposed vocabulary final.

A sensible next step would be to subject the concept to two independent
investigations:

1.  **Constitutional/architectural fit:** map the proposal against the
    current ratified Zyppi corpus and identify which existing constructs
    already cover it.
2.  **Technical feasibility:** build a deliberately small optical
    publication experiment to establish real-world throughput,
    reliability, and security constraints before designing a ZyPub
    specification.

Only after those investigations should the Council decide whether ZyPub
and Zync warrant formal architectural treatment.

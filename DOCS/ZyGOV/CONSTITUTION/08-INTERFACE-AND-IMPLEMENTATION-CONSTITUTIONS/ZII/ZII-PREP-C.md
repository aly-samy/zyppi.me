# ZII-PREP-C — zTOUCH / zTouch Envelope Constitutional Collision Audit

| Field | Value |
| :--- | :--- |
| **Status** | COMPLETE FOR PREP PURPOSES — PASS WITH REQUIRED REFACTOR |
| **Implementation authority** | NONE |
| **Primary question** | Can zTOUCH and the proposed zTouch Envelope survive without creating parallel Identity, Context, Intent, Trust, Policy, Evidence, Profile, or Runtime semantics? |

---

## Executive Verdict

**Yes, zTOUCH can survive. Yes, an envelope concept can survive.** But the original envelope model must be narrowed and renamed semantically.

The original proposal described the envelope as:
```text
Identity
Context
Intent Hints
Trust / Seal
```
while explicitly warning that it should not create a parallel constitution.

That warning was correct, because the four labels collide directly with already-governed Zyppi concepts.

The constitutional-safe formulation is instead:
> **A zTouch Envelope is a bounded, carrier-facing representation that may transport references, descriptive assertions, interaction hints, and integrity/provenance material. It does not own or determine the constitutional meaning of anything it carries.**

The core correction is:

| Old conceptual language | PREP-C safe language |
| :--- | :--- |
| Identity | → **Resolution / Identity Reference** |
| Context | → **Contextual Reference / Descriptive Assertion** |
| Intent Hints | → **Interaction Hints referencing governed vocabulary** |
| Trust / Seal | → **Integrity / Provenance / Attestation Material** |
| Version | → **Envelope/Binding Version only** |

This is not cosmetic. It changes the constitutional ownership model.

---

## zTOUCH: No Constitutional Collision If Properly Scoped

ZRM already defines **Touchpoint**.
A Touchpoint is an Object playing the structural role of an access mechanism into identity resolution; Touchpoint, resolved Identity, and Referent remain distinct.

Therefore zTOUCH must not mean:
- a new kind of constitutional Touchpoint
- a new Identity system

The surviving meaning is:
> **zTOUCH is a Zyppi interaction/protocol initiative for creating richer interoperable uses of already-governed Touchpoints.**

Conceptually:
```text
ZRM
│
└── Touchpoint
      │
      ▼
zTOUCH protocol/product family
      │
      ├── zQR
      └── zNFC ...
```
zTOUCH is therefore subordinate to the existing Touchpoint meaning.

**PREP-C disposition:**
`zTOUCH: SURVIVES — ADAPT`
- Not a primitive.
- Not a new ontology.
- Not a ZII engine framework.

---

## zTOUCH and ZII Remain Distinct

The clean relationship is:

```text
zTOUCH
"What should a Zyppi-aware touchpoint carry or expose?"
      │
      ▼
ZII
"How do we technically encode/materialize/capture it?"
      │
      ├── ZQE
      └── NFC Engine
```

This preserves:
- `zQR ≠ ZQE`
- `zTOUCH ≠ ZII`

A zQR may use ZQE.
ZQE does not need zQR.
That remains one of the strongest architectural separations produced by PREP.

---

## Field Collisions & Refactoring

### Identity Field Collision
The exploratory envelope asks:
> *"Who am I?"*

and suggests identity reference, identity class/type reference, envelope version, and issuer reference.

There are two problems.
1. The carrier is not the Identity.
2. The value carried by a QR/NFC/etc. may not even be a canonical Zyppi Identity. It could be:
   - GS1 identifier
   - ZPI address
   - external URI
   - customer identifier
   - opaque resolution token
   - other governed access path

ZRM already defines Touchpoint resolution as:
```text
AccessPath
      ↓
  resolve()
      ↓
   Identity
```
So the envelope should not conceptually say:
```typescript
identity: ...
```
as though it contains constitutional Identity.

**Safer concept:**
`Resolution Reference` or, where exact semantics justify it, `Identity Reference`

With one critical invariant:
> **The reference never becomes the Identity merely because it is carried by the envelope.**

**Identity type/class:**
This is more dangerous.
Something like `type = product` could collide with ARM/domain/profile semantics.
Therefore an envelope may only carry a governed external or constitutional classification reference where one already exists.
It shall not invent its own type system.

| Candidate content | Disposition |
| :--- | :--- |
| Identity object | **PROHIBITED** |
| Resolution reference | **SURVIVES** |
| Existing Identity reference | **SURVIVES as reference** |
| External identifier | **SURVIVES under external authority** |
| Free-form identity type | **PROHIBITED** |
| Governed profile/class reference | **OPTIONAL REFERENCE** |
| Issuer reference | **SURVIVES, but creates no authority by itself** |

### Context Field Collision
The original proposal was already cautious: it suggested carrying only stable information and warned that printed context can become stale.

The newer Z-PROF architecture makes the boundary stronger.
The ratified Z-PROF contract explicitly distinguishes:
```text
Context Requirement
      ≠
Context Interpretation
```
and permits Z-PROF to route or require Context without acquiring authority to interpret it.

Z-PROF's Domain Template architecture also explicitly treats Time, Place, Jurisdiction, Actor, Intent, Transaction Context, etc. as governed dimensions rather than arbitrary metadata.

Therefore a zTouch Envelope cannot introduce:
```text
context = current truth
location = authoritative current Place
warrantyActive = true
```
as an unqualified constitutional fact.

**Three different things must be separated:**

| Category | Description | Examples |
| :--- | :--- | :--- |
| **A. Envelope metadata** | Describes the envelope itself | envelope version, carrier binding version, encoding identifier |
| **B. Descriptive assertions / references** | Claims or references (non-authoritative unless validated) | batch reference, location reference, product-class reference, issuer-supplied descriptor |
| **C. Evaluation Context** | Belongs downstream | Z-PROF/AMS-0860 explicit version/context/evidence/evaluation bindings |

**PREP-C disposition:**
The top-level envelope field named simply:
`Context`
**DOES NOT SURVIVE.**

Replace conceptually with:
`Contextual References / Descriptive Assertions`
and treat all such content as non-authoritative unless separately validated under its governing source.

### Intent Hints Collision
This is subtler.
The original proposal correctly says Intent Hints are not capabilities or permissions and proposes reusing Zyppi's governed closed Intent vocabulary.

But ZRM defines Intent more precisely:
> *Intent is a Relationship between a Subject and a desired candidate future State.*

It also preserves the closed vocabulary such as Discover, Access, Verify, Authenticate, Register, Claim, Purchase, Transfer, Return, Support, Subscribe and Trigger.

Therefore:
```text
QR says "Verify"
```
does not itself instantiate:
```text
intent(subject, object, futureState)
```
There may not even be an identified Subject yet.
That means calling the carrier field `Intent` would be constitutionally wrong.
Calling it `Intent Hint` is better, but still close enough to create confusion.

**PREP-C distinction:**

| Concept | Structure |
| :--- | :--- |
| **Actual Intent** | Subject → desires → future State |
| **Carrier Interaction Hint** | "This touchpoint commonly supports interactions of category Verify" |

The second is discoverability metadata, not an Intent Relationship.

**Preferred working language:**
`Interaction Hints`

These may reference the governed Intent vocabulary:
```yaml
interactionHints:
  - Verify
  - Register
  - Support
```
but the semantics are explicitly:
> *"These interaction categories may be relevant."*

not:
> *"An Actor has expressed these Intents."*

and certainly not:
> *"These actions are authorized."*

**Important consequence:**
Interaction Hints should be moved out of the mandatory envelope core.
Many touchpoints need none.
They should be an optional zTOUCH extension.

**PREP-C disposition:**
`Intent Hints` → **ADAPT to Interaction Hints.**
- reference governed labels;
- never instantiate constitutional Intent;
- never imply authorization;
- never imply applicability;
- optional extension only.

### Trust / Seal Collision
This is the clearest collision.

SEC defines Trust as a governed lifecycle involving Identity, attestation, capability, policy satisfaction and Runtime compliance. Only active Trust may authorize execution.

Z-PROF independently reinforces the boundary:
> *Z-PROF consumes SEC-governed security/trust mechanisms and cannot create alternative trust, attestation, or cryptographic authority.*

And the ZyPub exploration reached the same insight:
> *Trust is computed, not transported.*

Therefore:
`Trust / Seal`
must be removed from the zTouch Envelope vocabulary.

A carrier can contain:
- signature
- issuer reference
- certificate reference
- attestation reference
- content digest
- key identifier
- proof material

A technical reader can potentially conclude:
```text
signature cryptographically valid
```
It cannot conclude:
```text
constitutionally trusted
```
without SEC/POL/standing/current-state evaluation.

**Replacement concept:**
`Integrity & Provenance Material`
or more generally:
`Proof Material`

This tells the truth about what the carrier may possess without claiming what SEC will conclude.

**PREP-C disposition:**
`Trust / Seal` → **REJECT as formal envelope terminology.**
Replace with:
`Integrity / Provenance / Attestation Material`
subject to future security profile design.

### Version Collision
Version itself is legitimate—but only if scoped.

The zTouch Envelope may own:
- `envelopeVersion`
- `bindingVersion`

For example:
- zTouch envelope v1
- zQR binding v1

But it must not silently own or float:
- ARM profile version
- Z-PROF composition version
- POL version
- SEC state
- ZPI protocol version
- GS1 specification version
- engine version

The Z-PROF contract already requires explicit version binding and prohibits silently floating across incompatible constitutional artifacts.
Similarly ZQE will separately have `zqe/1` for encoding reproducibility.

Thus:
```text
zTouch Envelope version
      ≠
zQR binding version
      ≠
ZQE encoding profile
      ≠
payload protocol version
      ≠
domain composition version
```
This is now a PREP-C rule candidate.

---

## Envelope vs. Existing Constitutional Artifacts

### zTouch Envelope vs. CompositionManifest
This collision is now decisively resolved.
They are not competing representations.

Z-PROF's ratified `CompositionManifest` answers:
> *"Which governed constitutional artifacts satisfy the requirements of this domain composition, and how are they bound?"*

It can reference ARM Profiles, Epistemic Requirements, PRJ, RSN, Context requirements, POL, SEC, RI, version constraints, provenance, and successful Application resolution may produce a version-bound, provenance-preserving Bound Constitutional Payload which remains non-authoritative over its sources.

A zTouch Envelope must do nothing remotely as broad.

**Forbidden architecture:**
```text
Physical carrier
      ↓
zTouch Envelope
      ↓
contains full constitutional composition
      ↓
Runtime
```
That would create a second Z-PROF/application assembly system.

**Correct architecture:**
```text
Physical carrier
      ↓
zTouch Envelope / standard payload
      ↓
technical decode
      ↓
resolution references + bounded claims/hints/proof
      ↓
Application
      ↓
Registry / Evidence / Z-PROF / POL / SEC
      ↓
CompositionManifest / governed assembly
      ↓
Bound Constitutional Payload
      ↓
RI
```
This matches the current physical Z-PROF topology, where physical carrier parsing precedes resolution, composition, Application assembly, EvaluationCoordinate, and RI.

**PREP-C conclusion:**
The zTouch Envelope is a carrier/bootstrap artifact, not a constitutional composition artifact.
That boundary is now closed for PREP purposes.

### zTouch Envelope vs. EvaluationCoordinate
They are also fundamentally different.

AMS-0860 treats evaluation identity as a deliberately bound construct involving semantic configuration, exact dependencies, explicit temporal coordinates, pinned semantic/assessment states, Evidence integrity and no ambient trust/time.

The zTouch Envelope must never attempt to be:
`portable EvaluationCoordinate`
by embedding:
- current policy
- current trust
- current authority
- current state
- ambient current location
- ambient current time

A carrier may provide an input later consumed when constructing an EvaluationCoordinate.
It is not itself the EvaluationCoordinate.

---

## Minimal Envelope Architecture Emerging from PREP-C

The original envelope was too semantically ambitious.
A safer conceptual architecture is:

```text
zTouch Carrier Envelope
│
├── Envelope Metadata
│     └── envelope/binding version
│
├── Resolution Reference
│     └── ZPI / GS1 / URI / governed external reference
│
├── Optional Descriptive Assertions / References
│     └── explicitly non-authoritative carrier-local material
│
├── Optional Interaction Hints
│     └── governed vocabulary references, not actual Intent
│
└── Optional Integrity / Provenance Material
      └── signature / issuer / attestation references / hashes
```

This is conceptual only.
Not a schema.
Not a JSON contract.
Not a URI grammar.
Not implementation authority.

---

## The Core Should Probably Be Much Smaller Than Originally Imagined

PREP-C produces a further refinement:
> **Not every zTOUCH should require a rich Envelope.**

For many situations, the best zTOUCH may simply be:
`standard interoperable resolution reference`

Example:
- GS1 Digital Link
- eventually: ZPI address

Then richer envelope features are optional where justified.

I would therefore model zTOUCH conceptually as:

```text
zTOUCH
│
├── Baseline Binding
│     └── interoperable resolution/access reference
│
└── Optional Extensions
      ├── descriptive assertions
      ├── interaction hints
      └── integrity/provenance material
```

This has several advantages:
- It keeps QR payloads short.
- It preserves GS1.
- It supports constrained NFC/RFID carriers.
- It minimizes privacy exposure.
- It avoids encoding stale Reality.
- It makes zTOUCH usable even before every advanced semantic feature exists.

---

## Graceful Degradation Model Improvement

The original proposal had:
```text
Generic Scanner
      ↓
zQR-aware Reader
      ↓
Trust-aware Reader
      ↓
Zyppi Resolution
      ↓
Reality / Intelligence
```

The collision audit suggests a more precise form:

```text
Level 1 — Carrier Native
Standard reader obtains useful baseline payload
            ↓
Level 2 — zTOUCH Aware
Reader understands envelope/binding structure,
references and non-authoritative hints
            ↓
Level 3 — Proof Aware
Reader can technically validate available
integrity/provenance material
            ↓
Level 4 — Zyppi Resolved
Zyppi resolves Identity, Reality, Context,
Evidence, Policy and SEC state
            ↓
Level 5 — Governed Execution / Interpretation
RI / PRJ / RSN / appropriate authorities
```

Notice the correction:
> **"Trust-aware" becomes "Proof-aware."**
> Actual Trust remains downstream.

---

## Relationship to External & Adjacent Systems

### Relationship to GS1
The original proposal correctly says zTOUCH should preserve external standards rather than replace them.
PREP-C strengthens that.

For GS1:
`GS1 Digital Link`
may already carry sufficient resolution semantics.

Therefore zTOUCH must not insist on wrapping it in a proprietary semantic container simply because an envelope exists.

**Possible lawful behavior:**
```text
GS1 Digital Link directly
      ↓
zQR binding behavior / Zyppi resolution
```
or, where standards permit and value justifies it:
```text
GS1-governed identifier/reference
      +
bounded zTOUCH extension
```
But GS1 semantics remain GS1's.
The envelope does not "translate GS1 into Zyppi."
That translation/application work remains in the proper domain/Z-PROF/application boundary.

### Relationship to ZPI/zPIS
The same result applies to future ZPI.
The zTouch Envelope does not create physical identity addresses.
It may carry:
`zpi.to/...`
or another ZPI address/reference.

Therefore:
- **ZPI** = addressing / resolution identity
- **zTOUCH** = interaction semantics / carrier binding
- **ZII** = technical carrier infrastructure
- **ZQE** = QR mathematics

These remain independently replaceable.

### Relationship to ZyPub
This audit also prevents another future collision.
A zTouch Envelope and a ZyPub Capsule must not become the same artifact.

The ZyPub proposal contemplates bounded publication containing identity material, state, Evidence, attestations, domain projections and potentially graph fragments.
That is potentially much richer than a touchpoint bootstrap envelope.

So:
- `zTouch Envelope` = compact interaction/bootstrap representation
- `ZyPub Capsule` = bounded published representation

A ZyPub publication may use a zTOUCH/ZII carrier.
It may even carry a resolution reference also used by zTOUCH.
But it does not collapse into the zTouch Envelope.

---

## Golden Question Collision Test

The envelope may carry information related to Golden Question dimensions, but it cannot manufacture them.

| Golden Question | zTouch Envelope may | zTouch Envelope must not |
| :--- | :--- | :--- |
| **Who?** | carry Subject/issuer/reference | declare constitutional Subject authority |
| **Did what?** | carry an assertion/event reference | create Event truth merely by serialization |
| **To whom?** | carry Object/Identity/reference | redefine Referent/Identity |
| **Where?** | carry Place/contextual claim/reference | infer current Place |
| **When?** | carry valid-time/publication-time claim | treat scan time as Valid Time automatically |
| **How do we know?** | carry proof/evidence references/material | declare Evidence verified or Trust established |

This is the decisive boundary:
> **The envelope carries representations relevant to the Golden Question. It does not answer the Golden Question by itself.**

---

## PREP-C Disappearance Test

We should require:
1. If zTOUCH disappeared tomorrow, would ZRM Identity, Touchpoint, GS1 identifiers, ZPI addresses, Context, Intent, SEC Trust, POL authorization, Z-PROF compositions and RI execution remain independently meaningful?
   **Yes.**
2. If the zTouch Envelope disappeared and a carrier exposed only an ordinary resolution reference, could Zyppi still function?
   For the baseline architecture, the answer should also be: **Yes.**

This is a powerful reason to make the rich envelope optional rather than universal.
It matches Z-PROF's own disappearance principle: composition must not acquire ownership over the artifacts it references.

---

## PREP-C Prohibited Forms

The audit rejects the following conceptual forms:

```text
identity = embedded constitutional Identity object
context = current authoritative state
intent = Verify                    (when no Subject/future-State relationship exists)
capability = Claim                 (when it actually means authorization)
trusted = true
valid = true
authorized = true
warrantyActive = true              (as unqualified permanent carrier truth)
compositionManifest = {...}        (inside the envelope as a replacement for Z-PROF/App assembly)
evaluationCoordinate = {...}       (inside the carrier as a substitute for downstream deterministic binding)
```

These are now architecturally prohibited hypotheses for the future envelope design unless a governing authority explicitly introduces an independently justified mechanism.

---

## Candidate zTOUCH Invariants Emerging from PREP-C

These remain PREP findings, not ratified ZII/zTOUCH law.

| ID | Candidate invariant |
| :--- | :--- |
| **ZT-C01** | zTOUCH SHALL NOT redefine constitutional Touchpoint |
| **ZT-C02** | Carrier Reference ≠ Identity |
| **ZT-C03** | Descriptive Assertion ≠ current Context |
| **ZT-C04** | Interaction Hint ≠ Intent |
| **ZT-C05** | Interaction Hint ≠ Capability or authorization |
| **ZT-C06** | Proof Material ≠ Trust |
| **ZT-C07** | Signature Validity ≠ current constitutional standing |
| **ZT-C08** | Envelope Version ≠ payload/domain/engine version |
| **ZT-C09** | Envelope ≠ CompositionManifest |
| **ZT-C10** | Envelope ≠ Bound Constitutional Payload |
| **ZT-C11** | Envelope ≠ EvaluationCoordinate |
| **ZT-C12** | External standards retain semantic authority |
| **ZT-C13** | Rich envelope semantics SHALL remain optional where a simpler interoperable reference suffices |
| **ZT-C14** | Removing zTOUCH SHALL NOT invalidate underlying constitutional artifacts |
| **ZT-C15** | No carrier representation may make a claim stronger than its governing Reality/Evidence supports |

*ZT-C15 directly follows the Z-PROF Naked Reality constraint that interpretation or representation must not make a claim stronger than the Reality and Evidence supporting it.*

---

## Final Field-by-Field Disposition

| Original proposal | PREP-C outcome |
| :--- | :--- |
| Identity | **REFACTOR** → Resolution/Identity Reference |
| Identity Class / Type | Only governed reference; no zTOUCH type system |
| Context | **REFACTOR** → contextual references/descriptive assertions |
| Intent Hints | **REFACTOR** → Interaction Hints; optional |
| Trust / Seal | **REJECT terminology** → Integrity/Provenance/Attestation Material |
| Version | **KEEP**, strictly scoped to envelope/binding |
| Issuer | **KEEP** as reference, never inherent authority |
| Signature | **OPTIONAL** proof material, not Trust |
| Current State | **NOT** baseline carrier authority |
| Policy/Authorization | **PROHIBITED** |
| Composition | **PROHIBITED** as envelope-owned constitutional composition |
| Evidence truth | **PROHIBITED** |
| Carrier-specific serialization | Owned by zTOUCH binding/ZII implementation layer |

---

## PREP-C Closure Verdict

**PREP-C PASSES WITH REFACTOR.**

The most important result is that we do not need to abandon the zTouch Envelope idea.
But we should stop thinking of it as:
> *"a miniature packet containing Identity + Context + Intent + Trust."*

That would indeed be a shadow constitution.

The surviving model is:
> **A zTouch Carrier Envelope is an optional, compact, carrier-facing representation for conveying a resolution reference plus bounded non-authoritative metadata, interaction hints, and integrity/provenance material. All constitutional meaning remains with the authorities that already own it.**

In shortest architectural form:

```text
zTouch Envelope
carries
  REFERENCES
  CLAIMS
  HINTS
  PROOF MATERIAL

    but never carries
CONSTITUTIONAL SOVEREIGNTY
```

With PREP-C closed, the next blocking phase is **PREP-D — CEngS Layer Eligibility & Monorepo Governance Audit**: determine exactly where ZII/ZQE packages may live, how their dependency roles are classified, how CAW-004 ceases to be the implicit global package authority, and how the repository validators become multi-program without weakening existing boundaries.

---

## Chair Review & Final Closure Amendments

> *I agree with this review and would treat it as a PREP-C closure amendment, not as a reopening of the phase.*

The reviewer's strongest contribution is that it finishes the semantic cleanup we started. The original proposal explicitly wanted zTOUCH to enrich the existing Touchpoint→Identity boundary without creating a new constitutional primitive, and it required ordinary QR interoperability rather than a proprietary symbology. The revised model now expresses that intent much more accurately.

### PREP-C — Final Closure Amendments

#### 1. Resolution Reference → Access Reference
**Adopted.**
Resolution Reference was safer than Identity, but still unnecessarily semantic. `Access Reference` describes what the carrier actually possesses without claiming either Identity or Resolution.

The canonical working abstraction becomes:
```text
Access Reference
│
├── Identity Reference
├── GS1 Identifier
├── GS1 Digital Link
├── ZPI Address
├── URI
├── External Identifier
└── Opaque Access / Resolution Token
```

The governing distinction is:
```text
Access Reference
      ↓
resolution process
      ↓
   Identity
```
Therefore:
> **An Access Reference may enable or participate in resolution. It is neither the resolved Identity nor the Resolution itself.**

This is also closer to the original proposal's own idea of the QR as a durable access mechanism to persistent Identity.

#### 2. Integrity / Provenance / Attestation Material → Integrity & Provenance Material
**Adopted.**
The reviewer is right that even the word *Attestation* already carries governed security meaning.
SEC defines Trust through bounded, revocable attestation, capability, policy, context, and Runtime compliance; Trust is never self-declared or permanent.

So the carrier-level neutral category becomes:
`Integrity & Provenance Material`

It may contain things such as:
- signature
- digest
- issuer reference
- key identifier
- certificate reference
- attestation reference
- embedded externally governed attestation
- proof commitment

with the standing rule:
> **Any governed artifact transported inside zTOUCH retains the authority, schema, lifecycle, interpretation, and validity rules of its original governing system.**

Thus an SEC attestation inside a carrier remains an SEC attestation.
zTOUCH does not wrap it and thereby become its owner.

#### 3. The Four Carrier-Material Categories Are Now Formal PREP Terminology
**Adopted:**
1. **REFERENCES**
2. **ASSERTIONS**
3. **HINTS**
4. **PROOF MATERIAL**

This is much stronger than the original: *Identity, Context, Intent, Trust*.
The four categories have deliberately different epistemic meanings.

| Category | Example | Meaning |
| :--- | :--- | :--- |
| **Reference** | `placeRef = P123` | Look to governed/external object P123. It does not assert that P123 is currently applicable. |
| **Assertion** | `productionPlace = P123` | Some identified source asserts that production occurred at P123. Its truth still depends on provenance, evidence, valid time, authority, etc. |
| **Hint** | `Verify` | This interaction category may be relevant. It does not instantiate Intent and grants no Capability. |
| **Proof Material** | `signature`, `digest`, `issuer key reference` | Material exists which may support technical or constitutional verification. It does not equal Trust. |

*Note: Avoiding `Claim` as the generic category name because `Claim` already appears in the governed Intent vocabulary in the original zTOUCH exploration.*

#### 4. Baseline Binding Becomes the Center of zTOUCH
This is the most important architectural improvement.

I would now replace the old conceptual model:
```text
zTouch Envelope
├── Identity
├── Context
├── Intent Hints
└── Trust
```
with:
```text
zTOUCH
│
├── Carrier Binding
│     └── Access Reference
│
└── Optional Extensions
      ├── References
      ├── Assertions
      ├── Hints
      └── Proof Material
```

That means the envelope itself is no longer necessarily mandatory.
In fact, the minimum valid zTOUCH interaction may contain no rich envelope at all.

For GS1, for example:
```text
standard QR
      ↓
GS1 Digital Link
      ↓
Zyppi-aware provisioning / binding
      ↓
Zyppi resolution
```
may be completely sufficient.

That is consistent with the earlier exploration, which explicitly wanted standards-compatible QR and raised the open question of whether a GS1 zQR might simply be a GS1 Digital Link plus Zyppi behavior.

This is a better architecture because complexity becomes optional rather than compulsory.

#### 5. This Changes the Likely Definition of zQR
I agree that PREP-C should explicitly expose this question.

The original proposal treated zQR as the first carrier implementation of zTOUCH and emphasized that it should remain an ordinary interoperable QR rather than a proprietary symbology.

That suggests a strong possibility:
> **zQR may be defined primarily by provisioning/binding and Zyppi behavior rather than by a proprietary payload syntax.**

Conceptually:
```text
Standard QR
   +
zTOUCH-compatible binding/provisioning
   +
Zyppi-aware interaction behavior
      ↓
    zQR
```

This is strategically valuable.
A QR containing a perfectly ordinary:
`https://id.gs1.org/...`
could potentially still be a zQR because of how the Touchpoint has been provisioned and behaves inside Zyppi.

Therefore add:
> **ZT-OQ-01 — zQR Conformance Identity**
> Determine the minimum condition under which a standards-compliant QR is designated a zQR. Payload syntax alone SHALL NOT be presumed sufficient or necessary to establish zQR status.

Potential answers to test later include:
A. Payload-defined
B. Provisioning-defined
C. Binding/profile-defined
D. Registry-defined
E. Combination

*PREP-C does not choose yet.*

#### 6. The Golden Question Wording Is Amended
I agree with the philosophical correction.

Previously:
> *The envelope carries representations relevant to the Golden Question. It does not answer the Golden Question by itself.*

Replace with:
> **A zTOUCH carrier may transport answers asserted by governed or external sources; carriage alone does not establish their constitutional truth, authority, standing, freshness, or current applicability.**

That is much more exact.
For example, a manufacturer may legitimately assert:
```text
batch = B2026
manufacturedAt = 2026-08-14
manufacturedPlace = P123
```
The mistake would be saying that the QR makes those facts Reality merely because it carries them.

---

## Final PREP-C Architecture

The phase now closes on this model:

```text
EXISTING ZRM TOUCHPOINT
      │
      ▼
zTOUCH
interaction profile/family
      │
      ├── Carrier Binding
      │       │
      │       └── Access Reference
      │
      └── Optional Extensions
              │
              ├── References
              ├── Assertions
              ├── Hints
              └── Proof Material
      │
      ▼
technical carrier
      │
      ▼
ZII
encode / materialize
capture / decode
      │
      ▼
Application
resolution / admission
      │
      ├── ZRM/Z-PROF
      ├── SEC/POL
      └── Evidence
      │
      ▼
RI
```

The future ZRB proposal remains relevant only when physical observation/actuation requires constitutional admission. Its own exploratory document already separates technical device processing from constitutional meaning and says device success does not automatically prove physical Reality.

---

## Five PREP-C Axioms

I would retain exactly the five concise rules the reviewer identified:

1. **Reference ≠ Identity**
2. **Assertion ≠ Reality**
3. **Hint ≠ Intent**
4. **Proof ≠ Trust**
5. **Carrier ≠ Authority**

They are an unusually good summary of the entire collision audit.

I would add one structural rule beside them:
6. **Binding ≠ Payload Syntax**

because that protects the possibility that zQR/zNFC status can arise through provisioning or binding without forcing proprietary carrier syntax.

---

## Updated Disposition of the Original zTouch Envelope

| Original element | Final PREP-C disposition |
| :--- | :--- |
| Identity | Replace with **Access Reference** |
| Context | Split into **References** and **Assertions** |
| Intent Hints | Replace with optional **Hints** |
| Trust / Seal | Replace with **Proof Material / Integrity & Provenance Material** |
| Envelope mandatory | **Rejected** |
| Carrier Binding | **Promoted to baseline** |
| Rich extensions | **Optional** |
| Version | Keep, scoped to binding/envelope only |
| zQR defined by proprietary syntax | **Not assumed; OPEN** |
| zTOUCH as new constitutional primitive | **Rejected** |

The original document explicitly said the zTouch Envelope was conceptual, not yet a schema, URI syntax, or binary specification. That gave us exactly the freedom PREP-C needed to refactor it without breaking any ratified contract.

---

## Final PREP-C Status

**CLOSED — PASS WITH REFACTOR INCORPORATED.**

The canonical PREP-C finding is now:

> **zTOUCH is a non-sovereign interaction profile family built upon existing Touchpoints. Its baseline is a carrier binding to an Access Reference. Optional carrier material may consist of References, Assertions, Hints, and Proof Material. None of those categories acquires the constitutional authority of the concepts it references, asserts, hints toward, or helps verify.**

And the minimal architecture is deliberately simple:

```text
zTOUCH
  = Carrier Binding
  + Access Reference
  + optional portable information

    NOT:
  = miniature constitutional payload
```

That closes the semantic collision problem sufficiently for preparation.

PREP-D — CEngS Layer Eligibility & Monorepo Governance Audit is now unblocked.
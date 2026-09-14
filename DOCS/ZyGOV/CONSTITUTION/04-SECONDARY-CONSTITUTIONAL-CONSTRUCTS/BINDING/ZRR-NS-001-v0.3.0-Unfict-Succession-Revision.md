# ZRR-NS-001

## Unfict Routing North Star — Resource Resolution Governance

**Document ID:** `ZRR-NS-001`  
**Version:** `0.3.0`
**Status:** **DRAFT — UNFICT SUCCESSION REVISION / RATIFICATION CANDIDATE**
**Date:** 14 September 2026
**Succession Authority:** `ZYPPI-UNFICT-SUCCESSION-DECLARATION-001 / ZUSD-001 v1.0 — RATIFIED`
**Platform Lineage:** `Zyppi → Unfict`
**Ratification Effect:** NONE until separately ratified
**Classification:** Strategic Architecture Direction + Resource Resolution Governance Boundary  
**Implementation Authority:** **NONE**  
**Repository Mutation Authority:** **NONE**  
**Relationship to Unfict North Star:** Subordinate to `NORTH STAR v7.0 — Unfict — Reality Sync`  
**Public Addressing Parent/Peer Boundary:** `ADDRESSING-001 v0.4.0`  
**Coordinates With:** ZRM · Z-PROF · OWNERSHIP-001 · DELEGATION-001 · POL · SEC · Evidence · RI · ZII · ZQE · ZYAPI · applicable external Address Family owners  
**Derived Serving Profiles:** `CUSTOM-DOMAIN-ARCHITECTURE-001 v0.4.0` · `DOMAIN-BINDING-001 v0.3.0` · `EDGE-RESOLUTION-GATEWAY-001 v0.3.0`  
**Supersedes:** `ZRR-NS-001 v0.3.0 — RATIFIED`
**Current Proving Ground:** Persistent public routing · customer domains · GS1  
**Long-Term Target:** **Durable, typed, federatable Resource Resolution for admitted Reality-linked public references**

---

# 0. Revision Purpose

`v0.2` preserves the original ZRR North Star:

> **Identify once. Resolve forever.**

and the architectural analogy:

> **DNS for Reality.**

But it corrects three issues exposed by ADDRESSING and ZRM reconciliation:

1. **Public addressing mechanics are not ZRR-owned.**  
   Namespace classes, Public Namespace Registry, `NamespaceBinding`, Address Family allocation, public-address lifecycle and Internet-binding constraints belong to ADDRESSING.

2. **ZRM Semantic Resolution is not ZRR Resource Resolution.**  
   ZRR does not determine which Reality constituent a Representation factually refers to.

3. **Edge serving is projection, not a second Resolution authority.**  
   ZRR may publish serving projections/read models, but Edge Gateway does not acquire ZRR semantics merely because it executes close to the user.

This revision is intended to be reviewed jointly with the other four documents before any ratification decision.

---

# 0A. Unfict Succession Constraint

ZRR semantics are unchanged by the master-brand succession.

The active first-party long-form P1 namespace is now selected as:

```text
id.unfict.com
```

The strategic compact root is:

```text
unfi.cc
```

but permanent compact-token issuance remains separately gated by ADDRESSING.

Legacy:

```text
zyppi.me
zpi.to
```

remain historical/defensive namespace assets and receive no new ZRR semantic authority from their retention.

ZRR SHALL NOT maintain a separate short-link database for `unfi.cc`.

Any future compact binding SHALL resolve through the same governed persistent-reference / Resolution State model as the corresponding long-form representation.

---

# 1. North-Star Thesis

ZRR should become:

> **A durable Resource Resolution infrastructure through which admitted public references can discover and select current registered resources, resolvers, representations, capabilities and governed interaction paths without acquiring semantic authority over the Reality, Trust, Policy, Evidence or execution behind them.**

The long-term opportunity remains larger than:

```text
short code → URL
```

and narrower than:

```text
resolver → owner of Reality
```

The strategic shorthand remains:

> **Identify once. Resolve forever.**

Commerce-facing shorthand may remain:

> **Identify once. Route forever.**

---

# 2. Why ZRR Exists

Physical and digital references often collapse into brittle structures:

```text
identifier → one hard-coded destination
QR → one landing page
short link → one redirect
domain → one application
product identifier → one vendor database
```

They fail when:

- destinations change;
- resources multiply;
- the same reference needs human and machine resources;
- customer namespaces change infrastructure operators;
- external standards require their own resource relations;
- AI Agents need discoverable capabilities;
- physical carriers outlive the current application;
- operational responsibility transfers;
- a semantic determination belongs to another constitutional owner.

ZRR exists to keep the **resource-resolution relationship** mutable while the admitted persistent reference remains stable.

---

# 3. Constitutional Position

ZRR owns **generic Resource Resolution mechanics after the ADDRESSING Public Resolution Handoff**.

It SHALL NOT create:

- Reality;
- ZRM Identity;
- a new Identity primitive;
- public namespace sovereignty;
- Address Family semantic ownership;
- Domain semantics;
- Trust;
- Policy;
- Evidence sufficiency;
- constitutional Capability semantics;
- RI execution semantics;
- carrier semantics.

The governing law is:

> **ZRR discovers and dispatches registered resource relationships. It does not become the semantic owner of what those resources mean.**

---

# 4. ADDRESSING ↔ ZRR Ownership Boundary

The formal boundary is:

| Concern                                                | ADDRESSING                   | ZRR                               |
| ------------------------------------------------------ | ---------------------------- | --------------------------------- |
| Registrable roots / public origins                     | **Owns**                     | Consumes                          |
| Namespace classes                                      | **Owns**                     | Consumes                          |
| Public Namespace Registry                              | **Owns**                     | Consumes                          |
| `NamespaceBinding` admission/lifecycle                 | **Owns**                     | Consumes                          |
| Address Family label allocation                        | **Owns**                     | Consumes                          |
| Family grammar / normalization                         | External/family owner        | Consumes normalized form          |
| Public Resolution Handoff semantic envelope            | **Owns**                     | Consumes                          |
| `ZRR-PRIC` versioned technical contract                | Constrains semantic envelope | **Owns**                          |
| HTTP origin/security/redirect/cache safety constraints | **Owns**                     | Must conform                      |
| Cacheability intent / semantic invalidation triggers   | Constrains                   | **Owns or family profile owns**   |
| Persistent public-address non-reassignment             | **Owns**                     | Must preserve in serving behavior |
| Resolution State                                       | Does not own                 | **Owns**                          |
| Resource relationships                                 | Does not own                 | **Owns generic model**            |
| Discovery                                              | Does not own                 | **Owns**                          |
| Selection/default/matching mechanics                   | Does not own                 | **Owns**, subject to family rules |
| Resolution Broker / Dispatcher                         | Does not own                 | **Owns**                          |
| Published serving/read model                           | Does not own                 | **Owns**                          |
| Domain/standard semantic judgment                      | Proper owner                 | Does not own                      |
| Trust / Policy / Evidence / execution                  | Proper owners                | Does not own                      |

Shared tie-break rule:

> **If a question asks whether a public request belongs to a namespace/family, whether a public address may be issued/reused/retired, or what Internet-boundary invariants apply, ADDRESSING governs. If it asks what Resolution State contains or how resources are discovered, matched, selected or dispatched after handoff, ZRR governs.**

The presence of a technical ZRR input contract does not transfer namespace ownership from ADDRESSING to ZRR.

---

# 5. ZRM Semantic Resolution ≠ ZRR Resource Resolution

This distinction is permanent.

## 5.1 ZRM Semantic Resolution

Question:

> **Which Reality constituent does this Representation actually refer to?**

Conceptually:

```text
Representation / referential claim
        ↓
ZRM semantic resolution
+
Evidence governance
        ↓
factual referent determination
```

ZRR does not own this determination.

## 5.2 ZRR Resource Resolution

Question:

> **Given an admitted public reference, which registered Resolution State/resources/handlers apply?**

Conceptually:

```text
admitted public reference
        ↓
ZRR Resolution State
        ↓
resource relationships
        ↓
discovery / selection / dispatch
```

## 5.3 Non-Escalation

> **Successful ZRR Resource Resolution SHALL NOT by itself establish the factual ZRM Identity relationship between a Representation and a Reality constituent.**

A registered resource may assert or expose a claim.

Registration does not make the claim true.

---

# 6. Public Resolution Handoff & ZRR-PRIC

ZRR begins at the ADDRESSING Public Resolution Handoff.

ADDRESSING owns the handoff's semantic envelope.

ZRR owns the versioned technical input contract that realizes that envelope:

```text
ZRR Public Resolution Input Contract
ZRR-PRIC
```

## 6.1 Required Semantic Content

Every `ZRR-PRIC` version SHALL represent, at minimum:

```text
contractVersion
namespaceBindingRef
addressFamilyRef / family-version provenance
familyNormalizedReference
admittedRequestContext
admissionProvenance
```

The concrete serialization/type system is replaceable.

The semantics are not.

## 6.2 Field Invariants

### `contractVersion`

Identifies the ZRR-PRIC technical contract version.

Unknown incompatible versions SHALL be rejected or explicitly negotiated.

They SHALL NOT be guessed into compatibility.

### `namespaceBindingRef`

References the ADDRESSING-admitted namespace association.

It SHALL NOT silently select a different tenant/origin/namespace.

### `addressFamilyRef`

Identifies the governing Address Family/profile and sufficient version provenance to prevent silent grammar reinterpretation.

### `familyNormalizedReference`

Carries the reference normalized under the proper family owner's rules.

ZRR SHALL NOT reinterpret the raw family grammar to obtain a different normalized value.

### `admittedRequestContext`

Contains only protocol/request metadata explicitly admitted by the applicable family/profile.

It SHALL NOT become a dumping ground for arbitrary headers, analytics attributes or inferred user context.

### `admissionProvenance`

Binds the input to the governing admission/family decision sufficiently to prevent silent cross-namespace/cross-family reinterpretation.

## 6.3 Prohibited Inference

`ZRR-PRIC` SHALL NOT manufacture or embed an inferred:

```text
Reality referent
factual ZRM Identity relationship
Trust conclusion
Policy conclusion
Evidence sufficiency conclusion
execution authorization
```

unless such a field is itself a separately governed input from the proper owner and the consuming profile explicitly admits it.

## 6.4 Contract Evolution

ZRR owns technical versioning/compatibility of `ZRR-PRIC`.

ADDRESSING owns the semantic envelope.

A new technical version SHALL NOT weaken or reinterpret ADDRESSING admission invariants without a governing amendment.

A future implementation MAY serialize the contract as JSON, protobuf, typed in-process data, another protocol, or an edge-compiled representation.

Serialization choice is not constitutional meaning.

---

# 7. Address / Representation / Resource Distinction

A public address may itself be a ZRM Representation/Identifier.

That does not collapse:

```text
Public Address
Resource Resolution
ZRM Identity
Destination
```

into one thing.

ZRR therefore SHALL treat the admitted public reference as a **Resolution input**, not as proof of the represented Reality.

---

# 8. Resolution State

`Resolution State` is the ZRR-owned governed set of current and historically versioned resource relationships associated with an admitted persistent reference/binding.

Conceptually it may contain:

```text
reference/binding identity
lifecycle-aware publication generation
registered resource relationships
registered defaults where permitted
registered handlers/resolvers
relationship provenance
applicable matching attributes
retirement/suspension effects received from proper owners
history / supersession information
```

This is an architectural model, not a frozen storage schema.

---

# 9. Resource Relationship

A Resource Relationship expresses that a registered target has a governed relationship to the admitted reference.

Potential targets may include:

- web resource;
- alternate web resource;
- machine-readable description;
- standards resolver;
- external resolver;
- domain projection;
- support/service resource;
- registered Unfict Capability;
- discovery metadata;
- future typed resource.

The relation and target handling class SHALL remain distinguishable.

A relationship does not automatically endorse the target's claims.

---

# 10. Relation Type ≠ Media Type ≠ Interface

ZRR SHALL preserve:

```text
relation type
≠
media type
≠
interface
≠
Domain
≠
Application
≠
Capability
```

A relation answers:

> How is this resource related to the admitted reference?

A media type answers:

> What representation format is available?

An interface answers:

> Through what interaction contract is a Capability exposed?

The generic Resolution model SHALL NOT collapse those dimensions into a single enum.

---

# 11. Typed Resolution

ZRR SHALL NOT make HTTP redirect the ontology of Resolution.

The first implementation may be one redirect relationship.

The underlying model must remain capable of representing typed resource relationships and machine discovery.

This preserves additive evolution without changing the persistent public reference.

---

# 12. Resolution Set

A persistent reference MAY have more than one currently registered resource relationship.

Conceptually:

```text
Resolution State
├── default web resource
├── alternate web resource
├── machine-readable description
├── external standards resolver
├── registered Capability
└── future typed resources
```

The example names are illustrative.

No universal record taxonomy is frozen here.

---

# 13. Discovery

Discovery answers:

> **Which registered resource relationships are available for this admitted reference?**

Discovery may be returned directly to a machine or human caller where appropriate.

Discovery SHALL NOT require scraping a human landing page where a machine-readable form is available.

The generic discovery mechanism SHALL preserve relationship provenance and semantic ownership.

---

# 14. Selection

Selection answers:

> **Which registered relationship should be used for this request under the governing Resolution model?**

Selection MAY consider only explicit, governed dimensions, such as:

- requested relation type;
- media/protocol constraints;
- family/profile-authorized qualifiers;
- caller capabilities where explicitly modeled;
- deterministic registered defaults;
- governed contextual attributes.

It SHALL NOT rely on hidden guesswork when ambiguity materially affects meaning.

---

# 15. Default Resource

A Resolution State MAY contain default/fallback relationships where the applicable Address Family/profile permits them.

A default is:

```text
governed deterministic fallback
```

not:

```text
semantic truth
```

ZRR MAY provide generic infrastructure capable of representing default semantics.

It SHALL NOT impose one universal default-selection algorithm or one universal `isDefault` boolean that overrides or flattens an Address Family/external standard's own model.

The applicable family/profile owns:

- whether a default is required;
- how many default classes may exist;
- contextual/default matching;
- fallback precedence;
- any standard-specific default relation semantics.

For example, a standards profile may distinguish multiple kinds of default links or context-dependent fallback.

ZRR SHALL preserve those semantics rather than collapsing them into its generic substrate.

Where no governing default exists and ambiguity remains material, ZRR SHALL preserve ambiguity/discovery rather than inventing a winner.

---

# 16. Ambiguity

When multiple resources remain materially valid and no governing rule selects one, ZRR SHALL preserve ambiguity.

ZRR SHALL return a typed ambiguity/discovery disposition sufficient for the public protocol layer to represent the alternatives without re-running selection logic.

Conceptually, the disposition SHOULD carry as applicable:

```text
ambiguity class
requested relation / request intent
available alternatives
relation metadata
target identifiers/coordinates
media/representation metadata
family/profile provenance
human-readable explanation where permitted
```

The exact wire representation is not fixed here.

ADDRESSING owns the generic HTTP/public-protocol mapping.

The applicable Address Family/external standard may define stronger status-code and linkset behavior.

A valid ambiguity disposition may become:

- `300 Multiple Choices` where HTTP semantics fit;
- a successful discovery/linkset representation;
- family-defined multiple-choice behavior;
- denial where the family/security model requires it.

ZRR SHALL NOT force an arbitrary winner merely to simplify the public response.

---

# 17. Resolution Broker / Dispatcher

ZRR MAY own a Resolution Broker / Dispatcher that maps a selected registered relationship to the correct technical handler.

Conceptually:

```text
selected relationship
        │
        ├── HTTP resource
        ├── external resolver
        ├── direct representation
        ├── Z-PROF / domain projection
        ├── registered Unfict Capability
        └── future handler
```

The broker may answer:

> **Which registered handler owns this target handling class?**

It SHALL NOT independently answer:

- What is true?
- Which Reality is this Representation factually about?
- Is the Subject authorized?
- Is this Object authentic?
- Is Evidence sufficient?
- Is Trust established?
- Should execution occur?

> **The broker is a dispatcher, not a semantic god-object.**

---

# 18. Single Capability Semantic Owner

Every Capability ZRR discovers or dispatches toward SHALL have one governed semantic owner.

REST, SDK, MCP, Host-Native, custom-domain and future interfaces may adapt that Capability.

ZRR SHALL NOT independently reimplement its:

- domain semantics;
- epistemic semantics;
- Trust semantics;
- Policy semantics;
- authorization semantics;
- failure meaning.

ZRR may invoke/consume the owner's result.

Consumption is not ownership.

---

# 19. Capability Discovery ≠ Capability Invocation

ZRR may disclose that a registered Capability exists.

That does not mean the Capability has been invoked.

The caller, interface and proper semantic owner remain responsible for valid invocation.

Where execution is required, RI remains the execution authority.

---

# 20. External URL ≠ Internal Capability

An arbitrary external URL SHALL NEVER be treated as equivalent to a registered Unfict Capability.

Normal external HTTP targets should generally be represented as external resources and emitted through protocol-appropriate public disposition.

ZRR SHALL NOT cause Unfict to fetch arbitrary customer targets merely to perform ordinary Resolution.

External retrieval is a separate Capability with its own SSRF, Security and Evidence boundaries.

---

# 21. Machine and Agent Resolution

ZRR SHALL support machine-first discovery direction.

A machine/Agent should be able to determine, subject to disclosure rules:

```text
which registered resources exist
their relationship types
their target handling classes
available representation/media information
which semantic owner governs the capability/resource
how the resource may be requested
whether ambiguity/default/fallback applies
```

without requiring HTML scraping.

This supports ZYAPI's goal that interfaces be simple to ask, useful to receive and difficult to misunderstand.

---

# 22. AI Non-Sovereignty

AI may:

- call ZRR;
- request explicit relation types;
- inspect returned discovery metadata;
- choose among disclosed options as a caller;
- orchestrate authorized downstream Capabilities.

AI SHALL NOT become an invisible semantic selector inside generic ZRR merely because a request is ambiguous.

The generic Resolution plane remains deterministic under governed inputs.

---

# 23. Address Family Relationship

ZRR consumes family-normalized input.

It SHALL NOT redefine:

- GS1 grammar;
- future ZPI grammar;
- another standard's qualifiers;
- domain-specific identifier meaning.

Where a family requires special Resolution behavior, that behavior must be represented through an authorized ZRR profile/adapter whose semantic constraints remain owned by the family/standard owner.

---

# 24. GS1

GS1 is the first major external standards proving ground, not the definition of ZRR.

The correct flow is conceptually:

```text
GS1 public address
        ↓
ADDRESSING namespace/family admission
        ↓
GS1-owned parsing / normalization
        ↓
Public Resolution Handoff
        ↓
ZRR Resource Resolution
        ↓
GS1-conformant relationship/default/linkset behavior
through an authorized profile
        ↓
proper GS1/domain semantic owner
```

ZRR provides generic infrastructure.

GS1 remains authoritative over GS1 semantics and conformance.

---

# 25. Customer Domains

Customer-controlled P4 namespaces are ADDRESSING-owned public namespaces, not ZRR-owned aliases.

For an ACTIVE Unfict-operated binding:

```text
customer namespace
        ↓
ADDRESSING admission
        ↓
ZRR Resource Resolution
```

After legitimate customer exit:

```text
same customer namespace
        ↓
replacement resolver/operator
```

may continue without ZRR.

Customer namespace sovereignty therefore survives ZRR operator choice.

---

# 26. Domain Binding

`DOMAIN-BINDING-001` manages the derived lifecycle/profile for ADDRESSING `NamespaceBinding`.

ZRR consumes an admitted active binding.

It SHALL NOT determine domain-controller legitimacy, certificate ownership or custom-domain reclaim safety.

Those belong upstream.

---

# 27. Edge Gateway

`EDGE-RESOLUTION-GATEWAY-001` is an ingress and response-adaptation layer.

It SHALL NOT be a second ZRR.

The correct relationship is:

```text
Edge Gateway
   ↓ carries
Public Resolution Handoff
   ↓
ZRR serving interface / projection
   ↓
public disposition
   ↓ adapted by
Edge Gateway
```

Edge-specific conditionals SHALL NOT independently recreate ZRR selection logic.

---

# 28. Control Plane vs Resolution Plane

ZRR SHALL distinguish administrative mutation from public serving.

## Control Plane

May manage:

- Resolution State creation;
- relationship registration;
- target updates;
- defaults;
- relationship lifecycle;
- revisions;
- handler registration;
- publication;
- operator administration.

Public namespace/domain administration remains with ADDRESSING/Domain Binding.

## Resolution Plane

Responsible for:

```text
consume admitted handoff
        ↓
locate published Resolution State
        ↓
apply deterministic ZRR rules
        ↓
discover/select relationship
        ↓
dispatch/return public disposition
```

Control-plane failure SHOULD NOT automatically break previously published valid public Resolution.

---

# 29. Canonical State vs Serving Projection

ZRR SHALL distinguish authoritative Resolution State from its fastest serving representation.

Conceptually:

```text
AUTHORITATIVE ZRR RESOLUTION STATE
        │
        │ governed publication
        ▼
ZRR SERVING PROJECTION / READ MODEL
        │
        ▼
EDGE SERVING PROJECTION
        │
        ▼
PUBLIC RESPONSE
```

The exact storage/database/cache/provider remains implementation work.

A serving projection SHALL NOT become an independent semantic owner.

Every published projection SHALL carry sufficient provenance to identify:

```text
semantic owner
contract/profile version
authoritative source-state revision
publication lineage / publication identifier
generation/version within that lineage
applicable family/profile provenance
integrity binding appropriate to the trust boundary
```

The concrete integrity mechanism is owned by the implementation/Security profile.

The constitutional requirement is that provenance be verifiable enough to prevent silent stale, cross-owner or forged projection acceptance.

---

# 30. Projection Provenance & Compatibility

Any ZRR serving projection SHALL remain attributable to:

- the authoritative ZRR state revision from which it was produced;
- the ZRR publication lineage;
- the applicable `ZRR-PRIC` / serving-contract version;
- the applicable Address Family/profile version where relevant;
- lifecycle/suspension state needed for safe serving.

Where an Edge Serving Projection composes material from multiple owners, compatibility SHALL be established by an explicit publication/bundle manifest or equivalent owner-governed compatibility declaration.

The Edge SHALL NOT compare unrelated numeric generations and infer compatibility.

If compatibility cannot be established for a required semantic dependency, the affected path SHALL fail safely.

A projection may simplify shape and indexing.

It SHALL NOT silently alter relation meaning, defaults, lifecycle state or semantic ownership.

---

# 31. Publication Lineage, Rollback & Freshness Safety

Published Resolution state SHALL support deterministic publication-lineage/version semantics sufficient to:

- reject incompatible projections;
- invalidate superseded state;
- prevent stale reactivation after retirement/revocation;
- support controlled rollout;
- support controlled rollback;
- support operator migration;
- preserve security/lifecycle invalidation.

The key invariant is:

> **Rollback is a new authoritative publication decision, not resurrection of an obsolete publication generation.**

If content equivalent to an older state must be restored:

```text
old content
+
new authoritative publication identity
+
current lifecycle/security reconciliation
```

SHALL produce the new current serving state.

An old projection SHALL NOT become current merely because an operator lowers a generation number.

The publication model SHALL therefore preserve a lineage/epoch/publication identity sufficient to distinguish:

- current publication;
- superseded publication;
- explicit rollback publication;
- stale replay;
- operator-cutover publication.

Retirement, revocation, erasure-constrained state, security holds and operator-cutover decisions SHALL dominate stale backup/projection content.

Unknown or incompatible lineage/generation relationships SHALL NOT be guessed into compatibility.

---

# 32. Public HTTP Disposition & Cache Contract

ZRR may return a public disposition that the Edge Gateway serializes.

ADDRESSING owns public HTTP/Internet safety constraints such as:

- `302` vs `307` temporary behavior;
- `301`/`308` permanent migration controls;
- generic ambiguity/discovery HTTP mapping;
- `Vary`;
- origin isolation;
- public disclosure constraints.

ZRR or the applicable family/profile owns:

- whether a governed disposition may be cached;
- semantic invalidation triggers;
- whether revalidation is required after specified state transitions;
- profile-specific cacheability intent.

The Edge/public-serving implementation enforces the combined cache contract.

For every cacheable mutable disposition, the serving profile SHALL define an explicit TTL or revalidation policy consistent with ADDRESSING.

ZRR SHALL produce enough disposition/cache metadata to allow the public interface to conform without duplicating selection semantics.

---

# 33. Sacred Fast Path

The ordinary public path SHOULD remain:

```text
admitted request
+
published Resolution serving state
+
deterministic selection
+
public disposition
```

Optional systems SHALL not be required synchronously merely to preserve ordinary public Resolution:

- generative AI;
- analytics;
- dashboard;
- billing UI;
- unrelated control-plane services.

If a selected semantic Capability legitimately requires current Trust/Policy/Evidence, that governed path may fail closed.

Optional intelligence failure and mandatory semantic-authority failure are different.

---

# 34. Observability Without Semantic Escalation

ZRR may emit technical telemetry such as:

- reference/binding ID;
- relation requested/selected;
- timestamp;
- request region;
- latency;
- cache state;
- response class;
- domain;
- failure class;
- generation.

But:

```text
HTTP/ZRR request log
≠ constitutional Event by default

successful public disposition
≠ Evidence that downstream Reality changed

Resolution analytics
≠ Trust

registered relationship
≠ Truth
```

Any later use as constitutional Evidence requires proper admission.

---

# 35. Security & Abuse

ZRR and its serving implementation SHALL plan for:

- malicious destinations;
- phishing;
- spam;
- route/relationship hijacking;
- token/reference enumeration;
- open-redirect abuse;
- SSRF;
- redirect loops;
- stale serving state;
- unauthorized handler registration;
- tenant breakout;
- abusive automation;
- secret leakage;
- internal-Capability confusion.

ADDRESSING and Domain Binding own upstream namespace security.

ZRR owns integrity of its own Resolution State, relationships, selection and dispatch.

---

# 36. Lifecycle Interaction

ADDRESSING owns persistent public-address lifecycle and non-reassignment.

ZRR must faithfully serve the consequences.

Examples:

```text
ACTIVE address
→ eligible Resolution State

SUSPENDED address
→ public Resolution constrained according to ADDRESSING/owner state

RETIRED address
→ no unrelated reassignment

ERASURE-CONSTRAINED address
→ only lawful/minimized serving information
```

ZRR SHALL NOT reactivate or repurpose an address because an old Resolution record still exists.

---

# 37. Historical Revision

Resolution State mutation SHOULD preserve enough history to reconstruct:

- what resource relationship existed;
- when;
- under which authoritative generation;
- which control-plane authority changed it;
- what relationship was superseded.

Current state SHALL NOT rewrite historical state.

Retention/disclosure of history remains subject to proper Privacy/Legal/Evidence owners.

---

# 38. Operator Succession

ZRR operator/provider succession SHOULD preserve the same public references and authoritative state meaning.

A transfer SHALL establish a clear mutation cutover.

There SHALL NOT be an uncontrolled dual-writer period.

Old operators SHALL lose future mutation authority after cutover.

Operator succession does not transfer semantic sovereignty over the resources ZRR points to.

---

# 39. Minimum Continuity Service

ADDRESSING defines the institutional requirement for a Minimum Continuity Service.

ZRR SHALL make it possible, in principle, to export/publish the minimum lawful public serving state in a provider-independent, integrity-verifiable form.

The exact export format, signature system or storage technology remains implementation/Security work.

Before irreversible P1 activation, the production implementation SHALL define:

- export scope;
- import/restore procedure;
- integrity/provenance verification;
- lifecycle/security reconciliation;
- operator-cutover behavior;
- rehearsal procedure.

MCS may preserve core Resource Resolution while higher-value dynamic Capabilities remain unavailable.

The MCS export SHALL NOT become a second semantic source of truth or bypass later retirement/revocation state.

---

# 40. Federation & Delegated Resolution

ZRR SHALL keep future controlled federation possible.

Potential models include:

- customer-operated Resolution for its namespace;
- external standards resolver delegation;
- delegated resource classes;
- multiple read-serving providers;
- future federated Resolution authorities.

Federation SHALL NOT create automatic Trust.

Technical Resolution delegation SHALL remain distinct from constitutional Delegation.

Future delegation requires authenticated scope, provenance, revocation and stale-delegation handling.

---

# 41. Resolver Operator vs Semantic Owner

A resolver/operator may know:

```text
which relationship exists
which target handling class applies
which handler to dispatch
```

without owning:

```text
whether the target's claim is true
whether the caller is authorized
whether Evidence is sufficient
whether execution should occur
```

This separation SHALL survive federation.

---

# 42. Failure Taxonomy

ZRR SHOULD preserve materially distinct internal failure classes such as:

```text
REFERENCE_STATE_NOT_FOUND
RELATION_NOT_AVAILABLE
AMBIGUOUS_RESOURCE
HANDLER_NOT_AVAILABLE
RESOLUTION_STATE_UNAVAILABLE
SEMANTIC_OWNER_UNAVAILABLE
EXTERNAL_RESOLVER_UNAVAILABLE
RETIRED_REFERENCE
POLICY_DENIED
```

ADDRESSING/interface layers may map these into public protocol responses.

Exact names remain implementation work.

---

# 43. Restoration Safety

Restoring an old ZRR backup or serving projection SHALL NOT undo later authoritative:

- retirement;
- suspension;
- deletion/minimization;
- ownership/control changes;
- handler revocation;
- security holds;
- operator cutover.

Disaster recovery is not semantic time travel.

---

# 44. Twenty-Year Test

Ask:

> **Can every current ZRR implementation component be replaced without changing the persistent public references or changing the meaning of registered resource relationships?**

The architecture should survive changes in:

- database;
- cloud;
- edge provider;
- cache;
- SDK;
- protocol adapter;
- service topology;
- control-plane application;
- serving implementation.

---

# 45. Billion-Reference Test

Assume:

```text
billions of references
millions of customer namespaces
many address families
many Domains
many Applications
many Capabilities
many public resource types
multiple Resolution operators
large AI/Agent traffic
```

Ask:

1. Can Resolution State remain generically coherent?
2. Can relation vocabularies expand without one giant enum?
3. Can selection remain deterministic?
4. Can ambiguity remain representable?
5. Can serving projections remain owner-preserving?
6. Can failures remain local?
7. Can operators change without public-address mutation?
8. Can standards coexist without ZRR claiming their semantics?
9. Can customer namespaces leave Unfict?
10. Can ZRR avoid becoming a semantic monolith?

---

# 46. What ZRR Must Freeze Before Implementation

Before irreversible public production depends on ZRR, governance should freeze at least:

- ADDRESSING→ZRR handoff ownership;
- authoritative Resolution State ownership;
- relationship identity/version semantics;
- non-reassignment interaction;
- control-plane vs Resolution-plane boundary;
- serving projection non-sovereignty;
- deterministic ambiguity/default rules;
- handler registration boundary;
- external URL vs internal Capability distinction;
- operator mutation cutover;
- retirement/restoration safety.

Exact storage schemas may remain replaceable.

---

# 47. What Should Remain Safe to Defer

Unless required by the proving wedge, defer:

- global federation;
- cryptographic delegation proof;
- offline Resolution;
- custom network protocol;
- large universal relation vocabulary;
- geographic routing;
- ZPI grammar;
- ZPI public binding;
- resolver marketplace;
- third-party resolver certification;
- rich AI preference ranking;
- advanced cross-sovereign settlement.

The architecture must keep these possible without pretending they already exist.

---

# 48. First Real Vertical Slice

A minimal proof may be:

```text
ADDRESSING admits stable public reference
        ↓
ZRR creates authoritative Resolution State
        ↓
one registered HTTP resource relationship
        ↓
published serving projection
        ↓
browser resolves through Edge Gateway
        ↓
control plane changes destination
        ↓
same public address resolves to new destination
        ↓
old revision remains reconstructable
```

This proves:

- public-address stability;
- ZRR state persistence;
- mutable resource relationships;
- separation of ADDRESSING and ZRR;
- serving projection;
- deterministic public Resolution;
- historical revision.

It does not require ZPI, federation or RI execution.

---

# 49. Progressive Evolution

An illustrative sequence:

```text
R0 — one admitted reference → one HTTP relationship

R1 — customer P4 namespace integration

R2 — multiple typed resource relationships

R3 — standards-owned profiles such as GS1

R4 — machine/Agent discovery

R5 — registered Capability discovery/dispatch

R6 — delegated/federated Resource Resolution
```

The sequence is not normative.

---

# 50. Commercial Position

Basic redirects and ordinary QR/link management are commodity substrate.

ZRR's strategic value is the durable Resolution layer through which richer Unfict capabilities become discoverable.

Conceptually:

```text
Resolve
   ↓
Discover Capability
   ↓
Verify / Trust as required
   ↓
Authorize as required
   ↓
Execute as required
   ↓
Proof / Receipt
```

ZRR does not own those downstream semantics.

It makes them discoverable and reachable.

---

# 51. Success Definition

ZRR succeeds if Unfict can eventually say:

> **An admitted persistent public reference can survive changing resources, applications, standards, providers and interaction technologies while continuing to lead legitimate digital systems toward the current registered resources and governed interaction paths associated with that reference.**

And simultaneously preserve:

```text
ZRR Resource Resolution
≠ ZRM Semantic Resolution

Resolution
≠ Reality

Resolution
≠ Trust

Resolution
≠ Policy

Resolution
≠ Evidence sufficiency

Resolution
≠ Authorization

Resolution
≠ Execution
```

---

# 52. Blocker-Closure / Ratification Questions

Before joint ratification, verify:

1. Is ZRR's ownership strictly downstream of ADDRESSING admission?
2. Does `ZRR-PRIC` now have a named owner and sufficient semantic minimum?
3. Can an unsupported handoff-contract version fail safely?
4. Does ZRR avoid owning ZRM semantic resolution?
5. Is `Resolution State` sufficiently generic without becoming a universal Domain ontology?
6. Are resource relation, media type, interface and Capability distinct?
7. Are default semantics preserved as family/profile-owned where required?
8. Can ambiguity be returned as a typed disposition without Edge re-selection?
9. Can GS1 remain standards-owned?
10. Can custom domains leave Unfict cleanly?
11. Can Edge Gateway execute fast without duplicating ZRR semantics?
12. Can serving projections prove provenance/compatibility sufficiently for safe serving?
13. Does rollback create a new authoritative publication rather than resurrect an old generation?
14. Can registered Capabilities preserve one semantic owner?
15. Can ZRR serve machines/Agents without becoming AI reasoning infrastructure?
16. Can retirement and erasure constraints flow through Resolution safely?
17. Can operator succession occur without dual writers?
18. Is MCS feasible without freezing a provider?
19. Does any ZRR clause belong in ADDRESSING, ZRM, POL, SEC, Evidence or RI instead?

---

# 53. Final North-Star Statement

> **ZRR is Unfict's generic Resource Resolution owner after public-address admission: it governs Resolution State, registered resource relationships, discovery, deterministic selection and dispatch while preserving strict boundaries to ADDRESSING, ZRM semantic resolution, external standards and every downstream semantic authority.**

Short form:

# **Identify once. Resolve forever.**

Architectural analogy:

# **DNS for Reality — without pretending DNS answers what Reality means.**

---

# 54. Document State

**Version:** `0.3.0`  
**Status:** **DRAFT — UNFICT SUCCESSION REVISION / RATIFICATION CANDIDATE**  
**Succession Basis:** `ZUSD-001 v1.0 — RATIFIED`  
**Supersedes if ratified:** `ZRR-NS-001 v0.2.1 — RATIFIED`  
**Implementation Authority:** **NONE**  
**Repository Mutation Authority:** **NONE**  
**Next Gate:** **Joint Unfict Succession Ratification Decision**

---

## End of `ZRR-NS-001 v0.3.0`

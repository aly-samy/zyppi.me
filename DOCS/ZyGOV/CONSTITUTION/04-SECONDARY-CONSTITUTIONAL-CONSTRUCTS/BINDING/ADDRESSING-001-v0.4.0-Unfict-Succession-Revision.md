# ADDRESSING-001

## Unfict Public Addressing, Namespace & Resolution Governance

**Document ID:** `ADDRESSING-001`  
**Version:** `0.4.0`
**Status:** **DRAFT — UNFICT SUCCESSION REVISION / RATIFICATION CANDIDATE**
**Classification:** Secondary Cross-Constitutional Construct + Public Internet Binding Profile  
**Nature:** Cross-Constitutional · Derived · Non-Sovereign  
**Date:** 14 September 2026
**Succession Authority:** `ZYPPI-UNFICT-SUCCESSION-DECLARATION-001 / ZUSD-001 v1.0 — RATIFIED`
**Platform Lineage:** `Zyppi → Unfict`
**Ratification Effect:** NONE until separately ratified
**Governing Authority:** Chair — Unfict Constitutional Council  
**Implementation Authority:** **NONE**  
**Repository Mutation Authority:** **NONE**  
**Production P1 Issuance Authority:** **NONE — ACTIVATION GATES NOT YET SATISFIED**  
**Supersedes:** `ADDRESSING-001 v0.3.3 — RATIFIED`
**Integrates:** `ADDRESSING-001-PH1` · `ADDRESSING-001-PH2` · `ADDRESSING-001-PH3` · `ADDRESSING-001-PH4` · `ADDRESSING-001-CQ-02` · `ADR-ZRR-CD-CQ-01` Chair Synthesis · ZRM role-separation reconciliation  
**Strategic Precursor:** `ZRR-NS-001 — Unfict Routing North Star`  
**Coordinates With:** ZRM · OWNERSHIP-001 · DELEGATION-001 · Z-PROF · ZII · ZQE · ZYAPI · ZyUX lifecycle doctrine · applicable POL / SEC / Evidence / Privacy / Retention / RI authorities  
**External Technical Baseline:** RFC 3986 · RFC 9110 · RFC 8288 · RFC 9264 · RFC 8615 · RFC 8659 · applicable TLS/DNS/DNSSEC/ACME standards · GS1 Digital Link URI Syntax 1.7.0 · GS1-Conformant Resolver 1.2.1 · W3C URI persistence guidance · ICANN domain-security guidance · `.ME` Registry Lock controls · persistent-identifier continuity precedents

---

# 0. Executive Law

Unfict SHALL govern public addressing so that:

> **A persistent public reference can remain stable while destinations, implementations, interfaces, providers, owners, operators, applications and resolution capabilities evolve — without allowing the address, namespace, resolver, alias, domain controller or successor operator to acquire semantic or constitutional authority it does not lawfully possess.**

For physical-world deployment:

> **Print the reference. Never print today's architecture.**

For Resolution:

> **Keep the common path fast. Keep the rich path explicit. Keep meaning with its owner.**

For lifecycle:

> **The reference may become unavailable, suspended, retired, privacy-minimized or operationally transferred. It SHALL NOT silently become an unrelated thing.**

The complete architectural shorthand is:

```text
STABLE PUBLIC REFERENCE
        +
VERIFIED NAMESPACE
        +
EXPLICIT ADDRESS FAMILY
        +
EVOLVABLE RESOLUTION
        +
SINGLE SEMANTIC OWNER
        +
NON-REASSIGNMENT
        +
INSTITUTIONAL CONTINUITY
```

---

# 0A. v0.3.1 Council Corrective Record

`v0.3.1` is a targeted corrective revision produced after independent review under:

```text
ADDRESSING-001-CQ-02
```

The Council synthesis accepted three ratification blockers:

```text
1. ADDRESSING ↔ ZRR ownership overlap
2. insufficiently explicit protection against
   residual/shared-edge custom-domain reclaim
3. premature selection of future legacy ZPI Internet bindings
```

The revision also incorporates accepted hardening concerning:

- exact GS1 `resolverRoot`;
- HTTP method preservation;
- redirect/cache change control;
- wildcard OAuth isolation;
- internationalized-domain handling;
- certificate lifecycle during custom-domain detachment;
- `.TO` security verification before any `unfi.cc` activation;
- Privacy/Legal ownership of Anti-Reuse mechanisms;
- provider-independent Minimum Continuity Service bootstrap;
- documentation discipline around the `id` hostname label.

Two review claims are expressly **not** adopted:

1. **GS1 version regression is rejected.** The current Public Internet Binding Profile retains `GS1 Digital Link URI Syntax 1.7.0` and `GS1-Conformant Resolver 1.2.1`.
2. **A blanket prohibition on HTTP `302` is rejected.** `302` remains permissible for appropriately bounded GET/HEAD flows; method-bearing or method-preserving temporary redirection is governed more strictly below.

No corrective finding grants implementation, repository mutation, DNS mutation or P1 issuance authority.

---

# 0B. v0.3.2 ZRM Alignment Correction

`v0.3.2` performs two narrow constitutional corrections identified during cross-document reconciliation with the current ZRM Identity amendment work and the re-derived custom-domain specifications.

## Correction A — Role Separation, Not False Mutual Exclusion

The previous shorthand:

```text
Identifier / Reference ≠ Public Address
```

was too absolute.

Under ZRM, an Identifier is a form of Representation, and a URI may itself instantiate an Identifier/Representation.

Accordingly, v0.3.2 now distinguishes **roles** rather than asserting that the categories can never overlap.

A Public Address MAY itself instantiate a Representation/Identifier.

That does not make the Public Address:

- Reality;
- an intrinsic Identity object;
- factual proof of a ZRM Identity relationship;
- constitutional Authority;
- semantic ownership;
- Trust;
- Evidence;
- execution.

## Correction B — Two Different Resolution Questions

The term `Resolution` SHALL remain disambiguated between:

```text
ZRM SEMANTIC RESOLUTION
Which Reality constituent does this Representation
actually refer to?

and

ZRR RESOURCE RESOLUTION
Given an admitted public reference,
which registered Resolution State/resources/handlers apply?
```

Successful Public Address / ZRR Resolution SHALL NOT, by itself, establish the factual ZRM Identity relationship between a Representation and a Reality constituent.

This distinction applies to ADDRESSING, ZRR, Domain Binding, custom-domain architecture, Edge Gateway terminology, APIs, SDKs and documentation.

These corrections do not reopen PH1–PH4 architecture.

They remove terminology that could otherwise cause ZRM and ZRR semantic ownership to collapse into one another.

---

# 0C. v0.3.3 Blocker-Closure Correction

`v0.3.3` closes the four accepted blockers from `ADR-ZRR-CD-CQ-01` without reopening the settled architecture.

The corrections are:

```text
B-01
ADDRESSING→ZRR Public Resolution Handoff
now has explicit semantic-envelope ownership
and a named ZRR-owned versioned technical contract.

B-02
P4 RETIRED_HELD release/reclaim semantics
are explicitly defined across ADDRESSING
and DOMAIN-BINDING-001.

B-03
generic HTTP ambiguity/discovery behavior
is explicitly governed by ADDRESSING,
with family/standard-specific overrides preserved.

B-04
Public Address-as-Representation now has
an explicit ZRM referent boundary.
```

The same pass also tightens:

- dangling-domain detection;
- cache-policy ownership;
- `302` authorization;
- successor-compatible CAA governance;
- provider-independent MCS readiness;
- publication/projection lineage coordination with ZRR.

No new constitutional primitive is created.

No implementation schema, cloud product, cryptographic algorithm or provider-specific mechanism is constitutionalized.

---

# 0D. Unfict Namespace Succession Record

This revision applies the ratified brand succession:

```text
Zyppi → Unfict
```

to the active public-addressing architecture without rewriting historical Zyppi-era records.

The namespace decisions are:

```text
Canonical institutional root:
unfict.com

Selected first-party P1 origin:
id.unfict.com

Selected production API origin:
api.unfict.com

Selected documentation origin:
docs.unfict.com

Selected control-plane origin:
console.unfict.com

Selected status origin:
status.unfict.com

Selected strategic compact root:
unfi.cc

Legacy institutional root:
zyppi.me — RETAIN / LEGACY / DEFENSIVE

Legacy strategic root:
zpi.to — RETAIN / LEGACY / NO NEW ISSUANCE
```

No irreversible P1 address has yet been issued under `id.zyppi.me`.

Therefore this revision changes the selected future origin before activation rather than migrating already-issued P1 references.

The public-addressing semantics, ownership boundaries, ZRM/ZRR distinction, lifecycle doctrine, continuity rules and activation gates remain continuous.

`unfi.cc` is **not** a generic URL-shortening service.

Its purpose is an optional compact public representation governed by the same persistent-reference / ZRR architecture.

Permanent compact-reference issuance remains prohibited until a dedicated compact-reference profile closes token grammar, alias/canonical relationship, collision, lifecycle and carrier rules.

Historical Zyppi roots and documents remain preserved according to `ZUSD-001`.

---

# PART I — CONSTITUTIONAL POSITION & OWNERSHIP

# 1. Purpose

`ADDRESSING-001` establishes Unfict governance for:

- registrable domains;
- public hostnames and origins;
- persistent public addresses;
- public URI/address families;
- family allocation;
- compact aliases and alternate representations;
- customer-controlled custom domains;
- canonicalization;
- public Internet constraints on Resolution handoff and disposition;
- HTTP redirect semantics;
- interoperability requirements for machine-readable discovery;
- namespace lifecycle;
- origin and tenant isolation;
- namespace delegation;
- retirement and non-reassignment;
- continuity and operator succession;
- current Public Internet bindings.

A public Unfict reference may be:

- printed on a physical Object;
- encoded in QR, NFC or another carrier;
- stored in an external system;
- used by browsers, SDKs, APIs, MCP clients or AI Agents;
- embedded in documentation;
- exposed through a customer-controlled domain;
- retained after the original application, company or infrastructure has changed.

Accordingly, public URI space is infrastructure, not presentation.

---

# 2. Constitutional Position

`ADDRESSING-001` is a **Secondary Cross-Constitutional Construct**.

It is:

```text
cross-constitutional
derived
non-sovereign
```

It SHALL NOT create:

- a new Reality model;
- a new ZRM Identity primitive;
- a competing Referent model;
- a second Routing Constitution;
- a new Trust authority;
- a new Evidence authority;
- a new Policy authority;
- an alternative Execution authority;
- a new GS1 semantic authority;
- a general Domain ontology;
- a carrier ontology.

Its role is narrower:

```text
GOVERNED MEANING
      │
      ▼
PUBLIC ADDRESSABILITY
      │
      ▼
NAMESPACE + ADDRESS FAMILY
      │
      ▼
RESOLUTION / DISCOVERY / DISPATCH
      │
      ▼
PROPER SEMANTIC OWNER
```

---

# 3. Relationship to ZRR

ZRR supplies and owns the generic Resolution architecture.

`ADDRESSING-001` governs the public namespace and Internet boundary through which a request becomes eligible to enter that architecture.

The ownership boundary is:

| Concern                                                        | ADDRESSING-001                        | ZRR / Other Owner                                              |
| -------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------- |
| Registrable roots / public origins                             | **Owns governance**                   | Consumes                                                       |
| Namespace classes                                              | **Owns**                              | Consumes                                                       |
| Public Namespace Registry                                      | **Owns**                              | Consumes                                                       |
| Namespace Binding admission/lifecycle                          | **Owns**                              | Consumes                                                       |
| Address Family Registry / public family label allocation       | **Owns allocation governance**        | Consumes                                                       |
| Family-native grammar/normalization semantics                  | **Does not own**                      | External standard / legacy ZPI / proper family owner           |
| Public Address Binding Key / handoff boundary                  | **Owns boundary definition**          | Consumes                                                       |
| HTTP-origin, redirect, cache and public-disclosure constraints | **Owns Internet-binding constraints** | ZRR must conform at public interface                           |
| Persistent public-address lifecycle / non-reassignment         | **Owns**                              | ZRR represents/serves applicable state                         |
| Resolution State                                               | **Does not define or own**            | **ZRR owns**                                                   |
| Resolution records / resource relationships                    | **Does not define or own**            | **ZRR owns**                                                   |
| Resource discovery                                             | **Does not define or own**            | **ZRR owns**                                                   |
| Resource selection / defaults / matching                       | **Does not define or own**            | **ZRR owns**, constrained by applicable family/semantic owners |
| Resolution Broker / Dispatcher                                 | **Does not define or own**            | **ZRR owns**                                                   |
| Resolution read-model / publication mechanics                  | **Does not define or own**            | **ZRR owns**                                                   |
| Domain interpretation                                          | **Does not own**                      | Z-PROF / Application / proper Domain owner                     |
| Trust / Policy / Evidence / Execution                          | **Does not own**                      | SEC / POL / Evidence / RI                                      |

The public handoff is conceptually:

```text
PUBLIC REQUEST
      │
      ▼
ADDRESSING
origin / NamespaceBinding
family admission
family-native normalization by proper owner
      │
      ▼
PUBLIC RESOLUTION HANDOFF
NamespaceBinding
+
FamilyNormalizedReference
+
only protocol/request metadata legitimately
recognized by the applicable family/profile
      │
      ▼
ZRR
Resolution State
resource relationships
discovery
selection
broker / dispatch
      │
      ▼
PROPER SEMANTIC OWNER
```

`ADDRESSING-001` may constrain ZRR's **public Internet behavior** where persistence, origin security, HTTP correctness, namespace lifecycle or external-standard conformance is at stake.

That constraint does not transfer ownership of ZRR's internal Resolution mechanics to ADDRESSING.

Tie-break rule:

> **If a question asks whether a public request belongs to a namespace/family, whether a public address may be issued/reused/retired, or what Internet-boundary invariants apply, ADDRESSING governs. If it asks what Resolution State contains or how resources are discovered, matched, selected or dispatched after handoff, ZRR governs.**

The permanent doctrine remains:

> **Resolution may discover where meaning can be obtained. Resolution does not become the owner of that meaning.**

---

# 4. Relationship to ZRM

ZRM is the controlling owner of Reality, Representation and Identity semantics.

ADDRESSING SHALL preserve the ZRM distinction among:

```text
Reality constituent
Identity relationship
Representation / Identifier
```

A URI or another public-address form MAY itself instantiate a Representation/Identifier.

That statement describes a possible **representational role**.

It does not establish a factual referent by itself.

The referent boundary is:

> **A Public Address MAY instantiate a Representation/Identifier of an underlying Reality constituent only where that referential relationship is established by the proper ZRM semantic-resolution / Evidence authority or another constitutionally valid authoritative mapping.**

Therefore:

```text
ADDRESSING issuance
≠
creation of a factual ZRM Identity relationship

successful ZRR Resource Resolution
≠
proof of a factual ZRM Identity relationship
```

A Public Address is also **not required** to represent a Reality constituent directly.

Depending on the applicable architecture, it may address or represent:

- a resolver;
- a registered resource;
- another Representation;
- a public Resolution entry point;
- a governed interaction surface;
- another constitutionally valid target.

Accordingly, the required rule is not that:

```text
Identifier
and
Public Address
```

can never overlap as categories.

The required rule is:

> **Identifier/Representation role and Public Address role are distinct and SHALL NOT be treated as interchangeable constitutional meanings.**

A Public Address MAY instantiate an Identifier/Representation while remaining distinct from:

- the Reality constituent;
- the factual Identity relationship that may connect the Representation to Reality;
- semantic Authority over that Reality;
- Trust or Evidence concerning the referential claim.

Likewise:

```text
hostname label "id"
≠ constitutional Identity authority
```

`id.unfict.com` is a persistent-addressing / Resource Resolution origin label.

It does not make ADDRESSING or ZRR the owner of ZRM Identity.

The separate question:

> **Which Reality constituent does this Representation actually refer to?**

belongs to the ZRM constitutional domain's semantic-resolution workstream and applicable Evidence governance.

ADDRESSING SHALL NOT answer that question merely because it admits or serves the public address.

---

# 5. Relationship to OWNERSHIP-001 and DELEGATION-001

The governing doctrine remains:

> **Authority provenance travels. Constitutional ownership does not.**

Technical control of:

- a domain;
- a hostname;
- DNS;
- a TLS certificate;
- a resolver;
- a route record;
- a custom-domain binding;
- a cache;

does not by itself create constitutional Authority over represented Reality.

Technical namespace delegation is also distinct from constitutional Delegation.

---

# 6. Relationship to ZII and ZQE

ZII owns interaction/carrier infrastructure.

ZQE owns QR mechanics.

The conceptual boundary is:

```text
CARRIER
QR / NFC / RFID / BLE / browser / app / future
        │
        ▼
public reference acquired
        │
        ▼
ADDRESSING / ZRR
        │
        ▼
proper semantic owner
```

Therefore:

```text
Carrier ≠ Identity
Carrier ≠ Address Family
QR grammar ≠ URI grammar
Resolver ≠ Carrier
```

---

# 7. Relationship to Z-PROF and Domain Semantics

Z-PROF and the applicable Application/Domain owner determine contextual/domain interpretation where required.

ADDRESSING does not create a new family merely because Unfict adds:

- DPP;
- Customs;
- Logistics;
- Healthcare;
- Real Estate;
- another Domain or Application.

Address families are public grammar boundaries, not business taxonomy.

---

# 8. Relationship to ZYAPI and Public Interfaces

REST, SDK, MCP, Host-Native and future interfaces may expose the same underlying capabilities.

A new interface does not automatically justify a new hostname.

The interface principle is:

> **Canonical underneath. Native on top. Explicit in between.**

The semantic ownership principle is:

> **Every public Unfict capability SHALL have one governed semantic owner beneath its interfaces.**

---

# 9. Two-Layer Governance

`ADDRESSING-001` separates:

## 9.1 Durable Addressing Law

Technology-independent or technology-minimizing laws governing:

- persistence;
- non-reassignment;
- semantic non-sovereignty;
- family ownership;
- namespace control;
- lifecycle;
- portability;
- delegation;
- succession;
- continuity.

## 9.2 Current Public Internet Binding Profile

Current realization using:

- domain names;
- DNS;
- HTTPS;
- URI syntax;
- HTTP;
- TLS;
- standardized well-known resources;
- browser origins;
- custom domains.

The binding profile may evolve.

Public-reference meaning SHALL NOT be rewritten merely because the current Internet implementation changes.

---

# PART II — CORE MODEL

# 10. Permanent Role Separation

The following constitutional/architectural roles SHALL remain explicit and SHALL NOT be treated as interchangeable:

```text
Reality constituent
Identity relationship
Representation / Identifier / Reference
Public Address role
Namespace
Address Family
Carrier
ZRR Resolution State
Resource Relationship
Destination
Capability
Execution
```

Some concrete artifacts MAY participate in more than one role.

In particular:

> **A Public Address MAY itself instantiate a Representation/Identifier.**

That overlap does not collapse the meanings.

Where a Public Address is asserted to represent an underlying Reality constituent, the referential relationship SHALL come from the proper ZRM semantic-resolution / Evidence authority or another constitutionally valid authoritative mapping.

Neither ADDRESSING nor ZRR manufactures that referential truth.

Therefore:

```text
Public Address as Representation
≠ Reality

Public Address as Representation
≠ intrinsic Identity object

Public Address issuance
≠ factual ZRM Identity proof

Public Address Resource Resolution
≠ factual ZRM Identity proof

Namespace control
≠ constitutional Authority

Resolver control
≠ semantic ownership

Resource registration
≠ endorsement

Redirect success
≠ downstream execution

ZRR Resolution success
≠ Truth
```

The architecture SHALL preserve role precision even where one URI, token, record or protocol object participates in multiple layers.

---

# 11. Definitions

## Address

A public coordinate/representation through which a resolver, resource or governed reference can be reached.

An Address may also instantiate a ZRM Representation/Identifier where the applicable ontology and proper referential authority establish that role.

An Address does not acquire an underlying Reality referent merely because ADDRESSING issued it or ZRR successfully resolved it.

## Persistent Public Address

A public address intentionally issued with a continuity obligation beyond the current application or implementation.

## Namespace

A governed public naming/address space under an identifiable controller and lifecycle.

## Origin

Under the current Internet profile, the HTTP origin security/addressing boundary determined by the applicable scheme/host/port semantics.

## Address Family

A governed public reference grammar interpreted under a named authority.

## Namespace Binding

A governed association between a public origin/namespace and the controller, family mode, lifecycle and serving authority entitled to operate it.

`NamespaceBinding` is an architectural abstraction governed by ADDRESSING, not a frozen implementation schema.

## Family-Normalized Reference

A reference interpreted and normalized according to the rules of its governing address family.

The grammar and normalization semantics remain with the proper family owner.

## Public Address Binding Key

Conceptually:

```text
NamespaceBinding
+
FamilyNormalizedReference
```

not a globally naked token.

This is a public-addressing lookup/handoff abstraction.

It SHALL NOT be treated as a universal ZRM Identity key.

## ADDRESSING Public Resolution Handoff Semantic Envelope

The ADDRESSING-owned semantic boundary after public namespace/family admission and before ZRR-owned Resource Resolution mechanics.

The envelope SHALL contain, conceptually:

```text
active/admitted NamespaceBinding reference
+
Address Family identity / applicable family-version provenance
+
FamilyNormalizedReference
+
only admitted protocol/request metadata
recognized by the applicable family/profile
+
admission/provenance information sufficient
to prevent silent reinterpretation
```

It SHALL NOT contain an inferred:

```text
Reality identity
Trust conclusion
Policy conclusion
Evidence sufficiency conclusion
execution authorization
```

merely because the public request exists.

## ZRR Public Resolution Input Contract — ZRR-PRIC

The versioned technical contract by which ZRR consumes the ADDRESSING Public Resolution Handoff Semantic Envelope.

`ZRR-PRIC` is owned by ZRR.

ADDRESSING owns the semantic envelope and invariants.

ZRR owns the versioned technical schema/serialization necessary to consume that envelope.

A concrete implementation SHALL conform to both.

Neither side may unilaterally reinterpret the other's semantics.

## ZRM Semantic Resolution

The distinct ZRM/Evidence-governed question:

> **Which Reality constituent does this Representation actually refer to?**

ADDRESSING does not own this determination.

## ZRR Resource Resolution

The ZRR-owned question:

> **Given an admitted public reference, what registered Resolution State/resources/handlers apply?**

This process does not, by itself, prove the ZRM Identity relationship.

## ZRR Resolution State — Referenced, Not Defined Here

`Resolution State` is a ZRR-owned concept.

ADDRESSING may require that public-address lifecycle and namespace invariants remain enforceable through Resource Resolution, but it SHALL NOT define the internal Resolution State schema, resource-relationship model, discovery algorithm or selection machinery.

## Alias / Alternate Representation

A second public representation associated with an existing persistent reference/binding where its proper governing family permits such a relationship.

An alias is not an independent semantic owner.

## Destination

A current resource returned or selected through ZRR Resource Resolution.

A destination may change without changing the Persistent Public Address.

## Critical Namespace Asset — CNA

A registrable root or equivalent namespace asset whose loss, hijack or unauthorized reassignment could invalidate or compromise Persistent Public Addresses.

## Minimum Continuity Service — MCS

A deliberately reduced read-only or limited service capable of preserving essential P1 reference continuity when ordinary Unfict operation cannot continue.

---

# 12. Public Resolution Is Namespace-Scoped

A public reference SHALL NOT be interpreted as a globally naked token.

For example:

```text
https://id.unfict.com/gs1/01/09506000134352
```

and:

```text
https://id.brand.example/01/09506000134352
```

are distinct public addresses because they exist in different namespaces, even if applicable standards, ZRM semantic resolution or downstream ZRR state later associate them with the same Reality constituent or resource relationships.

Therefore:

> **Public Resource Resolution occurs inside a verified/admitted namespace.**

This rule does not assert that the hostname/path pair itself is the factual ZRM Identity of the underlying Reality.

---

# 13. Raw `(hostname, path)` Is Not Universal Semantics

The pair:

```text
(hostname, path)
```

is closer to public address identity than a token alone, but it is not a universal semantic key.

Some families may give meaning to:

- path;
- query;
- qualifiers;
- protocol-defined attributes.

The generic flow is therefore:

```text
request origin
    ↓
NamespaceBinding
    ↓
family selection
    ↓
family-native parsing / normalization
    ↓
FamilyNormalizedReference
```

---

# PART III — DURABLE ADDRESSING LAWS

# 14. ADDR-001 — Persistence

A Persistent address SHALL be designed so ordinary implementation evolution does not require the public address to change.

---

# 15. ADDR-002 — Non-Reassignment

A publicly issued Persistent address SHALL NEVER be intentionally reassigned to an unrelated persistent referent/reference.

Retirement SHALL NOT return it to an available pool.

---

# 16. ADDR-003 — Destination Mutability

A destination MAY change without changing the Persistent address.

Changes SHALL remain attributable and reconstructable according to applicable governance.

---

# 17. ADDR-004 — Implementation Independence

Changing any of the following SHALL NOT require changing a P1 address:

- database;
- storage engine;
- cache;
- queue;
- framework;
- language;
- CDN;
- DNS provider;
- cloud provider;
- registrar;
- certificate automation;
- resolver implementation;
- internal service topology.

---

# 18. ADDR-005 — Versionless P1

Software/API deployment versions SHALL NOT appear in a Unfict-native P1 address merely because the current implementation is versioned.

Implementation forms such as:

```text
/v1/
/v2/
```

belong to interface contracts, not automatically to persistent Reality-linked addresses.

---

# 19. ADDR-006 — Host Labels Do Not Own Constitutional Meaning

The label:

```text
id
```

in:

```text
id.unfict.com
```

is a service-discovery / addressing label.

It SHALL NOT be interpreted as a claim that the hostname owns constitutional Identity.

To resist long-term semantic drift, Unfict-authored documentation, SDK descriptions, API descriptions, diagrams and product language SHALL describe `id.unfict.com` as a **persistent addressing / Resolution origin**, not as "the Unfict Identity service" or equivalent wording that transfers ZRM Identity ownership to the hostname.

Historical references to `id.zyppi.me` remain historically correct in Zyppi-era artifacts.

The same naming discipline applies to future host labels.

A convenient hostname label SHALL NOT acquire semantic sovereignty by repetition.

---

# 20. ADDR-007 — Explicit Address-Family Ownership

Where a P1 origin supports more than one independently governed grammar, the family SHALL be explicitly selected before family-native interpretation.

---

# 21. ADDR-008 — No Guess Under Material Ambiguity

Where different interpretations would materially change meaning, the system SHALL require explicit disambiguation or return an ambiguity/failure result.

Token shape alone SHALL NOT silently become semantic inference.

---

# 22. ADDR-009 — Standards Preservation

External standards remain authoritative over their own grammar and semantics.

Unfict may host/adapt them.

It SHALL NOT silently convert them into Unfict-owned semantics.

---

# 23. ADDR-010 — Namespace Minimalism

A new:

- Domain;
- Application;
- Standard;
- interface;
- carrier;
- customer segment;
- Capability;

does not automatically justify a new first-party hostname.

---

# 24. ADDR-011 — Alias Non-Reassignment

A publicly issued Persistent alias SHALL NOT later be assigned to an unrelated persistent reference.

---

# 25. ADDR-012 — Provider Independence

Provider-generated domains, storage coordinates, regions or framework paths SHALL NOT become canonical P1 coordinates.

---

# 26. ADDR-013 — Privacy by Address Design

Unfict-native P1 addresses SHOULD avoid unnecessary direct encoding of personal, organizational, tenant or commercial information.

Opaque references are preferred where semantics need not be human-readable.

---

# 27. ADDR-014 — Explicit Failure

Unknown, malformed, unsupported, retired or unauthorized references SHALL NOT be silently redirected to an unrelated homepage or guessed substitute.

---

# 28. ADDR-015 — Twenty-Year Test

Before a family/origin receives P1 activation:

> **If the physical reference remains deployed twenty years from now, can Unfict replace every current implementation component without changing the reference?**

If not, it is not P1-ready.

---

# PART IV — PUBLIC NAMESPACE GOVERNANCE

# 29. Namespace Classes

The Internet Binding Profile classifies public namespaces as follows.

## P0 — Registrable / Strategic Root

Examples:

```text
unfict.com
unfi.cc
zyppi.me   # legacy / defensive
zpi.to     # legacy / defensive
```

## P1 — Persistent Addressing Origin

Selected first-party origin:

```text
id.unfict.com
```

## P2 — Public Product / Service Origin

Examples:

```text
api.unfict.com
docs.unfict.com
console.unfict.com
status.unfict.com
```

## P3 — Internal / Temporary / Non-Persistent Origin

Examples:

```text
preview
staging
ephemeral deployment hosts
provider-generated hostnames
```

## P4 — Customer-Controlled Namespace

Examples:

```text
id.customer.example
resolver.brand.example
products.company.example
```

P4 is governed by customer namespace sovereignty and Domain Binding rules.

Legacy roots do not become active Unfict P1 roots merely because they are retained.

---

# 30. Selection ≠ Activation

Three distinct states apply:

```text
RESERVED
namespace protected from accidental consumption

SELECTED
architecture assigns a role

ACTIVATED
production use/issuance authorized
```

Selection does not create DNS or issuance authority.

---

# 31. Public Namespace Registry

Unfict SHALL maintain one authoritative **Public Namespace Registry**.

Each entry SHOULD record at least:

```text
hostname / root
namespace class
canonical purpose
controller
technical steward
semantic owner where relevant
single-family / multi-family mode
family binding where applicable
lifecycle status
activation status
security boundary
TLS policy
cookie boundary
canonicalization
decommission policy
dependencies
supersession history
```

Exact schema remains implementation work.

---

# 32. Host Admission

A new official first-party hostname requires:

1. durable technical/public purpose;
2. namespace classification;
3. controller/steward;
4. security boundary;
5. lifecycle policy;
6. collision review;
7. Public Namespace Registry admission.

"Convenient for this project" is insufficient.

---

# 33. Corporate Root

The corporate/public root is:

```text
https://unfict.com/
```

It is the canonical institutional/public web root for the Unfict era.

It SHALL NOT become the generic P1 namespace for large-scale Reality-linked persistent references merely because it is the corporate root.

The legacy root:

```text
https://zyppi.me/
```

SHALL remain under controlled retention where practical for:

- historical continuity;
- permanent redirects;
- defensive ownership;
- provenance;
- anti-impersonation;
- legacy public links.

No new P1 namespace meaning is created on `zyppi.me` by retention alone.

---

# 34. `www` Alias

The compatibility alias is:

```text
www.unfict.com
```

It SHOULD permanently redirect to:

```text
unfict.com
```

when the canonical website migration is stable.

The alias exists for web compatibility.

It SHALL NOT become a separate semantic namespace.

Legacy `www.zyppi.me` may remain as a historical/redirect surface under the succession migration plan.

---

# 35. `www`

```text
www.unfict.com
```

SHOULD be a compatibility alias redirecting to:

```text
unfict.com
```

It SHALL NOT host divergent canonical product semantics.

---

# 36. Selected Long-Form P1 Origin

The selected first-party long-form P1 origin is:

```text
https://id.unfict.com/
```

This decision supersedes the pre-activation selection of:

```text
https://id.zyppi.me/
```

No irreversible P1 issuance occurred under the legacy selected origin.

Therefore the succession is a pre-activation namespace selection change, not an address migration.

Production P1 issuance remains prohibited until all activation gates are satisfied.

---

# 37. Rejected / Non-Primary P1 Origins

The following are rejected as the primary Unfict first-party P1 origin:

```text
route.unfict.com
go.unfict.com
r.unfict.com
resolve.unfict.com
unfict.com/<token>
unfi.cc/<token>    # compact representation only, not long-form primary P1 origin
```

The legacy selected origin:

```text
id.zyppi.me
```

is no longer the forward P1 origin after `ZUSD-001`.

It SHALL be retained only according to the legacy/defensive migration plan and SHALL NOT receive new irreversible P1 issuance.

---

# 38. Initial Unfict Public-Service Topology

| Origin / root            | Class       | Decision                                               |
| ------------------------ | ----------- | ------------------------------------------------------ |
| `unfict.com`             | P0/P2       | **SELECTED** canonical institutional/public root       |
| `www.unfict.com`         | Alias       | **SELECTED** redirect-only compatibility               |
| `id.unfict.com`          | P1          | **SELECTED / NOT ACTIVATED**                           |
| `api.unfict.com`         | P2          | **SELECTED** production API                            |
| `docs.unfict.com`        | P2          | **SELECTED** documentation                             |
| `console.unfict.com`     | P2          | **SELECTED CANDIDATE** control plane                   |
| `status.unfict.com`      | P2          | **SELECTED** status                                    |
| `sandbox.api.unfict.com` | P2 non-prod | **RESERVED**                                           |
| `unfi.cc`                | P0 compact  | **SELECTED STRATEGIC COMPACT ROOT / NOT ACTIVATED**    |
| `zyppi.me`               | Legacy P0   | **RETAIN / DEFENSIVE / REDIRECT / NO NEW P1 ISSUANCE** |
| `zpi.to`                 | Legacy P0   | **RETAIN / DEFENSIVE / NO NEW ISSUANCE**               |
| `zyppi.org`              | Legacy P0   | **DEFENSIVE RETENTION IF CONTROLLED / REASONABLE**     |

The selected topology is forward-looking Unfict namespace governance.

Legacy roots remain part of the historical and defensive namespace estate but are not active Unfict canonical roots.

---

# 39. Address Family Registry

The P1 architecture SHALL maintain an **Address Family Registry** distinct from the Public Namespace Registry.

It answers:

> **Which grammar owns interpretation once a request enters an applicable namespace?**

A family entry SHOULD identify:

```text
family label
grammar authority
semantic/standards owner
normalization owner
resolver profile
lifecycle
collision constraints
well-known discovery requirements where applicable
```

---

# 40. Family Admission Test

A P1 family SHOULD normally satisfy all of the following:

1. **Distinct Public Grammar** — it defines/consumes a distinct persistent grammar.
2. **Distinct Grammar Authority** — an owner is responsible for interpretation.
3. **Parsing Consequence** — selecting another family would materially alter parsing/normalization.
4. **Persistent Need** — the grammar has a legitimate durable reference role.
5. **Existing Family Insufficient** — it cannot be faithfully represented inside an existing family.
6. **Not Mere Application Taxonomy** — it is not simply a business Domain/Application/Capability label.

Address-family cardinality SHOULD remain small relative to Domain/Application cardinality.

---

# 41. Multi-Family Origin

The selected first-party P1 origin is multi-family.

Default structure:

```text
https://id.unfict.com/<family>/<family-native-reference>
```

Examples:

```text
https://id.unfict.com/gs1/...
https://id.unfict.com/<future-family>/...
```

Any future non-GS1 family remains contingent on its own separately governed specification.

---

# 42. Single-Family Origin

A customer P4 origin MAY be bound entirely to one family.

Example:

```text
https://id.brand.example/01/09520123456788
```

If the entire origin is explicitly GS1-bound, an added `/gs1/` prefix is not required merely to imitate the first-party multi-family structure.

---

# 43. Family Labels

Family labels SHOULD be:

- short;
- stable;
- lowercase;
- auditable;
- semantically unambiguous;
- unique under the P1 origin;
- non-reassignable once activated.

---

# 44. GS1 Family

The selected first-party GS1 family root is:

```text
https://id.unfict.com/gs1/
```

Example:

```text
https://id.unfict.com/gs1/01/09520123456788
```

The `/gs1/` segment belongs to Unfict's custom URI stem.

GS1-native grammar begins after that boundary.

---

# 45. GS1 Terminology

A Unfict-hosted valid GS1 Digital Link URI SHALL NOT be casually called the "canonical GS1 URI" where GS1 assigns canonical/reference-domain semantics to its own controlled reference domain.

Use standards-accurate wording such as:

> **valid GS1 Digital Link URI using the Unfict-operated resolver domain**

---

# 46. GS1 Resolver Discovery

A future GS1-Conformant Resolver on the selected origin SHALL expose the applicable Resolver Description File at:

```text
https://id.unfict.com/.well-known/gs1resolver
```

For the currently selected first-party GS1 family stem, the `resolverRoot` value inside that Resolver Description File SHALL identify the exact GS1 custom URI stem:

```text
https://id.unfict.com/gs1
```

and SHALL NOT be shortened to merely:

```text
https://id.unfict.com/
```

if doing so would cause clients to construct GS1 Digital Link URIs outside the governed `/gs1/` family boundary.

All other Resolver Description File fields and behaviors remain subject to the current applicable GS1-Conformant Resolver specification and official conformance requirements.

---

# 47. One First-Party GS1 Root

Do not create parallel first-party roots such as:

```text
/products/
/gtin/
/commerce/gs1/
```

for the same GS1 family.

One standard.

One registered family boundary.

One first-party resolver root.

---

# 48. Legacy legacy ZPI Family Reservation — No Forward Commitment

The Zyppi-era reservation:

```text
/zpi/
```

is retained as historical design provenance only.

This Unfict succession revision does **not** select `/zpi/` as an Unfict-native Address Family label.

No new semantic meaning SHALL be inferred from the historical reservation.

Future Unfict canonical-address governance may:

- define a new family label;
- retain `/zpi/` for compatibility;
- leave it unused;
- supersede the legacy ZPI vocabulary entirely.

Until such governance closes the question:

```text
/zpi/
= LEGACY RESERVED
= NOT ACTIVE
= NO NEW PERMANENT ISSUANCE
```

---

# 49. `unfi.cc` — Selected Strategic Compact Root

`unfi.cc` is classified:

```text
P0 — SELECTED STRATEGIC COMPACT ROOT
NOT ACTIVATED
```

Its intended role is an optional compact public representation of a governed persistent reference.

Conceptually:

```text
long-form:
https://id.unfict.com/<family>/<reference>

optional compact representation:
https://unfi.cc/<compact-reference>
```

`unfi.cc` SHALL NOT become:

- a generic anonymous URL shortener;
- an independent semantic owner;
- an independent ZRR Resolution database;
- a freely reassignable vanity-link namespace;
- a way to bypass Address Family governance;
- a way to bypass public-address lifecycle/non-reassignment law.

The compact representation SHOULD resolve through the same governed reference / ZRR Resolution State as its corresponding long-form representation where such a relationship is defined.

Permanent compact issuance remains blocked until §52 is satisfied.

---

# 50. Compact Representation Relationship — Selected Root, Semantics Deferred

This revision selects:

```text
unfi.cc
```

as the strategic compact root.

It does **not** yet freeze:

- compact token grammar;
- compact token length;
- derivation algorithm;
- random vs deterministic allocation;
- canonical-vs-alias terminology;
- one-to-one cardinality between compact and long-form representations;
- whether every P1 reference receives a compact form;
- vanity/public-slug behavior;
- offline encoding behavior;
- checksum/error-detection behavior.

The durable invariant is:

> **A compact representation SHALL NOT silently acquire separate semantic meaning from the governed persistent reference it represents.**

Where a compact representation is bound to a long-form persistent reference:

```text
same governed reference
same lifecycle protections
same non-reassignment protections
same proper semantic owners
same ZRR Resource Resolution authority
```

shall apply unless a future ratified compact-reference profile states a stricter rule.

The short root is selected.

The token model is not yet ratified.

---

# 51. Compact Root Does Not Create Identity or Meaning

Neither:

```text
unfi.cc
```

nor a future compact token under it creates:

- Reality;
- ZRM Identity;
- factual referent truth;
- Trust;
- Authority;
- ownership;
- execution semantics;
- a new Address Family by implication.

Compactness is a representation/property of addressing.

It is not semantic sovereignty.

The proper semantic owner must define the governed reference relationship before any compact token can be treated as a persistent representation of that reference.

---

# 52. No Permanent Compact Issuance Before Compact Governance

Until a dedicated Unfict compact-reference profile is ratified:

- no irreversible `unfi.cc/<...>` token SHALL be issued as P1-equivalent persistent infrastructure;
- no physical carrier SHALL depend on an unratified compact-token grammar;
- no compact token SHALL be freely reassigned;
- no compact token SHALL maintain an independent destination database outside the governed ZRR model;
- no generic shortener product SHALL consume the strategic compact root.

The compact-reference profile SHALL define at minimum:

```text
token grammar
allocation/collision rules
binding to governed persistent reference
lifecycle / retirement
non-reassignment
canonical-or-alternate representation semantics
carrier behavior
security / abuse controls
continuity / export
```

The legacy root:

```text
zpi.to
```

remains a Zyppi-era strategic reservation.

It SHALL receive no new permanent issuance under the Unfict architecture unless a future explicit amendment re-authorizes it.

---

# 53. Customer Namespace Sovereignty

A customer-controlled P4 domain is a genuine public namespace, not merely cosmetic branding over Unfict's hostname.

The architecture may be:

```text
customer namespace
        │
        ▼
Unfict-operated resolver
        │
        ▼
governed Resolution state
        │
        ▼
proper semantic owner
```

---

# 54. Direct Customer Resolution

A customer address SHOULD be capable of resolving directly.

It SHOULD NOT require an unnecessary hop through `id.unfict.com` merely to prove that Unfict operates the infrastructure.

---

# 55. Customer Exit Test

A customer controlling:

```text
id.brand.example
```

should be able to change DNS to a replacement resolver while preserving the public URI.

Address continuity does not guarantee continuity of all Unfict value-added services.

---

# 56. Customer Responsibility

Custom-domain sovereignty creates both control and responsibility.

Unfict cannot guarantee persistence of a customer-owned root if the customer:

- lets it expire;
- sells/transfers it;
- removes DNS;
- loses control;
- intentionally repurposes it.

P1 and P4 persistence promises SHALL therefore remain distinguishable.

---

# 57. Domain Binding ≠ DNS Routing ≠ Certificate Authorization

Three facts SHALL remain distinct:

```text
tenant/domain-control proof
≠
traffic routing
≠
TLS certificate authorization
```

A CNAME is not by itself proof that a particular Unfict tenant is entitled to claim a hostname.

A certificate is not by itself tenant ownership proof.

---

# 58. Fresh Domain-Control Proof

A new, conflicting, reclaimed or sensitive custom-domain claim SHALL require fresh proof of **current** control bound to:

```text
requested hostname
+
current claimant / tenant
+
current claim transaction
```

The proof SHALL NOT be satisfiable solely by:

- residual DNS routing;
- a lingering CNAME, A or AAAA record that still targets Unfict/shared edge infrastructure;
- the fact that a shared provider currently routes the hostname to Unfict;
- an existing or stale TLS certificate;
- an HTTP response that can be produced only because the previous Unfict/provider binding still exists;
- proof retained from an earlier claimant.

Acceptable verification may use a fresh DNS TXT challenge or another independently validated/out-of-band control mechanism appropriate to the provider and Security profile.

ADDRESSING does not freeze one verification protocol.

The required invariant is:

> **Residual reachability through shared infrastructure is not proof that a new tenant controls the namespace.**

Domain-control proof, traffic routing and certificate authorization remain distinct facts.

---

# 59. Active Host Exclusivity

A normalized active custom hostname SHALL have at most one active namespace-controller binding at a time.

Two unrelated tenants SHALL NOT simultaneously hold Unfict mutation/serving authority for the same normalized hostname.

Shared edge-provider infrastructure SHALL NOT weaken this rule.

A hostname that still reaches Unfict at the provider/network layer but has no active verified Namespace Binding SHALL fail closed rather than becoming eligible for a default tenant or opportunistic claim.

---

# 60. Hostname & Internationalized-Domain Normalization

Uniqueness shall be evaluated after standards-correct hostname normalization, including appropriate handling of:

- case insensitivity;
- current IDNA processing / ASCII-compatible form;
- Unicode normalization requirements applicable to internationalized domain names;
- trailing-dot equivalence where applicable;
- exact hostname boundaries.

Naive string comparison is insufficient.

Visual similarity is not domain identity.

Security controls SHOULD identify suspicious internationalized-domain/confusable or homograph-sensitive claims for elevated verification/review where user deception risk is material.

Such review SHALL NOT silently redefine DNS or IDNA equivalence rules.

---

# 61. Public Suffix Awareness

Where Unfict needs a registrable-domain boundary, it SHALL use a maintained public-suffix-aware mechanism or equivalent.

It SHALL NOT assume that the registrable domain is always the last two labels.

The Public Suffix List is useful boundary data, not an oracle of DNS existence or domain control.

---

# 62. Custom-Domain Lifecycle

The conceptual lifecycle SHALL distinguish states equivalent to:

```text
REQUESTED
VERIFICATION_PENDING
VERIFIED
SERVING_PREPARED
ACTIVE
SUSPENDED
DETACH_PENDING
RETIRED_HELD
RELEASED
```

Exact implementation names may differ.

The semantic distinctions SHALL not disappear.

---

# 63. Safe Detachment & RETIRED_HELD

Deleting or revoking a customer-domain binding in a Unfict account SHALL NOT make the hostname immediately active for another tenant.

The prior service association SHALL enter a protected condition equivalent to:

```text
RETIRED_HELD
```

when safe release/rebind conditions are not yet satisfied.

A safe sequence SHALL preserve the following semantics:

```text
disable prior customer serving authority
    ↓
enter detachment / held state
    ↓
remove or isolate prior provider service binding
    ↓
remove, replace, invalidate or otherwise neutralize
obsolete certificate/service authorization as applicable
    ↓
resolve security/legal holds
    ↓
RELEASE
OR
fresh independently verified legitimate rebind
```

Important:

> **Customer DNS does not have to stop pointing at Unfict before a legitimate new controller can begin a fresh claim transaction.**

A claim MAY be initiated while the hostname remains `RETIRED_HELD`.

But the hostname SHALL NOT become `ACTIVE` for the new controller until:

1. fresh current-control proof satisfying §58 succeeds;
2. prior Unfict tenant/provider serving authority capable of serving the previous tenant has been neutralized or isolated;
3. stale certificate/service authorization has been handled as required;
4. no unresolved security/legal hold prohibits activation;
5. a new NamespaceBinding has been independently admitted.

While held:

- lingering DNS SHALL NOT authorize a new tenant;
- provider-level reachability SHALL NOT select a default tenant;
- the old tenant SHALL NOT retain serving authority;
- a neutral/non-revealing failure response SHOULD be preferred where traffic still arrives;
- automated or periodic dangling-binding/DNS detection **SHALL** identify unresolved P4 detachment risk.

No universal fixed hold duration is constitutionally required.

If safe release/rebind conditions cannot be established, remaining in `RETIRED_HELD` is a legitimate fail-closed outcome.

---

# 64. RELEASED & Reclaim After Prior Binding

`RELEASED` means the prior Unfict service association has completed safe termination and is no longer an active or held serving authority.

Release requires, at minimum:

- prior tenant serving authority terminated;
- old Unfict/provider service binding removed or safely isolated;
- obsolete certificate/service authorization handled as required;
- no unresolved security/legal hold requiring continued hold;
- release recorded through the governed Domain Binding lifecycle.

Lingering customer DNS MAY still point at shared Unfict infrastructure after `RELEASED`.

Such reachability SHALL fail closed and SHALL NOT itself authorize any claimant.

A `RELEASED` hostname is not automatically claimable.

Any later controller must begin a fresh claim transaction and prove current control under §58.

A legitimate new controller MAY also begin fresh verification while the prior binding is `RETIRED_HELD`.

Where the conditions for new activation are satisfied, the implementation MAY perform an atomic safe rebind so that no opportunistic unowned serving interval exists.

Historical possession is neither permanent ownership nor automatic authorization.

---

# 65. Wildcard Custom Domains

Wildcard customer namespace bindings require explicit separate authorization and stronger scope review.

Ordinary single-host verification SHALL NOT automatically grant:

```text
*.brand.example
```

control.

A wildcard namespace/resolution binding grants **zero automatic wildcard authority** for:

- OAuth/OIDC redirect URIs;
- credentialed CORS origins;
- Unfict administrative sessions;
- cookie scope;
- unrelated subdomain capabilities.

Each of those remains governed by its own Security/interface rules.

---

# 66. Provider-Neutral Customer Export

Customer-owned Resolution state SHOULD be exportable, where lawful and contractually appropriate, in a documented machine-readable form that does not require one infrastructure vendor merely to interpret it.

Portability does not transfer semantic authority Unfict does not own.

---

# PART VII — RESOLUTION SEMANTICS

# 67. Public Resolution Constraints — Not ZRR Mechanics

ADDRESSING does not define ZRR's internal Resolution model.

It establishes only public-address and Internet-binding invariants that any ZRR implementation exposed through governed Unfict origins must respect.

In particular, the public architecture SHALL NOT require ZRR to collapse Resolution into:

```text
slug → URL
```

because doing so would prematurely constrain ZRR's ability to support typed discovery, standards-native Resolution, machine-readable relationships and registered capabilities.

Whether and how those mechanisms are modeled internally belongs to ZRR and the applicable semantic/family owners.

---

# 68. Sacred Fast Path

Ordinary public redirect/distribution SHALL remain:

- fast;
- predictable;
- dependency-minimal;
- highly available;
- cacheable where appropriate;
- independent of optional analytics;
- independent of optional AI;
- independent of dashboards/billing UI;
- independent of administrative-control-plane availability.

The operational importance of redirect does not make redirect the ontology of Resolution.

---

# 69. Public Resolution Handoff Boundary

ADDRESSING processing ends at the public namespace/family admission boundary.

Conceptually:

```text
PUBLIC REQUEST
      │
      ▼
origin / authority validation
      │
      ▼
NamespaceBinding
      │
      ▼
single-family or multi-family admission
      │
      ▼
family-native interpretation / normalization
by the proper family owner
      │
      ▼
ADDRESSING PUBLIC RESOLUTION HANDOFF
```

ADDRESSING owns the **semantic envelope** of that handoff.

The envelope SHALL carry, conceptually:

```text
namespaceBindingRef
addressFamilyRef / family-version provenance
familyNormalizedReference
admittedRequestContext
admissionProvenance
```

where:

- `namespaceBindingRef` identifies the admitted active namespace association without turning the entire implementation object into public meaning;
- `addressFamilyRef` identifies the governing family/profile and version provenance needed to prevent silent grammar drift;
- `familyNormalizedReference` is produced under the proper family owner's rules;
- `admittedRequestContext` includes only request/protocol metadata explicitly recognized by the applicable family/profile;
- `admissionProvenance` is sufficient to bind the handoff to the governing namespace/family admission decision.

The semantic envelope SHALL NOT infer:

```text
Reality referent
Trust
Policy
Evidence sufficiency
execution authorization
```

The versioned technical contract that realizes this envelope is ZRR-owned and is named:

```text
ZRR Public Resolution Input Contract
ZRR-PRIC
```

---

# 70. Handoff Contract Ownership & ADDRESSING Stop Rule

ADDRESSING owns:

- the Public Resolution Handoff boundary;
- the mandatory semantic envelope;
- the meaning and admissibility constraints of the envelope's fields;
- the rule that only family/profile-admitted request metadata may cross.

ZRR owns:

- the versioned `ZRR-PRIC` technical schema/serialization;
- compatibility/version rules for consuming the envelope;
- validation that a received contract version can be processed without semantic reinterpretation.

A ZRR implementation SHALL reject or explicitly negotiate an unsupported/incompatible `ZRR-PRIC` version.

It SHALL NOT guess compatibility.

After the Public Resolution Handoff, ADDRESSING SHALL NOT define:

- Resolution State;
- resource-record schema;
- resource relationships;
- discovery algorithm;
- default-resource mechanics;
- matching order;
- selection algorithm;
- Resolution Broker implementation;
- dispatch graph;
- serving read-model design.

Those responsibilities belong to ZRR, constrained by the applicable external standard and proper semantic owners.

---

# 71. ZRR Owns Discovery, Selection & Dispatch

ZRR SHALL own the generic mechanics by which a handed-off reference:

```text
locates Resolution State
discovers registered relationships
selects or exposes applicable resources
dispatches to the registered target/handler
publishes/serves Resolution results
```

ADDRESSING may cite such behavior only to express a public Internet constraint, security invariant, lifecycle rule or constitutional stopping boundary.

Such citation SHALL NOT be interpreted as duplicate ownership.

---

# 72. Internet-Binding Constraints on ZRR Outputs

Where ZRR produces a public HTTP or equivalent disposition, ADDRESSING may require that the public output obey:

- namespace admission;
- external-standard conformance;
- non-reassignment;
- origin isolation;
- redirect correctness;
- cache correctness;
- privacy/disclosure constraints;
- custom-domain sovereignty;
- lifecycle and continuity requirements.

This is analogous to a transport/public-binding contract.

It does not tell ZRR which internal Resolution record or algorithm must exist.

---

# 73. Cross-Constitutional Resolution Stopping Rule

Two Resolution questions SHALL remain distinct.

## 73.1 ZRM Semantic Resolution

Question:

> **Which Reality constituent does this Representation actually refer to?**

Owner:

```text
ZRM semantic-resolution architecture
+
applicable Evidence governance
```

## 73.2 ZRR Resource Resolution

Question:

> **Given an admitted public reference, which registered Resolution State/resources/handlers apply?**

Owner:

```text
ZRR
```

## 73.3 Non-Escalation Rule

> **Successful Public Address / ZRR Resource Resolution SHALL NOT, by itself, establish the factual ZRM Identity relationship between a Representation and a Reality constituent.**

Likewise:

> **ZRR Resource Resolution SHALL stop when answering the next question requires semantic authority owned elsewhere.**

In compact form:

```text
ZRR may answer:
"Which registered resource/capability/handler applies
under the governed Resolution model?"

ZRR must not silently answer:
"Which Reality is this representation factually about?"
or
"What should that semantic owner conclude?"
```

ZRM/Evidence own factual referent resolution.

The proper Domain / Standard / POL / SEC / Evidence / Capability owner owns semantic judgment beyond the ZRR boundary.

---

# 74. Single Capability Semantic Owner

Every public Unfict capability SHALL have one governed semantic owner.

REST, SDK, MCP, Resolution and Host-Native surfaces adapt that capability.

They SHALL NOT independently implement divergent:

- business semantics;
- Trust semantics;
- Policy semantics;
- authorization;
- Evidence interpretation;
- domain judgment;
- error meaning.

---

# 75. Consuming an Owner's Decision

Resolution MAY invoke or consume a result from the proper owner.

Example:

```text
Resolver
   ↓
POL-owned authorization capability
   ↓
ALLOW / DENY
   ↓
Resolver dispatches according to that result
```

Consuming the decision is not reimplementing it.

---

# 76. No Local Reconstruction of Owner Meaning

If the proper owner is unavailable, the resolver SHALL NOT reconstruct its semantic result from incomplete local data merely to preserve traffic.

Mandatory Authority failure and optional Intelligence failure are different.

---

# 77. Two Operational Lanes

## Distribution Fast Path

For ordinary public routing/discovery.

Properties:

```text
published state
deterministic
minimal dependencies
no hidden generative AI
no optional live reasoning
```

## Governed Interaction Path

For operations genuinely requiring:

- current Trust;
- current Policy;
- authorization;
- domain evaluation;
- authenticated capability;
- RI execution.

Failure may legitimately fail closed.

---

# 78. No Hidden AI Selector

A generative model SHALL NOT invisibly decide ordinary P1 destination selection where no explicit governed selection rule exists.

AI may:

- call Resolution;
- request relations;
- inspect descriptions;
- invoke authorized capabilities.

It does not become an ambient routing oracle.

---

# 79. Contextual Routing Boundary

ADDRESSING does not define ZRR's contextual matching algorithm.

Where ZRR or an applicable standards/profile owner authorizes contextual selection, the public architecture SHALL require that:

1. context inputs are explicitly defined;
2. the relevant family/profile owns their meaning;
3. matching rules are governed rather than inferred ad hoc;
4. Resolution uses only admitted state/attributes;
5. material ambiguity fails safely.

Contextual does not mean inferentially arbitrary.

---

# 80. Relation Type ≠ Media Type ≠ Interface

A relation answers:

> How is the target related to the reference?

A media type answers:

> What representation format is available?

An interface answers:

> Through what interaction contract is a capability exposed?

These SHALL remain separate dimensions.

---

# 81. No ADDRESSING-Imposed Giant Resolution Enum

ADDRESSING SHALL NOT require ZRR to harden a universal enum mixing concepts such as:

```text
WEB
API
GS1
DPP
SUPPORT
AGENT
VERIFY
BUY
RETURN
```

because these may mix relation, interface, Standard, Domain and Capability concepts.

ZRR and proper semantic/standards owners SHALL define their own registered relationship/target model without collapsing these dimensions.

---

# 82. Web Linking and Linkset Direction

For HTTP-based discovery, Unfict SHOULD reuse standard Web Linking semantics where appropriate.

Machine discovery SHOULD support a standards-aligned structured linkset representation where appropriate rather than requiring HTML scraping.

For GS1, the applicable GS1 Resolver specification governs its own linkset behavior.

---

# 83. Default Resource Constraint

ADDRESSING does not define how ZRR models a default resource.

Where ZRR or the applicable Address Family/standard legitimately defines one, public behavior may use it for low-friction interaction.

A default means:

```text
governed deterministic fallback
```

not:

```text
semantic truth
```

The structural/default-selection semantics remain with the applicable family/profile where that family defines them.

ADDRESSING SHALL NOT force a universal default algorithm that overrides an external standard's context-dependent rules.

Where no governing default exists and material ambiguity remains, public behavior SHALL expose ambiguity/discovery rather than inventing a destination.

---

# 84. External URL ≠ Internal Capability

An arbitrary external URL SHALL NEVER be treated as equivalent to a governed internal Unfict Capability.

A Capability requires governed identity/ownership and authorized semantics.

A URL is only a coordinate/target representation.

---

# 85. No Generic Server-Side Fetch

The generic resolver SHALL NOT fetch arbitrary customer/external destinations merely to perform ordinary routing.

External retrieval, ingestion or verification is a separate capability with its own SSRF/security/Evidence responsibilities.

---

# 86. Capability Discovery ≠ Invocation

Resolution may expose that a Capability exists.

It does not execute that Capability merely by discovering it.

Execution remains with the appropriate authorized interface and RI boundary where applicable.

---

# 87. Resolution Success Non-Escalation

A successful Resolution does not prove:

- authenticity;
- ownership;
- Trust;
- Evidence sufficiency;
- Policy satisfaction;
- downstream Action success.

It proves only what Resolution legitimately owns.

---

# PART VIII — HTTP & PUBLIC REPRESENTATION

# 88. Mutable Destination Redirects

Where ZRR returns a temporary HTTP redirection from a stable P1 address to a current destination that may change later, temporary redirect semantics SHALL be used.

`302 Found` MAY be used only when:

1. the actual request method is `GET` or `HEAD`; and
2. the applicable serving/family profile explicitly authorizes `302` for that class of interaction.

Absent such explicit authorization, a temporary redirect that must preserve the request method/body SHALL use `307 Temporary Redirect`.

A generic P1 implementation SHALL NOT use `302` as an undifferentiated redirect for method-bearing actions such as `POST`, `PUT`, `PATCH`, `DELETE` or another request whose semantics could be changed by conversion to `GET`.

The durable reference remains the P1 address.

---

# 89. Permanent URI Replacement

`301`/`308` semantics SHALL be reserved for genuine permanent public-URI replacement, not ordinary mutable routing.

A current destination SHALL NOT be declared the permanent replacement simply because it happens to be stable today.

Publishing a permanent P1 URI replacement is a **persistence-critical operation**.

It SHALL require:

- elevated change control;
- explicit confirmation that the public URI itself is being superseded;
- an explicit cache policy appropriate to permanent migration;
- validation that the replacement does not merely represent a mutable destination or distinct successor Referent.

Because permanent redirects may persist in independent client/intermediary caches, ADDRESSING SHALL NOT assume a mistaken permanent redirect can be completely recalled after publication.

---

# 90. Successor Entity ≠ URI Replacement

Where Referent A is succeeded by Referent B, Address(A) SHOULD ordinarily preserve A and expose an explicit successor relation where lawful.

It SHALL NOT automatically permanently redirect in a manner implying B was always A.

---

# 91. HTTP Ambiguity & Discovery Representation

ZRR owns the determination that a Resource Resolution result is ambiguous.

ADDRESSING owns the generic public HTTP constraints used to represent that ambiguity.

The applicable Address Family/external standard may define stronger or more specific behavior.

## 91.1 No Forced Winner

Where multiple materially valid resources remain and no governing rule selects one, the HTTP layer SHALL NOT invent an arbitrary redirect target.

## 91.2 `300 Multiple Choices`

`300 Multiple Choices` SHOULD be used where HTTP's multiple-choice semantics accurately describe the result:

- the target resource has multiple more-specific alternatives/representations;
- the alternatives can be disclosed;
- the response supplies sufficient metadata/identifiers for user or agent selection.

For non-`HEAD` requests, a `300` response SHOULD include a usable representation of the alternatives.

## 91.3 Discovery Resource

Where the requested resource is itself a discovery/linkset/resource-list representation, a successful `200 OK` response MAY carry that discovery representation.

The media type and serialization SHALL follow the applicable standard/profile.

## 91.4 Address-Family Overrides

An external Address Family/standard MAY require specific ambiguity/not-found behavior.

For example, a family may specify:

- `300` when equally valid matches remain;
- `404` when an explicitly requested relation type is unavailable;
- a standardized linkset representation.

Such family-standard rules take precedence within that family.

## 91.5 Human Fallback

Where a browser-facing caller cannot consume the preferred machine-readable discovery format, the public interface SHOULD provide a safe human-readable fallback where disclosure is permitted.

## 91.6 Content Negotiation

If `Accept`, `Accept-Language` or another request header affects the ambiguity/discovery representation or selection, the response SHALL apply standards-correct cache separation such as `Vary`.

Ambiguity is a governed outcome.

It SHALL NOT be silently converted into a guessed redirect, unrelated homepage or arbitrary default.

---

# 92. Cache Correctness & Ownership

Cache responsibility is divided as follows:

```text
ADDRESSING
owns public HTTP/cache-safety invariants

ZRR / applicable family profile
owns cacheability intent and semantic invalidation triggers
for the governed disposition/state

EDGE / public serving implementation
enforces the resulting cache contract
```

If request attributes influence a public representation or ZRR-selected disposition, caching SHALL preserve those distinctions.

Where HTTP negotiation depends on headers such as:

```text
Accept
Accept-Language
```

or another request header, the response SHALL emit the applicable `Vary` metadata or equivalent standards-correct cache separation unless the response is deliberately non-cacheable.

Every production serving profile that emits cacheable mutable public dispositions SHALL define:

- a cacheability class;
- an explicit TTL or revalidation policy;
- semantic invalidation triggers;
- the behavior when invalidation/freshness cannot be established.

ADDRESSING does not impose one universal numeric TTL across all families/resources.

Mutable-destination redirects SHALL use an explicit bounded cache policy appropriate to the applicable Resolution profile.

Permanent `301`/`308` migrations SHALL use an explicit cache policy and the elevated change control required by §89.

Cache optimization SHALL NOT erase selection semantics or convert a mutable routing decision into an effectively irreversible public migration.

---

# 93. Query Parameters

Generic Unfict infrastructure SHALL NOT strip or reinterpret family-governed query semantics.

Tracking parameters SHALL NOT become persistent identity by default.

Family-specific standards retain authority over their query model.

---

# 94. URI Fragments

Server-side P1 resolution SHALL NOT depend on URI fragment content unless a deliberately client-side protocol profile owns such behavior.

---

# 95. Well-Known Namespace

`/.well-known/` is standards-governed.

Unfict SHALL NOT casually invent new well-known suffixes.

External standards-required resources, such as the GS1 Resolver description, SHALL be implemented accurately.

---

# PART IX — ORIGIN, TENANT & DOMAIN SECURITY

# 96. Origin Isolation

Each public origin SHALL be treated as an independent security boundary.

The rule:

```text
under `*.unfict.com`
```

does not mean:

```text
trusted for everything.
```

---

# 97. Public Resolver Security Posture

The default P1 resolver posture SHOULD be:

```text
PUBLIC
CREDENTIALLESS
STATELESS WHERE PRACTICAL
MINIMAL
```

It SHOULD NOT require console administrator sessions merely to resolve a public reference.

---

# 98. Cookie Isolation

Authenticated Unfict applications SHOULD use host-scoped cookies.

Broad parent-domain administrative cookies such as:

```text
Domain=unfict.com
```

SHOULD NOT be the normal design.

Customer resolver domains SHALL NOT receive Unfict console cookies.

---

# 99. CORS

CORS policy SHALL be resource-specific.

Credentialed access SHALL NOT be authorized using suffix logic equivalent to:

```text
*.unfict.com
```

Public credentialless resolver resources MAY deliberately allow broad read access where appropriate.

---

# 100. OAuth Redirect Isolation

Customer or sibling Unfict domains do not automatically become authorized OAuth/OIDC redirect destinations.

OAuth/OIDC redirect URIs SHALL be explicitly registered and validated according to the applicable Security/profile requirements.

A wildcard namespace binding such as:

```text
*.brand.example
```

SHALL NOT authorize wildcard OAuth/OIDC callbacks.

Resolver-host authority and authentication-callback authority are separate grants.

---

# 101. CSP

Content Security Policy SHOULD avoid unnecessary wildcard trust of all Unfict subdomains.

Required origins should be explicitly or narrowly admitted.

---

# 102. Request Authority Validation

A multi-tenant serving layer SHALL validate request Host/`:authority` against an active Namespace Binding **before** tenant/default application selection.

Unknown, inactive or mismatched authority SHALL NOT fall through to:

- a default tenant;
- the corporate site;
- another customer;
- a wildcard fallback application.

It SHALL fail closed.

Depending on the applicable public/security profile, `421 Misdirected Request` MAY be used where it accurately expresses the condition; a non-revealing `404 Not Found` MAY be preferable where disclosure minimization is required.

The exact public status code does not change the fail-closed invariant.

---

# 103. Forwarded-Authority Trust

`Forwarded`, `X-Forwarded-Host` or equivalent metadata SHALL only influence namespace selection when supplied through explicitly trusted ingress infrastructure.

Attacker-controlled forwarding headers SHALL NOT select tenants.

---

# 104. HSTS

HSTS is appropriate for HTTPS-only services.

But `includeSubDomains` and preload choices create broad scope.

Unfict SHALL NOT impose customer-parent-domain HSTS policy merely because it serves one customer hostname.

First-party broad HSTS requires explicit CNA/security review.

---

# 105. Open Redirect Prohibition

No Unfict public origin SHALL provide unrestricted:

```text
/redirect?url=<arbitrary-url>
```

behavior as a generic open redirect.

Only registered/admitted targets or governed handlers may be dispatched.

---

# 106. Subdomain-Takeover & Dangling-Binding Discipline

A public hostname SHALL NOT remain intentionally dependent on reclaimable third-party infrastructure after decommissioning.

Service retirement SHALL coordinate:

- DNS;
- provider custom-host bindings;
- active Namespace Bindings;
- certificate lifecycle;
- tenant lifecycle.

A dangling CNAME/shared-edge route SHALL NOT be treated as evidence authorizing a new claimant.

Unfict SHALL maintain automated or periodic detection sufficient to identify material P4 drift, including:

- P4 hostnames still pointing at Unfict after detachment;
- provider bindings without active Namespace Bindings;
- active Namespace Bindings whose customer DNS no longer points as expected;
- obsolete certificate/service bindings;
- other takeover-prone drift.

The implementation MAY choose continuous, scheduled or provider-event-driven detection according to scale/risk.

Detection does not replace fresh claim verification under §58.

Failure to run the required detection is a security-control failure, not permission to treat stale reachability as valid authority.

---

# 107. Abuse and Malicious Targets

A persistent reference does not oblige Unfict to continue sending users to a malicious or unlawful destination.

According to proper Security/Policy ownership, current Resolution state may be:

- suspended;
- quarantined;
- replaced with a safety response;
- investigated.

The public reference itself remains non-reassignable.

---

# PART X — LIFECYCLE, RETIREMENT & ERASURE

# 108. Persistence ≠ Eternal Availability

A P1 address does not guarantee that every resource remains available forever.

It guarantees that the issued reference does not silently acquire unrelated meaning.

---

# 109. Lifecycle Families

Architecture SHALL distinguish at least materially equivalent states:

```text
ACTIVE
SUSPENDED
RETIRED
ERASURE-CONSTRAINED
```

Exact implementation state names remain downstream work.

---

# 110. Suspension

Suspension temporarily restricts ordinary Resolution.

It SHALL NOT:

- release the address;
- rewrite history;
- imply permanent retirement;
- transfer the reference.

---

# 111. Retirement

Retirement means the address remains historically issued while ordinary active service for its original purpose has permanently ended.

A retired P1 address remains unavailable for unrelated reuse.

---

# 112. Tombstone Is a Representation

A tombstone is one possible representation of retirement.

Retirement may be represented through:

- public tombstone;
- machine-readable retired state;
- minimal generic response;
- privacy-preserving non-disclosing response;
- successor information where lawful.

Therefore:

> **Tombstone ≠ lifecycle truth.**

---

# 113. HTTP 410 Is Not Constitutional State

`410 Gone` may represent permanent unavailability where appropriate.

It is not mandatory for every retired reference.

Privacy/security policy may require a less revealing response.

---

# 114. Unknown vs Retired

Internally, a never-issued reference and an issued-but-retired reference SHOULD remain distinguishable where lawful.

Public disclosure of that distinction is separately governed.

---

# 115. Retirement ≠ Deletion

Retiring an address does not automatically delete all related data.

Deleting data does not make the address reusable.

These operations have different owners.

---

# 116. Privacy / Legal Ownership Boundary

ADDRESSING SHALL NOT decide:

- right to erasure;
- statutory retention;
- lawful-basis questions;
- Evidence/Receipt retention;
- disclosure entitlement;
- whether a public tombstone is lawful.

It SHALL execute legitimate outcomes from the appropriate owners.

---

# 117. Persistence Is Not a Blanket Retention Basis

The fact that a reference is persistent SHALL NOT be used to claim universal entitlement to retain all personal or customer data connected to it.

Persistence is an addressing property.

It is not a universal legal basis.

---

# 118. Erasure-Constrained Reference

Where lawful governance requires underlying payload minimization or deletion:

```text
issued reference
        +
payload removed/minimized
        +
address remains non-reassignable where lawful
```

may persist.

The public response may disclose little or nothing about former meaning.

---

# 119. Anti-Reuse Reservation

Unfict SHOULD maintain the minimum lawful state required to prevent a previously issued P1 reference from being intentionally minted again.

The **class and construction** of that reservation SHALL be approved by the applicable Privacy/Legal owner where erasure or personal-data obligations apply.

ADDRESSING SHALL NOT mandate a particular:

- hash;
- salt;
- cryptographic commitment;
- tokenization scheme;
- retained mapping;

because an opaque or hashed value may still constitute regulated/personal data depending on context and applicable law.

The Anti-Reuse Reservation SHALL NOT become a disguised archive of data that governing Privacy/Legal owners required to be erased.

If the reference token itself is determined to be personal/regulated data, it SHALL be handled under that owner's requirements.

ADDRESSING owns the non-reassignment objective.

Privacy/Legal owns what minimum retained mechanism, if any, is lawful for achieving it.

---

# 120. Physical Carrier Persistence

A printed QR or physical carrier may survive after underlying data is removed.

Resolver behavior SHALL assume old carriers can still be scanned.

Safe post-erasure Resolution SHALL NOT require reconstructing deleted payload.

---

# 121. Historical Attribution ≠ Universal Public Visibility

Historical truth may remain reconstructable while public/user visibility narrows according to applicable governance.

Address persistence SHALL NOT convert historical integrity into unrestricted public access.

---

# 122. Successor Relationship

Where Referent A is succeeded by Referent B:

```text
A ──successor relationship──► B
```

The system SHALL preserve A's historical identity/reference rather than silently rewriting Address(A) to mean B.

---

# 123. Ownership Transfer

Where the same Referent changes owner, its persistent address SHOULD ordinarily remain stable.

Ownership transfer does not by itself mean the Referent became another Referent.

Ownership transfer also does not automatically transfer unrelated constitutional Authority.

---

# PART XI — OPERATOR SUCCESSION & INSTITUTIONAL CONTINUITY

# 124. Resolution Operator Transfer

Resolver/control-plane operation MAY transfer between providers/operators without changing the P1 public address, provided namespace control and serving authority are legitimately transferred.

---

# 125. Operator Transfer ≠ Constitutional Delegation

The successor operator receives only explicitly transferred technical stewardship.

It does not become owner of:

- represented Reality;
- customer assets;
- Trust;
- Policy;
- Evidence;
- domain meaning;
- RI authority.

---

# 126. Authoritative Cutover

Operator succession SHALL establish a clear mutation-authority cutover.

Conceptually:

```text
Generation N
last authorized by Operator A

Generation N+1
first authorized by Operator B
```

There SHALL NOT be an ungoverned dual-writer period.

Temporary dual-serving for migration is distinct from dual write authority.

---

# 127. Stale Operator Revocation

After cutover, the old operator SHALL lose future mutation authority.

Historical actions remain attributable to their original operator/controller.

---

# 128. Critical Namespace Assets

When `id.unfict.com` becomes active P1 infrastructure:

```text
unfict.com
```

becomes a `CNA-ROOT`.

The selected compact root:

```text
unfi.cc
```

becomes an independent CNA root only when permanent compact-reference issuance is separately authorized.

Legacy roots:

```text
zyppi.me
zpi.to
```

remain strategically important defensive assets where controlled, but their legacy retention does not make them active Unfict P1/compact issuance roots.

Each active CNA root requires its own custody, registrar, DNS, continuity and recovery controls.

---

# 129. CNA Organizational Custody

A CNA SHALL be held through controlled organizational custody.

Persistence SHALL NOT depend on informal possession by one person.

---

# 130. CNA Registry Lock

For `.ME`, Registry Lock SHALL be active before irreversible P1 issuance unless the Council explicitly accepts a documented blocker.

Ordinary registrar lock alone is not the intended maximum protection where stronger registry-level protection is available.

---

# 131. CNA Authentication & Recovery

Critical registrar/domain administration SHALL use the strongest practical phishing-resistant authentication supported.

At least one recovery channel SHALL be independent of the protected root itself.

---

# 132. CNA Renewal & Change Control

A CNA SHALL have:

- auto-renewal;
- independent expiry monitoring;
- current payment arrangements;
- named renewal responsibility;
- elevated change control for registrant/registrar/nameserver/lock/transfer operations.

---

# 133. CNA Certificate & DNS Controls

P0/P1 infrastructure SHOULD maintain:

- controlled certificate issuance;
- expiry monitoring;
- CAA where appropriate;
- Certificate Transparency monitoring where useful;
- explicit DNSSEC decision and operational recovery plan.

CAA policy, where used, SHALL be compatible with the P1 Living Will and successor/operator-transition requirements.

A CA restriction that cannot be changed safely during legitimate succession SHALL NOT become an unexamined continuity dependency.

DNSSEC SHALL not be enabled performatively without safe rollover/recovery capability.

---

# 134. Institutional Persistence Covenant

While active P1 references exist, their CNA root SHALL NOT knowingly be:

- abandoned;
- allowed to expire through neglect;
- sold without continuity obligations;
- transferred to a successor rejecting persistence.

---

# 135. P1 Namespace Living Will

Before irreversible P1 issuance, Unfict SHALL establish a **P1 Namespace Living Will** covering at minimum:

```text
CNA inventory
domain custody transfer
DNS continuity
certificate reissuance
Public Namespace Registry transfer
Address Family Registry transfer
ZRR-owned Resolution serving-state transfer/export
anti-reuse reservation transfer subject to Privacy/Legal constraints
retired-reference state
active-reference state
restoration runbooks
minimum protocol/software documentation
successor criteria
wind-down trigger authority
continuity funding approach
provider-independent MCS bootstrap strategy
integrity verification for continuity exports/snapshots
security handoff
organizational custody / escrow approach for critical recovery material
customer notification
privacy/legal transition responsibilities
```

The Living Will SHALL identify custody processes without publishing passwords, private keys, recovery codes or equivalent secrets.

---

# 136. Successor Criteria

A planned P1 successor SHALL be capable of honoring:

- reference non-reassignment;
- namespace continuity;
- namespace security;
- privacy constraints;
- historical integrity;
- semantic non-sovereignty;
- applicable standards obligations.

Willingness to acquire the domain alone is insufficient.

---

# 137. Stewardship ≠ Reality Ownership

Institutional succession transfers namespace stewardship and authorized Resolution operation.

It does not transfer ownership of all Reality referenced beneath the namespace.

---

# 138. Minimum Continuity Service

If full Unfict service cannot continue, the architecture SHOULD permit a reduced MCS preserving, where lawful and available:

- basic address admission/Resource Resolution;
- safe previously published public dispositions;
- machine-readable public relationships where exported by ZRR;
- retired-reference responses;
- successor information;
- standards-native public Resolution;
- customer transition information.

To avoid dependence on one transactional database or infrastructure provider, MCS SHOULD be bootstrappable from an **integrity-verifiable, provider-independent continuity export or snapshot** of the minimum public serving state.

ADDRESSING does not mandate that this artifact be a specific static-file format, signature technology, database dump or cloud product.

Before irreversible P1 activation, a concrete MCS export/import/verification profile SHALL be specified and rehearsable.

That profile is an implementation/readiness artifact owned jointly by the applicable ADDRESSING continuity implementation, ZRR serving-state implementation and Security owner.

It SHALL preserve the constitutional continuity requirements without becoming a new semantic authority.

---

# 139. MCS Non-Goals

MCS SHALL NOT fabricate continuity for unavailable:

- Trust systems;
- live Policy;
- entitlements;
- private customer services;
- AI services;
- dashboards;
- billing;
- RI execution.

Core reference continuity and value-added product continuity are different.

---

# 140. Persistence Distress Gate

If Unfict can no longer reasonably assure stewardship of newly issued P1 references:

```text
NORMAL
   ↓
STEWARDSHIP DISTRESS
   ↓
FREEZE NEW P1 ISSUANCE
   ↓
CONTINUITY / SUCCESSION
```

Existing references take priority over new permanent issuance.

---

# 141. Key-Person Independence

Critical continuity SHALL NOT depend on undocumented knowledge held by one founder, employee, contractor or administrator.

Domain, DNS, state restoration and succession processes must be institutionally recoverable.

---

# 142. Continuity Rehearsal

The P1 Living Will SHOULD be periodically tested.

A rehearsal should establish whether replacement infrastructure can restore:

```text
namespace control
+
Resolution state
+
public P1 serving
```

without guessing.

---

# 143. Disaster Recovery Is Not Time Travel

Restoring an old backup SHALL NOT undo later valid:

- retirement;
- revocation;
- transfer;
- deletion;
- security holds;
- ownership changes.

Recovery must reconcile later authoritative lifecycle state.

---

# PART XII — FEDERATION & DELEGATION READINESS

# 144. Federation Is Permitted, Not Yet Implemented

V1 need not implement federation.

The architecture SHALL avoid assumptions that make future controlled federation impossible.

---

# 145. Federation Possibilities

Future architecture may permit:

```text
customer namespace
    ├── customer-operated resolver
    ├── Unfict-operated resolver
    └── delegated standards resolver
```

or multiple authorized providers handling different registered resource classes.

---

# 146. Federation Does Not Create Trust

More resolvers and more delegation do not automatically create more Trust.

Federation is a resolution topology.

Trust remains separately governed.

---

# 147. Delegation Authentication

Future delegated Resolution SHALL require explicit authenticated authority and revocation mechanics.

DNS possession alone SHALL NOT be presumed sufficient for every constitutional or semantic delegation.

---

# 148. Stale Delegation

The architecture SHALL eventually support detection/rejection of stale or revoked delegated authority.

Exact cryptographic/attestation mechanics remain future ZRR/DELEGATION/security work.

---

# PART XIII — FAILURE, OBSERVABILITY & SCALE

# 149. Canonical State vs Serving Representation

Architecture SHOULD preserve:

```text
authoritative Resolution state
        ↓
compiled / replicated read model
        ↓
distributed public Resolution plane
```

The public URI SHALL not reveal which database/cache/provider serves the read model.

---

# 150. Control Plane vs Resolution Plane

Administrative/configuration failure SHALL NOT automatically make all previously published P1 references unavailable.

The public Resolution plane should remain narrowly scoped and independently operable where feasible.

---

# 151. Analytics Off the Hot Path

Telemetry SHOULD be emitted asynchronously or through failure-isolated mechanisms.

Analytics outage SHALL NOT block ordinary public Resolution.

---

# 152. Billing Off the Hot Path

For already-valid published references, ordinary Resolution SHALL NOT synchronously depend on billing-service availability.

Legitimate suspension may be reflected through pre-published governed state.

---

# 153. Failure Taxonomy

Implementation SHOULD preserve materially distinct failure causes such as:

```text
UNKNOWN_ADDRESS
INVALID_ADDRESS
UNSUPPORTED_FAMILY
RELATION_NOT_AVAILABLE
AMBIGUOUS_RESOURCE
RESOLUTION_STATE_UNAVAILABLE
SEMANTIC_OWNER_UNAVAILABLE
POLICY_DENIED
RETIRED_REFERENCE
MISDIRECTED_NAMESPACE
```

Exact names/mappings remain implementation work.

---

# 154. Billion-Reference Test

Architecture SHALL be reviewed under assumptions including:

```text
billions of persistent references
millions of customer namespaces
many standards
many countries
many carriers
many Unfict capabilities
multiple infrastructure providers
```

Scale SHALL NOT justify semantic shortcuts that violate ownership boundaries.

---

# 155. No Namespace Explosion Under Scale

Growth in Unfict Applications SHALL primarily occur through:

- Domain Profiles;
- capabilities;
- relations;
- projections;
- data/resource relationships;

not uncontrolled DNS or family proliferation.

---

# PART XIV — DRIFT CONTROL, ACTIVATION & IMPLEMENTATION

# 156. Public Namespace Drift Control

No mandate, Application, Profile, engineer, AI Agent, documentation author or deployment configuration SHALL independently declare a new canonical Unfict public origin.

Canonical origins come from the Public Namespace Registry.

---

# 157. Repository Reconciliation

After ratification, Unfict SHALL conduct a repository-wide namespace audit for at least:

```text
http://
https://
unfict.com
unfict.dev
unfict.org
unfi.cc
localhost
provider deployment domains
API origins
documentation origins
redirect targets
```

Occurrences should be classified:

```text
CANONICAL
VALID STANDARDS EXAMPLE
VALID CUSTOMER EXAMPLE
LEGACY
NON-NORMATIVE
EPHEMERAL
INVALID / MIGRATION REQUIRED
```

---

# 158. DNS / External Binding Inventory

Source code is not authoritative proof of DNS state.

A separate readiness phase SHALL inventory actual:

- registrars;
- roots;
- nameservers;
- A/AAAA/CNAME;
- MX/TXT/CAA;
- DS/DNSSEC;
- certificate dependencies;
- verification records;
- provider bindings;
- abandoned records.

---

# 159. P1 Activation Gate

No irreversible first-party P1 reference SHALL be issued until evidence confirms at minimum:

```text
[ ] ADDRESSING-001 ratified
[ ] ZRR resource-resolution governance ratified
[ ] ADDRESSING↔ZRR handoff ownership accepted
[ ] ZRR-PRIC versioned technical contract specified
    for the production implementation
[ ] Public Namespace Registry established
[ ] Address Family Registry established
[ ] unfict.com organizational custody verified
[ ] registrar approved for critical-domain use
[ ] strongest practical phishing-resistant MFA active
[ ] .COM registrar/registry protection profile active or formally accepted by Council
[ ] registrar/EPP transfer protections active
[ ] independent recovery channel established
[ ] auto-renew active
[ ] independent expiry monitoring active
[ ] DNS/nameserver inventory recorded
[ ] certificate controls reviewed
[ ] DNSSEC decision recorded
[ ] emergency restoration runbook recorded
[ ] authorized domain custodians identified
[ ] P1 Namespace Living Will established
[ ] successor criteria established
[ ] continuity rehearsal plan established
[ ] provider-independent MCS export/import/verification
    profile specified
[ ] MCS rehearsal procedure established
[ ] id.unfict.com origin-security review complete
[ ] permanent-URI migration/change-control policy established
[ ] production cache profiles define TTL/revalidation
    and invalidation semantics
[ ] GS1 Resolver Description File resolverRoot verified as applicable
[ ] GS1 implementation conformance independently verified before GS1 issuance
```

Passing this architectural gate does not itself create production issuance authority.

---

# 160. Compact-Root Activation Gate

Before permanent `unfi.cc` compact references may be issued:

```text
[ ] dedicated compact-reference profile ratified
[ ] unfi.cc organizational custody verified
[ ] registrar/security profile independently verified
[ ] transfer / recovery controls active
[ ] DNS/certificate controls reviewed
[ ] token grammar and allocation/collision rules ratified
[ ] long-form ↔ compact representation relationship defined
[ ] ZRR integration proves no independent short-link semantics
[ ] non-reassignment / retirement behavior verified
[ ] abuse / phishing controls reviewed
[ ] MCS / continuity export includes compact bindings
[ ] physical-carrier rules verified before carrier issuance
```

No assumption about `.CC` registry/registrar controls may be inferred from `.ME`, `.TO`, `.COM` or another TLD.

The legacy `zpi.to` reservation receives no new issuance authority through this gate.

---

# 161. Implementation Boundary

Ratification would authorize downstream design/implementation mandates.

It would not itself mutate:

- DNS;
- registrar state;
- certificates;
- code;
- QR payloads;
- deployed links;
- public API origins;
- documentation links;
- production P1 issuance.

Those require explicit implementation authority.

---

# 162. Agent Constraint

An implementation Agent SHALL NOT invent:

- missing host semantics;
- address-family labels;
- legacy ZPI grammar;
- compact-token semantics;
- legal-retention rules;
- semantic-owner behavior;
- permanent redirect policy;
- successor relationships;
- new canonical origins.

Where governance is absent, the Agent must return the ambiguity.

---

# PART XV — DECISION SUMMARY & RATIFICATION STATE

# 163. Canonical Decision Matrix

| Concern                                            | Unfict Succession Decision                                                                                 |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Canonical institutional root                       | `unfict.com`                                                                                               |
| Legacy institutional root                          | `zyppi.me` — retained / defensive / redirect / historical                                                  |
| `www`                                              | `www.unfict.com` redirect-only compatibility alias                                                         |
| Long-form first-party P1 origin                    | `id.unfict.com` — **SELECTED / NOT ACTIVATED**                                                             |
| Legacy pre-activation P1 selection                 | `id.zyppi.me` — **SUPERSEDED BEFORE ISSUANCE**                                                             |
| Meaning of `id` hostname label                     | Persistent addressing / Resource Resolution origin; **not ZRM Identity owner**                             |
| Public Address and Identifier relationship         | A Public Address **MAY instantiate a Representation/Identifier**; roles remain non-interchangeable         |
| ZRM Semantic Resolution                            | **ZRM + applicable Evidence owner**                                                                        |
| ZRR Resource Resolution                            | **ZRR-owned**                                                                                              |
| ZRR Resolution success proves ZRM Identity         | **REJECTED**                                                                                               |
| P1 grammar strategy                                | Explicit Address Family on multi-family origin                                                             |
| First family                                       | `gs1`                                                                                                      |
| First-party GS1 root                               | `id.unfict.com/gs1/...`                                                                                    |
| GS1 Resolver `resolverRoot`                        | `https://id.unfict.com/gs1`                                                                                |
| `/zpi/`                                            | **LEGACY RESERVED / NOT ACTIVE / NO FORWARD COMMITMENT**                                                   |
| `unfi.cc`                                          | **SELECTED STRATEGIC COMPACT ROOT / NOT ACTIVATED**                                                        |
| `zpi.to`                                           | **LEGACY RESERVED / DEFENSIVE / NO NEW ISSUANCE**                                                          |
| Compact token grammar                              | **NOT YET RATIFIED**                                                                                       |
| Long-form ↔ compact representation relationship    | Same governed persistent-reference architecture; exact cardinality/terminology deferred to compact profile |
| API origin                                         | `api.unfict.com`                                                                                           |
| Documentation origin                               | `docs.unfict.com`                                                                                          |
| Control plane                                      | `console.unfict.com` selected candidate                                                                    |
| Status                                             | `status.unfict.com`                                                                                        |
| Domain-specific hostname explosion                 | Rejected                                                                                                   |
| Customer custom domains                            | Foundational P4 namespaces                                                                                 |
| Customer URI portability                           | Required where customer owns namespace                                                                     |
| Public address binding key                         | Namespace Binding + family-normalized reference                                                            |
| Public Resolution Handoff                          | ADDRESSING boundary before ZRR mechanics                                                                   |
| Resolution State / records / discovery / selection | **ZRR-owned**                                                                                              |
| Global naked token key                             | Rejected                                                                                                   |
| Generic shortener on compact root                  | Rejected                                                                                                   |
| Redirect-only Resolution ontology                  | Rejected                                                                                                   |
| Sacred redirect fast path                          | Required public operational invariant                                                                      |
| Hidden AI selector                                 | Rejected                                                                                                   |
| Single Capability Semantic Owner                   | Required                                                                                                   |
| External URL = internal Capability                 | Rejected                                                                                                   |
| Generic server-side external fetch                 | Rejected                                                                                                   |
| Mutable GET/HEAD destination may use 302           | Allowed only where profile deliberately permits                                                            |
| Method-preserving temporary redirect               | `307` required where preservation is needed                                                                |
| Mutable destination as permanent redirect          | Rejected                                                                                                   |
| Permanent P1 URI replacement                       | Elevated change control + explicit cache policy                                                            |
| Persistent address reassignment                    | Prohibited                                                                                                 |
| Persistent compact token reassignment              | Prohibited                                                                                                 |
| Tombstone                                          | Optional representation, not lifecycle state                                                               |
| Persistence as universal retention basis           | Rejected                                                                                                   |
| Anti-Reuse Reservation                             | Minimum lawful mechanism; Privacy/Legal approves construction                                              |
| Successor referent rewrites predecessor            | Rejected                                                                                                   |
| Operator transfer without address change           | Allowed                                                                                                    |
| Dual authoritative writers during transfer         | Rejected                                                                                                   |
| P1 Living Will                                     | Required before activation                                                                                 |
| Minimum Continuity Service                         | Required architectural direction                                                                           |
| New P1 issuance during stewardship distress        | Prohibited                                                                                                 |
| Successor inherits semantic sovereignty            | Rejected                                                                                                   |

---

# 164. Canonical Namespace Topology

```text
unfict.com
├── www.unfict.com        → public website compatibility alias
├── id.unfict.com         → selected long-form first-party P1 origin
│   └── /gs1/...          → first ratified external Address Family path
├── api.unfict.com        → API
├── docs.unfict.com       → documentation
├── console.unfict.com    → selected control-plane candidate
├── status.unfict.com     → status
└── sandbox.api.unfict.com→ reserved non-production API origin

unfi.cc
└── /<compact-reference>  → selected strategic compact root
                             token grammar NOT YET RATIFIED

legacy namespace estate
├── zyppi.me              → retain / redirects / historical / defensive
└── zpi.to                → retain / defensive / no new issuance
```

No legacy root becomes an active Unfict issuance root merely because it is retained.

---

# 165. Full Public Handoff & Resolution Architecture

```text
REALITY / REPRESENTATION
      │
      │ factual referent question, where needed
      ▼
ZRM SEMANTIC RESOLUTION + EVIDENCE
      │
      │ establishes/assesses referential meaning
      │
      └───────────────────────────────────────────────┐
                                                      │
PUBLIC REQUEST                                        │
      │                                               │
      ▼                                               │
REQUEST AUTHORITY / ORIGIN                            │
      │                                               │
      ▼                                               │
ACTIVE VERIFIED NAMESPACE BINDING                     │
      │                                               │
      ▼                                               │
SINGLE-FAMILY OR MULTI-FAMILY ADMISSION               │
      │                                               │
      ▼                                               │
FAMILY-NATIVE INTERPRETATION / NORMALIZATION          │
(by proper family owner)                              │
      │                                               │
      ▼                                               │
════════ ADDRESSING PUBLIC RESOLUTION HANDOFF ════════│
      │                                               │
      ▼                                               │
ZRR RESOURCE RESOLUTION                               │
Resolution State                                      │
resource relationships                                │
discovery                                              │
selection                                              │
broker / dispatch                                      │
published serving state                                │
      │                                               │
      ├──────────── public disposition ─────────────┐  │
      │                                             │  │
      ▼                                             ▼  ▼
HTTP / linkset / external resolver /          registered semantic
direct representation / other                 owner / Capability
public protocol output                             │
      │                                             ▼
      │                                    Z-PROF / POL / SEC /
      │                                      Evidence / Domain
      │                                             │
      └─────────────────────────────────────────────┤
                                                    ▼
                                           RI when execution
                                              is required
```

The ZRM semantic-resolution path is a distinct factual/epistemic concern.

The ADDRESSING→ZRR path is public resource Resolution.

Neither path may silently steal the other's ownership.

---

# 166. Lifecycle Architecture

```text
PERSISTENT PUBLIC REFERENCE
       │
       ▼
     ISSUED
       │
 ┌─────┼─────────────┐
 ▼     ▼             ▼
ACTIVE SUSPENDED   RETIRED
 │       │             │
 │       │             ▼
 │       │      DISCLOSURE POLICY
 │       │      ┌──────┼─────────┐
 │       │      ▼      ▼         ▼
 │       │   public  minimal  non-disclosing
 │       │
 │       └── may return to ACTIVE
 │           only for same binding
 │
 ▼
ZRR-owned published serving /
Resolution state as applicable

ERASURE MAY REMOVE / MINIMIZE PAYLOAD
       │
       ▼
PRIVACY/LEGAL-APPROVED MINIMUM
ANTI-REUSE MECHANISM WHERE LAWFUL
       │
       ▼
REFERENCE NEVER INTENTIONALLY RECYCLED
```

Public lifecycle governance remains ADDRESSING-owned even where ZRR represents the applicable serving state.

---

# 167. Institutional Continuity Architecture

```text
NORMAL P1 OPERATION
       │
       ▼
CNA + LIVING WILL + PUBLISHED STATE
       │
       ├── ordinary provider/operator migration
       │        ↓
       │   explicit cutover
       │        ↓
       │   same public references
       │
       └── stewardship distress
                ↓
         freeze new P1 issuance
                ↓
        continuity/succession process
                ↓
      ┌─────────┴─────────┐
      ▼                   ▼
successor available     no successor yet
      │                   │
      ▼                   ▼
transfer stewardship   Minimum Continuity Service
      │                   │
      └─────────┬─────────┘
                ▼
      existing references protected
```

---

# 168. PH1–PH4 + Council + ZRM Traceability

## PH1 — Irreversible Namespace Falsification

Closed:

```text
id.unfict.com selection
host-label non-sovereignty
explicit /gs1/ family
unfi.cc freeze
CNA requirement
```

## PH2 — Multi-Namespace, Custom-Domain & Origin Isolation

Closed:

```text
NamespaceBinding
namespace-scoped public address key
single-family vs multi-family origin
family admission gate
custom-domain sovereignty
domain-claim lifecycle
origin isolation
```

## PH3 — Resolution Semantics & Semantic-Owner Boundary

Durable conclusions retained:

```text
Resolution stopping rule
single Capability semantic owner
sacred fast path
typed-Resolution compatibility
machine-discovery interoperability
temporary vs permanent redirect distinction
external target vs internal Capability
```

PH3's stronger legacy ZPI public-binding conclusions were reopened by Council review and are not frozen in v0.3.2.

## PH4 — Retirement, Erasure, Succession & Continuity

Closed:

```text
retirement vs deletion
tombstone representation
privacy boundary
anti-reuse objective
successor relation
operator transfer
Living Will
Minimum Continuity Service
distress gate
```

## CQ-02 — Independent Council Review

Corrective blockers incorporated:

```text
ADDRESSING ↔ ZRR overlap
custom-domain residual/shared-edge reclaim risk
premature legacy ZPI binding selection
```

## v0.3.2 — ZRM Alignment

Corrected:

```text
Public Address may instantiate a Representation/Identifier
without collapsing its architectural role into ZRM Identity

ZRM Semantic Resolution
≠
ZRR Resource Resolution

successful ZRR Resolution
does not prove factual ZRM Identity
```

These corrections align ADDRESSING with the re-derived:

```text
CUSTOM-DOMAIN-ARCHITECTURE-001 v0.3
DOMAIN-BINDING-001 v0.2
EDGE-RESOLUTION-GATEWAY-001 v0.2
```

---

# 169. Remaining Open Questions

v0.3.3 deliberately does not define:

- Unfict compact-reference token grammar;
- future Unfict canonical-address identifier syntax;
- whether the legacy `/zpi/` label is ever reused;
- the detailed compact-reference role of `unfi.cc`;
- long-form/compact representation relationships;
- compact-token derivation/allocation;
- ZRR concrete storage schema for Resolution State;
- federation cryptographic proof;
- delegation protocol;
- exact implementation-language representation of `ZRR-PRIC`;
- exact HTTP/API error payload schema;
- exact storage enum names;
- Privacy/Legal-approved Anti-Reuse mechanism;
- privacy-law outcomes for specific jurisdictions;
- continuity funding instrument;
- MCS concrete export/signature technology;
- implementation provider;
- DNS provider;
- registrar;
- universal numeric cache TTLs;
- deployment topology.

These remain downstream or separately owned questions.

Their deferral does not leave ownership undefined:

- ZRR owns the versioned `ZRR-PRIC` technical contract;
- ZRM owns semantic referent resolution;
- Address Families own family semantics;
- implementation/readiness governance owns concrete MCS and deployment mechanisms.

---

# 170. Blocker-Closure Gate

Before joint ratification, the blocker-closure audit SHALL verify:

```text
B-01
ADDRESSING semantic handoff envelope defined
+
ZRR-PRIC technical-contract ownership assigned

B-02
RETIRED_HELD exit/reclaim conditions defined
without allowing residual reachability to authorize a claimant

B-03
generic HTTP ambiguity/discovery behavior defined
without overriding family/standard-specific semantics

B-04
Public Address-as-Representation referent boundary defined
without making ZRR Resolution factual Identity proof
```

It SHALL also verify the accepted hardening items:

- ZRR family-owned default semantics;
- projection provenance;
- publication-lineage / rollback invariants;
- cache ownership split;
- mandatory dangling-binding detection;
- successor-compatible CAA treatment;
- MCS implementation gate;
- version/cross-reference alignment across the five-document set.

The closure audit is narrow.

It SHALL NOT reopen settled PH1–PH4 architecture unless a correction introduces a new contradiction.

---

# 171. Ratification Gate

`ADDRESSING-001 v0.3.3` is **RATIFIED — ACTIVE** following successful blocker closure and Chair ecosystem review.

The intended sequence is:

```text
five-document corrective revision
        ↓
blocker-closure audit
        ↓
all accepted blockers closed?
   ┌────┴────┐
  NO        YES
   │          │
   ▼          ▼
correct     joint ratification
again       decision for the
            five-document set
                ↓
separate implementation/readiness mandate
```

Ratification does not activate P1.

P1 issuance remains subject to §159 and separate operational authorization.

---

# 172. External Technical Reference Baseline

The current Internet Binding Profile is informed by:

- IETF URI generic syntax and HTTP semantics;
- IETF Web Linking and Linkset standards;
- IETF well-known URI and CAA mechanisms;
- applicable DNS, DNSSEC, TLS and ACME standards;
- **GS1 Digital Link URI Syntax 1.7.0**;
- **GS1-Conformant Resolver 1.2.1**;
- W3C URI persistence guidance;
- ICANN registrar/domain security guidance;
- applicable registry/registrar lock and recovery controls;
- Public Suffix List operational conventions;
- mature persistent-identifier systems such as DOI/Handle/DataCite;
- institutional continuity/living-will precedents.

The GS1 versions above were retained during the Council corrective synthesis; the proposed regression to older version numbers was not accepted.

External standards govern their own semantics.

A later standards revision may require updating the replaceable Internet Binding Profile without rewriting the durable constitutional laws above.

Every implementation/readiness mandate SHALL verify current applicable versions again rather than assuming this version list remains current indefinitely.

---

# 173. Final Principle

The construct reduces to six linked rules:

> **Stable address.**

> **Explicit namespace and grammar.**

> **Clean Public Resolution Handoff.**

> **ZRM referent truth and ZRR resource Resolution remain distinct.**

> **Meaning stays with its owner.**

> **Issued references are protected through retirement and succession, not recycled.**

Or as one sentence:

> **An Unfict public reference SHALL remain stable for as long as its persistence class requires; ADDRESSING shall govern its namespace, family admission, Internet binding and lifecycle; a public address may itself be a Representation/Identifier without becoming Reality or factual Identity proof; admitted requests cross an explicit handoff into ZRR-owned Resource Resolution; ZRM semantic resolution and all other semantic authorities remain with their proper owners; lifecycle changes shall not rewrite past meaning; and institutional succession shall preserve stewardship without transferring sovereignty over represented Reality.**

---

# 174. Document State

**Version:** `0.4.0`  
**Status:** **DRAFT — UNFICT SUCCESSION REVISION / RATIFICATION CANDIDATE**  
**Succession Basis:** `ZUSD-001 v1.0 — RATIFIED`  
**Supersedes if ratified:** `ADDRESSING-001 v0.3.3 — RATIFIED`  
**Implementation Authority:** **NONE**  
**Repository Mutation Authority:** **NONE**  
**P1 Production Issuance:** **NOT AUTHORIZED**  
**Compact Production Issuance:** **NOT AUTHORIZED**  
**Next Gate:** **Joint Unfict Succession Ratification Decision**

---

## End of ADDRESSING-001 v0.4.0

---

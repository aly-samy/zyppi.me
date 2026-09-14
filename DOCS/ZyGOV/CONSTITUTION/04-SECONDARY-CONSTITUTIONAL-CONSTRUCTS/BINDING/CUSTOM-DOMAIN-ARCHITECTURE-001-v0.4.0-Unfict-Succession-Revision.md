# CUSTOM-DOMAIN-ARCHITECTURE-001
## Unfict Customer-Controlled Namespace Architecture

**Document ID:** `CUSTOM-DOMAIN-ARCHITECTURE-001`  
**Version:** `0.4.0`
**Status:** **DRAFT — UNFICT SUCCESSION REVISION / RATIFICATION CANDIDATE**
**Classification:** Derived cross-constitutional architecture profile  
**Date:** 14 September 2026
**Succession Authority:** `ZYPPI-UNFICT-SUCCESSION-DECLARATION-001 / ZUSD-001 v1.0 — RATIFIED`
**Platform Lineage:** `Zyppi → Unfict`
**Ratification Effect:** NONE until separately ratified
**Implementation Authority:** **NONE**  
**Repository Mutation Authority:** **NONE**

**Governed By:** `ADDRESSING-001 v0.4.0` · `ZRR-NS-001 v0.3.0`  
**Coordinates With:** ZRM · ZRR · `DOMAIN-BINDING-001` · `EDGE-RESOLUTION-GATEWAY-001` · Z-PROF · OWNERSHIP-001 · DELEGATION-001 · POL · SEC · Evidence · RI · applicable external Address Family owners  
**Supersedes:** `CUSTOM-DOMAIN-ARCHITECTURE-001 v0.4.0 — RATIFIED`

---

# 0. Executive Law

A customer custom domain is a **customer-controlled public namespace**.

It is not merely a Unfict interface.

It MAY expose a Unfict-operated interface while an `ACTIVE` Unfict `NamespaceBinding` exists.

The namespace does not become Unfict-owned because Unfict currently operates public Resolution beneath it.

The governing architecture is:

```text
CUSTOMER-CONTROLLED P4 NAMESPACE
        │
        ▼
DNS / TLS / NETWORK REACHABILITY
        │
        ▼
EDGE INGRESS
        │
        ▼
ACTIVE DOMAIN BINDING / NamespaceBinding
        │
        ▼
ADDRESSING
namespace admission
family admission
        │
        ▼
ADDRESS FAMILY OWNER
family-native parsing / normalization
        │
        ▼
PUBLIC RESOLUTION HANDOFF
        │
        ▼
ZRR
Resolution State
resource relationships
discovery
selection
dispatch
serving projection
        │
        ├────────────► public resource disposition
        │
        └────────────► proper semantic Capability
                           │
                           ├── Domain / Z-PROF
                           ├── POL
                           ├── SEC / Trust
                           ├── Evidence
                           └── other lawful owner
                                  │
                                  ▼
                               RI only
                         when execution is required
        │
        ▼
EDGE RESPONSE ADAPTATION
        │
        ▼
CLIENT
```

---

# 0A. Unfict Succession Rule

The master-brand succession does not require customer P4 namespaces to change.

A customer-controlled URI such as:

```text
https://id.brand.example/...
```

remains customer-controlled and may continue through Unfict infrastructure without exposing an Unfict-branded hostname.

The migration from Zyppi to Unfict therefore changes the operator/master brand, not customer namespace ownership.

Legacy Zyppi provider hostnames SHALL NOT be required in the public customer URI.

---

# 1. Purpose

This document defines how Unfict may operate beneath customer-controlled custom domains while preserving:

- customer namespace sovereignty;
- hidden/white-label Unfict infrastructure;
- low-latency public Resolution;
- ADDRESSING ownership of namespace admission and public Internet constraints;
- family-owner authority over grammar/normalization;
- ZRR ownership of generic resource Resolution;
- ZRM separation of Reality, Identity relationship and Representation/Identifier;
- semantic-owner separation for Domain, Trust, Policy, Evidence and execution.

---

# 2. Customer Domain Is a Namespace, Not Merely an Interface

The governing doctrine is:

> **A customer custom domain is a customer-controlled public namespace that MAY expose a Unfict interface while an ACTIVE Unfict Namespace Binding exists.**

Therefore:

```text
id.brand.example
```

is not merely decorative branding over a Unfict hostname.

It is a genuine public namespace under customer control.

This matters because the customer may later change operators:

```text
BEFORE
id.brand.example
      ↓
Unfict

AFTER
id.brand.example
      ↓
replacement resolver
```

The namespace may survive Unfict.

---

# 3. Mandatory Unfict Ingress — Correct Scope

While an applicable P4 namespace has an `ACTIVE` Unfict-operated NamespaceBinding, Unfict-served requests for that binding SHALL enter through an authorized Unfict ingress boundary before Unfict produces a governed public disposition.

This requirement is scoped to:

```text
ACTIVE Unfict-operated binding
```

It SHALL NOT be interpreted as a permanent claim that the customer namespace must always use Unfict.

After valid customer exit or operator transfer, the customer MAY repoint the namespace without changing the public URI.

---

# 4. Correct Meaning of "Who Determines What"

The architecture SHALL NOT use the over-broad statement:

```text
"Unfict determines what the request means."
```

The responsibilities are instead:

```text
DNS
determines network reachability

DOMAIN BINDING / ADDRESSING
determines whether the namespace is admitted
and whether Unfict is authorized to serve it

ADDRESS FAMILY OWNER
owns family grammar and normalization

ZRR
owns Resolution State, resource relationships,
discovery, selection, dispatch and serving state

Z-PROF / DOMAIN / GS1 / PROPER SEMANTIC OWNER
owns domain or standards meaning

POL
owns Policy determinations

SEC / proper Trust authority
owns Security / Trust determinations

EVIDENCE
owns Evidence meaning and sufficiency where applicable

RI
owns execution when execution is actually required
```

Physical co-location at the edge SHALL NOT transfer any of these ownership boundaries.

---

# 5. Relationship to ZRM

ZRM treats Identity as a relationship between Reality and Representation rather than an intrinsic object.

A Reality constituent may participate in multiple Representation-linked Identity relationships.

An Identifier is a form of Representation.

A URI may therefore itself be an Identifier/Representation.

Accordingly, this architecture SHALL preserve the following role separation:

```text
Reality
Identity relationship
Representation / Identifier
Public Address role
Namespace
Address Family
Resolution State
Destination
Capability
Execution
```

A Public Address MAY instantiate a Representation/Identifier.

Where that Public Address is asserted to represent an underlying Reality constituent, the factual referential relationship SHALL come from the proper ZRM semantic-resolution / Evidence authority or another constitutionally valid authoritative mapping.

Neither domain verification, ADDRESSING issuance nor successful ZRR Resource Resolution creates that factual Identity relationship by itself.

A Public Address is also not required to represent Reality directly; it may address a resolver/resource/interaction surface under the governing architecture.

---

# 6. Multiple Public Representations

Multiple public addresses MAY legitimately participate in representing the same Reality constituent.

For example:

```text
https://id.unfict.com/gs1/...
https://id.brand.example/01/...
another authorized Representation
```

may all be related to the same Reality constituent through lawful ZRM Identity relationships.

This does not imply that the public addresses are the same address.

Public addresses remain namespace-scoped.

---

# 7. Namespace-Scoped Public Addressing

The architecture SHALL reject a globally naked-token assumption.

For example:

```text
https://id.unfict.com/gs1/01/09506000134352
```

and:

```text
https://id.brand.example/01/09506000134352
```

are distinct public addresses because they exist in different namespaces, even if their family-normalized content or downstream Resolution relationships converge.

The correct public handoff key remains conceptually:

```text
NamespaceBinding
+
FamilyNormalizedReference
```

not:

```text
globally naked token
```

---

# 8. ZRM Semantic Resolution vs ZRR Resource Resolution

Two different resolution problems SHALL remain explicit.

## 8.1 ZRM Semantic Resolution

Question:

> **Which Reality constituent does this Representation actually refer to?**

Conceptually:

```text
Representation / referential claim
        ↓
factual referent question
        ↓
ZRM + Evidence governance
```

## 8.2 ZRR Resource Resolution

Question:

> **Given an admitted public reference, what registered Resolution State/resources/handlers apply?**

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

The governing law is:

> **Successful Public Address / ZRR Resolution SHALL NOT by itself establish the factual ZRM Identity relationship between a Representation and a Reality constituent.**

This distinction SHALL remain visible in architecture, code terminology and documentation.

---

# 9. DNS Is Reachability Infrastructure

A representative customer configuration MAY be:

```text
id.brand.example CNAME <authorized Unfict edge target>
```

The infrastructure target is not part of public semantic identity.

The HTTP request remains logically:

```http
GET /01/09506000134352
Host: id.brand.example
```

DNS determines how traffic reaches the serving infrastructure.

DNS does not decide:

- NamespaceBinding authority;
- family meaning;
- ZRM Identity;
- ZRR resource selection;
- Policy;
- Trust;
- Evidence;
- execution.

---

# 10. Domain Binding Layer

`DOMAIN-BINDING-001` manages the implementation-facing lifecycle of the ADDRESSING-owned P4 `NamespaceBinding`.

It governs concerns such as:

- fresh current-control proof;
- controller association;
- exclusive active binding;
- TLS/provider preparation;
- suspension;
- safe detachment;
- `RETIRED_HELD`;
- release;
- reclaim protection.

It SHALL NOT independently resolve referents or ZRR resources.

---

# 11. Edge Gateway Layer

`EDGE-RESOLUTION-GATEWAY-001` is the public ingress and response-adaptation layer.

Its responsibilities are intentionally narrow:

```text
network ingress
Host/:authority validation
active Domain Binding lookup/consumption
request technical normalization
ADDRESSING namespace/family admission support
family-owner normalization invocation
Public Resolution Handoff transport
ZRR serving interface consumption
public response adaptation
failure-isolated telemetry
```

The Edge Gateway SHALL NOT become a second ZRR.

---

# 12. ADDRESSING Public Resolution Handoff / ZRR-PRIC

After namespace/family admission and family-native normalization, ADDRESSING supplies the Public Resolution Handoff semantic envelope.

Conceptually:

```text
NamespaceBinding reference
+
Address Family identity/version provenance
+
FamilyNormalizedReference
+
admitted request/protocol metadata
+
admission provenance
```

ZRR owns the versioned technical contract that realizes this envelope:

```text
ZRR Public Resolution Input Contract
ZRR-PRIC
```

This document SHALL consume that contract.

It SHALL NOT invent a competing custom-domain-specific handoff schema.

Custom-domain serving MAY use an optimized/compiled representation of `ZRR-PRIC` only where semantic equivalence and provenance are preserved.

---

# 13. ZRR Ownership After Handoff

After the Public Resolution Handoff, ZRR owns generic mechanics including:

```text
Resolution State
resource relationships
resource discovery
selection/default/matching
Resolution Broker / Dispatcher
dispatch
published serving/read-model mechanics
```

The custom-domain architecture SHALL consume these mechanics.

It SHALL NOT duplicate them.

---

# 14. Proper Semantic Owner Boundary

ZRR may discover or dispatch toward a semantic Capability.

That Capability owns only its own domain/business semantics.

It SHALL NOT become a god-capability that absorbs:

```text
Trust
Policy
Evidence
Authorization
Execution
```

Instead:

```text
CANONICAL DOMAIN CAPABILITY
owns its domain/business semantics
        │
        ├── consumes POL determination
        ├── consumes SEC / Trust determination
        ├── consumes Evidence determination
        └── invokes RI where execution is required
```

This preserves Single Capability Semantic Owner without transferring ownership among constitutional authorities.

---

# 15. Sacred Fast Path

Ordinary public distribution SHOULD remain:

```text
fast
predictable
dependency-minimal
highly available
cacheable where appropriate
independent of optional analytics
independent of optional AI
independent of dashboards
independent of billing UI
independent of administrative-control-plane availability
```

The preferred physical architecture is therefore:

```text
authoritative ADDRESSING namespace state
        │
        └──► edge namespace admission projection

authoritative ZRR Resolution State
        │
        └──► ZRR serving projection / read model

nearest edge
        │
        ├── consumes ADDRESSING projection
        ├── consumes ZRR serving projection
        └── returns governed public disposition
```

The edge is where execution may occur.

It is not where ownership moves.

---

# 16. Edge Serving Projection

The term:

```text
Edge Resolution State
```

SHALL NOT be used for the edge cache/materialization.

`Resolution State` is ZRR-owned.

The preferred neutral term is:

```text
Edge Serving Projection
```

An Edge Serving Projection MAY contain compiled or replicated material derived from multiple governed owners, such as:

```text
ADDRESSING-produced namespace-admission projection
ZRR-produced Resolution serving projection
POL-produced policy projection
SEC / Authority-owner governed projection
other explicitly governed deterministic material
```

Every projection SHALL retain provenance to its owner.

No projection becomes a new:

```text
Resolution source of truth
Policy source of truth
Authority source of truth
Trust source of truth
Evidence source of truth
```

merely because it is deployed at the edge.

---

# 17. Policy and Authority Projections

Policy and Authority projections MAY exist for deterministic low-latency execution where the governing owner permits them.

They SHALL be understood as:

```text
owner-produced
owner-governed
versioned
consumed by an authorized capability
```

not as edge-owned semantics.

If a required determination cannot be safely produced from the authorized projection, the edge SHALL not reconstruct or guess the owner's answer.

---

# 18. Public Disposition

ZRR may produce public dispositions such as:

- temporary redirect;
- linkset;
- direct representation;
- machine-readable discovery;
- registered handler/capability discovery;
- typed ambiguity;
- protocol-appropriate failure.

The architecture SHALL NOT reduce Resolution to:

```text
slug → URL
```

Where a disposition is cacheable, ZRR/family profile supplies cacheability intent and invalidation semantics; ADDRESSING supplies public HTTP/cache-safety constraints; Edge serving enforces the combined contract.

---

# 19. Ambiguity

Ambiguity SHALL NOT be hard-coded by the Edge Gateway as:

```text
ambiguous → deny
```

ZRR returns a typed ambiguity/discovery disposition.

ADDRESSING maps that disposition onto generic public HTTP behavior.

The applicable Address Family/external standard may define stronger protocol rules.

Depending on governance, ambiguity MAY legitimately produce:

- `300 Multiple Choices` where HTTP semantics fit;
- structured discovery/linkset;
- human choice;
- family-defined outcome;
- denial where required.

The Edge Gateway adapts the governed result.

It does not independently decide ambiguity semantics or select an arbitrary winner.

---

# 20. Redirect Semantics

When the governed ZRR public disposition is a mutable-destination HTTP redirect:

- `302 Found` MAY be used only for an actual `GET`/`HEAD` request where the applicable serving/family profile explicitly authorizes it;
- `307 Temporary Redirect` SHALL be used where method/body preservation is required;
- `301`/`308` SHALL be reserved for genuine permanent public-URI replacement under elevated ADDRESSING change control.

The edge serializes the disposition.

It SHALL NOT invent the destination.

---

# 21. Cache Correctness

Caching SHALL preserve every request distinction that materially affects the governed result.

Cache behavior SHALL obey ADDRESSING requirements for:

- `Vary` or equivalent separation where required;
- bounded caching for mutable dispositions;
- elevated change control for permanent redirects;
- no conversion of temporary routing into effectively permanent migration.

Exact ZRR serving-model/cache mechanics remain ZRR/implementation work.

---

# 22. Customer Exit and Portability

The architecture SHALL pass this test:

```text
today:
id.brand.example → Unfict

future:
id.brand.example → replacement resolver
```

without forcing the customer to change the public URI merely because the infrastructure operator changes.

This is a core reason the customer domain must be treated as a namespace, not merely a Unfict interface.

---

# 23. Provider Independence

The public URI SHALL not semantically depend on a specific:

- edge provider;
- DNS provider;
- cloud provider;
- database;
- cache;
- worker platform;
- certificate provider.

Provider migration SHALL not require public-address replacement merely because implementation infrastructure changes.

---

# 24. Security Boundary

The public serving architecture SHALL preserve at least:

- Host/`:authority` validation before tenant/default selection;
- fail-closed handling of unknown or inactive bindings;
- trusted-ingress requirements for forwarded authority headers;
- open-redirect prohibition;
- no automatic OAuth/CORS/admin authority from wildcard P4 bindings;
- cookie isolation;
- domain takeover protection;
- stale provider/certificate cleanup;
- customer tenant isolation.

---

# 25. No Generic Server-Side Fetch

Ordinary Resolution SHALL NOT require Unfict to fetch arbitrary customer/external destinations.

External retrieval is a separate capability with separate SSRF, Security and Evidence ownership.

---

# 26. Telemetry

Technical telemetry MAY be collected for reliability, performance, abuse detection and lawful analytics.

But:

```text
HTTP request log
≠ ZRM Identity proof

successful redirect
≠ Evidence that Reality changed

route analytics
≠ Trust
```

Any later admission of telemetry into constitutional Evidence requires the proper Evidence authority.

---

# 27. End-to-End Example

```text
1. Customer controls:
   id.brand.example

2. Domain Binding reaches ACTIVE
   through the ADDRESSING-governed lifecycle.

3. Customer DNS routes traffic
   to authorized Unfict edge infrastructure.

4. Consumer requests:
   https://id.brand.example/01/09506000134352

5. Edge validates Host/:authority.

6. ADDRESSING admits the active P4 NamespaceBinding.

7. The configured Address Family is selected.

8. The proper family owner normalizes:
   /01/09506000134352

9. ADDRESSING produces the Public Resolution Handoff.

10. ZRR locates the applicable Resolution State.

11. ZRR discovers/selects the registered public resource
    or semantic Capability/handler.

12. If semantic judgment is needed,
    the proper owner provides it.

13. RI is invoked only if actual execution is required.

14. ZRR produces the public disposition.

15. Edge adapts/serializes that disposition
    under ADDRESSING Internet constraints.

16. The user sees only the customer namespace
    and resulting destination/representation.
```

---

# 28. Invariants

1. A customer custom domain is a P4 public namespace, not merely a cosmetic interface.
2. Mandatory Unfict ingress applies only while an applicable Unfict-operated binding is `ACTIVE`.
3. Customer exit SHALL not require changing the customer-controlled public URI.
4. A Public Address MAY instantiate a Representation/Identifier without becoming Reality or intrinsic Identity.
5. Successful ZRR Resolution SHALL NOT prove the ZRM Identity relationship.
6. ADDRESSING owns namespace admission and the Public Resolution Handoff.
7. Family owners own family grammar and normalization.
8. ZRR owns Resolution State, resource relationships, discovery, selection, dispatch and serving state.
9. Domain capabilities own only their domain/business semantics.
10. POL, SEC/Trust, Evidence and RI retain their own constitutional ownership.
11. `Edge Resolution State` SHALL be replaced by owner-preserving `Edge Serving Projection`.
12. Edge projections SHALL retain provenance and SHALL NOT become new semantic sources of truth.
13. Ambiguity disposition comes from ZRR/proper family semantics, not an edge hard-code.
14. Performance optimization SHALL NOT collapse ownership boundaries.
15. Hidden customer-brand operation SHALL NOT mean hidden semantic inference.

---

# 29. Document State

**Version:** `0.4.0`  
**Status:** **DRAFT — UNFICT SUCCESSION REVISION / RATIFICATION CANDIDATE**  
**Succession Basis:** `ZUSD-001 v1.0 — RATIFIED`  
**Supersedes if ratified:** `CUSTOM-DOMAIN-ARCHITECTURE-001 v0.3.1 — RATIFIED`  
**Implementation Authority:** NONE  
**Repository Mutation Authority:** NONE.

This document is aligned to:

```text
ADDRESSING-001 v0.4.0
ZRR-NS-001 v0.3.0
DOMAIN-BINDING-001 v0.3.0
EDGE-RESOLUTION-GATEWAY-001 v0.3.0
```

Its next gate is the joint Unfict succession ratification decision.

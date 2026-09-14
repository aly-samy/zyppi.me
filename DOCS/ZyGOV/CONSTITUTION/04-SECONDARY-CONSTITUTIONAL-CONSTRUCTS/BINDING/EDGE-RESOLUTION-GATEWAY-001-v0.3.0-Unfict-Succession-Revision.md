# EDGE-RESOLUTION-GATEWAY-001
## Unfict Edge Resolution Gateway — Ingress & Response Adaptation Profile

**Document ID:** `EDGE-RESOLUTION-GATEWAY-001`  
**Version:** `0.3.0`
**Status:** **DRAFT — UNFICT SUCCESSION REVISION / RATIFICATION CANDIDATE**
**Classification:** Authorized public ingress and response-adaptation layer  
**Date:** 14 September 2026
**Succession Authority:** `ZYPPI-UNFICT-SUCCESSION-DECLARATION-001 / ZUSD-001 v1.0 — RATIFIED`
**Platform Lineage:** `Zyppi → Unfict`
**Ratification Effect:** NONE until separately ratified
**Implementation Authority:** **NONE**  
**Repository Mutation Authority:** **NONE**

**Governed By:** `ADDRESSING-001 v0.4.0`  
**Consumes:** `DOMAIN-BINDING-001 v0.3.0` · ADDRESSING Public Resolution Handoff · `ZRR-PRIC` · ZRR serving interface/read model  
**Coordinates With:** ZRM · Z-PROF · applicable Address Family owner · POL · SEC · Evidence · RI  
**Supersedes:** `EDGE-RESOLUTION-GATEWAY-001 v0.3.0 — RATIFIED`

---

# 0. Re-Derivation Rule

The Edge Resolution Gateway is **not** a parallel resolver and **not** a generic execution orchestrator.

Its constitutional role is narrowed to:

```text
INGRESS
+
TECHNICAL REQUEST NORMALIZATION
+
ADDRESSING ADMISSION SUPPORT
+
PUBLIC RESOLUTION HANDOFF TRANSPORT
+
ZRR SERVING INTERFACE CONSUMPTION
+
PUBLIC RESPONSE ADAPTATION
```

The word `Resolution` in the document title describes where the gateway sits in the public serving path.

It SHALL NOT be interpreted as ownership of ZRR Resolution semantics.

---

# 0A. Unfict Succession Rule

The Gateway remains an ingress and response-adaptation layer across the Zyppi → Unfict succession.

Brand migration SHALL NOT alter:

- ZRR selection semantics;
- Domain Binding authority;
- public-address lifecycle;
- Trust/Policy/Evidence ownership;
- RI execution boundaries.

Provider/edge migration may change internal service hostnames.

Public persistent/customer URIs SHALL remain governed by ADDRESSING rather than by infrastructure branding.

---

# 1. Purpose

The Gateway enables:

- direct customer-domain Resolution;
- hidden/white-label Unfict infrastructure;
- low-latency edge serving;
- Host/authority validation;
- deterministic public ingress;
- clean ADDRESSING → ZRR handoff;
- owner-preserving projection consumption;
- protocol-correct response serialization.

It SHALL NOT:

- decide what Reality a Representation refers to;
- define ZRR Resolution State;
- independently select resources;
- invent business meaning;
- absorb Trust/Policy/Evidence ownership;
- construct RI execution requests merely because an HTTP request arrived.

---

# 2. Correct Constitutional Pipeline

The correct public path is:

```text
CUSTOM-DOMAIN HTTP REQUEST
        │
        ▼
EDGE INGRESS
validate Host / :authority
        │
        ▼
ACTIVE DOMAIN BINDING
        │
        ▼
ADDRESSING
namespace admission
family admission
        │
        ▼
ADDRESS FAMILY OWNER
family-native normalization
        │
        ▼
PUBLIC RESOLUTION HANDOFF
NamespaceBinding
+
FamilyNormalizedReference
+
admitted request metadata
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
        ├──────────► PUBLIC DISPOSITION
        │             redirect / linkset /
        │             representation /
        │             typed ambiguity /
        │             protocol error
        │
        └──────────► PROPER SEMANTIC CAPABILITY
                          │
                          ├── Domain / Z-PROF
                          ├── POL
                          ├── SEC / Trust
                          ├── Evidence
                          └── other proper owner
                                  │
                                  ▼
                               RI only
                         if execution is required
        │
        ▼
EDGE RESPONSE ADAPTATION
        │
        ▼
CLIENT
```

The Gateway SHALL NOT normally leap directly from:

```text
HTTP request
```

to:

```text
canonical execution request
```

because public Resolution and execution are distinct constitutional stages.

---

# 3. Gateway Responsibilities

The Gateway MAY:

- accept incoming network requests;
- terminate or consume trusted TLS termination;
- derive trusted request authority from the actual ingress context;
- validate `Host`/`:authority`;
- consume the active Domain Binding / NamespaceBinding projection;
- perform technical URL normalization;
- invoke the proper family parser/normalizer;
- construct or transport the ADDRESSING Public Resolution Handoff;
- call/consume the ZRR serving interface;
- adapt the ZRR public disposition into HTTP or other supported protocol output;
- emit failure-isolated technical telemetry.

---

# 4. Gateway Non-Responsibilities

The Gateway SHALL NOT independently own or define:

```text
Reality
ZRM Identity relationship
family grammar
domain meaning
Trust
Policy
Evidence meaning
authorization
Resolution State
resource relationships
default-resource semantics
matching
selection
Resolution Broker rules
dispatch graph
Capability semantics
RI execution semantics
```

If the next answer requires one of these owners, the Gateway SHALL consume that owner's governed result rather than reconstruct it locally.

---

# 5. Host / :authority Validation

Before any tenant/default application selection, the Gateway SHALL validate the request authority against an `ACTIVE` NamespaceBinding.

Unknown, inactive, suspended, detaching, held or mismatched authority SHALL fail closed.

The Gateway SHALL NOT fall through to:

- the corporate site;
- another tenant;
- a default tenant;
- the previous tenant;
- a wildcard tenant application.

---

# 6. Trusted Forwarding Boundary

`Forwarded`, `X-Forwarded-Host` or equivalent metadata SHALL only influence namespace selection when supplied through explicitly trusted ingress infrastructure.

Attacker-controlled forwarding headers SHALL NOT select a tenant or namespace.

---

# 7. Domain Binding Consumption

The Gateway consumes Domain Binding state.

It does not determine controller legitimacy itself.

For ordinary serving, the Gateway SHALL require a valid active binding materially equivalent to:

```text
lifecycleState == ACTIVE
```

A request reaching shared edge infrastructure without such a binding SHALL not become a candidate for opportunistic tenant selection.

---

# 8. ADDRESSING Admission Stage

After authority validation, the Gateway participates in implementation of the ADDRESSING sequence:

```text
active NamespaceBinding
        ↓
single-family / multi-family admission
        ↓
applicable Address Family selection
        ↓
proper family-native parsing / normalization
        ↓
Public Resolution Handoff
```

Raw `(hostname, path)` SHALL NOT be treated as universal semantic identity.

---

# 9. Address Family Ownership

The Gateway MAY call a family parser or Z-PROF/standard adapter where required.

The family owner remains responsible for:

- grammar;
- normalization;
- family-native qualifier meaning;
- standards-specific interpretation.

The Gateway SHALL NOT silently reinterpret family-controlled query parameters or identifier structure.

---

# 10. Public Resolution Handoff / ZRR-PRIC

The Gateway transports the ADDRESSING Public Resolution Handoff semantic envelope through the ZRR-owned versioned technical contract:

```text
ZRR Public Resolution Input Contract
ZRR-PRIC
```

At minimum, the consumed contract represents:

```text
contractVersion
namespaceBindingRef
addressFamilyRef / family-version provenance
familyNormalizedReference
admittedRequestContext
admissionProvenance
```

Only request metadata legitimately admitted by the applicable family/profile SHALL cross as semantic input.

The Gateway SHALL reject or fail safely when the required contract/profile version is unsupported or incompatible.

It SHALL NOT guess compatibility or invent additional semantic fields.

An optimized edge representation MAY be used only where it is demonstrably semantically equivalent to the governing `ZRR-PRIC` version.

---

# 11. ZRR Ownership

After the handoff, ZRR owns generic resource Resolution mechanics:

- Resolution State;
- resource relationships;
- discovery;
- selection;
- defaults/matching;
- Resolution Broker / Dispatcher;
- dispatch;
- published serving/read-model mechanics.

The Gateway SHALL consume ZRR outputs.

It SHALL NOT recreate these semantics in edge-specific conditionals.

---

# 12. No Local Routing Reinvention

The following anti-pattern is prohibited:

```text
if host == "brand-a":
    redirect A
elif path looks like "product":
    redirect B
elif query has "support":
    redirect C
```

when those branches independently reimplement ZRR resource selection.

Fast serving MAY be compiled.

Semantics SHALL remain ZRR-governed.

---

# 13. Edge Serving Projection

The term:

```text
Edge Resolution State
```

is retired.

The preferred term is:

```text
Edge Serving Projection
```

This projection MAY contain owner-produced compiled material needed for deterministic serving.

Examples:

```text
ADDRESSING namespace-admission projection
ZRR Resolution serving projection
POL-produced deterministic policy projection
SEC / Authority-owner governed projection
other explicitly governed serving material
```

Every projection SHALL retain verifiable provenance appropriate to its trust boundary.

At minimum, owner-produced projection metadata SHALL be capable of identifying:

```text
semantic owner
contract/profile version
authoritative source-state revision
publication lineage / publication identifier
generation/version
applicable family/profile provenance
integrity binding appropriate to the trust boundary
```

The exact cryptographic/storage mechanism is implementation/Security work.

The Gateway SHALL NOT accept provenance-free material where the affected path depends on provenance for safety.

---

# 14. Projection Non-Sovereignty

An Edge Serving Projection SHALL NOT become a new source of truth for:

- Resolution;
- Policy;
- Trust;
- Authority;
- Evidence;
- Identity.

The projection MAY simplify representation, indexing, locality or serialization.

It SHALL NOT simplify away constitutional meaning.

---

# 15. Policy and Authority Projections

Policy/Authority projections MAY be consumed at the edge where their owners authorize deterministic projection.

Such data SHALL remain:

```text
owner-produced
owner-governed
versioned
revocable
traceable to governing state
```

The Gateway SHALL NOT infer a missing Policy/Authority answer from stale or incomplete edge data merely to keep traffic flowing.

---

# 16. Sacred Fast Path

Ordinary public serving SHOULD minimize synchronous dependencies.

Preferred path:

```text
DNS / TLS
   ↓
nearest edge
   ↓
ADDRESSING admission projection
   +
ZRR serving projection
   ↓
public disposition
```

Optional systems SHOULD stay off the ordinary hot path:

- analytics;
- generative AI;
- billing UI;
- dashboards;
- admin control plane;
- unrelated origin services.

---

# 17. Control Plane vs Serving Plane

The Gateway SHALL be able to continue serving previously published valid state where architecturally permitted even if the administrative control plane is temporarily unavailable.

This does not authorize the Gateway to invent new Resolution state or policy.

---

# 18. ZRM Semantic Resolution Boundary

The Gateway SHALL preserve the distinction between:

```text
ZRM semantic resolution:
Which Reality constituent does this Representation actually refer to?

ZRR resource resolution:
Which registered resources/handlers apply to this admitted public reference?
```

Successful Gateway/ZRR serving SHALL NOT, by itself, prove the factual ZRM Identity relationship.

---

# 19. Semantic Capability Dispatch

ZRR MAY dispatch toward a semantic Capability.

That Capability owns only its legitimate domain/business semantics.

It MAY consume determinations from:

- POL;
- SEC / Trust owner;
- Evidence;
- Z-PROF / Domain owner;
- other authorized owners.

The Gateway SHALL NOT merge those determinations into one edge-owned semantic function.

---

# 20. RI Boundary

RI SHALL be invoked only where actual execution is required.

The Gateway SHALL NOT construct or invoke RI execution merely because a public request exists.

Examples of public dispositions that may require no RI execution include:

- redirect;
- linkset;
- direct representation;
- discovery response;
- typed ambiguity;
- standards-native resolution output.

---

# 21. Public Disposition Adaptation

The Gateway adapts the disposition returned through the governed ZRR path.

Potential outcomes include:

```text
redirect
linkset
direct representation
machine-readable resource set
typed ambiguity
human-choice response
family-defined result
protocol-appropriate error
registered handler/capability interaction
```

For ambiguity/discovery dispositions, the Gateway SHALL apply ADDRESSING's generic HTTP mapping and any stronger Address Family/external-standard rule.

The Gateway SHALL NOT hard-code Resource Resolution ontology to one URL redirect.

It SHALL NOT re-run ZRR selection in order to simplify the response.

---

# 22. Ambiguity Handling

The correct rule is:

> **The Gateway SHALL adapt the ambiguity/discovery disposition produced by ZRR and/or the proper family owner under ADDRESSING's public-protocol constraints.**

Depending on governance, ambiguity MAY produce:

- `300 Multiple Choices` where HTTP semantics fit;
- structured discovery/linkset;
- `200 OK` for a requested discovery representation;
- human-readable choice;
- family-defined status/representation;
- denial where required.

If the governing family specifies its own status-code/linkset behavior, the Gateway SHALL follow that profile.

Where a browser cannot consume the preferred machine representation, a safe human-readable fallback SHOULD be provided where disclosure is permitted.

The Gateway SHALL NOT independently decide which resource wins.

It SHALL NOT convert ambiguity into an arbitrary redirect.

---

# 23. Redirect Semantics

When the governed disposition is an HTTP redirect:

- `302 Found` MAY be used only for an actual `GET`/`HEAD` request where the applicable serving/family profile explicitly authorizes it;
- `307 Temporary Redirect` SHALL be used where method/body preservation is required;
- `301`/`308` SHALL be reserved for genuine permanent public-URI replacement;
- permanent replacement SHALL follow ADDRESSING elevated change control and explicit cache policy.

The Gateway SHALL NOT invent a redirect target when ZRR fails or returns ambiguity.

---

# 24. Cache Correctness

The Gateway enforces the combined cache contract:

```text
ADDRESSING
→ public HTTP/cache-safety invariants

ZRR / family profile
→ cacheability intent
→ semantic invalidation triggers
→ profile-specific TTL/revalidation policy

Gateway
→ response serialization
→ cache-control enforcement
→ invalidation/obsolescence behavior
```

The Gateway SHALL preserve all request dimensions that materially affect the governed result.

Where required:

- emit `Vary` or equivalent standards-correct cache separation;
- apply the profile-defined bounded TTL/revalidation behavior for mutable dispositions;
- invalidate or supersede serving projections on material state change;
- never turn a mutable destination into an effectively irreversible migration by careless caching.

The Gateway SHALL NOT invent a TTL where the production profile requires an explicit one but none is available.

In that case it SHALL use the applicable safe non-cacheable/revalidation behavior or fail the profile readiness gate.

---

# 25. Open Redirect Protection

The Gateway SHALL NOT expose unrestricted behavior equivalent to:

```text
/redirect?url=<arbitrary-url>
```

Only registered/admitted targets or handlers returned through governed ZRR Resolution may become public dispositions.

An arbitrary external URL SHALL NOT be treated as a Unfict Capability.

---

# 26. No Generic External Fetch

The Gateway SHALL NOT fetch arbitrary external destinations merely to perform ordinary Resolution.

External retrieval/verification is a separate capability with its own SSRF, Security, Evidence and network-policy responsibilities.

---

# 27. Failure Behavior

The Gateway SHOULD preserve materially distinct internal failure causes such as:

```text
MISDIRECTED_NAMESPACE
UNKNOWN_ADDRESS
INVALID_ADDRESS
UNSUPPORTED_FAMILY
RELATION_NOT_AVAILABLE
AMBIGUOUS_RESOURCE
RESOLUTION_STATE_UNAVAILABLE
SEMANTIC_OWNER_UNAVAILABLE
POLICY_DENIED
RETIRED_REFERENCE
```

Exact names and HTTP mappings remain downstream work.

Failure SHALL NOT silently become:

- corporate homepage;
- guessed destination;
- unrelated fallback tenant.

---

# 28. Customer Namespace Sovereignty

The Gateway is an operator beneath a customer-controlled namespace.

It does not own the namespace.

When the applicable NamespaceBinding ceases to be `ACTIVE`, the Gateway SHALL cease to assume ordinary serving authority for that binding.

The customer MAY later repoint DNS to another resolver/operator.

---

# 29. Security and Origin Isolation

The Gateway SHALL preserve:

- independent origin boundaries;
- host-scoped cookies;
- no Unfict console cookies on customer resolver domains;
- resource-specific CORS;
- explicit OAuth/OIDC redirect registration;
- no wildcard custom-domain leakage into authentication authority;
- narrowly scoped CSP where applicable;
- no automatic customer-parent HSTS policy;
- tenant isolation.

---

# 30. Telemetry

Technical telemetry MAY include:

- request time;
- region;
- latency;
- cache state;
- response class;
- requested family/relation;
- domain;
- failure class.

But:

```text
request log
≠ constitutional Event by default

successful redirect
≠ Evidence of downstream Reality change

traffic pattern
≠ Trust
```

Telemetry admission into constitutional Evidence remains separately governed.

Analytics SHOULD remain failure-isolated from the sacred fast path.

---

# 31. Billing and Admin Isolation

For already-valid published public state, ordinary Resolution SHALL NOT synchronously depend on:

- billing service availability;
- admin dashboard availability;
- control-plane UI availability.

Legitimate suspension may be reflected through governed published state.

---

# 32. Publication Lineage, Generation & Freshness Safety

Edge Serving Projections SHALL carry sufficient publication metadata to detect:

- incompatible projections;
- stale replay;
- superseded state;
- explicit rollback publication;
- operator-cutover publication;
- incompatible owner/profile generations.

The Edge SHALL NOT infer compatibility by comparing unrelated numeric counters.

Where multiple owner projections must be composed, an explicit manifest/compatibility declaration or equivalent governed rule SHALL establish the compatible set.

The rollback invariant is:

> **Rollback is a new authoritative publication, not resurrection of an obsolete generation.**

A rollback MAY restore content equivalent to an older state only when that content is republished under a new current authoritative publication identity after reconciliation with current:

- retirement;
- revocation;
- security holds;
- erasure constraints;
- operator cutover;
- other dominating lifecycle state.

Unknown or incompatible lineage/generation relationships SHALL fail safely for the affected path.

Generation/publication metadata SHALL NOT become public-address meaning.

---

# 33. End-to-End Example

```text
1. Client requests:
   https://id.brand.example/01/09506000134352

2. Request reaches authorized edge infrastructure.

3. Gateway validates Host/:authority.

4. Gateway consumes ACTIVE Domain Binding/NamespaceBinding state.

5. ADDRESSING admits the namespace/family.

6. Proper family owner normalizes the reference.

7. Gateway carries the Public Resolution Handoff.

8. ZRR consumes the handed-off reference.

9. ZRR uses its Resolution State/resource relationships.

10. ZRR discovers/selects the applicable resource
    or proper semantic Capability.

11. Proper semantic owner is invoked if required.

12. RI executes only if an actual governed execution
    is required.

13. ZRR returns a public disposition.

14. Gateway adapts the disposition into the public response.

15. Client sees no mandatory intermediate Unfict-branded URL.
```

---

# 34. Invariants

1. The Gateway is ingress/normalization/response adaptation, not a second resolver.
2. Active NamespaceBinding validation SHALL precede ordinary serving.
3. ADDRESSING admission SHALL precede ZRR Resolution.
4. Family owners retain grammar/normalization semantics.
5. ZRR retains Resolution State/discovery/selection/dispatch ownership.
6. Proper semantic owners retain Domain/Policy/Trust/Evidence semantics.
7. RI is invoked only when actual execution is required.
8. `Edge Resolution State` SHALL NOT exist as an independent concept.
9. Edge Serving Projections SHALL retain owner provenance.
10. Successful ZRR Resolution SHALL NOT prove ZRM Identity.
11. Ambiguity semantics come from ZRR/proper family governance, not edge hard-coding.
12. Redirect targets SHALL come from governed ZRR dispositions.
13. Optional analytics/AI/admin/billing SHALL remain off the sacred fast path.
14. Customer namespace sovereignty SHALL survive operator change.
15. Performance optimization SHALL NOT create semantic duplication.

---

# 35. Document State

**Version:** `0.3.0`  
**Status:** **DRAFT — UNFICT SUCCESSION REVISION / RATIFICATION CANDIDATE**  
**Succession Basis:** `ZUSD-001 v1.0 — RATIFIED`  
**Supersedes if ratified:** `EDGE-RESOLUTION-GATEWAY-001 v0.2.1 — RATIFIED`  
**Implementation Authority:** NONE.  
**Repository Mutation Authority:** NONE.

This document is aligned to:

```text
ADDRESSING-001 v0.4.0
ZRR-NS-001 v0.3.0
CUSTOM-DOMAIN-ARCHITECTURE-001 v0.4.0
DOMAIN-BINDING-001 v0.3.0
```

Its next gate is the joint Unfict succession ratification decision.

# DOMAIN-BINDING-001
## Unfict Customer Domain Binding Profile

**Document ID:** `DOMAIN-BINDING-001`  
**Version:** `0.3.0`
**Status:** **DRAFT — UNFICT SUCCESSION REVISION / RATIFICATION CANDIDATE**
**Classification:** Derived implementation-facing profile for customer-controlled P4 namespaces  
**Date:** 14 September 2026
**Succession Authority:** `ZYPPI-UNFICT-SUCCESSION-DECLARATION-001 / ZUSD-001 v1.0 — RATIFIED`
**Platform Lineage:** `Zyppi → Unfict`
**Ratification Effect:** NONE until separately ratified
**Implementation Authority:** **NONE**  
**Repository Mutation Authority:** **NONE**

**Governed By:** `ADDRESSING-001 v0.4.0` · coordinates with `ZRR-NS-001 v0.3.0`  
**Coordinates With:** ZRM · ZRR · Z-PROF · OWNERSHIP-001 · DELEGATION-001 · POL · SEC · Evidence · RI  
**Supersedes:** `DOMAIN-BINDING-001 v0.3.0 — RATIFIED`

---

# 0. Executive Rule

`DOMAIN-BINDING-001` is a derived implementation profile for the ADDRESSING-owned `NamespaceBinding` concept as applied to customer-controlled P4 namespaces.

It answers:

> **Does the current claimant demonstrably control this hostname, and is Unfict presently authorized to serve an applicable public interface beneath it?**

It does **not** answer:

- what Reality the address ultimately refers to;
- whether a ZRM Identity relationship is factually established;
- what a GS1 or other family-native identifier semantically means;
- what ZRR resource should be selected;
- whether Policy permits an action;
- whether Trust is satisfied;
- whether Evidence is sufficient;
- whether execution should occur.

Those questions remain with their proper constitutional owners.

---

# 0A. Unfict Succession Rule

The Zyppi → Unfict brand succession does not change the constitutional meaning of a P4 `NamespaceBinding`.

Existing customer-domain bindings MAY migrate operator/provider implementation from Zyppi-branded infrastructure to Unfict-branded infrastructure without changing the customer-controlled public URI, provided:

- controller authority remains valid;
- serving authority is safely transferred;
- certificate/provider state is reconciled;
- no stale legacy binding can serve the prior tenant;
- the same ADDRESSING lifecycle invariants remain enforced.

The brand succession itself is not fresh proof of customer namespace control.

---

# 1. Constitutional Position

This document SHALL NOT create:

- a new constitutional Domain ontology;
- a new `NamespaceBinding` primitive;
- a second Public Namespace Registry;
- a second Resolution State;
- a new ZRM Identity primitive;
- a new legal-domain ownership system;
- an alternative authority or delegation model.

`NamespaceBinding` remains governed by ADDRESSING.

This document defines an implementation-facing customer-domain profile for that governed concept.

---

# 2. Core Distinctions

The following facts SHALL remain distinct:

```text
domain-control proof
≠
tenant/controller association
≠
traffic routing
≠
TLS certificate authorization
≠
constitutional Authority
≠
Reality ownership
≠
ZRM Identity relationship
≠
ZRR Resolution State
```

A CNAME does not prove who the current legitimate claimant is.

A TLS certificate does not prove tenant authority.

A working HTTP route does not prove current namespace control.

A Domain Binding does not prove what Reality a URI actually refers to.

---

# 3. Relationship to ZRM

ZRM distinguishes:

```text
Reality constituent
Identity relationship
Representation / Identifier
```

A URI may itself instantiate an Identifier/Representation.

Therefore:

> **A customer public address MAY be an Identifier/Representation while still remaining distinct, as an architectural role, from the Reality constituent and from the factual ZRM Identity relationship that may connect that Representation to Reality.**

A Domain Binding governs service authority for a namespace.

It SHALL NOT, by itself, prove the ZRM semantic question:

> Which Reality constituent does this Representation actually refer to?

That question remains with ZRM semantic resolution and applicable Evidence governance.

Successful domain verification or public serving SHALL NOT be interpreted as proof of factual Identity.

---

# 4. Relationship to ADDRESSING

ADDRESSING owns:

- P4 namespace classification;
- Public Namespace Registry governance;
- `NamespaceBinding` admission and lifecycle;
- public-address lifecycle;
- Address Family allocation;
- Public Resolution Handoff;
- public Internet constraints such as host validation, redirect correctness, cache correctness and namespace isolation.

`DOMAIN-BINDING-001` SHALL implement those rules for customer-controlled domains without redefining them.

---

# 5. Relationship to ZRR

This profile stops before ZRR-owned generic Resolution.

It MAY prepare or expose:

```text
active NamespaceBinding
+
family mode
+
serving authority
```

for public request admission.

It SHALL NOT define:

- ZRR Resolution State;
- resource relationships;
- discovery;
- default-resource semantics;
- matching;
- selection;
- Resolution Broker behavior;
- dispatch graph;
- serving read-model semantics.

---

# 6. Terminology

## Customer-Controlled P4 Namespace

A public namespace controlled by the customer and classified by ADDRESSING as P4.

The namespace can survive Unfict.

## Domain Binding

The implementation-facing capability/profile by which Unfict manages the lifecycle of its own service association to a customer-controlled P4 namespace.

## NamespaceBinding

The ADDRESSING-owned architectural abstraction representing the governed association between public namespace/origin, controller, family mode, lifecycle and serving authority.

An implementation MAY use a technical object named `DomainBinding`, but that object SHALL represent rather than replace the governed `NamespaceBinding`.

## Controller

The party whose current namespace control has been accepted for the binding transaction.

Use of the word `controller` does not itself adjudicate ultimate legal ownership of the domain.

---

# 7. Lifecycle

The implementation SHALL preserve lifecycle states materially equivalent to:

```text
REQUESTED
        │
        ▼
VERIFICATION_PENDING
        │
        ▼
VERIFIED
        │
        ▼
SERVING_PREPARED
        │
        ▼
ACTIVE
        │
        ├────────► SUSPENDED
        │              │
        │              └────────► ACTIVE
        │
        └────────► DETACH_PENDING
                         │
                         ▼
                    RETIRED_HELD
                         │
                         ▼
                      RELEASED
```

Exact implementation names MAY differ.

The semantic distinctions SHALL NOT disappear.

The previous coarse terminal state `REVOKED` is superseded because it failed to distinguish:

```text
"Unfict no longer serves the prior tenant"
```

from:

```text
"the hostname is now safe for another claimant to bind"
```

Those are different facts and SHALL remain different lifecycle conditions.

---

# 8. REQUESTED

`REQUESTED` means:

- a claimant has requested a binding;
- no current control has yet been established;
- no ordinary Unfict public serving authority exists.

A requested hostname SHALL NOT be accepted for ordinary customer Resolution merely because traffic already reaches Unfict infrastructure.

---

# 9. VERIFICATION_PENDING

Unfict SHALL establish a fresh claim transaction.

For new, conflicting, reclaimed or sensitive claims, current-control proof SHALL be bound to:

```text
requested hostname
+
current claimant / tenant
+
current claim transaction
```

Previously retained proof SHALL NOT silently authorize a new claim.

---

# 10. Fresh Current-Control Proof

Verification MAY use a fresh DNS TXT challenge or another independently validated or out-of-band method authorized by the applicable Security profile.

The proof SHALL NOT be satisfiable solely because:

- a CNAME still points to Unfict;
- A/AAAA records still reach Unfict/shared infrastructure;
- a shared edge provider still routes the hostname;
- an old Unfict binding still answers HTTP;
- a previous claimant once controlled the hostname;
- a stale or still-valid certificate exists;
- old verification evidence remains stored.

The governing invariant is:

> **Residual reachability through shared infrastructure is not proof of current namespace control.**

---

# 11. Illustrative TXT Verification

A representative challenge MAY resemble:

```text
_unfict-verification.id.brand.example
TXT "unfict-verification=<claim-bound-token>"
```

Any such token SHOULD be:

- unique to the claim transaction;
- unpredictable;
- bounded in validity;
- associated with the requested hostname and current claimant;
- unusable as a broader grant of constitutional authority.

This is illustrative, not a frozen protocol.

---

# 12. Hostname Normalization

Before exclusivity or collision decisions, hostname handling SHALL use standards-correct normalization suitable for the Internet binding profile, including as applicable:

- DNS case insensitivity;
- IDNA / ASCII-compatible processing;
- relevant Unicode normalization;
- trailing-dot equivalence;
- exact label boundaries.

Naive raw-string comparison SHALL NOT be the only uniqueness mechanism.

Visual similarity is not domain identity.

Homograph/confusable-sensitive claims SHOULD be eligible for elevated Security review where deception risk is material.

---

# 13. Public-Suffix Awareness

Where registrable-domain boundaries matter, the implementation SHALL use a maintained public-suffix-aware mechanism or equivalent.

It SHALL NOT assume the registrable domain is always the final two labels.

Public-suffix data does not itself prove control or existence.

---

# 14. VERIFIED

`VERIFIED` means the current claim transaction has satisfied the required current-control proof.

It does not yet mean:

- Unfict is ready to serve;
- TLS is ready;
- provider routing is ready;
- family configuration is valid;
- the binding is active.

---

# 15. SERVING_PREPARED

Before activation, Unfict SHALL establish the required serving prerequisites.

These MAY include:

- authorized edge/provider custom-host configuration;
- TLS certificate issuance or attachment;
- NamespaceBinding registry linkage;
- family mode;
- Address Family binding where applicable;
- ingress configuration;
- serving-plane projection publication;
- conflict checks;
- applicable Security prerequisites.

Certificate readiness SHALL remain distinct from current-control proof.

---

# 16. ACTIVE

Only an `ACTIVE` NamespaceBinding is eligible for ordinary Unfict-operated customer-domain serving.

A normalized hostname SHALL have at most one active controller association in Unfict at a time unless later governance explicitly defines a different multiplexing model.

The correct terminology is:

```text
exclusive active binding
```

not:

```text
exclusive ownership
```

Unfict establishes service authority, not ultimate legal title to the domain.

---

# 17. SUSPENDED

`SUSPENDED` means ordinary Unfict serving is temporarily restricted.

Suspension SHALL NOT:

- release the hostname;
- authorize another tenant;
- erase historical binding evidence;
- turn lingering provider reachability into a claimant-selection mechanism;
- imply retirement.

Reactivation SHALL require the governing conditions for return to `ACTIVE`.

---

# 18. DETACH_PENDING

When a customer binding is being removed, Unfict SHALL enter a detachment phase rather than immediately making the hostname active for another tenant.

A safe sequence SHALL preserve:

```text
disable prior customer serving
        ↓
enter detachment state
        ↓
remove/isolate prior provider binding
        ↓
remove, invalidate, replace or neutralize
obsolete certificate/service authorization as applicable
        ↓
resolve security/legal holds
        ↓
RETIRED_HELD
        ↓
RELEASE
OR
fresh independently verified legitimate rebind
```

Customer DNS may continue to point at Unfict during this process.

Such reachability is transport state, not current-control proof.

---

# 19. RETIRED_HELD

A removed binding SHALL enter a protected condition materially equivalent to `RETIRED_HELD` where safe release/rebind conditions are not yet satisfied.

While held:

- lingering DNS SHALL NOT authorize another tenant;
- shared-edge reachability SHALL NOT authorize another tenant;
- the prior tenant SHALL NOT retain serving authority;
- the hostname SHALL NOT fall through to a default tenant;
- a neutral or non-revealing failure SHOULD be preferred where traffic still arrives;
- stale certificate/provider configuration SHALL be detected and remediated;
- a legitimate new claimant still requires fresh current-control proof.

A new claim transaction MAY begin while the prior record remains `RETIRED_HELD`.

Fresh verification does not itself activate the new claimant.

Activation SHALL remain blocked until:

1. fresh current-control proof succeeds;
2. prior Unfict/provider serving authority capable of serving the previous tenant is removed or isolated;
3. obsolete certificate/service authorization is handled as required;
4. no unresolved security/legal hold prohibits activation;
5. the new NamespaceBinding is independently admitted.

No universal fixed hold duration is required.

If those conditions cannot be established, remaining in `RETIRED_HELD` is a legitimate fail-closed outcome.

`RETIRED_HELD` is a service-safety state.

It is not a claim of perpetual legal ownership by the prior tenant.

---

# 20. RELEASED

`RELEASED` is the terminal service-association state of the **prior Domain Binding record**.

It means:

- prior tenant serving authority is terminated;
- old Unfict/provider service authority has been removed or safely isolated;
- obsolete certificate/service authorization has been handled as required;
- no unresolved security/legal hold requires the record to remain held;
- the release transition has been recorded through the governed lifecycle.

Customer DNS MAY still point at Unfict/shared infrastructure after `RELEASED`.

Such traffic SHALL fail closed unless a separately admitted ACTIVE binding exists.

`RELEASED` does not grant the hostname to any tenant.

Any future service association requires a new Domain Binding / NamespaceBinding claim transaction.

---

# 21. Reclaim by a New Legitimate Controller

A previously bound hostname MAY later be associated with another legitimate controller.

The new claim MAY begin while the old record is `RETIRED_HELD` or after it is `RELEASED`.

The new association SHALL NOT become `ACTIVE` until:

- fresh current-control proof satisfies §10;
- applicable dispute/security hold clearance succeeds;
- old Unfict/provider serving authority is removed or isolated;
- stale certificate/service authorization is neutralized as required;
- a new NamespaceBinding is independently admitted.

Where all new-activation conditions are satisfied while the old record is still `RETIRED_HELD`, the implementation MAY perform an atomic safe rebind:

```text
old binding:
RETIRED_HELD
    ↓
RELEASED

new binding:
VERIFIED / SERVING_PREPARED
    ↓
ACTIVE
```

This avoids an opportunistic serving interval.

Historical possession is not permanent authority.

Lingering CNAME/shared-edge reachability is insufficient.

---

# 22. Active Host Exclusivity

Unknown, inactive, mismatched or conflicting host authority SHALL fail closed.

The infrastructure SHALL NOT select:

```text
default tenant
previous tenant
first matching tenant
wildcard customer
opportunistic claimant
```

merely because network traffic reached a shared Unfict edge.

---

# 23. Wildcard Bindings

Wildcard namespace bindings require separate authorization and stronger scope review.

Single-host verification SHALL NOT automatically grant:

```text
*.brand.example
```

A wildcard NamespaceBinding grants no automatic authority for:

- OAuth/OIDC redirect URIs;
- credentialed CORS;
- administrative sessions;
- cookie scope;
- unrelated subdomain capabilities.

Each remains independently governed.

---

# 24. TLS and Certificate Lifecycle

TLS may be provisioned automatically by an authorized provider.

The implementation SHALL preserve:

```text
certificate authorization
≠
controller proof
≠
NamespaceBinding authority
```

Certificate domain-control validation is an infrastructure/security process.

It SHALL NOT be treated as a substitute for the fresh NamespaceBinding claim verification required by §10 unless a future Security profile explicitly proves semantic equivalence for that use.

During detachment or reclaim, obsolete certificates and provider service associations SHALL be removed, invalidated, replaced or isolated as required before the hostname is treated as safe for a new ACTIVE Unfict binding.

The concrete ACME/DCV mechanism remains a provider/Security-profile concern and SHALL NOT silently weaken the namespace-control proof model.

---

# 25. Customer Namespace Sovereignty

A customer custom domain is a genuine customer-controlled public namespace.

It is not merely a cosmetic alias.

While an `ACTIVE` Unfict NamespaceBinding exists:

```text
customer namespace
        ↓
Unfict-operated serving infrastructure
```

After the customer exits Unfict:

```text
same customer namespace
        ↓
replacement resolver/operator
```

may be possible without changing the public URI.

The namespace does not become Unfict-owned because Unfict currently serves it.

---

# 26. Customer Exit Test

A P4 customer SHOULD be able to change DNS to a replacement resolver while preserving the customer-controlled public URI.

This does not guarantee continuity of every Unfict value-added service.

Namespace continuity and Unfict service continuity are different.

---

# 27. ZRM Non-Destructive Representation Rule

Revoking, suspending, detaching or releasing a Domain Binding SHALL NOT, by that act alone:

- create Reality;
- destroy Reality;
- merge Reality constituents;
- split a Reality constituent;
- rewrite unrelated ZRM Identity relationships.

A representational/service change does not by itself rewrite Reality.

---

# 28. Public Address Resolution Does Not Prove ZRM Identity

Even when:

```text
https://id.brand.example/...
```

successfully resolves through Unfict, that successful public/ZRR Resolution SHALL NOT by itself establish:

```text
"This Representation factually refers to Reality constituent X"
```

That is a distinct ZRM semantic-resolution/Evidence question.

This distinction SHALL remain explicit in documentation and implementation language.

---

# 29. Technical Record — Illustrative Only

An implementation MAY maintain a technical record conceptually resembling:

```ts
type DomainBindingRecord = {
  bindingId: string;
  normalizedHostname: string;
  controllerRef: string;
  tenantRef: string;

  lifecycleState:
    | "REQUESTED"
    | "VERIFICATION_PENDING"
    | "VERIFIED"
    | "SERVING_PREPARED"
    | "ACTIVE"
    | "SUSPENDED"
    | "DETACH_PENDING"
    | "RETIRED_HELD"
    | "RELEASED";

  familyMode: "single-family" | "multi-family";
  familyRef?: string;

  verificationTransactionRef?: string;
  providerBindingRef?: string;
  certificateRef?: string;

  createdAt: string;
  updatedAt: string;
};
```

This example is non-normative.

It SHALL NOT be treated as the ratified constitutional schema for `NamespaceBinding`.

---

# 30. Auditability & Drift Detection

Material lifecycle transitions SHOULD be reconstructable through governed Evidence/audit mechanisms sufficient to determine:

- claimant/controller;
- hostname;
- claim transaction;
- previous state;
- resulting state;
- verification method reference;
- provider binding change;
- certificate lifecycle change;
- suspension/detachment/release reason where lawful to retain.

Unfict SHALL operate automated, scheduled or provider-event-driven drift detection sufficient to identify:

- lingering Unfict-targeted DNS after detachment;
- provider custom-host records without active NamespaceBindings;
- active NamespaceBindings whose DNS/provider state no longer matches expected serving configuration;
- stale certificate/service associations;
- other material takeover-prone drift.

Evidence mechanics and retention remain owned by their proper authorities.

Drift detection does not replace fresh claim verification.

---

# 31. Interface Consistency

REST, SDK, MCP, Admin UI and future surfaces MAY expose domain-binding operations.

All such interfaces SHALL adapt one governed Domain Binding implementation/profile.

They SHALL NOT create divergent lifecycle, verification or authority semantics.

---

# 32. Invariants

1. `NamespaceBinding` remains ADDRESSING-owned.
2. Domain Binding is a derived implementation profile, not a new constitutional primitive.
3. Domain-control proof, routing and certificate authorization remain distinct.
4. Only an `ACTIVE` binding may support ordinary Unfict-operated P4 serving.
5. Residual shared-edge reachability SHALL NOT establish current control.
6. A removed binding SHALL not become immediately opportunistically claimable.
7. `DETACH_PENDING`, `RETIRED_HELD` and `RELEASED` semantics SHALL be preserved.
8. A later controller requires fresh current-control proof.
9. Use `controller association` and `exclusive active binding`, not legal-ownership claims.
10. Host uniqueness SHALL use standards-correct normalization.
11. Wildcard namespace authority SHALL not leak into unrelated Security authority.
12. Domain Binding SHALL NOT determine ZRR resource selection.
13. Domain Binding SHALL NOT prove a ZRM Identity relationship.
14. Revocation/detachment SHALL NOT by itself rewrite Reality.

---

# 33. Document State

**Version:** `0.3.0`  
**Status:** **DRAFT — UNFICT SUCCESSION REVISION / RATIFICATION CANDIDATE**  
**Succession Basis:** `ZUSD-001 v1.0 — RATIFIED`  
**Supersedes if ratified:** `DOMAIN-BINDING-001 v0.2.1 — RATIFIED`  
**Implementation Authority:** NONE.  
**Repository Mutation Authority:** NONE.

This document is aligned to:

```text
ADDRESSING-001 v0.4.0
ZRR-NS-001 v0.3.0
CUSTOM-DOMAIN-ARCHITECTURE-001 v0.4.0
EDGE-RESOLUTION-GATEWAY-001 v0.3.0
```

Its next gate is the joint Unfict succession ratification decision.

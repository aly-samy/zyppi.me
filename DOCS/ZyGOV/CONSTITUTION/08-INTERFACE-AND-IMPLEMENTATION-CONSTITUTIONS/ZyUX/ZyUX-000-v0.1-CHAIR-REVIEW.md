# ZyUX-000 — Zyppi Experience Architecture & Master Doctrine

**Canonical ID:** `ZyUX-000`  
**Version:** 0.1  
**Status:** DRAFT — CHAIR REVIEW  
**Series:** ZyUX — Zyppi Experience Architecture  
**Classification:** Foundational Product / UX / Experience Doctrine  
**Normative Level:** Master Doctrine / Series Authority  
**Date:** 5 September 2026  
**Governing Authority:** NORTH STAR v7.0  
**Coordinates With:** What is Zyppi? v4.0 · Z-PROF-001 v1.2 · ZYAPI v1.1 · MARKET-REALITY-001 · Marketing-PLAN-1Y-001 · Marketing-PLAN-3Y-001 · ZYPPI-REALITY-VALIDATION-001  
**Primary Source Corpus:** `ZYPPI-PARTICIPANT-001` draft and subsequent Council discussion  
**Applies To:** Product · UX/UI · Identity & Access Experience · Organizations · Delegation · Host-Native Experience · Developer Experience · Agent Experience · Public Resolution Experience · Marketing Projections

---

# 0. Status & Intent

`ZyUX-000` establishes the master experience architecture for Zyppi.

It exists to ensure that Zyppi can serve radically different Subjects, organizations, relationships, Jobs, hosts, and domains without becoming:

- a maze of menus;
- a collection of unrelated persona products;
- a conventional enterprise RBAC console;
- a consumer social identity network;
- a separate UX architecture for every domain;
- a separate semantic system for every interface;
- a collection of one-off journeys with no common doctrine.

This document is **not yet ratified**.

It does not redefine constitutional Reality, Subject, Object, Place, Event, Evidence, Identity, Authority, Standing, Policy, Trust, Runtime, Registry Truth, or Receipt semantics.

ZyUX governs how those governed concepts are **experienced**.

> **ZyUX is the experience projection layer through which Zyppi's constitutional depth becomes simple, contextual, authority-aware, and useful to humans, applications, organizations, and agents.**

---

# 1. Why ZyUX Exists

Zyppi is intentionally deep under the hood.

Its users should not be required to carry that depth cognitively.

A person may:

- work for multiple organizations;
- act personally and professionally;
- own an animal;
- own property;
- perform freelance work;
- participate under several credentials;
- lose one job while preserving another;
- change authentication methods;
- retain historical attribution after leaving;
- act through different hosts and interfaces.

An organization may:

- be a sole trader;
- be a small company;
- be multinational;
- reorganize;
- merge departments;
- change leadership;
- delegate to contractors;
- receive authority from government;
- delegate to logistics providers;
- operate through external systems of work.

A product, animal, vehicle, machine, place, or other Reality constituent may have Identity and relationships without ever having a user account.

ZyUX must make all of this feel simple.

The foundational proposition is:

> **Easy in front. Deep, governed, and auditable underneath.**

---

# 2. ZyUX Does Not Create a New Ontology

`Participant`, `User`, `Account`, `Persona`, `Journey`, `Surface`, and `Control` are product/experience concepts.

They SHALL NOT silently become new constitutional Reality primitives.

ZyUX inherits constitutional meaning from the governing Zyppi corpus.

For experience purposes:

- **Subject** — constitutional actor/autonomous constituent according to governing ontology.
- **Participant** — a Subject currently participating in a Zyppi relationship, interaction, or governed process.
- **User** — a human or software Subject directly operating a Zyppi interface.
- **Account / Authentication Context** — an access mechanism, not a person.
- **Identity** — governed identity relationship/representation; not owned by ZyUX.
- **Relationship** — the relevant connection between constituents.
- **Role** — the capacity in which a Subject acts.
- **Authority** — what the Subject or organization is empowered to establish, approve, delegate, or cause.
- **Standing** — whether the Subject is currently eligible to exercise relevant Authority.
- **Context** — the current Job, object, relationship, place, time, host, or interaction situation that changes what is useful now.
- **Capability** — a governed Zyppi ability made available through an authorized surface.

The experience SHALL preserve these distinctions even when the interface uses simpler language.

---

# 3. The ZyUX Experience Equation

The actual experience should not be determined by a static persona alone.

The governing product abstraction is:

```text
EXPERIENCE
=
SUBJECT
× RELATIONSHIP
× JOB
× CURRENT STANDING
× DELEGATED AUTHORITY
× APPLICABLE POLICY
× DISCLOSURE SCOPE
× CONTEXT
× INTERFACE / HOST
```

This is conceptual, not a mandate for one literal code formula.

The rule is:

> **The same Subject may legitimately receive very different experiences in different contexts without becoming different users or identities.**

Example:

```text
Ahmed
× Personal relationship
× Owns Mimi
→ pet/animal controls

Ahmed
× Company A
× Accountant
→ finance controls

Ahmed
× Company B
× Cashier
→ retail-operation controls

Ahmed
× Company X
× Freelancer
→ project-scoped controls
```

One Subject.

Many legitimate surfaces.

---

# 4. Governing Experience Laws

## ZyUX-L01 — Invisible Complexity

> **Constitutional rigor belongs underneath the experience. Users interact with familiar Jobs, understandable actions, clear reasons, and appropriate proof.**

A user SHOULD NOT need to understand Z-PROF internals, Runtime coordinates, internal composition graphs, policy graph internals, Evidence engine internals, or constitutional vocabulary unnecessary to the Job.

## ZyUX-L02 — Contextual Capability Disclosure

> **Zyppi SHALL ordinarily reveal only the capabilities, controls, settings, and information relevant to the current Job, relationship, Standing, Authority, and context.**

Unavailable Authority SHOULD ordinarily be invisible rather than represented as a giant field of disabled controls.

## ZyUX-L03 — Minimum Necessary Onboarding

> **Zyppi SHOULD ask only for information necessary to establish the current legitimate relationship and first useful action.**

Do not ask the user to configure departments, roles, industries, modules, dashboards, permissions, or organization structure when the information can already be derived from a legitimate invitation, claim, IdP mapping, existing relationship, or delegated Authority.

## ZyUX-L04 — Object / Context First

> **The experience SHOULD begin from what the Subject is working with and what they need to do, not from a permanent inventory of platform modules.**

Preferred:

```text
Shipment 8831
Bruno
Product #095...
Company X
Camera #22
Tree #344
```

Then show legitimate actions.

## ZyUX-L05 — Progressive Explanation

Where explanation is useful, expose increasing depth:

```text
Action
↓
Reason
↓
Basis
↓
Proof
```

Most users should not need the deepest level to complete ordinary work.

## ZyUX-L06 — Scope-Bounded Visibility

> **A Subject sees only the Reality, information, relationships, controls, and proof legitimately available within the current governed scope.**

## ZyUX-L07 — Bidirectional Scope Isolation

Scope isolation applies to both sides.

An organization does not gain access to a person's unrelated context.

A person does not gain access to an organization's unrelated context.

## ZyUX-L08 — Existing IAM Coexistence

> **Enterprise authentication SHOULD remain native to the enterprise where appropriate. Zyppi SHALL NOT require an enterprise to replace a legitimate existing IdP merely to participate.**

## ZyUX-L09 — Identity Persistence, Authority Change

> **Credentials, roles, jobs, employers, departments, leadership, Standing, and Authority may change without rewriting the Subject's Identity or historical attribution.**

## ZyUX-L10 — No Deep Menu as a Substitute for Design

> **Navigation depth SHALL NOT be used as the primary mechanism for containing platform complexity.**

## ZyUX-L11 — Host-Native Bias

> **Where practical, Zyppi SHOULD meet the user inside the system where the Job already occurs instead of requiring migration into a separate Zyppi workspace.**

## ZyUX-L12 — Surface Semantic Parity

Different interfaces may look different.

They SHALL NOT become different semantic systems.

## ZyUX-L13 — Frictionless Entry

> **Account creation, joining, claiming, and invitation acceptance SHOULD be as direct as legitimately possible.**

Target entry family:

```text
Sign up / Log in
        ↓
Create
Join
Claim
Accept invitation
Continue from scan
```

## ZyUX-L14 — Federation Is Additive

> **Federation may compound value, but no experience should require an already-populated network merely to provide legitimate Day-1 utility.**

## ZyUX-L15 — Universal Architecture, Narrow GTM

> **ZyUX may model many domains and participant types internally without authorizing simultaneous market expansion across those domains.**

---

# 5. Account, Identity & Context Experience

ZyUX adopts a strict experience distinction:

```text
SUBJECT
↓
CANONICAL IDENTITY
↓
AUTHENTICATION CONTEXT(S)
↓
RELATIONSHIP(S)
↓
CURRENT STANDING / AUTHORITY
↓
AVAILABLE CAPABILITIES
↓
EXPERIENCE
```

A user may have Google authentication, mobile authentication, Company A SSO, Company B SSO, and future authentication methods while remaining one Subject.

Revoking one authentication method does not erase the Subject.

Changing employment does not change the Subject.

Changing country does not change the Subject.

---

# 6. Organization Experience

Organizations SHALL NOT be assumed to have one fixed hierarchy.

ZyUX must support experience models for sole traders, family businesses, small companies, multinationals, consortia, agencies, government authorities, regulators, partner networks, contractor relationships, and cross-organization delegation.

The UX may present familiar organizational structures, but the underlying access experience must remain compatible with federated delegation.

---

# 7. Delegation Experience

The universal human-facing delegation model SHOULD reduce to:

```text
Who?

What can they do?

For what?

For how long?

Can they delegate further?
```

The underlying system may express detailed Authority, Standing, valid-time, provenance, and Receipt semantics.

ZyUX owns the simplification, not the authority law itself.

---

# 8. Entry Journey Families

## 8.1 Create

```text
Sign up
→ Create organization / governed personal context
→ First useful action
```

## 8.2 Join

```text
Invitation
→ Authenticate
→ Accept relationship
→ Delegated capabilities appear
```

## 8.3 Claim

```text
Scan / identifier
→ Existing Identity found
→ Establish lawful relationship
→ New capabilities appear
```

## 8.4 Observe Without Account

```text
Public touchpoint
→ Public information
→ No account required
```

## 8.5 Recover / Re-link

```text
Credential unavailable
→ governed recovery
→ Identity continuity preserved
```

Recovery remains a security/legal design area and SHALL NOT be improvised by UX.

---

# 9. Experience States Over Time

ZyUX SHALL support experience transitions when relationships change.

Example:

```text
ACTIVE EMPLOYEE
→ Current work + actions

TERMINATED EMPLOYEE
→ No new actions
→ No new company visibility
→ Historical attribution may remain
```

Example:

```text
PUBLIC OBSERVER
→ public product information

PURCHASER / OWNER
→ warranty / service / claim / transfer capabilities
```

The experience changes because Standing and relationship change.

The Subject does not become a different person.

---

# 10. Progressive Use of Zyppi

ZyUX should allow experiences to deepen naturally:

```text
observe
↓
claim
↓
manage
↓
delegate
↓
govern
↓
integrate
```

The user SHOULD NOT be forced to understand later stages before receiving value from earlier ones.

---

# 11. ZyUX Series Architecture

The series SHALL distinguish **horizontal experience doctrine** from **archetype profiles**.

## 11.1 Foundational Documents

### `ZyUX-000 — Zyppi Experience Architecture & Master Doctrine`
Defines universal experience laws, composition, profile governance, and series boundaries.

### `ZyUX-001 — Identity, Account & Entry Experience`
Owns account vs Subject experience, authentication contexts, create/join/claim flows, identity-linking UX, context entry, credential changes, and recovery-experience boundaries.

### `ZyUX-002 — Organization, Relationship, Scope & Delegation Experience`
Owns organizations of different shapes, relationship-scoped visibility, delegation UX, re-delegation, organization membership, cross-organization relationships, and organization change.

### `ZyUX-003 — Contextual Navigation & Capability Disclosure`
Owns object/context-first UX, no-deep-menu doctrine, contextual actions, visibility rules, progressive control disclosure, and context switching.

### `ZyUX-004 — Explanation, Evidence, Trust & Receipt Experience`
Owns Answer → Reason → Basis → Proof, Trust presentation, Evidence references, uncertainty, unresolved/conflicting states, Receipt presentation, and audit comprehension.

### `ZyUX-005 — Host-Native Experience`
Owns environmental nativeness, host-native surfaces, host vs Zyppi control plane, mapping UX, source provenance presentation, and minimal workflow displacement.

### `ZyUX-006 — Lifecycle, Offboarding, Recovery & Historical Experience`
Owns termination, revoked Standing, historical attribution, credential loss, recovery, organization dissolution, succession-facing UX boundaries, and life-state experience boundaries.

---

# 12. Archetype Profiles

Archetype documents are projections of ZyUX-000 and the foundational ZyUX documents.

They SHALL NOT redefine the universal model.

Initial candidate profiles:

```text
ZyUX-DEVELOPER-001
ZyUX-ORG-ADMIN-001
ZyUX-PUBLIC-OBSERVER-001
ZyUX-CUSTOMER-001
ZyUX-AGENCY-001
ZyUX-OPERATOR-001
ZyUX-COMPLIANCE-001
ZyUX-AUDITOR-001
ZyUX-AGENT-001
```

Only profiles justified by current product or research needs should be developed deeply.

---

# 13. Standard Archetype Profile Template

Every `ZyUX-<ARCHETYPE>-001` SHOULD follow the same structure:

1. Archetype definition
2. Explicit non-membership / exclusions
3. Primary Jobs
4. Entry triggers
5. Authentication expectations
6. Relationships
7. Authority / Standing needs
8. Information needs
9. Controls
10. What must remain hidden
11. Default journey
12. Exceptional journeys
13. Delegation behavior
14. Offboarding / relationship end
15. Evidence / Trust / explanation needs
16. Primary interface
17. Host-Native expectation
18. Developer / agent equivalent where relevant
19. Marketing trigger / promise
20. Buyer relationship
21. Success metrics
22. Friction risks
23. Anti-patterns
24. Current-horizon relevance
25. Open questions

---

# 14. Anti-Explosion Rule

A new user type, organization type, domain, application, host, interface, market, or standard SHALL NOT automatically create a new ZyUX document.

A separate profile is warranted only when one or more materially diverge:

- Job;
- authority model;
- cognitive need;
- journey;
- control surface;
- evidence/explanation need;
- host environment;
- onboarding path;
- lifecycle behavior.

The desired composition is:

```text
ZyUX Doctrine
+
Archetype
+
Application Job
+
Authority / Standing
+
Context
+
Host / Interface
↓
Actual Experience
```

Not one document for every combination.

---

# 15. Application & Domain Relationship

ZyUX profiles are not Domains.

Developer, Agency, Customer, Auditor, and Operator are experience archetypes.

They may operate across GS1, DPP, Warranty, Recall, future applications, and future domains.

ZyUX SHALL NOT treat unlike categories as equivalent merely because they appear in interface taxonomy.

---

# 16. Host-Native Experience Principle

Most operational users SHOULD NOT be forced to live inside Zyppi.

Examples:

```text
SAP operator → SAP
Shopify merchant → Shopify
Developer → SDK / API
AI Agent → MCP
Auditor → bounded audit / Receipt surface
Organization admin → Zyppi control plane
```

The Zyppi standalone interface is primarily a control plane, governance surface, delegation surface, developer-management surface, evidence/proof surface, and cross-system visibility surface where legitimately required.

It SHOULD NOT become a replacement workspace for every Job.

---

# 17. Marketing Projection

ZyUX is a source of truth for experience.

Marketing may project different messages to different archetypes.

Internal architecture:

> one canonical Subject identity.

Enterprise security message:

> Keep your IdP. Zyppi preserves scoped Authority and historical accountability across change.

End-user message:

> Sign in and continue.

Developer message:

> Make one call and get a governed answer with proof.

These are different explanations of one architecture, not contradictory systems.

---

# 18. Internal Universality vs External Focus

ZyUX may use cross-domain examples internally to prove universality: pet owner, farmer, retailer, government, logistics provider, freelancer, manufacturer, customer, auditor, AI agent.

These examples do not authorize broad market expansion.

Current GTM remains governed by the active strategy.

---

# 19. Initial Horizon Prioritization

## BABY / Current Wedge

Deepest immediate ZyUX work should focus on:

### `ZyUX-DEVELOPER-001`
Because M09 / ZYAPI depends on excellent developer and agent access.

### `ZyUX-ORG-ADMIN-001`
Because even the first production integrations require simple organization/access/delegation administration.

### `ZyUX-PUBLIC-OBSERVER-001`
Because the GS1 wedge culminates in a real public product-resolution experience.

### `ZyUX-CUSTOMER-001`
Only to the depth required to distinguish public observer from authenticated purchaser/owner journeys.

## GROW

Later deepen Agency, Operator, Compliance, Auditor, and Agent profiles as product evidence and Host-Native expansion earn the need.

---

# 20. Immediate CAW Alignment

## M09 — Public API / ZYAPI

Primary ZyUX references:

```text
ZyUX-000
ZyUX-DEVELOPER-001
ZyUX-AGENT-001
```

M09 materializes the first governed public software capability.

## M10 — Edge Gateway

Primary ZyUX reference:

```text
ZyUX-000
```

M10 should preserve transparency, failure clarity, and minimal friction.

## M11 — Verified Product Experience

Primary ZyUX references:

```text
ZyUX-000
ZyUX-003
ZyUX-004
ZyUX-PUBLIC-OBSERVER-001
ZyUX-CUSTOMER-001
```

M11 should be treated as:

> **the first governed human Zyppi experience**

not merely:

> build a product page.

---

# 21. Relationship to ZYPPI-PARTICIPANT-001

The current `ZYPPI-PARTICIPANT-001` draft is valuable reconnaissance and synthesis.

However, much of its content belongs naturally inside ZyUX.

Recommended disposition:

> **Do not ratify `ZYPPI-PARTICIPANT-001` as a competing standalone doctrine in its current form.**

Instead:

```text
ZYPPI-PARTICIPANT-001 draft
        ↓ source corpus
ZyUX-000
ZyUX-001
ZyUX-002
ZyUX-003
ZyUX-006
```

After successful factoring, the Participant draft may be archived as a historical synthesis/reconnaissance artifact.

---

# 22. Experience Success Criteria

ZyUX should eventually measure success through observable outcomes such as:

- time to first useful action;
- onboarding completion;
- unnecessary configuration steps;
- task completion rate;
- wrong-action rate;
- authorization confusion;
- error comprehension;
- time to recover from failure;
- time to locate legitimate action;
- user reliance on menus/search;
- support burden;
- developer time-to-first-success;
- production activation;
- host workflow displacement;
- repeat usage;
- successful delegation;
- safe offboarding;
- proof/audit comprehension.

Specific metrics belong in each archetype/application profile.

---

# 23. Drift Prohibitions

ZyUX SHALL NOT become:

- a design-system-only series;
- a visual-style guide;
- a persona marketing folder;
- a substitute constitutional ontology;
- a duplicate Authority model;
- a duplicate ZYAPI;
- a generic workflow platform;
- a universal dashboard mandate;
- a reason to build every possible user surface;
- a reason to expose all available controls;
- a reason to create a new document for every domain/persona combination.

---

# 24. Open Questions for ZyUX-000 Ratification

Before ratification, Council should review:

1. Whether `ZyUX` is the final series name and casing.
2. Whether `Participant` should remain a product term or be avoided entirely in the master doctrine.
3. Exact constitutional mapping for Subject / Identity terminology.
4. Boundary between ZyUX and ZYAPI for developer/agent experience.
5. Boundary between ZyUX and Host-Native doctrine.
6. Boundary between ZyUX and future design-system documentation.
7. Whether account recovery belongs in ZyUX-006 or a security authority with a ZyUX projection.
8. Whether organization administration requires its own horizontal document beyond ZyUX-002.
9. Whether `Public Observer` and `Customer` should be one profile with Standing-based journey variants or separate profiles.
10. Whether `Agency` should be modeled as an organization-shape profile or an archetype.
11. Which BABY-stage profiles are implementation-driving versus reconnaissance-only.
12. Required evidence before a ZyUX profile can become normative.
13. Accessibility and localization doctrine needed before public UI implementation.
14. How ZyUX should represent uncertainty and conflicting Evidence without overwhelming ordinary users.
15. How to validate Contextual Capability Disclosure does not hide controls users legitimately need.

---

# 25. Proposed Initial Series Roadmap

```text
ZyUX-000
Experience Architecture & Master Doctrine
        ↓
ZyUX-001
Identity, Account & Entry Experience
        ↓
ZyUX-002
Organization, Relationship, Scope & Delegation
        ↓
ZyUX-003
Contextual Navigation & Capability Disclosure
        ↓
ZyUX-004
Explanation, Evidence, Trust & Receipt Experience
        ↓
ZyUX-005
Host-Native Experience
        ↓
ZyUX-006
Lifecycle, Offboarding, Recovery & Historical Experience
```

Archetype profiles may then be created as needed:

```text
ZyUX-DEVELOPER-001
ZyUX-ORG-ADMIN-001
ZyUX-PUBLIC-OBSERVER-001
ZyUX-CUSTOMER-001
ZyUX-AGENCY-001
ZyUX-OPERATOR-001
ZyUX-COMPLIANCE-001
ZyUX-AUDITOR-001
ZyUX-AGENT-001
```

No archetype profile becomes implementation authority merely because it exists.

---

# 26. Closing Doctrine

> **Zyppi should feel simple locally even when it is powerful globally.**

> **A Subject should see their Job, their legitimate context, their available actions, and the proof they need — not the whole platform.**

> **Identity persists. Credentials rotate. Roles change. Standing changes. Authority changes. History remains.**

> **Organizations govern their scope. Subjects retain their Identity.**

> **The interface should reveal capability when it becomes relevant, not force the user to navigate complexity in advance.**

> **Host-Native means meet the user where the work already happens.**

> **The same governed capability may appear differently to a human, application, agent, or host — but its meaning does not change.**

> **Universal experience architecture does not require universal product surfaces.**

> **Build one experience doctrine. Compose many journeys from it.**

---

# 27. Status & Next Step

**Current Status:** DRAFT — CHAIR REVIEW.

Recommended next sequence:

1. Chair review and disposition of ZyUX-000.
2. Constitutional terminology audit.
3. Ratify or revise the Series architecture.
4. Draft `ZyUX-001`.
5. Draft `ZyUX-002`.
6. Draft `ZyUX-003`.
7. Draft `ZyUX-004`.
8. Draft `ZyUX-005`.
9. Draft `ZyUX-006`.
10. Draft BABY-stage archetype profiles in priority order.
11. Use ZyUX to inform M09, M10, and M11 preparation without reopening closed constitutional semantics.

---

**End of `ZyUX-000 v0.1 — DRAFT FOR CHAIR REVIEW`**

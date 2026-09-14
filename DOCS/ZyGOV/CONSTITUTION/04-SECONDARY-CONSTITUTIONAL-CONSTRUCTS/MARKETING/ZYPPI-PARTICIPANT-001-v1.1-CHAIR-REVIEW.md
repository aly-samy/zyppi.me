# ZYPPI-PARTICIPANT-001

## Subject, Identity, Participation, Relationship, Authority & Experience Model

**Canonical ID:** `ZYPPI-PARTICIPANT-001`  
**Version:** 1.1  
**Status:** DRAFT — CHAIR REVIEW  
**Classification:** Foundation — Product / UX / Identity / Participation  
**Normative Level:** Principle / Product-Architecture Doctrine  
**Date:** 5 September 2026  
**Governing Authority:** NORTH STAR v7.0  
**Coordinates With:** What is Zyppi? v4.0 · Z-PROF-001 v1.2 · ZYAPI v1.1 · MARKET-REALITY-001 · Marketing-PLAN-1Y-001 · Marketing-PLAN-3Y-001 · ZYPPI-REALITY-VALIDATION-001  
**Applies To:** Product · Identity & Access · UX/UI · Marketing · Developer Platform · MCP/Agent Access · Host-Native Adoption

---

# 0. Status Note

This document is a revised Council synthesis prepared for Chair review.

It consolidates the participant, identity, account, delegation, scope, UX, enterprise-IAM, and market-adoption conclusions developed during Council discussion.

It is **not yet ratified**.

Nothing in this document:

- creates a sixth Reality primitive;
- replaces Subject, Object, Place, Event, or Evidence;
- replaces ZRM identity semantics;
- replaces enterprise identity providers;
- grants new constitutional Authority;
- creates a new legal doctrine;
- authorizes a new market domain;
- authorizes implementation;
- overrides NORTH STAR, Z-PROF, RI, Evidence, Authority, Standing, Policy, Trust, Security, Registry Truth, or Receipt doctrine.

Where this document discusses privacy, succession, death, retention, identity evidence, or enterprise access, those provisions remain product-architecture principles unless and until the relevant legal, security, constitutional, and engineering authorities close the unresolved questions.

---

# 1. Purpose

Zyppi must work across radically different forms of participation without forcing Reality into a conventional SaaS account model.

The same platform may eventually interact with a person using Zyppi personally, an employee acting for multiple organizations, a freelancer, a sole trader, a multinational company, a logistics provider, a government authority, an auditor, a veterinarian, a farmer, a retailer, a shopper, an AI agent, an autonomous system, an identified animal, a serialized product, a vehicle, a machine, a property, a place, or an Evidence record.

These are not all the same kind of thing.

They do not all need accounts.

They do not all hold Authority.

They do not all interact through the same interface.

This document establishes a universal product and experience model that keeps these distinctions intact.

The governing UX question is:

> **What does this Subject need Zyppi to know, show, decide, let them control, and prove — in this context, under this relationship and Authority — while hiding everything else?**

The governing identity question is:

> **What real-world constituent is this, what Identity legitimately refers to it, and what Evidence supports that equivalence?**

The governing access question is:

> **What may this authenticated Subject legitimately see or do here and now?**

---

# 2. Constitutional Boundary: Subject, Participant, User, Account, and Identity

## 2.1 Subject Remains the Constitutional Term

`Participant` is a product and experience term.

It is **not** a new Reality primitive.

For product/UX purposes:

- **Subject** means a constitutional actor or autonomous constituent capable of originating or participating in action according to governing ontology.
- **Participant** means a Subject currently participating in a Zyppi relationship, interaction, or governed process.
- **User** means a human or software Subject directly operating a Zyppi interface.
- **Account** means an access construct through which a Subject authenticates or is represented in a particular access context.
- **Identity** means the governed identity relationship or representation that refers to a Reality constituent according to the applicable constitutional model.

Therefore:

```text
SUBJECT
constitutional actor / autonomous constituent
        ↓ when engaged in a Zyppi interaction
PARTICIPANT
product / interaction role
        ↓ when directly operating an interface
USER
human/software operator
        ↓ authenticates through
ACCOUNT / AUTHENTICATION CONTEXT
```

These categories SHALL NOT be collapsed.

## 2.2 Identity Is Not Limited to Users

Not everything with Identity has an account.

| Reality Constituent | Illustrative Classification | Identity May Exist? | Account Required? |
|---|---|---:|---:|
| Ahmed | Subject | Yes | May have access contexts |
| Company X | Subject / organization under governing ontology | Yes | No human-style account required |
| Mimi the cat | Subject where governing ontology treats animals as Subject | Yes | No |
| Lemon Tree #344 | Subject where governing ontology treats plants as Subject | Yes | No |
| Autonomous AI Agent | Subject | Yes | Machine access may exist |
| Car | Object | Yes | No |
| Product Unit #882 | Object | Yes | No |
| Camera | Object unless constitutionally autonomous | Yes | No |
| Apartment / warehouse zone | Place and/or Object depending represented aspect | Yes where needed | No |
| Evidence record | Evidence | Yes where governed/needed | No |

This table is illustrative and SHALL NOT force Identity onto every constituent of Reality.

> **Everything Zyppi can identify does not need an account. Everything with an account is not a separate Identity.**

---

# 3. Canonical Identity Doctrine

## 3.1 One Referent, One Canonical Identity Where Sufficiently Established

Zyppi SHALL seek canonical identity uniqueness.

Where sufficient Evidence establishes that two identity records refer to the same real-world referent, Zyppi SHALL converge toward one canonical Identity representation rather than knowingly preserve duplicate canonical identities for the same referent.

This SHALL NOT be implemented as blind account merging.

Three distinct operations remain separate:

1. **Identity Resolution** — determine whether records refer to the same referent: `SAME`, `DIFFERENT`, `UNRESOLVED`, or `CONFLICTING`.
2. **Identity Consolidation** — reconcile legitimately equivalent identity records while preserving provenance.
3. **Account / Credential Linking** — associate authentication contexts with the canonical Identity.

No silent guessing.

## 3.2 Canonical Does Not Mean Centralized Dossier

Canonical Identity is a semantic property.

It does **not** require:

- one physical database row containing all related data;
- universal visibility across relationships;
- universal retention;
- common disclosure;
- one tenant owning all associated information;
- one credential;
- one login provider;
- one organization controlling the Subject.

> **Canonical identity SHALL NOT require co-location, universal visibility, or common retention of all data associated with that Identity.**

Relationship-scoped, source-scoped, jurisdiction-scoped, or authority-scoped information may remain independently governed while still referring to the same canonical Subject or referent.

## 3.3 Evidence-Based Identity

Identity convergence must be Evidence-governed.

Potential signals may include, where lawful and appropriate:

- verified mobile number;
- verified email;
- enterprise SSO assertion;
- national identifier;
- passport identifier;
- organization-issued identifier;
- registry identifier;
- microchip identifier;
- serial number;
- device credential;
- other governed Evidence.

No single signal is universally sufficient.

> **Identity resolution SHALL evaluate Evidence under governed rules rather than treating field equality as automatic equivalence.**

## 3.4 Identity Resolution Does Not Grant Disclosure

Evidence used to establish identity SHALL NOT automatically become visible to every party related to that Identity.

Therefore:

> **Identity resolution and Evidence disclosure are separate authorities.**

---

# 4. Authentication & Account Doctrine

## 4.1 Account Is an Access Construct

A Subject may authenticate through multiple independent methods:

```text
Google
Microsoft
Enterprise SSO
Mobile
Passkey
Government credential
Future authorized methods
```

All may legitimately refer to the same canonical Subject.

Credentials rotate.

Identity persists.

## 4.2 Authentication Independence

> **Adding, rotating, suspending, or revoking an authentication method SHALL NOT create, erase, or replace canonical Identity.**

Example:

```text
Ahmed Identity
├── Gmail ✓
├── Mobile ✓
└── Company A SSO ✓
```

After termination:

```text
Ahmed Identity
├── Gmail ✓
├── Mobile ✓
└── Company A SSO REVOKED
```

Ahmed remains Ahmed.

## 4.3 Existing Enterprise IAM Must Be Respected

Zyppi SHALL NOT require an enterprise to abandon or replace its existing identity provider merely to participate in Zyppi.

Enterprise authentication MAY use existing systems such as Entra ID, Okta, Ping, SAML/OIDC-compatible IdPs, enterprise-issued credentials, or future authorized systems.

Conceptually:

```text
Enterprise IdP
      ↓
authenticates Subject
      ↓
Zyppi resolves/matches Subject as permitted
      ↓
organizational relationship
      ↓
Standing / delegated Authority
      ↓
available capabilities
```

> **Keep the enterprise IdP. Zyppi governs scoped relationship, Standing, Authority, and accountable action around it.**

Zyppi SHALL NOT position itself as a required replacement for enterprise IAM.

---

# 5. Scope Sovereignty

## 5.1 Organizational Scope Sovereignty

> **An organization retains governance over its organizational scope without owning the canonical Identity of the Subjects who participate within that scope.**

The organization governs its:

- organizational data;
- source connections;
- organization-issued credentials;
- roles and relationships;
- organizational Standing;
- delegations;
- policies;
- disclosure;
- execution;
- applicable retention and audit obligations.

It does not automatically govern the Subject's unrelated personal relationships, other employers, other assets, unrelated Evidence, unrelated authentication methods, or unrelated activity.

## 5.2 Bidirectional Scope Isolation

Company A may see Ahmed **within Company A context**.

It SHALL NOT automatically see Ahmed's cat, second employer, freelance clients, personal assets, unrelated receipts, or unrelated authentication methods.

Ahmed may see only:

```text
Company A
∩ Ahmed's legitimate relationship
∩ Ahmed's delegated scope
∩ applicable disclosure policy
```

He SHALL NOT automatically see all Company A information.

## 5.3 Relationship Metadata Privacy

Unrelated relationship metadata SHOULD itself remain undisclosed.

Company A should not automatically learn that Ahmed has other employers, pets, or freelance relationships.

> **Unrelated context SHOULD ordinarily be non-discoverable, not merely inaccessible.**

---

# 6. Relationship, Role, Authority, Standing, and Ownership

These concepts remain distinct:

- **Relationship** — how one constituent is connected to another.
- **Role** — the capacity in which a Subject acts.
- **Authority** — what a Subject or organization is empowered to establish, approve, delegate, or cause.
- **Standing** — whether the Subject is currently eligible to exercise relevant Authority.
- **Ownership** — property or economic interest where recognized.

> **Ownership ≠ Authority ≠ Standing ≠ Role ≠ Identity.**

Role alone SHALL NOT imply Authority.

Ownership SHALL NOT be treated as automatic operational Authority.

---

# 7. Federated Delegation Doctrine

## 7.1 Delegation Is a Graph, Not a Fixed Org Chart

Zyppi SHALL NOT assume a universal:

```text
Organization
→ Department
→ Manager
→ Employee
```

Authority may flow through many shapes:

```text
Government → Company → Contractor
Manufacturer → Logistics Provider → Driver
Individual → Freelancer
Sole Trader → Self
Consortium → multiple independent parties
```

## 7.2 Delegation Law

> **A Subject or organization may exercise only Authority legitimately held or delegated to it, and may re-delegate only the bounded subset it is itself permitted to delegate.**

A delegation may express:

- delegator;
- delegate;
- capability;
- scope;
- valid-from;
- valid-until;
- conditions;
- re-delegable yes/no;
- source of Authority;
- revocation status;
- provenance;
- Receipt reference where applicable.

## 7.3 No Universal Human Superuser

Even a sole business owner SHOULD NOT constitutionally be modeled as a magical account bypassing all governance.

The UX may make the owner feel like they can manage everything, but under the hood their access remains explicit and accountable.

---

# 8. Temporal Organization & Historical Attribution

Departments may be created, merged, split, renamed, moved, or dissolved.

Leadership may change.

Organizations may merge, acquire, spin out, reorganize, or dissolve.

Current structure SHALL NOT rewrite historical structure.

When auditing a past action, Zyppi must ask:

> **Who acted, in what capacity, under what Authority and Standing, at the relevant valid time?**

Not:

> "Is that person authorized today?"

> **What a Subject did may remain permanently attributable to that Subject, while what the Subject may still view remains governed separately by current disclosure, retention, and legal authority.**

---

# 9. Termination, Revocation, and Offboarding

When a relationship ends:

```text
relationship ends
        ↓
current Standing changes
        ↓
future delegation revoked or expires
        ↓
future capability disappears
```

This SHALL NOT erase valid historical actions.

Ahmed leaving Company A may revoke Company A SSO, Company A visibility, and Company A delegated capabilities while leaving intact:

- Ahmed's canonical Identity;
- personal relationships;
- other employers;
- freelance relationships;
- personal authentication;
- historical attribution.

Company A retains its lawful organizational records and the fact that Ahmed performed actions under Company A Authority at the relevant time.

---

# 10. Life-State and Succession

## 10.1 Death Is Not Identity Deletion

A Subject's death SHALL NOT delete historical Identity.

Where governed Evidence sufficiently establishes death or another legal life-state transition:

```text
canonical Identity remains
active participation changes
authentication may suspend
Standing changes
delegations terminate/review
succession may begin for inheritable relationships
history remains
```

## 10.2 Evidence Before Life-State Change

A life-state transition SHALL NOT be established by a casual click.

Required Evidence and Authority remain an open legal and product-design question.

## 10.3 Non-Inheritance of Delegated Authority

Property or economic interest may be inheritable according to applicable law.

Employment, office, signing, managerial, or delegated operational Authority SHALL NOT automatically transfer to heirs.

```text
shares → may enter succession
CEO authority → terminates unless re-established
```

## 10.4 Jurisdiction Sensitivity

This document does not establish universal inheritance law.

The architecture must be capable of representing pending, disputed, inherited, extinguished, or newly granted relationships and Authority.

---

# 11. Experience Doctrine

## 11.1 Invisible Complexity

> **The interface SHALL absorb constitutional complexity rather than transfer it to the user.**

Users interact with familiar Jobs, understandable actions, relevant information, clear reasons, and appropriate proof.

## 11.2 Contextual Capability Disclosure

> **A Subject SHALL ordinarily see only the capabilities, controls, settings, and information relevant to the current Job, relationship, Standing, and Authority.**

Unavailable actions SHOULD ordinarily be invisible rather than shown as a large field of disabled controls.

## 11.3 No Deep Permanent Menu as Default

Zyppi SHOULD NOT expose every module and setting to every user.

The preferred experience is object/context-first and action-first.

```text
Bruno
Shipment 8831
Company X
Lemon Tree #344
Product #095...
Camera #22
```

Selecting context reveals legitimate actions.

## 11.4 Progressive Explanation

Where applicable:

1. **Action** — Release / Hold / Review
2. **Reason** — why
3. **Basis** — Evidence / policy / time
4. **Proof** — provenance / Receipt

Most users should not need full proof depth to complete ordinary work.

---

# 12. Onboarding & Account Creation

## 12.1 Frictionless Entry

Target:

```text
Sign up / Log in
        ↓
Create
Join
Claim
Accept invitation
Continue from scan
```

No universal department wizard, industry questionnaire, module selector, or dashboard configuration.

Only request what is necessary for the current relationship.

## 12.2 Context-Driven Onboarding

Enterprise:

```text
Company X invited you
Finance / Accountant
[Continue with Company SSO]
```

Personal:

```text
[Continue with Google]
[Continue with mobile]
```

Claim:

```text
Mimi
This animal has a Zyppi Identity.
[Claim relationship]
[Report found]
[View public information]
```

## 12.3 Minimum Necessary Onboarding

> **Zyppi SHOULD NOT ask the user to configure structures that can already be derived from a legitimate invitation, identity relationship, claim, source mapping, or delegated Authority.**

---

# 13. Delegation UX

Human-facing delegation should ask:

```text
Who?
What can they do?
For what?
For how long?
Can they delegate further?
```

Underneath, Zyppi may create a rigorously governed delegation.

The user should not need to understand the internal graph unless deeper control is required.

---

# 14. Enterprise IAM & Security Positioning

## 14.1 What Zyppi Must Not Sound Like

For enterprise buyers, Zyppi SHALL NOT be positioned as:

- a replacement employee directory;
- a consumer identity network imposed on staff;
- a social identity graph;
- an IAM replacement;
- a master profile co-mingling corporate and personal life;
- an enterprise data lake centered on employee identity.

## 14.2 Preferred Enterprise Position

> **Keep your IAM. Zyppi governs what authenticated actors are authorized to do, in what scope, under what Standing, with what Evidence, and with what auditable history.**

Possible enterprise-facing positioning concepts:

- Federated Authority Graph;
- Governed Authority Graph;
- Contextual Authority Engine;
- accountable decision infrastructure.

These are market/product descriptions, not replacements for internal constitutional vocabulary.

## 14.3 Scope Isolation Must Be Provable

Enterprise adoption will depend on proving that:

- personal relationships do not leak into enterprise scope;
- one employer cannot discover unrelated employers;
- corporate data does not become personally owned;
- offboarding revokes future access;
- historical attribution survives credential revocation;
- enterprise IdP sovereignty is respected;
- source ownership is preserved.

---

# 15. Single-Player Utility vs Federated Utility

The architecture may compound through federation.

The product SHALL NOT require federation to be useful on Day 1.

## 15.1 Single-Player Utility

Depending on application, immediate value may include:

- resolve a GS1 Digital Link;
- retrieve a governed answer;
- obtain Evidence references;
- retrieve a Receipt;
- register or claim an identified object;
- manage a scoped relationship;
- perform an authorized standalone Job.

## 15.2 Federated Utility

Additional participants may increase value through shared Evidence, delegated Authority, cross-organization workflows, reduced reconciliation, trusted handoffs, lifecycle continuity, and historical accountability.

> **Federation compounds value. It SHALL NOT be a prerequisite for Day-1 utility.**

Detailed activation and GTM strategy remain owned by the Marketing and Reality-validation doctrines.

---

# 16. ZYAPI & Agent Experience

This document does not redefine ZYAPI.

For the same governed capability:

```text
Human → Host-Native UI
Application → REST / SDK
AI Agent → MCP
```

The surface may differ.

Authority does not.

An agent SHALL NOT receive broader Authority merely because it is machine-operated.

A developer SHALL NOT need to understand the full participant/delegation architecture to invoke a narrow public capability.

> **Canonical underneath. Native on top. Explicit in between.**

---

# 17. Cross-Domain Stress Examples

These examples test universality. They are not automatically current GTM targets.

## 17.1 Ahmed — One Subject, Many Contexts

Ahmed has one canonical Identity.

He owns a cat, works at Company A, works at Company B, freelances for Company X, authenticates personally with Gmail/mobile, and authenticates corporately through Company A SSO.

Company A sees only Ahmed's Company A scope.

Ahmed sees only the Company A scope delegated to him.

When fired:

- Company A Standing ends;
- Company A delegation is revoked;
- Company A SSO is revoked;
- historical attribution remains;
- his cat remains;
- Company B remains;
- Company X remains;
- personal authentication remains.

Changing mobile does not change Identity.

Death changes life-state and active participation, not historical identity.

## 17.2 Individual + Animal

A person may claim a cat/dog Identity associated with an NFC chip.

Possible relationships: owner, veterinarian, walker, shelter, insurer, emergency observer.

The animal does not need an account.

## 17.3 Agriculture

A farmer may interact with farm, field, tree #344, harvest batch, or irrigation system.

Delegation may include worker treatment records, agronomist inspection, buyer provenance, and government inspection.

## 17.4 Company → Logistics Provider → Driver

Authority narrows at each hop.

A driver may accept custody, confirm pickup, record delivery, or report damage without gaining ownership or policy authority.

## 17.5 Government → Company

A regulator may hold an independent authority relationship to a company without becoming its administrator.

## 17.6 Individual → Individual

A car owner may delegate temporary, non-redelegable use to another Subject.

## 17.7 Freelancer

A freelancer may act as a one-person economic actor without enterprise-admin burden.

## 17.8 Retail Observer / Customer

A public observer may see public product information.

After purchase/registration, new capabilities such as warranty, service, claim, or transfer may appear.

## 17.9 Device Manufacturer

A camera manufacturer may eventually manage model, firmware, device identity, certification, provisioning, customer claim, and service relationships.

This is a stress case only; it does not authorize ZyPub, ZRB, or ZPIF implementation.

---

# 18. Internal Universality vs GTM Containment

> **Universal architecture does not authorize universal marketing.**

Internal examples may include pets, agriculture, government, logistics, freelancers, devices, retail, and AI agents.

Current external GTM remains governed by the active market plan.

For the BABY horizon, commerce / GS1 remains the entry wedge unless separately changed by Chair-authorized strategy.

B2B marketing SHOULD use B2B-relevant examples.

Consumer/personal examples SHOULD NOT be used in enterprise messaging merely because the architecture supports them.

---

# 19. Persona / Interaction Archetypes

The universal model sits beneath marketing and UX personas.

| Archetype | Core Job | Typical Surface |
|---|---|---|
| Technical Implementer | Integrate a reliable capability quickly | SDK / API / docs |
| Operational User | Know what to do with an item/case | Host-Native UI |
| Governance / Compliance | Ensure decisions follow rules and remain defensible | Governance / Host-Native |
| Host / System Owner | Control what Zyppi reads/writes and under what authority | Existing host + connection controls |
| Organizational Administrator | Govern access, sources, delegation, and configuration | Zyppi control plane |
| Economic Buyer / Executive | Understand risk, adoption, and value | Reports / summaries |
| Auditor / External Authority | Reconstruct what happened within lawful scope | Audit / Receipt view |
| AI Agent / Application | Discover and invoke authorized capability | MCP / API |
| Public Observer | Obtain public information without account friction | Public resolution surface |

---

# 20. Control Taxonomy

Potential control families:

1. Identity & Access
2. Source Connection
3. Authority & Standing
4. Policy
5. Evidence
6. Execution
7. Exception & Override
8. Privacy & Disclosure
9. Audit & Proof
10. Delegation & Re-delegation
11. Recovery
12. Organization / Relationship Administration

A control must be justified by:

```text
current Subject
+
relationship
+
current Standing
+
delegated Authority
+
applicable policy
+
current Job/context
```

---

# 21. Visibility / Capability Derivation

A useful product abstraction is:

```text
VISIBLE EXPERIENCE
=
Subject
∩ Relationship
∩ Current Standing
∩ Delegated Authority
∩ Applicable Policy
∩ Disclosure Scope
∩ Current Context
```

This is conceptual, not a literal implementation mandate.

> **The platform should derive the smallest useful legitimate experience from current context instead of exposing the whole system and asking the user to self-filter.**

---

# 22. Recovery

"No master key" creates a real recovery problem.

Recovery must not be solved by creating an invisible universal Zyppi super-admin capable of assuming any identity.

Potential mechanisms may include secondary verified authentication, multiple organization admins, enterprise IdP recovery, verified ownership recovery, quorum, time-delayed recovery, emergency recovery under explicit policy, or evidence-based identity recovery.

A sole trader and a bank need not share the same recovery profile.

**Status:** OPEN DESIGN QUESTION.

---

# 23. Privacy, Retention, and Right-to-Erasure

This document recognizes a material unresolved tension between personal privacy rights, enterprise retention obligations, immutable historical attribution, Receipt integrity, legal discovery, and jurisdictional erasure rights.

The architecture may need to distinguish:

- canonical Identity reference;
- directly identifying personal data;
- authentication credentials;
- relationship metadata;
- enterprise records;
- Evidence;
- Receipt attribution;
- pseudonymized historical references;
- legally required retention.

This document does NOT establish the legal answer.

> **Historical accountability does not authorize unnecessary perpetual disclosure of personal data.**

**Status:** REQUIRES LEGAL / PRIVACY DOCTRINE.

---

# 24. Enterprise Offboarding and Personal Access

If a Subject has only ever authenticated through enterprise SSO and that SSO is revoked:

- canonical Identity remains;
- organizational access ends;
- unrelated personal access does not automatically appear;
- the former employee does not automatically receive a new personal credential;
- later personal access, if legitimately required, must use a governed identity-recovery or linking process.

**Status:** PRODUCT / SECURITY DESIGN TO CLOSE.

---

# 25. Adoption Doctrine

## 25.1 Architecture Is Not Positioning

Internal architecture may say:

> one canonical Subject identity.

Enterprise positioning may say:

> **Keep your IdP. Zyppi preserves scoped Authority, accountable action, and historical attribution across organizational change.**

Consumer UX may simply say:

> Sign in and continue.

Different explanations may project the same governed architecture to different audiences.

## 25.2 Engine vs Vehicle

The participant/authority model is the internal product engine.

The market wedge is the acquisition vehicle.

They SHALL NOT be confused.

---

# 26. Drift Prohibitions

This document SHALL NOT be interpreted as authorizing:

- a universal consumer social identity network;
- a replacement for enterprise IdPs;
- one centralized personal dossier;
- employer access to unrelated personal context;
- personal access to unrelated employer data;
- universal cross-scope discovery;
- automatic identity merge from one matching field;
- inherited corporate Authority;
- a permanent human superuser;
- federation as a Day-1 dependency;
- enterprise marketing around unrelated consumer examples;
- a generic workflow platform;
- an ERP replacement;
- a sixth Reality primitive named Participant;
- implementation of new domains merely because examples appear here.

---

# 27. Ratification Questions

Before ratification, Council should close or disposition:

1. Whether `ZYPPI-PARTICIPANT-001` remains the correct title given that Participant is product-level rather than constitutional ontology.
2. Exact mapping to latest ratified Subject / Object / Place / Event / Evidence definitions.
3. Minimum Evidence requirements for identity convergence.
4. Identity consolidation under conflicting Evidence.
5. Data architecture supporting canonical Identity without centralized dossier creation.
6. Scope-isolation enforcement.
7. Enterprise IdP integration and offboarding.
8. Recovery for sole owners and high-sensitivity organizations.
9. Relationship metadata privacy.
10. Historical attribution versus personal-data erasure.
11. Succession handling and jurisdictional variation.
12. Former-participant historical visibility.
13. Machine / autonomous Subject access.
14. Public observer → authenticated owner/holder transition.
15. UX proof that Contextual Capability Disclosure does not hide necessary governance controls.

---

# 28. Proposed Governing Laws

### P-01 — Subject Before Account
> **A Subject is not their account, employer, role, credential, relationship, ownership, or current Authority.**

### P-02 — Canonical Identity
> **Where sufficient Evidence establishes referent equivalence, Zyppi SHALL converge toward one canonical Identity representation rather than knowingly preserve duplicate canonical identities for the same referent.**

### P-03 — No Identity Guessing
> **Identity equivalence SHALL NOT be silently inferred where Evidence is insufficient or conflicting.**

### P-04 — Authentication Independence
> **Credentials may change without changing canonical Identity.**

### P-05 — Scope Sovereignty
> **Every organization governs its legitimate organizational scope without owning the canonical Identity of the Subjects who participate within it.**

### P-06 — Bidirectional Scope Isolation
> **A relationship exposes only the information, controls, and capabilities legitimately within its scope, in both directions.**

### P-07 — Delegation Conservation
> **A participant may delegate only Authority it legitimately holds and is permitted to delegate, and only within bounded scope.**

### P-08 — Authority Discontinuity
> **Identity may persist while Authority, Standing, roles, and relationships begin, change, expire, or terminate.**

### P-09 — Historical Integrity
> **Current organizational change SHALL NOT rewrite historical attribution.**

### P-10 — Non-Inheritance of Delegated Authority
> **Inheritable property or economic rights do not automatically transfer personal, office, employment, or delegated Authority.**

### P-11 — Contextual Capability Disclosure
> **Zyppi SHOULD expose only the controls and information relevant to the Subject's current Job, relationship, Standing, Authority, and context.**

### P-12 — Invisible Complexity
> **Constitutional rigor belongs underneath the experience; the user receives understandable Jobs, actions, reasons, and proof.**

### P-13 — Existing IAM Coexistence
> **Zyppi SHALL integrate with legitimate enterprise IAM rather than require replacement merely to participate.**

### P-14 — Canonical Does Not Mean Co-Mingled
> **Canonical Identity SHALL NOT imply universal data co-location, visibility, retention, or disclosure.**

### P-15 — Federation Is Additive
> **Federation may compound value but SHALL NOT be required for legitimate Day-1 utility.**

### P-16 — Universal Architecture, Narrow GTM
> **Architectural applicability across domains SHALL NOT authorize simultaneous market expansion across those domains.**

---

# 29. Final Product Thesis

The desired Zyppi experience is:

```text
Sign in / arrive through context
        ↓
Zyppi establishes or resolves who/what is involved
        ↓
relevant relationship is known or established
        ↓
current Standing and Authority are determined
        ↓
only legitimate capabilities appear
        ↓
Subject acts
        ↓
Evidence / provenance / Receipt remain available as required
```

The visible experience should feel simple.

The underlying system may be deeply federated, temporal, Evidence-governed, policy-governed, and auditable.

That complexity is the platform's responsibility.

---

# 30. Closing Doctrine

> **One Reality constituent may have one canonical Identity without having an account.**

> **One Subject may have many relationships, roles, credentials, employers, devices, assets, and chapters of history without becoming many Subjects.**

> **Organizations govern their scope. They do not own the human being.**

> **Subjects retain Identity. Authority is contextual, bounded, delegable only where permitted, and revocable.**

> **Credentials expire. Roles change. Departments merge. Leaders leave. People die. Historical Reality must not be rewritten.**

> **Canonical does not mean centralized. Federated does not mean visible to everyone.**

> **The UI shows the user the smallest useful legitimate surface for the Job at hand.**

> **Easy in front. Deep, governed, and auditable underneath.**

---

# 31. Status & Proposed Next Step

**Current Status:** DRAFT — CHAIR REVIEW.

Recommended review sequence:

1. Chair review of terminology and governing laws.
2. Constitutional mapping against latest ratified ZRM / Subject / Identity authorities.
3. Security and privacy threat review.
4. Enterprise IAM coexistence review.
5. Legal review of succession, retention, erasure, and death-state implications.
6. UX stress test across Ahmed and at least three non-commerce domains.
7. ZYAPI compatibility review.
8. Marketing review preserving current GTM containment.
9. Engineering feasibility review.
10. Council disposition and ratification decision.

---

**End of `ZYPPI-PARTICIPANT-001 v1.1 — DRAFT FOR CHAIR REVIEW`**

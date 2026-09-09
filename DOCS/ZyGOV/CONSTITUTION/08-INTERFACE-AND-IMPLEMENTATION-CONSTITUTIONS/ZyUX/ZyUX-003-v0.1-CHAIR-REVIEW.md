# ZyUX-003 — Contextual Navigation & Capability Disclosure

**Canonical ID:** `ZyUX-003`  
**Version:** 0.1  
**Status:** DRAFT — CHAIR REVIEW  
**Series:** ZyUX — Zyppi Experience Architecture  
**Classification:** Horizontal Experience Doctrine  
**Normative Level:** Experience Doctrine / Product Architecture  
**Date:** 6 September 2026  
**Parent Authority:** `ZyUX-000 — Zyppi Experience Architecture & Master Doctrine`  
**Coordinates With:** `ZyUX-001 — Identity, Account & Entry Experience` · `ZyUX-002 — Organization, Relationship, Scope & Delegation Experience` · NORTH STAR v7.0 · What is Zyppi? v4.0 · ZYAPI v1.1 · applicable Authority · Standing · Policy · Evidence · Trust · Security · Host-Native doctrine  
**Primary Source Corpus:** ZyUX-000 contextual-capability doctrine · ZyUX-001 context-selection doctrine · ZyUX-002 scope/delegation doctrine · Council discussion on “no deep menu,” invisible complexity, multi-context identity, and cross-domain experience  
**Applies To:** Navigation · Landing surfaces · Context switching · Context headers · Action disclosure · Capability discovery · Work queues · Search · Home surfaces · Object/Subject views · Deep links · Cross-context safety · Administrative navigation · Host-Native projections

---

# 0. Status & Intent

`ZyUX-003` governs how Zyppi decides:

- where a Subject lands;
- what the current context is;
- what information appears;
- which capabilities are shown;
- which capabilities remain hidden;
- when a user may request access;
- how actions are grouped;
- how a user switches context;
- how search is scoped;
- how pending work is surfaced;
- when a global control plane is appropriate;
- how to avoid deep permanent menus without hiding legitimate work.

This document governs **experience**.

It does not redefine constitutional Capability, Authority, Standing, Policy, Identity, Evidence, Trust, Registry Truth, Runtime, or Receipt semantics.

It SHALL NOT be interpreted as authorizing:

- capability-by-UI logic that bypasses governed Authority;
- permanent navigation trees as the semantic source of truth;
- hidden controls that prevent legitimate work;
- disclosure of capabilities whose existence is itself sensitive;
- cross-scope search leakage;
- global dashboards containing every relationship;
- context switching that silently changes acting capacity;
- “disabled button = authorization model”;
- host-specific semantic divergence;
- one navigation architecture for every archetype.

The governing proposition is:

> **The user should not navigate Zyppi's complexity. Zyppi should derive the smallest useful legitimate surface for the Job at hand.**

---

# 1. Purpose

Traditional software often expresses product architecture as navigation:

```text
Home
Products
Orders
Users
Permissions
Reports
Evidence
Policy
Settings
Billing
Developers
...
```

As the product grows, navigation grows.

The user becomes responsible for understanding:

- where a function lives;
- which module owns it;
- which menu applies;
- which role unlocks it;
- which dashboard contains it.

Zyppi cannot scale that way.

Zyppi may eventually span:

- products;
- animals;
- farms;
- shipments;
- warranties;
- devices;
- organizations;
- regulators;
- Evidence;
- delegated Authority;
- AI agents;
- future domains.

A permanent menu representing every supported capability would eventually become the architecture itself.

`ZyUX-003` therefore establishes a different model:

```text
ARRIVAL
        ↓
CURRENT CONTEXT
        ↓
LEGITIMATE INFORMATION
        ↓
AVAILABLE / REQUESTABLE CAPABILITIES
        ↓
CURRENT ACTION
        ↓
RESULT / NEXT CONTEXT
```

Navigation supports the Job.

It does not define the Job.

---

# 2. Core Experience Model

The visible experience is derived from:

```text
SUBJECT
∩ RELATIONSHIP
∩ CURRENT STANDING
∩ DELEGATED AUTHORITY
∩ APPLICABLE POLICY
∩ DISCLOSURE SCOPE
∩ CURRENT CONTEXT
∩ INTERFACE / HOST
=
VISIBLE EXPERIENCE
```

This is a conceptual product abstraction.

It SHALL NOT be treated as a replacement for underlying authorization logic.

The UX reads governed outcomes.

It does not invent them.

---

# 3. Core Terms for ZyUX-003

## 3.1 Experience Context

The current bounded situation that determines what is useful now.

An Experience Context may include:

- a Subject;
- Object;
- Place;
- Event;
- Evidence set;
- organization;
- relationship;
- Job;
- workflow stage;
- host;
- application;
- current acting capacity.

Examples:

```text
Shipment #882
Company A / Finance
Mimi
Product #095...
Tree #344
Warranty claim #77
Alexandria Warehouse
```

`Context` is an experience concept here, not a new Reality primitive.

---

## 3.2 Context Anchor

The primary constituent or governed relationship around which the current surface is organized.

Examples:

```text
Object → Shipment #882
Subject → Mimi
Organization → Company A
Place → Alexandria Warehouse
Event → Recall #22
```

A context may contain several constituents, but the user should ordinarily understand what the current anchor is.

---

## 3.3 Capability

A governed Zyppi ability available through an authorized surface.

Examples:

```text
View
Resolve
Review
Approve
Hold
Delegate
Submit Evidence
Request service
Transfer ownership
Generate Receipt
```

ZyUX does not define the capability's semantics.

---

## 3.4 Affordance

The visible UX control or interaction through which a capability may be invoked.

Examples:

```text
[Approve]
[Report damage]
[Claim ownership]
[Share access]
```

Affordance ≠ Capability.

A capability may exist without being visible to the current Subject.

---

## 3.5 Discoverability

Whether the Subject may legitimately learn that a capability exists.

This is distinct from whether the Subject may exercise it.

---

## 3.6 Availability

Whether the Subject may currently invoke the capability under applicable Authority, Standing, Policy, and context.

---

## 3.7 Requestability

Whether the Subject may legitimately request access, approval, delegation, or escalation for a capability they cannot currently invoke.

---

# 4. Capability Disclosure Classes

The earlier principle:

> “Unavailable Authority should ordinarily be invisible.”

requires refinement.

Not all unavailable capabilities should be treated identically.

ZyUX-003 defines three product-level disclosure classes.

## 4.1 Available

The Subject may currently use the capability.

UX:

```text
[Approve]
```

or equivalent.

---

## 4.2 Requestable

The Subject may not currently use the capability, but the capability's existence may legitimately be disclosed and there is a valid path to request or escalate.

UX may show:

```text
Approval required
[Request approval]
```

or:

```text
You don't currently have access.
[Request access]
```

where policy permits.

---

## 4.3 Non-Disclosable

The Subject is not authorized to know that the capability, data, relationship, or control exists.

UX SHALL NOT expose:

- disabled control;
- tooltip;
- count;
- search result;
- permission name;
- navigation item;
- metadata hint.

Non-disclosure is stronger than disabled access.

---

# 5. Primary ZyUX-003 Laws

## ZyUX-003-L01 — Context Before Menu

> **The current Job and context SHALL ordinarily determine the visible experience before permanent navigation categories do.**

---

## ZyUX-003-L02 — Capability Disclosure Is Governed

> **A capability's visibility SHALL derive from legitimate disclosure, Authority, Standing, policy, and context — not merely from product availability.**

---

## ZyUX-003-L03 — Available, Requestable, and Non-Disclosable Are Different

> **Zyppi SHALL NOT reduce all unavailable capability to a disabled button.**

---

## ZyUX-003-L04 — Disabled Controls Are Exceptional

> **A disabled control SHOULD be used only where seeing the capability itself is useful and legitimate, and where the disabled state communicates meaningful current condition rather than permanent lack of Authority.**

Example:

```text
[Approve] disabled
Reason: Waiting for required Evidence
```

may be useful.

But:

```text
[Change global security policy] disabled
```

for a warehouse worker is unnecessary and potentially harmful.

---

## ZyUX-003-L05 — Entry Intent Is Preserved

> **After authentication, authorization, or recovery, Zyppi SHOULD return the Subject to the initiating context and intended Job whenever legitimate.**

---

## ZyUX-003-L06 — Current Acting Capacity Must Be Knowable

> **Where a Subject may act under multiple relationships or organizations, the experience SHALL make the current acting capacity understandable whenever confusion could affect meaning or consequence.**

---

## ZyUX-003-L07 — Context Switch Must Not Silently Elevate Authority

> **Changing context SHALL NOT silently widen capability or change acting capacity without clear user comprehension where consequential.**

---

## ZyUX-003-L08 — Search Is Scope-Bounded

> **Search SHALL respect the same disclosure and scope boundaries as direct navigation.**

Search is not a bypass.

---

## ZyUX-003-L09 — Navigation Does Not Create Authorization

> **The presence or absence of a menu item SHALL NOT be the security boundary.**

Underlying Authority remains authoritative.

---

## ZyUX-003-L10 — No Deep Menu as Complexity Storage

> **Product complexity SHALL NOT be managed primarily by adding more permanent menu depth.**

---

## ZyUX-003-L11 — Home Is a Relevance Surface, Not a Module Index

> **A Zyppi home surface SHOULD prioritize relevant contexts, pending Jobs, recent work, and legitimate next actions rather than presenting every product area.**

---

## ZyUX-003-L12 — Work Should Come to the User

> **Where a Subject has a clear pending responsibility, Zyppi SHOULD surface the work directly rather than requiring the Subject to discover it through navigation.**

---

## ZyUX-003-L13 — Contextual Administration

> **Administrative controls SHOULD appear at the organization, relationship, object, source, or scope where they are meaningful, with a global control plane reserved for genuinely cross-context administration.**

---

## ZyUX-003-L14 — Progressive Navigation

> **The experience MAY reveal deeper navigation as the Subject's responsibilities deepen; users SHALL NOT need advanced structure to complete basic Jobs.**

---

## ZyUX-003-L15 — Host-Native Context Is First-Class

> **When the Job begins in an authorized host system, the host context SHOULD carry into the Zyppi experience rather than forcing the user to reconstruct it manually.**

---

## ZyUX-003-L16 — Semantic Parity Across Surfaces

> **Human UI, Host-Native extension, REST, SDK, and MCP may disclose capabilities differently, but SHALL preserve the same underlying governed capability meaning.**

---

# 6. Navigation Architecture

ZyUX-003 does not mandate a specific visual layout.

It establishes conceptual navigation layers.

## Layer 1 — Entry Context

Why did the Subject arrive?

Examples:

```text
Invitation
Shipment alert
Product scan
Direct link
Host action
Search
Notification
```

---

## Layer 2 — Current Context Anchor

What is the user working with?

```text
Shipment #882
Mimi
Company A
Product #095...
```

---

## Layer 3 — Relevant Information

What does the Subject need to know now?

---

## Layer 4 — Available / Requestable Actions

What can the Subject legitimately do next?

---

## Layer 5 — Related Context

What nearby legitimate contexts may matter?

Examples:

```text
Shipment → Evidence
Shipment → Supplier
Product → Warranty
Mimi → Vet
Company A → Delegations
```

---

## Layer 6 — Cross-Context Navigation

Only when needed:

```text
Personal
Company A
Company B
Company X
```

---

## Layer 7 — Control Plane

For genuinely broad administrative tasks.

The control plane is not the default experience for every Subject.

---

# 7. The Context Header

Where useful, a context surface SHOULD make the anchor clear.

Example:

```text
Shipment #882
Company A / Cairo Operations
Status: In transit
```

or:

```text
Mimi
Owner context
```

The context header may include:

- identity/name;
- relationship;
- acting organization;
- current state;
- scope;
- critical status.

It SHOULD NOT become a dense metadata block.

---

# 8. Acting-As Indicator

A Subject with one active context may not need a persistent indicator.

A Subject with multiple meaningful contexts may.

Example:

```text
Acting as:
Company A — Finance Reviewer
```

The indicator SHOULD become prominent before consequential action where wrong-context action is plausible.

---

# 9. Personal Context

`Personal` is an experience label, not a constitutional Identity type.

Use it only when it helps distinguish non-organizational participation from organizational contexts.

Example:

```text
Ahmed
├── Personal
├── Company A
└── Company B
```

Do not force a `Personal` container where the user's Job is already unambiguous.

---

# 10. Context Selection

## 10.1 Automatic Context Selection

Preferred when the entry path uniquely determines context.

Examples:

```text
Company A invoice link
→ Company A Finance
```

```text
Mimi NFC
→ Mimi
```

---

## 10.2 Manual Context Selection

Required when multiple legitimate contexts could apply.

Example:

```text
Product #882

Act as:
• Personal owner
• Company X service technician
```

---

## 10.3 No Arbitrary Default for Consequential Ambiguity

If choosing the wrong context changes:

- Authority;
- disclosure;
- legal meaning;
- data destination;
- Receipt attribution;

Zyppi SHOULD ask rather than guess.

---

# 11. Home Experience

A universal home surface may exist.

It SHOULD NOT be a catalog of modules.

Possible home content:

```text
Needs your attention
Recent contexts
Your organizations
Your identified things
Recent activity
Relevant alerts
```

The exact composition depends on archetype and Authority.

---

# 12. “Needs Your Attention”

This may become one of the most important universal surfaces.

Examples:

```text
3 shipments require review
1 delegation expires tomorrow
Warranty claim needs Evidence
Organization invitation pending
```

The surface should prioritize legitimate responsibility.

Not engagement for engagement's sake.

---

# 13. Recent Contexts

A useful shortcut may include:

```text
Shipment #882
Company A
Mimi
Product #095...
```

Recent does not override Authority.

If access ended, the context may disappear or move to historical view according to policy.

---

# 14. Favorites / Pinned Contexts

Users MAY pin frequently used contexts.

Pinning is a navigation preference.

It SHALL NOT preserve access after Standing ends.

---

# 15. Object / Subject-Centric Surface

When a user opens an identified constituent, the surface should answer:

```text
What is this?
What matters now?
What is my relationship?
What can I do?
What changed?
What proof is available?
```

Not:

```text
Which module should I open?
```

---

# 16. The Action Area

Primary actions SHOULD reflect:

- current Job;
- current state;
- Authority;
- urgency;
- likelihood;
- consequence.

Avoid presenting ten equal buttons where two actions are relevant.

---

# 17. Primary vs Secondary Actions

The interface MAY prioritize:

```text
Primary:
Resolve current Job

Secondary:
Related legitimate actions

More:
Rare / expert controls
```

This is presentation prioritization.

It does not change Authority.

---

# 18. “More” Menus

`More` is acceptable for low-frequency contextual actions.

It SHALL NOT become a dumping ground containing the entire platform.

---

# 19. Contextual Administration

Example:

```text
Shipment #882
[Manage access]
```

may be appropriate for an authorized administrator.

Likewise:

```text
Alexandria Warehouse
[Manage delegated access]
```

This can be better than:

```text
Settings → Security → Permissions → Warehouses → Alexandria → Users
```

---

# 20. Global Administration

A global control plane remains necessary for Jobs such as:

- organization-wide admins;
- IdP connection;
- source connection;
- global delegation review;
- security review;
- billing;
- organization settings;
- environment management.

The rule is not:

> “No global navigation.”

The rule is:

> **Use global navigation only for genuinely global Jobs.**

---

# 21. Menu Architecture

Where a permanent menu exists, it SHOULD reflect stable experience categories rather than every capability.

Possible examples for an organization administrator:

```text
Overview
People & Relationships
Sources
Policies
Security
Audit
Developer
```

This is illustrative.

The exact menu belongs to archetype/application design.

---

# 22. Menu Personalization by Authority

A menu may vary by Subject.

Example:

Warehouse operator:

```text
Work
Shipments
Exceptions
```

Compliance administrator:

```text
Reviews
Evidence
Policies
Audit
```

This is legitimate if both project the same governed system.

---

# 23. Stable Locations for High-Frequency Controls

Contextual disclosure does not mean controls should constantly move unpredictably.

High-frequency Jobs SHOULD have stable, learnable locations within their contexts.

The goal is:

```text
relevance + consistency
```

not novelty.

---

# 24. Navigation Memory

Zyppi MAY remember:

- recent context;
- preferred organization;
- pinned objects;
- open work.

Memory SHOULD NOT cause:

- automatic authority elevation;
- access after revocation;
- private context exposure on shared device;
- cross-context data leakage.

---

# 25. Deep Links

A deep link SHOULD carry enough context to return the user to the intended Job.

Example:

```text
/shipments/882/review
```

Conceptually.

After login:

```text
authenticate
→ validate relationship
→ restore legitimate context
→ review Shipment #882
```

Not:

```text
authenticate
→ generic home
```

---

# 26. Expired Deep Link

If the Subject no longer has access:

```text
This Company A access is no longer available.
```

The UX may offer legitimate alternatives.

It SHALL NOT reveal hidden information from the target.

---

# 27. Notifications as Navigation

A notification is an entry point.

It should contain:

- enough context to understand importance;
- no more sensitive information than the notification surface permits;
- a route to the legitimate Job.

Example:

```text
Company A
Shipment #882 needs review
[Open]
```

---

# 28. Notification Scope Safety

A locked-screen notification SHOULD NOT expose sensitive details merely because the user has access after authentication.

Notification content and in-app content may have different disclosure levels.

---

# 29. Search Doctrine

Search SHALL obey:

```text
Identity
Relationship
Standing
Authority
Disclosure
Context
```

Search is not “show everything, then block on click.”

Non-disclosable results should not appear.

---

# 30. Scoped Search

Example:

```text
Searching in:
Company A — Cairo Finance
```

Results derive from that scope.

---

# 31. Cross-Context Search

Cross-context search may exist for Subjects with legitimate multi-context need.

Example:

```text
Search all my accessible contexts
```

Results must:

- preserve scope;
- label context clearly;
- avoid leaking hidden relationship existence.

---

# 32. Search Result Context Labeling

A result SHOULD communicate its context where confusion is possible.

Example:

```text
Invoice #882
Company A / Egypt Finance
```

---

# 33. Search Zero State

If no result appears, Zyppi SHOULD avoid saying:

```text
This object exists but you don't have access.
```

unless existence is legitimately disclosable.

Prefer:

```text
No results available in this scope.
```

---

# 34. Capability Discovery

Capability discovery asks:

> “What can I do here?”

Zyppi SHOULD make this answer easy.

Possible forms:

- contextual actions;
- action menu;
- command palette;
- MCP capability listing;
- API introspection;
- Host-Native commands.

The form may differ.

The governed capability set should not.

---

# 35. Requestable Capability UX

When legitimate:

```text
You need Finance approval to release this shipment.

[Request approval]
```

This helps progression without exposing irrelevant permissions.

---

# 36. Access Request UX

When policy allows:

```text
You don't currently have access to review supplier Evidence.

[Request access]
```

The request should carry current context automatically.

The user should not need to explain which shipment/object they were viewing if Zyppi already knows.

---

# 37. Escalation UX

Escalation is not always access request.

Example:

```text
This decision requires Compliance review.

[Send to Compliance]
```

The user may never need the underlying capability.

---

# 38. Blocked-by-State vs Blocked-by-Authority

These must be distinguishable where useful.

### Blocked by state

```text
Approve unavailable
Waiting for required Evidence
```

### Blocked by Authority

```text
Approval must be completed by a Finance Approver
[Request approval]
```

Do not imply the same remedy.

---

# 39. Hidden Capability

Some actions must remain absent.

Example:

A warehouse operator should not see:

```text
Change organization security policy
```

No disabled button.

No tooltip.

No menu item.

---

# 40. Dangerous Capability Disclosure

The existence of some capabilities may itself reveal:

- investigation;
- legal hold;
- hidden relationship;
- security function;
- sensitive authority.

Non-disclosure rules apply.

---

# 41. Capability Ordering

Available actions may be ordered by:

- Job relevance;
- urgency;
- workflow state;
- consequence;
- frequency.

Do not order solely by product marketing priority.

---

# 42. Destructive / Consequential Actions

High-consequence actions should be visually and interactionally distinct.

They may require:

- context confirmation;
- reason;
- additional approval;
- stronger authentication;
- explicit confirmation;
- Evidence;
- Receipt.

The exact requirement belongs to governing policy/security.

---

# 43. Wrong-Context Prevention

Before consequential action:

```text
Approving as:
Ahmed
Company A — Finance Reviewer
```

may be shown.

If context is unambiguous and low risk, this may remain implicit.

---

# 44. Context Switch During Unsaved Work

If switching would discard or misattribute work:

```text
You have unsaved Company A changes.
```

The system should prevent accidental cross-context carryover.

---

# 45. Context-Specific Drafts

Draft data SHOULD remain associated with the context in which it was created.

A Company A draft should not silently appear in Company B.

---

# 46. Context-Specific Clipboard / Transfer Risk

Where sensitive operations allow copy/export/share, ZyUX should consider cross-context leakage.

UX may need warnings when moving data between contexts.

Detailed data-loss controls belong to Security.

---

# 47. Work Queues

For operational archetypes, work queues may be more useful than navigation.

Examples:

```text
Needs review
Assigned to me
Due today
Exceptions
Waiting for Evidence
```

Queues derive from legitimate scope.

---

# 48. “Assigned to Me”

`Me` refers to the current Subject in the current acting context.

A multi-organization user may need:

```text
Assigned to me — Company A
```

rather than one ambiguous global queue.

---

# 49. Shared Queues

Teams may have:

```text
Finance review queue
Warehouse exceptions
Compliance escalations
```

Visibility follows organizational scope/delegation.

---

# 50. Queue Does Not Imply Authority

An item may appear because the user should review it.

The presence of the item does not necessarily imply every action on it is available.

---

# 51. Empty States

Empty states should explain the current context.

Example:

```text
No shipments currently require your review.
```

Not:

```text
Nothing here.
```

Where useful, offer relevant next action.

---

# 52. First-Use Empty States

For a new user:

```text
No organizations yet.
[Create]
[Join]
```

or:

```text
No claimed items yet.
[Scan or claim]
```

Do not expose unrelated modules.

---

# 53. Progressive Navigation by Maturity

A user may begin with:

```text
1 object
1 action
```

Later gain:

```text
multiple objects
organization context
delegation
administration
audit
```

Navigation may deepen accordingly.

The beginner experience should not pre-expose the mature organization architecture.

---

# 54. Public Observer Navigation

A public user may see:

```text
Product
Public information
Recall
Warranty terms
Evidence summary
```

No organization menu.

No account menu unless needed.

---

# 55. Customer Navigation

An authenticated owner/customer may see new actions:

```text
Register
Warranty
Service
Claim
Transfer
```

The surface changes because relationship/Standing changes.

---

# 56. Operator Navigation

An operator may primarily see:

```text
Work
Assigned objects
Exceptions
```

not policy/evidence administration.

---

# 57. Compliance Navigation

A compliance user may see:

```text
Reviews
Exceptions
Evidence
Policies
Audit
```

with contextual object entry.

---

# 58. Administrator Navigation

Administrator may need:

```text
Organization
People & Relationships
Delegations
Sources
Security
Audit
```

but should still use contextual administration where practical.

---

# 59. Developer Navigation Boundary

Developer-specific navigation belongs to `ZyUX-DEVELOPER-001`.

Likely focus:

```text
Quickstart
Projects / environments
API credentials
Usage
Logs
Docs
```

Developer UX SHALL not expose constitutional internals unnecessarily.

---

# 60. Agent Capability Discovery Boundary

Agent-specific discovery belongs to `ZyUX-AGENT-001`.

Conceptually:

```text
available capabilities
+
scope
+
required parameters
+
failure meaning
```

An agent should not receive capabilities outside Authority.

---

# 61. Host-Native Navigation

When embedded in SAP, Shopify, an ERP, or another system of work:

the host may already provide:

- current object;
- current organization;
- current user;
- workflow stage.

Zyppi SHOULD reuse legitimately provided context.

Avoid:

```text
Open Zyppi
→ select company
→ select product
→ select shipment
```

when the host already knows them.

---

# 62. Host-Native Context Integrity

Host-provided context is input.

It SHALL NOT be treated as stronger Reality/Authority than governing Zyppi semantics permit.

A host can tell Zyppi:

```text
User is viewing Shipment #882
```

It cannot automatically establish:

```text
User may approve Shipment #882
```

---

# 63. Standalone vs Host-Native Parity

The standalone and Host-Native surface may have different navigation.

Example:

```text
Standalone:
Shipment → Review

SAP:
Purchase Order screen → Zyppi Review action
```

Meaning remains governed by one capability.

---

# 64. Breadcrumbs

Breadcrumbs MAY help deep contexts.

Example:

```text
Company A
› Cairo Operations
› Shipment #882
```

They should communicate context.

They should not expose inaccessible hierarchy.

---

# 65. Back Navigation

Back should ordinarily return to the previous legitimate context.

If previous access has expired, route safely.

---

# 66. URL / Addressability

Where useful, identified contexts should support stable addressability.

Addressability SHALL not imply public access.

A stable link may require authentication/authorization.

---

# 67. Historical Context Navigation

Authorized users may need:

```text
View as of 12 Feb 2025
```

Historical context must be visually distinct from current context.

Avoid allowing users to mistake historical state for current actionable state.

---

# 68. Historical Actions

A historical surface should ordinarily default to:

```text
read / reconstruct
```

not current operational action.

---

# 69. Context Time

Where valid-time matters, the interface SHOULD make the relevant time understandable.

Example:

```text
Historical view — 12 Feb 2025
```

Detailed temporal doctrine belongs elsewhere.

---

# 70. Cross-Domain Example — Ahmed

Ahmed has:

```text
Personal
Company A — Accountant
Company B — Cashier
Company X — Freelancer
```

Home may show:

```text
Needs your attention
• Company B shift task
• Company X project approval

Recent
• Mimi
• Company A historical receipt
```

Company A termination:

```text
Company A
→ removed from active contexts
→ may remain under History if permitted
```

No menu clutter from former Authority.

---

# 71. Cross-Domain Example — Mimi

Mimi context:

```text
Mimi
Owner: Ahmed

Current:
Vaccination due soon

Actions:
• View health evidence
• Share with vet
• Update emergency contact
```

Vet context may show:

```text
Mimi
Vet relationship

Actions:
• View permitted medical Evidence
• Add treatment record
```

Same Subject.

Different relationship.

Different surface.

---

# 72. Cross-Domain Example — Product

Public observer:

```text
Product #882
• Product information
• Recall status
• Public Evidence
```

Owner/customer:

```text
Product #882
• Warranty
• Service
• Claim
• Transfer
```

Service technician:

```text
Product #882
• Assigned repair
• Diagnosis
• Repair record
```

Manufacturer:

```text
Product #882
• Warranty decision
• Recall action
```

---

# 73. Cross-Domain Example — Shipment

Driver:

```text
Shipment #882
• Accept custody
• Pickup
• Deliver
• Report damage
```

Compliance:

```text
Shipment #882
• Review Evidence
• Hold
• Escalate
```

Manufacturer admin:

```text
Shipment #882
• Manage delegation
• View audit
```

No universal shipment menu.

---

# 74. Cross-Domain Example — Farmer

Worker opens:

```text
Tree #344
• Record treatment
```

Agronomist:

```text
Tree #344
• Review history
• Certify
```

Buyer:

```text
Tree #344
• View provenance
```

Government inspector:

```text
Tree #344
• View scoped compliance Evidence
```

---

# 75. Error Navigation

A failure should leave the user near the Job.

Example:

```text
Approval failed:
Required Evidence is missing.

[View required Evidence]
```

Do not send user to generic error page if a legitimate next action exists.

---

# 76. Access-End Navigation

If the user loses access mid-session:

```text
Your Company A access has ended.
```

Then offer:

```text
[Return to your other contexts]
```

Do not expose Company A content after revocation.

---

# 77. Offline / Degraded Navigation Boundary

Where future offline/degraded surfaces exist, the UX must clearly distinguish:

- current trusted state;
- cached/historical state;
- unavailable action;
- pending synchronization.

`ZyUX-003` does not authorize offline semantics.

---

# 78. Command Palette

A command palette MAY improve expert UX.

It must remain scope-filtered.

It SHALL NOT reveal non-disclosable commands.

---

# 79. Keyboard / Power User Navigation

Power navigation may exist.

Speed SHALL NOT bypass context/Authority confirmation for consequential action.

---

# 80. Mobile Navigation

Mobile UX strengthens the case for contextual disclosure.

Small screens cannot support platform-wide menus gracefully.

Primary mobile patterns SHOULD emphasize:

- current context;
- primary action;
- work queue;
- context switch;
- search.

---

# 81. Accessibility

Navigation must be:

- keyboard navigable;
- screen-reader understandable;
- logically ordered;
- clear without color alone;
- robust under zoom;
- compatible with reduced-motion needs;
- comprehensible when controls are conditionally disclosed.

Dynamic capability appearance must be announced appropriately to assistive technology.

---

# 82. Localization

Navigation labels should avoid assumptions that do not translate across:

- industries;
- countries;
- organization forms;
- legal structures.

Use domain-native terms only where the active application/profile justifies them.

---

# 83. Cognitive Load Principle

Every visible control imposes cognitive cost.

Therefore:

> **Visibility is a scarce UX resource.**

Show what advances the Job.

Do not display platform capability merely to advertise breadth.

---

# 84. Consistency Principle

Contextuality SHALL NOT mean unpredictability.

Users should learn:

```text
where current context appears
where primary actions appear
where proof/details appear
how to switch context
how to search
```

even as the actual content changes.

---

# 85. Discoverability Without Clutter

Legitimate capabilities may be discoverable through:

- context action list;
- `More`;
- help;
- command palette;
- search;
- documentation;
- request-access surface.

The solution to discoverability is not necessarily permanent menu placement.

---

# 86. Help & Guidance

Help should be contextual.

Example:

```text
Why can't I release this shipment?
```

is better than:

```text
Read the Authorization documentation.
```

Detailed explanation belongs to `ZyUX-004`.

---

# 87. State Change & Dynamic Disclosure

When Standing or state changes, capability may appear/disappear.

Example:

```text
Purchase registered
→ Warranty action appears
```

or:

```text
Employment ended
→ Company actions disappear
```

Transitions should be understandable where surprising.

---

# 88. New Delegation Appears

If Sarah receives a new capability:

```text
You can now review Alexandria Warehouse exceptions.
```

The relevant queue/context may appear automatically.

Do not force manual module enablement.

---

# 89. Revoked Delegation Disappears

After revocation:

- action disappears;
- new work disappears;
- current sensitive surface closes if required;
- historical attribution remains as permitted.

---

# 90. Feature Flags vs Governed Capability

Internal product feature rollout SHALL NOT be confused with user Authority.

A feature flag may control whether a surface is deployed.

Authority controls whether the Subject may use it.

Both may need to be true.

---

# 91. Capability Availability vs Service Availability

A Subject may have Authority but a service may be unavailable.

UX should distinguish:

```text
You are authorized
but service is temporarily unavailable
```

from:

```text
You are not authorized
```

---

# 92. Domain/Application Projection

A capability may be labeled differently by application while preserving meaning.

Example:

```text
Commerce:
Hold shipment

Warranty:
Hold claim

Generic:
Prevent execution pending review
```

Exact semantic ownership remains governed beneath ZyUX.

---

# 93. Navigation & Marketing Boundary

Navigation SHALL not be used to advertise unsupported domains.

The UI should not contain:

```text
Healthcare
Pets
Agriculture
DPP
...
```

merely because architecture could support them.

Current surfaces should reflect earned product scope.

---

# 94. Navigation & Pricing Boundary

A hidden/locked paywall is different from missing Authority.

If pricing tiers later gate capabilities, UX must distinguish:

```text
not included in plan
```

from:

```text
not authorized
```

Pricing doctrine is outside scope.

---

# 95. Telemetry & Validation

ZyUX-003 should eventually measure:

- time to locate legitimate action;
- task completion rate;
- navigation depth;
- wrong-context action attempts;
- context-switch frequency;
- search success;
- search leakage incidents;
- disabled-control confusion;
- request-access success;
- menu usage vs contextual action usage;
- work-queue completion;
- notification-to-action completion;
- abandonment after authentication;
- backtracking;
- support tickets about “where is X?”;
- hidden-control incidents where legitimate users could not find required capability.

Telemetry must remain scope-safe.

---

# 96. Contextual Capability Disclosure Safety Test

A design is not successful merely because it looks clean.

It must prove:

1. legitimate users can find required actions;
2. unauthorized users do not discover sensitive capabilities;
3. users understand current acting context;
4. users are not forced through deep menus;
5. state/Authority changes do not create dangerous ambiguity.

---

# 97. Security Review Requirements

Review is required for:

- cross-context leakage;
- search enumeration;
- hidden relationship discovery;
- stale cached navigation;
- deep-link leakage;
- notification leakage;
- wrong-context action;
- disabled-button side channels;
- command-palette enumeration;
- host context spoofing;
- cross-organization drafts;
- admin control leakage;
- historical/current context confusion.

---

# 98. Relationship to Other ZyUX Documents

## `ZyUX-001`

Defines entry, account, authentication, identity continuity, and initial context selection.

## `ZyUX-002`

Defines organization relationships, scope, delegation, and the Authority context from which capability disclosure derives.

## `ZyUX-004`

Defines how reasons, Evidence, Trust, uncertainty, and Receipts are explained once the user asks `Why?` or needs proof.

## `ZyUX-005`

Defines Host-Native context and navigation projections.

## `ZyUX-006`

Defines lifecycle transitions that add/remove contexts and historical access.

`ZyUX-003` owns the **visible contextual surface and navigation logic**.

---

# 99. Explicit Non-Scope

`ZyUX-003` does not define:

- Capability semantics;
- authorization implementation;
- Policy evaluation;
- constitutional Context;
- database queries;
- search engine implementation;
- visual design system;
- final information architecture for every archetype;
- mobile component library;
- pricing/paywalls;
- notification transport;
- recommendation algorithms;
- accessibility standard selection;
- host-specific UI details.

---

# 100. Drift Prohibitions

`ZyUX-003` SHALL NOT drift into:

- menu = authorization;
- hidden = secure;
- disabled buttons everywhere;
- universal dashboard;
- one navigation tree for all Subjects;
- module-first product architecture;
- cross-scope search;
- automatic consequential context switching;
- global discovery of all relationships;
- capability advertisement as navigation;
- host-native semantic fork;
- personalization that preserves revoked access;
- contextuality that makes controls unpredictable;
- clean UI that prevents legitimate users from finding required capability.

---

# 101. Ratification Questions

Before ratification, Council should disposition:

1. Exact definition of `Experience Context`.
2. Whether `Context Anchor` becomes standard ZyUX terminology.
3. Whether Available / Requestable / Non-Disclosable is the final disclosure taxonomy.
4. When disabled controls are acceptable.
5. Whether every requestable capability requires a visible escalation path.
6. Whether `Personal` should appear as an explicit context.
7. When automatic context switching is safe.
8. Consequential-action context-confirmation threshold.
9. Global home surface composition.
10. Whether `Needs Your Attention` becomes a universal ZyUX pattern.
11. Rules for recent/pinned contexts after access changes.
12. Cross-context search availability.
13. Search zero-state wording.
14. Scope labels required in search results.
15. Historical-context visual treatment.
16. Contextual administration vs global control-plane boundary.
17. Command-palette policy.
18. Notification privacy baseline.
19. Mobile navigation baseline.
20. Accessibility baseline for dynamically changing controls.
21. How request-access flows connect to ZyUX-002 delegation.
22. How explanation links connect to ZyUX-004.
23. How Host-Native context integrity is verified.
24. Whether work queues are a universal pattern or archetype-specific.
25. Required evidence before Contextual Capability Disclosure becomes normative.

---

# 102. Proposed Acceptance Invariants

A conforming implementation should eventually prove:

### AX-003-01 — Entry Intent Preserved

Authentication returns the Subject to the initiating legitimate Job.

### AX-003-02 — Context Is Understandable

A multi-context user can determine the acting context where it matters.

### AX-003-03 — No Silent Consequential Context Switch

A consequential action is not attributed to the wrong relationship through silent switching.

### AX-003-04 — Search Respects Scope

Search reveals no result outside legitimate disclosure scope.

### AX-003-05 — Non-Disclosable Means Non-Discoverable

Hidden capability/relationship existence does not leak through navigation, search, disabled controls, counts, or command palettes.

### AX-003-06 — Requestable Is Actionable

Where a capability is legitimately requestable, the user can reach the appropriate request/escalation path without understanding the authority graph.

### AX-003-07 — Menu Is Not Security Boundary

Direct/deep-link invocation remains governed even if navigation is manipulated.

### AX-003-08 — Home Is Relevance-Based

A user is not forced to inspect a module directory to find pending work.

### AX-003-09 — Revoked Context Stops Current Work

After access revocation, active sensitive surfaces/actions disappear according to policy.

### AX-003-10 — Historical Context Is Distinct

Historical state cannot be mistaken for current actionable state.

### AX-003-11 — Host Context Does Not Grant Authority

Host-provided object context does not itself authorize action.

### AX-003-12 — Same Capability, Same Meaning Across Surfaces

Standalone/Host/SDK/MCP projections preserve semantic parity.

### AX-003-13 — Legitimate Action Is Findable

An authorized Subject can locate a required high-frequency capability within acceptable task effort.

### AX-003-14 — Contextuality Remains Learnable

Primary context/action/search/switch patterns remain stable enough to learn.

### AX-003-15 — No Cross-Context Draft Leakage

Draft work remains bound to its originating context.

### AX-003-16 — Notification Does Not Over-Disclose

Notification surfaces reveal no more than their authorized disclosure level.

### AX-003-17 — State Blocking Differs From Authority Blocking

The user receives the correct progression path.

### AX-003-18 — Contextual Admin Avoids Unnecessary Global Navigation

Scoped admin work can be completed from relevant context where appropriate.

---

# 103. Canonical Journey Set for Future Prototyping

1. Direct product deep-link → public view.
2. Public product → authenticate → return to claim.
3. Ahmed opens Company A invoice from notification.
4. Ahmed switches from Company A to Company B.
5. Ambiguous action requires manual context selection.
6. Low-risk object opens with automatic context.
7. High-risk action confirms acting capacity.
8. Warehouse operator sees only operational actions.
9. Compliance officer sees Evidence/hold actions.
10. Company admin sees contextual delegation control.
11. Requestable capability → request access.
12. Requestable capability → request approval.
13. Non-disclosable capability remains invisible.
14. State-blocked capability shows reason.
15. Search within Company A.
16. Cross-context search with labeled results.
17. Search for non-disclosable object returns no leak.
18. Revocation while user is on active surface.
19. Historical Company A context after termination.
20. Department merger changes current nav but not historical context.
21. Host-Native SAP entry carries current object.
22. Host context spoof does not grant action.
23. Work queue surfaces pending review.
24. Empty queue explains current state.
25. Pinned object loses access.
26. Recent context moves to history.
27. Notification on locked screen preserves privacy.
28. Command palette remains scope-filtered.
29. Mobile user completes Job without deep navigation.
30. User with accessibility technology receives dynamic capability changes clearly.

These are experience test cases, not implementation authorization.

---

# 104. Closing Doctrine

> **The user should navigate the Job, not the platform.**

> **Context determines relevance. Authority determines legitimacy. Disclosure determines visibility.**

> **A capability can be available, requestable, or non-disclosable. Those are not the same UX state.**

> **A disabled button is not an authorization architecture.**

> **Search, menus, notifications, deep links, command palettes, and Host-Native surfaces must all respect the same scope boundaries.**

> **The same Subject may see radically different surfaces in different relationships without becoming different identities.**

> **Work should come to the person responsible for it when the responsibility is clear.**

> **Global control planes are for global Jobs. Contextual Jobs belong near their context.**

> **Contextual does not mean unpredictable. Simple does not mean mysterious.**

> **Zyppi should expose the smallest useful legitimate surface — and make the next legitimate action obvious.**

---

# 105. Status & Next Step

**Current Status:** DRAFT — CHAIR REVIEW.

Recommended review sequence:

1. Chair review.
2. Map capability-disclosure classes against Authority/Policy/Security doctrine.
3. Validate Available / Requestable / Non-Disclosable taxonomy.
4. Security review for search/navigation side channels.
5. UX prototype of the 30 canonical journeys.
6. Accessibility review of dynamic disclosure.
7. Host-Native review.
8. Feed explanation/reason/proof requirements into `ZyUX-004`.
9. Feed Host-Native context rules into `ZyUX-005`.
10. Feed revoked/historical context rules into `ZyUX-006`.
11. Apply to future `ZyUX-PUBLIC-OBSERVER-001`, `ZyUX-CUSTOMER-001`, `ZyUX-ORG-ADMIN-001`, and `ZyUX-OPERATOR-001`.
12. Ratification only after discoverability and context-safety questions are closed.

---

**End of `ZyUX-003 v0.1 — DRAFT FOR CHAIR REVIEW`**

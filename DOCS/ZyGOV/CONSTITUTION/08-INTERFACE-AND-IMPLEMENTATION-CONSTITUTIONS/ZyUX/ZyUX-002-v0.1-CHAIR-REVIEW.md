# ZyUX-002 — Organization, Relationship, Scope & Delegation Experience

**Canonical ID:** `ZyUX-002`  
**Version:** 0.1  
**Status:** DRAFT — CHAIR REVIEW  
**Series:** ZyUX — Zyppi Experience Architecture  
**Classification:** Horizontal Experience Doctrine  
**Normative Level:** Experience Doctrine / Product Architecture  
**Date:** 6 September 2026  
**Parent Authority:** `ZyUX-000 — Zyppi Experience Architecture & Master Doctrine`  
**Coordinates With:** `ZyUX-001 — Identity, Account & Entry Experience` · NORTH STAR v7.0 · What is Zyppi? v4.0 · applicable Authority · Standing · Delegation · Ownership · Evidence · Policy · Security doctrine  
**Primary Source Corpus:** Council discussion on organizations, delegation, scope, ownership, employment, inheritance, cross-organization relationships, Ahmed worked example  
**Applies To:** Organizations · Departments · Teams · Sole traders · Agencies · Contractors · Regulators · Partners · Logistics · Cross-organization delegation · Membership · Scope · Re-delegation · Organizational change · Offboarding · Historical structure

---

# 0. Status & Intent

`ZyUX-002` governs the experience of creating and joining organizations, establishing organizational relationships, assigning and receiving scoped Authority, delegating and re-delegating, working across multiple organizations, representing optional departments/teams, managing external parties, changing leadership, restructuring organizations, and revoking current access without rewriting history.

This document governs **experience**.

It does not redefine constitutional Authority, Standing, Ownership, Delegation, Identity, Policy, Evidence, Registry Truth, or Receipt semantics.

It SHALL NOT be interpreted as authorizing:

- role-based superuser bypasses;
- fixed organization trees;
- automatic Authority from job title;
- automatic Authority from ownership;
- automatic Authority from inheritance;
- permanent access after employment ends;
- cross-organization data exposure merely because a relationship exists;
- organization ownership of a natural person's canonical Identity;
- implicit re-delegation;
- hidden privilege escalation;
- rewriting historical attribution when organization structure changes.

> **Organizations change. Relationships change. Authority changes. History must remain reconstructible.**

---

# 1. Purpose

Traditional enterprise software often assumes:

```text
Organization
→ Department
→ Manager
→ Employee
```

Reality is more complex.

An organization may be a sole trader, family business, startup, multinational, government authority, regulator, consortium, agency, logistics provider, contractor network, temporary project, or legal entity with no conventional department structure.

Departments may merge or disappear. Leadership may change. A person may work for multiple employers, freelance for another, hold different Authority in each, leave one organization while retaining another, preserve historical attribution after leaving, or inherit ownership without inheriting management Authority.

Therefore Zyppi must model organization experience around **governed relationships and scoped delegation**, not around a permanent org chart.

---

# 2. Core Experience Model

The universal organizational experience is:

```text
SUBJECT / ORGANIZATION
        ↓
RELATIONSHIP
        ↓
ROLE / CAPACITY
        ↓
AUTHORITY
        ↓
STANDING
        ↓
SCOPE
        ↓
AVAILABLE CAPABILITIES
```

No layer may substitute for another.

Example:

```text
Ahmed
→ employed by Company A
→ Accountant
→ may review invoices
→ currently active
→ Egypt Finance
→ Review / Approve within bounds
```

Another:

```text
Logistics Co
→ contracted by Manufacturer
→ Carrier
→ may accept custody
→ active for shipment
→ Shipment #882
→ Pickup / Deliver / Report damage
```

---

# 3. Core Terms

## 3.1 Organization

An identified organizational Subject or governed organizational constituent according to applicable Zyppi ontology and Registry semantics. ZyUX does not redefine legal personhood.

## 3.2 Organizational Relationship

A governed connection between a Subject and organization, organization and organization, or another constituent where organizational context is relevant.

Examples: employee, contractor, auditor, customer, regulator, supplier, logistics provider, owner/shareholder, administrator, service provider, franchisee, partner.

## 3.3 Role

A human-readable capacity such as Accountant, Warehouse Manager, Driver, Compliance Reviewer, External Auditor, or Veterinarian.

Role helps comprehension. Role SHALL NOT be treated as self-executing Authority.

## 3.4 Authority

The governed empowerment to approve, establish, delegate, alter, or cause something.

## 3.5 Standing

Whether a Subject currently qualifies to exercise relevant Authority.

## 3.6 Scope

The bounded domain within which Authority applies. Scope may include organization, legal entity, department, branch, geography, warehouse, product family, shipment, project, customer, time period, capability, transaction value, object set, or policy class.

## 3.7 Delegation

A governed grant of bounded Authority from one legitimate holder to another.

## 3.8 Re-delegation

A delegated ability to pass onward a bounded subset of Authority. Re-delegation SHALL never be assumed.

---

# 4. Primary ZyUX-002 Laws

## ZyUX-002-L01 — Organization Is Not a Person's Account

> **An organization SHALL NOT be represented as belonging permanently to one human login.**

A person may administer an organization. The organization remains distinct.

## ZyUX-002-L02 — Authority Graph, Not Mandatory Org Tree

> **Zyppi SHALL support organizational Authority as a graph of governed relationships rather than requiring one permanent Organization → Department → Manager → Employee hierarchy.**

## ZyUX-002-L03 — Role Does Not Equal Authority

> **A role label SHALL NOT itself grant capability.**

## ZyUX-002-L04 — Ownership Does Not Equal Authority

> **Economic/property ownership SHALL NOT automatically create operational, managerial, signing, policy, or delegation Authority.**

## ZyUX-002-L05 — Delegation Conservation

> **A Subject or organization SHALL NOT delegate more Authority than it legitimately holds and is permitted to delegate.**

## ZyUX-002-L06 — Scope Narrowing

> **Delegation may remain equal or become narrower downstream; it SHALL NOT silently widen.**

## ZyUX-002-L07 — Re-delegation Must Be Explicit

> **The ability to act does not imply the ability to delegate that action to someone else.**

## ZyUX-002-L08 — Current Access Is Temporal

> **A relationship may remain historically true after current Standing and capability end.**

## ZyUX-002-L09 — Organizational Mutation Does Not Rewrite History

> **Department mergers, renaming, restructuring, leadership change, acquisition, or dissolution SHALL NOT rewrite historical attribution.**

## ZyUX-002-L10 — Cross-Organization Relationship Does Not Create Tenant Merger

> **Delegating to another organization SHALL NOT merge the two organizations' data, users, or governance.**

## ZyUX-002-L11 — Bidirectional Scope Isolation

> **Each side sees only what the governed relationship permits.**

## ZyUX-002-L12 — External Party Is Not Internal User

> **A contractor, auditor, regulator, agency, or logistics provider SHOULD be represented as an external governed relationship where appropriate rather than forced into a fake employee model.**

## ZyUX-002-L13 — Contextual Administration

> **Administrative controls SHOULD appear at the object, relationship, or scope where they are meaningful instead of only in a global permissions console.**

## ZyUX-002-L14 — Authority Must Be Explainable

> **For consequential capability, Zyppi SHOULD be able to show who granted it, what it covers, whether it may be re-delegated, and when it expires.**

## ZyUX-002-L15 — No Hidden Master Role

> **No UI role such as Owner, Super Admin, or Founder SHALL silently bypass governed Authority unless the underlying authority model explicitly establishes that scope.**

---

# 5. Organization Shapes

ZyUX-002 SHALL support multiple organization shapes without changing the doctrine.

## 5.1 Sole Operator

```text
Omar Repairs
        ↓
Omar
```

UX may be nearly flat. No artificial departments.

## 5.2 Small Business

```text
Restaurant
├── Owner
├── Branch Manager
├── Chef
└── Accountant
```

Roles may help comprehension. Authority remains explicit.

## 5.3 Multi-Branch Organization

```text
Company
├── Cairo Branch
├── Alexandria Branch
└── Giza Branch
```

Scope may derive from branch.

## 5.4 Enterprise

```text
Parent Group
├── Legal Entity A
├── Legal Entity B
└── Legal Entity C
```

Departments, geographic regions, hosts, and policies may overlap. Zyppi SHALL NOT assume one tree captures all Authority.

## 5.5 Government / Regulator

```text
Regulator
        ↓
governed relationship
        ↓
Company
```

The regulator remains external Authority. It does not become company admin.

## 5.6 Consortium / Network

```text
Program
├── Manufacturer
├── Supplier
├── Logistics Provider
├── Auditor
└── Regulator
```

No participant is automatically subordinate to another.

## 5.7 Agency

```text
Agency
├── Client A relationship
├── Client B relationship
└── Client C relationship
```

Each client delegates independently. Client scopes remain isolated.

---

# 6. Organization Creation Experience

Creation SHOULD remain minimal.

```text
Create organization

Name
Jurisdiction / legal form only if necessary
[Create]
```

Advanced structure appears only when needed.

Creating an organization context does not necessarily prove legal organizational identity or the creator's legal authority to represent it. Those assurance states may be established later according to consequence.

---

# 7. Bootstrap Authority

Organization creation creates an unavoidable bootstrap question: who initially has Authority?

ZyUX may present the creator as having broad initial control where legitimate, but implementation SHOULD represent this as explicit bootstrap grants rather than:

```text
creator = permanent god mode
```

Bootstrap Authority should eventually be attributable, reviewable, transferable, and compatible with multiple administrators.

Exact Authority semantics remain outside ZyUX.

---

# 8. Membership vs Relationship

Not every organizational relationship is membership.

```text
Employee → internal relationship
Contractor → external relationship
Auditor → external bounded relationship
Regulator → external authority relationship
Customer → commercial relationship
Logistics Provider → operational partner relationship
```

The UX SHALL NOT force all parties into a generic `Users` bucket when a more accurate relationship exists.

---

# 9. Invite & Delegation Experience

A good invite carries enough governed context to avoid repeated configuration.

```text
Invite Ahmed

Relationship:
Employee

Capacity:
Finance Reviewer

Scope:
Egypt Finance

Can:
✓ View invoices
✓ Review
✓ Approve ≤ $10,000

May delegate:
No

Valid:
Until employment ends
```

Recipient experience:

```text
Company A invited you

Finance Reviewer
Egypt Finance

You will be able to:
• View invoices
• Review
• Approve up to $10,000

[Accept]
```

Deeper details may reveal who granted it, expiry, re-delegation, and visibility.

---

# 10. Universal Delegation UX

The human-facing model SHOULD reduce to:

```text
Who?
What can they do?
For what scope?
For how long?
Can they delegate further?
```

Example:

```text
Give Sarah access

Scope:
Alexandria Warehouse

Can:
✓ View shipments
✓ Report exception
✓ Approve release

Limit:
≤ EGP 100,000

May re-delegate:
No

Expires:
31 Dec 2026

[Grant]
```

The underlying system may express detailed Authority, Standing, valid-time, provenance, and Receipt semantics.

---

# 11. Re-delegation Experience

If re-delegation is allowed, boundaries must be explicit.

```text
You may delegate:
• View shipments
• Report exception

You may NOT delegate:
• Approve release
• Change policy
```

A downstream Subject SHALL NOT be able to grant capabilities outside the delegator's permitted re-delegable subset.

---

# 12. Cross-Organization Delegation

Example:

```text
Manufacturer
→ Logistics Co
```

Manufacturer grants:

```text
Shipment #882
Can:
• Accept custody
• Update delivery status
• Report damage

Cannot:
• Change product identity
• Change policy
• Change warranty
```

Logistics Co may delegate to Driver Omar only if re-delegation is permitted.

Cross-organization delegation does not merge organizations, users, or data.

---

# 13. Government / Regulator Relationships

Government/regulator relationships may grant or recognize license, permit, inspection scope, reporting requirement, certification, enforcement action, or review capability.

The UX SHALL distinguish:

```text
Government Authority
```

from:

```text
Company Administrator
```

A regulator does not become a company administrator merely because it has lawful access.

Likewise, a company may submit Evidence or respond to a regulator through specifically delegated internal Authority.

---

# 14. Department Experience

Departments are optional organizational structures.

```text
Company A
├── Finance
├── Operations
└── Compliance
```

They may help humans understand scope, but they SHALL NOT be constitutionally required for delegation.

A company may delegate directly:

```text
Company A → Ahmed
```

or externally:

```text
Company A → External Auditor
```

---

# 15. Department Mutation

Example:

```text
2025:
Procurement
Finance

2027:
Commercial Operations
```

If Procurement and Finance merge, current UX may show `Commercial Operations`.

Historical record must still preserve:

```text
Invoice #882
Approved 2025
By Ahmed
Capacity: Procurement Manager
Organization structure at time: Procurement
```

No retroactive rewrite.

---

# 16. Leadership Change

```text
2025 CEO: Hassan
2027 CEO: Mary
```

Current:

```text
CEO → Mary
```

Historical:

```text
Decision 2025
Actor: Hassan
Capacity: CEO
Standing: valid at decision time
```

Mary does not inherit authorship.

---

# 17. Ownership, Authority & Inheritance

Ownership, Authority, Standing, Role, and Identity remain distinct.

If Hassan owns 40% of Company Z and is also CEO, his death may cause:

```text
shares → lawful succession process
CEO authority → ends unless separately re-established
```

The UX SHALL NOT imply:

```text
You inherited shares
→ You inherited CEO/admin rights
```

unless governing Authority independently establishes the latter.

---

# 18. Employment Termination

When Ahmed leaves Company A:

```text
Relationship → Ended
Standing → Inactive
Delegations → Revoked / Expired
```

He loses new Company A updates, active Company A controls, and operational data outside retained lawful scope.

He may retain historical attribution and unrelated Company B, freelance, and personal contexts.

---

# 19. Former Participant Experience

A former employee's Company A context may appear under `History` rather than active work.

```text
Company A
Former relationship

Period:
2024–2026

Current access:
None

Historical actions:
Available only as permitted
```

The interface must not imply active Authority.

Company A may retain lawful corporate records and historical attribution without gaining visibility into unrelated personal context.

---

# 20. Multi-Organization User

Ahmed may have:

```text
Personal
Company A — Accountant
Company B — Cashier
Company X — Contractor
```

The experience SHOULD make current context clear, especially before consequential action.

Example:

```text
Acting as:
Company B — Cashier
```

---

# 21. Scope Dimensions

Scope may be composed across several dimensions.

Example:

```text
Organization: Company A
Branch: Cairo
Capability: Approve invoice
Limit: ≤ $10,000
Time: until 31 Dec
```

Another:

```text
Organization: Logistics Co
Shipment: #882
Capability: Record delivery
Time: active delivery window
```

UX should express this in ordinary language.

---

# 22. Scope Summary Experience

A Subject should be able to answer:

```text
What can I do?
Where?
For what?
Until when?
Who granted it?
Can I pass it on?
```

Example:

```text
Your access

Company A — Cairo Finance

Can:
• View invoices
• Review invoices
• Approve up to $10,000

Granted by:
Finance Director

Expires:
31 Dec 2026

May delegate:
No
```

---

# 23. Administrator Experience

An organizational administrator's Job is not to see every Zyppi feature.

It is to manage legitimate organizational access, identity-provider connections, administrators, delegations, revocation, source connections, risky grants, and organizational relationships.

Administrative Authority itself should be scopeable.

Example:

```text
Branch Admin — Alexandria

Can:
• Invite branch users
• Revoke branch access
• Manage branch groups

Cannot:
• Edit global company policy
• View Cairo branch
• Change billing
```

Avoid binary `Admin / Not Admin` where the model is richer.

---

# 24. The Word “Owner”

`Owner` is dangerous because it may mean legal owner, beneficial owner, account creator, billing owner, product owner, or administrative authority.

ZyUX SHOULD avoid using `Owner` as a universal privilege label.

Prefer context-specific labels where meaningful:

```text
Organization Administrator
Legal Owner
Billing Administrator
Policy Administrator
Source Administrator
```

---

# 25. External Party Experiences

## 25.1 Auditor

May receive:

```text
Read-only
specific period
specific Evidence / Receipts
no policy editing
no source mutation
```

No fake employee account required.

## 25.2 Contractor

Should see assigned work, relevant objects, allowed Evidence, allowed actions, and expiry—not the whole organization.

## 25.3 Agency

An agency may operate across clients. Each client delegates independently. Removing the agency from Client A SHALL NOT affect Client B.

Detailed agency experience belongs to `ZyUX-AGENCY-001`.

## 25.4 Logistics Provider

The provider may receive custody/action capability without inheriting manufacturer hierarchy or ownership.

---

# 26. Delegation Proof

For consequential action, Zyppi should be capable of reconstructing:

```text
Authority source
→ delegation
→ re-delegation if any
→ Subject
→ Standing at time
→ action
→ Receipt
```

UX may expose this progressively.

---

# 27. Delegation Revocation

Revocation should distinguish future capability from historical record.

```text
Revoke Sarah's approval access?

This stops future approvals.
Past approvals remain part of the audit history.

[Revoke]
```

Revocation SHALL NOT imply historical deletion.

---

# 28. Expiring and Temporary Delegation

Time-bounded access SHOULD be easy to create.

```text
Auditor access

Valid:
1 Sep → 30 Sep

Scope:
2026 Q2 Evidence only
```

High-risk temporary elevation may additionally require reason, short duration, approval, enhanced audit, or Receipt.

No silent privilege elevation.

---

# 29. Discovery, Search & Metadata Privacy

Organizations should not automatically expose full member lists, external partners, internal structure, customer lists, supplier lists, or sensitive relationships.

Search within Company A should ordinarily search:

```text
Company A ∩ current scope
```

not all Zyppi.

Even the existence of a relationship may be sensitive.

> **Relationship metadata is itself governed information.**

---

# 30. Organization Switcher & Context Selection

Where a Subject has multiple organizational contexts, use meaningful labels.

```text
Ahmed

Personal
Company A — Finance
Company B — Retail
Company X — Contractor
```

If the user opens a Company A invoice, Zyppi SHOULD select Company A context automatically where unambiguous.

If several contexts could legitimately apply, ask.

---

# 31. Consequential Action Confirmation

Where context ambiguity is plausible:

```text
Approving as:
Ahmed
Company A — Finance Reviewer

Scope:
Egypt Finance

[Approve]
```

This helps prevent wrong-context action without cluttering every screen.

---

# 32. Organization Merge & Dissolution

If:

```text
Company A + Company B → Company C
```

successor rights/obligations may transition according to governance, but a 2025 action remains attributed to Company A if Company A performed it.

A dissolved organization may retain historical Identity and records while current actions become unavailable.

```text
Company A
Status: Dissolved
Current actions: None
Historical records: available as authorized
```

---

# 33. Administrator Departure & Recovery Boundary

If the sole administrator leaves, Zyppi must not assume the organization ceases to exist.

Recovery may involve another administrator, enterprise IdP, organization Evidence, quorum, designated recovery Authority, or time-delayed process.

No hidden universal Zyppi super-admin.

Detailed recovery belongs to `ZyUX-006` and applicable security/authority doctrine.

---

# 34. Host-Native Organization Experience

Organizations may administer and operate Zyppi through existing systems.

```text
Entra → authentication
SAP → operational action
Shopify → merchant context
Zyppi Console → delegation / governance / cross-system control
```

The Zyppi control plane should not duplicate host functionality unnecessarily.

---

# 35. Organizational Scope Sovereignty

Enterprise users should understand:

> **Your organization controls its organizational scope.**

This is not equivalent to:

> **Your organization owns every human Identity associated with it.**

Company A SHALL NOT automatically see Ahmed's Company B employment, personal assets, Mimi, or freelance work.

Ahmed SHALL NOT see Company A's unrelated employees, suppliers, policies, or systems.

---

# 36. Role Templates

Organizations may use convenient templates:

```text
Warehouse Operator
Finance Reviewer
Compliance Manager
Auditor
```

Templates may suggest grants.

But:

> **Template ≠ constitutional Authority.**

The system should reveal what a template actually grants.

---

# 37. Least Necessary Control

Delegation UX SHOULD default toward the narrowest useful grant where appropriate:

- branch instead of whole company;
- view instead of edit;
- one shipment instead of all shipments;
- temporary instead of indefinite.

This is a UX safety default, not a replacement for Security policy.

---

# 38. Delegation Review

Organizations SHOULD be able to answer quickly:

```text
Who currently has access to what?
Who can delegate further?
What expires soon?
What was recently revoked?
```

without understanding the entire graph.

Potential warnings:

```text
This grant allows Sarah to approve releases across all warehouses.
```

```text
Sarah may re-delegate this authority.
```

Warnings should be specific and contextual.

---

# 39. No Permission Wall by Default

ZyUX SHOULD avoid giant permission matrices as the default experience.

Prefer:

```text
Scope
+
meaningful capabilities
+
advanced details when needed
```

Expert matrix views may exist, but they are not the universal UX.

---

# 40. Universal Delegation Across Relationship Types

The same interaction pattern should work for:

```text
Person → Person
Person → Organization
Organization → Person
Organization → Organization
Government → Organization
Organization → Government disclosure
```

Examples:

```text
Ahmed → Omar → temporary car use
```

```text
Ahmed → Vet Clinic → update Mimi medical Evidence
```

```text
Company A → Ahmed → finance approval
```

```text
Manufacturer → Logistics Co → shipment custody
```

The underlying Authority differs; the human interaction grammar remains familiar.

---

# 41. Delegation & Relationship Lifecycle

Possible delegation states may include:

```text
Draft
Pending acceptance
Active
Suspended
Expired
Revoked
Ended by relationship
```

Possible relationship states may include:

```text
Proposed
Invited
Active
Suspended
Ended
Historical
```

Exact states remain implementation/governance-dependent.

The UX must clearly distinguish current from historical state.

---

# 42. Historical Organization & Authority Views

Authorized users may need to ask:

```text
What did Company A look like on 3 Apr 2025?
```

or:

```text
Who could approve invoices on 12 Feb 2025?
```

This is different from today's org chart or today's Authority.

Historical reconstruction is a first-class audit need where supported by underlying evidence.

---

# 43. Cross-Organization Audit

For:

```text
Manufacturer
→ Logistics Co
→ Driver
```

audit may need to show:

- manufacturer grant;
- logistics acceptance;
- downstream delegation;
- driver's Standing;
- action Receipt.

No party needs universal visibility beyond its legitimate audit Authority.

---

# 44. Machine / Agent Delegation Boundary

Organizations may delegate to machine Subjects/agents.

```text
Company A
→ Agent X
→ retrieve Evidence
```

But:

```text
Agent credential ≠ Authority
```

Authority must be separately granted and attributable.

Detailed agent experience belongs to `ZyUX-AGENT-001`.

---

# 45. Marketing / Buyer Projection

Enterprise messaging should emphasize:

- retain organizational control;
- revoke access cleanly;
- preserve historical accountability;
- delegate to external partners safely;
- survive employee turnover;
- preserve existing IAM.

Do not lead with `global identity graph`.

Lead with:

> **Who can do what, where, under whose authority, and can you prove it?**

---

# 46. Cross-Domain Worked Example — Ahmed

Ahmed has one Identity.

```text
Company A — Accountant
Company B — Cashier
Company X — Freelancer
Mimi — Owner
```

Company A sees only:

```text
Ahmed ∩ Company A
```

When fired:

```text
Company A relationship → ended
Standing → revoked
delegation → revoked
future capability → none
```

Unaffected:

```text
Company B
Company X
Mimi
personal login
historical identity
```

---

# 47. Cross-Domain Worked Example — Restaurant

```text
Restaurant
├── Cairo Branch
└── Alexandria Branch
```

Owner delegates:

```text
Cairo Manager → Cairo operations only
Chef → kitchen records only
Inspector → compliance Evidence read-only
Accountant → financial records only
```

No participant needs the whole system.

---

# 48. Cross-Domain Worked Example — Farmer

Farmer may delegate:

```text
Worker → record treatment for Field A
Agronomist → certify Tree Group B
Buyer → view provenance
Government Inspector → scoped compliance review
```

No enterprise hierarchy is required.

---

# 49. Cross-Domain Worked Example — Logistics

```text
Manufacturer
→ Logistics Co
→ Driver Omar
```

Driver can accept custody, confirm pickup, deliver, and report damage.

Driver cannot change product identity, warranty, or compliance policy.

---

# 50. Cross-Domain Worked Example — Government

```text
Regulator
→ Company A
```

Regulator may inspect specified Evidence, specified products, and specified periods without becoming Company A administrator.

---

# 51. Cross-Domain Worked Example — Inheritance

Hassan:

```text
40% shareholder
CEO
```

Hassan dies.

Potential:

```text
shares → succession
```

Not automatic:

```text
CEO authority → heirs
```

New CEO Authority requires separate governance.

---

# 52. UX Copy Principles

Prefer:

```text
Give access
```

over:

```text
Create delegation edge
```

Prefer:

```text
Can approve up to $10,000
```

over internal formalism.

Prefer:

```text
Access ended
```

over:

```text
Standing invalidated
```

Deep terminology remains available in expert proof views.

---

# 53. Telemetry & Validation

ZyUX-002 should eventually measure:

- invite completion;
- delegation completion;
- permission-error rate;
- wrong-scope action attempts;
- excessive admin grants;
- re-delegation confusion;
- offboarding completion;
- stale active access;
- expired delegation rate;
- admin support burden;
- time to determine who has access;
- cross-scope leakage incidents;
- former-user unauthorized access attempts;
- historical audit reconstruction time.

Telemetry SHALL remain scope-safe.

---

# 54. Accessibility & Comprehension

Delegation UX must be understandable to ordinary managers, not only IAM experts.

Use clear verbs, concrete scope names, understandable expiry, plain-language warnings, progressive detail, and accessible controls.

Avoid forcing users to understand RBAC/ABAC terminology.

---

# 55. Security Review Requirements

Before implementation, review:

- privilege escalation;
- delegation widening;
- unauthorized re-delegation;
- orphaned Authority after org change;
- stale access after termination;
- confused-deputy risk;
- cross-scope leakage;
- administrator recovery;
- external-party access;
- context confusion;
- time-bounded grants;
- audit integrity;
- service/agent delegation.

---

# 56. Relationship to Other ZyUX Documents

## `ZyUX-001`

Owns Identity, account, authentication, invitation entry, and credential continuity.

## `ZyUX-003`

Owns contextual navigation, context switching, and capability disclosure after relationships/scopes exist.

## `ZyUX-004`

Owns explanation of Authority, Evidence, Trust, uncertainty, and proof.

## `ZyUX-005`

Owns Host-Native organization experience.

## `ZyUX-006`

Owns deep offboarding, recovery, lifecycle, and historical experience.

`ZyUX-002` owns the **organization and delegation experience spine**.

---

# 57. Explicit Non-Scope

`ZyUX-002` does not define:

- constitutional Authority semantics;
- legal ownership law;
- inheritance law;
- final delegation schema;
- database graph model;
- IAM protocol;
- policy engine;
- billing roles;
- tax/legal entity modeling;
- corporate governance law;
- final succession rules;
- final security recovery model;
- visual design system.

---

# 58. Drift Prohibitions

`ZyUX-002` SHALL NOT drift into:

- organization = tenant = identity;
- employee = permanent user;
- role = Authority;
- owner = super-admin;
- department = mandatory hierarchy;
- external partner = employee;
- regulator = admin;
- inheritance = Authority transfer;
- delegated action = right to re-delegate;
- org merge = historical rewrite;
- access revocation = history deletion;
- multi-org relationship = data co-mingling;
- admin UI = giant permission matrix by default.

---

# 59. Ratification Questions

Before ratification, Council should disposition:

1. Exact boundary between Organization, legal entity, tenant, and organizational Subject.
2. Whether `Organization` remains the universal UX term across government/consortium contexts.
3. Initial bootstrap Authority model.
4. Role-template semantics.
5. Whether departments are UX-only structures or governed relationship entities.
6. Re-delegation default.
7. Delegation expiry default.
8. External partner acceptance semantics.
9. Government/regulator relationship semantics.
10. Historical organization reconstruction requirements.
11. Whether former users can access personal historical attribution.
12. Succession and ownership-transfer presentation.
13. Admin recovery model.
14. Machine/agent delegation representation.
15. How scope composition is displayed without overwhelming users.
16. Whether a global `Organization Admin` role should exist or always be scoped capabilities.
17. How multi-legal-entity enterprises are represented.
18. How agency/client boundaries are presented.
19. How cross-organization audit is exposed.
20. Which delegation operations require explicit Receipt generation.

---

# 60. Proposed Acceptance Invariants

### AX-002-01 — No Fixed Hierarchy Requirement

A sole trader, flat team, enterprise, regulator, and consortium can all be represented without forcing the same org tree.

### AX-002-02 — Role Alone Grants Nothing

Assigning a label without Authority does not create capability.

### AX-002-03 — Delegation Cannot Widen

A downstream delegate cannot receive more Authority than permitted upstream.

### AX-002-04 — Re-delegation Is Explicit

Action Authority does not imply delegation Authority.

### AX-002-05 — Scope Isolation

Company A delegation does not expose unrelated Company B or personal context.

### AX-002-06 — External Party Remains External

A contractor, auditor, or logistics provider can participate without becoming an employee.

### AX-002-07 — Termination Revokes Future Capability

Ended Standing prevents new actions.

### AX-002-08 — History Survives Termination

Past valid actions remain attributable.

### AX-002-09 — Org Mutation Preserves History

Department merge/rename does not rewrite old records.

### AX-002-10 — Ownership Does Not Create Operational Authority

Shareholder status alone does not create CEO/admin capability.

### AX-002-11 — Inheritance Does Not Transfer Delegated Authority

Heirs do not automatically receive office/employee/admin Authority.

### AX-002-12 — Cross-Org Delegation Does Not Merge Data

Partner relationship preserves data boundaries.

### AX-002-13 — Context Is Clear Before Consequential Action

Users can tell which organization/scope they are acting under.

### AX-002-14 — Revocation Is Non-Destructive

Revoking access does not delete historical Receipts.

### AX-002-15 — No Hidden Master Role

Administrative power is explainable by underlying grants.

---

# 61. Canonical Journey Set for Future Prototyping

1. Create sole-trader organization.
2. Create small organization.
3. Invite first internal employee.
4. Invite scoped branch manager.
5. Grant temporary auditor access.
6. Grant external agency access.
7. Company delegates shipment to logistics provider.
8. Logistics provider re-delegates to driver.
9. Re-delegation prohibited.
10. Re-delegation allowed with narrower scope.
11. Department merges into another department.
12. Leadership changes.
13. Employee leaves.
14. Administrator leaves.
15. External partner contract ends.
16. Organization dissolves.
17. Two organizations merge.
18. Shareholder inherits shares but no Authority.
19. Regulator receives scoped inspection relationship.
20. Company submits Evidence to regulator.
21. User works for two organizations simultaneously.
22. Context switch before high-risk action.
23. Delegation expires.
24. Emergency temporary access.
25. Historical audit reconstructs old Authority chain.

These are experience tests, not implementation authorization.

---

# 62. Closing Doctrine

> **Organizations are governed relationships, not permanent user containers.**

> **Departments may help humans understand structure, but Authority must survive beyond any one org chart.**

> **Roles describe capacity. Authority determines capability. Standing determines whether it can be exercised now.**

> **Ownership does not imply management. Inheritance does not imply delegated Authority.**

> **Delegation may narrow. It may never silently widen.**

> **An external partner should remain external when Reality says it is external.**

> **Ending access stops the future. It does not rewrite the past.**

> **A company's structure may change completely while historical decisions remain attributable to the people and organizational structures that actually existed at the relevant time.**

> **The user should understand who can do what, for what scope, until when, and under whose authority — without needing to understand the graph underneath.**

---

# 63. Status & Next Step

**Current Status:** DRAFT — CHAIR REVIEW.

Recommended review sequence:

1. Chair review.
2. Constitutional Authority/Standing/Delegation mapping.
3. Ownership/Delegation alignment audit.
4. Security review for privilege escalation and re-delegation.
5. Enterprise IAM/org-admin review.
6. Legal review of ownership/succession representations.
7. Prototype the 25 canonical journeys.
8. Feed navigation/context implications into `ZyUX-003`.
9. Feed proof/explanation implications into `ZyUX-004`.
10. Feed Host-Native implications into `ZyUX-005`.
11. Feed offboarding/recovery/history implications into `ZyUX-006`.
12. Ratification only after boundary questions are closed.

---

**End of `ZyUX-002 v0.1 — DRAFT FOR CHAIR REVIEW`**

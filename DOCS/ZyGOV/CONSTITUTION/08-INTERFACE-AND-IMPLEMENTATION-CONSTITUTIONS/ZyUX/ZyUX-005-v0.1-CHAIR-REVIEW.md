# ZyUX-005 — Host-Native Experience

**Canonical ID:** `ZyUX-005`  
**Version:** 0.1  
**Status:** DRAFT — CHAIR REVIEW  
**Series:** ZyUX — Zyppi Experience Architecture  
**Classification:** Horizontal Experience Doctrine  
**Normative Level:** Experience Doctrine / Product Architecture  
**Date:** 7 September 2026  
**Parent Authority:** `ZyUX-000 — Zyppi Experience Architecture & Master Doctrine`  
**Coordinates With:** `ZyUX-001 — Identity, Account & Entry Experience` · `ZyUX-002 — Organization, Relationship, Scope & Delegation Experience` · `ZyUX-003 — Contextual Navigation & Capability Disclosure` · `ZyUX-004 — Explanation, Evidence, Trust & Receipt Experience` · ZYAPI v1.1 · NORTH STAR v7.0 · What is Zyppi? v4.0 · MARKET-REALITY-001 · Marketing-PLAN-3Y-001 · applicable Authority · Standing · Evidence · Trust · Policy · Security · Host Adapter doctrine  
**Primary Source Corpus:** Council Host-Native discussions · ZYAPI v1.1 Host-Native & Expansion Doctrine · “Integrate with the titan. Do not rebuild the titan.” · “Canonical underneath. Native on top. Explicit in between.” · ZyUX-000 through ZyUX-004  
**Applies To:** ERP · PIM · PLM · WMS · CRM where legitimately relevant · Commerce platforms · Government systems · Developer tools · Enterprise identity providers · Host extensions · Embedded actions · Context handoff · Host-to-Zyppi mapping · Read/write boundaries · Host-Native notifications · Deep links · Fallback surfaces

---

# 0. Status & Intent

`ZyUX-005` governs how Zyppi should appear inside existing systems of record and systems of work.

It exists because most operational users should not need to leave their established workflow, learn a separate Zyppi application, re-enter context, or duplicate data merely to invoke a Zyppi capability.

This document governs **experience**.

It does not redefine Host, Interface, Capability, Application, Domain, Interoperability Standard, Authority, Standing, Evidence, Trust, Policy, Registry Truth, ZYAPI semantics, or host adapter implementation contracts.

It SHALL NOT be interpreted as authorizing:

- a host-specific semantic fork;
- host-owned Zyppi business logic;
- duplicate implementations of one governed capability;
- copying all host data into Zyppi;
- strengthening host claims into Zyppi truth;
- treating host context as Authority;
- host writes without explicit authorization;
- silent cross-system writes;
- ERP replacement;
- workflow-platform replacement;
- arbitrary host expansion without evidence;
- host UI that weakens Trust/Evidence/Receipt semantics;
- bypass of Zyppi governance because the action occurs inside a trusted enterprise system.

The governing proposition is:

> **Meet the user where the work already happens — without letting the host change what Zyppi means.**

---

# 1. Why Host-Native Exists

Organizations already operate through systems such as ERP, PIM, PLM, WMS, commerce platforms, logistics systems, regulatory systems, identity providers, service-management systems, and developer environments.

These systems often contain current object context, current organizational context, current user authentication, workflow stage, enterprise data, source-of-record information, existing approvals, existing notifications, and existing user habits.

If Zyppi requires the user to:

```text
leave host
→ open Zyppi
→ sign in again
→ choose company
→ find object
→ find action
→ repeat data already present
```

then Zyppi creates workflow displacement rather than reducing it.

The preferred path is:

```text
HOST CONTEXT
        ↓
ZYPPI CAPABILITY
        ↓
GOVERNED RESULT
        ↓
HOST-NATIVE PRESENTATION
```

with deeper Zyppi proof/control available when required.

---

# 2. Two Forms of Nativeness

## 2.1 Semantic Nativeness

Zyppi should speak the language of the Job, Application, and Domain.

Examples:

```text
Commerce:
Hold shipment

Warranty:
Review claim

DPP:
View lifecycle status
```

rather than forcing users to understand generic constitutional vocabulary.

Semantic nativeness changes expression.

It SHALL NOT change meaning.

## 2.2 Environmental Nativeness

Zyppi should meet the Subject in the system where the Job already occurs.

Examples:

```text
SAP user → SAP
Shopify merchant → Shopify
Warehouse operator → WMS
Developer → SDK / IDE / CLI
AI Agent → MCP
Auditor → bounded audit surface
```

Environmental nativeness changes location and interaction.

It SHALL NOT change semantics.

## 2.3 Combined Rule

> **Semantic nativeness makes Zyppi understandable. Environmental nativeness makes Zyppi adoptable. Neither may create a new semantic owner.**

---

# 3. Core Terms for ZyUX-005

## 3.1 Host

An external system of record, system of work, platform, tool, or environment in which the Subject already performs a Job.

Host is not a Zyppi Reality primitive.

## 3.2 Host Adapter

A governed integration layer that maps between host structures and Zyppi capability inputs/outputs.

The adapter SHALL NOT independently own business, epistemic, Trust, authorization, or error semantics.

## 3.3 Host-Native Extension

The user-facing projection of Zyppi capability inside the host.

Examples:

- embedded panel;
- action button;
- status block;
- contextual alert;
- extension card;
- command;
- workflow action;
- app/plugin surface.

## 3.4 System of Record

A system legitimately authoritative for some external organizational data or operational state.

Zyppi does not automatically replace it.

## 3.5 System of Work

The environment where the user actually performs the Job.

A system may be both system of record and system of work.

## 3.6 Context Handoff

The transfer of legitimate host context into a Zyppi capability invocation.

Potential context includes object identifier, organization, current user, host record, workflow stage, location, application, and current task.

Context handoff is input.

It is not automatic Authority.

## 3.7 Host Projection

The presentation of Zyppi result inside the host.

Projection may simplify wording.

It SHALL NOT strengthen, weaken, or reinterpret semantics.

---

# 4. Primary ZyUX-005 Laws

## ZyUX-005-L01 — Integrate, Do Not Replace
> **Zyppi SHOULD integrate with existing systems of record and systems of work rather than require replacement merely to deliver a governed capability.**

## ZyUX-005-L02 — One Capability Semantic Owner
> **Every public Zyppi capability SHALL have one governed semantic owner beneath all host projections.**

REST, SDK, MCP, Host-Native extensions, and future authorized interfaces adapt that capability. They SHALL NOT independently implement its business, epistemic, Trust, authorization, or error semantics.

## ZyUX-005-L03 — Host Context Is Input, Not Authority
> **A host may provide context about what the user is viewing or doing. That context SHALL NOT itself establish Zyppi Authority, Standing, Trust, or truth.**

## ZyUX-005-L04 — Preserve Source Identity
> **Host-derived information SHALL preserve its source identity and provenance where those semantics matter.**

## ZyUX-005-L05 — No Semantic Strengthening
> **A host projection SHALL NOT strengthen a Zyppi result.**

## ZyUX-005-L06 — No Semantic Weakening
> **A host projection SHALL NOT hide material uncertainty, conflict, limitation, or failure required to understand the result.**

## ZyUX-005-L07 — Systems of Record Remain Systems of Record
> **Zyppi SHOULD reference, query, subscribe, verify, attest, or derive from legitimate systems of record rather than copy entire host datasets without need.**

## ZyUX-005-L08 — Writes Are Explicit and Authorized
> **A Host-Native action SHALL NOT cause a host or Zyppi write merely because the user can see the data. Writes require applicable Authority, Standing, Policy, and explicit capability.**

## ZyUX-005-L09 — No Silent Cross-System Mutation
> **If a Zyppi action will change state in an external system, the experience SHOULD make that consequence understandable before execution where material.**

## ZyUX-005-L10 — Context Should Be Reused, Not Re-entered
> **Where the host already provides legitimate context, Zyppi SHOULD reuse it rather than force the user to select the same object, organization, or workflow again.**

## ZyUX-005-L11 — Existing IAM Coexists
> **Host-Native participation SHOULD use the organization's legitimate authentication/SSO environment where appropriate rather than create unnecessary parallel credentials.**

## ZyUX-005-L12 — Host-Native Does Not Mean Host-Dependent Semantics
> **The same governed capability SHALL remain meaningful if invoked outside the host through another authorized interface.**

## ZyUX-005-L13 — Degraded Host Experience Must Fail Honestly
> **If host integration is unavailable or incomplete, the UX SHALL distinguish integration failure from domain uncertainty or Trust failure.**

## ZyUX-005-L14 — Deep Proof May Escape the Host
> **A host surface MAY provide concise explanation and link to a deeper Zyppi proof/control surface where reproducing full depth inside the host would create poor UX or disclosure risk.**

## ZyUX-005-L15 — Minimal Workflow Displacement
> **Zyppi SHOULD require the fewest new workflow steps necessary to preserve governance, clarity, and proof.**

## ZyUX-005-L16 — Host Is Not a New Domain
> **Adding a new host SHALL NOT create new canonical domain semantics merely because the host uses different terminology or data structures.**

## ZyUX-005-L17 — Host and Interface Remain Distinct
> **Host and Interface remain separate classification dimensions.**

## ZyUX-005-L18 — Host Absence Is Not Negative Evidence
> **If connected host context is absent, Zyppi SHALL NOT present that absence as proof that a condition does or does not exist.**

---

# 5. Host-Native Experience Equation

```text
GOVERNED CAPABILITY
+
HOST CONTEXT
+
SUBJECT
+
RELATIONSHIP
+
STANDING
+
AUTHORITY
+
DISCLOSURE SCOPE
+
HOST UX CONSTRAINTS
=
HOST-NATIVE EXPERIENCE
```

The host shapes presentation and context.

It does not own capability meaning.

---

# 6. Preferred Host Flow

```text
USER IS ALREADY WORKING IN HOST
        ↓
HOST PROVIDES LEGITIMATE CONTEXT
        ↓
ZYPPI RESOLVES SUBJECT / ORGANIZATION / OBJECT
        ↓
AUTHORITY / STANDING / POLICY EVALUATED
        ↓
GOVERNED CAPABILITY INVOKED
        ↓
RESULT RETURNED
        ↓
HOST PRESENTS NATIVE ACTION / ANSWER
        ↓
OPTIONAL DEEP PROOF / CONTROL
```

---

# 7. Host Entry & Authentication

Host entry may occur through an embedded action, contextual button, host notification, deep link, or extension surface.

The preferred enterprise path is:

```text
Enterprise IdP
→ Host session
→ Zyppi authorized context
```

where technically and securely supported.

The user SHOULD NOT be required to create a separate Zyppi password merely because a Host-Native extension exists.

Host account identity SHALL NOT automatically become universal canonical identity truth.

---

# 8. Host & Organization Mapping

A host tenant/company may map to a Zyppi organizational Subject.

The mapping must distinguish, where applicable:

```text
host tenant
≠ legal organization
≠ Zyppi organization Identity
```

Do not silently equate them.

Likewise, host objects may map to products, shipments, suppliers, warehouses, devices, assets, or other governed Zyppi identities/relationships.

If mapping is ambiguous, Zyppi SHALL NOT guess.

---

# 9. Host Source Provenance

A host-derived value should remain attributable.

Example:

```text
Supplier status
Source: SAP vendor master
```

This does not mean Zyppi independently verified supplier status unless it did.

A host assertion and a Zyppi assessment may legitimately diverge.

---

# 10. Read Boundary

A Host-Native extension may read only what its authorized integration permits.

It SHALL NOT infer:

```text
not visible in host
→ does not exist
```

Absence of connected context remains absence.

---

# 11. Write Boundary

Potential write patterns include:

```text
Zyppi decision
→ update host status
```

or:

```text
Host action
→ record Zyppi Receipt reference
```

Writes require explicit capability and Authority.

For consequential writes, the UX should make the external consequence understandable where appropriate.

Example:

```text
This will set SAP Purchase Order #882 to HOLD.
```

---

# 12. Cross-System Execution

A Zyppi decision and an external host write are separate states.

Example:

```text
Zyppi decision:
HOLD

SAP update:
Failed — host unavailable
```

Do not present the host mutation as completed until it succeeds.

Partial cross-system execution must be represented honestly.

---

# 13. Host-Native Status Pattern

A concise host panel may show:

```text
Zyppi

Release status:
HOLD

Reason:
Supplier certificate expired

Next:
Request updated certificate

[View basis]
```

Deeper:

```text
[View Evidence & Receipt]
```

may open a host panel or Zyppi proof surface depending on need.

---

# 14. Capability Disclosure in Host

The ZyUX-003 taxonomy applies:

### Available
```text
[Approve]
```

### Requestable
```text
Approval required
[Request]
```

### Non-Disclosable
No UI artifact.

The host SHOULD show only capabilities relevant to the current Subject, object, relationship, Authority, Standing, Policy, and context.

---

# 15. Host Navigation

Preferred:

```text
current host object
→ Zyppi action
```

Avoid:

```text
Zyppi tab
→ choose organization
→ choose module
→ choose object
```

when the host already provides the context.

When deeper Zyppi work is required, a deep link SHOULD preserve organization, object, task, and proof context.

---

# 16. Search / Context Integrity

Host context must update as users change objects.

A user navigating from Shipment A to Shipment B must not retain Shipment A actions.

Shared terminals must bind Zyppi scope to the current authenticated host user.

Host context is an input, not an authorization grant.

---

# 17. Host-Specific Language

Host-native terminology is allowed where it is a faithful projection.

Example:

```text
Purchase Order
```

in SAP may be appropriate.

But host wording SHALL NOT conceal a materially different semantic object or strengthen Zyppi meaning.

---

# 18. Error Boundaries

Distinguish:

```text
Zyppi capability unavailable
```

from:

```text
host extension failed to load
```

from:

```text
external host write failed
```

and from:

```text
Evidence/Trust result is uncertain
```

These are different layers.

---

# 19. Cache / Freshness

If caching is authorized, the host should present relevant freshness.

Example:

```text
Last checked: 14:22
```

Cacheability SHALL come from governed capability semantics.

The host SHALL NOT infer cacheability from `verified`.

---

# 20. Existing IAM, ERP, PIM, PLM & WMS

Zyppi SHALL preserve existing enterprise systems where appropriate.

Preferred interaction with systems of record:

```text
Reference
Query
Subscribe
Verify
Attest
Derive
```

rather than:

```text
Copy everything
```

The enterprise message remains:

> **Your ERP remains your ERP. Your IdP remains your IdP. Zyppi governs its own capability, Authority, Trust, Evidence, and accountable execution layer around them.**

---

# 21. Source Connection Experience

Admin connection flow should make clear:

```text
What may Zyppi read?
What may Zyppi write?
Which organization?
Which environment?
Which data classes?
```

Default toward minimum useful access.

Example:

```text
Read:
Products
Suppliers
Shipments

Do not read:
Payroll
HR
Finance
```

where applicable.

---

# 22. Correct-at-Source Doctrine

> **Where data is owned by an external system of record, the preferred correction path SHOULD return the user to that source rather than create a conflicting Zyppi copy.**

Example:

```text
Wrong supplier name
→ Edit in SAP
```

If the problem is a Zyppi-governed relationship:

```text
→ Correct/report in Zyppi
```

---

# 23. Multiple Hosts & Source Conflict

An organization may connect:

```text
SAP
PIM
WMS
Shopify
```

No host automatically becomes universal truth.

If sources conflict, Zyppi should preserve conflict according to Evidence/Trust doctrine.

Source precedence, if any, must be governed rather than hidden in adapter code.

---

# 24. Progressive Host Adoption

Host-Native adoption may deepen:

```text
Read-only status
→ contextual recommendations
→ user-triggered actions
→ authorized writes
→ workflow automation
→ agent-assisted execution
```

Do not force full automation on Day 1.

---

# 25. Host-Native Explanation

A host may show:

```text
Hold — supplier certificate expired
[Why?]
[View basis]
```

This reuses ZyUX-004.

Limited host space does not authorize hiding material uncertainty.

---

# 26. Host-Native Receipt

A host may display or store a Zyppi Receipt reference.

The host SHALL NOT reinterpret Receipt meaning.

Where both host and Zyppi retain history, links/references should support reconciliation.

---

# 27. Host-Native AI

AI may summarize Zyppi result inside a host.

The summary must remain faithful to structured Zyppi semantics.

AI interpretation SHALL NOT strengthen Evidence, Trust, Policy, Authority, or Receipt claims.

---

# 28. Host-Native Admin Boundary

Operational users should not receive global integration controls.

Admins may need:

- connection status;
- permissions;
- mappings;
- environments;
- write scope;
- logs;
- audit.

Zyppi-specific governance belongs in the appropriate Zyppi control plane where the host cannot represent it cleanly.

---

# 29. Connection Health

Admin example:

```text
SAP Production
Connected

Last successful sync:
14:20

Read:
Products, suppliers, shipments

Write:
Shipment status
```

Degradation:

```text
SAP connection degraded
Writes unavailable
Reads last successful 8 min ago
```

This is infrastructure state, not Trust state.

---

# 30. Environment Separation

Organizations may have:

```text
Sandbox
Test
Production
```

Host integration and UI must clearly distinguish environment where confusion could cause consequential action.

---

# 31. Host Installation & Activation

Installation should request only necessary:

- organization;
- environment;
- permissions;
- scope.

A useful activation milestone may be:

```text
first real host object successfully evaluated through Zyppi
```

where consistent with current product strategy.

---

# 32. Noise Control

Host integration must avoid alert fatigue.

Surface information that is:

- relevant;
- scoped;
- actionable;
- materially informative.

Do not turn every Evidence state into a notification.

---

# 33. Host UI Is Not a Zyppi Dashboard

Do not embed the entire Zyppi platform into every host.

The host extension should serve the host Job.

The Zyppi control plane remains appropriate for genuinely cross-host governance, proof, delegation, source administration, policy administration, developer settings, and organization control.

---

# 34. Host Migration & Replacement

If an organization moves:

```text
SAP → Oracle
```

the Zyppi canonical relationships/history should not disappear.

Host changes should require new mapping/integration, not new Reality or new semantic capability ownership.

During migration, old and new hosts may coexist; source/write responsibility should remain clear.

---

# 35. Cross-Organization & Agency Context

Agency/integrator users may manage multiple clients:

```text
Client A Shopify
Client B Shopify
Client C SAP
```

Current client scope must be obvious.

Client A SHALL NOT expose Client B.

Removing one client relationship must not affect unrelated client relationships.

---

# 36. Human / Agent / API Parity

The same governed capability may be invoked by:

```text
Human in SAP
Agent via MCP
Backend via SDK
```

Authority may differ by principal/delegation.

Semantics do not.

---

# 37. Data Minimization

Host integration should avoid collecting data not required for the capability.

Sensitive categories require explicit justification and governing authority.

ZyUX-005 does not establish legal basis.

---

# 38. Host Removal

Uninstalling or disconnecting a host integration should:

- stop new authorized host access;
- revoke tokens/permissions as applicable;
- preserve historical Receipts according to governing retention;
- not erase canonical Identity/history.

Reinstallation should not create duplicate organizational identities.

---

# 39. Versioning

Host-extension version and governed capability version are separate.

Host updates should not silently change capability semantics.

Adapter version may need to be recorded where mapping materially affects interpretation.

---

# 40. Host Audit

Authorized users should be able to reconstruct:

```text
Which host invoked this?
Which Subject acted?
What context was supplied?
What did Zyppi decide?
What external write occurred?
What Receipt records it?
```

where applicable and disclosable.

---

# 41. Cross-Domain Examples

## SAP Procurement

```text
Purchase Order #882

Zyppi Supplier Check
Trust: Probable
Issue: required certificate expires in 2 days

[Request updated Evidence]
```

## WMS

```text
Shipment #882
HOLD

Reason:
Compliance review required

[Send to Compliance]
```

## Shopify

Merchant:

```text
Product
→ Zyppi verification status
```

Customer:

```text
Order
→ Warranty / Register / Claim
```

## Regulator Portal

```text
Receipt verification
Evidence basis
```

The regulator remains an independent authority.

---

# 42. Telemetry & Validation

ZyUX-005 should eventually measure:

- install completion;
- connection completion;
- time to first successful host invocation;
- first production activation;
- manual context re-entry steps;
- host-to-Zyppi round trips;
- deep-proof usage;
- read/write failure rate;
- wrong-context incidents;
- stale-result incidents;
- cross-scope leakage incidents;
- host uninstall rate;
- host migration success;
- workflow displacement;
- task completion time before/after Host-Native integration.

Telemetry must remain scope-safe.

---

# 43. Security Review Requirements

Review is required for:

- host token scope;
- IdP mapping;
- confused-deputy risk;
- stale host context;
- source spoofing;
- cross-tenant leakage;
- write escalation;
- token revocation;
- shared-device leakage;
- adapter compromise;
- provenance tampering;
- deep-link leakage;
- marketplace permissions;
- synchronization loops;
- replay/idempotency;
- host-admin recovery;
- external partner access.

---

# 44. Privacy Review Requirements

Review:

- unnecessary host data ingestion;
- PII transfer;
- relationship metadata;
- client separation;
- employee cross-context leakage;
- sensitive source fields;
- retention after connection revocation;
- host logs containing Zyppi proof;
- deep-link proof access.

---

# 45. Relationship to Other ZyUX Documents

## `ZyUX-001`
Owns account, authentication, SSO entry, Identity continuity, and enterprise authentication coexistence.

## `ZyUX-002`
Owns organizational relationship, delegation, scope, and external-party boundaries.

## `ZyUX-003`
Owns contextual navigation, capability disclosure, search, deep links, and host context inheritance.

## `ZyUX-004`
Owns reason, Trust, Evidence, uncertainty, and Receipt projection inside hosts.

## `ZyUX-006`
Will own lifecycle, migration, revoked access, historical continuity, and deeper recovery behavior.

`ZyUX-005` owns the **environmental projection of governed Zyppi capability into systems of work**.

---

# 46. Explicit Non-Scope

`ZyUX-005` does not define:

- SAP extension framework;
- Shopify implementation;
- Oracle integration;
- adapter code;
- OAuth scopes;
- SAML/OIDC mechanics;
- canonical mapping schema;
- sync engine;
- event bus;
- marketplace terms;
- pricing;
- host-specific design system;
- ZYAPI contract;
- Trust algorithm;
- Evidence schema;
- Policy engine;
- Runtime.

---

# 47. Drift Prohibitions

`ZyUX-005` SHALL NOT drift into:

- build ERP inside Zyppi;
- copy whole tenant into Zyppi;
- host = semantic owner;
- adapter = business logic owner;
- host assertion = verified truth;
- host context = Authority;
- read access = write permission;
- host plugin = new Domain;
- host-specific Trust semantics;
- host-specific error semantics;
- host UI hiding uncertainty;
- silent writes;
- duplicated onboarding;
- forced context re-entry;
- global Zyppi dashboard embedded everywhere;
- green-badge proof theater;
- unavailable source = false;
- marketplace installation = organizational authorization;
- integration presence = market validation.

---

# 48. Ratification Questions

Before ratification, Council should disposition:

1. Final definition of Host.
2. Boundary between System of Record and System of Work.
3. Whether `Host-Native Extension` becomes standard vocabulary.
4. Semantic Nativeness vs Environmental Nativeness terminology.
5. Single Capability Semantic Owner wording.
6. Host context assurance rules.
7. Host-derived Evidence provenance requirements.
8. Read/write permission model.
9. Cross-system write confirmation threshold.
10. External write Receipt requirements.
11. Cache/freshness presentation.
12. Host-source precedence/conflict policy.
13. Correct-at-source UX requirements.
14. Integration permission minimization baseline.
15. Host connection health baseline.
16. Environment separation.
17. Host-Native audit minimum fields.
18. Deep-proof fallback requirement.
19. Host-specific error mapping.
20. Marketplace permission language.
21. Host removal and retention behavior.
22. Host migration/replacement continuity.
23. AI summary rules inside hosts.
24. Accessibility baseline for embedded extensions.
25. Which BABY/GROW hosts are strategically eligible before product evidence.

---

# 49. Proposed Acceptance Invariants

### AX-005-01 — Host Does Not Own Semantics
The same capability preserves the same governed meaning across Host-Native and direct interfaces.

### AX-005-02 — Host Context Does Not Grant Authority
Providing object/user context alone does not authorize action.

### AX-005-03 — Source Provenance Survives
Host-derived data remains attributable to its source.

### AX-005-04 — No Semantic Strengthening
Host labels cannot convert probable/unknown/limited results into stronger claims.

### AX-005-05 — No Semantic Weakening
Material uncertainty/conflict cannot disappear in Host-Native projection.

### AX-005-06 — Existing IAM Works
Enterprise users can authenticate through legitimate enterprise SSO without mandatory parallel passwords.

### AX-005-07 — Minimal Context Re-entry
Host object and organization context are reused where legitimately available.

### AX-005-08 — Read Does Not Imply Write
Visible host data does not grant mutation capability.

### AX-005-09 — Writes Are Explicitly Governed
External writes require correct Authority, Standing, and Policy.

### AX-005-10 — Write Failure Is Honest
A failed external write is not reported as successful execution.

### AX-005-11 — Host Failure Is Not Trust Failure
Integration outage does not become a negative epistemic conclusion.

### AX-005-12 — Host Absence Is Not Negative Evidence
Missing host context is not interpreted as nonexistence.

### AX-005-13 — Host Replacement Preserves Meaning
Changing ERP/host does not require redefining capability semantics.

### AX-005-14 — Cross-Client Isolation Holds
Agency/multi-org host access does not leak between clients.

### AX-005-15 — Stale Context Does Not Cross Objects
Navigation from Host Object A to B updates Zyppi context correctly.

### AX-005-16 — Shared User Switch Is Safe
A new authenticated host user cannot see the prior user's Zyppi context.

### AX-005-17 — Correct-at-Source Works
Host-owned data corrections route to the host where appropriate.

### AX-005-18 — Deep Proof Preserves Context
Opening Zyppi proof from the host retains object/organization/task context.

### AX-005-19 — Connection Revocation Stops Future Access
Revoked host integration cannot continue reading/writing.

### AX-005-20 — Historical Proof Survives Host Removal
Historical Zyppi Receipts remain according to governing retention even if the host extension is removed.

---

# 50. Canonical Journey Set for Future Prototyping

1. Admin installs Zyppi into SAP.
2. Admin grants minimum read permissions.
3. Admin enables one Host-Native capability.
4. User opens host object; Zyppi context loads automatically.
5. Host object maps cleanly to Zyppi Identity.
6. Mapping is ambiguous; no guess.
7. Host assertion differs from Zyppi assessment.
8. Zyppi status appears in compact host card.
9. User asks `Why?`.
10. User opens deeper proof in Zyppi.
11. User returns to host.
12. Host shows requestable capability.
13. Host hides non-disclosable capability.
14. Read-only integration.
15. User authorizes first write.
16. External write succeeds.
17. External write fails.
18. Partial cross-system write.
19. Safe retry.
20. Host connection unavailable.
21. Cached result with freshness.
22. Stale result.
23. Source conflict.
24. Correct host-owned data at source.
25. Correct Zyppi-owned relationship in Zyppi.
26. Revoke host connection.
27. Uninstall extension; preserve history.
28. Reinstall extension.
29. Migrate SAP → Oracle.
30. Dual-host migration period.
31. Agency manages Client A and B.
32. Client isolation.
33. Shared terminal switches user.
34. Host object A → B.
35. Host-context spoof cannot authorize.
36. Enterprise SSO authentication.
37. SSO revoked mid-session.
38. WMS operator sees HOLD reason.
39. Shopify merchant sees product verification.
40. Customer sees warranty inside commerce host.
41. Regulator verifies Receipt.
42. AI agent acts through host with bounded Authority.
43. AI summary remains faithful.
44. Host notification preserves privacy.
45. Host extension on mobile.
46. Accessibility user reaches Zyppi action.
47. Sandbox vs Production separation.
48. Admin reviews connection health.
49. Admin reviews read/write scope.
50. Direct-vs-host semantic parity test.

These are experience test cases, not implementation authorization.

---

# 51. Closing Doctrine

> **Integrate with the titan. Do not rebuild the titan.**

> **The host may know where the user is. Zyppi still determines what the user may legitimately do.**

> **A host is a context and distribution surface — not a new semantic owner.**

> **Systems of record should remain systems of record unless there is a governed reason otherwise.**

> **Read what is necessary. Write only what is authorized. Preserve provenance.**

> **The same Zyppi capability may look native in SAP, Shopify, a WMS, an SDK, or MCP while preserving one underlying meaning.**

> **Do not make the user re-enter context the host already legitimately knows.**

> **Do not hide uncertainty because the host panel is small.**

> **Do not let adapter convenience become constitutional drift.**

> **Host-Native adoption means Zyppi becomes easier to use without becoming harder to trust.**

---

# 52. Status & Next Step

**Current Status:** DRAFT — CHAIR REVIEW.

Recommended review sequence:

1. Chair review.
2. ZYAPI single-capability-owner alignment audit.
3. Host-Native / system-of-record terminology audit.
4. Security review of context, SSO, tokens, write boundaries, and confused-deputy risk.
5. Privacy review of source ingestion and cross-client isolation.
6. Prototype the 50 canonical journeys.
7. Design direct-vs-host semantic parity tests.
8. Create SAP/WMS/Shopify-style reference UX prototypes without authorizing vendor-specific implementation.
9. Feed lifecycle/migration/offboarding rules into `ZyUX-006`.
10. Apply to future `ZyUX-ORG-ADMIN-001`, `ZyUX-OPERATOR-001`, `ZyUX-AGENCY-001`, `ZyUX-DEVELOPER-001`, and `ZyUX-AGENT-001`.
11. Ratification only after host semantic ownership and data/write boundaries are reconciled with governing authorities.

---

**End of `ZyUX-005 v0.1 — DRAFT FOR CHAIR REVIEW`**

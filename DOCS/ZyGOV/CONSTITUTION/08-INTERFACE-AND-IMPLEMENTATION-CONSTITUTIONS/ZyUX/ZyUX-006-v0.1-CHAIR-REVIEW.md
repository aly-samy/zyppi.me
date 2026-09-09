# ZyUX-006 — Lifecycle, Offboarding, Recovery & Historical Experience

**Canonical ID:** `ZyUX-006`  
**Version:** 0.1  
**Status:** DRAFT — CHAIR REVIEW  
**Series:** ZyUX — Zyppi Experience Architecture  
**Classification:** Horizontal Experience Doctrine  
**Normative Level:** Experience Doctrine / Product Architecture  
**Date:** 7 September 2026  
**Parent Authority:** `ZyUX-000 — Zyppi Experience Architecture & Master Doctrine`  
**Coordinates With:** `ZyUX-001 — Identity, Account & Entry Experience` · `ZyUX-002 — Organization, Relationship, Scope & Delegation Experience` · `ZyUX-003 — Contextual Navigation & Capability Disclosure` · `ZyUX-004 — Explanation, Evidence, Trust & Receipt Experience` · `ZyUX-005 — Host-Native Experience` · NORTH STAR v7.0 · What is Zyppi? v4.0 · applicable Identity · Authority · Standing · Delegation · Ownership · Evidence · Policy · Security · Receipt · Privacy · Retention doctrine  
**Primary Source Corpus:** Council discussion on employment termination, historical attribution, credential revocation, organizational change, ownership vs Authority, inheritance, death, recovery, and Ahmed worked example · ZyUX-000 through ZyUX-005  
**Applies To:** Offboarding · Relationship end · Credential loss · Delegation expiry · Revocation · Historical access · Recovery · Organization dissolution · Organization merger · Administrator departure · Host removal · Ownership succession · Life-state transitions · Death · Disputed recovery · Historical reconstruction

---

# 0. Status & Intent

`ZyUX-006` governs the experience of change over time.

It exists because Zyppi must remain coherent when:

- an employee leaves;
- an employer fires someone;
- a contractor finishes work;
- a delegation expires;
- an administrator leaves;
- a department is dissolved;
- two organizations merge;
- an organization dissolves;
- an authentication method is lost;
- a phone number changes;
- enterprise SSO is revoked;
- an IdP changes;
- a host integration is removed;
- ownership changes;
- succession begins;
- a person dies;
- historical action must be reconstructed years later.

This document governs **experience**.

It does not redefine constitutional Identity, Authority, Standing, Delegation, Ownership, legal succession, Privacy, Retention, or Receipt semantics.

It SHALL NOT be interpreted as authorizing:

- deletion of Identity because access ends;
- rewriting historical attribution;
- inheritance of delegated Authority;
- universal access by heirs;
- universal employee access to former employer records;
- universal employer access to former employee personal context;
- hidden Zyppi super-admin recovery;
- credential recovery that bypasses identity assurance;
- organization deletion that destroys lawful history;
- life-state changes based on casual user assertion;
- automatic legal conclusions;
- unlimited historical data access;
- retention beyond lawful/governed need.

The governing proposition is:

> **The future may change completely without rewriting what was true, authorized, observed, decided, or executed in the past.**

---

# 1. Purpose

Most SaaS products treat lifecycle as:

```text
Create user
→ Active
→ Disabled
→ Delete
```

That is insufficient for Zyppi.

Reality contains:

- identity continuity;
- relationship change;
- temporal Authority;
- valid-time Standing;
- historical decisions;
- retained Receipts;
- changing organization structure;
- ownership transfer;
- disputed succession;
- revoked credentials;
- changed systems of work;
- life-state transitions.

Zyppi must separate:

```text
IDENTITY
RELATIONSHIP
AUTHENTICATION
AUTHORITY
STANDING
OWNERSHIP
DISCLOSURE
HISTORY
```

because each may change independently.

---

# 2. Core Lifecycle Model

A useful abstraction is:

```text
PERSISTENT IDENTITY
        │
        ├── Authentication may change
        ├── Relationships may begin/end
        ├── Roles may change
        ├── Standing may change
        ├── Authority may be granted/revoked
        ├── Ownership may transfer
        ├── Organization structure may change
        └── Historical attribution remains reconstructible
```

The UX should reflect current state without destroying historical truth.

---

# 3. Core Terms for ZyUX-006

## 3.1 Lifecycle Event

An event that materially changes current participation or relationship.

Examples:

- hire;
- termination;
- promotion;
- delegation;
- revocation;
- credential loss;
- SSO revocation;
- department merger;
- organization merger;
- organization dissolution;
- ownership transfer;
- death;
- succession decision.

---

## 3.2 Offboarding

The governed ending or reduction of a Subject's current relationship, Standing, Authority, access, or host participation.

Offboarding is not identity deletion.

---

## 3.3 Historical Attribution

The ability to reconstruct who/what performed, approved, observed, decided, or executed something under the relevant context at the relevant time.

---

## 3.4 Recovery

A governed process for restoring legitimate access or administrative continuity after credential, administrator, host, or relationship disruption.

Recovery is not privilege creation.

---

## 3.5 Succession

A governed process by which ownership, responsibility, or other legally transferable interests may pass after death, dissolution, merger, or other qualifying event.

Succession SHALL NOT be treated as universal Authority inheritance.

---

## 3.6 Life-State

A governed state relevant to the continued participation of a natural person or other Subject.

Examples may include:

```text
Active
Reported deceased / unresolved
Participation restricted
Deceased / established
Succession pending
```

Final semantics remain open.

---

# 4. Primary ZyUX-006 Laws

## ZyUX-006-L01 — Identity Survives Access Loss

> **Revoking credentials, ending employment, ending a contract, or removing an organization relationship SHALL NOT by itself erase canonical Identity.**

---

## ZyUX-006-L02 — Future Capability May End Without Historical Rewrite

> **Ending Standing or Authority SHALL stop future capability while preserving the historical validity and attribution of actions legitimately performed while that Standing/Authority was active.**

---

## ZyUX-006-L03 — Historical Attribution Does Not Guarantee Perpetual Visibility

> **A Subject may remain historically attributable to an action without retaining indefinite access to all underlying organizational data.**

---

## ZyUX-006-L04 — Current State Must Not Rewrite Past State

> **Current organization, role, policy, ownership, or Standing SHALL NOT be substituted for the historical context that applied at the relevant valid time.**

---

## ZyUX-006-L05 — Credential Recovery Is Not Identity Creation

> **Recovering access SHALL restore legitimate connection to an existing Identity where established; it SHALL NOT silently manufacture a replacement Subject.**

---

## ZyUX-006-L06 — No Hidden Universal Recovery Master

> **Recovery SHALL NOT depend on an invisible universal Zyppi super-admin capable of assuming any Subject or organization identity.**

---

## ZyUX-006-L07 — Recovery Assurance Must Match Consequence

> **Higher-risk recovery requires stronger Evidence, approval, delay, quorum, or equivalent assurance as governed.**

---

## ZyUX-006-L08 — Offboarding Is Scope-Specific

> **Ending one relationship SHALL NOT automatically terminate unrelated relationships, credentials, or personal contexts.**

---

## ZyUX-006-L09 — Organization Change Is Temporal

> **Department, leadership, merger, acquisition, split, or dissolution changes current structure without rewriting historical organizational attribution.**

---

## ZyUX-006-L10 — Ownership Transfer Does Not Equal Authority Transfer

> **Ownership or economic interest may transfer according to law/policy without automatically transferring managerial, employment, office, signing, or delegated Authority.**

---

## ZyUX-006-L11 — Death Is Not Identity Deletion

> **A governed death/life-state transition SHALL change current participation as appropriate without erasing Identity or historical attribution.**

---

## ZyUX-006-L12 — Life-State Requires Evidence

> **A consequential life-state change SHALL NOT be established by a casual user assertion alone.**

---

## ZyUX-006-L13 — Recovery Must Preserve Scope Isolation

> **A recovered Subject SHALL regain only legitimate scope, not every historical or related context known to Zyppi.**

---

## ZyUX-006-L14 — Historical Views Must Be Clearly Historical

> **Users SHALL be able to distinguish current actionable state from historical reconstruction.**

---

## ZyUX-006-L15 — Host Removal Does Not Erase Zyppi History

> **Disconnecting or replacing a host SHALL stop future authorized integration while preserving governed historical attribution/Receipts as required.**

---

## ZyUX-006-L16 — Lifecycle Events Must Be Explainable

> **When capability disappears or changes unexpectedly, Zyppi SHOULD explain the relevant lifecycle reason at the appropriate disclosure level.**

---

# 5. Lifecycle State Families

ZyUX-006 recognizes several state families.

## 5.1 Authentication State

Examples:

```text
Active
Pending verification
Revoked
Expired
Lost
Replaced
```

---

## 5.2 Relationship State

Examples:

```text
Invited
Active
Suspended
Ended
Historical
```

---

## 5.3 Standing State

Examples:

```text
Valid
Suspended
Expired
Revoked
Unresolved
```

---

## 5.4 Delegation State

Examples:

```text
Pending
Active
Suspended
Expired
Revoked
Ended with relationship
```

---

## 5.5 Organization State

Examples:

```text
Active
Reorganizing
Merged
Dissolved
Successor relationship pending
```

---

## 5.6 Life-State

Examples remain open and jurisdiction-sensitive.

ZyUX may present plain-language states while underlying doctrine remains precise.

---

# 6. Employment Termination

Ahmed is fired from Company A.

Current effects may include:

```text
Company A SSO → revoked
Company A relationship → ended
Company A Standing → revoked
Company A delegations → revoked
Company A current visibility → ended
```

Unaffected:

```text
Ahmed canonical Identity
Personal Gmail
Personal mobile
Mimi relationship
Company B relationship
Company X freelance relationship
Historical Company A attribution
```

This is the canonical offboarding model.

---

# 7. Immediate Offboarding Experience

The user may see:

```text
Your Company A access has ended.
```

Where legitimate:

```text
This does not affect your other Zyppi contexts.
```

Available next actions may include:

```text
[Return to other contexts]
```

Do not expose new Company A information after revocation.

---

# 8. Employer Offboarding View

Company A administrator may see:

```text
Ahmed
Former employee

Relationship ended:
6 Sep 2026

Current access:
None

Historical actions:
Retained according to policy
```

The company SHALL NOT gain unrelated personal visibility.

---

# 9. Mid-Session Revocation

If access is revoked while Ahmed is actively viewing Company A:

- sensitive content should close/refresh as policy requires;
- current actions should disappear;
- pending drafts may be invalidated or preserved for company recovery according to policy;
- the user should receive a clear message.

Example:

```text
Your Company A access has ended.
This page is no longer available.
```

---

# 10. Draft Ownership at Offboarding

Drafts raise an important lifecycle question.

A draft may be:

- personal;
- company-owned;
- shared;
- not yet committed.

ZyUX-006 does not define ownership law.

It requires the system to avoid silently transferring personal drafts to the company or deleting company-owned drafts without governance.

This remains a ratification question.

---

# 11. Historical Attribution After Employment

Years later:

```text
Invoice #882
Approved by:
Ahmed

Capacity:
Company A — Accountant

Standing:
Valid at approval time

Date:
12 Feb 2025
```

Current employment status is irrelevant to historical attribution.

---

# 12. Historical Access After Employment

Ahmed may be allowed to see:

```text
I approved Invoice #882
```

while not seeing:

- current supplier contract;
- current employee notes;
- current finance data;
- later company updates.

> **Attribution can persist while data visibility narrows.**

---

# 13. Former-Participant History Surface

Possible:

```text
History

Company A
Former relationship
2024–2026

Current access:
None

Historical records:
Available as permitted
```

This is distinct from active context.

---

# 14. Relationship End Without Conflict

Some relationships simply complete.

Example:

```text
Contract completed
```

UX:

```text
Company X contractor relationship ended.
```

No punitive language required.

---

# 15. Suspension vs Termination

Suspension may be temporary.

Example:

```text
Company A access suspended
```

This should not be displayed as:

```text
Employment ended
```

unless that is true.

---

# 16. Delegation Expiry

Example:

```text
Auditor access
Expired 30 Sep
```

Future access disappears automatically.

Historical review remains according to policy.

---

# 17. Delegation Revocation

Example:

```text
Sarah's approval access was revoked.
```

This stops future approvals.

Past approvals remain attributable.

---

# 18. Re-delegation Revocation Cascade

If a parent delegation is revoked, downstream delegated capability may need to end.

UX should make dependency clear where useful.

Example:

```text
Your access ended because the parent delegation from Logistics Co was revoked.
```

Exact cascade semantics belong to Delegation authority.

---

# 19. Organization Restructure

Department change:

```text
Finance + Procurement
→ Commercial Operations
```

Current UX:

```text
Commercial Operations
```

Historical:

```text
2025 action
Department: Procurement
```

No retroactive rename.

---

# 20. Leadership Change

Example:

```text
CEO 2025: Hassan
CEO 2027: Mary
```

Historical decisions remain attributed to Hassan.

Mary receives current Authority only through current governance.

---

# 21. Organization Merger

Example:

```text
Company A + Company B → Company C
```

ZyUX should distinguish:

```text
Historical actor:
Company A
```

from:

```text
Current successor organization:
Company C
```

where governing/legal semantics establish succession.

Do not rewrite all Company A actions as Company C actions.

---

# 22. Organization Acquisition

Acquisition may not mean legal identity merger.

UX SHALL not assume:

```text
acquired = dissolved
```

Legal/organizational state remains governed.

---

# 23. Organization Split / Spin-Out

A business may split.

Historical records stay with their historical organizational identities.

Successor access/ownership depends on governance.

---

# 24. Organization Dissolution

Possible current view:

```text
Company A
Status: Dissolved

Current operational actions:
None

Historical records:
Available as authorized
```

Dissolution is not record deletion.

---

# 25. Sole Administrator Departure

An organization must survive the departure of one administrator.

If the only administrator leaves:

```text
organization Identity remains
```

A governed administrative recovery path is required.

---

# 26. Administrative Recovery

Potential mechanisms:

- another active administrator;
- enterprise IdP administrator;
- legal organization Evidence;
- recovery delegate;
- quorum;
- time-delayed process;
- support-assisted governed review.

No hidden universal Zyppi superuser.

---

# 27. Sole Trader Recovery

A sole trader may have:

```text
one person
one organization
one admin
```

Recovery must remain simple enough for legitimate use while still preventing takeover.

Potential path:

```text
secondary credential
→ identity Evidence
→ delayed recovery
```

Exact method remains open.

---

# 28. High-Sensitivity Organization Recovery

A bank/regulator/high-risk organization may require:

- multiple admins;
- quorum;
- IdP proof;
- legal entity verification;
- time delay;
- dual control.

Same architecture.

Different policy.

---

# 29. Lost Phone

Ahmed loses mobile access.

Possible:

```text
mobile → unavailable
Gmail → still active
```

No issue.

Add new mobile later.

Identity unchanged.

---

# 30. Lost Email

If mobile/passkey remains:

```text
remove old email
add new email
```

Identity unchanged.

---

# 31. Lost All Personal Credentials

Now recovery is required.

The system should not reveal unrelated context merely to prove identity.

Possible:

```text
We need another way to verify this is you.
```

Not:

```text
You own Mimi and work at Company B — confirm?
```

---

# 32. Corporate SSO as Only Credential

If Ahmed only ever used Company A SSO and is fired:

- Company A access ends;
- canonical Identity remains;
- no automatic personal login is created;
- future personal access requires governed identity recovery/linking if legitimate.

This protects both the company and Ahmed.

---

# 33. Credential Reassignment Risk

Mobile/email may be reassigned to another person.

Therefore recovery SHALL NOT assume possession of an old recycled identifier proves continuity.

---

# 34. Credential Compromise

If a credential is compromised:

```text
credential revoked
sessions invalidated
```

where appropriate.

Unrelated Identity/history remains.

---

# 35. Session Revocation

Session end is not account deletion.

UX must distinguish:

```text
Sign out
End all sessions
Remove sign-in method
End organization access
Deactivate participation
```

These are different.

---

# 36. Account Deactivation

A Subject may stop actively using Zyppi.

UX may offer:

```text
Deactivate my access
```

This should not promise:

```text
Erase every historical record about me
```

unless governing privacy/legal doctrine makes that possible.

---

# 37. Privacy / Erasure Boundary

There may be tension between:

- right-to-erasure;
- historical corporate accountability;
- Receipt integrity;
- legal retention;
- personal privacy.

ZyUX-006 does not resolve the law.

It requires the UX to avoid false promises.

Possible plain language:

```text
Some records may need to be retained for legal, security, or audit reasons.
```

only where legally appropriate and accurate.

---

# 38. Pseudonymized Historical Attribution

Future legal/privacy doctrine may permit or require some historical records to preserve accountable continuity while reducing directly identifying personal data.

ZyUX-006 does not define when.

It recognizes this as a design possibility.

---

# 39. Life-State: Death

Ahmed dies.

The correct model is not:

```text
Delete Ahmed account
```

It is:

```text
Ahmed Identity remains
active participation changes
authentication restricted
delegations reviewed/terminated
ownership/succession may begin
history remains
```

---

# 40. Reported Death

A report may enter:

```text
Death reported
```

without establishing:

```text
Deceased
```

until required Evidence/Authority exists.

---

# 41. Death Evidence

Potential Evidence may include:

- government record;
- death certificate;
- authorized registrar;
- other lawful Evidence.

ZyUX does not determine sufficiency.

---

# 42. Pending Life-State

During unresolved state, high-risk actions may be restricted by policy.

The UX must avoid either:

- allowing obviously unsafe activity;
- falsely declaring death.

---

# 43. Established Death

Once governing rules establish the state:

potential experience:

```text
Ahmed
Status: Deceased

Interactive access:
Restricted

Historical records:
Preserved

Succession:
Pending / in progress
```

Exact wording remains open.

---

# 44. Death Does Not Transfer Employment Authority

If Ahmed was:

```text
Company A Manager
```

his children do not inherit:

```text
Manager Authority
```

---

# 45. Ownership Succession

If Ahmed owned:

- shares;
- property;
- animal;
- vehicle;
- other inheritable assets;

those relationships may enter succession according to law.

The UX should represent:

```text
Ownership succession pending
```

rather than immediately assign heirs.

---

# 46. Mimi Example

Ahmed owns Mimi.

Ahmed dies.

Mimi remains Mimi.

Possible state:

```text
Mimi

Former owner:
Ahmed

Current custody/ownership:
Pending succession
```

Later:

```text
New lawful owner/custodian:
Omar
```

Mimi's identity/history remain.

---

# 47. Company Shares Example

Ahmed owns 20% of Company X and is CEO.

Death:

```text
Shares → succession
CEO Authority → ends
```

Heirs may inherit shares.

They do not automatically become CEO.

---

# 48. Disputed Succession

If heirs disagree:

```text
Ownership:
Disputed / unresolved
```

Zyppi should not guess.

Authority may remain constrained according to governing policy.

---

# 49. Temporary Estate / Representative

A lawful estate representative may receive scoped Authority.

That Authority is not the deceased Subject's original Authority.

It is a new governed relationship.

---

# 50. Organization Succession

If Company A dissolves and Company C assumes obligations:

historical Receipts still identify Company A as historical actor.

Company C may have successor rights/obligations separately.

---

# 51. Host Removal

If SAP integration is removed:

```text
future host reads/writes stop
historical Receipts remain
```

where governed.

Host removal is not organization deletion.

---

# 52. Host Replacement

```text
SAP → Oracle
```

The organization and its Zyppi history remain.

New host mappings replace old integration context.

---

# 53. Host Credential Expiry

Example:

```text
SAP connection expired
```

This affects integration.

It should not change Trust/Identity/organization state.

---

# 54. Host Migration Historical Context

Historical actions may say:

```text
Host:
SAP
```

even after organization uses Oracle today.

---

# 55. Offboarding External Partner

Manufacturer removes Logistics Co.

Effects:

- future delegated shipment access ends;
- current assignments close as governed;
- historical delivery actions remain;
- Logistics Co other client relationships remain.

---

# 56. Agency Client End

Client A terminates Agency Z.

Unaffected:

```text
Agency Z
Client B
Client C
```

No global agency Identity change.

---

# 57. Auditor Access Expiry

Audit access may be time-bounded.

After expiry:

```text
Current access:
None
```

Historical fact:

```text
Auditor had read access during Sep
```

may remain.

---

# 58. Regulator Relationship End

Regulatory scope may expire or change.

Current authority changes.

Historical regulatory actions remain attributable.

---

# 59. Public Observer Lifecycle

A public observer may never create an account.

No lifecycle record is needed beyond legitimate anonymous interaction telemetry.

Avoid forcing account lifecycle onto public observation.

---

# 60. Customer Ownership Transfer

A product owner transfers product ownership.

Current owner:

```text
New owner
```

Historical:

```text
Former owner
```

Warranty/service rights may change according to application policy.

---

# 61. Product Resale

Resale may:

- end one customer relationship;
- create another;
- preserve product Identity/history.

The product does not become a new Object.

---

# 62. Vehicle Sale

Same pattern:

```text
Vehicle Identity persists
Ownership changes
Insurance/service relationships change
```

---

# 63. Property Transfer

Property/Place/Object identity may persist while ownership changes.

Legal semantics remain outside ZyUX.

---

# 64. Device Ownership Transfer

A camera/device may change owner.

Manufacturer relationship may remain.

Service/claim capability may change.

---

# 65. Revocation Reason

Where appropriate, UX may show:

```text
Access ended because employment ended.
```

or:

```text
Delegation expired.
```

Sensitive reasons should remain scoped.

---

# 66. No Over-Disclosure at Offboarding

An employee need not receive:

```text
Termination reason: internal investigation
```

unless authorized.

A simple:

```text
Your access has ended.
```

may be correct.

---

# 67. Historical Timeline

A lifecycle timeline may show:

```text
2024 — Joined Company A
2025 — Finance delegation granted
2026 — Delegation revoked
2026 — Relationship ended
```

Only authorized history.

---

# 68. Current vs Historical Badge

Historical contexts should have a strong visual indicator:

```text
HISTORICAL — NOT CURRENT
```

or equivalent.

Avoid accidental current action.

---

# 69. Historical Replay Boundary

Replay may reconstruct:

```text
What did Zyppi know then?
What Policy applied?
What Authority existed?
```

ZyUX-006 does not define replay mechanics.

It requires clear distinction from current evaluation.

---

# 70. Historical Search

Authorized users may search:

```text
Who approved invoice #882?
```

Search should return historical actor even if current relationship ended.

---

# 71. Historical Organization Search

Example:

```text
Procurement Department
```

may still appear in historical mode after department dissolution.

---

# 72. Historical Identity Continuity

If duplicate identity records were later consolidated:

historical references should still resolve to the canonical Subject without erasing original provenance.

---

# 73. Historical Name Change

If Ahmed changes name:

current profile may show current name.

Historical Receipt may show:

- historical displayed name;
- canonical Subject link;

according to policy.

Do not silently rewrite signed historical text if provenance matters.

---

# 74. Historical Geography Change

Current country does not rewrite historical organization/location context.

---

# 75. Historical Role Change

Promotion:

```text
2025 Accountant
2026 Finance Manager
```

A 2025 action remains attributed to Accountant capacity.

---

# 76. Historical Policy Change

A 2025 action should show Policy v7 if that was applicable.

Today's Policy v12 should not be substituted.

---

# 77. Historical Evidence Change

If Evidence is later corrected/revoked, the historical Receipt may still show what was available at the time while current views show the later correction.

---

# 78. Correction Without Erasure

Corrected records should not necessarily erase historical fact that the earlier record existed and was used.

Exact retention depends on governance.

---

# 79. Recovery UX Principles

Recovery should feel:

- calm;
- specific;
- bounded;
- non-accusatory;
- transparent about delay when necessary.

Avoid:

```text
Your account is gone.
```

when Identity persists.

---

# 80. Recovery Entry

Possible:

```text
Can't sign in?
[Recover access]
```

Then choose safe applicable path.

---

# 81. Recovery Method Discovery

The system may know multiple recovery methods.

It should not expose sensitive metadata unnecessarily.

Example:

```text
Use another verified method
```

rather than showing all hidden contact details.

---

# 82. Recovery With Another Credential

Preferred lowest-friction path:

```text
Passkey unavailable
→ use verified Gmail
→ add new passkey
```

---

# 83. Recovery With Enterprise IdP

For current employee:

```text
Use Company A SSO
```

may restore Company A context.

It does not restore unrelated personal access unless already linked and permitted.

---

# 84. Recovery After Employer Exit

Former Company A SSO cannot be used if revoked.

Personal recovery remains separate.

---

# 85. Organization Recovery

Admin recovery may require stronger path than user recovery because consequences affect many Subjects.

---

# 86. Recovery Quorum

High-risk organization may require:

```text
2 of 3 admins
```

or equivalent.

ZyUX should explain progress simply.

---

# 87. Recovery Delay

A time delay may be appropriate for sensitive takeover prevention.

Example:

```text
Recovery request submitted.
Changes become active after review period.
```

Exact timing remains Security doctrine.

---

# 88. Recovery Notification

Existing administrators may be notified of recovery request where appropriate.

Do not expose sensitive recovery Evidence broadly.

---

# 89. Recovery Dispute

If recovery is challenged:

```text
Recovery paused
Review required
```

No silent takeover.

---

# 90. Emergency Recovery

Emergency mechanisms may exist.

They must be:

- exceptional;
- auditable;
- scoped;
- attributable;
- time-bounded where appropriate.

Emergency is not permanent god mode.

---

# 91. Support-Assisted Recovery

Support may facilitate a governed process.

Support staff SHALL NOT gain arbitrary universal impersonation.

---

# 92. Recovery Receipt

High-risk recovery may need a Receipt documenting:

- request;
- Evidence;
- approvals;
- decision;
- resulting access change.

Exact schema remains outside ZyUX.

---

# 93. Recovery Completion

User-facing:

```text
Access restored.
```

Then show only recovered legitimate contexts.

---

# 94. Recovery Failure

Example:

```text
We couldn't verify this recovery request safely.
```

Offer legitimate next path.

Do not reveal candidate identity contexts.

---

# 95. Account Enumeration

Recovery UI must not reveal whether arbitrary emails/phone numbers correspond to Zyppi Subjects beyond permitted disclosure.

---

# 96. Relationship Enumeration

Recovery must not reveal:

```text
This person works at Company B.
```

unless required and authorized.

---

# 97. Life-State Recovery Conflict

If deceased state was entered incorrectly:

a governed correction process must exist.

Do not let ordinary login silently overwrite established life-state.

---

# 98. False Death Report

False reports must not instantly freeze a Subject.

Evidence threshold/policy must protect against abuse.

---

# 99. Deceased Account Authentication

After established death, prior credentials should not remain a universal path to act as the deceased Subject.

Heirs/representatives need their own identities and delegated/successor relationships.

---

# 100. Heir Experience

Heir does not log in as deceased.

Heir logs in as self.

Then receives:

```text
Estate / successor relationship
```

where established.

---

# 101. Representative Experience

Executor/representative:

```text
Omar
acting as Estate Representative for Ahmed
```

not:

```text
Omar becomes Ahmed
```

This distinction is critical.

---

# 102. Organization Successor Experience

Successor organization acts as itself under a successor relationship.

It does not become the dissolved company.

---

# 103. Historical Access by Heir

Heirs may see only what succession/legal authority permits.

No universal inheritance of all personal or organizational data.

---

# 104. Historical Access by Auditor

Auditor may reconstruct retained proof without gaining current operational capability.

---

# 105. Retention Expiry

When retention ends, data may be removed/anonymized according to governing doctrine.

The UX should not retain stale links that imply inaccessible records are still available.

---

# 106. Receipt Retention

Receipts may have retention rules distinct from source Evidence.

ZyUX does not define them.

---

# 107. Evidence Retention

Evidence may expire, be deleted, redacted, or retained under separate policies.

Historical Receipt may continue to reference unavailable Evidence.

The UX should explain when proof is partial.

---

# 108. Historical Proof Degradation

Example:

```text
Receipt available
One underlying Evidence record is no longer available
```

This is more honest than pretending full proof remains.

---

# 109. Organization Data Export at Exit

An organization may have export rights.

A former employee may not.

Export scope must follow Authority.

---

# 110. Personal Export

A Subject may have a right to export some personal data.

This does not imply export of employer-owned data.

Legal/privacy doctrine governs.

---

# 111. Relationship End Notifications

Affected Subjects may receive:

```text
Your access to Company A ends on 30 Sep.
```

when advance notice is appropriate.

Immediate revocation may skip notice for security reasons.

---

# 112. Expiry Reminder

Temporary delegation may show:

```text
Auditor access expires in 3 days.
```

Useful for admins/auditors.

---

# 113. Renewal

Expired/expiring delegation may be renewed by an authorized Subject.

Renewal is a new/extended Authority event, not silent continuation.

---

# 114. Auto-Renewal

If allowed, auto-renewal must be explicit and governed.

Do not assume indefinite Authority.

---

# 115. Scheduled Offboarding

Known end date:

```text
Contract ends 30 Sep
```

The system may schedule access end.

---

# 116. Immediate Offboarding

Security incident may require instant revocation.

UX must prioritize protection.

---

# 117. Grace Period

Some relationships may have:

```text
read-only grace period
```

after operational capability ends.

Only if policy permits.

---

# 118. Read-Only Historical Mode

A useful pattern:

```text
Former relationship
Read-only historical view
```

This must be clearly non-operational.

---

# 119. No Updates After End

Former participants generally should not continue receiving new organization updates outside retained lawful scope.

---

# 120. Notification Unsubscribe vs Relationship End

Stopping notifications does not end relationship.

Ending relationship does not necessarily mean all legally required notifications stop.

These are separate.

---

# 121. Billing Offboarding Boundary

Billing role may end independently.

ZyUX-006 does not define billing lifecycle.

---

# 122. Developer Offboarding

Developer leaving organization:

- API access revoked;
- org credentials revoked;
- personal developer Identity remains;
- unrelated projects remain;
- historical code/API actions remain attributable as governed.

Detailed profile belongs to `ZyUX-DEVELOPER-001`.

---

# 123. Agent Offboarding

Agent access can be:

- revoked;
- rotated;
- suspended;
- expired.

Agent historical actions remain attributable.

Principal/delegation chain remains reconstructible.

---

# 124. Machine Credential Rotation

Machine identity/credential rotation should not create duplicate machine Subject/Object identity where equivalence is established.

---

# 125. Host Service Account Offboarding

Service account revocation ends integration capability.

It should not erase organization relationship/history.

---

# 126. Public Customer Lifecycle

Customer may go from:

```text
Public observer
→ purchaser
→ owner
→ former owner
```

Each state changes available capabilities.

---

# 127. Warranty Lifecycle

Warranty may be:

```text
Eligible
Active
Expired
Transferred
Claim open
Claim closed
```

Application-specific semantics live elsewhere.

ZyUX-006 requires clear state transitions and history.

---

# 128. Product Recall Lifecycle

Recall may begin after purchase.

Historical purchase context remains.

Current alert should appear according to policy.

---

# 129. Animal Ownership Lifecycle

```text
Owner A
→ transfer
→ Owner B
```

Animal Identity remains.

Historical owner remains historical.

---

# 130. Farmer / Land Lifecycle

Farm management relationship may change.

Tree/field identity/history remain.

---

# 131. Government Authority Lifecycle

Permit/license/inspection authority may:

- begin;
- expire;
- suspend;
- revoke.

The Subject/organization Identity remains.

---

# 132. Delegation Snapshot at Action Time

Consequential action should be able to preserve:

```text
delegation state at action time
```

for historical reconstruction.

---

# 133. Standing Snapshot at Action Time

Likewise.

---

# 134. Organization Structure Snapshot

Where relevant, historical view may reconstruct:

```text
Company A
→ Finance
→ Ahmed
```

as of 2025.

---

# 135. Host Snapshot

Historical Receipt may record:

```text
Host: SAP
Adapter v...
```

where relevant.

---

# 136. Contextual History

History should be reachable from the relevant Subject/Object/organization context.

Avoid forcing users into a universal audit module for every historical question.

---

# 137. Global Audit

Auditors/admins may also need a global audit surface.

This is a genuinely global Job.

---

# 138. History vs Activity Feed

Activity feed is not necessarily authoritative historical proof.

Receipts/provenance remain deeper authority.

---

# 139. User-Friendly History

Ordinary user:

```text
12 Feb 2025
You approved Invoice #882
```

Expert:

```text
Authority
Policy
Evidence
Receipt
```

---

# 140. Correction of Historical Display

If display metadata changes, the UX may update labels while preserving original provenance where needed.

---

# 141. Historical Subject Merge

If identity records later consolidate:

old actions should resolve to one canonical Subject.

No duplicated person in user-facing history.

---

# 142. Historical Organization Merge

Old organization identities remain historical actors even if successor exists.

---

# 143. Cross-Time Search

Authorized search may support:

```text
2025
2026
Current
```

Historical/current results must be labeled.

---

# 144. Time-Zone Handling

Lifecycle events must display understandable local time while preserving canonical timestamps underneath.

Exact time policy belongs elsewhere.

---

# 145. Effective Time vs Recorded Time

Example:

```text
Employment ended effective:
1 Sep

Recorded in Zyppi:
3 Sep
```

Where difference matters, UX should expose both.

---

# 146. Future-Dated Changes

Example:

```text
Access will end 30 Sep
```

The user should distinguish scheduled from already effective.

---

# 147. Backdated Changes

Backdating may affect historical evaluation.

This is high risk.

ZyUX should surface backdated effective time clearly where allowed.

---

# 148. Disputed Historical Change

If a historical authority record is disputed:

```text
Historical status disputed
```

rather than silently rewriting.

---

# 149. Legal Hold

Legal hold may prevent deletion/erasure.

UX should avoid promising deletion while hold exists.

Legal terminology must be reviewed.

---

# 150. Recovery & Privacy Tradeoff

Recovery asks for Evidence.

Privacy requires minimization.

Therefore:

> **Ask for enough Evidence to restore legitimate access — not every identity fact Zyppi could theoretically collect.**

---

# 151. Recovery & Security Tradeoff

Frictionless entry does not imply frictionless high-risk recovery.

Recovery risk is often higher than signup risk.

---

# 152. Recovery & UX Honesty

If review takes time:

```text
Your recovery request is under review.
```

Do not imply instant completion.

No fabricated time estimate unless system provides one.

---

# 153. Recovery Status

Possible:

```text
Submitted
Evidence needed
Under review
Approved
Denied
Expired
Disputed
```

Exact states remain open.

---

# 154. Recovery Expiry

Unused recovery links/requests may expire.

Expired recovery does not erase Identity.

---

# 155. Recovery Cancellation

Authorized requester may cancel pending recovery where safe.

---

# 156. Recovery Abuse

Repeated suspicious attempts may trigger security controls.

User-facing messaging should remain safe and non-enumerating.

---

# 157. Lifecycle Notifications

Different events may notify different Subjects:

- delegation expiry;
- admin loss;
- host disconnect;
- ownership transfer;
- recovery request;
- organization merger;
- account compromise.

Disclosure must remain scoped.

---

# 158. Notification Retention

Notifications are not authoritative historical record.

Receipts/history remain deeper proof.

---

# 159. Cross-Context Lifecycle Isolation

Company A termination should not produce:

```text
Your Zyppi account is terminated.
```

Prefer:

```text
Your Company A access ended.
```

This language matters.

---

# 160. Personal Context Continuity

After Company A termination, Ahmed may still open:

```text
Mimi
Company B
Company X
```

without account recreation.

---

# 161. Organization Context Continuity

After Ahmed leaves, Company A continues.

One human departure cannot orphan organization identity/history.

---

# 162. Object Context Continuity

After ownership transfer, Product/Vehicle/Mimi identity persists.

---

# 163. Place Context Continuity

After tenant/owner change, Place identity may persist.

---

# 164. AI/Agent Historical Continuity

If Agent X is retired:

historical actions remain attributed to Agent X and principal/delegation context.

Do not rewrite as actions of replacement Agent Y.

---

# 165. Replacement Account / Agent

Replacing a human credential or agent instance does not transfer historical authorship.

---

# 166. Deactivated Organization Member

Do not recycle historical identity references to a new employee.

---

# 167. Reused Email Address

If company reassigns:

```text
finance@company.com
```

to a new person, Zyppi must not conflate the new Subject with the old one merely because email matches.

This is a crucial lifecycle/identity safety invariant.

---

# 168. Reused Employee Number

Same risk.

Identifiers may be recycled.

Historical subject identity must remain stable.

---

# 169. Reused Device

Shared/reassigned device credentials must not silently transfer user Identity.

---

# 170. Historical Attribution After Identity Correction

If Zyppi discovers past actions were attached to wrong candidate identity:

correction must preserve audit provenance.

Do not silently rewrite without trace.

---

# 171. Recovery of Wrongly Consolidated Identity

If two Subjects were incorrectly consolidated:

a governed correction process must split/reconcile history safely.

This is outside detailed scope but must be anticipated.

---

# 172. Lifecycle Error States

Examples:

```text
Access ended
Recovery required
Relationship unresolved
Succession pending
Historical record unavailable
Host disconnected
Delegation expired
```

Do not collapse into generic `Account error`.

---

# 173. Lifecycle Explanation

Use plain language.

Prefer:

```text
Your access ended when your Company A employment ended.
```

over:

```text
Standing vector revoked due to relationship termination.
```

---

# 174. Progressive Lifecycle Explanation

Level 1:

```text
Access ended
```

Level 2:

```text
Your Company A relationship ended.
```

Level 3:

```text
Future Company A actions are no longer available.
Historical actions remain recorded.
```

Level 4:

Receipt/authority details where authorized.

---

# 175. Accessibility

Lifecycle/recovery flows are stressful and high consequence.

They must be:

- keyboard accessible;
- screen-reader clear;
- explicit about current vs historical;
- not dependent on color;
- clear about irreversible actions;
- understandable without legal jargon where possible.

---

# 176. Localization

Terms like:

- revoked;
- suspended;
- expired;
- deceased;
- succession;
- historical;

must be translated carefully to preserve meaning.

---

# 177. Mobile Recovery

Recovery should work safely on mobile.

Avoid requiring desktop-only flows unless consequence truly justifies it.

---

# 178. Offline / Connectivity Boundary

Credential loss and connection outage are different.

Do not tell a user:

```text
Access revoked
```

when the network is simply unavailable.

---

# 179. System Failure vs Lifecycle State

Likewise:

```text
Company A directory unavailable
```

does not mean:

```text
Employment ended
```

---

# 180. Telemetry & Validation

ZyUX-006 should eventually measure:

- offboarding completion time;
- stale-access incidents;
- post-termination unauthorized attempts;
- recovery success;
- recovery fraud/abuse incidents;
- recovery abandonment;
- multi-context collateral revocation incidents;
- wrong historical attribution incidents;
- former-user support burden;
- admin-recovery success;
- host-removal cleanup;
- organization-migration continuity;
- life-state correction incidents;
- relationship-history comprehension;
- audit reconstruction time.

Telemetry must remain scope-safe.

---

# 181. Security Review Requirements

Review:

- stale sessions;
- token revocation;
- credential reassignment;
- recovery takeover;
- admin recovery;
- privilege resurrection;
- downstream delegation revocation;
- shared accounts;
- reused email/employee IDs;
- support impersonation;
- deceased-credential abuse;
- heir/estate takeover;
- host token persistence;
- agent credential rotation;
- historical proof leakage.

---

# 182. Privacy / Legal Review Requirements

Review:

- right-to-erasure;
- legal retention;
- historical attribution;
- pseudonymization;
- succession;
- deceased-person data;
- heir access;
- employment records;
- former-employee visibility;
- legal hold;
- organization dissolution;
- export rights;
- jurisdiction-specific terminology.

---

# 183. Relationship to Other ZyUX Documents

## `ZyUX-001`
Owns entry, authentication, credential linking, and front-door recovery boundary.

## `ZyUX-002`
Owns organization, delegation, scope, relationship states, and authority relationships.

## `ZyUX-003`
Owns how active/historical contexts appear or disappear after lifecycle changes.

## `ZyUX-004`
Owns explanation/proof of historical Authority, Standing, Evidence, and Receipt.

## `ZyUX-005`
Owns host connection lifecycle, migration, removal, and Host-Native continuity.

`ZyUX-006` owns the **temporal continuity and change experience across all ZyUX surfaces**.

---

# 184. Explicit Non-Scope

`ZyUX-006` does not define:

- legal inheritance law;
- probate;
- employment law;
- privacy law;
- retention schedules;
- cryptographic recovery;
- exact security factors;
- database archival mechanics;
- deletion/anonymization implementation;
- disaster recovery;
- backup restoration;
- final Receipt retention;
- final life-state ontology;
- court admissibility.

---

# 185. Drift Prohibitions

`ZyUX-006` SHALL NOT drift into:

- delete user = delete person;
- fire employee = delete history;
- current role = historical role;
- current policy = historical policy;
- current org chart = historical org chart;
- heir = deceased Subject;
- inherited shares = inherited CEO Authority;
- SSO revocation = global account deletion;
- host removal = history deletion;
- recovery = new identity;
- support agent = universal master;
- recycled email = same person;
- expired delegation = erased delegation;
- suspended = terminated;
- unavailable = revoked;
- anonymous public user = account lifecycle.

---

# 186. Ratification Questions

Before ratification, Council should disposition:

1. Final relationship lifecycle states.
2. Final Standing/delegation lifecycle labels.
3. Former-participant historical visibility.
4. Draft ownership at termination.
5. Read-only grace period policy.
6. Administrator recovery model.
7. Sole-trader recovery model.
8. High-sensitivity organization recovery.
9. Recovery notification and dispute process.
10. Whether high-risk recovery requires Receipt.
11. Life-state terminology.
12. Evidence threshold for death/life-state change.
13. False-death correction path.
14. Heir/estate representative model.
15. Ownership succession presentation.
16. Historical name changes.
17. Historical identity consolidation/correction.
18. Reused identifier handling.
19. Legal/privacy deletion vs historical attribution.
20. Pseudonymization presentation.
21. Host removal retention.
22. Organization merger/successor presentation.
23. Historical source/Evidence availability degradation.
24. Accessibility baseline for recovery.
25. Which lifecycle events mandate user notification.

---

# 187. Proposed Acceptance Invariants

### AX-006-01 — Employment End Does Not Delete Identity
Ending Company A access does not erase Ahmed.

### AX-006-02 — Unrelated Contexts Survive
Company A termination does not affect Company B, personal, or freelance contexts.

### AX-006-03 — Future Capability Ends
Revoked Standing prevents new Company A actions.

### AX-006-04 — Historical Attribution Survives
Past valid actions remain attributed to Ahmed.

### AX-006-05 — Historical Data Access Is Separately Governed
Attribution does not imply indefinite access to company data.

### AX-006-06 — Current Structure Does Not Rewrite History
Department/leadership changes preserve historical organizational context.

### AX-006-07 — Credential Loss Does Not Create New Identity
Recovery reconnects legitimate access to existing Identity.

### AX-006-08 — No Universal Recovery Master
Support/admin recovery cannot bypass governance universally.

### AX-006-09 — Recovery Is Scoped
Recovered Subject receives only legitimate contexts.

### AX-006-10 — Reused Email Does Not Reassign Historical Subject
Credential reuse cannot overwrite historical identity attribution.

### AX-006-11 — Organization Survives Administrator Departure
Organization identity/history do not depend on one human admin.

### AX-006-12 — Host Removal Stops Future Integration
Disconnected host cannot continue authorized reads/writes.

### AX-006-13 — Host Removal Preserves Historical Receipt
Historical governed proof remains according to retention.

### AX-006-14 — Ownership Transfer Does Not Transfer Delegated Authority
Heirs/buyers do not automatically receive office/employee/admin Authority.

### AX-006-15 — Death Does Not Delete Identity
Life-state changes current participation, not historical existence.

### AX-006-16 — Heir Acts as Self
Successor/representative does not authenticate as deceased Subject.

### AX-006-17 — Historical View Is Clearly Historical
Users cannot mistake historical state for current operational state.

### AX-006-18 — Recovery Does Not Leak Context
Recovery does not reveal unrelated employers/assets/relationships.

### AX-006-19 — Suspension Is Distinct From Termination
Temporary states are not rendered as permanent end.

### AX-006-20 — Service Failure Is Not Lifecycle Change
Outage does not become revocation/termination.

---

# 188. Canonical Journey Set for Future Prototyping

1. Employee resigns normally.
2. Employee is terminated immediately.
3. Employee termination while active session open.
4. Contract reaches scheduled end date.
5. Delegation expires automatically.
6. Delegation revoked manually.
7. Parent delegation revoked; downstream access ends.
8. User retains other organization contexts.
9. Former employee opens historical context.
10. Former employee tries current action.
11. Admin reviews former employee history.
12. Department merges.
13. Department dissolves.
14. Leadership changes.
15. Company merger.
16. Company acquisition without identity merger.
17. Company split/spin-out.
18. Company dissolution.
19. Sole admin leaves.
20. Organization admin recovery.
21. Sole trader loses phone but has email.
22. Sole trader loses all credentials.
23. Enterprise user loses company SSO.
24. Former employee had only SSO.
25. Mobile number reassigned.
26. Corporate email reassigned.
27. Employee number reused.
28. Credential compromise and session revocation.
29. User deactivates personal access.
30. Privacy/erasure request meets retained corporate Receipt.
31. Person death reported.
32. Death report remains unresolved.
33. Death established.
34. False death report corrected.
35. Shares enter succession.
36. CEO Authority terminates.
37. Heir receives ownership but no office Authority.
38. Estate representative receives new scoped Authority.
39. Mimi ownership enters succession.
40. Product ownership transfers to new customer.
41. Vehicle ownership transfer.
42. Device ownership transfer.
43. Agency loses Client A, keeps B/C.
44. Logistics provider removed from manufacturer.
45. Auditor access expires.
46. Regulator relationship changes.
47. SAP integration removed.
48. SAP → Oracle migration.
49. Old host remains in historical Receipt.
50. Agent credential revoked.
51. Replacement agent does not inherit authorship.
52. Historical role changes from Accountant → Manager.
53. Historical policy v7 vs current v12.
54. Historical Evidence later corrected.
55. Identity records consolidate after old actions.
56. Wrong identity consolidation corrected.
57. Historical search finds departed employee.
58. Historical organization search finds dissolved department.
59. Recovery request challenged.
60. High-risk recovery uses quorum.

These are experience test cases, not implementation authorization.

---

# 189. Closing Doctrine

> **Identity persists when access ends.**

> **Authority is allowed to disappear. History is not.**

> **A former employee may remain the person who made a decision without remaining entitled to the company's current data.**

> **A department can disappear without erasing the decisions made while it existed.**

> **A company can merge without becoming the historical author of another company's past.**

> **A credential can be lost, revoked, rotated, or reassigned without creating a new person.**

> **Recovery reconnects legitimate access. It must not manufacture Authority.**

> **An heir becomes a successor through a new lawful relationship. They do not become the deceased Subject.**

> **Ownership may transfer. Delegated Authority does not automatically follow.**

> **Death changes participation. It does not erase Identity or rewrite history.**

> **The system must remain simple to use precisely when Reality becomes complicated.**

---

# 190. Status & Next Step

**Current Status:** DRAFT — CHAIR REVIEW.

Recommended review sequence:

1. Chair review.
2. Identity/Standing/Delegation temporal audit.
3. Security review of offboarding, stale sessions, credential reassignment, and recovery.
4. Privacy/legal review of retention, erasure, succession, and deceased-person data.
5. Organization continuity/recovery review.
6. Prototype the 60 canonical journeys.
7. Historical-context usability testing.
8. Recovery usability and abuse testing.
9. Reconcile host lifecycle rules with `ZyUX-005`.
10. Reconcile historical explanation rules with `ZyUX-004`.
11. Close the first horizontal ZyUX foundation set (`000`–`006`).
12. Begin BABY-stage archetype profiles in priority order only after Council disposition of horizontal doctrine.

---

**End of `ZyUX-006 v0.1 — DRAFT FOR CHAIR REVIEW`**

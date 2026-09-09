# ZyUX-001 — Identity, Account & Entry Experience

**Canonical ID:** `ZyUX-001`  
**Version:** 0.1  
**Status:** DRAFT — CHAIR REVIEW  
**Series:** ZyUX — Zyppi Experience Architecture  
**Classification:** Horizontal Experience Doctrine  
**Normative Level:** Experience Doctrine / Product Architecture  
**Date:** 6 September 2026  
**Parent Authority:** `ZyUX-000 — Zyppi Experience Architecture & Master Doctrine`  
**Governing Authority:** NORTH STAR v7.0  
**Coordinates With:** What is Zyppi? v4.0 · Z-PROF-001 v1.2 · ZYAPI v1.1 · MARKET-REALITY-001 · ZYPPI-REALITY-VALIDATION-001 · applicable Identity · Evidence · Authority · Standing · Security doctrine  
**Primary Source Corpus:** `ZYPPI-PARTICIPANT-001` draft · Council identity/account discussion · Ahmed worked example  
**Applies To:** Personal access · Organization access · Enterprise SSO · Invitation acceptance · Claim flows · Authentication linking · Credential rotation · Identity convergence UX · Public-to-authenticated transition · Recovery-entry boundaries

---

# 0. Status & Intent

`ZyUX-001` governs how a Subject enters Zyppi, authenticates, gains or links access, encounters existing Identity, joins an organization, claims a relationship, rotates credentials, loses credentials, and continues to participate without confusing Identity with account.

This document governs **experience**.

It does not redefine constitutional Identity, Evidence, Subject, Authority, Standing, Registry Truth, Security, or Receipt semantics.

It SHALL NOT be interpreted as authorizing:

- automatic identity merger based on one matching field;
- a universal consumer identity provider;
- a replacement for enterprise IAM;
- a master human account that owns every relationship;
- organization ownership of a natural person's canonical Identity;
- cross-scope disclosure merely because identity equivalence is known;
- a centralized personal dossier;
- universal use of government identifiers;
- storage of sensitive identity Evidence without a lawful and governed need.

The governing experience proposition is:

> **Entering Zyppi should be extremely easy. Establishing Identity, Authority, and scope should remain extremely rigorous underneath.**

---

# 1. Purpose

Conventional software commonly collapses:

```text
email
=
account
=
user
=
identity
=
role
=
permissions
```

Zyppi SHALL NOT.

A person may use Zyppi:

- personally;
- through a company;
- through another company;
- as a freelancer;
- through an enterprise SSO provider;
- through a personal email;
- through a mobile number;
- later through a passkey;
- after losing one of those credentials;
- after leaving one employer;
- while preserving unrelated relationships and historical attribution.

An animal, vehicle, product, machine, place, or other identified Reality constituent may participate in relationships without ever authenticating.

Therefore `ZyUX-001` exists to make the entry experience simple while preserving the following distinctions:

```text
REAL SUBJECT
        ↓
CANONICAL IDENTITY
        ↓
AUTHENTICATION / ACCESS CONTEXTS
        ↓
RELATIONSHIPS
        ↓
CURRENT STANDING / AUTHORITY
        ↓
AVAILABLE CAPABILITIES
```

---

# 2. Governing Experience Outcome

The ideal first-use flow is not:

```text
Create a global profile
→ choose industry
→ choose persona
→ configure department
→ choose role
→ choose modules
→ build dashboard
→ configure permissions
→ finally begin
```

The ideal experience is:

```text
ARRIVE
        ↓
AUTHENTICATE only if necessary
        ↓
ESTABLISH / RESOLVE the relevant relationship
        ↓
DERIVE legitimate context
        ↓
SHOW the first useful action
```

Common examples:

```text
Sign up
→ Create organization
→ Begin
```

```text
Invitation
→ Continue with company SSO
→ Accept
→ Work begins
```

```text
Scan animal chip
→ View public information
→ Sign in only when claiming
→ Claim relationship
```

```text
Public product scan
→ No account required
→ View public result
```

The experience must begin from the Job and context rather than from platform administration.

---

# 3. Core Terminology for ZyUX-001

## 3.1 Subject

The constitutional actor/autonomous constituent as defined by governing ontology.

ZyUX does not redefine Subject.

---

## 3.2 Identity

The governed identity relationship or representation referring to a Reality constituent.

Identity is not created merely because a login form is submitted.

---

## 3.3 Account

For ZyUX purposes, an **Account** is the user-facing access construct through which a Subject enters and manages authentication to Zyppi.

An Account is NOT:

- the Subject;
- the canonical Identity;
- the employer;
- the role;
- the Authority;
- the relationship;
- the data tenant.

The word `account` may remain in ordinary UX because users understand it.

Internally, implementations SHOULD preserve the stronger separation between:

```text
Account
Authentication Method
Authentication Binding
Canonical Identity
Relationship
Scope
```

---

## 3.4 Authentication Method

A mechanism used to establish access.

Examples may include:

- Google;
- Microsoft;
- enterprise SSO;
- email;
- mobile;
- passkey;
- government-issued credential where lawful;
- future authorized mechanisms.

---

## 3.5 Authentication Binding

The governed association between an authentication method/credential and the Subject or access context it is permitted to authenticate.

Bindings may be:

- verified;
- pending;
- revoked;
- expired;
- replaced;
- organization-controlled;
- personally controlled.

---

## 3.6 Entry Context

The reason and context through which a person arrives.

Examples:

- direct signup;
- organization invitation;
- scanned NFC chip;
- product QR;
- deep link;
- enterprise host;
- API/developer onboarding;
- recovery;
- claim request.

Entry Context SHOULD shape onboarding.

---

## 3.7 Claim

A request to establish a relationship to an existing Identity-bearing constituent.

Examples:

```text
I own this animal.
I purchased this product.
I manage this device.
I represent this organization.
I am assigned to this shipment.
```

A claim is not automatically true because the user asserts it.

Claims remain subject to applicable Evidence, Authority, Standing, and policy.

---

# 4. The Primary ZyUX-001 Laws

## ZyUX-001-L01 — Access Does Not Create Reality

> **Creating an Account or authentication binding SHALL NOT by itself establish a new canonical real-world Identity where equivalence remains unresolved.**

The user may begin using Zyppi while identity resolution remains appropriately bounded.

---

## ZyUX-001-L02 — One Subject, Many Authentication Contexts

> **A Subject MAY have multiple authentication methods and access contexts while remaining one canonical Subject.**

Example:

```text
Ahmed
├── Gmail
├── Mobile
├── Company A SSO
├── Company B SSO
└── Passkey
```

This does not create five Ahmeds.

---

## ZyUX-001-L03 — Credential Change Is Not Identity Change

> **Adding, removing, rotating, expiring, or revoking a credential SHALL NOT by itself create or erase canonical Identity.**

---

## ZyUX-001-L04 — Identity Convergence Is Evidence-Governed

> **Potential duplicate identities SHALL NOT be silently merged merely because one field matches.**

Possible resolution states must preserve uncertainty.

---

## ZyUX-001-L05 — Convergence Does Not Collapse Scope

> **Establishing that two access contexts refer to the same Subject SHALL NOT merge unrelated relationships, permissions, visibility, retention, or Authority.**

---

## ZyUX-001-L06 — Enterprise IAM Coexists

> **Enterprise users SHOULD be able to enter through their existing legitimate enterprise IdP without creating a parallel enterprise identity lifecycle merely for Zyppi.**

---

## ZyUX-001-L07 — Organization Controls Organization Credential, Not Person

> **An organization MAY revoke the authentication methods, relationships, and delegations it legitimately controls. It SHALL NOT thereby erase or own the natural person's canonical Identity.**

---

## ZyUX-001-L08 — No Account Required When No Account Is Needed

> **Public observation and other legitimate anonymous experiences SHOULD remain accountless until authentication is actually required.**

---

## ZyUX-001-L09 — Minimum Necessary Identity Collection

> **Zyppi SHOULD collect only the identity information necessary for the current legitimate purpose and assurance level.**

---

## ZyUX-001-L10 — Identity Evidence Is Not a Profile Page

> **Sensitive Evidence used for identity resolution SHALL NOT automatically become ordinary profile data or cross-context metadata.**

---

## ZyUX-001-L11 — Entry Should Preserve Intent

> **After authentication, Zyppi SHOULD return the user to the Job that caused authentication rather than diverting them into a generic dashboard.**

---

## ZyUX-001-L12 — Recovery Cannot Become a Hidden Master Key

> **Recovery mechanisms SHALL preserve governed identity assurance and SHALL NOT introduce an invisible universal super-admin path.**

---

# 5. Account Creation Philosophy

## 5.1 The Front Door

The default direct entry should be exceptionally short.

Illustrative experience:

```text
Welcome to Zyppi

Continue with Google
Continue with Microsoft
Continue with mobile
More options
```

or equivalent platform-native methods.

After successful authentication:

```text
What are you here to do?

Create
Join
Claim
```

Only when context did not already answer that question.

If the user entered from an invitation, Zyppi should not ask `Create / Join / Claim`.

It already knows:

```text
Join
```

If the user entered from an NFC chip claim flow, it already knows:

```text
Claim
```

Therefore:

> **Do not ask a question whose answer is already legitimately known from Entry Context.**

---

## 5.2 No Mandatory Global Profile Wizard

Zyppi SHOULD NOT require all new users to complete:

- profile photo;
- job title;
- company size;
- industry;
- department;
- persona;
- address;
- billing profile;
- marketing preferences;
- organization structure;

before first value.

Some information may become necessary later.

Request it when necessary.

---

## 5.3 Personal vs Business Is Not an Identity Split

The onboarding UI SHALL NOT imply:

```text
Personal account
OR
Business account
```

means two different people.

A Subject may legitimately use Zyppi in both capacities.

Where the UX presents contexts, it should communicate that they are different **relationships or workspaces/scopes**, not different human identities.

Possible experience:

```text
Ahmed

Personal
Company A
Company B
Freelance — Company X
```

These are contexts under Ahmed's participation, not separate Ahmed identities.

---

# 6. Direct Signup Journey

## 6.1 Goal

Allow a Subject with no prior explicit invitation or scan context to establish access with the least friction possible.

Illustrative flow:

```text
1. Choose authentication method
2. Authenticate
3. Zyppi checks for lawful existing identity/access relationships
4. If no immediate relationship is known:
      Create
      Join
      Claim
5. Continue to useful action
```

---

## 6.2 Existing Identity May Be Discovered Later

At signup, Zyppi may not yet possess enough Evidence to know whether this access context belongs to an existing canonical Subject.

That is acceptable.

The system may establish a bounded access state without inventing certainty.

Later Evidence may establish equivalence.

Therefore the UX should not promise:

> "You are definitely a brand-new Zyppi identity."

The user only needs to know:

> "Your access is ready."

---

# 7. Organization Creation Journey

## 7.1 Target Flow

For a simple organization:

```text
Sign in
→ Create organization
→ Organization name
→ Minimum required jurisdiction / legal information only if necessary
→ Create
→ Begin
```

No mandatory enterprise configuration.

---

## 7.2 Sole Trader / One-Person Organization

A sole operator should not face enterprise hierarchy setup.

Illustrative:

```text
Create organization
Name: Omar Repairs
[Create]
```

Underneath, Zyppi may establish explicit organization relationships and initial Authority.

The UX may make the founder appear to "have all controls" where legitimate.

The architecture should not require a magical permanent owner bypass.

---

## 7.3 Organization Identity Verification Is Separate

Creating an organization entry does not necessarily prove legal organizational identity.

The system must distinguish:

```text
Organization workspace created
```

from:

```text
Organization identity verified
```

and from:

```text
Legal authority to represent organization established
```

These may occur at different times depending on the Job.

Do not block low-risk first utility behind unnecessary high-assurance verification.

Do not allow high-risk action before required assurance.

---

# 8. Organization Join / Invitation Journey

## 8.1 Invitation Should Carry Context

A good invitation contains enough governed context to avoid configuration.

Example:

```text
Company A invited you

Role/Job:
Finance Reviewer

Scope:
Egypt Operations

[Continue with Company SSO]
```

The recipient should not then need to manually select:

- Company A;
- department;
- job;
- permissions;
- environment.

Those were already defined by the invitation/delegation.

---

## 8.2 Existing Zyppi Subject

If Ahmed already uses Zyppi personally and Company A hires him:

```text
Ahmed
Personal access exists
        +
Company A invitation
```

Company A SHOULD NOT create a second human Identity merely because it uses `ahmed@companya.com`.

Where lawful matching or user verification establishes that the invitation is for the same Ahmed, Zyppi should link the Company A authentication context/relationship to Ahmed's canonical Subject.

Company A still sees only Company A scope.

---

## 8.3 Unknown Equivalence

If Zyppi suspects but cannot sufficiently establish equivalence:

```text
Existing Ahmed?
        ?
New corporate access?
```

it SHALL NOT silently merge.

The UX may request additional verification if necessary.

Possible user-facing language:

```text
We found an existing Zyppi identity that may be yours.

Verify to connect this access.
```

The exact mechanism remains subject to Security/Identity policy.

---

## 8.4 Invitation Does Not Give Global Access

Accepting Company A's invitation establishes the authorized Company A relationship.

It does not disclose Ahmed's personal context to Company A.

It does not allow Ahmed to see all Company A information.

---

# 9. Enterprise SSO Journey

## 9.1 Enterprise-Native Entry

Where an organization requires SSO, the entry experience SHOULD look native to that organization.

Example:

```text
Open Zyppi capability in SAP
→ Sign in with Company A
→ Entra authenticates Ahmed
→ Zyppi resolves Company A relationship
→ relevant action appears
```

No separate Zyppi password should be required merely because Zyppi exists.

---

## 9.2 Enterprise SSO Is an Authentication Source

It can establish strong evidence such as:

```text
This IdP authenticated this organizational identity/account.
```

It does not automatically establish:

```text
This organization owns the human.
This employee has every company capability.
This person is globally equivalent to every matching record.
```

Authority and Standing remain separately governed.

---

## 9.3 Offboarding

If Company A terminates Ahmed:

```text
Company A SSO → revoked
Company A relationship → ended / changed
Company A Standing → revoked
Company A delegations → revoked
```

Ahmed's unrelated access remains unaffected.

If Company A SSO was Ahmed's only authentication binding, the canonical Identity still remains.

Future personal access, if needed, requires governed re-linking/recovery rather than automatic creation of a personal credential.

---

# 10. Claim Journey

Claims are central to cross-domain entry.

Examples:

```text
Claim this animal relationship
Claim this purchased product
Claim this device
Claim representation of this organization
Claim this property relationship
```

---

## 10.1 Public Before Authenticated Where Possible

Example:

```text
Scan Mimi's NFC chip
        ↓
Public emergency information
        ↓
[Claim relationship]
```

Only the claim action requires authentication.

---

## 10.2 Claim Is Not Proof

Button:

```text
[This is my cat]
```

creates a claim.

It does not create truth.

Depending on risk, the claim may require:

- existing owner approval;
- microchip registry match;
- veterinarian Evidence;
- purchase Evidence;
- transfer Evidence;
- government/authority Evidence;
- other governed proof.

---

## 10.3 Claim Assurance Should Match Consequence

A low-risk claim may have a lightweight flow.

A high-consequence ownership/control claim may require stronger Evidence.

ZyUX SHALL NOT force one universal identity-proofing journey onto every claim.

---

# 11. Public Observer → Authenticated Subject

A user should be able to receive public value without signup.

Example:

```text
Retail product scan
→ public product information
→ public Evidence summary
→ public warranty terms
```

Then:

```text
[Register product]
[Claim ownership]
[Start warranty]
```

Authentication occurs at the transition to a relationship requiring it.

After authentication:

> **Return the Subject to the same product and intended action.**

Do not send them to a generic home page.

---

# 12. Authentication Linking

## 12.1 Add a New Method

Ahmed logged in with Gmail.

Later he adds a mobile or passkey.

Experience:

```text
Settings / Security
→ Add sign-in method
→ Verify
→ Added
```

No identity migration language.

---

## 12.2 Organization-Controlled Method

Company A SSO may be attached to Ahmed only within the Company A participation context.

Revoking Company A SSO must not revoke Gmail.

---

## 12.3 Method Visibility

A company SHOULD ordinarily see only authentication assurance information relevant to its scope.

It should not automatically see all of Ahmed's personal sign-in methods.

Example enterprise view:

```text
Authentication:
Company SSO — Verified
```

not:

```text
Gmail
Personal mobile
Passkey
Company B SSO
```

---

# 13. Credential Rotation

Credential changes should be mundane.

Example:

```text
Old mobile
→ remove / revoke

New mobile
→ verify

Identity:
unchanged
```

The interface should not make the user fear losing history or relationships because a phone number changed.

---

# 14. Duplicate / Identity Convergence Experience

Identity convergence is one of the most sensitive experiences in Zyppi.

It must be:

- safe;
- explainable;
- minimally intrusive;
- privacy-preserving;
- reversible only through governed correction, not casual UI;
- non-destructive of provenance.

---

## 14.1 Potential Match

When Zyppi has sufficient reason to request clarification but not sufficient reason to consolidate automatically:

```text
We found an existing Zyppi identity that may be yours.
```

The user may be asked to verify an independent factor or follow a governed process.

The UI SHOULD NOT expose unrelated information from the candidate identity as a way of proving the match.

Bad:

```text
Is this you?
You own Mimi and work for Company B.
```

That leaks context.

Better:

```text
An existing identity may match this access.
Verify securely to continue.
```

---

## 14.2 Confirmed Convergence

After governed identity resolution:

```text
Access connected.
```

The UX SHOULD NOT imply:

```text
All your organizations are now merged.
All your data is now shared.
```

Instead, relationships remain separately scoped.

---

## 14.3 Provenance Must Survive

Historical records or former identity references may continue to exist for audit/replay, linked to the canonical Identity according to governing architecture.

User-facing UX need not expose internal consolidation details unless relevant.

---

# 15. Identity Conflict Experience

Possible conflict:

```text
same mobile
different passport
different date of birth
```

or analogous evidence conflict.

Zyppi SHALL NOT guess.

The experience may be:

```text
We couldn't safely connect this access automatically.

[Verify another way]
[Contact support / governed recovery]
```

The UI should not reveal conflicting sensitive data unnecessarily.

---

# 16. Context Selection

A Subject may have several active contexts.

Example:

```text
Ahmed
├── Personal
├── Company A — Accountant
├── Company B — Cashier
└── Company X — Contractor
```

ZyUX recognizes two possible mechanisms:

## 16.1 Automatic Context by Object / Entry

Preferred where unambiguous.

Example:

```text
Company A invoice
→ Company A context
```

```text
Mimi's NFC
→ Personal / animal relationship context
```

## 16.2 Manual Context Switch

Useful when multiple legitimate contexts apply.

The switcher SHOULD show meaningful context names, not internal tenant IDs.

The user should never accidentally perform a corporate action under the wrong context without clear indication.

---

# 17. Cross-Context Safety

Before consequential action, Zyppi SHOULD make the acting capacity obvious where confusion is plausible.

Example:

```text
Acting as:
Company A — Finance Reviewer
```

This does not need to clutter every screen.

It should become prominent when:

- multiple scopes could apply;
- action is consequential;
- delegation differs;
- data will be written to an organization;
- user could reasonably confuse personal and corporate contexts.

---

# 18. Logout & Session Experience

Logout may need to distinguish:

```text
Sign out of Zyppi
```

from:

```text
Disconnect Company A
```

and:

```text
Remove sign-in method
```

These are not the same operation.

The UX SHALL avoid presenting credential revocation, relationship termination, and session logout as synonyms.

---

# 19. Organization Exit

A user leaving an organization may encounter:

```text
Your access to Company A has ended.
```

The interface SHOULD clearly distinguish:

### No longer available

- new Company A updates;
- active Company A controls;
- Company A source data;
- delegated actions.

### May remain

- historical attribution;
- personal records that are legitimately theirs;
- unrelated Zyppi contexts.

The exact historical information visible to the former participant remains governed by retention/disclosure policy.

---

# 20. Account Deactivation vs Identity Persistence

A Subject may choose to stop actively using Zyppi.

The product must distinguish:

```text
Deactivate access
```

from:

```text
Erase all underlying Reality/history
```

which may not be possible, lawful, or semantically correct.

The UX must not make promises it cannot constitutionally or legally honor.

Privacy/erasure behavior remains subject to future legal/privacy doctrine.

---

# 21. Death / Life-State Entry Boundary

If credible Evidence suggests a Subject has died:

ZyUX SHALL NOT allow casual account deletion to stand in for life-state handling.

Potential experience states may include:

```text
Active
Death reported / pending verification
Participation restricted
Deceased / legally established
Succession pending
```

Exact terms are not ratified here.

The identity remains historically addressable.

Active authentication may be suspended when governed rules require.

This section defines UX boundary only; legal semantics belong elsewhere.

---

# 22. Recovery Doctrine

Recovery is necessary because credentials can disappear while Identity persists.

Examples:

- lost phone;
- lost email;
- company SSO revoked;
- passkey unavailable;
- sole owner loses access;
- organization administrator leaves;
- identity provider outage.

---

## 22.1 Recovery Goal

> **Restore legitimate access to the correct Subject or organization relationship without creating a hidden master key or leaking unrelated context.**

---

## 22.2 Recovery Assurance Must Match Risk

Possible mechanisms may include:

- another verified authentication method;
- enterprise IdP recovery;
- evidence-based recovery;
- organization administrator approval;
- multi-party/quorum recovery;
- time delay;
- support-assisted governed process;
- government/registry evidence where lawful.

No one mechanism is universally appropriate.

---

## 22.3 Recovery Must Not Reveal Candidate Contexts

To recover Ahmed, Zyppi should not reveal:

```text
We found you because you work for Company B and own Mimi.
```

Identity proofing should be privacy-preserving.

---

## 22.4 Sole Owner Problem

If a one-person organization loses all access:

the system requires a governed recovery route.

This SHALL NOT be solved by a permanent Zyppi employee super-admin with unrestricted authority.

Detailed recovery design belongs to Security/Authority governance and `ZyUX-006`.

---

# 23. Organization Account vs Organization Identity

An organization may have:

- canonical organization Identity;
- organization administrators;
- IdP connection;
- source systems;
- delegations;
- billing relationship;
- host integrations.

The organization itself does not "log in" like a person.

Subjects authenticate and act in organizational capacity.

Machine Subjects/agents may also authenticate under governed capability.

The UX may use the phrase `Organization account` colloquially, but implementation and governance SHOULD preserve the distinction between:

```text
Organization Identity
Organization scope
Organization access administration
Human/machine Subjects acting for organization
```

---

# 24. Developer Entry Boundary

Developer-specific journeys will be governed in `ZyUX-DEVELOPER-001`.

`ZyUX-001` nevertheless establishes:

- developer signup must remain low-friction;
- sandbox access should not require enterprise-depth organization setup unless necessary;
- production promotion may require stronger organization/identity assurance;
- API credentials are credentials, not canonical developer Identity;
- one developer may legitimately participate in multiple organizations/agencies;
- revocation in one organization must not erase unrelated developer identity/history.

---

# 25. Agent Entry Boundary

Agent-specific experience will be governed in `ZyUX-AGENT-001`.

For this document:

- an AI agent may have its own governed technical Identity where applicable;
- an agent may act under delegated Authority;
- agent credentials are not Authority themselves;
- linking an agent to an organization does not grant all organizational access;
- agent access should be revocable independently;
- the principal/delegation chain must remain attributable.

---

# 26. Public / Anonymous Experience

Anonymous participation should be preserved where legitimate.

Examples:

- scanning public GS1 information;
- viewing public recall;
- reading public product/warranty information;
- viewing a public Evidence statement;
- verifying a public Receipt where authorized.

Do not erect signup walls around public information solely to grow account numbers.

> **Authentication should appear when it enables a legitimate next capability, not merely because Zyppi prefers logged-in users.**

---

# 27. Organization Discovery & Join Requests

Not every organization should be publicly discoverable.

Join mechanisms may include:

- direct invitation;
- verified domain;
- organization code;
- enterprise IdP;
- administrator approval;
- public membership where explicitly supported.

Organization existence, membership, employee lists, and relationships may themselves be sensitive.

ZyUX SHALL respect scope/privacy policy rather than assume social-network discovery.

---

# 28. Email & Mobile Semantics

Email and mobile are particularly dangerous because conventional products treat them as permanent identity keys.

ZyUX SHALL treat them as:

```text
contact / authentication / evidence signals
```

according to applicable use.

They may:

- change;
- expire;
- be reassigned;
- be compromised;
- be organization-controlled;
- belong to shared operational contexts.

Therefore:

> **Email or mobile equality alone SHALL NOT be presented as universal proof of Subject equivalence.**

---

# 29. Sensitive Government Identifiers

National ID, passport, tax ID, and similar identifiers may provide strong Evidence in some jurisdictions/use cases.

They also create substantial privacy/security risk.

ZyUX SHALL NOT normalize collection of such identifiers merely to simplify signup.

Use only when:

- necessary;
- lawful;
- proportionate;
- governed;
- protected;
- justified by the required assurance.

The experience should communicate why sensitive proof is required when requested.

---

# 30. Entry Friction by Consequence

ZyUX adopts a proportionality principle.

```text
LOW-CONSEQUENCE ACTION
→ low entry friction

HIGH-CONSEQUENCE ACTION
→ stronger authentication / identity / authority assurance as required
```

Examples:

### Public product lookup

No account.

### Save product to personal list

Light authentication.

### Claim serialized product ownership

Authentication + required Evidence.

### Approve regulated shipment

Enterprise authentication + Standing + Authority.

### Change organization policy

Strong organizational authorization.

The system should not impose the highest assurance level on every action.

---

# 31. Failure Experience

Entry/authentication failures must preserve cause boundaries.

Examples:

```text
Authentication failed
Credential revoked
Invitation expired
Relationship unavailable
Insufficient Authority
Identity match unresolved
Recovery required
Organization access ended
```

Do not collapse everything into:

```text
Access denied
```

when a more precise user-safe explanation exists.

Do not expose sensitive security detail merely for precision.

---

# 32. Entry Experience Progressive Explanation

Example:

### Level 1

```text
You can't continue with this Company A access.
```

### Level 2

```text
Your Company A sign-in is no longer active.
```

### Level 3

```text
This does not affect your other Zyppi access.
Use another sign-in method for personal or unrelated contexts.
```

### Level 4

Administrative/security details only where legitimately available.

---

# 33. Account Security Surface

The personal security surface SHOULD remain simple.

Possible sections:

```text
Sign-in methods
Active sessions
Trusted/recent devices where supported
Recovery methods
Security events
```

Organization-specific access SHOULD be represented separately:

```text
Organizations / Relationships
Company A — Active
Company B — Active
Company X — Contractor
```

Do not make organization delegation look like a personal password setting.

---

# 34. Privacy Surface

A Subject should be able to understand, at an appropriate level:

- what authentication methods are attached;
- which organizations they currently participate in;
- which relationships are active;
- which relationships ended;
- what scope an organization has to them where disclosure permits;
- what public information exists;
- what recovery methods exist.

The privacy surface SHALL NOT imply that the Subject owns or can delete organization records outside their authority.

---

# 35. Cross-Domain Worked Example — Ahmed

Ahmed creates Zyppi access personally to manage Mimi's NFC chip.

```text
Ahmed
→ Gmail
→ personal access
→ claims relationship to Mimi
```

Later Company A hires him:

```text
Company A
→ corporate email / Entra SSO
→ invitation
→ Ahmed accepts
→ Company A relationship appears
```

Zyppi may discover that Company A's authenticated employee and the personal Ahmed refer to the same Subject.

Where Evidence safely establishes equivalence:

```text
one Ahmed canonical Identity
```

but:

```text
Mimi relationship
≠
Company A relationship
```

Company A sees only Company A scope.

Ahmed sees only delegated Company A scope.

Ahmed later joins Company B:

```text
same Ahmed
new relationship
new SSO/access context
```

Ahmed freelances for Company X:

```text
same Ahmed
contractor relationship
```

Company A fires Ahmed:

```text
Company A SSO revoked
Company A Standing revoked
Company A future actions disappear
```

Unchanged:

```text
Ahmed Identity
Mimi relationship
Company B relationship
Company X relationship
Gmail access
personal history
```

Ahmed changes mobile:

```text
old mobile revoked
new mobile verified
Identity unchanged
```

Ahmed dies:

```text
Identity remains
authentication/participation restricted as governed
historical attribution remains
succession processes may begin
```

This is the canonical `ZyUX-001` stress test.

---

# 36. Cross-Domain Worked Example — Mimi

Mimi has an Identity.

Mimi has no account.

Possible entry:

```text
NFC scan
→ public emergency information
```

Owner:

```text
[Claim relationship]
→ authenticate
→ ownership/custody Evidence as required
→ relationship established
```

Veterinarian:

```text
invitation / delegated relationship
→ scoped medical-update capability
```

Shelter:

```text
scan
→ report found
```

The experience is relationship-driven.

Mimi never needs a password.

---

# 37. Cross-Domain Worked Example — Product

A shopper scans a product.

```text
No account
→ public product / trust / recall information
```

After purchase:

```text
Claim/Register
→ authenticate
→ required proof
→ customer/owner relationship
```

New capabilities appear:

- warranty;
- service;
- claim;
- transfer.

Identity of the product remains independent of the customer's account.

---

# 38. Cross-Domain Worked Example — Company & Logistics Provider

Company A delegates shipment handling to Logistics Co.

No employee identity merging is required across organizations.

Logistics Co may assign Driver Omar.

```text
Company A shipment
→ Logistics Co relationship
→ Omar delegated route/custody scope
```

Omar authenticates through Logistics Co.

He sees:

- assigned shipment;
- pickup;
- delivery;
- damage report.

He does not see:

- Company A internal financial data;
- other shipments;
- policy controls.

When assignment ends, access ends.

Omar's Identity remains.

---

# 39. UX Copy Principles

User-facing copy SHOULD prefer ordinary language.

Prefer:

```text
Your Company A access has ended.
```

over:

```text
Your organizational Standing vector has been revoked.
```

Prefer:

```text
Add a sign-in method
```

over:

```text
Create authentication binding.
```

Prefer:

```text
We need another way to verify this is you.
```

over:

```text
Identity equivalence is epistemically unresolved.
```

The internal model remains precise.

The surface remains human.

---

# 40. Marketing & Enterprise Optics

The entry experience SHALL support market positioning that avoids identity-provider fear.

Enterprise messaging should be consistent with:

> **Keep your existing IAM. Zyppi uses governed identity and Authority to preserve scoped action and accountability across systems and change.**

Do not market:

> "Zyppi merges your employees' personal and corporate identities."

Even where one canonical Subject exists underneath, the user-facing and enterprise-facing experience must emphasize scope isolation.

---

# 41. Telemetry & Validation

ZyUX-001 should eventually measure:

- signup completion;
- time to first useful action;
- invitation acceptance success;
- SSO completion;
- claim completion;
- abandonment per step;
- identity-match verification success;
- false/unsafe merge incidents;
- recovery success;
- credential-change success;
- account-lockout incidence;
- context-confusion incidents;
- offboarding leakage incidents;
- support tickets related to login/identity;
- user comprehension of active context.

Telemetry SHALL NOT infer personal identity facts beyond what the surface legitimately observes.

---

# 42. Accessibility & Localization

Entry flows are high-frequency and high-consequence.

They SHOULD be:

- keyboard accessible;
- screen-reader compatible;
- usable on low-end/mobile devices;
- resilient to intermittent connectivity where applicable;
- localization-ready;
- clear without domain jargon;
- tolerant of international names and identifiers;
- not built around one country's address or identity format.

Exact accessibility standards belong to future ZyUX/design-system authority.

---

# 43. Security & Privacy Review Requirements

Before normative adoption or implementation of high-assurance identity flows, review is required for:

- credential linking;
- SSO mapping;
- identity convergence;
- account recovery;
- sensitive Evidence handling;
- session management;
- account enumeration;
- relationship metadata leakage;
- phishing-resistant authentication where required;
- organization offboarding;
- cross-context confusion;
- unauthorized claim attempts;
- privacy/erasure implications.

---

# 44. Relationship to Other ZyUX Documents

## `ZyUX-002`

Owns organization, relationship, scope, and delegation experience after entry.

## `ZyUX-003`

Owns navigation, context switching, and capability disclosure once the Subject is inside a context.

## `ZyUX-004`

Owns explanation of identity/trust/evidence decisions where user comprehension requires it.

## `ZyUX-005`

Owns Host-Native entry/experience patterns in systems such as SAP/Shopify.

## `ZyUX-006`

Owns deep lifecycle, offboarding, recovery, historical access, and life-state transitions.

`ZyUX-001` defines the **front door and access continuity**.

---

# 45. Explicit Non-Scope

`ZyUX-001` does not define:

- canonical Identity data schema;
- cryptographic authentication protocol;
- password policy;
- specific IdP vendor integration;
- database topology;
- legal identity standard;
- government identifier policy;
- succession law;
- final account recovery mechanics;
- authorization semantics;
- delegation semantics;
- full organization admin UI;
- billing;
- pricing;
- marketing acquisition campaign;
- specific visual design system.

Those require their own authorities or later implementation mandates.

---

# 46. Drift Prohibitions

`ZyUX-001` SHALL NOT drift into:

- `email = identity`;
- `tenant user = person`;
- organization ownership of human identity;
- one account per employer;
- one employer account controlling personal access;
- global visibility after identity linking;
- consumer social graph discovery;
- mandatory signup for public information;
- automatic duplicate merges;
- mandatory collection of passport/national ID;
- highest-assurance verification for low-risk Jobs;
- one universal recovery flow;
- hidden master administration;
- deep onboarding before first value.

---

# 47. Ratification Questions

Before ratification, Council should disposition:

1. Whether `Account` remains the preferred public term or whether Zyppi should use another term for access management.
2. Exact constitutional mapping of Subject and Identity terminology.
3. Whether Zyppi may temporarily maintain unresolved candidate identity records and how they are represented.
4. Minimum Evidence thresholds for automatic vs user-assisted identity convergence.
5. Whether any identity consolidation always requires Subject notification.
6. Whether any high-risk consolidation requires explicit human review.
7. Enterprise IdP account-mapping rules.
8. Domain-verification and organization-creation assurance levels.
9. Organization invitation expiry/revocation behavior.
10. Public claim assurance classes.
11. Personal vs enterprise authentication visibility rules.
12. Context-switch UX rules for consequential action.
13. Recovery assurance classes.
14. Former-employee access to historical attribution.
15. Legal/privacy requirements for identity Evidence retention.
16. Right-to-erasure handling.
17. Death/life-state credential handling.
18. Accessibility baseline.
19. Localization baseline.
20. Whether `Personal` should be an explicit context label or only appear when needed.

---

# 48. Proposed Acceptance Invariants

A conforming implementation of `ZyUX-001` should eventually prove:

### AX-001 — One Credential Lost, Identity Survives

Revoking one authentication method does not erase unrelated access.

### AX-002 — One Employer Lost, Other Contexts Survive

Ending Company A access does not affect Company B, personal, or freelance contexts.

### AX-003 — Same Subject, New Credential

Changing mobile or adding passkey does not create a new Subject.

### AX-004 — No Silent Merge

Conflicting or insufficient identity Evidence does not silently consolidate identities.

### AX-005 — No Cross-Scope Leakage

Linking corporate and personal access to one Subject does not expose unrelated context.

### AX-006 — Public Before Login

A public resource remains accessible without forced authentication when policy permits.

### AX-007 — Intent Preservation

Authentication returns the user to the initiating Job/object.

### AX-008 — Enterprise IAM Preservation

Enterprise SSO can authenticate organizational participation without replacing the enterprise IdP.

### AX-009 — Organization Cannot Delete Person

Revoking Company A account/SSO cannot erase Ahmed's canonical Identity.

### AX-010 — Account Does Not Create Claim Truth

Clicking `Claim` creates a claim, not ownership truth.

### AX-011 — Proportional Assurance

Low-risk flows do not require high-risk identity proofing without justification.

### AX-012 — Recovery Is Scoped

Recovery restores only legitimate access and does not reveal unrelated contexts.

---

# 49. Canonical Journey Set for Future Prototyping

The following journeys SHOULD eventually be prototyped and tested:

1. **Personal first-time signup**
2. **Create a one-person organization**
3. **Join organization by invitation + enterprise SSO**
4. **Existing personal Subject joins employer**
5. **Same Subject joins second employer**
6. **Add personal authentication method**
7. **Corporate SSO revoked**
8. **Change mobile number**
9. **Claim animal NFC relationship**
10. **Public product scan → authenticated claim**
11. **Potential duplicate identity → safe verification**
12. **Identity conflict → no merge**
13. **Former employee attempts old company action**
14. **Lost only credential → recovery**
15. **Organization sole owner loses access**
16. **Public user never signs up**
17. **Agent/service account receives bounded access**
18. **Context confusion before consequential action**
19. **Life-state/death evidence enters pending state**
20. **Organization relationship ends while history remains**

These journeys are experience test cases, not implementation authorization.

---

# 50. Closing Doctrine

> **Sign up creates access. It does not manufacture a new Reality.**

> **A Subject may have many credentials and many relationships without becoming many Subjects.**

> **An organization may control its credential, its scope, and its delegation without owning the person behind them.**

> **Identity convergence may connect access contexts. It must not connect unrelated visibility.**

> **Public value should remain public. Authentication should appear when it enables a legitimate next capability.**

> **Changing an email, mobile number, employer, or login provider should feel ordinary because Identity persists underneath.**

> **The entry experience should preserve the user's intent, not redirect them into platform administration.**

> **The front door is simple because the governance underneath is strong — not because the governance is absent.**

---

# 51. Status & Next Step

**Current Status:** DRAFT — CHAIR REVIEW.

Recommended review sequence:

1. Chair review of terminology and laws.
2. Constitutional Identity/Subject mapping.
3. Security review of authentication linking and convergence.
4. Privacy review of sensitive identity Evidence and metadata.
5. Enterprise IAM review.
6. UX prototype of the 20 canonical journeys.
7. Validate against `ZyUX-000`.
8. Feed organization/delegation portions into `ZyUX-002`.
9. Feed context-switch portions into `ZyUX-003`.
10. Feed recovery/offboarding portions into `ZyUX-006`.
11. Ratification decision only after boundary questions are closed.

---

**End of `ZyUX-001 v0.1 — DRAFT FOR CHAIR REVIEW`**

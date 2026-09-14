# ZyUX-001 — Identity, Account & Entry Experience

**Canonical ID:** `ZyUX-001`  
**Version:** **1.0**  
**Series:** `ZyUX` — Unfict Experience Architecture  
**Series Identifier Note:** `ZyUX` is retained as the canonical technical/historical series identifier under `ZUSD-001`; it does not denote the active master brand.  
**Active Master Brand:** **Unfict — Reality Sync**  
**Brand Lineage:** `Zyppi → Unfict`  
**Brand Succession Authority:** `ZUSD-001 — ZYPPI-UNFICT-SUCCESSION-DECLARATION-001 v1.0`  
**Ratification Date:** 14 September 2026  
**Status:** **RATIFIED — FINAL**  
**Classification:** Horizontal Experience Doctrine  
**Normative Level:** Experience Doctrine / Product Architecture  
**Parent Authority:** `ZyUX-000 v1.0`  
**Coordinates With:** operative Identity authority · Evidence · Authority · Standing · Policy · Security · Privacy · enterprise IAM · ZYAPI  

---

## Brand Continuity Rule

This document is an **Unfict-era** ratified document. The canonical `ZyUX-*` identifier is retained to preserve citation, governance, repository, and historical continuity. Legacy documents are cited by their actual historical titles. In active prose, **Unfict** is the master brand.

Brand succession does not alter constitutional meaning. No business, epistemic, Authority, Standing, Policy, Trust, Evidence, Runtime, Receipt, API, or historical semantics are changed merely because the public master brand changed.


# 0. Scope

`ZyUX-001` governs the Unfict front door: signup/login, public-to-authenticated transition, invitation acceptance, organization entry, claims, credential linking/rotation, SSO coexistence, account/access continuity, referent-resolution UX boundaries, and the entry side of recovery.

It governs **experience**, not Identity ontology or security protocol.

> **Entering Unfict should be extremely easy. Establishing referent, Authority, Standing, and scope should remain rigorous underneath.**

## Identity Authority Boundary

ZyUX does **not** own Identity semantics.

Identity cardinality, Identity relationship topology, referent resolution, Representation lifecycle, consolidation/supersession, and Identity mutation are imported from the **currently operative constitutional Identity authority**.

`ZRM-ID-AMD-001 v0.9.1` may inform future alignment but, while it remains draft, this series SHALL NOT treat it as active law. Ratification of this series does not ratify that amendment.

Accordingly, ZyUX speaks normatively about **Subject continuity, authentication/access continuity, current relationships, current Authority/Standing, disclosure, and historical attribution** without inventing Identity lifecycle law.


# 1. Core Distinctions

The experience SHALL preserve:

```text
SUBJECT
≠ ACCOUNT
≠ AUTHENTICATION METHOD
≠ AUTHENTICATION BINDING
≠ RELATIONSHIP
≠ ROLE
≠ AUTHORITY
≠ STANDING
```

A product, animal, machine, place, organization, or other Reality constituent may participate in governed references/relationships without ever owning a login account.

# 2. Binding Laws

## ZyUX-001-S01 — Account Is Access, Not the Subject

An Account SHALL be presented as an access-management construct. Creating or deleting an Account SHALL NOT by itself be presented as creating or deleting the underlying Subject.

## ZyUX-001-S02 — Credentials Are Replaceable Access Mechanisms

Email, mobile, passkey, enterprise SSO, OAuth identity, or another credential MAY be added, rotated, revoked, or replaced without the UX claiming the Subject itself changed.

## ZyUX-001-S03 — Subject Continuity Across Access Contexts

A Subject MAY legitimately participate through multiple authentication/access contexts. The UI SHALL NOT manufacture multiple people merely because multiple credentials/employers exist.

Any Identity / Representation effects remain owner-defined.

## ZyUX-001-S04 — Identity Semantics Are Imported

ZyUX SHALL NOT determine Identity cardinality, merger, split, intrinsic persistence, Representation lineage, or referent truth. It SHALL consume determinations from the operative Identity / semantic-resolution authorities.

## ZyUX-001-S05 — No Silent Referent Linking

Matching email, mobile, national ID, passport number, host user ID, name, device, or another field SHALL NOT by itself justify silently treating two records as the same Subject/referent.

Unresolved or conflicting referent state must remain explicit where material.

## ZyUX-001-S06 — Referent Equivalence Does Not Collapse Scope

Even where two access contexts are legitimately determined to refer to the same Subject, unrelated organization visibility, data, Authority, retention, or disclosure SHALL NOT merge automatically.

## ZyUX-001-S07 — Enterprise IAM Coexists

Enterprise participation SHOULD use legitimate enterprise SSO/IdP context where appropriate. Unfict SHALL NOT require an employer to replace a legitimate IAM system merely to participate.

## ZyUX-001-S08 — Organization Revocation Is Bounded

An organization MAY revoke authentication bindings, relationships, delegations, and access it legitimately controls. It SHALL NOT thereby acquire control over or erase unrelated personal/other-organization access contexts.

## ZyUX-001-S09 — Accountless When Possible

Public observation and other legitimate anonymous experiences SHOULD remain accountless until authentication is actually required.

## ZyUX-001-S10 — Minimum Necessary Identification Data

Unfict SHOULD collect only the identification, authentication, or referent-resolution information necessary for the current legitimate purpose and assurance level.

Government identifiers or similarly sensitive data SHALL NOT be normalized as routine signup fields merely because they could improve matching.

## ZyUX-001-S11 — Preserve Entry Intent

After authentication, recovery, or authorization, the user SHOULD return to the initiating legitimate Job/context whenever possible.

## ZyUX-001-S12 — Recovery Is Not a Master Key

Recovery SHALL NOT introduce an invisible universal Unfict super-admin, cross-context bypass, or lower-assurance path that manufactures Authority.

## ZyUX-001-S13 — Assurance Follows Consequence

Low-consequence actions SHOULD have low entry friction. Higher-consequence actions MAY require stronger authentication, Evidence, Authority, Standing, or review as governed.

## ZyUX-001-S14 — Sensitive Identity Evidence Is Not Profile Data

Evidence used for identity/referent assurance SHALL NOT automatically become ordinary profile information or be disclosed across contexts.

## ZyUX-001-S15 — Organization Creation Does Not Prove Organizational Identity or Representation Authority

Creating an organization workspace/context SHALL NOT by itself prove the legal organization, establish every Identity relationship, or prove the creator has legal Authority to represent it.

Higher assurance may be established later as consequence requires.

## ZyUX-001-S16 — Failure Causes Remain Distinct

Where safe and useful, the experience SHOULD distinguish authentication failure, revoked credential, expired invitation, ended relationship, unresolved referent match, insufficient Authority/Standing, recovery requirement, and temporary service failure rather than collapse everything into `Access denied`.

# 3. Entry Journeys

## Direct Entry

```text
Authenticate
→ use known legitimate entry context if available
→ otherwise offer Create / Join / Claim
→ first useful action
```

Do not ask questions already answered by a trustworthy invitation, deep link, host context, scan flow, or prior governed relationship.

## Invitation Entry

```text
Invitation
→ authenticate using appropriate personal/enterprise method
→ show organization + relationship + scope summary
→ accept
→ continue to intended work
```

## Claim Entry

```text
Carrier / identifier / object
→ public information if disclosable
→ authenticate only when needed
→ submit relationship claim
→ evaluate Evidence / Authority / Standing / Policy
→ create relationship only if legitimately established
```

A claim is an assertion, not proof.

## Organization Creation

For low-risk creation, request only necessary information. Advanced structure is progressive.

## Public Observation

No account menu or login wall is required merely because Unfict knows how to authenticate users.

# 4. Personal and Organizational Contexts

The UI MAY display contexts such as:

```text
Personal
Company A
Company B
Project X
```

These are experience contexts/relationships, not different people and not independent Identity declarations.

Before consequential action, the current acting context SHOULD be clear when ambiguity could matter.

# 5. Authentication Methods

A security surface SHOULD distinguish:

```text
Sign-in methods
Active sessions
Recovery methods
Organization relationships/access
Security events
```

Organization delegation SHALL NOT be presented as merely another personal password setting.

# 6. Email and Mobile

Email/mobile may serve as contact, authentication, or Evidence inputs depending on context.

They can be reassigned, compromised, shared, expired, or organization-controlled.

Therefore equality of email/mobile alone SHALL NOT be presented as universal proof of Subject equivalence.

# 7. Enterprise SSO

Company A SSO may authenticate Ahmed for Company A work. Revocation of that SSO may end Company A access without destroying Ahmed as a Subject or unrelated contexts.

If corporate SSO was the only login route, no automatic personal credential is created. Future personal access requires governed recovery/linking.

# 8. Privacy Surface

Where disclosure permits, a Subject should be able to understand:

- active sign-in methods;
- active sessions;
- current organizational relationships;
- ended relationships;
- recovery methods;
- current context.

This surface SHALL NOT imply the Subject owns or can delete organizational records beyond governed rights.

# 9. Worked Example — Ahmed

Ahmed may use Unfict through personal Gmail/mobile, Company A SSO, Company B SSO, and a freelance invitation while also managing Mimi's chip relationship.

Company A termination may end Company A access and delegations while leaving Company B, freelance, and personal contexts unaffected. Historical Company A actions remain attributable according to governing retention/disclosure rules.

The UX describes continuity of **Ahmed as the Subject**. It does not decide Identity relationship topology.

# 10. Explicit Non-Scope

This document does not define:

- Identity ontology or cardinality;
- legal identity standards;
- authentication cryptography;
- password/passkey protocol;
- database schema;
- Security factor requirements;
- final recovery algorithm;
- legal erasure rules;
- delegation semantics;
- organization governance law.

# 11. Drift Prohibitions

`ZyUX-001` SHALL NOT drift into:

- email = person;
- account = Identity;
- tenant user = person;
- one employer account per human as the canonical model;
- organization ownership of personal access;
- cross-scope visibility after referent linking;
- automatic duplicate merge;
- mandatory national-ID collection;
- highest-assurance verification for low-risk Jobs;
- public-information signup walls;
- hidden recovery master access.

# 12. Ratification

By authority of the Chair, `ZyUX-001 v1.0` is **RATIFIED — FINAL** and inherits `ZyUX-L01` through `ZyUX-L16`.

## Ratification Grammar

For this document:

- numbered `ZyUX-*` Laws / `Sxx` clauses are binding experience doctrine;
- `SHALL` / `SHALL NOT` are mandatory;
- `SHOULD` / `SHOULD NOT` express strong defaults that may be departed from only for a documented governed reason;
- `MAY` expresses permission;
- examples, diagrams, journey sketches, and candidate labels are informative unless a binding clause expressly incorporates them;
- this document governs **experience projection** only and SHALL NOT silently acquire semantics owned by another constitutional authority.


**End of `ZyUX-001 v1.0 — RATIFIED — FINAL`**

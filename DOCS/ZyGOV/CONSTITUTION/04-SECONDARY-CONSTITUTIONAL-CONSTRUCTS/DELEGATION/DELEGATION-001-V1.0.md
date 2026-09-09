# DELEGATION-001 — Universal Delegation & Agency Constitution

**Secondary Cross-Constitutional Constitutional Construct**

| Field | Value |
| :--- | :--- |
| **Identifier** | `DELEGATION-001` |
| **Version** | 1.0 |
| **Classification** | Secondary Constitutional Construct |
| **Nature** | Cross-Constitutional / Derived / Non-Sovereign |
| **Parent Closure Program** | `CCP-RI-CLOSURE-01` — Agency & Delegation Contract Closure |
| **Primary Authority Sources** | POL, WS, SEC, ZRM/Identity, RI |
| **Implementation Authority** | NONE |
| **Repository Mutation Authority** | NONE |
| **Supersedes (as normative drafting authority)** | Initial DELEGATION-001 working draft, PH5-A, PH5-B, PH5-C, PH5-D, PH5-E, and CORR-01 |
| **Status** | FINAL — RATIFICATION CANDIDATE |
| **Date** | 24 August 2026 |

> *Those packets (PH5-A through PH5-E and CORR-01) remain audit/provenance material.*

---

## 1. Purpose

`DELEGATION-001` establishes the canonical Zyppi law governing how existing constitutional concepts compose into lawful agency and delegated execution.

It exists because Delegation was already constitutional, but its semantics were distributed across Authority, Role Assignment, Security, Attestation, Evidence, and Runtime. The Foundations make Delegation a native concern of Subject, including Organizations, Humans, AI Agents, and autonomous systems; Zyppi's execution model remains Reality → Trust → Intent → Action.

This Constitution closes the connective law **without** creating:

- a new ZRM primitive;
- a second Identity system;
- a second Authority system;
- a second Trust system;
- a second Evidence system;
- a second Attestation framework;
- a shadow Runtime authorization model.

---

## 2. Constitutional Position

The governing stack is:

```text
ZRM / Identity
│
▼
POL — Authority / Delegation / Authorization
│
├──────────────┐
▼              ▼
WS                 DELEGATION-001
Role Assignment    composition law
Relationships         │
│               │
└──────┬────────┘
▼
SEC / RSN
security + proof
│
▼
RI / V2
execution binding
```

`DELEGATION-001` is **non-sovereign**.

It MAY compose and specialize existing constitutional meanings.

It SHALL NOT redefine the meanings owned by POL, WS, SEC, RSN, ZRM, Identity, Evidence, or RI.

---

## 3. Canonical Ownership

| Concern | Canonical owner |
| :--- | :--- |
| Subject / Reality | ZRM |
| Identity | Identity / CL |
| Authority | POL |
| Delegation constitutional meaning | POL |
| Permission / Authorization | POL |
| Role Assignment / `ASSIGNED_ROLE` | WS |
| Authority Anchor | WS / active CL reference model |
| Generic Relationship governance | WS |
| Trust / security | SEC |
| Attestation framework | RSN-003 |
| Evidence | Evidence constitution |
| Execution participation | RI / V2 |
| Requested Action | RI / REC action contract |
| Agency composition | DELEGATION-001 |
| Runtime execution | RI |

POL already defines Delegation as transfer of Authority, requires valid originating Authority, prohibits scope expansion and implicit delegation, requires provenance, independent revocation and temporal bounding, and makes child validity dependent on parent Authority.

---

## 4. Delegation

Delegation is the **explicit constitutional transfer** of bounded Authority from a Subject possessing valid Authority to another Subject.

Delegation:

- `transfers Authority`

but:

- `does not transfer sovereignty`

and:

- `does not create Authority from nothing`

A valid Delegation therefore always has a legitimate Authority origin.

---

## 5. Delegated Authority

Delegated Authority SHALL:

- remain subordinate to its originating Authority;
- never exceed its parent;
- preserve provenance;
- remain attributable;
- remain contextual;
- remain temporally bounded;
- remain revocable;
- remain subject to Standing, Capacity, Policy, and other governing prerequisites;
- cease to authorize current execution when its constitutional basis loses validity.

POL expressly establishes those constraints and preserves historical provenance across revocation and succession.

---

## 6. Permanent Separation Rules

The following distinctions SHALL remain permanent:

```text
Identity      ≠ Delegation
Authority     ≠ Delegation
Trust         ≠ Delegation
Capability    ≠ Delegation
Evidence      ≠ Delegation
Attestation   ≠ Delegation
Relationship  ≠ Authority
Delegation    ≠ Authorization
```

REC-01C specifically rejects Identity-as-Actor, Trust-as-Authority, Capability-as-Delegation, Evidence-as-Delegation, relationship-implies-authority, and a hard-coded Actor/Principal identity pair.

---

## 7. Self-Execution

Where:

```text
Actor = Governed Subject
```

and the Subject acts under its own valid Authority:

```text
delegation depth = 0
```

conceptually.

No synthetic Delegation SHALL be required.

No:

```text
Alice delegates to Alice
```

artifact shall be created merely to satisfy a uniform schema.

**Self-execution is the constitutional zero-delegation case.**

---

## 8. Delegated Execution

Where:

```text
Actor ≠ Governed Subject
```

the execution SHALL contain an explicit lawful agency basis.

The system SHALL NOT infer agency from:

- Identity;
- employment;
- organization membership;
- same tenant;
- Role Type name;
- ownership;
- Trust;
- Capability;
- API credentials;
- common Evidence;
- domain convention;
- SDK convenience;
- co-presence in constitutional state.

REC-01G requires V2 to bind constitutional state establishing agency whenever Actor and Governed Subject differ.

---

## 9. Delegation Forms

Delegation has two canonical forms:

```text
DELEGATION
│
├── ROLE-BASED
│     │
│     ASSIGNED_ROLE
│     + Authority Anchor
│
└── DIRECT / MANDATE
      │
      Delegation Grant
```

Delegation topology is separate:

```text
TOPOLOGY
├── SINGLE-HOP
└── CHAINED
```

A Role-Based Delegation may be chained.

A Direct Delegation may be chained where lawful subdelegation exists.

**CHAINED is therefore not a third Delegation form.**

---

## 10. Specialized-Form Precedence

A generic Direct Delegation Grant SHALL NOT bypass a more specific mandatory constitutional mechanism.

The precedence rule is:

```text
Does governing law require
a specialized delegation form?
│
┌───┴───┐
YES      NO
│        │
▼        ▼
specialized   Direct
mechanism     Delegation Grant
```

This is the final incorporation of CORR-01.

---

## 11. Organizational Authority

POL establishes that organizational Authority belongs to the Organization and individuals exercise that Authority only through constitutionally recognized roles.

Therefore where a Human exercises an Organization's organizational Authority:

```text
Organization
↓
Human Actor
```

the operative constitutional representation SHALL use the required recognized Role mechanism.

The Direct Delegation Grant SHALL NOT substitute for that Role.

---

## 12. Role-Based Delegation

WS defines Role Assignment as a Reified Relationship that carries delegated Authority but does not originate it.

Every `ASSIGNED_ROLE` must reference exactly one Authority Anchor, and Authority evaluation resolves the Anchor's status, scope, time, jurisdiction, and delegated permission.

The role-based chain is:

```text
Policy / governing Authority
↓
Authority Anchor
↓
ASSIGNED_ROLE
↓
Role Assignment
↓
Delegated operational Authority
```

A Role Type:

- defines operational capacity;
- does not originate Authority;
- does not itself grant Permission.

Role Type ownership remains governed by the active WS supersession chain; `DELEGATION-001` does not own it.

---

## 13. Employment Is Not Role Assignment

WS explicitly distinguishes:

```text
EMPLOYED_BY
```

from:

```text
ASSIGNED_ROLE
```

The former answers what employment relationship exists.

The latter answers what operational capacity has been delegated.

Therefore:

```text
Employment ≠ Delegation ≠ Permission
```

A worker does not obtain organizational Authority merely by being employed.

---

## 14. AI and Technical Subjects

Technical identities possess no autonomous constitutional Authority. SEC requires their Authority to originate through Human or Organizational delegation; AI Agents require sponsoring authority, capability scope, compliance attestation, and a cryptographically verifiable delegation chain.

Where active WS/SEC law requires Role Assignment for AI operational authority:

```text
Direct Delegation Grant only
```

is insufficient.

AI SHALL NOT:

- self-authorize;
- self-attest where external attestation is required;
- self-escalate capability;
- manufacture Authority;
- bypass sponsor lineage;
- use cached proof to evade revocation.

---

## 15. Direct Delegation Grant

Where no more specific constitutional delegation mechanism is mandatory, direct/non-role Delegation SHALL use the governed Delegation Grant construct.

Its semantic Relationship is:

```text
Delegator Subject
│
│ DELEGATES_AUTHORITY_TO
▼
Delegate Subject
```

Canonical inverse:

```text
RECEIVES_DELEGATED_AUTHORITY_FROM
```

The intended WS Registry classification is:

| Property | Final constitutional rule |
| :--- | :--- |
| **Tier** | Reified Relationship |
| **Family** | Authority |
| **Source** | Subject / Delegator |
| **Target** | Subject / Delegate |
| **Evidence** | Mandatory |
| **Authority** | Required |
| **Provenance** | Mandatory |
| **Lifecycle** | Governed |
| **Historical reconstruction** | Required |
| **Role Type** | Not required |
| **Governed Subject** | Not owned here |
| **Requested Action** | Not owned here |

WS already requires relationship governance to define source, target, type, family, cardinality, temporal behavior, Evidence, Authority, Provenance, and inverse semantic direction, while individual predicates are admitted through the Relationship Registry.

Registry admission is still a downstream governance act.

---

## 16. Direct Grant Temporal Law

A Direct Delegation Grant SHALL be constitutionally bounded.

Its lawful temporal form may be:

- **Effective-Dated**
- or:
- **Event-Bound**

where supported by governing WS/POL contracts.

An unbounded delegated Authority SHALL NOT be treated as permanently valid merely because the underlying Relationship persists historically.

---

## 17. Single Operative Grant Representation

Each one constitutional Authority transfer SHALL have one operative authoritative representation appropriate to its form.

Therefore the same transfer SHALL NOT be duplicated as both:

```text
ASSIGNED_ROLE
```

and:

```text
DELEGATES_AUTHORITY_TO
```

merely for convenience.

Multiple related artifacts are lawful only where they represent distinct constitutional facts.

For example, an Employment Contract may lawfully support both:

```text
EMPLOYED_BY
```

and:

```text
ASSIGNED_ROLE
```

because those relationships mean different things.

---

## 18. Delegation Lineage

A Delegation Lineage is the deterministic Authority-derivation path from legitimate Authority origin to final delegated Authority.

Example:

```text
Authority A0
↓
Grant D1
↓
Authority A1
↓
Grant D2
↓
Authority A2
↓
Actor
```

Delegation Lineage SHALL NOT become an independent source of Authority.

It is derived from authoritative grants and Authority state.

---

## 19. Immediate Parent Binding

Every Delegation derived from already-delegated Authority SHALL identify its exact immediate parent constitutional basis.

A parent may semantically be:

- legitimate originating Authority;
- Role Assignment carrying delegated Authority;
- Direct Delegation Grant carrying delegated Authority.

The physical typed reference is downstream contract work.

This Constitution freezes the semantic requirement.

---

## 20. Determinate Derivation

By default, one grant SHALL have one determinate immediate Authority derivation basis.

Arbitrary:

```text
parents[]
```

composition SHALL NOT be assumed lawful.

Where multiple Authorities must jointly create a child Authority, an explicit constitutional composition contract must define how that combination operates.

Implementation-defined Authority union is prohibited.

---

## 21. Delegation Derivation Is Acyclic

The Authority-derivation subgraph SHALL be acyclic.

This is invalid:

```text
D1 → D2 → D3 → D1
```

because the lineage fails to terminate at an independent legitimate Authority origin.

This rule applies to Delegation derivation only.

It does not prohibit lawful cycles in unrelated ZRM relationships.

---

## 22. Lineage May Branch

Delegation may branch downward:

```text
    A0
   /  \
 D1    D2
 │     │
 B     C
```

Sibling Delegations remain independently revocable, as POL requires.

Branching Delegation is distinct from WS supersession.

---

## 23. Supersession Is Not Parentage

WS supersession answers:

> *Which Relationship replaced this Relationship?*

Delegation parentage answers:

> *From which Authority did this Delegation derive?*

Therefore:

```text
supersedes_id ≠ delegation parent
```

and:

```text
supersession chain ≠ delegation lineage
```

No implementation may reuse lifecycle supersession metadata as Authority derivation.

---

## 24. Scope Attenuation

Every child Delegation SHALL satisfy:

```text
scope(child) ⊆ scope(parent)
```

across every constitutionally material dimension.

This may include:

- function;
- jurisdiction;
- organization;
- operation;
- Action;
- Target;
- Capability;
- monetary bounds;
- other typed Authority constraints.

Equality is allowed where governing law permits full delegation.

**Expansion is never allowed.**

POL explicitly prohibits delegated Authority exceeding its origin.

---

## 25. Temporal Attenuation

A child Delegation SHALL not outlive its parent basis.

Conceptually:

```text
validity(child) ⊆ validity(parent)
```

and effective validity additionally depends on continuing constitutional validity of every ancestor.

A nominal `validTo` later than the parent's actual revocation cannot preserve child Authority.

---

## 26. Subdelegation

Delegated Authority does not automatically include power to subdelegate.

A child Delegation requires explicit constitutional permission to delegate onward.

**Silence SHALL NOT mean permission.**

The system SHALL NOT infer subdelegation rights from:

- possession of Authority;
- Role Type;
- technical capability;
- employment;
- Trust;
- API access;
- absence of prohibition.

---

## 27. Revocation Cascade

Where parent Authority loses constitutional validity:

```text
parent invalid
↓
dependent child invalid
↓
dependent descendant invalid
```

for current execution.

This does not erase the historical grants.

POL explicitly states that loss of parent validity invalidates dependent Delegations while preserving the constitutional relationship.

---

## 28. Branch-Local Revocation

If:

```text
      D1
     /  \
   D2    D3
   │
   D4
```

and D2 is revoked:

```text
D2 invalid
D4 invalid
D3 unaffected
```

unless another independent rule invalidates D3.

Sibling independence is preserved.

---

## 29. No Automatic Re-Parenting

If a parent becomes:

- revoked;
- expired;
- superseded;
- unavailable;
- succeeded;

the child SHALL NOT silently bind to a newer, similar, or compatible Authority.

This is prohibited:

```text
old parent invalid
↓
find latest compatible parent
↓
continue
```

A new constitutional grant is required.

REC-01E separately prohibits "latest," nearest-compatible, current-state, and silent-upgrade semantics within bound execution state.

---

## 30. Constitutional Succession

Succession does not automatically preserve Authority identity.

A successor Authority is newly constitutionally established; historic provenance remains. POL explicitly states that succession does not preserve Authority identity.

Dependent Delegations therefore SHALL NOT silently migrate to successor Authority unless governing constitutional law explicitly establishes continuity.

---

## 31. Agency Binding

An Agency Binding is a derived execution-specific constitutional composition establishing:

- one exact Actor
- relies on one exact authoritative Agency Basis
- to act in relation to one exact Governed Subject
- within one exact execution snapshot.

Agency Binding:

- does not create Authority
- does not create Delegation
- does not create Trust
- does not create Permission
- does not create Identity

Its purpose is correspondence.

---

## 32. Agency Binding Constitutional Home

Agency Binding is semantically part of V2 Participation.

The authoritative grants themselves remain in constitutional state.

Proof remains under Evidence/Attestation/Security ownership.

Conceptually:

```text
participation
├── ACTOR
├── GOVERNED_SUBJECT
└── Agency Binding
      │
      ▼
constitutionalState
├── Authority
├── Role Assignment
└── Delegation Grant
```

REC-01G explicitly defines participation as the V2 component identifying Subjects and execution roles, including ACTOR and GOVERNED_SUBJECT, and requires many-to-many capability.

---

## 33. Atomic Agency Binding

One Agency Binding SHALL bind exactly:

```text
1 ACTOR
↕
1 GOVERNED_SUBJECT
```

through one determinate terminal Agency Basis.

One execution may contain:

```text
0..N Agency Bindings
```

This supports:

- one Actor / many Governed Subjects;
- many Actors / one Governed Subject;
- multi-party execution.

---

## 34. Mandatory Binding Rule

Where:

```text
Actor ≠ Governed Subject
```

and agency is constitutionally claimed:

```text
Agency Binding is mandatory
```

Missing binding SHALL NOT be repaired by collapsing the identities.

No:

```text
Actor = Governed Subject
```

fabrication is permitted.

---

## 35. No Hidden Participants

Every Agency Binding endpoint SHALL resolve to an explicit V2 Participation entry.

The Actor endpoint must correspond to an ACTOR role.

The Governed Subject endpoint must correspond to a GOVERNED_SUBJECT role.

Agency Binding may not introduce hidden Subjects.

---

## 36. Exact Delegate/Actor Correspondence

The terminal Delegate or Role Assignment holder in the Agency Basis SHALL correspond exactly to the Actor.

Example:

```text
Grant terminates at Alice
Actor = Bob
```

is invalid.

Likewise a Role Assignment belonging to Alice cannot justify Bob's execution.

---

## 37. Governed Subject Correspondence

The Agency Basis must explicitly support the claimed Actor↔Governed-Subject relation.

This correspondence SHALL NOT be inferred solely from:

- organization scope;
- same tenant;
- employer metadata;
- contract title;
- Role Type;
- business convention;
- shared ownership;
- SDK route.

The Authority Issuer, Delegator, and Governed Subject may legitimately be different Subjects.

REC-01C explicitly requires multi-party cases where Actor, Governed Subject, Authority Issuer, Target, and Beneficiary may differ.

---

## 38. Unknown Actor

V2 SHALL preserve epistemic incompleteness.

An Actor may be genuinely:

```text
UNKNOWN
```

where the operation permits it.

But UNKNOWN cannot satisfy an Agency Binding whose terminal Delegate is an identified Subject.

No fabricated anonymous Identity shall be created to force delegation compatibility. REC-01G expressly requires UNKNOWN Actor to remain representable.

---

## 39. Intent, Action, Target and Capability Remain Separate

Agency Binding SHALL NOT infer:

- Intent originator;
- Requested Action;
- Target;
- Capability;
- Authorization.

The same agency relation may support different attempted Actions, but each execution must bind its exact Action and Target separately.

Changing Action or Target can change whether Delegated Authority applies.

Therefore:

```text
valid Agency Binding
≠
valid Action authorization
```

---

## 40. Exact Snapshot Binding

All execution-affecting agency state SHALL belong to one exact constitutional snapshot.

This includes, where material:

- Actor;
- Governed Subject;
- terminal Agency Basis;
- required lineage;
- Authority source;
- temporal state;
- revocation state;
- proof;
- Action;
- Target.

Individually valid pieces from incompatible snapshots SHALL NOT be composed by default.

REC-01E states that split-brain constitutional state is invalid unless cross-state composition is explicitly governed.

---

## 41. No Post-Binding Substitution

After an execution snapshot is bound, the following changes require a new bound execution state:

- Actor replacement;
- Governed Subject replacement;
- Agency Basis replacement;
- parent lineage replacement;
- Action replacement;
- Target replacement;
- execution-affecting proof replacement.

"Newer" or "more valid" does not preserve execution identity automatically.

---

## 42. Delegation Proof

Delegation Proof is not a new primitive.

It means:

> *the complete set of independently verifiable constitutional material necessary to establish the delegation-related claims relied upon by an Agency Binding.*

It may include:

- authoritative constitutional state;
- deterministic derivation;
- intrinsic cryptographic verification;
- governed Registry state;
- Evidence;
- registered Attestations where constitutionally necessary.

---

## 43. Attestation

RSN-003 already owns the universal Attestation Framework.

Attestations prove constitutional-process compliance; they are never the source of truth. RSN also prohibits Attestation Inflation where compliance is already independently established through deterministic reproduction, intrinsic cryptographic integrity, or an existing governance mechanism.

Therefore:

```text
proof required
≠
new Attestation always required
```

No separate Delegation Attestation framework shall be created.

---

## 44. Delegation Chain ≠ Attestation Chain

A Delegation Chain represents:

```text
Authority derivation
```

An Attestation Chain represents:

```text
proof/compliance derivation
```

They SHALL remain distinct.

A valid Attestation cannot manufacture a missing Authority lineage.

A complete Delegation lineage cannot waive mandatory Security Attestation.

---

## 45. Proof-to-Source Traceability

Every execution-affecting proof SHALL remain traceable to the exact authoritative constitutional artifact whose claim it proves.

This is insufficient:

```text
delegationValid = true
```

without governed source identity, verifier semantics, temporal coordinate, and provenance.

Proof compression may optimize transport, but it SHALL NOT destroy constitutional traceability.

---

## 46. Technical / AI Proof Requirements

Technical identities require stronger SEC proof obligations.

SEC requires Technical identities to have Identity, security attestation, capability scope, and delegation chain; AI Agent chains must remain attributable and cryptographically verifiable.

These extra proof requirements change the security burden.

They do not create a separate AI Delegation ontology.

---

## 47. Self-Attestation Prohibited Where External Proof Is Required

An AI Agent cannot prove:

> *"I am authorized"*

merely by signing its own assertion.

SEC explicitly prohibits AI self-attestation and self-authorization.

Required Attestation must originate from the constitutionally authorized proof source.

---

## 48. Current Validity and Revocation

An authentic historical proof does not establish current validity.

For current execution, the relevant Delegation and required Security state must be valid for the execution's explicit temporal coordinate.

SEC requires revocation to override cached trust, invalidate delegated capability, and preserve audit history; expired/revoked state can remain historically valid while losing operational authority.

Therefore:

```text
cryptographically valid
≠
currently valid
```

and:

```text
historically valid
≠
currently authorized
```

---

## 49. Missing Current State

Where current revocation or Authority validity is constitutionally required but cannot be established:

```text
absence of proof
≠
proof of validity
```

The result must remain governed:

- unavailable;
- indeterminate;
- deny/fail-closed;

according to the owning contract.

`DELEGATION-001` SHALL NOT invent a universal fallback.

---

## 50. Historical Delegation

Historical state SHALL remain reconstructable exactly.

A Delegation valid at T1, revoked at T2, may be provable at T3 as historical T1 state.

It SHALL NOT thereby authorize a new T3 execution.

Historical reconstruction must preserve:

- exact grants;
- exact parent bindings;
- exact Authority origins;
- exact temporal coordinates;
- historical revocation state;
- source provenance;
- contract generation.

---

## 51. Role/Grant Historical Preservation

Role Type deprecation, Relationship supersession, Authority succession, revocation, or later policy evolution SHALL NOT rewrite the historical meaning of a previously valid Delegation.

The old state remains historical truth.

The new state controls only the constitutional period to which it applies.

---

## 52. Cross-Tenant Delegation

A valid Delegation does not automatically bypass WS cross-tenant governance.

Where a Delegation crosses tenant boundaries, all applicable WS admission requirements also apply.

WS explicitly requires authorized cross-tenant Relationships to satisfy contract binding, tenant consent, audit trail, and valid Intent Contract conditions.

Thus:

```text
POL-valid Delegation
+
WS-invalid cross-tenant relationship
```

is **not admissible**.

---

## 53. Cross-Domain Authority

Delegation does not automatically carry Authority across constitutional domains.

POL distinguishes Recognition from Delegation and requires explicit cross-domain recognition where necessary.

Therefore:

```text
Recognition ≠ Delegation
```

Both may be required.

---

## 54. Emergency Authority

Emergency Delegation remains subject to:

- explicit origin;
- bounded scope;
- time;
- attribution;
- auditability;
- provenance.

Emergency conditions SHALL NOT justify:

- implied Delegation;
- permanent scope expansion;
- provenance removal;
- indefinite Authority;
- retroactive authorization.

POL requires Emergency Authority itself to remain explicitly originated, temporally bounded, attributable, and auditable.

---

## 55. Application Responsibility

Application MAY:

- retrieve exact Role Assignments;
- retrieve Direct Delegation Grants;
- retrieve Authority sources;
- resolve exact lineage;
- retrieve Evidence and Attestations;
- compose Participation;
- construct Agency Binding;
- bind exact snapshot state.

Application SHALL NOT:

- invent Delegation;
- select a convenient substitute parent;
- infer Governed Subject;
- broaden scope;
- repair revoked Authority;
- manufacture Trust.

---

## 56. RI Responsibility

RI consumes already-governed execution state.

RI MAY verify constitutionally assigned coherence such as:

- Actor exists;
- Governed Subject exists;
- required Agency Binding exists;
- terminal basis corresponds to Actor;
- required lineage is present;
- required temporal coordinates exist;
- exact references cohere with the snapshot.

RI SHALL NOT:

- search for missing Delegation;
- choose "latest" Authority;
- infer agency;
- generate parent lineage;
- create Trust;
- create Delegation;
- create Authority.

REC-01G expressly limits Stage 5 to verifying required agency basis is present and coherently bound; it must not invent it.

---

## 57. Authorization

A valid Delegation does not equal Permission.

The constitutional flow remains:

```text
Valid Authority
+
Valid Delegation / Agency
+
Standing
+
Capability
+
Trust / Security requirements
+
Exact Requested Action
+
Target
+
Context
+
Applicable Policy
│
▼
POL Authorization
```

POL defines Authorization as the constitutional determination that a requested action is permitted under Authority, Policy, Context, and Governance.

Therefore:

```text
Delegation valid
≠
Action allowed
```

---

## 58. Forbidden Implications

The following SHALL be constitutionally prohibited:

- Identity → Delegation
- Employment → Delegation
- Trust → Delegation
- Capability → Delegation
- Evidence → Authority
- Attestation → Authority
- Relationship → Authority
- Role Type → Authority
- Direct Grant → bypass mandatory Role
- Policy ALLOW → Trust
- Agency Binding → Authorization
- Valid history → current Authority
- Latest grant → exact parent
- Missing parent → root Authority
- Silence → subdelegation permission
- Organization membership → agency
- API credential → agency

---

## 59. Core Invariants

The final permanent invariants of `DELEGATION-001` are:

| ID | Invariant |
| :--- | :--- |
| **DLG-001 — Explicitness** | Delegation SHALL be explicit. |
| **DLG-002 — Valid Origin** | Delegation SHALL derive from valid Authority. |
| **DLG-003 — No Sovereignty Creation** | Delegation SHALL never create sovereignty. |
| **DLG-004 — Attenuation** | Child Authority SHALL not exceed parent Authority. |
| **DLG-005 — Provenance** | Authority lineage SHALL remain reconstructable. |
| **DLG-006 — Temporal Bound** | Delegated Authority SHALL be temporally bounded. |
| **DLG-007 — Revocability** | Delegation SHALL be revocable according to governing law. |
| **DLG-008 — Cascade** | Parent invalidation SHALL invalidate dependent current Delegation. |
| **DLG-009 — Sibling Independence** | Sibling Delegations remain independently revocable. |
| **DLG-010 — Determinate Parentage** | Every derived Delegation SHALL possess exact parent basis. |
| **DLG-011 — Derivation Acyclicity** | Authority derivation SHALL be acyclic. |
| **DLG-012 — No Automatic Re-Parenting** | Delegation SHALL never migrate silently to another parent. |
| **DLG-013 — Explicit Subdelegation** | Subdelegation SHALL require lawful onward-delegation authority. |
| **DLG-014 — Role Precedence** | Mandatory specialized Role mechanisms SHALL outrank generic Direct Grants. |
| **DLG-015 — Single Operative Grant** | One Authority transfer SHALL have one operative grant representation. |
| **DLG-016 — Self-Execution Zero Case** | Self-execution SHALL not fabricate Delegation. |
| **DLG-017 — Explicit Cross-Subject Agency** | Actor ≠ Governed Subject SHALL require governed Agency Binding where agency is claimed. |
| **DLG-018 — Exact Actor Correspondence** | Terminal delegated Authority holder SHALL match the Actor. |
| **DLG-019 — Explicit Governed-Subject Correspondence** | Agency relationship to Governed Subject SHALL not be inferred. |
| **DLG-020 — Multi-Party Capability** | Execution SHALL support multiple Actors and Governed Subjects. |
| **DLG-021 — Agency Is Not Authority** | Agency Binding SHALL not create constitutional Authority. |
| **DLG-022 — Proof Is Not Authority** | Evidence and Attestation SHALL not create Authority. |
| **DLG-023 — No Attestation Inflation** | New Attestations SHALL exist only where existing proof is insufficient. |
| **DLG-024 — Current Validity Required** | Current execution SHALL not rely on stale Authority proof. |
| **DLG-025 — Historical Fidelity** | Historical Delegation SHALL remain reconstructable without becoming current Authority. |
| **DLG-026 — No Runtime Discovery** | RI SHALL not invent, discover, repair, or upgrade Delegation state. |
| **DLG-027 — Exact Snapshot Binding** | All execution-affecting agency state SHALL belong to one coherent execution snapshot. |
| **DLG-028 — No Contextual Inference** | Tenant, employer, Role name, profile, metadata, or business convention SHALL not manufacture agency. |
| **DLG-029 — Recognition Is Not Grant** | Observed/recognized Authority SHALL not itself create delegated execution Authority. |
| **DLG-030 — Human/AI Constitutional Continuity** | Humans and AI use the same constitutional Delegation law; security proof obligations may differ. |

---

## 60. Final Architectural Model

```text
AUTHORITY ORIGIN
│
▼
Governing Authority
│
┌───────────┴────────────┐
│                        │
▼                        ▼
SPECIALIZED ROLE FORM        DIRECT / MANDATE
│                        │
Authority Anchor          Governing source
│                        │
ASSIGNED_ROLE           Delegation Grant
│                        │
└───────────┬────────────┘
▼
Delegated Authority
│
optional lawful
subdelegation
│
▼
exact parent lineage
│
▼
proof / security material
│
▼
Agency Binding
Actor ↔ Governed Subject
│
▼
ExecutionRequest V2
Intent + Action + Target + State
│
▼
POL + SEC
│
▼
RI
│
▼
Receipt / Provenance
```

---

## 61. Constitutional Non-Goals

`DELEGATION-001` does not create:

- `ActorPrimitive`;
- `PrincipalPrimitive`;
- `DelegateIdentity`;
- `AgencyIdentity`;
- generic `DelegationRecord`;
- `DelegationTrust`;
- `DelegationCapability`;
- new `AuthorityAnchorRecord`;
- new Attestation framework;
- new Runtime stage;
- new ZRM mega-relationship object;
- domain-specific GS1 delegation law.

---

## 62. Contract / Implementation Boundary

This final Constitution deliberately does not freeze:

- TypeScript interfaces
- database tables
- SQL schema
- foreign keys
- REST routes
- SDK method names
- hash preimages
- canonical field order
- concrete parent-reference enum
- concrete AgencyBinding field names
- Attestation type identifiers

Those may now be designed only from this Constitution and its owning source constitutions.

No implementation agent is authorized to fill semantic gaps by convenience.

---

## 63. Predicate Registry Status

The direct-grant predicate is constitutionally selected for downstream Registry admission as:

```text
DELEGATES_AUTHORITY_TO
```

with inverse:

```text
RECEIVES_DELEGATED_AUTHORITY_FROM
```

Its Registry activation remains subject to the WS governance/admission process.

Finalization of `DELEGATION-001` does not itself mutate the Registry.

---

## 64. G-L05 Disposition

REC-01G previously identified the universal delegation/agency leaf contract as blocking V2 delegated execution.

`DELEGATION-001-FINAL` now closes the semantic architecture of that gap:

| Concern | Status |
| :--- | :--- |
| Direct Grant | CLOSED |
| Role-Based Delegation | CLOSED |
| Lineage | CLOSED |
| Attenuation | CLOSED |
| Subdelegation | CLOSED |
| Revocation Cascade | CLOSED |
| Agency Binding | CLOSED |
| Governed Subject Correspondence | CLOSED |
| Proof Requirements | CLOSED |
| Role-Mandated Precedence | CLOSED |

Therefore:

> **G-L05 — SEMANTICALLY CLOSED**

It remains physically dependent on downstream contract work.

---

## 65. Remaining External Dependencies

`DELEGATION-001` itself does not need reopening for these.

### A. CCP-RI-CLOSURE-02
Must close authoritative current temporal Authority/revocation ownership at `T_e_input`.

REC-01E already established that revocation must be evaluated against the temporal coordinate relevant to the constitutional question, while leaving exact authority ownership unresolved.

### B. V2 Physical Leaf Contract
Must translate Agency Binding, parent basis, proof refs, and participation into exact physical contracts.

### C. G-L11 / Canonicalization
Must establish deterministic V2 canonicalization and hash domain.

### D. G-L12 / Receipt Provenance
Must ensure receipts identify contract generation and exact agency/proof state where material.

### E. RSN/SEC Attestation Registration
Where the necessity test proves a new Delegation/Security Attestation type is required, that type must be registered through RSN governance. RSN reserves Identity and Security domains but prohibits unregistered Attestation types.

### F. WS Predicate Admission
`DELEGATES_AUTHORITY_TO` must enter the Relationship Registry through the normal WS governance path.

---

## 66. Implementation Readiness

The question is:

> *Would an implementation agent still need to invent Delegation semantics?*

After this Constitution:

**No for:**

- direct vs role-based delegation;
- role-mandated precedence;
- Authority origin;
- grant semantics;
- lineage;
- immediate parent;
- attenuation;
- temporal containment;
- subdelegation;
- revocation cascade;
- self-execution;
- Actor / Governed Subject agency;
- multi-party agency;
- unknown Actor behavior;
- proof/Attestation separation;
- AI/Technical delegation requirements;
- historical behavior.

**Yes, improperly, if implementation began now, for:**

- physical V2 shape;
- exact current Authority-resolution ownership;
- canonicalization;
- receipt generation bindings;
- any unregistered Attestation type.

Therefore:

> **IMPLEMENTATION REMAINS NOT AUTHORIZED.**

The reason is now downstream physical-contract closure—not missing Delegation architecture.

---

## 67. Ratification Readiness

`DELEGATION-001-FINAL` has passed:

```text
Constitutional source audit
↓
Direct/non-role audit
↓
Lineage audit
↓
Governed Subject audit
↓
SEC/RSN proof audit
↓
Contract synthesis
↓
PH5-A
↓
PH5-B
↓
PH5-C
↓
PH5-D
↓
PH5-E adversarial falsification
↓
CORR-01
↓
Final consolidation
```

PH5-E found one false-accept risk—generic direct grants bypassing mandatory recognized roles—and CORR-01 closed it without reopening the architecture.

No unresolved contradiction remains inside the Delegation Constitution itself.

---

## 68. Final Disposition

```text
DELEGATION-001-FINAL
UNIVERSAL DELEGATION & AGENCY CONSTITUTION

CLASS:
SECONDARY CONSTITUTIONAL CONSTRUCT

NATURE:
CROSS-CONSTITUTIONAL
DERIVED
NON-SOVEREIGN

CONSTITUTIONAL PURPOSE:
COMPOSE EXISTING AUTHORITY,
ROLE, RELATIONSHIP, SECURITY,
PROOF AND EXECUTION LAW
INTO ONE UNIVERSAL
DELEGATION MODEL

NEW ZRM PRIMITIVE:
NO

NEW IDENTITY SYSTEM:
NO

NEW AUTHORITY SYSTEM:
NO

NEW TRUST SYSTEM:
NO

GENERIC DelegationRecord:
NO

ROLE-BASED DELEGATION:
ASSIGNED_ROLE
AUTHORITY ANCHOR

DIRECT DELEGATION:
AUTHORITY-FAMILY
REIFIED DELEGATION GRANT

DIRECT PREDICATE:
DELEGATES_AUTHORITY_TO

SPECIALIZED FORM PRECEDENCE:
MANDATORY

LINEAGE:
EXACT
DERIVED
ACYCLIC
ORIGIN-TERMINATING
NON-AUTHORITATIVE AS A SEPARATE OBJECT

ATTENUATION:
MANDATORY

SUBDELEGATION:
EXPLICIT

REVOCATION:
CASCADES DOWN DEPENDENT BRANCHES

SELF-EXECUTION:
ZERO DELEGATION

ACTOR != GOVERNED SUBJECT:
EXPLICIT AGENCY BINDING REQUIRED

AGENCY BINDING:
EXECUTION-DERIVED
NON-AUTHORITATIVE
MULTI-PARTY CAPABLE

PROOF:
EXISTING RSN / SEC FRAMEWORK
NO SECOND PROOF SYSTEM

AI / TECHNICAL ACTORS:
NO INHERENT AUTHORITY
GOVERNED DELEGATION + SECURITY PROOF REQUIRED

HISTORICAL STATE:
PRESERVED
NEVER PROMOTED TO CURRENT AUTHORITY

G-L05:
SEMANTICALLY CLOSED

FUNDAMENTAL CONSTITUTIONAL BLOCKER:
NONE

RATIFICATION READINESS:
PASS

IMPLEMENTATION AUTHORITY:
NONE

NEXT CONSTITUTIONAL GATE:
CCP-RI-CLOSURE-02
AGENCY AUTHORITY & TEMPORAL VALIDITY OWNERSHIP
```

---

## 69. Ratification Recommendation

`DELEGATION-001-FINAL` is ready for Chair ratification as Zyppi's canonical secondary Universal Delegation & Agency Constitution.

Upon ratification, the PH5 packets and CORR-01 should remain preserved as the audit/derivation record, while this document alone becomes the normative `DELEGATION-001` source for subsequent `CCP-RI-CLOSURE-02` and V2 contract closure.
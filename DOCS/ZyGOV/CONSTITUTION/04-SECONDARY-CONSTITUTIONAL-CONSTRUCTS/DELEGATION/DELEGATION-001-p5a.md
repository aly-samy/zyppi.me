DELEGATION-001-PH5-A — Delegation Grant Relationship Contract

Field	Determination

Parent Constitution	DELEGATION-001 — Universal Delegation & Agency Constitution
Phase	PH5-A
Purpose	Close the constitutional relationship contract for direct/non-role Delegation
Classification	SECONDARY CONSTITUTIONAL / RELATIONSHIP CONTRACT
Canonical Relationship Framework	WS-03C / WS-04B
Constitutional Meaning Owner	POL
Registry Owner	CL-17 Graph Core
Implementation Authority	NONE
Repository Mutation Authority	NONE
Predicate Admission	NOT YET AUTHORIZED
Status	OPEN — CONTRACT SYNTHESIS EXECUTED


1. Governing question

PH5-A answers:

> What exact governed Relationship represents one explicit direct transfer of bounded Authority from one Subject to another when that transfer is not naturally represented by an ASSIGNED_ROLE Role Assignment?



This packet does not design:

Delegation-chain transport;

V2 Agency Binding;

SEC Attestation types;

Runtime implementation;

TypeScript;

SQL.


Those belong downstream.


---

2. The constitutional basis is sufficient

POL already gives the semantic law.

Delegation:

transfers Authority;

never transfers sovereignty;

requires valid Authority in the delegator;

cannot exceed its origin;

preserves complete provenance;

must be explicit;

is independently revocable;

is temporally bounded;

becomes invalid when its parent Authority loses constitutional validity. 


WS already supplies the correct persistence framework.

A Tier-2 Reified Relationship possesses immutable identity, lifecycle, supersession, governance, evidence support and auditability. The Governance Layer—not its traversal projection—is authoritative. 

Therefore:

POL
defines WHAT Delegation means

WS
defines HOW a governed relationship
with that meaning exists constitutionally

DELEGATION-001
binds the two

No new relationship framework is required.


---

3. Relationship tier

Determination PH5-A-01

The Delegation Grant SHALL be:

TIER-2 — REIFIED RELATIONSHIP

A Structural Edge is constitutionally insufficient.

Delegation has:

independent constitutional significance;

Authority requirements;

Evidence requirements;

provenance;

temporal validity;

revocation consequences;

historical importance;

independent referential value;

lifecycle behavior.


WS requires these characteristics to use Reified Relationship architecture. 

Therefore:

Delegation Grant
        ≠
Structural Edge


---

4. Relationship family

WS establishes exactly eleven constitutional Relationship Families, including:

Authority
Operational
Ownership
Identity
...

New families require constitutional amendment. 

Delegation is defined by POL as transfer of Authority.

Therefore:

Relationship Family = AUTHORITY

Not:

Operational
Commercial
Identity
Graph

PH5-A-02 — Authority-Family Classification

> Every direct Delegation Grant SHALL belong to the existing Authority Relationship Family.



No new Delegation Relationship Family is justified.


---

5. Semantic domain and range

The active Foundation model defines Subject as the autonomous Reality constituent capable of initiating, holding Standing and acting with Intent, including Human, Organization, AI Agent and Autonomous System. 

REC-01C further closes Actor as an execution role played by a Subject, not another Reality primitive. 

Therefore the semantic relationship is:

Subject
   │
   │ delegates bounded Authority to
   ▼
Subject

PH5-A-03 — Subject-to-Subject Law

> The domain and range of the universal Delegation Grant SHALL be Subject → Subject.



Legacy WS/RI compiler vocabulary that physically refers to CL-01.Entity.Actor SHALL NOT cause DELEGATION-001 to re-ratify Actor as a peer Reality primitive.

The final compiled FQCN mapping belongs to the active Subject/primitive reconciliation.

Semantically:

SOURCE = Delegator Subject
TARGET = Delegate Subject


---

6. Predicate direction

WS requires every relationship to possess immutable semantic direction, and every relationship type to define an inverse semantic predicate. The inverse supports traversal; it does not create a second Relationship. 

The direct grant needs to answer unambiguously:

> Who transferred Authority to whom?



After comparing the possible forms, the cleanest predicate is:

DELEGATES_AUTHORITY_TO

with inverse:

RECEIVES_DELEGATED_AUTHORITY_FROM

Conceptually:

Subject A
   │
   │ DELEGATES_AUTHORITY_TO
   ▼
Subject B


Subject B
   │
   │ RECEIVES_DELEGATED_AUTHORITY_FROM
   ▼
Subject A

Why not GRANTS_AUTHORITY_TO?

Because not every Authority grant is Delegation.

POL distinguishes:

Sovereign Authority;

Institutional Authority;

Delegated Authority. 


GRANTS_AUTHORITY_TO would therefore be semantically broader than this contract.

Why not AUTHORIZED_AGENT_OF?

Because that encodes an agency interpretation and potentially a Governed Subject, rather than the constitutional act of Authority transfer.

Why not ACTS_FOR?

Because acting for someone is execution-specific and belongs to Agency Binding.

PH5-A-04 — Predicate Candidate

Forward:
DELEGATES_AUTHORITY_TO

Inverse:
RECEIVES_DELEGATED_AUTHORITY_FROM

Disposition: accepted as the PH5-A canonical candidate, subject to PH5-E adversarial simulation before Registry admission.


---

7. What the endpoints mean

This is critical.

For:

A DELEGATES_AUTHORITY_TO B

the meaning is:

A = Delegator
B = Delegate

It does not necessarily mean:

A = Governed Subject
B = Actor in every future execution

The same grant may later support different executions.

REC-01C explicitly requires a composable model where Actor, Governed Subject, Authority Issuer, Target Subject and Beneficiary may be different Subjects. 

Therefore:

PH5-A-05 — Grant Endpoints Are Not Execution Roles

> Source and Target of a Delegation Grant SHALL express Authority transfer only. They SHALL NOT implicitly become ACTOR or GOVERNED_SUBJECT roles in a later execution.



Those roles are bound by Agency Binding.


---

8. Required constitutional tier card

The proposed relationship card is now:

Property	PH5-A determination

Semantic Construct	Delegation Grant
Tier	REIFIED
Family	AUTHORITY
Forward Predicate	DELEGATES_AUTHORITY_TO
Inverse Predicate	RECEIVES_DELEGATED_AUTHORITY_FROM
Source Semantic Type	Subject
Target Semantic Type	Subject
Source Role	Delegator
Target Role	Delegate
Authority Required	YES
Evidence Required	MANDATORY
Provenance Required	MANDATORY
Temporal	MANDATORY / BOUNDED
Independent Lifecycle	YES
Supersession	YES
Historical Queryability	YES
Confidence Field	PROHIBITED
Governed Subject Field	NO
Role Type Field	NO
Action Field	NO
Capability-as-proof	NO



---

9. Authority requirement

WS states that relationships requiring Authority must validate it before relationship activation; failure prevents creation. 

POL is even stronger:

> only an Actor possessing valid Authority may delegate Authority. 



Therefore:

authority_required = true

is mandatory.

PH5-A-06 — Delegator Authority Validation

A Delegation Grant SHALL NOT become constitutionally active unless the Delegator possesses valid Authority sufficient to make the grant.

This includes:

delegatedScope ⊆ delegatorAuthority

The relationship may never bootstrap its own authority requirement.

That would be circular.


---

10. Authority reference semantics

The WS Reified Relationship schema already contains:

authority_reference



PH5-A assigns the following meaning for Delegation Grant:

> authority_reference SHALL identify or resolve the constitutional Authority basis under which the Delegator possesses the right to make this grant.



It SHALL NOT mean:

"this relationship itself is the ultimate Authority origin"

unless the governing constitution expressly establishes such an origin.

The Delegation Grant remains subordinate Authority.


---

11. Authority Anchor relationship

Role Assignment has a stronger specialized law:

ASSIGNED_ROLE
    ↓
exactly one Authority Anchor

and scope belongs to that Anchor. 

PH5-A SHALL NOT silently universalize that Role-Assignment-specific physical rule into:

every Delegation Grant must contain authority_anchor_id

The direct grant instead requires a valid constitutional Authority reference.

A governing instrument such as:

Delegation Order;

Agency Appointment;

Board Resolution;

Service Agreement;

Trust Instrument;


may serve as the authoritative source material. WS already recognizes these instruments in its Authority Anchor vocabulary. 

But:

Authority Anchor mechanism for ASSIGNED_ROLE

and:

authority_reference on Direct Delegation Grant

remain distinct until a later constitutional amendment explicitly unifies them.


---

12. Evidence requirement

WS permits Relationship Pattern evidence modes:

NONE
RECOMMENDED
MANDATORY

and does not allow a required-evidence relationship to become active until its evidence requirement is satisfied. 

POL requires Delegation to occur through an explicit constitutional grant. 

Therefore:

evidence_required = MANDATORY

for direct Delegation Grant.

PH5-A-07 — Explicit Grant Evidence

The Evidence set SHALL establish or resolve the explicit constitutional grant from which the Delegation relationship arises.

Merely asserting:

A says B may act

is insufficient unless that assertion is itself constitutionally admitted as the governing grant.

Evidence supports the grant.

Evidence does not become the Authority.


---

13. Evidence types

WS permits Relationship evidence such as:

Transaction;

Event;

Document;

Certificate;

External Credential;

Human Expert Rationale. 


PH5-A does not create a second evidence taxonomy.

However:

PH5-A-08 — Expert Rationale Cannot Manufacture Delegation

A Human Expert Rationale by itself SHALL NOT create Delegated Authority merely because WS recognizes it as an allowed Relationship evidence category.

POL still requires:

valid Authority
+
explicit constitutional grant

The Evidence mode does not override Authority law.


---

14. Provenance

WS requires every Relationship to maintain provenance and declares a Relationship without origin constitutionally incomplete. 

POL independently requires every Delegation to preserve constitutional lineage to the originating Authority. 

Therefore Delegation Grant has two compatible provenance duties:

Relationship provenance
+
Authority provenance

They are not interchangeable.

Relationship provenance asks

> What Transaction/Event/imported constitutional process established this Relationship?



Authority provenance asks

> From which constitutional Authority does the Delegated Authority derive?



Both SHALL remain reconstructable.


---

15. Relationship identity

WS-04B requires every Reified Relationship to receive:

relationship_id : UUIDv7

globally unique, immutable, permanently assigned, never reused, and not content-derived. 

Delegation Grant SHALL inherit this unchanged.

No new:

delegation_id

identity system is necessary.

Conceptually:

delegationGrantId
    =
existing relationship_id

at the semantic level.

The exact implementation symbol remains outside this packet.


---

16. Temporal classification

POL makes temporal boundedness mandatory for Delegation. 

WS permits three Relationship temporal types:

Permanent
Effective-Dated
Event-Bound



Permanent cannot be the universal Delegation Grant temporal type because POL explicitly prohibits constitutionally unbounded Delegated Authority.

Therefore:

PH5-A-09 — Permanent Delegation Prohibited

A Delegation Grant SHALL NOT use Permanent as its authority-effective temporal classification.

Permitted temporal modes are:

Effective-Dated
Event-Bound

depending upon the constitutional grant.

Examples:

Power of Attorney
2026-01-01 → 2026-06-30
= Effective-Dated

Authority limited to one governed event
= Event-Bound

Every instance SHALL explicitly identify its temporal type.

No default-to-permanent behavior is permitted.


---

17. Expiry is not deletion

When temporal validity ends:

valid_to < relevant constitutional time

the grant no longer authorizes current delegated execution.

But historical truth remains.

REC-01E explicitly preserves the distinction:

old ≠ invalid
historically valid ≠ currently authorized

and requires exact temporal state rather than silent current/latest substitution. 

Therefore expiration:

terminates current authority effect

but does not erase:

historical Delegation Grant


---

18. Cardinality

Every Reified Relationship must declare cardinality. WS requires point-in-time and lifetime cardinality for temporal relationships. 

The universal Delegation Grant must allow:

one Subject → many delegates

many Subjects → one delegate

many Subjects ↔ many delegates

Examples:

Company → Alice
Company → Bob
Company → AI Agent

and:

Alice receives different delegated Authorities
from Company A
from Foundation B
from Regulator C

Therefore:

PH5-A-10 — Cardinality

Point-in-Time:
Many-to-Many

Lifetime:
Many-to-Many

This establishes no universal upper bound on the number of grants.

Each individual Relationship instance, however, still has exactly:

one source
one target


---

19. One grant is atomic

A single Delegation Grant SHALL mean:

> one Delegator transferring one constitutionally coherent bounded Authority grant to one Delegate.



It SHALL NOT be:

A + B
jointly delegate
different unrelated authorities
to C + D
inside one Relationship instance

Where multiple grants exist, separate Relationship instances are required unless another constitution explicitly defines a joint Authority composition.

This protects lineage and revocation determinism.


---

20. Relationship lifecycle

Delegation Grant inherits the WS Reified Relationship lifecycle:

ACTIVE
SUPERSEDED
SUSPENDED
DISPUTED
TERMINATED



However, PH5-A establishes a critical separation:

Relationship Status ≠ Authority Validity

For example:

relationship historically exists
+
parent Authority revoked

means the historical Relationship remains real, but its delegated Authority may no longer be constitutionally valid for current execution.

Therefore:

status = ACTIVE

by itself SHALL NEVER prove current authorization.

POL Authority validity remains decisive.


---

21. Revocation

POL says:

revocation
    ↓
Authority ceases immediately

and loss of parent Authority invalidates dependent Delegations. 

PH5-A therefore establishes:

PH5-A-11 — Revocation Precedence

> No Relationship lifecycle state, cache, traversal projection, stale registry entry, or prior Attestation may preserve current delegated Authority after constitutionally effective revocation.



The historical relationship remains queryable.

Current authority does not.

The exact WS lifecycle transition corresponding to POL revocation remains for CLOSURE-02 / lifecycle alignment; PH5-A does not invent it.


---

22. Supersession

WS requires Relationship semantic changes to create a new relationship through supersession; predicates and relationships are not mutated in place. Supersession chains are linear. 

Therefore changing:

Delegate;

Delegator;

authority basis;

materially different scope;

constitutional grant identity;


cannot rewrite the existing grant.

A new Delegation Grant SHALL be created where constitutional meaning changes.

This preserves history.


---

23. Scope ownership

A Delegation is bounded Authority.

But PH5-A SHALL NOT introduce:

scope: Record<string, unknown>

into the Relationship.

That would create the same untyped escape hatch REC-01D prohibited elsewhere.

Instead:

> The Delegation Grant SHALL bind to an authoritative, typed Authority scope defined by its governing Authority contract or source artifact.



For role-based delegation, WS already places scope on the Authority Anchor rather than ASSIGNED_ROLE. 

For direct Delegation Grant, PH5-A establishes the same separation principle, without asserting that the physical owner must literally be WS Authority Anchor:

Relationship
    identifies transfer

Authority state/source
    defines constitutional scope

The relationship SHALL NOT invent its own parallel scope language.


---

24. No Role Type

Direct/non-role Delegation exists precisely because not every lawful grant represents a durable Role.

Therefore the relationship SHALL NOT require:

role_type_ref

A grant such as:

sign this agreement once

does not require creation of:

ONE_TIME_AGREEMENT_SIGNER_ROLE

PH5-A-12 — Role Non-Fabrication

Direct Delegation Grant SHALL NOT create or require a Role Type solely to satisfy persistence architecture.

Role-based grants continue to use ASSIGNED_ROLE.


---

25. No Governed Subject field

The persistent grant records:

Delegator
      ↓
Delegate

It does not universally answer:

For whom is this Actor acting in a particular execution?

That belongs to Agency Binding.

Therefore PH5-A explicitly rejects adding:

principal_id
governed_subject_id
beneficiary_id

to the universal Delegation Grant solely for RI convenience.

A governing instrument may naturally identify represented entities, but that does not alter the universal relationship endpoint semantics.


---

26. No Action field

Likewise the Relationship SHALL NOT contain a universal:

action: string

A direct grant may be Action-bounded, but that boundary belongs to its governed Authority scope.

Requested Action remains a separate execution coordinate under REC-01D.

Thus:

Delegation Grant
    ≠
Requested Action

This prevents persistent authority state from being polluted with execution transport semantics.


---

27. No Capability field as proof

The relationship may ultimately bind Authority state whose scope concerns a Capability.

But:

requestedCapability

shall not be treated as proof that the Delegation permits it.

REC-01C already establishes:

Capability ≠ Delegation

and the Actor/agency basis must remain independently established. 


---

28. Cross-tenant Delegation

This is critical for:

Manufacturer → 3PL
Company → external law firm
Enterprise → external AI service

WS prohibits cross-tenant relationships by default.

A cross-tenant relationship requires:

explicit authorization;

Contract binding;

tenant consent;

audit trail;

valid Intent Contract. 


Therefore:

PH5-A-13 — Cross-Tenant Delegation Firewall

A direct Delegation Grant crossing tenant boundaries SHALL NOT bypass WS-03C's cross-tenant firewall merely because POL delegation is semantically valid.

Both must hold:

POL-valid Delegation
+
WS-valid cross-tenant relationship admission

Otherwise:

REJECT


---

29. Current versus historical resolution

WS establishes:

Current-state query
    → Active Relationship Index

Historical query
    → Relationship Registry
      + Supersession Index



Delegation Grant inherits this.

But a current relationship lookup alone still does not prove current Authority validity.

Therefore:

ARI
answers:
which Relationship is currently represented as active

POL/SEC-governed authority state
answers:
whether it is constitutionally usable now

This distinction will be central to CLOSURE-02.


---

30. Governance Layer primacy

Delegation Grant SHALL exist authoritatively in the WS Governance Layer.

The Traversal Layer may expose a projection such as:

A DELEGATES_AUTHORITY_TO B

for navigation.

But that projection cannot carry the complete constitutional authority truth.

WS explicitly makes Traversal derived and non-authoritative. 

Therefore:

PH5-A-14 — No Traversal Authorization

A graph edge encountered during traversal SHALL NOT by itself authorize an execution.

Runtime/Application must resolve the governed Reified Relationship and its required Authority state.


---

31. Proposed Relationship Registry card

The semantic Registry proposal is now:

RELATIONSHIP TYPE
-----------------

Canonical semantic name:
Delegation Grant

Forward predicate:
DELEGATES_AUTHORITY_TO

Inverse predicate:
RECEIVES_DELEGATED_AUTHORITY_FROM

Relationship family:
Authority

Constitutional tier:
REIFIED

Source:
Subject

Target:
Subject

Temporal:
Effective-Dated OR Event-Bound
Permanent prohibited

Point-in-time cardinality:
Many-to-Many

Lifetime cardinality:
Many-to-Many

Evidence required:
MANDATORY

Authority required:
TRUE

Provenance:
MANDATORY

Independent lifecycle:
YES

Supersession:
YES

Historical preservation:
YES

Confidence:
PROHIBITED

Role Type:
NOT REQUIRED / NOT OWNED HERE

Governed Subject:
NOT OWNED HERE

Requested Action:
NOT OWNED HERE

Policy authorization:
NOT OWNED HERE


---

32. WS-04B Pattern proposal

WS-04B requires every relationship to conform to an approved Pattern Registry entry, and unapproved relationships are rejected. The pattern schema includes source type, predicate, target type, constitutional tier, evidence requirement, authority requirement, specificity, status, rationale and admission time. 

The PH5-A pattern proposal is therefore:

source_cluster_type:
  Subject semantic class

predicate_id:
  DELEGATES_AUTHORITY_TO

target_cluster_type:
  Subject semantic class

constitutional_tier:
  REIFIED

evidence_required:
  MANDATORY

authority_required:
  true

status:
  PROPOSED

Deliberately not invented

The supplied corpus exposes specificity_level as a Pattern field but does not provide a sufficiently clear allowed-value vocabulary in the audited material.

Therefore PH5-A SHALL NOT invent:

specificity_level = "UNIVERSAL"

or another arbitrary value.

This is a Registry compilation/admission detail to resolve from the canonical Registry vocabulary before admission.

It does not block the semantic Relationship contract.


---

33. Predicate Registry status

WS predicate lifecycle is:

PROPOSED
UNDER_REVIEW
ACTIVE
DEPRECATED
RETIRED

and ACTIVE predicates become immutable. 

Therefore this packet establishes:

DELEGATES_AUTHORITY_TO
status = PROPOSED

RECEIVES_DELEGATED_AUTHORITY_FROM
status = PROPOSED

They SHALL NOT become ACTIVE before:

PH5-A contract closure
      ↓
PH5-B lineage closure
      ↓
PH5-C Agency Binding
      ↓
PH5-D proof card
      ↓
PH5-E adversarial simulation
      ↓
Council ratification
      ↓
WS admission

This respects WS-04B's mandatory:

> Proposal → Impact Analysis → Constitutional Review → Simulation → Ratification → Admission. 




---

34. Delegation Grant does not replace ASSIGNED_ROLE

This is a permanent boundary.

ROLE-BASED DELEGATION
        ↓
ASSIGNED_ROLE
+ Authority Anchor

WS already provides that exact constitutional mechanism. 

Whereas:

DIRECT / MANDATE DELEGATION
        ↓
DELEGATES_AUTHORITY_TO
Reified Relationship

The two may coexist.

They SHALL NOT duplicate the same constitutional grant.

PH5-A-15 — Single Representation of One Grant

> One constitutional Delegation SHALL have one authoritative grant representation appropriate to its form.



No shadow duplication such as:

ASSIGNED_ROLE
+
DELEGATES_AUTHORITY_TO

for the exact same Authority transfer merely for convenience.

If both relationships legitimately exist, they must describe distinct constitutional facts.


---

35. Examples

Example A — One-time signature mandate

Acme Corp
    │
    │ DELEGATES_AUTHORITY_TO
    ▼
Alice

Authority basis:

Board Resolution BR-42

Scope:

Sign Contract C-900 only

Validity:

2026-08-24 → 2026-08-31

No synthetic Role Type required.


---

Example B — Power of attorney

Human A
   │
   │ DELEGATES_AUTHORITY_TO
   ▼
Human B

Authority/evidence basis:

valid Power of Attorney instrument

The later execution still separately establishes:

Actor
Governed Subject
Action
Target
Policy


---

Example C — B2B logistics mandate

Manufacturer
      │
      │ DELEGATES_AUTHORITY_TO
      ▼
3PL

Possible authority scope:

submit custody-transfer events
for Shipment Family X
within Territory Y
during period T

Because this may cross tenant boundaries, WS cross-tenant admission rules also apply.


---

Example D — role-based employee

Alice
ASSIGNED_ROLE
Procurement Manager

with Authority Anchor.

No direct Delegation Grant is added merely because DELEGATION-001 exists.


---

36. Explicitly rejected forms

PH5-A rejects:

DELEGATION = Structural Edge

DELEGATION = AuthorityRecord only

DELEGATION = Capability possession

DELEGATION = Trust

DELEGATION = Evidence

DELEGATION = ASSIGNED_ROLE universally

DELEGATION GRANT = Agency Binding

source = Actor primitive
target = Principal primitive

relationship metadata says authorized=true

scope = Record<string, unknown>

latest matching delegation

All conflict with earlier reconciliation or source ownership.


---

37. PH5-A invariants

DLG-A01 — Reified Grant

A direct Delegation Grant SHALL be a Tier-2 Reified Relationship.

DLG-A02 — Authority Family

Every Delegation Grant SHALL belong to the Authority Relationship Family.

DLG-A03 — Subject Direction

A grant SHALL express:

Delegator Subject → Delegate Subject

DLG-A04 — Immutable Direction

Source and Target SHALL not reverse after creation.

DLG-A05 — Explicit Grant

A grant SHALL originate from an explicit constitutional delegation.

DLG-A06 — Authority Required

Delegator Authority SHALL be validated before activation.

DLG-A07 — Mandatory Evidence

Every direct grant SHALL possess the required Evidence establishing its explicit constitutional basis.

DLG-A08 — Mandatory Provenance

Every grant SHALL preserve Relationship provenance and Authority provenance.

DLG-A09 — Temporal Bound

A direct Delegation Grant SHALL be Effective-Dated or Event-Bound; unbounded Permanent delegated Authority is prohibited.

DLG-A10 — Many-to-Many

Universal grant cardinality SHALL permit many Delegators and many Delegates through separate atomic relationships.

DLG-A11 — No Role Fabrication

Direct grants SHALL not require artificial Role Types.

DLG-A12 — No Governed-Subject Collapse

Grant endpoints SHALL not automatically become V2 execution-role bindings.

DLG-A13 — Authority Validity Dominates Lifecycle Label

Relationship lifecycle status SHALL not override POL Authority validity.

DLG-A14 — Historical Preservation

Revocation, expiry or supersession SHALL not erase historical Delegation truth.

DLG-A15 — Traversal Is Non-Authoritative

A derived graph projection of the grant SHALL not independently authorize execution.

DLG-A16 — No Duplicate Grant Representation

The same constitutional Authority transfer SHALL not simultaneously be represented as direct Delegation Grant and Role Assignment without distinct governing meaning.


---

38. What PH5-A closes

Previously

DLG-GAP-01
Direct/non-role delegation
representation

Now

DLG-GAP-01
ARCHITECTURAL CONTRACT:
CLOSED

The answer is:

> Direct/non-role Delegation is represented as an Authority-family Tier-2 Reified Relationship between Subjects under WS governance.




---

39. What remains deliberately open

PH5-A does not yet close:

A. Parent derivation

How does a child Delegation Grant point to its immediate parent Authority / parent grant?

→ PH5-B

B. Scope attenuation across chains

How is:

scope(child) ⊆ scope(parent)

mechanically bound and verified?

→ PH5-B

C. Subdelegation permission

Exact parent-condition representation.

→ PH5-B

D. V2 Governed Subject correspondence

→ PH5-C

E. Exact RSN/SEC proof type

→ PH5-D

F. Predicate admission

→ only after PH5-E

G. specificity_level

The source corpus exposes the field but does not provide sufficient authoritative value semantics in this audit. It SHALL remain unresolved rather than invented.


---

40. PH5-A current determination

DELEGATION-001-PH5-A
DELEGATION GRANT RELATIONSHIP CONTRACT

STATUS:
  CONTRACT SYNTHESIS COMPLETE
  PREDICATE NOT YET ADMITTED

SEMANTIC CONSTRUCT:
  DELEGATION GRANT

CONSTITUTIONAL FORM:
  TIER-2 REIFIED RELATIONSHIP

FAMILY:
  AUTHORITY

SOURCE:
  SUBJECT / DELEGATOR

TARGET:
  SUBJECT / DELEGATE

FORWARD PREDICATE:
  DELEGATES_AUTHORITY_TO

INVERSE:
  RECEIVES_DELEGATED_AUTHORITY_FROM

TEMPORAL:
  EFFECTIVE-DATED
  OR EVENT-BOUND
  PERMANENT PROHIBITED

CARDINALITY:
  MANY-TO-MANY
  POINT-IN-TIME
  MANY-TO-MANY
  LIFETIME

EVIDENCE:
  MANDATORY

AUTHORITY:
  REQUIRED

PROVENANCE:
  MANDATORY

RELATIONSHIP IDENTITY:
  UUIDv7 / WS-04B

LIFECYCLE:
  WS REIFIED RELATIONSHIP LIFECYCLE

ROLE TYPE:
  NOT REQUIRED

GOVERNED SUBJECT:
  NOT OWNED BY GRANT

REQUESTED ACTION:
  NOT OWNED BY GRANT

AUTHORIZATION:
  NOT PRODUCED BY GRANT

ASSIGNED_ROLE:
  PRESERVED FOR ROLE-BASED DELEGATION

DLG-GAP-01:
  CLOSED AT CONTRACT-ARCHITECTURE LEVEL

IMPLEMENTATION AUTHORITY:
  NONE

NEXT:
  DELEGATION-001-PH5-B
  DELEGATION PARENT & LINEAGE CONTRACT

The next packet is now narrowly defined: PH5-B must tell us how one authoritative grant derives from another without creating a second lineage object, including parent binding, attenuation, subdelegation permission, cycles, revocation cascade, and historical reconstruction.
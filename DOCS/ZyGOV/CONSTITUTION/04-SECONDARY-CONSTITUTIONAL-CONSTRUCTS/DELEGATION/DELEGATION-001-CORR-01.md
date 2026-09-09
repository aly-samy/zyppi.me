DELEGATION-001-CORR-01

Role-Mandated Delegation Precedence Correction

Field	Determination

Parent	DELEGATION-001 — Universal Delegation & Agency Constitution
Trigger	PH5-E — E-FA-01 Role-Mandated Delegation Bypass
Affected Packet	DELEGATION-001-PH5-A
Secondary Impact	PH5-B / PH5-C / PH5-D interpretation only
Classification	CONSTITUTIONAL CORRECTION / NARROWING
Implementation Authority	NONE
New Primitive	NONE
New Relationship Type	NONE beyond PH5-A candidate
Status	CORRECTION EXECUTED — READY FOR CONSOLIDATION


1. Purpose

PH5-E found one false-accept risk in the synthesized Delegation model.

PH5-A correctly established a Direct Delegation Grant for lawful non-role delegation:

Subject
   │
   │ DELEGATES_AUTHORITY_TO
   ▼
Subject

However, PH5-A could be read as allowing that Direct Delegation Grant to substitute for a constitutionally mandatory Role Assignment.

That reading is invalid.

POL establishes both that Delegation is an explicit, bounded, provenance-preserving transfer of Authority and that individuals exercise organizational Authority only through constitutionally recognized roles. 

WS supplies the relevant operational mechanism: ASSIGNED_ROLE is the Reified Relationship through which delegated operational capacity is activated from an Authority Anchor; Role Assignment carries delegated Authority and does not originate it. 

This correction reconciles those rules without narrowing Delegation itself.


---

2. Constitutional finding

The error was not:

Direct Delegation Grant exists

The error was treating:

Direct Delegation Grant

as universally sufficient irrespective of the constitutional form required for the Authority being exercised.

The corrected law is:

> Delegation form is constrained not only by the existence of a valid grant, but also by any specialized constitutional mechanism governing how that Authority must be operationally exercised.



Therefore:

Valid Delegation
        +
wrong constitutional representation
        =
NOT execution-sufficient


---

3. DLG-E01 — Role-Mandated Delegation Precedence

The following rule is hereby adopted into DELEGATION-001:

> Where the governing Constitution requires an Actor to exercise a class of delegated Authority through a constitutionally recognized Role or another specialized delegation mechanism, that specialized mechanism SHALL take precedence over the generic Direct Delegation Grant representation.

A Direct Delegation Grant SHALL NOT be used to bypass a constitutionally mandatory Role Assignment, Authority Anchor, Technical-Identity requirement, security requirement, or other specialized delegation contract.



This is a precedence rule.

It does not abolish Direct Delegation.


---

4. Corrected decision model

The universal decision model becomes:

EXPLICIT AUTHORITY DELEGATION
          │
          ▼
What constitutional form governs
exercise of this Authority?
          │
     ┌────┴─────────────┐
     │                  │
     ▼                  ▼
SPECIALIZED         NO SPECIALIZED
FORM REQUIRED       FORM REQUIRED
     │                  │
     ▼                  ▼
use mandatory        DIRECT
mechanism            DELEGATION GRANT

For the current Constitution, the best-established specialized form is:

Authority Anchor
      ↓
ASSIGNED_ROLE
      ↓
Role Assignment

WS requires every Role Assignment to reference exactly one Authority Anchor and validates its scope, temporal constraints, jurisdiction and delegated permission before execution. 


---

5. Organizational Authority

POL states:

> Organizational Authority belongs to the organization rather than any individual member.



and:

> Individuals exercise organizational Authority only through constitutionally recognized roles. 



Therefore, where:

Organization O
      ↓
Human H

and H is to exercise O's organizational Authority, the operative representation SHALL be role-mediated.

Conceptually:

Organizational Authority
        │
        ▼
Governing Instrument
        │
        ▼
Authority Anchor
        │
        ▼
H ASSIGNED_ROLE RoleType
        │
        ▼
H exercises bounded
organizational Authority

A Direct Delegation Grant alone is insufficient for that constitutional purpose.


---

6. Important limitation — source type alone does not determine form

This correction SHALL NOT be reduced to:

Organization → Human
always = ASSIGNED_ROLE

That would be too broad.

The decisive question is:

> Is the recipient exercising the organization's organizational Authority through that delegation?



An Organization may potentially act as a constitutional grantor in another capacity governed by another Authority regime.

For example, an institution may issue Authority that becomes an independently governed institutional Authority rather than an internal organizational Role.

POL distinguishes Sovereign, Institutional and Delegated Authority. 

Therefore:

Delegator type
≠
delegation-form decision by itself

The governing Authority semantics decide.


---

7. Human → Human direct Delegation remains valid in principle

Nothing in POL establishes a universal Role Assignment requirement for every lawful:

Human A
      ↓
Human B

Delegation.

Therefore cases such as an explicitly governed personal mandate or power of attorney may continue to use Direct Delegation Grant where no other constitutional contract requires role-mediated representation.

The ordinary Delegation laws continue to apply:

valid delegator Authority;

attenuation;

explicit grant;

provenance;

revocability;

temporal bounding. 



---

8. Organization → Organization remains directly representable

The POL organizational-role restriction speaks specifically to individuals exercising organizational Authority through recognized roles. 

Therefore it does not by itself invalidate:

Organization A
      ↓
Direct Delegation Grant
      ↓
Organization B

where that Subject-to-Subject delegation is otherwise constitutionally lawful.

Organization B may subsequently exercise the received Authority through its own internal recognized structures.

Thus:

Organization A
   ↓ Direct Grant
Organization B
   ↓ internal Role Assignment
Human / AI Actor

remains a lawful universal pattern.


---

9. Organization → Human internal operational Authority

The case that triggered CORR-01 is now explicitly closed:

Organization
      ↓
Direct Delegation Grant only
      ↓
Human
      ↓
exercise Organization Authority

Result

CONSTITUTIONALLY INSUFFICIENT.

The Human must possess the constitutionally recognized role through which that organizational Authority is exercised.

WS's model is:

Policy
   ↓
Authority Anchor
   ↓
Role Assignment
   ↓
Transaction Permission

and explicitly distinguishes EMPLOYED_BY from ASSIGNED_ROLE: employment tells us the structural relationship; Role Assignment tells us what operational capacity has actually been delegated. 

Therefore employment alone is also insufficient.


---

10. Employment does not imply organizational Authority

This correction strengthens an existing DELEGATION invariant.

Given:

Alice EMPLOYED_BY Acme

the Constitution SHALL NOT infer:

Alice authorized to act for Acme

WS expressly treats:

EMPLOYED_BY

and:

ASSIGNED_ROLE

as distinct constitutional facts. 

Thus:

Employment
≠
Role Assignment
≠
Delegation
≠
Permission


---

11. AI Agent correction

POL establishes:

AI Authority
=
explicitly delegated Authority

and AI systems possess no inherent Authority. 

WS further requires AI Agents to use the same Role Assignment model as human Actors for governed operational role activation. 

Therefore where AI execution falls under that role-governed model:

Organization
       ↓
Direct Grant only
       ↓
AI Agent

cannot bypass:

Authority Anchor
+
ASSIGNED_ROLE
+
required SEC controls

The Direct Grant may appear elsewhere in a longer lawful Authority chain where constitutionally appropriate.

It cannot substitute for a mandatory operational Role Assignment.


---

12. AI correction is also contextual

This correction SHALL NOT claim:

every possible AI delegation in Zyppi
must forever be ASSIGNED_ROLE

beyond what the governing Constitution supports.

The narrower rule is:

> Where the active WS/SEC constitutional contract requires role-mediated AI operational Authority, DELEGATION-001 SHALL respect that requirement.



A future Constitution could govern another AI Authority form differently.

DELEGATION-001 would route to that specialized form rather than overriding it.

This makes the precedence rule future-safe.


---

13. Specialized delegation mechanisms outrank the generic form

The universal precedence hierarchy is now:

Specific governing
delegation mechanism
        ↓
takes precedence over
        ↓
generic Direct Delegation Grant

This follows the general constitutional principle that lower/secondary specifications may specialize and constrain existing constitutional rules but may not contradict higher authority. POL itself states lower specifications may specialize or constrain its principles without redefining them. 

Accordingly:

generic fallback
never overrides
specific constitutional requirement


---

14. Direct Delegation Grant becomes a lawful default only within its scope

PH5-A's Direct Delegation Grant should now be understood as:

> The canonical governed relationship representation for explicit direct/non-role Authority Delegation where no more specific constitutional delegation mechanism is mandatory.



That single sentence removes the false-accept risk.

It also prevents Direct Delegation Grant from becoming a universal bypass.


---

15. Amendment to PH5-A §16 / role-based boundary

The relevant PH5-A rule should now read:

Revised — Role-Based Delegation Boundary

Where Authority is constitutionally exercised through an operational Role:

ASSIGNED_ROLE
+
Authority Anchor

SHALL remain the authoritative delegation representation.

A Direct Delegation Grant SHALL NOT duplicate or replace the Role Assignment for that same Authority transfer.

Where no specialized Role or other delegation mechanism is constitutionally required, a Direct Delegation Grant may represent the explicit Authority transfer.


---

16. New PH5-A §17 — Role-Mandated Context Precedence

The following section is added to PH5-A:

> PH5-A-17 — Role-Mandated Context Precedence

A Direct Delegation Grant represents explicit direct/non-role Delegation only where the governing constitutional Authority does not require the recipient to exercise that Authority through a recognized Role or another specialized delegation mechanism.

Where such a specialized mechanism is constitutionally mandatory, that mechanism SHALL be the operative authoritative representation.

A Direct Delegation Grant SHALL NOT bypass:

mandatory ASSIGNED_ROLE;

Authority Anchor requirements;

mandatory Technical-Identity controls;

mandatory SEC delegation/security controls;

another constitutionally specialized delegation mechanism.


The governing constitutional semantics, not implementation convenience or participant class alone, SHALL determine the applicable delegation form.




---

17. DLG-A16 replacement

The previous single-representation rule is superseded by:

DLG-A16-R1 — Single Operative Grant Representation

> Each constitutional Authority transfer SHALL possess one operative authoritative representation appropriate to its governing delegation form.

A Direct Delegation Grant SHALL NOT duplicate a mandatory Role Assignment for the same Authority transfer.

Multiple related constitutional artifacts MAY coexist only where each represents a constitutionally distinct fact.



For example:

Employment Contract
      ↓
produces

Alice EMPLOYED_BY Acme
and
Alice ASSIGNED_ROLE Manager

is valid because WS expressly says those are distinct facts, even though they may derive from the same governing instrument. 


---

18. New invariant DLG-E02 — Specialized Form Non-Bypass

> No generic Delegation mechanism SHALL be used to bypass a more specific constitutionally mandated delegation form.



This generalizes the correction beyond today's ASSIGNED_ROLE mechanism.


---

19. New invariant DLG-E03 — Participant Class Is Not Sufficient Routing

> Delegation form SHALL NOT be selected solely from the class of Delegator or Delegate. The governing Authority semantics and applicable constitutional contracts SHALL determine the required representation.



Therefore implementations SHALL NOT hard-code:

if delegate == human:
    role_assignment

or:

if delegator == organization:
    role_assignment

without consulting the explicit governed contract.

This is especially important for future domains.


---

20. New invariant DLG-E04 — Organizational Authority Role Requirement

> An individual exercising organizational Authority SHALL do so only through the constitutionally recognized Role required by POL and its active WS representation.



This is directly derived from POL's Organizational Authority clause. 


---

21. New invariant DLG-E05 — AI Specialized-Mechanism Compliance

> AI and other Technical Subjects SHALL not use a generic Direct Delegation Grant to evade a constitutionally required Role Assignment, capability assignment, delegation-chain requirement or security Attestation.



AI Authority remains explicitly delegated and bounded under POL. 


---

22. Authority Anchor semantics remain unchanged

CORR-01 does not reopen Authority Anchor.

WS-03F clarifies that Authority Anchor is a reference mechanism owned through CL-04 Identity, not an independent registered entity; the referenced governing instrument remains an ordinary Document Identity. 

Accordingly:

Role Assignment
      │
      ▼
authority_anchor_id
      │
      ▼
CL-04 governing-instrument Identity

remains intact.

No AuthorityAnchorRecord is introduced.


---

23. Role Type active ownership remains unchanged

CORR-01 also does not reopen Role Type ownership.

The active WS-03F architecture supersedes the old WS-03D ownership statement, and the Role Assignment admission contract resolves Role Type through CL-01. 

Therefore this correction refers only to:

constitutionally recognized Role

and:

ASSIGNED_ROLE

without restoring any superseded CL-12 ownership semantics.


---

24. PH5-B impact

No semantic change.

PH5-B already permits mixed lineages.

The correction simply constrains which artifact may constitute a lawful hop.

Example:

Organization A
      ↓ Direct Delegation Grant
Organization B
      ↓ ASSIGNED_ROLE
Human H

is valid in form.

So is potentially:

Human A
      ↓ Direct Delegation Grant
Organization B
      ↓ ASSIGNED_ROLE
AI Agent C

subject to all governing Authority and SEC requirements.

Lineage law remains:

exact parent
+
attenuation
+
time
+
subdelegation permission
+
provenance

unchanged.


---

25. PH5-C impact

No semantic change.

Agency Binding already accepts:

Agency Basis
=
Role Assignment
OR
Direct Delegation Grant

The correction simply changes which basis is legally admissible for a particular Authority relationship.

Thus:

Actor
     ↓
Agency Binding
     ↓
correct lawful terminal basis

remains the model.

No new Agency Binding field is required.


---

26. PH5-D impact

No semantic change.

Proof follows the authoritative Agency Basis.

Where Role Assignment is mandatory, proof must establish that Role Assignment and its Authority Anchor.

Where Direct Delegation Grant is lawful, proof establishes that grant.

Technical/AI cases continue to inherit SEC requirements independently.

No new Attestation type is created by this correction.


---

27. Corrected scenario matrix

Scenario	Correct operative form

Human acts for self	No Delegation
Human → Human direct personal mandate	Direct Delegation Grant unless specialized law requires otherwise
Organization → Organization B2B	Direct Delegation Grant, subject to applicable governance
Organization → individual exercising organizational Authority	ASSIGNED_ROLE + Authority Anchor
Organization → AI exercising organizational operational Authority	Required Role Assignment mechanism + SEC requirements
Organization A → Organization B → Human	Direct Grant A→B, then internal Role Assignment B→Human
Human → Organization → AI Agent	Direct Grant to Organization where lawful, then required internal role/security path
Regulator → Inspector through appointment	Role Assignment + Appointment Authority Anchor
Existing specialized future delegation mechanism	Specialized mechanism takes precedence
No specialized constitutional mechanism	Direct Delegation Grant remains available



---

28. Adversarial correction test

CORR-SIM-01 — Attempted bypass

POL:
organizational Authority requires recognized role

Caller:
supplies Direct Delegation Grant only

REJECT.


---

CORR-SIM-02 — Duplicate workaround

Caller supplies:

valid ASSIGNED_ROLE
+
duplicate Direct Grant

for the same exact Authority transfer.

REJECT duplicate representation.


---

CORR-SIM-03 — B2B direct grant

Organization A
DELEGATES_AUTHORITY_TO
Organization B

No other Constitution mandates a Role at the Subject-to-Subject transfer boundary.

DIRECT GRANT REMAINS REPRESENTABLE.


---

CORR-SIM-04 — Internal actor after B2B

Org A → Org B

is valid direct delegation.

Human H then attempts to exercise Org B's organizational Authority without a recognized role.

REJECT H's execution.

The validity of A→B does not waive B's internal organizational-governance requirement.


---

CORR-SIM-05 — AI bypass

AI possesses valid Direct Grant reference but lacks required Role Assignment/security state.

REJECT.


---

CORR-SIM-06 — Human personal mandate

Human A directly delegates bounded personal Authority to Human B.

No constitutional specialized mechanism applies.

DIRECT GRANT REMAINS VALID CANDIDATE.


---

CORR-SIM-07 — Participant-class shortcut

Implementation automatically maps every Organization → Human to Role Assignment without determining the Authority semantics.

REJECT IMPLEMENTATION RULE.

The constitutional context decides; class alone is insufficient.


---

29. Correction effect on E-FA-01

Before:

E-FA-01
ROLE-MANDATED DELEGATION BYPASS
= OPEN FALSE-ACCEPT RISK

After CORR-01:

E-FA-01
CLOSED

The false-accept route is now blocked by explicit precedence.


---

30. Does the correction weaken Direct Delegation?

No.

It gives Direct Delegation a more exact constitutional definition.

Before:

Direct Grant
=
generic alternative to Role Assignment

After:

Direct Grant
=
canonical direct/non-role delegation representation
where no specialized constitutional form is mandatory

That is stronger architecture because the two mechanisms no longer compete for ownership.


---

31. Does the correction create a hierarchy between POL and WS?

No new hierarchy is created.

The responsibilities remain:

POL
defines:
Delegation / Authority law

WS
defines:
governed relationship/role representation

DELEGATION-001
defines:
composition and routing

SEC
defines:
security requirements

RI
consumes:
bound execution state

The correction merely prevents the generic connective layer from bypassing a more specific source Constitution.


---

32. No new constitutional blocker introduced

After CORR-01:

Direct Delegation
      ✓ preserved

Role-based Delegation
      ✓ preserved

Organizational Authority rule
      ✓ respected

AI Role Assignment rule
      ✓ respected

Mixed chains
      ✓ preserved

Agency Binding
      ✓ unchanged

Lineage
      ✓ unchanged

Proof model
      ✓ unchanged

No new primitive, Relationship Family, Trust construct or Runtime concept is required.


---

33. CORR-01 closure invariants

The following are now added to DELEGATION-001:

DLG-E01
Role-Mandated Delegation Precedence

DLG-E02
Specialized Form Non-Bypass

DLG-E03
Participant Class Is Not Sufficient Routing

DLG-E04
Organizational Authority Role Requirement

DLG-E05
AI Specialized-Mechanism Compliance

and:

DLG-A16-R1
Single Operative Grant Representation

supersedes the previous DLG-A16.


---

34. CORR-01 disposition

DELEGATION-001-CORR-01

TRIGGER:
  PH5-E E-FA-01

PROBLEM:
  DIRECT GRANT COULD BYPASS
  CONSTITUTIONALLY REQUIRED ROLE

CORRECTION:
  SPECIALIZED DELEGATION FORM
  TAKES PRECEDENCE

ORGANIZATIONAL AUTHORITY
EXERCISED BY INDIVIDUAL:
  RECOGNIZED ROLE REQUIRED

ROLE REPRESENTATION:
  ASSIGNED_ROLE
  + AUTHORITY ANCHOR

AI:
  MAY NOT BYPASS
  MANDATORY ROLE / SEC CONTRACT

DIRECT DELEGATION GRANT:
  PRESERVED

DIRECT GRANT UNIVERSALLY SUFFICIENT:
  NO

DIRECT GRANT CANONICAL WHERE
NO SPECIALIZED FORM REQUIRED:
  YES

PARTICIPANT TYPE ALONE
DETERMINES FORM:
  NO

PH5-A:
  CORRECTED

PH5-B:
  PRESERVED

PH5-C:
  PRESERVED

PH5-D:
  PRESERVED

PH5-E FALSE ACCEPT E-FA-01:
  CLOSED

NEW PRIMITIVE:
  NONE

NEW AUTHORITY SYSTEM:
  NONE

IMPLEMENTATION AUTHORITY:
  NONE

STATUS:
  CORRECTION CLOSED

35. DELEGATION-001 state after CORR-01

With this correction incorporated, the Phase-5 sequence now stands:

PH5-A — Delegation Grant
      CLOSED / CORRECTED

PH5-B — Parent & Lineage
      CLOSED SEMANTICALLY

PH5-C — Agency Binding
      CLOSED SEMANTICALLY

PH5-D — Proof Requirements
      CLOSED SEMANTICALLY

PH5-E — Adversarial Simulation
      CONDITIONAL PASS
          ↓
      CORR-01
          ↓
      CONDITION SATISFIED

Therefore the specific condition attached to PH5-E's Disposition B is now resolved.

The appropriate next constitutional packet is:

DELEGATION-001-FINAL — Consolidated Constitution & Ratification Readiness

Its job should be to merge the initial constitution, Phase-5 contracts, and CORR-01 into a single clean normative text; remove superseded interim language; produce the final invariant/ownership/closure ledger; and determine whether DELEGATION-001 itself is ready for Chair ratification before returning to CCP-RI-CLOSURE-02.
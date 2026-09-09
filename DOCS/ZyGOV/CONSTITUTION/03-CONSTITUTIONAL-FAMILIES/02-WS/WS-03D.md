# WS-03D Amendment — Authority Anchor Model
---|---
---|---
Status | PROPOSED LOCK

Supersedes unresolved Context Architecture debate between:
- Composable Context Model
- Singular Context Anchor Model

Establishes the constitutional Authority Anchor architecture for all Role Assignments.

# Purpose
This amendment resolves the final ambiguity within the Dual-Role Validation Framework regarding:
- Context ownership
- Authority origination
- Role activation
- Contract anchoring
- AI role attribution

The amendment introduces a new constitutional concept:

**Authority Anchor**
> Authority Anchor becomes the sole constitutional source from which a Role Assignment derives its operational authority.

# Constitutional Definitions
## Role Type
A Role Type is a CL-12 Taxonomy classification representing an operational capacity.

**Examples:**
- Manager
- Auditor
- Inspector
- Customer
- Director
- AI Verifier

Role Types define capacity only.
Role Types do not originate authority.
Role Types do not grant permissions.
Role Types are classifications.

## Authority Anchor
An Authority Anchor is a governed constitutional instrument from which authority is delegated.

**Examples include:**
- Employment Contract
- Service Agreement
- Regulatory Appointment
- Delegation Order
- Board Resolution
- Trust Instrument
- Certification Agreement
- Agency Appointment
- Operating Charter

Authority Anchors are the constitutional source of authority.

## Role Assignment
A Role Assignment is a Reified Relationship linking an Actor to a Role Type through an Authority Anchor.

Role Assignment carries delegated authority.

Role Assignment does not originate authority.

# Constitutional Authority Chain
Authority SHALL flow through the following chain:
````
Policy → Authority Anchor → Role Assignment → Transaction Permission
````

**Examples:**
````
Food Safety Regulation → Inspector Appointment Order → Ahmed ASSIGNED_ROLE Inspector → Conduct Inspection Transaction
````
````
Company Governance Policy → Board Resolution → Sarah ASSIGNED_ROLE Director → Approve Corporate Resolution Transaction
````
````
Employment Policy → Employment Contract → Ahmed ASSIGNED_ROLE Manager → Approve Payroll Transaction
````

At no point does authority originate from the Role Type itself.

# DV-009 — Authority Anchor Rule
## Constitutional Rule
Every `ASSIGNED_ROLE` relationship SHALL reference exactly one Authority Anchor.

A Role Assignment without an Authority Anchor is constitutionally invalid and SHALL NOT be committed.

## Requirements
**Each Role Assignment MUST contain:**
- actor_id
- role_type_ref
- authority_anchor_id

**Minimum cardinality:**
- Authority Anchor = 1

**Maximum cardinality:**
- Authority Anchor = 1

Multiple Authority Anchors on a single Role Assignment are prohibited.

# Scope Ownership
Context SHALL NOT be stored directly on the Role Assignment.

Context SHALL belong to the Authority Anchor.

Authority Anchors MAY define:
- organisational scope
- functional scope
- jurisdictional scope
- temporal scope
- operational scope

These scopes become effective when authority is delegated through the Role Assignment.

# Example — Employment

## Authority Anchor:
### Employment Contract #44
**Contains:**
- Organisation: Maria's Cafe
- Function: Payroll
- Validity: 2026-01-01 → 2027-01-01

**Role Assignment:**
Ahmed ASSIGNED_ROLE Manager
````
authority_anchor_id: Employment Contract #44
````
**Authority Resolution:**

`Ahmed requests payroll approval`

**System evaluates:**
````
Employment Contract #44 → Payroll Function Authorized → Contract Active → Manager Role Authorized
````

**Result:**
> Permission Granted

# Example — Government Inspector
## Authority Anchor:
### Regulatory Appointment Order #778
**Contains:**
- Jurisdiction: Greater Cairo
- Function: Food Safety Inspection
- Validity Period: 2026-2028

**Role Assignment:**
Ahmed ASSIGNED_ROLE Inspector
````
authority_anchor_id: Appointment Order #778
````

**Authority Resolution:**

`Inspection request received`

**System evaluates:**
````
Appointment Order #778 → Jurisdiction Match → Function Match → Validity Active
````

**Result:**
> Permission Granted

# Example — AI Verification Service
## Authority Anchor:
### Verification Service Agreement #900

**Contains:**
- Verification Domain
- Service Limits
- Jurisdiction Rules
- Effective Dates

**Role Assignment:**
AI-Agent-X ASSIGNED_ROLE Verifier
````
authority_anchor_id: Verification Service Agreement #900
````

**Transactions:**
Verification #1 Verification #2 Verification #3

Each transaction references:

`role_assignment_id`

No additional Role Assignments are created.

This prevents graph explosion while preserving complete auditability.

# Authority Resolution Algorithm
**Given:**
Actor Role Assignment Requested Action

The platform SHALL evaluate:
1. Locate active Role Assignment
2. Resolve Authority Anchor
3. Validate Anchor Status
4. Validate Scope Constraints
5. Validate Temporal Constraints
6. Validate Jurisdiction Constraints
7. Validate Delegated Permission
8. Execute or Reject

All authority evaluation SHALL originate from the Authority Anchor.

# Relationship With EMPLOYED_BY
`EMPLOYED_BY` and `ASSIGNED_ROLE` remain distinct constitutional facts.

**`EMPLOYED_BY` answers:**
> "What structural employment relationship exists?"

**`ASSIGNED_ROLE` answers:**
> "What operational capacity has been delegated?"

Both MAY reference the same Authority Anchor.

**Example:**

Employment Contract #44
Produces:
1. Ahmed `EMPLOYED_BY` Maria's Cafe
2. Ahmed `ASSIGNED_ROLE` Manager

No duplication exists because both relationships derive from the same governing instrument.

# Taxonomy Governance
- Role Types SHALL be owned by CL-12.
- Role Types are taxonomy objects.
- Role Types are not Actors.
- Role Types are not authority sources.
- Role Type deprecation SHALL NOT invalidate historical Role Assignments.
- Historical assignments remain immutable.

# AI Governance
AI Agents SHALL use the same Role Assignment model as human Actors.

**Permanent capability assignment:**

AI-Agent-X ASSIGNED_ROLE Verifier
authority_anchor_id: Verification Service Agreement #900

Transactions SHALL reference:

`role_assignment_id`

Per-transaction role relationships are prohibited.

# Constitutional Locks

---|---
LOCK — |Role Types owned by CL-12
LOCK — |Role Assignment represented as ASSIGNED_ROLE
LOCK — |Authority originates from Policy and Authority Anchor
LOCK — |Role Assignment carries delegated authority
LOCK — |Authority Anchor mandatory
LOCK — |Exactly one Authority Anchor per Role Assignment
LOCK — |Scope owned by Authority Anchor
LOCK — |EMPLOYED_BY and ASSIGNED_ROLE remain distinct
LOCK — |AI Capability Assignment plus Transaction Attribution
LOCK — |Historical taxonomy deprecation does not invalidate assignments
LOCK — |All authority resolution originates from Authority Anchor

# Ratification Statement
WS-03D adopts the Authority Anchor Model as the constitutional mechanism for authority delegation and role activation.

The concepts of Composable Context and Singular Context Anchor are hereby superseded.

Authority Anchor becomes the sole constitutional authority source referenced by every Role Assignment.

**WS-03D is ratified upon acceptance of DV-009 and incorporation into the Relationship Governance Framework.**
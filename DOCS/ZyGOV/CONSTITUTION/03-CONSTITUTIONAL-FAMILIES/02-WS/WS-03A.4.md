# WS-03A.4
# CL-06 Intent Taxonomy Map
##### Constitutional Registry v1.0 (Ratified)
**Status**
LOCKED AND RATIFIED
**Registry** Code: WS-03A.4
 **Cluster**: CL-06 Intent
 **Version**: 1.0
 **Classification**: Constitutional Core Registry

# 1. Purpose
This document defines the constitutional Intent Taxonomy of the Zyppi Reality Model.

Intent represents the purpose behind an Interaction and provides the canonical routing layer between Interactions, Contracts, Transactions, and Outcomes.

The Intent Registry is a closed constitutional vocabulary.

No additional Intent types may be introduced except through the Constitutional Amendment Process defined in Section 10.

# 2. Constitutional Definition
## CP-INT-01 — Intent Definition
An Intent is a desired future state expressed by an Actor, representing the purpose behind an Interaction.

Intent describes what the Actor wants to achieve, not what occurs as a result.

Intent is independent of implementation, execution method, contract structure, transaction mechanics, or resulting outcomes.

# 3. Constitutional Intent Registry
The following Intent types are the only valid constitutional Intents.

Code  | Intent  | Definition
---|---|---
INT-001 | Discover | Learn, explore, or obtain information
INT-002 | Access | Reach, open, use, or consume a resource
INT-003 | Verify | Confirm authenticity, status, validity, or relationship
INT-004 | Authenticate | Prove identity, authorization, or permission
INT-005 | Register | Create, enroll, join, or establish participation
INT-006 | Claim | Assert entitlement to a right, benefit, service, asset, or privilege
INT-007 | Purchase | Acquire value through an economic exchange
INT-008 | Transfer | Move ownership, custody, control, or responsibility
INT-009 | Return | Reverse a previously completed transaction or state
INT-010 | Support | Request assistance, guidance, remediation, or help
INT-011 | Subscribe | Establish an ongoing participation, membership, follow, or recurring relationship
INT-012 | Trigger | Initiate a process, workflow, automation, notification, or event


# 4. Intent Resolution States (IRS)
Intent Resolution States describe the status of the resolution process itself.

They are not Intents.

They are attributes of an Interaction.

Code  | State  | Definition
---|---|---
IRS-001 | Initiated | Resolution process has begun
IRS-002 | Resolved | Intent successfully identified
IRS-003 | Unknown | Intent cannot be determined
IRS-004 | Ambiguous | Multiple intents are equally probable
IRS-005 | No Contract Available | Intent identified but no valid contract exists
IRS-006 | Resolution Failed | Resolution process failed due to system, identity, or touchpoint failure

# 5. Constitutional Principles
## Section A — Definitional Principles
### CP-INT-02 — Intent Is Atomic
An Intent SHALL represent a single purpose.
Intents SHALL NOT be composite.

### CP-INT-03 — Intent Is Expressed, Not Observed
Intent is inferred from Actor purpose and context.
Intent is not equivalent to an Event.

### CP-INT-04 — Intent Does Not Change State
Intent expresses desired change.
Only Transactions may mutate state.

### CP-INT-05 — Intent Is Not an Event
Events record occurrences.
Intent expresses purpose.

### CP-INT-06 — Intent Is Not an Outcome
Outcomes represent execution results.
Intent represents desired future state.

### CP-INT-07 — Claim Boundary
Claim SHALL be used when an Actor asserts entitlement not currently under their control.

**Example:**
- Claim warranty
- Claim reward
- Claim benefit

### CP-INT-08 — Return Boundary
Return SHALL be used when an Actor seeks to reverse a previously completed transaction or state.

**Example:**
- Return product
- Cancel booking
- Reverse order
Warranty repair remains Claim, not Return.

## Section B — Structural Principles
### CP-INT-09 — One Primary Intent Per Interaction
Every Interaction SHALL resolve to exactly one Primary Intent.

### CP-INT-10 — Closed Vocabulary
Only Intents defined in Section 3 are valid constitutional Intents.

### CP-INT-11 — Intent Resolution Required
Every Interaction SHALL pass through Intent Resolution before execution.

### CP-INT-12 — Intent Resolution Precedes Contract Resolution
**Canonical sequence:**
````
Interaction
↓
Context Evaluation
↓
Intent Resolution
↓
Intent Resolution State
↓
Identity Lifecycle Check
↓
Contract Resolution
↓
Transaction
↓
Outcome
````

### CP-INT-13 — Identity Lifecycle Outcomes
Identity Lifecycle Check SHALL produce one of the following outcomes:

1. Active → proceed to Contract Resolution
2. Suspended → IRS-005 No Contract Available; escalation MAY occur
3. Decommissioned or Archived → IRS-006 Resolution Failed; no Transaction initiated

## Section C — Boundary Principles
### CP-INT-14 — Contextual Interception
Intent Contracts MAY intercept fulfillment when security, compliance, governance, or safety requirements require alternative execution.

The original Intent SHALL remain unchanged.

### CP-INT-15 — Trigger Boundary
Trigger SHALL only be used when initiating a process is the primary purpose of the Interaction.
Routine downstream automations SHALL NOT change the Primary Intent.

### CP-INT-16 — Contracts May Parameterise, Not Redefine
Intent Contracts MAY specialize, constrain, or parameterise Intents.
Intent Contracts SHALL NOT create new constitutional Intent types.

### CP-INT-17 — Discover vs Access Rule
If the primary value delivered is information, the Intent SHALL be Discover.
If the primary value delivered is reaching or consuming a resource, the Intent SHALL be Access.
When both occur simultaneously, the Intent Contract determines canonical classification.

## Section D — Operational Principles
### CP-INT-18 — Intent Immutability
Once resolved, an Intent SHALL NOT be modified.
Blocked, redirected, escalated, or failed execution SHALL NOT alter the original Intent record.

### CP-INT-19 — Interaction Intent Boundary
**Examples:**
- Listen to music → Access
- Read manual → Access
- Learn product origin → Discover
- Verify authenticity → Verify
- Login → Authenticate
- Join event → Register
- Claim warranty → Claim
- Buy ticket → Purchase
- Transfer ownership → Transfer
- Return product → Return
- Request assistance → Support
- Follow creator → Subscribe
- Start workflow → Trigger

### CP-INT-20 — Intent Mutual Exclusivity
Each constitutional Intent represents a distinct and non-overlapping purpose.
Every Interaction SHALL resolve to exactly one Primary Intent.
Canonical disambiguation rules are provided by `CP-INT-07`, `CP-INT-08`, and `CP-INT-17`.

### CP-INT-21 — Programmatic Intent Equivalence
AI Agents, workflow engines, and autonomous systems SHALL use the same constitutional Intent vocabulary as human Actors.
Execution context SHALL be distinguished only through metadata.
No separate machine Intent vocabulary is permitted.

# 6. Intent Escalation
## CR-INT-ESC-01
When a Primary Intent cannot be fulfilled due to lifecycle, compliance, governance, contractual, or security constraints, the system MAY initiate a secondary Trigger Intent through an authorized escalation contract.

The escalation SHALL:
1. Be recorded as a separate Interaction
2. Use Intent = Trigger
3. Use intent_origin = programmatic
4. Reference the blocked Interaction
5. Preserve the original Intent record

The original Intent Resolution State SHALL reflect the blocking condition.

# 7. Intent Metadata
## intent_origin
Required metadata field.

Value  | Definition
---|---
deliberate | Expressed directly by an Actor
programmatic | Generated by an AI Agent, automation, workflow, or system


# 8. Forward References

FR ID  | Item  | Target Cluster  | Blocking  | Resolution Workstream
---|---|---|---|---
FR-001 | Identity Custodian | CL-04 Identity | Yes | WS-03A.2 Revision
FR-002 | Batch Transaction | CL-09 Transaction | Yes | WS-03A.9
FR-003 | Resolution Failed Event | CL-11 Event | Yes | WS-03A.1 Revision
FR-004 | Regulatory Claim Contract | CL-07 Contract | No | WS-03A.7
FR-005 | Relational Verify Contract | CL-07 Contract | No | WS-03A.7


# 9. Constitutional Amendment Process (CAP)
## CAP-01
The Intent Registry SHALL remain closed.

Creation of a new constitutional Intent requires:
1. Minimum three independent failing stress-test simulations
2. Failures demonstrated across at least two strategic programs
3. Evidence that failure cannot be solved through:
     - Contract parameterisation
     - Metadata
     - Identity modelling
     - Event modelling
     - Transaction modelling
4. Council unanimous approval
5. Full revision of WS-03A.4

Stress-test scenarios SHALL be proposed by parties without direct commercial interest in the proposed Intent.

The council SHALL unanimously determine that all non-taxonomy alternatives have been exhausted before amendment may proceed.

# 10. Ratification Statement
The Intent Registry defined in WS-03A.4 constitutes the sole constitutional Intent vocabulary of the Zyppi Reality Model.

All routing, contract selection, transaction execution, workflow orchestration, automation, AI-agent behavior, and outcome generation SHALL derive from this registry.

**The registry is formally locked under CAP-01 and may only be amended through constitutional revision.**
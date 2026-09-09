# WS-03A.8 — CL-11 Event Taxonomy Map
---|---
---|---
Status: | 🔒 RATIFIED & LOCKED
 Version: |1.1 Constitutional
 Classification: |Constitutional Layer (CL-11)
 Prerequisites: |WS-01, WS-02A, WS-03, WS-03A.4 (CL-06 Intent), WS-03A.5 (CL-07 Intent Contract), WS-03A.6 (CL-09 Transaction), WS-03A.7 (CL-10 Outcome)
 Successor: | WS-03A.9 (CL-16 Intelligence)

# 1. Purpose
CL-11 defines the constitutional governance for Events — the raw, immutable observations that enter the Reality Graph.

An Event records that an observation occurred. It does not determine truth, meaning, or consequence.

Those responsibilities belong to:
- `CL-09` Transaction → Determination
- `CL-10` Outcome → Consequence
- `CL-16` Intelligence → Interpretation

Events are the atomic building blocks of the Reality Graph and represent the first point of contact between Reality and the system.

# 2. Constitutional Definition of an Event
## CD-EVT-01 — Event Definition
An Event is an immutable, first-class constitutional object that records a discrete observation of a real-world or system occurrence.

**An Event:**
Records that an observation occurred.
Does not determine truth.
Does not determine consequence.
Does not determine meaning.
Is not a telemetry stream.

### Constitutional Principle
An Event SHALL record that an observation occurred.

It SHALL NOT assert truth, meaning, or consequence.

## CD-EVT-02 — First-Class Constitutional Object
Events are first-class constitutional objects within the Reality Graph.

Every Event exists independently and may be referenced by Transactions, Outcomes, and Intelligence.

### Constitutional Principle
Every Event SHALL possess a permanent, immutable event_id and SHALL exist independently within the Reality Graph.

## CD-EVT-03 — Event Immutability
Events SHALL be permanently immutable.

Events SHALL NOT support:
- Modification
- Deletion
- Lifecycle transitions
- Supersession

### Constitutional Principle
Events are immutable snapshots of observed occurrences.

Conflicting observations SHALL coexist as separate Events.

Conflict resolution belongs exclusively to CL-16 Intelligence.

## CD-EVT-04 — No Lifecycle
Events have no lifecycle state.

Events SHALL NOT contain:
- Pending
- Verified
- Approved
- Disputed
- Resolved
- Any equivalent status field

### Constitutional Principle
An Event exists in a single permanent state:
Recorded.

## CD-EVT-05 — No Supersession
Events SHALL NOT supersede one another.
Conflicting observations are constitutionally valid and SHALL coexist permanently.

### Constitutional Principle
Contradictory observations are not errors.
They represent multiple perspectives of Reality and SHALL be resolved by CL-16 Intelligence.

# 3. Confidence & Reliability
## CD-EVT-06 — Confidence
Every Event SHALL include a confidence value.

Confidence represents the observer's self-reported certainty at the time the observation was recorded.

**Confidence:**

`Range: 0.0 – 1.0`

- Mandatory
- Immutable

**Examples:**
- Human estimate → 0.55
- Manual inspection → 0.85
- Sensor threshold detection → 0.98
- Deterministic system event → 1.00

### Constitutional Principle
Confidence is intrinsic to the observation and SHALL be immutable.

## CD-EVT-07 — Reliability Boundary
Reliability is distinct from confidence.
Reliability states SHALL NOT be attached to Events.

**Examples:**
- Verified
- Trusted
- Disputed
- Confirmed
- Rejected

These are Intelligence judgments, not Event properties.

### Constitutional Principle
Reliability evaluation belongs exclusively to CL-16 Intelligence.

# 4. Event vs Telemetry
## CD-EVT-08 — Telemetry Firewall
Telemetry and Events are distinct concepts.

Telemetry represents continuous measurement streams.

Events represent discrete observations.

**Examples:**

**Valid Events**
- Temperature Threshold Breached
- Door Opened
- QR Code Scanned
- Payment Webhook Received
- Inventory Change Observed

**Not Events**
- Temperature: 72.11
- Temperature: 72.12
- Temperature: 72.13
- Continuous GPS coordinate stream
- Continuous clickstream logs

### Constitutional Principle
CL-11 SHALL store discrete observations only.

Continuous telemetry SHALL remain outside the constitutional Reality Graph.

Only extracted Events SHALL enter CL-11.

# 5. Event Taxonomy
## CD-EVT-09 — Source × Category Model
Every Event SHALL be classified using two orthogonal constitutional dimensions.

### Source Type (Closed Enumeration)
- Human
- System
- Sensor
- External

### Event Category (Closed Enumeration)
- Observation
- Assertion
- Communication
- Verification
- Change

### Constitutional Principle
Event taxonomy SHALL be defined using orthogonal Source and Category dimensions.

Mixed-domain families SHALL NOT be permitted.

## CD-EVT-10 — Event Type
Event classification consists of three dimensions:
1. source_type
2. event_category
3. event_type

The Event Type is a specific occurrence defined within the Canonical Event Registry.

**Examples:**

source_type  | event_category  | event_type
---|---|---
Human | Assertion | Product_Damaged_Reported
Human | Change | Inventory_Adjustment_Recorded
Sensor | Observation | Temperature_Threshold_Breached
External | Communication | Bank_Settlement_Received
System | Verification | Validation_Passed

### Constitutional Principle
`source_type` and `event_category` are constitutional dimensions.

`event_type` is an operational classification governed by `FR-012`.

## CD-EVT-11 — Event Registry Governance (FR-012)
### Constitutional Dimensions
Council approval required:
- source_type
- event_category

### Registry Values
Documentation review only:
- event_type

### Constitutional Principle
The constitutional taxonomy SHALL remain stable while allowing operational Event Types to evolve without constitutional amendment.

# 6. Event Bitemporality
## CD-EVT-12 — Bitemporal Coordinates
Every Event SHALL maintain two independent timestamps.

### occurred_at
The moment the observed occurrence happened.

**Represents:**
- valid_time
- real-world time

### recorded_at
The moment the Event entered the Reality Graph.

**Represents:**
- system_time
- ingestion time

These timestamps SHALL never be overwritten.

### Constitutional Principle
Every Event SHALL maintain both valid_time and system_time to preserve historical reality and support delayed ingestion, offline synchronization, and audit reconstruction.

# 7. Canonical Event Envelope
## CD-EVT-13 — Minimum Constitutional Envelope
Every Event SHALL include the following mandatory fields.

### Mandatory Fields

Field  | Purpose
---|---
event_id | Permanent immutable unique identifier
source_type | Human, System, Sensor, External
event_category | Observation, Assertion, Communication, Verification, Change
event_type | Canonical Event Registry value
observer_id | Observer identity reference
occurred_at | Valid time
recorded_at | System time
confidence | Immutable certainty score (0.0–1.0)

### Optional Fields

Field  | Purpose
---|---
related_entities | References to Identities, Referents, Touchpoints, Assets, etc.
evidence_refs | References to supporting evidence
metadata | Additional contextual information

### Constitutional Principle
An Event missing any mandatory field SHALL be considered malformed and SHALL NOT be committed to the Reality Graph.

## CD-EVT-14 — Evidence Policy
Evidence references are optional.

Many valid observations may have no supporting evidence beyond the observer.

**Examples:**
- Customer verbally reports issue.
- Employee reports damaged inventory.
- Witness reports incident.

### Constitutional Principle
An Event MAY exist without evidence.

The absence of evidence SHALL NOT reduce constitutional validity.

# 8. Event Relationships
## CD-EVT-15 — Event ↔ Transaction Relationship
Events and Transactions are independent constitutional objects.

**Relationships:**
- One Event MAY trigger many Transactions.
- Many Events MAY contribute to one Transaction.

### Constitutional Principle
Transactions SHALL reference Events through auditable relationships.

## CD-EVT-16 — Event ↔ Outcome Relationship
Outcomes MAY reference Events that contributed to material consequences.

### Constitutional Principle
Events SHALL remain independent even when referenced by Outcomes.

## CD-EVT-17 — Event ↔ Intelligence Relationship
CL-16 Intelligence MAY consume Events as evidence.

Events remain immutable regardless of Intelligence conclusions.

### Constitutional Principle
Events are inputs to Intelligence but are not owned by Intelligence.

# 9. Governance Principles

ID  | Principle
---|---
CP-EVT-01 | Events are immutable observations
CP-EVT-02 | Events are first-class constitutional objects
CP-EVT-03 | Events have no lifecycle
CP-EVT-04 | Events have no supersession
CP-EVT-05 | Confidence is mandatory and immutable
CP-EVT-06 | Reliability belongs to CL-16
CP-EVT-07 | Telemetry is not an Event
CP-EVT-08 | Only discrete observations enter CL-11
CP-EVT-09 | Taxonomy = Source + Category + Event Type
CP-EVT-10 | Source and Category are closed enumerations
CP-EVT-11 | Event Type is governed by FR-012
CP-EVT-12 | Evidence references are optional
CP-EVT-13 | Events maintain bitemporal coordinates
CP-EVT-14 | Events may be referenced by Transactions
CP-EVT-15 | Events may be referenced by Outcomes
CP-EVT-16 | Events may be consumed by Intelligence
CP-EVT-17 | Event and Intelligence Relationship 


# 10. Resolution Pipeline
````
Reality Observation Occurs
        ↓
Event Recorded (CL-11)
        ↓
Intent Resolution (CL-06)
        ↓
Intent Contract Selection (CL-07)
        ↓
Transaction Creation (CL-09)
        ↓
Outcome Generation (CL-10)
        ↓
Intelligence Interpretation (CL-16)
````

Events remain immutable throughout the entire pipeline.

# 11. Forward References

Reference  | Target  | Status
---|---|---
FR-012 | Canonical Event Registry | Active
FR-013 | Telemetry-to-Event Transformation | CL-08 System


# 12. Lock Certification
###### WS-03A.8 — CL-11 Event Taxonomy Map

Element  | Status
---|---
Event Definition | 🔒 Locked
First-Class Event Identity | 🔒 Locked
Immutability | 🔒 Locked
No Lifecycle | 🔒 Locked
No Supersession | 🔒 Locked
Confidence Model | 🔒 Locked
Reliability Boundary | 🔒 Locked
Telemetry Firewall | 🔒 Locked
Source × Category Taxonomy | 🔒 Locked
Event Type Registry | 🔒 Locked
Bitemporality | 🔒 Locked
Evidence Policy | 🔒 Locked
Event Envelope | 🔒 Locked
Event Relationships | 🔒 Locked

**WS-03A.8 — CL-11 Event Taxonomy Map is hereby RATIFIED, LOCKED, and incorporated into the Zyppi Constitutional Architecture.**

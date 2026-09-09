# WS-03A.6 — CL-09 Transaction Taxonomy Map
###### Status: 🔒 RATIFIED & LOCKED
###### Version: 1.0 Constitutional
 **Classification**: Constitutional Layer (CL-09)
 **Prerequisites**: CL-04 Identity, CL-05 Referent, CL-06 Intent, CL-07 Intent Contract, CL-11 Event
 **Successor**: WS-03A.7 — CL-10 Outcome Taxonomy Map

# 1. Purpose
`CL-09` defines the constitutional governance of Transactions: the immutable ledger records that document authoritative changes to Reality.

Transactions are the permanent historical record of Reality Claims and serve as the system-of-record for all verified state mutations occurring within the Zyppi ecosystem.

**A Transaction answers:**
> What Reality Claim changed, who changed it, under what Authority, when it changed, and what evidence supported the determination?

Transactions are not Events, Outcomes, Execution Records, Predictions, or Intelligence Artifacts.

# 2. Constitutional Definitions
## CD-TXN-01 — Transaction
A Transaction is an immutable, cryptographically verifiable record that:
1. Establishes a Reality Claim.
2. Terminates a Reality Claim.
3. Reverses a prior Reality Claim.
4. Supersedes a prior Reality Claim.
5. Records an authoritative determination regarding Reality.

A Transaction is atomic, immutable, auditable, and authoritative.

## CD-TXN-02 — Canonical Reality Claim
The atomic unit of truth within the Reality Graph SHALL be a directed Subject–Predicate–Object claim:
````
Subject → Predicate → Object
````

**Where:**

Component  | Definition
---|---
Subject | Identity or Referent
Predicate | Canonical Predicate from Registry
Object | Identity, Referent, Value, State, or Reference

**Examples:**
- Product-X → owned_by → Alice
- Batch-12 → status → Recalled
- Warranty-7 → covers → Product-X

### Constitutional Rule
A Transaction SHALL mutate exactly one Reality Claim.

All metadata, evidence, provenance, authority information, and context SHALL be attached to the Transaction but SHALL NOT constitute additional Reality Claims.

## CD-TXN-03 — Transaction Bundle
A Transaction Bundle is an immutable consistency boundary grouping one or more Atomic Transactions.

A Bundle is not a Transaction.

A Bundle exists solely to guarantee atomic commitment of logically related Transactions.

**Example:**
### Ownership Transfer
````
**TXN-A:**
Product-X → owned_by → Alice
TERMINATED

**TXN-B:**
Product-X → owned_by → Bob
ESTABLISHED

**Bundle:**
TXN-A + TXN-B
````

# 3. Constitutional Principles
## CP-TXN-01 — Absolute Immutability
Committed Transactions SHALL NEVER be:
- Modified
- Deleted
- Rewritten
- Replaced

Corrections SHALL occur only through new Transactions.

## CP-TXN-02 — One Claim Per Transaction
Every Transaction SHALL mutate exactly one Reality Claim.

Compound Transactions are constitutionally prohibited.

## CP-TXN-03 — Transaction vs Outcome
Transactions record determinations.

Outcomes record consequences.

A Transaction may produce zero or more Outcomes.

Outcomes belong to `CL-10`.

## CP-TXN-04 — Transaction vs Event
Events are observations.

Transactions are authoritative determinations.

Events SHALL NOT be treated as Transactions.

Transactions SHALL NOT be treated as Events.

## CP-TXN-05 — Deterministic Ledger
Transactions SHALL record only deterministic reality determinations.

**Examples:**
- Authentic
- Counterfeit
- Established
- Terminated
- Verified
- Rejected

Confidence scores, probabilities, AI reasoning, attribution models, and predictive analytics SHALL NOT be stored in Transactions.

These belong exclusively to:
- `CL-11` Evidence
- `CL-16` Intelligence

## CP-TXN-06 — Producer vs Authority
Every Transaction SHALL record:
### Producer
The system or actor that technically submitted the Transaction.
### Authority
The entity legally or constitutionally authorized to make the determination.

Producer and Authority MAY be different entities.

## CP-TXN-07 — Authority Validation
Authorities SHALL be validated through the Trust Registry.

External Sovereign Authorities SHALL provide cryptographic proof of origin before Transaction commitment.

**Examples:**
- Customs Authorities
- Regulatory Agencies
- Land Registries
- Government Systems

# 4. Transaction Creation Model
Transactions MAY originate from:

Source  | Producer  | Authority
---|---|---
Intent Contract Execution | Platform Execution Engine | Contract Authority
System Agent | Authorized System Agent | 
Platform
Brand Registry | Brand System | Brand
Regulator | Regulatory System | Regulator
Sovereign Authority | External Authority System | Sovereign Authority

Consumers SHALL NOT mint Transactions directly.

Consumers produce Events.

Events may trigger Transactions through authorized authorities.

# 5. Canonical Transaction Envelope
Every Transaction SHALL conform to the following structure.
````
Transaction
│
├── transaction_id
├── bundle_id
├── execution_id
│
├── reality_claim
│   ├── subject
│   ├── predicate
│   ├── object
│   └── operation
│
├── provenance
│   ├── producer
│   ├── authority
│   ├── authority_domain
│   └── authority_level
│
├── lineage
│   ├── relationship_id
│   ├── supersedes_transaction_id
│   ├── reversal_of_transaction_id
│   └── compensates_execution_id
│
├── evidence
│   └── evidence_bundle_id
│
├── timestamps
│   ├── occurred_at
│   ├── determined_at
│   └── committed_at
│
├── governance
│   ├── finality
│   ├── jurisdiction
│   └── visibility
│
└── cryptographic_signature
````

# 6. Transaction Correction Taxonomy
## CD-TXN-04 — Compensating Transaction
Corrects execution-level failures.

**References:**
````
compensates_execution_id
````

## CD-TXN-05 — Reversal Transaction
Neutralizes the effect of a valid historical Transaction.

**References:**
````
reversal_of_transaction_id
````

**Examples**:
- Refund
- Return
- Ownership rollback

## CD-TXN-06 — Superseding Transaction
Declares a prior determination obsolete due to superior evidence.

**References:**
````
supersedes_transaction_id
superseding_evidence_bundle_id
````

**Examples:**
- Authentic → Counterfeit
- Verified → Rejected

# 7. Transaction Bundle Governance
## CD-TXN-07 — Bundle Definition
**A Bundle SHALL contain:**
- bundle_id
- execution_id
- transaction_ids[]
- bundle_status

**Valid statuses:**
- pending_commit
- committed
- failed


## CR-TXN-BUNDLE-01 — Atomic Commitment
All Transactions inside a Bundle SHALL commit together.

If any Transaction fails:
- Entire Bundle fails.

No partial Bundle state SHALL become externally visible.

## CR-TXN-BUNDLE-IDEM-01
Bundles SHALL be idempotent relative to:
````
bundle_id
````

If a committed Bundle already exists:
- Return existing Bundle.
- Do not re-execute.


## CR-TXN-BUNDLE-IDEM-02
Failed Bundles MAY be retried using the same `bundle_id`.

Previously committed Transactions SHALL deduplicate through:

`execution_id + reality_claim`


# 8. Predicate Registry Governance (FR-010)
All Predicates SHALL originate from the Canonical Predicate Registry.

No Transaction may use an unapproved Predicate.

## Predicate Lifecycle
````
Proposed
→ Under Review
→ Approved
→ Deprecated
→ Retired
````

## Governance Rules
### PR-GOV-01
New Predicates require:
- Definition
- Cardinality
- Domain
- Examples
- Justification

### PR-GOV-02
Approved Predicates become constitutional vocabulary.

### PR-GOV-03
Deprecated Predicates remain resolvable.

New Transactions SHALL use replacement Predicates.

### PR-GOV-04
Retired Predicates remain historically valid but SHALL NOT appear in new Transactions.

# 9. Predicate Cardinality Physics
Every Predicate SHALL declare cardinality.

Cardinality  | Meaning
---|---
1..1 | Exactly one
0..1 | At most one
1..N | One or more
0..N | Zero or more

## CR-TXN-CARD-01
The Reality Graph SHALL enforce Predicate Cardinality during commitment.

Transactions violating Cardinality SHALL be rejected.

The ledger SHALL NOT automatically generate corrective Transactions.

If cardinality resolution requires termination of an existing claim:

The incoming Bundle MUST explicitly contain the termination Transaction.

Failure to provide the required termination SHALL cause Bundle rejection.

# 10. Relationship Ownership (FR-011)
Relationship ownership SHALL reside in the Core Reality Graph.

`CL-09` references Relationships but does not own them.

`CL-09` SHALL NOT:
- Create Relationships
- Terminate Relationships
- Manage Relationship lifecycles

`CL-09` SHALL only reference:
- `relationship_id`

**Relationship lifecycle governance belongs to:**

Graph Core
(`CL-04` / `CL-05` / Future Graph Core Workstream)

`CL-16` Intelligence consumes Relationships but SHALL NOT own them.

# 11. Constitutional Idempotency
## CR-TXN-IDEM-01
Transaction creation SHALL be idempotent relative to:

`execution_id + reality_claim`

Replaying the same execution SHALL NOT create duplicate Transactions.

## CR-TXN-IDEM-02
A single Execution Plan SHALL NOT create multiple Transactions for the same Reality Claim.

# 12. Forward References

Reference  | Description
---|---
FR-008 | Relationship Continuity Model
FR-010 | Canonical Predicate Registry
FR-011 | Reality Relationship Regis0try
FR-012 | Reality Claim Index


# 13. Resolution Pipeline
````
Intent
   ↓
Identity Validation
   ↓
Contract Discovery
   ↓
Execution Plan
   ↓
Contract Execution
   ↓
Transaction Creation
   ↓
Transaction Bundle
   ↓
Reality Claim Commit
   ↓
Outcome Generation
````

# Lock Certification
WS-03A.6 — CL-09 Transaction Taxonomy Map

---|---
---|---
Transaction Definition | 🔒 LOCKED
Reality Claim Model (SPO) | 🔒 LOCKED
Atomic Transaction Rule | 🔒 LOCKED
Transaction Bundle | 🔒 LOCKED
Bundle Atomicity | 🔒 LOCKED
Bundle Idempotency | 🔒 LOCKED
Producer vs Authority | 🔒 LOCKED
Authority Validation | 🔒 LOCKED
Deterministic Ledger | 🔒 LOCKED
Correction Taxonomy | 🔒 LOCKED
Canonical Envelope | 🔒 LOCKED
Predicate Registry | 🔒 LOCKED
Predicate Governance | 🔒 LOCKED
Predicate Cardinality | 🔒 LOCKED
Cardinality Enforcement | 🔒 LOCKED
Relationship Ownership | 🔒 LOCKED
Transaction Idempotency | 🔒 LOCKED

###### STATUS: 🔒 RATIFIED & LOCKED

Next Document: WS-03A.7 — CL-10 Outcome Taxonomy Map.
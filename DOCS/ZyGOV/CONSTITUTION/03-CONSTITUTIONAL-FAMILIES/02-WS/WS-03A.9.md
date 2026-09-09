#WS-03A.9 — CL-16 Intelligence Taxonomy Map
---|---
---|---
Status | RATIFIED — LOCKED
Constitutional Layer: | CL-16 Intelligence
Version: | 1.0
Authority: | Constitutional Core
Dependency Layers: | CL-11 Events, CL-09 Transactions, CL-10 Outcomes, CL-06 Intent, CL-01 / CL-08 Actors & System Agents, FR-014 Intelligence Domain Registry

# 1. Purpose
CL-16 Intelligence exists to record evidence-based interpretations of reality.

An Intelligence object is not reality itself.

An Intelligence object is not truth.

An Intelligence object is not an action.

An Intelligence object is not a policy.

An Intelligence object is a permanent record of what the platform believed, based on available evidence, at a specific point in time.

**The purpose of CL-16 is to provide:**
- Explainable decision support
- Historical interpretation tracking
- Regulatory auditability
- Human and AI reasoning provenance
- Evidence-based understanding of reality

# 2. Constitutional Definition
## CP-INT-01 — Intelligence Definition
An Intelligence object SHALL represent an evidence-based interpretation, conclusion, prediction, classification, inference, or anomaly determination derived from one or more evidence sources.

Intelligence SHALL describe or interpret.

Intelligence SHALL NOT prescribe actions.

# 3. Constitutional Separation of Powers
## CP-INT-02 — Intelligence Is Not Intent
Recommendations, proposed actions, goals, requests, and desired outcomes SHALL NOT be represented as Intelligence.

These belong exclusively to CL-06 Intent.

**Example:**
- Intelligence:
> "Fraud probability = 97%"
- Intent:
> "Freeze account"

## CP-INT-03 — Intelligence Cannot Trigger Intent
Intelligence SHALL NOT directly create:
- Intents
- Contracts
- Transactions
- Outcomes

Intelligence MAY be evaluated by an authorized human or authorized System Agent.

Only an authorized Actor or System Agent may create an Intent.

**Required flow:**
````
Reality → Evidence → Intelligence → Authorized Actor / Agent → Intent → Contract → Transaction → Outcome
````

# 4. Immutability
## CP-INT-04 — Intelligence Is Immutable
All Intelligence objects SHALL be immutable after creation.

No field may be altered, updated, rewritten, or deleted.

Changes in interpretation SHALL create a new Intelligence object.

Historical Intelligence SHALL remain permanently available.

# 5. Supersession
## CP-INT-05 — Supersession Model
When an interpretation changes, a new Intelligence object SHALL be created.

The previous Intelligence object SHALL remain unchanged.

Every Intelligence object SHALL contain:
- `supersession_chain_id`
- `supersedes_intelligence_id`

**Purpose:**

### supersession_chain_id
Groups all related Intelligence records into a single lineage.

### supersedes_intelligence_id
Identifies the immediately preceding Intelligence object.

**The first object in a lineage SHALL have:**

`supersedes_intelligence_id = null`

Subsequent objects SHALL reference the immediately prior Intelligence object.

# 6. Temporal Model
## CP-INT-06 — No Validity Windows
Intelligence objects SHALL NOT contain:
- `valid_from`
- `valid_until`

Intelligence does not expire.

A newer interpretation does not invalidate an older interpretation.

The platform simply records that a different interpretation was later produced.

Current interpretation SHALL be determined by the latest Intelligence object within a supersession lineage.

# 7. Evidence Requirements
## CP-INT-07 — Evidence Is Mandatory
Every Intelligence object SHALL reference at least one evidence source.

**Evidence references MAY include:**
- CL-11 Events
- CL-09 Transactions
- CL-10 Outcomes
- Existing Intelligence objects

Intelligence objects without evidence SHALL be constitutionally invalid.

# 8. Human Judgment
## CP-INT-08 — Human Assertion Events
Human rationale SHALL be represented as CL-11 Human Assertion Events.

**Examples:**
- Analyst judgment
- Executive prediction
- Expert testimony
- Manual investigation notes

Human rationale SHALL NOT create a new constitutional object type.

Human rationale SHALL be recorded as:
````
source_type = Human
event_category = Assertion
````

The Intelligence object references the Human Assertion Event through evidence_refs.

# 9. Intelligence Method Taxonomy
## CP-INT-09 — Closed Method Taxonomy
The Intelligence method taxonomy SHALL be closed.

### **Permitted methods:**
#### Prediction
Forecasting a future state, event, probability, or outcome.

**Examples:**
- Churn probability
- Equipment failure prediction
- Demand forecast

#### Classification
Assigning an entity to a predefined category.

**Examples:**
- High Risk Customer
- Pharmaceutical Product
- Premium Account

#### Inference
Deriving a conclusion from available evidence.

**Examples:**
- Creditworthiness assessment
- Fraud likelihood
- Supplier responsibility determination
- Root-cause analysis

#### Anomaly Detection
Identifying deviation from expected behavior, patterns, or baselines.

**Examples:**
- Suspicious login activity
- Unexpected transaction volume
- Sensor deviation

No additional Intelligence methods are permitted without constitutional amendment.

# 10. Attribution
## CP-INT-10 — Attribution Domain
Attribution SHALL NOT be an Intelligence method.

Attribution is a specialized Intelligence Domain operating under the Inference method.

**Examples:**
- Supplier caused contamination
- User caused policy breach
- Machine caused production failure

Attribution domains SHALL be governed through FR-014.

# 11. Epistemic Status
## CP-INT-11 — Mandatory Epistemic Status
Every Intelligence object SHALL include epistemic_status.

**Allowed values:**
- definite
- probable
- possible
- uncertain
- speculative

### Definitions:
#### definite
> Virtually certain based on evidence.
#### probable
> More likely than not.
#### possible
> Plausible but not established.
#### uncertain
> Significant doubt remains.
#### speculative
> Conjectural interpretation with weak support.

# 12. Confidence
## CP-INT-12 — Optional Confidence
confidence SHALL be optional.

**If confidence exists:**
`confidence_type` SHALL be mandatory.

**Examples:**
- calibrated_model
- statistical_model
- expert_judgment
- heuristic_rule
- ensemble_model

Confidence SHALL NOT replace `epistemic_status`.

Epistemic status remains the constitutional standard.

# 13. Materiality
## CP-INT-13 — Material Intelligence Threshold
Only materially significant interpretations SHALL become first-class Intelligence objects.

Routine analytics, telemetry, dashboards, and transient calculations SHALL remain outside the constitutional graph.

### Materiality Criteria
The Constitution defines the following materiality categories:
- decision_impact
- regulatory_relevance
- actor_effect
- dispute_relevance
- threshold_breach

At least one materiality criterion SHALL be satisfied.

### Domain Threshold Governance
Materiality thresholds SHALL NOT be hardcoded in the Constitution.

Threshold values SHALL be governed by FR-014 Intelligence Domain Registries.

**Example:**
- Fraud Domain: threshold_breach = 0.80
- Medical Safety Domain: threshold_breach = 0.30
- Military Domain: threshold_breach = 0.99

The Constitution defines categories.

FR-014 defines thresholds.

# 14. Producer Accountability
## CP-INT-14 — Producer Required
Every Intelligence object SHALL identify its producer.

Producer types MAY include:
- Human Analyst
- Rule Engine
- Machine Learning Model
- AI Agent
- Pipeline
- Algorithm

Anonymous Intelligence is prohibited.

# 15. Intelligence Statement
## CP-INT-15 — Human Readable Interpretation
Every Intelligence object SHALL contain a human-readable intelligence_statement.

**Purpose:**
Provide a concise explanation of the interpretation.

**Examples:**
> "Customer churn risk is high."
> "Supplier A likely caused contamination."
> "Fraud probability exceeds review threshold."
> "Batch quality appears compliant."

The intelligence_statement SHALL be understandable without requiring inspection of the underlying payload.

# 16. Canonical Intelligence Object
````
{
  "intelligence_id": "uuidv7",
  "supersession_chain_id": "uuidv7",
  "supersedes_intelligence_id": "uuidv7 | null",

  "intelligence_method": "prediction | classification | inference | anomaly_detection",

  "intelligence_domain": "fraud | attribution | quality | churn | ...",

  "intelligence_type": "domain_specific_type",

  "intelligence_statement": "Human-readable interpretation",

  "payload": {},

  "epistemic_status": "definite | probable | possible | uncertain | speculative",

  "confidence": 0.82,
  "confidence_type": "calibrated_model",

  "evidence_refs": [],

  "producer_id": "identity_or_system",

  "producer_version": "v1.0",

  "materiality_criteria": [
    "decision_impact"
  ],

  "created_at": "timestamp"
}
````

# 17. Constitutional Summary
CL-16 Intelligence is the constitutional layer that records what the platform believed and why.

**It is:**
- Evidence-based
- Immutable
- Auditable
- Explainable
- Human-compatible
- AI-compatible

**It is not:**
- Reality
- Truth
- Intent
- Policy
- Action

CL-16 preserves the complete history of interpretation while maintaining strict separation from execution authority.

This guarantees that every material decision can be traced to the exact interpretation, evidence, producer, and reasoning that existed when the decision was made.

###### END OF WS-03A.9 RATIFIED — LOCKED
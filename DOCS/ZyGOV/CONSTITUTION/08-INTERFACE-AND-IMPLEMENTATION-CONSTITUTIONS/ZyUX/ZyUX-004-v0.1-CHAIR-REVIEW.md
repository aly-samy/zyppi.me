# ZyUX-004 — Explanation, Evidence, Trust & Receipt Experience

**Canonical ID:** `ZyUX-004`  
**Version:** 0.1  
**Status:** DRAFT — CHAIR REVIEW  
**Series:** ZyUX — Zyppi Experience Architecture  
**Classification:** Horizontal Experience Doctrine  
**Normative Level:** Experience Doctrine / Product Architecture  
**Date:** 6 September 2026  
**Parent Authority:** `ZyUX-000 — Zyppi Experience Architecture & Master Doctrine`  
**Coordinates With:** `ZyUX-001 — Identity, Account & Entry Experience` · `ZyUX-002 — Organization, Relationship, Scope & Delegation Experience` · `ZyUX-003 — Contextual Navigation & Capability Disclosure` · NORTH STAR v7.0 · What is Zyppi? v4.0 · Z-PROF-001 v1.2 · applicable Evidence · Trust · Authority · Standing · Policy · Runtime · Receipt doctrine  
**Primary Source Corpus:** ZyUX-000 progressive-explanation doctrine · ZyUX-003 explanation boundary · NORTH STAR Reality → Evidence → Verification → Trust → Intent → Action progression · Z-PROF Naked Reality distinctions · Council discussion on Trust, Evidence, Receipt, uncertainty, public product experience, and auditability  
**Applies To:** Human explanations · Public resolution · Host-Native explanations · Operational decisions · Compliance views · Audit views · Evidence presentation · Trust presentation · Uncertainty · Conflict · Degradation · Receipt presentation · API/MCP explanation projections

---

# 0. Status & Intent

`ZyUX-004` governs how Zyppi explains:

- what it knows;
- what it does not know;
- what Evidence supports a claim;
- whether Evidence was verified;
- how Trust was assessed;
- what degraded confidence;
- what Policy affected a decision;
- what Authority and Standing were relevant;
- what action was taken;
- what Receipt proves about the digital decision/execution process;
- how much of that depth should be shown to different Subjects.

This document governs **experience**.

It does not redefine constitutional Evidence, Verification, Trust, Authority, Standing, Policy, Runtime, Receipt, or Reality semantics.

It SHALL NOT be interpreted as authorizing:

- "green check = truth";
- `Policy ALLOW = TRUSTED`;
- `Receipt = proof physical Reality occurred`;
- `Evidence present = Evidence verified`;
- `verified = authorized`;
- `authorized = executed`;
- `executed = physically occurred`;
- invented confidence;
- silent conflict resolution;
- hiding uncertainty to simplify UI;
- exposing sensitive Evidence merely because explanation exists;
- one generic Trust score for every domain;
- proof theater.

The governing proposition is:

> **Zyppi should answer simply first, explain honestly second, and prove precisely when needed.**

---

# 1. Purpose

Zyppi's architecture deliberately preserves distinctions that ordinary software often collapses.

For example:

```text
Information
≠ Evidence

Evidence
≠ Verified Evidence

Verification
≠ Trust

Trust
≠ Policy

Policy
≠ Authorization

Authorization
≠ Execution

Execution
≠ Physical Reality

Receipt
≠ Proof that physical Reality occurred
```

If the UX collapses these distinctions, the architecture's rigor is lost at the final surface.

If the UX exposes all distinctions at once, ordinary users are overwhelmed.

`ZyUX-004` therefore establishes a progressive explanation architecture.

The user should be able to move from:

```text
What should I do?
```

to:

```text
Why?
```

to:

```text
Based on what?
```

to:

```text
Show me the proof.
```

without requiring every user to begin at proof depth.

---

# 2. The Explanation Stack

The default ZyUX explanation model is:

```text
LEVEL 1 — ACTION / ANSWER
What should I know or do?

        ↓

LEVEL 2 — REASON
Why is Zyppi saying this?

        ↓

LEVEL 3 — BASIS
What Evidence / Policy / Authority / time basis supports it?

        ↓

LEVEL 4 — PROOF
Show the detailed provenance, evaluation, and Receipt.
```

This is an experience model.

It does not imply that every capability has all four levels or that all levels are disclosable to every Subject.

---

# 3. The Five User Questions

A well-designed Zyppi explanation should help answer, where relevant:

1. **What happened / what is the answer?**
2. **Why does Zyppi say that?**
3. **What Evidence supports it?**
4. **How strong / current / conflicting is that Evidence?**
5. **What did Zyppi decide or execute, and can that process be reconstructed?**

These questions may appear differently by archetype.

---

# 4. Core ZyUX-004 Terms

## 4.1 Answer

The concise user-facing result.

Examples:

```text
Product identified
Warranty active
Shipment held
Identity match unresolved
```

---

## 4.2 Reason

The human-understandable explanation for the answer or action.

Example:

```text
Shipment held because the required supplier certificate expired.
```

---

## 4.3 Basis

The structured supporting elements.

May include:

- Evidence references;
- Evidence state;
- Authority;
- Standing;
- Policy version;
- applicable rule;
- valid time;
- source;
- degradation factor;
- conflict indicator.

---

## 4.4 Proof

The deeper reconstructible record of how Zyppi observed/evaluated/decided/executed.

May include:

- provenance;
- evaluation details;
- policy basis;
- Authority chain;
- Evidence records;
- timestamps;
- Receipt;
- signatures/hashes where applicable;
- version references.

Proof is subject to disclosure authority.

---

## 4.5 Evidence

Evidence remains governed by constitutional doctrine.

ZyUX treats Evidence as supporting material, not as synonymous with truth.

---

## 4.6 Trust

Trust remains governed by Trust doctrine.

ZyUX presents Trust without redefining its semantics.

---

## 4.7 Receipt

A Receipt is the auditable basis of what Zyppi observed, evaluated, decided, and/or executed according to governing architecture.

A Receipt SHALL NOT be presented as proof that an external physical fact necessarily occurred.

---

# 5. Primary ZyUX-004 Laws

## ZyUX-004-L01 — Answer First, Proof on Demand

> **Zyppi SHOULD provide the smallest useful answer first and allow legitimate users to progressively inspect reason, basis, and proof.**

---

## ZyUX-004-L02 — Never Simplify by Lying

> **UX simplification SHALL NOT collapse unknown, unavailable, unverified, conflicting, inferred, or interpreted states into certainty.**

---

## ZyUX-004-L03 — Evidence Presence Is Not Verification

> **The existence of Evidence SHALL NOT be presented as equivalent to verified Evidence.**

---

## ZyUX-004-L04 — Trust Is Not Authorization

> **A trusted result SHALL NOT be presented as permission to act unless the applicable Authority/Policy decision separately establishes that permission.**

---

## ZyUX-004-L05 — Policy ALLOW Is Not Trust

> **A Policy decision allowing an action SHALL NOT be presented as proof that underlying Evidence is trusted.**

---

## ZyUX-004-L06 — Authorization Is Not Execution

> **The fact that an action was authorized SHALL NOT be presented as proof that it was executed.**

---

## ZyUX-004-L07 — Execution Is Not Physical Reality

> **A digital execution record SHALL NOT be presented as universal proof that the corresponding physical-world event occurred.**

---

## ZyUX-004-L08 — Receipt Is Process Proof, Not Reality Magic

> **A Receipt SHALL be explained as evidence of Zyppi's governed process and attributable execution basis, not as omniscient proof of Reality.**

---

## ZyUX-004-L09 — Uncertainty Must Be Visible When Material

> **Material uncertainty, missing Evidence, staleness, or conflict SHALL be surfaced at the appropriate experience depth.**

---

## ZyUX-004-L10 — Conflict Shall Not Be Silently Resolved

> **Conflicting Evidence SHALL remain visibly conflicting unless an authorized governing process legitimately resolves the conflict.**

---

## ZyUX-004-L11 — Trust Must Explain Degradation

> **Where Trust is degraded, the user SHOULD be able to understand the material degradation factors.**

---

## ZyUX-004-L12 — Explanation Is Scope-Bounded

> **A Subject's right to receive an answer does not automatically grant access to every Evidence item, source, identity, or policy detail behind it.**

---

## ZyUX-004-L13 — Public Explanation Is Not Internal Disclosure

> **Public proof surfaces SHOULD expose the minimum necessary basis without leaking protected internal Evidence or relationships.**

---

## ZyUX-004-L14 — Historical Explanation Uses Historical Basis

> **A historical action SHALL be explained using the Authority, Standing, Evidence, Policy, and valid-time context that applied then, not today's state.**

---

## ZyUX-004-L15 — Same Meaning Across Surfaces

> **Human UI, REST, SDK, MCP, Host-Native extension, and audit views may differ in depth but SHALL preserve underlying meaning.**

---

# 6. Naked Reality Experience

ZyUX-004 inherits the following epistemic distinctions:

```text
UNKNOWN ≠ FALSE
UNAVAILABLE ≠ FALSE
UNVERIFIED ≠ VERIFIED
CONFLICTING ≠ RESOLVED
INFERRED ≠ OBSERVED
INTERPRETED ≠ REALITY
AUTHORIZED ≠ OCCURRED
EXECUTED ≠ AUTHORIZED
```

The UX must preserve these distinctions.

---

# 7. UNKNOWN Experience

`UNKNOWN` means Zyppi does not currently know the answer under applicable Evidence/authority.

Good:

```text
Warranty status unknown
```

Bad:

```text
No warranty
```

unless Evidence/policy actually supports that conclusion.

---

# 8. UNAVAILABLE Experience

`UNAVAILABLE` means the necessary information may exist but is not available to Zyppi or to the current Subject.

Good:

```text
Certificate information unavailable
```

Bad:

```text
Certificate does not exist
```

---

# 9. UNVERIFIED Experience

Good:

```text
Supplier certificate provided
Verification pending
```

Bad:

```text
Verified certificate
```

merely because a document was uploaded.

---

# 10. CONFLICTING Experience

Example:

```text
Conflict detected

Supplier record:
Certificate valid until 31 Dec

Registry record:
Certificate expired 1 Sep
```

The ordinary user may receive:

```text
Certificate status conflicting
Review required
```

Expert view may expose the conflicting basis.

---

# 11. INFERRED Experience

Where an outcome is inferred rather than directly observed:

```text
Likely manufacturer:
Company X

Basis:
identifier + registry relationship
```

The UX SHOULD not word an inference as direct observation.

---

# 12. INTERPRETED Experience

A domain interpretation should remain distinguishable from canonical Reality.

Example:

```text
DPP interpretation:
Repairability requirement satisfied
```

This is not equivalent to:

```text
Reality itself says "repairability satisfied."
```

The user need not know the ontology distinction unless relevant, but the semantics must remain correct.

---

# 13. OBSERVED vs REPORTED

Where useful, Zyppi should distinguish:

```text
Observed by sensor
Reported by supplier
Asserted by user
Verified against registry
```

Source/provenance changes meaning.

---

# 14. Evidence Presentation Layers

Evidence may be presented progressively.

## Layer A — Summary

```text
3 Evidence records support this result
```

Only if count semantics are accurate.

---

## Layer B — Material Evidence

```text
GS1 registry record
Supplier certificate
Manufacturer statement
```

---

## Layer C — Evidence State

```text
Verified
Unverified
Expired
Conflicting
Unavailable
```

according to governing semantics.

---

## Layer D — Provenance

```text
Source
Issuer
Retrieved at
Valid time
Version
```

---

## Layer E — Full Record

Raw/structured Evidence where disclosure permits.

---

# 15. Evidence Count Semantics

Counts must be literal.

If there are four Evidence records:

```text
Evidence records: 4
```

Do not say:

```text
Verified Evidence: 4
```

unless all four have actually satisfied the governing verification semantics.

This protects against proof theater.

---

# 16. Evidence Freshness

Where freshness is material, the UX should expose it.

Example:

```text
Registry status
Last checked: 6 Sep 2026, 14:22
```

or:

```text
Evidence may be stale
Last verified 43 days ago
```

Freshness semantics remain governed elsewhere.

---

# 17. Valid Time vs Observation Time

Where relevant, distinguish:

```text
Valid for:
1 Jan–31 Dec 2026

Observed/retrieved:
6 Sep 2026
```

A record retrieved today may describe a historical valid period.

---

# 18. Evidence Expiry

An expired Evidence item is not necessarily false.

UX:

```text
Certificate expired
```

not:

```text
Certificate invalid forever
```

unless governing semantics support that.

---

# 19. Evidence Missing

Missing Evidence should produce an honest state.

Example:

```text
Required origin Evidence not available
```

Then, where legitimate:

```text
[Request Evidence]
```

---

# 20. Evidence Disclosure

Different Subjects may see different Evidence depth.

Example:

### Public observer

```text
Verified manufacturer source available
```

### Compliance officer

```text
Issuer, source, validity, provenance
```

### Auditor

```text
Full authorized Evidence chain
```

Same underlying Evidence.

Different disclosure.

---

# 21. Trust Presentation

Trust should not become a decorative score.

Where current Trust doctrine uses levels such as:

```text
Definite
Probable
Possible
Uncertain
Speculative
```

the UX SHOULD preserve their intended meaning.

A Trust label should answer:

> **How trustworthy is this conclusion given the Evidence and governing assessment?**

Not:

> **May I act?**

---

# 22. Trust Summary

Possible:

```text
Trust: Probable
```

with:

```text
Why?
```

---

# 23. Trust Reason

Example:

```text
Trust is Probable because:
• manufacturer registry matched
• supplier Evidence is current
• one expected source is unavailable
```

---

# 24. Trust Degradation Factors

Examples:

```text
Missing Evidence
Expired Evidence
Conflicting Evidence
Unverified issuer
Stale observation
Incomplete provenance
```

Only actual governed factors should be shown.

---

# 25. Avoid Numeric Trust Scores by Default

A number such as:

```text
Trust score: 87%
```

can imply unjustified mathematical precision.

Unless Trust doctrine explicitly defines calibrated numeric semantics, ZyUX SHOULD prefer governed categorical levels and explanatory factors.

---

# 26. Verification Status

`verificationStatus` must answer a scoped question.

Avoid:

```text
Verified
```

with no object.

Prefer:

```text
Product identity verified
```

or:

```text
Manufacturer relationship verified
```

or:

```text
Certificate not verified
```

The user should know **what** was verified.

---

# 27. Trust vs Verification

Example:

```text
Product identity:
Verified

Overall Evidence trust:
Probable
```

This is coherent.

A verified identifier does not make all product claims definite.

---

# 28. Trust vs Policy

Example:

```text
Trust:
Uncertain

Policy decision:
REVIEW
```

or:

```text
Trust:
Probable

Policy decision:
HOLD
Reason: mandatory certificate expired
```

Trust and Policy may legitimately diverge.

---

# 29. Policy Explanation

A policy-driven action SHOULD answer:

```text
What policy affected this?
Why did it apply?
What condition triggered it?
```

At ordinary depth:

```text
Held because the required supplier certificate expired.
```

At deeper depth:

```text
Policy:
Supplier Compliance v12

Rule:
Active certificate required at shipment release
```

---

# 30. Authority Explanation

For consequential action, the user may need:

```text
Who was authorized?
Under whose authority?
What scope applied?
Was Standing active?
```

Example:

```text
Approved by:
Ahmed

Capacity:
Company A — Finance Reviewer

Authority:
Invoice approval ≤ $10,000

Standing:
Valid at approval time
```

---

# 31. Delegation Chain Explanation

Expert/audit view may show:

```text
Company A
→ Finance Director
→ Ahmed
→ Approve invoice ≤ $10,000
```

Only where disclosure permits.

---

# 32. Standing Explanation

Current:

```text
Ahmed no longer has Company A approval access.
```

Historical:

```text
Ahmed had valid Standing when this approval occurred.
```

Do not use current revocation to imply historical invalidity.

---

# 33. Decision Explanation

A decision surface may show:

```text
Decision:
HOLD

Reason:
Supplier certificate expired

Trust:
Probable

Next:
Request updated certificate
```

This combines distinct concepts without collapsing them.

---

# 34. Execution Explanation

If an authorized action was executed:

```text
Execution:
Completed
```

with:

```text
Executed at:
6 Sep 2026, 14:20

Actor:
Ahmed

Receipt:
RCP-...
```

Do not imply physical-world completion if execution was only digital.

---

# 35. Failed Execution

Example:

```text
Authorized:
Yes

Execution:
Failed

Reason:
Upstream system unavailable
```

This distinction is essential.

---

# 36. Pending Execution

Example:

```text
Approved
Waiting for external system
```

Authorization is not execution.

---

# 37. Receipt Experience

Receipts should serve different users differently.

## Operational User

```text
Completed
Receipt available
```

## Compliance User

```text
Decision
Policy
Evidence summary
Actor
Time
Receipt
```

## Auditor

```text
Full authorized Receipt reconstruction
```

---

# 38. Receipt Meaning

User-facing copy SHOULD communicate:

> **This Receipt records the governed basis of what Zyppi observed, evaluated, decided, and/or executed.**

Avoid:

> **This Receipt proves the physical event happened.**

unless specific external Evidence independently supports that physical fact.

---

# 39. Receipt Summary

Possible:

```text
Receipt RCP-8821

Decision:
Approved

Actor:
Ahmed

Organization:
Company A

Time:
12 Feb 2025

Policy:
Finance Approval v7
```

---

# 40. Receipt Deep View

May include:

- input references;
- Evidence references;
- evaluation version;
- Trust assessment;
- Policy version;
- Authority chain;
- valid time;
- execution result;
- provenance;
- hashes/signatures;
- related Receipts.

Only legitimate fields are shown.

---

# 41. Receipt Verification

Where Receipt integrity can be verified:

```text
Receipt integrity:
Verified
```

This means Receipt integrity.

Not:

```text
All underlying Reality claims are verified.
```

---

# 42. Receipt Linkability

Receipts may link to:

- Subject;
- Object;
- Event;
- Evidence;
- organization;
- decision;
- execution.

Linkability is scope-governed.

---

# 43. Historical Receipt

Historical view should clearly communicate time:

```text
Historical Receipt
12 Feb 2025
```

Current policy changes should not rewrite the old basis.

---

# 44. Public Receipt Surface

Public Receipts, where authorized, should expose bounded proof.

Example:

```text
Product verification receipt
Issued by Zyppi
Time
Verification scope
Evidence summary
Integrity status
```

Do not expose private supplier contracts merely because the Receipt is public.

---

# 45. Proof Disclosure Classes

ZyUX-004 may use:

```text
Public
Relationship-scoped
Organization-scoped
Privileged
Audit-only
Non-disclosable
```

as experience-level disclosure classes if aligned with governing policy.

Exact taxonomy remains to ratify.

---

# 46. Explanation Disclosure vs Action Disclosure

A Subject may be allowed to know:

```text
This shipment is held
```

without being allowed to see:

```text
confidential supplier investigation Evidence
```

Answer visibility and proof visibility may differ.

---

# 47. “Why Can't I?” Experience

When a user cannot perform an action:

```text
Why can't I release this shipment?
```

Possible answer:

```text
Release requires Compliance approval.
```

or:

```text
Required Evidence is missing.
```

or:

```text
Your delegation does not include release authority.
```

The explanation should not expose non-disclosable detail.

---

# 48. “Why Did This Change?” Experience

Users may need to understand state transitions.

Example:

```text
Warranty status changed to unavailable.

Reason:
Manufacturer coverage period ended on 1 Sep 2026.
```

or:

```text
Trust changed from Probable to Uncertain.

Reason:
A previously verified certificate expired.
```

---

# 49. Change History

Where appropriate:

```text
6 Sep — Trust: Uncertain
1 Sep — Certificate expired
15 Aug — Trust: Probable
```

This helps users understand dynamic Reality.

---

# 50. Conflict Resolution UX

If conflict requires expert review:

```text
Conflicting Evidence requires review.

[Review Evidence]
```

The reviewer may compare:

```text
Source A
Source B
Validity
Authority
Provenance
```

---

# 51. Conflict Is Not Error

A conflict may be a legitimate state of Reality representation.

Do not present every conflict as system failure.

---

# 52. System Failure vs Epistemic Uncertainty

Distinguish:

```text
We do not know
```

from:

```text
The service failed
```

Example:

```text
Manufacturer unknown
```

vs:

```text
Registry temporarily unavailable
```

---

# 53. Trust Degradation vs Service Failure

Example:

```text
Trust degraded:
Required Evidence stale
```

versus:

```text
Trust assessment unavailable:
Evaluation service failed
```

Do not merge them.

---

# 54. No Proof Theater

Proof theater includes:

- decorative green shields;
- unexplained 100% badges;
- Evidence counts presented as verification;
- confidence percentages without calibration;
- "blockchain verified" style language with no scoped meaning;
- receipts presented as universal truth certificates.

ZyUX-004 prohibits this.

---

# 55. Public Trust UX

Public product experience should answer ordinary questions:

```text
What is this?
Who says so?
Is anything important unresolved?
Can I inspect more?
```

Avoid making consumers interpret:

- internal Trust taxonomies;
- policy graphs;
- authority chains.

---

# 56. Public Example

```text
Product identified

Manufacturer:
Company X

Verification:
Product identity verified

Important:
Recall status unavailable from one source

[Why?]
[View evidence summary]
```

This is more honest than one green check.

---

# 57. Retail Customer Example

Before purchase:

```text
Product identity:
Verified

Warranty terms:
Available

Recall:
No active recall found in connected sources
```

Avoid:

```text
This product is completely safe.
```

unless that conclusion is legitimately supported.

---

# 58. Warranty Example

```text
Warranty:
Active

Coverage until:
12 May 2027

Basis:
Manufacturer warranty record

Verification:
Record verified against manufacturer source
```

---

# 59. Pet Example

Owner:

```text
Vaccination record:
Provided by Vet Clinic

Status:
Verified issuer
Valid through 30 Nov
```

Public finder:

```text
Emergency information available
```

The finder does not see full medical history.

---

# 60. Agriculture Example

Buyer:

```text
Harvest provenance:
Supported

Evidence:
Farm record + certifier record

Trust:
Probable

Limitation:
One transport record unavailable
```

---

# 61. Logistics Example

Driver:

```text
Delivery action:
Recorded

Receipt:
Available
```

Compliance:

```text
Delivery Evidence:
Driver record + location event

Trust:
Probable

Limitation:
Recipient confirmation missing
```

---

# 62. Government / Regulator Example

Company user:

```text
Submission accepted by regulator system
```

This means digital acceptance.

It does not necessarily mean:

```text
Compliance obligation finally satisfied
```

unless governing rules say so.

---

# 63. Operational User Experience

Operational users need:

```text
What should I do?
Why?
What fixes it?
```

Example:

```text
HOLD

Reason:
Required certificate expired

Next:
Request updated certificate
```

Do not lead with Evidence graph.

---

# 64. Compliance User Experience

Compliance needs:

```text
Decision
Reason
Evidence
Trust
Policy
Authority
Time
Conflicts
Receipt
```

with drill-down.

---

# 65. Auditor Experience

Auditor needs reconstructibility:

```text
What was known?
What Evidence existed?
Which version?
Who had Authority?
What Policy applied?
What decision occurred?
What execution occurred?
What Receipt proves the process?
```

---

# 66. Executive Experience

Executives usually need aggregate risk/outcome.

Do not make them inspect raw Evidence unless drilling into an exception.

Example:

```text
18 shipments held
12 due to expired supplier Evidence
4 due to conflict
2 due to unavailable registry
```

---

# 67. Developer Experience Boundary

Developers need machine-readable explanation.

Example:

```json
{
  "answer": "...",
  "reason": "...",
  "trustStatus": "...",
  "degradationFactors": ["..."],
  "receiptReference": "..."
}
```

Exact API belongs to ZYAPI.

ZyUX-004 governs understandable semantics, not contract shape.

---

# 68. Agent Explanation Boundary

An AI agent may need:

- outcome;
- machine-readable reason;
- Evidence references;
- Authority limitations;
- next legitimate capabilities;
- Receipt.

It should not hallucinate explanation beyond returned basis.

---

# 69. Explanation Consistency Across Human and Agent

If UI says:

```text
Held because supplier certificate expired
```

MCP/API should not say:

```text
Held because trust is low
```

unless both are legitimately part of the same explanation.

Semantic parity matters.

---

# 70. Explanation Templates

ZyUX may standardize patterns such as:

```text
RESULT
Because:
BASIS
Limitations:
NEXT ACTION
```

Example:

```text
Shipment held

Because:
Supplier certificate expired 1 Sep

Limitations:
Registry confirmation unavailable

Next:
Request updated certificate
```

---

# 71. Severity & Urgency

Explanation should distinguish:

- information;
- caution;
- review required;
- blocked;
- failure.

Severity should derive from governing state, not visual drama.

---

# 72. Color Is Not Meaning

Trust/verification state SHALL NOT rely on color alone.

Use:

- text;
- icons with labels;
- accessible status semantics.

---

# 73. Green Is Dangerous

A green state can falsely imply:

```text
safe
legal
authorized
true
complete
```

Status labels must remain scoped.

Prefer:

```text
Identity verified
```

over:

```text
✓ Verified
```

when ambiguity matters.

---

# 74. Red Is Dangerous

Red should not collapse:

```text
conflict
unknown
expired
unavailable
fraud
failure
```

These states need distinct labels.

---

# 75. Explanation Ordering

The most decision-relevant reason should appear first.

Example:

```text
Hold
Required certificate expired
```

Then:

```text
Additional limitation:
Registry temporarily unavailable
```

---

# 76. Multiple Reasons

If multiple reasons materially contribute:

```text
Held for 2 reasons:
1. Certificate expired
2. Supplier Standing suspended
```

Avoid hiding one behind a generic `policy failed`.

---

# 77. Primary Cause vs Supporting Context

UX may distinguish:

```text
Primary reason
Supporting factors
```

This improves comprehension.

---

# 78. User-Correctable vs Non-Correctable

Where useful, explanations should reveal whether the user can act.

Example:

```text
Missing delivery photo
[Upload]
```

versus:

```text
Regulator review pending
No action required
```

---

# 79. Next Legitimate Action

Explanation should often end with:

```text
What can I do next?
```

Possible:

- request Evidence;
- escalate;
- retry;
- wait;
- contact issuer;
- request Authority;
- view Receipt.

This connects ZyUX-004 to ZyUX-003 capability disclosure.

---

# 80. Explanation Without Capability Leakage

If the Subject cannot know an escalation capability exists:

do not expose:

```text
Ask Secret Compliance Team
```

Disclosure remains governed.

---

# 81. Explanation of Missing Access

Example:

```text
You can view this decision but not the underlying Evidence.
```

Where legitimate, explain:

```text
Evidence access is restricted to Compliance.
```

Only if role existence is disclosable.

---

# 82. Evidence Redaction

Authorized proof may be partially redacted.

UX should indicate:

```text
Some Evidence details are restricted.
```

rather than pretending the shown subset is complete.

---

# 83. Partial Proof

Example:

```text
3 supporting records
2 available to you
1 restricted
```

Only if count disclosure itself is allowed.

---

# 84. Source Disclosure

Source may be:

- named;
- categorized;
- hidden;
- redacted;

according to disclosure policy.

Do not make public proof dependent on exposing confidential source identities.

---

# 85. Source Authority

Where relevant, distinguish:

```text
Issuer
Source
Observer
Verifier
```

One entity may fill multiple roles, but UX should not assume they are identical.

---

# 86. Provenance Experience

Provenance answers:

```text
Where did this come from?
Who supplied it?
When?
Through what authorized path?
```

Detailed provenance belongs at deeper explanation levels.

---

# 87. Time Experience

Relevant timestamps may include:

- valid from;
- valid until;
- observed at;
- retrieved at;
- evaluated at;
- executed at;
- receipt issued at.

Do not collapse into one `date`.

---

# 88. Time Labels

Prefer:

```text
Valid until
Last checked
Decision made
Executed
```

rather than exposing internal time-coordinate names to ordinary users.

---

# 89. Historical Comparison

Users may need:

```text
Why was this allowed in 2025 but not today?
```

UX may compare:

```text
2025:
Certificate valid

Today:
Certificate expired
```

or:

```text
2025 policy:
v7

Today:
v12
```

---

# 90. Policy Version Experience

Where changes matter:

```text
Decision used Policy v7
```

not today's Policy v12.

---

# 91. Evidence Version Experience

If Evidence changed:

```text
Current manufacturer record differs from record used in 2025 decision.
```

This preserves historical integrity.

---

# 92. Replay Experience Boundary

Replay may reconstruct an earlier evaluation.

ZyUX-004 does not define replay mechanics.

It requires replay surfaces to distinguish:

```text
Historical reconstruction
```

from:

```text
Current evaluation
```

---

# 93. Explanation Freshness

A cached explanation may become stale.

Where important:

```text
Based on information checked 2 hours ago
```

or:

```text
Refresh
```

Cache semantics belong elsewhere.

---

# 94. Error Explanation

System errors should remain distinct from domain results.

Example:

```text
We couldn't verify the manufacturer because the registry is unavailable.
```

not:

```text
Manufacturer unverified
```

if the only problem is service outage.

---

# 95. Retry Experience

Where retry is meaningful:

```text
Registry unavailable
[Try again]
```

Where retry will not help:

```text
Certificate expired
[Request updated certificate]
```

---

# 96. Trust Unavailable

If Trust evaluation itself cannot run:

```text
Trust assessment unavailable
```

Do not invent fallback trust.

---

# 97. Partial Evaluation

If only part of the Evidence could be evaluated:

```text
Trust assessment incomplete
```

with limitations where disclosable.

---

# 98. Confidence Language

Avoid vague words:

```text
probably okay
seems safe
looks genuine
```

Prefer governed Trust labels and explicit limitations.

---

# 99. Consumer-Friendly Language

Governed semantics can still be human.

Example:

```text
We verified the product identity.
We could not confirm the latest recall status because one registry is unavailable.
```

This is simple and precise.

---

# 100. Expert Language

Expert users may opt into:

```text
Trust: Probable
Degradation factors:
REGISTRY_UNAVAILABLE
EVIDENCE_STALE
```

Exact codes belong to implementation contracts.

---

# 101. Explanation Preferences

Users MAY choose preferred depth:

```text
Simple
Detailed
Expert
```

where appropriate.

Preference cannot suppress mandatory warnings or uncertainty.

---

# 102. Default Depth by Archetype

Illustrative:

```text
Public → Answer + important limitation
Operator → Action + reason + next
Compliance → reason + basis
Auditor → full proof
Developer → structured semantics
```

Specific profiles own final defaults.

---

# 103. Tooltips

Tooltips may explain unfamiliar statuses.

They should not carry critical information that is inaccessible on touch/mobile or assistive technology.

---

# 104. Expanders

Progressive detail may use:

```text
Why?
View basis
View proof
```

Exact components belong to design-system authority.

---

# 105. Evidence Table Boundary

Tables are useful for experts.

They should not become the default public experience.

---

# 106. Audit Timeline

An audit timeline may show:

```text
Evidence received
Verification completed
Trust assessed
Policy evaluated
Action authorized
Execution attempted
Receipt issued
```

This is an experience projection of distinct events.

---

# 107. Timeline Does Not Imply Causality Without Basis

Ordering events visually should not imply one caused another unless governing semantics support it.

---

# 108. Attribution

Every consequential decision/execution explanation SHOULD be capable of answering:

```text
Who/what acted?
In what capacity?
Under what scope?
At what time?
```

where disclosure permits.

---

# 109. Human vs Agent Attribution

If an agent acts:

```text
Executed by:
Agent X

On behalf of:
Company A

Delegated by:
...
```

where applicable.

Do not attribute agent action directly to a human unless the authority model says so.

---

# 110. Override Explanation

If an override occurred:

```text
Policy result:
HOLD

Override:
Approved by Compliance Director

Reason:
Emergency recall containment

Receipt:
...
```

Overrides must not disappear from explanation.

---

# 111. Exception Explanation

Exceptions should be visible as exceptions.

Do not make overridden outcomes look like ordinary policy outcomes.

---

# 112. Manual Review

If human review changes result:

```text
Automated assessment:
REVIEW

Human decision:
APPROVE
```

with attribution and reason where required.

---

# 113. AI Assistance

AI-generated summaries of Evidence may help comprehension.

But:

> **AI summary ≠ Evidence.**

The UX SHOULD label machine-generated interpretation as interpretation.

---

# 114. AI Explanation Boundary

AI may summarize:

```text
The main issue is the expired supplier certificate.
```

It SHALL NOT invent:

- Evidence;
- Authority;
- Trust;
- policy basis;
- Receipt content.

---

# 115. AI Uncertainty

If AI cannot safely summarize complex conflict:

```text
Evidence is conflicting. Review the source records.
```

is better than fabricated synthesis.

---

# 116. Evidence Translation

AI may translate or simplify Evidence text.

The original source/provenance must remain accessible where required.

---

# 117. Marketing Claims Boundary

ZyUX explanation surfaces SHALL NOT become marketing proof of claims the architecture has not established.

Example:

Do not convert:

```text
Receipt verified
```

into:

```text
100% authentic product guaranteed
```

---

# 118. Proof Portability

Where authorized, proof may be:

- viewed;
- exported;
- referenced;
- shared;
- verified externally.

Exact mechanisms belong to Receipt/API authority.

---

# 119. Shared Proof

When sharing proof, recipient scope matters.

A share link must not automatically grant the sharer's full Evidence access.

---

# 120. Expiring Proof Access

Some proof access may be time-bounded.

UX should show expiry where relevant.

---

# 121. Public Verification Link

A public verification link may expose:

```text
Receipt identity
Integrity
Scope
Issued time
Public result
```

without private Evidence.

---

# 122. Screenshot Risk

The UX cannot prevent all screenshots.

Sensitive proof surfaces should avoid unnecessary exposure.

Security doctrine owns stronger controls.

---

# 123. Accessibility

Explanation must be accessible:

- status text, not color only;
- screen-reader labels;
- logical heading hierarchy;
- expandable content announced correctly;
- charts supplemented with text;
- plain language;
- keyboard-accessible proof exploration.

---

# 124. Localization

Trust and uncertainty terms must be translated carefully.

Do not use localized wording that strengthens or weakens semantic meaning.

`Uncertain` must not become `Unsafe`.

`Verified identity` must not become `Authentic product` unless that is the same scoped claim.

---

# 125. Cognitive Load

Every explanation layer should answer a real user question.

Do not display:

- raw hashes;
- timestamps;
- authority IDs;
- version IDs;

at primary depth unless the Job requires them.

---

# 126. Expert Escape Hatch

Expert users need access to details.

Hiding all complexity permanently is not acceptable.

`Invisible complexity` means:

```text
not forced
```

not:

```text
inaccessible
```

where disclosure permits.

---

# 127. “Show Me Everything” Boundary

Even an expert cannot view non-disclosable Evidence merely by selecting `expert mode`.

Disclosure remains governed.

---

# 128. Explanation State Persistence

If a user drills into proof, back navigation should preserve context.

Do not force re-navigation through unrelated modules.

---

# 129. Deep Link to Proof

Authorized users may receive deep links to:

- Receipt;
- Evidence item;
- policy basis;
- conflict review.

Authentication should return to that proof context.

---

# 130. Revoked Proof Access

If access is revoked, old deep links must no longer expose protected proof.

Historical Receipt existence may remain where separately authorized.

---

# 131. Notification Explanation

Notifications should summarize:

```text
Shipment held
Reason: certificate expired
```

only if disclosure permits on that channel.

Detailed Evidence belongs inside authenticated context.

---

# 132. Email Explanation Boundary

If Zyppi later emails explanations:

avoid embedding sensitive Evidence unnecessarily.

Prefer secure contextual link.

---

# 133. Host-Native Explanation

A Host-Native surface may show:

```text
Hold — supplier certificate expired
[View Zyppi basis]
```

The host does not need to reproduce the entire proof stack.

---

# 134. Host-Native Semantic Integrity

Host labels must not strengthen meaning.

Bad:

Zyppi returns:

```text
Trust: Probable
```

SAP extension shows:

```text
Verified Safe
```

This is prohibited.

---

# 135. ZYAPI Explanation Boundary

ZYAPI should expose enough structured semantics that interfaces do not need to infer meaning from free text.

Exact contract belongs to ZYAPI.

---

# 136. Error Code vs Human Explanation

Machine code may be:

```text
EVIDENCE_STALE
```

Human text:

```text
The certificate is out of date.
```

Both must describe the same underlying state.

---

# 137. Explainability Without Determinism Theater

A deterministic-looking explanation is not proof the world is deterministic.

Zyppi should explain the basis it had.

---

# 138. Explainability Without Omniscience

A complete internal Receipt does not mean Zyppi observed all relevant Reality.

Missing context must remain possible.

---

# 139. Negative Claims

Claims such as:

```text
No recall exists
```

are stronger than:

```text
No active recall found in connected sources
```

Use the stronger claim only where Evidence supports it.

---

# 140. Absence Is Not Evidence

Lack of connected context SHALL NOT automatically be presented as proof that a condition does not exist.

This is especially important in Host-Native integrations.

---

# 141. Source Coverage

Where useful:

```text
Checked:
Manufacturer registry
GS1 source

Unavailable:
Regulator source
```

This helps users understand limits.

---

# 142. Coverage Without Overload

Public user may see:

```text
One source could not be checked.
```

Expert may see the full source list.

---

# 143. Trust Change Notification

If Trust materially degrades:

```text
Trust changed: Probable → Uncertain
Reason: certificate expired
```

where policy calls for notification.

---

# 144. Evidence Change Notification

Example:

```text
New conflicting supplier record detected.
```

The UX should not silently overwrite prior state.

---

# 145. Decision Change

If new Evidence changes a current decision:

```text
Shipment moved from Review to Hold
```

with reason.

---

# 146. Historical Decision Integrity

A new decision does not rewrite the old Receipt.

Both remain attributable to their evaluation times.

---

# 147. Aggregate Explanation

Dashboards may summarize reasons:

```text
Holds this week:
58% expired Evidence
25% missing Evidence
17% policy conflict
```

Only if categorization is accurate.

---

# 148. Drill-Down From Aggregate

Users should be able to move:

```text
aggregate
→ affected items
→ individual reason
→ basis
→ proof
```

within scope.

---

# 149. No Aggregation Leakage

Aggregates must not reveal sensitive categories or relationships outside scope.

Small-number privacy may matter.

---

# 150. Trust Aggregation Boundary

Do not average categorical Trust into meaningless numeric scores without a governed model.

---

# 151. Evidence Quality vs Evidence Quantity

More Evidence records do not necessarily mean higher Trust.

UX should not imply:

```text
10 records > 2 records
```

without governing semantics.

---

# 152. Evidence Authority

A single authoritative record may outweigh many weak claims depending on governing model.

UX should not use raw count as quality.

---

# 153. User-Supplied Evidence

User-uploaded Evidence should clearly show source:

```text
Provided by Ahmed
```

until independently verified if applicable.

---

# 154. Organization-Supplied Evidence

Likewise:

```text
Provided by Company A
```

is not automatically independent verification.

---

# 155. Third-Party Evidence

Third-party source may be disclosed as:

```text
Verified registry source
```

where permitted.

---

# 156. Revoked Evidence

If Evidence is withdrawn/revoked:

current explanation should reflect it.

Historical Receipts still show what was available then.

---

# 157. Superseded Evidence

New record may supersede old record.

Do not delete old historical basis.

---

# 158. Evidence Correction

If a source corrects Evidence:

UX should distinguish:

```text
corrected record
```

from:

```text
original record never existed
```

where history matters.

---

# 159. User Disagreement

A user may challenge an explanation.

Possible:

```text
[Report issue]
[Submit Evidence]
[Request review]
```

where applicable.

Disagreement is not automatic proof of error.

---

# 160. Explainability Feedback

ZyUX may measure:

```text
Was this explanation helpful?
```

but should prioritize behavioral evidence such as successful resolution and reduced support burden.

---

# 161. Telemetry & Validation

ZyUX-004 should eventually measure:

- explanation-open rate;
- time to understand blocked action;
- successful next action;
- Evidence drill-down rate;
- audit reconstruction time;
- Trust-status comprehension;
- confusion between Trust and authorization;
- confusion between Receipt and physical proof;
- conflict-review completion;
- support tickets about `why`;
- false-certainty incidents;
- proof-sharing errors;
- public-user comprehension;
- accessibility of status presentation.

Telemetry SHALL remain scope-safe.

---

# 162. Comprehension Testing

Test whether users correctly understand:

```text
Unknown
Unavailable
Unverified
Conflicting
Probable
Authorized
Executed
Receipt verified
```

If users routinely interpret them more strongly than intended, the UX fails even if the backend semantics are correct.

---

# 163. Security Review Requirements

Review is required for:

- Evidence leakage;
- source identity leakage;
- authority-chain leakage;
- conflict side channels;
- public Receipt disclosure;
- deep-link proof access;
- proof sharing;
- redaction;
- historical/current state confusion;
- explanation injection;
- AI summary hallucination;
- cross-scope audit views.

---

# 164. Relationship to Other ZyUX Documents

## `ZyUX-001`

Defines Identity/account entry and identity-resolution explanation entry points.

## `ZyUX-002`

Defines Authority, Standing, delegation, and organizational context whose basis may need explanation.

## `ZyUX-003`

Defines where `Why?`, `View Basis`, `View Proof`, and request/escalation capabilities appear.

## `ZyUX-005`

Defines Host-Native projection of explanations without semantic strengthening.

## `ZyUX-006`

Defines historical, offboarding, recovery, and lifecycle explanations.

`ZyUX-004` owns the **explanation and proof experience spine**.

---

# 165. Explicit Non-Scope

`ZyUX-004` does not define:

- Trust algorithm;
- Evidence schema;
- Evidence admissibility;
- cryptographic verification;
- Receipt schema;
- policy engine;
- authorization engine;
- Runtime;
- replay mechanics;
- legal evidentiary status;
- court admissibility;
- specific visual component library;
- numeric confidence calibration;
- final API response fields.

---

# 166. Drift Prohibitions

`ZyUX-004` SHALL NOT drift into:

- one green check for everything;
- Evidence = truth;
- uploaded = verified;
- Trust = authorization;
- Policy ALLOW = TRUSTED;
- authorized = executed;
- executed = occurred;
- Receipt = physical truth;
- unknown = false;
- unavailable = false;
- conflict = error;
- inference = observation;
- internal interpretation = Reality;
- decorative confidence percentages;
- raw Evidence dump as default UX;
- hiding uncertainty to reduce friction;
- proof access bypassing disclosure;
- AI summary treated as Evidence.

---

# 167. Ratification Questions

Before ratification, Council should disposition:

1. Final naming of Action / Reason / Basis / Proof levels.
2. Whether `Proof` is the correct public term or whether `Details` / `Receipt` should vary by archetype.
3. Exact Trust vocabulary projected to end users.
4. Whether Trust categories appear publicly or only as plain-language explanations.
5. Exact definition/display of verificationStatus.
6. Standard degradation-factor presentation.
7. Evidence disclosure classes.
8. Receipt disclosure classes.
9. Public Receipt minimum fields.
10. Whether source coverage should be shown publicly.
11. Numeric Trust prohibition or exception policy.
12. Historical explanation requirements.
13. Conflict-review UX.
14. Redaction presentation.
15. AI-generated explanation policy.
16. Proof-sharing model.
17. Accessibility baseline for status/explanation.
18. Localization semantics for uncertainty.
19. Aggregate explanation rules.
20. Whether explanation preferences are user-configurable.
21. Which explanations are mandatory before consequential action.
22. Which override details are mandatory.
23. Whether trust change notifications are required.
24. How policy versions are exposed.
25. How source authority is represented without overwhelming users.

---

# 168. Proposed Acceptance Invariants

A conforming implementation should eventually prove:

### AX-004-01 — Unknown Is Not False

Unknown states are never rendered as negative factual conclusions.

### AX-004-02 — Unavailable Is Not Absent

Unavailable source/data is not rendered as nonexistence.

### AX-004-03 — Evidence Presence Is Not Verification

Counts and labels remain semantically literal.

### AX-004-04 — Verification Is Scoped

Users can understand what was actually verified.

### AX-004-05 — Trust Is Distinct From Authorization

A trusted result does not create action permission.

### AX-004-06 — Policy Is Distinct From Trust

Policy ALLOW/HOLD/REVIEW is not mislabeled as Trust.

### AX-004-07 — Authorization Is Distinct From Execution

Approved actions may still be pending/failed.

### AX-004-08 — Execution Is Distinct From Physical Reality

Digital execution is not overclaimed as physical occurrence.

### AX-004-09 — Receipt Meaning Is Scoped

Receipt integrity cannot be mistaken for universal truth.

### AX-004-10 — Conflict Persists

Conflicting Evidence is not silently collapsed.

### AX-004-11 — Degradation Is Explainable

Material Trust degradation factors can be inspected.

### AX-004-12 — Historical Basis Is Preserved

Past actions explain using past Evidence/Policy/Authority state.

### AX-004-13 — Explanation Respects Scope

Proof drill-down never leaks unauthorized Evidence.

### AX-004-14 — Public Proof Is Bounded

Public users can understand basis without receiving protected internal data.

### AX-004-15 — Same Meaning Across Surfaces

UI/API/MCP/Host projections do not strengthen or weaken semantics.

### AX-004-16 — System Failure Is Not Epistemic State

Service outage is not rendered as `unverified/false`.

### AX-004-17 — AI Summary Is Labeled Interpretation

AI-generated explanation is never presented as raw Evidence.

### AX-004-18 — User Can Find Next Legitimate Action

Explanations connect to remediation/escalation where available.

### AX-004-19 — Color Does Not Carry Meaning Alone

Statuses remain understandable accessibly.

### AX-004-20 — Proof Theater Is Absent

No decorative badge/score implies unsupported certainty.

---

# 169. Canonical Journey Set for Future Prototyping

1. Public product identity verified.
2. Public product recall source unavailable.
3. Product has conflicting manufacturer Evidence.
4. Warranty active with verified source.
5. Warranty status unknown.
6. Shipment held due to expired Evidence.
7. Shipment held due to missing Authority.
8. Shipment approved but execution fails.
9. Shipment execution completes with Receipt.
10. Receipt integrity verifies.
11. Receipt does not prove physical delivery.
12. Trust degrades from Probable to Uncertain.
13. Trust unavailable because evaluator fails.
14. Evidence provided but unverified.
15. Evidence expires.
16. Evidence source corrects record.
17. Historical decision uses older Policy version.
18. Former employee's historical Authority reconstructed.
19. Override changes policy outcome.
20. Human review changes automated review state.
21. Conflict sent to Compliance.
22. Auditor opens full authorized proof.
23. Public observer sees bounded Evidence summary.
24. Restricted Evidence is redacted.
25. Host-Native surface shows concise reason.
26. API returns structured reason matching UI.
27. Agent receives machine-readable limitation.
28. AI summarizes Evidence with interpretation label.
29. Negative claim softened to connected-source scope.
30. User requests missing Evidence.
31. User requests access to restricted proof.
32. Source coverage shown at expert depth.
33. Historical/current views compared.
34. Aggregate dashboard drills into individual reasons.
35. Accessibility user understands Trust without color.
36. Localization preserves `Uncertain` semantics.
37. Notification surfaces reason without sensitive Evidence.
38. Deep proof link expires after access revocation.
39. Public Receipt share does not expose internal data.
40. User challenges result with new Evidence.

These are experience test cases, not implementation authorization.

---

# 170. Closing Doctrine

> **Zyppi should answer simply without pretending Reality is simpler than it is.**

> **Unknown is not false. Unavailable is not absent. Unverified is not verified. Conflict is not resolution.**

> **Evidence supports claims. It does not become truth merely by existing.**

> **Trust describes trustworthiness. Policy governs action. Authority determines legitimacy. Execution records action. These are not interchangeable.**

> **A Receipt proves the governed digital process it records. It does not magically prove every physical-world claim surrounding that process.**

> **Ordinary users should receive the answer and reason. Experts should be able to inspect the basis. Authorized auditors should be able to reconstruct the proof.**

> **Uncertainty is not a UX defect. Hidden uncertainty is.**

> **Proof should increase understanding, not decorate confidence.**

> **The deepest constitutional rigor should remain available without forcing every user to live inside it.**

---

# 171. Status & Next Step

**Current Status:** DRAFT — CHAIR REVIEW.

Recommended review sequence:

1. Chair review.
2. Trust-doctrine semantic audit.
3. Evidence terminology audit.
4. Receipt semantic audit.
5. Policy/Authority/Standing separation audit.
6. Security/privacy review of proof disclosure.
7. Prototype the 40 canonical journeys.
8. Public-user comprehension testing.
9. Compliance/auditor comprehension testing.
10. Accessibility and localization review.
11. Feed Host-Native explanation rules into `ZyUX-005`.
12. Feed historical/lifecycle explanation rules into `ZyUX-006`.
13. Apply to future `ZyUX-PUBLIC-OBSERVER-001`, `ZyUX-CUSTOMER-001`, `ZyUX-OPERATOR-001`, `ZyUX-COMPLIANCE-001`, and `ZyUX-AUDITOR-001`.
14. Ratification only after Trust/Evidence/Receipt terminology is reconciled with governing authorities.

---

**End of `ZyUX-004 v0.1 — DRAFT FOR CHAIR REVIEW`**

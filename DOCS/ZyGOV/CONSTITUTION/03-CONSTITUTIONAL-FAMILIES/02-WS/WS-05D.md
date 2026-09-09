# WS-05D — Population Validation & Tooling
---|---
---|---
Version: | 1.0 (Ratified)
 Status: | ✅ RATIFIED
 Document Type: | Constitutional Verifier Specification
 Prerequisites: | WS-05A — Master Registry Population Charter, WS-05B — Master Registry Population Plan, WS-05C — Cluster Admission Rules
 Successor: | WS-05E — Certification & Authorization

# 1. Purpose
WS-05D defines the independent constitutional validation system responsible for verifying that the populated Master Registry conforms completely to the ratified constitutional corpus.

WS-05D is not part of the compiler.

Its purpose is to independently reconstruct constitutional truth and verify the registry without trusting compiler outputs, execution state, runtime flags, or implementation assumptions.

# 2. Scope
## In Scope
- Independent constitutional validation
- Full registry validation
- Incremental validation
- Failure classification
- Atomic Batch verification
- Reporting standards
- Read-only audit tooling
- Certification input generation
## Out of Scope
- Registry population
- ZE allocation
- Automatic repair
- Schema normalization
- Lifecycle modification
- Runtime execution
- Admission logic definition

Those responsibilities belong exclusively to WS-05A through WS-05C.

# 3. Validation Philosophy
WS-05D operates as an independent constitutional auditor.

Validation reconstructs constitutional truth exclusively from:
- Ratified Constitutional Corpus
- Supersession Register (SR-001)
- Canonical Master Registry
- WS-05A Invariants
- WS-05C Admission Contracts

The validator SHALL NEVER trust:
- WS-05B compiler state
- compiler status flags
- compiler success markers
- runtime metadata
- inferred state

# 4. Constitutional Principles
## VP-001 — Independence
Validation SHALL reconstruct constitutional truth exclusively from canonical sources.

Compiler execution state SHALL NEVER be reused.

This protects against the Self-Trust Exploit.

## VP-002 — Determinism
Validation SHALL be completely reproducible.

Given identical constitutional corpus and registry state:
- identical findings
- identical ordering
- identical reports
must always be produced.

No heuristics.

No AI judgment.

No subjective interpretation.

## VP-003 — Read-Only Operation
Validation SHALL NEVER:
- mint ZE identifiers
- modify registry state
- repair references
- normalize schemas
- update lifecycle tracks
- rewrite objects

Validation is observational only.

## VP-004 — Complete Evaluation
Validation SHALL NEVER fail-fast.

Every reachable violation SHALL be evaluated and reported.

# 5. Validation Execution Modes
## 5.1 Full Validation
### Purpose:
Recompute the entire Master Registry against the complete constitutional corpus.
### Triggers:
- Initial population
- Constitutional amendment
- WS-05B re-execution
- Certification

## 5.2 Incremental Validation
### Purpose:
Validate only affected portions of the registry.

Incremental Validation SHALL be driven exclusively by independent cryptographic change detection.

Compiler-generated change flags SHALL NEVER be trusted.

# 6. Change Detection
Changed objects SHALL be identified by comparing:
```
- Current Registry SHA-256 Object Hashes
```
versus
```
- Last Validated Registry SHA-256 Object Hashes
```
Comparison SHALL occur entirely outside compiler state.

No timestamps.

No compiler metadata.

No implementation flags.

# 7. Dependency Traversal
After changed objects are identified:
Traversal SHALL proceed in the dependent direction.

Objects that reference the changed object SHALL be included recursively until closure.

Traversal SHALL reuse the constitutional infrastructure already defined by WS-05A INV-006.

Specifically:

**CL-17 Active Relationship Index SHALL be the exclusive traversal mechanism.**

No alternative dependency graph or traversal vocabulary SHALL be introduced.

# 8. Validation Categories
Validation findings SHALL be classified by Failure Category, never subjective severity.

## 8.1 Structural Validation
Checks:
- Schema
- Owner
- Prefix
- Identifier
- Mandatory fields

## 8.2 Relationship Validation
Checks:
- Reference integrity
- Predicate validity
- Pattern compliance
- Evidence requirements

## 8.3 Lifecycle Validation
Checks:
- Lifecycle Tracks
- Transition legality
- Authority constraints
- Independent state-machine rules

## 8.4 Constitutional Validation
Direct execution of WS-05A constitutional invariants.

Includes:
- AD rules
- INV rules
- completion criteria
- admission discipline

# 9. Atomic Batch Validation (INV-001)
Scenario | Validator Action
---|---
No Atomic Batch | PASS
Atomic Batch used | Verify justification artifact exists
Artifact exists with constitutional citations | PASS
Artifact missing | FAIL

The validator SHALL verify only:
artifact existence
constitutional citations
artifact format
The validator SHALL NOT judge whether the justification is constitutionally correct.
Such review remains a Council responsibility.

# 10. Remediation Model
Suggested Remediation SHALL NEVER be dynamically generated.

Each Rule ID SHALL own exactly one pre-authored remediation string.

Mapping:
````
Rule ID

↓

Static Remediation Text
````
Example:
````
INV-005

↓

Populate missing lifecycle tracks according to
WS-05A INV-005 before rerunning WS-05B.
````
No inference.

No generation.

No interpretation.

# 11. Reporting Model
Validation SHALL produce a Complete Failure Report.

Reports SHALL NEVER be presented as flat lists.

Findings SHALL be topologically sorted, grouping downstream dependency failures beneath their earliest causal root failure.

## Purpose:
> Engineers must be directed toward constitutional root causes rather than downstream symptoms.

# 12. INV-009 Independent Process Carve-Out
INV-009 governs canonical references for identical constitutional operations.

It does not prohibit independently justified processes deliberately designed to avoid shared state or execution logic where such independence is required for:
- correctness
- security
- constitutional verification

**Example:**

`WS-05B Population`

versus

`WS-05D Validation`

WS-05D intentionally reconstructs constitutional truth independently because a validator sharing compiler state cannot detect compiler defects.

Any document invoking this carve-out SHALL:
1. identify the existing process from which it diverges;
2. explain why shared state or vocabulary compromises the protected property;
3. provide a constitutional justification artifact.

# 13. Validation Output Schema
`object_id` — identifier of the validated Population Unit. SHALL be either a ZE-prefixed canonical entity identifier or a UUIDv7 Reified Relationship identifier, consistent with WS-05B §9's definition of a canonical registry object. The schema example below shows the ZE-prefixed case; the UUIDv7 case follows the same structure with object_id populated accordingly.
—
```json
{
  "validation_run": {
    "timestamp": "ISO-8601 UTC",
    "mode": "full | incremental",
    "registry_snapshot_hash": "SHA-256",
    "constitutional_corpus_hash": "SHA-256",
    "supersession_register_hash": "SHA-256"
  },
  "findings": [
    {
      "validation_id": "UUID",
      "failure_category": "STRUCTURAL | RELATIONAL | LIFECYCLE | CONSTITUTIONAL",
      "object_id": "ZE-XXX-XXXX",
      "rule_violated": "INV-005",
      "constitution_citation": "WS-05A §6 INV-005",
      "evidence": "Lifecycle track 'Authority' missing required valid_to field.",
      "static_remediation": "Populate missing lifecycle track per WS-05A INV-005 before rerunning WS-05B.",
      "dependency_root_id": "ZE-CL12-001",
      "sorted_order": 1
    }
  ]
}
```

# 14. Completion Criteria
WS-05D is complete when the Validation Engine demonstrates:
- ✓ independent reconstruction of constitutional truth
- ✓ deterministic execution
- ✓ read-only operation
- ✓ complete failure reporting
- ✓ SHA-256-based change detection
- ✓ dependent-direction traversal via CL-17 Active Relationship Index
- ✓ static remediation mapping
- ✓ Atomic Batch artifact verification
- ✓ direct execution of WS-05A constitutional invariants
- ✓ reproducible validation reports

# 15. Authorization
Ratification of WS-05D authorizes commencement of WS-05E — Certification & Authorization.

WS-05D does not authorize Master Registry population.

Population execution remains contingent upon:
- WS-05A ratification
- WS-05B ratification
- WS-05C ratification
- WS-05D ratification
- WS-05E final certification and authorization

# 16. Final Council Disposition
---|---
---|---
Status: | ✅ RATIFIED
Confidence: | Very High

The WS-05 series now defines four independent constitutional layers:

Workstream | Responsibility
---|---
WS-05A | Governance, Admission Discipline, Invariants
WS-05B | Deterministic Constitutional Compiler
WS-05C | Declarative Cluster Admission Contracts
WS-05D | Independent Constitutional Validation & Tooling

The validation engine is mathematically deterministic, architecturally independent, read-only by design, and constitutionally complete.

---|---
---|---
Next Workstream: | WS-05E — Certification & Authorization.

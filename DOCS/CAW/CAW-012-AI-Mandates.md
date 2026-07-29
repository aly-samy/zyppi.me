# CAW-012 — AI Mandates
**Version 1.0 · Status: ACTIVE · Uses: CEngS-003 mandate template — not restated here**

## Purpose
This is what an AI agent actually consumes to do one unit of work. It turns one `IT-xxxx` from CAW-011 into a concrete mandate. The structure comes from CEngS-003 §6 — this document supplies wedge-specific content, not a new format.

## What to Load for Any `IT-xxxx`
CAW-000 → CAW-005 (for milestone context) → this document → the specific CAW doc for the task's area (CAW-003 domain, CAW-006 API, CAW-007 runtime, CAW-008 registry, CAW-009 evidence, CAW-010 edge) → CEngS-000's table for the applicable engineering standards. Nothing more, by default (CEngS-003 §5).

## Worked Example 1 — `IT-0601` Implement GS1 Digital Link Parser

```
Objective:    Parse a GS1 Digital Link into a normalized request model.
Background:   First step of M06; feeds Identity resolution (CAW-005, CAW-003).
Scope:        packages/domain, packages/runtime, tests/runtime
Out of Scope: HTTP handling, database access — pure function only
Inputs:       Raw Digital Link string
Constraints:  No HTTP, no DB, pure function, canonical serialization supported
              (CEngS-001 §4)
Acceptance:   ✓ Valid GS1 links parsed (GTIN, Serial, Lot, Expiration)
              ✓ Invalid links rejected with typed error
              ✓ Typed result returned
Tests:        Unit, invalid-input, boundary, replay (CEngS-101)
Done when:    CI green, replay passes, docs updated, benchmark recorded,
              reviewed (CL-001)
Dependencies: IT-0302 (GS1 identifier model), IT-0501 (registry interfaces)
Complexity:   M
```

## Worked Example 2 — `IT-0803` Generate Execution Receipt

```
Objective:    Generate immutable constitutional execution receipts.
Scope:        packages/runtime
Fields:       Execution ID, Receipt ID, Input Hash, Output Hash, Evidence Hash,
              Policy Version, Runtime Version, Execution Budget, Execution
              Duration, Deterministic Hash (CAW-007)
Acceptance:   Same input → same receipt → same hash, 100% of executions
Tests:        10,000 replay executions, zero mismatches (CEngS-101 §2)
Done when:    Replay passes, receipt schema documented, CI green,
              performance baseline recorded
```

## Assignment Rule
An AI agent is never assigned a whole Milestone, package, or subsystem — one `IT-xxxx` only, per CEngS-003 §3. On completion: Review → Validation → Merge → next task (CEngS-102 §4–6). This is what keeps progress deterministic and architectural drift near zero — don't shortcut it even when a task looks trivial.

## When a Mandate Is Ambiguous
Stop and report, per CEngS-003 §5 — do not infer missing scope from the milestone description. If `IT-xxxx`'s CAW-011 one-liner isn't enough to build the mandate above, that's a signal this document needs a fuller worked example added, not that the agent should guess.

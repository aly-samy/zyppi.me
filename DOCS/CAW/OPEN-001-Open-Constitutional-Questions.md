# OPEN-001 — Open Constitutional Questions

**Version 1.0 · Status: ACTIVE (tracking doc — not constitutional law, not a CEngS/CAW document)**

## Purpose

Real architectural questions surfaced during design that don't block current milestones. Each is revisited only when the milestone that actually needs the answer begins — never speculatively. Do not let this list grow into a shadow constitution; if an item never gets revisited by the time its trigger milestone starts, that's a signal it wasn't actually load-bearing.

## Tracked Questions

| ID         | Question                                                                                                                                                                       | Raised By                                            | Trigger Milestone                                                                  | Status                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------- |
| OPEN-001-A | How does policy evaluation handle clock drift / ordering between edge and registry? Should temporal evaluation use cryptographic sequence number instead of wall-clock time?   | Council review                                       | M08 (Runtime Verification Pipeline)                                                | Open                                                    |
| OPEN-001-B | What is the cascading invalidation mechanism when a sponsoring Human/Organization's Standing is suspended mid-execution for a delegated AI Agent?                              | Council review                                       | Post-wedge (SEC-001 full implementation, not this wedge's minimal Authority scope) | Open — explicitly out of this wedge's scope per CAW-003 |
| OPEN-001-C | Execution Receipts risk unbounded growth at scale (full Resolution Graph per receipt). Should Merkle projections / cryptographic accumulators be used for historical receipts? | Council review                                       | M13 (Performance Baseline) if receipt storage growth becomes measurable            | Open                                                    |
| OPEN-001-D | What are the exact, numeric Go-migration trigger thresholds for `packages/runtime` (p99 latency, replay failure rate under load)?                                              | CEngS-103 §5 references this as needing hard numbers | M13 (Performance Baseline)                                                         | Open                                                    |
| OPEN-001-E | How should public `@zyppi/domain` schemas evolve and retain constitutional provenance? Specifically, what compatibility, succession, and historical-version rules apply to public domain exports, and should Runtime verification rely on package-build attestations, signed registry bundles, or another governed artifact? | Gemini council review during AMS-0202; refined by architectural review | M03 (Domain Model), before the first public domain entities or schemas are introduced | Open |

## Rule

Adding an item here requires: the question, who raised it, and which milestone will actually need the answer. No item may be added "just in case" — if you can't name a trigger milestone, it doesn't belong here yet.

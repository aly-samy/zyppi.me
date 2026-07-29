# CAW-014 — Release Plan

**Version 1.0 · Status: ACTIVE · Channels defined by CEngS-102 §9 — applied here to the wedge**

## Stages

| Stage          | Audience                                          | Gate to Enter                                         | Gate to Exit                                                                                                 |
| -------------- | ------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Alpha**      | Build team only                                   | M11 (Verified Product Experience) complete            | End-to-end flow works on ≥1 real product, no crashes on the happy path                                       |
| **Internal**   | Full Zyppi team / council                         | M12–M13 complete (replay + performance baselines)     | Determinism proven at scale, performance measured and acceptable                                             |
| **Pilot**      | 1 real external manufacturer/brand, real products | M14 (Compliance Review) complete                      | CAW-013's Validation Suite passes in full, including business and user validation with a real external party |
| **Production** | Public                                            | M15 (Wedge Completion) complete, CAW-001 §8 satisfied | Only after every gate above; this is also the gate for Phase 3 to begin                                      |

## Success Metrics (per stage)

- **Alpha:** flow completes without manual intervention, ≥1 successful real scan.
- **Internal:** 10,000/10,000 replay match rate; p99 latency measured and recorded.
- **Pilot:** external partner confirms the Verified Response is meaningful to them; zero unresolved Critical/High findings from CEngS-102 §6 severity classification.
- **Production:** sustained success rate on real traffic over an initial observation window (define the window and threshold before launch, not after — this is an explicit gap to close at the start of Pilot, not left implicit).

## Rollback

Follows CEngS-102 §10 exactly: single-command rollback, previous artifact available, schema-compatible, no rebuild required. For this wedge specifically: rolling back the API/Runtime never requires rolling back the Registry schema in lockstep — migrations for this phase are additive-only until Production, so a rollback never needs a down-migration under normal operation.

## What Happens After Production

Production release of the wedge is the trigger for Phase 3 planning (SDK, next wedge, or ecosystem work — per the original 5-phase roadmap). It is not automatically a trigger for scope expansion within this wedge — new capability requests get a new CAW series, not an amendment bolted onto this one.

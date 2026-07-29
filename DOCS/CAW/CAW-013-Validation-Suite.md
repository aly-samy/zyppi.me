# CAW-013 — Validation Suite

**Version 1.0 · Status: ACTIVE**

## Purpose

Unit/integration/replay testing is CEngS-101's job — it proves the code does what it claims. This document proves something different: **that the wedge actually validates what CAW-001 set out to validate.** These are the checks that answer "did we learn what we needed to learn," not "does the code pass."

## Business Validation

- Can one real manufacturer's real GS1-labeled product be scanned and verified, with no synthetic shortcuts?
- Does the Verified Response contain information a real consumer would actually trust more than an unverified product page? (Qualitative — ask actual people, don't assume.)
- Would a real brand look at the Execution Receipt and evidence chain and consider it meaningful evidence of authenticity?

## Developer Validation

- Can a new engineer (or a fresh AI agent session) pick up CAW-000 → CAW-005 → CAW-012 and correctly implement the next `IT-xxxx` without needing verbal clarification?
- Did any milestone require an undocumented assumption to complete? If so, that's a defect in this series, not a one-off — fix the document.
- Did the CEngS series actually reduce hallucination/drift during this build, or did agents still need out-of-band correction? Track this honestly.

## Performance Validation

Per CEngS-103: is the wedge's measured p99 latency within CAW-001 §7's target (< 300ms)? Is it measured continuously, not just once? Are there any components approaching a migration trigger (CEngS-103 §5)?

## User Validation

- Time-to-first-verified-scan for a first-time user: how long, how many steps?
- Does the response make sense without needing an explanation of Zyppi's architecture? (If a consumer needs to understand "constitutional runtime" to trust the result, the UX has failed regardless of backend correctness.)

## Exit Signal

The wedge is validated — not just "tests pass" — when: a real external product scans successfully end to end, at least one person outside the build team can explain what they saw without prompting, performance is measured and within target, and no undocumented assumption was required anywhere in the build. This is the actual gate for CAW-001 §8's Definition of Done — CEngS-101's green CI is necessary, not sufficient.

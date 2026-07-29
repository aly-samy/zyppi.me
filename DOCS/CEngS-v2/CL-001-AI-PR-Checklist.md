# CL-001 — AI Coding / PR Checklist

**One page. Run this immediately before opening a PR. Full rules: CEngS-102.**

- ☐ Mandate/Work Item followed exactly — no scope drift, no invented requirements
- ☐ `packages/runtime` stays pure — no HTTP, SQL/ORM, filesystem, cloud SDK, env vars, logging, randomness, or system time inside it
- ☐ No new dependency without documented justification
- ☐ Deterministic — no implicit entropy; canonical serialization intact
- ☐ Replay tests pass — identical inputs → identical outputs/hashes/receipts
- ☐ Layer boundaries respected, no circular dependencies
- ☐ Unit + integration + replay tests included and passing
- ☐ Benchmarks recorded where applicable, no unreviewed regression
- ☐ Security preserved — auth, input/output validation, no secrets in code
- ☐ Docs updated (package, API, migration notes if breaking)
- ☐ Constitutional references cited for any nontrivial decision
- ☐ No unresolved TODOs, no hidden assumptions
- ☐ CI green

If any box is unchecked, the PR is not ready — say so plainly rather than opening it anyway.

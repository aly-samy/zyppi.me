# CAW-000 — Navigation Index
**Version 1.0 · Status: ACTIVE · Commerce Atlas Wedge (Phase 2) Execution Series**

## Purpose
This is the entry point for the CAW series. It tells you what exists, in what order to read it, and what to load for the task in front of you. Load this first, always.

## What CAW Is
CAW is an execution specification, not a constitutional corpus. The Constitution (ZRM/POL/SEC/RI/WS) answers **what is true**. CEngS answers **how to engineer**. CAW answers **what to build next, in what order, to what contract**. Every CAW document is 2–5 pages, single-responsibility, and directly actionable — free of philosophy unless a decision genuinely requires it.

## Document Map

| Doc | Title | Answers |
|---|---|---|
| CAW-001 | Wedge Vision | Why are we building this, and what does "done" mean? |
| CAW-002 | System Architecture | What does the request path look like end to end? |
| CAW-003 | Domain Model | What are the entities in this slice? |
| CAW-004 | Repository Map | Where does code live? |
| CAW-005 | Milestone Roadmap | What are the milestones and their dependencies? |
| CAW-006 | API Contracts | What are the HTTP endpoints, requests, responses? |
| CAW-007 | Runtime Contracts | What does `@zyppi/runtime` take in and return? |
| CAW-008 | Registry Schema | What are the database tables? |
| CAW-009 | Evidence Model | How is evidence stored, hashed, retained? |
| CAW-010 | Edge Layer | What does the Cloudflare Worker do? |
| CAW-011 | Build Order | What's the literal task backlog, in order? |
| CAW-012 | AI Mandates | What does an AI agent read and do for a given task? |
| CAW-013 | Validation Suite | How do we know the wedge actually works (beyond unit tests)? |
| CAW-014 | Release Plan | How does this go from local to production? |

## Current Status
Phase 2 (Commerce Atlas Wedge) — Milestone M01 in progress. Update this line as milestones complete; do not let it drift from CAW-011's tracker.

## Loading Patterns
- **Implementing a feature:** CAW-000 → CAW-005 → CAW-012 → CEngS-000 (for the applicable CEngS docs)
- **Building an API:** CAW-000 → CAW-006 → CAW-007
- **Database work:** CAW-000 → CAW-008
- **Edge routing work:** CAW-000 → CAW-010
- **Planning the next block of work:** CAW-000 → CAW-011
- **Validating the wedge is actually done:** CAW-000 → CAW-013

## Relationship to CEngS
CAW never restates a CEngS rule. Where a CAW document needs an engineering rule (runtime purity, replay, review gates, testing pyramid), it cites the CEngS document instead of repeating it. If you find a rule duplicated between a CAW document and a CEngS document, that's a defect — report it, don't resolve it by picking one silently.

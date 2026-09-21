# CAW-001 — Wedge Vision

**Version 1.0 · Status: ACTIVE · Authority: North Star, Founding Principles, PRD, Tech Architecture Bible**

## 1. Objective

Prove — with one real, complete transaction — that the Zyppi constitutional stack works end to end. This is not "build Commerce Atlas." It is: **can one real GS1 Digital Link flow through Identity → Evidence → Policy → Runtime → Receipt → Response, successfully and deterministically?**

If yes, everything downstream (SDK, ecosystem, additional wedges) becomes credible. If no, we've learned that cheaply, before scaling the architecture further.

## 2. What Success Validates

Runtime architecture · Identity model · Evidence model · Policy execution · Trust evaluation · Execution receipts · Developer workflow · AI-assisted engineering workflow.

## 3. Success Criteria

A real GS1 QR code is scanned → the Digital Link resolves → the Cloudflare Worker and API receive the request → the Runtime evaluates it → evidence is verified → an Execution Receipt is generated → a deterministic, verified response is returned. The full flow completes successfully, and replaying identical input produces an identical receipt.

## 4. Primary User Story

As a consumer, I scan a GS1 Digital Link QR code and immediately receive a verified product response I can trust because it was constitutionally verified — not because a brand asserted it.

## 5. Primary Use Case

**UC-001 — Verify Product Identity.** Input: a GS1 Digital Link. Output: a Verified Product Response (product, brand, manufacturer, verification status, trust status, evidence links, receipt reference).

## 6. Out of Scope

Payments · authentication platform · multi-tenancy · ERP integrations · marketplace · inventory · analytics · notifications · AI automation · federation · SDK publication · mobile apps. Build only what one successful end-to-end verification flow requires — nothing that anticipates Phase 3+.

## 7. Non-Functional Targets

Response time < 300ms (target, not a hard gate) · Determinism 100% · Replay 100% · Auditability and Observability mandatory · Availability: development target only (not production SLA).

## 8. Definition of Done

The wedge is complete only when:

- One real GS1 Digital Link resolves successfully, end to end
- The Runtime is 100% deterministic and 100% replayable
- An Execution Receipt is generated for every execution
- CI passes, including the Constitutional Conformance Suite (CEngS-101)
- Documentation is current

Only then does Phase 2 close and Phase 3 planning begin. See CAW-013 for how each of these is actually validated, and CAW-014 for what happens after.

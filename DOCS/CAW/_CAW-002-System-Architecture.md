# CAW-002 — System Architecture

**Version 1.0 · Status: ACTIVE**

## The Request Path

```
Scanner (physical QR / NFC scan)
      ↓
GS1 Digital Link (raw URL)
      ↓
Cloudflare Worker            — edge routing/normalization only, no business logic (CAW-010)
      ↓
API Gateway                  — HTTP contract, validation (CAW-006)
      ↓
@zyppi/runtime                — pure, deterministic evaluation (CAW-007, CEngS-001 §4)
      ↓
Registry (PostgreSQL)         — Active Constitutional View, Identity (CAW-008)
      ↓
Evidence Store (Cloudflare R2) — evidence bundle, hashes (CAW-009)
      ↓
Execution Receipt             — immutable, deterministic artifact (CAW-007)
      ↓
Verified Response             — returned to the caller
```

## Ten-Step Flow

1. Scan QR
2. Cloudflare Worker receives request
3. Normalize Digital Link
4. Resolve Identity
5. Retrieve Active Constitutional View (ACV)
6. Retrieve Evidence
7. Execute Runtime
8. Evaluate Policies
9. Generate Execution Receipt
10. Return Verified Response

## Layer Responsibility (maps to CEngS-001 §3)

| Step | Layer       | Owns                                                              |
| ---- | ----------- | ----------------------------------------------------------------- |
| 2    | Gateway     | Routing, normalization, rate limiting                             |
| 3–4  | Application | Request coordination, identity lookup orchestration               |
| 5–9  | Runtime     | All constitutional truth-generation — policy, evidence, receipt   |
| —    | Persistence | Registry (Postgres), Evidence Store (R2) — no logic, storage only |

## Non-Negotiable Boundary

Every box above the Runtime line may change technology freely. The Runtime box may not leak into any other box, and no other box may generate constitutional truth on the Runtime's behalf. This is CEngS-001 §3–4 applied concretely to this wedge — see that document for the full rule, not restated here.

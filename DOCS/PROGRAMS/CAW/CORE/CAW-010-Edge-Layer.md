# CAW-010 — Edge Layer

**Version 1.0 · Status: ACTIVE · Package: `edge/worker` · Platform: Cloudflare Workers**

## Responsibility

The Worker does exactly four things and nothing else: receive the request, validate it superficially, forward it, return the response. **It contains no business logic and no constitutional logic** — it never calls `packages/runtime` directly (CAW-004).

## Flow

```
Incoming scan/request
      ↓
Validate request shape (well-formed URL, required params present)
      ↓
Forward to apps/api (GET /v1/resolve — CAW-006)
      ↓
Return response verbatim (pass-through, with edge caching where safe)
```

## Responsibilities in Detail

- **Routing** — map the incoming Digital Link request to the API endpoint.
- **Validation** — reject obviously malformed requests before they reach the API (cheap rejection, not business validation).
- **Caching** — cache successful responses at the edge where the response is safe to cache (verified, non-time-sensitive); never cache errors or unverified results.
- **Failure handling** — on API timeout/failure, return a clear, typed error (CAW-006 error table) — never fabricate a response, never silently retry into a different code path.

## What the Worker Never Does

Evaluate policy, verify evidence, generate receipts, hold any constitutional state (KV or otherwise), or make decisions about trust/verification. If a task looks like it needs "just a little logic" in the Worker, that logic belongs in the Runtime or Application layer instead — this boundary is deliberate (see the stack discussion that led to this architecture: Workers are edge-fast and read-mostly, not a place for correctness-critical state).

## Testing

Edge tests verify: routing correctness, request validation, pass-through fidelity, cache behavior, and failure-mode handling — per CEngS-101. No Runtime logic is tested here; that's CAW-007's concern.

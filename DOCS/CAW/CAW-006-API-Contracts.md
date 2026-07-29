# CAW-006 — API Contracts
**Version 1.0 · Status: ACTIVE · Package: `packages/contracts`, `apps/api`**

## Scope
Exactly one public endpoint for this wedge. No admin API, no write endpoints, no auth platform — see CAW-001 §6 Out of Scope.

## Endpoint

### `GET /v1/resolve`
Resolves a GS1 Digital Link to a Verified Product Response.

**Request**
```
GET /v1/resolve?link={url-encoded GS1 Digital Link}
Headers:
  X-Api-Key: <wedge dev key>   (minimal gate for this wedge only — not a security model)
```

**Response 200**
```json
{
  "product": { "gtin": "string", "name": "string" },
  "brand": { "id": "string", "name": "string" },
  "manufacturer": { "id": "string", "name": "string" },
  "verificationStatus": "verified | unverified | rejected",
  "trustStatus": "definite | probable | possible | uncertain | speculative",
  "evidenceLinks": ["string (evidence reference URIs)"],
  "receiptReference": "string (execution receipt ID)"
}
```
No internal implementation detail (Runtime internals, ACV structure, raw policy decisions) is ever exposed in this response — CAW-003/CAW-007 stay internal.

**Error Responses**
| Status | Code | Meaning |
|---|---|---|
| 400 | `INVALID_DIGITAL_LINK` | Link failed parsing/normalization |
| 404 | `IDENTITY_NOT_FOUND` | Link parsed but resolves to no known Identity |
| 409 | `VERIFICATION_FAILED` | Evidence or policy evaluation failed |
| 422 | `EVIDENCE_UNAVAILABLE` | Required evidence could not be retrieved |
| 500 | `RUNTIME_ERROR` | Unexpected Runtime failure — always includes Execution ID for traceability |

Every error body follows CEngS-001 §7 (Error Code, Reason, Execution Stage, Constitutional Reference, Recovery Guidance) — not redefined here.

## Versioning
Path-versioned (`/v1/...`). A breaking change to the response shape requires `/v2/...`, not a silent change to `/v1/...` — see CEngS-102 §9 (semantic versioning).

## Authentication
Minimal API-key gate for this wedge only. This is explicitly **not** SEC-001's full trust model — full authentication/authorization is out of scope per CAW-001 §6 and deferred to a later phase.

## Contract Testing
Every field above is covered by a contract test in `packages/testing`, run in CI per CEngS-102 §7. The OpenAPI spec generated from `packages/contracts` is the source of truth for this document — if they diverge, the spec wins and this document is stale and must be updated.

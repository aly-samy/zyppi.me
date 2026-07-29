# CAW-004 — Repository Map
**Version 1.0 · Status: ACTIVE**

## Workspace Layout
```
apps/
  api/            Fastify HTTP API — orchestrates requests, calls @zyppi/runtime
  web/             Next.js — renders the Verified Product page

packages/
  runtime/         @zyppi/runtime — pure, zero-I/O constitutional execution (CEngS-001 §4)
  domain/          Pure entities + validation (CAW-003) — zero infra dependency
  contracts/       Shared TypeScript types for API requests/responses (CAW-006), OpenAPI source
  shared/          Cross-cutting pure utilities (canonical serialization, hashing helpers)
  testing/         Shared test fixtures, replay harness

edge/
  worker/          Cloudflare Worker — routing/normalization only (CAW-010)

infra/             Infrastructure as code (CEngS-102 §10)
scripts/           Tooling, CEngS compliance checks
```

## Ownership & Import Rules
| Package | May import from | Must never import |
|---|---|---|
| `packages/runtime` | `packages/domain`, `packages/shared` | HTTP, DB, filesystem, cloud SDKs, `apps/*`, `edge/*` — enforced per CEngS-001 §4 / CEngS-002 §4 |
| `packages/domain` | nothing (leaf package) | any infra, any other package |
| `packages/contracts` | `packages/domain` | `packages/runtime` internals |
| `apps/api` | `packages/runtime`, `packages/domain`, `packages/contracts` | direct DB access bypassing a repository interface |
| `edge/worker` | `packages/contracts` (types only) | `packages/runtime` directly — Worker never touches the Runtime |

Circular imports across packages are prohibited and checked in CI (CEngS-102 §7 Stage 5).

## Technology Stack (wedge-scoped — see CAW-014 for how this may evolve)
Frontend: Next.js · Edge: Cloudflare Workers · API: Fastify · Runtime: `@zyppi/runtime` (TypeScript) · Database: PostgreSQL · Evidence: Cloudflare R2 · Cache: Redis · Language: TypeScript throughout for this wedge.

Language migration for any package follows CEngS-103 §5 (evidence-based triggers only) — not decided here.

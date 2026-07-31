# CAW-004 — Repository Map & Bootstrap

**Version 2.1 · Status: ACTIVE · Supersedes v1.0 (bootstrap details folded in per ratified decision: no CEngS-011 — one-time setup lives here, not in a permanent engineering standard)**

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

infra/             Infrastructure as code, Postgres schema/migrations (CAW-008), seed data
scripts/           CI validation, benchmark runners, conformance checks
.github/workflows/ CI pipelines (CEngS-102)
```

## Ownership & Import Rules

**Version 2.1 note:** this table was incomplete in v2.0 — `packages/shared`, `packages/testing`, and `apps/web` were never formally specified, only described narratively. Completed here from what was already established elsewhere in the corpus (AMS-0103's review) before AMS-0208 (dependency-graph enforcement) can be built against it. This is the authoritative version — if AMS-0208 or any other document conflicts with this table, this table wins; report the conflict rather than resolving it in code.

| Package              | May import from (production)                                | May import from (dev-only)                                                                                   | Must never import                                                                             |
| -------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `packages/domain`    | nothing (leaf package)                                      | nothing                                                                                                      | any infra, any other package                                                                  |
| `packages/shared`    | nothing (leaf package)                                      | nothing                                                                                                      | any infra, any other package                                                                  |
| `packages/contracts` | `packages/domain`                                           | —                                                                                                            | `packages/runtime` internals                                                                  |
| `packages/runtime`   | `packages/domain`, `packages/shared`                        | —                                                                                                            | HTTP, DB, filesystem, cloud SDKs, `apps/*`, `edge/*` — CEngS-001 §4 / CEngS-002 §4            |
| `packages/testing`   | nothing in production (it's dev-only tooling itself)        | `packages/domain`, `packages/contracts`, `packages/runtime`, `packages/shared` — for building typed fixtures | production code in any package (testing is never a runtime dependency of anything)            |
| `apps/api`           | `packages/runtime`, `packages/domain`, `packages/contracts` | `packages/testing`                                                                                           | direct DB access bypassing a repository interface                                             |
| `apps/web`           | `packages/contracts`, `packages/domain`, `packages/shared`  | `packages/testing`                                                                                           | `packages/runtime` directly — Presentation must not skip the Application layer (CEngS-001 §3) |
| `edge/worker`        | `packages/contracts` (types only)                           | —                                                                                                            | `packages/runtime` directly                                                                   |

**Authorization is not obligation.** A permitted edge above may remain unused until an implementation actually requires it — this table defines the *ceiling* of what's allowed, not a checklist of imports that must exist.

**Direct authorization is non-transitive.** `apps/api` may import `packages/domain` directly because the table says so — not because `packages/runtime` also imports `domain`. No package inherits import rights through another package's permissions.

**No cycles, ever**, regardless of whether the individual edges are each independently authorized.

Circular imports are prohibited and checked in CI.

## Bootstrap — One-Time Setup (IT-0101–IT-0108)

This is what "the repository comes into existence" means concretely. It runs once, at M01, not repeatedly — that's why it lives here as implementation content, not as a standing CEngS rule.

**Package manager:** pnpm workspaces. `pnpm-workspace.yaml` includes `apps/*`, `packages/*`, `edge/*`.

**Root `package.json` scripts:** `dev`, `build` (`pnpm -r build`), `test` (`pnpm -r test`), `test:replay`, `test:conformance`, `lint`, `format`, `bench`, `ci` (lint → build → test).

**TypeScript:** project references across all packages, strict mode on, TS 5.4+.

**Tooling:** ESLint + Prettier (repo-wide config), Vitest (unit/replay/CI configs per package).

**CI skeleton (`.github/workflows/`):** `ci.yml`, `replay.yml`, `conformance.yml`, `benchmarks.yml`, `release.yml` — scaffolded and green (even with zero tests) before any business logic is written.

**Runtime purity enforcement — mechanical, not conventional.** A CI script checks `packages/runtime/package.json` and blocks the build if it depends on: `http`, `express`, `fastify`, `pg`, `postgres`, `prisma`, `drizzle`, `typeorm`, `fs`, `path`, `os`, `net`, `tls`, `child_process`, `aws-sdk`, `@cloudflare/*`, `winston`, `pino`, `dotenv`, or any other I/O-bearing package. This exists from commit one — it is not added later once "there's something to protect."

## Repository Definition of Done (Bootstrap)

* `pnpm install`, `pnpm run build`, `pnpm run lint`, `pnpm run test` all succeed (zero tests passing is fine at this stage)
* `pnpm run ci` succeeds end to end
* Forbidden-import check passes for `packages/runtime`
* CI is green on `main`
* README documents the layout above

## Technology Stack

Frontend: Next.js · Edge: Cloudflare Workers · API: Fastify · Runtime: `@zyppi/runtime` (TypeScript) · Database: PostgreSQL · Evidence: Cloudflare R2 · Cache: Redis · Language: TypeScript throughout this wedge. Migration for any package follows CEngS-103 §5 (evidence-based triggers only) — not decided here.

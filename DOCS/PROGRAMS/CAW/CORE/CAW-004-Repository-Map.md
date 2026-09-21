# CAW-004 — Repository Map & Bootstrap

**Version 2.2 · Status: ACTIVE · Scope: CAW · Higher Repository Authority: CEngS-002 v2.1 · Supersedes CAW-004 v2.1 and earlier CAW-004 versions**

## 1. Authority Scope

CAW-004 defines the repository topology, ownership, and dependency ceilings of the Commerce Atlas Wedge.

It is a **CAW-scoped repository map**.

Platform-wide repository governance belongs to `CEngS-002`.

Therefore CAW-004 may:

- define CAW-owned workspace roles;
- define direct dependency ceilings for CAW-owned nodes;
- define CAW bootstrap requirements.

CAW-004 may not:

- create platform-wide repository law;
- grant dependency authority to peer programs such as ZII;
- treat repository presence as authority;
- override CEngS-001 or CEngS-002.

If CAW-004 conflicts with CEngS-002, CEngS-002 governs.

## 2. Workspace Layout

```text
apps/
  api/            Fastify HTTP API — orchestrates requests, calls @zyppi/runtime
  web/            Next.js — renders the Verified Product page

packages/
  runtime/        @zyppi/runtime — pure, zero-I/O constitutional execution (CEngS-001 §4)
  domain/         Pure entities + validation (CAW-003) — zero infra dependency
  contracts/      Shared TypeScript types for API requests/responses (CAW-006), OpenAPI source
  shared/         Cross-cutting pure utilities (canonical serialization, hashing helpers)
  testing/        Shared test fixtures, replay harness

edge/
  worker/         Cloudflare Worker — routing/normalization only (CAW-010)

infra/            CAW infrastructure location: infrastructure as code, PostgreSQL schema/migrations, seed data
scripts/          CI validation, benchmark runners, conformance checks
.github/workflows/ CI pipelines (CEngS-102)
```

This layout describes the CAW repository footprint.

The presence of `infra/`, `scripts/`, `.github/`, or any other repository location does not itself authorize workspace dependency edges.

## 3. CAW Ownership & Import Rules

The following table defines the direct dependency ceiling for the listed CAW-owned nodes.

Authorization is not obligation.

Direct authorization is non-transitive.

No cycles are permitted.

| Package              | May import from (production)                                | May import from (dev-only)                                                                                   | Must never import                                                                             |
| -------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `packages/domain`    | nothing (leaf package)                                      | nothing                                                                                                      | any infra, any other package                                                                  |
| `packages/shared`    | nothing (leaf package)                                      | nothing                                                                                                      | any infra, any other package                                                                  |
| `packages/contracts` | `packages/domain`                                           | —                                                                                                            | `packages/runtime` internals                                                                  |
| `packages/runtime`   | `packages/domain`, `packages/shared`                        | —                                                                                                            | HTTP, DB, filesystem, cloud SDKs, `apps/*`, `edge/*` — CEngS-001 §4 / CEngS-002               |
| `packages/testing`   | nothing in production (it is dev-only tooling itself)       | `packages/domain`, `packages/contracts`, `packages/runtime`, `packages/shared` — for building typed fixtures | production code in any package (testing is never a runtime dependency of anything)            |
| `apps/api`           | `packages/runtime`, `packages/domain`, `packages/contracts` | `packages/testing`                                                                                           | direct DB access bypassing a repository interface                                             |
| `apps/web`           | `packages/contracts`, `packages/domain`, `packages/shared`  | `packages/testing`                                                                                           | `packages/runtime` directly — Presentation must not skip the Application layer (CEngS-001 §3) |
| `edge/worker`        | `packages/contracts` (types only)                           | —                                                                                                            | `packages/runtime` directly                                                                   |

No dependency permission for `infra` is granted by this table.

Any current or future `infra → workspace` edge must have explicit lawful authority under CEngS-002 and the applicable program authority before it may be treated as authorized.

Historical implementation, validator configuration, or existing manifests do not create that authority.

## 4. Bootstrap — One-Time Setup

This section records the CAW bootstrap established at repository creation.

It is not a platform-wide template for future peer programs.

**Package manager:** pnpm workspaces.

**Root scripts:** repository build, test, lint, formatting, conformance, benchmark, and CI commands as established by implementation.

**TypeScript:** strict TypeScript project structure.

**Tooling:** ESLint, Prettier, Vitest and repository governance checks.

**Runtime purity:** mechanically enforced under CEngS-001, CEngS-002, and CEngS-102.

Future peer-program admission SHALL use current platform repository governance rather than copying CAW bootstrap assumptions as universal law.

## 5. Repository Definition of Done — CAW Bootstrap

The CAW bootstrap remains expected to support:

- installation;
- build;
- lint;
- tests;
- CI;
- Runtime purity enforcement;
- repository documentation.

These historical bootstrap outcomes do not themselves define admission requirements for future programs.

## 6. Technology Stack

CAW's current implementation stack includes:

Frontend: Next.js · Edge: Cloudflare Workers · API: Fastify · Runtime: `@zyppi/runtime` · Database: PostgreSQL · Evidence: Cloudflare R2 · Cache: Redis · Language: TypeScript.

Migration for any package follows applicable CEngS authority.

This technology stack is CAW-scoped and does not constrain peer programs unless separately authorized.

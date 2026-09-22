# AMS-0103 — Configure TypeScript Project References

**Implements: IT-0103 · Milestone: M01 · Size: S · Depends On: IT-0101/IT-0102 (both ☑) · Status: ☐ Planned**

## Load

CEngS-000, CEngS-001 (§4 — this sets up the config that will later enforce Runtime purity/strictness), CEngS-002, CAW-000, CAW-004.

## Objective

Configure TypeScript project references across the monorepo so every package builds against the others' declared public types only — not their source — and so build order is enforced by the compiler, not by convention.

## Background

This is the last piece of tooling scaffolding before packages get real content in M02/M03. Getting project references right now means `packages/runtime` importing something it shouldn't (CEngS-001 §4) fails to _compile_, not just fails a later lint pass.

## Scope

- Root `tsconfig.base.json` (strict mode on, target/module settings appropriate for Node + Workers compatibility)
- One `tsconfig.json` per package/app (`apps/api`, `apps/web`, `packages/runtime`, `packages/domain`, `packages/contracts`, `packages/shared`, `packages/testing`, `edge/worker`), each extending the base config and declaring `references` to only the packages it's actually allowed to depend on per CAW-004's ownership table
- Root-level composite build config so `tsc -b` builds the whole graph in correct dependency order

## Out of Scope

Any actual source code, ESLint rules (IT-0104), Vitest config (IT-0106). This task is compiler configuration only.

## Inputs

CAW-004 §Ownership & Import Rules (the reference graph must match this table exactly — e.g., `packages/runtime`'s `tsconfig.json` references only `packages/domain` and `packages/shared`, never `apps/*` or `edge/*`).

## Constraints

- Strict mode (`strict: true`) in the base config — not optional, not deferred to "later."
- Every package config sets `composite: true` (required for project references to work).
- No package's `tsconfig.json` may reference a package CAW-004's table forbids — this is the mechanism that makes the boundary compile-time, not just lint-time.

## Acceptance Criteria

- `tsc -b` from the repo root succeeds with zero errors (even with empty/placeholder source files)
- Attempting to add a forbidden reference (e.g., `packages/runtime` → `apps/api`) and running `tsc -b` fails — verify this once, then remove the test reference
- Build order matches the dependency graph (leaf packages like `domain` build first)

## Required Tests

None (no runtime code yet). The "forbidden reference fails to compile" check above is the test for this task, done manually once and not left in the repo.

## Definition of Done

- `tsc -b` succeeds root-wide
- Reference graph matches CAW-004 exactly, verified by the forbidden-reference check
- CI's build step (from IT-0107, once that exists) will be able to call this directly — don't design around a different build invocation

## Next

On completion, AMS-0104 (ESLint config) and AMS-0105 (Prettier config) may run in parallel — both depend only on IT-0102, not on each other or on this task strictly, though ESLint's TypeScript rules will be more useful with this config in place first.

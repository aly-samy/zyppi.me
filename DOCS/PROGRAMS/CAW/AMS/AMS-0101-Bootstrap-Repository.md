# AMS-0101 — Bootstrap Repository

**Implements: IT-0101 · Milestone: M01 · Size: S · Status: ☐ Planned**

## Load

CEngS-000, CEngS-001, CEngS-002, CAW-000, CAW-004. Nothing else.

## Objective

Initialize the monorepo skeleton exactly as specified in CAW-004 — directory layout, pnpm workspace, and root package manifest. No business logic, no runtime code, no feature code.

## Background

This is the first task of the first milestone. Every later task depends on this structure existing correctly. Getting the boundaries right here is cheaper than fixing them after packages accumulate imports across them.

## Scope

- Directory structure per CAW-004 §Workspace Layout (`apps/`, `packages/`, `edge/`, `infra/`, `scripts/`, `.github/workflows/`)
- `pnpm-workspace.yaml`
- Root `package.json` with scripts: `dev`, `build`, `test`, `test:replay`, `test:conformance`, `lint`, `format`, `bench`, `ci`
- `git init` and initial commit

## Out of Scope

Runtime implementation, domain models, API code, any package's internal source files beyond an empty scaffold, CI workflow _content_ (that's IT-0107/0108) — this task creates the shape, not the tooling behavior.

## Inputs

CAW-004 (full document — it is the specification for this task).

## Constraints

- No package may exist with content yet — empty `src/` directories with a placeholder are fine.
- `pnpm-workspace.yaml` includes exactly `apps/*`, `packages/*`, `edge/*`.
- Root `package.json` scripts must be present even if some (e.g. `test`) have nothing to run yet.

## Acceptance Criteria

- `pnpm install` succeeds with zero errors
- Directory structure matches CAW-004 exactly
- `git log` shows an initial commit containing this structure

## Required Tests

None yet (no code exists) — this task is infrastructure only. Do not write placeholder tests for the sake of having tests; CEngS-101 governs when tests are required, and there's nothing to test yet.

## Definition of Done

- Repository exists locally and (if applicable) remotely
- `pnpm install` succeeds
- Structure matches CAW-004
- Reviewed against CL-001 (the applicable subset — most items don't apply yet, that's expected for this task)

## Next

On completion, proceed to AMS-0102 (Configure pnpm workspaces) — do not start AMS-0103+ until AMS-0102 is merged, per its Depends On column in CAW-011.

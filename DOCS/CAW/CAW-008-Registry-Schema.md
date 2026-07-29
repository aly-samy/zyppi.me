# CAW-008 — Registry Schema

**Version 1.0 · Status: ACTIVE · Package: `packages/runtime` repository adapters (schema owned in `infra/`) · Storage: PostgreSQL**

## Scope

Tables required to serve one verification flow. No multi-tenant columns, no future-proofing columns not yet used — extend the schema when a milestone actually needs it, not before.

## Tables

**`identities`**
`id (pk, uuid)` · `identity_type` · `canonical_reference` (the Digital Link / GTIN it resolves from) · `referent_id (fk → referents)` · `status` (draft/active/decommissioned) · `created_at` · `updated_at`

**`referents`**
`id (pk, uuid)` · `referent_type` (product/brand/manufacturer) · `name` · `parent_referent_id (fk, nullable)` — used for Product → Brand → Manufacturer relations · `created_at`

**`evidence`**
`id (pk, uuid)` · `identity_id (fk)` · `evidence_type` · `hash` · `storage_ref` (R2 object key, see CAW-009) · `retrieved_at` · `immutable: true` (enforced at application level, never updated after insert)

**`policies`**
`id (pk, uuid)` · `policy_type` · `version` · `definition (jsonb)` · `active: boolean`

**`authorities`** / **`capabilities`** / **`standings`** _(minimal wedge scope — enough rows to satisfy policy evaluation for the demo dataset, not a full authority engine)_
`id (pk, uuid)` · `subject_id` · `scope` · `valid_from` · `valid_to`

**`execution_receipts`**
`id (pk, uuid)` · `execution_id` · `runtime_version` · `input_hash` · `output_hash` · `evidence_hash` · `policy_version` · `decision_summary (jsonb)` · `execution_time_ms` · `deterministic_hash` · `created_at` — **append-only, never updated or deleted**

## Constraints

- Foreign keys enforced at the database level, not just application level.
- `execution_receipts` and `evidence` are insert-only tables — no `UPDATE`/`DELETE` grants for the application role. This is not optional; it's how CEngS-001 §4's replay/immutability guarantee is actually enforced at the storage layer.
- Every table has `created_at`; mutable tables (`identities`, `policies`) also have `updated_at`.

## Migrations

Versioned, reviewed, tested, reversible where possible, immutable once merged — per CEngS-102 §10. Seed data for the wedge demo dataset lives in `infra/seed/` and is not production data.

## What This Schema Is Not

It is not the full Reality Graph, not the 17-cluster registry, not a general-purpose entity store. It's the minimum persistence needed to answer one question: does this Identity resolve, and is it verifiable? Broader registry work is out of this wedge's scope (CAW-001 §6).

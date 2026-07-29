# CAW-009 — Evidence Model

**Version 1.0 · Status: ACTIVE · Storage: Cloudflare R2 + `evidence` table (CAW-008)**

## What Evidence Contains (this wedge)

Product identity data · manufacturer data · brand data · verification metadata · cryptographic hashes · evidence references. Evidence is immutable once written — never edited, only superseded by a new evidence record.

## Storage Split

| What                                                                         | Where                                     |
| ---------------------------------------------------------------------------- | ----------------------------------------- |
| Hash, type, timestamp, pointer to blob                                       | `evidence` table (Postgres) — fast lookup |
| The actual evidence payload (documents, certificates, raw verification data) | Cloudflare R2 — content-addressed by hash |

The database never stores the blob itself — only its hash and R2 key. This keeps the registry small and keeps evidence retrieval a simple, cacheable fetch.

## R2 Key Layout

```
evidence/{identity_id}/{evidence_type}/{hash}.json
```

Deterministic and content-addressed: the same evidence content always produces the same key. Re-uploading identical evidence is a no-op, not a duplicate.

## Hashing

Evidence payloads are canonically serialized (RI-001) before hashing — same rule as everywhere else in the constitutional stack, not a wedge-specific exception. The resulting hash is what the Execution Receipt's `evidenceHash` field references (CAW-007).

## Retention

Evidence is retained indefinitely for this wedge (small, controlled demo dataset). Production retention policy is out of scope here — see CEngS-104 §8 when this wedge graduates toward production data volumes.

## Verification Flow (as consumed by the Runtime)

1. Runtime requests evidence by Identity ID (via the Application layer — the Runtime itself never talks to R2 directly, per CEngS-001 §4).
2. Application layer resolves the evidence record(s) from Postgres, fetches the blob from R2, and assembles the `EvidenceBundle` passed into `ExecutionRequest` (CAW-007).
3. Runtime verifies the hash matches and evaluates evidence validity as part of policy evaluation — it never fetches, never re-derives, only verifies what it's given.

## Out of Scope

Multi-party evidence attestation, evidence revocation workflows, cross-organization evidence federation. These are real future constructs (see SEC-001 Asset Class D) but not exercised here.

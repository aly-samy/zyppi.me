/**
 * PostgreSQL Registry Row representations as they exist in the database.
 * These are completely decoupled from pure Domain records.
 */

export interface IdentityRow {
  readonly id: string; // UUID
  readonly identity_type: string;
  readonly canonical_reference: string;
  readonly referent_id: string | null; // UUID or null
  readonly status: string;
  readonly created_at: Date;
  readonly updated_at: Date;
}

export interface ReferentRow {
  readonly id: string; // UUID
  readonly referent_type: string;
  readonly name: string;
  readonly parent_referent_id: string | null; // UUID or null
  readonly created_at: Date;
}

export interface EvidenceRow {
  readonly id: string; // UUID
  readonly identity_id: string; // UUID
  readonly evidence_type: string;
  readonly hash: string;
  readonly storage_ref: string;
  readonly retrieved_at: Date;
  readonly created_at: Date;
}

export interface PolicyRow {
  readonly id: string; // UUID
  readonly policy_type: string;
  readonly version: string;
  readonly definition: unknown; // JSONB
  readonly active: boolean;
  readonly created_at: Date;
  readonly updated_at: Date;
}

export interface AuthorityRow {
  readonly id: string; // UUID
  readonly subject_id: string;
  readonly scope: string;
  readonly valid_from: Date;
  readonly valid_to: Date;
  readonly created_at: Date;
}

export interface CapabilityRow {
  readonly id: string; // UUID
  readonly subject_id: string;
  readonly scope: string;
  readonly valid_from: Date;
  readonly valid_to: Date;
  readonly created_at: Date;
}

export interface StandingRow {
  readonly id: string; // UUID
  readonly subject_id: string;
  readonly scope: string;
  readonly valid_from: Date;
  readonly valid_to: Date;
  readonly created_at: Date;
}

export interface ExecutionReceiptRow {
  readonly id: string; // UUID
  readonly execution_id: string;
  readonly runtime_version: string;
  readonly input_hash: string;
  readonly output_hash: string;
  readonly evidence_hash: string;
  readonly policy_version: string;
  readonly decision_summary: unknown; // JSONB
  readonly execution_time_ms: string; // BIGINT as string in postgres.js
  readonly deterministic_hash: string;
  readonly created_at: Date;
}

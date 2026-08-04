import {
  validateIdentityRecord,
  validateReferentRecord,
  validateEvidenceRecord,
  validatePolicyRecord,
  validateStandingRecord,
  validateCapabilityRecord,
  validateAuthorityRecord,
  type IdentityRecord,
  type ReferentRecord,
  type EvidenceRecord,
  type PolicyRecord,
  type StandingRecord,
  type CapabilityRecord,
  type AuthorityRecord,
} from "@zyppi/domain";
import type {
  IdentityRow,
  ReferentRow,
  EvidenceRow,
  PolicyRow,
  StandingRow,
  CapabilityRow,
  AuthorityRow,
} from "./rows.js";

/**
 * Custom error thrown during row mapping/validation to represent corrupted state.
 */
export class MappingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MappingError";
  }
}

/**
 * Safely converts a Date or string to a valid ISO-8601 UTC string.
 */
function toUtcIsoString(val: Date | string | null | undefined): string {
  if (val instanceof Date) {
    return val.toISOString();
  }
  if (typeof val === "string") {
    return val;
  }
  throw new MappingError("Expected Date or string for timestamp");
}

/**
 * Maps an IdentityRow to a validated Domain IdentityRecord.
 */
export function mapIdentityRow(row: IdentityRow): IdentityRecord {
  if (!row) {
    throw new MappingError("IdentityRow is null or undefined");
  }

  const rawMapped = {
    identityId: row.id,
    identityType: row.identity_type,
    canonicalReference: row.canonical_reference,
    referentId: row.referent_id,
    status: row.status,
    createdAt: toUtcIsoString(row.created_at),
    updatedAt: toUtcIsoString(row.updated_at),
  };

  const validation = validateIdentityRecord(rawMapped);
  if (!validation.ok) {
    throw new MappingError(
      `Identity validation failed: ${validation.error.message}`,
    );
  }

  return validation.value;
}

/**
 * Maps a ReferentRow to a validated Domain ReferentRecord.
 */
export function mapReferentRow(row: ReferentRow): ReferentRecord {
  if (!row) {
    throw new MappingError("ReferentRow is null or undefined");
  }

  const rawMapped = {
    referentId: row.id,
    referentType: row.referent_type,
    name: row.name,
    parentReferentId: row.parent_referent_id,
    createdAt: toUtcIsoString(row.created_at),
  };

  const validation = validateReferentRecord(rawMapped);
  if (!validation.ok) {
    throw new MappingError(
      `Referent validation failed: ${validation.error.message}`,
    );
  }

  return validation.value;
}

/**
 * Maps an EvidenceRow to a validated Domain EvidenceRecord.
 */
export function mapEvidenceRow(row: EvidenceRow): EvidenceRecord {
  if (!row) {
    throw new MappingError("EvidenceRow is null or undefined");
  }

  const rawMapped = {
    evidenceId: row.id,
    identityId: row.identity_id,
    evidenceType: row.evidence_type,
    hash: row.hash,
    storageRef: row.storage_ref,
    retrievedAt: toUtcIsoString(row.retrieved_at),
  };

  const validation = validateEvidenceRecord(rawMapped);
  if (!validation.ok) {
    throw new MappingError(
      `Evidence validation failed: ${validation.error.message}`,
    );
  }

  return validation.value;
}

/**
 * Maps a PolicyRow to a validated Domain PolicyRecord.
 */
export function mapPolicyRow(row: PolicyRow): PolicyRecord {
  if (!row) {
    throw new MappingError("PolicyRow is null or undefined");
  }

  const rawMapped = {
    policyId: row.id,
    policyType: row.policy_type,
    version: row.version,
    definition: row.definition,
    active: row.active,
  };

  const validation = validatePolicyRecord(rawMapped);
  if (!validation.ok) {
    throw new MappingError(
      `Policy validation failed: ${validation.error.message}`,
    );
  }

  return validation.value;
}

/**
 * Maps a StandingRow to a validated Domain StandingRecord.
 */
export function mapStandingRow(row: StandingRow): StandingRecord {
  if (!row) {
    throw new MappingError("StandingRow is null or undefined");
  }

  const rawMapped = {
    standingId: row.id,
    subjectId: row.subject_id,
    scope: row.scope,
    validFrom: toUtcIsoString(row.valid_from),
    validTo: toUtcIsoString(row.valid_to),
  };

  const validation = validateStandingRecord(rawMapped);
  if (!validation.ok) {
    throw new MappingError(
      `Standing validation failed: ${validation.error.message}`,
    );
  }

  return validation.value;
}

/**
 * Maps a CapabilityRow to a validated Domain CapabilityRecord.
 */
export function mapCapabilityRow(row: CapabilityRow): CapabilityRecord {
  if (!row) {
    throw new MappingError("CapabilityRow is null or undefined");
  }

  const rawMapped = {
    capabilityId: row.id,
    subjectId: row.subject_id,
    scope: row.scope,
    validFrom: toUtcIsoString(row.valid_from),
    validTo: toUtcIsoString(row.valid_to),
  };

  const validation = validateCapabilityRecord(rawMapped);
  if (!validation.ok) {
    throw new MappingError(
      `Capability validation failed: ${validation.error.message}`,
    );
  }

  return validation.value;
}

/**
 * Maps an AuthorityRow to a validated Domain AuthorityRecord.
 */
export function mapAuthorityRow(row: AuthorityRow): AuthorityRecord {
  if (!row) {
    throw new MappingError("AuthorityRow is null or undefined");
  }

  const rawMapped = {
    authorityId: row.id,
    subjectId: row.subject_id,
    scope: row.scope,
    validFrom: toUtcIsoString(row.valid_from),
    validTo: toUtcIsoString(row.valid_to),
  };

  const validation = validateAuthorityRecord(rawMapped);
  if (!validation.ok) {
    throw new MappingError(
      `Authority validation failed: ${validation.error.message}`,
    );
  }

  return validation.value;
}

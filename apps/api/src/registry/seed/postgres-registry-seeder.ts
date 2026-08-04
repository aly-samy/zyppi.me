import postgres from "postgres";
import {
  areRegistryRecordsEquivalent,
  getRegistryRecordIdentity,
  getRecordVariantType,
  type RegistryRecord,
} from "@zyppi/domain";
import {
  mapReferentRow,
  mapIdentityRow,
  mapEvidenceRow,
  mapPolicyRow,
  mapAuthorityRow,
  mapCapabilityRow,
  mapStandingRow,
} from "../mappers.js";
import type {
  ReferentRow,
  IdentityRow,
  EvidenceRow,
  PolicyRow,
  AuthorityRow,
  CapabilityRow,
  StandingRow,
} from "../rows.js";
import type { SeedManifest } from "./seed-manifest.js";
import type { SeedExecutionOutcome } from "./seed-outcomes.js";

/**
 * Checks if a specific record exists in the database and classifies its state.
 */
async function inspectRecordState(
  sql: postgres.Sql | postgres.TransactionSql,
  record: RegistryRecord,
): Promise<"absent" | "equivalent" | "diverged" | "corrupted"> {
  const recordId = getRegistryRecordIdentity(record);
  const variant = getRecordVariantType(record);

  try {
    let row: unknown = null;

    switch (variant) {
      case "referent": {
        const rows = await sql`SELECT * FROM referents WHERE id = ${recordId}`;
        if (rows.length === 0) return "absent";
        row = rows[0];
        const dbRecord = mapReferentRow(row as ReferentRow);
        return areRegistryRecordsEquivalent(record, dbRecord)
          ? "equivalent"
          : "diverged";
      }
      case "identity": {
        const rows = await sql`SELECT * FROM identities WHERE id = ${recordId}`;
        if (rows.length === 0) return "absent";
        row = rows[0];
        const dbRecord = mapIdentityRow(row as IdentityRow);
        return areRegistryRecordsEquivalent(record, dbRecord)
          ? "equivalent"
          : "diverged";
      }
      case "evidence": {
        const rows = await sql`SELECT * FROM evidence WHERE id = ${recordId}`;
        if (rows.length === 0) return "absent";
        row = rows[0];
        const dbRecord = mapEvidenceRow(row as EvidenceRow);
        return areRegistryRecordsEquivalent(record, dbRecord)
          ? "equivalent"
          : "diverged";
      }
      case "policy": {
        const rows = await sql`SELECT * FROM policies WHERE id = ${recordId}`;
        if (rows.length === 0) return "absent";
        row = rows[0];
        const dbRecord = mapPolicyRow(row as PolicyRow);
        return areRegistryRecordsEquivalent(record, dbRecord)
          ? "equivalent"
          : "diverged";
      }
      case "authority": {
        const rows =
          await sql`SELECT * FROM authorities WHERE id = ${recordId}`;
        if (rows.length === 0) return "absent";
        row = rows[0];
        const dbRecord = mapAuthorityRow(row as AuthorityRow);
        return areRegistryRecordsEquivalent(record, dbRecord)
          ? "equivalent"
          : "diverged";
      }
      case "capability": {
        const rows =
          await sql`SELECT * FROM capabilities WHERE id = ${recordId}`;
        if (rows.length === 0) return "absent";
        row = rows[0];
        const dbRecord = mapCapabilityRow(row as CapabilityRow);
        return areRegistryRecordsEquivalent(record, dbRecord)
          ? "equivalent"
          : "diverged";
      }
      case "standing": {
        const rows = await sql`SELECT * FROM standings WHERE id = ${recordId}`;
        if (rows.length === 0) return "absent";
        row = rows[0];
        const dbRecord = mapStandingRow(row as StandingRow);
        return areRegistryRecordsEquivalent(record, dbRecord)
          ? "equivalent"
          : "diverged";
      }
      default:
        return "diverged";
    }
  } catch {
    // If a row fails to map/validate, treat as corrupted (which maps to InfrastructureFailure)
    return "corrupted";
  }
}

/**
 * Executes the transactional seed operations (classification + materialization)
 * within a single SERIALIZABLE, timeout-bounded PostgreSQL transaction.
 */
export async function executeSeedTransaction(
  sql: postgres.Sql,
  manifest: SeedManifest,
): Promise<SeedExecutionOutcome> {
  const manifestId = manifest.manifestId;

  // Flatten all declared records in the manifest for verification and classification
  const declaredRecords: RegistryRecord[] = [
    ...manifest.records.referents,
    ...manifest.records.identities,
    ...manifest.records.evidence,
    ...manifest.records.policies,
    ...manifest.records.authorities,
    ...manifest.records.capabilities,
    ...manifest.records.standings,
  ];

  const totalDeclaredCount = declaredRecords.length;

  try {
    let outcome: SeedExecutionOutcome | null = null;

    // Execute everything inside a single PostgreSQL transaction
    await sql.begin(async (tx) => {
      // 1. Enforce read-write serializable transaction isolation
      await tx`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;`;

      // 2. Enforce transaction timeout of 30,000 ms at database level
      await tx`SET LOCAL statement_timeout = 30000;`;

      // 3. Inspect and classify state
      let presentCount = 0;
      let absentCount = 0;
      let divergedCount = 0;
      let corruptedCount = 0;

      for (const record of declaredRecords) {
        const state = await inspectRecordState(tx, record);
        if (state === "equivalent") {
          presentCount++;
        } else if (state === "diverged") {
          divergedCount++;
        } else if (state === "corrupted") {
          corruptedCount++;
        } else {
          absentCount++;
        }
      }

      // Precedence: Diverged -> PartialStateAnomaly -> AlreadyMaterialized -> Empty
      if (corruptedCount > 0) {
        throw new Error(
          "DataCorruption: Stored row failed Domain mapping or validation",
        );
      }

      if (divergedCount > 0) {
        outcome = {
          kind: "StateDiverged",
          manifestId,
          reasonCode: "DIVERGENT_RECORDS_PRESENT",
        };
        return; // Complete transaction without writes
      }

      if (presentCount > 0 && absentCount > 0) {
        outcome = {
          kind: "PartialStateAnomaly",
          manifestId,
          presentRecordCount: presentCount,
          absentRecordCount: absentCount,
        };
        return; // Complete transaction without writes
      }

      if (presentCount === totalDeclaredCount) {
        outcome = {
          kind: "AlreadyMaterialized",
          manifestId,
          materializedRecordCount: totalDeclaredCount,
        };
        return; // Complete transaction without writes
      }

      // 4. State is empty. Materialize manifest records in the required dependency order:
      // referents -> identities -> evidence -> policies -> authorities -> capabilities -> standings
      for (const r of manifest.records.referents) {
        await tx`
          INSERT INTO referents (id, referent_type, name, parent_referent_id)
          VALUES (${r.referentId}, ${r.referentType}, ${r.name}, ${r.parentReferentId})
        `;
      }

      for (const i of manifest.records.identities) {
        await tx`
          INSERT INTO identities (id, identity_type, canonical_reference, referent_id, status)
          VALUES (${i.identityId}, ${i.identityType}, ${i.canonicalReference}, ${i.referentId}, ${i.status})
        `;
      }

      for (const ev of manifest.records.evidence) {
        await tx`
          INSERT INTO evidence (id, identity_id, evidence_type, hash, storage_ref, retrieved_at)
          VALUES (${ev.evidenceId}, ${ev.identityId}, ${ev.evidenceType}, ${ev.hash}, ${ev.storageRef}, ${ev.retrievedAt})
        `;
      }

      for (const p of manifest.records.policies) {
        await tx`
          INSERT INTO policies (id, policy_type, version, definition, active)
          VALUES (${p.policyId}, ${p.policyType}, ${p.version}, ${tx.json(p.definition)}, ${p.active})
        `;
      }

      for (const a of manifest.records.authorities) {
        await tx`
          INSERT INTO authorities (id, subject_id, scope, valid_from, valid_to)
          VALUES (${a.authorityId}, ${a.subjectId}, ${a.scope}, ${a.validFrom}, ${a.validTo})
        `;
      }

      for (const c of manifest.records.capabilities) {
        await tx`
          INSERT INTO capabilities (id, subject_id, scope, valid_from, valid_to)
          VALUES (${c.capabilityId}, ${c.subjectId}, ${c.scope}, ${c.validFrom}, ${c.validTo})
        `;
      }

      for (const s of manifest.records.standings) {
        await tx`
          INSERT INTO standings (id, subject_id, scope, valid_from, valid_to)
          VALUES (${s.standingId}, ${s.subjectId}, ${s.scope}, ${s.validFrom}, ${s.validTo})
        `;
      }

      outcome = {
        kind: "Success",
        manifestId,
        materializedRecordCount: totalDeclaredCount,
      };
    });

    return (
      outcome || {
        kind: "InfrastructureFailure",
        reasonCode: "TRANSACTION_COMPLETED_WITHOUT_OUTCOME",
      }
    );
  } catch (err: unknown) {
    const error = err as { readonly code?: string; readonly message?: string };
    const msg = error.message || "";
    // Check if error is related to mapping/corruption
    if (msg.startsWith("DataCorruption")) {
      return {
        kind: "InfrastructureFailure",
        reasonCode: "DATA_CORRUPTION",
      };
    }
    // PostgreSQL statement timeout (SQLSTATE 57014) or other infrastructure issues
    const code = error.code || "UNKNOWN_ERROR";
    let reasonCode = "DATABASE_TRANSACTION_FAILED";
    if (
      code === "57014" ||
      msg.toLowerCase().includes("timeout") ||
      msg.toLowerCase().includes("canceled")
    ) {
      reasonCode = "TRANSACTION_TIMEOUT";
    } else if (code === "40001" || code === "40P01") {
      reasonCode = "SERIALIZATION_FAILURE";
    }

    return {
      kind: "InfrastructureFailure",
      reasonCode,
    };
  }
}

import postgres from "postgres";
import type {
  RegistryRepository,
  RegistryResult,
  RetrievedRegistryState,
  ValidatedCanonicalIdentifier,
} from "@zyppi/contracts";
import type { EvidenceRecord } from "@zyppi/domain";
import { translateError } from "./errors.js";
import {
  mapIdentityRow,
  mapReferentRow,
  mapEvidenceRow,
  mapPolicyRow,
  mapStandingRow,
  mapCapabilityRow,
  mapAuthorityRow,
} from "./mappers.js";
import type {
  IdentityRow,
  ReferentRow,
  EvidenceRow,
  PolicyRow,
  StandingRow,
  CapabilityRow,
  AuthorityRow,
} from "./rows.js";

export class PostgresRegistryRepository implements RegistryRepository {
  private readonly sql: postgres.Sql;
  private readonly testHook?: () => Promise<void>;

  constructor(sql: postgres.Sql, testHook?: () => Promise<void>) {
    if (!sql) {
      throw new Error("Postgres SQL client is required");
    }
    this.sql = sql;
    this.testHook = testHook;
  }

  async lookup(
    identifier: ValidatedCanonicalIdentifier,
  ): Promise<RegistryResult<RetrievedRegistryState | null>> {
    try {
      // Execute the entire retrieval and assembly inside one read-only REPEATABLE READ transaction.
      const result = await this.sql.begin(async (tx) => {
        // Enforce explicit read-only repeatable read snapshot consistency
        await tx`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY`;

        // 1. Fetch IdentityRow by canonical_reference
        const identityRows = await tx<IdentityRow[]>`
          SELECT id, identity_type, canonical_reference, referent_id, status, created_at, updated_at
          FROM identities
          WHERE canonical_reference = ${identifier}
        `;

        if (identityRows.length === 0) {
          return null;
        }

        const identityRow = identityRows[0];
        const identityRecord = mapIdentityRow(identityRow);
        const identityId = identityRecord.identityId;
        const referentId = identityRecord.referentId;

        // Deterministic test-only hook execution for snapshot timing coordination
        if (this.testHook) {
          await this.testHook();
        }

        // 2. Fetch ReferentRows (relationships) recursively if referentId is present
        let relationships: ReferentRow[] = [];
        if (referentId) {
          relationships = await tx<ReferentRow[]>`
            WITH RECURSIVE ancestor_referents AS (
              SELECT id, referent_type, name, parent_referent_id, created_at
              FROM referents
              WHERE id = ${referentId}
              UNION ALL
              SELECT r.id, r.referent_type, r.name, r.parent_referent_id, r.created_at
              FROM referents r
              INNER JOIN ancestor_referents ar ON r.id = ar.parent_referent_id
            )
            SELECT id, referent_type, name, parent_referent_id, created_at
            FROM ancestor_referents
          `;
        }

        // 3. Fetch EvidenceRows
        const evidenceRows = await tx<EvidenceRow[]>`
          SELECT id, identity_id, evidence_type, hash, storage_ref, retrieved_at, created_at
          FROM evidence
          WHERE identity_id = ${identityId}
        `;

        // 4. Fetch Active PolicyRows
        const policyRows = await tx<PolicyRow[]>`
          SELECT id, policy_type, version, definition, active, created_at, updated_at
          FROM policies
          WHERE active = true
        `;

        // 5. Fetch StandingRows (matched strictly on subject_id = identity.identityId)
        const standingRows = await tx<StandingRow[]>`
          SELECT id, subject_id, scope, valid_from, valid_to, created_at
          FROM standings
          WHERE subject_id = ${identityId}
        `;

        // 6. Fetch CapabilityRows (matched strictly on subject_id = identity.identityId)
        const capabilityRows = await tx<CapabilityRow[]>`
          SELECT id, subject_id, scope, valid_from, valid_to, created_at
          FROM capabilities
          WHERE subject_id = ${identityId}
        `;

        // 7. Fetch AuthorityRows (matched strictly on subject_id = identity.identityId)
        const authorityRows = await tx<AuthorityRow[]>`
          SELECT id, subject_id, scope, valid_from, valid_to, created_at
          FROM authorities
          WHERE subject_id = ${identityId}
        `;

        // Map database row models directly to validated Domain records
        const relationshipsMapped = relationships.map(mapReferentRow);
        const evidenceReferencesMapped = evidenceRows.map(mapEvidenceRow);
        const applicablePoliciesMapped = policyRows.map(mapPolicyRow);
        const standingsMapped = standingRows.map(mapStandingRow);
        const capabilitiesMapped = capabilityRows.map(mapCapabilityRow);
        const authoritiesMapped = authorityRows.map(mapAuthorityRow);

        const state: RetrievedRegistryState = {
          identity: identityRecord,
          relationships: relationshipsMapped,
          standings: standingsMapped,
          authorities: authoritiesMapped,
          capabilities: capabilitiesMapped,
          evidenceReferences: evidenceReferencesMapped,
          applicablePolicies: applicablePoliciesMapped,
        };

        return state;
      });

      return { ok: true, value: result };
    } catch (err) {
      return { ok: false, error: translateError(err) };
    }
  }

  async lookupEvidenceByIds(
    evidenceIds: readonly string[],
  ): Promise<RegistryResult<readonly EvidenceRecord[]>> {
    try {
      if (evidenceIds.length === 0) {
        return { ok: true, value: [] };
      }

      // Filter to only include valid UUID strings defensively
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validIds = evidenceIds.filter((id) => uuidRegex.test(id));

      if (validIds.length === 0) {
        return { ok: true, value: [] };
      }

      const result = await this.sql.begin(async (tx) => {
        // Enforce explicit read-only repeatable read snapshot consistency
        await tx`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY`;

        const evidenceRows = await tx<EvidenceRow[]>`
          SELECT id, identity_id, evidence_type, hash, storage_ref, retrieved_at, created_at
          FROM evidence
          WHERE id = ANY(${validIds})
        `;

        return evidenceRows.map(mapEvidenceRow);
      });

      return { ok: true, value: result };
    } catch (err) {
      return { ok: false, error: translateError(err) };
    }
  }
}

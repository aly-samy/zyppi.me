import {
  type ActiveConstitutionalView,
  type AuthorityRecord,
  type CapabilityRecord,
  type IdentityRecord,
  type PolicyRecord,
  type ReferentRecord,
  type StandingRecord,
} from "./index.js";
import { canonicalizeJcs } from "./seed-helpers.js";
import { cleanForJcs, computeSha256 } from "./receiptHash.js";

/**
 * Domain V1 ActiveConstitutionalView State Projection contract.
 * Strictly allowlists only state-bearing constitutional fields, explicitly excluding evidenceReferences.
 */
export interface AcvStateProjectionV1 {
  readonly identity: IdentityRecord;
  readonly relationships: readonly ReferentRecord[];
  readonly standings: readonly StandingRecord[];
  readonly authorities: readonly AuthorityRecord[];
  readonly capabilities: readonly CapabilityRecord[];
  readonly applicablePolicies: readonly PolicyRecord[];
}

/**
 * Stable sorting helper for set-like top-level ACV collections.
 * Does not mutate the input collection.
 */
function sortCollection<T>(
  items: readonly T[],
  getPrimaryCoordinate: (item: T) => string,
  getSecondaryCoordinate?: (item: T) => string,
): readonly T[] {
  return [...items].sort((a, b) => {
    const kA1 = getPrimaryCoordinate(a);
    const kB1 = getPrimaryCoordinate(b);
    if (kA1 < kB1) return -1;
    if (kA1 > kB1) return 1;

    if (getSecondaryCoordinate) {
      const kA2 = getSecondaryCoordinate(a);
      const kB2 = getSecondaryCoordinate(b);
      if (kA2 < kB2) return -1;
      if (kA2 > kB2) return 1;
    }

    const jcsA = canonicalizeJcs(cleanForJcs(a));
    const jcsB = canonicalizeJcs(cleanForJcs(b));
    if (jcsA < jcsB) return -1;
    if (jcsA > jcsB) return 1;
    return 0;
  });
}

/**
 * Projects a valid ActiveConstitutionalView into its normalized V1 state projection.
 *
 * Rules:
 * - Uses strict allowlist: identity, relationships, standings, authorities, capabilities, applicablePolicies.
 * - Explicitly excludes evidenceReferences.
 * - Deterministically normalizes set-like top-level collections using stable coordinate sorting.
 * - Preserves original ACV immutability (does not mutate supplied ACV).
 */
export function projectActiveConstitutionalViewState(
  acv: ActiveConstitutionalView,
): AcvStateProjectionV1 {
  const relationships = sortCollection(
    acv.relationships ?? [],
    (r: ReferentRecord) => r.referentId,
  );

  const standings = sortCollection(
    acv.standings ?? [],
    (s: StandingRecord) => s.standingId,
  );

  const authorities = sortCollection(
    acv.authorities ?? [],
    (a: AuthorityRecord) => a.authorityId,
  );

  const capabilities = sortCollection(
    acv.capabilities ?? [],
    (c: CapabilityRecord) => c.capabilityId,
  );

  const applicablePolicies = sortCollection(
    acv.applicablePolicies ?? [],
    (p: PolicyRecord) => p.policyId,
    (p: PolicyRecord) => p.version,
  );

  return {
    identity: acv.identity,
    relationships,
    standings,
    authorities,
    capabilities,
    applicablePolicies,
  };
}

/**
 * Derives the exact deterministic V1 ACV State Reference digest string.
 *
 * Domain separator: "zyppi:domain:acv_state:v1:"
 * Result grammar: "sha256:<64 lowercase hex>"
 */
export function deriveActiveConstitutionalViewStateDigest(
  acv: ActiveConstitutionalView,
): string {
  const projection = projectActiveConstitutionalViewState(acv);
  const cleaned = cleanForJcs(projection);
  const canonical = canonicalizeJcs(cleaned);
  return computeSha256("zyppi:domain:acv_state:v1:" + canonical);
}

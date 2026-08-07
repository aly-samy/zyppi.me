import type {
  IdentityRecord,
  ReferentRecord,
  StandingRecord,
  AuthorityRecord,
  CapabilityRecord,
  EvidenceRecord,
  PolicyRecord,
  ExecutionReceipt,
} from "@zyppi/domain";

// 1. ValidatedCanonicalIdentifier
declare const validatedCanonicalIdentifierBrand: unique symbol;

export type ValidatedCanonicalIdentifier = string & {
  readonly [validatedCanonicalIdentifierBrand]: true;
};

// RegistryResult Type
export type RegistryResult<T, E = RegistryError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

// RegistryError Taxonomy
export type RegistryError =
  | { readonly kind: "InfrastructureUnavailable" }
  | { readonly kind: "DataCorruption" }
  | { readonly kind: "OperationFailed" };

/**
 * Constructs a ValidatedCanonicalIdentifier.
 * Performs narrow boundary validation:
 * - Reject non-string, empty, or whitespace-only inputs.
 * - Does not trim, normalize, transform, or infer identifier families.
 * Returns a RegistryResult with either the branded ValidatedCanonicalIdentifier or a string error.
 */
export function createValidatedCanonicalIdentifier(
  raw: string,
): RegistryResult<ValidatedCanonicalIdentifier, string> {
  if (typeof raw !== "string") {
    return { ok: false, error: "Input must be a string" };
  }
  if (raw.trim() === "") {
    return { ok: false, error: "Input cannot be empty or whitespace-only" };
  }
  return { ok: true, value: raw as ValidatedCanonicalIdentifier };
}

// 2. RetrievedRegistryState
export interface RetrievedRegistryState {
  readonly identity: IdentityRecord;
  readonly relationships: readonly ReferentRecord[];
  readonly standings: readonly StandingRecord[];
  readonly authorities: readonly AuthorityRecord[];
  readonly capabilities: readonly CapabilityRecord[];
  readonly evidenceReferences: readonly EvidenceRecord[];
  readonly applicablePolicies: readonly PolicyRecord[];
}

// 5. PersistenceAcknowledgement
export type PersistenceAcknowledgement = Record<string, never>;

// 6. Repository Interfaces
export interface RegistryRepository {
  lookup(
    identifier: ValidatedCanonicalIdentifier,
  ): Promise<RegistryResult<RetrievedRegistryState | null>>;

  lookupEvidenceByIds(
    evidenceIds: readonly string[],
  ): Promise<RegistryResult<readonly EvidenceRecord[]>>;
}

export interface ReceiptRepository {
  save(
    receipt: ExecutionReceipt,
  ): Promise<RegistryResult<PersistenceAcknowledgement>>;
}

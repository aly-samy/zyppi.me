import type { ValidationResult, EvidenceBundle } from "@zyppi/domain";

export type EvidenceResolutionErrorCode =
  | "REFERENCE_NOT_FOUND"
  | "DUPLICATE_REFERENCE"
  | "INVALID_EVIDENCE_METADATA"
  | "RESOLVER_FAILURE";

export interface EvidenceResolutionError {
  readonly code: EvidenceResolutionErrorCode;
  readonly message: string;
}

export interface EvidenceReferenceResolver {
  resolve(
    evidenceIds: readonly string[],
  ): Promise<ValidationResult<EvidenceBundle, EvidenceResolutionError>>;
}

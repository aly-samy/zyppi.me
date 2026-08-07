import {
  validateEvidenceBundle,
  type EvidenceBundle,
  type ValidationResult,
  type EvidenceRecord,
} from "@zyppi/domain";
import type {
  EvidenceReferenceResolver,
  EvidenceResolutionError,
  RegistryRepository,
} from "@zyppi/contracts";

export class RegistryEvidenceResolver implements EvidenceReferenceResolver {
  private readonly repository: RegistryRepository;

  constructor(repository: RegistryRepository) {
    if (!repository) {
      throw new Error("RegistryRepository is required");
    }
    this.repository = repository;
  }

  async resolve(
    evidenceIds: readonly string[],
  ): Promise<ValidationResult<EvidenceBundle, EvidenceResolutionError>> {
    // 1. Input format and null checks
    if (!evidenceIds || !Array.isArray(evidenceIds)) {
      return {
        ok: false,
        error: {
          code: "RESOLVER_FAILURE",
          message: "Input is not a valid list of evidence identifiers.",
        },
      };
    }

    // 2. Check for Duplicate References and non-string values
    const seen = new Set<string>();
    for (const id of evidenceIds) {
      if (typeof id !== "string") {
        return {
          ok: false,
          error: {
            code: "RESOLVER_FAILURE",
            message: "All evidence identifiers must be strings.",
          },
        };
      }
      if (seen.has(id)) {
        return {
          ok: false,
          error: {
            code: "DUPLICATE_REFERENCE",
            message: `Duplicate evidence reference detected in input: ${id}`,
          },
        };
      }
      seen.add(id);
    }

    // Handle empty input explicitly
    if (evidenceIds.length === 0) {
      const emptyBundle: EvidenceBundle = {
        schemaVersion: "1.0",
        evidenceRecords: [],
      };
      Object.freeze(emptyBundle.evidenceRecords);
      Object.freeze(emptyBundle);
      return {
        ok: true,
        value: emptyBundle,
      };
    }

    // 3. Batch lookup from Registry Repository
    let lookupResult;
    try {
      lookupResult = await this.repository.lookupEvidenceByIds(evidenceIds);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        error: {
          code: "RESOLVER_FAILURE",
          message: `Unexpected repository failure during batch lookup: ${msg}`,
        },
      };
    }

    if (!lookupResult.ok) {
      return {
        ok: false,
        error: {
          code: "RESOLVER_FAILURE",
          message: `Registry lookup failed. Original error: ${JSON.stringify(lookupResult.error)}`,
        },
      };
    }

    const retrievedRecords = lookupResult.value;

    // 4. REFERENCE_NOT_FOUND validation (Atomic Fail-Fast)
    const retrievedMap = new Map<string, EvidenceRecord>();
    for (const rec of retrievedRecords) {
      retrievedMap.set(rec.evidenceId, rec);
    }

    for (const id of evidenceIds) {
      if (!retrievedMap.has(id)) {
        return {
          ok: false,
          error: {
            code: "REFERENCE_NOT_FOUND",
            message: `Evidence reference not found: ${id}`,
          },
        };
      }
    }

    // 5. Construct and Validate EvidenceBundle using Domain's validateEvidenceBundle()
    const bundleInput = {
      schemaVersion: "1.0",
      evidenceRecords: retrievedRecords,
    };

    const validationResult = validateEvidenceBundle(bundleInput);
    if (!validationResult.ok) {
      return {
        ok: false,
        error: {
          code: "INVALID_EVIDENCE_METADATA",
          message: `Evidence metadata validation failed: ${validationResult.error.message}`,
        },
      };
    }

    // 6. Deep Immutability Freezing
    const bundle = validationResult.value;
    bundle.evidenceRecords.forEach(Object.freeze);
    Object.freeze(bundle.evidenceRecords);
    Object.freeze(bundle);

    return {
      ok: true,
      value: bundle,
    };
  }
}

export {
  type ValidatedCanonicalIdentifier,
  createValidatedCanonicalIdentifier,
  type RetrievedRegistryState,
  type RegistryResult,
  type RegistryError,
  type PersistenceAcknowledgement,
  type RegistryRepository,
  type ReceiptRepository,
} from "./registry.js";

export {
  type GS1ResolutionErrorCode,
  type GS1ResolutionError,
  type ResolvedGs1DigitalLink,
  resolveGs1DigitalLink,
} from "./gs1Resolver.js";

export {
  type EvidenceResolutionErrorCode,
  type EvidenceResolutionError,
  type EvidenceReferenceResolver,
} from "./evidenceResolver.js";

export {
  type ObjectStorageClient,
  type PayloadProviderError,
  type PayloadProviderResult,
  type EvidencePayloadProvider,
} from "./evidencePayloadProvider.js";

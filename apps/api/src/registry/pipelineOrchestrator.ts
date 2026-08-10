import { runInternalPipeline } from "@zyppi/runtime/dist/pipeline.js";
import type {
  PipelineResult,
  StageOverrideConfig,
} from "@zyppi/runtime/dist/types.js";
import type {
  RegistryRepository,
  ValidatedCanonicalIdentifier,
  EvidenceReferenceResolver,
  EvidencePayloadProvider,
  ObjectStorageClient,
} from "@zyppi/contracts";
import {
  type ActiveConstitutionalView,
  type EvidenceBundle,
  type PolicyContext,
  type ExecutionRequest,
  verifyEvidenceBundle,
} from "@zyppi/domain";
import { RegistryEvidenceResolver } from "./evidenceResolver.js";
import { ObjectStorageEvidencePayloadProvider } from "../evidence/objectStorageEvidencePayloadProvider.js";

export type OrchestratorResult =
  | { readonly ok: true; readonly pipelineResult: PipelineResult }
  | { readonly ok: false; readonly error: string };

/**
 * Application-layer composition boundary (Orchestrator) for IT-0801 and IT-0802.
 * Fetches RetrievedRegistryState from RegistryRepository, maps it directly to ActiveConstitutionalView,
 * constructs the explicit ExecutionRequest, and runs the Runtime pipeline.
 * Optionally resolves references and loads evidence payloads using the M07 Evidence Engine.
 */
export async function composeAndRunPipeline(options: {
  readonly registryRepository: RegistryRepository;
  readonly identifier: ValidatedCanonicalIdentifier;
  readonly requestId: string;
  readonly executionId: string;
  readonly constitutionalTimestamp: string;
  readonly budget: number;
  readonly entropy: string;
  readonly versions: readonly string[];
  readonly evidenceBundle?: EvidenceBundle;
  readonly policyContext: PolicyContext;
  readonly overrides?: StageOverrideConfig;
  readonly evidenceResolver?: EvidenceReferenceResolver;
  readonly evidencePayloadProvider?: EvidencePayloadProvider;
  readonly objectStorageClient?: ObjectStorageClient;
  readonly evidencePayloads?: ReadonlyMap<string, unknown>;
}): Promise<OrchestratorResult> {
  const {
    registryRepository,
    identifier,
    requestId,
    executionId,
    constitutionalTimestamp,
    budget,
    entropy,
    versions,
    evidenceBundle: explicitEvidenceBundle,
    policyContext,
    overrides,
    evidenceResolver,
    evidencePayloadProvider,
    objectStorageClient,
    evidencePayloads: explicitEvidencePayloads,
  } = options;

  const lookupResult = await registryRepository.lookup(identifier);
  if (!lookupResult.ok) {
    return {
      ok: false,
      error: `Registry repository lookup failed: ${JSON.stringify(lookupResult.error)}`,
    };
  }

  const retrievedState = lookupResult.value;
  if (!retrievedState) {
    return {
      ok: false,
      error: "Registry state not found for the supplied identifier",
    };
  }

  // Direct assignment mapping of RetrievedRegistryState to ActiveConstitutionalView
  const activeConstitutionalView: ActiveConstitutionalView = {
    identity: retrievedState.identity,
    relationships: retrievedState.relationships,
    standings: retrievedState.standings,
    authorities: retrievedState.authorities,
    capabilities: retrievedState.capabilities,
    evidenceReferences: retrievedState.evidenceReferences,
    applicablePolicies: retrievedState.applicablePolicies,
  };

  // Determine the active EvidenceBundle and evidence payloads
  let evidenceBundle: EvidenceBundle;
  let evidencePayloads: ReadonlyMap<string, unknown> | undefined =
    explicitEvidencePayloads;

  if (explicitEvidenceBundle) {
    evidenceBundle = explicitEvidenceBundle;
  } else {
    // Perform dynamic M07 -> M08 evidence loading flow
    const evidenceIds = retrievedState.evidenceReferences.map(
      (r) => r.evidenceId,
    );

    // 1. Resolve references using EvidenceReferenceResolver
    const resolver =
      evidenceResolver ?? new RegistryEvidenceResolver(registryRepository);
    const resolveResult = await resolver.resolve(evidenceIds);
    if (!resolveResult.ok) {
      return {
        ok: false,
        error: `Evidence reference resolution failed: ${resolveResult.error.message}`,
      };
    }

    evidenceBundle = resolveResult.value;

    // 2. Load payloads using EvidencePayloadProvider
    if (evidenceBundle.evidenceRecords.length > 0) {
      const provider =
        evidencePayloadProvider ??
        (objectStorageClient
          ? new ObjectStorageEvidencePayloadProvider(objectStorageClient)
          : null);

      if (!provider) {
        return {
          ok: false,
          error:
            "EvidencePayloadProvider or ObjectStorageClient is required to load evidence payloads",
        };
      }

      const payloadResult = await provider.loadPayloads(evidenceBundle);
      if (!payloadResult.ok) {
        const err = payloadResult.error;
        let errMsg = "Payload loading failed";
        if (err.kind === "STORAGE_FAILURE") {
          errMsg = `Storage client failure: ${err.cause}`;
        } else if (err.kind === "PAYLOAD_NOT_FOUND") {
          errMsg = `Payload not found for evidence ID: ${err.evidenceId}`;
        } else if (err.kind === "INVALID_PAYLOAD") {
          errMsg = `Invalid payload for evidence ID ${err.evidenceId}: ${err.reason}`;
        }
        return {
          ok: false,
          error: errMsg,
        };
      }

      evidencePayloads = payloadResult.value;
    } else {
      evidencePayloads = new Map();
    }

    // 3. Application-layer preflight verification (fails fast)
    const appReport = verifyEvidenceBundle(
      evidenceBundle,
      evidencePayloads || new Map(),
    );
    if (!appReport.isValid) {
      const failedRecord = appReport.records.find((r) => !r.valid);
      return {
        ok: false,
        error: `Application preflight verification failed: ${failedRecord?.errorCode ?? appReport.errorCode ?? "invalid bundle"}`,
      };
    }
  }

  // Construct explicit ExecutionRequest using G-0808 / G-0814 compliant executionContext fields
  const executionRequest: ExecutionRequest = {
    requestId,
    identity: retrievedState.identity,
    activeConstitutionalView,
    evidenceBundle,
    policyContext,
    executionContext: {
      executionId,
      constitutionalTimestamp,
      budget,
      entropy,
      versions,
    },
  };

  // Invoke the pure, zero-I/O Runtime pipeline with explicitly transported evidence payloads
  const pipelineResult = runInternalPipeline(
    executionRequest,
    overrides,
    evidencePayloads,
  );

  return {
    ok: true,
    pipelineResult,
  };
}

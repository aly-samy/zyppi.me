import { runInternalPipeline } from "@zyppi/runtime/dist/pipeline.js";
import type {
  PipelineResult,
  StageOverrideConfig,
} from "@zyppi/runtime/dist/types.js";
import type {
  RegistryRepository,
  ValidatedCanonicalIdentifier,
} from "@zyppi/contracts";
import {
  type ActiveConstitutionalView,
  type EvidenceBundle,
  type PolicyContext,
  type ExecutionRequest,
} from "@zyppi/domain";

export type OrchestratorResult =
  | { readonly ok: true; readonly pipelineResult: PipelineResult }
  | { readonly ok: false; readonly error: string };

/**
 * Application-layer composition boundary (Orchestrator) for IT-0801.
 * Fetches RetrievedRegistryState from RegistryRepository, maps it directly to ActiveConstitutionalView,
 * constructs the explicit ExecutionRequest, and runs the Runtime pipeline.
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
  readonly evidenceBundle: EvidenceBundle;
  readonly policyContext: PolicyContext;
  readonly overrides?: StageOverrideConfig;
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
    evidenceBundle,
    policyContext,
    overrides,
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

  // Invoke the pure, zero-I/O Runtime pipeline
  const pipelineResult = runInternalPipeline(executionRequest, overrides);

  return {
    ok: true,
    pipelineResult,
  };
}

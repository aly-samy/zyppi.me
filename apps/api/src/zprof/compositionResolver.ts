import { runInternalPipeline } from "@zyppi/runtime/dist/pipeline.js";
import type {
  PipelineResult,
  StageOverrideConfig,
} from "@zyppi/runtime/dist/types.js";
import type {
  RegistryRepository,
  RetrievedRegistryState,
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
  type ResolvedPolicyGraph,
  verifyEvidenceBundle,
} from "@zyppi/domain";
import { RegistryEvidenceResolver } from "../registry/evidenceResolver.js";
import { ObjectStorageEvidencePayloadProvider } from "../evidence/objectStorageEvidencePayloadProvider.js";
import type {
  DomainTemplateCard,
  EpistemicRequirementContract,
  CompositionManifest,
  BoundConstitutionalPayload,
  CompositionResolutionResult,
  CompositionError,
  GenericCompositionOptions,
  Cl16IntelligenceReference,
  AttRProofReference,
} from "./types.js";
import { GS1_DOMAIN_TEMPLATE_CARD } from "./fixtures/gs1Dtc.js";
import {
  GS1_GTIN_EPISTEMIC_REQUIREMENT,
  GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
} from "./fixtures/gs1EpistemicRequirements.js";
import { validateCompositionCompatibility } from "./compatibilityValidator.js";
import { evaluateConflict } from "./conflict.js";
import {
  validateExplicitVersionList,
  validateVersionConstraints,
} from "./versionValidator.js";
import { deriveSccIdentityInternal } from "./scc.js";
import { buildBoundConfigurationGraph } from "./bcg.js";

export interface GS1CompositionOptions {
  readonly registryRepository: RegistryRepository;
  readonly identifier: ValidatedCanonicalIdentifier;
  readonly requestId: string;
  readonly executionId: string;
  readonly constitutionalTimestamp: string;
  readonly budget: number;
  readonly entropy: string;
  readonly versions: readonly string[];
  readonly policyContext: PolicyContext;
  readonly resolvedPolicyGraph: ResolvedPolicyGraph;
  readonly dtcFixture?: DomainTemplateCard;
  readonly epistemicRequirementsFixtures?: readonly EpistemicRequirementContract[];
  readonly explicitAcv?: ActiveConstitutionalView;
  readonly explicitEvidenceBundle?: EvidenceBundle;
  readonly explicitEvidencePayloads?: ReadonlyMap<string, unknown>;
  readonly explicitCl16Artifacts?: readonly Cl16IntelligenceReference[];
  readonly overrides?: StageOverrideConfig;
  readonly evidenceResolver?: EvidenceReferenceResolver;
  readonly evidencePayloadProvider?: EvidencePayloadProvider;
  readonly objectStorageClient?: ObjectStorageClient;
  readonly explicitConflictInputs?: import("./conflict.js").ConflictEvaluationInputs;
}

export type ApplicationCompositionBridgeResult =
  | {
      readonly ok: true;
      readonly manifest: CompositionManifest;
      readonly boundPayload: BoundConstitutionalPayload;
      readonly pipelineResult: PipelineResult;
      readonly sccId?: string;
      readonly bcgId?: string;
      readonly bcg?: import("./bcg.js").BoundConfigurationGraph;
    }
  | {
      readonly ok: false;
      readonly error: CompositionError;
      readonly epistemicStatus?:
        "UNKNOWN" | "UNAVAILABLE" | "UNVERIFIED" | "CONFLICTING";
    };

/**
 * Domain-Agnostic Application Composition Resolver (AMS-0853 / AMS-0854).
 *
 * Owned strictly by the Application layer.
 * Connects Z-PROF static domain declarations (GS1, DPP, etc.) to existing Application
 * resolution and Runtime substrate without branching on domain identifiers or
 * multiplying constitutional organs.
 */
export class ApplicationCompositionResolver {
  /**
   * Resolves structural composition and validates inputs against static DTC & Epistemic Requirements.
   * Consumes existing Registry and Evidence mechanisms read-only.
   * Preserves epistemic uncertainty without coercing states into false or inventing fallback facts.
   */
  public async resolveComposition(
    options: GenericCompositionOptions | GS1CompositionOptions,
  ): Promise<CompositionResolutionResult> {
    const dtc = options.dtcFixture ?? GS1_DOMAIN_TEMPLATE_CARD;
    const reqs = options.epistemicRequirementsFixtures ?? [
      GS1_GTIN_EPISTEMIC_REQUIREMENT,
      GS1_BRAND_OWNER_EPISTEMIC_REQUIREMENT,
    ];

    // 1. Structural Validation & Explicit Version Binding of DTC
    if (!dtc.dtcId || !dtc.dtcId.startsWith("dtc:zyppi:domain:")) {
      return {
        ok: false,
        error: {
          code: "unsupported",
          category: "Composition Failure",
          message: `Unsupported DTC ID: ${dtc.dtcId}`,
        },
      };
    }

    const dtcVersionCheck = validateExplicitVersionList(
      [dtc.version],
      "DTC version",
    );
    if (!dtcVersionCheck.ok) {
      return { ok: false, error: dtcVersionCheck.error };
    }

    const optionsVersionsCheck = validateExplicitVersionList(
      options.versions,
      "options.versions",
    );
    if (!optionsVersionsCheck.ok) {
      return { ok: false, error: optionsVersionsCheck.error };
    }

    if (dtc.version !== "1.0.0") {
      return {
        ok: false,
        error: {
          code: "incompatible",
          category: "Composition Failure",
          message: `Incompatible DTC version: ${dtc.version}`,
        },
      };
    }

    if (dtc.epistemicRequirements.length === 0) {
      return {
        ok: false,
        error: {
          code: "invalid",
          category: "Composition Failure",
          message: "DTC must reference at least one epistemic requirement",
        },
      };
    }

    if (
      dtc.versionConstraints &&
      Object.keys(dtc.versionConstraints).length > 0
    ) {
      const constraintCheck = validateVersionConstraints(
        options.versions,
        dtc.versionConstraints,
      );
      if (!constraintCheck.ok) {
        return { ok: false, error: constraintCheck.error };
      }
    }

    let retrievedState: RetrievedRegistryState;
    let resolvedActiveConstitutionalView: ActiveConstitutionalView;

    if (options.explicitAcv) {
      resolvedActiveConstitutionalView = options.explicitAcv;
      retrievedState = {
        identity: options.explicitAcv.identity,
        relationships: options.explicitAcv.relationships,
        standings: options.explicitAcv.standings,
        authorities: options.explicitAcv.authorities,
        capabilities: options.explicitAcv.capabilities,
        evidenceReferences: options.explicitAcv.evidenceReferences,
        applicablePolicies: options.explicitAcv.applicablePolicies,
      };
    } else {
      // 2. Fetch Registry state read-only if explicit ACV is not supplied
      const lookupResult = await options.registryRepository.lookup(
        options.identifier,
      );
      if (!lookupResult.ok) {
        return {
          ok: false,
          error: {
            code: "unavailable",
            category: "Composition Failure",
            message: `Registry repository lookup failed: ${JSON.stringify(lookupResult.error)}`,
          },
          epistemicStatus: "UNAVAILABLE",
        };
      }

      if (!lookupResult.value) {
        return {
          ok: false,
          error: {
            code: "missing",
            category: "Composition Failure",
            message: "Registry state not found for the supplied identifier",
            requirementId: reqs[0]?.requirementId ?? "epistemic:req:unknown:v1",
          },
          epistemicStatus: "UNAVAILABLE",
        };
      }

      retrievedState = lookupResult.value;
      resolvedActiveConstitutionalView = {
        identity: retrievedState.identity,
        relationships: retrievedState.relationships,
        standings: retrievedState.standings,
        authorities: retrievedState.authorities,
        capabilities: retrievedState.capabilities,
        evidenceReferences: retrievedState.evidenceReferences,
        applicablePolicies: retrievedState.applicablePolicies,
      };
    }

    // 4. Validate Composition Compatibility against explicit pinned ACV
    const compatResult = validateCompositionCompatibility(
      dtc,
      reqs,
      retrievedState,
      options.versions,
      resolvedActiveConstitutionalView,
      options.explicitCl16Artifacts,
    );
    if (!compatResult.ok) {
      return {
        ok: false,
        error: compatResult.error,
        epistemicStatus: compatResult.epistemicStatus,
      };
    }

    // 4B. Deterministic Conflict Evaluation Boundary (AMS-0859 / CORR-0859-3 §3)
    if (options.explicitConflictInputs) {
      const conflictEval = evaluateConflict(options.explicitConflictInputs);
      if (
        conflictEval.status === "UNRESOLVED" ||
        conflictEval.status === "DIAGNOSTIC"
      ) {
        return {
          ok: false,
          error: {
            code: conflictEval.disposition,
            category: "Composition Failure",
            message:
              conflictEval.status === "UNRESOLVED"
                ? conflictEval.reason
                : conflictEval.details,
          },
        };
      }
    }

    // 4. Resolve Evidence Bundle & Payloads using existing Evidence mechanisms
    let evidenceBundle: EvidenceBundle;
    let evidencePayloads: ReadonlyMap<string, unknown>;

    if (options.explicitEvidenceBundle) {
      evidenceBundle = options.explicitEvidenceBundle;
      evidencePayloads = options.explicitEvidencePayloads ?? new Map();
    } else {
      const evidenceIds = retrievedState.evidenceReferences.map(
        (r: { readonly evidenceId: string }) => r.evidenceId,
      );
      const resolver =
        options.evidenceResolver ??
        new RegistryEvidenceResolver(options.registryRepository);

      const resolveResult = await resolver.resolve(evidenceIds);
      if (!resolveResult.ok) {
        return {
          ok: false,
          error: {
            code: "missing",
            category: "Composition Failure",
            message: `Evidence reference resolution failed: ${resolveResult.error.message}`,
          },
          epistemicStatus: "UNAVAILABLE",
        };
      }

      evidenceBundle = resolveResult.value;

      if (evidenceBundle.evidenceRecords.length > 0) {
        const provider =
          options.evidencePayloadProvider ??
          (options.objectStorageClient
            ? new ObjectStorageEvidencePayloadProvider(
                options.objectStorageClient,
              )
            : null);

        if (!provider) {
          return {
            ok: false,
            error: {
              code: "unavailable",
              category: "Composition Failure",
              message:
                "EvidencePayloadProvider or ObjectStorageClient required to load evidence payloads",
            },
            epistemicStatus: "UNAVAILABLE",
          };
        }

        const payloadResult = await provider.loadPayloads(evidenceBundle);
        if (!payloadResult.ok) {
          return {
            ok: false,
            error: {
              code: "unverified",
              category: "Composition Failure",
              message: `Payload loading failed for evidence ID: ${payloadResult.error.kind}`,
            },
            epistemicStatus: "UNVERIFIED",
          };
        }

        evidencePayloads = payloadResult.value;
      } else {
        evidencePayloads = options.explicitEvidencePayloads ?? new Map();
      }

      // Preflight verification preserves epistemic status on failure
      const appReport = verifyEvidenceBundle(evidenceBundle, evidencePayloads);
      if (!appReport.isValid) {
        return {
          ok: false,
          error: {
            code: "unverified",
            category: "Composition Failure",
            message: `Evidence verification failed: ${appReport.errorCode ?? "invalid bundle"}`,
          },
          epistemicStatus: "UNVERIFIED",
        };
      }
    }

    const domainSlug = dtc.domainIdentifier.replace("domain:", "");

    // Detect structural divergence if multiple conflicting CL-16 artifacts are present
    let epistemicDivergence = false;
    const boundCl16Artifacts: Cl16IntelligenceReference[] = [];
    const boundAttestationProofReferences: AttRProofReference[] = [];

    if (
      options.explicitCl16Artifacts &&
      options.explicitCl16Artifacts.length > 0
    ) {
      for (const artifact of options.explicitCl16Artifacts) {
        boundCl16Artifacts.push(Object.freeze({ ...artifact }));
        if (artifact.attestationProofRef) {
          boundAttestationProofReferences.push(
            Object.freeze({ ...artifact.attestationProofRef }),
          );
        }
      }

      if (options.explicitCl16Artifacts.length > 1) {
        const conclusions = new Set(
          options.explicitCl16Artifacts
            .map((a: Cl16IntelligenceReference) => a.conclusionSummary)
            .filter(Boolean),
        );
        if (conclusions.size > 1) {
          epistemicDivergence = true;
        }
      }
    }

    // 6. Build Application-layer CompositionManifest
    const manifest: CompositionManifest = Object.freeze({
      $schema: "https://zyppi.org/schemas/v1/composition_manifest.json",
      manifestId: `manifest:zyppi:${domainSlug}_trade_item:v1:${options.executionId}`,
      dtcReference: Object.freeze({
        dtcId: dtc.dtcId,
        version: dtc.version,
      }),
      armProfileReference: Object.freeze({
        profileId: dtc.applicableArmProfiles[0] || "arm:profile:trade_item:v1",
        version: "1.0.0",
      }),
      boundEpistemicRequirements: Object.freeze(
        reqs.map((r) =>
          Object.freeze({
            requirementId: r.requirementId,
            version: r.version,
          }),
        ),
      ),
      boundPrjSpecifications: Object.freeze(
        dtc.requiredPrjSpecifications.map((s) =>
          Object.freeze({
            specId: s,
            version: "1.0.0",
          }),
        ),
      ),
      boundRsnBlueprints: Object.freeze(
        dtc.requiredRsnBlueprints.map((b) =>
          Object.freeze({
            blueprintId: b,
            version: "1.0.0",
          }),
        ),
      ),
      boundPolRequirements: Object.freeze(
        dtc.applicablePolRequirements.map((p) =>
          Object.freeze({
            policyId: p,
            version: "1.0.0",
          }),
        ),
      ),
      boundSecRequirements: Object.freeze(
        dtc.applicableSecRequirements.map((s) =>
          Object.freeze({
            securityReqId: s,
            version: "1.0.0",
          }),
        ),
      ),
      boundRiCapabilities: Object.freeze(
        dtc.requiredRiCapabilities.map((c) =>
          Object.freeze({
            capabilityId: c,
            version: "1.0.0",
          }),
        ),
      ),
      ...(boundCl16Artifacts.length > 0
        ? { boundCl16IntelligenceArtifacts: Object.freeze(boundCl16Artifacts) }
        : {}),
      ...(boundAttestationProofReferences.length > 0
        ? {
            boundAttestationProofReferences: Object.freeze(
              boundAttestationProofReferences,
            ),
          }
        : {}),
      ...(epistemicDivergence ? { epistemicDivergence: true } : {}),
      dependencyTopology: Object.freeze({
        nodes: Object.freeze([
          dtc.dtcId,
          dtc.applicableArmProfiles[0] || "arm:profile:trade_item:v1",
          ...dtc.requiredPrjSpecifications,
        ]),
        edges: Object.freeze([
          Object.freeze({
            from: dtc.dtcId,
            to: dtc.applicableArmProfiles[0] || "arm:profile:trade_item:v1",
          }),
        ]),
      }),
      provenanceReferences: Object.freeze({
        manifestAuthor: "identity:council:admin",
        createdTimestamp: options.constitutionalTimestamp,
      }),
    });

    // 7. Build Bound Constitutional Payload
    const boundPayload: BoundConstitutionalPayload = Object.freeze({
      $schema: "https://zyppi.org/schemas/v1/bound_payload.json",
      payloadId: `bound:payload:${domainSlug}:${options.executionId}`,
      manifestId: manifest.manifestId,
      resolvedActiveConstitutionalView,
      resolvedEvidenceBundle: evidenceBundle,
      executionContext: Object.freeze({
        executionId: options.executionId,
        constitutionalTimestamp: options.constitutionalTimestamp,
        budget: options.budget,
        entropy: options.entropy,
        versions: options.versions,
      }),
      ...(boundCl16Artifacts.length > 0
        ? { boundCl16IntelligenceArtifacts: Object.freeze(boundCl16Artifacts) }
        : {}),
      ...(epistemicDivergence ? { epistemicDivergence: true } : {}),
    });

    // Derive SCC identity strictly on the successful validated composition path
    const sccId = deriveSccIdentityInternal(manifest);

    // Build Bound Configuration Graph (BCG) and derive BCG identity from exact manifest references
    const initialNodes = [
      {
        id: manifest.dtcReference.dtcId,
        version: manifest.dtcReference.version,
        kind: "DTC",
      },
      {
        id: manifest.armProfileReference.profileId,
        version: manifest.armProfileReference.version,
        kind: "ARMProfile",
      },
      ...manifest.boundPrjSpecifications.map((s) => ({
        id: s.specId,
        version: s.version,
        kind: "PrjSpec",
      })),
      ...manifest.boundRsnBlueprints.map((b) => ({
        id: b.blueprintId,
        version: b.version,
        kind: "RsnBlueprint",
      })),
    ];

    const initialBindingEdges = [
      {
        sourceRef: manifest.dtcReference.dtcId,
        targetRef: manifest.armProfileReference.profileId,
        dependencyKind: "REQUIRES",
      },
    ];

    const bcgResult = buildBoundConfigurationGraph({
      semanticConfigurationRef: sccId,
      initialNodes,
      bindingEdges: initialBindingEdges,
    });

    if (!bcgResult.ok) {
      return {
        ok: false,
        error: bcgResult.error,
      };
    }

    const { bcg, bcgId } = bcgResult;

    return {
      ok: true,
      manifest,
      boundPayload,
      evidencePayloads,
      sccId,
      bcgId,
      bcg,
    };
  }

  /**
   * Complete end-to-end bridge method:
   * Resolves composition, constructs ExecutionRequest, and executes via existing Runtime substrate.
   */
  public async composeAndExecute(
    options: GenericCompositionOptions | GS1CompositionOptions,
  ): Promise<ApplicationCompositionBridgeResult> {
    const res = await this.resolveComposition(options);
    if (!res.ok) {
      return {
        ok: false,
        error: res.error,
        epistemicStatus: res.epistemicStatus,
      };
    }

    const { manifest, boundPayload, evidencePayloads, sccId, bcgId, bcg } = res;

    // Construct explicit ExecutionRequest
    const executionRequest: ExecutionRequest = {
      requestId: options.requestId,
      identity: boundPayload.resolvedActiveConstitutionalView.identity,
      activeConstitutionalView: boundPayload.resolvedActiveConstitutionalView,
      evidenceBundle: boundPayload.resolvedEvidenceBundle,
      policyContext: options.policyContext,
      executionContext: boundPayload.executionContext,
      resolvedPolicyGraph: options.resolvedPolicyGraph,
    };

    // Execute via existing Runtime substrate without altering Runtime contracts or ACV semantics
    const pipelineResult = runInternalPipeline(
      executionRequest,
      options.overrides,
      evidencePayloads,
    );

    return {
      ok: true,
      manifest,
      boundPayload,
      pipelineResult,
      sccId,
      bcgId,
      bcg,
    };
  }
}

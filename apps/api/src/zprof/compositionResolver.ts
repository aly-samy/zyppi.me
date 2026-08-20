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
import { validateCompositionCompatibility } from "./compatibilityValidator.js";
import { evaluateConflict } from "./conflict.js";
import {
  isExplicitVersion,
  validateExplicitVersionList,
  validateVersionConstraints,
} from "./versionValidator.js";
import { deriveSccIdentityInternal } from "./scc.js";
import { buildBoundConfigurationGraph } from "./bcg.js";
import {
  validateParticipantCollection,
  type ParticipantKind,
} from "./participant.js";
import { validateTopologyGraph } from "./topology.js";

export interface GS1CompositionOptions {
  readonly dtcFixture: DomainTemplateCard;
  readonly epistemicRequirementsFixtures: readonly EpistemicRequirementContract[];
  readonly manifestAuthor: string;
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
  readonly applicableArmProfile?: string;
  readonly explicitAcv?: ActiveConstitutionalView;
  readonly explicitEvidenceBundle?: EvidenceBundle;
  readonly explicitEvidencePayloads?: ReadonlyMap<string, unknown>;
  readonly explicitCl16Artifacts?: readonly Cl16IntelligenceReference[];
  readonly overrides?: StageOverrideConfig;
  readonly evidenceResolver?: EvidenceReferenceResolver;
  readonly evidencePayloadProvider?: EvidencePayloadProvider;
  readonly objectStorageClient?: ObjectStorageClient;
  readonly explicitConflictInputs?: import("./conflict.js").ConflictEvaluationInputs;
  readonly compositionDefinition?: import("./bind.js").CompositionDefinition;
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
 * Domain-Agnostic Application Composition Resolver (AMS-0853 / AMS-0854 / CORR-0861-PRE-1 / CORR-0861-PRE-1-2).
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
    // 1. Explicit Domain Injection Check (LAW-PRE1-01 / PRE1-T01 / PRE1-T02 / PRE1-T21)
    if (!options.dtcFixture) {
      return {
        ok: false,
        error: {
          code: "missing",
          category: "Composition Failure",
          message: "Domain Template Card (DTC) fixture is required but missing",
        },
        epistemicStatus: "UNAVAILABLE",
      };
    }

    if (
      !options.epistemicRequirementsFixtures ||
      options.epistemicRequirementsFixtures.length === 0
    ) {
      return {
        ok: false,
        error: {
          code: "missing",
          category: "Composition Failure",
          message:
            "Epistemic requirements contract collection is required but missing or empty",
        },
        epistemicStatus: "UNAVAILABLE",
      };
    }

    const dtc = options.dtcFixture;
    const reqs = options.epistemicRequirementsFixtures;

    // 2. Explicit Manifest Author Coordinate Check (LAW-PRE1-04 / PRE1-T05 / PRE1-T06)
    if (
      !options.manifestAuthor ||
      typeof options.manifestAuthor !== "string" ||
      options.manifestAuthor.trim() === ""
    ) {
      return {
        ok: false,
        error: {
          code: "missing",
          category: "Composition Failure",
          message: "Manifest author identity is required but missing or blank",
        },
        epistemicStatus: "UNAVAILABLE",
      };
    }

    const manifestAuthor = options.manifestAuthor.trim();

    // 3. Structural Validation & Explicit Version Binding of DTC
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

    // 4. Explicit ARM Profile Resolution & Precedence (LAW-PRE1-05 / CORR-0861-PRE-1-1 Phase 2)
    if (!dtc.applicableArmProfiles || dtc.applicableArmProfiles.length === 0) {
      return {
        ok: false,
        error: {
          code: "missing",
          category: "Composition Failure",
          message:
            "Domain Template Card specifies zero applicable ARM Profiles",
        },
      };
    }

    const armParticipants =
      options.compositionDefinition?.participants?.filter(
        (p) => p.kind === "ARM_PROFILE",
      ) ?? [];

    let selectedArmProfile: string | undefined;

    if (options.applicableArmProfile) {
      if (!dtc.applicableArmProfiles.includes(options.applicableArmProfile)) {
        return {
          ok: false,
          error: {
            code: "incompatible",
            category: "Composition Failure",
            message: `Selected ARM Profile '${options.applicableArmProfile}' is not declared in DTC applicableArmProfiles`,
          },
        };
      }

      if (armParticipants.length > 0) {
        const mismatch = armParticipants.some(
          (p) => p.identity !== options.applicableArmProfile,
        );
        if (mismatch) {
          return {
            ok: false,
            error: {
              code: "conflicting",
              category: "Composition Failure",
              message: `Explicit option applicableArmProfile '${options.applicableArmProfile}' conflicts with compositionDefinition ARM participant '${armParticipants[0]?.identity}'`,
            },
          };
        }
      }

      selectedArmProfile = options.applicableArmProfile;
    } else if (armParticipants.length > 0) {
      const distinctArmIdentities = [
        ...new Set(armParticipants.map((p) => p.identity)),
      ];

      if (distinctArmIdentities.length > 1) {
        return {
          ok: false,
          error: {
            code: "conflicting",
            category: "Composition Failure",
            message: `Multiple conflicting ARM Profile participants (${distinctArmIdentities.join(", ")}) in compositionDefinition without explicit selector`,
          },
        };
      }

      const candidate = distinctArmIdentities[0]!;
      if (!dtc.applicableArmProfiles.includes(candidate)) {
        return {
          ok: false,
          error: {
            code: "incompatible",
            category: "Composition Failure",
            message: `Participant ARM Profile '${candidate}' is not declared in DTC applicableArmProfiles`,
          },
        };
      }

      selectedArmProfile = candidate;
    } else {
      if (dtc.applicableArmProfiles.length === 1) {
        selectedArmProfile = dtc.applicableArmProfiles[0]!;
      } else {
        return {
          ok: false,
          error: {
            code: "conflicting",
            category: "Composition Failure",
            message: `Multiple applicable ARM Profiles declared in DTC (${dtc.applicableArmProfiles.join(", ")}) without explicit selection`,
          },
        };
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
      // 5. Fetch Registry state read-only if explicit ACV is not supplied
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

    // 6. Validate Composition Compatibility against explicit pinned ACV
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

    // 6B. Deterministic Conflict Evaluation Boundary (AMS-0859 / CORR-0859-3 §3)
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

    // 7. Resolve Evidence Bundle & Payloads using existing Evidence mechanisms
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

    // Validate governed CompositionDefinition topology per AMS-0858 / CORR-0860-A-4 §3
    let governedBindingEdges: readonly {
      readonly from: string;
      readonly to: string;
    }[] = [];

    if (options.compositionDefinition) {
      const compDef = options.compositionDefinition;
      const compParticipants = compDef.participants;

      // CORR-0860-A-5 §1-§4: Zero participant synthesis or owner/version fabrication permitted.
      // If participants are absent or empty, fail closed with invalid.
      if (!compParticipants || compParticipants.length === 0) {
        return {
          ok: false,
          error: {
            code: "invalid",
            category: "Composition Failure",
            message:
              "compositionDefinition provided without explicit governed participants collection P",
          },
        };
      }

      const pRes = validateParticipantCollection(compParticipants);
      if (!pRes.ok) {
        return {
          ok: false,
          error: pRes.error,
        };
      }

      const topoRes = validateTopologyGraph(
        pRes.participants,
        compDef.structuralEdges || [],
        compDef.bindingEdges || [],
      );

      if (!topoRes.ok) {
        return {
          ok: false,
          error: topoRes.error,
        };
      }

      governedBindingEdges = topoRes.graph.eBind.map((e) => ({
        from: e.sourceId,
        to: e.targetId,
      }));
    }

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

    // Helper: Exact Constituent Version Resolution (CORR-0861-PRE-1-2 Phase 1)
    // Resolves version strictly from explicit matching participant in compositionDefinition.participants.
    // Zero fallback to options.versions[0] permitted.
    const resolveConstituentVersion = (
      id: string,
      kind: ParticipantKind,
    ):
      | { ok: true; version: string }
      | { ok: false; error: CompositionError } => {
      const compParticipants =
        options.compositionDefinition?.participants || [];
      const matches = compParticipants.filter(
        (p) => p.kind === kind && p.identity === id,
      );

      if (matches.length > 1) {
        const distinctVersions = [...new Set(matches.map((m) => m.version))];
        if (distinctVersions.length > 1) {
          return {
            ok: false,
            error: {
              code: "conflicting",
              category: "Composition Failure",
              message: `Multiple conflicting participant versions (${distinctVersions.join(", ")}) for constituent '${id}'`,
            },
          };
        }
      }

      if (matches.length === 1) {
        const ver = matches[0]!.version;
        if (!isExplicitVersion(ver)) {
          return {
            ok: false,
            error: {
              code: "invalid",
              category: "Composition Failure",
              message: `Invalid or floating version '${ver}' for participant '${id}'`,
            },
          };
        }
        return { ok: true, version: ver };
      }

      return {
        ok: false,
        error: {
          code: "missing",
          category: "Composition Failure",
          message: `Missing exact explicit participant version coordinate for required constituent '${id}'`,
        },
      };
    };

    // Helper: Resolve ARM Profile Version specifically
    let armProfileVersion: string;
    const armPartMatch = options.compositionDefinition?.participants?.find(
      (p) => p.kind === "ARM_PROFILE" && p.identity === selectedArmProfile,
    );
    if (armPartMatch) {
      if (!isExplicitVersion(armPartMatch.version)) {
        return {
          ok: false,
          error: {
            code: "invalid",
            category: "Composition Failure",
            message: `Invalid or floating version '${armPartMatch.version}' for ARM profile '${selectedArmProfile}'`,
          },
        };
      }
      armProfileVersion = armPartMatch.version;
    } else {
      return {
        ok: false,
        error: {
          code: "missing",
          category: "Composition Failure",
          message: `Missing exact explicit participant version coordinate for ARM Profile '${selectedArmProfile}'`,
        },
      };
    }

    // Resolve PRJ Specifications
    const boundPrjSpecs: { specId: string; version: string }[] = [];
    for (const specId of dtc.requiredPrjSpecifications) {
      const vRes = resolveConstituentVersion(specId, "PRJ_SPECIFICATION");
      if (!vRes.ok) return { ok: false, error: vRes.error };
      boundPrjSpecs.push({ specId, version: vRes.version });
    }

    // Resolve RSN Blueprints
    const boundRsnBlueprints: { blueprintId: string; version: string }[] = [];
    for (const blueprintId of dtc.requiredRsnBlueprints) {
      const vRes = resolveConstituentVersion(blueprintId, "RSN_BLUEPRINT");
      if (!vRes.ok) return { ok: false, error: vRes.error };
      boundRsnBlueprints.push({ blueprintId, version: vRes.version });
    }

    // Resolve POL Requirements
    const boundPolReqs: { policyId: string; version: string }[] = [];
    for (const policyId of dtc.applicablePolRequirements) {
      const vRes = resolveConstituentVersion(policyId, "POL_REQUIREMENT");
      if (!vRes.ok) return { ok: false, error: vRes.error };
      boundPolReqs.push({ policyId, version: vRes.version });
    }

    // Resolve SEC Requirements
    const boundSecReqs: { securityReqId: string; version: string }[] = [];
    for (const securityReqId of dtc.applicableSecRequirements) {
      const vRes = resolveConstituentVersion(securityReqId, "SEC_REQUIREMENT");
      if (!vRes.ok) return { ok: false, error: vRes.error };
      boundSecReqs.push({ securityReqId, version: vRes.version });
    }

    // Resolve RI Capabilities
    const boundRiCaps: { capabilityId: string; version: string }[] = [];
    for (const capabilityId of dtc.requiredRiCapabilities) {
      const vRes = resolveConstituentVersion(capabilityId, "RI_CAPABILITY");
      if (!vRes.ok) return { ok: false, error: vRes.error };
      boundRiCaps.push({ capabilityId, version: vRes.version });
    }

    // 8. Build Application-layer CompositionManifest (LAW-PRE1-03 / LAW-PRE1-04 / PRE1-T08 / PRE1-T20 / PRE1-T23)
    const manifest: CompositionManifest = Object.freeze({
      $schema: "https://zyppi.org/schemas/v1/composition_manifest.json",
      manifestId: `manifest:zyppi:${domainSlug}:v1:${options.executionId}`,
      dtcReference: Object.freeze({
        dtcId: dtc.dtcId,
        version: dtc.version,
      }),
      armProfileReference: Object.freeze({
        profileId: selectedArmProfile,
        version: armProfileVersion,
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
        boundPrjSpecs.map((s) => Object.freeze(s)),
      ),
      boundRsnBlueprints: Object.freeze(
        boundRsnBlueprints.map((b) => Object.freeze(b)),
      ),
      boundPolRequirements: Object.freeze(
        boundPolReqs.map((p) => Object.freeze(p)),
      ),
      boundSecRequirements: Object.freeze(
        boundSecReqs.map((s) => Object.freeze(s)),
      ),
      boundRiCapabilities: Object.freeze(
        boundRiCaps.map((c) => Object.freeze(c)),
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
          ...dtc.applicableArmProfiles,
          ...dtc.requiredPrjSpecifications,
          ...dtc.requiredRsnBlueprints,
        ]),
        edges: Object.freeze(
          governedBindingEdges.map((e) =>
            Object.freeze({ from: e.from, to: e.to }),
          ),
        ),
      }),
      provenanceReferences: Object.freeze({
        manifestAuthor,
        createdTimestamp: options.constitutionalTimestamp,
      }),
    });

    // 9. Build Bound Constitutional Payload
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

    // Build Bound Configuration Graph (BCG) from full explicit governed configuration (CORR-0860-A-1 §5)
    // Include all explicitly bound constituents on the validated manifest
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
      ...manifest.boundEpistemicRequirements.map((r) => ({
        id: r.requirementId,
        version: r.version,
        kind: "EpistemicRequirement",
      })),
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
      ...manifest.boundPolRequirements.map((p) => ({
        id: p.policyId,
        version: p.version,
        kind: "PolRequirement",
      })),
      ...manifest.boundSecRequirements.map((s) => ({
        id: s.securityReqId,
        version: s.version,
        kind: "SecRequirement",
      })),
      ...manifest.boundRiCapabilities.map((c) => ({
        id: c.capabilityId,
        version: c.version,
        kind: "RiCapability",
      })),
    ];

    // Source binding edges strictly from explicit governed T_bind declarations on manifest (CORR-0860-A-1 §1)
    // Zero invented REQUIRES edges
    const initialBindingEdges = manifest.dependencyTopology.edges.map((e) => ({
      sourceRef: e.from,
      targetRef: e.to,
      dependencyKind: "REQUIRES",
    }));

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

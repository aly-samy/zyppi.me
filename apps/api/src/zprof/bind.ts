import type { ActiveConstitutionalView, EvidenceBundle } from "@zyppi/domain";
import type {
  CompositionError,
  BoundConstitutionalPayload,
  CompositionManifest,
} from "./types.js";
import type { Participant } from "./participant.js";
import {
  extractParticipantsFromManifest,
  validateParticipantCollection,
} from "./participant.js";
import type { StructuralEdge, BindingEdge } from "./topology.js";
import { validateTopologyGraph } from "./topology.js";
import { deriveCompositionId } from "./compositionId.js";

/**
 * Pinned substrate state per AMS-0858 §14.
 * Must include explicit ActiveConstitutionalView (ACV) and optional pre-resolved evidence.
 */
export interface PinnedSubstrate {
  readonly acv: ActiveConstitutionalView;
  readonly evidenceBundle?: EvidenceBundle;
  readonly evidencePayloads?: ReadonlyMap<string, unknown>;
}

/**
 * Dynamic execution coordinates per AMS-0858 §13.
 * Stored explicitly in bound payload; strictly excluded from CompositionID calculation.
 */
export interface BoundCoordinates {
  readonly executionId: string;
  readonly constitutionalTimestamp: string;
  readonly budget: number;
  readonly entropy: string;
  readonly versions: readonly string[];
  readonly tenantId?: string;
  readonly sessionId?: string;
  readonly location?: string;
}

/**
 * Declaration of a structural Composition definition for BIND.
 */
export interface CompositionDefinition {
  readonly participants?: readonly Participant[];
  readonly manifest?: CompositionManifest;
  readonly structuralEdges?: readonly StructuralEdge[];
  readonly bindingEdges?: readonly BindingEdge[];
  readonly structuralRequirementSignatures?: Readonly<Record<string, string>>;
}

/**
 * Input for the BIND declarative operation per AMS-0858 §14–§16.
 */
export interface BindOptions {
  readonly compositionDefinition: CompositionDefinition;
  readonly pinnedSubstrate: PinnedSubstrate;
  readonly boundCoordinates: BoundCoordinates;
  readonly authorizedInputs?: Readonly<Record<string, unknown>>;
}

export type BindResult =
  | {
      readonly ok: true;
      readonly compositionId: string;
      readonly boundPayload: BoundConstitutionalPayload;
      readonly manifest: CompositionManifest;
    }
  | { readonly ok: false; readonly error: CompositionError };

/**
 * Pure declarative BIND operation per AMS-0858 §14–§16.
 * BIND(CompositionDefinition, PinnedSubstrate, BoundCoordinates, AuthorizedInputs) -> BoundCompositionPayload
 *
 * Operates with ZERO ambient Registry lookups, ZERO network I/O, ZERO database access,
 * and ZERO runtime execution.
 */
export function bindComposition(options: BindOptions): BindResult {
  const { compositionDefinition, pinnedSubstrate, boundCoordinates } = options;

  // 1. Verify Pinned ACV Substrate Presence (P-006 / Substrate Pinning Rule)
  if (
    !pinnedSubstrate ||
    !pinnedSubstrate.acv ||
    !pinnedSubstrate.acv.identity
  ) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message:
          "BIND requires an explicitly pinned ActiveConstitutionalView substrate",
      },
    };
  }

  // 2. Resolve Participants P
  let participants: readonly Participant[];
  const manifest: CompositionManifest | undefined =
    compositionDefinition.manifest;

  if (
    compositionDefinition.participants &&
    compositionDefinition.participants.length > 0
  ) {
    const pRes = validateParticipantCollection(
      compositionDefinition.participants,
    );
    if (!pRes.ok) return { ok: false, error: pRes.error };
    participants = pRes.participants;
  } else if (manifest) {
    const pRes = extractParticipantsFromManifest(manifest);
    if (!pRes.ok) return { ok: false, error: pRes.error };
    participants = pRes.participants;
  } else {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message:
          "BIND requires explicit participants P or a valid CompositionManifest",
      },
    };
  }

  // 3. Resolve Structural & Binding Topologies
  const structEdges: readonly StructuralEdge[] =
    compositionDefinition.structuralEdges ||
    (manifest?.dependencyTopology?.edges.map((e) => ({
      sourceId: e.from,
      targetId: e.to,
      relationKind: "structural_dependency",
    })) ??
      []);

  const bindEdges: readonly BindingEdge[] =
    compositionDefinition.bindingEdges || [];

  const topoRes = validateTopologyGraph(participants, structEdges, bindEdges);
  if (!topoRes.ok) {
    return { ok: false, error: topoRes.error };
  }

  // 4. Derive Deterministic CompositionID
  const idRes = deriveCompositionId({
    P: participants,
    T_struct: structEdges,
    T_bind: bindEdges,
    structuralRequirementSignatures:
      compositionDefinition.structuralRequirementSignatures,
  });
  if (!idRes.ok) {
    return { ok: false, error: idRes.error };
  }

  const compositionId = idRes.compositionId;

  // 5. Build/Normalize CompositionManifest if not pre-supplied
  const domainSlug =
    pinnedSubstrate.acv.identity.identityType ||
    participants[0]?.identity.split(":")[2] ||
    "trade_item";
  const manifestId =
    manifest?.manifestId ||
    `manifest:zyppi:${domainSlug}:${boundCoordinates.executionId}`;

  const finalManifest: CompositionManifest = manifest
    ? Object.freeze({ ...manifest, composition_id: compositionId })
    : Object.freeze({
        $schema: "https://zyppi.org/schemas/v1/composition_manifest.json",
        manifestId,
        dtcReference: {
          dtcId:
            participants.find((p) => p.kind === "DTC")?.identity ||
            "dtc:zyppi:domain:trade_item:v1",
          version: "1.0.0",
        },
        armProfileReference: {
          profileId:
            participants.find((p) => p.kind === "ARM_PROFILE")?.identity ||
            "arm:profile:trade_item:v1",
          version: "1.0.0",
        },
        boundEpistemicRequirements: participants
          .filter((p) => p.kind === "EPISTEMIC_REQUIREMENT")
          .map((p) =>
            Object.freeze({ requirementId: p.identity, version: p.version }),
          ),
        boundPrjSpecifications: participants
          .filter((p) => p.kind === "PRJ_SPECIFICATION")
          .map((p) =>
            Object.freeze({ specId: p.identity, version: p.version }),
          ),
        boundRsnBlueprints: participants
          .filter((p) => p.kind === "RSN_BLUEPRINT")
          .map((p) =>
            Object.freeze({ blueprintId: p.identity, version: p.version }),
          ),
        boundPolRequirements: participants
          .filter((p) => p.kind === "POL_REQUIREMENT")
          .map((p) =>
            Object.freeze({ policyId: p.identity, version: p.version }),
          ),
        boundSecRequirements: participants
          .filter((p) => p.kind === "SEC_REQUIREMENT")
          .map((p) =>
            Object.freeze({ securityReqId: p.identity, version: p.version }),
          ),
        boundRiCapabilities: participants
          .filter((p) => p.kind === "RI_CAPABILITY")
          .map((p) =>
            Object.freeze({ capabilityId: p.identity, version: p.version }),
          ),
        dependencyTopology: Object.freeze({
          nodes: Object.freeze(participants.map((p) => p.identity)),
          edges: Object.freeze(
            structEdges.map((e) => ({ from: e.sourceId, to: e.targetId })),
          ),
        }),
        provenanceReferences: Object.freeze({
          manifestAuthor: "identity:council:admin",
          createdTimestamp: boundCoordinates.constitutionalTimestamp,
        }),
      });

  // 6. Build Immutable BoundConstitutionalPayload
  const evidenceBundle: EvidenceBundle = pinnedSubstrate.evidenceBundle ?? {
    schemaVersion: "1.0",
    evidenceRecords: [],
  };

  const boundPayload: BoundConstitutionalPayload = Object.freeze({
    $schema: "https://zyppi.org/schemas/v1/bound_payload.json",
    payloadId: `bound:payload:${domainSlug}:${boundCoordinates.executionId}`,
    manifestId: finalManifest.manifestId,
    resolvedActiveConstitutionalView: pinnedSubstrate.acv,
    resolvedEvidenceBundle: evidenceBundle,
    executionContext: Object.freeze({
      executionId: boundCoordinates.executionId,
      constitutionalTimestamp: boundCoordinates.constitutionalTimestamp,
      budget: boundCoordinates.budget,
      entropy: boundCoordinates.entropy,
      versions: boundCoordinates.versions,
    }),
  });

  return {
    ok: true,
    compositionId,
    boundPayload,
    manifest: finalManifest,
  };
}

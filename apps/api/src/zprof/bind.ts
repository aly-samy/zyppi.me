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
 * Must include explicit ActiveConstitutionalView (ACV) and explicit evidenceBundle.
 */
export interface PinnedSubstrate {
  readonly acv: ActiveConstitutionalView;
  readonly evidenceBundle: EvidenceBundle;
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
  readonly ownerLookup?: Readonly<Record<string, string>>;
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
 * Recursively deep freezes an object/array structure.
 */
function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== "object" || Object.isFrozen(obj)) {
    return obj;
  }
  Object.freeze(obj);
  for (const key of Reflect.ownKeys(obj)) {
    const val = (obj as Record<string | symbol, unknown>)[key];
    if (val !== null && typeof val === "object") {
      deepFreeze(val);
    }
  }
  return obj;
}

/**
 * Pure declarative BIND operation per AMS-0858 §14–§16.
 * BIND(CompositionDefinition, PinnedSubstrate, BoundCoordinates, AuthorizedInputs) -> BoundCompositionPayload
 *
 * BIND binds a declared composition. It DOES NOT invent or synthesize missing constitutional participants,
 * default DTCs, default ARM Profiles, default manifests, default evidence bundles, or fabricated owners.
 *
 * Operates with ZERO ambient Registry lookups, ZERO network I/O, ZERO database access,
 * and ZERO runtime execution.
 */
export function bindComposition(options: BindOptions): BindResult {
  const { compositionDefinition, pinnedSubstrate, boundCoordinates } = options;

  // 1. Verify Pinned Substrate Presence (ACV and Evidence Bundle)
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

  if (!pinnedSubstrate.acv.identity.identityType) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message:
          "BIND requires explicit identityType on pinned ACV identity; fallback synthesis is prohibited",
      },
    };
  }

  if (!pinnedSubstrate.evidenceBundle) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message:
          "BIND requires an explicit evidenceBundle in pinnedSubstrate; fallback synthesis is prohibited",
      },
    };
  }

  // 2. Resolve Participants P without synthesis
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
    const pRes = extractParticipantsFromManifest(manifest, options.ownerLookup);
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

  // 3. Mandatory Check: Must contain DTC and ARM Profile declared in P
  const hasDtc = participants.some((p) => p.kind === "DTC");
  const hasArm = participants.some((p) => p.kind === "ARM_PROFILE");

  if (!hasDtc || !hasArm) {
    return {
      ok: false,
      error: {
        code: "missing",
        category: "Composition Failure",
        message:
          "Composition definition missing required DTC or ARM_PROFILE participant; BIND shall not synthesize missing participants",
      },
    };
  }

  // 4. Resolve Structural & Binding Topologies
  const structEdges: readonly StructuralEdge[] =
    compositionDefinition.structuralEdges || [];
  const bindEdges: readonly BindingEdge[] =
    compositionDefinition.bindingEdges || [];

  const topoRes = validateTopologyGraph(participants, structEdges, bindEdges);
  if (!topoRes.ok) {
    return { ok: false, error: topoRes.error };
  }

  // 5. Derive Deterministic CompositionID
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

  // 6. Require explicit CompositionManifest (no synthesis permitted)
  if (!manifest) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message:
          "BIND requires an explicit CompositionManifest; synthesis of missing manifests is prohibited",
      },
    };
  }

  const finalManifest: CompositionManifest = deepFreeze({
    ...manifest,
    composition_id: compositionId,
  } as CompositionManifest);

  // 7. Build Immutable BoundConstitutionalPayload with exact inputs
  const domainSlug = pinnedSubstrate.acv.identity.identityType;

  const rawPayload: BoundConstitutionalPayload = {
    $schema: "https://zyppi.org/schemas/v1/bound_payload.json",
    payloadId: `bound:payload:${domainSlug}:${boundCoordinates.executionId}`,
    manifestId: finalManifest.manifestId,
    resolvedActiveConstitutionalView: pinnedSubstrate.acv,
    resolvedEvidenceBundle: pinnedSubstrate.evidenceBundle,
    executionContext: {
      executionId: boundCoordinates.executionId,
      constitutionalTimestamp: boundCoordinates.constitutionalTimestamp,
      budget: boundCoordinates.budget,
      entropy: boundCoordinates.entropy,
      versions: boundCoordinates.versions,
    },
  };

  const boundPayload: BoundConstitutionalPayload = deepFreeze(rawPayload);

  return {
    ok: true,
    compositionId,
    boundPayload,
    manifest: finalManifest,
  };
}

import { createHash } from "node:crypto";
import { canonicalizeJcs } from "@zyppi/domain";
import type { CompositionError } from "./types.js";
import type { Participant } from "./participant.js";
import { validateParticipantCollection } from "./participant.js";
import type {
  NormalizedTopologyGraph,
  StructuralEdge,
  BindingEdge,
} from "./topology.js";
import { validateTopologyGraph } from "./topology.js";

/**
 * Composition Identity Domain structure per AMS-0858 §11.
 * Domain = (P, T_struct, T_bind, identityBearingRequirementSignatures)
 * Excludes dynamic execution coordinates (timestamps, request IDs, tenant/session state).
 */
export interface CompositionIdentityDomain {
  readonly P: readonly Participant[];
  readonly T_struct: readonly StructuralEdge[];
  readonly T_bind: readonly BindingEdge[];
  readonly structuralRequirementSignatures?: Readonly<Record<string, string>>;
}

export type CompositionIdentityResult =
  | {
      readonly ok: true;
      readonly compositionId: string;
      readonly canonicalJson: string;
      readonly normalizedDomain: CompositionIdentityDomain;
    }
  | { readonly ok: false; readonly error: CompositionError };

/**
 * Derives deterministic, permutation-invariant CompositionID per AMS-0858 §11 & §12.
 * Serializes normalized domain using JCS / RFC 8785 and computes SHA-256 hash.
 */
export function deriveCompositionId(
  domain: CompositionIdentityDomain,
): CompositionIdentityResult {
  // 1. Validate Participants P
  const pCheck = validateParticipantCollection(domain.P);
  if (!pCheck.ok) {
    return { ok: false, error: pCheck.error };
  }

  // 2. Validate Topology T_struct and T_bind
  const topoCheck = validateTopologyGraph(
    pCheck.participants,
    domain.T_struct || [],
    domain.T_bind || [],
  );
  if (!topoCheck.ok) {
    return { ok: false, error: topoCheck.error };
  }

  const { graph } = topoCheck;

  // 3. Normalize Participants P in canonical order (by identity, then role)
  const canonicalParticipants = [...pCheck.participants]
    .map((p) =>
      Object.freeze({
        identity: p.identity,
        kind: p.kind,
        version: p.version,
        owner: p.owner,
        role: p.role,
        reference: Object.freeze({
          id: p.reference.id,
          version: p.reference.version,
          ...(p.reference.metadata ? { metadata: p.reference.metadata } : {}),
        }),
      }),
    )
    .sort((a, b) => {
      if (a.identity !== b.identity)
        return a.identity.localeCompare(b.identity);
      return a.role.localeCompare(b.role);
    });

  // 4. Normalize requirement signatures (sorted keys) if present
  let normalizedSignatures: Record<string, string> | undefined;
  if (
    domain.structuralRequirementSignatures &&
    Object.keys(domain.structuralRequirementSignatures).length > 0
  ) {
    normalizedSignatures = {};
    const sortedKeys = Object.keys(
      domain.structuralRequirementSignatures,
    ).sort();
    for (const key of sortedKeys) {
      normalizedSignatures[key] = domain.structuralRequirementSignatures[key]!;
    }
  }

  // 5. Construct canonical normalized identity domain representation object
  const canonicalDomainObject = {
    P: canonicalParticipants,
    T_bind: graph.eBind,
    T_struct: graph.eStruct,
    ...(normalizedSignatures
      ? { structuralRequirementSignatures: normalizedSignatures }
      : {}),
  };

  // 6. Serialize with JCS (RFC 8785)
  let canonicalJson: string;
  try {
    canonicalJson = canonicalizeJcs(canonicalDomainObject);
  } catch (err) {
    return {
      ok: false,
      error: {
        code: "invalid",
        category: "Composition Failure",
        message: `Canonical JCS serialization failed: ${err instanceof Error ? err.message : String(err)}`,
      },
    };
  }

  // 7. Compute SHA-256 hash
  const hashHex = createHash("sha256")
    .update(canonicalJson, "utf8")
    .digest("hex");
  const compositionId = `composition:zyppi:${hashHex}`;

  return {
    ok: true,
    compositionId,
    canonicalJson,
    normalizedDomain: Object.freeze({
      P: Object.freeze(canonicalParticipants),
      T_struct: Object.freeze(graph.eStruct),
      T_bind: Object.freeze(graph.eBind),
      ...(normalizedSignatures
        ? {
            structuralRequirementSignatures:
              Object.freeze(normalizedSignatures),
          }
        : {}),
    }),
  };
}

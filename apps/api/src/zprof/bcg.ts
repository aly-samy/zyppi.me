import { createHash } from "node:crypto";
import { canonicalizeJcs } from "@zyppi/domain";
import type { CompositionError, CompositionErrorCode } from "./types.js";

/**
 * BCG Node representing an exact governed configuration constituent per AMS-0860-A / CORR-0860-A-1 / CORR-0860-A-2.
 */
export interface BcgNode {
  readonly id: string;
  readonly version: string;
  readonly kind: string;
  readonly ownerRef?: string;
}

/**
 * BCG Binding Edge representing explicit REQUIRES binding semantics per AMS-0860-A.
 */
export interface BcgBindingEdge {
  readonly sourceRef: string;
  readonly targetRef: string;
  readonly dependencyKind: "REQUIRES";
}

/**
 * Minimal BCG-side structure representing explicitly supplied governed opacity information per AMS-0860-A.
 */
export interface BcgOpacityBoundary {
  readonly foreignInterfaceRef: string;
  readonly foreignAuthorityRef: string;
  readonly foreignReceiptDigest: string;
  readonly localFederationPolicyRef: string;
}

/**
 * Structural reference to foreign results/receipts bound to the configuration graph per AMS-0860-A.
 */
export interface BcgForeignIntegrityReference {
  readonly referenceId: string;
  readonly foreignInterfaceRef: string;
  readonly digest: string;
}

/**
 * Complete Bound Configuration Graph (BCG) representation per AMS-0860-A.
 */
export interface BoundConfigurationGraph {
  readonly semanticConfigurationRef: string;
  readonly nodes: readonly BcgNode[];
  readonly bindingEdges: readonly BcgBindingEdge[];
  readonly opacityBoundaries?: readonly BcgOpacityBoundary[];
  readonly externalIntegrityReferences?: readonly BcgForeignIntegrityReference[];
}

export type BcgClosureResult =
  | {
      readonly ok: true;
      readonly bcg: BoundConfigurationGraph;
      readonly bcgId: string;
    }
  | {
      readonly ok: false;
      readonly error: CompositionError;
    };

export interface BcgClosureOptions {
  readonly semanticConfigurationRef: string; // e.g. sccId
  readonly initialNodes: readonly BcgNode[];
  readonly bindingEdges: readonly {
    readonly sourceRef: string;
    readonly targetRef: string;
    readonly dependencyKind: string;
  }[];
  readonly availableUniverse?: ReadonlyMap<string, BcgNode>;
  readonly opacityBoundaries?: readonly BcgOpacityBoundary[];
  readonly externalIntegrityReferences?: readonly BcgForeignIntegrityReference[];
}

/**
 * Normalizes BCG identity-bearing collections using canonical JCS string sorting
 * per CORR-0860-A-1 §4 to guarantee 100% complete field coverage and permutation invariance.
 */
export function normalizeBcg(
  bcg: BoundConfigurationGraph,
): BoundConfigurationGraph {
  const nodes = [...bcg.nodes]
    .map((n) => Object.freeze({ ...n }))
    .sort((a, b) => canonicalizeJcs(a).localeCompare(canonicalizeJcs(b)));

  const bindingEdges = [...bcg.bindingEdges]
    .map((e) => Object.freeze({ ...e }))
    .sort((a, b) => canonicalizeJcs(a).localeCompare(canonicalizeJcs(b)));

  let opacityBoundaries: BcgOpacityBoundary[] | undefined;
  if (bcg.opacityBoundaries && bcg.opacityBoundaries.length > 0) {
    opacityBoundaries = [...bcg.opacityBoundaries]
      .map((o) => Object.freeze({ ...o }))
      .sort((a, b) => canonicalizeJcs(a).localeCompare(canonicalizeJcs(b)));
  }

  let externalIntegrityReferences: BcgForeignIntegrityReference[] | undefined;
  if (
    bcg.externalIntegrityReferences &&
    bcg.externalIntegrityReferences.length > 0
  ) {
    externalIntegrityReferences = [...bcg.externalIntegrityReferences]
      .map((i) => Object.freeze({ ...i }))
      .sort((a, b) => canonicalizeJcs(a).localeCompare(canonicalizeJcs(b)));
  }

  return Object.freeze({
    semanticConfigurationRef: bcg.semanticConfigurationRef,
    nodes: Object.freeze(nodes),
    bindingEdges: Object.freeze(bindingEdges),
    ...(opacityBoundaries
      ? { opacityBoundaries: Object.freeze(opacityBoundaries) }
      : {}),
    ...(externalIntegrityReferences
      ? {
          externalIntegrityReferences: Object.freeze(
            externalIntegrityReferences,
          ),
        }
      : {}),
  });
}

/**
 * Derives deterministic BCG Identity (sha256:<hex>) for a normalized BCG structure per AMS-0860-A.
 */
export function deriveBcgIdentity(bcg: BoundConfigurationGraph): string {
  const normalized = normalizeBcg(bcg);

  const projection = {
    semanticConfigurationRef: normalized.semanticConfigurationRef,
    nodes: normalized.nodes.map((n) => ({
      id: n.id,
      version: n.version,
      kind: n.kind,
      ...(n.ownerRef ? { ownerRef: n.ownerRef } : {}),
    })),
    bindingEdges: normalized.bindingEdges.map((e) => ({
      sourceRef: e.sourceRef,
      targetRef: e.targetRef,
      dependencyKind: e.dependencyKind,
    })),
    ...(normalized.opacityBoundaries
      ? {
          opacityBoundaries: normalized.opacityBoundaries.map((o) => ({
            foreignInterfaceRef: o.foreignInterfaceRef,
            foreignAuthorityRef: o.foreignAuthorityRef,
            foreignReceiptDigest: o.foreignReceiptDigest,
            localFederationPolicyRef: o.localFederationPolicyRef,
          })),
        }
      : {}),
    ...(normalized.externalIntegrityReferences
      ? {
          externalIntegrityReferences:
            normalized.externalIntegrityReferences.map((i) => ({
              referenceId: i.referenceId,
              foreignInterfaceRef: i.foreignInterfaceRef,
              digest: i.digest,
            })),
        }
      : {}),
  };

  const canonicalJson = canonicalizeJcs(projection);
  const hashHex = createHash("sha256")
    .update(canonicalJson, "utf8")
    .digest("hex");
  return `sha256:${hashHex}`;
}

/**
 * Detects circular REQUIRES binding dependency topologies per AMS-0860-A §20 / CORR-0860-A-2 §4.
 * Operates strictly on exact resolved node coordinates (${id}@${version}).
 * A circular REQUIRES dependency topology fails closed with CONTRACT-12 disposition 'invalid'.
 */
export function detectBcgBindingCycle(
  nodes: readonly string[],
  edges: readonly BcgBindingEdge[],
): { readonly hasCycle: boolean; readonly cycleNodes?: readonly string[] } {
  const adj = new Map<string, string[]>();
  for (const nodeKey of nodes) {
    adj.set(nodeKey, []);
  }
  for (const edge of edges) {
    if (!adj.has(edge.sourceRef)) adj.set(edge.sourceRef, []);
    adj.get(edge.sourceRef)!.push(edge.targetRef);
  }

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(curr: string, path: string[]): string[] | null {
    visited.add(curr);
    recursionStack.add(curr);
    path.push(curr);

    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        const cycle = dfs(neighbor, path);
        if (cycle) return cycle;
      } else if (recursionStack.has(neighbor)) {
        const cycleStart = path.indexOf(neighbor);
        return path.slice(cycleStart);
      }
    }

    recursionStack.delete(curr);
    path.pop();
    return null;
  }

  for (const nodeKey of nodes) {
    if (!visited.has(nodeKey)) {
      const cycle = dfs(nodeKey, []);
      if (cycle) {
        return { hasCycle: true, cycleNodes: cycle };
      }
    }
  }

  return { hasCycle: false };
}

/**
 * Resolves a sourceRef or targetRef endpoint reference to an exact candidate node per CORR-0860-A-2 §1-§3.
 * - Exact version endpoint (e.g. Y@v3): matches strictly Y@v3.
 * - Bare endpoint (e.g. Y): matches candidates with id === 'Y'.
 *   - Exactly 1 candidate -> resolves to that candidate.
 *   - 0 candidates -> fails closed with 'missing'.
 *   - >1 candidates -> fails closed with 'conflicting' (no first/latest/default selection allowed).
 */
function resolveEndpointCandidate(
  ref: string,
  candidateMap: Map<string, BcgNode>,
):
  | { readonly ok: true; readonly node: BcgNode; readonly exactKey: string }
  | {
      readonly ok: false;
      readonly code: CompositionErrorCode;
      readonly message: string;
    } {
  if (ref.includes("@")) {
    const directNode = candidateMap.get(ref);
    if (directNode) {
      return { ok: true, node: directNode, exactKey: ref };
    }
    // Try matching id and version split
    const [refId, refVer] = ref.split("@");
    const matched = Array.from(candidateMap.values()).find(
      (n) => n.id === refId && n.version === refVer,
    );
    if (matched) {
      return {
        ok: true,
        node: matched,
        exactKey: `${matched.id}@${matched.version}`,
      };
    }
    return {
      ok: false,
      code: "missing",
      message: `Exact dependency node '${ref}' is missing or unavailable.`,
    };
  }

  // Bare reference (e.g., 'Y')
  const matchingCandidates = Array.from(candidateMap.values()).filter(
    (n) => n.id === ref,
  );

  if (matchingCandidates.length === 1) {
    const matched = matchingCandidates[0]!;
    return {
      ok: true,
      node: matched,
      exactKey: `${matched.id}@${matched.version}`,
    };
  }

  if (matchingCandidates.length === 0) {
    return {
      ok: false,
      code: "missing",
      message: `Exact dependency node '${ref}' is missing or unavailable.`,
    };
  }

  // matchingCandidates.length > 1 -> Ambiguous reference!
  const candidateKeys = matchingCandidates
    .map((n) => `${n.id}@${n.version}`)
    .join(", ");
  return {
    ok: false,
    code: "conflicting",
    message: `Ambiguous endpoint reference '${ref}' matches multiple exact candidates: [${candidateKeys}]. Automatic first/latest resolution prohibited.`,
  };
}

/**
 * Performs exact transitive dependency closure and constructs complete Bound Configuration Graph (BCG).
 * Enforces exact version-bound node keying (${id}@${version}) per CORR-0860-A-1 §3 and unambiguous
 * endpoint resolution per CORR-0860-A-2 §1-§3.
 * Enforces that BCG node membership follows explicit evaluation-affecting binding closure per CORR-0860-A-2 §5.
 */
export function buildBoundConfigurationGraph(
  options: BcgClosureOptions,
): BcgClosureResult {
  // Populate full available node candidate universe
  const candidateMap = new Map<string, BcgNode>();
  for (const node of options.initialNodes) {
    const exactKey = `${node.id}@${node.version}`;
    candidateMap.set(exactKey, node);
  }
  if (options.availableUniverse) {
    for (const [key, node] of options.availableUniverse.entries()) {
      const exactKey = key.includes("@") ? key : `${node.id}@${node.version}`;
      if (!candidateMap.has(exactKey)) {
        candidateMap.set(exactKey, node);
      }
    }
  }

  const resolvedEdges: BcgBindingEdge[] = [];
  const resolvedNodesMap = new Map<string, BcgNode>();

  // Process raw binding edges
  for (const edge of options.bindingEdges) {
    if (edge.dependencyKind !== "REQUIRES") {
      return {
        ok: false,
        error: {
          code: "invalid" as CompositionErrorCode,
          category: "Composition Failure",
          message: `Unratified or forbidden relation kind '${edge.dependencyKind}' in BCG edge. Closed to 'REQUIRES'.`,
        },
      };
    }

    // Resolve source endpoint unambiguously
    const sourceRes = resolveEndpointCandidate(edge.sourceRef, candidateMap);
    if (!sourceRes.ok) {
      return {
        ok: false,
        error: {
          code: sourceRes.code,
          category: "Composition Failure",
          message: sourceRes.message,
        },
      };
    }

    // Resolve target endpoint unambiguously
    const targetRes = resolveEndpointCandidate(edge.targetRef, candidateMap);
    if (!targetRes.ok) {
      return {
        ok: false,
        error: {
          code: targetRes.code,
          category: "Composition Failure",
          message: targetRes.message,
        },
      };
    }

    resolvedEdges.push({
      sourceRef: sourceRes.exactKey,
      targetRef: targetRes.exactKey,
      dependencyKind: "REQUIRES",
    });

    resolvedNodesMap.set(sourceRes.exactKey, sourceRes.node);
    resolvedNodesMap.set(targetRes.exactKey, targetRes.node);
  }

  // If there are zero binding edges, include only the root DTC node if present (CORR-0860-A-2 §5)
  if (resolvedEdges.length === 0) {
    const dtcRoot =
      options.initialNodes.find((n) => n.kind === "DTC") ||
      options.initialNodes[0];
    if (dtcRoot) {
      resolvedNodesMap.set(`${dtcRoot.id}@${dtcRoot.version}`, dtcRoot);
    }
  }

  // Detect binding cycles on exact resolved node keys
  const exactNodeKeys = Array.from(resolvedNodesMap.keys());
  const cycleCheck = detectBcgBindingCycle(exactNodeKeys, resolvedEdges);
  if (cycleCheck.hasCycle) {
    return {
      ok: false,
      error: {
        code: "invalid" as CompositionErrorCode,
        category: "Composition Failure",
        message: `Binding topology contains circular REQUIRES dependency: ${cycleCheck.cycleNodes?.join(" -> ")}`,
      },
    };
  }

  const unnormalizedBcg: BoundConfigurationGraph = {
    semanticConfigurationRef: options.semanticConfigurationRef,
    nodes: Array.from(resolvedNodesMap.values()),
    bindingEdges: resolvedEdges,
    ...(options.opacityBoundaries
      ? { opacityBoundaries: options.opacityBoundaries }
      : {}),
    ...(options.externalIntegrityReferences
      ? { externalIntegrityReferences: options.externalIntegrityReferences }
      : {}),
  };

  const bcg = normalizeBcg(unnormalizedBcg);
  const bcgId = deriveBcgIdentity(bcg);

  return {
    ok: true,
    bcg,
    bcgId,
  };
}

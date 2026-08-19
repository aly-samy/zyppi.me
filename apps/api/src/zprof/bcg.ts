import { createHash } from "node:crypto";
import { canonicalizeJcs } from "@zyppi/domain";
import type { CompositionError, CompositionErrorCode } from "./types.js";

/**
 * BCG Node representing an exact governed configuration constituent per AMS-0860-A / CORR-0860-A-1.
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
 * Detects circular REQUIRES binding dependency topologies per AMS-0860-A §20.
 * A circular REQUIRES dependency topology fails closed with CONTRACT-12 disposition 'invalid'.
 */
export function detectBcgBindingCycle(
  nodes: readonly string[],
  edges: readonly BcgBindingEdge[],
): { readonly hasCycle: boolean; readonly cycleNodes?: readonly string[] } {
  const adj = new Map<string, string[]>();
  for (const node of nodes) {
    adj.set(node, []);
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

  for (const node of nodes) {
    if (!visited.has(node)) {
      const cycle = dfs(node, []);
      if (cycle) {
        return { hasCycle: true, cycleNodes: cycle };
      }
    }
  }

  return { hasCycle: false };
}

/**
 * Performs exact transitive dependency closure and constructs complete Bound Configuration Graph (BCG).
 * Enforces exact version-bound node keying (${id}@${version}) per CORR-0860-A-1 §3 to prevent silent overwriting
 * of different exact versions of the same artifact ID.
 * Enforces explicit REQUIRES binding relations, cycle rejection (mapping to CONTRACT-12 'invalid'),
 * and fail-closed missing/unavailable dependency handling per AMS-0860-A.
 */
export function buildBoundConfigurationGraph(
  options: BcgClosureOptions,
): BcgClosureResult {
  // Key nodes by exact coordinate `${id}@${version}` per CORR-0860-A-1 §3
  const nodeMap = new Map<string, BcgNode>();
  for (const node of options.initialNodes) {
    const exactKey = `${node.id}@${node.version}`;
    nodeMap.set(exactKey, node);
  }

  const validatedEdges: BcgBindingEdge[] = [];

  // Validate relation kinds and populate edges
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
    validatedEdges.push({
      sourceRef: edge.sourceRef,
      targetRef: edge.targetRef,
      dependencyKind: "REQUIRES",
    });
  }

  // Transitive closure matching exact targetRef or matching node ID
  const queue: BcgNode[] = Array.from(nodeMap.values());
  const visitedKeys = new Set<string>(queue.map((n) => `${n.id}@${n.version}`));

  while (queue.length > 0) {
    const currentNode = queue.shift()!;
    const outgoingEdges = validatedEdges.filter(
      (e) =>
        e.sourceRef === currentNode.id ||
        e.sourceRef === `${currentNode.id}@${currentNode.version}`,
    );

    for (const edge of outgoingEdges) {
      const targetRef = edge.targetRef;

      // Find target node in nodeMap by exact key or ID matching
      let foundNodeKey = Array.from(nodeMap.keys()).find(
        (key) => key === targetRef || key.startsWith(`${targetRef}@`),
      );

      if (!foundNodeKey && options.availableUniverse) {
        // Search availableUniverse
        const resolvedEntry = Array.from(
          options.availableUniverse.entries(),
        ).find(
          ([key, node]) =>
            key === targetRef ||
            node.id === targetRef ||
            `${node.id}@${node.version}` === targetRef,
        );

        if (resolvedEntry) {
          const resolvedNode = resolvedEntry[1];
          foundNodeKey = `${resolvedNode.id}@${resolvedNode.version}`;
          nodeMap.set(foundNodeKey, resolvedNode);
        }
      }

      if (!foundNodeKey) {
        return {
          ok: false,
          error: {
            code: "missing" as CompositionErrorCode,
            category: "Composition Failure",
            message: `Exact dependency '${targetRef}' required by '${currentNode.id}' is missing or unavailable.`,
          },
        };
      }

      if (!visitedKeys.has(foundNodeKey)) {
        visitedKeys.add(foundNodeKey);
        queue.push(nodeMap.get(foundNodeKey)!);
      }
    }
  }

  // Detect binding cycles
  const nodeIdsForCycle = Array.from(
    new Set([
      ...Array.from(nodeMap.values()).map((n) => n.id),
      ...Array.from(nodeMap.keys()),
    ]),
  );
  const cycleCheck = detectBcgBindingCycle(nodeIdsForCycle, validatedEdges);
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
    nodes: Array.from(nodeMap.values()),
    bindingEdges: validatedEdges,
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

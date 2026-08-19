import { createHash } from "node:crypto";
import { canonicalizeJcs } from "@zyppi/domain";
import type { CompositionError, CompositionErrorCode } from "./types.js";

/**
 * BCG Node representing an exact governed configuration constituent per AMS-0860-A.
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
 * Normalizes BCG identity-bearing collections using stable lexical sorting keys per AMS-0860-A.
 */
export function normalizeBcg(bcg: BoundConfigurationGraph): BoundConfigurationGraph {
  const nodes = [...bcg.nodes].sort((a, b) => {
    if (a.id !== b.id) return a.id.localeCompare(b.id);
    return a.version.localeCompare(b.version);
  });

  const bindingEdges = [...bcg.bindingEdges].sort((a, b) => {
    if (a.sourceRef !== b.sourceRef) return a.sourceRef.localeCompare(b.sourceRef);
    if (a.targetRef !== b.targetRef) return a.targetRef.localeCompare(b.targetRef);
    return a.dependencyKind.localeCompare(b.dependencyKind);
  });

  let opacityBoundaries: BcgOpacityBoundary[] | undefined;
  if (bcg.opacityBoundaries && bcg.opacityBoundaries.length > 0) {
    opacityBoundaries = [...bcg.opacityBoundaries].sort((a, b) => {
      if (a.foreignInterfaceRef !== b.foreignInterfaceRef) {
        return a.foreignInterfaceRef.localeCompare(b.foreignInterfaceRef);
      }
      return a.foreignReceiptDigest.localeCompare(b.foreignReceiptDigest);
    });
  }

  let externalIntegrityReferences: BcgForeignIntegrityReference[] | undefined;
  if (
    bcg.externalIntegrityReferences &&
    bcg.externalIntegrityReferences.length > 0
  ) {
    externalIntegrityReferences = [...bcg.externalIntegrityReferences].sort(
      (a, b) => {
        if (a.referenceId !== b.referenceId) {
          return a.referenceId.localeCompare(b.referenceId);
        }
        return a.digest.localeCompare(b.digest);
      },
    );
  }

  return Object.freeze({
    semanticConfigurationRef: bcg.semanticConfigurationRef,
    nodes: Object.freeze(nodes.map((n) => Object.freeze({ ...n }))),
    bindingEdges: Object.freeze(
      bindingEdges.map((e) => Object.freeze({ ...e })),
    ),
    ...(opacityBoundaries
      ? {
          opacityBoundaries: Object.freeze(
            opacityBoundaries.map((o) => Object.freeze({ ...o })),
          ),
        }
      : {}),
    ...(externalIntegrityReferences
      ? {
          externalIntegrityReferences: Object.freeze(
            externalIntegrityReferences.map((i) => Object.freeze({ ...i })),
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
          externalIntegrityReferences: normalized.externalIntegrityReferences.map(
            (i) => ({
              referenceId: i.referenceId,
              foreignInterfaceRef: i.foreignInterfaceRef,
              digest: i.digest,
            }),
          ),
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
 * Enforces explicit REQUIRES binding relations, cycle rejection (mapping to CONTRACT-12 'invalid'),
 * and fail-closed missing/unavailable dependency handling per AMS-0860-A.
 */
export function buildBoundConfigurationGraph(
  options: BcgClosureOptions,
): BcgClosureResult {
  const nodeMap = new Map<string, BcgNode>();
  for (const node of options.initialNodes) {
    nodeMap.set(node.id, node);
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

  // Perform transitive closure over REQUIRES edges
  const queue: string[] = Array.from(nodeMap.keys());
  const visitedNodes = new Set<string>(queue);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const outgoingEdges = validatedEdges.filter((e) => e.sourceRef === currentId);

    for (const edge of outgoingEdges) {
      const targetId = edge.targetRef;
      if (!nodeMap.has(targetId)) {
        // Look up target in available universe if provided
        if (options.availableUniverse && options.availableUniverse.has(targetId)) {
          const resolvedNode = options.availableUniverse.get(targetId)!;
          nodeMap.set(targetId, resolvedNode);
        } else {
          return {
            ok: false,
            error: {
              code: "missing" as CompositionErrorCode,
              category: "Composition Failure",
              message: `Exact dependency '${targetId}' required by '${currentId}' is missing or unavailable.`,
            },
          };
        }
      }

      if (!visitedNodes.has(targetId)) {
        visitedNodes.add(targetId);
        queue.push(targetId);
      }
    }
  }

  // Detect binding cycles over the transitive node set and REQUIRES edges
  const allNodeIds = Array.from(nodeMap.keys());
  const cycleCheck = detectBcgBindingCycle(allNodeIds, validatedEdges);
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

import type { CompositionError } from "./types.js";
import type { Participant } from "./participant.js";

/**
 * Structural edge tuple in T_struct per AMS-0858 §6 / §7.
 */
export interface StructuralEdge {
  readonly sourceId: string;
  readonly targetId: string;
  readonly relationKind: string;
}

/**
 * Binding edge tuple in T_bind per AMS-0858 §8 / §9.
 */
export interface BindingEdge {
  readonly sourceId: string;
  readonly targetId: string;
  readonly dependencyKind: string;
}

/**
 * Normalized cycle-safe Graph Topology model per AMS-0858 §7.
 * G = (V, E_struct, E_bind)
 */
export interface NormalizedTopologyGraph {
  readonly nodes: readonly string[];
  readonly eStruct: readonly StructuralEdge[];
  readonly eBind: readonly BindingEdge[];
}

export type TopologyValidationResult =
  | { readonly ok: true; readonly graph: NormalizedTopologyGraph }
  | { readonly ok: false; readonly error: CompositionError };

/**
 * Deterministically normalizes and sorts graph components according to AMS-0858 §7.
 * V: sorted participant identities
 * E_struct: sorted tuples by (sourceId, targetId, relationKind)
 * E_bind: sorted tuples by (sourceId, targetId, dependencyKind)
 */
export function normalizeTopologyGraph(
  participantIds: readonly string[],
  rawStructuralEdges: readonly StructuralEdge[],
  rawBindingEdges: readonly BindingEdge[],
): NormalizedTopologyGraph {
  // Sort node identities lexically
  const nodes = Array.from(new Set(participantIds)).sort();

  // Deduplicate and sort E_struct
  const structMap = new Map<string, StructuralEdge>();
  for (const edge of rawStructuralEdges) {
    const key = `${edge.sourceId}|${edge.targetId}|${edge.relationKind}`;
    if (!structMap.has(key)) {
      structMap.set(key, {
        sourceId: edge.sourceId,
        targetId: edge.targetId,
        relationKind: edge.relationKind,
      });
    }
  }
  const eStruct = Array.from(structMap.values()).sort((a, b) => {
    if (a.sourceId !== b.sourceId) return a.sourceId.localeCompare(b.sourceId);
    if (a.targetId !== b.targetId) return a.targetId.localeCompare(b.targetId);
    return a.relationKind.localeCompare(b.relationKind);
  });

  // Deduplicate and sort E_bind
  const bindMap = new Map<string, BindingEdge>();
  for (const edge of rawBindingEdges) {
    const key = `${edge.sourceId}|${edge.targetId}|${edge.dependencyKind}`;
    if (!bindMap.has(key)) {
      bindMap.set(key, {
        sourceId: edge.sourceId,
        targetId: edge.targetId,
        dependencyKind: edge.dependencyKind,
      });
    }
  }
  const eBind = Array.from(bindMap.values()).sort((a, b) => {
    if (a.sourceId !== b.sourceId) return a.sourceId.localeCompare(b.sourceId);
    if (a.targetId !== b.targetId) return a.targetId.localeCompare(b.targetId);
    return a.dependencyKind.localeCompare(b.dependencyKind);
  });

  return Object.freeze({
    nodes: Object.freeze(nodes),
    eStruct: Object.freeze(eStruct),
    eBind: Object.freeze(eBind),
  });
}

/**
 * Detects whether a directed graph represented by binding edges contains a cycle.
 * T_bind MUST be acyclic per AMS-0858 §8.
 */
export function detectBindingCycle(
  nodes: readonly string[],
  eBind: readonly BindingEdge[],
): { readonly hasCycle: boolean; readonly cycleNodes?: readonly string[] } {
  const adj = new Map<string, string[]>();
  for (const node of nodes) {
    adj.set(node, []);
  }
  for (const edge of eBind) {
    if (!adj.has(edge.sourceId)) adj.set(edge.sourceId, []);
    adj.get(edge.sourceId)!.push(edge.targetId);
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
 * Validates T_struct and T_bind separately against participants P according to AMS-0858 §6–§9.
 */
export function validateTopologyGraph(
  participants: readonly Participant[],
  rawStructuralEdges: readonly StructuralEdge[],
  rawBindingEdges: readonly BindingEdge[],
): TopologyValidationResult {
  const nodeSet = new Set(participants.map((p) => p.identity));

  // 1. Verify Node Existence for T_struct
  for (const edge of rawStructuralEdges) {
    if (!nodeSet.has(edge.sourceId)) {
      return {
        ok: false,
        error: {
          code: "invalid",
          category: "Composition Failure",
          message: `Structural edge source '${edge.sourceId}' not found in participants P`,
        },
      };
    }
    if (!nodeSet.has(edge.targetId)) {
      return {
        ok: false,
        error: {
          code: "invalid",
          category: "Composition Failure",
          message: `Structural edge target '${edge.targetId}' not found in participants P`,
        },
      };
    }
  }

  // 2. Verify Node Existence for T_bind
  for (const edge of rawBindingEdges) {
    if (!nodeSet.has(edge.sourceId)) {
      return {
        ok: false,
        error: {
          code: "invalid",
          category: "Composition Failure",
          message: `Binding edge source '${edge.sourceId}' not found in participants P`,
        },
      };
    }
    if (!nodeSet.has(edge.targetId)) {
      return {
        ok: false,
        error: {
          code: "invalid",
          category: "Composition Failure",
          message: `Binding edge target '${edge.targetId}' not found in participants P`,
        },
      };
    }
  }

  // 3. T_bind Cycle Check (T_bind MUST be acyclic, T_struct MAY contain cycles)
  const cycleResult = detectBindingCycle(Array.from(nodeSet), rawBindingEdges);
  if (cycleResult.hasCycle) {
    return {
      ok: false,
      error: {
        code: "incompatible",
        category: "Composition Failure",
        message: `Binding topology T_bind contains dependency cycle: ${cycleResult.cycleNodes?.join(" -> ")}`,
      },
    };
  }

  // 4. Normalize and return graph
  const normalizedGraph = normalizeTopologyGraph(
    Array.from(nodeSet),
    rawStructuralEdges,
    rawBindingEdges,
  );

  return { ok: true, graph: normalizedGraph };
}

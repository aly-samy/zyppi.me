/**
 * @file tools/workspace-policy.mjs
 * @description Executable operational workspace graph policy for Zyppi monorepo.
 *
 * GOVERNANCE NOTICE & AUTHORITY DISCLAIMER:
 * This policy module represents executable operational policy derived from higher-level
 * constitutional governance (CEngS-002 v2.1 "Engineering Rules" and CAW-004 v2.2 "Repository Map").
 * It is NOT independent constitutional authority. Authority flows from CEngS-002 v2.1.
 *
 * PROGRAM & ARCHITECTURE:
 * RGT-03 / RGT-04 Federated Workspace Graph Composition Policy.
 */

export const OPERATIONAL_POLICY_METADATA = Object.freeze({
  authoritySource: "CEngS-002 v2.1 · CAW-004 v2.2",
  policyType: "EXEC_OPERATIONAL_WORKSPACE_POLICY",
  isConstitutionalAuthority: false,
  failClosed: true,
});

/**
 * Platform-wide invariant rules enforced during workspace policy composition.
 */
export const PLATFORM_INVARIANTS = Object.freeze({
  allowCycles: false,
  allowTransitiveAuthorization: false,
  allowUnownedNodes: false,
  allowUnknownEdges: false,
});

/**
 * CAW (Commerce Atlas Wedge) Program Policy Fragment.
 * Governs the core CAW workspace nodes in the monorepo.
 */
export const CAW_PROGRAM_POLICY = Object.freeze({
  programId: "CAW",
  description: "Commerce Atlas Wedge",
  authoritySource: "CAW-004 v2.2",
  nodes: Object.freeze([
    {
      node: "packages/domain",
      packageName: "@zyppi/domain",
      owner: "CAW",
      role: "foundation",
      productionDependencies: [],
      devOnlyDependencies: [],
    },
    {
      node: "packages/shared",
      packageName: "@zyppi/shared",
      owner: "CAW",
      role: "foundation",
      productionDependencies: [],
      devOnlyDependencies: [],
    },
    {
      node: "packages/contracts",
      packageName: "@zyppi/contracts",
      owner: "CAW",
      role: "contracts",
      productionDependencies: ["packages/domain"],
      devOnlyDependencies: [],
    },
    {
      node: "packages/runtime",
      packageName: "@zyppi/runtime",
      owner: "CAW",
      role: "runtime-kernel",
      productionDependencies: ["packages/domain", "packages/shared"],
      devOnlyDependencies: [],
    },
    {
      node: "packages/testing",
      packageName: "@zyppi/testing",
      owner: "CAW",
      role: "testing-support",
      productionDependencies: [],
      devOnlyDependencies: [
        "packages/domain",
        "packages/contracts",
        "packages/runtime",
        "packages/shared",
      ],
    },
    {
      node: "apps/api",
      packageName: "@zyppi/api",
      owner: "CAW",
      role: "application-api",
      productionDependencies: [
        "packages/runtime",
        "packages/domain",
        "packages/contracts",
      ],
      devOnlyDependencies: ["packages/testing"],
    },
    {
      node: "apps/web",
      packageName: "@zyppi/web",
      owner: "CAW",
      role: "application-web",
      productionDependencies: [
        "packages/contracts",
        "packages/domain",
        "packages/shared",
      ],
      devOnlyDependencies: ["packages/testing"],
    },
    {
      node: "edge/worker",
      packageName: null,
      owner: "CAW",
      role: "edge-worker",
      productionDependencies: ["packages/contracts"],
      devOnlyDependencies: [],
    },
    {
      node: "infra",
      packageName: "@zyppi/infra",
      owner: "CAW",
      role: "infrastructure",
      productionDependencies: [],
      devOnlyDependencies: [],
    },
  ]),
});

/**
 * Detects cycles in a directed graph of nodes and their dependencies.
 * @param {Map<string, Set<string>>} graph
 * @returns {string[] | null} Cycle path if detected, else null.
 */
function detectCycle(graph) {
  const visited = new Map(); // node -> 'visiting' | 'visited'
  const path = [];

  for (const node of graph.keys()) {
    visited.set(node, "unvisited");
  }

  function dfs(u) {
    visited.set(u, "visiting");
    path.push(u);

    const neighbors = graph.get(u) || new Set();
    for (const v of neighbors) {
      const state = visited.get(v);
      if (state === "visiting") {
        const cycleStart = path.indexOf(v);
        return [...path.slice(cycleStart), v];
      }
      if (state === "unvisited") {
        const cycle = dfs(v);
        if (cycle) return cycle;
      }
    }

    path.pop();
    visited.set(u, "visited");
    return null;
  }

  for (const node of graph.keys()) {
    if (visited.get(node) === "unvisited") {
      const cycle = dfs(node);
      if (cycle) return cycle;
    }
  }

  return null;
}

/**
 * Pure deterministic composition function that produces an effective workspace policy
 * from platform invariants and program policy fragments.
 *
 * @param {Array<{ programId: string, description?: string, nodes: Array<any> }>} programFragments
 * @param {typeof PLATFORM_INVARIANTS} [invariants=PLATFORM_INVARIANTS]
 * @returns {{
 *   metadata: typeof OPERATIONAL_POLICY_METADATA,
 *   invariants: typeof PLATFORM_INVARIANTS,
 *   nodes: Map<string, any>,
 *   packageToNode: Map<string, string>,
 *   programs: string[],
 *   policy: Record<string, { production: string[], devOnly: string[] }>
 * }} Effective composed workspace policy
 */
export function composeWorkspacePolicy(
  programFragments,
  invariants = PLATFORM_INVARIANTS,
) {
  if (!Array.isArray(programFragments)) {
    throw new Error(
      "programFragments must be an array of program policy fragments",
    );
  }

  const nodesMap = new Map();
  const packageToNodeMap = new Map();
  const programsList = [];
  const dependencyGraph = new Map(); // node -> Set of all allowed target nodes (production + devOnly)

  for (const fragment of programFragments) {
    if (
      !fragment ||
      typeof fragment.programId !== "string" ||
      !fragment.programId
    ) {
      throw new Error("Program fragment missing valid programId");
    }

    if (!Array.isArray(fragment.nodes)) {
      throw new Error(
        `Program fragment "${fragment.programId}" nodes must be an array`,
      );
    }

    if (!programsList.includes(fragment.programId)) {
      programsList.push(fragment.programId);
    }

    for (const rawNodeDef of fragment.nodes) {
      if (
        !rawNodeDef ||
        typeof rawNodeDef.node !== "string" ||
        !rawNodeDef.node
      ) {
        throw new Error(
          `Invalid node definition in program "${fragment.programId}"`,
        );
      }

      const nodePath = rawNodeDef.node;

      // Check duplicate node ownership across program fragments
      if (nodesMap.has(nodePath)) {
        const existing = nodesMap.get(nodePath);
        if (existing.owner !== fragment.programId) {
          throw new Error(
            `Ownership conflict for workspace node "${nodePath}": owned by both "${existing.owner}" and "${fragment.programId}"`,
          );
        }

        // Check node definition equality if re-declared
        const isIdentical =
          existing.packageName === rawNodeDef.packageName &&
          existing.role === rawNodeDef.role &&
          JSON.stringify(existing.productionDependencies) ===
            JSON.stringify(rawNodeDef.productionDependencies) &&
          JSON.stringify(existing.devOnlyDependencies) ===
            JSON.stringify(rawNodeDef.devOnlyDependencies);

        if (!isIdentical) {
          throw new Error(
            `Conflicting node definition for "${nodePath}" in program fragment "${fragment.programId}"`,
          );
        }
        // Duplicate compatible declaration -> no widening, keep existing
        continue;
      }

      const nodeDef = Object.freeze({
        node: nodePath,
        packageName: rawNodeDef.packageName ?? null,
        owner: fragment.programId,
        role: rawNodeDef.role ?? "unassigned",
        productionDependencies: Object.freeze([
          ...(rawNodeDef.productionDependencies || []),
        ]),
        devOnlyDependencies: Object.freeze([
          ...(rawNodeDef.devOnlyDependencies || []),
        ]),
      });

      nodesMap.set(nodePath, nodeDef);

      if (nodeDef.packageName) {
        if (packageToNodeMap.has(nodeDef.packageName)) {
          const existingNode = packageToNodeMap.get(nodeDef.packageName);
          if (existingNode !== nodePath) {
            throw new Error(
              `Package name conflict: "${nodeDef.packageName}" mapped to both "${existingNode}" and "${nodePath}"`,
            );
          }
        }
        packageToNodeMap.set(nodeDef.packageName, nodePath);
      }
    }
  }

  // Validate all target dependency nodes exist in composed policy (fail closed on unknown edge targets)
  for (const [nodePath, nodeDef] of nodesMap.entries()) {
    const allDeps = [
      ...nodeDef.productionDependencies,
      ...nodeDef.devOnlyDependencies,
    ];
    const depSet = new Set();

    for (const dep of allDeps) {
      if (!nodesMap.has(dep)) {
        throw new Error(
          `Node "${nodePath}" declares dependency on unknown workspace node "${dep}"`,
        );
      }
      depSet.add(dep);
    }

    dependencyGraph.set(nodePath, depSet);
  }

  // Cycle check if prohibited by invariants
  if (!invariants.allowCycles) {
    const cyclePath = detectCycle(dependencyGraph);
    if (cyclePath) {
      throw new Error(
        `Dependency cycle detected in composed policy: ${cyclePath.join(" -> ")}`,
      );
    }
  }

  // Build policy dictionary compatible with legacy interface
  const policyDict = {};
  for (const [nodePath, nodeDef] of nodesMap.entries()) {
    policyDict[nodePath] = {
      production: [...nodeDef.productionDependencies],
      devOnly: [...nodeDef.devOnlyDependencies],
    };
  }

  return Object.freeze({
    metadata: OPERATIONAL_POLICY_METADATA,
    invariants,
    programs: Object.freeze(programsList),
    nodes: nodesMap,
    packageToNode: packageToNodeMap,
    policy: Object.freeze(policyDict),
  });
}

/**
 * Effective active composed workspace policy for the current monorepo.
 */
/**
 * ZII (Zyppi Interaction Infrastructure) Program Policy Fragment.
 * Governs the ZII / ZQE engine-core package in the monorepo.
 */
export const ZII_PROGRAM_POLICY = Object.freeze({
  programId: "ZII",
  description: "Zyppi Interaction Infrastructure",
  authoritySource: "ZII-001 v1.0 · ZQE-001 v1.0 · ZQE-PLAN v0.2",
  nodes: Object.freeze([
    {
      node: "packages/qr-core",
      packageName: "@zyppi/qr-core",
      owner: "ZII",
      role: "engine-core",
      productionDependencies: [],
      devOnlyDependencies: [],
    },
    {
      node: "packages/qr-svg",
      packageName: "@zyppi/qr-svg",
      owner: "ZII",
      role: "engine-renderer",
      productionDependencies: ["packages/qr-core"],
      devOnlyDependencies: [],
    },
  ]),
});

/**
 * Effective active composed workspace policy for the current monorepo.
 */
export const ACTIVE_WORKSPACE_POLICY = composeWorkspacePolicy([
  CAW_PROGRAM_POLICY,
  ZII_PROGRAM_POLICY,
]);

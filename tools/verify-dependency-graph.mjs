import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

/**
 * Runs the constitutional dependency graph validator on the given workspace root.
 * Enforces CAW-004 v2.1 ownership and import policies across three layers:
 * 1. package.json dependency declarations
 * 2. tsconfig.json project references
 * 3. Actual TypeScript source-level AST imports/exports
 * 4. AMS-0861-A GS1 Domain-Edge Isolation Policy (GENERIC_ZPROF & GENERIC_APPLICATION_ORCHESTRATION)
 */
export function runValidation(workspaceRoot = process.cwd()) {
  const violations = [];
  const edges = new Set();
  let fileCount = 0;

  // Resolve symlinks to ensure path.relative operates on real paths
  try {
    workspaceRoot = fs.realpathSync(workspaceRoot);
  } catch {
    // Ignore if path doesn't exist
  }

  const NODES = [
    "packages/domain",
    "packages/shared",
    "packages/contracts",
    "packages/runtime",
    "packages/testing",
    "apps/api",
    "apps/web",
    "edge/worker",
    "infra",
  ];

  const PACKAGE_TO_NODE = {
    "@zyppi/domain": "packages/domain",
    "@zyppi/shared": "packages/shared",
    "@zyppi/contracts": "packages/contracts",
    "@zyppi/runtime": "packages/runtime",
    "@zyppi/testing": "packages/testing",
    "@zyppi/api": "apps/api",
    "@zyppi/web": "apps/web",
    "@zyppi/infra": "infra",
  };

  const POLICY = {
    "packages/domain": { production: [], devOnly: [] },
    "packages/shared": { production: [], devOnly: [] },
    "packages/contracts": { production: ["packages/domain"], devOnly: [] },
    "packages/runtime": {
      production: ["packages/domain", "packages/shared"],
      devOnly: [],
    },
    "packages/testing": {
      production: [],
      devOnly: [
        "packages/domain",
        "packages/contracts",
        "packages/runtime",
        "packages/shared",
      ],
    },
    "apps/api": {
      production: ["packages/runtime", "packages/domain", "packages/contracts"],
      devOnly: ["packages/testing"],
    },
    "apps/web": {
      production: ["packages/contracts", "packages/domain", "packages/shared"],
      devOnly: ["packages/testing"],
    },
    "edge/worker": { production: ["packages/contracts"], devOnly: [] },
    infra: {
      production: [],
      devOnly: [
        "packages/domain",
        "packages/contracts",
        "packages/testing",
        "packages/shared",
      ],
    },
  };

  const isTransitivelyReachable = (source, target) => {
    const visited = new Set();
    const queue = [source];
    while (queue.length > 0) {
      const curr = queue.shift();
      if (curr === target && curr !== source) return true;
      if (visited.has(curr)) continue;
      visited.add(curr);
      const neighbors = POLICY[curr]?.production || [];
      for (const n of neighbors) {
        queue.push(n);
      }
    }
    return false;
  };

  // Helper to check if a file is development context
  const isFileDevContext = (relativeFilePath) => {
    const normalized = relativeFilePath.split(path.sep).join("/");
    const filename = path.basename(normalized);
    if (
      filename.endsWith(".test.ts") ||
      filename.endsWith(".test.tsx") ||
      filename.endsWith(".spec.ts") ||
      filename.endsWith(".spec.tsx")
    ) {
      return true;
    }
    const parts = normalized.split("/");
    const devDirs = new Set([
      "test",
      "tests",
      "__tests__",
      "fixtures",
      "testing",
    ]);
    for (let i = 0; i < parts.length - 1; i++) {
      if (devDirs.has(parts[i])) {
        return true;
      }
    }
    return false;
  };

  // Helper to find TS files
  const findTsFiles = (dir) => {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    const walk = (currentDir) => {
      const list = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const item of list) {
        const fullPath = path.join(currentDir, item.name);
        if (item.isDirectory()) {
          if (
            item.name === "node_modules" ||
            item.name === "dist" ||
            item.name === "build" ||
            item.name === "coverage" ||
            item.name === ".turbo" ||
            item.name === "temp"
          ) {
            continue;
          }
          walk(fullPath);
        } else if (item.isFile()) {
          const ext = path.extname(item.name);
          if (
            (ext === ".ts" || ext === ".tsx") &&
            !item.name.endsWith(".d.ts")
          ) {
            results.push(fullPath);
          }
        }
      }
    };
    walk(dir);
    return results;
  };

  const getImportsOfFile = (fileContent, relativeFilePath) => {
    const imports = [];
    const sourceFile = ts.createSourceFile(
      relativeFilePath,
      fileContent,
      ts.ScriptTarget.ES2022,
      true,
    );

    const checkModuleSpecifier = (node) => {
      if (!node) return;
      if (ts.isStringLiteral(node)) {
        imports.push({
          specifier: node.text,
          line:
            sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          column:
            sourceFile.getLineAndCharacterOfPosition(node.getStart())
              .character + 1,
        });
      }
    };

    const visit = (node) => {
      if (ts.isImportDeclaration(node)) {
        checkModuleSpecifier(node.moduleSpecifier);
      } else if (ts.isExportDeclaration(node)) {
        checkModuleSpecifier(node.moduleSpecifier);
      } else if (ts.isImportEqualsDeclaration(node)) {
        if (
          node.moduleReference &&
          ts.isExternalModuleReference(node.moduleReference)
        ) {
          checkModuleSpecifier(node.moduleReference.expression);
        }
      } else if (ts.isCallExpression(node)) {
        const expression = node.expression;
        if (expression.kind === ts.SyntaxKind.ImportKeyword) {
          checkModuleSpecifier(node.arguments[0]);
        } else if (
          ts.isIdentifier(expression) &&
          expression.text === "require"
        ) {
          checkModuleSpecifier(node.arguments[0]);
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return imports;
  };

  // Helper to build internal module import graph for apps/api/src/
  const apiModuleGraph = new Map(); // relativeFilePath -> set of resolved relativeFilePaths inside apps/api/src/
  const absoluteApiDir = path.resolve(workspaceRoot, "apps/api");

  if (fs.existsSync(absoluteApiDir)) {
    const apiFiles = findTsFiles(absoluteApiDir);
    for (const absoluteFilePath of apiFiles) {
      const relativeFilePath = path
        .relative(workspaceRoot, absoluteFilePath)
        .split(path.sep)
        .join("/");
      const content = fs.readFileSync(absoluteFilePath, "utf8");
      const imports = getImportsOfFile(content, relativeFilePath);
      const targets = new Set();

      for (const imp of imports) {
        const spec = imp.specifier;
        if (spec.startsWith(".") || spec.startsWith("/")) {
          const fileDir = path.dirname(absoluteFilePath);
          let resolved = path.normalize(path.join(fileDir, spec));
          if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
            resolved = path.join(resolved, "index.ts");
          } else if (!resolved.endsWith(".ts") && !resolved.endsWith(".tsx")) {
            if (fs.existsSync(resolved + ".ts")) resolved = resolved + ".ts";
            else if (fs.existsSync(resolved + ".tsx"))
              resolved = resolved + ".tsx";
          }
          const relResolved = path
            .relative(workspaceRoot, resolved)
            .split(path.sep)
            .join("/");
          if (relResolved.startsWith("apps/api/src/")) {
            targets.add(relResolved);
          }
        }
      }
      apiModuleGraph.set(relativeFilePath, targets);
    }
  }

  // Transitive reachability inside apps/api/src
  const canReachGs1Module = (startFile) => {
    const visited = new Set();
    const queue = [startFile];
    while (queue.length > 0) {
      const curr = queue.shift();
      if (curr.startsWith("apps/api/src/gs1/")) return true;
      if (visited.has(curr)) continue;
      visited.add(curr);
      const neighbors = apiModuleGraph.get(curr) || new Set();
      for (const n of neighbors) {
        queue.push(n);
      }
    }
    return false;
  };

  // 1. Process each constitutional node
  for (const node of NODES) {
    const absoluteNodeDir = path.resolve(workspaceRoot, node);
    if (!fs.existsSync(absoluteNodeDir)) {
      continue;
    }

    // A. Validate package.json dependencies
    const pjPath = path.join(absoluteNodeDir, "package.json");
    if (fs.existsSync(pjPath)) {
      const pjContent = fs.readFileSync(pjPath, "utf8");
      let pj;
      try {
        pj = JSON.parse(pjContent);
      } catch (err) {
        violations.push({
          node,
          layer: "manifest",
          file: path.relative(workspaceRoot, pjPath),
          line: 1,
          column: 1,
          rule: "unclassifiable-manifest",
          description: `Failed to parse package.json: ${err.message}`,
        });
      }

      if (pj) {
        const validateField = (field, context) => {
          if (pj[field] && typeof pj[field] === "object") {
            for (const depName of Object.keys(pj[field])) {
              if (depName.startsWith("@zyppi/")) {
                const targetNode = PACKAGE_TO_NODE[depName];
                if (!targetNode) {
                  violations.push({
                    node,
                    layer: "manifest",
                    file: path.relative(workspaceRoot, pjPath),
                    line: 1,
                    column: 1,
                    rule: "unrecognized-workspace-edge",
                    description: `Unrecognized workspace package dependency: "${depName}" in "${field}" of "${path.relative(workspaceRoot, pjPath)}".`,
                  });
                  continue;
                }

                edges.add(`${node}->${targetNode}`);

                const policy = POLICY[node];
                if (context === "production") {
                  const allowed = policy.production.includes(targetNode);
                  if (!allowed) {
                    const isDevOnlyAllowed =
                      policy.devOnly.includes(targetNode);
                    if (isDevOnlyAllowed) {
                      violations.push({
                        node,
                        layer: "manifest",
                        file: path.relative(workspaceRoot, pjPath),
                        line: 1,
                        column: 1,
                        rule: "dev-only-used-in-production",
                        description: `Production use of dev-only edge: Manifest dependency "${depName}" is in "${field}" which is production context, but the edge is authorized only for development.`,
                      });
                    } else {
                      const transitive = isTransitivelyReachable(
                        node,
                        targetNode,
                      );
                      const explanation = transitive
                        ? ` Transitive reachability from "${node}" to "${targetNode}" does not grant direct authorization.`
                        : "";
                      violations.push({
                        node,
                        layer: "manifest",
                        file: path.relative(workspaceRoot, pjPath),
                        line: 1,
                        column: 1,
                        rule: "unauthorized-production-dependency",
                        description: `Unauthorized production dependency: Manifest dependency "${depName}" in "${field}" of "${path.relative(workspaceRoot, pjPath)}" is not authorized.${explanation}`,
                      });
                    }
                  }
                } else {
                  // Development context: allowed if in production OR devOnly
                  const allowed =
                    policy.production.includes(targetNode) ||
                    policy.devOnly.includes(targetNode);
                  if (!allowed) {
                    const transitive = isTransitivelyReachable(
                      node,
                      targetNode,
                    );
                    const explanation = transitive
                      ? ` Transitive reachability from "${node}" to "${targetNode}" does not grant direct authorization.`
                      : "";
                    violations.push({
                      node,
                      layer: "manifest",
                      file: path.relative(workspaceRoot, pjPath),
                      line: 1,
                      column: 1,
                      rule: "unauthorized-dev-dependency",
                      description: `Unauthorized development dependency: Manifest dependency "${depName}" in "${field}" of "${path.relative(workspaceRoot, pjPath)}" is not authorized.${explanation}`,
                    });
                  }
                }
              }
            }
          }
        };

        validateField("dependencies", "production");
        validateField("peerDependencies", "production");
        validateField("devDependencies", "development");
      }
    }

    // B. Validate tsconfig.json project references
    const tsconfigPath = path.join(absoluteNodeDir, "tsconfig.json");
    if (fs.existsSync(tsconfigPath)) {
      let tsconfig;
      try {
        const readResult = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
        if (readResult.error) {
          violations.push({
            node,
            layer: "tsconfig",
            file: path.relative(workspaceRoot, tsconfigPath),
            line: 1,
            column: 1,
            rule: "unclassifiable-tsconfig",
            description: `Failed to read tsconfig.json: ${readResult.error.messageText}`,
          });
        } else {
          tsconfig = readResult.config;
        }
      } catch (err) {
        violations.push({
          node,
          layer: "tsconfig",
          file: path.relative(workspaceRoot, tsconfigPath),
          line: 1,
          column: 1,
          rule: "unclassifiable-tsconfig",
          description: `Failed to parse tsconfig.json: ${err.message}`,
        });
      }

      if (tsconfig && Array.isArray(tsconfig.references)) {
        for (const ref of tsconfig.references) {
          if (typeof ref.path === "string") {
            const resolvedPath = path.normalize(
              path.join(absoluteNodeDir, ref.path),
            );
            const relativeToRoot = path
              .relative(workspaceRoot, resolvedPath)
              .split(path.sep)
              .join("/");

            const targetNode = NODES.find(
              (n) => relativeToRoot === n || relativeToRoot === `./${n}`,
            );

            if (!targetNode) {
              violations.push({
                node,
                layer: "tsconfig",
                file: path.relative(workspaceRoot, tsconfigPath),
                line: 1,
                column: 1,
                rule: "unauthorized-project-reference",
                description: `Unauthorized project reference: reference path "${ref.path}" resolves to "${relativeToRoot}" which is not a recognized workspace member.`,
              });
            } else {
              edges.add(`${node}->${targetNode}`);

              const policy = POLICY[node];
              const allowed =
                policy.production.includes(targetNode) ||
                policy.devOnly.includes(targetNode);
              if (!allowed) {
                violations.push({
                  node,
                  layer: "tsconfig",
                  file: path.relative(workspaceRoot, tsconfigPath),
                  line: 1,
                  column: 1,
                  rule: "unauthorized-project-reference",
                  description: `Unauthorized project reference: "${node}" is not authorized to reference "${targetNode}" in its tsconfig.`,
                });
              }
            }
          }
        }
      }
    }

    // C. Validate Source File Imports
    const files = findTsFiles(absoluteNodeDir);
    for (const absoluteFilePath of files) {
      const relativeFilePath = path
        .relative(workspaceRoot, absoluteFilePath)
        .split(path.sep)
        .join("/");
      fileCount++;

      const content = fs.readFileSync(absoluteFilePath, "utf8");
      const imports = getImportsOfFile(content, relativeFilePath);

      // Check AMS-0861-A GS1 domain-edge isolation rule for generic modules
      const isGenericZprof = relativeFilePath.startsWith("apps/api/src/zprof/");
      const isGenericOrchestration =
        relativeFilePath.startsWith("apps/api/src/registry/") ||
        relativeFilePath.startsWith("apps/api/src/evidence/");

      if (isGenericZprof || isGenericOrchestration) {
        if (canReachGs1Module(relativeFilePath)) {
          violations.push({
            node,
            layer: "source",
            file: relativeFilePath,
            line: 1,
            column: 1,
            rule: "gs1-domain-edge-contamination",
            description: `Unauthorized direct or transitive GS1 domain-edge import in generic module "${relativeFilePath}". Generic orchestration/Z-PROF modules must not import GS1 implementations.`,
          });
        }
      }

      for (const imp of imports) {
        const specifier = imp.specifier;
        const line = imp.line;
        const column = imp.column;

        if (specifier.startsWith(".") || specifier.startsWith("/")) {
          const fileDir = path.dirname(absoluteFilePath);
          const resolvedPath = path.normalize(path.join(fileDir, specifier));
          const relativeResolved = path
            .relative(workspaceRoot, resolvedPath)
            .split(path.sep)
            .join("/");

          // Check if it escapes the owning workspace member
          const nodePrefix = node + "/";
          if (!relativeResolved.startsWith(nodePrefix)) {
            const targetNode = NODES.find(
              (n) =>
                relativeResolved.startsWith(n + "/") || relativeResolved === n,
            );
            if (targetNode) {
              // Boundary skipped!
              violations.push({
                node,
                layer: "source",
                file: relativeFilePath,
                line,
                column,
                rule: "relative-boundary-skipping",
                description: `Prohibited relative import escaping workspace boundary: "${specifier}" in "${relativeFilePath}" resolves to "${relativeResolved}" which crosses into "${targetNode}".`,
              });
              edges.add(`${node}->${targetNode}`);
            }
          }
        } else if (specifier.startsWith("@zyppi/")) {
          const parts = specifier.split("/");
          const packageName = parts.slice(0, 2).join("/");
          const targetNode = PACKAGE_TO_NODE[packageName];

          if (!targetNode) {
            violations.push({
              node,
              layer: "source",
              file: relativeFilePath,
              line,
              column,
              rule: "unrecognized-workspace-edge",
              description: `Unrecognized workspace package import: "${specifier}" in "${relativeFilePath}".`,
            });
          } else {
            edges.add(`${node}->${targetNode}`);

            const isDevContext = isFileDevContext(relativeFilePath);
            const policy = POLICY[node];

            if (isDevContext) {
              const allowed =
                policy.production.includes(targetNode) ||
                policy.devOnly.includes(targetNode);
              if (!allowed) {
                const transitive = isTransitivelyReachable(node, targetNode);
                const explanation = transitive
                  ? ` Transitive reachability from "${node}" to "${targetNode}" does not grant direct authorization.`
                  : "";

                const isSiblingViolation =
                  (node.startsWith("apps/") || node.startsWith("edge/")) &&
                  (targetNode.startsWith("apps/") ||
                    targetNode.startsWith("edge/"));
                const ruleName = isSiblingViolation
                  ? "sibling-contamination"
                  : "unauthorized-dev-dependency";
                const description = isSiblingViolation
                  ? `unauthorized sibling application or edge coupling: "${node}" is not authorized to import "${targetNode}" (${specifier}).`
                  : `Unauthorized development import: "${node}" is not authorized to import "${targetNode}" (${specifier}) in dev context.${explanation}`;

                violations.push({
                  node,
                  layer: "source",
                  file: relativeFilePath,
                  line,
                  column,
                  rule: ruleName,
                  description,
                });
              }
            } else {
              const allowed = policy.production.includes(targetNode);
              if (!allowed) {
                const isDevOnlyAllowed = policy.devOnly.includes(targetNode);
                if (isDevOnlyAllowed) {
                  violations.push({
                    node,
                    layer: "source",
                    file: relativeFilePath,
                    line,
                    column,
                    rule: "dev-only-used-in-production",
                    description: `Production use of dev-only edge: "${node}" imports "${targetNode}" (${specifier}) which is authorized only as a dev-only edge, but was used in production context.`,
                  });
                } else {
                  const transitive = isTransitivelyReachable(node, targetNode);
                  const explanation = transitive
                    ? ` Transitive reachability from "${node}" to "${targetNode}" does not grant direct authorization.`
                    : "";

                  const isSiblingViolation =
                    (node.startsWith("apps/") || node.startsWith("edge/")) &&
                    (targetNode.startsWith("apps/") ||
                      targetNode.startsWith("edge/"));
                  const ruleName = isSiblingViolation
                    ? "sibling-contamination"
                    : "unauthorized-production-dependency";
                  const description = isSiblingViolation
                    ? `unauthorized sibling application or edge coupling: "${node}" is not authorized to import "${targetNode}" (${specifier}).`
                    : `Unauthorized production import: "${node}" is not authorized to import "${targetNode}" (${specifier}) in production context.${explanation}`;

                  violations.push({
                    node,
                    layer: "source",
                    file: relativeFilePath,
                    line,
                    column,
                    rule: ruleName,
                    description,
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  // 2. Cycle Detection
  const findCycle = (edgesSet) => {
    const adj = {};
    for (const n of NODES) {
      adj[n] = [];
    }
    for (const edge of edgesSet) {
      const [u, v] = edge.split("->");
      if (adj[u]) {
        adj[u].push(v);
      }
    }

    const visited = {};
    for (const n of NODES) {
      visited[n] = "unvisited";
    }

    const pathTrace = [];

    const dfs = (u) => {
      visited[u] = "visiting";
      pathTrace.push(u);

      for (const v of adj[u]) {
        if (visited[v] === "visiting") {
          const cyclePath = pathTrace.slice(pathTrace.indexOf(v));
          cyclePath.push(v);
          return cyclePath;
        } else if (visited[v] === "unvisited") {
          const cycle = dfs(v);
          if (cycle) return cycle;
        }
      }

      pathTrace.pop();
      visited[u] = "visited";
      return null;
    };

    for (const n of NODES) {
      if (visited[n] === "unvisited") {
        const cycle = dfs(n);
        if (cycle) return cycle;
      }
    }

    return null;
  };

  const cycle = findCycle(edges);
  if (cycle) {
    violations.push({
      node: cycle[0],
      layer: "graph",
      file: "N/A",
      line: 0,
      column: 0,
      rule: "dependency-cycle",
      description: `Dependency cycle detected: ${cycle.join(" -> ")}`,
    });
  }

  return { violations, fileCount, nodeCount: NODES.length };
}

// Execute when invoked directly as a CLI script
if (
  import.meta.url === `file://${process.argv[1]}` ||
  (process.argv[1] &&
    path.resolve(process.argv[1]) ===
      path.resolve(new URL(import.meta.url).pathname))
) {
  const workspaceRoot = process.cwd();
  const { violations, fileCount, nodeCount } = runValidation(workspaceRoot);

  if (violations.length > 0) {
    const sorted = [...violations].sort((a, b) => {
      if (a.node !== b.node) return a.node.localeCompare(b.node);
      if (a.layer !== b.layer) return a.layer.localeCompare(b.layer);
      if (a.file !== b.file) return a.file.localeCompare(b.file);
      const aLine = a.line || 0;
      const bLine = b.line || 0;
      if (aLine !== bLine) return aLine - bLine;
      const aCol = a.column || 0;
      const bCol = b.column || 0;
      return aCol - bCol;
    });

    console.error("Zyppi Constitutional Dependency Graph Validator: FAIL\n");
    for (const v of sorted) {
      console.error(`Violation in workspace member: ${v.node}`);
      console.error(`- Layer: ${v.layer}`);
      console.error(`- File: ${v.file}`);
      if (v.line || v.column) {
        console.error(`- Location: ${v.line}:${v.column}`);
      }
      console.error(`- Rule Violated: ${v.rule}`);
      console.error(`- Diagnostics: ${v.description}`);
      console.error();
    }
    process.exit(1);
  }

  console.log("Zyppi Constitutional Dependency Graph Validator: PASS");
  console.log(`- Graph layout: Valid (conforms to CAW-004 v2.1)`);
  console.log(`- Workspace members analyzed: ${nodeCount}`);
  console.log(`- Source files scanned: ${fileCount}\n`);
  process.exit(0);
}

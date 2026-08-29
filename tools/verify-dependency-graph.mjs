import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { ACTIVE_WORKSPACE_POLICY } from "./workspace-policy.mjs";

/**
 * Runs the constitutional workspace dependency graph validator.
 * Enforces CEngS-002 v2.1 / CAW-004 v2.2 workspace policy across three layers:
 * 1. package.json dependency declarations
 * 2. tsconfig.json project references
 * 3. Actual TypeScript source-level AST imports/exports
 * 4. Fail-closed check for unowned workspace directories on disk
 *
 * @param {string} [workspaceRoot=process.cwd()]
 * @param {typeof ACTIVE_WORKSPACE_POLICY} [effectivePolicy=ACTIVE_WORKSPACE_POLICY]
 */
export function runValidation(
  workspaceRoot = process.cwd(),
  effectivePolicy = ACTIVE_WORKSPACE_POLICY,
) {
  const violations = [];
  const edges = new Set();
  let fileCount = 0;

  try {
    workspaceRoot = fs.realpathSync(workspaceRoot);
  } catch {
    // Ignore if path doesn't exist
  }

  const { nodes, packageToNode, policy } = effectivePolicy;
  const NODES = Array.from(nodes.keys());
  const PACKAGE_TO_NODE = Object.fromEntries(packageToNode.entries());
  const POLICY = policy;

  // 0. Scan filesystem for unowned workspace member directories under workspace roots (packages/, apps/, edge/, infra)
  const WORKSPACE_ROOT_DIRS = ["packages", "apps", "edge", "infra"];
  for (const rootDirName of WORKSPACE_ROOT_DIRS) {
    const absRootDir = path.resolve(workspaceRoot, rootDirName);
    if (fs.existsSync(absRootDir)) {
      if (rootDirName === "infra") {
        if (!nodes.has("infra")) {
          violations.push({
            node: "infra",
            layer: "workspace",
            file: "infra",
            line: 1,
            column: 1,
            rule: "unowned-workspace-node",
            description: `Unowned workspace node: directory "infra" exists on disk but is absent from composed workspace policy.`,
          });
        }
      } else {
        const subItems = fs.readdirSync(absRootDir, { withFileTypes: true });
        for (const item of subItems) {
          if (
            item.isDirectory() &&
            item.name !== "node_modules" &&
            item.name !== "dist" &&
            item.name !== "build" &&
            item.name !== "coverage" &&
            !item.name.startsWith(".")
          ) {
            const relNodePath = `${rootDirName}/${item.name}`;
            if (!nodes.has(relNodePath)) {
              violations.push({
                node: relNodePath,
                layer: "workspace",
                file: relNodePath,
                line: 1,
                column: 1,
                rule: "unowned-workspace-node",
                description: `Unowned workspace node: directory "${relNodePath}" exists on disk but is absent from composed workspace policy.`,
              });
            }
          }
        }
      }
    }
  }

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

  // 1. Process each governed workspace node
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

                const policyRule = POLICY[node] || {
                  production: [],
                  devOnly: [],
                };
                if (context === "production") {
                  const allowed = policyRule.production.includes(targetNode);
                  if (!allowed) {
                    const isDevOnlyAllowed =
                      policyRule.devOnly.includes(targetNode);
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
                  const allowed =
                    policyRule.production.includes(targetNode) ||
                    policyRule.devOnly.includes(targetNode);
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

              const policyRule = POLICY[node] || {
                production: [],
                devOnly: [],
              };
              const allowed =
                policyRule.production.includes(targetNode) ||
                policyRule.devOnly.includes(targetNode);
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

          const nodePrefix = node + "/";
          if (!relativeResolved.startsWith(nodePrefix)) {
            const targetNode = NODES.find(
              (n) =>
                relativeResolved.startsWith(n + "/") || relativeResolved === n,
            );
            if (targetNode) {
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
            const policyRule = POLICY[node] || { production: [], devOnly: [] };

            if (isDevContext) {
              const allowed =
                policyRule.production.includes(targetNode) ||
                policyRule.devOnly.includes(targetNode);
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
              const allowed = policyRule.production.includes(targetNode);
              if (!allowed) {
                const isDevOnlyAllowed =
                  policyRule.devOnly.includes(targetNode);
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

      for (const v of adj[u] || []) {
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
  console.log(
    `- Graph layout: Valid (conforms to CEngS-002 v2.1 / CAW-004 v2.2)`,
  );
  console.log(`- Workspace members analyzed: ${nodeCount}`);
  console.log(`- Source files scanned: ${fileCount}\n`);
  process.exit(0);
}

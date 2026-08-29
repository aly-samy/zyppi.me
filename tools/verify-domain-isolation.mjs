import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

/**
 * Runs the CAW/GS1/Z-PROF Domain-Edge Isolation Validator.
 * Enforces domain isolation mechanics separating generic Z-PROF/orchestration
 * modules from domain-edge implementations (such as GS1).
 *
 * @param {string} [workspaceRoot=process.cwd()]
 * @returns {{ violations: Array<any>, fileCount: number }}
 */
export function runDomainIsolationValidation(workspaceRoot = process.cwd()) {
  const violations = [];
  let fileCount = 0;

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

  const loadWorkspaceTsconfigPaths = () => {
    const aliases = [];
    for (const node of NODES) {
      const tsconfigPath = path.resolve(workspaceRoot, node, "tsconfig.json");
      if (fs.existsSync(tsconfigPath)) {
        try {
          const readResult = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
          if (!readResult.error && readResult.config) {
            const compilerOptions = readResult.config.compilerOptions || {};
            const pathsObj = compilerOptions.paths || {};
            const baseUrl = compilerOptions.baseUrl || ".";
            const absoluteBaseUrl = path.resolve(
              path.dirname(tsconfigPath),
              baseUrl,
            );

            for (const [aliasPattern, targetArray] of Object.entries(
              pathsObj,
            )) {
              if (Array.isArray(targetArray) && targetArray.length > 0) {
                const aliasPrefix = aliasPattern.replace(/\*$/, "");
                const rawTarget = targetArray[0].replace(/\*$/, "");
                const absoluteTargetDir = path.resolve(
                  absoluteBaseUrl,
                  rawTarget,
                );
                const relativeTarget = path
                  .relative(workspaceRoot, absoluteTargetDir)
                  .split(path.sep)
                  .join("/");
                aliases.push({ aliasPrefix, relativeTarget });
              }
            }
          }
        } catch {
          // ignore parsing errors
        }
      }
    }
    return aliases;
  };

  const workspaceAliases = loadWorkspaceTsconfigPaths();

  const resolveSpecifierToRelativePath = (specifier, absoluteFilePath) => {
    if (specifier.startsWith(".") || specifier.startsWith("/")) {
      const fileDir = path.dirname(absoluteFilePath);
      let resolved = path.normalize(path.join(fileDir, specifier));
      if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
        resolved = path.join(resolved, "index.ts");
      } else if (!resolved.endsWith(".ts") && !resolved.endsWith(".tsx")) {
        if (fs.existsSync(resolved + ".ts")) resolved = resolved + ".ts";
        else if (fs.existsSync(resolved + ".tsx")) resolved = resolved + ".tsx";
      }
      return path.relative(workspaceRoot, resolved).split(path.sep).join("/");
    }

    for (const { aliasPrefix, relativeTarget } of workspaceAliases) {
      if (specifier.startsWith(aliasPrefix)) {
        const remainder = specifier.slice(aliasPrefix.length);
        const resolved = path.normalize(
          path.join(workspaceRoot, relativeTarget, remainder),
        );
        return path.relative(workspaceRoot, resolved).split(path.sep).join("/");
      }
    }

    if (specifier.startsWith("@zyppi/")) {
      const parts = specifier.split("/");
      const packageName = parts.slice(0, 2).join("/");
      const targetNode = PACKAGE_TO_NODE[packageName];
      if (targetNode) {
        const remainder = parts.slice(2).join("/");
        const resolved = path.normalize(
          path.join(workspaceRoot, targetNode, "src", remainder),
        );
        return path.relative(workspaceRoot, resolved).split(path.sep).join("/");
      }
    }

    return null;
  };

  const apiModuleGraph = new Map();
  const absoluteApiDir = path.resolve(workspaceRoot, "apps/api");

  if (fs.existsSync(absoluteApiDir)) {
    const apiFiles = findTsFiles(absoluteApiDir);
    for (const absoluteFilePath of apiFiles) {
      const relativeFilePath = path
        .relative(workspaceRoot, absoluteFilePath)
        .split(path.sep)
        .join("/");
      fileCount++;
      const content = fs.readFileSync(absoluteFilePath, "utf8");
      const imports = getImportsOfFile(content, relativeFilePath);
      const targets = new Set();

      for (const imp of imports) {
        const relResolved = resolveSpecifierToRelativePath(
          imp.specifier,
          absoluteFilePath,
        );
        if (relResolved && relResolved.startsWith("apps/api/src/")) {
          targets.add(relResolved);
        }
      }
      apiModuleGraph.set(relativeFilePath, targets);
    }
  }

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

  for (const relativeFilePath of apiModuleGraph.keys()) {
    const isGenericZprof = relativeFilePath.startsWith("apps/api/src/zprof/");
    const isGenericOrchestration =
      relativeFilePath.startsWith("apps/api/src/registry/") ||
      relativeFilePath.startsWith("apps/api/src/evidence/");

    if (isGenericZprof || isGenericOrchestration) {
      if (canReachGs1Module(relativeFilePath)) {
        violations.push({
          node: "apps/api",
          layer: "source",
          file: relativeFilePath,
          line: 1,
          column: 1,
          rule: "gs1-domain-edge-contamination",
          description: `Unauthorized direct or transitive GS1 domain-edge import in generic module "${relativeFilePath}". Generic orchestration/Z-PROF modules must not import GS1 implementations.`,
        });
      }
    }
  }

  return { violations, fileCount };
}

if (
  import.meta.url === `file://${process.argv[1]}` ||
  (process.argv[1] &&
    path.resolve(process.argv[1]) ===
      path.resolve(new URL(import.meta.url).pathname))
) {
  const workspaceRoot = process.cwd();
  const { violations, fileCount } = runDomainIsolationValidation(workspaceRoot);

  if (violations.length > 0) {
    console.error("Zyppi Domain Isolation Validator: FAIL\n");
    for (const v of violations) {
      console.error(`Violation in node: ${v.node}`);
      console.error(`- File: ${v.file}`);
      console.error(`- Rule: ${v.rule}`);
      console.error(`- Diagnostics: ${v.description}\n`);
    }
    process.exit(1);
  }

  console.log("Zyppi Domain Isolation Validator: PASS");
  console.log(`- Domain edge isolation: Valid`);
  console.log(`- API modules analyzed: ${fileCount}\n`);
  process.exit(0);
}

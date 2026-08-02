import fs from "node:fs";
import path from "node:path";
import module from "node:module";
import ts from "typescript";

// Authoritative stable rule identifiers
export const RTP_RULES = {
  MANIFEST_DEPENDENCY: "RTP-MANIFEST-001",
  MANIFEST_PEER_DEPENDENCY: "RTP-MANIFEST-002",
  IMPORT_ESCAPE: "RTP-IMPORT-001",
  IMPORT_NODE_BUILTIN: "RTP-IMPORT-002",
  IMPORT_UNAPPROVED_INTERNAL: "RTP-IMPORT-003",
  IMPORT_UNAPPROVED_EXTERNAL: "RTP-IMPORT-004",
  IMPORT_SUBPATH_DENIED: "RTP-IMPORT-005",
  IMPORT_NON_LITERAL: "RTP-IMPORT-006",
  DETERMINISM_MATH_RANDOM: "RTP-DETERMINISM-001",
  DETERMINISM_DATE_NOW: "RTP-DETERMINISM-002",
  DETERMINISM_NEW_DATE_ZERO_ARGS: "RTP-DETERMINISM-003",
};

// Required static disclaimers
const DISCLAIMER = `Static analysis detects only the prohibited constructs represented by the implemented AST rules. Passing AMS-0108 does not prove complete runtime determinism and does not replace future runtime capability control or sandbox-level enforcement.`;

// Allowed internal packages (only package roots permitted, subpaths blocked unless explicitly authorized)
const ALLOWED_INTERNAL_PACKAGES = new Set(["@zyppi/domain", "@zyppi/shared"]);

// Specifically blocked internal packages (for clean reporting)
const BLOCKED_INTERNAL_PACKAGES = new Set([
  "@zyppi/contracts",
  "@zyppi/testing",
]);

// Authoritative Node built-in list using runtime module information
// Node built-ins normally found in 'module.builtinModules'
const NODE_BUILTINS = new Set(module.builtinModules || []);

// Helper to check if a module is a Node built-in (accounting for node: prefix)
function isNodeBuiltin(moduleSpecifier) {
  const cleanSpecifier = moduleSpecifier.startsWith("node:")
    ? moduleSpecifier.slice(5)
    : moduleSpecifier;
  // Handle subpaths of built-ins e.g. fs/promises, path/posix
  const rootBuiltin = cleanSpecifier.split("/")[0];
  return NODE_BUILTINS.has(cleanSpecifier) || NODE_BUILTINS.has(rootBuiltin);
}

/**
 * Normalizes absolute/relative path strings to use forward slashes
 */
function normalizePath(p) {
  return p.split(path.sep).join("/");
}

/**
 * Validates the runtime manifest packages/runtime/package.json
 */
export function validateManifest(
  manifestContent,
  manifestPath = "packages/runtime/package.json",
) {
  const violations = [];
  let manifest;
  try {
    manifest = JSON.parse(manifestContent);
  } catch (err) {
    violations.push({
      ruleId: RTP_RULES.MANIFEST_DEPENDENCY,
      path: manifestPath,
      line: 1,
      column: 1,
      category: "RTP_MANIFEST",
      description: `Failed to parse package.json: ${err.message}`,
    });
    return violations;
  }

  // Under Default Denial, dependencies must be explicitly approved.
  // Approved internal workspace dependencies are allowed; other categories/packages are denied.
  if (manifest.dependencies && typeof manifest.dependencies === "object") {
    for (const [dep, version] of Object.entries(manifest.dependencies)) {
      if (!ALLOWED_INTERNAL_PACKAGES.has(dep) || version !== "workspace:*") {
        violations.push({
          ruleId: RTP_RULES.MANIFEST_DEPENDENCY,
          path: manifestPath,
          line: 1,
          column: 1,
          category: "RTP_MANIFEST",
          description: `Unauthorized Runtime production dependency: "${dep}". Dependency categories default to denied under Default Denial.`,
        });
      }
    }
  }

  if (
    manifest.peerDependencies &&
    typeof manifest.peerDependencies === "object"
  ) {
    for (const dep of Object.keys(manifest.peerDependencies)) {
      violations.push({
        ruleId: RTP_RULES.MANIFEST_PEER_DEPENDENCY,
        path: manifestPath,
        line: 1,
        column: 1,
        category: "RTP_MANIFEST",
        description: `Unauthorized Runtime peer dependency: "${dep}". Dependency categories default to denied under Default Denial.`,
      });
    }
  }

  return violations;
}

/**
 * Validates a single source file AST
 */
export function validateSourceFile(fileContent, relativeFilePath) {
  const violations = [];
  const normalizedFile = normalizePath(relativeFilePath);

  // Create source file using TypeScript Compiler API
  const sourceFile = ts.createSourceFile(
    normalizedFile,
    fileContent,
    ts.ScriptTarget.ES2022,
    true,
  );

  // Helper to extract line and column from a character position
  function getLoc(pos) {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);
    return { line: line + 1, column: character + 1 };
  }

  // 1. Audit Import / Export Module Specifiers
  function checkModuleSpecifier(specifierNode) {
    if (!specifierNode) return;

    if (!ts.isStringLiteral(specifierNode)) {
      const loc = getLoc(specifierNode.getStart());
      violations.push({
        ruleId: RTP_RULES.IMPORT_NON_LITERAL,
        path: normalizedFile,
        line: loc.line,
        column: loc.column,
        category: "RTP_IMPORT",
        description:
          "Dynamic module resolution with non-literal module specifier is prohibited in Runtime production source.",
      });
      return;
    }

    const specifier = specifierNode.text;
    const loc = getLoc(specifierNode.getStart());

    // Relative Import Checks
    if (specifier.startsWith(".") || specifier.startsWith("/")) {
      // Resolve path relative to the scanning file directory to verify boundaries
      const fileDir = path.dirname(normalizedFile);
      const resolvedTarget = path.normalize(path.join(fileDir, specifier));
      const normalizedTarget = normalizePath(resolvedTarget);

      // Relative import escaping packages/runtime is prohibited
      if (!normalizedTarget.startsWith("packages/runtime/")) {
        violations.push({
          ruleId: RTP_RULES.IMPORT_ESCAPE,
          path: normalizedFile,
          line: loc.line,
          column: loc.column,
          category: "RTP_IMPORT",
          description: `Prohibited relative import escaping Runtime package boundary: "${specifier}" resolves to "${normalizedTarget}".`,
        });
      }
      return;
    }

    // Node Built-in Checks (normalizing 'node:' prefix)
    if (isNodeBuiltin(specifier)) {
      violations.push({
        ruleId: RTP_RULES.IMPORT_NODE_BUILTIN,
        path: normalizedFile,
        line: loc.line,
        column: loc.column,
        category: "RTP_IMPORT",
        description: `Prohibited import of standard Node.js built-in module: "${specifier}". Runtime must remain pure and free from host I/O capabilities.`,
      });
      return;
    }

    // Internal @zyppi/* workspace imports checks
    if (specifier.startsWith("@zyppi/")) {
      // Extract root package e.g. "@zyppi/domain" or "@zyppi/shared"
      const parts = specifier.split("/");
      const rootPackageName = parts.slice(0, 2).join("/");

      if (BLOCKED_INTERNAL_PACKAGES.has(rootPackageName)) {
        violations.push({
          ruleId: RTP_RULES.IMPORT_UNAPPROVED_INTERNAL,
          path: normalizedFile,
          line: loc.line,
          column: loc.column,
          category: "RTP_IMPORT",
          description: `Prohibited import of workspace package "${specifier}".`,
        });
        return;
      }

      if (!ALLOWED_INTERNAL_PACKAGES.has(rootPackageName)) {
        violations.push({
          ruleId: RTP_RULES.IMPORT_UNAPPROVED_INTERNAL,
          path: normalizedFile,
          line: loc.line,
          column: loc.column,
          category: "RTP_IMPORT",
          description: `Unauthorized workspace package import: "${specifier}".`,
        });
        return;
      }

      // Check subpaths: default to package-root-only unless public export boundary allows it
      // Subpath imports are prohibited to maintain strict package boundaries
      if (parts.length > 2) {
        violations.push({
          ruleId: RTP_RULES.IMPORT_SUBPATH_DENIED,
          path: normalizedFile,
          line: loc.line,
          column: loc.column,
          category: "RTP_IMPORT",
          description: `Prohibited subpath import into approved package: "${specifier}". Deep imports are denied to preserve public export boundaries.`,
        });
      }
      return;
    }

    // External package imports checking (Default Denial: all external production imports fail)
    violations.push({
      ruleId: RTP_RULES.IMPORT_UNAPPROVED_EXTERNAL,
      path: normalizedFile,
      line: loc.line,
      column: loc.column,
      category: "RTP_IMPORT",
      description: `Unauthorized external production package import: "${specifier}" under Default Denial.`,
    });
  }

  // Recursive AST traversal
  function visit(node) {
    // Audit module imports
    if (ts.isImportDeclaration(node)) {
      checkModuleSpecifier(node.moduleSpecifier);
    } else if (ts.isExportDeclaration(node)) {
      checkModuleSpecifier(node.moduleSpecifier);
    } else if (ts.isImportEqualsDeclaration(node)) {
      // Check require statement patterns
      if (
        node.moduleReference &&
        ts.isExternalModuleReference(node.moduleReference)
      ) {
        checkModuleSpecifier(node.moduleReference.expression);
      }
    } else if (ts.isCallExpression(node)) {
      const expression = node.expression;

      // Audit dynamic import(...) statements
      if (expression.kind === ts.SyntaxKind.ImportKeyword) {
        const arg = node.arguments[0];
        checkModuleSpecifier(arg);
      }

      // Audit require(...) statements
      if (ts.isIdentifier(expression) && expression.text === "require") {
        const arg = node.arguments[0];
        checkModuleSpecifier(arg);
      }

      // 2. Audit determinism calls: Math.random() & Date.now()
      if (ts.isPropertyAccessExpression(expression)) {
        const obj = expression.expression;
        const prop = expression.name;

        if (ts.isIdentifier(obj) && ts.isIdentifier(prop)) {
          if (obj.text === "Math" && prop.text === "random") {
            const loc = getLoc(node.getStart());
            violations.push({
              ruleId: RTP_RULES.DETERMINISM_MATH_RANDOM,
              path: normalizedFile,
              line: loc.line,
              column: loc.column,
              category: "RTP_DETERMINISM",
              description:
                "Prohibited Math.random() usage: Direct entropy access is prohibited in Runtime production source.",
            });
          } else if (obj.text === "Date" && prop.text === "now") {
            const loc = getLoc(node.getStart());
            violations.push({
              ruleId: RTP_RULES.DETERMINISM_DATE_NOW,
              path: normalizedFile,
              line: loc.line,
              column: loc.column,
              category: "RTP_DETERMINISM",
              description:
                "Prohibited Date.now() usage: Direct wall-clock time access is prohibited in Runtime production source.",
            });
          }
        }
      }
    } else if (ts.isNewExpression(node)) {
      // 3. Audit Date constructor with ZERO arguments: new Date()
      const expression = node.expression;
      if (ts.isIdentifier(expression) && expression.text === "Date") {
        const argsCount = node.arguments ? node.arguments.length : 0;
        if (argsCount === 0) {
          const loc = getLoc(node.getStart());
          violations.push({
            ruleId: RTP_RULES.DETERMINISM_NEW_DATE_ZERO_ARGS,
            path: normalizedFile,
            line: loc.line,
            column: loc.column,
            category: "RTP_DETERMINISM",
            description:
              "Prohibited zero-argument new Date() constructor usage: Direct wall-clock time access is prohibited in Runtime production source.",
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return violations;
}

/**
 * Programmatic scan API to validate packages/runtime against constitutional rules
 */
export function scanRuntimePurity(workspaceRoot) {
  const violations = [];

  // 1. Manifest Purity Validation
  const manifestPath = path.join(
    workspaceRoot,
    "packages/runtime/package.json",
  );
  if (!fs.existsSync(manifestPath)) {
    violations.push({
      ruleId: RTP_RULES.MANIFEST_DEPENDENCY,
      path: "packages/runtime/package.json",
      line: 1,
      column: 1,
      category: "RTP_MANIFEST",
      description: "Required Runtime package.json manifest is missing.",
    });
  } else {
    const manifestContent = fs.readFileSync(manifestPath, "utf8");
    violations.push(
      ...validateManifest(manifestContent, "packages/runtime/package.json"),
    );
  }

  // 2. Production Source Files Scan Boundary
  const srcRoot = path.join(workspaceRoot, "packages/runtime/src");
  if (!fs.existsSync(srcRoot)) {
    violations.push({
      ruleId: RTP_RULES.IMPORT_ESCAPE,
      path: "packages/runtime/src",
      line: 1,
      column: 1,
      category: "RTP_SOURCE",
      description:
        "Required packages/runtime/src production source root is missing.",
    });
    return violations;
  }

  // Recursive walk over scan roots, finding .ts and .tsx production sources
  let fileCount = 0;
  function walk(currentDir) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      if (item.isDirectory()) {
        // Explicitly exclude test fixtures, generated output, node_modules, dist, build, coverage
        if (
          item.name === "node_modules" ||
          item.name === "dist" ||
          item.name === "build" ||
          item.name === "coverage" ||
          item.name === "fixtures" ||
          item.name === "temp"
        ) {
          continue;
        }
        walk(fullPath);
      } else if (item.isFile()) {
        const ext = path.extname(item.name);
        // Authoritative production source files are TS and TSX, excluding definition files or test files
        if (
          (ext === ".ts" || ext === ".tsx") &&
          !item.name.endsWith(".d.ts") &&
          !item.name.includes(".test.") &&
          !item.name.includes(".spec.")
        ) {
          fileCount++;
          const content = fs.readFileSync(fullPath, "utf8");
          const relPath = path.relative(workspaceRoot, fullPath);
          violations.push(...validateSourceFile(content, relPath));
        }
      }
    }
  }

  walk(srcRoot);

  if (fileCount === 0) {
    violations.push({
      ruleId: RTP_RULES.IMPORT_ESCAPE,
      path: "packages/runtime/src",
      line: 1,
      column: 1,
      category: "RTP_SOURCE",
      description:
        "Required packages/runtime/src directory contains no production source files.",
    });
  }

  return { violations, fileCount };
}

// CLI entry point execution helper
function runCli() {
  const workspaceRoot = process.cwd();
  const { violations, fileCount } = scanRuntimePurity(workspaceRoot);

  if (violations.length > 0) {
    // Sort violations deterministically: path, line, column, ruleId
    const sorted = [...violations].sort((a, b) => {
      if (a.path !== b.path) return a.path.localeCompare(b.path);
      if (a.line !== b.line) return a.line - b.line;
      if (a.column !== b.column) return a.column - b.column;
      return a.ruleId.localeCompare(b.ruleId);
    });

    console.error(
      "Zyppi Static Runtime Purity & Determinism Validator: FAIL\n",
    );
    for (const v of sorted) {
      console.error(
        `[${v.category}] ${v.ruleId} ${v.path}:${v.line}:${v.column}`,
      );
      console.error(`Rule: ${v.ruleId}`);
      console.error(`Reason: ${v.description}\n`);
    }

    console.error(DISCLAIMER);
    process.exit(1);
  }

  // Overall pass successful result
  console.log("Zyppi Static Runtime Purity & Determinism Validator: PASS");
  console.log(`- Runtime manifest status: Valid`);
  console.log(`- Runtime source-file count analyzed: ${fileCount}`);
  console.log(`- Import governance status: Valid`);
  console.log(`- Static determinism status: Valid\n`);

  console.log(DISCLAIMER);
  process.exit(0);
}

// Execute when invoked directly as a CLI script
if (
  import.meta.url === `file://${process.argv[1]}` ||
  (process.argv[1] &&
    path.resolve(process.argv[1]) ===
      path.resolve(new URL(import.meta.url).pathname))
) {
  runCli();
}

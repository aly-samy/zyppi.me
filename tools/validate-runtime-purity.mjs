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
  DETERMINISM_PROCESS_ENV: "RTP-DETERMINISM-004",
  DETERMINISM_DYNAMIC_EXECUTION: "RTP-DETERMINISM-005",
  DETERMINISM_WEAK_REF_FINALIZATION: "RTP-DETERMINISM-006",
  DETERMINISM_GLOBAL_MUTATION: "RTP-DETERMINISM-007",
  DETERMINISM_MUTABLE_MODULE_STATE: "RTP-DETERMINISM-008",
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

function getBindingNames(node, namesSet) {
  if (!node) return;
  if (ts.isIdentifier(node)) {
    namesSet.add(node.text);
  } else if (
    ts.isObjectBindingPattern(node) ||
    ts.isArrayBindingPattern(node)
  ) {
    for (const element of node.elements) {
      if (ts.isBindingElement(element)) {
        getBindingNames(element.name, namesSet);
      }
    }
  }
}

function collectBindings(node, namesSet) {
  if (!node) return;

  function addDeclarationName(declNode) {
    if (declNode && declNode.name) {
      getBindingNames(declNode.name, namesSet);
    }
  }

  if (
    ts.isFunctionDeclaration(node) ||
    ts.isArrowFunction(node) ||
    ts.isFunctionExpression(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isConstructorDeclaration(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node)
  ) {
    if (node.parameters) {
      for (const param of node.parameters) {
        addDeclarationName(param);
      }
    }
    if (node.name) {
      namesSet.add(node.name.text);
    }
  }

  if (
    ts.isForOfStatement(node) ||
    ts.isForInStatement(node) ||
    ts.isForStatement(node)
  ) {
    if (node.initializer && ts.isVariableDeclarationList(node.initializer)) {
      for (const decl of node.initializer.declarations) {
        addDeclarationName(decl);
      }
    }
  }

  node.forEachChild((child) => {
    if (ts.isVariableStatement(child)) {
      for (const decl of child.declarationList.declarations) {
        addDeclarationName(decl);
      }
    } else if (ts.isFunctionDeclaration(child)) {
      if (child.name) {
        namesSet.add(child.name.text);
      }
    } else if (ts.isClassDeclaration(child)) {
      if (child.name) {
        namesSet.add(child.name.text);
      }
    } else if (ts.isInterfaceDeclaration(child)) {
      if (child.name) {
        namesSet.add(child.name.text);
      }
    } else if (ts.isTypeAliasDeclaration(child)) {
      if (child.name) {
        namesSet.add(child.name.text);
      }
    } else if (ts.isImportDeclaration(child)) {
      const clause = child.importClause;
      if (clause) {
        if (clause.name) {
          namesSet.add(clause.name.text);
        }
        if (clause.namedBindings) {
          if (ts.isNamespaceImport(clause.namedBindings)) {
            namesSet.add(clause.namedBindings.name.text);
          } else if (ts.isNamedImports(clause.namedBindings)) {
            for (const element of clause.namedBindings.elements) {
              namesSet.add(element.name.text);
            }
          }
        }
      }
    }
  });
}

function isVariableReference(node) {
  const parent = node.parent;
  if (!parent) return true;

  if (ts.isPropertyAccessExpression(parent) && parent.name === node) {
    return false;
  }
  if (ts.isPropertyAssignment(parent) && parent.name === node) {
    return false;
  }
  if (ts.isBindingElement(parent) && parent.propertyName === node) {
    return false;
  }
  if (ts.isImportSpecifier(parent)) {
    return false;
  }
  if (ts.isExportSpecifier(parent)) {
    return false;
  }
  if (
    ts.isVariableDeclaration(parent) ||
    ts.isFunctionDeclaration(parent) ||
    ts.isClassDeclaration(parent) ||
    ts.isInterfaceDeclaration(parent) ||
    ts.isTypeAliasDeclaration(parent) ||
    ts.isParameter(parent) ||
    ts.isMethodDeclaration(parent) ||
    ts.isPropertyDeclaration(parent) ||
    ts.isPropertySignature(parent) ||
    ts.isEnumMember(parent) ||
    ts.isEnumDeclaration(parent)
  ) {
    if (parent.name === node) {
      return false;
    }
  }

  let cur = parent;
  while (cur) {
    if (
      ts.isTypeNode(cur) ||
      ts.isTypeReferenceNode(cur) ||
      ts.isTypeQueryNode(cur)
    ) {
      return false;
    }
    cur = cur.parent;
  }

  return true;
}

const MUTATING_METHODS = new Set([
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "reverse",
  "sort",
  "fill",
  "copyWithin",
  "add",
  "set",
  "delete",
  "clear",
]);

function isGlobalDynamicExecTarget(expr, currentShadowed) {
  if (ts.isIdentifier(expr)) {
    const name = expr.text;
    if (
      (name === "eval" || name === "Function") &&
      !currentShadowed.has(name)
    ) {
      return true;
    }
  } else if (ts.isPropertyAccessExpression(expr)) {
    const obj = expr.expression;
    const prop = expr.name;
    if (
      ts.isIdentifier(obj) &&
      (obj.text === "globalThis" || obj.text === "global") &&
      !currentShadowed.has(obj.text) &&
      ts.isIdentifier(prop) &&
      (prop.text === "eval" || prop.text === "Function")
    ) {
      return true;
    }
  } else if (ts.isElementAccessExpression(expr)) {
    const obj = expr.expression;
    const arg = expr.argumentExpression;
    if (
      ts.isIdentifier(obj) &&
      (obj.text === "globalThis" || obj.text === "global") &&
      !currentShadowed.has(obj.text) &&
      ts.isStringLiteral(arg) &&
      (arg.text === "eval" || arg.text === "Function")
    ) {
      return true;
    }
  }
  return false;
}

function isProhibitedGcConstructor(expr, currentShadowed) {
  if (ts.isIdentifier(expr)) {
    const name = expr.text;
    if (
      (name === "WeakRef" || name === "FinalizationRegistry") &&
      !currentShadowed.has(name)
    ) {
      return true;
    }
  } else if (ts.isPropertyAccessExpression(expr)) {
    const obj = expr.expression;
    const prop = expr.name;
    if (
      ts.isIdentifier(obj) &&
      (obj.text === "globalThis" || obj.text === "global") &&
      !currentShadowed.has(obj.text) &&
      ts.isIdentifier(prop) &&
      (prop.text === "WeakRef" || prop.text === "FinalizationRegistry")
    ) {
      return true;
    }
  } else if (ts.isElementAccessExpression(expr)) {
    const obj = expr.expression;
    const arg = expr.argumentExpression;
    if (
      ts.isIdentifier(obj) &&
      (obj.text === "globalThis" || obj.text === "global") &&
      !currentShadowed.has(obj.text) &&
      ts.isStringLiteral(arg) &&
      (arg.text === "WeakRef" || arg.text === "FinalizationRegistry")
    ) {
      return true;
    }
  }
  return false;
}

function getMutationTarget(node) {
  if (
    ts.isBinaryExpression(node) &&
    ts.isAssignmentOperator(node.operatorToken.kind)
  ) {
    return node.left;
  }
  if (
    ts.isPrefixUnaryExpression(node) &&
    (node.operator === ts.SyntaxKind.PlusPlusToken ||
      node.operator === ts.SyntaxKind.MinusMinusToken)
  ) {
    return node.operand;
  }
  if (
    ts.isPostfixUnaryExpression(node) &&
    (node.operator === ts.SyntaxKind.PlusPlusToken ||
      node.operator === ts.SyntaxKind.MinusMinusToken)
  ) {
    return node.operand;
  }
  return null;
}

function getBaseIdentifierOfAccessChain(expr) {
  let cur = expr;
  while (
    ts.isPropertyAccessExpression(cur) ||
    ts.isElementAccessExpression(cur)
  ) {
    cur = cur.expression;
  }
  if (ts.isIdentifier(cur)) {
    return cur;
  }
  return null;
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

  // Scan for top-level constants
  const topLevelConsts = new Set();
  sourceFile.forEachChild((child) => {
    if (ts.isVariableStatement(child)) {
      const isConst = (child.declarationList.flags & ts.NodeFlags.Const) !== 0;
      if (isConst) {
        for (const decl of child.declarationList.declarations) {
          getBindingNames(decl.name, topLevelConsts);
        }
      }
    }
  });

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
  function visit(node, shadowed = new Set(), innerShadowed = new Set()) {
    let currentShadowed = shadowed;
    let currentInnerShadowed = innerShadowed;

    const isScopeNode =
      ts.isSourceFile(node) ||
      ts.isBlock(node) ||
      ts.isFunctionDeclaration(node) ||
      ts.isArrowFunction(node) ||
      ts.isFunctionExpression(node) ||
      ts.isMethodDeclaration(node) ||
      ts.isConstructorDeclaration(node) ||
      ts.isGetAccessorDeclaration(node) ||
      ts.isSetAccessorDeclaration(node) ||
      ts.isForOfStatement(node) ||
      ts.isForInStatement(node) ||
      ts.isForStatement(node);

    if (isScopeNode) {
      currentShadowed = new Set(shadowed);
      collectBindings(node, currentShadowed);

      if (!ts.isSourceFile(node)) {
        currentInnerShadowed = new Set(innerShadowed);
        collectBindings(node, currentInnerShadowed);
      }
    }

    // Audit unshadowed global "process" identifier
    if (ts.isIdentifier(node) && node.text === "process") {
      if (!currentShadowed.has("process") && isVariableReference(node)) {
        const loc = getLoc(node.getStart());
        violations.push({
          ruleId: RTP_RULES.DETERMINISM_PROCESS_ENV,
          path: normalizedFile,
          line: loc.line,
          column: loc.column,
          category: "RTP_DETERMINISM",
          description:
            "Prohibited process usage: Direct process/environment access is prohibited in Runtime production source.",
        });
      }
    }

    // Audit global dynamic code execution
    if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
      if (isGlobalDynamicExecTarget(node.expression, currentShadowed)) {
        const loc = getLoc(node.getStart());
        violations.push({
          ruleId: RTP_RULES.DETERMINISM_DYNAMIC_EXECUTION,
          path: normalizedFile,
          line: loc.line,
          column: loc.column,
          category: "RTP_DETERMINISM",
          description:
            "Prohibited dynamic code execution: Use of global eval() or Function() is prohibited in Runtime production source.",
        });
      }
    }

    // Audit global GC-observability capabilities (WeakRef, FinalizationRegistry)
    if (ts.isNewExpression(node)) {
      if (isProhibitedGcConstructor(node.expression, currentShadowed)) {
        const loc = getLoc(node.getStart());
        violations.push({
          ruleId: RTP_RULES.DETERMINISM_WEAK_REF_FINALIZATION,
          path: normalizedFile,
          line: loc.line,
          column: loc.column,
          category: "RTP_DETERMINISM",
          description:
            "Prohibited GC-observability capability: Construction of WeakRef or FinalizationRegistry is prohibited in Runtime production source.",
        });
      }
    }

    // Audit global namespace mutations
    const mutTarget = getMutationTarget(node);
    if (mutTarget) {
      const baseIdent = getBaseIdentifierOfAccessChain(mutTarget);
      if (
        baseIdent &&
        (baseIdent.text === "globalThis" || baseIdent.text === "global") &&
        !currentShadowed.has(baseIdent.text)
      ) {
        const loc = getLoc(node.getStart());
        violations.push({
          ruleId: RTP_RULES.DETERMINISM_GLOBAL_MUTATION,
          path: normalizedFile,
          line: loc.line,
          column: loc.column,
          category: "RTP_DETERMINISM",
          description: `Prohibited global namespace mutation: Mutation targeting global namespace "${baseIdent.text}" is prohibited in Runtime production source.`,
        });
      }
    }

    // Audit top-level let/var mutable declarations
    if (ts.isVariableDeclaration(node)) {
      const parentList = node.parent;
      if (parentList && ts.isVariableDeclarationList(parentList)) {
        const grandparent = parentList.parent;
        if (grandparent && ts.isVariableStatement(grandparent)) {
          const greatGrandparent = grandparent.parent;
          if (greatGrandparent && ts.isSourceFile(greatGrandparent)) {
            const isConst = (parentList.flags & ts.NodeFlags.Const) !== 0;
            if (!isConst) {
              const loc = getLoc(node.getStart());
              violations.push({
                ruleId: RTP_RULES.DETERMINISM_MUTABLE_MODULE_STATE,
                path: normalizedFile,
                line: loc.line,
                column: loc.column,
                category: "RTP_DETERMINISM",
                description: `Prohibited top-level mutable declaration: Use of top-level "let" or "var" is prohibited in Runtime production source. Use "const" instead.`,
              });
            }
          }
        }
      }
    }

    // Audit direct assignment or update to properties/elements of top-level const
    if (mutTarget) {
      const baseIdent = getBaseIdentifierOfAccessChain(mutTarget);
      if (
        baseIdent &&
        topLevelConsts.has(baseIdent.text) &&
        !currentInnerShadowed.has(baseIdent.text)
      ) {
        const loc = getLoc(node.getStart());
        violations.push({
          ruleId: RTP_RULES.DETERMINISM_MUTABLE_MODULE_STATE,
          path: normalizedFile,
          line: loc.line,
          column: loc.column,
          category: "RTP_DETERMINISM",
          description: `Prohibited module-level mutation: Mutation targeting top-level constant "${baseIdent.text}" is prohibited in Runtime production source.`,
        });
      }
    }

    // Audit direct calls to mutating methods on top-level const structures
    if (ts.isCallExpression(node)) {
      const expr = node.expression;
      let base = null;
      let methodName = null;

      if (ts.isPropertyAccessExpression(expr)) {
        base = expr.expression;
        if (ts.isIdentifier(expr.name)) {
          methodName = expr.name.text;
        }
      } else if (ts.isElementAccessExpression(expr)) {
        base = expr.expression;
        if (ts.isStringLiteral(expr.argumentExpression)) {
          methodName = expr.argumentExpression.text;
        }
      }

      if (base && methodName && MUTATING_METHODS.has(methodName)) {
        const baseIdent = getBaseIdentifierOfAccessChain(base);
        if (
          baseIdent &&
          topLevelConsts.has(baseIdent.text) &&
          !currentInnerShadowed.has(baseIdent.text)
        ) {
          const loc = getLoc(node.getStart());
          violations.push({
            ruleId: RTP_RULES.DETERMINISM_MUTABLE_MODULE_STATE,
            path: normalizedFile,
            line: loc.line,
            column: loc.column,
            category: "RTP_DETERMINISM",
            description: `Prohibited module-level mutation: Call to mutating method "${methodName}" on top-level constant "${baseIdent.text}" is prohibited in Runtime production source.`,
          });
        }
      }
    }

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
      } else if (ts.isElementAccessExpression(expression)) {
        const obj = expression.expression;
        const arg = expression.argumentExpression;

        if (ts.isIdentifier(obj) && ts.isStringLiteral(arg)) {
          if (obj.text === "Math" && arg.text === "random") {
            const loc = getLoc(node.getStart());
            violations.push({
              ruleId: RTP_RULES.DETERMINISM_MATH_RANDOM,
              path: normalizedFile,
              line: loc.line,
              column: loc.column,
              category: "RTP_DETERMINISM",
              description:
                'Prohibited Math["random"]() usage: Direct entropy access is prohibited in Runtime production source.',
            });
          } else if (obj.text === "Date" && arg.text === "now") {
            const loc = getLoc(node.getStart());
            violations.push({
              ruleId: RTP_RULES.DETERMINISM_DATE_NOW,
              path: normalizedFile,
              line: loc.line,
              column: loc.column,
              category: "RTP_DETERMINISM",
              description:
                'Prohibited Date["now"]() usage: Direct wall-clock time access is prohibited in Runtime production source.',
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

    ts.forEachChild(node, (child) =>
      visit(child, currentShadowed, currentInnerShadowed),
    );
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

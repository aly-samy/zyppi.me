import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const packageJsonPath = path.resolve("packages/runtime/package.json");

console.log("Starting Manifest-Driven Package Boundary Verification...");

// 1. Parse package.json
if (!fs.existsSync(packageJsonPath)) {
  console.error(`Error: package.json not found at ${packageJsonPath}`);
  process.exit(1);
}

let pkg;
try {
  pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
} catch (err) {
  console.error(`Error: Failed to parse package.json: ${err.message}`);
  process.exit(1);
}

// 2. Confirm package name, private, and type
if (pkg.name !== "@zyppi/runtime") {
  console.error(
    `Error: Package name must be exactly "@zyppi/runtime". Found: "${pkg.name}"`,
  );
  process.exit(1);
}

if (pkg.private !== true) {
  console.error(`Error: Package must be private.`);
  process.exit(1);
}

if (pkg.type !== "module") {
  console.error(`Error: Package type must be "module".`);
  process.exit(1);
}

// 3. Require dependencies to be exactly {} and peerDependencies to be exactly {}
if (
  !pkg.dependencies ||
  typeof pkg.dependencies !== "object" ||
  Object.keys(pkg.dependencies).length !== 0
) {
  console.error("Error: 'dependencies' must exist and be an empty object {}.");
  process.exit(1);
}

if (
  !pkg.peerDependencies ||
  typeof pkg.peerDependencies !== "object" ||
  Object.keys(pkg.peerDependencies).length !== 0
) {
  console.error(
    "Error: 'peerDependencies' must exist and be an empty object {}.",
  );
  process.exit(1);
}

// 4. Read public targets dynamically from the exports map
if (!pkg.exports) {
  console.error("Error: 'exports' field must be defined.");
  process.exit(1);
}

const publicTargets = [];
function extractPaths(val) {
  if (typeof val === "string") {
    if (val.startsWith("./")) {
      publicTargets.push(val);
    }
  } else if (val && typeof val === "object") {
    for (const k of Object.keys(val)) {
      extractPaths(val[k]);
    }
  }
}
extractPaths(pkg.exports);

if (publicTargets.length === 0) {
  console.error("Error: No public targets found in 'exports' map.");
  process.exit(1);
}

console.log("Derived public targets from 'exports' map:", publicTargets);

// 5. Verify that every declared public artifact exists after the build
const packageDir = path.dirname(packageJsonPath);
for (const target of publicTargets) {
  const fullPath = path.resolve(packageDir, target);
  if (!fs.existsSync(fullPath)) {
    console.error(
      `Error: Declared public artifact "${target}" does not exist at "${fullPath}".`,
    );
    process.exit(1);
  }
  console.log(`- Verified physical artifact existence: ${target}`);
}

// 6. Verify native public-boundary resolution using controlled execution context
// We execute a node process in a controlled environment (cwd: packages/runtime)
// that tries to dynamically import the package by name "@zyppi/runtime".
// This verifies Node's native ESM package self-reference resolution of the public exports map.
try {
  console.log("Testing native Node.js package resolution boundary...");
  execSync(
    `node --input-type=module -e "import('@zyppi/runtime').then(() => console.log('Resolution check passed.'))"`,
    {
      cwd: packageDir,
      stdio: "pipe",
    },
  );
  console.log(
    "- Verified native package-boundary self-resolution successfully.",
  );
} catch (err) {
  console.error("Error: Native Node.js package boundary resolution failed.");
  console.error(err.stderr ? err.stderr.toString() : err.message);
  process.exit(1);
}

console.log("Zyppi Package Boundary Verification: PASS");
process.exit(0);

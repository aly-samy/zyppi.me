import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

// 1. Parse CLI arguments
let packageDirArg = "";
for (const arg of process.argv) {
  if (arg.startsWith("--package=")) {
    packageDirArg = arg.split("=")[1];
  }
}

if (!packageDirArg) {
  console.error("Error: --package=<path> argument is required.");
  process.exit(1);
}

const packageDir = path.resolve(packageDirArg);
const packageJsonPath = path.join(packageDir, "package.json");

console.log(
  `Starting Manifest-Driven Package Boundary Verification for: ${packageDirArg}`,
);

// 2. Parse package.json
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

// 3. Confirm private and type
if (pkg.private !== true) {
  console.error("Error: Package must be private (private: true).");
  process.exit(1);
}

if (pkg.type !== "module") {
  console.error("Error: Package type must be 'module'.");
  process.exit(1);
}

// 4. Require dependencies to be exactly {} and peerDependencies to be exactly {}
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

// 5. Read public targets dynamically from the exports map
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

// 6. Verify that every declared public artifact exists after the build
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

// 7. Verify native public-boundary resolution using controlled execution context
// We execute a node process in the controlled environment of the target package's directory,
// importing the package by its declared name (pkg.name) to test native self-resolution/exports.
try {
  console.log(
    `Testing native Node.js package resolution boundary for ${pkg.name}...`,
  );
  execSync(
    `node --input-type=module -e "import('${pkg.name}').then(() => console.log('Resolution check passed.'))"`,
    {
      cwd: packageDir,
      stdio: "pipe",
    },
  );
  console.log(
    `- Verified native package-boundary self-resolution for "${pkg.name}" successfully.`,
  );
} catch (err) {
  console.error(
    `Error: Native Node.js package boundary resolution failed for "${pkg.name}".`,
  );
  console.error(err.stderr ? err.stderr.toString() : err.message);
  process.exit(1);
}

console.log(`Zyppi Package Boundary Verification for "${pkg.name}": PASS`);
process.exit(0);

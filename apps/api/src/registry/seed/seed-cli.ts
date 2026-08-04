import * as fs from "fs";
import * as path from "path";
import postgres from "postgres";
import { parseAndValidateManifest } from "./seed-manifest-loader.js";
import { verifyRecordIntegrity } from "./seed-integrity.js";
import { verifyManifestAuthority } from "./seed-authority.js";
import { executeSeedTransaction } from "./postgres-registry-seeder.js";
import { PRODUCTION_TRUST_SET } from "./seed-trust-set.js";
import { TEST_TRUST_SET } from "./test-trust-set.js";
import type { SeedExecutionOutcome } from "./seed-outcomes.js";

function printUsageAndExit(): never {
  console.error("Usage:");
  console.error("  pnpm registry:seed -- --mode production --manifest <path>");
  console.error(
    "  pnpm registry:seed -- --mode test-fixture --manifest <path>",
  );
  process.exit(6); // ValidationRefusal exit code
}

async function runCli() {
  const args = process.argv.slice(2);
  let mode: string | undefined;
  let manifestPath: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--") {
      continue;
    }
    if (arg === "--mode") {
      mode = args[++i];
    } else if (arg === "--manifest") {
      manifestPath = args[++i];
    } else {
      console.error(`Error: Unknown or unsupported argument "${arg}"`);
      printUsageAndExit();
    }
  }

  if (mode === undefined || manifestPath === undefined) {
    console.error("Error: Both --mode and --manifest are required.");
    printUsageAndExit();
  }

  const modeStr: string = mode;
  const manifestPathStr: string = manifestPath;

  if (modeStr !== "production" && modeStr !== "test-fixture") {
    console.error(
      `Error: Unknown mode "${modeStr}". Mode must be "production" or "test-fixture".`,
    );
    process.exit(6);
  }

  // Absolute path and normalized path of the manifest
  const resolvedManifestPath = path.resolve(manifestPathStr);
  const canonicalFixtureDir = path.resolve(
    "apps/api/src/registry/infrastructure/persistence/fixtures",
  );

  // Mode-specific path and trust validations
  let trustSet = PRODUCTION_TRUST_SET;

  if (modeStr === "production") {
    if (manifestPathStr.endsWith(".fixture.json")) {
      console.error("Error: Production mode rejects .fixture.json files.");
      process.exit(6);
    }
    if (resolvedManifestPath.startsWith(canonicalFixtureDir)) {
      console.error(
        "Error: Production mode rejects manifests inside the fixtures directory.",
      );
      process.exit(6);
    }
    trustSet = PRODUCTION_TRUST_SET;
  } else {
    // test-fixture mode
    if (!manifestPathStr.endsWith(".fixture.json")) {
      console.error(
        "Error: Test-fixture mode accepts only .fixture.json files.",
      );
      process.exit(6);
    }
    if (!resolvedManifestPath.startsWith(canonicalFixtureDir)) {
      console.error(
        "Error: Test-fixture mode accepts manifests only from the canonical fixtures directory.",
      );
      process.exit(6);
    }
    // Hard guard: require PGDATABASE === "zyppi_test"
    const activeDb = process.env.PGDATABASE;
    if (activeDb !== "zyppi_test") {
      console.error(
        `Error: Test-fixture mode requires PGDATABASE === "zyppi_test" (current: "${activeDb}"). Fail closed.`,
      );
      process.exit(1); // InfrastructureFailure/Failure
    }
    trustSet = TEST_TRUST_SET;
  }

  // 1. Load: Check file existence and read contents
  if (!fs.existsSync(manifestPathStr)) {
    console.error(
      `Error: Manifest file not found at path "${manifestPathStr}"`,
    );
    process.exit(1); // InfrastructureFailure
  }

  let rawJsonText: string;
  try {
    rawJsonText = fs.readFileSync(manifestPathStr, "utf8");
  } catch (err: unknown) {
    const error = err as { readonly message?: string };
    console.error(
      `Error: Failed to read manifest file: ${error.message || "unknown"}`,
    );
    process.exit(1);
  }

  // 2. Parse and Validate envelope structure, field formats, and strict JSON boundaries
  const parsedRes = parseAndValidateManifest(rawJsonText);
  if (!parsedRes.ok) {
    reportOutcomeAndExit(parsedRes.outcome);
  }

  const manifest = parsedRes.manifest;

  // 3. Verify record integrity (SHA-256)
  const integrityRes = verifyRecordIntegrity(manifest);
  if (!integrityRes.ok) {
    reportOutcomeAndExit(integrityRes.outcome);
  }

  // 4. Verify authority and signature (Ed25519)
  const authorityRes = verifyManifestAuthority(manifest, trustSet);
  if (!authorityRes.ok) {
    reportOutcomeAndExit(authorityRes.outcome);
  }

  // 5. Initialize database connection and run serializable transactional seeder
  const sql = postgres({
    host: process.env.PGHOST || "127.0.0.1",
    port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
    database: process.env.PGDATABASE || "zyppi_test",
    username: process.env.PGUSER || "zyppi_test",
    password: process.env.PGPASSWORD || "zyppi_test",
    onnotice: () => {},
  });

  try {
    const outcome = await executeSeedTransaction(sql, manifest);
    reportOutcomeAndExit(outcome);
  } catch {
    reportOutcomeAndExit({
      kind: "InfrastructureFailure",
      reasonCode: "DATABASE_CONNECTION_ERROR",
    });
  } finally {
    await sql.end();
  }
}

function reportOutcomeAndExit(outcome: SeedExecutionOutcome): never {
  console.log(JSON.stringify(outcome, null, 2));

  // Outcome to exit code mapping according to AMS-0504-IS §15.3
  let exitCode = 1;
  switch (outcome.kind) {
    case "Success":
    case "AlreadyMaterialized":
      exitCode = 0;
      break;
    case "InfrastructureFailure":
      exitCode = 1;
      break;
    case "StateDiverged":
      exitCode = 2;
      break;
    case "PartialStateAnomaly":
      exitCode = 3;
      break;
    case "IntegrityRefusal":
      exitCode = 4;
      break;
    case "AuthorityRefusal":
      exitCode = 5;
      break;
    case "ValidationRefusal":
      exitCode = 6;
      break;
  }

  process.exit(exitCode);
}

runCli().catch(() => {
  process.exit(1);
});

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { getCanonicalHash } from "./canonicalComparison.js";
import { FROZEN_REPLAY_CORPUS } from "./replayCorpus.js";
import { FROZEN_REGISTRY_SNAPSHOT } from "./replaySnapshot.js";
import type { ReplayReceipt, ReplayValidationResult } from "./replayTypes.js";

/**
 * Generates and saves a single deterministic Replay Receipt to
 * packages/testing/replay/receipts/latest.json
 */
export function generateAndSaveReceipt(
  result: ReplayValidationResult,
): ReplayReceipt {
  let gitCommitSha = "unknown";
  try {
    gitCommitSha = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    // Graceful fallback if git is not initialized or available
  }

  const corpusHash = getCanonicalHash(FROZEN_REPLAY_CORPUS);
  const registrySnapshotHash = getCanonicalHash(FROZEN_REGISTRY_SNAPSHOT);

  const receipt: ReplayReceipt = {
    replayVersion: "1.0.0",
    corpusVersion: FROZEN_REPLAY_CORPUS.version,
    corpusHash,
    registrySnapshotVersion: "1.0.0",
    registrySnapshotHash,
    gitCommitSha,
    nodeVersion: process.version,
    digestBefore: result.digestBefore,
    digestAfter: result.digestAfter,
    replayStatus: result.status,
    diagnostics: result.diagnostics,
    executionTimestamp: new Date().toISOString(),
  };

  // Resolve directory path: packages/testing/replay/receipts/
  // Since we execute from workspace root or package directory, resolve relative to workspace root
  const targetDir = path.resolve("packages/testing/replay/receipts");

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetPath = path.join(targetDir, "latest.json");
  fs.writeFileSync(targetPath, JSON.stringify(receipt, null, 2), "utf8");

  return receipt;
}

import { describe, it, expect } from "vitest";
import { FROZEN_REPLAY_CORPUS } from "./replayCorpus.js";
import { FrozenRegistryRepository } from "./replaySnapshot.js";
import { validateReplayDeterminism } from "./validateReplayDeterminism.js";
import { generateAndSaveReceipt } from "./receiptGenerator.js";
import { getCanonicalHash } from "./canonicalComparison.js";
import * as fs from "fs";
import * as path from "path";

describe("AMS-0606 — Replay Validation (IT-0606)", () => {
  it("should validate replay determinism against frozen corpus and frozen registry snapshot", async () => {
    const repository = new FrozenRegistryRepository();
    const result = await validateReplayDeterminism(
      FROZEN_REPLAY_CORPUS,
      repository,
    );

    // Assert that the replay validation successfully matches the expected outputs
    expect(result.passed).toBe(true);
    expect(result.status).toBe("IDENTICAL");
    expect(result.digestBefore).toBe(result.digestAfter);

    // Generate and save the replay validation receipt
    const receipt = generateAndSaveReceipt(result);

    expect(receipt.replayStatus).toBe("IDENTICAL");
    expect(receipt.corpusVersion).toBe("1.0.0");
    expect(receipt.nodeVersion).toBe(process.version);

    // Verify receipt physically exists on disk
    const receiptPath = path.resolve(
      "packages/testing/replay/receipts/latest.json",
    );
    expect(fs.existsSync(receiptPath)).toBe(true);

    const savedReceipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
    expect(savedReceipt.replayStatus).toBe("IDENTICAL");
    expect(savedReceipt.corpusHash).toBe(
      getCanonicalHash(FROZEN_REPLAY_CORPUS),
    );
  });

  it("should detect divergence if the registry returns mismatched outputs", async () => {
    // Construct a registry that doesn't return the matching widget for CASE-01-SUCCESS
    // returning null instead, causing it to resolve to NOT_FOUND instead of RESOLVED
    const repository = new FrozenRegistryRepository({}); // Empty snapshot

    const result = await validateReplayDeterminism(
      FROZEN_REPLAY_CORPUS,
      repository,
    );

    expect(result.passed).toBe(false);
    expect(result.status).toBe("DIVERGENT");
    expect(result.digestBefore).not.toBe(result.digestAfter);

    const hasDivergenceDiag = result.diagnostics.some(
      (d) => d.code === "CASE_DIVERGENCE" && d.severity === "ERROR",
    );
    expect(hasDivergenceDiag).toBe(true);
  });
});

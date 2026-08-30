import { describe, it, expect } from "vitest";
import { resolve } from "path";
import { existsSync, readFileSync } from "fs";
import { generateMobileFixtures } from "./generate-mobile-fixtures.js";

describe("Mobile Fixture Generator", () => {
  it("generates 11 mobile test fixtures and manifest.json", async () => {
    const targetDir = resolve(
      process.cwd(),
      "tools/zqe/mobile/android/app/src/androidTest/assets",
    );

    const manifest = await generateMobileFixtures(targetDir);

    expect(manifest).toHaveLength(11);
    expect(existsSync(resolve(targetDir, "manifest.json"))).toBe(true);

    const manifestContent = JSON.parse(
      readFileSync(resolve(targetDir, "manifest.json"), "utf-8"),
    );
    expect(manifestContent).toHaveLength(11);

    for (const item of manifest) {
      expect(existsSync(resolve(targetDir, item.filename))).toBe(true);
    }
  });
});

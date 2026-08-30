import { describe, it, expect } from "vitest";
import { resolve } from "path";
import { existsSync, readFileSync } from "fs";
import { generateShowcasePrintHelper } from "./showcase-print-helper.js";

describe("Showcase Print Helper", () => {
  it("generates showcase SVG, HTML print helper, and metadata JSON", () => {
    const outputDir = resolve(process.cwd(), "DOCS/ZII/ZQE/evidence/fqr1");

    const result = generateShowcasePrintHelper(outputDir);

    expect(result.payloadText).toBe("https://id.gs1.org/01/09520123456788");
    expect(existsSync(result.svgPath)).toBe(true);
    expect(existsSync(result.htmlPath)).toBe(true);
    expect(
      existsSync(resolve(outputDir, "payload-b-showcase-metadata.json")),
    ).toBe(true);

    const svgContent = readFileSync(result.svgPath, "utf-8");
    expect(svgContent).toContain('<svg xmlns="http://www.w3.org/2000/svg"');

    const htmlContent = readFileSync(result.htmlPath, "utf-8");
    expect(htmlContent).toContain("37 mm &times; 37 mm");
  });
});

import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { compileQr } from "@zyppi/qr-core";
import { renderQrSvg } from "@zyppi/qr-svg";
import { FIXTURES } from "./capture-transforms.js";
import { sha256Hex } from "./evidence.js";

export function generateShowcasePrintHelper(outputDir: string): {
  svgPath: string;
  htmlPath: string;
  canonicalSvgSha256: string;
  payloadSha256: string;
  payloadText: string;
} {
  mkdirSync(outputDir, { recursive: true });

  const payload = FIXTURES.B; // https://id.gs1.org/01/09520123456788
  const payloadText = new TextDecoder().decode(payload);
  const symbol = compileQr(payload, "zqe/fqr1");
  const svgContent = renderQrSvg(symbol);

  const canonicalSvgSha256 = sha256Hex(svgContent);
  const payloadSha256 = sha256Hex(payload);

  const svgPath = resolve(outputDir, "payload-b-showcase.svg");
  writeFileSync(svgPath, svgContent);

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ZQE FQR-1 Showcase Print Helper (Payload B)</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 20px;
      color: #111;
    }
    .print-container {
      border: 1px dashed #ccc;
      padding: 20px;
      width: 120mm;
      margin: 0 auto;
      text-align: center;
    }
    .qr-box {
      width: 37mm;
      height: 37mm;
      margin: 20px auto;
      background: #ffffff;
      box-sizing: border-box;
    }
    .qr-box svg {
      width: 37mm;
      height: 37mm;
      display: block;
    }
    .metadata {
      font-size: 11px;
      line-height: 1.4;
      font-family: monospace;
      text-align: left;
      margin-top: 20px;
      border-top: 1px solid #eee;
      padding-top: 10px;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="print-container">
    <h2>ZQE FQR-1 Showcase Print Helper</h2>
    <p>Target Print Dimension: <strong>37 mm &times; 37 mm</strong> (1 mm/unit, 4 mm quiet zone)</p>

    <div class="qr-box">
      ${svgContent}
    </div>

    <div class="metadata">
      <div><strong>Payload B:</strong> ${payloadText}</div>
      <div><strong>Payload SHA-256:</strong> ${payloadSha256}</div>
      <div><strong>Canonical SVG SHA-256:</strong> ${canonicalSvgSha256}</div>
      <div><strong>Profile ID:</strong> zqe/fqr1</div>
    </div>
  </div>
</body>
</html>
`;

  const htmlPath = resolve(outputDir, "payload-b-showcase.html");
  writeFileSync(htmlPath, htmlContent);

  const metadataJson = {
    payloadId: "B",
    payloadText,
    payloadSha256,
    canonicalSvgSha256,
    profileId: "zqe/fqr1",
    printDimensions: "37mm x 37mm",
    svgFile: "payload-b-showcase.svg",
    htmlFile: "payload-b-showcase.html",
  };
  writeFileSync(
    resolve(outputDir, "payload-b-showcase-metadata.json"),
    JSON.stringify(metadataJson, null, 2),
  );

  return {
    svgPath,
    htmlPath,
    canonicalSvgSha256,
    payloadSha256,
    payloadText,
  };
}

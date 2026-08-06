import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Deterministic generator for the Synthetic Stress Corpus.
 * Generates adversarial inputs to exercise the GS1 Digital Link Parser (AMS-0601).
 */
export function generateSyntheticStressCorpus(): string[] {
  const corpus: string[] = [];

  // 1. Maximum-length URI (adversarial size)
  // GS1 Digital Links rarely exceed 500 characters, let's stress test with an extremely long URI (e.g., ~2KB)
  const baseUri = "https://id.gs1.org/01/09506000134352";
  let longQuery = "?";
  for (let i = 100; i < 300; i++) {
    longQuery += `&${i}=VAL${i}`;
  }
  corpus.push(baseUri + longQuery);

  // 2. Dense query strings
  corpus.push(
    "https://example.com/01/09506000134352?10=LOT1&21=SER1&17=260831&30=12&3102=001250&37=100&91=COMPANY&92=SECURE&93=PARTNER&99=UNSUPPORTED",
  );

  // 3. Malformed percent encoding
  corpus.push("https://id.gs1.org/01/09506000134352/21/SER%G1");
  corpus.push("https://id.gs1.org/01/09506000134352?10=LOT%G2");
  corpus.push("https://id.gs1.org/01/09506000134352/21/SER%2"); // partial percent

  // 4. Duplicated parameters
  corpus.push("https://id.gs1.org/01/09506000134352?10=LOT1&10=LOT2&10=LOT3");

  // 5. Malformed syntax
  corpus.push("https://id.gs1.org/01/09506000134352/21"); // Odd number of path segments
  corpus.push("https://id.gs1.org/01/09506000134352/invalid_ai/123"); // Non-numeric AI segment
  corpus.push("https://id.gs1.org/"); // Empty path
  corpus.push("https://example.com/about"); // Non-AI path start
  corpus.push("ftp://id.gs1.org/01/09506000134352"); // Non-HTTP(S) scheme
  corpus.push("not-a-valid-uri"); // Schemeless string

  // 6. Unsupported AIs
  corpus.push("https://id.gs1.org/01/09506000134352/99/UNSUPPORTED_VAL");
  corpus.push("https://id.gs1.org/01/09506000134352/888/VAL/777/OTHER_VAL");

  // 7. Pathological inputs for execution budget testing
  corpus.push("https://id.gs1.org/" + "10/".repeat(200) + "01/09506000134352"); // deeply nested path with repeated segments
  corpus.push(
    "https://id.gs1.org/01/09506000134352?" + "10=A&".repeat(100) + "21=B",
  ); // huge number of identical duplicate parameters

  return corpus;
}

// CLI execution capability
if (process.argv[1]?.endsWith("generateSyntheticCorpus.js")) {
  const generated = generateSyntheticStressCorpus();
  // Always resolve relative to repository root to be fully deterministic
  const rootDir = process.cwd();
  const outputDir = path.join(
    rootDir,
    "packages",
    "domain",
    "benchmarks",
    "corpus",
  );
  const outputPath = path.join(outputDir, "synthetic.json");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(generated, null, 2), "utf8");
  console.log(
    `Synthetic Stress Corpus deterministically generated at: ${outputPath}`,
  );
}

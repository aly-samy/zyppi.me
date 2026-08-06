import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import * as os from "node:os";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseGs1DigitalLink } from "@zyppi/domain";

interface BenchmarkConfig {
  benchmarkVersion: string;
  corpusVersion: string;
  expectedHashes: {
    canonical: string;
    synthetic: string;
  };
  settings: {
    warmupIterations: number;
    benchmarkIterations: number;
    pathologicalIterations: number;
    exposeGc: boolean;
  };
  thresholds: {
    maxPathologicalExecutionDurationMs: number;
    maxRetainedHeapGrowthBytes: number;
  };
}

interface BaselineData {
  benchmarkVersion: string;
  corpusVersion: string;
  metrics: {
    throughputOpsPerSec: number;
    averageLatencyMs: number;
    medianLatencyMs: number;
    p95LatencyMs: number;
    p99LatencyMs: number;
    pathologicalExecutionDurationMs: number;
    retainedHeapGrowthBytes: number;
  };
}

interface ComparisonMetric {
  baseline: number;
  current: number;
  diffPct?: number;
  diffBytes?: number;
}

function computeFileSha256(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

function getGitCommitSha(): string {
  try {
    return execSync("git rev-parse HEAD", { stdio: "pipe" }).toString().trim();
  } catch {
    return "unknown-commit";
  }
}

function runBenchmark() {
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFile);
  // If in 'dist', go up one level to 'benchmarks' root.
  const benchmarksDir = currentDir.endsWith("dist")
    ? path.dirname(currentDir)
    : currentDir;

  const configPath = path.join(benchmarksDir, "config.json");
  const canonicalCorpusPath = path.join(
    benchmarksDir,
    "corpus",
    "canonical.json",
  );
  const syntheticCorpusPath = path.join(
    benchmarksDir,
    "corpus",
    "synthetic.json",
  );
  const baselinePath = path.join(
    benchmarksDir,
    "baselines",
    "parser-baseline.json",
  );
  const receiptPath = path.join(benchmarksDir, "receipts", "latest.json");

  // Ensure output directories exist
  const receiptsDir = path.dirname(receiptPath);
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }

  // 1. Load configuration
  if (!fs.existsSync(configPath)) {
    console.error(`Error: Configuration not found at ${configPath}`);
    process.exit(1);
  }
  const config: BenchmarkConfig = JSON.parse(
    fs.readFileSync(configPath, "utf8"),
  );

  // 2. Load corpora and verify SHA-256
  if (
    !fs.existsSync(canonicalCorpusPath) ||
    !fs.existsSync(syntheticCorpusPath)
  ) {
    console.error(
      "Error: Corpus files (canonical.json or synthetic.json) are missing.",
    );
    process.exit(1);
  }

  const computedCanonicalHash = computeFileSha256(canonicalCorpusPath);
  const computedSyntheticHash = computeFileSha256(syntheticCorpusPath);

  if (computedCanonicalHash !== config.expectedHashes.canonical) {
    console.error(
      `CRITICAL: Canonical corpus SHA-256 mismatch!\nExpected: ${config.expectedHashes.canonical}\nComputed: ${computedCanonicalHash}`,
    );
    process.exit(1);
  }

  if (computedSyntheticHash !== config.expectedHashes.synthetic) {
    console.error(
      `CRITICAL: Synthetic corpus SHA-256 mismatch!\nExpected: ${config.expectedHashes.synthetic}\nComputed: ${computedSyntheticHash}`,
    );
    process.exit(1);
  }

  console.log("Corpus integrity verification: PASS");

  const canonicalInputs: string[] = JSON.parse(
    fs.readFileSync(canonicalCorpusPath, "utf8"),
  );
  const syntheticInputs: string[] = JSON.parse(
    fs.readFileSync(syntheticCorpusPath, "utf8"),
  );
  const allInputs = [...canonicalInputs, ...syntheticInputs];

  // 3. Garbage Collection checks
  const isGcExposed = typeof global.gc === "function";
  if (isGcExposed) {
    console.log("Garbage Collection interface: Available");
  } else {
    console.log(
      "Garbage Collection interface: Not available (heap measurements will be skipped)",
    );
  }

  // 4. Warm-up
  console.log(
    `Warming up parser with ${config.settings.warmupIterations} iterations...`,
  );
  for (let i = 0; i < config.settings.warmupIterations; i++) {
    for (const input of allInputs) {
      parseGs1DigitalLink(input);
    }
  }

  // 5. Run standard benchmark (throughput & latencies over all inputs)
  console.log(
    `Running parser benchmarks with ${config.settings.benchmarkIterations} iterations...`,
  );

  if (isGcExposed && global.gc) {
    global.gc();
  }
  const initialHeapUsed = process.memoryUsage().heapUsed;

  const latencies: number[] = [];
  const startTotal = performance.now();

  for (let i = 0; i < config.settings.benchmarkIterations; i++) {
    for (const input of allInputs) {
      const start = performance.now();
      parseGs1DigitalLink(input);
      const end = performance.now();
      latencies.push(end - start);
    }
  }

  const endTotal = performance.now();
  const totalDurationMs = endTotal - startTotal;

  // Force GC for retained memory measurement
  let retainedHeapGrowthBytes = 0;
  if (isGcExposed && global.gc) {
    global.gc();
    const finalHeapUsed = process.memoryUsage().heapUsed;
    retainedHeapGrowthBytes = Math.max(0, finalHeapUsed - initialHeapUsed);
    console.log(`Retained heap growth: ${retainedHeapGrowthBytes} bytes`);
  }

  // Calculate standard metrics
  const totalOps = config.settings.benchmarkIterations * allInputs.length;
  const throughputOpsPerSec = (totalOps / totalDurationMs) * 1000;

  // Sort latencies to compute percentiles
  latencies.sort((a, b) => a - b);
  const totalLatencies = latencies.length;
  const averageLatencyMs =
    latencies.reduce((acc, v) => acc + v, 0) / totalLatencies;
  const medianLatencyMs = latencies[Math.floor(totalLatencies * 0.5)];
  const p95LatencyMs = latencies[Math.floor(totalLatencies * 0.95)];
  const p99LatencyMs = latencies[Math.floor(totalLatencies * 0.99)];

  console.log(`Throughput: ${throughputOpsPerSec.toFixed(2)} ops/sec`);
  console.log(
    `Latency: Avg ${averageLatencyMs.toFixed(5)} ms | Med ${medianLatencyMs.toFixed(5)} ms | p95 ${p95LatencyMs.toFixed(5)} ms | p99 ${p99LatencyMs.toFixed(5)} ms`,
  );

  // 6. Pathological inputs execution budget measurement
  // Identify pathological inputs from synthetic corpus (indices 13 and 14 are deeply nested & duplicate params)
  const pathologicalInputs = syntheticInputs.slice(-2);
  console.log(
    `Measuring pathological-input execution duration over ${config.settings.pathologicalIterations} iterations...`,
  );

  const pathologicalLatencies: number[] = [];
  for (let i = 0; i < config.settings.pathologicalIterations; i++) {
    for (const pInput of pathologicalInputs) {
      const start = performance.now();
      parseGs1DigitalLink(pInput);
      const end = performance.now();
      pathologicalLatencies.push(end - start);
    }
  }
  const maxPathologicalDurationMs = Math.max(...pathologicalLatencies);
  console.log(
    `Max pathological-input duration: ${maxPathologicalDurationMs.toFixed(5)} ms`,
  );

  // 7. Load baseline and perform comparisons
  let baseline: BaselineData | null = null;
  if (fs.existsSync(baselinePath)) {
    try {
      baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
    } catch {
      console.warn("Warning: Could not parse baseline file.");
    }
  }

  const baselineComparison: Record<string, ComparisonMetric> = {};
  if (baseline) {
    const baseMetrics = baseline.metrics;
    baselineComparison.throughputOpsPerSec = {
      baseline: baseMetrics.throughputOpsPerSec,
      current: throughputOpsPerSec,
      diffPct:
        ((throughputOpsPerSec - baseMetrics.throughputOpsPerSec) /
          baseMetrics.throughputOpsPerSec) *
        100,
    };
    baselineComparison.averageLatencyMs = {
      baseline: baseMetrics.averageLatencyMs,
      current: averageLatencyMs,
      diffPct:
        ((averageLatencyMs - baseMetrics.averageLatencyMs) /
          baseMetrics.averageLatencyMs) *
        100,
    };
    baselineComparison.medianLatencyMs = {
      baseline: baseMetrics.medianLatencyMs,
      current: medianLatencyMs,
      diffPct:
        ((medianLatencyMs - baseMetrics.medianLatencyMs) /
          baseMetrics.medianLatencyMs) *
        100,
    };
    baselineComparison.p95LatencyMs = {
      baseline: baseMetrics.p95LatencyMs,
      current: p95LatencyMs,
      diffPct:
        ((p95LatencyMs - baseMetrics.p95LatencyMs) / baseMetrics.p95LatencyMs) *
        100,
    };
    baselineComparison.p99LatencyMs = {
      baseline: baseMetrics.p99LatencyMs,
      current: p99LatencyMs,
      diffPct:
        ((p99LatencyMs - baseMetrics.p99LatencyMs) / baseMetrics.p99LatencyMs) *
        100,
    };
    baselineComparison.pathologicalExecutionDurationMs = {
      baseline: baseMetrics.pathologicalExecutionDurationMs,
      current: maxPathologicalDurationMs,
      diffPct:
        ((maxPathologicalDurationMs -
          baseMetrics.pathologicalExecutionDurationMs) /
          baseMetrics.pathologicalExecutionDurationMs) *
        100,
    };
    if (isGcExposed) {
      baselineComparison.retainedHeapGrowthBytes = {
        baseline: baseMetrics.retainedHeapGrowthBytes,
        current: retainedHeapGrowthBytes,
        diffBytes:
          retainedHeapGrowthBytes - baseMetrics.retainedHeapGrowthBytes,
      };
    }
  }

  // 8. Regression classification and Hard Gates
  let regressionClassification: "Minor" | "Moderate" | "Critical" = "Minor";
  const failures: string[] = [];

  // Memory invariant violation (Hard Gate)
  if (isGcExposed) {
    if (
      retainedHeapGrowthBytes > config.thresholds.maxRetainedHeapGrowthBytes
    ) {
      regressionClassification = "Critical";
      failures.push(
        `Memory invariant violation: Retained heap growth (${retainedHeapGrowthBytes} bytes) exceeded threshold (${config.thresholds.maxRetainedHeapGrowthBytes} bytes)`,
      );
    }
  }

  // Pathological execution budget exceeded (Hard Gate)
  if (
    maxPathologicalDurationMs >
    config.thresholds.maxPathologicalExecutionDurationMs
  ) {
    regressionClassification = "Critical";
    failures.push(
      `Pathological execution budget exceeded: Max pathological duration (${maxPathologicalDurationMs.toFixed(3)} ms) exceeded budget (${config.thresholds.maxPathologicalExecutionDurationMs} ms)`,
    );
  }

  // Determine overall status
  let executionStatus: "PASS" | "PASS_WITH_WARNINGS" | "FAIL" = "PASS";
  if (regressionClassification === "Critical") {
    executionStatus = "FAIL";
  } else if (!isGcExposed) {
    executionStatus = "PASS_WITH_WARNINGS";
  }

  const systemMemoryGb = os.totalmem() / (1024 * 1024 * 1024);

  // 9. Generate and write Benchmark Receipt
  const receipt = {
    benchmarkVersion: config.benchmarkVersion,
    benchmarkRunnerVersion: "1.0.0",
    benchmarkCorpusVersion: config.corpusVersion,
    benchmarkCorpusSha256: {
      canonical: config.expectedHashes.canonical,
      synthetic: config.expectedHashes.synthetic,
    },
    gitCommitSha: getGitCommitSha(),
    executionTimestamp: new Date().toISOString(),
    nodeVersion: process.version,
    operatingSystem: `${os.platform()} ${os.type()} ${os.release()}`,
    cpuArchitecture: os.arch(),
    cpuModel: os.cpus()[0]?.model || "Unknown",
    totalSystemMemoryBytes: os.totalmem(),
    totalSystemMemoryGbFormatted: `${systemMemoryGb.toFixed(2)} GB`,
    memoryMeasurement: isGcExposed ? "supported" : "not-supported",
    executionStatus,
    regressionClassification,
    benchmarkMetrics: {
      throughputOpsPerSec,
      averageLatencyMs,
      medianLatencyMs,
      p95LatencyMs,
      p99LatencyMs,
      pathologicalExecutionDurationMs: maxPathologicalDurationMs,
      retainedHeapGrowthBytes: isGcExposed ? retainedHeapGrowthBytes : null,
    },
    baselineComparison,
    failures,
  };

  fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2), "utf8");
  console.log(`Benchmark Receipt written successfully to: ${receiptPath}`);

  // Report status
  if (executionStatus === "FAIL") {
    console.error("\n=== BENCHMARK EXECUTION FAILED ===");
    for (const fail of failures) {
      console.error(`- ${fail}`);
    }
    process.exit(1);
  } else if (executionStatus === "PASS_WITH_WARNINGS") {
    console.warn("\n=== BENCHMARK PASSED WITH WARNINGS ===");
    console.warn(
      "- Heap measurements skipped due to unavailable GC interface.",
    );
    process.exit(0);
  } else {
    console.log("\n=== BENCHMARK PASSED ===");
    process.exit(0);
  }
}

runBenchmark();

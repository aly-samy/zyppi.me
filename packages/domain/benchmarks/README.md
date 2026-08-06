# GS1 Digital Link Parser Benchmarks & Corpus

This directory houses the constitutional benchmark suite and immutable corpora for the GS1 Digital Link Parser (`AMS-0601`).

## Directory Structure

```
packages/domain/benchmarks/
├── README.md               # This documentation
├── config.json             # Configuration & cryptographic hashes
├── generateSyntheticCorpus.ts  # Deterministic stress corpus generator
├── parserBenchmarkRunner.ts    # Standalone benchmark runner
├── baselines/
│   └── parser-baseline.json    # Version-controlled baseline metrics
├── corpus/
│   ├── canonical.json          # Production canonical inputs
│   └── synthetic.json          # Deterministic adversarial stress inputs
└── receipts/
    └── latest.json             # Execution receipt from the latest run
```

## Corpus Categories

### 1. Canonical GS1 Corpus (`corpus/canonical.json`)

A collection of valid GS1 Digital Links representing standard production use cases. These are sourced from common path-based, query-based, and mixed-mode digital link designs.

### 2. Synthetic Stress Corpus (`corpus/synthetic.json`)

A collection of adversarial inputs designed to stress-test the parser limits.
Stress vectors include:

- **Maximum-length URIs**: Stressing parser URL parsing limits and string allocation.
- **Dense Query Strings**: High cardinality parameter structures.
- **Malformed Percent Encoding**: Invalid percent encoding sequences in various segments.
- **Duplicated Parameters**: Duplicate AI keys in the query string.
- **Malformed Syntax**: Odd-numbered path segments, non-numeric segments, schemeless structures.
- **Unsupported AIs**: General syntactically valid but unsupported Application Identifiers.
- **Pathological Inputs**: Deeply nested paths and extreme query-parameter duplication to verify execution budgets.

## Generation Procedure

The Synthetic Stress Corpus is produced deterministically by the script `generateSyntheticCorpus.ts`. No external pseudorandomness is used, ensuring that every run yields identical bytes.

### Regeneration Script

To regenerate the Synthetic Stress Corpus:

```bash
# From the repository root:
pnpm exec tsc -p packages/domain/benchmarks/tsconfig.json
node packages/domain/benchmarks/dist/generateSyntheticCorpus.js
```

## Corpus Integrity Verification

Before executing benchmarks, the benchmark runner loads `config.json` and calculates the SHA-256 digest of both `corpus/canonical.json` and `corpus/synthetic.json`.
The runner compares the computed digests against `expectedHashes` in `config.json`. If a digest differs, the benchmark execution fails immediately, and no receipt is generated.

## Approval Workflow

Any changes to the Canonical Corpus, the Synthetic Corpus Generator, or the Baselines require explicit constitutional approval.
To update a corpus or baseline:

1. Propose the modification in an RFC / Architectural Decision Record.
2. If approved, regenerate the corpus.
3. Compute the new SHA-256 digests.
4. Update `config.json` with the new digests and increment `corpusVersion`.
5. Run the benchmark to establish the new metrics.
6. Commit the updated corpus, config, and `parser-baseline.json` together as part of the approved change.

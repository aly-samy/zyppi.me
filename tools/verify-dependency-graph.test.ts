import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { runValidation } from "./verify-dependency-graph.mjs";
import { runDomainIsolationValidation } from "./verify-domain-isolation.mjs";

function setupBaseWorkspace(tempDir: string) {
  const NODES = [
    "packages/domain",
    "packages/shared",
    "packages/contracts",
    "packages/runtime",
    "packages/testing",
    "apps/api",
    "apps/web",
    "edge/worker",
    "infra",
  ];

  for (const node of NODES) {
    const nodeDir = path.join(tempDir, node);
    fs.mkdirSync(nodeDir, { recursive: true });

    if (node !== "edge/worker") {
      const pkgName = `@zyppi/${node.split("/")[1]}`;
      fs.writeFileSync(
        path.join(nodeDir, "package.json"),
        JSON.stringify(
          {
            name: pkgName,
            version: "0.1.0",
            private: true,
            dependencies: {},
            peerDependencies: {},
            devDependencies: {},
          },
          null,
          2,
        ),
      );
    }

    fs.writeFileSync(
      path.join(nodeDir, "tsconfig.json"),
      JSON.stringify(
        {
          compilerOptions: {},
          references: [],
        },
        null,
        2,
      ),
    );

    const srcDir = path.join(nodeDir, "src");
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(path.join(srcDir, "index.ts"), "export {};\n");
  }
}

describe("Zyppi Constitutional Dependency Graph Validator - Automated Negative & Positive Test Suite", () => {
  it("Positive Validation - Should pass on a fully compliant base workspace", () => {
    const tempDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "zyppi-test-positive-")),
    );
    try {
      setupBaseWorkspace(tempDir);
      const { violations } = runValidation(tempDir);
      expect(violations).toHaveLength(0);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("Test 1 — Unauthorized Manifest Dependency", () => {
    const tempDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "zyppi-test-t1-")),
    );
    try {
      setupBaseWorkspace(tempDir);

      // Mutate packages/domain/package.json to have unauthorized dependency on @zyppi/shared
      const pjPath = path.join(tempDir, "packages/domain/package.json");
      const pj = JSON.parse(fs.readFileSync(pjPath, "utf8"));
      pj.dependencies = { "@zyppi/shared": "^0.1.0" };
      fs.writeFileSync(pjPath, JSON.stringify(pj, null, 2));

      const { violations } = runValidation(tempDir);
      expect(violations.length).toBeGreaterThan(0);
      const v = violations.find(
        (x) => x.rule === "unauthorized-production-dependency",
      );
      expect(v).toBeDefined();
      expect(v.node).toBe("packages/domain");
      expect(v.layer).toBe("manifest");
      expect(v.description).toContain("@zyppi/shared");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("Test 2 — Unauthorized TypeScript Project Reference", () => {
    const tempDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "zyppi-test-t2-")),
    );
    try {
      setupBaseWorkspace(tempDir);

      // Mutate packages/domain/tsconfig.json to reference packages/shared
      const tsconfigPath = path.join(tempDir, "packages/domain/tsconfig.json");
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));
      tsconfig.references = [{ path: "../shared" }];
      fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));

      const { violations } = runValidation(tempDir);
      expect(violations.length).toBeGreaterThan(0);
      const v = violations.find(
        (x) => x.rule === "unauthorized-project-reference",
      );
      expect(v).toBeDefined();
      expect(v.node).toBe("packages/domain");
      expect(v.layer).toBe("tsconfig");
      expect(v.description).toContain("packages/shared");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("Test 3 — Unauthorized @zyppi/* Source Import", () => {
    const tempDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "zyppi-test-t3-")),
    );
    try {
      setupBaseWorkspace(tempDir);

      // Mutate packages/domain/src/index.ts to import @zyppi/shared in production context
      const sourcePath = path.join(tempDir, "packages/domain/src/index.ts");
      fs.writeFileSync(sourcePath, "import { x } from '@zyppi/shared';\n");

      const { violations } = runValidation(tempDir);
      expect(violations.length).toBeGreaterThan(0);
      const v = violations.find(
        (x) => x.rule === "unauthorized-production-dependency",
      );
      expect(v).toBeDefined();
      expect(v.node).toBe("packages/domain");
      expect(v.layer).toBe("source");
      expect(v.file).toBe("packages/domain/src/index.ts");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("Test 4 — Relative Import Escaping a Workspace Boundary", () => {
    const tempDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "zyppi-test-t4-")),
    );
    try {
      setupBaseWorkspace(tempDir);

      // Mutate apps/api/src/index.ts to relatively import packages/domain
      const sourcePath = path.join(tempDir, "apps/api/src/index.ts");
      fs.writeFileSync(
        sourcePath,
        "import { value } from '../../../packages/domain/src/index.js';\n",
      );

      const { violations } = runValidation(tempDir);
      expect(violations.length).toBeGreaterThan(0);
      const v = violations.find((x) => x.rule === "relative-boundary-skipping");
      expect(v).toBeDefined();
      expect(v.node).toBe("apps/api");
      expect(v.layer).toBe("source");
      expect(v.description).toContain("packages/domain");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("Test 5 — Manufactured Dependency Cycle", () => {
    const tempDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "zyppi-test-t5-")),
    );
    try {
      setupBaseWorkspace(tempDir);

      // Create a cycle: packages/contracts -> packages/domain and packages/domain -> packages/contracts
      const contractsPjPath = path.join(
        tempDir,
        "packages/contracts/package.json",
      );
      const contractsPj = JSON.parse(fs.readFileSync(contractsPjPath, "utf8"));
      contractsPj.dependencies = { "@zyppi/domain": "^0.1.0" };
      fs.writeFileSync(contractsPjPath, JSON.stringify(contractsPj, null, 2));

      const domainPjPath = path.join(tempDir, "packages/domain/package.json");
      const domainPj = JSON.parse(fs.readFileSync(domainPjPath, "utf8"));
      domainPj.dependencies = { "@zyppi/contracts": "^0.1.0" };
      fs.writeFileSync(domainPjPath, JSON.stringify(domainPj, null, 2));

      const { violations } = runValidation(tempDir);
      expect(violations.length).toBeGreaterThan(0);
      const v = violations.find((x) => x.rule === "dependency-cycle");
      expect(v).toBeDefined();
      expect(v.layer).toBe("graph");
      expect(v.description).toContain("Dependency cycle detected");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("Test 6 — Production Use of a Dev-Only Edge", () => {
    const tempDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "zyppi-test-t6-")),
    );
    try {
      setupBaseWorkspace(tempDir);

      // Mutate apps/api/src/index.ts (production context) to import @zyppi/testing
      const sourcePath = path.join(tempDir, "apps/api/src/index.ts");
      fs.writeFileSync(sourcePath, "import { value } from '@zyppi/testing';\n");

      const { violations } = runValidation(tempDir);
      expect(violations.length).toBeGreaterThan(0);
      const v = violations.find(
        (x) => x.rule === "dev-only-used-in-production",
      );
      expect(v).toBeDefined();
      expect(v.node).toBe("apps/api");
      expect(v.layer).toBe("source");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("Test 7 — Transitive Authority Violation", () => {
    const tempDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "zyppi-test-t7-")),
    );
    try {
      setupBaseWorkspace(tempDir);

      // Mutate apps/api/src/index.ts to import @zyppi/shared (direct edge not allowed, even though transitive API -> runtime -> shared exists)
      const sourcePath = path.join(tempDir, "apps/api/src/index.ts");
      fs.writeFileSync(sourcePath, "import { value } from '@zyppi/shared';\n");

      const { violations } = runValidation(tempDir);
      expect(violations.length).toBeGreaterThan(0);
      const v = violations.find(
        (x) => x.rule === "unauthorized-production-dependency",
      );
      expect(v).toBeDefined();
      expect(v.node).toBe("apps/api");
      expect(v.description).toContain(
        'Transitive reachability from "apps/api" to "packages/shared" does not grant direct authorization',
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("Test 8 — Infrastructure or Execution-Boundary Bleed", () => {
    const tempDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "zyppi-test-t8-")),
    );
    try {
      setupBaseWorkspace(tempDir);

      // Mutate packages/domain/src/index.ts (pure model) to cross-import apps/api
      const sourcePath = path.join(tempDir, "packages/domain/src/index.ts");
      fs.writeFileSync(
        sourcePath,
        "import { value } from '../../../apps/api/src/index.js';\n",
      );

      const { violations } = runValidation(tempDir);
      expect(violations.length).toBeGreaterThan(0);
      const v = violations.find((x) => x.rule === "relative-boundary-skipping");
      expect(v).toBeDefined();
      expect(v.node).toBe("packages/domain");
      expect(v.description).toContain("apps/api");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("Test 9 — Sibling Application or Edge Contamination", () => {
    const tempDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "zyppi-test-t9-")),
    );
    try {
      setupBaseWorkspace(tempDir);

      // Mutate apps/web/src/index.ts to import apps/api
      const sourcePath = path.join(tempDir, "apps/web/src/index.ts");
      fs.writeFileSync(sourcePath, "import { value } from '@zyppi/api';\n");

      const { violations } = runValidation(tempDir);
      expect(violations.length).toBeGreaterThan(0);
      const v = violations.find((x) => x.rule === "sibling-contamination");
      expect(v).toBeDefined();
      expect(v.node).toBe("apps/web");
      expect(v.description).toContain(
        "unauthorized sibling application or edge coupling",
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("Test 10 — Synthetic Forbidden Relative Import into GS1 Domain Edge", () => {
    const tempDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "zyppi-test-t10-")),
    );
    try {
      setupBaseWorkspace(tempDir);

      // Create gs1 dir in apps/api/src
      const gs1Dir = path.join(tempDir, "apps/api/src/gs1");
      fs.mkdirSync(gs1Dir, { recursive: true });
      fs.writeFileSync(
        path.join(gs1Dir, "gs1AnchorBridge.ts"),
        "export const anchor = {};\n",
      );

      // Create zprof dir in apps/api/src
      const zprofDir = path.join(tempDir, "apps/api/src/zprof");
      fs.mkdirSync(zprofDir, { recursive: true });
      // Forbidden relative import from zprof into gs1
      fs.writeFileSync(
        path.join(zprofDir, "forbidden.ts"),
        "import { anchor } from '../gs1/gs1AnchorBridge.js';\n",
      );

      const { violations } = runDomainIsolationValidation(tempDir);
      expect(violations.length).toBeGreaterThan(0);
      const v = violations.find(
        (x) => x.rule === "gs1-domain-edge-contamination",
      );
      expect(v).toBeDefined();
      expect(v.file).toBe("apps/api/src/zprof/forbidden.ts");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("Test 11 — Synthetic Forbidden Alias/Package Import into GS1 Domain Edge", () => {
    const tempDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "zyppi-test-t11-")),
    );
    try {
      setupBaseWorkspace(tempDir);

      // Configure tsconfig path alias in apps/api/tsconfig.json
      const tsconfigPath = path.join(tempDir, "apps/api/tsconfig.json");
      fs.writeFileSync(
        tsconfigPath,
        JSON.stringify(
          {
            compilerOptions: {
              baseUrl: ".",
              paths: {
                "@api/*": ["src/*"],
              },
            },
            references: [],
          },
          null,
          2,
        ),
      );

      // Create gs1 dir in apps/api/src
      const gs1Dir = path.join(tempDir, "apps/api/src/gs1");
      fs.mkdirSync(gs1Dir, { recursive: true });
      fs.writeFileSync(
        path.join(gs1Dir, "gs1AnchorBridge.ts"),
        "export const anchor = {};\n",
      );

      // Create registry dir in apps/api/src
      const registryDir = path.join(tempDir, "apps/api/src/registry");
      fs.mkdirSync(registryDir, { recursive: true });
      // Forbidden alias import from registry into gs1
      fs.writeFileSync(
        path.join(registryDir, "pipelineOrchestrator.ts"),
        "import { anchor } from '@api/gs1/gs1AnchorBridge.js';\n",
      );

      const { violations } = runDomainIsolationValidation(tempDir);
      expect(violations.length).toBeGreaterThan(0);
      const v = violations.find(
        (x) => x.rule === "gs1-domain-edge-contamination",
      );
      expect(v).toBeDefined();
      expect(v.file).toBe("apps/api/src/registry/pipelineOrchestrator.ts");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

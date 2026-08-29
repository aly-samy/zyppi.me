import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { runValidation } from "./verify-dependency-graph.mjs";
import { runDomainIsolationValidation } from "./verify-domain-isolation.mjs";
import {
  ACTIVE_WORKSPACE_POLICY,
  CAW_PROGRAM_POLICY,
  composeWorkspacePolicy,
} from "./workspace-policy.mjs";

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

describe("RGT Governance & Preflight Test Suite (RGT-07)", () => {
  it("9.1 Existing CAW equivalence", () => {
    // Current live repository MUST validate without graph violations against ACTIVE_WORKSPACE_POLICY
    const { violations } = runValidation(process.cwd());
    expect(violations).toHaveLength(0);
    expect(ACTIVE_WORKSPACE_POLICY.nodes.size).toBe(9);
    expect(
      ACTIVE_WORKSPACE_POLICY.nodes.get("infra").productionDependencies,
    ).toHaveLength(0);
    expect(
      ACTIVE_WORKSPACE_POLICY.nodes.get("infra").devOnlyDependencies,
    ).toHaveLength(0);
  });

  it("9.2 Fail-closed unknown node", () => {
    const tempDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "zyppi-rgt-unknown-node-")),
    );
    try {
      setupBaseWorkspace(tempDir);
      // Create an unowned node on filesystem not present in policy
      const unknownDir = path.join(tempDir, "packages/unowned");
      fs.mkdirSync(path.join(unknownDir, "src"), { recursive: true });
      fs.writeFileSync(
        path.join(unknownDir, "package.json"),
        JSON.stringify({ name: "@zyppi/unowned", version: "0.1.0" }),
      );

      const { violations } = runValidation(tempDir);
      expect(violations.length).toBeGreaterThan(0);
      const v = violations.find((x) => x.rule === "unowned-workspace-node");
      expect(v).toBeDefined();
      expect(v.node).toBe("packages/unowned");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("9.3 Fail-closed unknown package", () => {
    const tempDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "zyppi-rgt-unknown-pkg-")),
    );
    try {
      setupBaseWorkspace(tempDir);
      // apps/api imports unknown @zyppi/nonexistent
      fs.writeFileSync(
        path.join(tempDir, "apps/api/src/index.ts"),
        "import { foo } from '@zyppi/nonexistent';\n",
      );

      const { violations } = runValidation(tempDir);
      expect(violations.length).toBeGreaterThan(0);
      const v = violations.find(
        (x) => x.rule === "unrecognized-workspace-edge",
      );
      expect(v).toBeDefined();
      expect(v.description).toContain("@zyppi/nonexistent");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("9.4 Unauthorized production edge", () => {
    const tempDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "zyppi-rgt-unauth-prod-")),
    );
    try {
      setupBaseWorkspace(tempDir);
      // packages/domain (production) imports @zyppi/shared
      fs.writeFileSync(
        path.join(tempDir, "packages/domain/src/index.ts"),
        "import { foo } from '@zyppi/shared';\n",
      );

      const { violations } = runValidation(tempDir);
      expect(violations.length).toBeGreaterThan(0);
      const v = violations.find(
        (x) => x.rule === "unauthorized-production-dependency",
      );
      expect(v).toBeDefined();
      expect(v.node).toBe("packages/domain");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("9.5 Dev-only misuse", () => {
    const tempDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "zyppi-rgt-dev-misuse-")),
    );
    try {
      setupBaseWorkspace(tempDir);
      // apps/api (production context) imports @zyppi/testing (dev-only edge)
      fs.writeFileSync(
        path.join(tempDir, "apps/api/src/index.ts"),
        "import { helper } from '@zyppi/testing';\n",
      );

      const { violations } = runValidation(tempDir);
      expect(violations.length).toBeGreaterThan(0);
      const v = violations.find(
        (x) => x.rule === "dev-only-used-in-production",
      );
      expect(v).toBeDefined();
      expect(v.node).toBe("apps/api");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("9.6 Non-transitivity", () => {
    const tempDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "zyppi-rgt-non-transitive-")),
    );
    try {
      setupBaseWorkspace(tempDir);
      // apps/api -> packages/runtime -> packages/shared exists transitively.
      // Direct apps/api -> packages/shared MUST be rejected.
      fs.writeFileSync(
        path.join(tempDir, "apps/api/src/index.ts"),
        "import { helper } from '@zyppi/shared';\n",
      );

      const { violations } = runValidation(tempDir);
      expect(violations.length).toBeGreaterThan(0);
      const v = violations.find(
        (x) => x.rule === "unauthorized-production-dependency",
      );
      expect(v).toBeDefined();
      expect(v.description).toContain(
        'Transitive reachability from "apps/api" to "packages/shared" does not grant direct authorization',
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("9.7 Cycle rejection", () => {
    // Composition level cycle rejection
    const cyclicFragment = {
      programId: "CYCLE_PROG",
      nodes: [
        {
          node: "packages/nodeA",
          owner: "CYCLE_PROG",
          productionDependencies: ["packages/nodeB"],
          devOnlyDependencies: [],
        },
        {
          node: "packages/nodeB",
          owner: "CYCLE_PROG",
          productionDependencies: ["packages/nodeA"],
          devOnlyDependencies: [],
        },
      ],
    };
    expect(() => composeWorkspacePolicy([cyclicFragment])).toThrow(
      /Dependency cycle detected/,
    );
  });

  it("9.8 Program ownership conflict", () => {
    const conflictingFragment = {
      programId: "OTHER_PROGRAM",
      nodes: [
        {
          node: "packages/domain", // Already owned by CAW
          owner: "OTHER_PROGRAM",
          productionDependencies: [],
          devOnlyDependencies: [],
        },
      ],
    };

    expect(() =>
      composeWorkspacePolicy([CAW_PROGRAM_POLICY, conflictingFragment]),
    ).toThrow(/Ownership conflict for workspace node "packages\/domain"/);
  });

  it("9.9 Domain-isolation preservation", () => {
    const tempDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "zyppi-rgt-domain-iso-")),
    );
    try {
      setupBaseWorkspace(tempDir);
      const gs1Dir = path.join(tempDir, "apps/api/src/gs1");
      const zprofDir = path.join(tempDir, "apps/api/src/zprof");
      fs.mkdirSync(gs1Dir, { recursive: true });
      fs.mkdirSync(zprofDir, { recursive: true });

      fs.writeFileSync(
        path.join(gs1Dir, "gs1AnchorBridge.ts"),
        "export const anchor = {};\n",
      );
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

  it("9.10 Hypothetical ZII / qr-core preflight", () => {
    // Verify physical filesystem DOES NOT contain packages/qr-core or packages/qr-svg
    expect(fs.existsSync(path.resolve(process.cwd(), "packages/qr-core"))).toBe(
      false,
    );
    expect(fs.existsSync(path.resolve(process.cwd(), "packages/qr-svg"))).toBe(
      false,
    );

    // In-memory policy fragment composition preflight
    const ziiFragment = {
      programId: "ZII",
      description: "Zero-Knowledge / QR Engine Program",
      nodes: [
        {
          node: "packages/qr-core",
          packageName: "@zyppi/qr-core",
          owner: "ZII",
          role: "engine-core",
          productionDependencies: [],
          devOnlyDependencies: [],
        },
      ],
    };

    // 1. Positive preflight: compose CAW + ZII policy fragments successfully
    const composedPolicy = composeWorkspacePolicy([
      CAW_PROGRAM_POLICY,
      ziiFragment,
    ]);
    expect(composedPolicy.nodes.has("packages/qr-core")).toBe(true);
    expect(composedPolicy.nodes.get("packages/qr-core").owner).toBe("ZII");

    // 2. Negative preflight: test unauthorized edge packages/qr-core -> packages/domain
    const tempDir = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "zyppi-rgt-zii-preflight-")),
    );
    try {
      setupBaseWorkspace(tempDir);
      const qrCoreDir = path.join(tempDir, "packages/qr-core");
      fs.mkdirSync(path.join(qrCoreDir, "src"), { recursive: true });
      fs.writeFileSync(
        path.join(qrCoreDir, "package.json"),
        JSON.stringify({
          name: "@zyppi/qr-core",
          version: "0.1.0",
          private: true,
          dependencies: {},
        }),
      );
      // Unauthorized edge from qr-core to @zyppi/domain
      fs.writeFileSync(
        path.join(qrCoreDir, "src/index.ts"),
        "import { domainStuff } from '@zyppi/domain';\n",
      );

      const { violations } = runValidation(tempDir, composedPolicy);
      expect(violations.length).toBeGreaterThan(0);
      const v = violations.find(
        (x) => x.rule === "unauthorized-production-dependency",
      );
      expect(v).toBeDefined();
      expect(v.node).toBe("packages/qr-core");
      expect(v.description).toContain("@zyppi/domain");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

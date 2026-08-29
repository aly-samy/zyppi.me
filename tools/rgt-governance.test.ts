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
    expect(ACTIVE_WORKSPACE_POLICY.nodes.size).toBe(10);

    // Assert exact effective CAW-004 v2.2 dependency ceilings for all nine governed nodes
    const expectedCeilings: Record<
      string,
      {
        packageName: string | null;
        production: string[];
        devOnly: string[];
      }
    > = {
      "packages/domain": {
        packageName: "@zyppi/domain",
        production: [],
        devOnly: [],
      },
      "packages/shared": {
        packageName: "@zyppi/shared",
        production: [],
        devOnly: [],
      },
      "packages/contracts": {
        packageName: "@zyppi/contracts",
        production: ["packages/domain"],
        devOnly: [],
      },
      "packages/runtime": {
        packageName: "@zyppi/runtime",
        production: ["packages/domain", "packages/shared"],
        devOnly: [],
      },
      "packages/testing": {
        packageName: "@zyppi/testing",
        production: [],
        devOnly: [
          "packages/domain",
          "packages/contracts",
          "packages/runtime",
          "packages/shared",
        ],
      },
      "apps/api": {
        packageName: "@zyppi/api",
        production: [
          "packages/runtime",
          "packages/domain",
          "packages/contracts",
        ],
        devOnly: ["packages/testing"],
      },
      "apps/web": {
        packageName: "@zyppi/web",
        production: [
          "packages/contracts",
          "packages/domain",
          "packages/shared",
        ],
        devOnly: ["packages/testing"],
      },
      "edge/worker": {
        packageName: null,
        production: ["packages/contracts"],
        devOnly: [],
      },
      infra: {
        packageName: "@zyppi/infra",
        production: [],
        devOnly: [],
      },
    };

    for (const [nodePath, expected] of Object.entries(expectedCeilings)) {
      const nodeDef = ACTIVE_WORKSPACE_POLICY.nodes.get(nodePath);
      expect(nodeDef).toBeDefined();
      expect(nodeDef.packageName).toBe(expected.packageName);
      expect(Array.from(nodeDef.productionDependencies)).toEqual(
        expected.production,
      );
      expect(Array.from(nodeDef.devOnlyDependencies)).toEqual(expected.devOnly);
    }

    // Assert admitted ZII engine-core node properties separately
    const ziiNode = ACTIVE_WORKSPACE_POLICY.nodes.get("packages/qr-core");
    expect(ziiNode).toBeDefined();
    expect(ziiNode.packageName).toBe("@zyppi/qr-core");
    expect(ziiNode.owner).toBe("ZII");
    expect(ziiNode.role).toBe("engine-core");
    expect(Array.from(ziiNode.productionDependencies)).toEqual([]);
    expect(Array.from(ziiNode.devOnlyDependencies)).toEqual([]);
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

  it("9.10 ZII / qr-core admission & edge rejection", () => {
    // Verify physical filesystem DOES contain packages/qr-core and DOES NOT contain packages/qr-svg
    expect(fs.existsSync(path.resolve(process.cwd(), "packages/qr-core"))).toBe(
      true,
    );
    expect(fs.existsSync(path.resolve(process.cwd(), "packages/qr-svg"))).toBe(
      false,
    );

    // Assert canonical ACTIVE_WORKSPACE_POLICY includes packages/qr-core
    expect(ACTIVE_WORKSPACE_POLICY.nodes.has("packages/qr-core")).toBe(true);
    const nodeDef = ACTIVE_WORKSPACE_POLICY.nodes.get("packages/qr-core");
    expect(nodeDef.owner).toBe("ZII");
    expect(nodeDef.role).toBe("engine-core");
    expect(Array.from(nodeDef.productionDependencies)).toEqual([]);
    expect(Array.from(nodeDef.devOnlyDependencies)).toEqual([]);

    // Negative edge proof: test unauthorized edge packages/qr-core -> packages/domain is rejected
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

      const { violations } = runValidation(tempDir, ACTIVE_WORKSPACE_POLICY);
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

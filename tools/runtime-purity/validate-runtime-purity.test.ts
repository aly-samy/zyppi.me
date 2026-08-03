import { describe, it, expect } from "vitest";
import {
  validateManifest,
  validateSourceFile,
  RTP_RULES,
} from "../validate-runtime-purity.mjs";

describe("Zyppi Runtime Purity & Determinism Validator - Automated Verification Suite", () => {
  describe("Manifest Governance - Default Denial Checks", () => {
    it("should accept an empty dependencies and peerDependencies block", () => {
      const manifest = JSON.stringify({
        name: "@zyppi/runtime",
        version: "0.1.0",
        private: true,
        dependencies: {},
        peerDependencies: {},
      });
      const violations = validateManifest(manifest);
      expect(violations).toHaveLength(0);
    });

    it("should reject any unapproved external dependency declaration (Default Denial)", () => {
      const manifest = JSON.stringify({
        name: "@zyppi/runtime",
        version: "0.1.0",
        private: true,
        dependencies: {
          lodash: "^4.17.21",
        },
      });
      const violations = validateManifest(manifest);
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(RTP_RULES.MANIFEST_DEPENDENCY);
      expect(violations[0].description).toContain("lodash");
    });

    it("should reject any unapproved peer dependency declaration (Default Denial)", () => {
      const manifest = JSON.stringify({
        name: "@zyppi/runtime",
        version: "0.1.0",
        private: true,
        peerDependencies: {
          react: "^18.2.0",
        },
      });
      const violations = validateManifest(manifest);
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(RTP_RULES.MANIFEST_PEER_DEPENDENCY);
      expect(violations[0].description).toContain("react");
    });

    it("should handle JSON syntax errors gracefully", () => {
      const invalidJson = "{ invalid json }";
      const violations = validateManifest(invalidJson);
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(RTP_RULES.MANIFEST_DEPENDENCY);
      expect(violations[0].description).toContain("parse");
    });
  });

  describe("Import Governance - Boundary & capability rules", () => {
    it("should permit relative imports that stay inside the packages/runtime folder", () => {
      const code = `
        import { something } from "./subfolder/helper.js";
        import { other } from "../src/index.js";
      `;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(0);
    });

    it("should reject relative imports that escape packages/runtime boundary", () => {
      const code = `
        import { something } from "../../domain/src/index.js";
      `;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(RTP_RULES.IMPORT_ESCAPE);
    });

    it("should reject standard Node built-in imports with or without node: prefix", () => {
      const codeWithPrefix = `import fs from "node:fs";`;
      const codeWithoutPrefix = `import { resolve } from "path";`;
      const requirePattern = `const os = require("os");`;
      const dynamicImportPattern = `const dns = await import("node:dns");`;

      expect(
        validateSourceFile(codeWithPrefix, "packages/runtime/src/index.ts"),
      ).toHaveLength(1);
      expect(
        validateSourceFile(codeWithPrefix, "packages/runtime/src/index.ts")[0]
          .ruleId,
      ).toBe(RTP_RULES.IMPORT_NODE_BUILTIN);

      expect(
        validateSourceFile(codeWithoutPrefix, "packages/runtime/src/index.ts"),
      ).toHaveLength(1);
      expect(
        validateSourceFile(
          codeWithoutPrefix,
          "packages/runtime/src/index.ts",
        )[0].ruleId,
      ).toBe(RTP_RULES.IMPORT_NODE_BUILTIN);

      expect(
        validateSourceFile(requirePattern, "packages/runtime/src/index.ts"),
      ).toHaveLength(1);
      expect(
        validateSourceFile(requirePattern, "packages/runtime/src/index.ts")[0]
          .ruleId,
      ).toBe(RTP_RULES.IMPORT_NODE_BUILTIN);

      expect(
        validateSourceFile(
          dynamicImportPattern,
          "packages/runtime/src/index.ts",
        ),
      ).toHaveLength(1);
      expect(
        validateSourceFile(
          dynamicImportPattern,
          "packages/runtime/src/index.ts",
        )[0].ruleId,
      ).toBe(RTP_RULES.IMPORT_NODE_BUILTIN);
    });

    it("should permit root-level imports of approved workspace packages (@zyppi/domain and @zyppi/shared)", () => {
      const code = `
        import { DomainModel } from "@zyppi/domain";
        import { sharedUtil } from "@zyppi/shared";
      `;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(0);
    });

    it("should reject deep subpath imports of approved packages to protect public export boundaries", () => {
      const code = `
        import { internalThing } from "@zyppi/domain/internal/helper.js";
      `;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(RTP_RULES.IMPORT_SUBPATH_DENIED);
    });

    it("should reject imports of prohibited/unapproved internal packages", () => {
      const codeBlocked = `import { testFixture } from "@zyppi/testing";`;
      const codeUnapproved = `import { otherPackage } from "@zyppi/contracts";`;

      const violationsBlocked = validateSourceFile(
        codeBlocked,
        "packages/runtime/src/index.ts",
      );
      expect(violationsBlocked).toHaveLength(1);
      expect(violationsBlocked[0].ruleId).toBe(
        RTP_RULES.IMPORT_UNAPPROVED_INTERNAL,
      );

      const violationsUnapproved = validateSourceFile(
        codeUnapproved,
        "packages/runtime/src/index.ts",
      );
      expect(violationsUnapproved).toHaveLength(1);
      expect(violationsUnapproved[0].ruleId).toBe(
        RTP_RULES.IMPORT_UNAPPROVED_INTERNAL,
      );
    });

    it("should reject direct source path imports to apps/* and edge/*", () => {
      const codeApps = `import { api } from "../../../apps/api/src/index.js";`;
      const codeEdge = `import { worker } from "../../../edge/worker/src/index.js";`;

      const violationsApps = validateSourceFile(
        codeApps,
        "packages/runtime/src/index.ts",
      );
      expect(violationsApps).toHaveLength(1);
      expect(violationsApps[0].ruleId).toBe(RTP_RULES.IMPORT_ESCAPE);

      const violationsEdge = validateSourceFile(
        codeEdge,
        "packages/runtime/src/index.ts",
      );
      expect(violationsEdge).toHaveLength(1);
      expect(violationsEdge[0].ruleId).toBe(RTP_RULES.IMPORT_ESCAPE);
    });

    it("should reject non-literal dynamic module loaders as unsupported dynamic path resolution", () => {
      const codeRequire = `
        const moduleName = "lodash";
        const val = require(moduleName);
      `;
      const codeImport = `
        const moduleName = "lodash";
        const val = await import(moduleName);
      `;

      const violationsRequire = validateSourceFile(
        codeRequire,
        "packages/runtime/src/index.ts",
      );
      expect(violationsRequire).toHaveLength(1);
      expect(violationsRequire[0].ruleId).toBe(RTP_RULES.IMPORT_NON_LITERAL);

      const violationsImport = validateSourceFile(
        codeImport,
        "packages/runtime/src/index.ts",
      );
      expect(violationsImport).toHaveLength(1);
      expect(violationsImport[0].ruleId).toBe(RTP_RULES.IMPORT_NON_LITERAL);
    });
  });

  describe("Static Determinism - Entropy and time checks", () => {
    it("should reject direct Math.random() usage", () => {
      const code = `
        export function getRandom() {
          return Math.random();
        }
      `;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(RTP_RULES.DETERMINISM_MATH_RANDOM);
    });

    it("should reject direct Date.now() usage", () => {
      const code = `
        export function getCurrentTime() {
          return Date.now();
        }
      `;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(RTP_RULES.DETERMINISM_DATE_NOW);
    });

    it("should reject new Date() constructor when it has zero arguments", () => {
      const code = `
        export function createDate() {
          return new Date();
        }
      `;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(
        RTP_RULES.DETERMINISM_NEW_DATE_ZERO_ARGS,
      );
    });

    it("should permit deterministic new Date(...) constructor instances with arguments", () => {
      const codeWithIso = `
        const dateISO = new Date("2026-07-30T04:20:20Z");
      `;
      const codeWithTimestamp = `
        const dateTimestamp = new Date(1785382820000);
      `;

      expect(
        validateSourceFile(codeWithIso, "packages/runtime/src/index.ts"),
      ).toHaveLength(0);
      expect(
        validateSourceFile(codeWithTimestamp, "packages/runtime/src/index.ts"),
      ).toHaveLength(0);
    });
  });

  describe("AMS-0407 Extension - Rejection Coverage", () => {
    it("should reject Math['random']()", () => {
      const code = `Math["random"]();`;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(RTP_RULES.DETERMINISM_MATH_RANDOM);
    });

    it("should reject Date['now']()", () => {
      const code = `Date["now"]();`;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(RTP_RULES.DETERMINISM_DATE_NOW);
    });

    it("should reject direct process.env", () => {
      const code = `const x = process.env;`;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(RTP_RULES.DETERMINISM_PROCESS_ENV);
    });

    it("should reject bracket-form process environment access", () => {
      const code = `const x = process["env"];`;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(RTP_RULES.DETERMINISM_PROCESS_ENV);
    });

    it("should reject direct eval(...)", () => {
      const code = `eval("1 + 1");`;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(
        RTP_RULES.DETERMINISM_DYNAMIC_EXECUTION,
      );
    });

    it("should reject direct Function(...)", () => {
      const code = `Function("return 1");`;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(
        RTP_RULES.DETERMINISM_DYNAMIC_EXECUTION,
      );
    });

    it("should reject new Function(...)", () => {
      const code = `new Function("return 1");`;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(
        RTP_RULES.DETERMINISM_DYNAMIC_EXECUTION,
      );
    });

    it("should reject supported globalThis.eval(...) form", () => {
      const code = `globalThis.eval("1 + 1");`;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(
        RTP_RULES.DETERMINISM_DYNAMIC_EXECUTION,
      );
    });

    it("should reject supported globalThis.Function(...) form", () => {
      const code = `globalThis.Function("return 1");`;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(
        RTP_RULES.DETERMINISM_DYNAMIC_EXECUTION,
      );
    });

    it("should reject new WeakRef(...)", () => {
      const code = `new WeakRef({});`;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(
        RTP_RULES.DETERMINISM_WEAK_REF_FINALIZATION,
      );
    });

    it("should reject new FinalizationRegistry(...)", () => {
      const code = `new FinalizationRegistry(() => {});`;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(
        RTP_RULES.DETERMINISM_WEAK_REF_FINALIZATION,
      );
    });

    it("should reject dot-notation global mutation", () => {
      const code = `globalThis.runtimeState = 42;`;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(RTP_RULES.DETERMINISM_GLOBAL_MUTATION);
    });

    it("should reject bracket-notation global mutation", () => {
      const code = `global["runtimeState"] = 42;`;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(RTP_RULES.DETERMINISM_GLOBAL_MUTATION);
    });

    it("should reject top-level let", () => {
      const code = `let state = 0;`;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(
        RTP_RULES.DETERMINISM_MUTABLE_MODULE_STATE,
      );
    });

    it("should reject top-level var", () => {
      const code = `var state = 0;`;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(
        RTP_RULES.DETERMINISM_MUTABLE_MODULE_STATE,
      );
    });

    it("should reject explicit mutation of a module-level constant object", () => {
      const code = `
        const cache = {};
        cache.value = 123;
      `;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(
        RTP_RULES.DETERMINISM_MUTABLE_MODULE_STATE,
      );
    });

    it("should reject direct mutating method calls on module-level constant collection", () => {
      const code = `
        const entries = [];
        entries.push("hello");
      `;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe(
        RTP_RULES.DETERMINISM_MUTABLE_MODULE_STATE,
      );
    });
  });

  describe("AMS-0407 Extension - Acceptance Coverage", () => {
    it("should accept immutable module-level primitive constants", () => {
      const code = `
        const MAX_RETRIES = 3;
        const MODE = "production";
      `;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(0);
    });

    it("should accept immutable module-level as const configuration values", () => {
      const code = `
        const STAGE_ORDER = ["Admission", "Resolution"] as const;
        const config = { active: true } as const;
      `;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(0);
    });

    it("should accept function-local mutable variables", () => {
      const code = `
        export function process() {
          let localValue = 1;
          localValue++;
          var another = 2;
          return localValue + another;
        }
      `;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(0);
    });

    it("should accept function-local arrays or objects mutated only during one invocation", () => {
      const code = `
        export function compute() {
          const arr = [];
          arr.push(1);
          const obj = { val: 0 };
          obj.val = 2;
          return { arr, obj };
        }
      `;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(0);
    });

    it("should accept WeakMap and WeakSet", () => {
      const code = `
        const map = new WeakMap();
        const set = new WeakSet();
      `;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(0);
    });

    it("should accept explicit input handling that does not access prohibited host capabilities", () => {
      const code = `
        export function processInput(input: any) {
          return input.data;
        }
      `;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(0);
    });

    it("should accept approved imports and correct uses of process as a local variable/parameter spelling", () => {
      const code = `
        import { validateExecutionRequest } from "@zyppi/domain";
        export function transform(process: string) {
          return process.toUpperCase();
        }
      `;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(0);
    });

    it("should accept module-scope immutable destructuring declarations using const", () => {
      const code = `
        const immutableConfig = { a: 1, b: 2 };
        const { a, b } = immutableConfig;
        const [first, second] = [10, 20];
      `;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(0);
    });

    it("should accept module-scope for...of and for...in loop-variable forms", () => {
      const code = `
        const items = [1, 2, 3];
        for (let item of items) {
          // loop-scoped let
        }
        const obj = { a: 1 };
        for (const key in obj) {
          // loop-scoped const
        }
      `;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(0);
    });

    it("should respect lexical shadowing of global process, eval, and Function", () => {
      const code = `
        function testShadowing() {
          const process = { env: "local" };
          const eval = () => "local_eval";
          const Function = () => "local_func";

          return {
            p: process.env,
            e: eval(),
            f: Function()
          };
        }
      `;
      const violations = validateSourceFile(
        code,
        "packages/runtime/src/index.ts",
      );
      expect(violations).toHaveLength(0);
    });
  });
});

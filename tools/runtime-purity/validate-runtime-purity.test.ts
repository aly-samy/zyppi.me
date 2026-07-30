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
});

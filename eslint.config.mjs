import { FlatCompat } from "@eslint/eslintrc";
import eslintPluginImport from "eslint-plugin-import";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

// Architectural boundary rules isolated object
export const zyppiArchitecturalBoundaries = {
  "import/no-restricted-paths": [
    "error",
    {
      zones: [
        // packages/runtime restrictions
        {
          target: "./packages/runtime",
          from: "./apps",
          message: "packages/runtime must not import from apps",
        },
        {
          target: "./packages/runtime",
          from: "./edge",
          message: "packages/runtime must not import from edge",
        },
        // packages/domain restrictions
        {
          target: "./packages/domain",
          from: "./apps",
          message: "packages/domain must not import from apps",
        },
        {
          target: "./packages/domain",
          from: "./edge",
          message: "packages/domain must not import from edge",
        },
        {
          target: "./packages/domain",
          from: "./packages/contracts",
          message: "packages/domain must not import from contracts",
        },
        {
          target: "./packages/domain",
          from: "./packages/shared",
          message: "packages/domain must not import from shared",
        },
        {
          target: "./packages/domain",
          from: "./packages/runtime",
          message: "packages/domain must not import from runtime",
        },
        // apps/web restriction
        {
          target: "./apps/web",
          from: "./packages/runtime",
          message: "apps/web must not import from packages/runtime",
        },
        // edge/worker restriction
        {
          target: "./edge/worker",
          from: "./packages/runtime",
          message: "edge/worker must not import from packages/runtime",
        },
      ],
    },
  ],
};

export default [
  // Include recommended TypeScript ESLint rules
  ...compat.extends("plugin:@typescript-eslint/recommended"),
  // Base TypeScript linting configuration
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: [
      "node_modules/",
      "**/node_modules/**",
      "dist/",
      "**/dist/**",
      "build/",
      "**/build/**",
      "coverage/",
      "**/coverage/**",
      "**/*.d.ts",
      "**/*.tsbuildinfo",
      "**/*.js",
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      import: eslintPluginImport,
    },
  },
  // Architectural boundaries rules (isolated)
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: { import: eslintPluginImport },
    rules: zyppiArchitecturalBoundaries,
  },
];

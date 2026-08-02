import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "packages/**/*.test.ts",
      "packages/**/*.spec.ts",
      "apps/**/*.test.ts",
      "apps/**/*.spec.ts",
      "edge/**/*.test.ts",
      "edge/**/*.spec.ts",
      "tools/**/*.test.ts",
      "tools/**/*.spec.ts",
    ],
    exclude: [
      "**/node_modules/**",
      "dist",
      "build",
      "coverage",
      ".git",
      "**/*.d.ts",
    ],
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    // Serial execution by limiting concurrency to 1
    maxConcurrency: 1,
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});

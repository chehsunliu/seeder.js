import { defineConfig, coverageConfigDefaults } from "vitest/config";

export default defineConfig({
  test: {
    poolOptions: {
      threads: { singleThread: true },
      forks: { singleFork: true },
    },
    coverage: {
      provider: "v8",
      exclude: ["vitest.workspace.mts", ...coverageConfigDefaults.exclude],
    },
  },
});

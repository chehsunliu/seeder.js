import { defineWorkspace, UserProjectConfigExport } from "vitest/config";

const packages = ["seeder-dynamodb", "seeder-mysql"];

const configs: UserProjectConfigExport[] = packages.map((pkg) => ({
  extends: "./vitest.config.mts",
  test: {
    name: pkg,
    setupFiles: [`./packages/${pkg}/tests/setup.ts`],
    include: [`./packages/${pkg}/tests/**/*.test.ts`],
  },
}));

export default defineWorkspace(configs);

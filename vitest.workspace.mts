import * as fs from "node:fs";
import * as path from "node:path";
import { defineWorkspace, UserProjectConfigExport } from "vitest/config";

const packages = fs
  .readdirSync("./packages")
  .filter((f) => fs.existsSync(path.join("./packages", f, "tests/setup.ts")));

const configs: UserProjectConfigExport[] = packages.map((pkg) => ({
  extends: "./vitest.config.mts",
  test: {
    name: pkg,
    setupFiles: [`./packages/${pkg}/tests/setup.ts`],
    include: [`./packages/${pkg}/tests/**/*.test.ts`],
  },
}));

export default defineWorkspace(configs);

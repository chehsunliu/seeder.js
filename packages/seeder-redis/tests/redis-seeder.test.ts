import path from "node:path";
import { beforeEach, describe, it } from "vitest";

import { seederManager } from "@chehsunliu/seeder";

describe("none", () => {
  beforeEach(async () => {
    await seederManager.truncate();
    await seederManager.seed(path.join(__dirname, "data/20241127-none"));
  });

  it("just works", async () => {});
});

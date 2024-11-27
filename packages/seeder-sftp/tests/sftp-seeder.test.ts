import path from "node:path";
import SftpClient from "ssh2-sftp-client";
import { afterAll, beforeAll, beforeEach, describe, it, expect } from "vitest";

import seederManager from "@chehsunliu/seeder";

let client: SftpClient = new SftpClient();

beforeAll(async () => {
  await client.connect({
    host: "127.0.0.1",
    port: 2222,
    username: "foo",
    password: "bar",
  });
});

afterAll(async () => {
  await client.end();
});

describe("basics", () => {
  beforeEach(async () => {
    await seederManager.truncate();
    await seederManager.seed(path.join(__dirname, "data/20241127-basics"));
  });

  it("loads data", async () => {
    expect((await client.get("/upload/a.txt")).toString().trimEnd()).toBe("321");
    expect((await client.get("/upload/b/c.txt")).toString().trimEnd()).toBe("cba");
  });
});

describe("none", () => {
  beforeEach(async () => {
    await seederManager.truncate();
    await seederManager.seed(path.join(__dirname, "data/20241127-none"));
  });

  it("does nothing when there is no data", async () => {
    const fileInfoList = await client.list("./upload");
    expect(fileInfoList.length).toBe(0);
  });
});

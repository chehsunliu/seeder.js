import { Client } from "basic-ftp";
import path from "node:path";
import { Writable } from "node:stream";
import { afterAll, beforeAll, beforeEach, describe, it, expect } from "vitest";

import { seederManager } from "@chehsunliu/seeder";

let client: Client = new Client();

beforeAll(async () => {
  await client.access({
    host: "127.0.0.1",
    port: 2121,
    user: "foo",
    password: "BC499D13-EB4B-4EAE-994D-7435364654C5",
  });
});

afterAll(() => {
  client.close();
});

describe("basics", () => {
  beforeEach(async () => {
    await seederManager.truncate();
    await seederManager.seed(path.join(__dirname, "data/20241127-basics"));
  });

  it("loads data", async () => {
    expect((await download("a/a.txt"))?.toString().trimEnd()).toBe("123");
    expect((await download("a/b/c.txt"))?.toString().trimEnd()).toBe("abc");
  });
});

describe("none", () => {
  beforeEach(async () => {
    await seederManager.truncate();
    await seederManager.seed(path.join(__dirname, "data/20241127-none"));
  });

  it("does nothing when there is no data", async () => {
    const fileInfoList = await client.list("./a");
    expect(fileInfoList.length).toBe(0);
  });
});

const download = async (remoteFilePath: string) => {
  const data: Buffer[] = [];

  const writable = new Writable();
  writable._write = (chunk: Buffer, _encoding, callback) => {
    data.push(chunk);
    callback();
  };

  return new Promise<Buffer | null>(async (resolve) => {
    try {
      await client.downloadTo(writable, remoteFilePath);
      resolve(Buffer.concat(data));
    } catch (e) {
      resolve(null);
    }
  });
};

import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import path from "node:path";
import { beforeEach, describe, it, expect } from "vitest";

import seederManager from "@chehsunliu/seeder";

const client = new S3Client({
  region: "us-west-2",
  endpoint: "http://127.0.0.1:9000",
  credentials: {
    accessKeyId: "minioadmin",
    secretAccessKey: "minioadmin",
  },
});
const bucket = "demo";

describe("basics", () => {
  beforeEach(async () => {
    await seederManager.truncate();
    await seederManager.seed(path.join(__dirname, "data/20241127-basics"));
  });

  it("loads data", async () => {
    const out = await client.send(new ListObjectsV2Command({ Bucket: bucket }));
    expect(out.KeyCount).toBe(2);

    const out1 = await client.send(new GetObjectCommand({ Bucket: bucket, Key: "a.txt" }));
    const content1 = await out1.Body?.transformToString();
    expect(content1?.trimEnd()).toBe("12345");

    const out2 = await client.send(new GetObjectCommand({ Bucket: bucket, Key: "b/c.txt" }));
    const content2 = await out2.Body?.transformToString();
    expect(content2?.trimEnd()).toBe("abcde");
  });
});

describe("none", () => {
  beforeEach(async () => {
    await seederManager.truncate();
    await seederManager.seed(path.join(__dirname, "data/20241127-none"));
  });

  it("does nothing when there is no data", async () => {
    const out = await client.send(new ListObjectsV2Command({ Bucket: bucket }));
    expect(out.KeyCount).toBe(0);
  });
});

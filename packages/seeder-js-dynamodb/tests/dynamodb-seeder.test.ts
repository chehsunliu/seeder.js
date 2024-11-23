import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";

import seederManager from "@chehsunliu/seeder-js";

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: "us-west-2",
    endpoint: "http://127.0.0.1:8000",
    credentials: {
      accessKeyId: "xxx",
      secretAccessKey: "xxx",
    },
  }),
);

describe("dynamodb-json", () => {
  beforeEach(async () => {
    await seederManager.truncate();
    await seederManager.seed(path.join(__dirname, "data/20241124-dynamodb-json"));
  });

  it("skips the rest data files after picking the first one", async () => {
    const { Items: items } = await client.send(new ScanCommand({ TableName: "posts" }));
    expect(items?.length).toBe(1);
    expect(items?.[0]).toStrictEqual({
      pk: "post#0001",
      sk: "content",
      content: "This is the post #1",
    });
  });
});

describe("native-json", () => {
  beforeEach(async () => {
    await seederManager.truncate();
    await seederManager.seed(path.join(__dirname, "data/20241124-native-json"));
  });

  it("loads native JSON data", async () => {
    const { Items: items } = await client.send(new ScanCommand({ TableName: "posts" }));
    expect(items?.length).toBe(1);
    expect(items?.[0]).toStrictEqual({
      pk: "post#0002",
      sk: "content",
      content: "This is the post #2",
    });
  });
});

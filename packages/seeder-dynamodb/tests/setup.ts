import { afterAll } from "vitest";

import seederManager from "@chehsunliu/seeder";
import { DynamoDbSeeder } from "@chehsunliu/seeder-dynamodb";

seederManager.configure([
  new DynamoDbSeeder({
    connection: {
      endpoint: "http://127.0.0.1:8000",
      region: "us-west-2",
      accessKeyId: "xxx",
      secretAccessKey: "xxx",
    },
    dataSelectors: [
      { type: "dynamodb-json", getFilename: (tableName: string) => `${tableName}.ddb.json` },
      { type: "json", getFilename: (tableName: string) => `${tableName}.json` },
    ],
  }),
]);

afterAll(async () => {
  await seederManager.release();
});

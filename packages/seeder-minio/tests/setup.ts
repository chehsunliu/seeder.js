import { afterAll } from "vitest";

import seederManager from "@chehsunliu/seeder";
import { MinioSeeder } from "@chehsunliu/seeder-minio";

seederManager.configure([
  new MinioSeeder({
    connection: {
      region: "us-west-2",
      endpoint: "http://127.0.0.1:9000",
      username: "minioadmin",
      password: "minioadmin",
    },
    localSrcDir: "minio",
    destBucket: "demo",
  }),
]);

afterAll(async () => {
  await seederManager.release();
});

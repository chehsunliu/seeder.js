import { afterAll } from "vitest";

import seederManager from "@chehsunliu/seeder";
import { RedisSeeder } from "@chehsunliu/seeder-redis";

seederManager.configure([
  new RedisSeeder({
    url: "redis://127.0.0.1:6379",
  }),
]);

afterAll(async () => {
  await seederManager.release();
});

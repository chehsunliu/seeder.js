import { afterAll } from "vitest";

import seederManager from "@chehsunliu/seeder";
import { MySqlSeeder } from "@chehsunliu/seeder-mysql";

seederManager.configure([
  new MySqlSeeder({
    connection: {
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "xxx",
      database: "blog",
    },
    dataSelectors: [
      { type: "sql", getFilename: (tableName: string) => `${tableName}.sql` },
      { type: "json", getFilename: (tableName: string) => `${tableName}.json` },
    ],
    excludedTables: ["flyway_schema_history"],
  }),
]);

afterAll(async () => {
  await seederManager.release();
});

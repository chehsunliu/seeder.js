import { afterAll } from "vitest";

import seederManager from "@chehsunliu/seeder";
import { PostgreSqlSeeder } from "@chehsunliu/seeder-postgresql";

seederManager.configure([
  new PostgreSqlSeeder({
    connection: {
      host: "127.0.0.1",
      port: 5432,
      user: "postgres",
      password: "xxx",
      database: "demo",
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

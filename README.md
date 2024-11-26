# Seeder.js

[![Test](https://github.com/chehsunliu/seeder.js/actions/workflows/test.yml/badge.svg)](https://github.com/chehsunliu/seeder.js/actions/workflows/test.yml)
![NPM Version](https://img.shields.io/npm/v/%40chehsunliu%2Fseeder?style=flat-square)

Seeder.js is a Node.js library for data seeding, making data preparation for integration testing easier.

## Getting Started

Install Seeder.js:

```sh
npm install -D @chehsunliu/seeder @chehsunliu/seeder-mysql
```

Assume the database schemas have been managed by tools like Flyway or Liquibase. Configure the seeders
in `setup.ts`, which should be loaded in Jest `setupFilesAfterEnv` or in Vitest `setupFiles`:

```ts
import seederManager from "@chehsunliu/seeder";
import { MySqlSeeder } from "@chehsunliu/seeder-mysql";

seederManager.configure([
  new MySqlSeeder({
    connection: {
      host: "127.0.0.1",
      port: 3306,
      user: "root",
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
```

Put some test data in `data/users.json`:

```json
[
  { "id": 1, "username": "alice" },
  { "id": 2, "username": "bob" }
]
```

Invoke the seeders in tests:

```ts
import seederManager from "@chehsunliu/seeder";

beforeEach(async () => {
  await seederManager.truncate();
  await seederManager.seed(path.join(__dirname, "data"));
});

test("blah blah blah", () => {
  // Data should be available here.
});
```

## Supported Services

- [@chehsunliu/seeder-dynamodb](https://github.com/chehsunliu/seeder.js/tree/main/packages/seeder-dynamodb)
- [@chehsunliu/seeder-mysql](https://github.com/chehsunliu/seeder.js/tree/main/packages/seeder-mysql)

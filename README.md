# Seeder.js

[![Test](https://github.com/chehsunliu/seeder.js/actions/workflows/test.yml/badge.svg)](https://github.com/chehsunliu/seeder.js/actions/workflows/test.yml)
[![NPM Version](https://img.shields.io/npm/v/%40chehsunliu%2Fseeder?style=flat-square)](https://www.npmjs.com/package/@chehsunliu/seeder)

Seeder.js is a Node.js library for data seeding, making data preparation for integration testing easier.

<!-- TOC -->

- [Seeder.js](#seederjs)
  - [Supported Services](#supported-services)
  - [Getting Started](#getting-started)
  - [Custom Seeder](#custom-seeder)
  <!-- TOC -->

## Supported Services

- [@chehsunliu/seeder-dynamodb](packages/seeder-dynamodb)
- [@chehsunliu/seeder-ftp](packages/seeder-ftp)
- [@chehsunliu/seeder-minio](packages/seeder-minio)
- [@chehsunliu/seeder-mysql](packages/seeder-mysql)
- [@chehsunliu/seeder-sftp](packages/seeder-sftp)

## Getting Started

Install Seeder.js:

```sh
npm install -D @chehsunliu/seeder @chehsunliu/seeder-mysql
```

Configure the seeders in `setup.ts`, which should be loaded in Jest `setupFilesAfterEnv` or in Vitest `setupFiles`:

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
      // The order matters. A table will only pick the first matched selector.
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

## Custom Seeder

You can also create one if you want:

```ts
import { Seeder } from "@chehsunliu/seeder";

class MySeeder implements Seeder {
  truncate = async (): Promise<void> => {};
  seed = async (folder: string): Promise<void> => {};
  release = async (): Promise<void> => {};
}
```

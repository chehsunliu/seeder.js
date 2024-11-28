# Seeder.js / Postgres

[![NPM Version](https://img.shields.io/npm/v/%40chehsunliu%2Fseeder-postgres?style=flat-square)](https://www.npmjs.com/package/@chehsunliu/seeder-postgres)

The Postgres implementation for Seeder.js.

## Getting Started

Install Seeder.js:

```sh
npm install -D @chehsunliu/seeder @chehsunliu/seeder-postgres
```

Assume the database schemas in the local Postgres server have been managed by Flyway:

```yaml
services:
  mysql:
    image: mysql:8.4
    ports:
      - "127.0.0.1:3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: xxx
    command: ["--general-log=1", "--general-log-file=/tmp/query.log"]

  mysql-init:
    image: flyway/flyway:11-alpine
    depends_on:
      - mysql
    restart: on-failure
    volumes:
      - type: bind
        source: ./db-schemas/mysql
        target: /flyway/sql
    command:
      - "-url=jdbc:mysql://mysql:3306/demo?createDatabaseIfNotExist=true&allowPublicKeyRetrieval=true"
      - "-user=root"
      - "-password=xxx"
      - "-connectRetries=60"
      - "migrate"
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

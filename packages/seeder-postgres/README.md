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
  postgres:
    image: postgres:17-alpine
    restart: always
    ports:
      - "127.0.0.1:5432:5432"
    environment:
      POSTGRES_PASSWORD: xxx
      POSTGRES_DB: demo
    command: ["-c", "log_statement=all"]

  postgres-init:
    image: flyway/flyway:11-alpine
    depends_on:
      - postgres
    restart: on-failure
    volumes:
      - type: bind
        source: ./db-schemas/postgres
        target: /flyway/sql
    command:
      - "-url=jdbc:postgresql://postgres:5432/demo"
      - "-user=postgres"
      - "-password=xxx"
      - "-connectRetries=60"
      - "migrate"
```

Configure the seeders in `setup.ts`, which should be loaded in Jest `setupFilesAfterEnv` or in Vitest `setupFiles`:

```ts
import seederManager from "@chehsunliu/seeder";
import { PostgresSeeder } from "@chehsunliu/seeder-postgres";

seederManager.configure([
  new PostgresSeeder({
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

# Seeder.js / DynamoDB

[![NPM Version](https://img.shields.io/npm/v/%40chehsunliu%2Fseeder-dynamodb?style=flat-square)](https://www.npmjs.com/package/@chehsunliu/seeder-dynamodb)

The DynamoDB implementation for Seeder.js.

## Getting Started

Install Seeder.js:

```sh
npm install -D @chehsunliu/seeder @chehsunliu/seeder-dynamodb
```

Assume the tables in the local DynamoDB have been managed by Terraform:

```yaml
services:
  dynamodb:
    image: amazon/dynamodb-local:latest
    ports:
      - "127.0.0.1:8000:8000"

  dynamodb-init:
    image: hashicorp/terraform:1.9
    depends_on:
      - dynamodb
    restart: on-failure
    volumes:
      - type: bind
        source: ./db-schemas/dynamodb
        target: /infra
    working_dir: /infra
    entrypoint: "/bin/sh"
    command: ["-c", "terraform init && terraform apply -auto-approve"]
    environment:
      TF_VAR_endpoint: http://dynamodb:8000
      TF_VAR_region: us-west-2
      TF_VAR_access_key_id: xxx
      TF_VAR_secret_access_key: xxx
```

Configure the seeders in `setup.ts`, which should be loaded in Jest `setupFilesAfterEnv` or in Vitest `setupFiles`:

```ts
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
      // The order matters. A table will only pick the first matched selector.
      { type: "dynamodb-json", getFilename: (tableName: string) => `${tableName}.ddb.json` },
      { type: "json", getFilename: (tableName: string) => `${tableName}.json` },
    ],
  }),
]);

afterAll(async () => {
  await seederManager.release();
});
```

Put some test data in `data/demo.json`:

```json
[
  { "pk": "user#alice", "sk": "info", "email": "alice@example.com" },
  { "pk": "user#bob", "sk": "info", "email": "bob@example.com" }
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

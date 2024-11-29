# Seeder.js / MinIO

[![NPM Version](https://img.shields.io/npm/v/%40chehsunliu%2Fseeder-minio?style=flat-square)](https://www.npmjs.com/package/@chehsunliu/seeder-minio)

The MinIO implementation for Seeder.js.

## Getting Started

Install Seeder.js:

```sh
npm install -D @chehsunliu/seeder @chehsunliu/seeder-minio
```

Activate a local MinIO server via Docker Compose:

```yaml
services:
  minio:
    image: minio/minio
    restart: always
    ports:
      - "127.0.0.1:9000:9000"
      - "127.0.0.1:9001:9001"
    entrypoint: sh
    command: -c 'mkdir -p /data/demo && /usr/bin/minio server /data --console-address :9001'
```

Configure the seeders in `setup.ts`, which should be loaded in Jest `setupFilesAfterEnv` or in Vitest `setupFiles`:

```ts
import { seederManager } from "@chehsunliu/seeder";
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
```

Put some test data in `data`:

```sh
mkdir -p data/ftp
echo "123" > data/minio/a.txt
echo "abc" > data/minio/b/c.txt
```

```ts
import { seederManager } from "@chehsunliu/seeder";

beforeEach(async () => {
  await seederManager.truncate();
  await seederManager.seed(path.join(__dirname, "data"));
});

test("blah blah blah", () => {
  // Data should be available in:
  //   - s3://demo/a.txt
  //   - s3://demo/b/c.txt
});
```

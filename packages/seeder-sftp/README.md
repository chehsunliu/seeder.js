# Seeder.js / SFTP

[![NPM Version](https://img.shields.io/npm/v/%40chehsunliu%2Fseeder-sftp?style=flat-square)](https://www.npmjs.com/package/@chehsunliu/seeder-sftp)

The SFTP implementation for Seeder.js.

## Getting Started

Install Seeder.js:

```sh
npm install -D @chehsunliu/seeder @chehsunliu/seeder-sftp
```

Use Docker Compose to serve an SFTP server:

```yaml
services:
  sftp:
    image: atmoz/sftp:alpine
    restart: always
    ports:
      - "127.0.0.1:2222:22"
    command:
      - "foo:bar:1000:1000:upload"
```

Configure the seeders in `setup.ts`, which should be loaded in Jest `setupFilesAfterEnv` or in Vitest `setupFiles`:

```ts
import seederManager from "@chehsunliu/seeder";
import { SftpSeeder } from "@chehsunliu/seeder-sftp";

seederManager.configure([
  new SftpSeeder({
    connection: {
      host: "127.0.0.1",
      port: 2222,
      username: "foo",
      password: "bar",
    },
    localSrcDir: "sftp",
    sftpDestDir: "/upload",
  }),
]);

afterAll(async () => {
  await seederManager.release();
});
```

Put some test data in `data`:

```sh
mkdir -p data/sftp
echo "123" > data/sftp/a.txt
echo "abc" > data/sftp/b.txt
```

Invoke the seeders in tests:

```ts
import seederManager from "@chehsunliu/seeder";

beforeEach(async () => {
  await seederManager.truncate();
  await seederManager.seed(path.join(__dirname, "data"));
});

test("blah blah blah", () => {
  // Data should be available in:
  //   - /upload/a.txt
  //   - /upload/b.txt
});
```

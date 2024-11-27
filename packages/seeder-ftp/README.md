# Seeder.js / FTP

[![NPM Version](https://img.shields.io/npm/v/%40chehsunliu%2Fseeder-ftp?style=flat-square)](https://www.npmjs.com/package/@chehsunliu/seeder-ftp)

The FTP implementation for Seeder.js.

## Getting Started

Install Seeder.js:

```sh
npm install -D @chehsunliu/seeder @chehsunliu/seeder-ftp
```

Use Docker Compose to serve a FTP server:

```yaml
services:
  ftp:
    image: delfer/alpine-ftp-server
    restart: always
    ports:
      - "127.0.0.1:2121:21"
      - "127.0.0.1:21000-21010:21000-21010"
    environment:
      ADDRESS: "localhost"
      USERS: "foo|BC499D13-EB4B-4EAE-994D-7435364654C5"
```

Configure the seeders in `setup.ts`, which should be loaded in Jest `setupFilesAfterEnv` or in Vitest `setupFiles`:

```ts
import seederManager from "@chehsunliu/seeder";
import { FtpSeeder } from "@chehsunliu/seeder-ftp";

seederManager.configure([
  new FtpSeeder({
    connection: {
      host: "127.0.0.1",
      port: 2121,
      user: "foo",
      password: "BC499D13-EB4B-4EAE-994D-7435364654C5",
    },
    localSrcDir: "ftp",
    ftpDestDir: "/ftp/foo/a",
  }),
]);

afterAll(async () => {
  await seederManager.release();
});
```

Put some test data in `data`:

```sh
mkdir -p data/ftp
echo "123" > data/ftp/a.txt
echo "abc" > data/ftp/b.txt
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
  //   - /ftp/foo/a/a.txt
  //   - /ftp/foo/a/b.txt
});
```

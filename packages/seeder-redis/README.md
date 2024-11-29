# Seeder.js / Redis

[![NPM Version](https://img.shields.io/npm/v/%40chehsunliu%2Fseeder-redis?style=flat-square)](https://www.npmjs.com/package/@chehsunliu/seeder-redis)

The Redis implementation for Seeder.js.

## Getting Started

Install Seeder.js:

```sh
npm install -D @chehsunliu/seeder @chehsunliu/seeder-redis
```

Use Docker Compose to serve a Redis server:

```yaml
services:
  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "127.0.0.1:6379:6379"
```

Configure the seeders in `setup.ts`, which should be loaded in Jest `setupFilesAfterEnv` or in Vitest `setupFiles`:

```ts
import { seederManager } from "@chehsunliu/seeder";
import { RedisSeeder } from "@chehsunliu/seeder-redis";

seederManager.configure([
  new RedisSeeder({
    url: "redis://127.0.0.1:6379",
  }),
]);

afterAll(async () => {
  await seederManager.release();
});
```

Invoke the seeders in tests:

```ts
import { seederManager } from "@chehsunliu/seeder";

beforeEach(async () => {
  await seederManager.truncate();
  await seederManager.seed(path.join(__dirname, "data"));
});

test("blah blah blah", () => {
  // Cache should be clean.
});
```

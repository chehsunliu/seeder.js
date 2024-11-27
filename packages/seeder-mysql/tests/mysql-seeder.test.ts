import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";

import seederManager from "@chehsunliu/seeder";

import { Database } from "./lib/types";

const db = new Kysely<Database>({
  dialect: new MysqlDialect({
    pool: createPool({
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "xxx",
      database: "demo",
    }),
  }),
});

describe("sql", () => {
  beforeEach(async () => {
    await seederManager.truncate();
    await seederManager.seed(path.join(__dirname, "data/20241124-sql"));
  });

  it("skips the rest data files after picking the first one", async () => {
    const [users, posts, comments] = await Promise.all([
      db.selectFrom("users").selectAll().execute(),
      db.selectFrom("posts").selectAll().execute(),
      db.selectFrom("comments").selectAll().execute(),
    ]);

    expect(users.length).toBe(2);
    expect(posts.length).toBe(2);
    expect(comments.length).toBe(0);

    expect(users).toStrictEqual([
      { id: 1, username: "bob", createdAt: 1732431516, auth: { type: "google" } },
      { id: 2, username: "cat", createdAt: 1732431500, auth: { type: "github" } },
    ]);
    expect(posts).toStrictEqual([
      { id: 1, title: "z#1", content: "this is #1", createdAt: 1732431518, userId: 1 },
      { id: 2, title: "z#2", content: "this is #2", createdAt: 1732431520, userId: 2 },
    ]);
  });
});

describe("json", () => {
  beforeEach(async () => {
    await seederManager.truncate();
    await seederManager.seed(path.join(__dirname, "data/20241124-json"));
  });

  it("loads json data", async () => {
    const [users, posts, comments] = await Promise.all([
      db.selectFrom("users").selectAll().execute(),
      db.selectFrom("posts").selectAll().execute(),
      db.selectFrom("comments").selectAll().execute(),
    ]);

    expect(users.length).toBe(1);
    expect(posts.length).toBe(2);
    expect(comments.length).toBe(1);

    expect(users).toStrictEqual([{ id: 1, username: "alice", createdAt: 1732423980, auth: { type: "google" } }]);
    expect(posts).toStrictEqual([
      { id: 1, title: "Ha#1", content: "This is a sentence #1", createdAt: 1732424056, userId: 1 },
      { id: 2, title: "Ha#2", content: "This is a sentence #2", createdAt: 1732424057, userId: 1 },
    ]);
    expect(comments).toStrictEqual([
      { id: 1, content: "This is comment #1", createdAt: 1732424662, userId: 1, postId: 1 },
    ]);
  });
});

describe("none", () => {
  beforeEach(async () => {
    await seederManager.truncate();
    await seederManager.seed(path.join(__dirname, "data/20241124-none"));
  });

  it("does nothing when there is no data", async () => {
    const [users, posts, comments] = await Promise.all([
      db.selectFrom("users").selectAll().execute(),
      db.selectFrom("posts").selectAll().execute(),
      db.selectFrom("comments").selectAll().execute(),
    ]);

    expect(users.length).toBe(0);
    expect(posts.length).toBe(0);
    expect(comments.length).toBe(0);
  });
});

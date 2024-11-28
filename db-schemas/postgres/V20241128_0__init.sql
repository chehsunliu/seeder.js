CREATE TABLE IF NOT EXISTS "users"
(
  "id"        INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "username"  VARCHAR(128) NOT NULL,
  "createdAt" BIGINT       NOT NULL,
  "auth"      JSON         NOT NULL,

  UNIQUE ("username")
);

CREATE TABLE IF NOT EXISTS "posts"
(
  "id"        INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "title"     VARCHAR(256) NOT NULL,
  "content"   TEXT         NOT NULL,
  "createdAt" BIGINT       NOT NULL,
  "userId"    INT          NOT NULL,

  FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "comments"
(
  "id"        INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "content"   TEXT   NOT NULL,
  "createdAt" BIGINT NOT NULL,
  "userId"    INT    NOT NULL,
  "postId"    INT    NOT NULL,

  FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE,
  FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE
);

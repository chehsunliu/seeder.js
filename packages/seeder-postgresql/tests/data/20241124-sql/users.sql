INSERT INTO "users" ("id", "username", "createdAt", "auth")
  OVERRIDING SYSTEM VALUE
VALUES (1, 'bob', 1732431516, '{"type":"google"}'),
       (2, 'cat', 1732431500, '{"type":"github"}');

INSERT INTO "posts" ("id", "title", "content", "createdAt", "userId")
  OVERRIDING SYSTEM VALUE
VALUES (1, 'z#1', 'this is #1', 1732431518, 1),
       (2, 'z#2', 'this is #2', 1732431520, 2);

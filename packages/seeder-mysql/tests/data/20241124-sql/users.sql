insert into `users` (`id`, `username`, `createdAt`, `auth`)
values (1, 'bob', 1732431516, '{"type":"google"}'),
       (2, 'cat', 1732431500, '{"type":"github"}');

insert into `posts` (`id`, `title`, `content`, `createdAt`, `userId`)
values (1, 'z#1', 'this is #1', 1732431518, 1),
       (2, 'z#2', 'this is #2', 1732431520, 2);

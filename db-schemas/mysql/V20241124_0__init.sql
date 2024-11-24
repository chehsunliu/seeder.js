CREATE TABLE IF NOT EXISTS `users`
(
  `id`        INT AUTO_INCREMENT PRIMARY KEY,
  `username`  VARCHAR(128)    NOT NULL,
  `createdAt` BIGINT UNSIGNED NOT NULL,
  `auth`      JSON            NOT NULL,

  UNIQUE (`username`)
);

CREATE TABLE IF NOT EXISTS `posts`
(
  `id`        INT AUTO_INCREMENT PRIMARY KEY,
  `title`     VARCHAR(256)    NOT NULL,
  `content`   TEXT            NOT NULL,
  `createdAt` BIGINT UNSIGNED NOT NULL,
  `userId`    INT             NOT NULL,

  FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `comments`
(
  `id`        INT AUTO_INCREMENT PRIMARY KEY,
  `content`   TEXT            NOT NULL,
  `createdAt` BIGINT UNSIGNED NOT NULL,
  `userId`    INT             NOT NULL,
  `postId`    INT             NOT NULL,

  FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`postId`) REFERENCES `posts` (`id`) ON DELETE CASCADE
);

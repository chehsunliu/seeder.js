import { Generated, JSONColumnType, Selectable } from "kysely";

export interface Database {
  users: UserTable;
  posts: PostTable;
  comments: CommentTable;
}

interface UserTable {
  id: Generated<number>;
  username: string;
  createdAt: number;
  auth: JSONColumnType<{ type: string }>;
}

interface PostTable {
  id: Generated<number>;
  title: string;
  content: string;
  createdAt: number;
  userId: number;
}

interface CommentTable {
  id: Generated<number>;
  content: string;
  createdAt: number;
  userId: number;
  postId: number;
}

export type User = Selectable<UserTable>;
export type Post = Selectable<PostTable>;
export type Comment = Selectable<CommentTable>;

import { Post } from "../../database/entities/post";

import * as Entities from "../entities";

function renderPost(post: Post): Entities.Post {
  const { id, title, content, categoryId, createdAt } = post;

  return {
    id,
    title,
    content,
    categoryId,
    createdAt: createdAt.valueOf(),
  };
}

function renderPostList(
  posts: Post[],
  nextCursor: number | null
): Entities.PostList {
  const renderedPosts = posts.map((post) => renderPost(post));

  return {
    posts: renderedPosts,
    nextCursor,
  };
}

export function presentPost(input: { post: Post }): Entities.Post {
  return renderPost(input.post);
}

export function presentPostList(input: {
  posts: Post[];
  nextCursor: number | null;
}): Entities.PostList {
  return renderPostList(input.posts, input.nextCursor);
}

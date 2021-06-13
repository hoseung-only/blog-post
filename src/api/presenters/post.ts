import { Post } from "../../database/entities/post";

import * as Entities from "../entities";

function renderPost(post: Post): Entities.Post {
  const { id, title, coverImageURL, content, categoryId, createdAt, summary } = post;

  return {
    id,
    title,
    coverImageURL,
    content,
    categoryId,
    createdAt: createdAt.valueOf(),
    summary,
  };
}

function renderPostList(
  posts: Post[],
  nextCursor: number | null
): Entities.PostListShow {
  const renderedPosts = posts.map((post) => renderPost(post));

  return {
    data: renderedPosts,
    nextCursor,
  };
}

export function presentPost(input: { post: Post }): Entities.Post {
  return renderPost(input.post);
}

export function presentPostList(input: {
  posts: Post[];
  nextCursor: number | null;
}): Entities.PostListShow {
  return renderPostList(input.posts, input.nextCursor);
}

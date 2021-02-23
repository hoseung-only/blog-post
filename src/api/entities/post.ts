export interface Post {
  id: number;
  title: string;
  content: string;
  categoryId: number;
  createdAt: number;
}

export interface PostListShow {
  posts: Post[];
  nextCursor: number | null;
}

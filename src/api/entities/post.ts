import { PaginatedEntity } from "./paginated";

export interface Post {
  id: string;
  title: string;
  viewCount: number;
  coverImageURL: string;
  content: string;
  categoryId: string | null;
  createdAt: number;
  summary: string;
}

export type PostListShow = PaginatedEntity<Post>;

import { PaginatedEntity } from "./paginated";

export interface Post {
  id: number;
  title: string;
  coverImageURL: string | null;
  content: string;
  categoryId: number | null;
  createdAt: number;
  summary: string;
}

export type PostListShow = PaginatedEntity<Post>;

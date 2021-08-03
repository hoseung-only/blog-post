import { PaginatedEntity } from "./paginated";

export interface Post {
  id: number;
  title: string;
  coverImageURL: string;
  content: string;
  categoryId: number | null;
  createdAt: number;
  summary: string;
}

export type PostListShow = PaginatedEntity<Post>;

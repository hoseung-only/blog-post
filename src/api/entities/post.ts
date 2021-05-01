import { PaginatedEntity } from "./paginated";

export interface Post {
  id: number;
  title: string;
  content: string;
  categoryId: number;
  createdAt: number;
}

export type PostListShow = PaginatedEntity<Post>;

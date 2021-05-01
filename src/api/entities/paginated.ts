export type PaginatedEntity<T> = {
  data: T[];
  nextCursor: number | null;
};

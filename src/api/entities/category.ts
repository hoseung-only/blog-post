export interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

export interface AllCategoriesShow {
  data: {
    id: number;
    name: string;
    children: {
      id: number;
      name: string;
    }[];
  }[];
}

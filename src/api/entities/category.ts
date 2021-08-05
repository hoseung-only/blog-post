export interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

export interface AllCategoriesShow {
  data: {
    id: string;
    name: string;
    children: {
      id: string;
      name: string;
    }[];
  }[];
}

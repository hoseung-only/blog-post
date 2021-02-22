export interface ChildCategory {
  id: number;
  name: string;
}

export interface ParentCategory {
  id: number;
  name: string;
  children: ChildCategory[];
}

export interface AllCategoriesShow {
  data: ParentCategory[];
}

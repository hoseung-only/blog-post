import * as _ from "lodash";

import { Category } from "../../database/entities/category";

import * as Entities from "../entities";

function renderAllCategories(
  categories: Category[]
): Entities.AllCategoriesShow {
  const [childCategories, parentCategories] = _.chain(categories)
    .groupBy((category) => category.parentId !== null)
    .thru((group) => [group["true"] ?? [], group["false"] ?? []])
    .value();

  const childMapByParentId = new Map<number, Entities.ChildCategory[]>();

  childCategories.forEach((child) => {
    const children = childMapByParentId.get(child.parentId!) ?? [];
    children.push({
      id: child.id,
      name: child.name,
    });
    childMapByParentId.set(child.parentId!, children);
  });

  return {
    data: parentCategories.map((parent) => ({
      id: parent.id,
      name: parent.name,
      children: childMapByParentId.get(parent.id) ?? [],
    })),
  };
}

export function presentAllCategories(input: {
  categories: Category[];
}): Entities.AllCategoriesShow {
  return renderAllCategories(input.categories);
}

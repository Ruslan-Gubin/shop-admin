import type { CategoryModel } from "@/app/category/action";

export const getCategoryFullPath = (categories: CategoryModel[], id: number | null): string => {
  if (typeof id !== "number") return "";

  for (const category of categories) {
    if (category.id === id) return category.name;

    if (category.children.length > 0) {
      const childPath = getCategoryFullPath(category.children, id);
      if (childPath) return `${category.name} / ${childPath}`;
    }
  }

  return "";
};

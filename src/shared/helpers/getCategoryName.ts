import type { CategoryModel } from "@/app/category/action";

export const getCategoryName = (categories: CategoryModel[], id: number | null): string => {
  if (typeof id !== "number") return "";

  for (let i = 0; i < categories.length; i++) {
    const currentCategory = categories[i];

    if (currentCategory.id === id) {
      return currentCategory.name;
    }

    if (currentCategory.children.length > 0) {
      const childName = getCategoryName(currentCategory.children, id);
      if (childName) {
        return childName;
      }
    }
  }

  return "";
};

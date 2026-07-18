import { useState } from "react";
import type { CategoryModel } from "@/app/category/action";
import type { ProductModel } from "@/app/product/action";
import { fetchProductsByCategoryAction } from "../../action";
import { CatalogCategoryItem } from "../catalog-category-item/CatalogCategoryItem";
import styles from "./CatalogCategoryList.module.css";

type Props = {
  categories: CategoryModel[];
  onSelectProduct: (product: ProductModel) => void;
};

export const CatalogCategoryList = (props: Props) => {
  const [activeCategories, setActiveCategories] = useState<number[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<number, ProductModel[]>>({});
  const [loadingCategory, setLoadingCategory] = useState<number | null>(null);

  const handleToggleOpenCategory = async (id: number, hasChildren: boolean) => {
    if (hasChildren) {
      setActiveCategories((prev) =>
        prev.includes(id) ? prev.filter((el) => el !== id) : [...prev, id],
      );
    } else {
      if (!categoryProducts[id] && loadingCategory !== id) {
        setLoadingCategory(id);
        const response = await fetchProductsByCategoryAction(id);
        const products = response?.data || [];
        setCategoryProducts((prev) => ({ ...prev, [id]: products }));
        setLoadingCategory(null);

        setActiveCategories((prev) => (prev.includes(id) ? prev : [...prev, id]));
      } else {
        setActiveCategories((prev) =>
          prev.includes(id) ? prev.filter((el) => el !== id) : [...prev, id],
        );
      }
    }
  };

  return (
    <ul className={styles.rootList}>
      {props.categories.map((category) => (
        <CatalogCategoryItem
          key={category.id}
          category={category}
          activeCategories={activeCategories}
          categoryProducts={categoryProducts}
          loadingCategory={loadingCategory}
          onToggleOpenCategory={handleToggleOpenCategory}
          onSelectProduct={props.onSelectProduct}
        />
      ))}
    </ul>
  );
};

import { useState } from "react";
import type { CategoryModel } from "@/app/category/action";
import { SelectCategoryItem } from "./SelectCategoryItem/SelectCategoryItem";
import styles from "./SelectCategoryList.module.css";

type Props = {
  categories: CategoryModel[];
  onSelectCategory: (id: number) => void;
};

export const SelectCategoryList = (props: Props) => {
  const [activeCategories, setActiveCategories] = useState<number[]>([]);

  const handleToggleOpenCategory = (id: number) => {
    setActiveCategories((prev) =>
      prev.includes(id) ? prev.filter((el) => el !== id) : prev.concat(id),
    );
  };

  return (
    <ul className={styles.categoryList}>
      {props.categories.map((category) => (
        <SelectCategoryItem
          onSelectCategory={props.onSelectCategory}
          onToggleOpenCategory={handleToggleOpenCategory}
          activeCategories={activeCategories}
          key={category.id}
          category={category}
        />
      ))}
    </ul>
  );
};

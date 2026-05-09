import { Activity } from "react";
import type { CategoryModel } from "@/app/category/action";
import { BirdSelectIcon } from "@/views/LayoutLeftSide/NavigateMenu/svg/BirdSelectIcon";
import styles from "./SelectCategoryItem.module.css";

type Props = {
  category: CategoryModel;
  activeCategories: number[];
  onToggleOpenCategory: (id: number) => void;
  onSelectCategory: (id: number) => void;
};

export const SelectCategoryItem = (props: Props) => {
  const isOpen = props.activeCategories.includes(props.category.id);

  return (
    <>
      <li className={styles.categoryListItem}>
        <div className={styles.leftSide}>
          <button
            type="button"
            onClick={() => props.onToggleOpenCategory(props.category.id)}
            className={styles.leftSideCategory}
          >
            <div className={styles.arrowContainer}>
              {props.category.children.length > 0 && (
                <BirdSelectIcon
                  className={isOpen ? styles.navigateMenuItemSvgActive : styles.navigateMenuItemSvg}
                />
              )}
            </div>
            <p className={styles.categoryName}>{props.category.name}</p>
          </button>
          <button
            onClick={() => props.onSelectCategory(props.category.id)}
            type="button"
            className={styles.selectButton}
          >
            выбрать
          </button>
        </div>
      </li>

      <Activity mode={props.category.children.length > 0 && isOpen ? "visible" : "hidden"}>
        {props.category.children.length > 0 && (
          <ul className={styles.categoryList}>
            {props.category.children.length > 0 && isOpen && (
              <div className={styles.borderLeft}></div>
            )}
            {props.category.children.map((children) => (
              <SelectCategoryItem
                onSelectCategory={props.onSelectCategory}
                onToggleOpenCategory={props.onToggleOpenCategory}
                activeCategories={props.activeCategories}
                key={children.id}
                category={children}
              />
            ))}
          </ul>
        )}
      </Activity>
    </>
  );
};

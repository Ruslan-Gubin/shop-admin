import { Activity } from "react";
import type { CategoryModel } from "@/app/category/action";
import type { ProductModel } from "@/app/product/action";
import { BirdSelectIcon } from "@/views/LayoutLeftSide/NavigateMenu/svg/BirdSelectIcon";
import styles from "./CatalogCategoryItem.module.css";

type Props = {
  category: CategoryModel;
  activeCategories: number[];
  categoryProducts: Record<number, ProductModel[]>;
  loadingCategory: number | null;
  onToggleOpenCategory: (id: number, hasChildren: boolean) => void;
  onSelectProduct: (product: ProductModel) => void;
};

export const CatalogCategoryItem = (props: Props) => {
  const isOpen = props.activeCategories.includes(props.category.id);
  const hasChildren = props.category.children && props.category.children.length > 0;
  const isLoading = props.loadingCategory === props.category.id;
  const products = props.categoryProducts[props.category.id] || [];

  return (
    <>
      <li className={styles.categoryListItem}>
        <button
          type="button"
          className={styles.categoryButton}
          onClick={() => props.onToggleOpenCategory(props.category.id, hasChildren)}
        >
          <div className={styles.arrowContainer}>
            <BirdSelectIcon className={isOpen ? styles.arrowActive : styles.arrow} />
          </div>
          <span className={styles.categoryName}>{props.category.name}</span>
        </button>
      </li>

      <Activity mode={isOpen ? "visible" : "hidden"}>
        {hasChildren && (
          <ul className={styles.nestedList}>
            <div className={styles.borderLeft} />
            {props.category.children.map((children) => (
              <CatalogCategoryItem
                key={children.id}
                category={children}
                activeCategories={props.activeCategories}
                categoryProducts={props.categoryProducts}
                loadingCategory={props.loadingCategory}
                onToggleOpenCategory={props.onToggleOpenCategory}
                onSelectProduct={props.onSelectProduct}
              />
            ))}
          </ul>
        )}

        {!hasChildren && (
          <div className={styles.productsWrapper}>
            {isLoading && <p className={styles.loadingText}>Загрузка...</p>}
            {!isLoading && products.length === 0 && (
              <p className={styles.emptyText}>Нет товаров в этой категории</p>
            )}
            {!isLoading &&
              products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className={styles.productItem}
                  onClick={() => props.onSelectProduct(product)}
                >
                  <span className={styles.productIndicator} />
                  <span className={styles.productName}>{product.name}</span>
                  <span className={styles.productCode}>{product.code}</span>
                </button>
              ))}
          </div>
        )}
      </Activity>
    </>
  );
};

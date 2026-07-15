import Link from "next/link";
import type { ProductModel } from "@/app/product/action";
import { WidgetWrapper } from "../WidgetWrapper/WidgetWrapper";
import styles from "./LowStockProducts.module.css";

type Props = {
  products: ProductModel[];
};

export const LowStockProducts = (props: Props) => {
  return (
    <WidgetWrapper title="Товары на исходе" linkHref="/product" linkLabel="Все товары">
      <ul className={styles.list}>
        {props.products.map((product) => {
          const stockClass =
            product.available === 0
              ? styles.stockEmpty
              : product.available <= 3
                ? styles.stockLow
                : styles.stockNormal;

          return (
            <Link key={product.id} href={`/product/info/${product.id}`} className={styles.item}>
              <span className={styles.name}>{product.name}</span>
              <span className={styles.code}>{product.code}</span>
              <span className={`${styles.stock} ${stockClass}`}>
                {product.available}
                <span className={styles.stockUnit}>шт</span>
              </span>
            </Link>
          );
        })}
      </ul>
    </WidgetWrapper>
  );
};

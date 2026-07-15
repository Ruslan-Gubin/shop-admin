import Link from "next/link";
import { WidgetWrapper } from "../WidgetWrapper/WidgetWrapper";
import styles from "./LowStockProducts.module.css";

export type LowStockProductItem = {
  id: number;
  name: string;
  code: string;
  available: number;
};

type Props = {
  products: LowStockProductItem[];
};

export const LowStockProducts = ({ products }: Props) => {
  if (products.length === 0) return null;

  return (
    <WidgetWrapper
      title="Товары с малым остатком"
      linkHref="/product"
      linkLabel="Все товары"
    >
      <div className={styles.list}>
        {products.map((p) => {
          const stockClass =
            p.available === 0
              ? styles.stockEmpty
              : p.available <= 3
                ? styles.stockLow
                : styles.stockNormal;

          return (
            <Link
              key={p.id}
              href={`/product/info/${p.id}`}
              className={styles.item}
            >
              <span className={styles.name}>{p.name}</span>
              <span className={styles.code}>{p.code}</span>
              <span className={`${styles.stock} ${stockClass}`}>
                {p.available}
                <span className={styles.stockUnit}>шт</span>
              </span>
            </Link>
          );
        })}
      </div>
    </WidgetWrapper>
  );
};

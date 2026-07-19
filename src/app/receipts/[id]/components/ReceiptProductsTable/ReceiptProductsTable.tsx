import Link from "next/link";
import type { WarehouseModel } from "@/app/warehouses/action";
import type { ReceiptProduct } from "../../../action";
import styles from "./ReceiptProductsTable.module.css";

type Props = {
  products: ReceiptProduct[];
  productInfo: Record<number, string>;
  warehouses: WarehouseModel[];
};

export const ReceiptProductsTable = (props: Props) => {
  const getWarehouseName = (warehouseId: string): string => {
    const found = props.warehouses.find((w) => w.id === Number(warehouseId));
    return found?.name || `Склад #${warehouseId}`;
  };

  const getTotalQuantity = (product: ReceiptProduct): number => {
    return Object.values(product.stocks).reduce((sum, qty) => sum + qty, 0);
  };

  return (
    <ul className={styles.list}>
      {props.products.map((product) => {
        const totalQty = getTotalQuantity(product);
        const productName = props.productInfo[product.product_id];
        const stockEntries = Object.entries(product.stocks).filter(([, qty]) => qty > 0);

        return (
          <li key={product.product_id} className={styles.card}>
            <div className={styles.topBlock}>
              <div className={styles.cardHeader}>
                <Link href={`/product/info/${product.product_id}`} className={styles.productLink}>
                  {productName || `Товар #${product.product_id}`}
                </Link>
              </div>

              <div className={styles.cardMeta}>
                <span className={styles.metaItem}>
                  <span className={styles.metaLabel}>Количество:</span> {totalQty} шт
                </span>
              </div>
            </div>

            {stockEntries.length > 0 && (
              <table className={styles.transferTable}>
                <thead className={styles.transferTableHead}>
                  <tr className={styles.transferTableRow}>
                    <th className={styles.transferTableHeader}>Склад</th>
                    <th className={styles.transferTableHeader}>Количество</th>
                  </tr>
                </thead>
                <tbody>
                  {stockEntries.map(([warehouseId, quantity]) => (
                    <tr key={warehouseId} className={styles.transferTableRow}>
                      <td className={styles.transferTableCell}>{getWarehouseName(warehouseId)}</td>
                      <td className={styles.transferTableCell}>{quantity} шт</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </li>
        );
      })}
    </ul>
  );
};

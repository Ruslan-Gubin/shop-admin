import Link from "next/link";
import type { OrderProductModel, OrderReservation } from "../../edit/[id]/action";
import styles from "./OrderProductsTable.module.css";

type Props = {
  products: OrderProductModel[];
  baseId: number;
  in_delivery: boolean;
  hasAnyTransfers: boolean;
};

export const OrderProductsTable = (props: Props) => {
  const getNeedTransferCount = (reservations: OrderReservation[], baseId: number): number => {
    return reservations.reduce(
      (acc, el) => (el.warehouse_id !== baseId ? acc + el.quantity : acc),
      0,
    );
  };

  const getAvailabilityInfo = (
    quantity: number,
    reservations: OrderReservation[],
    baseId: number,
  ) => {
    let text = "Есть на складе";
    let className = styles.availableText;

    const needTransferCount = getNeedTransferCount(reservations, baseId);

    if (props.in_delivery) {
      text = `В доставке ${quantity} шт`;
      className = styles.inTransferText;
    } else if (props.hasAnyTransfers) {
      text = `В перемещении ${needTransferCount} шт`;
      className = styles.inTransferText;
    } else if (needTransferCount > 0) {
      text = `К перемещению ${needTransferCount} шт`;
      className = styles.needTransferText;
    }

    return { text, className };
  };

  return (
    <table className={styles.table}>
      <thead className={styles.header}>
        <tr className={styles.headerLine}>
          <th className={styles.headerCell}>
            <span className={styles.headerCellText}>Название</span>
          </th>
          <th className={styles.headerCell}>
            <span className={styles.headerCellText}>Наличие</span>
          </th>
          <th className={styles.headerCell}>
            <span className={styles.headerCellText}>Штрих-код</span>
          </th>
          <th className={styles.headerCell}>
            <span className={styles.headerCellText}>Количество</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {props.products.map((product) => (
          <tr key={product.id} className={styles.dataRow}>
            <td className={styles.dataCell}>
              <Link href={`/product/info/${product.product_id}`} className={styles.link}>
                {product.name}
              </Link>
            </td>
            <td className={styles.dataCell}>
              <span
                className={
                  getAvailabilityInfo(product.quantity, product.reservations, props.baseId)
                    .className
                }
              >
                {getAvailabilityInfo(product.quantity, product.reservations, props.baseId).text}
              </span>
            </td>
            <td className={styles.dataCell}>{product.code || "---"}</td>
            <td className={styles.dataCell}>{product.quantity}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

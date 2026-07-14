import Link from "next/link";
import type { OrderStatus } from "../../action";
import type { OrderProductModel, OrderReservation } from "../../edit/[id]/action";
import styles from "./OrderProductsTable.module.css";

type Props = {
  products: OrderProductModel[];
  baseId: number;
  in_delivery: boolean;
  hasAnyTransfers: boolean;
  method_receipt: "courier" | "pickup";
  order_status: OrderStatus;
};

//before Ручка обычная 5 без типа и цвета в заказе 2шт, test2 4 всего, доступно 2  резерв 2
//before Ручка обычная 3 Синяя шариковая в заказе 1шт, Главный склад 2 всего, доступно 1  резерв 1 (было перемещение с склада на склад)

//after Ручка обычная 5 без типа и цвета в заказе 2шт, test2 4 всего, доступно 4  резерв 0
//after Ручка обычная 3 Синяя шариковая в заказе 1шт, Главный склад 2 всего, доступно 2  резерв 0

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
    } else if (props.hasAnyTransfers && needTransferCount > 0) {
      text = `В перемещении ${needTransferCount} шт`;
      className = styles.inTransferText;
    } else if (needTransferCount > 0) {
      text = `К перемещению ${needTransferCount} шт`;
      className = styles.needTransferText;
    }

    if (
      [
        "cancelled_new",
        "cancelled_assembly",
        "cancelled_ready",
        "cancelled_delivery",
        "cancelled_customer",
      ].includes(props.order_status)
    ) {
      text = "Отменён";
      className = styles.needTransferText;
    }

    if (props.order_status === "ready") {
      const count = reservations.reduce((acc, el) => el.quantity + acc, 0);
      text = `${props.method_receipt === "courier" ? "К доставке" : "К выдачи"} ${count} шт`;
      className = styles.availableText;
    }

    if (props.order_status === "completed") {
      const count = reservations.reduce((acc, el) => el.quantity + acc, 0);
      text = `${props.method_receipt === "courier" ? "Доставлено" : "Забрали"} ${count} шт`;
      className = styles.availableText;
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

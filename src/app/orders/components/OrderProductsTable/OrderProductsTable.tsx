import Link from "next/link";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
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
  isHasShortageStocksProblem: boolean;
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

  const showStockValue = (
    quantity: number,
    shortage_stocks: OrderReservation[],
    reservations: OrderReservation[],
  ) => {
    let value = String(quantity);

    if (Array.isArray(shortage_stocks) && shortage_stocks.length > 0) {
      let diff = 0;

      for (let i = 0; i < shortage_stocks.length; i++) {
        const reservationItem = reservations.find(
          (el) =>
            el.stock_id === shortage_stocks[i].stock_id &&
            el.warehouse_id === shortage_stocks[i].warehouse_id,
        );

        if (reservationItem) {
          diff += reservationItem.quantity - shortage_stocks[i].quantity;
        }
      }

      if (diff > 0) {
        value = `${quantity} -> ${quantity - diff}`;
      }
    }

    return value;
  };

  return (
    <>
      {props.isHasShortageStocksProblem && (
        <ErrorAlert message="Запрос на изменение количества товара. Клиент должен подтвердить или отменить изменение. До подтверждения заказ невозможно перевести на следующий этап. Администратор может принудительно применить изменения — рекомендуется связаться с клиентом перед использованием этой функции." />
      )}

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
              <td className={styles.dataCell}>
                {showStockValue(product.quantity, product.shortage_stocks, product.reservations)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

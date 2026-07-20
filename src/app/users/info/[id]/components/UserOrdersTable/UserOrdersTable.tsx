import Link from "next/link";
import type { OrderModel } from "@/app/orders/action";
import { orderStatusTranslations } from "@/shared/translate/order-translates";
import styles from "./UserOrdersTable.module.css";

type Props = {
  orders: OrderModel[];
};

export const UserOrdersTable = (props: Props) => {
  return (
    <table className={styles.table}>
      <thead className={styles.header}>
        <tr className={styles.tableHeaderLine}>
          <th className={styles.headerCell}>
            <span className={styles.headerCellText}>Номер заказа</span>
          </th>
          <th className={styles.headerCell}>
            <span className={styles.headerCellText}>Статус</span>
          </th>
          <th className={styles.headerCell}>
            <span className={styles.headerCellText}>Сумма</span>
          </th>
          <th className={styles.headerCell}>
            <span className={styles.headerCellText}>Дата создания</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {props.orders.map((order) => (
          <tr key={order.id} className={styles.dataRow}>
            <td className={styles.dataCell}>
              <Link href={`/orders/edit/${order.id}`} className={styles.link}>
                {order.order_number}
              </Link>
            </td>
            <td className={styles.dataCell}>
              <span>{orderStatusTranslations[order.status] || order.status}</span>
            </td>
            <td className={styles.dataCell}>{order.total || "---"}</td>
            <td className={styles.dataCell}>
              {order.created_at ? new Date(order.created_at).toLocaleString("ru-RU") : "---"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

import Link from "next/link";
import type { OrderModel } from "@/app/orders/action";
import { priceFormatter } from "@/shared/helpers/formatPrice";
import { orderPaymentMethodTranslations } from "@/shared/translate/order-translates";
import { WidgetWrapper } from "../WidgetWrapper/WidgetWrapper";
import styles from "./NewOrders.module.css";

type Props = {
  orders: OrderModel[];
};

export const NewOrders = (props: Props) => {
  return (
    <WidgetWrapper title="Новые заказы" linkHref="/orders" linkLabel="Все заказы">
      <table className={styles.table}>
        <thead className={styles.header}>
          <tr className={styles.headerLine}>
            <th className={styles.headerCell}>
              <span className={styles.headerCellText}>Номер</span>
            </th>
            <th className={styles.headerCell}>
              <span className={styles.headerCellText}>Сумма</span>
            </th>
            <th className={styles.headerCell}>
              <span className={styles.headerCellText}>Дата создания</span>
            </th>
            <th className={styles.headerCell}>
              <span className={styles.headerCellText}>Метод оплаты</span>
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
                <span>
                  {typeof order.total === "number"
                    ? priceFormatter.format(order.total)
                    : `${Number(order.total).toLocaleString("ru-RU")} ₽`}
                </span>
              </td>
              <td className={styles.dataCell}>
                {order.created_at ? new Date(order.created_at).toLocaleString("ru-RU") : "-/-"}
              </td>
              <td className={styles.dataCell}>
                {orderPaymentMethodTranslations[order.payment_method] || "-/-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </WidgetWrapper>
  );
};

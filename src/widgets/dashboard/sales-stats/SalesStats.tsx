import { priceFormatter } from "@/shared/helpers/formatPrice";
import { WidgetWrapper } from "../WidgetWrapper/WidgetWrapper";
import styles from "./SalesStats.module.css";

type Props = {
  total: number;
  totalCart: number;
  totalCash: number;
  averageCheck: number;
  ordersCount: number;
  discount: number;
};

export const SalesStats = (props: Props) => {
  return (
    <WidgetWrapper title="Продажи за все время">
      <div className={styles.grid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Сумма всего</span>
          <span className={styles.statValue}>{priceFormatter.format(props.total)}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Оплачено картой</span>
          <span className={styles.statValue}>
            {props.totalCart ? priceFormatter.format(props.totalCart) : 0}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Оплачено наличными</span>
          <span className={styles.statValue}>
            {props.totalCash ? priceFormatter.format(props.totalCash) : 0}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Средний чек</span>
          <span className={styles.statValue}>{priceFormatter.format(props.averageCheck)}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Заказов выполнено</span>
          <span className={styles.statValue}>
            {props.ordersCount} <span className={styles.statUnit}>шт</span>
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Сумма скидок</span>
          <span className={styles.statValue}>
            {props.discount ? priceFormatter.format(props.discount) : 0}
          </span>
        </div>
      </div>
    </WidgetWrapper>
  );
};

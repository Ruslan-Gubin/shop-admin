import Link from "next/link";
import type { PromotionModel } from "@/app/promotions/action";
import { WidgetWrapper } from "../WidgetWrapper/WidgetWrapper";
import styles from "./ActivePromotions.module.css";

type Props = {
  promotions: PromotionModel[];
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
};

export const ActivePromotions = (props: Props) => {
  return (
    <WidgetWrapper title="Активные акции" linkHref="/promotions" linkLabel="Все акции">
      <ul className={styles.list}>
        {props.promotions.map((promotion) => (
          <Link key={promotion.id} href="/promotions" className={styles.item}>
            <span className={styles.name}>{promotion.name}</span>
            <span className={styles.percent}>-{promotion.percent}%</span>
            <span className={styles.dates}>
              <span className={styles.dateRange}>{formatDate(promotion.date_from)}</span>
              <span className={styles.separator}>—</span>
              <span className={styles.dateRange}>{formatDate(promotion.date_to)}</span>
            </span>
          </Link>
        ))}
      </ul>
    </WidgetWrapper>
  );
};

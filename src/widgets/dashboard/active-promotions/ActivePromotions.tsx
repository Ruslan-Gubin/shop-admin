import Link from "next/link";
import { WidgetWrapper } from "../WidgetWrapper/WidgetWrapper";
import styles from "./ActivePromotions.module.css";

export type ActivePromotionItem = {
  id: number;
  name: string;
  percent: number;
  date_from: string;
  date_to: string;
};

type Props = {
  promotions: ActivePromotionItem[];
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
};

export const ActivePromotions = ({ promotions }: Props) => {
  if (promotions.length === 0) return null;

  return (
    <WidgetWrapper
      title="Активные акции"
      linkHref="/promotions"
      linkLabel="Все акции"
    >
      <div className={styles.list}>
        {promotions.map((p) => (
          <Link key={p.id} href="/promotions" className={styles.item}>
            <span className={styles.name}>{p.name}</span>
            <span className={styles.percent}>-{p.percent}%</span>
            <span className={styles.dates}>
              <span className={styles.dateRange}>{formatDate(p.date_from)}</span>
              <span className={styles.separator}>—</span>
              <span className={styles.dateRange}>{formatDate(p.date_to)}</span>
            </span>
          </Link>
        ))}
      </div>
    </WidgetWrapper>
  );
};

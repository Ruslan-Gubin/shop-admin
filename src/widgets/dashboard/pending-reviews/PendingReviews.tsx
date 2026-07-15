import Link from "next/link";
import { WidgetWrapper } from "../WidgetWrapper/WidgetWrapper";
import styles from "./PendingReviews.module.css";

export type PendingReviewItem = {
  id: number;
  comment: string;
  rating: number;
  product_name: string;
  product_id: number;
  created_at: string;
};

type Props = {
  reviews: PendingReviewItem[];
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
};

export const PendingReviews = ({ reviews }: Props) => {
  if (reviews.length === 0) return null;

  return (
    <WidgetWrapper
      title="Неотвеченные отзывы"
      linkHref="/product-reviews"
      linkLabel="Все отзывы"
    >
      <div className={styles.list}>
        {reviews.map((r) => (
          <Link
            key={r.id}
            href={`/product/info/${r.product_id}`}
            className={styles.item}
          >
            <span className={styles.icon}>★</span>
            <div className={styles.content}>
              <div className={styles.comment}>
                {r.comment}
                <span className={styles.rating}>{r.rating}/5</span>
              </div>
              <span className={styles.productName}>{r.product_name}</span>
            </div>
            <span className={styles.date}>{formatDate(r.created_at)}</span>
          </Link>
        ))}
      </div>
    </WidgetWrapper>
  );
};

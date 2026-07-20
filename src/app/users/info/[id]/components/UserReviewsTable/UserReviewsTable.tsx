import Link from "next/link";
import type { ReviewModel } from "@/app/product-reviews/action";
import styles from "./UserReviewsTable.module.css";

type Props = {
  reviews: ReviewModel[];
};

export const UserReviewsTable = (props: Props) => {
  return (
    <table className={styles.table}>
      <thead className={styles.header}>
        <tr className={styles.tableHeaderLine}>
          <th className={styles.headerCell}>
            <span className={styles.headerCellText}>Достоинства</span>
          </th>
          <th className={styles.headerCell}>
            <span className={styles.headerCellText}>Недостатки</span>
          </th>
          <th className={styles.headerCell}>
            <span className={styles.headerCellText}>Комментарий</span>
          </th>
          <th className={styles.headerCell}>
            <span className={styles.headerCellText}>Оценка</span>
          </th>
          <th className={styles.headerCell}>
            <span className={styles.headerCellText}>Отвечен</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {props.reviews.map((review) => (
          <tr key={review.id} className={styles.dataRow}>
            <td className={styles.dataCell}>
              <Link
                href={`/product-reviews/edit/${review.id}`}
                className={styles.cellLink}
              >
                <span className={styles.textEllipsis}>{review.dignities || "---"}</span>
              </Link>
            </td>
            <td className={styles.dataCell}>
              <Link
                href={`/product-reviews/edit/${review.id}`}
                className={styles.cellLink}
              >
                <span className={styles.textEllipsis}>{review.disadvantages || "---"}</span>
              </Link>
            </td>
            <td className={styles.dataCell}>
              <Link
                href={`/product-reviews/edit/${review.id}`}
                className={styles.cellLink}
              >
                <span className={styles.textEllipsis}>{review.comment || "---"}</span>
              </Link>
            </td>
            <td className={styles.dataCell}>
              <Link
                href={`/product-reviews/edit/${review.id}`}
                className={styles.cellLink}
              >
                {review.rating}
              </Link>
            </td>
            <td className={styles.dataCell}>
              <Link
                href={`/product-reviews/edit/${review.id}`}
                className={styles.cellLink}
              >
                {review.answer.length > 0 ? "Да" : "Нет"}
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

import Link from "next/link";
import { WidgetWrapper } from "../WidgetWrapper/WidgetWrapper";
import styles from "./PendingQuestions.module.css";

export type PendingQuestionItem = {
  id: number;
  question: string;
  product_name: string;
  product_id: number;
  created_at: string;
};

type Props = {
  questions: PendingQuestionItem[];
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
};

export const PendingQuestions = ({ questions }: Props) => {
  if (questions.length === 0) return null;

  return (
    <WidgetWrapper
      title="Неотвеченные вопросы"
      linkHref="/product-questions"
      linkLabel="Все вопросы"
    >
      <div className={styles.list}>
        {questions.map((q) => (
          <Link
            key={q.id}
            href={`/product/info/${q.product_id}`}
            className={styles.item}
          >
            <span className={styles.icon}>?</span>
            <div className={styles.content}>
              <div className={styles.question}>{q.question}</div>
              <span className={styles.productName}>{q.product_name}</span>
            </div>
            <span className={styles.date}>{formatDate(q.created_at)}</span>
          </Link>
        ))}
      </div>
    </WidgetWrapper>
  );
};

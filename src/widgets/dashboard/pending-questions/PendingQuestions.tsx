import Link from "next/link";
import type { QuestionModel } from "@/app/product-questions/action";
import { WidgetWrapper } from "../WidgetWrapper/WidgetWrapper";
import styles from "./PendingQuestions.module.css";

type Props = {
  questions: QuestionModel[];
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
};

export const PendingQuestions = (props: Props) => {
  return (
    <WidgetWrapper
      title="Неотвеченные вопросы"
      linkHref="/product-questions"
      linkLabel="Все вопросы"
    >
      <ul className={styles.list}>
        {props.questions.map((question) => (
          <li key={question.id}>
            <Link href={`/product-questions/edit/${question.id}`} className={styles.item}>
              <div className={styles.content}>
                <span className={styles.productName}>{question.product.name}</span>
                <div className={styles.question}>{question.question}</div>
              </div>
              <span className={styles.date}>{formatDate(question.created_at)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </WidgetWrapper>
  );
};

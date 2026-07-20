import Link from "next/link";
import type { QuestionModel } from "@/app/product-questions/action";
import styles from "./UserQuestionsTable.module.css";

type Props = {
  questions: QuestionModel[];
};

export const UserQuestionsTable = (props: Props) => {
  return (
    <table className={styles.table}>
      <thead className={styles.header}>
        <tr className={styles.tableHeaderLine}>
          <th className={styles.headerCell}>
            <span className={styles.headerCellText}>Вопрос</span>
          </th>
          <th className={styles.headerCell}>
            <span className={styles.headerCellText}>Дата создания</span>
          </th>
          <th className={styles.headerCell}>
            <span className={styles.headerCellText}>Отвечен</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {props.questions.map((question) => (
          <tr key={question.id} className={styles.dataRow}>
            <td className={styles.dataCell}>
              <Link
                href={`/product-questions/edit/${question.id}`}
                className={styles.questionLink}
              >
                <span className={styles.textClamp}>{question.question || "---"}</span>
              </Link>
            </td>
            <td className={styles.dataCell}>
              {question.created_at
                ? new Date(question.created_at).toLocaleString("ru-RU")
                : "---"}
            </td>
            <td className={styles.dataCell}>
              {question.answer && question.answer.length > 0 ? "Да" : "Нет"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

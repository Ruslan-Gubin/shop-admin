import { fetchQuestionProductUnanswered } from "@/app/action";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import styles from "./Notifications.module.css";

type Props = {};

export const Notifications = async (props: Props) => {
  const questionProductUnanswered = await fetchQuestionProductUnanswered();
  const questions = questionProductUnanswered?.data?.questions || [];
  const questionsTotalCount = questionProductUnanswered?.data?.totalCount || 0;

  return (
    <>
      {questionProductUnanswered?.tokens && (
        <UpdateToken tokens={questionProductUnanswered.tokens} />
      )}
      <div className={styles.root}>
        <div>Product question {questionsTotalCount}</div>
      </div>
    </>
  );
};

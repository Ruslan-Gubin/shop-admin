import { fetchNotificationHeader } from "@/app/action";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { NotificationWrapper } from "../NotificationWrapper/NotificationWrapper";
import styles from "./Notifications.module.css";

export const Notifications = async () => {
  const [questionProductUnanswered, reviewProductUnanswered, transfersActive, newOrders] =
    await fetchNotificationHeader();

  const questionsTotalCount = questionProductUnanswered?.data?.totalCount || 0;
  const reviewTotalCount = reviewProductUnanswered?.data?.totalCount || 0;
  const transferTotalCount = transfersActive?.data?.totalCount || 0;
  const newOrdersTotalCount = newOrders?.data?.totalCount || 0;

  return (
    <>
      {newOrders?.tokens && <UpdateToken tokens={newOrders.tokens} />}
      <div className={styles.root}>
        <NotificationWrapper
          order={newOrdersTotalCount}
          question={questionsTotalCount}
          reviews={reviewTotalCount}
          transfer={transferTotalCount}
        />
      </div>
    </>
  );
};

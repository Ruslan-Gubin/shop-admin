import { WidgetWrapper } from "../WidgetWrapper/WidgetWrapper";
import styles from "./SalesSchedule.module.css";

export const SalesSchedule = () => {
  return (
    <WidgetWrapper title="График продаж">
      <div className={styles.placeholder}>
        График продаж — будет реализован позже
      </div>
    </WidgetWrapper>
  );
};

import { NotificationSvg } from "../../../shared/svg/layout-header/NotificationSvg";
import styles from "./LayoutHeader.module.scss";

type Props = {
  title: string;
  isConnect: boolean;
};

const LayoutHeader = ({ title, isConnect }: Props) => {
  return (
    <header className={styles.layoutHeader}>
      <div className={styles.LayoutHeaderLeftSide}>
        <h2 className={styles.LayoutHeaderLeftSideTile}>{title}</h2>
      </div>
      <div className={styles.LayoutHeaderRightSide}>
        <h3
          className={
            isConnect
              ? `${styles.connectTitle} ${styles.connectTitleGreen}`
              : styles.connectTitle
          }
        >
          Соединение с сервером
        </h3>
        <div className={styles.layoutHeaderSvgContainer}>
          <NotificationSvg />
        </div>
      </div>
    </header>
  );
};

export { LayoutHeader };

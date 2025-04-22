import { EmailSvg } from "../../../shared/svg/layout-header/EmailSvg";
import { NotificationSvg } from "../../../shared/svg/layout-header/NotificationSvg";
import { UserSvg } from "../../../shared/svg/layout-header/UserSvg";
import styles from "./LayoutHeader.module.scss";

type Props = {
  title: string;
};

const LayoutHeader = ({ title }: Props) => {
  return (
    <header className={styles.layoutHeader}>
      <div className={styles.LayoutHeaderLeftSide}>
        <h2 className={styles.LayoutHeaderLeftSideTile}>{title}</h2>
      </div>
      <div className={styles.LayoutHeaderRightSide}>
        <div className={styles.layoutHeaderSvgContainer}>
          <NotificationSvg />
        </div>
        <div className={styles.layoutHeaderSvgContainer}>
          <EmailSvg />
        </div>
        <div className={styles.verticalLine}></div>
        <div className={styles.layoutHeaderUser}>Руководитель</div>
        <div className={styles.layoutHeaderSvgContainer}>
          <UserSvg />
        </div>
      </div>
    </header>
  );
};

export { LayoutHeader };

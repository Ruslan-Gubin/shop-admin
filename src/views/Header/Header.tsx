import { Suspense } from "react";
import styles from "./Header.module.css";
import { LogoutButton } from "./LogoutButton/LogoutButton";
import { MobileMenuHeader } from "./MobileMenuHeader/MobileMenuHeader";
import { Notifications } from "./Notifications/Notifications";
import { NotificationWrapper } from "./NotificationWrapper/NotificationWrapper";

type Props = {
  logoutAction: () => Promise<{ status: string; message: string }>;
};

export const Header = async (props: Props) => {
  return (
    <aside className={styles.headerWrapper}>
      <aside className={styles.headerLeftSide}>
        <MobileMenuHeader />
      </aside>
      <aside className={styles.headerRightSide}>
        <Suspense
          fallback={<NotificationWrapper order={0} question={0} reviews={0} transfer={0} />}
        >
          <Notifications />
        </Suspense>
        <LogoutButton logoutAction={props.logoutAction} />
      </aside>
    </aside>
  );
};

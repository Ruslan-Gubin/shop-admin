import styles from "./Header.module.css";
import { LogoutButton } from "./LogoutButton/LogoutButton";
import { MobileMenuHeader } from "./MobileMenuHeader/MobileMenuHeader";

type Props = {
  logoutAction: () => Promise<{ status: string; message: string }>;
};

export const Header = (props: Props) => {
  return (
    <aside className={styles.headerWrapper}>
      <aside className={styles.headerLeftSide}>
        <MobileMenuHeader />
      </aside>
      <aside>
        <div>
          <LogoutButton logoutAction={props.logoutAction} />
        </div>
      </aside>
    </aside>
  );
};

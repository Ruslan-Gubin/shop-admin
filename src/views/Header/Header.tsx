import styles from "./Header.module.css";
import { MobileMenuHeader } from "./MobileMenuHeader/MobileMenuHeader";

export const Header = () => {

  return (
    <aside className={styles.headerWrapper}>
      <aside className={styles.headerLeftSide}>
        <MobileMenuHeader />
      </aside>
      <aside>
        <div>Right side</div>
      </aside>
    </aside>
  );
};

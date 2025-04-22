import { useState } from "react";
import { NavsMenuItemType } from "../../../shared/constants/side-menu";
import styles from "./LayoutNavsGroup.module.scss";
import { ToggleMenuSvg } from "../../../shared/svg/side-menu/ToggleMenuSvg";

type Props = {
  navsList: NavsMenuItemType[];
  onNavigate: (href: string) => void;
  pathname: string;
  title: string;
  menuIsOpen: boolean;
};

const LayoutNavsGroup = ({
  menuIsOpen,
  title,
  navsList,
  pathname,
  onNavigate,
}: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <section className={!menuIsOpen ? styles.menuClose : ""}>
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className={`${styles.navItem} ${styles.navsListToggle}`}
      >
        {title}
        <div
          className={
            !isOpen
              ? `${styles.menuToggleSvg} ${styles.menuToggleSvgHidden}`
              : styles.menuToggleSvg
          }
        >
          <ToggleMenuSvg />
        </div>
      </div>
      <ul
        className={
          !isOpen ? `${styles.navList} ${styles.navListHidden}` : styles.navList
        }
      >
        {navsList.map(({ svg: SVG, title, href, id, active }) => (
          <li
            className={
              active.includes(pathname)
                ? `${styles.navItem} ${styles.navItemActive}`
                : styles.navItem
            }
            key={id}
            onClick={() => onNavigate(href)}
          >
            <div className={styles.menuItemSvg}>
              <SVG />
            </div>
            {menuIsOpen && title}
          </li>
        ))}
      </ul>
    </section>
  );
};

export { LayoutNavsGroup };

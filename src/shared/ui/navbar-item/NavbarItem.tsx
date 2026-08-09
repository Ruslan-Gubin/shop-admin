"use client";
import Link from "next/link";
import styles from "./NavbarItem.module.css";

type Props = {
  href: string;
  count?: number;
  label: string;
  svg: React.ReactElement;
  active?: boolean;
  showOnlyTablet?: boolean;
  showOnlyDesktops?: boolean;
  onClickAction?: () => void;
  disabled?: boolean;
};

export const NavbarItem = (props: Props) => {
  return (
    <li
      className={
        props.showOnlyTablet
          ? styles.showOnlyTablet
          : props.showOnlyDesktops
            ? styles.showOnlyDesktops
            : ""
      }
    >
      <Link
        onClick={() =>
          !props.disabled && typeof props.onClickAction === "function" && props.onClickAction()
        }
        href={props.href || ""}
        className={styles.navbarItem}
      >
        <div
          className={
            props.active
              ? `${styles.svgContainer} ${styles.svgContainerActive}`
              : styles.svgContainer
          }
        >
          {props.svg}

          {typeof props.count === "number" && props.count > 0 && (
            <div className={styles.navbarCount}>
              <span>{props.count}</span>
            </div>
          )}
        </div>
        <span className={styles.navbarLabel}>{props.label}</span>
      </Link>
    </li>
  );
};

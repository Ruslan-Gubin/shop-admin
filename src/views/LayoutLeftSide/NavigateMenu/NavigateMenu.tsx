"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, useMemo, useState } from "react";
import { menuAdapter } from "@/stores/menu/adapter";
import type { NavigateListItem } from "../LayoutLeftSide";
import { getInitSelect } from "./helpers";
import styles from "./NavigateMenu.module.css";
import { BirdSelectIcon } from "./svg/BirdSelectIcon";

type Props = {
  navigateList: NavigateListItem[];
  isChildren?: boolean;
};

export const NavigateMenu = (props: Props) => {
  const pathname = usePathname();
  const [selected, setSelected] = useState<string[]>([]);
  const [prevPathname, setPrevPathname] = useState<string | null>(null);

  const handleClickSelect = (hasChildren: boolean, href: string, pathname: string) => {
    if (hasChildren) {
      const isSelect = selected.includes(href);
      const updateSelect = !(href === pathname && isSelect);

      if (isSelect !== updateSelect) {
        setSelected((prev) =>
          prev.includes(href) ? prev.filter((el) => el !== href) : [...prev, href],
        );
      }
    } else {
      menuAdapter.toggleMenu(false);
    }
  };

  const activeHref = useMemo(
    () => (pathname !== prevPathname ? getInitSelect(props.navigateList, pathname) : ""),
    [pathname, props.navigateList, prevPathname],
  );

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);

    if (activeHref && !selected.includes(activeHref)) {
      setSelected((prev) => [...prev, activeHref]);
    }
  }

  return (
    <nav
      className={
        props.isChildren
          ? `${styles.navigateMenuNav} ${styles.navigateMenuNavChildren} `
          : styles.navigateMenuNav
      }
    >
      <ul className={styles.navigateMenuList}>
        {props.navigateList.map((item) => (
          <li key={item.href} className={styles.navigateMenuItemWrapper}>
            <button
              type="button"
              className={
                pathname === item.href
                  ? `${styles.navigateMenuItem} ${styles.navigateMenuItemActive}`
                  : styles.navigateMenuItem
              }
            >
              <Link
                href={item.href ? item.href : pathname}
                className={
                  pathname === item.href
                    ? `${styles.navigateMenuItemLink} ${styles.navigateMenuItemLinkActive}`
                    : styles.navigateMenuItemLink
                }
                onClick={() => handleClickSelect(item.children.length > 0, item.href, pathname)}
              >
                {item.icon}
                <p>{item.label}</p>
              </Link>
              {item.children.length > 0 && (
                <BirdSelectIcon
                  className={
                    selected.includes(item.href)
                      ? styles.navigateMenuItemSvgActive
                      : styles.navigateMenuItemSvg
                  }
                />
              )}
            </button>
            <Activity mode={item.children && selected.includes(item.href) ? "visible" : "hidden"}>
              <NavigateMenu navigateList={item.children} isChildren />
            </Activity>
            {item.isHasLine && <div className={styles.navigateMenuItemBottomSeparator}></div>}
          </li>
        ))}
      </ul>
    </nav>
  );
};

"use client";
import { useEffect, useRef, useState } from "react";
import { DotsSvg } from "@/shared/svg/DotsSvg";
import styles from "./ActionsMenu.module.css";

interface Props<T> {
  item: T;
  actions: { label: string; action: (item: T) => void }[];
}

export const ActionsMenu = <T extends { id: number }>(props: Props<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={ref} className={styles.wrapper}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Действия"
        aria-expanded={isOpen}
      >
        <DotsSvg fill="#727280" />
      </button>

      <ul className={isOpen ? `${styles.menu} ${styles.menuActive}` : styles.menu}>
        {props.actions.map((item) => (
          <li key={item.label} role="none">
            <button
              type="button"
              role="menuitem"
              className={styles.menuItem}
              onClick={() => {
                setIsOpen(false);
                item.action(props.item);
              }}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

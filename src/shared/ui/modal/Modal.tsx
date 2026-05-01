"use client";
import { useEffect, useRef } from "react";

import styles from "./Modal.module.css";

type Props = {
  handleCloseAction?: () => void;
  active: boolean;
  children: React.ReactNode;
  classContainer?: string;
};

export const Modal = ({ active, handleCloseAction, children, classContainer }: Props) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    const clickOutside = (e: MouseEvent) => {
      if ((e.target as Node).contains(rootRef.current) && handleCloseAction) {
        handleCloseAction();
      }
    };

    const node = rootRef.current;
    node.addEventListener("mousedown", clickOutside);
    return () => node.removeEventListener("mousedown", clickOutside);
  }, [handleCloseAction]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.style.overflow = active ? "hidden" : "auto";
    }

    return () => {
      if (typeof window !== "undefined") {
        document.body.style.overflow = "auto";
      }
    };
  }, [active]);

  return (
    <div
      ref={rootRef}
      className={
        active ? `${styles.modalWrapper} ${styles.modalWrapperActive}` : styles.modalWrapper
      }
    >
      <div
        className={
          active
            ? `${styles.modalContentContainer} ${styles.modalContainerActive} ${classContainer}`
            : `${styles.modalContentContainer} ${classContainer}`
        }
      >
        {children}
      </div>
    </div>
  );
};

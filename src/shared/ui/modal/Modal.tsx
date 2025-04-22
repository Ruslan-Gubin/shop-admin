import { useEffect, useRef } from "react";


import styles from "./Modal.module.scss";

type Props = {
  handleClose?: () => void;
  active: boolean;
  children: React.ReactNode;
  classContainer?: string;
};

const Modal = ({ active, handleClose, children, classContainer }: Props) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    const clickOutside = (e: MouseEvent) => {
      if ((e.target as Node).contains(rootRef.current) && handleClose) {
        handleClose();
      }
    };

    const node = rootRef.current;
    node.addEventListener("mousedown", clickOutside);
    return () => node.removeEventListener("mousedown", clickOutside);
  }, [handleClose]);

  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "auto";
  }, [active]);

  return (
    <div
      ref={rootRef}
      className={active ? `${styles.modalWrapper} ${styles.modalWrapperActive}` : styles.modalWrapper}
    >
      <div
        className={
        active ? `${styles.modalContentContainer} ${styles.modalContainerActive} ${classContainer}` : `${styles.modalContentContainer} ${classContainer}`
      }
      >
        {children}
      </div>
    </div>
  );
};

export { Modal };

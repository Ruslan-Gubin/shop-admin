import type { ReactNode } from "react";
import styles from "./Badge.module.css";

type Props = {
  variant: "active" | "error";
  children: ReactNode;
};

export const Badge = (props: Props) => {
  return <div className={`${styles.badge} ${styles[props.variant]}`}>{props.children}</div>;
};

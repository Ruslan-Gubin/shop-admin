"use client";
import type { ReactElement } from "react";
import styles from "./HorizontalScrollWrapper.module.scss";

type Props = {
  children: ReactElement;
};

const HorizontalScrollWrapper = ({ children }: Props) => {
  return <section className={styles.wrapper}>{children}</section>;
};

export { HorizontalScrollWrapper };

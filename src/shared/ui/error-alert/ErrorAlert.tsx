import Link from "next/link";
import styles from "./ErrorAlert.module.css";

type Props = {
  message?: string;
  link?: {
    label: string;
    href: string;
  };
};

export const ErrorAlert = (props: Props) => {
  return (
    <section className={styles.container}>
      <p className={styles.icon}>⚠️</p>
      <p className={styles.message}>{props.message}</p>
      {props.link && (
        <Link href={props.link?.href} className={styles.actionButton}>
          {props.link.label}
        </Link>
      )}
    </section>
  );
};

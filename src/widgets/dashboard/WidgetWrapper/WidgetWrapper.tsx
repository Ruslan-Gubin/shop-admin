import Link from "next/link";
import styles from "./WidgetWrapper.module.css";

type Props = {
  title: string;
  children: React.ReactElement;
  linkHref?: string;
  linkLabel?: string;
};

export const WidgetWrapper = ({ title, children, linkHref, linkLabel }: Props) => {
  return (
    <section className={styles.widget}>
      <header className={styles.widgetHeader}>
        <h3>{title}</h3>
        {linkHref && linkLabel && (
          <Link href={linkHref} className={styles.widgetLink}>
            {linkLabel}
          </Link>
        )}
      </header>
      {children}
    </section>
  );
};

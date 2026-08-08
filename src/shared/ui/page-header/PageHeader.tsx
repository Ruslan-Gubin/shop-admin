import { BackButton } from "../back-button/BackButton";
import styles from "./PageHeader.module.css";

type Props = {
  title: string;
  children?: React.ReactElement;
  fallbackHref?: string;
};

export const PageHeader = (props: Props) => {
  return (
    <div className={styles.root}>
      <div className={styles.titleSide}>
        <BackButton fallbackHref={props.fallbackHref} />
        <h2 className={styles.title}>{props.title}</h2>
      </div>
      {props.children && <div className={styles.actions}>{props.children}</div>}
    </div>
  );
};

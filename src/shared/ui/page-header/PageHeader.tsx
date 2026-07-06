import styles from "./PageHeader.module.css";

type Props = {
  title: string;
  children?: React.ReactElement;
};

export const PageHeader = (props: Props) => {
  return (
    <div className={styles.root}>
      <h2 className={styles.title}>{props.title}</h2>
      {props.children && <div className={styles.actions}>{props.children}</div>}
    </div>
  );
};

import styles from "./FormSection.module.css";

type Props = {
  title: string;
  children: React.ReactNode;
};

export const FormSection = (props: Props) => {
  return (
    <section className={styles.root}>
      <h3>{props.title}</h3>
      {props.children}
    </section>
  );
};

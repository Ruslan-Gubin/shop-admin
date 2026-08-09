import styles from "./ModalBody.module.css";

type Props = {
  children: React.ReactNode;
  minHeight?: number;
};

export const ModalBody = (props: Props) => {
  return (
    <section data-height={props.minHeight ? props.minHeight : "auto"} className={styles.root}>
      {props.children}
    </section>
  );
};

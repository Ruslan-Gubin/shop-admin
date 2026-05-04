import styles from "./ModalBody.module.css";

type Props = {
  children: React.ReactNode;
};

export const ModalBody = (props: Props) => {
  return <section className={styles.root}>{props.children}</section>;
};

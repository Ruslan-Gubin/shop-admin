import styles from "./ModalContent.module.css";

type Props = {
  children: React.ReactNode;
};

export const ModalContent = (props: Props) => {
  return <section className={styles.modalContent}>{props.children}</section>;
};

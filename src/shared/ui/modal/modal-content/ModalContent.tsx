import styles from "./ModalContent.module.css";

type Props = {
  children: React.ReactNode;
  width?: number;
};

export const ModalContent = (props: Props) => {
  return (
    <section className={styles.modalContent} style={{ width: props.width || 576 }}>
      {props.children}
    </section>
  );
};

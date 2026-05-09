import styles from "./FormInstruction.module.css";

type Props = {
  children: React.ReactNode;
};

export const FormInstruction = (props: Props) => {
  return <div className={styles.instruction}>{props.children}</div>;
};

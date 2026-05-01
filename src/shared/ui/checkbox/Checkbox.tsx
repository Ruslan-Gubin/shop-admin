import styles from "./Checkbox.module.css";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  labelText: string;
}

export const Checkbox = ({ labelText, ...rest }: Props) => {
  return (
    <label className={styles.checkboxLabel}>
      <input type="checkbox" className={styles.checkbox} {...rest} />
      {labelText && <p className={styles.checkboxTextLabel}>{labelText}</p>}
    </label>
  );
};

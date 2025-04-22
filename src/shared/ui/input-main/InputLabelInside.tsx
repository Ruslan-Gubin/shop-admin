"use client";
import styles from "./InputLabelInside.module.scss";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  label: string;
  name?: string;
  defaultValue?: string;
  error?: string;
};

const InputLabelInside = ({
  onChange,
  value,
  type = "text",
  placeholder,
  label,
  name,
  defaultValue,
  error,
}: Props) => {
  return (
    <div
      className={
        error && error?.length > 0
          ? `${styles.inputWrapperError} ${styles.inputWrapper}`
          : styles.inputWrapper
      }
    >
      <label className={styles.inputLabel}>{error ? error : label}</label>
      <input
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
        type={type}
        className={styles.input}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
    </div>
  );
};

export { InputLabelInside };

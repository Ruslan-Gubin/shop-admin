import { useEffect, useRef, useState } from "react";
import styles from "./TextAreaResize.module.css";

export interface Props {
  name: string;
  label?: string;
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  maxHeight?: number;
  minHeight?: number;
  onClickArea?: () => void;
}

export const TextAreaResize = ({
  name,
  label,
  value,
  error,
  disabled,
  onChange,
  maxHeight,
  minHeight,
  onClickArea,
}: Props) => {
  const [initValue, setInitValue] = useState<boolean>(false);
  const textareaRef = useRef<HTMLDivElement | null>(null);

  const handleClickContainer = () => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }

    if (onClickArea) {
      onClickArea();
    }
  };

  const changeInput = (e: any) => {
    const data = e.nativeEvent.data;
    const newValue = e.currentTarget.innerText;

    onChange(data === null && newValue.trim() === "" ? "" : newValue);
  };

  useEffect(() => {
    if (!initValue && textareaRef.current && textareaRef.current.innerText !== value) {
      textareaRef.current.innerText = value;
      setInitValue(true);
    }

    if (textareaRef.current && textareaRef.current.innerText !== value) {
      textareaRef.current.innerText = value;
    }
  }, [value, initValue]);

  const style: { maxHeight?: string; minHeight?: string } = {};

  if (maxHeight) {
    style.maxHeight = `${maxHeight}px`;
  }

  if (minHeight) {
    style.minHeight = `${minHeight}px`;
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClickContainer}
      className={
        error && error.length > 0
          ? `${styles.inputContainer} ${styles.inputContainerError}`
          : styles.inputContainer
      }
    >
      {value.length === 0 && (
        <label htmlFor={name} className={styles.label}>
          {label}
        </label>
      )}
      <div
        style={style}
        ref={textareaRef}
        id={name}
        className={styles.textareaElement}
        contentEditable
        onInput={changeInput}
        onFocus={(e) => disabled && e.target.blur()}
      ></div>
      {error && <span className={styles.errorText}>{error}</span>}
    </button>
  );
};

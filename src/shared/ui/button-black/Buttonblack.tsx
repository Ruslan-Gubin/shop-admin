import styles from "./ButtonBlack.module.scss";

type Props = {
  disabled?: boolean;
  text: string;
  color?: "black" | "error";
  type?: "button" | "submit" | "reset";
  className?: string;
  onClick?: () => void;
};

const ButtonBlack = ({
  disabled,
  text,
  type = "button",
  className,
  onClick,
}: Props) => {
  return (
    <button
      className={`${styles.button} ${className}`}
      disabled={disabled}
      type={type}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export { ButtonBlack };

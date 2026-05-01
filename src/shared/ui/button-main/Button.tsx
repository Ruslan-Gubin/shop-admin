import type { ReactNode } from "react";
import styles from "./Button.module.css";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variantColor?: "teal" | "error" | "green" | "pink" | "blue";
  fullWidth?: boolean;
  variant?: "solid" | "outline" | "ghost" | "link";
  size?: "xs" | "sm" | "md" | "lg";
  customClass?: string;
}

export const Button = ({
  fullWidth,
  variantColor,
  children,
  variant = "solid",
  size = "md",
  customClass,
  ...rest
}: Props) => {
  return (
    <button
      className={`${styles[size]} ${styles.button} ${variantColor ? styles[variantColor] : styles.defaultVariantColor} ${fullWidth ? styles.fullWidth : ""} ${styles[variant]} ${customClass ? customClass : ""}`}
      {...rest}
    >
      {children}
    </button>
  );
};

import { Button } from "../../button-main/Button";
import styles from "./ModalFooter.module.css";

type ButtonActionType = {
  action?: () => void;
  text?: string;
  disabled?: boolean;
  type?: "submit";
  variantColor?: "teal" | "error" | "green" | "pink" | "blue";
  variant?: "solid" | "outline" | "ghost" | "link";
  size?: "xs" | "sm" | "md" | "lg";
};

type Props = {
  cancelAction?: ButtonActionType;
  submitAction?: ButtonActionType;
};

export const ModalFooter = (props: Props) => {
  return (
    <footer className={styles.footer}>
      {props.cancelAction && (
        <Button
          disabled={props.cancelAction.disabled}
          size={props.cancelAction.size || "md"}
          variant={props.cancelAction.variant || "ghost"}
          onClick={props.cancelAction.action}
          type={props.cancelAction.type || "button"}
        >
          {props.cancelAction.text || "Отменить"}
        </Button>
      )}
      {props.submitAction && (
        <Button
          size={props.submitAction.size || "md"}
          variant={props.submitAction.variant || "solid"}
          variantColor={props.submitAction.variantColor || "green"}
          disabled={props.submitAction.disabled}
          type={props.submitAction.type || "submit"}
          onClick={props.submitAction.action}
        >
          {props.submitAction.text || "Подтвердить"}
        </Button>
      )}
    </footer>
  );
};

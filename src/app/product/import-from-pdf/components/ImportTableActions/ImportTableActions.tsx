import { Button } from "@/shared/ui/button-main/Button";
import type { CheckItemStatus } from "../../action";
import styles from "./ImportTableActions.module.css";

type Props = {
  id: number;
  status?: CheckItemStatus;
  onGenerate: (id: number) => void;
  onAdd: (id: number) => void;
  disabled: boolean;
  isProcess: boolean;
  hasBarcode: boolean;
};

export const ImportTableActions = (props: Props) => {
  return (
    <>
      {props.status === "empty" && props.hasBarcode && (
        <Button
          size="sm"
          fullWidth
          variantColor="blue"
          onClick={() => props.onGenerate(props.id)}
          disabled={props.disabled || props.isProcess}
          customClass={`${props.isProcess ? styles.currentProcess : ""}`}
        >
          {props.isProcess ? (
            <>
              <div className={styles.spinner} />
              <span>В процессе</span>
            </>
          ) : (
            <span>Сгенерировать</span>
          )}
        </Button>
      )}

      {props.status === "record" && props.hasBarcode && (
        <Button
          size="sm"
          fullWidth
          variantColor="green"
          onClick={() => props.onAdd(props.id)}
          disabled={props.disabled}
          customClass={`${props.isProcess ? styles.currentProcess : ""}`}
        >
          {props.isProcess ? (
            <>
              <div className={styles.spinner} />
              <span>В процессе</span>
            </>
          ) : (
            <span>Добавить товар</span>
          )}
        </Button>
      )}

      {props.status === "error" && props.hasBarcode && (
        <Button
          size="sm"
          fullWidth
          variantColor="pink"
          onClick={() => props.onGenerate(props.id)}
          disabled={props.disabled}
          customClass={`${props.isProcess ? styles.currentProcess : ""}`}
        >
          {props.isProcess ? (
            <>
              <div className={styles.spinner} />
              <span>В процессе</span>
            </>
          ) : (
            <span>Повторить</span>
          )}
        </Button>
      )}
      {props.status === "completed" && (
        <span className={`${styles.actionBtn} ${styles.actionBtnDone}`}> ✓ Готово</span>
      )}
    </>
  );
};

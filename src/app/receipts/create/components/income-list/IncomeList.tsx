import { DeleteSvg } from "@/app/category/components/category-item/svg/DeleteSvg";
import { Button } from "@/shared/ui/button-main/Button";
import { FormSection } from "@/widgets/form-section/FormSection";
import type { IncomeItem } from "../../action";
import styles from "./IncomeList.module.css";

type Props = {
  items: IncomeItem[];
  onDeleteItem: (tempId: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};

export const IncomeList = (props: Props) => {
  const getTotalQuantity = (item: IncomeItem) => {
    let total = 0;
    for (const qty of Object.values(item.stocks)) {
      total += Number(qty) || 0;
    }
    return total;
  };

  const getPurchaseTotal = (item: IncomeItem) => {
    const price = Number(item.purchasePrice) || 0;
    return price * getTotalQuantity(item);
  };

  const grandTotal = props.items.reduce((sum, item) => sum + getPurchaseTotal(item), 0);

  return (
    <FormSection title="Добавленный товар">
      {props.items.length === 0 ? (
        <p className={styles.emptyText}>
          Нет добавленных товаров. Используйте поиск или каталог, чтобы добавить товары.
        </p>
      ) : (
        <div className={styles.wrapper}>
          <div className={styles.table}>
            <div className={styles.header}>
              <div className={styles.headerLine}>
                <div className={styles.headerCell}>
                  <span className={styles.headerCellText}>Название</span>
                </div>
                <div className={styles.headerCell}>
                  <span className={styles.headerCellText}>Штрих-код</span>
                </div>
                <div className={styles.headerCell}>
                  <span className={styles.headerCellText}>Количество</span>
                </div>
                <div className={styles.headerCell}></div>
              </div>
            </div>

            <div>
              {props.items.map((item) => (
                <div key={item.tempId} className={styles.dataRow}>
                  <div className={styles.dataCell}>
                    <span className={styles.cellName}>{item.name}</span>
                  </div>
                  <div className={styles.dataCell}>
                    <span className={styles.cellCode}>{item.code || "—"}</span>
                  </div>
                  <div className={styles.dataCell}>{getTotalQuantity(item)} шт.</div>
                  <div className={styles.dataCell}>
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() => props.onDeleteItem(item.tempId)}
                      title="Удалить"
                    >
                      <DeleteSvg fill="#727280" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.footer}>
            <span className={styles.grandTotal}>
              Всего: {props.items.length} позиций на сумму {grandTotal.toLocaleString()} ₽
            </span>
            <Button
              size="sm"
              variant="solid"
              variantColor="green"
              disabled={props.isSubmitting}
              onClick={props.onSubmit}
            >
              Оформить
            </Button>
          </div>
        </div>
      )}
    </FormSection>
  );
};

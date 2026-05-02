import { DeleteSvg } from "@/app/category/components/category-item/svg/DeleteSvg";
import { EditSvg } from "@/app/category/components/category-item/svg/EditSvg";
import { Details } from "@/shared/ui/details/Details";
import type { EditableTableDataItem } from "./EditableTable";
import styles from "./EditableTableMobile.module.css";

interface Props {
  data: EditableTableDataItem[][];
  headerRowLabels: string[];
  onBlurInputAction: (rowId: number, cellId: number, value: string) => void;
  onEditAction?: (id: number) => void;
  onDeleteAction?: (id: number) => void;
}

export const EditableTableMobile = (props: Props) => {
  return (
    <div className={styles.container}>
      {props.data.map((row, rowIndex) => {
        const labelCell = row.find((cell) => cell.type === "label");
        const actionCell = row.find((cell) => cell.type === "action");
        const inputCells = row.filter((cell) => cell.type === "input");

        return (
          <Details
            key={rowIndex}
            titleAfterOpen={`${props.headerRowLabels[0]} ${labelCell?.value || ""}`}
            headerContent={
              <div className={styles.cardHeader}>
                <p className={styles.cardHeaderLabel}>
                  {`${props.headerRowLabels[0]} ${labelCell?.value || ""}`}
                </p>
              </div>
            }
            content={
              <div className={styles.cardBody}>
                {inputCells.map((cell, cellIndex) => {
                  const headerLabelIndex = 2 + cellIndex;
                  const headerLabel = props.headerRowLabels[headerLabelIndex] || "---";

                  return (
                    <div key={cellIndex} className={styles.inputRow}>
                      <span className={styles.inputLabel}>{headerLabel}</span>
                      <div className={styles.inputValue}>
                        <input
                          onBlur={(e) =>
                            cell.columnId &&
                            cell.rowId &&
                            props.onBlurInputAction(cell.rowId, cell.columnId, e.target.value)
                          }
                          className={styles.cellInput}
                          defaultValue={cell.value}
                          type="number"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            }
            actions={
              actionCell &&
              (props.onEditAction || props.onDeleteAction) && (
                <>
                  {props.onEditAction && (
                    <button
                      type="button"
                      onClick={() => props.onEditAction?.(actionCell.rowId)}
                      aria-label="Редактировать"
                    >
                      <EditSvg />
                    </button>
                  )}
                  {props.onDeleteAction && (
                    <button
                      type="button"
                      onClick={() => props.onDeleteAction?.(actionCell.rowId)}
                      aria-label="Удалить"
                    >
                      <DeleteSvg />
                    </button>
                  )}
                </>
              )
            }
          />
        );
      })}
    </div>
  );
};

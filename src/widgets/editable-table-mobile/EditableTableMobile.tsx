import { DeleteSvg } from "@/app/category/components/category-item/svg/DeleteSvg";
import { EditSvg } from "@/app/category/components/category-item/svg/EditSvg";
import { Details } from "@/shared/ui/details/Details";
import type { EditableTableDataItem } from "../editable-table/EditableTable";
import styles from "./EditableTableMobile.module.css";

interface Props {
  data: EditableTableDataItem[][];
  headerRowLabels: string[];
  onBlurInputAction: (rowId: number, cellId: number, value: string) => void;
  onEditAction?: (id: number) => void;
  onDeleteAction?: (id: number) => void;
  label: string;
  labelValueIndex: number;
}

export const EditableTableMobile = (props: Props) => {
  return (
    <div className={styles.container}>
      {props.data.map((row, rowIndex) => (
        <Details
          key={row[rowIndex].rowId}
          titleAfterOpen={`${props.label} ${row[props.labelValueIndex].value || ""}`}
          headerContent={
            <div className={styles.cardHeader}>
              <p
                className={styles.cardHeaderLabel}
              >{`${props.label} ${row[props.labelValueIndex].value || ""}`}</p>
            </div>
          }
          content={
            <ul className={styles.cardBody}>
              {row.map((cell, cellIndex) => (
                <li
                  key={`${cell.columnId}_${props.headerRowLabels[cellIndex]}`}
                  style={{ display: cell.type === "input" ? "grid" : "none" }}
                  className={styles.inputRow}
                >
                  <span className={styles.inputLabel}>{props.headerRowLabels[cellIndex]}</span>

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
                </li>
              ))}
            </ul>
          }
          actions={
            <>
              {props.onEditAction && (
                <button
                  type="button"
                  onClick={() => props.onEditAction?.(row[0].rowId)}
                  aria-label="Редактировать"
                >
                  <EditSvg />
                </button>
              )}
              {props.onDeleteAction && (
                <button
                  type="button"
                  onClick={() => props.onDeleteAction?.(row[0].rowId)}
                  aria-label="Удалить"
                >
                  <DeleteSvg />
                </button>
              )}
            </>
          }
        />
      ))}
    </div>
  );
};

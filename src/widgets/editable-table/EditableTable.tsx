import { DeleteSvg } from "@/app/category/components/category-item/svg/DeleteSvg";
import { EditSvg } from "@/app/category/components/category-item/svg/EditSvg";
import styles from "./EditableTable.module.css";

export type EditableTableDataItem = {
  value: string;
  type: "label" | "action" | "input";
  rowId: number;
  columnId: number | null;
};

interface Props {
  data: EditableTableDataItem[][];
  headerRowLabels: string[];
  gridTemplateColumns: string;
  onEditAction?: (id: number) => void;
  onDeleteAction?: (id: number) => void;
  onBlurInputAction: (rowId: number, cellId: number, value: string) => void;
  variant?: "stickyFirstColumn" | "stickyTwoFirstColumn";
}

export const EditableTable = (props: Props) => {
  const firstColumnWidth = props.gridTemplateColumns.split(" ")[0];
  const secondColumnWidth = props.gridTemplateColumns.split(" ")[1];
  const isHasAction = props.data[0].find((el) => el.type === "action");

  return (
    <table
      className={`${styles.table} ${props.variant ? styles[props.variant] : ""}`}
      style={
        {
          "--first-col-width": firstColumnWidth,
          "--second-col-width": secondColumnWidth,
        } as React.CSSProperties
      }
    >
      <thead className={styles.header}>
        <tr
          style={{ gridTemplateColumns: props.gridTemplateColumns }}
          className={`${styles.headerLine} ${isHasAction ? styles.hasAction : ""}`}
        >
          {props.headerRowLabels.map((el) => (
            <th key={el} className={styles.headerCell}>
              <p className={styles.textOverflowLine}>{el}</p>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.data.map((itemRow, indexRow) => (
          <tr
            style={{ gridTemplateColumns: props.gridTemplateColumns }}
            key={itemRow[indexRow].rowId}
            className={styles.dataRow}
          >
            {itemRow.map((cell, indexCell) => (
              <td
                key={`${itemRow[indexRow].rowId}_${cell.columnId}_${cell.rowId}_${props.headerRowLabels[indexCell]}`}
                className={`${styles.dataCell} ${cell.type === "action" ? styles.dataCellAction : ""}  ${cell.type === "input" ? styles.dataCellInput : ""}`}
              >
                {cell.type === "label" && <p className={styles.textOverflowLine}>{cell.value}</p>}
                {cell.type === "action" && (props.onEditAction || props.onDeleteAction) && (
                  <>
                    <button type="button" onClick={() => props.onEditAction?.(cell.rowId)}>
                      <EditSvg />
                    </button>
                    <button type="button" onClick={() => props.onDeleteAction?.(cell.rowId)}>
                      <DeleteSvg />
                    </button>
                  </>
                )}

                {cell.type === "input" && (
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
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

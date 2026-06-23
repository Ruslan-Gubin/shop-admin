"use client";
import { DeleteSvg } from "@/app/category/components/category-item/svg/DeleteSvg";
import { EditSvg } from "@/app/category/components/category-item/svg/EditSvg";
import { Badge } from "@/shared/ui/badge/Badge";
import styles from "./MainTable.module.css";

type CellType = "date" | "shortDate" | "boolean" | "badge" | "avatar" | "translate";

export type RenderTableOptions<T> = {
  key: keyof T;
  nextKey?: string;
  type?: CellType;
  typeConfig?: {
    booleanLabels?: string[];
    translateMap?: Record<string, string>;
  };
};

const shortDateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

interface Props<T> {
  data: T[];
  onEditAction?: (item: T) => void;
  onDeleteAction?: (id: number) => void;
  stickyFirstColumn?: boolean;
  stickyActionColumn?: boolean;
  headerRowLabels: string[];
  gridTemplateColumns: string;
  tableOptions: RenderTableOptions<T>[];
}

export const MainTable = <T extends { id: number }>(props: Props<T>) => {
  const isHasAction = !!props.onEditAction || !!props.onDeleteAction;

  return (
    <table
      className={`${styles.table} ${props.stickyActionColumn ? styles.stickyActionColumn : ""} ${props.stickyFirstColumn ? styles.stickyFirstColumn : ""}`}
    >
      <thead className={styles.header}>
        <tr
          style={{ gridTemplateColumns: props.gridTemplateColumns }}
          className={styles.headerLine}
        >
          {props.headerRowLabels.map((el) => (
            <th key={el} className={styles.headerCell}>
              <p className={styles.textOverflowLine}>{el}</p>
            </th>
          ))}
          {isHasAction && <th className={styles.headerCell}></th>}
        </tr>
      </thead>
      <tbody>
        {props.data.map((item) => (
          <tr
            style={{ gridTemplateColumns: props.gridTemplateColumns }}
            key={item.id}
            className={styles.dataRow}
          >
            {props.tableOptions.map((cell) => (
              <td
                key={`${cell.key as string} ${cell.nextKey as string}`}
                className={styles.dataCell}
              >
                {!cell.type && typeof cell.key === "string" && (
                  <p className={styles.textOverflowLine}>
                    {cell.nextKey
                      ? (item[cell.key][cell.nextKey] as string) || "---"
                      : (item[cell.key] as string) || "---"}
                  </p>
                )}

                {cell.type === "translate" &&
                  cell.typeConfig?.translateMap &&
                  typeof item[cell.key] === "string" && (
                    <p className={styles.textOverflowLine}>
                      {cell.typeConfig.translateMap[item[cell.key] as string] || "---"}
                    </p>
                  )}

                {cell.type === "date" && typeof item[cell.key] === "string" && (
                  <p className={styles.textOverflowLine}>
                    {item[cell.key] ? new Date(item[cell.key] as string).toLocaleString() : "---"}
                  </p>
                )}

                {cell.type === "shortDate" && typeof item[cell.key] === "string" && (
                  <p className={styles.textOverflowLine}>
                    {item[cell.key]
                      ? shortDateFormat.format(new Date(item[cell.key] as string))
                      : "---"}
                  </p>
                )}

                {cell.type === "boolean" &&
                  typeof item[cell.key] === "boolean" &&
                  cell.typeConfig &&
                  Array.isArray(cell.typeConfig.booleanLabels) && (
                    <Badge variant={item[cell.key] ? "active" : "error"}>
                      {item[cell.key]
                        ? cell.typeConfig.booleanLabels[0]
                        : cell.typeConfig.booleanLabels[1]}
                    </Badge>
                  )}

                {cell.type === "avatar" && typeof item[cell.key] === "string" && (
                  <img className={styles.avatar} src={item[cell.key] as string} alt="Avatar" />
                )}
              </td>
            ))}
            {isHasAction && (
              <td className={styles.actionButtons}>
                <button
                  className={!props.onEditAction ? styles.buttonHidden : ""}
                  type="button"
                  onClick={() => props.onEditAction?.(item)}
                >
                  <EditSvg fill="#727280" />
                </button>
                <button
                  className={!props.onDeleteAction ? styles.buttonHidden : ""}
                  type="button"
                  onClick={() => props.onDeleteAction?.(item.id)}
                >
                  <DeleteSvg fill="#727280" />
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

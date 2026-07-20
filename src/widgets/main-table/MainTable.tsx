"use client";
import { Badge } from "@/shared/ui/badge/Badge";
import { ActionsMenu } from "../actions-menu/ActionsMenu";
import styles from "./MainTable.module.css";

type CellType = "date" | "shortDate" | "boolean" | "badge" | "avatar" | "translate" | "status";

export type RenderTableOptions<T> = {
  key: keyof T;
  nextKey?: string;
  type?: CellType;
  typeConfig?: {
    booleanLabels?: string[];
    translateMap?: Record<string, string>;
    status?: { key: string; value: string };
  };
};

const shortDateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

interface Props<T> {
  data: T[];
  stickyFirstColumn?: boolean;
  stickyActionColumn?: boolean;
  headerRowLabels: string[];
  gridTemplateColumns: string;
  tableOptions: RenderTableOptions<T>[];
  actions?: { label: string; action: (item: T) => void }[];
}

export const MainTable = <T extends { id: number }>(props: Props<T>) => {
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
          {props.actions && <th className={styles.headerCell}></th>}
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

                {cell.key && cell.type === "status" && cell?.typeConfig?.status && (
                  <p
                    className={`${styles.textOverflowLine} ${styles[`status_${item[cell.key][cell.typeConfig.status.key]}`]}`}
                  >
                    {item[cell.key][cell.typeConfig.status.value]}
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
            {props.actions && (
              <td className={styles.actionButtons}>
                <ActionsMenu actions={props.actions} item={item} />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

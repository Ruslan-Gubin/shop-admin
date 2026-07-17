import { priceFormatter } from "@/shared/helpers/formatPrice";
import type { MenuOptionItem } from "@/shared/services/canvas/types";
import { GraphLine } from "@/widgets/graph/graph-line/GraphLine";
import styles from "./SalesChart.module.css";

type Props = {
  lines: {
    color: string;
    title: string;
    values: number[];
  }[];
  countLines: string[];
  showGraph: boolean;
  menuOptions: MenuOptionItem[];
};

export const SalesChart = (props: Props) => {
  return (
    <section className={styles.rootWrapper}>
      <ul className={styles.linesList}>
        {props.lines.map((line) => (
          <li key={line.color} className={styles.linesItem}>
            <div className={styles.lineColor} style={{ backgroundColor: line.color }}></div>
            <div className={styles.linesLabel}>
              {line.title} {priceFormatter.format(line.values.reduce((acc, el) => acc + el, 0))}
            </div>
          </li>
        ))}
      </ul>

      {props.showGraph && (
        <div className={styles.graphWrapper}>
          <div className={styles.graphContainer}>
            <GraphLine
              menuOptions={props.menuOptions}
              statisticLines={props.lines.map((line) => line.values)}
              colorsList={props.lines.map((line) => line.color)}
            />
            <ul className={styles.countList}>
              {props.countLines.map((count) => (
                <li key={count} className={styles.countListItem}>
                  {count}
                </li>
              ))}
            </ul>
          </div>

          <ul className={styles.graphDatesLine}>
            {props.lines[0].values.map((item, index) => (
              <li key={`${item}+${index}`} className={styles.dateItem}>
                <span className={styles.dateItemValue}>{index + 1}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

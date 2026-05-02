import { BirdSelectIcon } from "@/views/LayoutLeftSide/NavigateMenu/svg/BirdSelectIcon";
import styles from "./Details.module.css";

type Props = {
  headerContent: React.ReactNode;
  titleAfterOpen?: string;
  content: React.ReactNode;
  actions: React.ReactNode;
};

export const Details = (props: Props) => {
  return (
    <div className={styles.root}>
      <details className={styles.details}>
        <summary className={styles.summary}>
          <div className={styles.summaryLeftSide}>
            <div className={styles.birdContainer}>
              <BirdSelectIcon className={styles.navigateMenuItemSvg} />
            </div>
            <div className={styles.header}>
              <div className={styles.headerContent}>{props.headerContent}</div>
              {props.titleAfterOpen && (
                <p className={styles.titleAfterOpen}>{props.titleAfterOpen}</p>
              )}
            </div>
          </div>
          <div className={styles.cardActions}>{props.actions}</div>
        </summary>
      </details>
      <div role="definition" id="pure-css" className={styles.content}>
        {props.content}
      </div>
    </div>
  );
};

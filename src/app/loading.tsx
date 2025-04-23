import { LoadigSvg } from "@/shared/svg/LoadigSvg";
import styles from "./styles/pages/Loading.module.scss";

export default function Loading() {
  return (
    <div className={styles.loadingWrapper}>
      <div className={styles.centerContent}>
        <div className={styles.loadingSvgContainer}>
          <LoadigSvg />
        </div>
        <p className={styles.loadingText}>Загрузка</p>
      </div>
    </div>
  );
}

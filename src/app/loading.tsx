import { LoadingSvg } from "@/shared/svg/LoadingSvg";
import styles from "./styles/Loading.module.css";

export default function Loading() {
  return (
    <div className={styles.loadingWrapper}>
      <div className={styles.centerContent}>
        <div className={styles.loadingSvgContainer}>
          <LoadingSvg />
        </div>
        <p className={styles.loadingText}>Загрузка</p>
      </div>
    </div>
  );
}

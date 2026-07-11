import Link from "next/link";
import styles from "./TransferRoute.module.css";

type Props = {
  type: "transfer" | "delivery";
  fromWarehouseName: string;
  toWarehouseName: string;
  href: string;
};

export const TransferRoute = ({ type, fromWarehouseName, toWarehouseName, href }: Props) => {
  return (
    <div className={styles.route}>
      <Link href={href} className={styles.link}>
        <span>{type === "delivery" ? "🚚" : "📦"}</span>
        <span className={styles.name}>{fromWarehouseName}</span>
        <span className={styles.arrow}>→</span>
        <span className={styles.name}>{type === "delivery" ? "Курьером" : toWarehouseName}</span>
      </Link>
    </div>
  );
};

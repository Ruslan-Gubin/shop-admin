import Link from "next/link";
import { WidgetWrapper } from "../WidgetWrapper/WidgetWrapper";
import styles from "./ActiveTransfers.module.css";

export type ActiveTransferItem = {
  id: number;
  type: "transfer" | "delivery";
  from_warehouse_name: string;
  to_warehouse_name: string | null;
  to_address_formatted: string | null;
  created_at: string;
};

type Props = {
  transfers: ActiveTransferItem[];
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const typeLabels: Record<string, string> = {
  transfer: "Перемещение",
  delivery: "Доставка",
};

export const ActiveTransfers = ({ transfers }: Props) => {
  if (transfers.length === 0) return null;

  return (
    <WidgetWrapper
      title="Активные перемещения"
      linkHref="/transfer"
      linkLabel="Все перемещения"
    >
      <div className={styles.list}>
        {transfers.map((t) => (
          <Link
            key={t.id}
            href={`/transfer/info/${t.id}`}
            className={styles.item}
          >
            <span
              className={`${styles.typeBadge} ${
                t.type === "transfer" ? styles.typeTransfer : styles.typeDelivery
              }`}
            >
              {typeLabels[t.type]}
            </span>
            <span className={styles.route}>
              {t.from_warehouse_name}
              <span className={styles.arrow}>→</span>
              {t.type === "delivery"
                ? t.to_address_formatted ?? "Адрес не указан"
                : t.to_warehouse_name ?? "Не указан"}
            </span>
            <span className={styles.date}>{formatDate(t.created_at)}</span>
          </Link>
        ))}
      </div>
    </WidgetWrapper>
  );
};

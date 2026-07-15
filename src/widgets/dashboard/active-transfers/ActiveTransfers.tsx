import Link from "next/link";
import type { TransferModel } from "@/app/transfer/action";
import { WidgetWrapper } from "../WidgetWrapper/WidgetWrapper";
import styles from "./ActiveTransfers.module.css";

type Props = {
  transfers: TransferModel[];
};

export const ActiveTransfers = (props: Props) => {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
  };

  const typeLabels: Record<string, string> = {
    transfer: "Перемещение",
    delivery: "Доставка",
  };

  return (
    <WidgetWrapper title="Активные перемещения" linkHref="/transfer" linkLabel="Все перемещения">
      <ul className={styles.list}>
        {props.transfers.map((transfer) => (
          <Link key={transfer.id} href={`/transfer/info/${transfer.id}`} className={styles.item}>
            <span
              className={`${styles.typeBadge} ${
                transfer.type === "transfer" ? styles.typeTransfer : styles.typeDelivery
              }`}
            >
              {typeLabels[transfer.type]}
            </span>
            <span className={styles.route}>
              {transfer.from_warehouse?.name || "-/-"}
              <span className={styles.arrow}>→</span>
              {transfer.type === "delivery"
                ? (transfer.to_address?.name ?? "Адрес не указан")
                : (transfer.to_warehouse?.name ?? "Не указан")}
            </span>
            <span className={styles.date}>{formatDate(transfer.created_at)}</span>
          </Link>
        ))}
      </ul>
    </WidgetWrapper>
  );
};

import Link from "next/link";
import type { OrderProductModel } from "@/app/orders/edit/[id]/action";
import type { TransferModel, TransferStatus } from "@/app/transfer/action";
import { buildAddressString } from "@/shared/helpers/buildAddressString";
import { priceFormatter } from "@/shared/helpers/formatPrice";
import {
  transferStatusTranslations,
  transferTypeTranslations,
} from "@/shared/translate/transform-translate";
import { Button } from "@/shared/ui/button-main/Button";
import { FormSection } from "@/widgets/form-section/FormSection";
import styles from "./TransferInfo.module.css";

type Props = {
  transfer: TransferModel;
  products: OrderProductModel[];
};

export const TransferInfo = (props: Props) => {
  const fromId = props.transfer.from_warehouse?.id;
  const isDelivery = props.transfer.type === "delivery";

  let totalQuantity = 0;
  let totalSum = 0;
  let totalWeight = 0;
  const quantityMap: Record<number, number> = {};
  const showProducts: OrderProductModel[] = [];

  for (const product of props.products) {
    const sources = isDelivery
      ? product.reservations
      : product.transfers.length > 0
        ? product.transfers
        : product.reservations;

    let hasMatch = false;

    for (const source of sources) {
      if (source.warehouse_id === fromId) {
        totalQuantity += source.quantity;
        totalSum += product.price * source.quantity;
        totalWeight += (product.weight || 0) * source.quantity;
        quantityMap[product.id] = source.quantity;
        hasMatch = true;
      }
    }

    if (hasMatch) {
      showProducts.push(product);
    }
  }

  const routeTitle = `${isDelivery ? "🚚" : "📦"} ${props.transfer.from_warehouse?.name || "—"} → ${isDelivery ? "Курьером" : props.transfer.to_warehouse?.name || "—"}`;

  const formatTravelTime = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 0 && minutes > 0) return `${hours} ч ${minutes} мин`;
    if (hours > 0) return `${hours} ч`;
    return `${minutes} мин`;
  };

  const statusClass: Record<TransferStatus, string> = {
    completed: styles.statusCompleted,
    processing: styles.statusActive,
    rejected: styles.statusCancelled,
  };

  return (
    <div className={styles.root}>
      <FormSection title={routeTitle}>
        <div className={styles.mainContentContainer}>
          <p className={styles.fieldValue}>
            <span className={styles.fieldLabel}>Статус перемещения: </span>
            <span className={statusClass[props.transfer.status]}>
              {transferStatusTranslations[props.transfer.status]}
            </span>
          </p>

          <p className={styles.fieldValue}>
            <span className={styles.fieldLabel}>Тип: </span>
            {transferTypeTranslations[props.transfer.type]}
          </p>

          <p className={styles.fieldValue}>
            <span className={styles.fieldLabel}>Откуда: </span>
            {props.transfer.from_warehouse?.name || "—"}
          </p>

          {props.transfer.from_warehouse?.address && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Адрес склада отправителя: </span>
              {buildAddressString(props.transfer.from_warehouse.address)}
            </p>
          )}

          {isDelivery && props.transfer.to_address && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Куда: </span>
              {buildAddressString(props.transfer.to_address)}
            </p>
          )}

          {!isDelivery && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Куда: </span>
              {props.transfer.to_warehouse?.name || "—"}
            </p>
          )}

          {!isDelivery && props.transfer.to_warehouse?.address && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Адрес склада получателя: </span>
              {buildAddressString(props.transfer.to_warehouse.address)}
            </p>
          )}

          {props.transfer.created_at && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Дата создания: </span>
              {new Date(props.transfer.created_at).toLocaleString("ru-RU")}
            </p>
          )}

          {props.transfer.updated_at && (
            <p className={styles.fieldValue}>
              <span className={styles.fieldLabel}>Дата обновления: </span>
              {new Date(props.transfer.updated_at).toLocaleString("ru-RU")}
            </p>
          )}

          {props.transfer.status === "completed" &&
            props.transfer.created_at &&
            props.transfer.updated_at && (
              <p className={styles.fieldValue}>
                <span className={styles.fieldLabel}>Время в пути: </span>
                {formatTravelTime(props.transfer.created_at, props.transfer.updated_at)}
              </p>
            )}

          {showProducts.length > 0 && (
            <>
              <p className={styles.fieldValue}>
                <span className={styles.fieldLabel}>Количество позиций: </span>
                {showProducts.length}
              </p>

              {totalQuantity > 0 && (
                <p className={styles.fieldValue}>
                  <span className={styles.fieldLabel}>Количество товаров: </span>
                  {totalQuantity} шт
                </p>
              )}

              {totalSum > 0 && (
                <p className={styles.fieldValue}>
                  <span className={styles.fieldLabel}>Общая сумма: </span>
                  {priceFormatter.format(totalSum)}
                </p>
              )}

              {totalWeight > 0 && (
                <p className={styles.fieldValue}>
                  <span className={styles.fieldLabel}>Общий вес: </span>
                  {(totalWeight / 1000).toLocaleString("ru-RU")} кг
                </p>
              )}
            </>
          )}

          {props.transfer.order_id && (
            <Link
              className={styles.linkBlockInfo}
              style={{ maxWidth: "max-content" }}
              href={`/orders/edit/${props.transfer.order_id}`}
            >
              <Button variant="link" variantColor="blue">
                Относится к заказу
              </Button>
            </Link>
          )}
        </div>
      </FormSection>

      {showProducts.length > 0 && (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <div className={styles.tableRow}>
              <div className={styles.tableHeader}>Товар</div>
              <div className={styles.tableHeader}>Количество</div>
            </div>
          </div>
          <div className={styles.tableBody}>
            {showProducts.map((product) => (
              <div key={product.id} className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <Link href={`/product/info/${product.product_id}`} className={styles.link}>
                    {product.name}
                  </Link>
                </div>
                <div className={styles.tableCell}>{quantityMap[product.id] || 0} шт</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

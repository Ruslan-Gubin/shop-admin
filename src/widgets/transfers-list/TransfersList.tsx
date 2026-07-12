import Link from "next/link";
import type { OrderProductModel } from "@/app/orders/edit/[id]/action";
import { buildAddressString } from "@/shared/helpers/buildAddressString";
import { priceFormatter } from "@/shared/helpers/formatPrice";
import type { TransferModel } from "@/shared/types/transfer";
import { TransferRoute } from "./TransferRoute";
import styles from "./TransfersList.module.css";

type Props = {
  transfers: TransferModel[];
  products: OrderProductModel[];
  baseId: number;
  isCompleted: boolean;
};

export const TransfersList = (props: Props) => {
  const prepareTransferCards = (
    transfers: TransferModel[],
    products: OrderProductModel[],
    baseId: number,
  ) => {
    const transfersList = [];

    for (let i = 0; i < transfers.length; i++) {
      const transfer = transfers[i];
      const fromId = transfer.from_warehouse?.id;
      const isDelivery = transfer.type === "delivery";

      let totalQuantity = 0;
      let totalSum = 0;
      let totalWeight = 0;
      const quantityMap: Record<string, number> = {};

      const showProducts: OrderProductModel[] = [];

      for (let j = 0; j < products.length; j++) {
        const product = products[j];

        if (
          (isDelivery && product.reservations.some((el) => el.warehouse_id === fromId)) ||
          (!isDelivery &&
            product.transfers.length > 0 &&
            product.transfers.some((el) => el.warehouse_id === fromId)) ||
          (!isDelivery &&
            product.transfers.length === 0 &&
            product.reservations.some((el) => el.warehouse_id === fromId))
        ) {
          const sources = isDelivery
            ? product.reservations
            : product.transfers.length > 0
              ? product.transfers
              : product.reservations.filter((el) => el.warehouse_id !== baseId);

          for (let k = 0; k < sources.length; k++) {
            const source = sources[k];

            if (source.warehouse_id === fromId) {
              totalQuantity += source.quantity;
              totalSum += product.price * source.quantity;
              totalWeight += (product.weight || 0) * source.quantity;
              quantityMap[product.id] = source.quantity;
            }
          }
          showProducts.push(product);
        }
      }

      transfersList.push({
        transfer,
        totalQuantity,
        totalSum,
        totalWeight,
        quantityMap,
        showProducts,
      });
    }

    return transfersList;
  };

  const transfersList = prepareTransferCards(props.transfers, props.products, props.baseId);

  return (
    <ul className={styles.list}>
      {transfersList.map((transferItem) => (
        <li key={transferItem.transfer.id} className={styles.card}>
          <header className={styles.cardHeader}>
            <TransferRoute
              fromWarehouseName={transferItem.transfer.from_warehouse?.name || ""}
              toWarehouseName={transferItem.transfer.to_warehouse?.name || ""}
              type={transferItem.transfer.type}
              href={`/transfers/info/${transferItem.transfer.id}`}
            />
            <span className={props.isCompleted ? styles.completedBadge : styles.inTransitBadge}>
              {props.isCompleted ? "Завершен" : "В пути"}
            </span>
          </header>
          <div className={styles.content}>
            {transferItem.transfer.from_warehouse?.address && (
              <span className={styles.address}>
                <span className={styles.addressLabel}>Откуда:</span>{" "}
                {buildAddressString(transferItem.transfer.from_warehouse.address)}
              </span>
            )}
            {transferItem.transfer.type === "transfer" &&
              transferItem.transfer.to_warehouse?.address && (
                <span className={styles.address}>
                  <span className={styles.addressLabel}>Куда:</span>{" "}
                  {buildAddressString(transferItem.transfer.to_warehouse.address)}
                </span>
              )}
            {transferItem.transfer.type === "delivery" && transferItem.transfer.to_address && (
              <span className={styles.address}>
                <span className={styles.addressLabel}>Куда:</span>{" "}
                {buildAddressString(transferItem.transfer.to_address)}
              </span>
            )}

            {transferItem.transfer.updated_at && (
              <span className={styles.address}>
                <span className={styles.addressLabel}>Дата:</span>{" "}
                {new Date(transferItem.transfer.updated_at).toLocaleString("ru-RU")}
              </span>
            )}

            {transferItem.showProducts.length > 0 && (
              <>
                <span className={styles.address}>
                  <span className={styles.addressLabel}>Количество позиций:</span>{" "}
                  {transferItem.showProducts.length}
                </span>
                {transferItem.totalQuantity > 0 && (
                  <span className={styles.address}>
                    <span className={styles.addressLabel}>Количество товаров:</span>{" "}
                    {transferItem.totalQuantity} шт
                  </span>
                )}
                {transferItem.totalSum > 0 && (
                  <span className={styles.address}>
                    <span className={styles.addressLabel}>Общая сумма:</span>{" "}
                    {priceFormatter.format(transferItem.totalSum)}
                  </span>
                )}
                {transferItem.totalWeight > 0 && (
                  <span className={styles.address}>
                    <span className={styles.addressLabel}>Общий вес:</span>{" "}
                    {(transferItem.totalWeight / 1000).toLocaleString("ru-RU")} кг
                  </span>
                )}
              </>
            )}
          </div>

          {transferItem.showProducts.length > 0 && (
            <table className={styles.transferTable}>
              <thead className={styles.transferTableHead}>
                <tr className={styles.transferTableRow}>
                  <th className={styles.transferTableHeader}>Товар</th>
                  <th className={styles.transferTableHeader}>Количество</th>
                </tr>
              </thead>
              <tbody>
                {transferItem.showProducts.map((product) => (
                  <tr key={product.id} className={styles.transferTableRow}>
                    <td className={styles.transferTableCell}>
                      <Link href={`/product/info/${product.product_id}`} className={styles.link}>
                        {product.name}
                      </Link>
                    </td>
                    <td className={styles.transferTableCell}>
                      {transferItem.quantityMap[product.id] || 0} шт
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </li>
      ))}
    </ul>
  );
};

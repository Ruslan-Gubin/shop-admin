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
};

export const TransfersList = (props: Props) => {
  return (
    <ul className={styles.list}>
      {props.transfers.map((transfer) => {
        const fromWarehouseId = transfer.from_warehouse?.id;

        const transferProducts = props.products.filter((product) =>
          product.reservations.some(
            (reservation) =>
              reservation.warehouse_id === fromWarehouseId &&
              reservation.warehouse_id !== props.baseId,
          ),
        );

        const totalQuantity = transferProducts.reduce((sum, product) => {
          const qty = product.reservations.reduce(
            (qty, reservation) =>
              reservation.warehouse_id === fromWarehouseId ? qty + reservation.quantity : qty,
            0,
          );
          return sum + qty;
        }, 0);

        const totalSum = transferProducts.reduce((sum, product) => {
          const qty = product.reservations.reduce(
            (qty, reservation) =>
              reservation.warehouse_id === fromWarehouseId ? qty + reservation.quantity : qty,
            0,
          );
          return sum + product.price * qty;
        }, 0);

        const totalWeight = transferProducts.reduce((sum, product) => {
          const qty = product.reservations.reduce(
            (qty, reservation) =>
              reservation.warehouse_id === fromWarehouseId ? qty + reservation.quantity : qty,
            0,
          );
          return sum + (product.weight || 0) * qty;
        }, 0);

        return (
          <li key={transfer.id} className={styles.card}>
            <header className={styles.cardHeader}>
              <TransferRoute
                fromWarehouseName={transfer.from_warehouse?.name || ""}
                toWarehouseName={transfer.to_warehouse?.name || ""}
                type={transfer.type}
                href={`/transfers/info/${transfer.id}`}
              />
              <span className={styles.cardDate}>
                {new Date(transfer.created_at).toLocaleString("ru-RU")}
              </span>
            </header>
            <div className={styles.content}>
              {transfer.from_warehouse?.address && (
                <span className={styles.address}>
                  <span className={styles.addressLabel}>Откуда:</span>{" "}
                  {buildAddressString(transfer.from_warehouse.address)}
                </span>
              )}
              {transfer.type === "transfer" && transfer.to_warehouse?.address && (
                <span className={styles.address}>
                  <span className={styles.addressLabel}>Куда:</span>{" "}
                  {buildAddressString(transfer.to_warehouse.address)}
                </span>
              )}
              {transfer.type === "delivery" && transfer.to_address && (
                <span className={styles.address}>
                  <span className={styles.addressLabel}>Куда:</span>{" "}
                  {buildAddressString(transfer.to_address)}
                </span>
              )}

              {transferProducts.length > 0 && (
                <>
                  <span className={styles.address}>
                    <span className={styles.addressLabel}>Количество позиций:</span>{" "}
                    {transferProducts.length}
                  </span>
                  {totalQuantity > 0 && (
                    <span className={styles.address}>
                      <span className={styles.addressLabel}>Количество товаров:</span>{" "}
                      {totalQuantity} шт
                    </span>
                  )}
                  {totalSum > 0 && (
                    <span className={styles.address}>
                      <span className={styles.addressLabel}>Общая сумма:</span>{" "}
                      {priceFormatter.format(totalSum)}
                    </span>
                  )}
                  {totalWeight > 0 && (
                    <span className={styles.address}>
                      <span className={styles.addressLabel}>Общий вес:</span>{" "}
                      {(totalWeight / 1000).toLocaleString("ru-RU")} кг
                    </span>
                  )}
                </>
              )}
            </div>

            {transferProducts.length > 0 && (
              <table className={styles.transferTable}>
                <thead className={styles.transferTableHead}>
                  <tr className={styles.transferTableRow}>
                    <th className={styles.transferTableHeader}>Товар</th>
                    <th className={styles.transferTableHeader}>Количество</th>
                  </tr>
                </thead>
                <tbody>
                  {transferProducts.map((product) => {
                    const quantity = product.reservations.reduce(
                      (sum, reservation) =>
                        reservation.warehouse_id === fromWarehouseId
                          ? sum + reservation.quantity
                          : sum,
                      0,
                    );

                    return (
                      <tr key={product.id} className={styles.transferTableRow}>
                        <td className={styles.transferTableCell}>
                          <Link
                            href={`/product/info/${product.product_id}`}
                            className={styles.link}
                          >
                            {product.name}
                          </Link>
                        </td>
                        <td className={styles.transferTableCell}>{quantity} шт</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </li>
        );
      })}
    </ul>
  );
};

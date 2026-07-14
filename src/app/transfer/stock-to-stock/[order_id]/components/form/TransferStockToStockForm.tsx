"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { OrderReservation } from "@/app/orders/edit/[id]/action";
import type { ProductStockModel } from "@/app/warehouses/action";
import type { ResponseData } from "@/shared/types/response";
import { Button } from "@/shared/ui/button-main/Button";
import { Modal } from "@/shared/ui/modal/Modal";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalFooter } from "@/shared/ui/modal/modal-footer/ModalFooter";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { CreateTransferOrderToOrderPayload } from "../../action";
import styles from "./TransferStockToStockForm.module.css";

type OrderProductItem = {
  id: number;
  name: string;
  needInOrderCount: number;
  readyInBaseWarehouseCount: number;
  needReservationCount: number;
  stocks: ProductStockModel[];
  maxStocks: Record<string, number | undefined>;
  baseReservation: OrderReservation | null | undefined;
};

type Props = {
  baseId: number;
  orderProductList: OrderProductItem[];
  initValues: Record<string, string>;
  order_id: string;
  createTransferOrderToOrderAction: (
    payload: CreateTransferOrderToOrderPayload,
  ) => Promise<ResponseData<null>>;
};

export const TransferStockToStockForm = (props: Props) => {
  const router = useRouter();
  const [disabled, transition] = useTransition();
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [values, setValues] = useState<Record<string, string>>(
    props.initValues ? props.initValues : {},
  );

  const handleChangeQuantity = (value: string, key: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleBlurInput = (value: string, key: number, maxStocks: number | undefined) => {
    const valueNum = Number(value);
    let changeValue: string = "";

    const normalized = String(valueNum);

    if (normalized !== value) {
      changeValue = normalized;
    }

    if (valueNum < 0) {
      changeValue = "0";
    }

    if (maxStocks && valueNum > maxStocks) {
      changeValue = String(maxStocks);
    }

    if (changeValue.length > 0) {
      setValues((prev) => ({ ...prev, [key]: changeValue }));
    }
  };

  const submitTransfer = () => {
    transition(() => {
      const transfers: {
        type: string;
        order_id: number;
        from_warehouse_id: number;
        to_warehouse_id: number;
      }[] = [];

      const orderProducts: {
        id: number;
        reservations: OrderReservation[];
      }[] = [];

      for (let i = 0; i < props.orderProductList.length; i++) {
        const product = props.orderProductList[i];
        const reservations: OrderReservation[] = [];

        if (product.baseReservation) {
          reservations.push(product.baseReservation);
        }

        for (let j = 0; j < product.stocks.length; j++) {
          const stock = product.stocks[j];
          const currentQuantity = values[stock.id] ? Number(values[stock.id]) : 0;

          if (currentQuantity) {
            reservations.push({
              quantity: currentQuantity,
              stock_id: stock.id,
              warehouse_id: stock.warehouse.id,
            });

            if (!transfers.some((el) => el.from_warehouse_id === stock.warehouse.id)) {
              transfers.push({
                type: "transfer",
                order_id: Number(props.order_id),
                from_warehouse_id: stock.warehouse.id,
                to_warehouse_id: props.baseId,
              });
            }
          }
        }
        orderProducts.push({
          id: product.id,
          reservations,
        });
      }
      const payload = { transfers, reservations: orderProducts };
      props
        .createTransferOrderToOrderAction(payload)
        .then((response) => {
          notificationAdapter.add(response.message, response.status);
          if (response.status === "success") {
            router.push(`/orders/edit/${props.order_id}`);
          }
        })
        .finally(() => setShowConfirmModal(false));
    });
  };

  const hasError = () => {
    let error = false;

    for (const product of props.orderProductList) {
      const totalSelected = product.stocks.reduce(
        (sum, stock) => sum + Number(values[stock.id] || 0),
        0,
      );
      if (totalSelected !== product.needReservationCount) {
        error = true;
        break;
      }
    }

    return error;
  };

  const isValidForm = !hasError();

  return (
    <>
      <Modal active={showConfirmModal} handleCloseAction={() => setShowConfirmModal(false)}>
        <ModalContent>
          <ModalHeader
            title="Вы уверены, что хотите сформировать перемещение?"
            onClose={() => setShowConfirmModal(false)}
          />
          <ModalFooter
            cancelAction={{ action: () => setShowConfirmModal(false) }}
            submitAction={{ action: submitTransfer, disabled }}
          />
        </ModalContent>
      </Modal>
      <ul className={styles.productsList}>
        {props.orderProductList
          .filter((el) => el.needReservationCount > 0)
          .map((product) => {
            const totalSelected = product.stocks.reduce(
              (sum, stock) => sum + Number(values[stock.id] || 0),
              0,
            );
            const isError = totalSelected !== product.needReservationCount;

            return (
              <li
                className={`${styles.productsItem} ${isError ? styles.productsItemError : ""}`}
                key={product.id}
              >
                <header>
                  <Link href={`/product/info/${product.id}`}>
                    <Button variant="link" variantColor="blue">
                      {product.name}
                    </Button>
                  </Link>
                </header>
                <div className={styles.countInfo}>
                  <span className={styles.needTransferText}>
                    Всего в заказе: {product.needInOrderCount} шт.
                  </span>
                  <span className={styles.needTransferText}>
                    На базовом складе: {product.readyInBaseWarehouseCount} шт.
                  </span>

                  <span className={styles.needTransferText}>
                    К перемещению: {product.needReservationCount} шт.
                  </span>
                </div>

                <div className={styles.separator}>
                  <h3>{"Остатки"}</h3>
                  <span
                    className={`${styles.counter} ${isError ? styles.counterError : styles.counterOk}`}
                  >
                    {totalSelected} / {product.needReservationCount}
                  </span>
                </div>

                <table className={styles.table}>
                  <thead className={styles.header}>
                    <tr className={styles.headerLine}>
                      <th className={styles.headerCell}>
                        <span className={styles.headerCellText}>Склад</span>
                      </th>
                      <th className={styles.headerCell}>
                        <span className={styles.headerCellText}>Доступно</span>
                      </th>
                      <th className={styles.headerCell}>
                        <span className={styles.headerCellText}>К перемещению</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.stocks.map((stock) => (
                      <tr key={stock.id} className={styles.dataRow}>
                        <td className={styles.dataCell}>
                          <Link
                            href={`/warehouses/edit/${stock.warehouse.id}`}
                            className={styles.link}
                          >
                            {stock.warehouse.name}
                          </Link>
                        </td>
                        <td className={styles.dataCell}>
                          <span>
                            {typeof product.maxStocks[stock.id] === "number"
                              ? product.maxStocks[stock.id]
                              : "∞"}
                          </span>
                        </td>
                        <td className={styles.dataCell}>
                          <input
                            onBlur={(e) =>
                              handleBlurInput(e.target.value, stock.id, product.maxStocks[stock.id])
                            }
                            onChange={(e) => handleChangeQuantity(e.target.value, stock.id)}
                            value={values[stock.id] || ""}
                            className={styles.cellInput}
                            type="number"
                            min={0}
                            max={product.maxStocks[stock.id]}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </li>
            );
          })}
      </ul>
      <footer className={styles.footer}>
        <Button
          onClick={() => setShowConfirmModal(true)}
          disabled={disabled || !isValidForm}
          variant="solid"
          variantColor="green"
          size="md"
        >
          Сформировать перемещение
        </Button>
      </footer>
    </>
  );
};

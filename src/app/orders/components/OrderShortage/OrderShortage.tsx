import { useState, useTransition } from "react";
import type { WarehouseModel } from "@/app/warehouses/action";
import type { ResponseData } from "@/shared/types/response";
import { Button } from "@/shared/ui/button-main/Button";
import { Modal } from "@/shared/ui/modal/Modal";
import { ModalBody } from "@/shared/ui/modal/modal-body/ModalBody";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalFooter } from "@/shared/ui/modal/modal-footer/ModalFooter";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { OrderProductModel } from "../../edit/[id]/action";
import styles from "./OrderShortage.module.css";

type Props = {
  updateShortageAction: (
    order_id: number,
    payload: { id: number; quantity: number; warehouse_id: number }[],
  ) => Promise<ResponseData<null>>;
  order_id: number;
  products: OrderProductModel[];
  warehouses: WarehouseModel[];
  forcedShortageAction: (id: number) => Promise<ResponseData<null>>;
  isHasShortageStocksProblem: boolean;
};

type ValueItem = {
  value: string;
  warehouse_id: number;
  name: string;
  max: number;
  stock_id: number;
};

export const OrderShortage = (props: Props) => {
  const [disabled, transition] = useTransition();
  const [forcedModalOpen, setForcedModalOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [values, setValues] = useState<Record<string, ValueItem[]>>({});

  const closeModal = () => setIsModalOpen(false);

  const handleOpenModal = () => {
    const updateValues: Record<string, ValueItem[]> = {};

    const warehouseMap = new Map(props.warehouses.map((el) => [el.id, el.name]));

    for (let i = 0; i < props.products.length; i++) {
      const product = props.products[i];
      const reservations = product.reservations;

      updateValues[product.id] = [];

      for (let i = 0; i < reservations.length; i++) {
        const reservation = reservations[i];

        let value =
          typeof reservation.quantity === "number" && !Number.isNaN(reservation.quantity)
            ? String(reservation.quantity)
            : "";

        const shortageStock = product.shortage_stocks.find(
          (el) =>
            el.warehouse_id === reservation.warehouse_id && el.stock_id === reservation.stock_id,
        );

        if (
          shortageStock &&
          typeof shortageStock.quantity === "number" &&
          !Number.isNaN(shortageStock.quantity)
        ) {
          value = String(shortageStock.quantity);
        }

        const name = warehouseMap.get(reservation.warehouse_id);

        updateValues[product.id].push({
          name: name && typeof name === "string" ? name : "",
          warehouse_id: reservation.warehouse_id,
          value,
          max: reservation.quantity,
          stock_id: reservation.stock_id,
        });
      }
    }

    setValues(updateValues);
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    const payload: { id: number; quantity: number; warehouse_id: number; stock_id: number }[] = [];

    for (const key in values) {
      const id = Number(key);

      if (Array.isArray(values[key]) && values[key].length > 0) {
        for (let i = 0; i < values[key].length; i++) {
          const item = values[key][i];
          const quantity = Number(item.value);
          const warehouse_id = Number(item.warehouse_id);
          const stock_id = item.stock_id;
          const hasShortage = props.products.some((el) =>
            el.shortage_stocks.some(
              (el) => el.stock_id === item.stock_id && el.warehouse_id === item.warehouse_id,
            ),
          );

          if (
            !Number.isNaN(id) &&
            id > 0 &&
            !Number.isNaN(quantity) &&
            !Number.isNaN(warehouse_id) &&
            (quantity !== item.max || hasShortage)
          ) {
            payload.push({ id, quantity, warehouse_id, stock_id });
          }
        }
      }
    }

    if (payload.length > 0) {
      transition(() => {
        props
          .updateShortageAction(props.order_id, payload)
          .then((response) => {
            notificationAdapter.add(response.message, response.status);
          })
          .finally(() => {
            closeModal();
          });
      });
    } else {
      closeModal();
    }
  };

  const handleBlurInput = (value: string, key: number, maxStocks: number, warehouse_id: number) => {
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
      setValues((prev) => ({
        ...prev,
        [key]: prev[key].map((el) =>
          el.warehouse_id === warehouse_id ? { ...el, value: changeValue } : el,
        ),
      }));
    }
  };

  const handleChangeQuantity = (value: string, key: number, warehouse_id: number) => {
    setValues((prev) => ({
      ...prev,
      [key]: prev[key].map((el) => (el.warehouse_id === warehouse_id ? { ...el, value } : el)),
    }));
  };

  const handleCloseForcedModal = () => setForcedModalOpen(false);

  const handleForcedSubmit = () => {
    transition(() => {
      props
        .forcedShortageAction(props.order_id)
        .then((response) => {
          notificationAdapter.add(response.message, response.status);
        })
        .finally(() => {
          handleCloseForcedModal();
        });
    });
  };

  return (
    <>
      <Modal active={forcedModalOpen} handleCloseAction={handleCloseForcedModal}>
        <ModalContent>
          <ModalHeader
            title="Принудительное изменение количества"
            onClose={handleCloseForcedModal}
          />
          <ModalBody>
            <span className="modal-subtitle-text">
              Вы хотите принудительно применить изменение количества товара без подтверждения
              клиентом. Рекомендуется связаться с клиентом перед использованием этой функции. После
              подтверждения заказ будет переведён на следующий этап.
            </span>
          </ModalBody>
          <ModalFooter
            cancelAction={{
              text: "Отмена",
              action: handleCloseForcedModal,
            }}
            submitAction={{
              text: "Подтвердить",
              variantColor: "blue",
              disabled,
              action: handleForcedSubmit,
            }}
          />
        </ModalContent>
      </Modal>
      <Modal active={isModalOpen} handleCloseAction={closeModal}>
        <ModalContent width={800}>
          <ModalHeader title={"Изменить количество товаров"} onClose={closeModal} />
          <ModalBody>
            <table className={styles.table}>
              <thead className={styles.header}>
                <tr className={styles.headerLine}>
                  <th className={styles.headerCell}>
                    <span className={styles.headerCellText}>Название</span>
                  </th>
                  <th className={styles.headerCell}>
                    <span className={styles.headerCellText}>Надо</span>
                  </th>
                  <th className={styles.headerCell}>
                    <span className={styles.headerCellText}>Склад</span>
                  </th>
                  <th className={styles.headerCell}>
                    <span className={styles.headerCellText}>Остаток</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {props.products.map((stock) => (
                  <tr key={stock.id} className={styles.dataRow}>
                    <td className={styles.dataCell}>
                      <p>{stock.name}</p>
                    </td>
                    <td className={styles.dataCell}>
                      <p>{stock.quantity}</p>
                    </td>
                    <td className={styles.dataCellStocks}>
                      <ul>
                        {values[stock.id]?.length > 0 &&
                          values[stock.id].map((item) => (
                            <li
                              key={`${item?.name}_${item?.warehouse_id}_${stock.id}`}
                              className={styles.stockItem}
                            >
                              <div className={styles.stockItemCell}>
                                <span className={styles.stockName}>{item?.name || ""}</span>
                              </div>
                              <div className={styles.stockItemCellInput}>
                                <input
                                  onBlur={(e) =>
                                    handleBlurInput(
                                      e.target.value,
                                      stock.id,
                                      item.max,
                                      item.warehouse_id,
                                    )
                                  }
                                  onChange={(e) =>
                                    handleChangeQuantity(
                                      e.target.value,
                                      stock.id,
                                      item.warehouse_id,
                                    )
                                  }
                                  value={item?.value || ""}
                                  className={styles.cellInput}
                                  type="number"
                                  min={0}
                                  max={item.max}
                                />
                              </div>
                            </li>
                          ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ModalBody>
          <ModalFooter
            cancelAction={{
              text: "Закрыть",
              action: closeModal,
            }}
            submitAction={{
              text: "Подтвердить",
              variantColor: "pink",
              disabled,
              action: handleSubmit,
            }}
          />
        </ModalContent>
      </Modal>

      <Button onClick={handleOpenModal} variant="solid" variantColor="pink" size="md">
        Изменить количество
      </Button>
      {props.isHasShortageStocksProblem && (
        <Button
          onClick={() => setForcedModalOpen(true)}
          variant="solid"
          variantColor="blue"
          size="md"
        >
          Принудительно изменить количество
        </Button>
      )}
    </>
  );
};

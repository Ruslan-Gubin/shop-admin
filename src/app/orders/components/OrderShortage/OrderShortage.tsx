import { useState, useTransition } from "react";
import type { ResponseData } from "@/shared/types/response";
import { Button } from "@/shared/ui/button-main/Button";
import { Modal } from "@/shared/ui/modal/Modal";
import { ModalBody } from "@/shared/ui/modal/modal-body/ModalBody";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalFooter } from "@/shared/ui/modal/modal-footer/ModalFooter";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { OrderShortageStocks } from "../../action";
import type { OrderProductModel } from "../../edit/[id]/action";
import styles from "./OrderShortage.module.css";

type Props = {
  updateShortageAction: (
    order_id: number,
    payload: { id: number; quantity: number }[],
  ) => Promise<ResponseData<null>>;
  order_id: number;
  products: OrderProductModel[];
  shortage_stocks: OrderShortageStocks[];
  forcedShortageAction: (id: number) => Promise<ResponseData<null>>;
};

export const OrderShortage = (props: Props) => {
  const [disabled, transition] = useTransition();
  const [forcedModalOpen, setForcedModalOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [values, setValues] = useState<Record<string, string>>({});

  const closeModal = () => setIsModalOpen(false);

  const handleOpenModal = () => {
    const updateValues: Record<string, string> = {};

    const hasShortageStocks = props.shortage_stocks.length > 0;

    for (let i = 0; i < props.products.length; i++) {
      const product = props.products[i];

      let value = String(product.quantity);

      if (hasShortageStocks) {
        const findShortageStocksItem = props.shortage_stocks.find((el) => el.id === product.id);
        if (findShortageStocksItem) {
          value = String(findShortageStocksItem.quantity);
        }
      }

      updateValues[String(product.id)] = value;
    }

    setValues(updateValues);
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    const payload: { id: number; quantity: number }[] = [];

    for (const key in values) {
      const id = Number(key);
      const quantity = Number(values[key]);

      if (!Number.isNaN(id) && id > 0 && !Number.isNaN(quantity)) {
        payload.push({ id, quantity });
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

  const handleBlurInput = (value: string, key: number, maxStocks: number) => {
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

  const handleChangeQuantity = (value: string, key: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleCloseForcedModal = () => setForcedModalOpen(false);

  const handleForcedSubmit = () => {
    transition(() => {
      console.log("forced");
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
                    <span className={styles.headerCellText}>Необходимо</span>
                  </th>
                  <th className={styles.headerCell}>
                    <span className={styles.headerCellText}>Остаток</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {props.products.map((stock) => (
                  <tr key={stock.id} className={styles.dataRow}>
                    <td className={styles.dataCell}>{stock.name}</td>
                    <td className={styles.dataCell}>
                      <span>{stock.quantity}</span>
                    </td>
                    <td className={styles.dataCell}>
                      <input
                        onBlur={(e) => handleBlurInput(e.target.value, stock.id, stock.quantity)}
                        onChange={(e) => handleChangeQuantity(e.target.value, stock.id)}
                        value={values[stock.id] || ""}
                        className={styles.cellInput}
                        type="number"
                        min={0}
                        max={stock.quantity}
                      />
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
      {props.shortage_stocks.length > 0 && (
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

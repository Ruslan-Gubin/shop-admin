"use client";
import Link from "next/link";
import { useState } from "react";
import type { ResponseData } from "@/shared/types/response";
import { Button } from "@/shared/ui/button-main/Button";
import { Modal } from "@/shared/ui/modal/Modal";
import { ModalBody } from "@/shared/ui/modal/modal-body/ModalBody";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalFooter } from "@/shared/ui/modal/modal-footer/ModalFooter";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";
import { TextAreaResize } from "@/shared/ui/text-area-resize/TextAreaResize";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { OrderMethodReceipt, OrderStatus } from "../../action";
import styles from "./OrderStatusActions.module.css";

type Props = {
  isNeedTransfer: boolean;
  status: OrderStatus;
  order_id: number;
  method_receipt: OrderMethodReceipt;
  changeOrderStatusAction: (order_id: number) => Promise<ResponseData<null>>;
};

export const OrderStatusActions = (props: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfirmOpen, setModalConfirmOpen] = useState<{ title: string; subtitle: string }>({
    title: "",
    subtitle: "",
  });
  const [rejectedReason, setRejectedReason] = useState("");

  const onSubmitCancelOrder = () => {
    setIsModalOpen(false);
    setRejectedReason("");
  };

  const handleCloseConfirmModal = () => setModalConfirmOpen({ title: "", subtitle: "" });

  const handleSubmit = (status: OrderStatus) => {
    if (status === "processing" || status === "ready" || status === "in_delivery") {
      props
        .changeOrderStatusAction(props.order_id)
        .then((response) => {
          notificationAdapter.add(response.message, response.status);
        })
        .finally(() => {
          handleCloseConfirmModal();
        });
    }
  };

  return (
    <>
      <Modal active={modalConfirmOpen.title.length > 0} handleCloseAction={handleCloseConfirmModal}>
        <ModalContent>
          <ModalHeader title={modalConfirmOpen.title} onClose={handleCloseConfirmModal} />
          <ModalBody>
            <span className={styles.subtitle}>{modalConfirmOpen.subtitle}</span>
          </ModalBody>
          <ModalFooter
            cancelAction={{
              text: "Закрыть",
              action: handleCloseConfirmModal,
            }}
            submitAction={{
              text: "Подтвердить",
              variantColor: "green",
              action: () => handleSubmit(props.status),
            }}
          />
        </ModalContent>
      </Modal>
      <Modal active={isModalOpen} handleCloseAction={() => setIsModalOpen(false)}>
        <ModalContent>
          <ModalHeader title="Отмена заказа" onClose={() => setIsModalOpen(false)} />
          <ModalBody>
            <TextAreaResize
              maxHeight={99}
              name="rejected_reason"
              label="Укажите причину отмены"
              value={rejectedReason}
              onChange={setRejectedReason}
            />
          </ModalBody>
          <ModalFooter
            cancelAction={{
              text: "Закрыть",
              action: () => setIsModalOpen(false),
            }}
            submitAction={{
              text: "Подтвердить",
              variantColor: "green",
              action: onSubmitCancelOrder,
            }}
          />
        </ModalContent>
      </Modal>
      <div className={styles.actionsRow}>
        <Button
          variant="outline"
          variantColor="error"
          size="md"
          onClick={() => setIsModalOpen(true)}
        >
          Отменить заказ
        </Button>

        {props.status === "new" && (
          <>
            {props.isNeedTransfer && (
              <Link href={`/transfer/stock-to-stock/${props.order_id}`}>
                <Button variant="solid" variantColor="green" size="md">
                  Создать перемещение
                </Button>
              </Link>
            )}

            {!props.isNeedTransfer && (
              <Button variant="solid" variantColor="green" size="md">
                Начать сборку
              </Button>
            )}
          </>
        )}

        {props.status === "processing" && (
          <Button
            onClick={() =>
              setModalConfirmOpen({
                title: "Завершить сборку?",
                subtitle: `Вы подтверждаете, что все перемещения доставлены и товары готовы к ${props.method_receipt === "courier" ? "отправке" : "выдаче"}?`,
              })
            }
            variant="solid"
            variantColor="green"
            size="md"
          >
            Завершить сборку
          </Button>
        )}
        {props.status === "ready" && (
          <Button
            onClick={() =>
              setModalConfirmOpen({
                title: props.method_receipt === "courier" ? "Передать курьеру" : "Завершить заказ",
                subtitle:
                  props.method_receipt === "courier"
                    ? "Заказ будет передан в доставку. Статус изменится на «В доставке»."
                    : "Подтвердите, что клиент забрал товары. Статус изменится на «Завершён».",
              })
            }
            variant="solid"
            variantColor="green"
            size="md"
          >
            {props.method_receipt === "courier" ? "Передать курьеру" : "Завершить"}
          </Button>
        )}
        {props.status === "in_delivery" && (
          <Button
            onClick={() =>
              setModalConfirmOpen({
                title: "Подтвердить доставку?",
                subtitle: "Заказ будет завершён. Клиент получил товар.",
              })
            }
            variant="solid"
            variantColor="green"
            size="md"
          >
            Доставлен
          </Button>
        )}
      </div>
    </>
  );
};

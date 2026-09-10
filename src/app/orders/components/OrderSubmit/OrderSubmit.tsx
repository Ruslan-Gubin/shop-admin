import { useState, useTransition } from "react";
import type { ResponseData } from "@/shared/types/response";
import { Button } from "@/shared/ui/button-main/Button";
import { Modal } from "@/shared/ui/modal/Modal";
import { ModalBody } from "@/shared/ui/modal/modal-body/ModalBody";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalFooter } from "@/shared/ui/modal/modal-footer/ModalFooter";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { OrderMethodReceipt, OrderStatus } from "../../action";

type Props = {
  changeOrderStatusAction: (order_id: number) => Promise<ResponseData<null>>;
  order_id: number;
  status: OrderStatus;
  method_receipt: OrderMethodReceipt;
};

export const OrderSubmit = (props: Props) => {
  const [disabled, transition] = useTransition();
  const [modalConfirmOpen, setModalConfirmOpen] = useState<{ title: string; subtitle: string }>({
    title: "",
    subtitle: "",
  });
  const handleCloseConfirmModal = () => setModalConfirmOpen({ title: "", subtitle: "" });

  const handleSubmit = () => {
    transition(() => {
      props
        .changeOrderStatusAction(props.order_id)
        .then((response) => {
          notificationAdapter.add(response.message, response.status);
        })
        .finally(() => {
          handleCloseConfirmModal();
        });
    });
  };

  const getSubmitOption = (status: OrderStatus, method_receipt: OrderMethodReceipt) => {
    let title = "";
    let subTitle = "";
    let text = "";

    if (status === "new") {
      title = "Начать сборку?";
      subTitle = "Заказ будет передан в сборку. Статус изменится на «В сборке».";
      text = "Начать сборку";
    } else if (status === "processing") {
      title = "Завершить сборку?";
      subTitle = `Вы подтверждаете, что все перемещения доставлены и товары готовы к ${method_receipt === "courier" ? "отправке" : "выдаче"}?`;
      text = "Завершить сборку";
    } else if (status === "ready") {
      title = method_receipt === "courier" ? "Передать курьеру" : "Завершить выдачу";
      subTitle =
        method_receipt === "courier"
          ? "Заказ будет передан в доставку. Статус изменится на «В доставке»."
          : "Подтвердите, что клиент забрал товары. Статус заказа изменится на завершен.";
      text = method_receipt === "courier" ? "Передать курьеру" : "Завершить";
    } else if (status === "in_delivery") {
      title = "Завершить доставку?";
      subTitle = "Подтвердите, что клиенту доставили товар. Статус заказа изменится на завершен. ";
      text = "Доставлен";
    }

    return {
      title,
      subTitle,
      text,
    };
  };

  const submitButtonOption = getSubmitOption(props.status, props.method_receipt);

  return (
    <>
      <Modal active={modalConfirmOpen.title.length > 0} handleCloseAction={handleCloseConfirmModal}>
        <ModalContent>
          <ModalHeader title={modalConfirmOpen.title} onClose={handleCloseConfirmModal} />
          <ModalBody>
            <span className="modal-subtitle-text">{modalConfirmOpen.subtitle}</span>
          </ModalBody>
          <ModalFooter
            cancelAction={{
              text: "Закрыть",
              action: handleCloseConfirmModal,
            }}
            submitAction={{
              text: "Подтвердить",
              variantColor: "green",
              disabled,
              action: handleSubmit,
            }}
          />
        </ModalContent>
      </Modal>
      <Button
        onClick={() =>
          setModalConfirmOpen({
            title: submitButtonOption.title,
            subtitle: submitButtonOption.subTitle,
          })
        }
        variant="solid"
        variantColor="green"
        size="md"
      >
        {submitButtonOption.text}
      </Button>
    </>
  );
};

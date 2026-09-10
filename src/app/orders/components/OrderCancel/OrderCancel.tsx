import { useState, useTransition } from "react";
import type { ResponseData } from "@/shared/types/response";
import { Button } from "@/shared/ui/button-main/Button";
import { Modal } from "@/shared/ui/modal/Modal";
import { ModalBody } from "@/shared/ui/modal/modal-body/ModalBody";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalFooter } from "@/shared/ui/modal/modal-footer/ModalFooter";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";
import { TextAreaResize } from "@/shared/ui/text-area-resize/TextAreaResize";
import { notificationAdapter } from "@/stores/notification/adapter";

type Props = {
  order_id: number;
  cancelOrderAction: (order_id: number, rejected_reason: string) => Promise<ResponseData<null>>;
};

export const OrderCancel = (props: Props) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [rejectedReason, setRejectedReason] = useState("");
  const [disabled, transition] = useTransition();

  const onSubmitCancelOrder = () => {
    if (rejectedReason.length === 0) {
      notificationAdapter.add("Причина отказа обязательна", "error");
    }
    if (props.order_id && rejectedReason.length > 0) {
      transition(() => {
        props
          .cancelOrderAction(props.order_id, rejectedReason)
          .then((response) => {
            notificationAdapter.add(response.message, response.status);

            if (response.status === "success") {
              setRejectedReason("");
            }
          })
          .finally(() => {
            setIsModalOpen(false);
          });
      });
    }
  };

  return (
    <>
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
              disabled,
              action: onSubmitCancelOrder,
            }}
          />
        </ModalContent>
      </Modal>
      <Button variant="outline" variantColor="error" size="md" onClick={() => setIsModalOpen(true)}>
        Отменить заказ
      </Button>
    </>
  );
};

import { useActionState, useEffectEvent, useLayoutEffect } from "react";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Input } from "@/shared/ui/input-main/Input";
import { Modal } from "@/shared/ui/modal/Modal";
import { ModalBody } from "@/shared/ui/modal/modal-body/ModalBody";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalFooter } from "@/shared/ui/modal/modal-footer/ModalFooter";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { CreateRangeFormFields } from "../../action";

type Props = {
  onCloseModal: () => void;
  isOpen: boolean;
  title: string;
  submitButtonText: string;
  onSubmitAction: (
    prevState: CreateRangeFormFields,
    formData: FormData,
  ) => Promise<CreateRangeFormFields>;
  initValue: {
    price_from: string;
    price_to: string;
    id: number | null;
  };
};

export const ModalRangeForm = (props: Props) => {
  const [state, formAction, pending] = useActionState(props.onSubmitAction, {
    price_from: { value: props.initValue.price_from || "", error: "" },
    price_to: { value: props.initValue.price_to || "", error: "" },
    id: props.initValue.id,
    message: "",
    status: "",
  });

  const closeModalEvent = useEffectEvent(() => {
    props.onCloseModal();
  });

  useLayoutEffect(() => {
    if (state.message && (state.status === "success" || state.status === "error")) {
      notificationAdapter.add(state.message, state.status);
      if (state.status === "success") {
        closeModalEvent();
      }
    }
  }, [state]);

  return (
    <Modal active={props.isOpen} handleCloseAction={props.onCloseModal}>
      <form action={formAction}>
        <ModalContent>
          <ModalHeader title={props.title} onClose={props.onCloseModal} />
          <ModalBody>
            <div className="form-modal-inputs">
              <Input
                error={state.price_from.error}
                defaultValue={state.price_from.value}
                name="price_from"
                id="price_from_range_input"
                variant="outlined"
                variantSize="sm"
                type="number"
                placeholder="От"
                label="От"
                rightIcon={<CancelSvg />}
              />
              <Input
                error={state.price_to.error}
                defaultValue={state.price_to.value}
                name="price_to"
                id="price_to_range_input"
                variant="outlined"
                variantSize="sm"
                type="number"
                placeholder="До"
                label="До"
                rightIcon={<CancelSvg />}
              />
            </div>
          </ModalBody>
          <ModalFooter
            cancelAction={{ action: props.onCloseModal }}
            submitAction={{ type: "submit", disabled: pending, text: props.submitButtonText }}
          />
        </ModalContent>
      </form>
    </Modal>
  );
};

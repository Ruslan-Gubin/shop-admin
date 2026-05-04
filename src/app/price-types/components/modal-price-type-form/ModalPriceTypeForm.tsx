import { useActionState, useEffectEvent, useLayoutEffect } from "react";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Checkbox } from "@/shared/ui/checkbox/Checkbox";
import { Input } from "@/shared/ui/input-main/Input";
import { Modal } from "@/shared/ui/modal/Modal";
import { ModalBody } from "@/shared/ui/modal/modal-body/ModalBody";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalFooter } from "@/shared/ui/modal/modal-footer/ModalFooter";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { CreatePriceTypeFormFields } from "../../action";

type Props = {
  onCloseModal: () => void;
  isOpen: boolean;
  title: string;
  submitButtonText: string;
  onSubmitAction: (
    prevState: CreatePriceTypeFormFields,
    formData: FormData,
  ) => Promise<CreatePriceTypeFormFields>;
  initValue: {
    name: string;
    description: string;
    minQuantity: string;
    isPublic: boolean;
    id: number | null;
  };
};

export const ModalPriceTypeForm = (props: Props) => {
  const [state, formAction, pending] = useActionState(props.onSubmitAction, {
    name: { value: props.initValue.name || "", error: "" },
    description: { value: props.initValue.description || "", error: "" },
    minQuantity: { value: props.initValue.minQuantity || "", error: "" },
    isPublic: { value: props.initValue.isPublic ? "on" : "off", error: "" },
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
                error={state.name.error}
                defaultValue={state.name.value}
                name="name"
                id="name_price_type_input"
                variant="outlined"
                variantSize="sm"
                placeholder="Название"
                label="Название"
                rightIcon={<CancelSvg />}
              />
              <Input
                error={state.description.error}
                defaultValue={state.description.value}
                name="description"
                id="description_price_type_input"
                variant="outlined"
                variantSize="sm"
                placeholder="Описание"
                label="Описание"
                rightIcon={<CancelSvg />}
              />
              <Input
                error={state.minQuantity.error}
                defaultValue={state.minQuantity.value}
                name="minQuantity"
                id="minQuantity_price_type_input"
                variant="outlined"
                variantSize="sm"
                type="number"
                placeholder="Минимальное количество для применения"
                label="Минимальное количество для применения"
                rightIcon={<CancelSvg />}
              />
              <Checkbox
                defaultChecked={state.isPublic.value === "on"}
                name="isPublic"
                labelText="Видна покупателям в карточке товара"
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

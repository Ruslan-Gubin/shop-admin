import { useActionState, useEffectEvent, useLayoutEffect } from "react";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Input } from "@/shared/ui/input-main/Input";
import { Modal } from "@/shared/ui/modal/Modal";
import { ModalBody } from "@/shared/ui/modal/modal-body/ModalBody";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalFooter } from "@/shared/ui/modal/modal-footer/ModalFooter";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";
import { Select } from "@/shared/ui/select/Select";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { CreateSpecificationFields } from "../../action";

type Props = {
  onCloseModal: () => void;
  isOpen: boolean;
  title: string;
  submitButtonText: string;
  onSubmitAction: (
    prevState: CreateSpecificationFields,
    formData: FormData,
  ) => Promise<CreateSpecificationFields>;
  initValue: {
    name: string;
    type: string;
    id: number | null;
  };
};

export const SpecificationModalForm = (props: Props) => {
  const [state, formAction, pending] = useActionState(props.onSubmitAction, {
    name: { value: props.initValue.name || "", error: "" },
    type: { value: props.initValue.type || "text", error: "" },
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
                id="name_feature_input"
                variant="outlined"
                variantSize="sm"
                placeholder="Название характеристики"
                label="Название"
                rightIcon={<CancelSvg />}
              />
              <Select
                label="Тип характеристики"
                defaultValue={state.type.value}
                error={state.type.error}
                options={[
                  { value: "text", label: "Текст" },
                  { value: "color", label: "Цвет" },
                  { value: "number", label: "Число" },
                ]}
                selectName="type"
                selectId="type"
                selectKey={state.type.value}
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

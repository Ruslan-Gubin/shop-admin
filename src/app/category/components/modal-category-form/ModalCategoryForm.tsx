import { useActionState, useEffectEvent, useLayoutEffect } from "react";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Input } from "@/shared/ui/input-main/Input";
import { Modal } from "@/shared/ui/modal/Modal";
import { ModalBody } from "@/shared/ui/modal/modal-body/ModalBody";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalFooter } from "@/shared/ui/modal/modal-footer/ModalFooter";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { CreateCategoryFormFields } from "../../action";

type Props = {
  onCloseModal: () => void;
  isOpen: boolean;
  title: string;
  submitButtonText: string;
  onSubmitAction: (
    prevState: CreateCategoryFormFields,
    formData: FormData,
  ) => Promise<CreateCategoryFormFields>;
  initValue: {
    name: string;
    description: string;
    id: number | null;
    parent_id: number | null;
    position: number | null;
  };
};

export const ModalCategoryForm = (props: Props) => {
  const [state, formAction, pending] = useActionState(props.onSubmitAction, {
    name: { value: props.initValue.name || "", error: "" },
    description: { value: props.initValue.description || "", error: "" },
    id: props.initValue.id,
    parent_id: props.initValue.parent_id,
    position: props.initValue.position,
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
                id="name_category_input"
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
                id="description_category_input"
                variant="outlined"
                variantSize="sm"
                placeholder="Описание"
                label="Описание"
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

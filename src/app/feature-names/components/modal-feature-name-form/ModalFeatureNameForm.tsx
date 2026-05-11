import { useActionState, useEffectEvent, useLayoutEffect } from "react";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Input } from "@/shared/ui/input-main/Input";
import { Modal } from "@/shared/ui/modal/Modal";
import { ModalBody } from "@/shared/ui/modal/modal-body/ModalBody";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalFooter } from "@/shared/ui/modal/modal-footer/ModalFooter";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { CreateFeatureNameFormFields } from "../../action";
import styles from "./ModalFeatureNameForm.module.css";

type Props = {
  onCloseModal: () => void;
  isOpen: boolean;
  title: string;
  submitButtonText: string;
  onSubmitAction: (
    prevState: CreateFeatureNameFormFields,
    formData: FormData,
  ) => Promise<CreateFeatureNameFormFields>;
  initValue: {
    name: string;
    slug: string;
    id: number | null;
  };
};

export const ModalFeatureNameForm = (props: Props) => {
  const [state, formAction, pending] = useActionState(props.onSubmitAction, {
    name: { value: props.initValue.name || "", error: "" },
    slug: { value: props.initValue.slug || "", error: "" },
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

  // Auto-generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

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
                onChange={(e) => {
                  const nameValue = e.target.value;
                  if (!state.slug.value || state.slug.value === generateSlug(props.initValue.name || "")) {
                    const slugInput = document.getElementById("slug_feature_input") as HTMLInputElement;
                    if (slugInput) {
                      slugInput.value = generateSlug(nameValue);
                    }
                  }
                }}
              />
              <Input
                error={state.slug.error}
                defaultValue={state.slug.value}
                name="slug"
                id="slug_feature_input"
                variant="outlined"
                variantSize="sm"
                placeholder="slug"
                label="Slug (URL)"
                rightIcon={<CancelSvg />}
              />
              <p className={styles.slugHint}>Только латиница, цифры и дефис</p>
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

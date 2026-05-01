import { useActionState, useEffectEvent, useLayoutEffect } from "react";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Button } from "@/shared/ui/button-main/Button";
import { CloseModal } from "@/shared/ui/close-modal/CloseModal";
import { Input } from "@/shared/ui/input-main/Input";
import { Modal } from "@/shared/ui/modal/Modal";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { CreateCategoryFormFields } from "../../action";
import styles from "./ModalCategoryForm.module.css";

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
      <section className={styles.modalContent}>
        <header className={styles.header}>
          <div className={styles.titleWrapper}>
            <h2 className={styles.headerTitle}>{props.title}</h2>
          </div>
          <CloseModal onClose={props.onCloseModal} />
        </header>

        <form action={formAction} className={styles.form}>
          <div className={styles.formInputs}>
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
          <footer className={styles.footer}>
            <Button size="md" variant="ghost" onClick={props.onCloseModal} type="button">
              Отменить
            </Button>
            <Button size="md" variant="solid" variantColor="green" disabled={pending} type="submit">
              {props.submitButtonText}
            </Button>
          </footer>
        </form>
      </section>
    </Modal>
  );
};

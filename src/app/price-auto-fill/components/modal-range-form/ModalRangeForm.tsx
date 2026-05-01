import { useActionState, useEffectEvent, useLayoutEffect } from "react";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Button } from "@/shared/ui/button-main/Button";
import { CloseModal } from "@/shared/ui/close-modal/CloseModal";
import { Input } from "@/shared/ui/input-main/Input";
import { Modal } from "@/shared/ui/modal/Modal";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { CreateRangeFormFields } from "../../action";
import styles from "./ModalRangeForm.module.css";

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
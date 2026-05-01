"use client";
import { useActionState, useEffectEvent, useLayoutEffect } from "react";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Button } from "@/shared/ui/button-main/Button";
import { Checkbox } from "@/shared/ui/checkbox/Checkbox";
import { CloseModal } from "@/shared/ui/close-modal/CloseModal";
import { Input } from "@/shared/ui/input-main/Input";
import { Modal } from "@/shared/ui/modal/Modal";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { CreatePromotionFormFields } from "../../action";
import styles from "./ModalPromotionForm.module.css";

type Props = {
  onCloseModal: () => void;
  isOpen: boolean;
  title: string;
  submitButtonText: string;
  onSubmitAction: (
    prevState: CreatePromotionFormFields,
    formData: FormData,
  ) => Promise<CreatePromotionFormFields>;
  initValue: {
    name: string;
    description: string;
    percent: string;
    date_from: string;
    date_to: string;
    is_active: boolean;
    id: number | null;
  };
};

export const ModalPromotionForm = (props: Props) => {
  const [state, formAction, pending] = useActionState(props.onSubmitAction, {
    name: { value: props.initValue.name || "", error: "" },
    description: { value: props.initValue.description || "", error: "" },
    percent: { value: props.initValue.percent || "", error: "" },
    date_from: { value: props.initValue.date_from || "", error: "" },
    date_to: { value: props.initValue.date_to || "", error: "" },
    is_active: { value: props.initValue.is_active ? "on" : "off", error: "" },
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
              error={state.name.error}
              defaultValue={state.name.value}
              name="name"
              id="name_promotion_input"
              variant="outlined"
              variantSize="sm"
              placeholder="Название акции"
              label="Название"
              rightIcon={<CancelSvg />}
            />
            <Input
              error={state.description.error}
              defaultValue={state.description.value}
              name="description"
              id="description_promotion_input"
              variant="outlined"
              variantSize="sm"
              placeholder="Описание акции"
              label="Описание"
              rightIcon={<CancelSvg />}
            />
            <Input
              error={state.percent.error}
              defaultValue={state.percent.value}
              name="percent"
              id="percent_promotion_input"
              variant="outlined"
              variantSize="sm"
              type="number"
              placeholder="Процент скидки"
              label="Скидка (%)"
              rightIcon={<CancelSvg />}
            />
            <Input
              error={state.date_from.error}
              defaultValue={state.date_from.value}
              name="date_from"
              id="date_from_promotion_input"
              variant="outlined"
              variantSize="sm"
              type="date"
              placeholder="Дата начала"
              label="Дата начала"
            />
            <Input
              error={state.date_to.error}
              defaultValue={state.date_to.value}
              name="date_to"
              id="date_to_promotion_input"
              variant="outlined"
              variantSize="sm"
              type="date"
              placeholder="Дата окончания"
              label="Дата окончания"
            />
            <Checkbox
              defaultChecked={props.initValue.is_active}
              name="is_active"
              labelText="Акция активна и доступна клиентам"
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

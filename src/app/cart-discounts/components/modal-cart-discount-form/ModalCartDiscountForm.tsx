"use client";
import { useActionState, useEffectEvent, useLayoutEffect } from "react";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Button } from "@/shared/ui/button-main/Button";
import { Checkbox } from "@/shared/ui/checkbox/Checkbox";
import { CloseModal } from "@/shared/ui/close-modal/CloseModal";
import { Input } from "@/shared/ui/input-main/Input";
import { Modal } from "@/shared/ui/modal/Modal";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { CreateCartDiscountFormFields } from "../../action";
import styles from "./ModalCartDiscountForm.module.css";

type Props = {
  onCloseModal: () => void;
  isOpen: boolean;
  title: string;
  submitButtonText: string;
  onSubmitAction: (
    prevState: CreateCartDiscountFormFields,
    formData: FormData,
  ) => Promise<CreateCartDiscountFormFields>;
  initValue: {
    name: string;
    min_sum: string;
    percent: string;
    apply_to: string;
    is_active: boolean;
    id: number | null;
  };
};

export const ModalCartDiscountForm = (props: Props) => {
  const [state, formAction, pending] = useActionState(props.onSubmitAction, {
    name: { value: props.initValue.name || "", error: "" },
    min_sum: { value: props.initValue.min_sum || "", error: "" },
    percent: { value: props.initValue.percent || "", error: "" },
    apply_to: { value: props.initValue.apply_to || "all", error: "" },
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
              id="name_cart_discount_input"
              variant="outlined"
              variantSize="sm"
              placeholder="Название скидки"
              label="Название"
              rightIcon={<CancelSvg />}
            />
            <Input
              error={state.min_sum.error}
              defaultValue={state.min_sum.value}
              name="min_sum"
              id="min_sum_cart_discount_input"
              variant="outlined"
              variantSize="sm"
              type="number"
              placeholder="Минимальная сумма заказа"
              label="Мин. сумма (₽)"
              rightIcon={<CancelSvg />}
            />
            <Input
              error={state.percent.error}
              defaultValue={state.percent.value}
              name="percent"
              id="percent_cart_discount_input"
              variant="outlined"
              variantSize="sm"
              type="number"
              placeholder="Процент скидки"
              label="Скидка (%)"
              rightIcon={<CancelSvg />}
            />
            <div className={styles.selectWrapper}>
              <label htmlFor="apply_to" className={styles.selectLabel}>
                Кому доступно
              </label>
              <select
                key={state.apply_to.value}
                defaultValue={state.apply_to.value}
                name="apply_to"
                id="apply_to"
                className={styles.select}
              >
                <option value="all">Всем (розничные + оптовые)</option>
                <option value="retail">Только розничным</option>
                <option value="wholesale">Только оптовым</option>
              </select>
              {state.apply_to.error && (
                <span className={styles.selectError}>{state.apply_to.error}</span>
              )}
            </div>
            <Checkbox
              defaultChecked={state.is_active.value === "on"}
              name="is_active"
              labelText="Скидка активна и доступна клиентам"
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

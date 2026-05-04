"use client";
import { useActionState, useEffectEvent, useLayoutEffect } from "react";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Checkbox } from "@/shared/ui/checkbox/Checkbox";
import { Input } from "@/shared/ui/input-main/Input";
import { Modal } from "@/shared/ui/modal/Modal";
import { ModalBody } from "@/shared/ui/modal/modal-body/ModalBody";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalFooter } from "@/shared/ui/modal/modal-footer/ModalFooter";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";
import { Select } from "@/shared/ui/select/Select";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { CreateCartDiscountFormFields } from "../../action";

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
      <form action={formAction}>
        <ModalContent>
          <ModalHeader title={props.title} onClose={props.onCloseModal} />
          <ModalBody>
            <div className="form-modal-inputs">
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
              <Select
                label="Кому доступно"
                defaultValue={state.apply_to.value}
                error={state.apply_to.error}
                options={[
                  { value: "all", label: "Всем (розничные + оптовые)" },
                  { value: "retail", label: "Только розничным" },
                  { value: "wholesale", label: "Только оптовым" },
                ]}
                selectName="apply_to"
                selectId="apply_to"
                selectKey={state.apply_to.value}
              />
              <Checkbox
                defaultChecked={state.is_active.value === "on"}
                name="is_active"
                labelText="Скидка активна и доступна клиентам"
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

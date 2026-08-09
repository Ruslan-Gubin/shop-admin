"use client";
import { type SubmitEventHandler, useLayoutEffect, useState, useTransition } from "react";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Checkbox } from "@/shared/ui/checkbox/Checkbox";
import { Dropdown } from "@/shared/ui/dropdown/Dropdown";
import { Input } from "@/shared/ui/input-main/Input";
import { Modal } from "@/shared/ui/modal/Modal";
import { ModalBody } from "@/shared/ui/modal/modal-body/ModalBody";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalFooter } from "@/shared/ui/modal/modal-footer/ModalFooter";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { CartDiscountActionResponse, CreateCartDiscountPayload } from "../../action";

type Props = {
  onCloseModal: () => void;
  isOpen: boolean;
  title: string;
  submitButtonText: string;
  onSubmitAction: (values: CreateCartDiscountPayload) => Promise<CartDiscountActionResponse>;
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
  const [loading, transition] = useTransition();
  const [values, setValues] = useState<CreateCartDiscountPayload>({
    name: props.initValue.name || "",
    min_sum: props.initValue.min_sum || "",
    percent: props.initValue.percent || "",
    apply_to: props.initValue.apply_to || "all",
    is_active: props.initValue.is_active,
  });
  const [errors, setErrors] = useState<Record<keyof CreateCartDiscountPayload, string>>({
    name: "",
    min_sum: "",
    percent: "",
    apply_to: "",
    is_active: "",
  });

  useLayoutEffect(() => {
    setValues({
      name: props.initValue.name || "",
      min_sum: props.initValue.min_sum || "",
      percent: props.initValue.percent || "",
      apply_to: props.initValue.apply_to || "all",
      is_active: props.initValue.is_active,
    });
    setErrors({
      name: "",
      min_sum: "",
      percent: "",
      apply_to: "",
      is_active: "",
    });
  }, [
    props.initValue.id,
    props.initValue.name,
    props.initValue.min_sum,
    props.initValue.percent,
    props.initValue.apply_to,
    props.initValue.is_active,
  ]);

  const handleChangeValues = (value: string, key: keyof CreateCartDiscountPayload) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleChangeCheckbox = (checked: boolean) => {
    setValues((prev) => ({ ...prev, is_active: checked }));
    setErrors((prev) => ({ ...prev, is_active: "" }));
  };

  const handleSubmit: SubmitEventHandler = (e) => {
    e.preventDefault();
    transition(() => {
      props.onSubmitAction(values).then((response) => {
        if (response.status === "success") {
          notificationAdapter.add(response.message, response.status);
          props.onCloseModal();
        } else if (response.status === "error" && response.errors) {
          setErrors(response.errors);
          if (response.message) {
            notificationAdapter.add(response.message, response.status);
          }
        }
      });
    });
  };

  const options = [
    { value: "all", label: "Всем (розничные + оптовые)" },
    { value: "retail", label: "Только розничным" },
    { value: "wholesale", label: "Только оптовым" },
  ];

  return (
    <Modal active={props.isOpen} handleCloseAction={props.onCloseModal}>
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <ModalHeader title={props.title} onClose={props.onCloseModal} />
          <ModalBody minHeight={300}>
            <div className="form-modal-inputs">
              <Input
                error={errors.name}
                value={values.name}
                onChange={(e) => handleChangeValues(e.target.value, "name")}
                name="name"
                id="name_cart_discount_input"
                variant="outlined"
                variantSize="sm"
                placeholder="Название скидки"
                label="Название"
                rightIcon={<CancelSvg />}
              />
              <Input
                error={errors.min_sum}
                value={values.min_sum}
                onChange={(e) => handleChangeValues(e.target.value, "min_sum")}
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
                error={errors.percent}
                value={values.percent}
                onChange={(e) => handleChangeValues(e.target.value, "percent")}
                name="percent"
                id="percent_cart_discount_input"
                variant="outlined"
                variantSize="sm"
                type="number"
                placeholder="Процент скидки"
                label="Скидка (%)"
                rightIcon={<CancelSvg />}
              />
              <Dropdown
                options={options}
                value={values.apply_to}
                name="apply_to"
                id="apply_to"
                disabled={false}
                onSelectMenu={(value) => handleChangeValues(String(value), "apply_to")}
                label="Кому доступно"
                menuHeight={300}
                variant="select"
              />
              <Checkbox
                checked={values.is_active}
                onChange={(e) => handleChangeCheckbox(e.target.checked)}
                name="is_active"
                labelText="Скидка активна и доступна клиентам"
              />
            </div>
          </ModalBody>
          <ModalFooter
            cancelAction={{ action: props.onCloseModal }}
            submitAction={{ type: "submit", disabled: loading, text: props.submitButtonText }}
          />
        </ModalContent>
      </form>
    </Modal>
  );
};

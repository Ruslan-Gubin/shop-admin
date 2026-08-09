"use client";
import { type SubmitEventHandler, useLayoutEffect, useState, useTransition } from "react";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Dropdown } from "@/shared/ui/dropdown/Dropdown";
import { Input } from "@/shared/ui/input-main/Input";
import { Modal } from "@/shared/ui/modal/Modal";
import { ModalBody } from "@/shared/ui/modal/modal-body/ModalBody";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalFooter } from "@/shared/ui/modal/modal-footer/ModalFooter";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { CreateSpecificationPayload, SpecificationActionResponse } from "../../action";

type Props = {
  onCloseModal: () => void;
  isOpen: boolean;
  title: string;
  submitButtonText: string;
  onSubmitAction: (values: CreateSpecificationPayload) => Promise<SpecificationActionResponse>;
  initValue: {
    name: string;
    type: string;
    id: number | null;
  };
};

export const SpecificationModalForm = (props: Props) => {
  const [loading, transition] = useTransition();
  const [values, setValues] = useState<CreateSpecificationPayload>({
    name: props.initValue.name || "",
    type: props.initValue.type || "text",
  });
  const [errors, setErrors] = useState<Record<keyof CreateSpecificationPayload, string>>({
    name: "",
    type: "",
  });

  useLayoutEffect(() => {
    setValues({
      name: props.initValue.name || "",
      type: props.initValue.type || "text",
    });
    setErrors({ name: "", type: "" });
  }, [props.initValue.id, props.initValue.name, props.initValue.type]);

  const handleChangeValues = (value: string, key: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
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
    { value: "text", label: "Текст" },
    { value: "color", label: "Цвет" },
    { value: "number", label: "Число" },
  ];

  return (
    <Modal active={props.isOpen} handleCloseAction={props.onCloseModal}>
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <ModalHeader title={props.title} onClose={props.onCloseModal} />
          <ModalBody minHeight={190}>
            <div className="form-modal-inputs">
              <Input
                error={errors.name}
                value={values.name}
                onChange={(e) => handleChangeValues(e.target.value, "name")}
                name="name"
                id="name_feature_input"
                variant="outlined"
                variantSize="sm"
                placeholder="Название характеристики"
                label="Название"
                rightIcon={<CancelSvg />}
              />
              <Dropdown
                options={options}
                value={values.type}
                name="type"
                id="type"
                disabled={false}
                onSelectMenu={(value) => handleChangeValues(String(value), "type")}
                label="Тип характеристики"
                menuHeight={300}
                variant="select"
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

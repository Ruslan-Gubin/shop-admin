"use client";
import { InputLabelInside } from "@/shared/ui/input-main/InputLabelInside";
import { ButtonBlack } from "@/shared/ui/button-black/Buttonblack";
import { notificationService } from "@/shared/services/notification";
import { FormEventHandler, useTransition } from "react";
import { CreateProductSchema } from "@/entity/product/create-product";
import { useFormValues } from "@/shared/hooks/useFormValues";
import styles from "./AddProductForm.module.scss";

type Props = {
  submitForm: (values: {
    name: string;
    count: string;
    price: string;
    code: string;
    id?: string;
  }) => Promise<{ status: "error" | "success"; message: string }>;
  initValue?: {
    name: string;
    count: string;
    price: string;
    code: string;
    id: string;
  };
};

const AddProductForm = ({ initValue, submitForm }: Props) => {
  const [submitLoading, transition] = useTransition();
  const {
    resetInput,
    changeInputs,
    errors,
    validateValues,
    values,
    changeInputNumber,
  } = useFormValues({
    initValues: {
      name: initValue?.name ? initValue.name : "",
      count: initValue?.count ? initValue.count : "",
      price: initValue?.price ? initValue.price : "",
      code: initValue?.code ? initValue.code : "",
    },
    payloadSchema: CreateProductSchema,
  });

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const payload = validateValues();
    if (!payload || submitLoading) return;

    if (initValue && initValue.id) {
      Object.assign(payload, { id: initValue.id });
    }

    transition(() => {
      submitForm(payload).then((res) => {
        notificationService.activeNotification({
          status: res.status,
          message: res.message,
        });
        if (!initValue) {
          resetInput();
        }
      });
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.addForm}>
      <InputLabelInside
        error={errors.name}
        value={values.name}
        onChange={(value) => changeInputs(value, "name")}
        name="name"
        label="Название"
        placeholder="Введите текст здесь..."
      />
      <div className={styles.inputsLine}>
        <InputLabelInside
          error={errors.count}
          onChange={(value) => changeInputNumber(value, "count")}
          value={values.count}
          name="count"
          label="Количество"
          placeholder="Введите количество"
        />
        <InputLabelInside
          error={errors.price}
          value={values.price}
          onChange={(value) => changeInputNumber(value, "price")}
          name="price"
          label="Цена"
          placeholder="Введите цену"
        />
      </div>

      <div className={styles.inputsLine}>
        <InputLabelInside
          error={errors.code}
          value={values.code}
          onChange={(value) => changeInputs(value, "code")}
          name="code"
          label="Штриховой код"
          placeholder="90123456789"
        />
      </div>
      <div className={styles.buttonContainer}>
        <ButtonBlack
          disabled={submitLoading}
          type="submit"
          text={initValue ? "Редактировать" : "Сохранить"}
        />
      </div>
    </form>
  );
};

export { AddProductForm };

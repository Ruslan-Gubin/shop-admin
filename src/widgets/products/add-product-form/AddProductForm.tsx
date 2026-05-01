"use client";
import { useActionState, useLayoutEffect } from "react";
import type { CreateProductFormFields } from "@/app/product/create/action";
import type { UpdateProductFormFields } from "@/app/product/edit/[id]/action";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Button } from "@/shared/ui/button-main/Button";
import { Input } from "@/shared/ui/input-main/Input";
import { notificationAdapter } from "@/stores/notification/adapter";
import styles from "./AddProductForm.module.css";

type Props = {
  submitFormAction: (
    prevState: CreateProductFormFields | UpdateProductFormFields,
    formData: FormData,
  ) => Promise<CreateProductFormFields | UpdateProductFormFields>;
  initValue?: {
    name: string;
    count: string;
    price: string;
    code: string;
    id: string;
  };
};

export const AddProductForm = (props: Props) => {
  const [state, formAction, pending] = useActionState(props.submitFormAction, {
    name: {
      value: props?.initValue?.name ? props.initValue.name : "",
      error: "",
    },
    count: {
      value: props?.initValue?.count ? props.initValue.count : "",
      error: "",
    },
    price: {
      value: props?.initValue?.price ? props.initValue.price : "",
      error: "",
    },
    code: {
      value: props?.initValue?.code ? props.initValue.code : "",
      error: "",
    },
    id: props?.initValue?.id ? props.initValue.id : "",
    message: "",
    status: "",
  });

  useLayoutEffect(() => {
    if (state.message && (state.status === "success" || state.status === "error")) {
      notificationAdapter.add(state.message, state.status);
    }
  }, [state]);

  return (
    <form action={formAction} className={styles.addForm}>
      <Input
        error={state.name.error}
        defaultValue={state.name.value}
        name="name"
        id="name"
        variant="outlined"
        variantSize="sm"
        placeholder="Название"
        label="Название"
        rightIcon={<CancelSvg />}
      />

      <div className={styles.inputsLine}>
        <div>
          <Input
            error={state.count.error}
            defaultValue={state.count.value}
            name="count"
            id="count"
            type="number"
            variant="outlined"
            variantSize="sm"
            placeholder="Количество"
            label="Количество"
            rightIcon={<CancelSvg />}
          />
        </div>

        <div>
          <Input
            error={state.price.error}
            defaultValue={state.price.value}
            name="price"
            id="price"
            type="number"
            variant="outlined"
            variantSize="sm"
            placeholder="Стоимость"
            label="Стоимость"
            rightIcon={<CancelSvg />}
          />
        </div>
      </div>

      <div className={styles.inputsLine}>
        <div>
          <Input
            error={state.code.error}
            defaultValue={state.code.value}
            name="code"
            id="code"
            type="number"
            variant="outlined"
            variantSize="sm"
            placeholder="Штрих-код"
            label="Штрих-код"
            rightIcon={<CancelSvg />}
          />
        </div>
      </div>
      <Button variant="solid" variantColor="green" type="submit" disabled={pending}>
        {props.initValue ? "Редактировать" : "Сохранить"}
      </Button>
    </form>
  );
};

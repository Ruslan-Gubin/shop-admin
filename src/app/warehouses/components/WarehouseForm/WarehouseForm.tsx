"use client";
import { useLayoutEffect, useState, useTransition } from "react";
import { AddSvg } from "@/app/category/components/category-item/svg/AddSvg";
import { EditSvg } from "@/app/category/components/category-item/svg/EditSvg";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Button } from "@/shared/ui/button-main/Button";
import { Checkbox } from "@/shared/ui/checkbox/Checkbox";
import { Input } from "@/shared/ui/input-main/Input";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { WarehousePayload } from "../../create/action";
import styles from "./WarehouseForm.module.css";

type Props = {
  submitAction: (payload: WarehousePayload) => Promise<{
    errors: Record<keyof WarehousePayload, string> | null;
    notification: {
      status: "error" | "success";
      message: string;
    } | null;
    updateValues: WarehousePayload | null;
  }>;
  initValues: WarehousePayload;
  initErrors: Record<keyof WarehousePayload, string>;
  variant: "create" | "edit";
};

export const WarehouseForm = (props: Props) => {
  const [pending, transition] = useTransition();
  const [values, setValues] = useState<WarehousePayload>(props.initValues);
  const [errors, setErrors] = useState<Record<keyof WarehousePayload, string>>(props.initErrors);

  useLayoutEffect(() => {
    setValues(props.initValues);
    setErrors(props.initErrors);
  }, []);

  const handleChangeValues = (field: string, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const submitForm = () => {
    transition(() => {
      props.submitAction(values).then((response) => {
        if (response.errors) {
          setErrors(response.errors);
        }

        if (response.notification) {
          notificationAdapter.add(response.notification.message, response.notification.status);
        }

        if (response.updateValues) {
          setValues(response.updateValues);
        }
      });
    });
  };

  return (
    <section className={styles.addForm}>
      <Input
        error={errors.name}
        value={values.name}
        name="warehouse_name"
        id="warehouse_name"
        variant="outlined"
        variantSize="sm"
        label="Название"
        rightIcon={<CancelSvg />}
        onChange={(e) => handleChangeValues("name", e.target.value)}
        onClickRightIcon={() => handleChangeValues("name", "")}
      />
      <Input
        error={errors.address}
        value={values.address}
        name="warehouse_address"
        id="warehouse_address"
        variant="outlined"
        variantSize="sm"
        label="Полный адрес"
        rightIcon={<CancelSvg />}
        onChange={(e) => handleChangeValues("address", e.target.value)}
        onClickRightIcon={() => handleChangeValues("address", "")}
      />
      <Input
        error={errors.city}
        value={values.city}
        name="warehouse_city"
        id="warehouse_city"
        variant="outlined"
        variantSize="sm"
        label="Город"
        rightIcon={<CancelSvg />}
        onChange={(e) => handleChangeValues("city", e.target.value)}
        onClickRightIcon={() => handleChangeValues("city", "")}
      />
      <Input
        error={errors.street}
        value={values.street}
        name="warehouse_street"
        id="warehouse_street"
        variant="outlined"
        variantSize="sm"
        label="Улица"
        rightIcon={<CancelSvg />}
        onChange={(e) => handleChangeValues("street", e.target.value)}
        onClickRightIcon={() => handleChangeValues("street", "")}
      />
      <Input
        error={errors.house}
        value={values.house}
        name="warehouse_house"
        id="warehouse_house"
        variant="outlined"
        variantSize="sm"
        label="Дом"
        rightIcon={<CancelSvg />}
        onChange={(e) => handleChangeValues("house", e.target.value)}
        onClickRightIcon={() => handleChangeValues("house", "")}
      />
      <Input
        error={errors.office}
        value={values.office}
        name="warehouse_office"
        id="warehouse_office"
        variant="outlined"
        variantSize="sm"
        label="Офис/Квартира"
        rightIcon={<CancelSvg />}
        onChange={(e) => handleChangeValues("office", e.target.value)}
        onClickRightIcon={() => handleChangeValues("office", "")}
      />

      <Input
        error={errors.index}
        value={values.index}
        name="warehouse_index"
        id="warehouse_index"
        variant="outlined"
        variantSize="sm"
        label="Почтовый индекс"
        rightIcon={<CancelSvg />}
        onChange={(e) => handleChangeValues("index", e.target.value)}
        onClickRightIcon={() => handleChangeValues("index", "")}
      />

      <Input
        error={errors.area}
        value={values.area}
        name="warehouse_area"
        id="warehouse_area"
        variant="outlined"
        variantSize="sm"
        label="Район"
        rightIcon={<CancelSvg />}
        onChange={(e) => handleChangeValues("area", e.target.value)}
        onClickRightIcon={() => handleChangeValues("area", "")}
      />

      <Input
        error={errors.description}
        value={values.description}
        name="warehouse_description"
        id="warehouse_description"
        variant="outlined"
        variantSize="sm"
        label="Описание"
        rightIcon={<CancelSvg />}
        onChange={(e) => handleChangeValues("description", e.target.value)}
        onClickRightIcon={() => handleChangeValues("description", "")}
      />

      <Checkbox
        onChange={() => handleChangeValues("is_active", !values.is_active)}
        checked={values.is_active}
        name="warehouse_is_active"
        labelText="Активен"
      />
      <Checkbox
        onChange={() => handleChangeValues("is_public", !values.is_public)}
        checked={values.is_public}
        name="warehouse_is_public"
        labelText="Публичный (виден клиентам)"
      />
      <Checkbox
        onChange={() => handleChangeValues("default_warehouse", !values.default_warehouse)}
        checked={values.default_warehouse}
        name="warehouse_default_warehouse"
        labelText="Склад по умолчанию"
      />

      <div className={styles.actionForm}>
        <Button
          size="sm"
          variant="solid"
          variantColor="green"
          onClick={submitForm}
          type="button"
          disabled={pending}
        >
          {props.variant === "create" ? <AddSvg /> : <EditSvg />}
          {props.variant === "create" ? "Создать склад" : "Редактировать"}
        </Button>
      </div>
    </section>
  );
};

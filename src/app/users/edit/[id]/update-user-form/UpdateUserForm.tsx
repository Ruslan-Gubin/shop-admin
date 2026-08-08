"use client";
import { type SubmitEventHandler, useLayoutEffect, useState, useTransition } from "react";
import { AddSvg } from "@/app/category/components/category-item/svg/AddSvg";
import { EditSvg } from "@/app/category/components/category-item/svg/EditSvg";
import type { UserModel } from "@/app/users/action";
import type { CreateUserPayload } from "@/app/users/create/action";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Button } from "@/shared/ui/button-main/Button";
import { Dropdown } from "@/shared/ui/dropdown/Dropdown";
import { Input } from "@/shared/ui/input-main/Input";
import { notificationAdapter } from "@/stores/notification/adapter";
import styles from "./UpdateUserForm.module.css";

type Props = {
  submitAction: (values: {
    role: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    repeatPassword: string;
  }) => Promise<{
    status: "error" | "success";
    errors: Record<keyof CreateUserPayload, string>;
    data: UserModel | null;
    message: string;
  }>;
  initValue?: {
    name: string;
    email: string;
    phone: string;
    role: string;
    photo: string;
  };
  variant: "create" | "edit";
};

export const UpdateUserForm = (props: Props) => {
  const [loading, transition] = useTransition();
  const [values, setValues] = useState<{
    role: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    repeatPassword: string;
  }>({
    role: props?.initValue?.role || "user",
    email: props?.initValue?.email || "",
    name: props?.initValue?.name || "",
    phone: props?.initValue?.phone || "",
    password: "",
    repeatPassword: "",
  });
  const [errors, setErrors] = useState<{
    role: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    repeatPassword: string;
  }>({
    role: "",
    email: "",
    name: "",
    phone: "",
    password: "",
    repeatPassword: "",
  });

  useLayoutEffect(() => {
    setValues({
      role: props?.initValue?.role || "user",
      email: props?.initValue?.email || "",
      name: props?.initValue?.name || "",
      phone: props?.initValue?.phone || "",
      password: "",
      repeatPassword: "",
    });
  }, [props.initValue]);

  const handleSubmit: SubmitEventHandler = (e) => {
    e.preventDefault();
    transition(() => {
      props.submitAction(values).then((response) => {
        if (response.status === "success") {
          if (props.variant === "create") {
            setValues((prev) => ({
              ...prev,
              ...{
                email: "",
                name: "",
                phone: "",
                password: "",
                repeatPassword: "",
              },
            }));
          }
          if (props.variant === "edit") {
            setValues((prev) => ({
              ...prev,
              ...{
                password: "",
                repeatPassword: "",
              },
            }));
          }
          notificationAdapter.add(response.message, response.status);
        } else if (response.status === "error" && response.errors) {
          setErrors(response.errors);
          if (response.message) {
            notificationAdapter.add(response.message, response.status);
          }
        }
      });
    });
  };

  const handleChangeValues = (value: string, key: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const options = [
    { label: "Покупатель", value: "user" },
    { label: "Модератор", value: "moderator" },
    { label: "Админ", value: "admin" },
  ];

  return (
    <form className={styles.loginForm} onSubmit={handleSubmit}>
      <Dropdown
        options={options}
        value={values.role}
        name="role"
        id="role"
        disabled={false}
        onSelectMenu={(value) => handleChangeValues(String(value), "role")}
        label="Роль"
        menuHeight={300}
        variant="select"
      />
      <Input
        error={errors.name}
        value={values.name}
        onChange={(e) => handleChangeValues(e.target.value, "name")}
        name="name"
        id="name"
        variant="outlined"
        variantSize="sm"
        placeholder="Имя"
        label="Имя"
        rightIcon={<CancelSvg />}
      />
      <Input
        error={errors.email}
        value={values.email}
        onChange={(e) => handleChangeValues(e.target.value, "email")}
        name="email"
        id="email"
        variant="outlined"
        variantSize="sm"
        placeholder="Почта"
        label="Почта"
        rightIcon={<CancelSvg />}
      />
      <Input
        error={errors.phone}
        value={values.phone}
        onChange={(e) => handleChangeValues(e.target.value, "phone")}
        name="phone"
        id="phone"
        type="tel"
        variant="outlined"
        variantSize="sm"
        placeholder="Телефон"
        label="Телефон"
        rightIcon={<CancelSvg />}
      />
      <Input
        error={errors.password}
        value={values.password}
        onChange={(e) => handleChangeValues(e.target.value, "password")}
        name="password"
        id="password"
        type="password"
        variant="outlined"
        variantSize="sm"
        placeholder={props?.initValue?.id ? "Изменить пароль" : "Введите пароль"}
        label={props?.initValue?.id ? "Изменить пароль" : "Введите пароль"}
        rightIcon={<CancelSvg />}
      />
      <Input
        error={errors.repeatPassword}
        value={values.repeatPassword}
        onChange={(e) => handleChangeValues(e.target.value, "repeatPassword")}
        name="repeatPassword"
        id="repeatPassword"
        type="password"
        variant="outlined"
        variantSize="sm"
        placeholder={props?.initValue?.id ? "Повторите пароль" : "Введите повторный пароль"}
        label={props?.initValue?.id ? "Повторите пароль" : "Введите повторный пароль"}
        rightIcon={<CancelSvg />}
      />
      <div className={styles.actionForm}>
        <Button size="sm" variant="solid" variantColor="green" type="submit" disabled={loading}>
          {props.variant === "create" ? <AddSvg /> : <EditSvg />}

          {props.variant === "edit" ? "Редактировать пользователя" : "Создать пользователя"}
        </Button>
      </div>
    </form>
  );
};

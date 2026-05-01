"use client";
import { useActionState, useLayoutEffect } from "react";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Button } from "@/shared/ui/button-main/Button";
import { Input } from "@/shared/ui/input-main/Input";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { UpdateUserFormFields } from "../action";
import styles from "./UpdateUserForm.module.css";

type Props = {
  submitAction: (
    prevState: UpdateUserFormFields,
    formData: FormData,
  ) => Promise<UpdateUserFormFields>;
  initValue?: {
    name: string;
    email: string;
    phone: string;
    role: string;
    photo: string;
    id: string;
  };
};

export const UpdateUserForm = (props: Props) => {
  const [state, formAction, pending] = useActionState(props.submitAction, {
    name: { value: props?.initValue?.name || "", error: "" },
    email: { value: props?.initValue?.email || "", error: "" },
    phone: { value: props?.initValue?.phone || "", error: "" },
    password: { value: "", error: "" },
    repeatPassword: { value: "", error: "" },
    role: { value: props?.initValue?.role || "", error: "" },
    message: "",
    status: "",
    id: props?.initValue?.id || "",
  });

  useLayoutEffect(() => {
    if (state.message && (state.status === "success" || state.status === "error")) {
      notificationAdapter.add(state.message, state.status);
    }
  }, [state]);

  const roles = ["user", "moderator", "admin"];

  return (
    <form action={formAction} className={styles.loginForm}>
      <select key={state.role.value} defaultValue={state.role.value} name="role" id="role">
        {roles.map((role) => (
          <option key={role}>{role}</option>
        ))}
      </select>
      <Input
        error={state.name.error}
        defaultValue={state.name.value}
        name="name"
        id="name"
        variant="outlined"
        variantSize="sm"
        placeholder="Имя"
        label="Имя"
        rightIcon={<CancelSvg />}
      />
      <Input
        error={state.email.error}
        defaultValue={state.email.value}
        name="email"
        id="email"
        variant="outlined"
        variantSize="sm"
        placeholder="Почта"
        label="Почта"
        rightIcon={<CancelSvg />}
      />
      <Input
        error={state.phone.error}
        defaultValue={state.phone.value}
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
        error={state.password.error}
        defaultValue={state.password.value}
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
        error={state.repeatPassword.error}
        defaultValue={state.repeatPassword.value}
        name="repeatPassword"
        id="repeatPassword"
        type="password"
        variant="outlined"
        variantSize="sm"
        placeholder={props?.initValue?.id ? "Повторите пароль" : "Введите повторный пароль"}
        label={props?.initValue?.id ? "Повторите пароль" : "Введите повторный пароль"}
        rightIcon={<CancelSvg />}
      />
      <Button variant="solid" variantColor="green" type="submit" disabled={pending}>
        {props?.initValue?.id ? "Редактировать" : "Создать"}
      </Button>
    </form>
  );
};

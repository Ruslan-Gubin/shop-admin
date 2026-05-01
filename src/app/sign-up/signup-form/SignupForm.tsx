"use client";
import { useActionState, useLayoutEffect } from "react";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Button } from "@/shared/ui/button-main/Button";
import { Input } from "@/shared/ui/input-main/Input";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { SignupFormFields } from "../action";
import styles from "./SignupForm.module.css";

type Props = {
  submitSignupAction: (
    prevState: SignupFormFields,
    formData: FormData,
  ) => Promise<SignupFormFields>;
};

export const SignupForm = (props: Props) => {
  const [state, formAction, pending] = useActionState(props.submitSignupAction, {
    name: { value: "", error: "" },
    email: { value: "", error: "" },
    phone: { value: "", error: "" },
    password: { value: "", error: "" },
    repeatPassword: { value: "", error: "" },
    status: "",
    message: "",
  });

  useLayoutEffect(() => {
    if (state.message && (state.status === "success" || state.status === "error")) {
      notificationAdapter.add(state.message, state.status);
    }
  }, [state]);

  return (
    <form action={formAction} className={styles.loginForm}>
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
        placeholder="Имя"
        label="Имя"
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
        placeholder="Пароль"
        label="Пароль"
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
        placeholder="Повторите пароль"
        label="Повторите пароль"
        rightIcon={<CancelSvg />}
      />

      <Button variant="solid" variantColor="green" type="submit" disabled={pending}>
        Зарегистрировать
      </Button>
    </form>
  );
};

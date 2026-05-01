"use client";
import { useActionState, useLayoutEffect } from "react";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Button } from "@/shared/ui/button-main/Button";
import { Input } from "@/shared/ui/input-main/Input";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { SigninFormFields } from "../action";
import styles from "./SigninForm.module.css";

type Props = {
  submitSigninAction: (
    prevState: SigninFormFields,
    formData: FormData,
  ) => Promise<SigninFormFields>;
};

export const SigninForm = (props: Props) => {
  const [state, formAction, pending] = useActionState(props.submitSigninAction, {
    email: { value: "", error: "" },
    password: { value: "", error: "" },
    message: "",
    status: "",
  });

  useLayoutEffect(() => {
    if (state.message && (state.status === "success" || state.status === "error")) {
      notificationAdapter.add(state.message, state.status);
    }
  }, [state]);

  return (
    <form action={formAction} className={styles.loginForm}>
      <Input
        error={state.email.error}
        defaultValue={state.email.value}
        name="email"
        variant="outlined"
        variantSize="sm"
        placeholder="Почта"
        label="Почта"
        rightIcon={<CancelSvg />}
      />
      <Input
        error={state.password.error}
        defaultValue={state.password.value}
        name="password"
        type="password"
        variant="outlined"
        variantSize="sm"
        placeholder="Пароль"
        label="Пароль"
        rightIcon={<CancelSvg />}
      />
      <Button variant="solid" variantColor="green" type="submit" disabled={pending}>
        Подтвердить
      </Button>
    </form>
  );
};

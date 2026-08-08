"use server";
import { cookies } from "next/headers";
import { fetchService } from "@/shared/fetch-api";
import { addItemCookieAction, updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import { getValidatePayload } from "@/shared/services/get-form-action-state";
import { setErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
import type { UserModel } from "../action";
import { createUserSchema } from "./schema";

export type CreateUserPayload = {
  role: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  repeatPassword: string;
};

export const createUserAction = async (payload: {
  role: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  repeatPassword: string;
}): Promise<{
  status: "error" | "success";
  errors: Record<keyof CreateUserPayload, string>;
  data: UserModel | null;
  message: string;
}> => {
  const validate = getValidatePayload(payload, createUserSchema);

  if (validate.isValid) {
    const cookieStore = await cookies();

    const { repeatPassword, ...restPayload } = payload;

    return fetchService
      .post<UserModel>({
        url: "users/create",
        payload: restPayload,
      })
      .then(async (response) => {
        if (response.tokens) {
          updateTokensInAction(cookieStore, response.tokens);
        }

        if (response.status === "error" && response.errors) {
          setErrorFromServer(response.errors, validate.errors);
        } else {
          addItemCookieAction(cookieStore, response.data);
        }

        return {
          ...response,
          errors: validate.errors,
        };
      });
  }

  return { status: "error", message: "", data: null, errors: validate.errors };
};

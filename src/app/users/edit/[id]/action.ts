"use server";
import { cookies } from "next/headers";
import { fetchService } from "@/shared/fetch-api";
import { normalizePhoneNumber } from "@/shared/helpers/normalizePhoneNumber";
import { updateItemCookieAction, updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import { getValidatePayload } from "@/shared/services/get-form-action-state";
import { setErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
import type { UserModel } from "../../action";
import { updateUserSchema } from "./schema";

export type UpdateUserPayload = {
  role: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  repeatPassword: string;
};

export const fetchUser = async (id: string) => {
  return await fetchService.get<UserModel>({
    url: `users/${id}`,
  });
};

export const updateUserAction = async (
  payload: UpdateUserPayload,
  id: string,
): Promise<{
  status: "error" | "success";
  errors: Record<keyof UpdateUserPayload, string>;
  data: UserModel | null;
  message: string;
}> => {
  const validate = getValidatePayload(payload, updateUserSchema);
  console.log(validate);

  if (validate.isValid) {
    const cookieStore = await cookies();

    if (typeof payload.phone === "string") {
      payload.phone = normalizePhoneNumber(payload.phone);
    }

    const { repeatPassword, ...restPayload } = payload;

    return fetchService
      .patch<null>({
        url: `users/${id}`,
        payload: restPayload,
      })
      .then(async (response) => {
        if (response.tokens) {
          updateTokensInAction(cookieStore, response.tokens);
        }

        if (response.status === "error" && response.errors) {
          setErrorFromServer(response.errors, validate.errors);
        } else {
          updateItemCookieAction(cookieStore, Number(id));
        }

        return {
          ...response,
          errors: validate.errors,
        };
      });
  }

  return { status: "error", message: "", data: null, errors: validate.errors };
};

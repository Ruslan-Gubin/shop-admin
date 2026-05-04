"use server";
import { cookies } from "next/headers";
import { fetchService } from "@/shared/fetch-api";
import { normalizePhoneNumber } from "@/shared/helpers/normalizePhoneNumber";
import { updateItemCookieAction, updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import { getFormActionState } from "@/shared/services/get-form-action-state";
import { setNewStoreErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
import type { UserModel } from "../../action";
import { updateUserSchema } from "./schema";

export type UpdateUserFormFields = {
  name: { value: string; error: string };
  email: { value: string; error: string };
  phone: { value: string; error: string };
  password: { value: string; error: string };
  repeatPassword: { value: string; error: string };
  role: { value: string; error: string };
  message: string;
  status: string;
  id: string;
};

export const fetchUser = async (id: string) => {
  return await fetchService.get<UserModel>({
    url: `users/${id}`,
  });
};

export const updateUserAction = async (
  prevState: UpdateUserFormFields,
  formData: FormData,
): Promise<UpdateUserFormFields> => {
  const validate = getFormActionState<UpdateUserFormFields>(formData, prevState, updateUserSchema);

  if (validate.isValid) {
    const id = validate.newState.id;

    if (typeof validate.payload.phone === "string") {
      validate.payload.phone = normalizePhoneNumber(validate.payload.phone);
    }
    const { repeatPassword, ...restPayload } = validate.payload;

    const cookieStore = await cookies();

    await fetchService
      .patch<null>({
        url: `users/${id}`,
        payload: restPayload,
      })
      .then(async (response) => {
        validate.newState.message = response.message;
        validate.newState.status = response.status;

        if (response.tokens) {
          updateTokensInAction(cookieStore, response.tokens);
        }

        if (response.status !== "success") {
          setNewStoreErrorFromServer(response.errors, validate.newState);
        } else {
          updateItemCookieAction(cookieStore, Number(id));
          validate.newState.password.value = "";
          validate.newState.repeatPassword.value = "";
        }
      });
  } else {
    validate.newState.message = "";
    validate.newState.status = "";
  }

  return validate.newState;
};

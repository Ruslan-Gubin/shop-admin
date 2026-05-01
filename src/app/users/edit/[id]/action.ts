"use server";
import { getFormActionState } from "@/shared/services/get-form-action-state";
import { updateUserSchema } from "./schema";
import { updateTokensInAction } from "@/shared/services/update-tokens-in-action";
import { fetchService } from "@/shared/fetch-api";
import { setNewStoreErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
import type { UserModel } from "../../action";
import { normalizePhoneNumber } from "@/shared/helpers/normalizePhoneNumber";

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
  const validate = getFormActionState<UpdateUserFormFields>(
    formData,
    prevState,
    updateUserSchema,
  );

  if (validate.isValid) {
    const id = validate.newState.id;

    if (typeof validate.payload.phone === "string") {
      validate.payload.phone = normalizePhoneNumber(validate.payload.phone);
    }
    const { repeatPassword, ...restPayload } = validate.payload;

    await fetchService
      .patch<null>({
        url: `users/${id}`,
        payload: restPayload,
      })
      .then(async (response) => {
        validate.newState.message = response.message;
        validate.newState.status = response.status;

        if (response.tokens) {
          await updateTokensInAction(response.tokens);
        }

        if (response.status !== "success") {
          setNewStoreErrorFromServer(response.errors, validate.newState);
        } else {
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

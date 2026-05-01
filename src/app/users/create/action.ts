"use server";
import { getFormActionState } from "@/shared/services/get-form-action-state";
import { createUserSchema } from "./schema";
import { updateTokensInAction } from "@/shared/services/update-tokens-in-action";
import { fetchService } from "@/shared/fetch-api";
import { setNewStoreErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
import { normalizePhoneNumber } from "@/shared/helpers/normalizePhoneNumber";
import type { UserModel } from "../action";
import { resetNewStateValues } from "@/shared/services/reset-new-store-values";

export type CreateUserFormFields = {
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

export const createUserAction = async (
  prevState: CreateUserFormFields,
  formData: FormData,
): Promise<CreateUserFormFields> => {
  const validate = getFormActionState<CreateUserFormFields>(
    formData,
    prevState,
    createUserSchema,
  );

  if (validate.isValid) {
    if (typeof validate.payload.phone === "string") {
      validate.payload.phone = normalizePhoneNumber(validate.payload.phone);
    }
    const { repeatPassword, ...restPayload } = validate.payload;

    await fetchService
      .post<UserModel>({
        url: "users/create",
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
          resetNewStateValues(validate.newState);
        }
      });
  } else {
    validate.newState.message = "";
    validate.newState.status = "";
  }

  return validate.newState;
};

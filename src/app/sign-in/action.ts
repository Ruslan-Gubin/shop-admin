"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CONFIG_APP } from "@/shared/config/config";
import { fetchService } from "@/shared/fetch-api";
import { getFormActionState } from "@/shared/services/get-form-action-state";
import { resetNewStateValues } from "@/shared/services/reset-new-store-values";
import { setNewStoreErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
import { signinSchema } from "./schema";

export type SigninFormFields = {
  email: { value: string; error: string };
  password: { value: string; error: string };
  message: string;
  status: string;
};

export async function submitSigninAction(
  prevState: SigninFormFields,
  formData: FormData,
): Promise<SigninFormFields> {
  const validate = getFormActionState(formData, prevState, signinSchema);

  if (validate.isValid) {
    await fetchService
      .post<{ token: string; refresh: string }>({
        url: "auth/sign-in",
        payload: validate.payload,
      })
      .then(async (response) => {
        validate.newState.message = response.message;
        validate.newState.status = response.status;

        if (response.status === "success" && response.data) {
          const cookieStore = await cookies();
          cookieStore.set(CONFIG_APP.ACCESS_TOKEN_COOKIE, response.data.token);
          cookieStore.set(CONFIG_APP.REFRESH_TOKEN_COOKIE, response.data.refresh);

          resetNewStateValues(validate.newState);

          return response.status;
        } else {
          setNewStoreErrorFromServer(response.errors, validate.newState);
        }
      })
      .then((status) => {
        if (status === "success") {
          redirect("/");
        }
      });
  } else {
    validate.newState.message = "";
    validate.newState.status = "";
  }

  return validate.newState;
}

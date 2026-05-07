"use server";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { fetchService } from "@/shared/fetch-api";
import { addItemCookieAction, updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import { getFormActionState } from "@/shared/services/get-form-action-state";
import { resetNewStateValues } from "@/shared/services/reset-new-store-values";
import { setNewStoreErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
import type { ProductModel } from "../action";
import { createProductSchema } from "./schema";

export type CreateProductFormFields = {
  name: { value: string; error: string };
  count: { value: string; error: string };
  price: { value: string; error: string };
  code: { value: string; error: string };
  message: string;
  status: string;
  id: number | null;
};

export const createProductAction = async (
  prevState: CreateProductFormFields,
  formData: FormData,
): Promise<CreateProductFormFields> => {
  const validate = getFormActionState<CreateProductFormFields>(
    formData,
    prevState,
    createProductSchema,
  );

  if (validate.isValid) {
    validate.payload.count = Number(validate.payload.count);
    validate.payload.price = Number(validate.payload.price);

    const cookieStore = await cookies();

    await fetchService
      .post<ProductModel>({
        url: "product/create",
        payload: validate.payload,
      })
      .then((response) => {
        validate.newState.message = response.message;
        validate.newState.status = response.status;

        if (response.tokens) {
          updateTokensInAction(cookieStore, response.tokens);
        }

        if (response.status === "success" && response.data) {
          addItemCookieAction(cookieStore, response.data);
          revalidateTag("Products", "max");
          resetNewStateValues(validate.newState);
        } else {
          setNewStoreErrorFromServer(response.errors, validate.newState);
        }
      });
  } else {
    validate.newState.message = "";
    validate.newState.status = "";
  }

  return validate.newState;
};

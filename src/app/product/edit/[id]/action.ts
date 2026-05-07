"use server";
import { cookies } from "next/headers";
import { fetchService } from "@/shared/fetch-api";
import { updateItemCookieAction, updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import { getFormActionState } from "@/shared/services/get-form-action-state";
import { setNewStoreErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
import type { ProductModel } from "../../action";
import type { CreateProductFormFields } from "../../create/action";
import { updateProductSchema } from "./schema";

export const fetchProduct = async (id: string) => {
  return await fetchService.get<ProductModel>({
    url: `product/${id}`,
  });
};

export const updateProductAction = async (
  prevState: CreateProductFormFields,
  formData: FormData,
): Promise<CreateProductFormFields> => {
  const validate = getFormActionState<CreateProductFormFields>(
    formData,
    prevState,
    updateProductSchema,
  );

  if (validate.isValid) {
    validate.payload.count = Number(validate.payload.count);
    validate.payload.price = Number(validate.payload.price);
    const id = validate.newState.id;

    const cookieStore = await cookies();

    await fetchService
      .patch<null>({
        url: `product/${id}`,
        payload: validate.payload,
      })
      .then((response) => {
        validate.newState.message = response.message;
        validate.newState.status = response.status;

        if (response.tokens) {
          updateTokensInAction(cookieStore, response.tokens);
        }

        if (response.status !== "success") {
          updateItemCookieAction(cookieStore, Number(id));
          setNewStoreErrorFromServer(response.errors, validate.newState);
        }
      });
  } else {
    validate.newState.message = "";
    validate.newState.status = "";
  }

  return validate.newState;
};

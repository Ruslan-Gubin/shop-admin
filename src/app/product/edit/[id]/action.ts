"use server";
import type { ProductModel } from "@/app/action";
import { fetchService } from "@/shared/fetch-api";
import { getFormActionState } from "@/shared/services/get-form-action-state";
import { setNewStoreErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
import { updateTokensInAction } from "@/shared/services/update-tokens-in-action";
import type { CreateProductFormFields } from "../../create/action";
import { updateProductSchema } from "./schema";

export interface UpdateProductFormFields extends CreateProductFormFields {
  id: string;
}

export const fetchProduct = async (id: string) => {
  return await fetchService.get<ProductModel>({
    url: `product/${id}`,
  });
};

export const updateProductAction = async (
  prevState: UpdateProductFormFields,
  formData: FormData,
): Promise<UpdateProductFormFields> => {
  const validate = getFormActionState<UpdateProductFormFields>(
    formData,
    prevState,
    updateProductSchema,
  );

  if (validate.isValid) {
    validate.payload.count = Number(validate.payload.count);
    validate.payload.price = Number(validate.payload.price);
    const id = validate.newState.id;

    await fetchService
      .patch<null>({
        url: `product/${id}`,
        payload: validate.payload,
      })
      .then(async (response) => {
        validate.newState.message = response.message;
        validate.newState.status = response.status;

        if (response.tokens) {
          await updateTokensInAction(response.tokens);
        }

        if (response.status !== "success") {
          setNewStoreErrorFromServer(response.errors, validate.newState);
        }
      });
  } else {
    validate.newState.message = "";
    validate.newState.status = "";
  }

  return validate.newState;
};

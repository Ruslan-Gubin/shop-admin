"use server";
import { cookies } from "next/headers";
import { fetchService } from "@/shared/fetch-api";
import { updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import { getValidatePayload } from "@/shared/services/get-form-action-state";
import { setErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
import type { ProductModel } from "../../action";
import type { ProductFormPayload, ProductFormPayloadValues } from "../../create/action";
import { createProductSchema } from "../../create/schema";

export const fetchProduct = async (id: string) => {
  return await fetchService.get<ProductModel>({
    url: `product/${id}`,
  });
};

export const updateProductAction = async (
  payload: ProductFormPayloadValues,
  id: string | undefined,
): Promise<{
  status: "error" | "success";
  errors: Record<keyof ProductFormPayloadValues, string>;
  data: ProductModel | null;
}> => {
  const { isValid, errors } = getValidatePayload(payload, createProductSchema);

  if (isValid && id) {
    const updatePayload: ProductFormPayload = {
      ...payload,
      brand_id: null,
      weight: payload.weight ? Number(payload.weight) : null,
      height: payload.height ? Number(payload.height) : null,
      length: payload.length ? Number(payload.length) : null,
      width: payload.width ? Number(payload.width) : null,
      purchase_price: payload.purchase_price ? Number(payload.purchase_price) : null,
    };

    const cookieStore = await cookies();

    return await fetchService
      .patch<null>({
        url: `product/${id}`,
        payload: updatePayload,
      })
      .then((response) => {
        if (response.tokens) {
          updateTokensInAction(cookieStore, response.tokens);
        }

        if (response.status === "error" && response.errors) {
          setErrorFromServer(response.errors, errors);
        }

        return { status: response.status, errors, data: response.data };
      });
  }

  return { status: "error", errors, data: null };
};

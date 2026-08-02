"use server";
import { cookies } from "next/headers";
import { fetchService } from "@/shared/fetch-api";
import { updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import { getValidatePayload } from "@/shared/services/get-form-action-state";
import { setErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
import type { ProductModel } from "../action";
import { createProductSchema } from "./schema";

export type ProductFormPayloadValues = {
  name: string;
  code: string;
  description: string;
  brand_id: string;
  category_id: number | null;
  country: string;
  product_type: string;
  weight: string;
  equipment: string;
  height: string;
  length: string;
  width: string;
  purchase_price: string;
};

export type ProductFormPayload = {
  name: string;
  code: string;
  description: string;
  brand_id: number | null;
  category_id: number | null;
  country: string;
  product_type: string;
  equipment: string;
  weight: number | null;
  height: number | null;
  length: number | null;
  width: number | null;
  purchase_price: number | null;
};

export const createProductAction = async (
  payload: ProductFormPayloadValues,
): Promise<{
  status: "error" | "success";
  errors: Record<keyof ProductFormPayloadValues, string>;
  data: ProductModel | null;
}> => {
  const { isValid, errors } = getValidatePayload(payload, createProductSchema);

  if (isValid) {
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
      .post<ProductModel>({
        url: "product/create",
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

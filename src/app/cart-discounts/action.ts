"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { fetchService } from "@/shared/fetch-api";
import {
  addItemCookieAction,
  deleteItemCookieAction,
  updateItemCookieAction,
  updateTokensInAction,
} from "@/shared/helpers/updateCookieAction";
import { getValidatePayload } from "@/shared/services/get-form-action-state";
import { setErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
import { createCartDiscountSchema } from "./schema";

export type CartDiscountModel = {
  id: number;
  name: string;
  min_sum: number;
  percent: number;
  apply_to: string;
  is_active: boolean;
  created_user_id: number;
  created_at: string;
  updated_at: string | null;
};

export const fetchCartDiscounts = async (name: string, page?: string) => {
  return await fetchService.get<{
    paginationPage: string;
    cartDiscounts: CartDiscountModel[];
    totalCount: number;
  }>({
    url: "cart-discounts",
    params: { limit: "10", page: page ? String(page) : "1", name },
    tags: [`Cart_Discounts_${name}_${page}`],
  });
};

export const fetchCartDiscount = async (id: string) => {
  const cookieStore = await cookies();

  return await fetchService
    .get<CartDiscountModel>({
      url: `cart-discounts/${id}`,
      tags: [`Cart_Discounts_${id}`],
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response;
    });
};

export const deleteCartDiscountAction = async (
  id: number,
): Promise<{ status: "error" | "success"; message: string }> => {
  const cookieStore = await cookies();

  return fetchService
    .delete<null>({
      url: `cart-discounts/${id}`,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      if (response.status === "success") {
        deleteItemCookieAction(cookieStore, id);
        revalidatePath("/cart-discounts");
      }

      return { status: response.status, message: response.message };
    });
};

export type CreateCartDiscountPayload = {
  name: string;
  min_sum: string;
  percent: string;
  apply_to: string;
  is_active: boolean;
};

export type CartDiscountActionResponse = {
  status: "error" | "success";
  errors: Record<keyof CreateCartDiscountPayload, string>;
  data: CartDiscountModel | null;
  message: string;
};

export const createCartDiscountAction = async (
  payload: CreateCartDiscountPayload,
): Promise<CartDiscountActionResponse> => {
  const validate = getValidatePayload(payload, createCartDiscountSchema);

  if (validate.isValid) {
    const cookieStore = await cookies();

    return fetchService
      .post<CartDiscountModel>({
        url: "cart-discounts/create",
        payload: {
          name: payload.name,
          min_sum: Number(payload.min_sum),
          percent: Number(payload.percent),
          apply_to: payload.apply_to,
          is_active: payload.is_active,
        },
      })
      .then(async (response) => {
        if (response.tokens) {
          updateTokensInAction(cookieStore, response.tokens);
        }

        if (response.status === "error" && response.errors) {
          setErrorFromServer(response.errors, validate.errors);
        } else {
          if (response.data) {
            addItemCookieAction(cookieStore, response.data);
          }
          revalidatePath("/cart-discounts");
        }

        return {
          ...response,
          errors: validate.errors,
        };
      });
  }

  return { status: "error", message: "", data: null, errors: validate.errors };
};

export const updateCartDiscountAction = async (
  payload: CreateCartDiscountPayload,
  id: number,
): Promise<CartDiscountActionResponse> => {
  const validate = getValidatePayload(payload, createCartDiscountSchema);

  if (validate.isValid) {
    const cookieStore = await cookies();

    return fetchService
      .patch<null>({
        url: `cart-discounts/${id}`,
        payload: {
          name: payload.name,
          min_sum: Number(payload.min_sum),
          percent: Number(payload.percent),
          apply_to: payload.apply_to,
          is_active: payload.is_active,
        },
      })
      .then(async (response) => {
        if (response.tokens) {
          updateTokensInAction(cookieStore, response.tokens);
        }

        if (response.status === "error" && response.errors) {
          setErrorFromServer(response.errors, validate.errors);
        } else {
          updateItemCookieAction(cookieStore, id);
          revalidatePath("/cart-discounts");
        }

        return {
          ...response,
          errors: validate.errors,
        };
      });
  }

  return { status: "error", message: "", data: null, errors: validate.errors };
};

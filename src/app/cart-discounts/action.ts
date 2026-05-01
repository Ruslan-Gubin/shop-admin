"use server";
import { revalidatePath } from "next/cache";
import { fetchService } from "@/shared/fetch-api";
import { getFormActionState } from "@/shared/services/get-form-action-state";
import { resetNewStateValues } from "@/shared/services/reset-new-store-values";
import { setNewStoreErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
import { updateTokensInAction } from "@/shared/services/update-tokens-in-action";
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

export const deleteCartDiscountAction = async (
  id: number,
): Promise<{ status: "error" | "success"; message: string }> => {
  return fetchService
    .delete<null>({
      url: `cart-discounts/${id}`,
    })
    .then(async (response) => {
      if (response.tokens) {
        await updateTokensInAction(response.tokens);
      }

      if (response.status === "success") {
        revalidatePath("/cart-discounts");
      }

      return { status: response.status, message: response.message };
    });
};

export type CreateCartDiscountFormFields = {
  name: { value: string; error: string };
  min_sum: { value: string; error: string };
  percent: { value: string; error: string };
  apply_to: { value: string; error: string };
  is_active: { value: string; error: string };
  message: string;
  status: string;
  id: number | null;
};

export const createCartDiscountAction = async (
  prevState: CreateCartDiscountFormFields,
  formData: FormData,
): Promise<CreateCartDiscountFormFields> => {
  const validate = getFormActionState<CreateCartDiscountFormFields>(
    formData,
    prevState,
    createCartDiscountSchema,
  );

  if (validate.isValid) {
    validate.payload.min_sum = Number(validate.payload.min_sum);
    validate.payload.percent = Number(validate.payload.percent);
    validate.payload.is_active = validate.payload.is_active === "on";

    await fetchService
      .post<CartDiscountModel>({
        url: "cart-discounts/create",
        payload: validate.payload,
      })
      .then(async (response) => {
        validate.newState.message = response.message;
        validate.newState.status = response.status;

        if (response.tokens) {
          await updateTokensInAction(response.tokens);
        }

        if (response.status === "success" && response.data) {
          resetNewStateValues(validate.newState);
          revalidatePath("/cart-discounts");
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

export const updateCartDiscountAction = async (
  prevState: CreateCartDiscountFormFields,
  formData: FormData,
): Promise<CreateCartDiscountFormFields> => {
  const validate = getFormActionState<CreateCartDiscountFormFields>(
    formData,
    prevState,
    createCartDiscountSchema,
  );

  const id = validate.newState.id;

  if (validate.isValid && id) {
    validate.payload.min_sum = Number(validate.payload.min_sum);
    validate.payload.percent = Number(validate.payload.percent);
    validate.payload.is_active = validate.payload.is_active === "on";

    await fetchService
      .patch<null>({
        url: `cart-discounts/${id}`,
        payload: validate.payload,
      })
      .then(async (response) => {
        validate.newState.message = response.message;
        validate.newState.status = response.status;

        if (response.tokens) {
          await updateTokensInAction(response.tokens);
        }

        if (response.status === "success") {
          revalidatePath("/cart-discounts");
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

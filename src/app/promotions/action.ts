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
import { getFormActionState } from "@/shared/services/get-form-action-state";
import { resetNewStateValues } from "@/shared/services/reset-new-store-values";
import { setNewStoreErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
import { createPromotionSchema } from "./schema";

export type PromotionModel = {
  id: number;
  name: string;
  description: string | null;
  percent: number;
  date_from: string;
  date_to: string;
  is_active: boolean;
  created_user_id: number;
  created_at: string;
  updated_at: string | null;
};

export const fetchPromotions = async (name: string, page?: string) => {
  return await fetchService.get<{
    paginationPage: string;
    promotions: PromotionModel[];
    totalCount: number;
  }>({
    url: "promotions",
    params: { limit: "10", page: page ? String(page) : "1", name },
    tags: [`Promotions_${name}_${page}`],
  });
};

export const fetchPromotion = async (id: string) => {
  const cookieStore = await cookies();

  return await fetchService
    .get<PromotionModel>({
      url: `promotions/${id}`,
      tags: [`Promotions_${id}`],
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response;
    });
};

export const deletePromotionAction = async (
  id: number,
): Promise<{ status: "error" | "success"; message: string }> => {
  const cookieStore = await cookies();

  return fetchService
    .delete<null>({
      url: `promotions/${id}`,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      if (response.status === "success") {
        deleteItemCookieAction(cookieStore, id);
        revalidatePath("/promotions");
      }

      return { status: response.status, message: response.message };
    });
};

export type CreatePromotionFormFields = {
  name: { value: string; error: string };
  description: { value: string; error: string };
  percent: { value: string; error: string };
  date_from: { value: string; error: string };
  date_to: { value: string; error: string };
  is_active: { value: string; error: string };
  message: string;
  status: string;
  id: number | null;
};

export const createPromotionAction = async (
  prevState: CreatePromotionFormFields,
  formData: FormData,
): Promise<CreatePromotionFormFields> => {
  const validate = getFormActionState<CreatePromotionFormFields>(
    formData,
    prevState,
    createPromotionSchema,
  );

  if (validate.isValid) {
    validate.payload.percent = Number(validate.payload.percent);
    validate.payload.is_active = formData.get("is_active") === "on";

    const cookieStore = await cookies();

    await fetchService
      .post<PromotionModel>({
        url: "promotions/create",
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

          resetNewStateValues(validate.newState);
          revalidatePath("/promotions");
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

export const updatePromotionAction = async (
  prevState: CreatePromotionFormFields,
  formData: FormData,
): Promise<CreatePromotionFormFields> => {
  const validate = getFormActionState<CreatePromotionFormFields>(
    formData,
    prevState,
    createPromotionSchema,
  );

  const id = validate.newState.id;

  if (validate.isValid && id) {
    validate.payload.percent = Number(validate.payload.percent);
    validate.payload.is_active = formData.get("is_active") === "on";

    const cookieStore = await cookies();

    await fetchService
      .patch<null>({
        url: `promotions/${id}`,
        payload: validate.payload,
      })
      .then((response) => {
        validate.newState.message = response.message;
        validate.newState.status = response.status;

        if (response.tokens) {
          updateTokensInAction(cookieStore, response.tokens);
        }

        if (response.status === "success") {
          updateItemCookieAction(cookieStore, id);
          revalidatePath("/promotions");
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

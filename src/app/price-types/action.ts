"use server";
import { revalidatePath } from "next/cache";
import { fetchService } from "@/shared/fetch-api";
import { getFormActionState } from "@/shared/services/get-form-action-state";
import { resetNewStateValues } from "@/shared/services/reset-new-store-values";
import { setNewStoreErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
import { updateTokensInAction } from "@/shared/services/update-tokens-in-action";
import { createPriceTypeSchema } from "./schema";

export interface PriceTypeModel {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  minQuantity: number;
  created_user_id: number;
  created_at: string;
  updated_at: string | null;
}

export type FetchPriceTypesResponse = {
  paginationPage: string;
  priceTypes: PriceTypeModel[];
  totalCount: number;
};

export const fetchPriceTypes = async (name: string, limit: string, page?: string) => {
  return await fetchService.get<FetchPriceTypesResponse>({
    url: "price-type/types",
    params: { limit, page: page ? String(page) : "1", name },
    tags: [`Price_Types_${name}_${page}`],
  });
};

export const deletePriceTypeAction = async (
  id: number,
): Promise<{ status: "error" | "success"; message: string }> => {
  return fetchService
    .delete<null>({
      url: `price-type/${id}`,
    })
    .then(async (response) => {
      if (response.tokens) {
        await updateTokensInAction(response.tokens);
      }

      if (response.status === "success") {
        revalidatePath("/price-types");
      }

      return { status: response.status, message: response.message };
    });
};

export type CreatePriceTypeFormFields = {
  name: { value: string; error: string };
  description: { value: string; error: string };
  minQuantity: { value: string; error: string };
  isPublic: { value: string; error: string };
  message: string;
  status: string;
  id: number | null;
};

export const createPriceTypeAction = async (
  prevState: CreatePriceTypeFormFields,
  formData: FormData,
): Promise<CreatePriceTypeFormFields> => {
  const validate = getFormActionState<CreatePriceTypeFormFields>(
    formData,
    prevState,
    createPriceTypeSchema,
  );

  if (validate.isValid) {
    validate.payload.minQuantity = Number(validate.payload.minQuantity);
    validate.payload.isPublic = formData.get("isPublic") === "on";

    await fetchService
      .post<PriceTypeModel>({
        url: "price-type/create",
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
          revalidatePath("/price-types");
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

export const updatePriceTypeAction = async (
  prevState: CreatePriceTypeFormFields,
  formData: FormData,
): Promise<CreatePriceTypeFormFields> => {
  const validate = getFormActionState<CreatePriceTypeFormFields>(
    formData,
    prevState,
    createPriceTypeSchema,
  );

  const id = validate.newState.id;
  validate.payload.minQuantity = Number(validate.payload.minQuantity);
  validate.payload.isPublic = validate.payload.isPublic === "on";

  if (validate.isValid && id) {
    await fetchService
      .patch<null>({
        url: `price-type/${id}`,
        payload: validate.payload,
      })
      .then(async (response) => {
        validate.newState.message = response.message;
        validate.newState.status = response.status;

        if (response.tokens) {
          await updateTokensInAction(response.tokens);
        }

        if (response.status === "success") {
          revalidatePath("/price-types");
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

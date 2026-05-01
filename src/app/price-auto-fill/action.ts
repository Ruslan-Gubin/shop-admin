"use server";
import { revalidatePath } from "next/cache";
import { fetchService } from "@/shared/fetch-api";
import { getFormActionState } from "@/shared/services/get-form-action-state";
import { resetNewStateValues } from "@/shared/services/reset-new-store-values";
import { setNewStoreErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
import { updateTokensInAction } from "@/shared/services/update-tokens-in-action";
import type { FetchPriceTypesResponse } from "../price-types/action";
import { createRangeSchema } from "./schema";

export interface RangeModel {
  id: number;
  price_from: number;
  price_to: number;
  created_at: string;
  updated_at: string;
}

export interface PriceFillModel {
  id: number;
  price_range_id: number;
  price_type_id: number;
  percent: number;
  created_at: string;
  updated_at: string;
}

export const fetchRanges = async (search?: string) => {
  return await fetchService.get<RangeModel[]>({
    url: "price-ranges",
    params: { search: search || "" },
    tags: ["PriceRanges"],
  });
};

export const fetchPriceAutoFillPageData = async (range?: string) => {
  return await fetchService.fetchChain<[RangeModel[], FetchPriceTypesResponse, PriceFillModel[]]>([
    {
      url: "price-ranges",
      params: { range: range || "" },
      tags: ["PriceRanges"],
    },
    {
      url: "price-type/types",
      params: { limit: "100", page: "1" },
      tags: [`PriceTypes`],
    },
    {
      url: "price-fill",
      tags: [`PriceFill`],
    },
  ]);
};

export type CreateRangeFormFields = {
  price_from: { value: string; error: string };
  price_to: { value: string; error: string };
  message: string;
  status: string;
  id: number | null;
};

export const createRangeAction = async (
  prevState: CreateRangeFormFields,
  formData: FormData,
): Promise<CreateRangeFormFields> => {
  const validate = getFormActionState<CreateRangeFormFields>(
    formData,
    prevState,
    createRangeSchema,
  );

  if (validate.isValid) {
    validate.payload.price_from = Number(validate.payload.price_from);
    validate.payload.price_to = Number(validate.payload.price_to);

    await fetchService
      .post<RangeModel>({
        url: "price-ranges/create",
        payload: validate.payload,
      })
      .then(async (response) => {
        validate.newState.message = response.message;
        validate.newState.status = response.status;
        console.log(response);

        if (response.tokens) {
          await updateTokensInAction(response.tokens);
        }

        if (response.status === "success" && response.data) {
          resetNewStateValues(validate.newState);
          revalidatePath("/price-auto-fill");
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

export const updateRangeAction = async (
  prevState: CreateRangeFormFields,
  formData: FormData,
): Promise<CreateRangeFormFields> => {
  const validate = getFormActionState<CreateRangeFormFields>(
    formData,
    prevState,
    createRangeSchema,
  );

  const id = validate.newState.id;
  validate.payload.price_from = Number(validate.payload.price_from);
  validate.payload.price_to = Number(validate.payload.price_to);

  if (validate.isValid && id) {
    await fetchService
      .patch<null>({
        url: `price-ranges/${id}`,
        payload: validate.payload,
      })
      .then(async (response) => {
        validate.newState.message = response.message;
        validate.newState.status = response.status;

        if (response.tokens) {
          await updateTokensInAction(response.tokens);
        }

        if (response.status === "success") {
          revalidatePath("/price-auto-fill");
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

export const deleteRangeAction = async (
  id: number,
): Promise<{ status: "error" | "success"; message: string }> => {
  return fetchService
    .delete<null>({
      url: `price-ranges/${id}`,
    })
    .then(async (response) => {
      if (response.tokens) {
        await updateTokensInAction(response.tokens);
      }

      if (response.status === "success") {
        revalidatePath("/price-auto-fill");
      }

      return { status: response.status, message: response.message };
    });
};

export const createPriceFillAction = async (
  price_range_id: number,
  price_type_id: number,
  percent: number,
): Promise<{ status: "error" | "success"; message: string }> => {
  return fetchService
    .post<PriceFillModel>({
      url: "price-fill/create",
      payload: { price_range_id, price_type_id, percent },
    })
    .then(async (response) => {
      if (response.tokens) {
        await updateTokensInAction(response.tokens);
      }

      if (response.status === "success") {
        revalidatePath("/price-auto-fill");
      }

      return { status: response.status, message: response.message };
    });
};

export const updatePriceFillAction = async (
  id: number,
  percent: number,
): Promise<{ status: "error" | "success"; message: string }> => {
  return fetchService
    .patch<PriceFillModel>({
      url: `price-fill/${id}`,
      payload: { percent },
    })
    .then(async (response) => {
      if (response.tokens) {
        await updateTokensInAction(response.tokens);
      }

      if (response.status === "success") {
        revalidatePath("/price-auto-fill");
      }

      return { status: response.status, message: response.message };
    });
};

export const deletePriceFillAction = async (
  id: number,
): Promise<{ status: "error" | "success"; message: string }> => {
  return fetchService
    .delete<PriceFillModel>({
      url: `price-fill/${id}`,
    })
    .then(async (response) => {
      if (response.tokens) {
        await updateTokensInAction(response.tokens);
      }

      if (response.status === "success") {
        revalidatePath("/price-auto-fill");
      }

      return { status: response.status, message: response.message };
    });
};

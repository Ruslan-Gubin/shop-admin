"use server";
import { revalidatePath, revalidateTag } from "next/cache";
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
import { createFeatureNameSchema } from "./schema";

export interface FeatureNameModel {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string | null;
}

export type FetchFeatureNamesResponse = {
  paginationPage: string;
  featureNames: FeatureNameModel[];
  totalCount: number;
};

export const fetchFeatureNames = async (name: string, limit: string, page?: string) => {
  return await fetchService.get<FetchFeatureNamesResponse>({
    url: "feature-name",
    params: { limit, page: page ? String(page) : "1", name },
    tags: ["Feature_Names"],
    revalidate: 1000,
  });
};

export const fetchFeatureName = async (id: string) => {
  const cookieStore = await cookies();

  return await fetchService
    .get<FeatureNameModel>({
      url: `feature-name/${id}`,
      tags: [`Feature_Name_${id}`],
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response;
    });
};

export const deleteFeatureNameAction = async (
  id: number,
): Promise<{ status: "error" | "success"; message: string }> => {
  const cookieStore = await cookies();

  return fetchService
    .delete<null>({
      url: `feature-name/${id}`,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      if (response.status === "success") {
        deleteItemCookieAction(cookieStore, id);
        revalidateTag("Feature_Names", "max");
      }

      return { status: response.status, message: response.message };
    });
};

export type CreateFeatureNameFormFields = {
  name: { value: string; error: string };
  slug: { value: string; error: string };
  message: string;
  status: string;
  id: number | null;
};

export const createFeatureNameAction = async (
  prevState: CreateFeatureNameFormFields,
  formData: FormData,
): Promise<CreateFeatureNameFormFields> => {
  const validate = getFormActionState<CreateFeatureNameFormFields>(
    formData,
    prevState,
    createFeatureNameSchema,
  );

  if (validate.isValid) {
    const cookieStore = await cookies();

    await fetchService
      .post<FeatureNameModel>({
        url: "feature-name/create",
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
          revalidatePath("/feature-names");
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

export const updateFeatureNameAction = async (
  prevState: CreateFeatureNameFormFields,
  formData: FormData,
): Promise<CreateFeatureNameFormFields> => {
  const validate = getFormActionState<CreateFeatureNameFormFields>(
    formData,
    prevState,
    createFeatureNameSchema,
  );

  const id = validate.newState.id;

  if (validate.isValid && id) {
    const cookieStore = await cookies();

    await fetchService
      .patch<null>({
        url: `feature-name/${id}`,
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
          revalidateTag("Feature_Names", "max");
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

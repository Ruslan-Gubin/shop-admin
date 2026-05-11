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
import { createSpecificationSchema } from "./schema";

export interface SpecificationModel {
  id: number;
  name: string;
  type: "text" | "color" | "number";
  created_at: string;
  updated_at: string | null;
}

export type FetchFeatureNamesResponse = {
  paginationPage: string;
  featureNames: SpecificationModel[];
  totalCount: number;
};

export const fetchSpecifications = async (name: string, limit: string, page?: string) => {
  return await fetchService.get<FetchFeatureNamesResponse>({
    url: "specifications",
    params: { limit, page: page ? String(page) : "1", name },
    tags: ["Specifications"],
  });
};

export const fetchFeatureName = async (id: string) => {
  const cookieStore = await cookies();

  return await fetchService
    .get<SpecificationModel>({
      url: `specifications/${id}`,
      tags: [`Specifications_${id}`],
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response;
    });
};

export const deleteSpecificationAction = async (
  id: number,
): Promise<{ status: "error" | "success"; message: string }> => {
  const cookieStore = await cookies();

  return fetchService
    .delete<null>({
      url: `specifications/${id}`,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      if (response.status === "success") {
        deleteItemCookieAction(cookieStore, id);
        revalidateTag("Specifications", "max");
      }

      return { status: response.status, message: response.message };
    });
};

export type CreateSpecificationFields = {
  name: { value: string; error: string };
  message: string;
  status: string;
  id: number | null;
};

export const createSpecificationAction = async (
  prevState: CreateSpecificationFields,
  formData: FormData,
): Promise<CreateSpecificationFields> => {
  const validate = getFormActionState<CreateSpecificationFields>(
    formData,
    prevState,
    createSpecificationSchema,
  );

  if (validate.isValid) {
    const cookieStore = await cookies();

    await fetchService
      .post<SpecificationModel>({
        url: "specifications/create",
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
          revalidatePath("/specifications");
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
  prevState: CreateSpecificationFields,
  formData: FormData,
): Promise<CreateSpecificationFields> => {
  const validate = getFormActionState<CreateSpecificationFields>(
    formData,
    prevState,
    createSpecificationSchema,
  );

  const id = validate.newState.id;

  if (validate.isValid && id) {
    const cookieStore = await cookies();

    await fetchService
      .patch<null>({
        url: `specifications/${id}`,
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
          revalidateTag("Specifications", "max");
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

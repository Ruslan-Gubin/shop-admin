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
import { getFormActionState, getValidatePayload } from "@/shared/services/get-form-action-state";
import { resetNewStateValues } from "@/shared/services/reset-new-store-values";
import { setNewStoreErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
import { createProductSpecificationSchema, createSpecificationSchema } from "./schema";

export type SpecificationModel = {
  id: number;
  name: string;
  type: "text" | "color" | "number";
  created_at: string;
  updated_at: string | null;
};

export type ProductSpecificationModel = {
  id: number;
  product_id: number;
  specification_id: number;
  value: string;
  created_at: Date;
  updated_at: Date | null;
  specification: SpecificationModel;
};

export type FetchSpecificationsResponse = {
  paginationPage: string;
  specifications: SpecificationModel[];
  totalCount: number;
};

export const fetchSpecifications = async (name: string, limit: string, page?: string) => {
  return await fetchService.get<FetchSpecificationsResponse>({
    url: "specifications",
    params: { limit, page: page ? String(page) : "1", name },
    tags: ["Specifications"],
  });
};

export const fetchSpecificationsClient = async (name: string) => {
  const cookieStore = await cookies();

  return await fetchService
    .get<FetchSpecificationsResponse>({
      url: "specifications",
      params: { limit: "100", page: "1", name },
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response.data?.specifications || [];
    });
};

export const fetchSpecification = async (id: string) => {
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
  type: { value: string; error: string };
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

export const updateSpecificationAction = async (
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

export const createSpecification = async (payload: {
  name: string;
  type: string;
}): Promise<number | null> => {
  const { isValid } = getValidatePayload(payload, createSpecificationSchema);

  if (isValid) {
    const cookieStore = await cookies();

    return await fetchService
      .post<SpecificationModel>({
        url: "specifications/create",
        payload: payload,
      })
      .then((response) => {
        if (response.tokens) {
          updateTokensInAction(cookieStore, response.tokens);
        }

        return typeof response.data?.id === "number" ? response.data?.id : null;
      });
  }

  return null;
};

export const createProductSpecificationAction = async (payload: {
  product_id: number;
  specification_id: number;
  value: string;
}): Promise<"error" | "success"> => {
  const { isValid } = getValidatePayload(payload, createProductSpecificationSchema);

  if (isValid) {
    const cookieStore = await cookies();

    return await fetchService
      .post<ProductSpecificationModel>({
        url: "product-specifications/create",
        payload: payload,
      })
      .then((response) => {
        if (response.tokens) {
          updateTokensInAction(cookieStore, response.tokens);
        }

        return response.status;
      });
  }

  return "error";
};

export const updateProductSpecificationAction = async (
  id: number,
  value: string,
): Promise<"error" | "success"> => {
  const cookieStore = await cookies();

  return await fetchService
    .patch<ProductSpecificationModel>({
      url: `product-specifications/${id}`,
      payload: { value },
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response.status;
    });
};

export const deleteProductSpecificationAction = async (
  id: number,
): Promise<"error" | "success"> => {
  const cookieStore = await cookies();

  return await fetchService
    .delete<ProductSpecificationModel>({
      url: `product-specifications/${id}`,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response.status;
    });
};

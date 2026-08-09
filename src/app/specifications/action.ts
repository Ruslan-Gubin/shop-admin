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
import { getValidatePayload } from "@/shared/services/get-form-action-state";
import { setErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
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

export type CreateSpecificationPayload = {
  name: string;
  type: string;
};

export type SpecificationActionResponse = {
  status: "error" | "success";
  errors: Record<keyof CreateSpecificationPayload, string>;
  data: SpecificationModel | null;
  message: string;
};

export const createSpecificationAction = async (
  payload: CreateSpecificationPayload,
): Promise<SpecificationActionResponse> => {
  const validate = getValidatePayload(payload, createSpecificationSchema);

  if (validate.isValid) {
    const cookieStore = await cookies();

    return fetchService
      .post<SpecificationModel>({
        url: "specifications/create",
        payload: payload,
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
          revalidatePath("/specifications");
        }

        return {
          ...response,
          errors: validate.errors,
        };
      });
  }

  return { status: "error", message: "", data: null, errors: validate.errors };
};

export const updateSpecificationAction = async (
  payload: CreateSpecificationPayload,
  id: number,
): Promise<SpecificationActionResponse> => {
  const validate = getValidatePayload(payload, createSpecificationSchema);

  if (validate.isValid) {
    const cookieStore = await cookies();

    return fetchService
      .patch<null>({
        url: `specifications/${id}`,
        payload: payload,
      })
      .then(async (response) => {
        if (response.tokens) {
          updateTokensInAction(cookieStore, response.tokens);
        }

        if (response.status === "error" && response.errors) {
          setErrorFromServer(response.errors, validate.errors);
        } else {
          updateItemCookieAction(cookieStore, id);
          revalidateTag("Specifications", "max");
        }

        return {
          ...response,
          errors: validate.errors,
        };
      });
  }

  return { status: "error", message: "", data: null, errors: validate.errors };
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

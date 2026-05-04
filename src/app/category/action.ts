"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { fetchService } from "@/shared/fetch-api";
import { updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import { getFormActionState } from "@/shared/services/get-form-action-state";
import { resetNewStateValues } from "@/shared/services/reset-new-store-values";
import { setNewStoreErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
import { createCategorySchema } from "./schema";

export interface CategoryModel {
  id: number;
  children: CategoryModel[];
  parent_id: number | null;
  position: number;
  moderated: boolean;
  is_active: boolean;
  created_user_id: number | null;
  name: string;
  description: string;
  product_count: number;
  image: string;
  created_at: string;
  updated_at: string | null;
}

export const fetchCategories = async () => {
  return await fetchService.get<CategoryModel[]>({
    url: "category/categories",
  });
};

export const sortCategoryAction = async (
  id: number,
  parent_id: number | null,
  position: number | null,
): Promise<{ status: "error" | "success"; message: string }> => {
  const cookieStore = await cookies();

  return fetchService
    .patch<null>({
      url: `category/sort/${id}`,
      payload: { parent_id, position },
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      if (response.status === "success") {
        revalidatePath("/category");
      }

      return { status: response.status, message: response.message };
    });
};

export const deleteCategoryAction = async (
  id: number,
  parent_id: number | null,
): Promise<{ status: "error" | "success"; message: string }> => {
  const cookieStore = await cookies();

  return fetchService
    .delete<null>({
      url: `category/${id}/${parent_id}`,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      if (response.status === "success") {
        revalidatePath("/category");
      }

      return { status: response.status, message: response.message };
    });
};

export type CreateCategoryFormFields = {
  name: { value: string; error: string };
  description: { value: string; error: string };
  message: string;
  status: string;
  parent_id: number | null;
  position: number | null;
  id: number | null;
};

export const createCategoryAction = async (
  prevState: CreateCategoryFormFields,
  formData: FormData,
): Promise<CreateCategoryFormFields> => {
  const validate = getFormActionState<CreateCategoryFormFields>(
    formData,
    prevState,
    createCategorySchema,
  );

  if (validate.newState.parent_id) {
    validate.payload.parent_id = validate.newState.parent_id;
  }

  if (validate.newState.position) {
    validate.payload.position = validate.newState.position;
  }

  if (validate.isValid) {
    const cookieStore = await cookies();

    await fetchService
      .post<CategoryModel>({
        url: "category/create",
        payload: validate.payload,
      })
      .then((response) => {
        validate.newState.message = response.message;
        validate.newState.status = response.status;

        if (response.tokens) {
          updateTokensInAction(cookieStore, response.tokens);
        }

        if (response.status === "success" && response.data) {
          resetNewStateValues(validate.newState);
          revalidatePath("/category");
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

export const updateCategoryAction = async (
  prevState: CreateCategoryFormFields,
  formData: FormData,
): Promise<CreateCategoryFormFields> => {
  const validate = getFormActionState<CreateCategoryFormFields>(
    formData,
    prevState,
    createCategorySchema,
  );

  const id = validate.newState.id;

  if (validate.isValid && id) {
    const cookieStore = await cookies();

    await fetchService
      .patch<null>({
        url: `category/${id}`,
        payload: validate.payload,
      })
      .then((response) => {
        validate.newState.message = response.message;
        validate.newState.status = response.status;

        if (response.tokens) {
          updateTokensInAction(cookieStore, response.tokens);
        }

        if (response.status === "success") {
          revalidatePath("/category");
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

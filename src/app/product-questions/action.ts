"use server";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { fetchService } from "@/shared/fetch-api";
import { deleteItemCookieAction, updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import { getValidatePayload } from "@/shared/services/get-form-action-state";
import type { ProductModel } from "../product/action";
import { updateAnswerSchema } from "./schema";

export type QuestionModel = {
  id: number;
  create_user_id: number;
  question: string;
  answer: string;
  created_at: string;
  update_at: string | null;
  product: ProductModel;
};

export type FetchProductQuestionsResponse = {
  paginationPage: string;
  questions: QuestionModel[];
  totalCount: number;
};

export const fetchProductQuestions = async (limit: string, page?: string) => {
  return await fetchService.get<FetchProductQuestionsResponse>({
    url: "product-question/all",
    params: { limit, page: page ? page : "1" },
    tags: ["ProductQuestions"],
  });
};

export const fetchProductQuestion = async (id: string) => {
  const cookieStore = await cookies();

  return await fetchService
    .get<QuestionModel>({
      url: `product-question/${id}`,
      tags: [`ProductQuestions_${id}`],
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response;
    });
};

export const deleteProductQuestionAction = async (
  id: number,
): Promise<{ status: "error" | "success"; message: string }> => {
  const cookieStore = await cookies();

  return fetchService
    .delete<null>({
      url: `product-question/${id}`,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      if (response.status === "success") {
        revalidateTag("ProductQuestions", "max");
        deleteItemCookieAction(cookieStore, id);
      }

      return { status: response.status, message: response.message };
    });
};

export type UpdateAnswerPayload = {
  answer: string;
};

export const updateProductQuestionAction = async (
  payload: UpdateAnswerPayload,
  id: number,
): Promise<{
  status: "error" | "success";
  errors: Record<keyof UpdateAnswerPayload, string>;
  data: QuestionModel | null;
}> => {
  const { isValid, errors } = getValidatePayload(payload, updateAnswerSchema);

  if (isValid) {
    const cookieStore = await cookies();

    return await fetchService
      .patch<QuestionModel>({
        url: `product-question/${id}`,
        payload,
      })
      .then((response) => {
        if (response.tokens) {
          updateTokensInAction(cookieStore, response.tokens);
        }

        if (response.status === "success") {
          revalidateTag("ProductQuestions", "max");
        }

        return { status: response.status, errors, data: response.data };
      });
  }

  return { status: "error", errors, data: null };
};

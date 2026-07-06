"use server";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { fetchService } from "@/shared/fetch-api";
import { deleteItemCookieAction, updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import { getValidatePayload } from "@/shared/services/get-form-action-state";
import type { ProductModel } from "../product/action";
import { answerReviewSchema } from "./schema";

export type ReviewModel = {
  id: number;
  product: ProductModel;
  create_user_id: number;
  dignities: string;
  disadvantages: string;
  comment: string;
  answer: string;
  rating: number;
  created_at: string;
  updated_at: string | null;
};

export type FetchProductReviewsResponse = {
  paginationPage: string;
  reviews: ReviewModel[];
  totalCount: number;
};

export const fetchProductReviews = async (limit: string, page?: string) => {
  return await fetchService.get<FetchProductReviewsResponse>({
    url: "product-review/all",
    params: { limit, page: page ? page : "1" },
    tags: ["ProductReviews"],
  });
};

export const fetchProductReview = async (id: string) => {
  const cookieStore = await cookies();

  return await fetchService
    .get<ReviewModel>({
      url: `product-review/${id}`,
      tags: [`ProductReviews_${id}`],
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response;
    });
};

export const deleteProductReviewAction = async (
  id: number,
): Promise<{ status: "error" | "success"; message: string }> => {
  const cookieStore = await cookies();

  return fetchService
    .delete<null>({
      url: `product-review/${id}`,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      if (response.status === "success") {
        revalidateTag("ProductReviews", "max");
        deleteItemCookieAction(cookieStore, id);
      }

      return { status: response.status, message: response.message };
    });
};

export type AnswerReviewPayload = {
  answer: string;
};

export const answerProductReviewAction = async (
  payload: AnswerReviewPayload,
  id: number,
): Promise<{
  status: "error" | "success";
  errors: Record<keyof AnswerReviewPayload, string>;
  data: ReviewModel | null;
}> => {
  const { isValid, errors } = getValidatePayload(payload, answerReviewSchema);

  if (isValid) {
    const cookieStore = await cookies();

    return await fetchService
      .patch<ReviewModel>({
        url: `product-review/answer/${id}`,
        payload,
      })
      .then((response) => {
        if (response.tokens) {
          updateTokensInAction(cookieStore, response.tokens);
        }

        if (response.status === "success") {
          revalidateTag("ProductReviews", "max");
        }

        return { status: response.status, errors, data: response.data };
      });
  }

  return { status: "error", errors, data: null };
};

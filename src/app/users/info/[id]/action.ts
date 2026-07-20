"use server";
import type { OrderModel } from "@/app/orders/action";
import type { QuestionModel } from "@/app/product-questions/action";
import type { ReviewModel } from "@/app/product-reviews/action";
import { fetchService } from "@/shared/fetch-api";
import type { UserModel } from "../../action";

export type FetchUserOrdersResponse = {
  paginationPage: string;
  orders: OrderModel[];
  totalCount: number;
};

export type FetchUserReviewsResponse = {
  paginationPage: string;
  reviews: ReviewModel[];
  totalCount: number;
};

export type FetchUserQuestionsResponse = {
  paginationPage: string;
  questions: QuestionModel[];
  totalCount: number;
};

export const fetchUserInfoPage = async (
  id: string,
  orderPage: string,
  reviewPage: string,
  questionPage: string,
) => {
  const tag = `${id}_${orderPage}_${reviewPage}_${questionPage}`;

  return await fetchService.fetchChain<
    [UserModel, FetchUserOrdersResponse, FetchUserReviewsResponse, FetchUserQuestionsResponse]
  >([
    {
      url: `users/${id}`,
      tags: [`Users_${tag}`],
      revalidate: 30,
    },
    {
      url: `orders/user/${id}`,
      params: { limit: "5", page: orderPage },
      tags: [`UserOrders_${tag}`],
      revalidate: 30,
    },
    {
      url: `product-review/user/${id}`,
      params: { limit: "5", page: reviewPage },
      tags: [`UserReviews_${tag}`],
      revalidate: 30,
    },
    {
      url: `product-question/user/${id}`,
      params: { limit: "5", page: questionPage },
      tags: [`UserQuestions_${tag}`],
      revalidate: 30,
    },
  ]);
};

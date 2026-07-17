"use server";
import { fetchService } from "@/shared/fetch-api";
import type { OrderModel } from "./orders/action";
import type { ProductModel } from "./product/action";
import type { QuestionModel } from "./product-questions/action";
import type { PromotionModel } from "./promotions/action";
import type { TransferModel } from "./transfer/action";
import type { UserModel } from "./users/action";

export type SalesItem = {
  date: string;
  cash: number;
  card: number;
};

export const fetchDashboardData = async () => {
  return await fetchService.fetchChain<
    [
      {
        paginationPage: string;
        users: UserModel[];
        totalCount: number;
      },
      {
        paginationPage: string;
        orders: OrderModel[];
        totalCount: number;
      },
      {
        transfers: TransferModel[];
        totalCount: number;
        paginationPage: string;
      },
      {
        paginationPage: string;
        products: ProductModel[];
        totalCount: number;
      },
      {
        paginationPage: string;
        orders: OrderModel[];
        totalCount: number;
      },
      {
        paginationPage: string;
        questions: QuestionModel[];
        totalCount: number;
      },
      {
        transfers: TransferModel[];
        totalCount: number;
        paginationPage: string;
      },
      ProductModel[],
      PromotionModel[],
      SalesItem[],
      {
        total: number;
        totalCart: number;
        totalCash: number;
        averageCheck: number;
        ordersCount: number;
        discount: number;
      },
    ]
  >([
    {
      url: "users/users",
      params: { limit: "1", page: "1" },
      tags: [`UsersDashboard`],
      revalidate: 30,
    },
    {
      url: "orders",
      params: { limit: "1", page: "1" },
      tags: [`OrdersDashboard`],
      revalidate: 30,
    },
    {
      url: "transfers",
      tags: [`TransfersDashboard`],
      params: { page: "1", limit: "1" },
      revalidate: 30,
    },
    {
      url: "product/products",
      params: { limit: "1", page: "1" },
      tags: ["ProductsDashboard"],
    },
    {
      url: "orders",
      params: { limit: "10", page: "1", status: "new" },
      tags: [`NewOrdersDashboard`],
      revalidate: 30,
    },
    {
      url: "product-question/unanswered",
      params: { limit: "10", page: "1" },
      tags: ["UnansweredQuestions"],
    },
    {
      url: "transfers",
      tags: [`TransfersDashboard`],
      params: { page: "1", limit: "10", status: "processing" },
      revalidate: 30,
    },
    {
      url: "product/running-low",
      tags: ["ProductsRunningLow"],
      revalidate: 30,
    },
    {
      url: "promotions/active",
      tags: ["PromotionsActive"],
      revalidate: 30,
    },
    {
      url: "orders/sales-by-payment",
      params: {},
      tags: ["OrdersSalesSchedule"],
      //revalidate: 30,
    },
    {
      url: "orders/stats",
      tags: ["OrdersStats"],
      revalidate: 30,
    },
  ]);
};

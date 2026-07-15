"use server";
import { fetchService } from "@/shared/fetch-api";
import type { OrderModel } from "./orders/action";
import type { ProductModel } from "./product/action";
import type { TransferModel } from "./transfer/action";
import type { UserModel } from "./users/action";

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
      params: { limit: "1000", page: "1", status: "new" },
      tags: [`NewOrdersDashboard`],
      revalidate: 30,
    },
    {
      url: "orders/stats",
      tags: ["OrdersStats"],
      revalidate: 30,
    },
  ]);
};

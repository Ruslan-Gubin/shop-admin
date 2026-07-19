"use server";
import { cookies } from "next/headers";
import type { FetchWarehousesResponse } from "@/app/warehouses/action";
import { fetchService } from "@/shared/fetch-api";
import { updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import type { ResponseData } from "@/shared/types/response";

export type ReceiptProduct = {
  product_id: number;
  stocks: Record<string, number>;
  prices: Record<string, number>;
};

export type ReceiptModel = {
  id: number;
  user_id: number;
  products: ReceiptProduct[];
  created_at: string;
  updated_at: string | null;
};

export interface ReceiptModelTable extends ReceiptModel {
  position_count: number;
  total_count: number;
  display_stocks: string;
}

export type ReceiptListResponse = {
  paginationPage: string;
  receipts: ReceiptModel[];
  totalCount: number;
};

export const fetchReceipts = async (limit: string, page: string, name: string) => {
  return await fetchService.get<ReceiptListResponse>({
    url: "receipt",
    params: { limit, page, name },
    tags: [`Receipts_${limit}_${page}_${name}`],
    revalidate: 30,
  });
};

export const fetchReceiptsWithWarehouses = async (limit: string, page: string, name: string) => {
  return await fetchService.fetchChain<[ReceiptListResponse, FetchWarehousesResponse]>([
    {
      url: "receipt",
      params: { limit, page, name },
      tags: [`Receipts_${limit}_${page}_${name}`],
      revalidate: 30,
    },
    {
      url: "warehouses",
      params: { limit: "100", page: "1" },
      tags: ["Warehouses"],
      revalidate: 30,
    },
  ]);
};

export type ReceiptDetailResponse = {
  receipt: ReceiptModel;
  productInfo: Record<number, string>;
};

export const fetchReceipt = async (id: string) => {
  const cookieStore = await cookies();

  return await fetchService
    .get<ReceiptDetailResponse>({
      url: `receipt/${id}`,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }
      return {
        ...response,
        data: response.data?.receipt || null,
      } as ResponseData<ReceiptModelTable>;
    });
};

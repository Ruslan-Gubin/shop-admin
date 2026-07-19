"use server";
import type { FetchWarehousesResponse } from "@/app/warehouses/action";
import { fetchService } from "@/shared/fetch-api";
import type { ReceiptModel } from "../action";

export const fetchReceiptDetail = async (id: string) => {
  return await fetchService.fetchChain<
    [{ receipt: ReceiptModel; productInfo: Record<number, string> }, FetchWarehousesResponse]
  >([
    {
      url: `receipt/${id}`,
      tags: [`Receipt_${id}`],
    },
    {
      url: "warehouses",
      params: { limit: "100", page: "1" },
      tags: ["Warehouses"],
      revalidate: 30,
    },
  ]);
};

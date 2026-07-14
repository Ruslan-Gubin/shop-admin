"use server";
import { cookies } from "next/headers";
import { fetchService } from "@/shared/fetch-api";
import { updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import type { AddressItem } from "@/shared/ui/mapbox/Mapbox";
import type { WarehouseModel } from "../warehouses/action";

export type TransferType = "transfer" | "delivery";
export type TransferStatus = "processing" | "completed" | "rejected";

export type TransferModel = {
  id: number;
  type: TransferType;
  order_id: number;
  from_warehouse: WarehouseModel | null;
  to_warehouse: WarehouseModel | null;
  to_address: AddressItem | null;
  created_at: string;
  updated_at: string | null;
  status: TransferStatus;
};

export interface TransferModelTable extends TransferModel {
  from_warehouse_name: string;
  to_address_formatted: string;
}

export type FetchTransfersResponse = {
  transfers: TransferModel[];
  totalCount: number;
  paginationPage: string;
};

export const fetchTransfers = async (limit: string, page: string) => {
  return fetchService.get<FetchTransfersResponse>({
    url: "transfers",
    tags: [`Transfers_${limit}_${page}`],
    params: { page, limit },
    revalidate: 30,
  });
};

export const fetchTransfer = async (id: string) => {
  const cookieStore = await cookies();

  return await fetchService
    .get<TransferModelTable>({
      url: `transfers/${id}`,
      tags: [`Transfers_${id}`],
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response;
    });
};

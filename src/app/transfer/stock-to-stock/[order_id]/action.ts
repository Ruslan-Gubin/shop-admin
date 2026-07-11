"use server";
import { cookies } from "next/headers";
import type { OrderModel } from "@/app/orders/action";
import type { OrderProductModel, OrderReservation } from "@/app/orders/edit/[id]/action";
import type { ProductStockModel } from "@/app/warehouses/action";
import { fetchService } from "@/shared/fetch-api";
import { updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import type { TransferModel } from "@/shared/types/transfer";

export const fetchTransferStockToStock = async (id: string) => {
  return await fetchService.fetchChain<
    [TransferModel[], ProductStockModel[], OrderProductModel[], OrderModel]
  >([
    {
      url: `transfers/transfer-order/${id}`,
    },
    {
      url: `product-stock/order/${id}`,
    },
    {
      url: `order-product/order/${id}`,
    },
    {
      url: `orders/${id}`,
    },
  ]);
};

export type CreateTransferOrderToOrderPayload = {
  transfers: {
    type: string;
    order_id: number;
    from_warehouse_id: number;
    to_warehouse_id: number;
  }[];
  reservations: {
    id: number;
    reservations: OrderReservation[];
  }[];
};

export const createTransferOrderToOrderAction = async (
  payload: CreateTransferOrderToOrderPayload,
) => {
  const cookieStore = await cookies();

  return await fetchService
    .post<null>({
      url: "orders/ship",
      payload,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response;
    });
};

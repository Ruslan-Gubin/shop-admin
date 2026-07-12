"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { fetchService } from "@/shared/fetch-api";
import { updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import type { TransferModel } from "@/shared/types/transfer";
import type { OrderModel } from "../../action";

export type OrderReservation = {
  quantity: number;
  stock_id: number;
  warehouse_id: number;
};

export type OrderProductModel = {
  id: number;
  order_id: number;
  product_id: number;
  name: string;
  code: string;
  price: number;
  quantity: number;
  description: string;
  country: string;
  equipment: string;
  product_type: string;
  height: number;
  width: number;
  length: number;
  weight: number;
  created_at: string;
  updated_at: string;
  reservations: OrderReservation[];
  transfers: OrderReservation[];
};

export const fetchOrderEditPage = async (id: string) => {
  return await fetchService.fetchChain<
    [OrderProductModel[], OrderModel, TransferModel[], TransferModel[]]
  >([
    {
      url: `order-product/order/${id}`,
      tags: [`OrderProduct_${id}`],
      revalidate: 30,
    },
    {
      url: `orders/${id}`,
      tags: [`Orders_${id}`],
      revalidate: 30,
    },
    {
      url: `transfers/transfer-order/${id}`,
      tags: [`TransfersOrder_${id}`],
      revalidate: 30,
    },
    {
      url: `transfers/delivery-order/${id}`,
      tags: [`DeliveryOrder_${id}`],
      revalidate: 30,
    },
  ]);
};

export const changeOrderStatusAction = async (id: number) => {
  const cookieStore = await cookies();

  return await fetchService
    .post<null>({
      url: `orders/change-status/${id}`,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      revalidatePath("/orders/edit/");
      return response;
    });
};

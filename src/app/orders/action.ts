"use server";
import { cookies } from "next/headers";
import { fetchService } from "@/shared/fetch-api";
import { updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import type { AddressItem } from "@/shared/ui/mapbox/Mapbox";

export type OrderStatus =
  | "new"
  | "cancelled_new"
  | "processing"
  | "cancelled_assembly"
  | "ready"
  | "in_delivery"
  | "cancelled_delivery"
  | "completed"
  | "cancelled_customer";

export type OrderPaymentMethod = "cash" | "card";
export type OrderMethodReceipt = "courier" | "pickup";

export type OrderModel = {
  status: OrderStatus;
  payment_method: OrderPaymentMethod;
  method_receipt: OrderMethodReceipt;
  id: number;
  address: AddressItem | null;
  create_user_id: number;
  order_number: string;
  comment: string;
  rejected_reason: string;
  phone: string;
  phoneCode: string;
  recipient_name: string;
  date_from: string | null;
  date_to: string | null;
  discount_quantity: number;
  discount_name: string;
  discount_percent: number;
  discount_total: number;
  subtotal: number;
  total: number | string;
  created_at: string;
  updated_at: string | null;
};

export type FetchOrdersResponse = {
  paginationPage: string;
  orders: OrderModel[];
  totalCount: number;
};

export const fetchOrders = async (limit: string, page: string, order_number: string) => {
  return await fetchService.get<FetchOrdersResponse>({
    url: "orders",
    params: { limit, page, order_number },
    tags: [`Orders_${page}_${limit}_${order_number}`],
    revalidate: 30,
  });
};

export const fetchOrder = async (id: string) => {
  const cookieStore = await cookies();

  return await fetchService
    .get<OrderModel>({
      url: `orders/${id}`,
      tags: [`Orders_${id}`],
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response;
    });
};

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { fetchService } from "@/shared/fetch-api";
import { deleteItemCookieAction, updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import { getValidatePayload } from "@/shared/services/get-form-action-state";
import { createProductStockSchema } from "./schema";
import { setErrorFromServer } from "@/shared/services/set-new-store-error-from-server";

export type WarehouseModel = {
  id: number;
  name: string;
  address: string;
  area: string;
  city: string;
  street: string;
  house: string;
  index: string;
  office: string;
  create_user_id: number;
  description: string;
  is_active: boolean;
  default_warehouse: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string | null;
};

export type ProductStockModel = {
  id: number;
  warehouse_id: number;
  product_id: number;
  quantity: number;
  reserved: number;
  available: number;
  in_stock: boolean;
  accounting: boolean; // TODO remove Учёт
  created_at: string;
  updated_at: string | null;
};

export type FetchWarehousesResponse = {
  paginationPage: string;
  warehouses: WarehouseModel[];
  totalCount: number;
};

export const fetchWarehouses = async (limit: string, page?: string, name?: string) => {
  return await fetchService.get<FetchWarehousesResponse>({
    url: "warehouses",
    params: { limit, page: page ? page : "1", name: name ? name : "" },
    tags: ["Warehouses"],
  });
};

export const fetchWarehouse = async (id: string) => {
  "use server";
  const cookieStore = await cookies();

  return await fetchService
    .get<WarehouseModel>({
      url: `warehouses/${id}`,
      tags: [`Warehouses_${id}`],
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response;
    });
};

export const deleteWarehouseAction = async (
  id: number,
): Promise<{ status: "error" | "success"; message: string }> => {
  "use server";
  const cookieStore = await cookies();

  return fetchService
    .delete<null>({
      url: `warehouses/${id}`,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      if (response.status === "success") {
        revalidateTag("Warehouses", "max");
        deleteItemCookieAction(cookieStore, id);
      }

      return { status: response.status, message: response.message };
    });
};

type ProductStockPayload = {
  warehouse_id: number;
  product_id: number;
  quantity?: number;
  reserved?: number;
  in_stock?: boolean;
  accounting?: boolean;
};

export const createProductStock = async (
  payload: ProductStockPayload,
): Promise<"error" | "success"> => {
  const { isValid } = getValidatePayload(payload, createProductStockSchema);

  if (isValid) {
    const cookieStore = await cookies();

    return await fetchService
      .post<ProductStockModel>({
        url: "product-stock/create",
        payload: payload,
      })
      .then((response) => {
        if (response.tokens) {
          updateTokensInAction(cookieStore, response.tokens);
        }

        return response.status;
      });
  }

  return "error";
};

export const updateProductStock = async (
  payload: ProductStockPayload,
  id: number,
): Promise<"error" | "success"> => {
  const { isValid } = getValidatePayload(payload, createProductStockSchema);

  if (isValid) {
    const cookieStore = await cookies();

    return await fetchService
      .patch<ProductStockModel>({
        url: `product-stock/${id}`,
        payload: payload,
      })
      .then((response) => {
        if (response.tokens) {
          updateTokensInAction(cookieStore, response.tokens);
        }

        return response.status;
      });
  }

  return "error";
};

export const deleteProductStock = async (id: number): Promise<"error" | "success"> => {
  const cookieStore = await cookies();

  return await fetchService
    .delete<null>({
      url: `product-stock/${id}`,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response.status;
    });
};

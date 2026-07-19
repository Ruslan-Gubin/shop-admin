"use server";
import { cookies } from "next/headers";
import type { CategoryModel } from "@/app/category/action";
import type { PriceFillModel, RangeModel } from "@/app/price-auto-fill/action";
import type { FetchPriceTypesResponse } from "@/app/price-types/action";
import type { ProductModel, ProductPriceModel } from "@/app/product/action";
import type { FetchWarehousesResponse } from "@/app/warehouses/action";
import { fetchService } from "@/shared/fetch-api";
import { updateTokensInAction } from "@/shared/helpers/updateCookieAction";

export const fetchIncomeFormData = async () => {
  return await fetchService.fetchChain<
    [
      FetchWarehousesResponse,
      CategoryModel[],
      FetchPriceTypesResponse,
      RangeModel[],
      PriceFillModel[],
    ]
  >([
    {
      url: "warehouses",
      params: { limit: "100", page: "1" },
      tags: ["Warehouses"],
      revalidate: 30,
    },
    { url: "category/categories", tags: ["Categories"], revalidate: 30 },
    {
      url: "price-type/types",
      params: { limit: "100", page: "1" },
      tags: ["PriceTypes"],
      revalidate: 30,
    },
    { url: "price-ranges", tags: ["PriceRanges"], revalidate: 30 },
    { url: "price-fill", tags: ["PriceFill"], revalidate: 30 },
  ]);
};

export const searchProductsByCodeAction = async (q: string) => {
  const cookieStore = await cookies();

  return await fetchService
    .get<ProductModel[]>({
      url: "product/search-for-receipt",
      params: { q },
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }
      return response;
    });
};

export const fetchProductsByCategoryAction = async (categoryId: number) => {
  const cookieStore = await cookies();

  return await fetchService
    .get<ProductModel[]>({
      url: `product/category/${categoryId}`,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }
      return response;
    });
};

export const fetchProductPrices = async (product_id: number) => {
  const cookieStore = await cookies();

  return await fetchService
    .get<ProductPriceModel[]>({
      url: `product-price/${product_id}`,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }
      return response;
    });
};

export type IncomeItem = {
  tempId: string;
  productId: number | null;
  name: string;
  code: string;
  purchasePrice: number;
  priceValues: Record<string, number>;
  stocks: Record<number, number>;
};

export const submitIncomeAction = async (payload: IncomeItem[]) => {
  const cookieStore = await cookies();

  const updatePayload = payload.map((el) => ({
    productId: el.productId,
    name: el.name,
    code: el.code,
    purchasePrice: el.purchasePrice,
    priceValues: el.priceValues,
    stocks: el.stocks,
  }));

  return fetchService
    .post<{ id: number }>({ url: "receipt/create", payload: updatePayload })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response;
    });
};

"use server";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { fetchService } from "@/shared/fetch-api";
import { updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import { PriceFillModel, RangeModel } from "../price-auto-fill/action";
import { FetchPriceTypesResponse } from "../price-types/action";
import { CategoryModel } from "../category/action";

export interface ProductModel {
  additional_photos: string;
  brand_id: number;
  buy_count: number;
  category_id: number;
  code: string;
  color: string;
  count: number;
  created_at: string;
  department_id: number | null;
  description: string;
  discount: number;
  id: number;
  is_hit: boolean;
  is_stock: boolean;
  main_photo: string;
  name: string;
  old_price: number;
  on_save: boolean;
  options: string;
  price: number;
  rating: number;
  title: string;
  unit: string;
  updated_at: string | null;
  views: number;
}

export const fetchProductFormData = async () => {
  return await fetchService.fetchChain<
    [RangeModel[], FetchPriceTypesResponse, PriceFillModel[], CategoryModel[]]
  >([
    {
      url: "price-ranges",
      tags: ["PriceRanges"],
    },
    {
      url: "price-type/types",
      params: { limit: "100", page: "1" },
      tags: [`PriceTypes`],
    },
    {
      url: "price-fill",
      tags: [`PriceFill`],
    },
    {
      url: "category/categories",
      tags: [`Categories`],
    },
  ]);
};

export const fetchProducts = async (page?: string, name?: string) => {
  return await fetchService.get<{
    paginationPage: string;
    products: ProductModel[];
    totalCount: number;
  }>({
    url: "product/products",
    params: {
      limit: "10",
      page: page ? String(page) : "1",
      ...(name ? { name } : {}),
    },
    tags: ["Products"],
  });
};

export const fetchProduct = async (id: string) => {
  const cookieStore = await cookies();

  return await fetchService
    .get<ProductModel>({
      url: `product/${id}`,
      tags: [`Products_${id}`],
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }
      return response;
    });
};

export const deleteProductAction = async (
  id: number,
): Promise<{ status: "error" | "success"; message: string }> => {
  const cookieStore = await cookies();

  return fetchService
    .delete<null>({
      url: `product/${id}`,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      if (response.status === "success") {
        revalidateTag("Products", "max");
      }

      return { status: response.status, message: response.message };
    });
};

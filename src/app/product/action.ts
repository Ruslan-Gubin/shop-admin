"use server";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { fetchService } from "@/shared/fetch-api";
import { updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import { getValidatePayload } from "@/shared/services/get-form-action-state";
import { setErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
import type { CategoryModel } from "../category/action";
import type { PriceFillModel, RangeModel } from "../price-auto-fill/action";
import type { FetchPriceTypesResponse } from "../price-types/action";
import type {
  FetchSpecificationsResponse,
  ProductSpecificationModel,
} from "../specifications/action";
import type { FetchWarehousesResponse, ProductStockModel } from "../warehouses/action";
import { createProductPriceSchema } from "./schema";

export type PhotoItem = {
  created_at: string;
  id: number;
  parent_id: number;
  parent_type: string;
  position: number;
  updated_at: string;
  url: string;
};

export interface ProductModel {
  id: number;
  name: string;
  code: string;
  brand_id: number | null;
  brand_name: string;
  category_id: number;
  description: string;
  country: string;
  product_type: string;
  equipment: string;
  weight: number;
  height: number;
  length: number;
  width: number;
  purchase_price: number;
  created_at: string;
  updated_at: string | null;
  accounting: boolean;
  available: number;
  rating: number;
  review_count: number;
  views: number;
  price_list: { price: number; minQuantity: number }[];
  photos: PhotoItem[];
  seo_title: string;
  seo_description: string;
  slug: string;
  og_title: string;
  og_description: string;
  og_type: string;
  keywords: string;
}

export interface ProductPriceModel {
  id: number;
  product_id: number;
  price_type_id: number;
  price: number;
  created_at: string;
  updated_at: string | null;
}

export const fetchProductFormData = async () => {
  return await fetchService.fetchChain<
    [
      RangeModel[],
      FetchPriceTypesResponse,
      PriceFillModel[],
      CategoryModel[],
      FetchWarehousesResponse,
      FetchSpecificationsResponse,
    ]
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
    {
      url: "warehouses",
      params: { limit: "100", page: "1" },
      tags: [`Warehouses`],
    },
    {
      url: "specifications",
      params: { limit: "1000", page: "1", name: "" },
      tags: [`Specifications`],
    },
  ]);
};

export const fetchProductFormEditData = async (id: string) => {
  return await fetchService.fetchChain<
    [
      ProductModel,
      RangeModel[],
      FetchPriceTypesResponse,
      PriceFillModel[],
      CategoryModel[],
      ProductPriceModel[],
      ProductSpecificationModel[],
      FetchSpecificationsResponse,
      FetchWarehousesResponse,
      ProductStockModel[],
    ]
  >([
    {
      url: `product/${id}`,
      tags: [`Product_${id}`],
    },
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
    {
      url: `product-price/${id}`,
      tags: [`ProductPrices`],
    },
    {
      url: `product-specifications/product/${id}`,
      tags: [`ProductSpecifications`],
    },
    {
      url: "specifications",
      params: { limit: "1000", page: "1", name: "" },
      tags: [`Specifications`],
    },
    {
      url: "warehouses",
      params: { limit: "100", page: "1" },
      tags: [`Warehouses`],
    },
    {
      url: `product-stock/product/${id}`,
      tags: [`ProductStockProduct_${id}`],
    },
  ]);
};

export const fetchProducts = async (limit: string, page: string, name: string) => {
  return await fetchService.get<{
    paginationPage: string;
    products: ProductModel[];
    totalCount: number;
  }>({
    url: "product/products",
    params: { limit, page, name },
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

export type ProductPricePayload = {
  product_id: number;
  price_type_id: number;
  price: number;
};

export const createProductPriceAction = async (
  payload: ProductPricePayload,
): Promise<{
  status: "error" | "success";
  errors: Record<keyof ProductPricePayload, string>;
  data: ProductPriceModel | null;
}> => {
  const { isValid, errors } = getValidatePayload(payload, createProductPriceSchema);

  if (isValid) {
    const cookieStore = await cookies();

    return await fetchService
      .post<ProductPriceModel>({
        url: "product-price/create",
        payload: payload,
      })
      .then((response) => {
        if (response.tokens) {
          updateTokensInAction(cookieStore, response.tokens);
        }

        if (response.status === "error" && response.errors) {
          setErrorFromServer(response.errors, errors);
        }

        return { status: response.status, errors, data: response.data };
      });
  }

  return { status: "error", errors, data: null };
};

export const editProductPriceAction = async (
  id: number,
  price: number,
): Promise<"error" | "success"> => {
  const cookieStore = await cookies();

  return await fetchService
    .patch<null>({
      url: `product-price/${id}`,
      payload: { price },
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response.status;
    });
};

export const deleteProductPriceAction = async (id: number): Promise<"error" | "success"> => {
  const cookieStore = await cookies();

  return fetchService
    .delete<null>({
      url: `product-price/${id}`,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response.status;
    });
};

export const deletePhotoAction = async (id: number): Promise<"error" | "success"> => {
  const cookieStore = await cookies();

  return fetchService
    .delete<null>({
      url: `photo/${id}`,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response.status;
    });
};

export const changePositionPhotoAction = async (
  id: number,
  position: number,
): Promise<"error" | "success"> => {
  const cookieStore = await cookies();

  return fetchService
    .patch<null>({
      url: `photo/${id}`,
      payload: { position },
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response.status;
    });
};

export const createPhotoAction = async (payload: {
  url: string;
  parent_type: string;
  parent_id: number;
  position: number;
}): Promise<"error" | "success"> => {
  const cookieStore = await cookies();

  return fetchService
    .post<PhotoItem>({
      url: "photo/create",
      payload,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response.status;
    });
};

export const getParsePhotoAction = async (name: string) => {
  const cookieStore = await cookies();

  return fetchService
    .get<string[]>({
      url: `product-source-record/pick-images?query=${name}`,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response;
    });
};

export type SeoModel = {
  seo_title: string;
  seo_description: string;
  slug: string;
  og_title: string;
  og_description: string;
  og_type: string;
  keywords: string;
};

export type SeoSuggestionPayload = {
  name: string;
  description?: string;
  brand_name?: string;
  category_name?: string;
  seo?: {
    seo_title?: string;
    seo_description?: string;
    slug?: string;
    og_title?: string;
    og_description?: string;
    og_type?: string;
    keywords?: string;
  };
};

export const getSeoSuggestionAction = async (payload: SeoSuggestionPayload) => {
  const cookieStore = await cookies();

  return fetchService
    .post<SeoModel>({
      url: "product-source-record/generate-seo",
      payload,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response;
    });
};

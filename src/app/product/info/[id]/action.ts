import type { CategoryModel } from "@/app/category/action";
import type { FetchPriceTypesResponse } from "@/app/price-types/action";
import type { ProductSpecificationModel } from "@/app/specifications/action";
import type { ProductStockModel } from "@/app/warehouses/action";
import { fetchService } from "@/shared/fetch-api";
import type { ProductModel, ProductPriceModel } from "../../action";

export const fetchProductInfo = async (id: string) => {
  return await fetchService.fetchChain<
    [
      number,
      { questions: { id: number }[]; totalCount: number; paginationPage: number },
      ProductModel,
      FetchPriceTypesResponse,
      CategoryModel[],
      ProductPriceModel[],
      ProductSpecificationModel[],
      ProductStockModel[],
    ]
  >([
    {
      url: `product/total-sold/${id}`,
      tags: [`TotalSold_${id}`],
    },
    {
      url: `product-question/product/${id}`,
      tags: [`ProductQuestion_${id}`],
      params: { limit: "1", page: "1" },
    },
    {
      url: `product/${id}`,
      tags: [`Product_${id}`],
    },
    {
      url: "price-type/types",
      params: { limit: "100", page: "1" },
      tags: [`PriceTypes`],
    },
    {
      url: `product/full-path-categories/${id}`,
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
      url: `product-stock/product/${id}`,
      tags: [`ProductStockProduct_${id}`],
    },
  ]);
};

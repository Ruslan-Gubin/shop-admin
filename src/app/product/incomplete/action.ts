"use server";
import { fetchService } from "@/shared/fetch-api";

export type IncompleteItemStatus = "success" | "warn" | "error";

export interface IncompleteProductItem {
  id: number;
  name: string;
  photos: { status: IncompleteItemStatus; message: string };
  price: { status: IncompleteItemStatus; message: string };
  specifications: { status: IncompleteItemStatus; message: string };
  stocks: { status: IncompleteItemStatus; message: string };
  category: { status: IncompleteItemStatus; message: string };
  dimensions: { status: IncompleteItemStatus; message: string };
  country: { status: IncompleteItemStatus; message: string };
  product_type: { status: IncompleteItemStatus; message: string };
  equipment: { status: IncompleteItemStatus; message: string };
}

export const fetchIncompleteProducts = async (limit: string, page: string) => {
  return await fetchService.get<{
    paginationPage: string;
    products: IncompleteProductItem[];
    totalCount: number;
  }>({
    url: "product/incomplete",
    params: { limit, page },
    tags: ["IncompleteProducts"],
    revalidate: 30,
  });
};

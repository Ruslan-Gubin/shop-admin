"use server";
import { cookies } from "next/headers";
import PDFParser, { type Output } from "pdf2json";
import { fetchCategories } from "@/app/category/action";
import { promptCategoryFromProduct } from "@/app/product/prompt";
import { fetchService } from "@/shared/fetch-api";
import { type ImportPdfItem, parseCatalog } from "@/shared/helpers/parse-catalog";
import { updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import { generateAnswer } from "@/shared/llm/generateAnswer";
import type { CategorySuggestion, ProductModel, ProductSourceRecordModel } from "../action";

const pdfParser = new PDFParser();

const getPdfJson = async (buffer: Buffer) => {
  pdfParser.parseBuffer(buffer);

  return new Promise<unknown>((res) => {
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      res(pdfData);
    });
  });
};

export type CheckItemStatus = "empty" | "error" | "record" | "completed";

export const uploadAndParsePdfAction = async (file: File): Promise<ImportPdfItem[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const json = await getPdfJson(buffer);
  return parseCatalog(json as Output);
};

export const checkBarcodeAction = async (barcode_list: { name: string; barcode: string }[]) => {
  const cookieStore = await cookies();

  return await fetchService
    .post<
      Record<string, { status: CheckItemStatus; error_message: string; product_id: number | null }>
    >({
      url: "product-source-record/check-import-items",
      payload: barcode_list,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }
      return response;
    });
};

export const addProductAction = async (barcode: string) => {
  const cookieStore = await cookies();

  return await fetchService
    .post<ProductModel>({
      url: "product-source-record/create-product",
      payload: { barcode },
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }
      return response;
    });
};

export const suggestCategoryForImportAction = async (
  name: string,
  description: string,
): Promise<CategorySuggestion> => {
  return fetchCategories().then((response) => {
    return promptCategoryFromProduct({
      name,
      description,
      categories: response?.data || [],
    })
      .then((prompt) => generateAnswer<CategorySuggestion>(prompt))
      .then((response) => {
        return {
          category_id: response.answer?.category_id || null,
          create_categories:
            Array.isArray(response.answer?.create_categories) &&
            response.answer?.create_categories.length > 0
              ? response.answer.create_categories
              : [],
        };
      });
  });
};

export type SaveGeneratedRecordPayload = Omit<
  ProductSourceRecordModel,
  "id" | "categories" | "createdAt" | "updatedAt"
> & {
  categories: CategorySuggestion;
};

export const saveGeneratedRecordAction = async (payload: SaveGeneratedRecordPayload) => {
  const cookieStore = await cookies();

  return await fetchService
    .post<ProductSourceRecordModel>({
      url: "product-source-record/save-record",
      payload,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }
      return response;
    });
};

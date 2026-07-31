"use server";
import { cookies } from "next/headers";
import PDFParser, { type Output } from "pdf2json";
import { fetchService } from "@/shared/fetch-api";
import { type ImportPdfItem, parseCatalog } from "@/shared/helpers/parse-catalog";
import { updateTokensInAction } from "@/shared/helpers/updateCookieAction";

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
    .post<Record<string, { status: CheckItemStatus; error_message: string }>>({
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

export type GenerateProductType = {
  brand_name?: string;
  category_name?: string;
  country?: string;
  description?: string;
  equipment?: string;
  height?: number;
  length?: number;
  name?: string;
  code?: string;
  photos?: string[];
  product_type?: string;
  seo?: {
    seo_title: string;
    seo_description: string;
    slug: string;
    og_title: string;
    og_description: string;
    og_type: string;
    keywords: string;
  };
  specifications?: { name: string; value: string }[];
  weight?: number;
  width?: number;
};

export const generateProductAction = async (name: string, barcode: string) => {
  const cookieStore = await cookies();

  return await fetchService
    .post<{
      clear_name: string;
      product: GenerateProductType;
      error_message: string;
    }>({ url: "product-source-record", payload: { name, barcode } })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }
      return response;
    });
};

export async function addProductAction(
  barcode: string,
  name: string,
  price: string,
): Promise<{ success: boolean }> {
  void barcode;
  void name;
  void price; // будет использовано в реальном запросе
  // TODO: POST product/create с данными
  await new Promise((r) => setTimeout(r, 800));
  return { success: true };
}

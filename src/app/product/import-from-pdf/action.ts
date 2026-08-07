"use server";
import { cookies } from "next/headers";
import PDFParser, { type Output } from "pdf2json";
import { fetchService } from "@/shared/fetch-api";
import { type ImportPdfItem, parseCatalog } from "@/shared/helpers/parse-catalog";
import { updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import type { ProductModel } from "../action";

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
    .post<Record<string, { status: CheckItemStatus; error_message: string; product_id: number | null }>>({
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

export const addProductAction = async (barcode: string, price: number) => {
  const cookieStore = await cookies();

  return await fetchService
    .post<ProductModel>({
      url: "product-source-record/create-product",
      payload: { barcode, price },
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }
      return response;
    });
};

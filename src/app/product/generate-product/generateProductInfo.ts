import { generateAnswer } from "@/shared/llm/generateAnswer";
import { parseWebProductInfo } from "./parseWebProductInfo";
import { promptNoBarcodeProduct } from "./promptNoBarcodeProduct";
import { promptSearchProduct } from "./promptSearchProduct";

export type GeneratedProductData = {
  brand_name?: string;
  category_name?: string;
  country?: string;
  description?: string;
  equipment?: string;
  height?: number | null;
  length?: number | null;
  name?: string;
  code?: string;
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
  weight?: number | null;
  width?: number | null;
};

export const generateProductInfo = async (name?: string, barcode?: string) => {
  const parseWebInfo = await parseWebProductInfo(name, barcode);

  let prompt = "";

  if (barcode) {
    prompt = await promptSearchProduct(barcode, name, parseWebInfo);
  } else if (!barcode && name) {
    prompt = await promptNoBarcodeProduct(name, parseWebInfo);
  }

  return await generateAnswer<GeneratedProductData>(prompt);
};

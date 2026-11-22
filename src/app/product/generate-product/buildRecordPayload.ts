import type { CategorySuggestion } from "@/app/product/action";
import type { SaveGeneratedRecordPayload } from "@/app/product/import-from-pdf/action";
import type { GeneratedProductData } from "./generateProductInfo";

type BuildRecordPayloadParams = {
  answer: GeneratedProductData;
  barcode: string;
  price: number | null;
  categories: CategorySuggestion;
};

export const buildRecordPayload = ({
  answer,
  barcode,
  price,
  categories,
}: BuildRecordPayloadParams): SaveGeneratedRecordPayload => ({
  value: barcode,
  price,
  name: answer?.name || "",
  description: answer?.description || "",
  code: answer?.code || "",
  product_type: answer?.product_type || "",
  brand_name: answer?.brand_name || "",
  country: answer?.country || "",
  equipment: answer?.equipment || "",
  weight: answer?.weight ?? null,
  height: answer?.height ?? null,
  length: answer?.length ?? null,
  width: answer?.width ?? null,
  seo_title: answer?.seo?.seo_title || "",
  seo_description: answer?.seo?.seo_description || "",
  slug: answer?.seo?.slug || "",
  og_title: answer?.seo?.og_title || "",
  og_description: answer?.seo?.og_description || "",
  og_type: answer?.seo?.og_type || "",
  keywords: answer?.seo?.keywords || "",
  specifications: Array.isArray(answer?.specifications) ? answer.specifications : [],
  categories,
});

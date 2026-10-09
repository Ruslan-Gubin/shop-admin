import { generateAnswer } from "@/shared/llm/generateAnswer";
import type { GenerateProductType } from "../action";
import { parseWebProductInfo } from "./parseWebProductInfo";
import { promptNoBarcodeProduct } from "./promptNoBarcodeProduct";
import { promptSearchProduct } from "./promptSearchProduct";

export const generateProductInfo = async (name?: string, barcode?: string) => {
  const parseWebInfo = await parseWebProductInfo(name, barcode);

  let prompt = "";

  if (barcode) {
    prompt = await promptSearchProduct(barcode, name, parseWebInfo);
  } else if (!barcode && name) {
    prompt = await promptNoBarcodeProduct(name, parseWebInfo);
  }

  return await generateAnswer<GenerateProductType>(prompt);
};

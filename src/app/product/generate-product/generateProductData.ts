import { generateProductInfo } from "./generateProductInfo";
import { generateProductDataSchema } from "./schema";

export const generateProductData = async (name: string, barcode: string) => {
  const parsed = generateProductDataSchema.safeParse({ name, barcode });

  if (!parsed.success) {
    const messages = parsed.error.issues.map((issue) => issue.message);
    throw `Ошибка валидации: ${messages.join("; ")}`;
  }

  // const existing = await getRecordAction(parsed.data.barcode);

  return await generateProductInfo(parsed.data.name, parsed.data.barcode);
};

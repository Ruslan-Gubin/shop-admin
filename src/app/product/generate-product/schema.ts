import { z } from "zod";

export const generateProductDataSchema = z
  .object({
    name: z.string({ message: "Название должно быть строкой" }).trim(),
    barcode: z
      .string({ message: "Штрихкод должен быть строкой" })
      .trim()
      .regex(/^\d{8,14}$/, { message: "Некорректный штрих-код" })
      .or(z.literal("")),
  })
  .refine((data) => data.name.length > 0 || data.barcode.length > 0, {
    message: "Укажите название товара или штрих-код",
  });

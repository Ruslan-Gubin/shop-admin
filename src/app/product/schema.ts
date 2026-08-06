import { z } from "zod";

export const createProductPriceSchema = z.object({
  product_id: z.number({ message: "ID должно быть числом" }),
  price_type_id: z.number({ message: "ID должно быть числом" }),
  price: z.number({ message: "Цена должна быть числом" }),
});

export const categorySuggestionSchema = z.object({
  name: z
    .string({ message: "Название должно быть строкой" })
    .min(3, { message: "Укажите название товара минимум 3 символа" }),
  description: z
    .string({ message: "Описание должно быть строкой" })
    .min(3, { message: "Укажите описание товара минимум 3 символа" }),
});

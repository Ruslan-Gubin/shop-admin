import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string({ message: "Название должно быть строкой" })
    .nonempty({ message: "Название обязательно" })
    .max(50, { message: "Максимум 50 символов" })
    .min(2, { message: "Минимум 2 символа" }),
  code: z
    .string({ message: "Штрихкод должен быть строкой" })
    .nonempty({ message: "Штрихкод обязателен" })
    .regex(/^\d+$/, { message: "Только цифры" })
    .max(14, { message: "Максимум 14 символов" })
    .min(8, { message: "Минимум 8 символов" }),
  description: z.string({ message: "Описание должно быть строкой" }),
  brand_id: z.string({ message: "Бренд должен быть строкой" }),
  category_id: z
    .number({ message: "Категория должна быть числом" })
    .nullable()
    .refine((value) => value === null || Number(value) >= 0, {
      message: "Не может быть отрицательным",
    }),
  country: z
    .string({ message: "Страна-производитель должно быть строкой" })
    .max(100, { message: "Максимум 100 символов" })
    .min(3, { message: "Минимум 3 символа" })
    .or(z.literal("")),
  product_type: z
    .string({ message: "Вид товара должно быть строкой" })
    .max(100, { message: "Максимум 100 символов" })
    .min(3, { message: "Минимум 3 символа" })
    .or(z.literal("")),
  equipment: z
    .string({ message: "Состав товара должен быть строкой" })
    .max(100, { message: "Максимум 100 символов" })
    .min(3, { message: "Минимум 3 символа" })
    .or(z.literal("")),
  purchase_price: z
    .string({ message: "Должна быть строкой" })
    .regex(/^\d+$/, { message: "Только цифры" })
    .refine((value) => value === null || Number(value) >= 0, {
      message: "Не может быть отрицательным",
    })
    .or(z.literal("")),
  weight: z
    .string({ message: "Должна быть строкой" })
    .refine((value) => value === null || Number(value) >= 0, {
      message: "Не может быть отрицательным",
    })
    .or(z.literal("")),
  height: z
    .string({ message: "Должна быть строкой" })
    .refine((value) => value === null || Number(value) >= 0, {
      message: "Не может быть отрицательным",
    })
    .or(z.literal("")),
  length: z
    .string({ message: "Должна быть строкой" })
    .refine((value) => value === null || Number(value) >= 0, {
      message: "Не может быть отрицательным",
    })
    .or(z.literal("")),
  width: z
    .string({ message: "Должна быть строкой" })
    .refine((value) => value === null || Number(value) >= 0, {
      message: "Не может быть отрицательным",
    })
    .or(z.literal("")),
});

import { z } from "zod";

export const createSpecificationSchema = z.object({
  name: z
    .string({ message: "Введите название характеристики" })
    .nonempty()
    .max(100, { message: "Максимум 100 символов" })
    .min(2, { message: "Минимум 2 символа" }),

  type: z
    .string({ message: "Введите тип" })
    .nonempty()
    .max(100, { message: "Максимум 100 символов" })
    .min(1, { message: "Минимум 1 символа" }),
});

export const createProductSpecificationSchema = z.object({
  product_id: z.number({ message: "ID должно быть числом" }),
  specification_id: z.number({ message: "ID должно быть числом" }),
  value: z.string({ message: "Введите значение характеристики" }),
});

import { z } from "zod";

export const createPriceTypeSchema = z.object({
  name: z
    .string({ message: "Введите название типа цены" })
    .nonempty()
    .max(50, { message: "Максимум 50 символов" })
    .min(2, { message: "Минимум 2 символа" }),

  description: z
    .string({ message: "Введите описание типа цены" })
    .max(255, { message: "Максимум 255 символов" })
    .min(2, { message: "Описание должно содержать минимум 2 символа" })
    .optional(),
});

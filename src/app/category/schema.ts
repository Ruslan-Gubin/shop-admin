import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string({ message: "Введите название категории" })
    .nonempty()
    .max(50, { message: "Максимум 50 символов" })
    .min(2, { message: "Минимум 2 символа" }),

  description: z
    .string({ message: "Введите описание категории" })
    .max(255, { message: "Максимум 255 символов" })
    .min(2, { message: "Описание категории должно содержать минимум 2 символа" })
    .optional(),
});

import { z } from "zod";

export const createRangeSchema = z
  .object({
    price_from: z
      .string({ message: "Введите начало диапазона" })
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: "Значение должно быть положительным числом",
      }),

    price_to: z
      .string({ message: "Введите конец диапазона" })
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Значение должно быть положительным числом больше 0",
      }),
  })
  .refine((data) => Number(data.price_to) >= Number(data.price_from), {
    message: "Конец диапазона должен быть больше или равен началу",
    path: ["price_to"],
  });

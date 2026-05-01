import { z } from "zod";

export const createPromotionSchema = z
  .object({
    name: z
      .string({ message: "Введите название акции" })
      .nonempty()
      .max(100, { message: "Максимум 100 символов" })
      .min(2, { message: "Минимум 2 символа" }),

    description: z
      .string({ message: "Введите описание акции" })
      .max(500, { message: "Максимум 500 символов" })
      .optional(),

    percent: z
      .string({ message: "Введите процент скидки" })
      .nonempty({ message: "Процент скидки обязателен" })
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val) && val >= 1 && val <= 100, {
        message: "Процент должен быть от 1 до 100",
      }),

    date_from: z
      .string({ message: "Введите дату начала" })
      .nonempty({ message: "Дата начала обязательна" })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Некорректная дата начала",
      }),

    date_to: z
      .string({ message: "Введите дату окончания" })
      .nonempty({ message: "Дата окончания обязательна" })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Некорректная дата окончания",
      }),
  })
  .refine((data) => new Date(data.date_to) > new Date(data.date_from), {
    message: "Дата окончания должна быть позже даты начала",
    path: ["date_to"],
  });

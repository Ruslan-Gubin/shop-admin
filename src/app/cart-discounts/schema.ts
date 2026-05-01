import { z } from "zod";

export const createCartDiscountSchema = z.object({
  name: z
    .string({ message: "Введите название скидки" })
    .nonempty()
    .max(50, { message: "Максимум 50 символов" })
    .min(2, { message: "Минимум 2 символа" }),

  min_sum: z
    .string({ message: "Введите минимальную сумму" })
    .nonempty({ message: "Минимальная сумма обязательна" })
    .transform((val) => parseFloat(val.replace(",", ".")))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Сумма должна быть больше 0",
    }),

  percent: z
    .string({ message: "Введите процент скидки" })
    .nonempty({ message: "Процент скидки обязателен" })
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100, {
      message: "Процент должен быть от 1 до 100",
    }),

  apply_to: z.string({
    message: "Выберите кому доступно",
  }),
});


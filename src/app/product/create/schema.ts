import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string({ message: "Название обязательно" })
    .nonempty()
    .max(50, { message: "Максимум 50 символов" })
    .min(2, { message: "Минимум 2 символа" }),
  count: z
    .string({ message: "Количество обязательно" })
    .nonempty()
    .regex(/^\d+$/, { message: "Только целое число" })
    .min(1, { message: "Минимум 1 символ" })
    .refine((value) => Number(value) >= 0, {
      message: "Не может быть отрицательным",
    }),
  price: z
    .string({ message: "Цена обязательна" })
    .nonempty()
    .regex(/^\d+$/, { message: "Только целое число" })
    .min(1, { message: "Минимум 1 символ" })
    .refine((value) => Number(value) > 0, {
      message: "Цена  должна быть больше нуля",
    }),

  code: z
    .string({ message: "Штрихкод обязателен" })
    .nonempty()
    .regex(/^\d+$/, { message: "Только цифры" })
    .max(14, { message: "Максимум 14 символов" })
    .min(8, { message: "Минимум 8 символов" }),
});

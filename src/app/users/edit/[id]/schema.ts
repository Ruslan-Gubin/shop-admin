import { z } from "zod";

export const updateUserSchema = z
  .object({
    name: z
      .string({ message: "Введите имя" })
      .nonempty()
      .max(50, { message: "Максимум 50 символов" })
      .min(3, { message: "Имя должно содержать минимум 3 символа" }),
    email: z
      .string({ message: "Введите почту" })
      .nonempty()
      .email({ message: "Некорректный формат почты" }),
    phone: z
      .string({ message: "Введите номер телефона" })
      .nonempty()
      .min(8, { message: "Введите минимум 8 символов" })
      .max(25, { message: "Некорректный формат номера телефона" })
      .regex(/^(\+?\d{1,3})?[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}|\d{10,15}$/, {
        message: "Некорректный формат номера телефона",
      }),
    password: z
      .string()
      .min(6, { message: "Пароль должен быть не менее 6 символов" })
      .max(50, { message: "Пароль не должен превышать 50 символов" })
      .optional(),
    repeatPassword: z
      .string({
        message: "Введите пароль еще раз",
      })
      .min(6, { message: "Пароль должен быть не менее 6 символов" })
      .max(30, { message: "Пароль не должен превышать 30 символов" })
      .optional(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Пароли не совпадают",
    path: ["repeatPassword"],
  });

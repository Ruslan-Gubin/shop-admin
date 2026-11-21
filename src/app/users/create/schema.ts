import { z } from "zod";
import { isRfDefCode, normalizePhone } from "@/shared/helpers/phoneValidation";

export const createUserSchema = z
  .object({
    name: z
      .string({ message: "Имя пользователя должно быть строкой" })
      .max(50, { message: "Максимум 50 символов" })
      .min(3, { message: "Имя должно содержать минимум 3 символа" })
      .or(z.literal("")),
    email: z
      .string({ message: "Почта должна быть строкой" })
      .email({ message: "Некорректный формат почты" })
      .or(z.literal("")),
    phone: z
      .string()
      .min(11, { message: "Введите номер телефона" })
      .transform((val) => normalizePhone(val))
      .refine((val) => val !== null, {
        message: "Некорректный формат номера телефона",
      })
      .refine(
        (val) => {
          if (!val) return false;
          return isRfDefCode(val);
        },
        {
          message: "Номер не принадлежит мобильному оператору РФ",
        },
      )
      .transform((val) => val as string),
    password: z
      .string({ message: "Пароль должен быть строкой" })
      .min(6, { message: "Пароль должен быть не менее 6 символов" })
      .max(50, { message: "Пароль не должен превышать 50 символов" })
      .or(z.literal("")),
    repeatPassword: z
      .string({ message: "Подтверждение пароля должно быть строкой" })
      .min(6, { message: "Пароль должен быть не менее 6 символов" })
      .max(50, { message: "Пароль не должен превышать 30 символов" })
      .or(z.literal("")),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Пароли не совпадают",
    path: ["repeatPassword"],
  });

import { z } from "zod";

export const signinSchema = z.object({
  email: z
    .string({ message: "Введите почту" })
    .nonempty()
    .email({ message: "Некорректный формат почты" }),
  password: z
    .string({
      message: "Введите пароль",
    })
    .nonempty()
    .min(6, { message: "Пароль должен быть не менее 6 символов" })
    .max(50, { message: "Пароль не должен превышать 50 символов" }),
});

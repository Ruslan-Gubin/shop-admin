import { z } from "zod";

export const createSpecificationSchema = z.object({
  name: z
    .string({ message: "Введите название характеристики" })
    .nonempty()
    .max(100, { message: "Максимум 100 символов" })
    .min(2, { message: "Минимум 2 символа" }),

  // type: z
  //   .string({ message: "Введите slug" })
  //   .nonempty()
  //   .max(100, { message: "Максимум 100 символов" })
  //   .min(2, { message: "Минимум 2 символа" })
  //   .regex(/^[a-z0-9-]+$/, { message: "Только латиница, цифры и дефис" }),
});

import { z } from "zod";

export const updateAnswerSchema = z.object({
  answer: z
    .string({ message: "Ответ должен быть строкой" })
    .min(10, { message: "Ответ должен содержать минимум 10 символов" })
    .max(1000, { message: "Ответ не может превышать 1000 символов" }),
});

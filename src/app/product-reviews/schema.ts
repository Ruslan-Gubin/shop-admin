import { z } from "zod";

export const answerReviewSchema = z.object({
  answer: z
    .string({ message: "Ответ должен быть строкой" })
    .min(1, { message: "Ответ не может быть пустым" })
    .max(1000, { message: "Максимальная длина ответа — 1000 символов" }),
});

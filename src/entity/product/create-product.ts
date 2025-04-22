import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(1, { message: "Введите название" }),
  count: z.string(),
  price: z.string().min(1, { message: "Цена обязательна к заполнению" }),
  code: z.string(),
});

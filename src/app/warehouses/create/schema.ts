import { z } from "zod";

export const createWarehouseSchema = z.object({
  name: z
    .string({ message: "Введите название склада" })
    .nonempty({ message: "Введите название склада" })
    .max(100, { message: "Максимум 100 символов" })
    .min(2, { message: "Минимум 2 символа" }),
  address: z.string({ message: "Введите адрес" }).max(200, { message: "Максимум 200 символов" }),
  area: z.string().max(100, { message: "Максимум 100 символов" }),
  city: z.string().max(100, { message: "Максимум 100 символов" }),
  street: z.string().max(200, { message: "Максимум 200 символов" }),
  house: z.string().max(50, { message: "Максимум 50 символов" }),
  index: z.string().max(20, { message: "Максимум 20 символов" }),
  office: z.string().max(50, { message: "Максимум 50 символов" }),
  description: z.string().max(1000, { message: "Максимум 1000 символов" }),
  is_active: z.boolean(),
  default_warehouse: z.boolean(),
  is_public: z.boolean(),
});

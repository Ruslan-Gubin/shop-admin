import { z } from "zod";

export const createWarehouseSchema = z.object({
  name: z
    .string({ message: "Введите название склада" })
    .nonempty({ message: "Введите название склада" })
    .max(100, { message: "Максимум 100 символов" })
    .min(2, { message: "Минимум 2 символа" }),
  description: z.string().max(1000, { message: "Максимум 1000 символов" }),
  is_active: z.boolean(),
  default_warehouse: z.boolean(),
  is_public: z.boolean(),
  address_name: z.string(),
  place: z.string(),
  lng: z
    .number({ invalid_type_error: "Долгота должна быть числом" })
    .min(1, { message: "Выберите координаты склада" }),
  lat: z
    .number({ invalid_type_error: "Широта должна быть числом" })
    .min(1, { message: "Выберите координаты склада" }),
  entrance: z.string().or(z.literal("")),
  flat: z.string().or(z.literal("")),
  floor: z.string().or(z.literal("")),
  intercom: z.string().or(z.literal("")),
});

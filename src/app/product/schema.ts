import { z } from "zod";

export const createProductPriceSchema = z.object({
  product_id: z.number({ message: "ID должно быть числом" }),
  price_type_id: z.number({ message: "ID должно быть числом" }),
  price: z.number({ message: "Цена должна быть числом" }),
});

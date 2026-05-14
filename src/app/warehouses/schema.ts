import { z } from "zod";

export const createProductStockSchema = z.object({
  product_id: z.number({ message: "ID должно быть числом" }),
  warehouse_id: z.number({ message: "ID должно быть числом" }),
  quantity: z.number({ message: "Цена должна быть числом" }),
  in_stock: z.boolean().optional(),
});

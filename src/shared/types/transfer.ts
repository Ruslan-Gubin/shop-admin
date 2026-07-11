import type { WarehouseModel } from "@/app/warehouses/action";
import type { AddressItem } from "@/shared/ui/mapbox/Mapbox";

export type TransferModel = {
  id: number;
  type: "transfer" | "delivery";
  order_id: number;
  from_warehouse: WarehouseModel | null;
  to_warehouse: WarehouseModel | null;
  to_address: AddressItem | null;
  created_at: string;
  updated_at: string | null;
};

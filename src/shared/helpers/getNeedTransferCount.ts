import type { OrderReservation } from "@/app/orders/edit/[id]/action";

export const getNeedTransferCount = (reservations: OrderReservation[], baseId: number) => {
  return reservations.reduce(
    (acc, el) => (el.warehouse_id !== baseId ? acc + el.quantity : acc),
    0,
  );
};

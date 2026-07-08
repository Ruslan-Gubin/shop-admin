import type { OrderMethodReceipt, OrderPaymentMethod, OrderStatus } from "@/app/orders/action";

export const orderStatusTranslations: Record<OrderStatus, string> = {
  new: "Новый",
  cancelled_new: "Отменён (новый)",
  processing: "В обработке",
  cancelled_assembly: "Отменён (сборка)",
  ready: "Готов",
  in_delivery: "В доставке",
  cancelled_delivery: "Отменён (доставка)",
  completed: "Завершён",
  cancelled_customer: "Отменён клиентом",
};

export const orderPaymentMethodTranslations: Record<OrderPaymentMethod, string> = {
  cash: "Наличными",
  card: "Банковской картой",
};

export const orderMethodReceiptTranslations: Record<OrderMethodReceipt, string> = {
  pickup: "Самовывоз",
  courier: "Курьер",
};

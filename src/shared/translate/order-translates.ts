import type { OrderMethodReceipt, OrderPaymentMethod, OrderStatus } from "@/app/orders/action";

export const orderStatusTranslations: Record<OrderStatus, string> = {
  new: "Новый",
  cancelled_new: "Отменён на этапе оформления",
  processing: "В обработке",
  cancelled_assembly: "Отменён в процессе сборки",
  ready: "Готов",
  cancelled_ready: "Отменён на этапе выдачи",
  in_delivery: "В доставке",
  cancelled_delivery: "Отменён на этапе доставки",
  completed: "Завершён",
  cancelled_customer: "Отменён покупателем",
};

export const orderPaymentMethodTranslations: Record<OrderPaymentMethod, string> = {
  cash: "Наличными",
  card: "Банковской картой",
};

export const orderMethodReceiptTranslations: Record<OrderMethodReceipt, string> = {
  pickup: "Самовывоз",
  courier: "Курьер",
};

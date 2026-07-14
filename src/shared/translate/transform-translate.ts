import type { TransferStatus, TransferType } from "@/app/transfer/action";

export const transferTypeTranslations: Record<TransferType, string> = {
  transfer: "Перемещение",
  delivery: "Доставка",
};

export const transferStatusTranslations: Record<TransferStatus, string> = {
  processing: "В пути",
  rejected: "Отменён",
  completed: "Завершен",
};

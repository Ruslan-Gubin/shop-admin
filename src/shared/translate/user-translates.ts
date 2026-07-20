import type { UserRole } from "@/app/users/action";

export const userRoleTranslations: Record<UserRole, string> = {
  user: "Покупатель",
  admin: "Админ",
  moderator: "Модератор",
  wholesaler: "Оптовый покупатель",
};

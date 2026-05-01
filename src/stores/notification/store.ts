import { createStore } from "../services/create-store";
import type { NotificationInitState } from "./types";

export const notificationStore = createStore<NotificationInitState>(
  {
    notificationList: [],
    timeOut: 5,
  },
);

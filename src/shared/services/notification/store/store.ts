import { createStore } from "../../create-store";
import type { NotificationInitState } from "../types";


const initState: NotificationInitState = {
  notificationList: [],
  timeOut: 5,
};


export const notificationStore = createStore({
  initState,
});




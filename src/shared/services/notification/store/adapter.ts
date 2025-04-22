import { NotificationItem } from "../types";
import { notificationStore } from "./store";


export class NotificationAdapter {

  constructor() {}

  public setNotification(notification: NotificationItem) {
    const notificationList = notificationStore.getState().notificationList;

    if (notificationList.length) return;
   
    return notificationStore.setState({ notificationList: [notification] });
  }

  public resetNotification() {
    return notificationStore.setState({ notificationList: [] });
  }


}



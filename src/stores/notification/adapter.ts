import { notificationStore } from "./store";

export class NotificationAdapter {
  public add(message: string, status: "error" | "success") {
    const notificationList = notificationStore.getState().notificationList;

    if (notificationList.length) return;

    return notificationStore.setState({
      notificationList: [{ message, status, timeFrom: new Date().toString() }],
    });
  }

  public reset() {
    return notificationStore.setState({ notificationList: [] });
  }
}

export const notificationAdapter = new NotificationAdapter();

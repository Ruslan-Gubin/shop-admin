import { Notification } from "../model/model";
import { NotificationAdapter } from "../store/adapter";

export class NotificationService {
  private readonly notificationAdapter: NotificationAdapter;
  private readonly notification: Notification;

  constructor() {
    this.notification = new Notification();
    this.notificationAdapter = new NotificationAdapter();
  }

  public activeNotification(options: {
    message: string;
    status: "error" | "success";
  }) {
    this.notification.getNewNotificatin(options);
    return this.notificationAdapter.setNotification(this.notification);
  }

  public resetNotification() {
    return this.notificationAdapter.resetNotification();
  }
}

export const notificationService = new NotificationService();

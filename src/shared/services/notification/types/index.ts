
export type NotificationItem = {
  message: string;
  status: 'error' | 'success';
  timeFrom: string; 
}

export type NotificationInitState = {
  notificationList: NotificationItem[],
  timeOut: number,
}
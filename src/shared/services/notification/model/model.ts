

export class Notification {
  public message: string;
  public status: "error" | "success";
  public timeFrom: string;

  constructor() {
    this.message = "";
    this.status = "error";
    this.timeFrom = "";
  }

  getNewNotificatin({
    message,
    status,
  }: {
    message: string;
    status: "error" | "success";
  }) {
    this.status = status;
    this.message = message;
    this.timeFrom = new Date().toString();
  }
}

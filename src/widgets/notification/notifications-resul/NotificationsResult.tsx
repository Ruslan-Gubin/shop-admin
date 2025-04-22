"use client";
import { useEffect } from "react";
import {
  notificationService,
  notificationStore,
} from "@/shared/services/notification";
import styles from "./NotificationsResult.module.scss";

const NotificationList = () => {
  const notificationList = notificationStore((state) => state.notificationList);
  const timeOut = notificationStore((state) => state.timeOut);

  const checkClearNotification = () => {
    const currentDate = Date.now();
    const maxTimeNow = timeOut * 1000;

    for (let i = 0; i < notificationList.length; i++) {
      const notDateString = notificationList[i].timeFrom;
      const notNowDate = new Date(notDateString).getTime();

      if (currentDate - notNowDate >= maxTimeNow) {
        notificationService.resetNotification();
      }
    }
  };

  useEffect(() => {
    if (notificationList.length === 0) return;

    const timeInterval = setInterval(checkClearNotification, 1000);

    return () => {
      clearInterval(timeInterval);
    };
  }, [notificationList, timeOut]);

  const handleClickNotification = () => {
    notificationService.resetNotification();
  };

  if (notificationList.length === 0) {
    return null;
  }

  return (
    <ul className={styles.wrapper}>
      {notificationList.map((notification, index) => (
        <li
          onClick={handleClickNotification}
          key={`${index}${notification.timeFrom}`}
          className={
            notification.status === "error"
              ? `${styles.root} ${styles.error}`
              : styles.root
          }
        >
          <div
            className={
              notification.status === "error"
                ? styles.errorContainer
                : styles.successContainer
            }
          ></div>
          <span className={styles.notificationText}>
            {notification.message}
          </span>
        </li>
      ))}
    </ul>
  );
};

export { NotificationList };

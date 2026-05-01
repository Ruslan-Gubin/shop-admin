"use client";
import { useEffect, useEffectEvent, useRef } from "react";
import { notificationAdapter } from "@/stores/notification/adapter";
import { notificationStore } from "@/stores/notification/store";
import styles from "./NotificationsResult.module.css";

export const NotificationList = () => {
  const notificationList = notificationStore((state) => state.notificationList);
  const timeOut = notificationStore((state) => state.timeOut);
  const interval = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkClearNotificationEvent = useEffectEvent(() => {
    const currentDate = Date.now();
    const maxTimeNow = timeOut * 1000;

    for (let i = 0; i < notificationList.length; i++) {
      const notDateString = notificationList[i].timeFrom;
      const notNowDate = new Date(notDateString).getTime();

      if (currentDate - notNowDate >= maxTimeNow) {
        notificationAdapter.reset();
        if (interval.current) {
          clearInterval(interval.current);
        }
      }
    }
  });

  useEffect(() => {
    if (notificationList.length === 0) return;

    interval.current = setInterval(checkClearNotificationEvent, 1000);

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  }, [notificationList]);

  const handleClickNotification = () => {
    notificationAdapter.reset();

    if (interval.current) {
      clearInterval(interval.current);
    }
  };

  if (notificationList.length === 0) {
    return null;
  }

  return (
    <ul className={styles.wrapper}>
      {notificationList.map((notification) => (
        <li
          key={`${notification.message}${notification.timeFrom}`}
          className={
            notification.status === "error"
              ? `${styles.root} ${styles.error}`
              : styles.root
          }
        >
          <button type="button" onClick={handleClickNotification}>
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
          </button>
        </li>
      ))}
    </ul>
  );
};

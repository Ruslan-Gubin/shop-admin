import "./styles/reset.css";
import "./styles/globals.css";
import type { Metadata } from "next";
import { Header } from "@/views/Header/Header";
import { LayoutLeftSide } from "@/views/LayoutLeftSide/LayoutLeftSide";
import { NotificationList } from "@/widgets/notification/notifications-result/NotificationsResult";
import { Roboto } from "./core/fonts";
import { getMetadata } from "./core/generateMetadata";
import styles from "./styles/Layout.module.css";
// import { fetchConnect } from "./action";

export const metadata: Metadata = getMetadata({
  title: "Панель управления",
  description: "Административная панель",
});

export default async function RootLayout(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  // const connect = await fetchConnect() ;

  return (
    <html lang="ru" className={Roboto.className}>
      <head>
        <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
      </head>
      <body className={styles.layoutWrapper}>
        <NotificationList />
        <aside className={styles.layoutAside}>
          <LayoutLeftSide />
        </aside>
        <aside className={styles.layoutAsideContent}>
          <header className={styles.layoutHeader}>
            <Header />
          </header>
          <main className={styles.layoutMain}>{props.children}</main>
        </aside>
      </body>
    </html>
  );
}

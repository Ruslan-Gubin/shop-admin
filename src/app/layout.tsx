import { Roboto } from "@/shared/utils/init-fonts";
import "./styles/globals.scss";
import { getMetadata } from "@/shared/utils/get-metadata";
import { MainLayout } from "@/widgets/layouts/main-layout/MainLayout";
import { NotificationList } from "@/widgets/notification/notifications-resul/NotificationsResult";
import { CONFIG_APP } from "@/shared/config/config";

export const generateMetadata = async () =>
  getMetadata({
    title: "Панель управления",
    description: "Административная панель",
  });

const fetchConnect = async () => {
  try {
    const url = `${CONFIG_APP.BACKEND_URL}connect`;
    const response = await fetch(url);
    return await response.json();
  } catch {
    throw new Error("Не удалось получить данные продукта");
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const connect = await fetchConnect();
  console.log(connect);
  return (
    <html lang="en" className={Roboto.variable}>
      <head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </head>
      <body>
        <NotificationList />
        <MainLayout isConnect={connect.status === "success"}>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}

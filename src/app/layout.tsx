import { Roboto } from "@/shared/utils/init-fonts";
import "./styles/globals.scss";
import { getMetadata } from "@/shared/utils/get-metadata";
import { MainLayout } from "@/widgets/layouts/main-layout/MainLayout";
import { NotificationList } from "@/widgets/notification/notifications-resul/NotificationsResult";

export const generateMetadata = async () =>
  getMetadata({
    title: "Layout title",
    description: "Generate by create next app",
  });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={Roboto.variable}>
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <NotificationList />
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}

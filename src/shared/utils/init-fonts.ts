import localFont from "next/font/local";

export const Roboto = localFont({
  src: [
    {
      path: "../../../public/fonts/Roboto-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Roboto-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Roboto-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Roboto-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Roboto-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  adjustFontFallback: false,
  variable: "--Roboto",
});

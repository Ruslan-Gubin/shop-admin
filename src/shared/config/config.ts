export const CONFIG_APP = {
  BACKEND_URL: process.env["BACKEND_URL"]!,
  ACCESS_TOKEN_COOKIE: "ACCESS_TOKEN_SHOP_ADMIN",
  REFRESH_TOKEN_COOKIE: "REFRESH_TOKEN_SHOP_ADMIN",
  MODE: process.env.NODE_ENV,
} as const;

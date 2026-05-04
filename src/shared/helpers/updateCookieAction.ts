import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { redirect } from "next/navigation";
import { CONFIG_APP } from "../config/config";

export const updateTokensInAction = (
  cookieStore: ReadonlyRequestCookies,
  tokens: {
    token: string;
    refresh: string;
  },
) => {
  if (tokens.token.length > 0 && tokens.refresh.length > 0) {
    cookieStore.set(CONFIG_APP.ACCESS_TOKEN_COOKIE, tokens.token);
    cookieStore.set(CONFIG_APP.REFRESH_TOKEN_COOKIE, tokens.refresh);
  } else {
    cookieStore.delete(CONFIG_APP.ACCESS_TOKEN_COOKIE);
    cookieStore.delete(CONFIG_APP.REFRESH_TOKEN_COOKIE);
    redirect("/sign-in");
  }
};

export const addItemCookieAction = <T>(cookieStore: ReadonlyRequestCookies, newItem: T) => {
  cookieStore.set("add", JSON.stringify(newItem), { maxAge: 1 });
};

export const updateItemCookieAction = (cookieStore: ReadonlyRequestCookies, id: number) => {
  cookieStore.set("update", String(id), { maxAge: 1 });
};

export const deleteItemCookieAction = (cookieStore: ReadonlyRequestCookies, id: number) => {
  cookieStore.set("delete", String(id), { maxAge: 1 });
};

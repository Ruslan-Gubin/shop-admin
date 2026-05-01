import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CONFIG_APP } from "../config/config";

export const updateTokensInAction = async (tokens: {
  token: string;
  refresh: string;
}) => {
  const cookieStore = await cookies();
  if (tokens.token.length > 0 && tokens.refresh.length > 0) {
    cookieStore.set(CONFIG_APP.ACCESS_TOKEN_COOKIE, tokens.token);
    cookieStore.set(CONFIG_APP.REFRESH_TOKEN_COOKIE, tokens.refresh);
  } else {
    cookieStore.delete(CONFIG_APP.ACCESS_TOKEN_COOKIE);
    cookieStore.delete(CONFIG_APP.REFRESH_TOKEN_COOKIE);
    redirect("/sign-in");
  }
};

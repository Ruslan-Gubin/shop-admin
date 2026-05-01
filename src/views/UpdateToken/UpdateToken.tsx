"use client";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent } from "react";
import { CONFIG_APP } from "@/shared/config/config";
import { CookieService } from "@/shared/services/cookie/CookieService";

type Props = {
  tokens: {
    token: string;
    refresh: string;
  };
};

export const UpdateToken = (props: Props) => {
  const router = useRouter();

  const setTokens = useEffectEvent(() => {
    if (props.tokens.token.length > 0 && props.tokens.refresh.length > 0) {
      CookieService.set(CONFIG_APP.ACCESS_TOKEN_COOKIE, props.tokens.token);
      CookieService.set(CONFIG_APP.REFRESH_TOKEN_COOKIE, props.tokens.refresh);
    }

    if (props.tokens.token.length === 0 && props.tokens.refresh.length === 0) {
      CookieService.delete(CONFIG_APP.ACCESS_TOKEN_COOKIE);
      CookieService.delete(CONFIG_APP.REFRESH_TOKEN_COOKIE);
      router.push("/sign-in");
    }
  });

  useEffect(() => {
    setTokens();
  }, []);

  return null;
};

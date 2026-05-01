"use server";
import { cookies } from "next/headers";
import { CONFIG_APP } from "../config/config";
import { fetchConfig, fetchUrl } from "./fetch-config";
import { fetchRefreshToken } from "./utils";

interface BaseFetchArgs {
  params?: Record<string, string>;
  url?: string;
  method: string;
  payload?: object;
  isBlob?: boolean;
  tags?: string[];
  revalidate?: false | 0 | number;
  updateToken?: { token: string; refresh: string } | null;
}

export const baseFetch = async (args: BaseFetchArgs) => {
  const { method, url, params, payload, isBlob, tags, revalidate, updateToken } = args;

  const isLogout = url === "auth/logout";

  const cookieStore = await cookies();

  const token = updateToken?.token || cookieStore.get(CONFIG_APP.ACCESS_TOKEN_COOKIE)?.value || "";
  const refresh =
    updateToken?.refresh || cookieStore.get(CONFIG_APP.REFRESH_TOKEN_COOKIE)?.value || "";

  const signal = new AbortController();
  const _config = fetchConfig(method, isLogout ? refresh : token, payload);
  _config.signal = signal.signal;
  const _url = fetchUrl(url, params);

  if (tags && tags?.length > 0 && _config.next) {
    _config.next.tags = tags;
    if (revalidate) {
      _config.next.revalidate = revalidate;
    }
  }

  let response = await fetch(_url, _config);
  let tokens = updateToken || null;

  if (response.status === 401 && !updateToken) {
    await fetchRefreshToken(refresh)
      .then(async (newTokens) => {
        if (newTokens) {
          _config.headers.Authorization = `Bearer ${newTokens.token}`;
          response = await fetch(_url, _config);
          tokens = newTokens;
        } else {
          throw "403";
        }
      })
      .catch(() => {
        signal.abort();
        tokens = { token: "", refresh: "" };
      });
  }

  if (!response.ok) {
    let message = "";
    const errors: { key: string; message: string }[] = [];

    try {
      const json = await response.json();
      const jsonErrors = json.errors as { key: string; message: string }[];
      for (const errorItem of jsonErrors) {
        errors.push(errorItem);
      }
      message = json.message || json.error || "";
    } catch {}

    return {
      data: null,
      status: "error",
      message,
      errors,
      tokens,
    };
  }

  if (isBlob) {
    return await response.blob();
  } else {
    const json = await response.json();

    return { ...json, tokens };
  }
};

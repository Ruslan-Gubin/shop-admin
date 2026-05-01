import { CONFIG_APP } from "../config/config";

interface ConfigFetchInit extends RequestInit {
  headers: {
    "Content-Type"?: string;
    Authorization?: string;
  };
}

export function fetchConfig(
  method: string = "GET",
  token: string,
  payload?: object,
): ConfigFetchInit {
  const payloadIsFormData = payload instanceof FormData;

  const config: ConfigFetchInit = {
    method: method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  if (!payloadIsFormData) {
    config.headers["Content-Type"] = "application/json";
  }

  if (payload) {
    const currentPayload = payloadIsFormData ? payload : JSON.stringify(payload);
    config.body = currentPayload;
  }

  return config;
}

export function fetchUrl(url?: string, params?: Record<string, string>) {
  let mainUrl = new URL(CONFIG_APP.BACKEND_URL);

  if (url) {
    mainUrl = new URL(`${mainUrl}${url}`);
  }

  if (params) {
    const paramsString = getParamsString(params);

    const searchParams = new URLSearchParams(paramsString);
    mainUrl.search = searchParams.toString();
  }

  return mainUrl.toString();
}

function getParamsString(params?: Record<string, string>) {
  let resultString = "";

  for (const key in params) {
    const value = params[key];
    if (value) {
      resultString += `&${key}=${value}`;
    }
  }

  return resultString.slice(1);
}

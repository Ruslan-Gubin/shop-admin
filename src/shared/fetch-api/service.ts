import type { ResponseData } from "../types/response";
import { baseFetch } from "./baseApi";

export class FetchService {
  public async fetchChain<T extends unknown[]>(
    optionsList: {
      url: string;
      params?: Record<string, string>;
      tags?: string[];
      revalidate?: false | 0 | number;
    }[],
  ): Promise<{ [K in keyof T]: ResponseData<T[K]> }> {
    const results: { [K in keyof T]: ResponseData<T[K]> } = [] as any;
    let currentTokens: { token: string; refresh: string } | null = null;

    for (const options of optionsList) {
      const result: any = await this.get({
        ...options,
        updateToken: currentTokens,
      });

      results.push(result);

      if (result.tokens && currentTokens === null) {
        currentTokens = result.tokens;
      }
    }

    return results;
  }

  public async get<T>(options: {
    url: string;
    params?: Record<string, string>;
    tags?: string[];
    revalidate?: false | 0 | number;
    updateToken?: { token: string; refresh: string } | null;
  }): Promise<ResponseData<T>> {
    return baseFetch({ ...options, method: "GET", updateToken: options.updateToken || null });
  }

  public post<T>({
    url,
    payload,
    params,
  }: {
    url: string;
    payload?: object | FormData;
    params?: Record<string, string>;
  }): Promise<ResponseData<T>> {
    return baseFetch({ url, payload, method: "POST", params });
  }

  public patch<T>({
    url,
    payload,
    params,
  }: {
    url: string;
    payload: object;
    params?: Record<string, string>;
  }): Promise<ResponseData<T>> {
    return baseFetch({ url, payload, method: "PATCH", params });
  }

  public put<T>({
    url,
    payload,
    params,
  }: {
    url: string;
    payload: object;
    params?: Record<string, string>;
  }): Promise<ResponseData<T>> {
    return baseFetch({ url, payload, method: "PUT", params });
  }

  public delete<T>({
    url,
    params,
  }: {
    url: string;
    params?: Record<string, string>;
  }): Promise<ResponseData<T>> {
    return baseFetch({ url, method: "DELETE", params });
  }

  public getBlob({ url }: { url: string }) {
    return baseFetch({ method: "GET", url, isBlob: true });
  }

  public graphQl({ query, variables }: { query: string; variables?: object }) {
    return baseFetch({ method: "POST", payload: { query, variables } });
  }
}

export const fetchService = new FetchService();

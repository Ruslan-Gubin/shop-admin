"use server";

export const parseDuckDuckGo = async (q: string) => {
  return fetch(`https://duckduckgo.com/html/?q=${encodeURIComponent(q)}&s=10`).then((res) =>
    res.text(),
  );
};

export type DuckDuckGoImage = {
  title?: string;
  image?: string;
  thumbnail?: string;
  url?: string;
  width?: number;
  height?: number;
};

const DDG_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

export const searchDuckDuckGoImages = async (q: string): Promise<DuckDuckGoImage[]> => {
  const tokenHtml = await fetch(
    `https://duckduckgo.com/?q=${encodeURIComponent(q)}&iax=images&ia=images`,
    { headers: DDG_HEADERS },
  ).then((res) => res.text());

  const vqd = tokenHtml.match(/vqd=["']?([\d-]+)/)?.[1];
  if (!vqd) return [];

  const data = await fetch(
    `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(q)}&vqd=${vqd}&f=,,,&p=1`,
    { headers: { ...DDG_HEADERS, Referer: "https://duckduckgo.com/" } },
  )
    .then((res) => (res.ok ? res.json() : { results: [] }))
    .catch(() => ({ results: [] }));

  return ((data as { results?: DuckDuckGoImage[] }).results ?? []).slice(0, 50);
};

export const getUnoRouterApiKey = async (): Promise<string> => {
  return process.env.UNO_ROUTER_API || "";
};

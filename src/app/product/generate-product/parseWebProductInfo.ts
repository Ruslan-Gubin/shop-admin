import { parseDuckDuckGo } from "./action";
import type { SearchSource } from "./types";

const parseHtml = (html: string): Document => new DOMParser().parseFromString(html, "text/html");

const MAX_RESULTS = 10;

const resolveResultUrl = (href: string | null): string | null => {
  if (!href) return null;

  try {
    const url = new URL(href.startsWith("//") ? `https:${href}` : href, "https://duckduckgo.com");
    const encoded = url.searchParams.get("uddg");
    return encoded ? decodeURIComponent(encoded).trim() : null;
  } catch {
    return null;
  }
};

const parseResult = (result: Element): SearchSource | null => {
  const link = result.querySelector<HTMLAnchorElement>("a.result__a");
  const url = resolveResultUrl(link?.getAttribute("href") ?? null);
  if (!url) return null;

  const content = result.querySelector(".result__snippet")?.textContent?.trim() ?? "";
  const title = link?.textContent?.trim() ?? "";

  return { content, title, url, thumbnail: "" };
};

export const parseWebProductInfo = async (
  name?: string,
  barcode?: string,
): Promise<SearchSource[]> => {
  const queryName = name ? `Название товара ${name}` : "";
  const queryBarcode = barcode ? `Штрих-код: ${barcode},` : "";
  const query = `купить - ${queryName} ${queryBarcode}`;

  try {
    const html = await parseDuckDuckGo(query);
    const doc = parseHtml(html);

    return Array.from(doc.querySelectorAll(".result.web-result"))
      .slice(0, MAX_RESULTS)
      .map(parseResult)
      .filter((item): item is SearchSource => item !== null);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw `Не удалось получить DuckDuckGo информацию для товара, ${message}`;
  }
};


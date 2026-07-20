export const getUpdateQueryPageString = (
  patch: string,
  searchParams: { [key: string]: string | string[] | undefined },
  page: number,
  page_key?: string,
) => {
  const params = new URLSearchParams();

  for (const key in searchParams) {
    if (key !== "page" && searchParams[key] && typeof searchParams[key] === "string") {
      params.set(key, searchParams[key]);
    }
  }
  params.set(page_key || "page", String(page));

  return `${patch}?${params.toString()}`;
};

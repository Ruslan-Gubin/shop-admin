export const getUpdateQueryPageString = (
  patch: string,
  searchParams: { [key: string]: string | string[] | undefined },
  page: number,
) => {
  const params = new URLSearchParams();

  params.set("page", String(page));

  for (const key in searchParams) {
    if (key !== "page" && searchParams[key] && typeof searchParams[key] === "string") {
      params.set(key, searchParams[key]);
    }
  }

  return `${patch}?${params.toString()}`;
};

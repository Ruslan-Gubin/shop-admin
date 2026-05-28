"use server";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { fetchService } from "@/shared/fetch-api";
import { deleteItemCookieAction, updateTokensInAction } from "@/shared/helpers/updateCookieAction";

export type SearchModel = {
  id: number;
  text: string;
  result_count: number;
  views: number;
  created_at: string;
  updated_at: string | null;
};

export type FetchSearchQueriesResponse = {
  paginationPage: string;
  queries: SearchModel[];
  totalCount: number;
};

export const fetchSearchQueries = async (text: string, limit: string, page?: string) => {
  return await fetchService.get<FetchSearchQueriesResponse>({
    url: "search/all",
    params: { limit, page: page ? String(page) : "1", text },
    tags: ["SearchQueries"],
  });
};

export const deleteSearchQueryAction = async (
  id: number,
): Promise<{ status: "error" | "success"; message: string }> => {
  const cookieStore = await cookies();

  return fetchService
    .delete<null>({
      url: `search/${id}`,
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      if (response.status === "success") {
        deleteItemCookieAction(cookieStore, id);
        revalidateTag("SearchQueries", "max");
      }

      return { status: response.status, message: response.message };
    });
};

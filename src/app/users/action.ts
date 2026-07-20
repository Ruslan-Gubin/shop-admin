"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { fetchService } from "@/shared/fetch-api";
import { deleteItemCookieAction, updateTokensInAction } from "@/shared/helpers/updateCookieAction";

export type UserRole = "user" | "admin" | "moderator" | "wholesaler";

export interface UserModel {
  created_at: string;
  department_id: number | null;
  email: string;
  id: number;
  name: string;
  phone: string;
  photo: string;
  role: UserRole;
  updated_at: string | null;
}

export const fetchUsers = async (page?: string, name?: string) => {
  return await fetchService.get<{
    paginationPage: string;
    users: UserModel[];
    totalCount: number;
  }>({
    url: "users/users",
    params: {
      limit: "10",
      page: page ? String(page) : "1",
      ...(name ? { name } : {}),
    },
  });
};

export const fetchUser = async (id: string) => {
  const cookieStore = await cookies();

  return await fetchService
    .get<UserModel>({
      url: `users/${id}`,
      tags: [`Users_${id}`],
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      return response;
    });
};

export const deleteUserAction = async (
  id: number,
): Promise<{ status: "error" | "success"; message: string }> => {
  const cookieStore = await cookies();
  return fetchService
    .delete<null>({
      url: `users/${id}`,
    })
    .then(async (response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }

      if (response.status === "success") {
        deleteItemCookieAction(cookieStore, id);
        revalidatePath("/users");
      }

      return { status: response.status, message: response.message };
    });
};

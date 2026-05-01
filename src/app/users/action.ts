"use server";
import { revalidatePath } from "next/cache";
import { fetchService } from "@/shared/fetch-api";
import { updateTokensInAction } from "@/shared/services/update-tokens-in-action";

export interface UserModel {
  created_at: string;
  department_id: number | null;
  email: string;
  id: number;
  name: string;
  phone: string;
  photo: string;
  role: string;
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

export const deleteUserAction = async (
  id: number,
): Promise<{ status: "error" | "success"; message: string }> => {
  return fetchService
    .delete<null>({
      url: `users/${id}`,
    })
    .then(async (response) => {
      console.log(response);
      if (response.tokens) {
        await updateTokensInAction(response.tokens);
      }

      if (response.status === "success") {
        revalidatePath("/users");
      }

      return { status: response.status, message: response.message };
    });
};

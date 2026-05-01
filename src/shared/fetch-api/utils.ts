"use server";
import { z } from "zod";
import { CONFIG_APP } from "../config/config";
import type { ResponseData } from "../types/response";

const RefreshTokenResponseSchema = z.object({
  token: z.string().nonempty(),
  refresh: z.string().nonempty(),
});

type RefreshTokenResponseDto = z.infer<typeof RefreshTokenResponseSchema>;

export const fetchRefreshToken = async (refresh: string) => {
  const url = new URL(`${CONFIG_APP.BACKEND_URL}auth/refresh-token`);

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refresh}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw response.status;
      }
      return response.json();
    })
    .then((response: ResponseData<RefreshTokenResponseDto>) => {
      if (response.status === "success" && response.data) {
        return response.data;
      }
    });
};

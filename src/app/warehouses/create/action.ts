import { cookies } from "next/headers";
import { fetchService } from "@/shared/fetch-api";
import { updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import { getValidatePayload } from "@/shared/services/get-form-action-state";
import { setErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
import type { WarehouseModel } from "../action";
import { createWarehouseSchema } from "./schema";

export type WarehousePayload = {
  name: string;
  address: string;
  area: string;
  city: string;
  street: string;
  house: string;
  index: string;
  office: string;
  description: string;
  is_active: boolean;
  default_warehouse: boolean;
  is_public: boolean;
};

export const createWarehouseAction = async (
  payload: WarehousePayload,
): Promise<{
  status: "error" | "success";
  errors: Record<keyof WarehousePayload, string>;
  data: WarehouseModel | null;
}> => {
  const { isValid, errors } = getValidatePayload(payload, createWarehouseSchema);

  if (isValid) {
    const cookieStore = await cookies();

    return await fetchService
      .post<WarehouseModel>({
        url: "warehouses/create",
        payload: payload,
      })
      .then((response) => {
        if (response.tokens) {
          updateTokensInAction(cookieStore, response.tokens);
        }

        if (response.status === "error" && response.errors) {
          setErrorFromServer(response.errors, errors);
        }

        return { status: response.status, errors, data: response.data };
      });
  }

  return { status: "error", errors, data: null };
};

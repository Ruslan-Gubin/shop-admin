import { cookies } from "next/headers";
import { fetchService } from "@/shared/fetch-api";
import { updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import { getValidatePayload } from "@/shared/services/get-form-action-state";
import { setErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
import type { WarehouseModel } from "../../action";
import type { WarehousePayload } from "../../create/action";
import { createWarehouseSchema } from "../../create/schema";

export const fetchWarehouseEditPage = async (id: string) => {
  return await fetchService.get<WarehouseModel>({
    url: `warehouses/${id}`,
    tags: [`Warehouses_${id}`],
  });
};

export const updateWarehouseAction = async (
  payload: WarehousePayload,
  id: string,
): Promise<{
  status: "error" | "success";
  errors: Record<keyof WarehousePayload, string>;
}> => {
  const { isValid, errors } = getValidatePayload(payload, createWarehouseSchema);

  if (isValid && id) {
    const cookieStore = await cookies();

    return await fetchService
      .patch<null>({
        url: `warehouses/${id}`,
        payload: payload,
      })
      .then((response) => {
        if (response.tokens) {
          updateTokensInAction(cookieStore, response.tokens);
        }

        if (response.status === "error" && response.errors) {
          setErrorFromServer(response.errors, errors);
        }

        return { status: response.status, errors };
      });
  }

  return { status: "error", errors };
};

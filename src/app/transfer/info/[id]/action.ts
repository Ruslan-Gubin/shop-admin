import type { OrderProductModel } from "@/app/orders/edit/[id]/action";
import { fetchService } from "@/shared/fetch-api";
import type { ResponseData } from "@/shared/types/response";
import type { WayGeojsonResponse } from "@/shared/ui/mapbox/Mapbox";
import type { TransferModel } from "../../action";

export const fetchTransferData = async (id: string) => {
  const transferData = await fetchService.get<TransferModel>({
    url: `transfers/${id}`,
    tags: [`Transfers_${id}`],
    revalidate: 30,
  });

  const productsData: ResponseData<OrderProductModel[]> = {
    data: null,
    message: "",
    status: "error",
    tokens: transferData.tokens,
    errors: [],
  };

  if (transferData?.data) {
    await fetchService
      .get<OrderProductModel[]>({
        updateToken: transferData.tokens,
        url: `order-product/order/${transferData.data.order_id}`,
        tags: [`OrderProduct_${transferData.data.order_id}`],
        revalidate: 30,
      })
      .then((response) => {
        productsData.data = response.data;
        productsData.errors = response.errors;
        productsData.message = response.message;
        productsData.status = response.status;
        productsData.tokens = response.tokens;
      });
  }

  return { transferData, productsData };
};

export const fetchWayAction = async (
  from_lng: number,
  from_lat: number,
  to_lng: number,
  to_lat: number,
  method: "driving" | "walking" | "cycling",
  mapToken: string,
): Promise<WayGeojsonResponse> => {
  const url = `https://api.mapbox.com/directions/v5/mapbox/${method}/${from_lng},${from_lat};${to_lng},${to_lat}?geometries=geojson&access_token=${mapToken}`;
  return fetch(url)
    .then((response) => response.json())
    .catch((error) => console.error(error));
};

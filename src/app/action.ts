"use server";
import { cookies } from "next/headers";
import { CONFIG_APP } from "@/shared/config/config";
import { fetchService } from "@/shared/fetch-api";
import { updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import type { MapBoxGetSearchGeocodeResponse } from "@/shared/ui/mapbox/Mapbox";
import type { QuestionModel } from "./product-questions/action";
import type { ReviewModel } from "./product-reviews/action";
import type { TransferModel } from "./transfer/action";

export const fetchConnect = async () => {
  return await fetchService.get<null>({ url: "connect" });
};

export const fetchNotificationHeader = async () => {
  return await fetchService.fetchChain<
    [
      {
        questions: QuestionModel[];
        totalCount: number;
        paginationPage: number;
      },
      {
        reviews: ReviewModel[];
        totalCount: number;
        paginationPage: number;
      },
      {
        reviews: TransferModel[];
        totalCount: number;
        paginationPage: number;
      },
      {
        reviews: TransferModel[];
        totalCount: number;
        paginationPage: number;
      },
    ]
  >([
    {
      url: "product-question/unanswered",
      params: { limit: "1", page: "1" },
    },

    {
      url: "product-review/unanswered/list",
      params: { limit: "1", page: "1" },
    },
    {
      url: "transfers/in-transit/active",
      params: { limit: "1", page: "1" },
    },
    {
      url: "orders",
      params: { status: "new", limit: "1", page: "1" },
    },
  ]);
};

export const logoutAction = async () => {
  const cookieStore = await cookies();

  return fetchService
    .post<null>({
      url: "auth/logout",
    })
    .then((response) => {
      if (response.tokens) {
        updateTokensInAction(cookieStore, response.tokens);
      }
      return { status: response.status, message: response.message };
    })
    .then((response) => {
      if (response.status === "success") {
        cookieStore.delete(CONFIG_APP.ACCESS_TOKEN_COOKIE);
        cookieStore.delete(CONFIG_APP.REFRESH_TOKEN_COOKIE);
      }
      return response;
    });
};

export const fetchReverseAction = async (
  lng: number,
  lat: number,
): Promise<{
  lng: number;
  lat: number;
  name: string;
  place: string;
}> => {
  return fetch(
    `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${CONFIG_APP.MAPBOX_ACCESS_TOKEN}&language=ru&types=address`,
  )
    .then((response) => response.json())
    .then((response: MapBoxGetSearchGeocodeResponse) => {
      const featureAddress = response.features.find(
        (el) => el.properties.feature_type === "address",
      );

      if (
        featureAddress &&
        typeof featureAddress?.properties?.name === "string" &&
        typeof featureAddress.properties.context.place.name === "string" &&
        typeof featureAddress?.properties?.coordinates?.longitude === "number" &&
        typeof featureAddress?.properties?.coordinates?.latitude === "number"
      ) {
        return {
          lng,
          lat,
          name: featureAddress.properties.name,
          place: featureAddress.properties.context.place.name,
        };
      } else {
        throw "Not found address";
      }
    });
};

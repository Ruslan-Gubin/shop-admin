"use server";
import { fetchService } from "@/shared/fetch-api";
import type { FeatureNameModel } from "./action";

export const fetchFeatureNamesList = async () => {
  return await fetchService.get<{ featureNames: FeatureNameModel[] }>({
    url: "feature-name",
    params: { limit: "1000", page: "1", name: "" },
    tags: ["Feature_Names"],
    revalidate: 1000,
  });
};

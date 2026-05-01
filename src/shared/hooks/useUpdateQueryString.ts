import { usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type QueryParamChangesType = {
  [key: string]: string;
};

export const useUpdateQueryString = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (queryParamChanges: QueryParamChangesType) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const key in queryParamChanges) {
        if (typeof queryParamChanges[key] === "string") {
          params.set(key, queryParamChanges[key]);
        }
      }

      return `${pathname}?${params.toString()}`;
    },

    [searchParams, pathname],
  );
};

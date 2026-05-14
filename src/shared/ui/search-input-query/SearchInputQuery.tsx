"use client";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useUpdateQueryString } from "@/shared/hooks/useUpdateQueryString";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { FindSvg } from "@/shared/svg/FindSvg";
import { Input } from "@/shared/ui/input-main/Input";

type Props = {
  queryKey: string;
  search: string;
  inputSearchLabel?: string;
};

export const SearchInputQuery = (props: Props) => {
  const debounceFn = useDebounce();
  const updateQueryString = useUpdateQueryString();

  const isFocused =
    typeof window !== "undefined" ? window.localStorage.getItem("focusSearchInput") === "1" : false;

  const handleSearch = async (value: string) => {
    debounceFn(() => {
      const updateUrl = updateQueryString({
        [props.queryKey]: value,
        page: "1",
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("focusSearchInput", "1");
      }
      redirect(updateUrl);
    });
  };

  useEffect(() => {
    if (isFocused && typeof window !== "undefined") {
      window.localStorage.removeItem("focusSearchInput");
    }
  }, [isFocused]);

  return (
    <search>
      <Input
        autoFocus={isFocused}
        name="search_price_types"
        fullWidth={true}
        variant="outlined"
        variantSize="sm"
        leftIcon={<FindSvg />}
        rightIcon={props.search.length > 0 ? <CancelSvg /> : null}
        defaultValue={props.search}
        onChange={(e) => handleSearch(e.target.value)}
        onClickRightIcon={() => handleSearch("")}
        label={props.inputSearchLabel ? props.inputSearchLabel : "Поиск по названию"}
      />
    </search>
  );
};

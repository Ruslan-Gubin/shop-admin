"use client";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { getIsValidCurrentPage } from "@/shared/helpers/getIsValidCurrentPage";
import { getUpdateQueryPageString } from "@/shared/helpers/getUpdateQueryPageString";
import { useIntersectionObserver } from "@/shared/hooks/useIntersectionObserver";
import { useWindowSize } from "@/shared/hooks/useWindowSize";

type Props = {
  isLoadMoreDisabled: boolean;
  patch: string;
  searchParams: { [key: string]: string | string[] | undefined };
  pages: number[];
  currentPage: number;
};

export const LoadMoreObserver = (props: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { isMobile } = useWindowSize();
  const router = useRouter();

  const onIntersect = () => {
    const isValidPage = getIsValidCurrentPage(props.pages, props.currentPage);

    if (isValidPage) {
      const routerUrl = getUpdateQueryPageString(
        props.patch,
        props.searchParams,
        props.currentPage + 1,
      );
      router.push(routerUrl, { scroll: false, transitionTypes: ["LoadMore"] });
    }
  };

  useIntersectionObserver({
    target: ref,
    onIntersect: onIntersect,
    threshold: 1,
    disabled: !isMobile || props.isLoadMoreDisabled,
  });

  return <div ref={ref} style={{ height: "10px" }}></div>;
};

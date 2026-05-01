"use client";
import { useState } from "react";
import { DeleteSvg } from "@/app/category/components/category-item/svg/DeleteSvg";
import { EditSvg } from "@/app/category/components/category-item/svg/EditSvg";
import { Badge } from "@/shared/ui/badge/Badge";
import { BirdSelectIcon } from "@/views/LayoutLeftSide/NavigateMenu/svg/BirdSelectIcon";
import type { RenderTableOptions } from "@/widgets/main-table/MainTable";
import styles from "./MainMobileTable.module.css";

interface Props<T> {
  data: T[];
  onEditAction?: (item: T) => void;
  onDeleteAction?: (id: number) => void;
  tableOptions: RenderTableOptions<T>[];
  headerRowLabels: string[];
}

const shortDateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

export const MainMobileTable = <T extends { id: number }>(props: Props<T>) => {
  const [data, setData] = useState<T[]>(props.data);
  const headerRowWidth = ["40px", "150px", "100px", "80px", "100px", "120px"];
  // const [loading, setLoading] = useState(false); const loaderRef = useRef<HTMLDivElement | null>(null); const prevSearchRef = useRef(searchParams.get("name") || ""); Сброс стейта при изменении поиска (как обсуждали) useEffect(() => { const currentSearch = searchParams.get("name") || ""; if (prevSearchRef.current !== currentSearch) { prevSearchRef.current = currentSearch;
  //     // Сбрасываем на первую страницу
  //     setProducts(props.data);
  //     setCurrentPage(1);
  //     setHasMore(props.hasMorePages);
  //   }
  // }, [searchParams, props.data, props.hasMorePages]);

  // const loadMore = useCallback(async () => {
  //   if (loading || !hasMore) return;
  //   setLoading(true);
  //   const nextPage = currentPage + 1;
  //
  //   try {
  //     const search = searchParams.get("name") || undefined;
  //     const newData = await props.fetchPageAction(nextPage, search);
  //
  //     if (newData.length === 0) {
  //       setHasMore(false);
  //     } else {
  //       setProducts((prev) => [...prev, ...newData]);
  //       setCurrentPage(nextPage);
  //     }
  //   } catch (error) {
  //     console.error("Failed to load more products", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [loading, hasMore, currentPage, props.fetchPageAction, searchParams]);

  // Intersection Observer
  // useEffect(() => {
  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       if (entries[0].isIntersecting && hasMore && !loading) {
  //         startTransition(() => {
  //           loadMore();
  //         });
  //       }
  //     },
  //     { threshold: 1.0 },
  //   );
  //
  //   if (loaderRef.current) observer.observe(loaderRef.current);
  //   return () => observer.disconnect();
  // }, [loadMore, hasMore, loading]);

  const renderCellContent = (item: T, cell: RenderTableOptions<T>) => {
    const value = item[cell.key as keyof T];

    if (cell.type === "date" && typeof value === "string") {
      return <span>{value ? new Date(value as string).toLocaleString() : "---"}</span>;
    }
    if (cell.type === "shortDate" && typeof value === "string") {
      return <span>{value ? shortDateFormat.format(new Date(value as string)) : "---"}</span>;
    }
    if (cell.type === "boolean" && typeof value === "boolean" && cell.typeConfig) {
      return (
        <Badge variant={value ? "active" : "error"}>
          {value ? cell.typeConfig.booleanLabels?.[0] : cell.typeConfig.booleanLabels?.[1]}
        </Badge>
      );
    }
    if (cell.type === "avatar" && typeof value === "string") {
      return <img className={styles.avatar} src={value as string} alt="Avatar" />;
    }

    return <span>{String(value || "---")}</span>;
  };

  return (
    <div className={styles.container}>
      {data.map((item) => (
        <details key={item.id} className={styles.card}>
          <summary className={styles.cardHeader}>
            <div className={styles.cardHeaderLeftSide}>
              <div className={styles.birdContainer}>
                <BirdSelectIcon className={styles.navigateMenuItemSvg} />
              </div>

              <ul className={styles.cartHeaderList}>
                {props.tableOptions.map((cell, index) => (
                  <li key={cell.key}>
                    <div
                      style={{ minWidth: headerRowWidth[index] }}
                      className={styles.headerListItem}
                    >
                      <p className={styles.headerListLabel}>
                        {typeof props.headerRowLabels[index] === "string"
                          ? props.headerRowLabels[index]
                          : "-/-"}
                      </p>

                      <p className={styles.headerListValue}>
                        {(item[cell.key] as string) || "---"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.cardActions}>
              <button
                type="button"
                onClick={() => props.onEditAction?.(item)}
                aria-label="Редактировать"
              >
                <EditSvg />
              </button>
              <button
                type="button"
                onClick={() => props.onDeleteAction?.(item.id)}
                aria-label="Удалить"
              >
                <DeleteSvg />
              </button>
            </div>
          </summary>

          <div className={styles.cardBody}>
            <div className={styles.cardBodyInner}>
              {props.tableOptions.map((cell) => (
                <div key={String(cell.key)} className={styles.cellRow}>
                  <span className={styles.cellLabel}>
                    {props.headerRowLabels[props.tableOptions.indexOf(cell)]}
                  </span>
                  <div className={styles.cellValue}>{renderCellContent(item, cell)}</div>
                </div>
              ))}
            </div>
          </div>
        </details>
      ))}
    </div>
  );
};

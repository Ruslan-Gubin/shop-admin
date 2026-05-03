import { useRouter } from "next/navigation";
import { useEffectEvent, useLayoutEffect, useState } from "react";
import { DeleteSvg } from "@/app/category/components/category-item/svg/DeleteSvg";
import { EditSvg } from "@/app/category/components/category-item/svg/EditSvg";
import { getIsValidCurrentPage } from "@/shared/helpers/getIsValidCurrentPage";
import { getUpdateQueryPageString } from "@/shared/helpers/getUpdateQueryPageString";
import { Details } from "@/shared/ui/details/Details";
import { LoadMoreObserver } from "@/shared/ui/load-more-observer/LoadMoreObserver";
import type { RenderTableOptions } from "@/widgets/main-table/MainTable";
import styles from "./MainMobileTable.module.css";

interface Props<T> {
  data: T[];
  onEditAction?: (item: T) => void;
  onDeleteAction?: (id: number) => void;
  tableOptions: RenderTableOptions<T>[];
  headerRowLabels: string[];
  titleKey: keyof T;
  headerRowWidth: string[];
  isLoadMoreDisabled: boolean;
  patch: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

const shortDateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

export const MainMobileTable = <T extends { id: number }>(props: Props<T>) => {
  const currentPage: number = Number(props.searchParams.page || "1");
  const [data, setData] = useState<T[]>([]);
  const [pages, setPages] = useState<number[]>([]);
  const router = useRouter();

  const getUpdateDataEvent = useEffectEvent((currentPage: number) => {
    const updatePages = pages;
    const updateData: T[] = [];

    updatePages.push(currentPage);

    const isValidPage = getIsValidCurrentPage(updatePages, currentPage);

    if (!isValidPage) {
      updatePages.length = 0;

      if (currentPage === 1) {
        updatePages.push(1);
        for (let i = 0; i < props.data.length; i++) {
          updateData.push(props.data[i]);
        }
      }
      router.push(getUpdateQueryPageString(props.patch, props.searchParams, 1));
    } else {
      if (currentPage > 0 && data.length > 0) {
        updateData.push(...data);
      }
      for (let i = 0; i < props.data.length; i++) {
        updateData.push(props.data[i]);
      }
    }

    setPages(updatePages);
    setData(updateData);
  });

  useLayoutEffect(() => {
    getUpdateDataEvent(currentPage);
  }, [currentPage]);

  return (
    <div className={styles.container}>
      {data.map((item) => (
        <Details
          key={item.id}
          titleAfterOpen={String(item[props.titleKey])}
          headerContent={
            <ul className={styles.cartHeaderList}>
              {props.tableOptions.map((cell, index) => (
                <li key={String(cell.key)}>
                  <div
                    style={{
                      minWidth: props.headerRowWidth[index],
                      maxWidth: props.headerRowWidth[index],
                    }}
                    className={styles.headerListItem}
                  >
                    {cell.type !== "avatar" && (
                      <p className={styles.headerListLabel}>
                        {typeof props.headerRowLabels[index] === "string"
                          ? props.headerRowLabels[index]
                          : "-/-"}
                      </p>
                    )}

                    <div className={styles.headerListValue}>
                      {!cell.type && typeof cell.key === "string" && (
                        <p>{(item[cell.key] as string) || "---"}</p>
                      )}

                      {cell.type === "translate" &&
                        cell.typeConfig?.translateMap &&
                        typeof item[cell.key] === "string" && (
                          <p>{cell.typeConfig.translateMap[item[cell.key] as string] || "---"}</p>
                        )}

                      {cell.type === "date" && typeof item[cell.key] === "string" && (
                        <p>
                          {item[cell.key]
                            ? new Date(item[cell.key] as string).toLocaleString()
                            : "---"}
                        </p>
                      )}

                      {cell.type === "shortDate" && typeof item[cell.key] === "string" && (
                        <p>
                          {item[cell.key]
                            ? shortDateFormat.format(new Date(item[cell.key] as string))
                            : "---"}
                        </p>
                      )}

                      {cell.type === "boolean" &&
                        typeof item[cell.key] === "boolean" &&
                        cell.typeConfig &&
                        Array.isArray(cell.typeConfig.booleanLabels) && (
                          <p
                            className={`${item[cell.key] ? styles.booleanValueActive : styles.booleanValueError}`}
                          >
                            {item[cell.key]
                              ? cell.typeConfig.booleanLabels[0]
                              : cell.typeConfig.booleanLabels[1]}
                          </p>
                        )}

                      {cell.type === "avatar" && typeof item[cell.key] === "string" && (
                        <img
                          className={styles.avatar}
                          src={item[cell.key] as string}
                          alt="Avatar"
                        />
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          }
          content={
            <ul className={styles.cardBody}>
              {props.tableOptions.map((cell) => (
                <li key={String(cell.key)} className={styles.cellRow}>
                  <span className={styles.cellLabel}>
                    {props.headerRowLabels[props.tableOptions.indexOf(cell)]}
                  </span>
                  <div className={styles.cellValue}>
                    {!cell.type && typeof cell.key === "string" && (
                      <p>{(item[cell.key] as string) || "---"}</p>
                    )}

                    {cell.type === "translate" &&
                      cell.typeConfig?.translateMap &&
                      typeof item[cell.key] === "string" && (
                        <p>{cell.typeConfig.translateMap[item[cell.key] as string] || "---"}</p>
                      )}

                    {cell.type === "date" && typeof item[cell.key] === "string" && (
                      <p>
                        {item[cell.key]
                          ? new Date(item[cell.key] as string).toLocaleString()
                          : "---"}
                      </p>
                    )}

                    {cell.type === "shortDate" && typeof item[cell.key] === "string" && (
                      <p>
                        {item[cell.key]
                          ? shortDateFormat.format(new Date(item[cell.key] as string))
                          : "---"}
                      </p>
                    )}

                    {cell.type === "boolean" &&
                      typeof item[cell.key] === "boolean" &&
                      cell.typeConfig &&
                      Array.isArray(cell.typeConfig.booleanLabels) && (
                        <p
                          className={`${item[cell.key] ? styles.booleanValueActive : styles.booleanValueError}`}
                        >
                          {item[cell.key]
                            ? cell.typeConfig.booleanLabels[0]
                            : cell.typeConfig.booleanLabels[1]}
                        </p>
                      )}

                    {cell.type === "avatar" && typeof item[cell.key] === "string" && (
                      <img className={styles.avatar} src={item[cell.key] as string} alt="Avatar" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          }
          actions={
            <>
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
            </>
          }
        />
      ))}
      <LoadMoreObserver
        isLoadMoreDisabled={props.isLoadMoreDisabled}
        patch={props.patch}
        searchParams={props.searchParams}
        pages={pages}
        currentPage={currentPage}
      />
    </div>
  );
};

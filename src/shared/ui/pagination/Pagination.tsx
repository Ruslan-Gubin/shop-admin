"use client";
import type { FC } from "react";
import { paginationNumbers } from "./helper";
import { PaginationProps } from "./types";

import styles from "./Pagination.module.scss";

const Pagination: FC<PaginationProps> = ({
  countPerPage,
  totalCount,
  currentPage,
  clickNumber,
  className,
}) => {
  const lastPage = Math.ceil(totalCount / countPerPage);
  const numbers: number[] = [...paginationNumbers(currentPage, lastPage)];

  const getPageNumber = (page: number) => {
    return page < 10 ? `0${page}` : page;
  };

  return (
    <section
      className={
        className ? `${styles.pagination} ${className}` : styles.pagination
      }
    >
      {/* <button
        onClick={currentPage > 1 ? prevPage : () => false}
        className={
          currentPage > 1
            ? styles.paginationButton
            : `${styles.paginationButton} ${styles.paginationButtonOpasit}`
        }
      >
      </button> */}

      {numbers.map((page, index) => (
        <div
          key={index}
          onClick={() =>
            page === currentPage || !page ? false : clickNumber(page)
          }
          className={
            page === currentPage
              ? `${styles.paginationPage} ${styles.paginationPageWhite} `
              : styles.paginationPage
          }
        >
          {page === 0 ? <div>...</div> : getPageNumber(page)}
        </div>
      ))}

      {/* <button
        onClick={currentPage < lastPage ? nextPage : () => false}
        className={
          currentPage < lastPage
            ? styles.paginationButton
            : `${styles.paginationButton} ${styles.paginationButtonOpasit}`
        }
      >
      </button> */}
    </section>
  );
};

export { Pagination };

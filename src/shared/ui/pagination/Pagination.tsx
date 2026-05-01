import Link from "next/link";
import { getUpdateQueryPageString } from "@/shared/helpers/getUpdateQueryPageString";
import { paginationNumbers } from "./helper";
import styles from "./Pagination.module.css";

type Props = {
  total: number;
  limit: number;
  page: number;
  className?: string;
  patch: string;
  searchParams: { [key: string]: string | string[] | undefined };
};

export const Pagination = (props: Props) => {
  const lastPage = Math.ceil(props.total / props.limit);
  const numbers: number[] = [...paginationNumbers(props.page, lastPage)];

  return (
    <section className={styles.root}>
      <ul className={`${styles.pagination} ${props.className ?? ""}`}>
        {numbers.map((currentPage, index) => (
          <li key={index}>
            <Link
              href={getUpdateQueryPageString(props.patch, props.searchParams, currentPage)}
              className={
                currentPage === props.page
                  ? `${styles.paginationPage} ${styles.paginationPageWhite} `
                  : styles.paginationPage
              }
            >
              {currentPage ? (currentPage < 10 ? `0${currentPage}` : currentPage) : "..."}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

"use client";
import { Pagination } from "../pagination/Pagination";
import styles from "./PaginationSection.module.scss";

type Props = {
  page: number;
  limit: number;
  total: number;
  onChangePage: (page: number) => void;
};

const PaginationSection = ({ limit, page, total, onChangePage }: Props) => {
  return (
    <section className={styles.root}>
      <Pagination
        clickNumber={(page) => onChangePage(page)}
        countPerPage={limit}
        currentPage={page}
        totalCount={total}
        color=""
      />
    </section>
  );
};

export { PaginationSection };

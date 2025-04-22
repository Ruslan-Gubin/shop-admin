export interface PaginationProps {
  totalCount: number;
  countPerPage: number;
  currentPage: number;
  clickNumber: (value: number) => void;
  prevPage?: () => void;
  nextPage?: () => void;
  className?: string;
  color?: string;
}


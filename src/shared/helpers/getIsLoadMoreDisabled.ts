export const getIsLoadMoreDisabled = (
  paginationPage: string | undefined,
  totalCount: number | undefined,
  limit: number,
): boolean => {
  let isDisabled = true;

  if (paginationPage && totalCount && limit) {
    const lastPage = Math.ceil(totalCount / limit);
    const currentPage = Number(paginationPage);
    if (currentPage < lastPage) {
      isDisabled = false;
    }
  }

  return isDisabled;
};

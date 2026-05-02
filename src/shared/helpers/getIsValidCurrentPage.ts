export const getIsValidCurrentPage = (pages: number[], currentPage: number) => {
  return (
    pages.length === currentPage &&
    typeof pages[currentPage - 1] === "number" &&
    pages[currentPage - 1] === currentPage
  );
};

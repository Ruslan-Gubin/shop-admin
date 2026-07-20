import { getIsLoadMoreDisabled } from "@/shared/helpers/getIsLoadMoreDisabled";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { Pagination } from "@/shared/ui/pagination/Pagination";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { fetchIncompleteProducts } from "./action";
import { IncompleteTableWrapper } from "./components/IncompleteTableWrapper/IncompleteTableWrapper";

export default async function IncompleteProductsPage(req: {
  searchParams: Promise<{ page: string }>;
}) {
  const searchParams = await req.searchParams;
  const limit = 10;
  const patch = "/product/incomplete";

  const tableData = await fetchIncompleteProducts(String(limit), searchParams.page || "1");

  const isLoadMoreDisabled = getIsLoadMoreDisabled(
    tableData.data?.paginationPage,
    tableData.data?.totalCount,
    limit,
  );
  return (
    <section className="page-wrapper">
      {tableData?.tokens && <UpdateToken tokens={tableData.tokens} />}
      <h2>Товары с проблемами.</h2>

      {tableData.status === "error" && tableData.message && (
        <ErrorAlert message={tableData.message} />
      )}

      <section className="table-container">
        <IncompleteTableWrapper
          products={tableData?.data?.products || []}
          isLoadMoreDisabled={isLoadMoreDisabled}
          patch={patch}
          searchParams={searchParams}
        />

        {tableData?.data &&
          typeof tableData?.data?.totalCount === "number" &&
          tableData?.data?.totalCount > limit && (
            <Pagination
              page={Number(tableData?.data?.paginationPage || 1)}
              limit={limit}
              total={tableData?.data?.totalCount || 0}
              patch={patch}
              searchParams={searchParams}
            />
          )}
      </section>
    </section>
  );
}

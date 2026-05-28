"use server";
import { redirect } from "next/navigation";
import { getIsLoadMoreDisabled } from "@/shared/helpers/getIsLoadMoreDisabled";
import { getUpdateQueryPageString } from "@/shared/helpers/getUpdateQueryPageString";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { Pagination } from "@/shared/ui/pagination/Pagination";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { deleteSearchQueryAction, fetchSearchQueries } from "./action";
import { SearchQueriesTableWrapper } from "./components/SearchQueriesTableWrapper/SearchQueriesWrapper";

export default async function SearchQueriesPage(req: {
  searchParams: Promise<{ page: string; text: string }>;
}) {
  const searchParams = await req.searchParams;
  const limit = 10;
  const tableData = await fetchSearchQueries(searchParams.text, String(limit), searchParams.page);
  const patch = "/search-queries";

  const redirectPageAfterDelete = async () => {
    "use server";
    if (
      searchParams.page &&
      Number(searchParams.page) > 1 &&
      tableData?.data?.queries.length === 1
    ) {
      redirect(getUpdateQueryPageString(patch, searchParams, Number(searchParams.page) - 1));
    }
  };

  const isLoadMoreDisabled = getIsLoadMoreDisabled(
    tableData.data?.paginationPage,
    tableData.data?.totalCount,
    limit,
  );

  return (
    <section className="page-wrapper">
      <h2>Поисковые запросы пользователей.</h2>
      {tableData?.tokens && <UpdateToken tokens={tableData.tokens} />}
      {tableData.status === "error" && tableData.message && (
        <ErrorAlert message={tableData.message} />
      )}
      <section className="table-container">
        <SearchQueriesTableWrapper
          data={tableData?.data?.queries || []}
          text={searchParams.text || ""}
          onDeleteItemAction={deleteSearchQueryAction}
          redirectPageAfterDeleteAction={redirectPageAfterDelete}
          isLoadMoreDisabled={isLoadMoreDisabled}
          patch={patch}
          searchParams={searchParams}
        />
        {typeof tableData?.data?.totalCount === "number" && tableData?.data?.totalCount > limit && (
          <Pagination
            page={Number(tableData?.data?.paginationPage || 0)}
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

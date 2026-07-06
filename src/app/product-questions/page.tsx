"use server";
import { redirect } from "next/navigation";
import { getIsLoadMoreDisabled } from "@/shared/helpers/getIsLoadMoreDisabled";
import { getUpdateQueryPageString } from "@/shared/helpers/getUpdateQueryPageString";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { Pagination } from "@/shared/ui/pagination/Pagination";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import {
  deleteProductQuestionAction,
  fetchProductQuestion,
  fetchProductQuestions,
} from "./action";
import { ProductQuestionsTableWrapper } from "./components/ProductQuestionsTableWrapper/ProductQuestionsTableWrapper";

export default async function ProductQuestionsPage(req: {
  searchParams: Promise<{ page: string }>;
}) {
  const searchParams = await req.searchParams;
  const limit = 10;
  const patch = "/product-questions";
  const tableData = await fetchProductQuestions(String(limit), searchParams.page);

  const redirectPageAfterDelete = async () => {
    "use server";
    if (
      searchParams.page &&
      Number(searchParams.page) > 1 &&
      tableData?.data?.questions.length === 1
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
      <h2>Вопросы к товарам</h2>
      {tableData?.tokens && <UpdateToken tokens={tableData.tokens} />}
      {tableData.status === "error" && tableData.message && (
        <ErrorAlert message={tableData.message} />
      )}
      <section className="table-container">
        <ProductQuestionsTableWrapper
          questions={tableData?.data?.questions || []}
          onDeleteItemAction={deleteProductQuestionAction}
          redirectPageAfterDeleteAction={redirectPageAfterDelete}
          isLoadMoreDisabled={isLoadMoreDisabled}
          patch={patch}
          searchParams={searchParams}
          fetchTableElementAction={fetchProductQuestion}
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

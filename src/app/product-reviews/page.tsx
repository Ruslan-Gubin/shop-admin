"use server";
import { redirect } from "next/navigation";
import { getIsLoadMoreDisabled } from "@/shared/helpers/getIsLoadMoreDisabled";
import { getUpdateQueryPageString } from "@/shared/helpers/getUpdateQueryPageString";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { Pagination } from "@/shared/ui/pagination/Pagination";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import {
  deleteProductReviewAction,
  fetchProductReview,
  fetchProductReviews,
} from "./action";
import { ProductReviewsTableWrapper } from "./components/ProductReviewsTableWrapper/ProductReviewsTableWrapper";

export default async function ProductReviewsPage(req: {
  searchParams: Promise<{ page: string }>;
}) {
  const searchParams = await req.searchParams;
  const limit = 10;
  const patch = "/product-reviews";
  const tableData = await fetchProductReviews(String(limit), searchParams.page);

  const redirectPageAfterDelete = async () => {
    "use server";
    if (
      searchParams.page &&
      Number(searchParams.page) > 1 &&
      tableData?.data?.reviews.length === 1
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
      <h2>Отзывы к товарам</h2>
      {tableData?.tokens && <UpdateToken tokens={tableData.tokens} />}
      {tableData.status === "error" && tableData.message && (
        <ErrorAlert message={tableData.message} />
      )}
      <section className="table-container">
        <ProductReviewsTableWrapper
          reviews={tableData?.data?.reviews || []}
          onDeleteItemAction={deleteProductReviewAction}
          redirectPageAfterDeleteAction={redirectPageAfterDelete}
          isLoadMoreDisabled={isLoadMoreDisabled}
          patch={patch}
          searchParams={searchParams}
          fetchTableElementAction={fetchProductReview}
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

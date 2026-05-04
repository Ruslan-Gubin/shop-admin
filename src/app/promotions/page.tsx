"use server";
import { redirect } from "next/navigation";
import { getIsLoadMoreDisabled } from "@/shared/helpers/getIsLoadMoreDisabled";
import { getUpdateQueryPageString } from "@/shared/helpers/getUpdateQueryPageString";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { Pagination } from "@/shared/ui/pagination/Pagination";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import {
  createPromotionAction,
  deletePromotionAction,
  fetchPromotion,
  fetchPromotions,
  updatePromotionAction,
} from "./action";
import { PromotionsTableWrapper } from "./components/PromotionsTableWrapper/PromotionsTableWrapper";

export default async function PromotionsPage(req: {
  searchParams: Promise<{ page: string; name: string }>;
}) {
  const searchParams = await req.searchParams;
  const tableData = await fetchPromotions(searchParams.name, searchParams.page);
  const patch = "/promotions";
  const limit = 10;

  const redirectPageAfterDelete = async () => {
    "use server";
    if (
      searchParams.page &&
      Number(searchParams.page) > 1 &&
      tableData?.data?.promotions.length === 1
    ) {
      redirect(
        getUpdateQueryPageString("/promotions", searchParams, Number(searchParams.page) - 1),
      );
    }
  };

  const isLoadMoreDisabled = getIsLoadMoreDisabled(
    tableData.data?.paginationPage,
    tableData.data?.totalCount,
    limit,
  );

  return (
    <section className="page-wrapper">
      <h2>Справочник акций — временные предложения со скидкой.</h2>
      {tableData?.tokens && <UpdateToken tokens={tableData.tokens} />}
      {tableData.status === "error" && tableData.message && (
        <ErrorAlert message={tableData.message} />
      )}
      <section className="table-container">
        <PromotionsTableWrapper
          data={tableData?.data?.promotions || []}
          name={searchParams.name || ""}
          onDeleteItemAction={deletePromotionAction}
          redirectPageAfterDeleteAction={redirectPageAfterDelete}
          createPromotionAction={createPromotionAction}
          updatePromotionAction={updatePromotionAction}
          isLoadMoreDisabled={isLoadMoreDisabled}
          patch={patch}
          searchParams={searchParams}
          fetchTableElementAction={fetchPromotion}
        />
        {typeof tableData?.data?.totalCount === "number" && tableData?.data?.totalCount > 10 && (
          <Pagination
            page={Number(tableData?.data?.paginationPage || 0)}
            limit={10}
            total={tableData?.data?.totalCount || 0}
            patch="/promotions"
            searchParams={searchParams}
          />
        )}
      </section>
    </section>
  );
}

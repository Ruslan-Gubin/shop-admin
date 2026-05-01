"use server";
import { redirect } from "next/navigation";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { Pagination } from "@/shared/ui/pagination/Pagination";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import {
  createPromotionAction,
  deletePromotionAction,
  fetchPromotions,
  updatePromotionAction,
} from "./action";
import { PromotionsTableWrapper } from "./components/PromotionsTableWrapper/PromotionsTableWrapper";

export default async function PromotionsPage(req: {
  searchParams: Promise<{ page: string; name: string }>;
}) {
  const searchParams = await req.searchParams;
  const tableData = await fetchPromotions(searchParams.name, searchParams.page);

  const redirectPageAfterDelete = async () => {
    "use server";
    if (
      searchParams.page &&
      Number(searchParams.page) > 1 &&
      tableData?.data?.promotions.length === 1
    ) {
      redirect(`/promotions/?page=${Number(searchParams.page) - 1}`);
    }
  };

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
          name={searchParams.name}
          onDeleteItemAction={deletePromotionAction}
          redirectPageAfterDeleteAction={redirectPageAfterDelete}
          createPromotionAction={createPromotionAction}
          updatePromotionAction={updatePromotionAction}
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

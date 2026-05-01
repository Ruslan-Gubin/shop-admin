"use server";
import { redirect } from "next/navigation";
import { getUpdateQueryPageString } from "@/shared/helpers/getUpdateQueryPageString";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { Pagination } from "@/shared/ui/pagination/Pagination";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import {
  createPriceTypeAction,
  deletePriceTypeAction,
  fetchPriceTypes,
  updatePriceTypeAction,
} from "./action";
import { PriceTypesTableWrapper } from "./components/PriceTypesTableWrapper/PriceTypesTableWrapper";

export default async function PriceTypesPage(req: {
  searchParams: Promise<{ page: string; name: string }>;
}) {
  const searchParams = await req.searchParams;
  const tableData = await fetchPriceTypes(searchParams.name, "10", searchParams.page);

  const redirectPageAfterDelete = async () => {
    "use server";
    if (
      searchParams.page &&
      Number(searchParams.page) > 1 &&
      tableData?.data?.priceTypes.length === 1
    ) {
      redirect(
        getUpdateQueryPageString("/price-types", searchParams, Number(searchParams.page) - 1),
      );
    }
  };

  return (
    <section className="page-wrapper">
      <h2>Справочник типов цен — базовые цены для разных категорий клиентов.</h2>
      {tableData?.tokens && <UpdateToken tokens={tableData.tokens} />}
      {tableData.status === "error" && tableData.message && (
        <ErrorAlert message={tableData.message} />
      )}
      <section className="table-container">
        <PriceTypesTableWrapper
          data={tableData?.data?.priceTypes || []}
          name={searchParams.name}
          onDeleteItemAction={deletePriceTypeAction}
          redirectPageAfterDeleteAction={redirectPageAfterDelete}
          createPriceTypeAction={createPriceTypeAction}
          updatePriceTypeAction={updatePriceTypeAction}
        />
        {typeof tableData?.data?.totalCount === "number" && tableData?.data?.totalCount > 10 && (
          <Pagination
            page={Number(tableData?.data?.paginationPage || 0)}
            limit={10}
            total={tableData?.data?.totalCount || 0}
            patch="/price-types"
            searchParams={searchParams}
          />
        )}
      </section>
    </section>
  );
}

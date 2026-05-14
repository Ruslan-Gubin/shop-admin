"use server";
import { redirect } from "next/navigation";
import { getIsLoadMoreDisabled } from "@/shared/helpers/getIsLoadMoreDisabled";
import { getUpdateQueryPageString } from "@/shared/helpers/getUpdateQueryPageString";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { Pagination } from "@/shared/ui/pagination/Pagination";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { deleteWarehouseAction, fetchWarehouse, fetchWarehouses } from "./action";
import { WarehousesTableWrapper } from "./components/WarehousesTableWrapper/WarehousesTableWrapper";

export default async function WarehousesPage(req: {
  searchParams: Promise<{ page: string; name?: string }>;
}) {
  const searchParams = await req.searchParams;
  const limit = 10;
  const patch = "/warehouses";
  const tableData = await fetchWarehouses(String(limit), searchParams.page, searchParams.name);

  const redirectPageAfterDelete = async () => {
    "use server";
    if (
      searchParams.page &&
      Number(searchParams.page) > 1 &&
      tableData?.data?.warehouses.length === 1
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
      <h2>Справочник складов.</h2>
      {tableData?.tokens && <UpdateToken tokens={tableData.tokens} />}
      {tableData.status === "error" && tableData.message && (
        <ErrorAlert message={tableData.message} />
      )}
      <section className="table-container">
        <WarehousesTableWrapper
          warehouses={tableData?.data?.warehouses || []}
          onDeleteItemAction={deleteWarehouseAction}
          redirectPageAfterDeleteAction={redirectPageAfterDelete}
          name={searchParams.name || ""}
          isLoadMoreDisabled={isLoadMoreDisabled}
          patch={patch}
          searchParams={searchParams}
          fetchTableElementAction={fetchWarehouse}
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


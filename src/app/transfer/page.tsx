"use server";
import { buildAddressString } from "@/shared/helpers/buildAddressString";
import { getIsLoadMoreDisabled } from "@/shared/helpers/getIsLoadMoreDisabled";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { Pagination } from "@/shared/ui/pagination/Pagination";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { fetchTransferAction, fetchTransfers } from "./action";
import { TransferTableWrapper } from "./components/TransferTableWrapper/TransferTableWrapper";

export default async function TransfersPage(req: {
  searchParams: Promise<{ page: string; order_number?: string }>;
}) {
  const searchParams = await req.searchParams;
  const patch = "/transfer";
  const limit = 10;

  const tableData = await fetchTransfers(String(limit), searchParams.page || "1");

  const transfers =
    tableData.data?.transfers.map((el) => ({
      ...el,
      from_warehouse_name: el.from_warehouse?.name || "-/-",
      to_address_formatted: el.to_warehouse?.name
        ? el.to_warehouse?.name
        : el.to_address
          ? buildAddressString(el.to_address)
          : "-/-",
    })) || [];

  const isLoadMoreDisabled = getIsLoadMoreDisabled(
    tableData.data?.paginationPage,
    tableData.data?.totalCount,
    limit,
  );

  return (
    <section className="page-wrapper">
      <h2>Логистика</h2>
      {tableData?.tokens && <UpdateToken tokens={tableData.tokens} />}
      {tableData.status === "error" && tableData.message && (
        <ErrorAlert message={tableData.message} />
      )}
      <section className="table-container">
        <TransferTableWrapper
          transfers={transfers}
          searchParams={searchParams}
          fetchTableElementAction={fetchTransferAction}
          isLoadMoreDisabled={isLoadMoreDisabled}
          patch={patch}
        />
        {tableData?.data &&
          typeof tableData?.data?.totalCount === "number" &&
          tableData?.data?.totalCount > limit && (
            <Pagination
              page={Number(tableData?.data?.paginationPage || 0)}
              limit={limit}
              total={tableData?.data?.totalCount || 0}
              patch={patch}
              searchParams={searchParams}
            />
          )}
      </section>
      {transfers.length === 0 && <p className="empty-table-message">Перемещения не найдены</p>}
    </section>
  );
}

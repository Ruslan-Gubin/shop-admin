"use server";
import { getIsLoadMoreDisabled } from "@/shared/helpers/getIsLoadMoreDisabled";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { Pagination } from "@/shared/ui/pagination/Pagination";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { fetchReceipt, fetchReceiptsWithWarehouses, type ReceiptModelTable } from "./action";
import { ReceiptsTableWrapper } from "./components/ReceiptsTableWrapper/ReceiptsTableWrapper";

export default async function ReceiptsPage(req: {
  searchParams: Promise<{ page: string; name?: string }>;
}) {
  const searchParams = await req.searchParams;
  const limit = 10;
  const patch = "/receipts";

  const [tableData, warehousesData] = await fetchReceiptsWithWarehouses(
    String(limit),
    searchParams.page || "1",
    searchParams.name || "",
  );

  const warehouses = warehousesData.data?.warehouses || [];
  const warehouseNameMap: Record<string, string> = {};
  for (const w of warehouses) {
    warehouseNameMap[String(w.id)] = w.name;
  }

  const receipts: ReceiptModelTable[] =
    tableData.data?.receipts.map((el) => {
      const stockSummary: Record<string, number> = {};

      for (const product of el.products) {
        for (const [warehouseId, qty] of Object.entries(product.stocks)) {
          stockSummary[warehouseId] = (stockSummary[warehouseId] || 0) + qty;
        }
      }

      const displayStocks = Object.entries(stockSummary)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => {
          const name = warehouseNameMap[id] || `Склад #${id}`;
          return `${name}: ${qty}шт`;
        })
        .join(", ");

      return {
        ...el,
        position_count: el.products.length,
        total_count: Object.values(stockSummary).reduce((sum, qty) => sum + qty, 0),
        display_stocks: displayStocks,
      };
    }) || [];

  const isLoadMoreDisabled = getIsLoadMoreDisabled(
    tableData.data?.paginationPage,
    tableData.data?.totalCount,
    limit,
  );

  return (
    <section className="page-wrapper">
      {warehousesData?.tokens && <UpdateToken tokens={warehousesData.tokens} />}
      {tableData?.tokens && <UpdateToken tokens={tableData.tokens} />}
      <h2>Поступления</h2>
      {tableData.status === "error" && tableData.message && (
        <ErrorAlert message={tableData.message} />
      )}
      {warehousesData.status === "error" && warehousesData.message && (
        <ErrorAlert message={warehousesData.message} />
      )}
      <section className="table-container">
        <ReceiptsTableWrapper
          receipts={receipts}
          fetchTableElementAction={fetchReceipt}
          name={searchParams.name || ""}
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

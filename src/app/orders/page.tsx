"use server";
import { priceFormatter } from "@/shared/helpers/formatPrice";
import { getIsLoadMoreDisabled } from "@/shared/helpers/getIsLoadMoreDisabled";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { Pagination } from "@/shared/ui/pagination/Pagination";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { fetchOrder, fetchOrders } from "./action";
import { OrdersTableWrapper } from "./components/OrdersTableWrapper/OrdersTableWrapper";

export default async function OrdersPage(req: {
  searchParams: Promise<{ page: string; order_number?: string }>;
}) {
  const searchParams = await req.searchParams;
  const patch = "/orders";
  const limit = 10;
  const tableData = await fetchOrders(
    String(limit),
    searchParams.page || "1",
    searchParams.order_number || "",
  );

  const isLoadMoreDisabled = getIsLoadMoreDisabled(
    tableData.data?.paginationPage,
    tableData.data?.totalCount,
    limit,
  );

  const orders =
    tableData.data?.orders.map((el) => ({
      ...el,
      total: typeof el.total === "number" && el.total ? priceFormatter.format(el.total) : "---",
    })) || [];

  return (
    <section className="page-wrapper">
      <h2>Заказы</h2>
      {tableData?.tokens && <UpdateToken tokens={tableData.tokens} />}
      {tableData.status === "error" && tableData.message && (
        <ErrorAlert message={tableData.message} />
      )}
      <section className="table-container">
        <OrdersTableWrapper
          orders={orders}
          orderNumber={searchParams.order_number || ""}
          isLoadMoreDisabled={isLoadMoreDisabled}
          patch={patch}
          searchParams={searchParams}
          fetchTableElementAction={fetchOrder}
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
      {orders && orders.length === 0 && <p className="empty-table-message">Заказы не найдены</p>}
    </section>
  );
}

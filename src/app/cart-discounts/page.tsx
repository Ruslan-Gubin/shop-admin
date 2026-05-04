"use server";
import { redirect } from "next/navigation";
import { getIsLoadMoreDisabled } from "@/shared/helpers/getIsLoadMoreDisabled";
import { getUpdateQueryPageString } from "@/shared/helpers/getUpdateQueryPageString";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { Pagination } from "@/shared/ui/pagination/Pagination";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import {
  createCartDiscountAction,
  deleteCartDiscountAction,
  fetchCartDiscount,
  fetchCartDiscounts,
  updateCartDiscountAction,
} from "./action";
import { CartDiscountsTableWrapper } from "./components/CartDiscountsTableWrapper/CartDiscountsTableWrapper";

export default async function CartDiscountsPage(req: {
  searchParams: Promise<{ page: string; name: string }>;
}) {
  const searchParams = await req.searchParams;
  const tableData = await fetchCartDiscounts(searchParams.name, searchParams.page);
  const patch = "/cart-discounts";
  const limit = 10;

  const redirectPageAfterDelete = async () => {
    "use server";
    if (
      searchParams.page &&
      Number(searchParams.page) > 1 &&
      tableData?.data?.cartDiscounts.length === 1
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
      <h2>Справочник скидок на корзину — скидки от суммы заказа.</h2>
      {tableData?.tokens && <UpdateToken tokens={tableData.tokens} />}
      {tableData.status === "error" && tableData.message && (
        <ErrorAlert message={tableData.message} />
      )}
      <section className="table-container">
        <CartDiscountsTableWrapper
          data={tableData?.data?.cartDiscounts || []}
          name={searchParams.name || ""}
          onDeleteItemAction={deleteCartDiscountAction}
          redirectPageAfterDeleteAction={redirectPageAfterDelete}
          createCartDiscountAction={createCartDiscountAction}
          updateCartDiscountAction={updateCartDiscountAction}
          isLoadMoreDisabled={isLoadMoreDisabled}
          patch={patch}
          searchParams={searchParams}
          fetchTableElementAction={fetchCartDiscount}
        />
        {typeof tableData?.data?.totalCount === "number" && tableData?.data?.totalCount > 10 && (
          <Pagination
            page={Number(tableData?.data?.paginationPage || 0)}
            limit={10}
            total={tableData?.data?.totalCount || 0}
            patch="/cart-discounts"
            searchParams={searchParams}
          />
        )}
      </section>
    </section>
  );
}

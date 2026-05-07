"use server";
import { redirect } from "next/navigation";
import { getIsLoadMoreDisabled } from "@/shared/helpers/getIsLoadMoreDisabled";
import { getUpdateQueryPageString } from "@/shared/helpers/getUpdateQueryPageString";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { Pagination } from "@/shared/ui/pagination/Pagination";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { deleteProductAction, fetchProduct, fetchProducts } from "./action";
import { ProductsTableWrapper } from "./components/ProductsTableWrapper/ProductsTableWrapper";

export default async function ProductsPage(req: {
  searchParams: Promise<{ page: string; name?: string }>;
}) {
  const searchParams = await req.searchParams;
  const tableData = await fetchProducts(searchParams.page, searchParams.name);
  const patch = "/product";
  const limit = 10;

  const redirectPageAfterDelete = async () => {
    "use server";
    if (
      searchParams.page &&
      Number(searchParams.page) > 1 &&
      tableData?.data?.products.length === 1
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
      {tableData?.tokens && <UpdateToken tokens={tableData.tokens} />}
      <h2>Справочник товаров.</h2>
      {tableData.status === "error" && tableData.message && (
        <ErrorAlert message={tableData.message} />
      )}
      <section className="table-container">
        <ProductsTableWrapper
          products={tableData?.data?.products || []}
          onDeleteItemAction={deleteProductAction}
          redirectPageAfterDeleteAction={redirectPageAfterDelete}
          name={searchParams.name || ""}
          isLoadMoreDisabled={isLoadMoreDisabled}
          patch={patch}
          searchParams={searchParams}
          fetchTableElementAction={fetchProduct}
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

"use server";
import { redirect } from "next/navigation";
import { getUpdateQueryPageString } from "@/shared/helpers/getUpdateQueryPageString";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { Pagination } from "@/shared/ui/pagination/Pagination";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { deleteProductAction, fetchProducts } from "./action";
import { ProductsTableWrapper } from "./product/components/ProductsTableWrapper/ProductsTableWrapper";

export default async function HomePage(req: {
  searchParams: Promise<{ page: string; name?: string }>;
}) {
  const searchParams = await req.searchParams;
  const tableData = await fetchProducts(searchParams.page, searchParams.name);

  const redirectPageAfterDelete = async () => {
    "use server";
    if (
      searchParams.page &&
      Number(searchParams.page) > 1 &&
      tableData?.data?.products.length === 1
    ) {
      redirect(getUpdateQueryPageString("/", searchParams, Number(searchParams.page) - 1));
    }
  };

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
        />
        {typeof tableData?.data?.totalCount === "number" && tableData?.data?.totalCount > 10 && (
          <Pagination
            page={Number(tableData?.data?.paginationPage || 0)}
            limit={10}
            total={tableData?.data?.totalCount || 0}
            patch="/"
            searchParams={searchParams}
          />
        )}
      </section>
    </section>
  );
}

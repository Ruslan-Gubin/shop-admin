"use server";
import { redirect } from "next/navigation";
import { formattedPhotoSrc } from "@/shared/helpers/formattedPhotoSrc";
import { getIsLoadMoreDisabled } from "@/shared/helpers/getIsLoadMoreDisabled";
import { getUpdateQueryPageString } from "@/shared/helpers/getUpdateQueryPageString";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { PageHeader } from "@/shared/ui/page-header/PageHeader";
import { Pagination } from "@/shared/ui/pagination/Pagination";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { deleteProductAction, fetchProduct, fetchProducts } from "./action";
import {
  type ProductModelTable,
  ProductsTableWrapper,
} from "./components/ProductsTableWrapper/ProductsTableWrapper";

export default async function ProductsPage(req: {
  searchParams: Promise<{ page: string; name?: string }>;
}) {
  const searchParams = await req.searchParams;
  const patch = "/product";
  const limit = 10;

  const tableData = await fetchProducts(
    String(limit),
    searchParams.page || "1",
    searchParams.name || "",
  );

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

  const products: ProductModelTable[] = Array.isArray(tableData?.data?.products)
    ? tableData?.data?.products.map((product) => ({
        ...product,
        photo_src: formattedPhotoSrc(product?.photos[0]?.url),
      }))
    : [];
  console.log();

  return (
    <section className="page-wrapper">
      {tableData?.tokens && <UpdateToken tokens={tableData.tokens} />}
      <PageHeader title="Справочник товаров." />
      {tableData.status === "error" && tableData.message && (
        <ErrorAlert message={tableData.message} />
      )}
      <section className="table-container">
        <ProductsTableWrapper
          products={products}
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

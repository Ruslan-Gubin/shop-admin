"use server";
import { redirect } from "next/navigation";
import { getIsLoadMoreDisabled } from "@/shared/helpers/getIsLoadMoreDisabled";
import { getUpdateQueryPageString } from "@/shared/helpers/getUpdateQueryPageString";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { Pagination } from "@/shared/ui/pagination/Pagination";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import {
  createSpecificationAction,
  deleteSpecificationAction,
  fetchFeatureName,
  fetchSpecifications,
  updateFeatureNameAction,
} from "./action";
import { SpecificationTableWrapper } from "./components/SpecificationTableWrapper/SpecificationWrapper";

export default async function SpecificationsPage(req: {
  searchParams: Promise<{ page: string; name: string }>;
}) {
  const searchParams = await req.searchParams;
  const tableData = await fetchSpecifications(searchParams.name, "10", searchParams.page);
  const patch = "/feature-names";
  const limit = 10;

  const redirectPageAfterDelete = async () => {
    "use server";
    if (
      searchParams.page &&
      Number(searchParams.page) > 1 &&
      tableData?.data?.featureNames.length === 1
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
      <h2>Справочник характеристик — названия характеристик для товаров.</h2>
      {tableData?.tokens && <UpdateToken tokens={tableData.tokens} />}
      {tableData.status === "error" && tableData.message && (
        <ErrorAlert message={tableData.message} />
      )}
      <section className="table-container">
        <SpecificationTableWrapper
          data={tableData?.data?.featureNames || []}
          name={searchParams.name || ""}
          onDeleteItemAction={deleteSpecificationAction}
          createFeatureNameAction={createSpecificationAction}
          updateFeatureNameAction={updateFeatureNameAction}
          fetchTableElementAction={fetchFeatureName}
          redirectPageAfterDeleteAction={redirectPageAfterDelete}
          isLoadMoreDisabled={isLoadMoreDisabled}
          patch={patch}
          searchParams={searchParams}
        />
        {typeof tableData?.data?.totalCount === "number" && tableData?.data?.totalCount > 10 && (
          <Pagination
            page={Number(tableData?.data?.paginationPage || 0)}
            limit={10}
            total={tableData?.data?.totalCount || 0}
            patch="/feature-names"
            searchParams={searchParams}
          />
        )}
      </section>
    </section>
  );
}

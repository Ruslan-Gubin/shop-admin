"use server";
import { redirect } from "next/navigation";
import { getIsLoadMoreDisabled } from "@/shared/helpers/getIsLoadMoreDisabled";
import { getUpdateQueryPageString } from "@/shared/helpers/getUpdateQueryPageString";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { Pagination } from "@/shared/ui/pagination/Pagination";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { deleteUserAction, fetchUser, fetchUsers } from "./action";
import { UsersTableWrapper } from "./components/UsersTableWrapper/UsersTableWrapper";

export default async function UsersPage(req: {
  searchParams: Promise<{ page: string; name?: string }>;
}) {
  const searchParams = await req.searchParams;
  const tableData = await fetchUsers(searchParams.page, searchParams.name);
  const patch = "/users";
  const limit = 10;

  const redirectPageAfterDelete = async () => {
    "use server";
    if (searchParams.page && Number(searchParams.page) > 1 && tableData?.data?.users.length === 1) {
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
      {tableData.status === "error" && tableData.message && (
        <ErrorAlert message={tableData.message} />
      )}
      <h2>Справочник пользователей.</h2>
      <section className="table-container">
        <UsersTableWrapper
          users={tableData?.data?.users || []}
          onDeleteItemAction={deleteUserAction}
          redirectPageAfterDeleteAction={redirectPageAfterDelete}
          name={searchParams.name || ""}
          isLoadMoreDisabled={isLoadMoreDisabled}
          patch={patch}
          searchParams={searchParams}
          fetchTableElementAction={fetchUser}
        />
        {tableData?.data &&
          typeof tableData?.data?.totalCount === "number" &&
          tableData?.data?.totalCount > 10 && (
            <Pagination
              page={Number(tableData?.data?.paginationPage || 0)}
              limit={10}
              total={tableData?.data?.totalCount || 0}
              patch={patch}
              searchParams={searchParams}
            />
          )}
      </section>
    </section>
  );
}

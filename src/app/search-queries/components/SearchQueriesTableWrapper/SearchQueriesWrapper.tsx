"use client";
import { useState, useTransition } from "react";
import { useWindowSize } from "@/shared/hooks/useWindowSize";
import { notificationAdapter } from "@/stores/notification/adapter";
import { MainMobileTable } from "@/widgets/main-mobile-table/MainMobileTable";
import { MainTable, type RenderTableOptions } from "@/widgets/main-table/MainTable";
import { ModalDelete } from "@/widgets/modals/modal-delete/ModalDelete";
import { TableControls } from "@/widgets/table-controls/TableControls";
import type { SearchModel } from "../../action";

type Props = {
  data: SearchModel[];
  onDeleteItemAction: (id: number) => Promise<{ status: "error" | "success"; message: string }>;
  redirectPageAfterDeleteAction: () => void;
  text: string;
  isLoadMoreDisabled: boolean;
  patch: string;
  searchParams: { [key: string]: string | string[] | undefined };
};

type SearchModelDisplay = SearchModel & {
  days_since_update_display: string;
  updated_at_display: string;
};

const getDaysSinceUpdate = (updatedAt: string | null, createdAt: string): string => {
  let result = "Сегодня";

  if (updatedAt) {
    const updatedDate = new Date(updatedAt ? updatedAt : createdAt);
    const now = new Date();
    const diffTime = now.getTime() - updatedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      result = `${diffDays} дн.`;
    }
  }

  return result;
};

export const SearchQueriesTableWrapper = (props: Props) => {
  const { isMobile, isMounted } = useWindowSize();
  const [submitLoading, transition] = useTransition();
  const [deleteModal, setDeleteModal] = useState<{
    id: number | null;
    isOpen: boolean;
  }>({
    id: null,
    isOpen: false,
  });

  const handleOpenDeleteModal = (id: number) =>
    setDeleteModal({
      id,
      isOpen: true,
    });

  const handleCloseDeleteModal = () =>
    setDeleteModal({
      id: null,
      isOpen: false,
    });

  const submitDelete = () => {
    if (deleteModal.isOpen) {
      transition(() => {
        if (deleteModal.id) {
          props.onDeleteItemAction(deleteModal.id).then((res) => {
            notificationAdapter.add(res.message, res.status);
            if (res.status === "success") {
              props.redirectPageAfterDeleteAction();
            }
            handleCloseDeleteModal();
          });
        }
      });
    }
  };

  const processedData: SearchModelDisplay[] = props.data.map((item) => {
    return {
      ...item,
      days_since_update_display: getDaysSinceUpdate(item.updated_at, item.created_at),
      updated_at_display: item.updated_at ? new Date(item.updated_at).toLocaleString() : "—",
    };
  });

  const tableOptions: RenderTableOptions<SearchModelDisplay>[] = [
    { key: "id" },
    { key: "text" },
    { key: "views" },
    { key: "result_count" },
    { key: "days_since_update_display" },
    { key: "updated_at_display" },
  ];

  const headerRowLabels = [
    "ID",
    "Текст поиска",
    "Просмотры",
    "Результатов",
    "Последняя активация",
    "Дата обновления",
  ];

  return (
    <>
      <ModalDelete
        submit={submitDelete}
        title="Действительно хотите удалить поисковый запрос?"
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        disabled={submitLoading}
        showSubTitle={true}
      />
      <div className="table-container">
        <TableControls
          name={props.text}
          queryKey="text"
          inputSearchLabel="Поиск по тексту запроса"
        />
        {isMounted && !isMobile && processedData.length > 0 && (
          <MainTable
            data={processedData}
            onDeleteAction={(id) => handleOpenDeleteModal(id)}
            headerRowLabels={headerRowLabels}
            stickyActionColumn
            gridTemplateColumns="65px minmax(200px, 1fr) minmax(110px, 120px) minmax(110px, 120px) 180px 170px 58px"
            tableOptions={tableOptions}
          />
        )}

        {isMounted && isMobile && processedData.length > 0 && (
          <MainMobileTable
            titleKey="text"
            data={processedData}
            onDeleteAction={(id) => handleOpenDeleteModal(id)}
            tableOptions={tableOptions}
            headerRowLabels={headerRowLabels}
            headerRowWidth={["38px", "100px", "60px", "80px", "120px", "120px", "80px"]}
            searchParams={props.searchParams}
            isLoadMoreDisabled={props.isLoadMoreDisabled}
            patch={props.patch}
            fetchTableElementAction={async () => {
              return { data: null, status: "error", message: "", errors: [], tokens: null };
            }}
          />
        )}
      </div>
    </>
  );
};

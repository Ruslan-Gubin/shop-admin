"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useWindowSize } from "@/shared/hooks/useWindowSize";
import { notificationAdapter } from "@/stores/notification/adapter";
import { MainMobileTable } from "@/widgets/main-mobile-table/MainMobileTable";
import { MainTable, type RenderTableOptions } from "@/widgets/main-table/MainTable";
import { ModalDelete } from "@/widgets/modals/modal-delete/ModalDelete";
import { TableControls } from "@/widgets/table-controls/TableControls";
import type { UserModel } from "../../action";

type Props = {
  users: UserModel[];
  onDeleteItemAction: (id: number) => Promise<{ status: "error" | "success"; message: string }>;
  redirectPageAfterDeleteAction: () => void;
  name: string;
  isLoadMoreDisabled: boolean;
  patch: string;
  searchParams: { [key: string]: string | string[] | undefined };
};

export const UsersTableWrapper = (props: Props) => {
  const router = useRouter();
  const { isMobile } = useWindowSize();
  const [submitLoading, transition] = useTransition();
  const [optionFormModal, setOptionFormModal] = useState<{
    id: number | null;
    isOpen: boolean;
    isDelete: boolean;
  }>({
    id: null,
    isOpen: false,
    isDelete: false,
  });

  const handleOpenDeleteModal = (id: number) =>
    setOptionFormModal({
      id,
      isOpen: true,
      isDelete: true,
    });

  const handleCloseFormModal = () =>
    setOptionFormModal({
      id: null,
      isOpen: false,
      isDelete: false,
    });

  const submitDelete = () => {
    if (optionFormModal.isDelete && optionFormModal.isOpen) {
      transition(() => {
        if (optionFormModal.id) {
          props.onDeleteItemAction(optionFormModal.id).then((res) => {
            notificationAdapter.add(res.message, res.status);
            if (res.status === "success") {
              props.redirectPageAfterDeleteAction();
            }
            handleCloseFormModal();
          });
        }
      });
    }
  };

  const handleEditRouter = (item: UserModel) => {
    if (item.id) {
      router.push(`/users/edit/${item.id}`);
    }
  };

  const tableOptions: RenderTableOptions<UserModel>[] = [
    { key: "id" },
    { key: "name" },
    { key: "phone" },
    { key: "email" },
    { key: "role" },
    { key: "created_at", type: "date" },
  ];

  const headerRowLabels = ["ID", "Имя", "Телефон", "Почта", "Аватар", "Дата регистрации"];

  return (
    <>
      <ModalDelete
        submit={submitDelete}
        title="Действительно хотите удалить пользователя?"
        isOpen={optionFormModal.isOpen && optionFormModal.isDelete}
        onClose={handleCloseFormModal}
        disabled={submitLoading}
        showSubTitle={true}
      />
      <div className="table-container">
        <TableControls
          addAction={{
            href: "/users/create",
            text: "Добавить пользователя",
          }}
          name={props.name}
          queryKey="name"
        />
        {props.users && props.users.length > 0 && !isMobile && (
          <MainTable
            data={props.users}
            onEditAction={handleEditRouter}
            onDeleteAction={handleOpenDeleteModal}
            headerRowLabels={headerRowLabels}
            stickyActionColumn
            gridTemplateColumns="65px minmax(120px, 192px) minmax(120px, 192px) 192px minmax(100px, 160px) minmax(160px, 1fr) 58px"
            tableOptions={tableOptions}
          />
        )}

        {props.users && props.users.length > 0 && isMobile && (
          <MainMobileTable
            titleKey="name"
            data={props.users}
            onEditAction={handleEditRouter}
            onDeleteAction={handleOpenDeleteModal}
            tableOptions={tableOptions}
            headerRowLabels={headerRowLabels}
            headerRowWidth={["38px", "100px", "100px", "80px", "100px", "120px"]}
            searchParams={props.searchParams}
            isLoadMoreDisabled={props.isLoadMoreDisabled}
            patch={props.patch}
          />
        )}
      </div>
    </>
  );
};

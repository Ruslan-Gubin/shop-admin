"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { notificationAdapter } from "@/stores/notification/adapter";
import { MainTable, type RenderTableOptions } from "@/widgets/main-table/MainTable";
import { ModalDelete } from "@/widgets/modals/modal-delete/ModalDelete";
import { TaleControls } from "@/widgets/table-controls/TaleControls";
import type { UserModel } from "../../action";

type Props = {
  users: UserModel[];
  onDeleteItemAction: (id: number) => Promise<{ status: "error" | "success"; message: string }>;
  redirectPageAfterDeleteAction: () => void;
  name: string;
};

export const UsersTableWrapper = (props: Props) => {
  const router = useRouter();
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
        <TaleControls
          addAction={{
            href: "/users/create",
            text: "Добавить пользователя",
          }}
          name={props.name}
          queryKey="name"
        />
        {props.users && props.users.length > 0 && (
          <MainTable
            data={props.users}
            onEditAction={handleEditRouter}
            onDeleteAction={handleOpenDeleteModal}
            headerRowLabels={["ID", "Имя", "Телефон", "Почта", "Аватар", "Дата регистрации"]}
            stickyActionColumn
            gridTemplateColumns="65px minmax(120px, 192px) minmax(120px, 192px) 192px minmax(100px, 160px) minmax(160px, 1fr) 58px"
            tableOptions={tableOptions}
          />
        )}
      </div>
    </>
  );
};

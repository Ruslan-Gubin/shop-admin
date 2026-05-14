"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useWindowSize } from "@/shared/hooks/useWindowSize";
import type { ResponseData } from "@/shared/types/response";
import { notificationAdapter } from "@/stores/notification/adapter";
import { MainMobileTable } from "@/widgets/main-mobile-table/MainMobileTable";
import { MainTable, type RenderTableOptions } from "@/widgets/main-table/MainTable";
import { ModalDelete } from "@/widgets/modals/modal-delete/ModalDelete";
import { TableControls } from "@/widgets/table-controls/TableControls";
import type { WarehouseModel } from "../../action";

type Props = {
  warehouses: WarehouseModel[];
  onDeleteItemAction: (id: number) => Promise<{ status: "error" | "success"; message: string }>;
  redirectPageAfterDeleteAction: () => void;
  name: string;
  isLoadMoreDisabled: boolean;
  patch: string;
  searchParams: { [key: string]: string | string[] | undefined };
  fetchTableElementAction: (id: string) => Promise<ResponseData<WarehouseModel>>;
};

export const WarehousesTableWrapper = (props: Props) => {
  const router = useRouter();
  const { isMobile, isMounted } = useWindowSize();
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

  const handleEditRouter = (item: WarehouseModel) => {
    if (item.id) {
      router.push(`/warehouses/edit/${item.id}`);
    }
  };

  const tableOptions: RenderTableOptions<WarehouseModel>[] = [
    { key: "id" },
    { key: "name" },
    { key: "address" },
    { key: "city" },
    { key: "is_active", type: "boolean", typeConfig: { booleanLabels: ["Да", "Нет"] } },
    { key: "is_public", type: "boolean", typeConfig: { booleanLabels: ["Да", "Нет"] } },
    { key: "default_warehouse", type: "boolean", typeConfig: { booleanLabels: ["Да", "Нет"] } },
  ];

  const headerRowLabels = [
    "ID",
    "Название",
    "Адрес",
    "Город",
    "Активен",
    "Публичный",
    "Склад по умолчанию",
  ];

  return (
    <>
      <ModalDelete
        submit={submitDelete}
        title="Действительно хотите удалить склад?"
        isOpen={optionFormModal.isOpen && optionFormModal.isDelete}
        onClose={handleCloseFormModal}
        disabled={submitLoading}
        showSubTitle={true}
      />
      <div className="table-container">
        <TableControls
          addAction={{
            href: "/warehouses/create",
            text: "Создать склад",
          }}
          name={props.name}
          queryKey="name"
        />
        {isMounted && !isMobile && props.warehouses && props.warehouses.length > 0 && (
          <MainTable
            data={props.warehouses}
            onEditAction={handleEditRouter}
            onDeleteAction={handleOpenDeleteModal}
            headerRowLabels={headerRowLabels}
            stickyActionColumn
            stickyFirstColumn
            gridTemplateColumns="65px minmax(150px, 1fr) minmax(120px, 180px) minmax(100px, 150px) 100px 100px 170px 58px"
            tableOptions={tableOptions}
          />
        )}

        {isMounted && isMobile && props.warehouses && props.warehouses.length > 0 && (
          <MainMobileTable
            titleKey="name"
            data={props.warehouses}
            onEditAction={handleEditRouter}
            onDeleteAction={handleOpenDeleteModal}
            tableOptions={tableOptions}
            headerRowLabels={headerRowLabels}
            headerRowWidth={["38px", "150px", "150px", "100px", "80px", "80px", "120px"]}
            searchParams={props.searchParams}
            isLoadMoreDisabled={props.isLoadMoreDisabled}
            patch={props.patch}
            fetchTableElementAction={props.fetchTableElementAction}
          />
        )}
      </div>
    </>
  );
};

"use client";
import { useRouter } from "next/navigation";
import { Activity, useState, useTransition } from "react";
import type { ProductModel } from "@/app/action";
import { notificationAdapter } from "@/stores/notification/adapter";
import { MainMobileTable } from "@/widgets/main-mobile-table/MainMobileTable";
import { MainTable, type RenderTableOptions } from "@/widgets/main-table/MainTable";
import { ModalDelete } from "@/widgets/modals/modal-delete/ModalDelete";
import { TaleControls } from "@/widgets/table-controls/TaleControls";

type Props = {
  products: ProductModel[];
  onDeleteItemAction: (id: number) => Promise<{ status: "error" | "success"; message: string }>;
  redirectPageAfterDeleteAction: () => void;
  name: string;
};

export const ProductsTableWrapper = (props: Props) => {
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

  const handleEditRouter = (item: ProductModel) => {
    if (item.id) {
      router.push(`/product/edit/${item.id}`);
    }
  };

  const tableOptions: RenderTableOptions<ProductModel>[] = [
    { key: "id" },
    { key: "name" },
    { key: "count" },
    { key: "price" },
    { key: "code" },
    { key: "created_at", type: "date" },
  ];

  const headerRowLabels = [
    "ID",
    "Название",
    "Количество",
    "Цена",
    "Штриховой код",
    "Дата регистрации",
  ];

  return (
    <>
      <ModalDelete
        submit={submitDelete}
        title="Действительно хотите удалить товар?"
        isOpen={optionFormModal.isOpen && optionFormModal.isDelete}
        onClose={handleCloseFormModal}
        disabled={submitLoading}
        showSubTitle={true}
      />
      <div className="table-container">
        <TaleControls
          addAction={{
            href: "/product/create",
            text: "Добавить товар",
          }}
          name={props.name}
          queryKey="name"
        />
        {props.products && props.products.length > 0 && (
          <>
            <Activity mode="hidden">
              <MainTable
                data={props.products}
                onEditAction={handleEditRouter}
                onDeleteAction={handleOpenDeleteModal}
                headerRowLabels={headerRowLabels}
                stickyActionColumn
                stickyFirstColumn
                gridTemplateColumns="65px minmax(150px, 1fr) minmax(110px, 150px) minmax(110px, 150px) minmax(130px, 150px) 160px 58px"
                tableOptions={tableOptions}
              />
            </Activity>
            <Activity mode="visible">
              <MainMobileTable
                data={props.products}
                onEditAction={handleEditRouter}
                onDeleteAction={handleOpenDeleteModal}
                tableOptions={tableOptions}
                headerRowLabels={headerRowLabels}
              />
            </Activity>
          </>
        )}
      </div>
    </>
  );
};

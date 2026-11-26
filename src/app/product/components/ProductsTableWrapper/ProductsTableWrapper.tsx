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
import type { ProductModel } from "../../action";

export interface ProductModelTable extends ProductModel {
  photo_src: string;
}

type Props = {
  products: ProductModelTable[];
  onDeleteItemAction: (id: number) => Promise<{ status: "error" | "success"; message: string }>;
  redirectPageAfterDeleteAction: () => void;
  fetchTableElementAction: (id: string) => Promise<ResponseData<ProductModelTable>>;
  name: string;
  isLoadMoreDisabled: boolean;
  patch: string;
  searchParams: { [key: string]: string | string[] | undefined };
};

export const ProductsTableWrapper = (props: Props) => {
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

  const handleOpenDeleteModal = (item: ProductModelTable) =>
    setOptionFormModal({
      id: item.id,
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

  const handleEditRouter = (item: ProductModelTable) => {
    if (item.id) {
      router.push(`/product/edit/${item.id}`);
    }
  };

  const handleInfoRouter = (item: ProductModelTable) => {
    if (item.id) {
      router.push(`/product/info/${item.id}`);
    }
  };

  const tableOptions: RenderTableOptions<ProductModelTable>[] = [
    { key: "id" },
    {
      key: "photo_src",
      type: "avatar",
    },
    { key: "name" },
    { key: "description" },
    { key: "product_type" },
    { key: "code" },
    { key: "created_at", type: "date" },
  ];

  const headerRowLabels = [
    "ID",
    "Фото",
    "Название",
    "Описание",
    "Вид товара",
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
        <TableControls
          addAction={{
            href: "/product/create",
            text: "Создать товар",
          }}
          name={props.name}
          queryKey="name"
        />
        {isMounted && !isMobile && props.products && props.products.length > 0 && (
          <MainTable
            data={props.products}
            headerRowLabels={headerRowLabels}
            stickyActionColumn={true}
            stickyFirstColumn
            gridTemplateColumns="65px 80px minmax(150px, 1fr) minmax(150px, 240px) minmax(110px, 150px) minmax(130px, 150px) 160px 32px"
            tableOptions={tableOptions}
            actions={[
              { label: "Подробнее", action: handleInfoRouter },
              { label: "Редактировать", action: handleEditRouter },
              { label: "Удалить", action: handleOpenDeleteModal },
            ]}
          />
        )}

        {isMounted && isMobile && props.products && props.products.length > 0 && (
          <MainMobileTable
            titleKey="name"
            data={props.products}
            tableOptions={tableOptions}
            headerRowLabels={headerRowLabels}
            headerRowWidth={["38px", "28px", "140px", "100px", "80px", "100px", "120px"]}
            searchParams={props.searchParams}
            isLoadMoreDisabled={props.isLoadMoreDisabled}
            patch={props.patch}
            fetchTableElementAction={props.fetchTableElementAction}
            actions={[
              { label: "Подробнее", action: handleInfoRouter },
              { label: "Редактировать", action: handleEditRouter },
              { label: "Удалить", action: handleOpenDeleteModal },
            ]}
          />
        )}
      </div>
    </>
  );
};

"use client";
import { useState, useTransition } from "react";
import { useWindowSize } from "@/shared/hooks/useWindowSize";
import type { ResponseData } from "@/shared/types/response";
import { notificationAdapter } from "@/stores/notification/adapter";
import { MainMobileTable } from "@/widgets/main-mobile-table/MainMobileTable";
import { MainTable, type RenderTableOptions } from "@/widgets/main-table/MainTable";
import { ModalDelete } from "@/widgets/modals/modal-delete/ModalDelete";
import { TableControls } from "@/widgets/table-controls/TableControls";
import type { CreatePriceTypeFormFields, PriceTypeModel } from "../../action";
import { ModalPriceTypeForm } from "../modal-price-type-form/ModalPriceTypeForm";

type Props = {
  data: PriceTypeModel[];
  onDeleteItemAction: (id: number) => Promise<{ status: "error" | "success"; message: string }>;
  redirectPageAfterDeleteAction: () => void;
  name: string;
  createPriceTypeAction: (
    prevState: CreatePriceTypeFormFields,
    formData: FormData,
  ) => Promise<CreatePriceTypeFormFields>;
  updatePriceTypeAction: (
    prevState: CreatePriceTypeFormFields,
    formData: FormData,
  ) => Promise<CreatePriceTypeFormFields>;
  isLoadMoreDisabled: boolean;
  patch: string;
  searchParams: { [key: string]: string | string[] | undefined };
  fetchTableElementAction: (id: string) => Promise<ResponseData<PriceTypeModel>>;
};

export const PriceTypesTableWrapper = (props: Props) => {
  const { isMobile, isMounted } = useWindowSize();
  const [submitLoading, transition] = useTransition();
  const [optionFormModal, setOptionFormModal] = useState<{
    id: number | null;
    isOpen: boolean;
    name: string;
    description: string;
    minQuantity: string;
    isPublic: boolean;
    isDelete: boolean;
  }>({
    id: null,
    isOpen: false,
    name: "",
    description: "",
    minQuantity: "",
    isPublic: false,
    isDelete: false,
  });

  const handleOpenEditModal = (item: PriceTypeModel) =>
    setOptionFormModal({
      id: item.id,
      isOpen: true,
      name: item.name,
      description: item.description,
      minQuantity: item.minQuantity ? String(item.minQuantity) : "",
      isPublic: item.isPublic,
      isDelete: false,
    });

  const handleOpenMainModal = () => {
    setOptionFormModal({
      id: null,
      isOpen: true,
      name: "",
      description: "",
      minQuantity: "",
      isPublic: false,
      isDelete: false,
    });
  };

  const handleCloseFormModal = () =>
    setOptionFormModal({
      id: null,
      isOpen: false,
      name: "",
      description: "",
      minQuantity: "",
      isPublic: false,
      isDelete: false,
    });

  const handleOpenDeleteModal = (item: PriceTypeModel) =>
    setOptionFormModal({
      id: item.id,
      isOpen: true,
      name: "",
      description: "",
      minQuantity: "",
      isPublic: false,
      isDelete: true,
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

  const isEditModal = optionFormModal.name.length > 0 && typeof optionFormModal.id === "number";
  const modalTitle = isEditModal ? "Редактировать тип цены" : "Добавить тип цены";
  const submitButtonText = isEditModal ? "Редактировать" : "Добавить";
  const onSubmitAction = isEditModal ? props.updatePriceTypeAction : props.createPriceTypeAction;

  const tableOptions: RenderTableOptions<PriceTypeModel>[] = [
    { key: "id" },
    { key: "name" },
    { key: "description" },
    { key: "minQuantity" },
    { key: "isPublic", type: "boolean", typeConfig: { booleanLabels: ["Да", "Нет"] } },
  ];

  return (
    <>
      {optionFormModal.isOpen && !optionFormModal.isDelete && (
        <ModalPriceTypeForm
          isOpen={optionFormModal.isOpen}
          onCloseModal={handleCloseFormModal}
          onSubmitAction={onSubmitAction}
          title={modalTitle}
          submitButtonText={submitButtonText}
          initValue={{
            name: optionFormModal.name,
            description: optionFormModal.description,
            minQuantity: optionFormModal.minQuantity,
            isPublic: optionFormModal.isPublic,
            id: optionFormModal.id,
          }}
        />
      )}
      <ModalDelete
        submit={submitDelete}
        title="Действительно хотите удалить тип цены?"
        isOpen={optionFormModal.isOpen && optionFormModal.isDelete}
        onClose={handleCloseFormModal}
        disabled={submitLoading}
        showSubTitle={true}
      />
      <div className="table-container">
        <TableControls
          addAction={{
            text: "Добавить тип цены",
            onClick: handleOpenMainModal,
          }}
          name={props.name}
          queryKey="name"
        />
        {isMounted && !isMobile && props.data && props.data.length > 0 && (
          <MainTable
            data={props.data}
            headerRowLabels={["ID", "Название", "Описание", "От количества", "Публичный"]}
            stickyActionColumn
            gridTemplateColumns="65px minmax(150px, 220px) minmax(120px, 1fr) minmax(120px, 140px) minmax(120px, 140px) 32px"
            tableOptions={tableOptions}
            actions={[
              { label: "Редактировать", action: handleOpenEditModal },
              { label: "Удалить", action: handleOpenDeleteModal },
            ]}
          />
        )}

        {isMounted && isMobile && props.data && props.data.length > 0 && (
          <MainMobileTable
            titleKey="name"
            data={props.data}
            tableOptions={tableOptions}
            headerRowLabels={["ID", "Название", "Описание", "От количества", "Публичный"]}
            headerRowWidth={["38px", "100px", "100px", "80px", "100px"]}
            searchParams={props.searchParams}
            isLoadMoreDisabled={props.isLoadMoreDisabled}
            patch={props.patch}
            fetchTableElementAction={props.fetchTableElementAction}
            actions={[
              { label: "Редактировать", action: handleOpenEditModal },
              { label: "Удалить", action: handleOpenDeleteModal },
            ]}
          />
        )}
      </div>
    </>
  );
};

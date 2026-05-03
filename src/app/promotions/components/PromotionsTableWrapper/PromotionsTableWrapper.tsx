"use client";
import { useState, useTransition } from "react";
import { useWindowSize } from "@/shared/hooks/useWindowSize";
import { notificationAdapter } from "@/stores/notification/adapter";
import { MainMobileTable } from "@/widgets/main-mobile-table/MainMobileTable";
import { MainTable, type RenderTableOptions } from "@/widgets/main-table/MainTable";
import { ModalDelete } from "@/widgets/modals/modal-delete/ModalDelete";
import { TableControls } from "@/widgets/table-controls/TableControls";
import type { CreatePromotionFormFields, PromotionModel } from "../../action";
import { ModalPromotionForm } from "../modal-promotion-form/ModalPromotionForm";

type Props = {
  data: PromotionModel[];
  onDeleteItemAction: (id: number) => Promise<{ status: "error" | "success"; message: string }>;
  redirectPageAfterDeleteAction: () => void;
  name: string;
  createPromotionAction: (
    prevState: CreatePromotionFormFields,
    formData: FormData,
  ) => Promise<CreatePromotionFormFields>;
  updatePromotionAction: (
    prevState: CreatePromotionFormFields,
    formData: FormData,
  ) => Promise<CreatePromotionFormFields>;
  isLoadMoreDisabled: boolean;
  patch: string;
  searchParams: { [key: string]: string | string[] | undefined };
};

type InitOptionFormModalType = {
  id: number | null;
  isOpen: boolean;
  name: string;
  description: string;
  percent: string;
  date_from: string;
  date_to: string;
  is_active: boolean;
  isDelete: boolean;
};

const initOptionFormModal = {
  id: null,
  isOpen: false,
  name: "",
  description: "",
  percent: "",
  date_from: "",
  date_to: "",
  is_active: false,
  isDelete: false,
};

export const PromotionsTableWrapper = (props: Props) => {
  const { isMobile, isMounted } = useWindowSize();
  const [submitLoading, transition] = useTransition();
  const [optionFormModal, setOptionFormModal] =
    useState<InitOptionFormModalType>(initOptionFormModal);

  const handleOpenEditModal = (item: PromotionModel) => {
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    setOptionFormModal({
      id: item.id,
      isOpen: true,
      name: item.name,
      description: item.description || "",
      percent: item.percent ? String(item.percent) : "",
      date_from: item.date_from ? formatDateForInput(item.date_from) : "",
      date_to: item.date_to ? formatDateForInput(item.date_to) : "",
      is_active: item.is_active,
      isDelete: false,
    });
  };

  const handleOpenAddNewItemModal = () =>
    setOptionFormModal({ ...initOptionFormModal, isOpen: true });
  const handleCloseFormModal = () => setOptionFormModal(initOptionFormModal);
  const handleOpenDeleteModal = (id: number) =>
    setOptionFormModal({ ...initOptionFormModal, id, isOpen: true, isDelete: true });

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
  const modalTitle = isEditModal ? "Редактировать акцию" : "Добавить акцию";
  const submitButtonText = isEditModal ? "Редактировать" : "Добавить";
  const onSubmitAction = isEditModal ? props.updatePromotionAction : props.createPromotionAction;

  const tableOptions: RenderTableOptions<PromotionModel>[] = [
    { key: "id" },
    { key: "name" },
    { key: "description" },
    { key: "percent" },
    { key: "date_from", type: "shortDate" },
    { key: "date_to", type: "shortDate" },
    { key: "is_active", type: "boolean", typeConfig: { booleanLabels: ["Да", "Нет"] } },
  ];

  return (
    <>
      {optionFormModal.isOpen && !optionFormModal.isDelete && (
        <ModalPromotionForm
          isOpen={optionFormModal.isOpen}
          onCloseModal={handleCloseFormModal}
          onSubmitAction={onSubmitAction}
          title={modalTitle}
          submitButtonText={submitButtonText}
          initValue={{
            name: optionFormModal.name,
            description: optionFormModal.description,
            percent: optionFormModal.percent,
            date_from: optionFormModal.date_from,
            date_to: optionFormModal.date_to,
            is_active: optionFormModal.is_active,
            id: optionFormModal.id,
          }}
        />
      )}
      <ModalDelete
        submit={submitDelete}
        title="Действительно хотите удалить акцию?"
        isOpen={optionFormModal.isOpen && optionFormModal.isDelete}
        onClose={handleCloseFormModal}
        disabled={submitLoading}
        showSubTitle={true}
      />
      <div className="table-container">
        <TableControls
          addAction={{
            text: "Добавить акцию",
            onClick: handleOpenAddNewItemModal,
          }}
          name={props.name}
          queryKey="name"
        />
        {isMounted && !isMobile && props.data && props.data.length > 0 && (
          <MainTable
            data={props.data}
            onEditAction={handleOpenEditModal}
            onDeleteAction={handleOpenDeleteModal}
            headerRowLabels={[
              "ID",
              "Название",
              "Описание",
              "Скидка (%)",
              "Дата начала",
              "Дата окончания",
              "Активна",
            ]}
            stickyActionColumn
            gridTemplateColumns="65px minmax(160px, 1fr) minmax(160px, 200px) 110px minmax(140px, 160px) minmax(140px, 160px) 90px 58px"
            tableOptions={tableOptions}
          />
        )}

        {isMounted && isMobile && props.data && props.data.length > 0 && (
          <MainMobileTable
            titleKey="name"
            data={props.data}
            onEditAction={handleOpenEditModal}
            onDeleteAction={handleOpenDeleteModal}
            tableOptions={tableOptions}
            headerRowLabels={[
              "ID",
              "Название",
              "Описание",
              "Скидка (%)",
              "Дата начала",
              "Дата окончания",
              "Активна",
            ]}
            headerRowWidth={["38px", "140px", "100px", "80px", "100px", "100px", "80px"]}
            searchParams={props.searchParams}
            isLoadMoreDisabled={props.isLoadMoreDisabled}
            patch={props.patch}
          />
        )}
      </div>
    </>
  );
};

"use client";
import { useState, useTransition } from "react";
import { notificationAdapter } from "@/stores/notification/adapter";
import { MainTable, type RenderTableOptions } from "@/widgets/main-table/MainTable";
import { MainMobileTable } from "@/widgets/main-mobile-table/MainMobileTable";
import { ModalDelete } from "@/widgets/modals/modal-delete/ModalDelete";
import { TableControls } from "@/widgets/table-controls/TableControls";
import type { CartDiscountModel, CreateCartDiscountFormFields } from "../../action";
import { ModalCartDiscountForm } from "../modal-cart-discount-form/ModalCartDiscountForm";

type Props = {
  data: CartDiscountModel[];
  onDeleteItemAction: (id: number) => Promise<{ status: "error" | "success"; message: string }>;
  redirectPageAfterDeleteAction: () => void;
  name: string;
  createCartDiscountAction: (
    prevState: CreateCartDiscountFormFields,
    formData: FormData,
  ) => Promise<CreateCartDiscountFormFields>;
  updateCartDiscountAction: (
    prevState: CreateCartDiscountFormFields,
    formData: FormData,
  ) => Promise<CreateCartDiscountFormFields>;
  isLoadMoreDisabled: boolean;
  patch: string;
  searchParams: { [key: string]: string | string[] | undefined };
};

export const CartDiscountsTableWrapper = (props: Props) => {
  const [submitLoading, transition] = useTransition();
  const [optionFormModal, setOptionFormModal] = useState<{
    id: number | null;
    isOpen: boolean;
    name: string;
    min_sum: string;
    percent: string;
    apply_to: string;
    is_active: boolean;
    isDelete: boolean;
  }>({
    id: null,
    isOpen: false,
    name: "",
    min_sum: "",
    percent: "",
    apply_to: "all",
    is_active: true,
    isDelete: false,
  });

  const handleOpenEditModal = (item: CartDiscountModel) =>
    setOptionFormModal({
      id: item.id,
      isOpen: true,
      name: item.name,
      min_sum: item.min_sum ? String(item.min_sum) : "",
      percent: item.percent ? String(item.percent) : "",
      apply_to: item.apply_to,
      is_active: item.is_active,
      isDelete: false,
    });

  const handleOpenMainModal = () => {
    setOptionFormModal({
      id: null,
      isOpen: true,
      name: "",
      min_sum: "",
      percent: "",
      apply_to: "all",
      is_active: true,
      isDelete: false,
    });
  };

  const handleCloseFormModal = () =>
    setOptionFormModal({
      id: null,
      isOpen: false,
      name: "",
      min_sum: "",
      percent: "",
      apply_to: "all",
      is_active: true,
      isDelete: false,
    });

  const handleOpenDeleteModal = (id: number) =>
    setOptionFormModal({
      id,
      isOpen: true,
      name: "",
      min_sum: "",
      percent: "",
      apply_to: "all",
      is_active: true,
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
  const modalTitle = isEditModal ? "Редактировать скидку" : "Добавить скидку";
  const submitButtonText = isEditModal ? "Редактировать" : "Добавить";
  const onSubmitAction = isEditModal
    ? props.updateCartDiscountAction
    : props.createCartDiscountAction;

  const tableOptions: RenderTableOptions<CartDiscountModel>[] = [
    { key: "id" },
    { key: "name" },
    { key: "min_sum" },
    { key: "percent" },
    {
      key: "apply_to",
      type: "translate",
      typeConfig: {
        translateMap: {
          all: "Всем",
          retail: "Розница",
          wholesale: "Опт",
        },
      },
    },
    { key: "is_active", type: "boolean", typeConfig: { booleanLabels: ["Да", "Нет"] } },
  ];

  return (
    <>
      {optionFormModal.isOpen && !optionFormModal.isDelete && (
        <ModalCartDiscountForm
          isOpen={optionFormModal.isOpen}
          onCloseModal={handleCloseFormModal}
          onSubmitAction={onSubmitAction}
          title={modalTitle}
          submitButtonText={submitButtonText}
          initValue={{
            name: optionFormModal.name,
            min_sum: optionFormModal.min_sum,
            percent: optionFormModal.percent,
            apply_to: optionFormModal.apply_to,
            is_active: optionFormModal.is_active,
            id: optionFormModal.id,
          }}
        />
      )}
      <ModalDelete
        submit={submitDelete}
        title="Действительно хотите удалить скидку?"
        isOpen={optionFormModal.isOpen && optionFormModal.isDelete}
        onClose={handleCloseFormModal}
        disabled={submitLoading}
        showSubTitle={true}
      />
      <div className="table-container">
        <TableControls
          addAction={{
            text: "Добавить скидку",
            onClick: handleOpenMainModal,
          }}
          name={props.name}
          queryKey="name"
        />
        {props.data && props.data.length > 0 && (
          <>
            <div className="desktop-table">
              <MainTable
                data={props.data}
                onEditAction={handleOpenEditModal}
                onDeleteAction={handleOpenDeleteModal}
                headerRowLabels={[
                  "ID",
                  "Название",
                  "Мин. сумма",
                  "Скидка (%)",
                  "Доступно",
                  "Активна",
                ]}
                stickyActionColumn
                gridTemplateColumns="65px minmax(200px, 1fr) minmax(120px, 160px) minmax(120px, 160px) minmax(120px, 160px) minmax(120px, 160px) 58px"
                tableOptions={tableOptions}
              />
            </div>
            <div className="mobile-table">
              <MainMobileTable
                titleKey="name"
                data={props.data}
                onEditAction={handleOpenEditModal}
                onDeleteAction={handleOpenDeleteModal}
                tableOptions={tableOptions}
                headerRowLabels={[
                  "ID",
                  "Название",
                  "Мин. сумма",
                  "Скидка (%)",
                  "Доступно",
                  "Активна",
                ]}
                headerRowWidth={["38px", "140px", "100px", "80px", "100px", "100px"]}
                searchParams={props.searchParams}
                isLoadMoreDisabled={props.isLoadMoreDisabled}
                patch={props.patch}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

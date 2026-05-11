"use client";
import { useState, useTransition } from "react";
import { useWindowSize } from "@/shared/hooks/useWindowSize";
import type { ResponseData } from "@/shared/types/response";
import { notificationAdapter } from "@/stores/notification/adapter";
import { MainMobileTable } from "@/widgets/main-mobile-table/MainMobileTable";
import { MainTable, type RenderTableOptions } from "@/widgets/main-table/MainTable";
import { ModalDelete } from "@/widgets/modals/modal-delete/ModalDelete";
import { TableControls } from "@/widgets/table-controls/TableControls";
import type { CreateFeatureNameFormFields, FeatureNameModel } from "../../action";
import { ModalFeatureNameForm } from "../modal-feature-name-form/ModalFeatureNameForm";

type Props = {
  data: FeatureNameModel[];
  onDeleteItemAction: (id: number) => Promise<{ status: "error" | "success"; message: string }>;
  redirectPageAfterDeleteAction: () => void;
  name: string;
  createFeatureNameAction: (
    prevState: CreateFeatureNameFormFields,
    formData: FormData,
  ) => Promise<CreateFeatureNameFormFields>;
  updateFeatureNameAction: (
    prevState: CreateFeatureNameFormFields,
    formData: FormData,
  ) => Promise<CreateFeatureNameFormFields>;
  isLoadMoreDisabled: boolean;
  patch: string;
  searchParams: { [key: string]: string | string[] | undefined };
  fetchTableElementAction: (id: string) => Promise<ResponseData<FeatureNameModel>>;
};

export const FeatureNamesTableWrapper = (props: Props) => {
  const { isMobile, isMounted } = useWindowSize();
  const [submitLoading, transition] = useTransition();
  const [optionFormModal, setOptionFormModal] = useState<{
    id: number | null;
    isOpen: boolean;
    name: string;
    slug: string;
    isDelete: boolean;
  }>({
    id: null,
    isOpen: false,
    name: "",
    slug: "",
    isDelete: false,
  });

  const handleOpenEditModal = (item: FeatureNameModel) =>
    setOptionFormModal({
      id: item.id,
      isOpen: true,
      name: item.name,
      slug: item.slug,
      isDelete: false,
    });

  const handleOpenMainModal = () => {
    setOptionFormModal({
      id: null,
      isOpen: true,
      name: "",
      slug: "",
      isDelete: false,
    });
  };

  const handleCloseFormModal = () =>
    setOptionFormModal({
      id: null,
      isOpen: false,
      name: "",
      slug: "",
      isDelete: false,
    });

  const handleOpenDeleteModal = (id: number) =>
    setOptionFormModal({
      id,
      isOpen: true,
      name: "",
      slug: "",
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
  const modalTitle = isEditModal ? "Редактировать характеристику" : "Добавить характеристику";
  const submitButtonText = isEditModal ? "Редактировать" : "Добавить";
  const onSubmitAction = isEditModal ? props.updateFeatureNameAction : props.createFeatureNameAction;

  const tableOptions: RenderTableOptions<FeatureNameModel>[] = [
    { key: "id" },
    { key: "name" },
    { key: "slug" },
    { key: "is_active", type: "boolean", typeConfig: { booleanLabels: ["Да", "Нет"] } },
    { key: "sort_order" },
  ];

  return (
    <>
      {optionFormModal.isOpen && !optionFormModal.isDelete && (
        <ModalFeatureNameForm
          isOpen={optionFormModal.isOpen}
          onCloseModal={handleCloseFormModal}
          onSubmitAction={onSubmitAction}
          title={modalTitle}
          submitButtonText={submitButtonText}
          initValue={{
            name: optionFormModal.name,
            slug: optionFormModal.slug,
            id: optionFormModal.id,
          }}
        />
      )}
      <ModalDelete
        submit={submitDelete}
        title="Действительно хотите удалить характеристику?"
        isOpen={optionFormModal.isOpen && optionFormModal.isDelete}
        onClose={handleCloseFormModal}
        disabled={submitLoading}
        showSubTitle={true}
      />
      <div className="table-container">
        <TableControls
          addAction={{
            text: "Добавить характеристику",
            onClick: handleOpenMainModal,
          }}
          name={props.name}
          queryKey="name"
        />
        {isMounted && !isMobile && props.data && props.data.length > 0 && (
          <MainTable
            data={props.data}
            onEditAction={handleOpenEditModal}
            onDeleteAction={handleOpenDeleteModal}
            headerRowLabels={["ID", "Название", "Slug", "Активна", "Порядок"]}
            stickyActionColumn
            gridTemplateColumns="65px minmax(150px, 220px) minmax(120px, 200px) minmax(100px, 140px) 80px 58px"
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
            headerRowLabels={["ID", "Название", "Slug", "Активна", "Порядок"]}
            headerRowWidth={["38px", "100px", "100px", "80px", "80px"]}
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

"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useWindowSize } from "@/shared/hooks/useWindowSize";
import type { ResponseData } from "@/shared/types/response";
import { notificationAdapter } from "@/stores/notification/adapter";
import { MainMobileTable } from "@/widgets/main-mobile-table/MainMobileTable";
import { MainTable, type RenderTableOptions } from "@/widgets/main-table/MainTable";
import { ModalDelete } from "@/widgets/modals/modal-delete/ModalDelete";
import type { QuestionModel } from "../../action";

type Props = {
  questions: QuestionModel[];
  onDeleteItemAction: (id: number) => Promise<{ status: "error" | "success"; message: string }>;
  redirectPageAfterDeleteAction: () => void;
  isLoadMoreDisabled: boolean;
  patch: string;
  searchParams: { [key: string]: string | string[] | undefined };
  fetchTableElementAction: (id: string) => Promise<ResponseData<QuestionModel>>;
};

export const ProductQuestionsTableWrapper = (props: Props) => {
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

  const handleOpenDeleteModal = (item: QuestionModel) =>
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

  const handleEditRouter = (item: QuestionModel) => {
    if (item.id) {
      router.push(`/product-questions/edit/${item.id}`);
    }
  };

  const tableOptions: RenderTableOptions<QuestionModel>[] = [
    { key: "id" },
    { key: "question" },
    { key: "is_answer", type: "boolean", typeConfig: { booleanLabels: ["Да", "Нет"] } },
    { key: "created_at", type: "date" },
  ];

  const headerRowLabels = ["ID", "Вопрос", "Отвечен", "Дата создания"];

  return (
    <>
      <ModalDelete
        submit={submitDelete}
        title="Действительно хотите удалить вопрос?"
        isOpen={optionFormModal.isOpen && optionFormModal.isDelete}
        onClose={handleCloseFormModal}
        disabled={submitLoading}
        showSubTitle={true}
      />
      <div className="table-container">
        {isMounted && !isMobile && props.questions && props.questions.length > 0 && (
          <MainTable
            data={props.questions}
            headerRowLabels={headerRowLabels}
            stickyActionColumn
            stickyFirstColumn
            gridTemplateColumns="65px minmax(200px, 1fr) 110px 160px 32px"
            tableOptions={tableOptions}
            actions={[
              { label: "Редактировать", action: handleEditRouter },
              { label: "Удалить", action: handleOpenDeleteModal },
            ]}
          />
        )}

        {isMounted && isMobile && props.questions && props.questions.length > 0 && (
          <MainMobileTable
            titleKey="question"
            data={props.questions}
            tableOptions={tableOptions}
            headerRowLabels={headerRowLabels}
            headerRowWidth={["38px", "150px", "90px", "120px"]}
            searchParams={props.searchParams}
            isLoadMoreDisabled={props.isLoadMoreDisabled}
            patch={props.patch}
            fetchTableElementAction={props.fetchTableElementAction}
            actions={[
              { label: "Редактировать", action: handleEditRouter },
              { label: "Удалить", action: handleOpenDeleteModal },
            ]}
          />
        )}
      </div>
    </>
  );
};

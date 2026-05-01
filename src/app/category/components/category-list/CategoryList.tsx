"use client";
import { useState, useTransition } from "react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { FindSvg } from "@/shared/svg/FindSvg";
import { Input } from "@/shared/ui/input-main/Input";
import { notificationAdapter } from "@/stores/notification/adapter";
import { ModalDelete } from "@/widgets/modals/modal-delete/ModalDelete";
import { TaleControls } from "@/widgets/table-controls/TaleControls";
import type { CategoryModel, CreateCategoryFormFields } from "../../action";
import { CategoryItem } from "../category-item/CategoryItem";
import { ModalCategoryForm } from "../modal-category-form/ModalCategoryForm";
import styles from "./CategoryList.module.css";

type Props = {
  onDeleteItemAction: (
    deleteId: number,
    parent_id: number | null,
  ) => Promise<{ status: "error" | "success"; message: string }>;
  createCategoryAction: (
    prevState: CreateCategoryFormFields,
    formData: FormData,
  ) => Promise<CreateCategoryFormFields>;
  updateCategoryAction: (
    prevState: CreateCategoryFormFields,
    formData: FormData,
  ) => Promise<CreateCategoryFormFields>;
  sortCategoryAction: (
    id: number,
    parent_id: number | null,
    position: number,
  ) => Promise<{ status: "error" | "success"; message: string }>;
  categories: CategoryModel[];
};

export const CategoryList = (props: Props) => {
  const debounceFn = useDebounce();
  const [submitLoading, transition] = useTransition();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>("");
  const [activeCategories, setActiveCategories] = useState<number[]>([]);

  const [optionFormModal, setOptionFormModal] = useState<{
    parent_id: number | null;
    id: number | null;
    position: number | null;
    isOpen: boolean;
    name: string;
    description: string;
  }>({
    parent_id: null,
    id: null,
    position: null,
    isOpen: false,
    name: "",
    description: "",
  });

  const handleOpenDeleteModal = (id: number, parent_id: number | null) => {
    setDeleteId(id);
    setOptionFormModal((prev) => ({ ...prev, parent_id }));
  };
  const closeDeleteModal = () => setDeleteId(null);

  const handleOpenEditModal = (id: number, name: string, description: string) =>
    setOptionFormModal({ parent_id: null, id, isOpen: true, name, description, position: null });

  const handleOpenMainModal = () => {
    const currentPosition = props.categories.length === 0 ? 1 : props.categories.length + 1;

    setOptionFormModal({
      parent_id: null,
      id: null,
      isOpen: true,
      name: "",
      description: "",
      position: currentPosition,
    });
  };

  const handleOpenSubCategoryModal = (parent_id: number, position: number) =>
    setOptionFormModal({ parent_id, id: null, isOpen: true, name: "", description: "", position });

  const handleCloseFormModal = () =>
    setOptionFormModal({
      parent_id: null,
      id: null,
      isOpen: false,
      name: "",
      description: "",
      position: null,
    });

  const submitDelete = () => {
    if (!deleteId) return;

    transition(() => {
      props.onDeleteItemAction(deleteId, optionFormModal.parent_id).then((res) => {
        notificationAdapter.add(res.message, res.status);
        setOptionFormModal((prev) => ({ ...prev, parent_id: null }));
        closeDeleteModal();
      });
    });
  };

  const isEditModal =
    optionFormModal.name.length > 0 &&
    typeof optionFormModal.id === "number" &&
    optionFormModal.parent_id === null;

  const isAddSubCategory = optionFormModal.parent_id;

  const modalTitle = isEditModal
    ? "Редактировать раздел"
    : isAddSubCategory
      ? "Добавить раздел"
      : "Добавить основной раздел";
  const submitButtonText = isEditModal
    ? "Редактировать"
    : isAddSubCategory
      ? "Добавить"
      : "Создать";

  const onSubmitAction = isEditModal ? props.updateCategoryAction : props.createCategoryAction;

  const handleChangeCategoryPosition = (id: number, parent_id: number | null, position: number) => {
    props.sortCategoryAction(id, parent_id, position).then((res) => {
      notificationAdapter.add(res.message, res.status);
    });
  };

  const findCategorySearch = (categories: CategoryModel[], value: string) => {
    if (!value.trim()) {
      return [];
    }

    const searchLower = value.toLowerCase();
    const result: number[] = [];

    const searchInCategory = (categories: CategoryModel[]): boolean => {
      let hasMatch = false;

      for (const category of categories) {
        const nameMatch = category.name.toLowerCase().includes(searchLower);
        const childrenMatch = category.children ? searchInCategory(category.children) : false;
        if (nameMatch || childrenMatch) {
          hasMatch = true;
          if (category.children.length > 0) {
            result.push(category.id);
          }
        }
      }
      return hasMatch;
    };

    searchInCategory(categories);
    return result;
  };

  const handleSearchCategory = (value: string) => {
    setSearch(value);

    if (value.length >= 3) {
      debounceFn(() => {
        const updateCategories = findCategorySearch(props.categories, value);
        setActiveCategories(updateCategories);
      });
    }
  };

  const handleToggleOpenCategory = (id: number) => {
    setActiveCategories((prev) =>
      prev.includes(id) ? prev.filter((el) => el !== id) : prev.concat(id),
    );
  };

  return (
    <>
      <ModalDelete
        submit={submitDelete}
        title="Действительно хотите удалить?"
        isOpen={typeof deleteId === "number"}
        onClose={closeDeleteModal}
        disabled={submitLoading}
        showSubTitle={true}
      />
      {optionFormModal.isOpen && (
        <ModalCategoryForm
          isOpen={optionFormModal.isOpen}
          onCloseModal={handleCloseFormModal}
          onSubmitAction={onSubmitAction}
          title={modalTitle}
          submitButtonText={submitButtonText}
          initValue={{
            name: optionFormModal.name,
            description: optionFormModal.description,
            id: optionFormModal.id,
            parent_id: optionFormModal.parent_id,
            position: optionFormModal.position,
          }}
        />
      )}

      <div className="table-container">
        <TaleControls
          addAction={{
            text: "Добавить раздел",
            onClick: handleOpenMainModal,
          }}
          customSearchInput={
            <Input
              error={search.length >= 3 && activeCategories.length === 0 ? "Раздел не найден" : ""}
              name="search_category"
              fullWidth={true}
              variant="outlined"
              variantSize="sm"
              leftIcon={<FindSvg />}
              rightIcon={search.length > 0 ? <CancelSvg /> : null}
              value={search}
              onChange={(e) => handleSearchCategory(e.target.value)}
              onClickRightIcon={() => handleSearchCategory("")}
              label="Поиск по названию"
            />
          }
        />

        <ul className={styles.categoryList}>
          {props.categories.map((category) => (
            <CategoryItem
              search={search}
              onToggleOpenCategory={handleToggleOpenCategory}
              activeCategories={activeCategories}
              key={category.id}
              category={category}
              onOpenDeleteModal={handleOpenDeleteModal}
              onOpenEditModal={handleOpenEditModal}
              onOpenSubCategoryModal={handleOpenSubCategoryModal}
              onChangeCategoryPosition={handleChangeCategoryPosition}
            />
          ))}
        </ul>
      </div>
    </>
  );
};

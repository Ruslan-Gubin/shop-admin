import Link from "next/link";
import { Activity, useMemo, useState, useTransition } from "react";
import type { CategoryModel } from "@/app/category/action";
import {
  applyCategorySuggestionAction,
  type CategorySuggestion,
  getCategorySuggestionAction,
} from "@/app/product/action";
import { getCategoryFullPath } from "@/shared/helpers/getCategoryFullPath";
import { getFirstErrorMessage } from "@/shared/helpers/getFirstErrorMessage";
import { AiSvg } from "@/shared/svg/AiSvg";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Button } from "@/shared/ui/button-main/Button";
import { notificationAdapter } from "@/stores/notification/adapter";
import { SelectCategoryList } from "@/views/SelectCategoryList/SelectCategoryList";
import { FormInstruction } from "@/widgets/form-instruction/FormInstruction";
import { CategorySuggestionModal } from "../CategorySuggestionModal/CategorySuggestionModal";
import styles from "./CategorySelect.module.css";

type Props = {
  categories: CategoryModel[];
  categoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  values: {
    name: string;
    code: string;
    description: string;
    brand_name: string;
    category_id: number | null;
  };
};

export const CategorySelect = (props: Props) => {
  const [openCategory, setOpenCategory] = useState<boolean>(false);
  const [loading, transition] = useTransition();
  const [categorySuggestion, setCategorySuggestion] = useState<CategorySuggestion | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const handleSelectCategory = (id: number | null) => {
    props.onSelectCategory(id);
    setOpenCategory(false);
  };

  const categoryName = useMemo(
    () => getCategoryFullPath(props.categories, props.categoryId),
    [props.categories, props.categoryId],
  );

  const handleSuggestCategory = () => {
    transition(() => {
      getCategorySuggestionAction({
        name: props.values.name,
        description: props.values.description,
      }).then((response) => {
        if (
          response.status === "success" &&
          response.data &&
          (response.data.category_id || Array.isArray(response.data.create_categories))
        ) {
          setCategorySuggestion(response.data);
          setIsCategoryModalOpen(true);
        } else {
          const errorMessage = getFirstErrorMessage(response.errors, response.message);

          if (errorMessage) {
            notificationAdapter.add(errorMessage, "error");
          }
        }
      });
    });
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setCategorySuggestion(null);
  };

  const handleApplyExisting = () => {
    if (categorySuggestion?.category_id) {
      props.onSelectCategory(categorySuggestion.category_id);
      handleCloseCategoryModal();
    }
  };

  const handleCreateAndSelect = () => {
    if (
      categorySuggestion?.create_categories &&
      Array.isArray(categorySuggestion?.create_categories) &&
      categorySuggestion?.create_categories.length > 0
    ) {
      transition(() => {
        applyCategorySuggestionAction(categorySuggestion?.create_categories).then((response) => {
          if (response.status === "success" && response.data) {
            props.onSelectCategory(response.data);
            handleCloseCategoryModal();
          } else {
            notificationAdapter.add(
              response.message || "Не удалось создать категорию",
              response.status,
            );
          }
        });
      });
    }
  };

  return (
    <>
      <CategorySuggestionModal
        isOpen={isCategoryModalOpen}
        suggestion={categorySuggestion}
        categories={props.categories}
        isLoading={loading}
        onClose={handleCloseCategoryModal}
        onApplyExisting={handleApplyExisting}
        onCreateAndSelect={handleCreateAndSelect}
      />
      <FormInstruction>
        <span>
          Чтобы добавить или редактировать категорию, перейдите на страницу{" "}
          <Link tabIndex={-1} href="/category" className={styles.instructionLink}>
            категории
          </Link>
          .
        </span>
      </FormInstruction>
      <Button
        variant="solid"
        variantColor="blue"
        size="sm"
        onClick={handleSuggestCategory}
        disabled={loading || props.values.name.length < 3 || props.values.description.length < 3}
      >
        {loading ? <span className={styles.spinner} /> : <AiSvg />}
        Определить категорию
      </Button>
      <div className={styles.categoryContainer}>
        <div className={styles.categoryValueContainer}>
          <button
            type="button"
            className={styles.categoryValueLeftSide}
            onClick={() => setOpenCategory((prev) => !prev)}
          >
            <span
              className={
                props.categoryId
                  ? `${styles.categoryLabel} ${styles.categoryLabelActive}`
                  : styles.categoryLabel
              }
            >
              Категория
            </span>
            <span
              className={
                props.categoryId ? styles.categoryToggleButtonActive : styles.categoryToggleButton
              }
            >
              {categoryName}
            </span>
          </button>
          <button
            className={styles.buttonClear}
            type="button"
            onClick={() => handleSelectCategory(null)}
          >
            <CancelSvg />
          </button>
        </div>

        <Activity mode={openCategory ? "visible" : "hidden"}>
          <SelectCategoryList
            onSelectCategory={handleSelectCategory}
            categories={props.categories}
          />
        </Activity>
      </div>
    </>
  );
};

import type { CategoryModel } from "@/app/category/action";
import type { CategorySuggestion } from "@/app/product/action";
import { getCategoryFullPath } from "@/shared/helpers/getCategoryFullPath";
import { Button } from "@/shared/ui/button-main/Button";
import { Modal } from "@/shared/ui/modal/Modal";
import { ModalBody } from "@/shared/ui/modal/modal-body/ModalBody";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";
import styles from "./CategorySuggestionModal.module.css";

type Props = {
  isOpen: boolean;
  suggestion: CategorySuggestion | null;
  categories: CategoryModel[];
  isLoading?: boolean;
  onClose: () => void;
  onApplyExisting: () => void;
  onCreateAndSelect: () => void;
};

export const CategorySuggestionModal = (props: Props) => {
  const suggestion = props.suggestion;

  const recommendedName = suggestion
    ? getCategoryFullPath(props.categories, suggestion.category_id) ||
      (suggestion.category_id ? `Категория #${suggestion.category_id}` : "")
    : "";

  const hasExisting = Boolean(suggestion?.category_id);
  const hasChain = Boolean(suggestion && suggestion.create_categories.length > 0);
  const isEmpty = !suggestion || (!hasExisting && !hasChain);

  const parentPath =
    hasChain && typeof suggestion?.create_categories[0]?.parent_id === "number"
      ? getCategoryFullPath(props.categories, suggestion.create_categories[0].parent_id)
      : "";

  return (
    <Modal active={props.isOpen} handleCloseAction={props.onClose}>
      <ModalContent>
        <ModalHeader title="Определение категории" onClose={props.onClose} />
        <ModalBody>
          <div className={styles.body}>
            {!isEmpty && (
              <p className={styles.description}>
                По названию и описанию товара подобран вариант размещения в каталоге.
              </p>
            )}

            {isEmpty && (
              <div className={styles.emptyBlock}>
                <p className={styles.emptyText}>Не удалось определить категорию.</p>
                <p className={styles.emptyHint}>
                  Попробуйте изменить название или описание товара или выберите категорию вручную.
                </p>
              </div>
            )}

            {hasExisting && (
              <div className={styles.recommendedBlock}>
                <span className={styles.badge}>Рекомендуемая категория</span>
                <p className={styles.recommendedName}>{recommendedName}</p>
              </div>
            )}

            {suggestion && hasChain && !hasExisting && (
              <div className={styles.chainBlock}>
                <span className={styles.badge}>Будет создано</span>
                <p className={styles.chainPath}>
                  {parentPath && (
                    <span className={styles.chainItem}>
                      {parentPath}
                      <span className={styles.chainArrow}> / </span>
                    </span>
                  )}
                  {suggestion.create_categories.map((category, index) => (
                    <span key={`${category.name}-${index}`} className={styles.chainItemNew}>
                      {category.name}
                      {index < suggestion.create_categories.length - 1 && (
                        <span className={styles.chainArrow}> / </span>
                      )}
                    </span>
                  ))}
                </p>
                <p className={styles.chainHint}>
                  Недостающие категории будут созданы в каталоге автоматически.
                </p>
              </div>
            )}
          </div>
        </ModalBody>
        <footer className={styles.footer}>
          <Button variant="ghost" size="sm" onClick={props.onClose}>
            Отмена
          </Button>
          {hasExisting && (
            <Button
              variant="solid"
              variantColor="green"
              size="sm"
              onClick={props.onApplyExisting}
              disabled={props.isLoading}
            >
              {props.isLoading ? "Применение…" : "Выбрать"}
            </Button>
          )}
          {hasChain && !hasExisting && (
            <Button
              variant="solid"
              variantColor="green"
              size="sm"
              onClick={props.onCreateAndSelect}
              disabled={props.isLoading}
            >
              {props.isLoading ? "Создание…" : "Создать и выбрать"}
            </Button>
          )}
        </footer>
      </ModalContent>
    </Modal>
  );
};

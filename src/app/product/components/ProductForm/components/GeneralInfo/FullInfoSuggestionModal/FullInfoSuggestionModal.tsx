import { useMemo, useState } from "react";
import type { CategoryModel } from "@/app/category/action";
import type { CategorySuggestion, ProductSourceRecordModel } from "@/app/product/action";
import type { ProductFormPayloadValues } from "@/app/product/create/action";
import { getCategoryFullPath } from "@/shared/helpers/getCategoryFullPath";
import { Button } from "@/shared/ui/button-main/Button";
import { Checkbox } from "@/shared/ui/checkbox/Checkbox";
import { Modal } from "@/shared/ui/modal/Modal";
import { ModalBody } from "@/shared/ui/modal/modal-body/ModalBody";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";
import type { SpecificationValueItem } from "../../../../ProductForm/ProductForm";
import styles from "./FullInfoSuggestionModal.module.css";

export type FullInfoGroupKey = "general" | "additional" | "specifications" | "category" | "seo";

export type FullInfoRowKey =
  | "name"
  | "description"
  | "brand_name"
  | "country"
  | "product_type"
  | "equipment"
  | "weight"
  | "height"
  | "length"
  | "width"
  | `spec_${number}`
  | "seo_title"
  | "seo_description"
  | "slug"
  | "og_title"
  | "og_description"
  | "og_type"
  | "keywords";

export type FullInfoRow = {
  key: FullInfoRowKey;
  group: FullInfoGroupKey;
  label: string;
  hint?: string;
  current: string;
  suggested: string;
  disabled?: boolean;
  applied?: boolean;
  empty?: boolean;
};

const GROUP_TITLES: { key: FullInfoGroupKey; title: string }[] = [
  { key: "general", title: "Общие данные" },
  { key: "additional", title: "Дополнительно" },
  { key: "specifications", title: "Характеристики" },
  { key: "category", title: "Категория" },
  { key: "seo", title: "SEO" },
];

type SeoFieldKey =
  | "seo_title"
  | "seo_description"
  | "slug"
  | "og_title"
  | "og_description"
  | "og_type"
  | "keywords";

const SEO_FIELDS: { key: SeoFieldKey; label: string; hint: string }[] = [
  { key: "seo_title", label: "SEO заголовок", hint: "Заголовок в поисковой выдаче" },
  { key: "seo_description", label: "SEO описание", hint: "Краткое описание для поисковой выдачи" },
  { key: "slug", label: "Slug", hint: "Адресная часть URL товара" },
  { key: "og_title", label: "OG заголовок", hint: "Заголовок при репосте в соцсетях" },
  { key: "og_description", label: "OG описание", hint: "Описание при репосте в соцсетях" },
  { key: "og_type", label: "OG тип", hint: "Тип контента для Open Graph" },
  { key: "keywords", label: "Ключевые слова", hint: "Через запятую" },
];

const toStr = (value: string | number | null | undefined) =>
  value === null || value === undefined ? "" : String(value);

const buildRows = (
  product: ProductSourceRecordModel,
  currentValues: ProductFormPayloadValues,
  specificationValues: SpecificationValueItem[],
): FullInfoRow[] => {
  const rows: FullInfoRow[] = [];

  const push = (
    key: FullInfoRowKey,
    group: FullInfoGroupKey,
    label: string,
    current: string,
    suggested: string,
    hint?: string,
    applied?: boolean,
    empty?: boolean,
  ) => {
    const isEmpty = empty ?? suggested.length === 0;
    const alreadyApplied = applied ?? (suggested.length > 0 && current === suggested);
    rows.push({
      key,
      group,
      label,
      hint,
      current,
      suggested,
      disabled: isEmpty || alreadyApplied,
      applied: alreadyApplied,
      empty: isEmpty,
    });
  };

  push("name", "general", "Название", currentValues.name, product.name || "");
  push("description", "general", "Описание", currentValues.description, toStr(product.description));
  push("brand_name", "general", "Бренд", currentValues.brand_name, toStr(product.brand_name));

  push(
    "country",
    "additional",
    "Страна-производитель",
    currentValues.country,
    toStr(product.country),
  );
  push(
    "product_type",
    "additional",
    "Вид товара",
    currentValues.product_type,
    toStr(product.product_type),
  );
  push(
    "equipment",
    "additional",
    "Что входит в состав",
    currentValues.equipment,
    toStr(product.equipment),
  );
  push("weight", "additional", "Вес", currentValues.weight, toStr(product.weight));
  push("height", "additional", "Высота", currentValues.height, toStr(product.height));
  push("length", "additional", "Длина", currentValues.length, toStr(product.length));
  push("width", "additional", "Ширина", currentValues.width, toStr(product.width));

  if (product.specifications && product.specifications.length > 0) {
    product.specifications.forEach((spec, index) => {
      const currentValue = specificationValues.find((el) => el.label === spec.name)?.value ?? "";
      push(`spec_${index}`, "specifications", spec.name, currentValue, spec.value);
    });
  }

  for (const field of SEO_FIELDS) {
    const recValue = toStr(product[field.key]);
    const curValue = toStr(currentValues[field.key as keyof ProductFormPayloadValues]);
    push(field.key, "seo", field.label, curValue, recValue, field.hint);
  }

  return rows;
};

const hasCategorySuggestion = (suggestion: CategorySuggestion | null) =>
  Boolean(suggestion?.category_id || suggestion?.create_categories?.length);

const isCategoryAlreadyApplied = (
  suggestion: CategorySuggestion | null,
  currentCategoryId: number | null,
) =>
  Boolean(
    suggestion?.category_id &&
    suggestion.category_id === currentCategoryId &&
    !suggestion.create_categories?.length,
  );

const getInitialSelected = (
  rows: FullInfoRow[],
  categorySuggestion: CategorySuggestion | null,
  currentCategoryId: number | null,
): Record<string, boolean> => {
  const result = Object.fromEntries(rows.map((row) => [row.key, false])) as Record<string, boolean>;

  for (const row of rows) {
    if (!row.disabled) {
      result[row.key] = true;
    }
  }

  result.category =
    hasCategorySuggestion(categorySuggestion) &&
    !isCategoryAlreadyApplied(categorySuggestion, currentCategoryId);

  return result;
};

type Props = {
  isOpen: boolean;
  product: ProductSourceRecordModel | null;
  currentValues: ProductFormPayloadValues;
  currentCategoryName: string;
  categories: CategoryModel[];
  specificationValues: SpecificationValueItem[];
  onClose: () => void;
  onApply: (rows: FullInfoRow[]) => void;
  onApplyCategory: (suggestion: CategorySuggestion) => void;
};

export const FullInfoSuggestionModal = (props: Props) => {
  const rows = useMemo(
    () =>
      props.product ? buildRows(props.product, props.currentValues, props.specificationValues) : [],
    [props.product, props.currentValues, props.specificationValues],
  );

  const categorySuggestion = props.product?.categories ?? null;
  const categoryAlreadyApplied = isCategoryAlreadyApplied(
    categorySuggestion,
    props.currentValues.category_id,
  );

  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    getInitialSelected(rows, categorySuggestion, props.currentValues.category_id),
  );

  const [prevSnapshot, setPrevSnapshot] = useState({
    isOpen: props.isOpen,
    product: props.product,
    categorySuggestion,
    currentCategoryId: props.currentValues.category_id,
  });

  if (
    prevSnapshot.isOpen !== props.isOpen ||
    prevSnapshot.product !== props.product ||
    prevSnapshot.categorySuggestion !== categorySuggestion ||
    prevSnapshot.currentCategoryId !== props.currentValues.category_id
  ) {
    setPrevSnapshot({
      isOpen: props.isOpen,
      product: props.product,
      categorySuggestion,
      currentCategoryId: props.currentValues.category_id,
    });
    setSelected(getInitialSelected(rows, categorySuggestion, props.currentValues.category_id));
  }

  const selectedCount = useMemo(() => {
    let count = 0;
    for (const row of rows) {
      if (selected[row.key]) {
        count++;
      }
    }
    if (selected.category && hasCategorySuggestion(categorySuggestion) && !categoryAlreadyApplied) {
      count++;
    }
    return count;
  }, [selected, rows, categorySuggestion, categoryAlreadyApplied]);

  const handleToggle = (key: string) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const applyCategoryIfSelected = () => {
    if (
      selected.category &&
      categorySuggestion &&
      hasCategorySuggestion(categorySuggestion) &&
      !categoryAlreadyApplied
    ) {
      props.onApplyCategory(categorySuggestion);
    }
  };

  const handleApplySelected = () => {
    const applyRows = rows.filter((row) => selected[row.key] && !row.disabled);
    props.onApply(applyRows);
    applyCategoryIfSelected();
    props.onClose();
  };

  const handleApplyAll = () => {
    const applyRows = rows.filter((row) => row.suggested.length > 0);
    props.onApply(applyRows);
    applyCategoryIfSelected();
    props.onClose();
  };

  const renderRow = (row: FullInfoRow) => {
    const alreadyApplied =
      row.applied ?? (row.suggested.length > 0 && row.current === row.suggested);
    const isEmpty = row.empty ?? row.suggested.length === 0;

    return (
      <div
        key={row.key}
        className={`${styles.fieldRow} ${selected[row.key] ? styles.fieldRowSelected : ""}`}
      >
        <div className={styles.fieldHead}>
          <Checkbox
            checked={selected[row.key]}
            disabled={alreadyApplied || isEmpty}
            onChange={() => handleToggle(row.key)}
            labelText={row.label}
          />
          {alreadyApplied && <span className={styles.appliedBadge}>Уже применено</span>}
          {isEmpty && <span className={styles.emptyBadge}>Не предложено</span>}
        </div>
        {row.hint && <p className={styles.fieldHint}>{row.hint}</p>}
        {row.current && (
          <div className={styles.currentBlock}>
            <span className={styles.currentLabel}>Текущее</span>
            <p className={styles.currentValue}>{row.current}</p>
          </div>
        )}
        {row.suggested && (
          <div className={styles.suggestedBlock}>
            <span className={styles.suggestedLabel}>Предложенное</span>
            <p className={styles.suggestedValue}>{row.suggested}</p>
          </div>
        )}
      </div>
    );
  };

  const renderCategoryBlock = () => {
    const createCategories = categorySuggestion?.create_categories ?? [];
    const parentId = createCategories[0]?.parent_id;
    const parentPath =
      typeof parentId === "number" ? getCategoryFullPath(props.categories, parentId) : "";
    const hasChain = createCategories.length > 0;
    const categoryPath = categorySuggestion?.category_id
      ? getCategoryFullPath(props.categories, categorySuggestion.category_id) ||
        `Категория #${categorySuggestion.category_id}`
      : [parentPath, ...createCategories.map((category) => category.name)]
          .filter(Boolean)
          .join(" / ");

    return (
      <div className={`${styles.fieldRow} ${selected.category ? styles.fieldRowSelected : ""}`}>
        <div className={styles.fieldHead}>
          <Checkbox
            checked={Boolean(selected.category)}
            disabled={!hasCategorySuggestion(categorySuggestion) || categoryAlreadyApplied}
            onChange={() => handleToggle("category")}
            labelText="Категория"
          />
          {categoryAlreadyApplied && <span className={styles.appliedBadge}>Уже применено</span>}
          {!hasCategorySuggestion(categorySuggestion) && (
            <span className={styles.emptyBadge}>Не предложено</span>
          )}
        </div>

        {props.currentCategoryName && (
          <div className={styles.currentBlock}>
            <span className={styles.currentLabel}>Текущее</span>
            <p className={styles.currentValue}>{props.currentCategoryName}</p>
          </div>
        )}

        {categoryPath && (
          <div className={styles.suggestedBlock}>
            <span className={styles.suggestedLabel}>
              {hasChain ? "Будет создано" : "Предложенное"}
            </span>
            <p className={styles.suggestedValue}>{categoryPath}</p>
            {hasChain && (
              <p className={styles.fieldHint}>
                Недостающие категории будут созданы в каталоге автоматически.
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal active={props.isOpen} handleCloseAction={props.onClose}>
      <ModalContent>
        <ModalHeader title="Сгенерированная информация" onClose={props.onClose} />
        <ModalBody>
          <div className={styles.body}>
            {GROUP_TITLES.map((group) => {
              if (group.key === "category") {
                return (
                  <div key={group.key} className={styles.groupBlock}>
                    <span className={styles.groupTitle}>{group.title}</span>
                    <hr className={styles.groupDivider} />
                    {renderCategoryBlock()}
                  </div>
                );
              }

              const groupRows = rows.filter((row) => row.group === group.key);
              if (groupRows.length === 0) return null;

              return (
                <div key={group.key} className={styles.groupBlock}>
                  <span className={styles.groupTitle}>{group.title}</span>
                  <hr className={styles.groupDivider} />
                  {groupRows.map(renderRow)}
                </div>
              );
            })}
          </div>
        </ModalBody>
        <footer className={styles.footer}>
          <Button variant="ghost" size="sm" onClick={props.onClose}>
            Отмена
          </Button>
          <Button variant="solid" variantColor="blue" size="sm" onClick={handleApplyAll}>
            Применить все
          </Button>
          <Button
            variant="solid"
            variantColor="green"
            size="sm"
            onClick={handleApplySelected}
            disabled={selectedCount === 0}
          >
            Применить выбранные ({selectedCount})
          </Button>
        </footer>
      </ModalContent>
    </Modal>
  );
};

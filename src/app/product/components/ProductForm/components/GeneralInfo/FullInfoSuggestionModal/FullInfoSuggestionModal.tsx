import { useMemo, useState } from "react";
import type { CategoryModel } from "@/app/category/action";
import {
  type CategorySuggestion,
  type GenerateProductType,
  getCategorySuggestionAction,
} from "@/app/product/action";
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

export type FullInfoGroupKey =
  | "general"
  | "additional"
  | "specifications"
  | "category"
  | "photos"
  | "seo";

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
  | "photos"
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
  { key: "photos", title: "Фото товара" },
  { key: "seo", title: "SEO" },
];

const SEO_FIELDS: { key: FullInfoRowKey; label: string; hint: string }[] = [
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
  product: GenerateProductType,
  clearName: string,
  currentValues: ProductFormPayloadValues,
  specificationValues: SpecificationValueItem[],
  currentPhotoUrls: string[],
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

  push("name", "general", "Название", currentValues.name, product.name || clearName);
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

  const photos = product.photos ?? [];
  const photosCount = photos.length;
  const addedCount = photos.filter((url) => currentPhotoUrls.includes(url)).length;
  const remainingCount = photosCount - addedCount;
  push(
    "photos",
    "photos",
    "Фото товара",
    addedCount > 0 ? `Добавлено: ${addedCount}` : "",
    remainingCount > 0 ? `${remainingCount} из ${photosCount}` : "",
    remainingCount > 0
      ? addedCount > 0
        ? `Уже добавлено: ${addedCount}. Будут добавлены недостающие изображения (без дублей)`
        : "Будут добавлены найденные изображения"
      : "Все найденные изображения уже добавлены",
    remainingCount === 0,
    photosCount === 0,
  );

  if (product.seo) {
    for (const field of SEO_FIELDS) {
      const recValue = toStr(product.seo[field.key as keyof typeof product.seo]);
      const curValue = toStr(currentValues[field.key as keyof ProductFormPayloadValues]);
      push(field.key, "seo", field.label, curValue, recValue, field.hint);
    }
  }

  return rows;
};

const getInitialSelected = (rows: FullInfoRow[]): Record<string, boolean> => {
  const result = Object.fromEntries(rows.map((row) => [row.key, false])) as Record<string, boolean>;

  for (const row of rows) {
    if (!row.disabled) {
      result[row.key] = true;
    }
  }

  return result;
};

type Props = {
  isOpen: boolean;
  product: GenerateProductType | null;
  clearName: string;
  currentValues: ProductFormPayloadValues;
  currentCategoryName: string;
  categories: CategoryModel[];
  specificationValues: SpecificationValueItem[];
  currentPhotoUrls: string[];
  onClose: () => void;
  onApply: (rows: FullInfoRow[]) => void;
  onApplyCategory: (suggestion: CategorySuggestion) => void;
};

export const FullInfoSuggestionModal = (props: Props) => {
  const rows = useMemo(
    () =>
      props.product
        ? buildRows(
            props.product,
            props.clearName,
            props.currentValues,
            props.specificationValues,
            props.currentPhotoUrls,
          )
        : [],
    [
      props.product,
      props.clearName,
      props.currentValues,
      props.specificationValues,
      props.currentPhotoUrls,
    ],
  );

  const [selected, setSelected] = useState<Record<string, boolean>>(() => getInitialSelected(rows));
  const [categorySuggestion, setCategorySuggestion] = useState<CategorySuggestion | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  const [prevSnapshot, setPrevSnapshot] = useState({
    isOpen: props.isOpen,
    product: props.product,
  });

  if (prevSnapshot.isOpen !== props.isOpen || prevSnapshot.product !== props.product) {
    setPrevSnapshot({ isOpen: props.isOpen, product: props.product });
    setSelected(getInitialSelected(rows));
    setCategorySuggestion(null);
    setSuggesting(false);
    setCategoryError("");
  }

  const selectedCount = useMemo(() => {
    let count = 0;
    for (const row of rows) {
      if (selected[row.key]) {
        count++;
      }
    }
    return count;
  }, [selected, rows]);

  const handleToggle = (key: string) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApplySelected = () => {
    const applyRows = rows.filter((row) => selected[row.key] && !row.disabled);
    props.onApply(applyRows);
    props.onClose();
  };

  const handleApplyAll = () => {
    const applyRows = rows.filter((row) => row.suggested.length > 0);
    props.onApply(applyRows);
    props.onClose();
  };

  const getNameForRequest = () => {
    const nameRow = rows.find((row) => row.key === "name");
    if (nameRow && selected["name"]) return nameRow.suggested;
    return props.currentValues.name || props.product?.name || props.clearName || "";
  };

  const getDescriptionForRequest = () => {
    const descRow = rows.find((row) => row.key === "description");
    if (descRow && selected["description"]) return descRow.suggested;
    return props.currentValues.description || props.product?.description || "";
  };

  const handleSuggestCategory = () => {
    const name = getNameForRequest().trim();
    const description = getDescriptionForRequest().trim();

    if (name.length < 3 || description.length < 3) {
      setCategoryError(
        "Укажите название и описание товара (минимум 3 символа), чтобы определить категорию",
      );
      return;
    }

    setSuggesting(true);
    setCategoryError("");

    getCategorySuggestionAction({ name, description })
      .then((response) => {
        if (response.status === "success" && response.data) {
          setCategorySuggestion(response.data);
        } else {
          setCategoryError(response.message || "Не удалось определить категорию");
        }
      })
      .finally(() => {
        setSuggesting(false);
      });
  };

  const handleResetCategory = () => {
    setCategorySuggestion(null);
    setCategoryError("");
  };

  const handleApplySuggestion = () => {
    if (categorySuggestion) {
      props.onApplyCategory(categorySuggestion);
    }
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
    const hasExisting = Boolean(categorySuggestion?.category_id);
    const hasChain = Boolean(categorySuggestion && categorySuggestion.create_categories.length > 0);
    const isEmptyResult = categorySuggestion !== null && !hasExisting && !hasChain;

    const recommendedName = categorySuggestion?.category_id
      ? getCategoryFullPath(props.categories, categorySuggestion.category_id) ||
        `Категория #${categorySuggestion.category_id}`
      : "";

    const parentPath =
      hasChain && typeof categorySuggestion?.create_categories[0]?.parent_id === "number"
        ? getCategoryFullPath(props.categories, categorySuggestion.create_categories[0].parent_id)
        : "";

    return (
      <div className={styles.fieldRow}>
        <div className={styles.fieldHead}>
          <span className={styles.categoryTitle}>Категория</span>
          {props.currentCategoryName && (
            <span className={styles.appliedBadge}>Текущая: {props.currentCategoryName}</span>
          )}
        </div>

        {!categorySuggestion && (
          <>
            {props.product?.category_name && (
              <p className={styles.fieldHint}>Предложено: {props.product.category_name}</p>
            )}
            <div className={styles.categoryButtons}>
              <Button
                variant="solid"
                variantColor="blue"
                size="sm"
                onClick={handleSuggestCategory}
                disabled={suggesting}
              >
                <div className="buttonContentIcon">
                  <div>{suggesting ? <div className="spinner" /> : null}</div>
                  <p>{suggesting ? "Определение…" : "Определить категорию"}</p>
                </div>
              </Button>
            </div>
          </>
        )}

        {categoryError && <p className={styles.categoryError}>{categoryError}</p>}

        {hasExisting && (
          <div className={styles.suggestedBlock}>
            <span className={styles.suggestedLabel}>Рекомендуемая категория</span>
            <p className={styles.suggestedValue}>{recommendedName}</p>
          </div>
        )}

        {hasChain && (
          <div className={styles.suggestedBlock}>
            <span className={styles.suggestedLabel}>Будет создано</span>
            <p className={styles.suggestedValue}>
              {parentPath && (
                <>
                  {parentPath}
                  <span className={styles.chainArrow}> / </span>
                </>
              )}
              {(categorySuggestion?.create_categories ?? [])
                .map((category) => category.name)
                .join(" / ")}
            </p>
            <p className={styles.fieldHint}>
              Недостающие категории будут созданы в каталоге автоматически.
            </p>
          </div>
        )}

        {isEmptyResult && (
          <div className={styles.categoryError}>
            Не удалось определить категорию. Попробуйте уточнить название или описание товара.
          </div>
        )}

        {(hasExisting || hasChain || isEmptyResult) && (
          <div className={styles.categoryButtons}>
            {hasExisting && (
              <Button
                variant="solid"
                variantColor="green"
                size="sm"
                onClick={handleApplySuggestion}
              >
                Выбрать
              </Button>
            )}
            {hasChain && (
              <Button
                variant="solid"
                variantColor="green"
                size="sm"
                onClick={handleApplySuggestion}
              >
                Создать и выбрать
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleResetCategory}>
              Изменить
            </Button>
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

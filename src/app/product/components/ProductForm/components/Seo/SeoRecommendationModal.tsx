import { useMemo, useState } from "react";
import type { SeoModel } from "@/app/product/action";
import { Button } from "@/shared/ui/button-main/Button";
import { Checkbox } from "@/shared/ui/checkbox/Checkbox";
import { Modal } from "@/shared/ui/modal/Modal";
import { ModalBody } from "@/shared/ui/modal/modal-body/ModalBody";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";
import styles from "./SeoRecommendationModal.module.css";

type SeoKey = Extract<keyof SeoModel, string>;

const SEO_FIELDS: { key: SeoKey; label: string; hint: string }[] = [
  { key: "seo_title", label: "SEO заголовок", hint: "Заголовок в поисковой выдаче" },
  { key: "seo_description", label: "SEO описание", hint: "Краткое описание для поисковой выдачи" },
  { key: "slug", label: "Slug", hint: "Адресная часть URL товара" },
  { key: "og_title", label: "OG заголовок", hint: "Заголовок при репосте в соцсетях" },
  { key: "og_description", label: "OG описание", hint: "Описание при репосте в соцсетях" },
  { key: "og_type", label: "OG тип", hint: "Тип контента для Open Graph" },
  { key: "keywords", label: "Ключевые слова", hint: "Через запятую" },
];

const MAX_SEO_LENGTH = 255;

const getInitialSelected = (
  recommendations: SeoModel | null,
  currentValues: Partial<SeoModel>,
): Record<SeoKey, boolean> => {
  const result = Object.fromEntries(SEO_FIELDS.map((field) => [field.key, false])) as Record<
    SeoKey,
    boolean
  >;

  if (!recommendations) return result;

  for (const field of SEO_FIELDS) {
    const key = field.key;
    const recValue = recommendations[key] ?? "";
    const curValue = currentValues[key] ?? "";
    result[key] = recValue.length > 0 && curValue !== recValue && !curValue;
  }

  return result;
};

type Props = {
  isOpen: boolean;
  recommendations: SeoModel | null;
  currentValues: Partial<SeoModel>;
  onClose: () => void;
  onApplyField: (field: SeoKey, value: string) => void;
  onApplyAll: (seo: SeoModel) => void;
};

export const SeoRecommendationModal = (props: Props) => {
  const [selected, setSelected] = useState<Record<SeoKey, boolean>>(() =>
    getInitialSelected(props.recommendations, props.currentValues),
  );

  const [prevSnapshot, setPrevSnapshot] = useState({
    isOpen: props.isOpen,
    recommendations: props.recommendations,
  });

  if (
    prevSnapshot.isOpen !== props.isOpen ||
    prevSnapshot.recommendations !== props.recommendations
  ) {
    setPrevSnapshot({ isOpen: props.isOpen, recommendations: props.recommendations });
    setSelected(getInitialSelected(props.recommendations, props.currentValues));
  }

  const selectedCount = useMemo(() => {
    let count = 0;
    for (const field of SEO_FIELDS) {
      if (selected[field.key]) {
        count++;
      }
    }
    return count;
  }, [selected]);

  const handleToggle = (key: SeoKey) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApplySelected = () => {
    if (!props.recommendations) return;

    for (const field of SEO_FIELDS) {
      if (selected[field.key]) {
        props.onApplyField(field.key, props.recommendations[field.key]);
      }
    }

    props.onClose();
  };

  const handleApplyAll = () => {
    if (!props.recommendations) return;

    props.onApplyAll(props.recommendations);
    props.onClose();
  };

  return (
    <Modal active={props.isOpen} handleCloseAction={props.onClose}>
      <ModalContent>
        <ModalHeader title="Рекомендации по SEO" onClose={props.onClose} />
        <ModalBody>
          <div className={styles.body}>
            {SEO_FIELDS.map((field) => {
              const recValue = props.recommendations?.[field.key] ?? "";
              const curValue = props.currentValues[field.key] ?? "";
              const alreadyApplied = recValue.length > 0 && recValue === curValue;
              const isEmpty = recValue.length === 0;

              return (
                <div
                  key={field.key}
                  className={`${styles.fieldRow} ${selected[field.key] ? styles.fieldRowSelected : ""}`}
                >
                  <div className={styles.fieldHead}>
                    <Checkbox
                      checked={selected[field.key]}
                      disabled={alreadyApplied || isEmpty}
                      onChange={() => handleToggle(field.key)}
                      labelText={field.label}
                    />
                    {alreadyApplied && <span className={styles.appliedBadge}>Уже применено</span>}
                    {isEmpty && <span className={styles.emptyBadge}>Не предложено</span>}
                  </div>
                  <p className={styles.fieldHint}>{field.hint}</p>
                  {curValue && (
                    <div className={styles.currentBlock}>
                      <span className={styles.currentLabel}>Текущее</span>
                      <p className={styles.currentValue}>{curValue}</p>
                    </div>
                  )}
                  {recValue && (
                    <div className={styles.suggestedBlock}>
                      <div className={styles.suggestedHead}>
                        <span className={styles.suggestedLabel}>Предложенное</span>
                        <span className={styles.suggestedLength}>
                          {recValue.length}/{MAX_SEO_LENGTH}
                        </span>
                      </div>
                      <p className={styles.suggestedValue}>{recValue}</p>
                    </div>
                  )}
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

import Link from "next/link";
import { Activity, useMemo, useState } from "react";
import type { CategoryModel } from "@/app/category/action";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Input } from "@/shared/ui/input-main/Input";
import { SelectCategoryList } from "@/views/SelectCategoryList/SelectCategoryList";
import { FormInstruction } from "@/widgets/form-instruction/FormInstruction";
import { FormSection } from "@/widgets/form-section/FormSection";
import styles from "./ProductFormGeneralInfo.module.css";

type Props = {
  values: {
    name: string;
    code: string;
    description: string;
    brand: string;
    category: number | null;
  };
  errors: {
    name: string;
    code: string;
    description: string;
    brand: string;
    category: string;
  };
  handleChangeValues: (field: string, value: string) => void;
  categories: CategoryModel[];
  onSelectCategory: (id: number | null) => void;
};

export const ProductFormGeneralInfo = (props: Props) => {
  const [openCategory, setOpenCategory] = useState<boolean>(false);

  const handleSelectCategory = (id: number | null) => {
    props.onSelectCategory(id);
    setOpenCategory(false);
  };

  const getCategoryName = (categories: CategoryModel[], id: number | null) => {
    let name = "";

    if (typeof id === "number") {
      for (let i = 0; i < categories.length; i++) {
        const currentCategory = categories[i];
        const hasChildren = currentCategory.children.length > 0;

        if (currentCategory.id === id) {
          name = currentCategory.name;
          break;
        }

        if (hasChildren) {
          const findChildrenName = getCategoryName(currentCategory.children, id);
          if (findChildrenName) {
            name = findChildrenName;
            break;
          }
        }
      }
    }

    return name;
  };

  const categoryName = useMemo(
    () => getCategoryName(props.categories, props.values.category),
    [props.categories, props.values.category],
  );

  return (
    <FormSection title="Общие данные">
      <Input
        error={props.errors.code}
        value={props.values.code}
        name="product_code"
        id="product_code"
        type="number"
        variant="outlined"
        variantSize="sm"
        label="Штрих-код"
        autoFocus
        rightIcon={<CancelSvg />}
        onChange={(e) => props.handleChangeValues("code", e.target.value)}
        onClickRightIcon={() => props.handleChangeValues("code", "")}
      />
      <Input
        error={props.errors.name}
        value={props.values.name}
        name="product_name"
        id="product_name"
        variant="outlined"
        variantSize="sm"
        label="Название"
        rightIcon={<CancelSvg />}
        onChange={(e) => props.handleChangeValues("name", e.target.value)}
        onClickRightIcon={() => props.handleChangeValues("name", "")}
      />
      <Input
        error={props.errors.description}
        value={props.values.description}
        name="product_description"
        id="product_description"
        variant="outlined"
        variantSize="sm"
        label="Описание"
        rightIcon={<CancelSvg />}
        onChange={(e) => props.handleChangeValues("description", e.target.value)}
        onClickRightIcon={() => props.handleChangeValues("description", "")}
      />
      <Input
        error={props.errors.brand}
        value={props.values.brand}
        name="product_brand"
        id="product_brand"
        variant="outlined"
        variantSize="sm"
        label="Бренд"
        rightIcon={<CancelSvg />}
        onChange={(e) => props.handleChangeValues("brand", e.target.value)}
        onClickRightIcon={() => props.handleChangeValues("brand", "")}
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

      <div className={styles.categoryContainer}>
        <div className={styles.categoryValueContainer}>
          <button
            type="button"
            className={styles.categoryValueLeftSide}
            onClick={() => setOpenCategory((prev) => !prev)}
          >
            <span
              className={
                props.values.category
                  ? `${styles.categoryLabel} ${styles.categoryLabelActive}`
                  : styles.categoryLabel
              }
            >
              Категория
            </span>
            <span
              className={
                props.values.category
                  ? styles.categoryToggleButtonActive
                  : styles.categoryToggleButton
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
    </FormSection>
  );
};

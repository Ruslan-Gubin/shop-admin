import { useState } from "react";
import { DeleteSvg } from "@/app/category/components/category-item/svg/DeleteSvg";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Input } from "@/shared/ui/input-main/Input";
import { FormSection } from "@/widgets/form-section/FormSection";
import styles from "./ProductFormSpecifications.module.css";

type Props = {
  specifications: { label: string; value: string }[];
};

export const ProductFormSpecifications = (props: Props) => {
  const [specifications, setSpecifications] = useState<{ label: string; value: string }[]>(
    props.specifications,
  );

  const handleChangeValues = (index: number, type: "label" | "value", value: string) => {
    for (let i = 0; i < specifications.length; i++) {
      if (index === i) {
        if (type === "label") {
          specifications[index].label = value;
        } else {
          specifications[index].value = value;
        }
      }
    }

    const lastSpecifications = specifications.at(-1);
    if (
      lastSpecifications &&
      lastSpecifications.label.length > 0 &&
      lastSpecifications.value.length > 0
    ) {
      specifications.push({ label: "", value: "" });
    }

    setSpecifications([...specifications]);
  };

  const handleDeleteSpecification = (index: number) => {
    setSpecifications((prev) => prev.filter((_, id) => id !== index));
  };

  return (
    <FormSection title="Характеристики">
      <ul className={styles.specificationList}>
        {specifications.map((specification, index) => (
          <li key={index} className={styles.specificationItem}>
            <Input
              error={""}
              value={specification.label}
              name={`product_specification_name_${specification.label}_${index}`}
              id={`product_specification_name_${specification.label}_${index}`}
              variant="outlined"
              variantSize="sm"
              label="Характеристика"
              rightIcon={<CancelSvg />}
              onChange={(e) => handleChangeValues(index, "label", e.target.value)}
              onClickRightIcon={() => handleChangeValues(index, "label", "")}
            />
            <Input
              error={""}
              value={specification.value}
              name={`product_specification_value_${specification.label}_${index}`}
              id={`product_specification_value_${specification.label}_${index}`}
              variant="outlined"
              variantSize="sm"
              label="Значение"
              rightIcon={<CancelSvg />}
              onChange={(e) => handleChangeValues(index, "value", e.target.value)}
              onClickRightIcon={() => handleChangeValues(index, "value", "")}
            />
            {specifications.length > 1 && (
              <button
                onClick={() => handleDeleteSpecification(index)}
                type="button"
                className={styles.deleteItem}
              >
                <DeleteSvg fill="#727280" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </FormSection>
  );
};

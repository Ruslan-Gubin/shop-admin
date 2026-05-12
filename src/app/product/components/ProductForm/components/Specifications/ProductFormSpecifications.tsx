import Link from "next/link";
import { DeleteSvg } from "@/app/category/components/category-item/svg/DeleteSvg";
import type { SpecificationModel } from "@/app/specifications/action";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Input } from "@/shared/ui/input-main/Input";
import { FormInstruction } from "@/widgets/form-instruction/FormInstruction";
import { FormSection } from "@/widgets/form-section/FormSection";
import type { SpecificationValueItem } from "../../ProductForm";
import { DropdownSearchWrapper } from "./DropdownSearchWrapper";
import styles from "./ProductFormSpecifications.module.css";

type Props = {
  specifications: SpecificationModel[];
  specificationValues: SpecificationValueItem[];
  setSpecificationsValues: (updateValues: SpecificationValueItem[]) => void;
};

export const ProductFormSpecifications = (props: Props) => {
  const handleChangeValues = (index: number, value: string) => {
    for (let i = 0; i < props.specificationValues.length; i++) {
      if (index === i) {
        props.specificationValues[index].value = value;
      }
    }

    const lastSpecifications = props.specificationValues.at(-1);

    if (
      lastSpecifications &&
      lastSpecifications.label.length > 0 &&
      lastSpecifications.value.length > 0
    ) {
      props.specificationValues.push({ label: "", value: "", specificationId: null });
    }

    props.setSpecificationsValues([...props.specificationValues]);
  };

  const onSelectSpecification = (index: number, specificationId: number | null, label: string) => {
    for (let i = 0; i < props.specificationValues.length; i++) {
      if (index === i) {
        props.specificationValues[index].label = label;
        props.specificationValues[index].specificationId = specificationId;
      }
    }

    props.setSpecificationsValues([...props.specificationValues]);
  };

  const handleDeleteSpecification = (index: number) => {
    props.setSpecificationsValues(props.specificationValues.filter((_, id) => id !== index));
  };

  const selectedSpecifications = props.specificationValues
    .map((el) => el.specificationId)
    .filter((el) => typeof el === "number");

  return (
    <FormSection title="Характеристики">
      <FormInstruction>
        <span>Введите характеристику и значение. </span>
        <span>
          Чтобы добавить или редактировать характеристику, перейдите на страницу{" "}
          <Link tabIndex={-1} href="/specifications" className="instruction-link">
            характеристики
          </Link>
          .
        </span>
      </FormInstruction>
      <ul className={styles.specificationList}>
        {props.specificationValues.map((specification, index) => (
          <li key={index} className={styles.specificationItem}>
            <DropdownSearchWrapper
              label={specification.label || ""}
              selectId={specification.specificationId}
              selectedSpecifications={selectedSpecifications}
              index={index}
              onSelectSpecificationAction={onSelectSpecification}
              specifications={props.specifications}
            />
            <Input
              value={specification.value}
              name={`product_specification_value_${specification.label}_${index}`}
              id={`product_specification_value_${specification.label}_${index}`}
              variant="outlined"
              variantSize="sm"
              label="Значение"
              rightIcon={<CancelSvg />}
              onChange={(e) => handleChangeValues(index, e.target.value)}
              onClickRightIcon={() => handleChangeValues(index, "")}
            />
            {props.specificationValues.length > 1 && (
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

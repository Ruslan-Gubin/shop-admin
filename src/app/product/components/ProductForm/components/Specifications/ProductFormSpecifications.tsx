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
  const handleChangeValues = (listId: number, value: string) => {
    const currentSpecificationValue = props.specificationValues.find((el) => el.listId === listId);

    if (!currentSpecificationValue) return;
    currentSpecificationValue.value = value;

    const lastSpecifications = props.specificationValues.at(-1);

    if (
      lastSpecifications &&
      lastSpecifications.label.length > 0 &&
      lastSpecifications.value.length > 0
    ) {
      props.specificationValues.push({
        listId: props.specificationValues.length + 1,
        label: "",
        value: "",
        specificationId: null,
      });
    }

    props.setSpecificationsValues([...props.specificationValues]);
  };

  const onSelectSpecification = (listId: number, specificationId: number | null, label: string) => {
    const currentSpecificationValue = props.specificationValues.find((el) => el.listId === listId);

    if (!currentSpecificationValue) return;
    currentSpecificationValue.label = label;
    currentSpecificationValue.specificationId = specificationId;

    props.setSpecificationsValues([...props.specificationValues]);
  };

  const handleDeleteSpecification = (listId: number) => {
    props.setSpecificationsValues(
      props.specificationValues
        .filter((el) => el.listId !== listId)
        .map((el, index) => ({ ...el, listId: index + 1 })),
    );
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
        {props.specificationValues.map((specification) => (
          <li key={specification.listId} className={styles.specificationItem}>
            <DropdownSearchWrapper
              label={specification.label || ""}
              selectId={specification.specificationId}
              selectedSpecifications={selectedSpecifications}
              index={specification.listId}
              onSelectSpecificationAction={onSelectSpecification}
              specifications={props.specifications}
            />
            <Input
              value={specification.value}
              name={`product_specification_value_${specification.label}`}
              id={`product_specification_value_${specification.label}`}
              variant="outlined"
              variantSize="sm"
              label="Значение"
              rightIcon={<CancelSvg />}
              onChange={(e) => handleChangeValues(specification.listId, e.target.value)}
              onClickRightIcon={() => handleChangeValues(specification.listId, "")}
            />
            {props.specificationValues.length > 1 && (
              <button
                onClick={() => handleDeleteSpecification(specification.listId)}
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

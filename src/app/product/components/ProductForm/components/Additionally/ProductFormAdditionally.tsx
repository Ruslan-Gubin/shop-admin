import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Input } from "@/shared/ui/input-main/Input";
import { FormSection } from "@/widgets/form-section/FormSection";
import styles from "./ProductFormAdditionally.module.css";

type Props = {
  values: {
    country: string;
    product_type: string;
    weight: string;
    equipment: string;
    height: string;
    length: string;
    width: string;
  };
  errors: {
    country: string;
    product_type: string;
    weight: string;
    equipment: string;
    height: string;
    length: string;
    width: string;
  };
  handleChangeValues: (field: string, value: string) => void;
};

export const ProductFormAdditionally = (props: Props) => {
  return (
    <FormSection title="Дополнительно">
      <Input
        name="additionally_country"
        id="additionally_country"
        variant="outlined"
        variantSize="sm"
        label="Страна-производитель"
        rightIcon={<CancelSvg />}
        onClickRightIcon={() => props.handleChangeValues("country", "")}
        onChange={(e) => props.handleChangeValues("country", e.target.value)}
        error={props.errors.country}
        value={props.values.country}
      />
      <Input
        name="additionally_product_type"
        id="additionally_product_type"
        variant="outlined"
        variantSize="sm"
        label="Вид товара"
        rightIcon={<CancelSvg />}
        onClickRightIcon={() => props.handleChangeValues("product_type", "")}
        onChange={(e) => props.handleChangeValues("product_type", e.target.value)}
        error={props.errors.product_type}
        value={props.values.product_type}
      />
      <Input
        name="additionally_equipment"
        id="additionally_equipment"
        variant="outlined"
        variantSize="sm"
        label="Что входит в состав"
        rightIcon={<CancelSvg />}
        onClickRightIcon={() => props.handleChangeValues("equipment", "")}
        onChange={(e) => props.handleChangeValues("equipment", e.target.value)}
        error={props.errors.equipment}
        value={props.values.equipment}
      />

      <div className={styles.dimensions}>
        <Input
          name="additionally_weight"
          id="additionally_weight"
          variant="outlined"
          variantSize="sm"
          label="Вес"
          type="number"
          rightIcon={<CancelSvg />}
          onClickRightIcon={() => props.handleChangeValues("weight", "")}
          onChange={(e) => props.handleChangeValues("weight", e.target.value)}
          error={props.errors.weight}
          value={props.values.weight}
        />

        <Input
          name="additionally_height"
          id="additionally_height"
          variant="outlined"
          variantSize="sm"
          label="Высота"
          type="number"
          rightIcon={<CancelSvg />}
          onClickRightIcon={() => props.handleChangeValues("height", "")}
          onChange={(e) => props.handleChangeValues("height", e.target.value)}
          error={props.errors.height}
          value={props.values.height}
        />
        <Input
          name="additionally_length"
          id="additionally_length"
          variant="outlined"
          variantSize="sm"
          label="Длина"
          type="number"
          rightIcon={<CancelSvg />}
          onClickRightIcon={() => props.handleChangeValues("length", "")}
          onChange={(e) => props.handleChangeValues("length", e.target.value)}
          error={props.errors.length}
          value={props.values.length}
        />
        <Input
          name="additionally_width"
          id="additionally_width"
          variant="outlined"
          variantSize="sm"
          label="Ширина"
          type="number"
          rightIcon={<CancelSvg />}
          onClickRightIcon={() => props.handleChangeValues("width", "")}
          onChange={(e) => props.handleChangeValues("width", e.target.value)}
          error={props.errors.width}
          value={props.values.width}
        />
      </div>
    </FormSection>
  );
};

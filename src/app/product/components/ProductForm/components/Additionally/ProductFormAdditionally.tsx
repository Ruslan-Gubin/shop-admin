import styles from "./ProductFormAdditionally.module.css";
import { FormSection } from "@/widgets/form-section/FormSection";
import { Input } from "@/shared/ui/input-main/Input";
import { useState } from "react";
import { CancelSvg } from "@/shared/svg/CancelSvg";

type Props = {
  additionally: {
    country: string;
    product_type: string;
    weight: string;
    equipment: string;
    height: string;
    length: string;
    width: string;
  };
};

export const ProductFormAdditionally = (props: Props) => {
  const [additionally, setAdditionally] = useState({
    country: "",
    product_type: "",
    weight: "",
    equipment: "",
    height: "",
    length: "",
    width: "",
  });

  const handleChangeValues = (field: string, value: string) => {
    setAdditionally((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <FormSection title="Дополнительно">
      {/* <FormInstruction> */}
      {/*   <span>PNG или JPEG с размером до 15 мб..</span> */}
      {/* </FormInstruction> */}
      {/* <div>Товар для взрослых</div> */}
      {/* <div>Требуются особые условия доставки</div> */}

      <Input
        name="additionally_country"
        id="additionally_country"
        variant="outlined"
        variantSize="sm"
        label="Страна-производитель"
        rightIcon={<CancelSvg />}
        onClickRightIcon={() => handleChangeValues("country", "")}
        onChange={(e) => handleChangeValues("country", e.target.value)}
        value={additionally.country}
      />
      <Input
        name="additionally_product_type"
        id="additionally_product_type"
        variant="outlined"
        variantSize="sm"
        label="Вид товара"
        rightIcon={<CancelSvg />}
        onClickRightIcon={() => handleChangeValues("product_type", "")}
        onChange={(e) => handleChangeValues("product_type", e.target.value)}
        value={additionally.product_type}
      />
      <Input
        name="additionally_equipment"
        id="additionally_equipment"
        variant="outlined"
        variantSize="sm"
        label="Что входит в состав"
        type="number"
        rightIcon={<CancelSvg />}
        onClickRightIcon={() => handleChangeValues("equipment", "")}
        onChange={(e) => handleChangeValues("equipment", e.target.value)}
        value={additionally.equipment}
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
          onClickRightIcon={() => handleChangeValues("weight", "")}
          onChange={(e) => handleChangeValues("weight", e.target.value)}
          value={additionally.weight}
        />

        <Input
          name="additionally_height"
          id="additionally_height"
          variant="outlined"
          variantSize="sm"
          label="Высота"
          type="number"
          rightIcon={<CancelSvg />}
          onClickRightIcon={() => handleChangeValues("height", "")}
          onChange={(e) => handleChangeValues("height", e.target.value)}
          value={additionally.height}
        />
        <Input
          name="additionally_length"
          id="additionally_length"
          variant="outlined"
          variantSize="sm"
          label="Длина"
          type="number"
          rightIcon={<CancelSvg />}
          onClickRightIcon={() => handleChangeValues("length", "")}
          onChange={(e) => handleChangeValues("length", e.target.value)}
          value={additionally.length}
        />
        <Input
          name="additionally_width"
          id="additionally_width"
          variant="outlined"
          variantSize="sm"
          label="Ширина"
          type="number"
          rightIcon={<CancelSvg />}
          onClickRightIcon={() => handleChangeValues("width", "")}
          onChange={(e) => handleChangeValues("width", e.target.value)}
          value={additionally.width}
        />
      </div>
    </FormSection>
  );
};

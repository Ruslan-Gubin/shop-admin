import type { CategoryModel } from "@/app/category/action";
import { AiSvg } from "@/shared/svg/AiSvg";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Button } from "@/shared/ui/button-main/Button";
import { Input } from "@/shared/ui/input-main/Input";
import { FormSection } from "@/widgets/form-section/FormSection";
import { CategorySelect } from "./CategorySelect/CategorySelect";

type Props = {
  values: {
    name: string;
    code: string;
    description: string;
    brand_name: string;
    category_id: number | null;
  };
  errors: {
    name: string;
    code: string;
    description: string;
    brand_name: string;
    category_id: string;
  };
  handleChangeValues: (field: string, value: string) => void;
  categories: CategoryModel[];
  onSelectCategory: (id: number | null) => void;
  generatingFullInfo: boolean;
  onGenerateFullInfo: () => void;
};

export const ProductFormGeneralInfo = (props: Props) => {
  const isValidBarcode = /^\d{8,14}$/.test(props.values.code.trim());

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
      <Button
        variant="solid"
        variantColor="blue"
        size="sm"
        onClick={props.onGenerateFullInfo}
        disabled={props.generatingFullInfo || !isValidBarcode}
      >
        <div className="buttonContentIcon">
          <div>{props.generatingFullInfo ? <div className="spinner" /> : <AiSvg />}</div>
          <p>Сгенерировать полную информацию</p>
        </div>
      </Button>
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
        error={props.errors.brand_name}
        value={props.values.brand_name}
        name="product_brand"
        id="product_brand"
        variant="outlined"
        variantSize="sm"
        label="Бренд"
        rightIcon={<CancelSvg />}
        onChange={(e) => props.handleChangeValues("brand_name", e.target.value)}
        onClickRightIcon={() => props.handleChangeValues("brand_name", "")}
      />
      <CategorySelect
        categories={props.categories}
        categoryId={props.values.category_id}
        onSelectCategory={props.onSelectCategory}
        values={props.values}
      />
    </FormSection>
  );
};

"use client";
import { useState, useTransition } from "react";
import type { CategoryModel } from "@/app/category/action";
import { AddSvg } from "@/app/category/components/category-item/svg/AddSvg";
import { EditSvg } from "@/app/category/components/category-item/svg/EditSvg";
import type { PriceTypeModel } from "@/app/price-types/action";
import type { CreateProductFormFields } from "@/app/product/create/action";
import { Button } from "@/shared/ui/button-main/Button";
import { ProductFormAdditionally } from "./components/Additionally/ProductFormAdditionally";
import { ProductFormGeneralInfo } from "./components/GeneralInfo/ProductFormGeneralInfo";
import { ProductFormPhotos } from "./components/Photo/ProductFormPhotos";
import { ProductFormPrices } from "./components/Prices/ProductFormPrices";
import { ProductFormSpecifications } from "./components/Specifications/ProductFormSpecifications";
import { ProductFormStocks } from "./components/Stocks/ProductFormStocks";
import styles from "./ProductForm.module.css";

type Props = {
  categories: CategoryModel[];
  variant: "create" | "edit";
  submitFormAction: (
    prevState: CreateProductFormFields,
    formData: FormData,
  ) => Promise<CreateProductFormFields>;
  initValue?: {
    name: string;
    count: string;
    price: string;
    code: string;
    id: number | null;
  };
  priceTypes: PriceTypeModel[];
  initialPriceTypesValues: Record<string, string>;
  getFillValuesAction: (
    currentPrice: number,
  ) => Promise<{ updateFillValues: Record<string, number>; isHasRange: boolean }>;
};

export const ProductForm = (props: Props) => {
  const [pending, transition] = useTransition();
  const [values, setValues] = useState<{
    name: string;
    code: string;
    description: string;
    brand: string;
    category: number | null;
  }>({
    name: "",
    code: "",
    brand: "",
    category: null,
    description: "",
  });

  const [errors, setErrors] = useState<{
    name: string;
    code: string;
    description: string;
    brand: string;
    category: string;
  }>({
    name: "",
    code: "",
    brand: "",
    category: "",
    description: "",
  });
  // const [state, formAction, pending] = useActionState(props.submitFormAction, {
  //   name: {
  //     value: props?.initValue?.name ? props.initValue.name : "",
  //     error: "",
  //   },
  //   count: {
  //     value: props?.initValue?.count ? props.initValue.count : "",
  //     error: "",
  //   },
  //   price: {
  //     value: props?.initValue?.price ? props.initValue.price : "",
  //     error: "",
  //   },
  //   code: {
  //     value: props?.initValue?.code ? props.initValue.code : "",
  //     error: "",
  //   },
  //   id: props?.initValue?.id ? props.initValue.id : null,
  //   message: "",
  //   status: "",
  // });

  // useLayoutEffect(() => {
  //   if (state.message && (state.status === "success" || state.status === "error")) {
  //     notificationAdapter.add(state.message, state.status);
  //   }
  // }, [state]);

  const submitForm = () => {
    transition(() => {
      console.log(values);
    });
  };

  const handleChangeValues = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectCategory = (id: number | null) => {
    setValues((prev) => ({ ...prev, category: id }));
  };

  return (
    <section className={styles.addForm}>
      <ProductFormGeneralInfo
        categories={props.categories}
        values={values}
        errors={errors}
        handleChangeValues={handleChangeValues}
        onSelectCategory={handleSelectCategory}
      />
      <ProductFormAdditionally
        additionally={{
          country: "",
          product_type: "",
          weight: "",
          equipment: "",
          height: "",
          length: "",
          width: "",
        }}
      />
      <ProductFormSpecifications specifications={[{ label: "", value: "" }]} />

      <ProductFormPrices
        getFillValuesAction={props.getFillValuesAction}
        initialPriceTypesValues={props.initialPriceTypesValues}
        priceTypes={props.priceTypes}
      />
      <ProductFormStocks
        warehouses={[
          { id: 1, name: "Культурная 2" },
          { id: 2, name: "Федьковича 67/2" },
          { id: 3, name: "Железноводская 8" },
        ]}
        initialRemains={{
          "1": "",
          "2": "",
          "3": "",
        }}
      />
      <ProductFormPhotos initPhotos={[]} />

      <div className={styles.actionForm}>
        <Button
          size="sm"
          variant="solid"
          variantColor="green"
          onClick={submitForm}
          type="submit"
          disabled={pending}
        >
          {props.variant === "create" ? <AddSvg /> : <EditSvg />}
          {props.variant === "create" ? "Добавить товар" : "Редактировать"}
        </Button>
      </div>
    </section>
  );
};

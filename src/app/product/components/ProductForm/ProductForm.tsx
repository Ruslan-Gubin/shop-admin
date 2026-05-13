"use client";
import { useLayoutEffect, useState, useTransition } from "react";
import type { CategoryModel } from "@/app/category/action";
import { AddSvg } from "@/app/category/components/category-item/svg/AddSvg";
import { EditSvg } from "@/app/category/components/category-item/svg/EditSvg";
import type { PriceTypeModel } from "@/app/price-types/action";
import type { ProductFormPayloadValues } from "@/app/product/create/action";
import type { SpecificationModel } from "@/app/specifications/action";
import { Button } from "@/shared/ui/button-main/Button";
import { notificationAdapter } from "@/stores/notification/adapter";
import { ProductFormAdditionally } from "./components/Additionally/ProductFormAdditionally";
import { ProductFormGeneralInfo } from "./components/GeneralInfo/ProductFormGeneralInfo";
import { ProductFormPhotos } from "./components/Photo/ProductFormPhotos";
import { ProductFormPrices } from "./components/Prices/ProductFormPrices";
import { ProductFormSpecifications } from "./components/Specifications/ProductFormSpecifications";
import { ProductFormStocks } from "./components/Stocks/ProductFormStocks";
import styles from "./ProductForm.module.css";

export type SpecificationValueItem = {
  listId: number;
  specificationId: number | null;
  label: string;
  value: string;
};

type Props = {
  initialProductSpecificationValues: SpecificationValueItem[];
  specifications: SpecificationModel[];
  categories: CategoryModel[];
  variant: "create" | "edit";
  submitAction: (
    values: ProductFormPayloadValues,
    typePriceValues: Record<string, string>,
    specificationsValues: SpecificationValueItem[],
  ) => Promise<{
    errors: Record<keyof ProductFormPayloadValues, string> | null;
    notification: {
      status: "error" | "success";
      message: string;
    } | null;
    updateTypesPricesValues: Record<string, string> | null;
    updateValues: ProductFormPayloadValues | null;
  }>;
  priceTypes: PriceTypeModel[];
  initialPriceTypesValues: Record<string, string>;
  initialValues: ProductFormPayloadValues;
  getFillValuesAction: (
    currentPrice: number,
  ) => Promise<{ updateFillValues: Record<string, number>; isHasRange: boolean }>;
};

export const ProductForm = (props: Props) => {
  const [pending, transition] = useTransition();
  const [values, setValues] = useState<ProductFormPayloadValues>(props.initialValues);
  const [errors, setErrors] = useState<Record<keyof ProductFormPayloadValues, string>>({
    name: "",
    code: "",
    brand_id: "",
    category_id: "",
    description: "",
    country: "",
    product_type: "",
    weight: "",
    equipment: "",
    height: "",
    length: "",
    width: "",
    purchase_price: "",
  });
  const [typePriceValues, setTypePriceValues] = useState<Record<string, string>>({});
  const [specificationValues, setSpecificationsValues] = useState<SpecificationValueItem[]>([]);

  useLayoutEffect(() => {
    setTypePriceValues(props.initialPriceTypesValues);
    setValues(props.initialValues);
  }, []);

  useLayoutEffect(() => {
    setSpecificationsValues(props.initialProductSpecificationValues);
  }, [props.initialProductSpecificationValues]);

  const submitForm = () => {
    transition(() => {
      props.submitAction(values, typePriceValues, specificationValues).then((response) => {
        if (response.errors) {
          setErrors(response.errors);
        }

        if (response.notification) {
          notificationAdapter.add(response.notification.message, response.notification.status);
        }

        if (response.updateTypesPricesValues) {
          setTypePriceValues(response.updateTypesPricesValues);
        }

        if (response.updateValues) {
          setValues(response.updateValues);
        }
      });
    });
  };

  const handleChangeValues = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectCategory = (id: number | null) => {
    setValues((prev) => ({ ...prev, category_id: id }));
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
        values={values}
        errors={errors}
        handleChangeValues={handleChangeValues}
      />
      <ProductFormSpecifications
        specificationValues={specificationValues}
        specifications={props.specifications}
        setSpecificationsValues={setSpecificationsValues}
      />

      <ProductFormPrices
        setTypePriceValues={setTypePriceValues}
        typePriceValues={typePriceValues}
        purchase_price={values.purchase_price}
        handleChangeValues={handleChangeValues}
        getFillValuesAction={props.getFillValuesAction}
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

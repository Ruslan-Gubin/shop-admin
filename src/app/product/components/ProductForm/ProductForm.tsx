"use client";
import { useLayoutEffect, useMemo, useState, useTransition } from "react";
import type { CategoryModel } from "@/app/category/action";
import { AddSvg } from "@/app/category/components/category-item/svg/AddSvg";
import { EditSvg } from "@/app/category/components/category-item/svg/EditSvg";
import type { PriceTypeModel } from "@/app/price-types/action";
import type { ProductFormPayloadValues } from "@/app/product/create/action";
import type { SpecificationModel } from "@/app/specifications/action";
import { Button } from "@/shared/ui/button-main/Button";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { PhotoItem } from "../../action";
import { ProductFormAdditionally } from "./components/Additionally/ProductFormAdditionally";
import { ProductFormGeneralInfo } from "./components/GeneralInfo/ProductFormGeneralInfo";
import { ProductFormPhotos } from "./components/Photo/ProductFormPhotos";
import { ProductFormPrices } from "./components/Prices/ProductFormPrices";
import { ProductFormSeo } from "./components/Seo/ProductFormSeo";
import { ProductFormSpecifications } from "./components/Specifications/ProductFormSpecifications";
import { ProductFormStocks, type RemainsItem } from "./components/Stocks/ProductFormStocks";
import styles from "./ProductForm.module.css";

export type SpecificationValueItem = {
  listId: number;
  specificationId: number | null;
  label: string;
  value: string;
};

type Props = {
  initialRemains: RemainsItem[];
  initialProductSpecificationValues: SpecificationValueItem[];
  specifications: SpecificationModel[];
  categories: CategoryModel[];
  variant: "create" | "edit";
  submitAction: (
    values: ProductFormPayloadValues,
    typePriceValues: Record<string, string>,
    specificationsValues: SpecificationValueItem[],
    remains: RemainsItem[],
    photos: PhotoItem[],
  ) => Promise<{
    errors: Record<keyof ProductFormPayloadValues, string> | null;
    notification: {
      status: "error" | "success";
      message: string;
    } | null;
    updateTypesPricesValues: Record<string, string> | null;
    updateValues: ProductFormPayloadValues | null;
    updateRemains: RemainsItem[] | null;
    updatePhotos: PhotoItem[];
  }>;
  priceTypes: PriceTypeModel[];
  initialPriceTypesValues: Record<string, string>;
  initialValues: ProductFormPayloadValues;
  getFillValuesAction: (
    currentPrice: number,
  ) => Promise<{ updateFillValues: Record<string, number>; isHasRange: boolean }>;
  photos: PhotoItem[];
};

export const ProductForm = (props: Props) => {
  const [pending, transition] = useTransition();
  const [values, setValues] = useState<ProductFormPayloadValues>(props.initialValues);
  const [errors, setErrors] = useState<Record<keyof ProductFormPayloadValues, string>>({
    name: "",
    code: "",
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
    brand_name: "",
    seo_title: "",
    seo_description: "",
    slug: "",
    og_title: "",
    og_description: "",
    og_type: "",
    keywords: "",
  });
  const [typePriceValues, setTypePriceValues] = useState<Record<string, string>>({});
  const [specificationValues, setSpecificationsValues] = useState<SpecificationValueItem[]>([]);
  const [remains, setRemains] = useState<RemainsItem[]>([]);
  const [photoValues, setPhotoValues] = useState<PhotoItem[]>(props.photos);

  useLayoutEffect(() => {
    setTypePriceValues(props.initialPriceTypesValues);
    setValues(props.initialValues);
    setRemains(props.initialRemains);
    setPhotoValues(props.photos);
  }, []);

  useLayoutEffect(() => {
    setSpecificationsValues(props.initialProductSpecificationValues);
  }, [props.initialProductSpecificationValues]);

  const submitForm = () => {
    transition(() => {
      props
        .submitAction(values, typePriceValues, specificationValues, remains, photoValues)
        .then((response) => {
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

          if (response.updateRemains) {
            setRemains(response.updateRemains);
          }

          if (response.updatePhotos) {
            setPhotoValues(response.updatePhotos);
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

  const filterUrlPhoto = useMemo(
    () => photoValues.filter((el) => el.url).sort((a, b) => a.position - b.position),
    [photoValues],
  );

  const previewPrice = useMemo(() => {
    for (const key in typePriceValues) {
      const value = Number(typePriceValues[key]);
      if (value > 0) {
        return value;
      }
    }
    return null;
  }, [typePriceValues]);

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
      <ProductFormStocks variant={props.variant} remains={remains} onChangeRemains={setRemains} />
      <ProductFormPhotos
        name={values.name}
        description={values.description}
        specifications={specificationValues.filter(
          (el) => el.value.length > 0 && el.label.length > 0,
        )}
        price={previewPrice}
        photos={filterUrlPhoto}
        setPhotos={setPhotoValues}
        brand_name={values.brand_name}
      />
      <ProductFormSeo values={values} errors={errors} handleChangeValues={handleChangeValues} />

      <div className={styles.actionForm}>
        <Button
          size="sm"
          variant="solid"
          variantColor="green"
          onClick={submitForm}
          type="button"
          disabled={pending}
        >
          {props.variant === "create" ? <AddSvg /> : <EditSvg />}
          {props.variant === "create" ? "Создать товар" : "Редактировать"}
        </Button>
      </div>
    </section>
  );
};

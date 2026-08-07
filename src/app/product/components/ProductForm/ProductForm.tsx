"use client";
import { useLayoutEffect, useMemo, useState, useTransition } from "react";
import type { CategoryModel } from "@/app/category/action";
import { AddSvg } from "@/app/category/components/category-item/svg/AddSvg";
import { EditSvg } from "@/app/category/components/category-item/svg/EditSvg";
import type { PriceTypeModel } from "@/app/price-types/action";
import {
  applyCategorySuggestionAction,
  type CategorySuggestion,
  type GenerateProductType,
  generateProductAction,
} from "@/app/product/action";
import type { ProductFormPayloadValues } from "@/app/product/create/action";
import type { SpecificationModel } from "@/app/specifications/action";
import { getCategoryFullPath } from "@/shared/helpers/getCategoryFullPath";
import { Button } from "@/shared/ui/button-main/Button";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { PhotoItem } from "../../action";
import {
  FullInfoSuggestionModal,
  type FullInfoRow,
} from "./components/GeneralInfo/FullInfoSuggestionModal/FullInfoSuggestionModal";
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
  const [generatingFullInfo, setGeneratingFullInfo] = useState(false);
  const [fullInfoProduct, setFullInfoProduct] = useState<GenerateProductType | null>(null);
  const [isFullInfoModalOpen, setIsFullInfoModalOpen] = useState(false);
  const [fullInfoClearName, setFullInfoClearName] = useState("");

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
      props.submitAction(values, typePriceValues, specificationValues, remains, photoValues).then((response) => {
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

  const handleGenerateFullInfo = () => {
    setGeneratingFullInfo(true);

    generateProductAction(values.name, values.code)
      .then((response) => {
        if (response.status === "success" && response.data) {
          if (response.data.error_message) {
            notificationAdapter.add(response.data.error_message, "error");
          }

          if (response.data.product) {
            setFullInfoClearName(response.data.clear_name || "");
            setFullInfoProduct(response.data.product);
            setIsFullInfoModalOpen(true);
          }
        } else {
          notificationAdapter.add(response.message || "Не удалось сгенерировать информацию", response.status);
        }
      })
      .finally(() => {
        setGeneratingFullInfo(false);
      });
  };

  const handleCloseFullInfoModal = () => {
    setIsFullInfoModalOpen(false);
    setFullInfoProduct(null);
  };

  const applySpecificationRow = (row: FullInfoRow) => {
    if (!fullInfoProduct?.specifications) return;

    const specIndex = Number(row.key.replace("spec_", ""));
    const spec = fullInfoProduct.specifications[specIndex];
    if (!spec) return;

    setSpecificationsValues((prev) => {
      const existing = prev.find((el) => el.label === spec.name);

      if (existing) {
        return prev.map((el) => (el.label === spec.name ? { ...el, value: spec.value } : el));
      }

      const specItem = props.specifications.find((s) => s.name === spec.name);
      const listId = prev.length > 0 ? Math.max(...prev.map((el) => el.listId)) + 1 : 1;

      return [...prev, { listId, specificationId: specItem?.id ?? null, label: spec.name, value: spec.value }];
    });
  };

  const handleApplyCategory = (suggestion: CategorySuggestion) => {
    if (suggestion.category_id) {
      handleSelectCategory(suggestion.category_id);
      return;
    }

    if (suggestion.create_categories && suggestion.create_categories.length > 0) {
      applyCategorySuggestionAction(suggestion.create_categories).then((response) => {
        if (response.status === "success" && response.data) {
          handleSelectCategory(response.data);
        } else {
          notificationAdapter.add(response.message || "Не удалось создать категорию", "error");
        }
      });
    }
  };

  const applyPhotosRow = () => {
    const urls = fullInfoProduct?.photos ?? [];
    if (urls.length === 0) return;

    setPhotoValues((prev) => {
      const existingUrls = new Set(prev.map((photo) => photo.url));
      const additions = urls
        .filter((url) => !existingUrls.has(url))
        .map((url, index) => ({
          created_at: "",
          id: Date.now() + index,
          parent_id: 0,
          parent_type: "product" as const,
          position: prev.length + index + 1,
          updated_at: "",
          url,
        }));

      return additions.length > 0 ? [...prev, ...additions] : prev;
    });
  };

  const handleApplyFullInfo = (rows: FullInfoRow[]) => {
    for (const row of rows) {
      if (!row.suggested) continue;

      if (row.group === "general" || row.group === "additional" || row.group === "seo") {
        handleChangeValues(row.key, row.suggested);
      } else if (row.group === "specifications") {
        applySpecificationRow(row);
      } else if (row.group === "photos") {
        applyPhotosRow();
      }
    }
  };

  const currentCategoryName = useMemo(
    () => getCategoryFullPath(props.categories, values.category_id),
    [props.categories, values.category_id],
  );

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
    <>
      <FullInfoSuggestionModal
        isOpen={isFullInfoModalOpen}
        product={fullInfoProduct}
        clearName={fullInfoClearName}
        currentValues={values}
        currentCategoryName={currentCategoryName}
        categories={props.categories}
        specificationValues={specificationValues}
        currentPhotoUrls={filterUrlPhoto.map((photo) => photo.url)}
        onClose={handleCloseFullInfoModal}
        onApply={handleApplyFullInfo}
        onApplyCategory={handleApplyCategory}
      />
      <section className={styles.addForm}>
        <ProductFormGeneralInfo
          categories={props.categories}
          values={values}
          errors={errors}
          handleChangeValues={handleChangeValues}
          onSelectCategory={handleSelectCategory}
          generatingFullInfo={generatingFullInfo}
          onGenerateFullInfo={handleGenerateFullInfo}
        />
        <ProductFormAdditionally values={values} errors={errors} handleChangeValues={handleChangeValues} />
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
          specifications={specificationValues.filter((el) => el.value.length > 0 && el.label.length > 0)}
          price={previewPrice}
          photos={filterUrlPhoto}
          setPhotos={setPhotoValues}
          brand_name={values.brand_name}
        />
        <ProductFormSeo
          values={values}
          errors={errors}
          handleChangeValues={handleChangeValues}
          categories={props.categories}
        />

        <div className={styles.actionForm}>
          <Button size="sm" variant="solid" variantColor="green" onClick={submitForm} type="button" disabled={pending}>
            {props.variant === "create" ? <AddSvg /> : <EditSvg />}
            {props.variant === "create" ? "Создать товар" : "Редактировать"}
          </Button>
        </div>
      </section>
    </>
  );
};

import type { PriceTypeModel } from "@/app/price-types/action";
import { fetchProductFormData } from "../action";
import { ProductForm } from "../components/ProductForm/ProductForm";
import { createProductAction } from "./action";
import styles from "./CreateProduct.module.css";

export default async function CreateProductPage() {
  const [rangesData, priceTypesData, priceFill, categories] = await fetchProductFormData();

  const priceTypes = priceTypesData.data?.priceTypes || [];
  const ranges = rangesData?.data || [];
  const priceFillData = priceFill?.data || [];
  const categoriesData = categories?.data || [];

  const getFillValuesAction = async (currentPrice: number) => {
    "use server";
    const updateFillValues: Record<string, number> = {};

    const currentRange = ranges.find(
      (range) => currentPrice >= range.price_from && currentPrice <= range.price_to,
    );

    for (let i = 0; i < priceTypes.length; i++) {
      const priceType = priceTypes[i];
      const rangeId = currentRange ? currentRange.id : null;

      const currentPriceFill = rangeId
        ? priceFillData.find(
            (el) => el.price_type_id === priceType.id && el.price_range_id === rangeId,
          )
        : null;

      const fillValue =
        currentPriceFill && currentPrice && currentPriceFill.percent
          ? Math.round(currentPrice * (1 + currentPriceFill.percent / 100))
          : 0;
      updateFillValues[priceType.id] = fillValue;
    }

    return { updateFillValues, isHasRange: Boolean(currentRange) };
  };

  const getInitialPriceValues = (priceTypes: PriceTypeModel[]) => {
    const initial: Record<string, string> = {};

    for (let i = 0; i < priceTypes.length; i++) {
      initial[priceTypes[i].id] = "";
    }
    return initial;
  };

  const initialPriceTypesValues = getInitialPriceValues(priceTypes);

  return (
    <div className={styles.root}>
      <ProductForm
        categories={categoriesData}
        variant="create"
        initialPriceTypesValues={initialPriceTypesValues}
        priceTypes={priceTypes}
        submitFormAction={createProductAction}
        getFillValuesAction={getFillValuesAction}
      />
    </div>
  );
}

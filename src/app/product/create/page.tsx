import { fetchPriceAutoFillPageData } from "@/app/price-auto-fill/action";
import type { PriceTypeModel } from "@/app/price-types/action";
import { ProductForm } from "../components/ProductForm/ProductForm";
import { createProductAction } from "./action";
import styles from "./CreateProduct.module.css";

export default async function CreateProductPage() {
  const [rangesData, priceTypesData, priceFill] = await fetchPriceAutoFillPageData();
  // console.log(rangesData, priceTypesData, priceFill);
  // console.log(rangesData.data);
  // console.log(priceTypesData.data?.priceTypes);
  // console.log(priceFill.data);

  const getInitialPriceValues = (priceTypes: PriceTypeModel[]) => {
    const initial: Record<string, string> = {};

    for (let i = 0; i < priceTypes.length; i++) {
      initial[priceTypes[i].id] = "";
    }
    return initial;
  };

  const initialPriceTypesValues = getInitialPriceValues(priceTypesData.data?.priceTypes || []);

  return (
    <div className={styles.root}>
      <ProductForm
        priceFill={priceFill.data || []}
        ranges={rangesData.data || []}
        initialPriceTypesValues={initialPriceTypesValues}
        priceTypes={priceTypesData.data?.priceTypes || []}
        submitFormAction={createProductAction}
      />
    </div>
  );
}

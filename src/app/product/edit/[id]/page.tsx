"use server";
import type { PriceTypeModel } from "@/app/price-types/action";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { createProductPriceAction, fetchProductFormEditData } from "../../action";
import { ProductForm } from "../../components/ProductForm/ProductForm";
import { createProductAction, type ProductFormPayloadValues } from "../../create/action";
import styles from "./EditProduct.module.css";

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, rangesData, priceTypesData, priceFill, categories, productPricesData] =
    await fetchProductFormEditData(id);

  const productPrices = productPricesData.data || [];
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
      const findProductPrice = productPrices.find((el) => el.price_type_id === priceTypes[i].id);
      initial[priceTypes[i].id] = findProductPrice ? String(findProductPrice.price) : "";
    }
    return initial;
  };

  const initialPriceTypesValues = getInitialPriceValues(priceTypesData.data?.priceTypes || []);

  const initialValues = {
    name: product?.data?.name ? product.data.name : "",
    code: product?.data?.code ? product.data.code : "",
    brand_id: product?.data?.brand_id ? product.data.brand_id : "",
    category_id: product?.data?.category_id ? product.data.category_id : null,
    description: product?.data?.description ? product.data.description : "",
    country: product?.data?.country ? product.data.country : "",
    product_type: product?.data?.product_type ? product.data.product_type : "",
    equipment: product?.data?.equipment ? product.data.equipment : "",
    weight: product?.data?.weight ? String(product?.data?.weight) : "",
    height: product?.data?.height ? String(product?.data?.height) : "",
    length: product?.data?.length ? String(product?.data?.length) : "",
    width: product?.data?.width ? String(product?.data?.width) : "",
    purchase_price: product?.data?.purchase_price ? String(product?.data?.purchase_price) : "",
  };

  const submitAction = async (
    payload: ProductFormPayloadValues,
    typePriceValues: Record<string, string>,
  ) => {
    "use server";

    let notification: { status: "error" | "success"; message: string } | null = null;
    let errors: Record<keyof ProductFormPayloadValues, string> | null = null;
    let updateValues: ProductFormPayloadValues | null = null;
    let updateTypesPricesValues: Record<string, string> | null = null;

    await createProductAction(payload).then(async (response) => {
      errors = response.errors;

      if (response.status === "success" && response.data) {
        const product_id = response.data.id;
        const productPricesPayload = [];

        for (const key in typePriceValues) {
          const price =
            typePriceValues[key] && typePriceValues[key].length > 0 && Number(typePriceValues[key]);
          if (typeof price === "number" && !Number.isNaN(price)) {
            productPricesPayload.push({
              product_id,
              price_type_id: Number(key),
              price,
            });
          }
        }

        for (let i = 0; i < productPricesPayload.length; i++) {
          const productPrice = await createProductPriceAction(productPricesPayload[i]);
          if (productPrice.status === "error") {
            notification = {
              status: "error",
              message: "Не удалось добавить цену для товара",
            };
            break;
          }
        }

        notification = {
          status: "success",
          message: "Товар удачно добавлен",
        };
        updateValues = {
          name: "",
          code: "",
          brand_id: "",
          category_id: null,
          description: "",
          country: "",
          product_type: "",
          equipment: "",
          weight: "",
          height: "",
          length: "",
          width: "",
          purchase_price: "",
        };
        updateTypesPricesValues = initialPriceTypesValues;
      } else {
        notification = {
          status: "error",
          message: "Ошибка при заполнении формы",
        };
      }
    });

    return { errors, notification, updateTypesPricesValues, updateValues };
  };

  return (
    <section className="page-wrapper">
      {productPricesData?.tokens && <UpdateToken tokens={productPricesData.tokens} />}
      <h2>Редактировать товар</h2>
      {product.status === "error" && product.message && <ErrorAlert message={product.message} />}
      {rangesData.status === "error" && rangesData.message && (
        <ErrorAlert message={rangesData.message} />
      )}
      {priceTypesData.status === "error" && priceTypesData.message && (
        <ErrorAlert message={priceTypesData.message} />
      )}
      {priceFill.status === "error" && priceFill.message && (
        <ErrorAlert message={priceFill.message} />
      )}
      {categories.status === "error" && categories.message && (
        <ErrorAlert message={categories.message} />
      )}
      {productPricesData.status === "error" && productPricesData.message && (
        <ErrorAlert message={productPricesData.message} />
      )}

      <div className={styles.root}>
        {product?.data && (
          <ProductForm
            initialValues={initialValues}
            submitAction={submitAction}
            categories={categoriesData}
            variant="edit"
            initialPriceTypesValues={initialPriceTypesValues}
            priceTypes={priceTypes}
            getFillValuesAction={getFillValuesAction}
          />
        )}
      </div>
    </section>
  );
}

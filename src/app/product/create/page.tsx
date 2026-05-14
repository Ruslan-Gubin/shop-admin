import type { PriceTypeModel } from "@/app/price-types/action";
import { createProductSpecificationAction, createSpecification } from "@/app/specifications/action";
import { createProductStock, type WarehouseModel } from "@/app/warehouses/action";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { createProductPriceAction, fetchProductFormData } from "../action";
import type { RemainsItem } from "../components/ProductForm/components/Stocks/ProductFormStocks";
import { ProductForm, type SpecificationValueItem } from "../components/ProductForm/ProductForm";
import { createProductAction, type ProductFormPayloadValues } from "./action";

export default async function CreateProductPage() {
  const [rangesData, priceTypesData, priceFill, categories, warehousesData, specificationsData] =
    await fetchProductFormData();

  const priceTypes = priceTypesData.data?.priceTypes || [];
  const ranges = rangesData?.data || [];
  const priceFillData = priceFill?.data || [];
  const categoriesData = categories?.data || [];
  const warehouses = warehousesData?.data?.warehouses || [];
  const specifications = specificationsData?.data?.specifications || [];

  const getInitialRemains = (warehouses: WarehouseModel[]) => {
    const result: RemainsItem[] = [];

    for (let i = 0; i < warehouses.length; i++) {
      result.push({
        id: warehouses[i].id,
        name: warehouses[i].name,
        quantity: "",
        in_stock: false,
      });
    }

    return result;
  };

  const initialRemains = getInitialRemains(warehouses);

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
  const initialValues = {
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

  const submitAction = async (
    payload: ProductFormPayloadValues,
    typePriceValues: Record<string, string>,
    specificationsValues: SpecificationValueItem[],
    remains: RemainsItem[],
  ) => {
    "use server";

    let notification: { status: "error" | "success"; message: string } | null = null;
    let errors: Record<keyof ProductFormPayloadValues, string> | null = null;
    let updateValues: ProductFormPayloadValues | null = null;
    let updateTypesPricesValues: Record<string, string> | null = null;
    let updateRemains: RemainsItem[] | null = null;

    await createProductAction(payload).then(async (response) => {
      errors = response.errors;

      if (response.status === "success" && response.data) {
        const product_id = response.data.id;

        for (const key in typePriceValues) {
          const price =
            typePriceValues[key] && typePriceValues[key].length > 0 && Number(typePriceValues[key]);
          if (typeof price === "number" && !Number.isNaN(price)) {
            await createProductPriceAction({ product_id, price_type_id: Number(key), price }).then(
              (response) => {
                if (response.status === "error") {
                  notification = {
                    status: "error",
                    message: "Не удалось добавить цену для товара",
                  };
                }
              },
            );
          }
        }

        for (let i = 0; i < specificationsValues.length; i++) {
          const specificationValue = specificationsValues[i];

          if (!specificationValue.value) continue;

          if (specificationValue.specificationId) {
            await createProductSpecificationAction({
              product_id,
              specification_id: specificationValue.specificationId,
              value: specificationValue.value,
            }).then((response) => {
              if (response === "error") {
                notification = {
                  status: "error",
                  message: "Не удалось добавить характеристику для товара",
                };
              }
            });
          } else if (!specificationValue.specificationId && specificationValue.label) {
            await createSpecification({ name: specificationValue.label, type: "text" }).then(
              (response) => {
                if (typeof response === "number") {
                  createProductSpecificationAction({
                    product_id,
                    specification_id: response,
                    value: specificationValue.value,
                  }).then((response) => {
                    if (response === "error") {
                      notification = {
                        status: "error",
                        message: "Не удалось добавить характеристику для товара",
                      };
                    }
                  });
                }
              },
            );
          }
        }

        for (let i = 0; i < remains.length; i++) {
          const currentRemains = remains[i];
          const quantity = Number(currentRemains.quantity);
          if (
            (typeof quantity === "number" && !Number.isNaN(quantity) && quantity > 0) ||
            currentRemains.in_stock
          ) {
            await createProductStock({
              quantity: quantity ? quantity : 0,
              in_stock: currentRemains.in_stock,
              product_id,
              warehouse_id: currentRemains.id,
            }).then((response) => {
              if (response === "error") {
                notification = {
                  status: "error",
                  message: "Не удалось добавить остаток на склад",
                };
              }
            });
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
        updateRemains = initialRemains;
      } else {
        notification = {
          status: "error",
          message: "Ошибка при заполнении формы",
        };
      }
    });

    return { errors, notification, updateTypesPricesValues, updateValues, updateRemains };
  };

  return (
    <section className="page-wrapper">
      {specificationsData?.tokens && <UpdateToken tokens={specificationsData.tokens} />}
      <h2>Создать товар</h2>

      {rangesData.status === "error" && rangesData.message && (
        <ErrorAlert message={rangesData.message} />
      )}
      {priceTypesData.status === "error" && priceTypesData.message && (
        <ErrorAlert message={priceTypesData.message} />
      )}
      {priceFill.status === "error" && priceFill.message && (
        <ErrorAlert message={priceFill.message} />
      )}
      {warehousesData.status === "error" && warehousesData.message && (
        <ErrorAlert message={warehousesData.message} />
      )}
      {categories.status === "error" && categories.message && (
        <ErrorAlert message={categories.message} />
      )}

      <ProductForm
        initialProductSpecificationValues={[
          { listId: 1, specificationId: null, label: "", value: "" },
        ]}
        initialRemains={initialRemains}
        specifications={specifications}
        initialValues={initialValues}
        submitAction={submitAction}
        categories={categoriesData}
        variant="create"
        initialPriceTypesValues={initialPriceTypesValues}
        priceTypes={priceTypes}
        getFillValuesAction={getFillValuesAction}
      />
    </section>
  );
}

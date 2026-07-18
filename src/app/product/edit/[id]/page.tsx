"use server";
import { revalidatePath } from "next/cache";
import type { PriceTypeModel } from "@/app/price-types/action";
import type { ProductSpecificationModel } from "@/app/specifications/action";
import type { ProductStockModel, WarehouseModel } from "@/app/warehouses/action";
import { getFillValues } from "@/shared/helpers/get-fill-values";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { fetchProductFormEditData } from "../../action";
import type { RemainsItem } from "../../components/ProductForm/components/Stocks/ProductFormStocks";
import { ProductForm, type SpecificationValueItem } from "../../components/ProductForm/ProductForm";
import type { ProductFormPayloadValues } from "../../create/action";
import {
  updateProductAction,
  updateProductPriceValues,
  updateProductSpecifications,
  updateProductStocks,
} from "./action";
import styles from "./EditProduct.module.css";

export default async function ProductEditPage(searchParams: { params: Promise<{ id: string }> }) {
  const params = await searchParams.params;
  const id = params.id;

  const [
    product,
    rangesData,
    priceTypesData,
    priceFill,
    categories,
    productPricesData,
    productSpecificationsData,
    specificationsData,
    warehousesData,
    productStocksData,
  ] = await fetchProductFormEditData(id);

  const productPrices = productPricesData.data || [];
  const priceTypes = priceTypesData.data?.priceTypes || [];
  const ranges = rangesData?.data || [];
  const priceFillData = priceFill?.data || [];
  const categoriesData = categories?.data || [];
  const productSpecifications = productSpecificationsData?.data || [];
  const warehouses = warehousesData?.data?.warehouses || [];
  const specifications = specificationsData?.data?.specifications || [];
  const productStocks = productStocksData?.data || [];

  const getInitialRemains = (warehouses: WarehouseModel[], productStocks: ProductStockModel[]) => {
    const result: RemainsItem[] = [];

    for (let i = 0; i < warehouses.length; i++) {
      const productStock = productStocks.find(
        (el) => el.warehouse && el.warehouse.id === warehouses[i].id,
      );

      const quantity =
        productStock && typeof productStock.quantity === "number"
          ? String(productStock.quantity)
          : "";
      const in_stock = productStock ? Boolean(productStock.in_stock) : false;

      result.push({
        id: warehouses[i].id,
        name: warehouses[i].name,
        quantity,
        in_stock,
      });
    }

    return result;
  };

  const initialRemains = getInitialRemains(warehouses, productStocks);

  const getFillValuesAction = async (currentPrice: number) => {
    "use server";
    return getFillValues(currentPrice, ranges, priceTypes, priceFillData);
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

  const getInitialProductSpecificationValues = (
    productSpecifications: ProductSpecificationModel[],
  ) => {
    const initial: SpecificationValueItem[] = [];

    for (let i = 0; i < productSpecifications.length; i++) {
      const currentProductSpecifications = productSpecifications[i];
      initial.push({
        listId: i + 1,
        specificationId: currentProductSpecifications.specification_id,
        label: currentProductSpecifications.specification.name,
        value: currentProductSpecifications.value,
      });
    }

    initial.push({
      listId: productSpecifications.length + 1,
      specificationId: null,
      label: "",
      value: "",
    });

    return initial;
  };

  const initialProductSpecificationValues =
    getInitialProductSpecificationValues(productSpecifications);

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
    specificationsValues: SpecificationValueItem[],
    remains: RemainsItem[],
  ) => {
    "use server";

    let notification: { status: "error" | "success"; message: string } | null = null;
    let errors: Record<keyof ProductFormPayloadValues, string> | null = null;

    await updateProductAction(payload, id).then(async (response) => {
      errors = response.errors;

      const product_id = String(id);

      if (response.status === "success" && product_id) {
        await updateProductPriceValues(typePriceValues, productPrices, product_id).then(
          (errorMessage) => {
            if (errorMessage) {
              notification = {
                status: "error",
                message: errorMessage,
              };
            }
          },
        );

        await updateProductSpecifications(
          specificationsValues,
          productSpecifications,
          product_id,
        ).then((errorMessage) => {
          if (errorMessage) {
            notification = {
              status: "error",
              message: errorMessage,
            };
          }
        });

        await updateProductStocks(remains, productStocks, product_id).then((errorMessage) => {
          if (errorMessage) {
            notification = {
              status: "error",
              message: errorMessage,
            };
          }
        });

        revalidatePath("product/edit");

        notification = {
          status: "success",
          message: "Товар удачно изменен",
        };
      } else {
        notification = {
          status: "error",
          message: "Ошибка при заполнении формы",
        };
      }
    });

    return {
      errors,
      notification,
      updateTypesPricesValues: null,
      updateValues: null,
      updateRemains: null,
    };
  };

  return (
    <section className="page-wrapper">
      {productStocksData?.tokens && <UpdateToken tokens={productStocksData.tokens} />}
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
      {productSpecificationsData.status === "error" && productSpecificationsData.message && (
        <ErrorAlert message={productSpecificationsData.message} />
      )}
      {productPricesData.status === "error" && productPricesData.message && (
        <ErrorAlert message={productPricesData.message} />
      )}
      {specificationsData.status === "error" && specificationsData.message && (
        <ErrorAlert message={specificationsData.message} />
      )}
      {warehousesData.status === "error" && warehousesData.message && (
        <ErrorAlert message={warehousesData.message} />
      )}
      {productStocksData.status === "error" && productStocksData.message && (
        <ErrorAlert message={productStocksData.message} />
      )}

      <div className={styles.root}>
        {product?.data && (
          <ProductForm
            initialRemains={initialRemains}
            initialProductSpecificationValues={initialProductSpecificationValues}
            specifications={specifications}
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

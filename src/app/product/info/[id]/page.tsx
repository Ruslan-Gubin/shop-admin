import Link from "next/link";
import type { PriceTypeModel } from "@/app/price-types/action";
import type { ProductSpecificationModel } from "@/app/specifications/action";
import type { ProductStockModel } from "@/app/warehouses/action";
import { Button } from "@/shared/ui/button-main/Button";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { PageHeader } from "@/shared/ui/page-header/PageHeader";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import type { ProductModel, ProductPriceModel } from "../../action";
import { ProductInfo } from "../../components/ProductInfo/ProductInfo";
import { fetchProductInfo } from "./action";

export default async function ProductInfoPage(searchParams: { params: Promise<{ id: string }> }) {
  const params = await searchParams.params;
  const id = params.id;

  const [
    totalSoldData,
    questionsData,
    product,
    priceTypesData,
    categoryData,
    productPricesData,
    productSpecificationsData,
    productStocksData,
  ] = await fetchProductInfo(id);

  const totalSold = totalSoldData.data || 0;
  const categories = categoryData.data || [];
  const productPrices = productPricesData.data || [];
  const priceTypes = priceTypesData.data?.priceTypes || [];
  const productSpecifications = productSpecificationsData?.data || [];
  const productStocks = productStocksData?.data || [];
  const questionsCount = questionsData.data?.totalCount || 0;

  let categoryName = "";

  const findCategory =
    categories.length > 0 && product.data
      ? categories.find((el) => el.id === product.data?.category_id)
      : null;

  if (findCategory?.name) {
    categoryName = findCategory.name;
  }

  const getStatisticsList = (
    product: ProductModel,
    productStocks: ProductStockModel[],
    totalSold: number,
  ) => {
    const statistics: { id: number; label: string; value: string }[] = [];

    const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    let available = 0;
    let reserved = 0;
    let accounting = true;

    for (let i = 0; i < productStocks.length; i++) {
      const productStock = productStocks[i];
      if (productStock.in_stock) {
        accounting = false;
      }
      if (productStock.quantity > 0) {
        available += productStock.quantity;
      }

      if (productStock.reserved > 0) {
        reserved += productStock.reserved;
      }
    }

    statistics.push({
      id: 1,
      label: "Доступно",
      value: accounting ? `${String(available - reserved)}` : "в наличии без учета",
    });
    statistics.push({
      id: 2,
      label: "Зарезервировано",
      value: String(reserved),
    });
    statistics.push({
      id: 3,
      label: "Учёт остатков",
      value: accounting ? "Да" : "Нет",
    });
    statistics.push({
      id: 4,
      label: "Продано",
      value: String(totalSold),
    });
    statistics.push({
      id: 5,
      label: "Просмотры",
      value: String(product.views),
    });

    if (product.created_at) {
      statistics.push({
        id: 6,
        label: "Создан",
        value: dateFormatter.format(new Date(product.created_at)),
      });
    }

    if (product.updated_at) {
      statistics.push({
        id: 7,
        label: "Обновлён",
        value: dateFormatter.format(new Date(product.updated_at)),
      });
    }

    return statistics;
  };

  const statisticsList =
    product.data && productStocks ? getStatisticsList(product.data, productStocks, totalSold) : [];

  const getSpecificationsList = (productSpecifications: ProductSpecificationModel[]) => {
    const prices: { id: number; label: string; value: string }[] = [];

    for (let i = 0; i < productSpecifications.length; i++) {
      const specification = productSpecifications[i];

      if (specification.specification?.name && specification?.value) {
        prices.push({
          id: specification.id,
          label: specification.specification.name,
          value: specification.value,
        });
      }
    }

    return prices;
  };

  const specificationsList = productSpecifications
    ? getSpecificationsList(productSpecifications)
    : [];

  const getPricesList = (productPrices: ProductPriceModel[], priceTypes: PriceTypeModel[]) => {
    const prices: { id: number; label: string; value: number }[] = [];

    for (let i = 0; i < productPrices.length; i++) {
      const productPrice = productPrices[i];
      const findType = priceTypes.find((el) => el.id === productPrice.price_type_id);

      if (typeof productPrice.price === "number" && productPrice.price > 0 && findType) {
        prices.push({ id: productPrice.id, label: findType.name, value: productPrice.price });
      }
    }

    return prices.sort((a, b) => a.value - b.value);
  };

  const pricesList = productPrices && priceTypes ? getPricesList(productPrices, priceTypes) : [];

  const getStocksList = (productStocks: ProductStockModel[]) => {
    const stocks: { id: number; label: string; value: string }[] = [];

    for (let i = 0; i < productStocks.length; i++) {
      const productStock = productStocks[i];

      if (productStock.warehouse?.name) {
        stocks.push({
          id: productStock.id,
          label: productStock.warehouse.name,
          value: productStock.in_stock ? "Без учета" : String(productStock.quantity),
        });
      }
    }

    return stocks;
  };

  const stocksList = productStocks ? getStocksList(productStocks) : [];

  return (
    <section className="page-wrapper">
      {productStocksData?.tokens && <UpdateToken tokens={productStocksData.tokens} />}
      <PageHeader title="Информация о товаре">
        <Link href={`/product/edit/${id}`}>
          <Button variant="solid" size="sm">
            Редактировать
          </Button>
        </Link>
      </PageHeader>
      {product.status === "error" && product.message && <ErrorAlert message={product.message} />}
      {questionsData.status === "error" && questionsData.message && (
        <ErrorAlert message={questionsData.message} />
      )}
      {priceTypesData.status === "error" && priceTypesData.message && (
        <ErrorAlert message={priceTypesData.message} />
      )}
      {categoryData.status === "error" && categoryData.message && (
        <ErrorAlert message={categoryData.message} />
      )}
      {productPricesData.status === "error" && productPricesData.message && (
        <ErrorAlert message={productPricesData.message} />
      )}
      {productSpecificationsData.status === "error" && productSpecificationsData.message && (
        <ErrorAlert message={productSpecificationsData.message} />
      )}
      {productStocksData.status === "error" && productStocksData.message && (
        <ErrorAlert message={productStocksData.message} />
      )}

      {product?.data && (
        <ProductInfo
          questionsCount={questionsCount}
          categoryName={categoryName}
          pricesList={pricesList}
          product={product.data}
          stocksList={stocksList}
          specificationsList={specificationsList}
          statisticsList={statisticsList}
        />
      )}
    </section>
  );
}

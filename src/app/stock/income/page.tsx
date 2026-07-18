import type { WarehouseModel } from "@/app/warehouses/action";
import { getFillValues } from "@/shared/helpers/get-fill-values";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { fetchIncomeFormData, submitIncomeAction } from "./action";
import { IncomeWizard } from "./components/IncomeWizard";

export default async function StockIncomePage() {
  const [warehousesData, categoriesData, priceTypesData, rangesData, priceFill] =
    await fetchIncomeFormData();

  const warehouses = warehousesData?.data?.warehouses || [];
  const categories = categoriesData?.data || [];
  const priceTypes = priceTypesData?.data?.priceTypes || [];
  const ranges = rangesData?.data || [];
  const priceFillData = priceFill?.data || [];

  const getFillValuesAction = async (currentPrice: number) => {
    "use server";
    return getFillValues(currentPrice, ranges, priceTypes, priceFillData);
  };

  const getInitialStocks = (warehouses: WarehouseModel[]) => {
    const stocks: Record<number, string> = {};

    for (let i = 0; i < warehouses.length; i++) {
      stocks[warehouses[i].id] = "";
    }

    return stocks;
  };

  const initialStocks = getInitialStocks(warehouses);

  return (
    <section className="page-wrapper">
      {warehousesData?.tokens && <UpdateToken tokens={warehousesData.tokens} />}
      <h2>Приход товара</h2>

      {warehousesData.status === "error" && warehousesData.message && (
        <ErrorAlert message={warehousesData.message} />
      )}
      {categoriesData.status === "error" && categoriesData.message && (
        <ErrorAlert message={categoriesData.message} />
      )}
      {priceTypesData.status === "error" && priceTypesData.message && (
        <ErrorAlert message={priceTypesData.message} />
      )}

      <IncomeWizard
        initialStocks={initialStocks}
        warehouses={warehouses}
        categories={categories}
        priceTypes={priceTypes}
        ranges={ranges}
        priceFill={priceFillData}
        submitIncomeAction={submitIncomeAction}
        getFillValuesAction={getFillValuesAction}
      />
    </section>
  );
}

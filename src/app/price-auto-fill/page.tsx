"use server";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import {
  createPriceFillAction,
  createRangeAction,
  deletePriceFillAction,
  deleteRangeAction,
  fetchPriceAutoFillPageData,
  updatePriceFillAction,
  updateRangeAction,
} from "./action";
import { PriceAutoFillTableWrapper } from "./components/PriceAutoFillTableWrapper/PriceAutoFillTableWrapper";

export default async function PriceAutoFillPage(req: { searchParams: Promise<{ range: string }> }) {
  const { range } = await req.searchParams;

  const [rangesData, priceTypesData, priceFill] = await fetchPriceAutoFillPageData(range);

  return (
    <section className="page-wrapper">
      <h2>Автозаполнение цен — настройка процентов наценки по диапазонам закупочной цены.</h2>

      {priceFill?.tokens && <UpdateToken tokens={priceFill.tokens} />}

      {priceTypesData.status === "error" && priceTypesData.message && (
        <ErrorAlert message={priceTypesData.message} />
      )}

      {rangesData.status === "error" && rangesData.message && (
        <ErrorAlert message={rangesData.message} />
      )}

      {priceFill.status === "error" && priceFill.message && (
        <ErrorAlert message={priceFill.message} />
      )}

      <PriceAutoFillTableWrapper
        priceTypes={priceTypesData?.data?.priceTypes || []}
        ranges={rangesData.data || []}
        priceFill={priceFill.data || []}
        range={range}
        createRangeAction={createRangeAction}
        updateRangeAction={updateRangeAction}
        deleteRangeAction={deleteRangeAction}
        createPriceFillAction={createPriceFillAction}
        updatePriceFillAction={updatePriceFillAction}
        deletePriceFillAction={deletePriceFillAction}
      />
    </section>
  );
}

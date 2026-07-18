import type { PriceFillModel, RangeModel } from "@/app/price-auto-fill/action";
import type { PriceTypeModel } from "@/app/price-types/action";

export const getFillValues = (
  currentPrice: number,
  ranges: RangeModel[],
  priceTypes: PriceTypeModel[],
  priceFill: PriceFillModel[],
): { updateFillValues: Record<number, number>; isHasRange: boolean } => {
  const updateFillValues: Record<number, number> = {};

  const currentRange = ranges.find(
    (range) => currentPrice >= range.price_from && currentPrice <= range.price_to,
  );

  for (let i = 0; i < priceTypes.length; i++) {
    const priceType = priceTypes[i];
    const rangeId = currentRange ? currentRange.id : null;

    const currentPriceFill = rangeId
      ? priceFill.find((el) => el.price_type_id === priceType.id && el.price_range_id === rangeId)
      : null;

    const fillValue =
      currentPriceFill && currentPrice && currentPriceFill.percent
        ? Math.round(currentPrice * (1 + currentPriceFill.percent / 100))
        : 0;
    updateFillValues[priceType.id] = fillValue;
  }

  return { updateFillValues, isHasRange: Boolean(currentRange) };
};

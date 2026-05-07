import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import type { PriceFillModel, RangeModel } from "@/app/price-auto-fill/action";
import type { PriceTypeModel } from "@/app/price-types/action";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Button } from "@/shared/ui/button-main/Button";
import { Input } from "@/shared/ui/input-main/Input";
import { PriceAutoFillSvg } from "@/views/LayoutLeftSide/svg/PriceAutoFillSvg";
import styles from "./ProductFormPrices.module.css";

type Props = {
  priceTypes: PriceTypeModel[];
  ranges: RangeModel[];
  initialPriceTypesValues: Record<string, string>;
  priceFill: PriceFillModel[];
};

export const ProductFormPrices = (props: Props) => {
  const [purchasePrice, setPurchasePrice] = useState<string>("");
  const [typePriceValues, setTypePriceValues] = useState<Record<string, string>>({});
  const [fillValues, setFillValues] = useState<Record<string, number>>({});
  const [rangeNotFound, setRangeNotFound] = useState<boolean>(false);

  useLayoutEffect(() => {
    setTypePriceValues(props.initialPriceTypesValues);
    setPurchasePrice("");
  }, []);

  const handleAutoFillAll = () => {
    const updateTypePriceValues: Record<string, string> = {};

    for (const key in typePriceValues) {
      const fillValue = fillValues[key];
      updateTypePriceValues[key] = fillValue ? String(fillValue) : typePriceValues[key];
    }
    setTypePriceValues(updateTypePriceValues);
  };

  const handleAutoFill = (typeId: number) => {
    const fillValue = fillValues[typeId];

    if (fillValue) {
      setTypePriceValues((prev) => ({ ...prev, [typeId]: String(fillValue) }));
    }
  };

  const handleChangeTypePriceValue = (id: number, value: string) => {
    setTypePriceValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleChangePurchasePrice = (value: string) => {
    setPurchasePrice(value);
    const currentPrice = Number(value);

    if (currentPrice) {
      const currentRange = props.ranges.find(
        (range) => currentPrice >= range.price_from && currentPrice <= range.price_to,
      );
      if (currentRange) {
        const rangeId = currentRange.id;
        const updateFillValues: Record<string, number> = {};

        for (let i = 0; i < props.priceTypes.length; i++) {
          const priceType = props.priceTypes[i];
          const currentPriceFill = props.priceFill.find(
            (el) => el.price_type_id === priceType.id && el.price_range_id === rangeId,
          );
          const fillValue =
            currentPriceFill && currentPrice && currentPriceFill.percent
              ? Math.round(currentPrice * (1 + currentPriceFill.percent / 100))
              : 0;
          updateFillValues[priceType.id] = fillValue;
        }
        setFillValues(updateFillValues);
      }
      setRangeNotFound(Boolean(currentRange));
    } else {
      setRangeNotFound(false);
    }
  };

  const isErrorRangeText =
    purchasePrice.length > 0 &&
    !Number.isNaN(purchasePrice) &&
    Number(purchasePrice) > 0 &&
    !rangeNotFound;

  return (
    <section className={styles.root}>
      <h3>Цены</h3>

      <div className={styles.purchaseRow}>
        <div className={styles.purchaseField}>
          <Input
            value={purchasePrice}
            onChange={(e) => handleChangePurchasePrice(e.target.value)}
            name="purchasePrice"
            id="purchasePrice"
            variant="outlined"
            variantSize="sm"
            placeholder="Закупочная цена"
            label="Закупочная цена"
            type="number"
            rightIcon={<CancelSvg />}
            onClickRightIcon={() => setPurchasePrice("")}
          />
        </div>

        <Button
          size="sm"
          variant="solid"
          variantColor="green"
          disabled={purchasePrice.length === 0 || !rangeNotFound}
          onClick={handleAutoFillAll}
        >
          <PriceAutoFillSvg />
          <p className={styles.fillAllButtonText}>Заполнить все типы цен</p>
        </Button>
      </div>

      <div className={styles.instruction}>
        {isErrorRangeText ? (
          <span className={styles.rangeTextError}>
            Для этой закупочной цены не настроен{" "}
            <Link href="/price-auto-fill" className={styles.instructionLink}>
              диапазон.
            </Link>{" "}
          </span>
        ) : (
          <span>
            Можно ввести вручную или автозаполнить если настроен{" "}
            <Link href="/price-auto-fill" className={styles.instructionLink}>
              диапазон
            </Link>{" "}
            для закупочной цены.{" "}
          </span>
        )}
        <span>
          Чтобы добавить новый тип цены, перейдите на страницу{" "}
          <Link href="/price-types" className={styles.instructionLink}>
            управления типами цен
          </Link>
          .
        </span>
      </div>

      <ul className={styles.pricesGrid}>
        {props.priceTypes.map((priceType) => (
          <li key={priceType.id}>
            <Input
              leftIcon={
                fillValues[priceType.id] && !!rangeNotFound ? (
                  <PriceAutoFillSvg fill="#A3A3A3" />
                ) : null
              }
              onClickLeftIcon={
                fillValues[priceType.id] && !!rangeNotFound
                  ? () => handleAutoFill(priceType.id)
                  : undefined
              }
              name={`price_${priceType.name}`}
              id={`price_${priceType.id}`}
              variant="outlined"
              variantSize="sm"
              placeholder={priceType.name}
              label={priceType.name}
              type="number"
              rightIcon={<CancelSvg />}
              onClickRightIcon={() => handleChangeTypePriceValue(priceType.id, "")}
              onChange={(e) => handleChangeTypePriceValue(priceType.id, e.target.value)}
              value={typePriceValues[priceType.id] ?? ""}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};

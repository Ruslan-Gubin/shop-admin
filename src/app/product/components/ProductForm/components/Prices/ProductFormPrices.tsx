import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import type { PriceTypeModel } from "@/app/price-types/action";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Button } from "@/shared/ui/button-main/Button";
import { Input } from "@/shared/ui/input-main/Input";
import { PriceAutoFillSvg } from "@/views/LayoutLeftSide/svg/PriceAutoFillSvg";
import { FormSection } from "@/widgets/form-section/FormSection";
import styles from "./ProductFormPrices.module.css";

type Props = {
  priceTypes: PriceTypeModel[];
  purchase_price: string;
  handleChangeValues: (field: string, value: string) => void;
  typePriceValues: Record<string, string>;
  setTypePriceValues: (update: Record<string, string>) => void;
  getFillValuesAction: (
    currentPrice: number,
  ) => Promise<{ updateFillValues: Record<string, number>; isHasRange: boolean }>;
};

export const ProductFormPrices = (props: Props) => {
  const [fillValues, setFillValues] = useState<Record<string, number>>({});
  const [rangeNotFound, setRangeNotFound] = useState<boolean>(false);

  const handleAutoFillAll = () => {
    const updateTypePriceValues: Record<string, string> = {};

    for (const key in props.typePriceValues) {
      const fillValue = fillValues[key];
      updateTypePriceValues[key] = fillValue ? String(fillValue) : props.typePriceValues[key];
    }
    props.setTypePriceValues(updateTypePriceValues);
  };

  const handleAutoFill = (typeId: number) => {
    const fillValue = fillValues[typeId];

    if (fillValue) {
      props.setTypePriceValues({ ...props.typePriceValues, [typeId]: String(fillValue) });
    }
  };

  const handleChangeTypePriceValue = (id: number, value: string) => {
    props.setTypePriceValues({ ...props.typePriceValues, [id]: value });
  };

  const handleChangePurchasePrice = (value: string) => {
    props.handleChangeValues("purchase_price", value);
    const currentPrice = Number(value);

    if (currentPrice) {
      props.getFillValuesAction(currentPrice).then((response) => {
        setFillValues(response.updateFillValues);
        setRangeNotFound(response.isHasRange);
      });
    } else {
      setRangeNotFound(false);
    }
  };

  useLayoutEffect(() => {
    handleChangePurchasePrice(props.purchase_price);
  }, []);

  const isErrorRangeText =
    props.purchase_price.length > 0 &&
    !Number.isNaN(props.purchase_price) &&
    Number(props.purchase_price) > 0 &&
    !rangeNotFound;

  return (
    <FormSection title="Цены">
      <div className={styles.purchaseRow}>
        <div className={styles.purchaseField}>
          <Input
            value={props.purchase_price}
            name="purchase_price"
            id="purchase_price"
            variant="outlined"
            variantSize="sm"
            placeholder="Закупочная цена"
            label="Закупочная цена"
            type="number"
            rightIcon={<CancelSvg />}
            onChange={(e) => handleChangePurchasePrice(e.target.value)}
            onClickRightIcon={() => handleChangePurchasePrice("")}
          />
        </div>

        <Button
          size="sm"
          variant="solid"
          variantColor="green"
          disabled={props.purchase_price.length === 0 || !rangeNotFound}
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
            <Link href="/price-auto-fill" className="instruction-link">
              диапазон.
            </Link>{" "}
          </span>
        ) : (
          <span>
            Можно ввести вручную или автозаполнить если настроен{" "}
            <Link href="/price-auto-fill" className="instruction-link">
              диапазон
            </Link>{" "}
            для закупочной цены.{" "}
          </span>
        )}
        <span>
          Чтобы добавить новый тип цены, перейдите на страницу{" "}
          <Link href="/price-types" className="instruction-link">
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
                  <PriceAutoFillSvg
                    fill="#A3A3A3"
                    title={fillValues[priceType.id] ? String(fillValues[priceType.id]) : undefined}
                  />
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
              value={props.typePriceValues[priceType.id] ?? ""}
            />
          </li>
        ))}
      </ul>
    </FormSection>
  );
};

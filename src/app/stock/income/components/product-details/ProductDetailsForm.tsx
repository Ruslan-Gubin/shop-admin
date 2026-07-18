import { useLayoutEffect, useState } from "react";
import type { PriceTypeModel } from "@/app/price-types/action";
import type { ProductModel } from "@/app/product/action";
import type { WarehouseModel } from "@/app/warehouses/action";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Button } from "@/shared/ui/button-main/Button";
import { Input } from "@/shared/ui/input-main/Input";
import { PriceAutoFillSvg } from "@/views/LayoutLeftSide/svg/PriceAutoFillSvg";
import { fetchProductPrices, type IncomeItem } from "../../action";
import styles from "./ProductDetailsForm.module.css";

type Props = {
  search: string;
  product: ProductModel | null;
  isNew: boolean;
  warehouses: WarehouseModel[];
  priceTypes: PriceTypeModel[];
  initialStocks: Record<number, string>;
  getFillValuesAction: (
    currentPrice: number,
  ) => Promise<{ updateFillValues: Record<string, number>; isHasRange: boolean }>;
  onConfirm: (item: IncomeItem) => void;
  onCancel: () => void;
};

export const ProductDetailsForm = (props: Props) => {
  const [code, setCode] = useState<string>("");
  const [purchasePrice, setPurchasePrice] = useState<string>("");
  const [priceValues, setPriceValues] = useState<Record<string, string>>({});

  const [fillValues, setFillValues] = useState<Record<string, number>>({});
  const [rangeFound, setRangeFound] = useState(false);

  const [stocks, setStocks] = useState<Record<number, string>>(props.initialStocks);

  useLayoutEffect(() => {
    if (props.product) {
      setCode(props.product.code ? String(props.product.code) : "");
      setPurchasePrice(props.product?.purchase_price ? String(props.product.purchase_price) : "");

      if (props.priceTypes.length > 0) {
        fetchProductPrices(props.product.id).then((response) => {
          if (response.status === "success" && response.data) {
            const initialPrices: Record<string, string> = {};
            for (const priceType of props.priceTypes) {
              const priceItem = response.data.find((p) => p.price_type_id === priceType.id);

              initialPrices[priceType.id] = priceItem ? String(priceItem.price) : "";
            }
            setPriceValues(initialPrices);
          }
        });
      }

      if (props.product.purchase_price) {
        props.getFillValuesAction(props.product.purchase_price).then((response) => {
          setFillValues(response.updateFillValues);
          setRangeFound(response.isHasRange);
        });
      }
    } else {
      const initialPrices: Record<string, string> = {};

      for (const priceType of props.priceTypes) {
        initialPrices[priceType.id] = "";
      }

      setPriceValues(initialPrices);

      setFillValues({});
      setRangeFound(false);
      setCode("");
      setPurchasePrice("");
    }

    setStocks(props.initialStocks);
  }, [props.product, props.priceTypes, props.initialStocks]);

  const handlePurchasePriceChange = (value: string) => {
    setPurchasePrice(value);
    const currentPrice = Number(value);

    if (currentPrice) {
      props.getFillValuesAction(currentPrice).then((response) => {
        setFillValues(response.updateFillValues);
        setRangeFound(response.isHasRange);
      });
    } else {
      setRangeFound(false);
    }
  };

  const handleAutoFillAll = () => {
    const updateValues: Record<string, string> = {};

    for (const key in priceValues) {
      const fillValue = fillValues[key];
      updateValues[key] = fillValue ? String(fillValue) : priceValues[key];
    }

    setPriceValues(updateValues);
  };

  const handleAutoFill = (typeId: number) => {
    const fillValue = fillValues[typeId];

    if (fillValue) {
      setPriceValues((prev) => ({ ...prev, [typeId]: String(fillValue) }));
    }
  };

  const handleChangePriceValue = (id: number, value: string) => {
    setPriceValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleChangeStock = (warehouseId: number, value: string) => {
    setStocks((prev) => ({ ...prev, [warehouseId]: value }));
  };

  const handleConfirm = () => {
    const tempId = `income_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const updatePriceValues: Record<string, number> = {};

    for (const key in priceValues) {
      const value = priceValues[key];
      updatePriceValues[key] = !Number.isNaN(value) ? Number(value) : 0;
    }

    const updateStocks: Record<string, number> = {};

    for (const key in stocks) {
      const value = stocks[key];
      updateStocks[key] = !Number.isNaN(value) ? Number(value) : 0;
    }

    props.onConfirm({
      tempId,
      productId: props.product?.id ?? null,
      name: props.search,
      code,
      purchasePrice: purchasePrice ? Number(purchasePrice) : 0,
      priceValues: updatePriceValues,
      stocks: updateStocks,
    });
  };

  const hasStocks = Object.values(stocks).some((v) => Number(v) > 0);
  const disabled = !hasStocks || (props.isNew && !props.search);

  return (
    <div className={styles.formContent}>
      <div className={styles.fieldRow}>
        <Input
          name="product-code"
          id="product-code"
          variant="outlined"
          variantSize="sm"
          label="Штрих-код"
          type="text"
          value={code}
          autoComplete="off"
          onChange={(e) => setCode(e.target.value)}
          rightIcon={props.isNew ? <CancelSvg /> : null}
          onClickRightIcon={props.isNew ? () => setCode("") : undefined}
          disabled={!props.isNew}
        />
      </div>

      <div className={styles.pricesSection}>
        <h3>Цены</h3>
        <div className={styles.purchaseRow}>
          <div className={styles.purchaseField}>
            <Input
              name="purchase_price"
              id="purchase_price"
              variant="outlined"
              variantSize="sm"
              label="Закупочная цена"
              type="number"
              value={purchasePrice}
              onChange={(e) => handlePurchasePriceChange(e.target.value)}
              rightIcon={<CancelSvg />}
              onClickRightIcon={() => handlePurchasePriceChange("")}
            />
          </div>

          <Button
            size="sm"
            variant="solid"
            variantColor="green"
            disabled={purchasePrice.length === 0 || !rangeFound}
            onClick={handleAutoFillAll}
          >
            <PriceAutoFillSvg />
            <span className={styles.fillAllButtonText}>Заполнить все цены</span>
          </Button>
        </div>

        <div className={styles.pricesGrid}>
          {props.priceTypes.map((priceType) => (
            <div key={priceType.id} className={styles.priceField}>
              <Input
                leftIcon={
                  fillValues[priceType.id] && rangeFound ? (
                    <PriceAutoFillSvg
                      fill="#A3A3A3"
                      title={
                        fillValues[priceType.id] ? String(fillValues[priceType.id]) : undefined
                      }
                    />
                  ) : null
                }
                onClickLeftIcon={
                  fillValues[priceType.id] && rangeFound
                    ? () => handleAutoFill(priceType.id)
                    : undefined
                }
                name={`price_${priceType.id}`}
                id={`price_${priceType.id}`}
                variant="outlined"
                variantSize="sm"
                label={priceType.name}
                type="number"
                rightIcon={<CancelSvg />}
                onClickRightIcon={() => handleChangePriceValue(priceType.id, "")}
                onChange={(e) => handleChangePriceValue(priceType.id, e.target.value)}
                value={priceValues[priceType.id] ?? ""}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.stocksSection}>
        <h3>Остатки</h3>
        <ul className={styles.stocksGrid}>
          {props.warehouses.map((warehouse) => (
            <div key={warehouse.id} className={styles.stockField}>
              <Input
                name={`stock_${warehouse.id}`}
                id={`stock_${warehouse.id}`}
                variant="outlined"
                variantSize="sm"
                label={warehouse.name}
                type="number"
                value={stocks[warehouse.id] ?? ""}
                onChange={(e) => handleChangeStock(warehouse.id, e.target.value)}
                rightIcon={<CancelSvg />}
                onClickRightIcon={() => handleChangeStock(warehouse.id, "")}
              />
            </div>
          ))}
        </ul>
      </div>
      <footer className={styles.footer}>
        <Button onClick={props.onCancel} size="sm">
          Отмена
        </Button>
        <Button disabled={disabled} variantColor="green" size="sm" onClick={handleConfirm}>
          Сохранить
        </Button>
      </footer>
    </div>
  );
};

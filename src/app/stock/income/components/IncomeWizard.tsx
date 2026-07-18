"use client";
import { useState, useTransition } from "react";
import type { CategoryModel } from "@/app/category/action";
import type { PriceFillModel, RangeModel } from "@/app/price-auto-fill/action";
import type { PriceTypeModel } from "@/app/price-types/action";
import type { WarehouseModel } from "@/app/warehouses/action";
import { notificationAdapter } from "@/stores/notification/adapter";
import type { IncomeItem } from "../action";
import styles from "./IncomeWizard.module.css";
import { IncomeList } from "./income-list/IncomeList";
import { ProductSearchSection } from "./product-search-section/ProductSearchSection";

type Props = {
  initialStocks: Record<number, string>;
  warehouses: WarehouseModel[];
  categories: CategoryModel[];
  priceTypes: PriceTypeModel[];
  ranges: RangeModel[];
  priceFill: PriceFillModel[];
  submitIncomeAction: (items: IncomeItem[]) => Promise<{
    status: "success" | "error";
    message: string;
    createdProductIds: number[];
  }>;
  getFillValuesAction: (
    currentPrice: number,
  ) => Promise<{ updateFillValues: Record<string, number>; isHasRange: boolean }>;
};

export const IncomeWizard = (props: Props) => {
  const [disabled, transition] = useTransition();
  const [items, setItems] = useState<IncomeItem[]>([]);

  const handleAddItem = (item: IncomeItem) => {
    setItems((prev) => {
      const duplicateIndex = prev.findIndex((existing) =>
        item.productId
          ? existing.productId === item.productId
          : existing.code === item.code && item.code !== "",
      );

      if (duplicateIndex !== -1) {
        const updated = [...prev];
        updated[duplicateIndex] = item;
        return updated;
      }

      return [...prev, item];
    });
  };

  const handleDeleteItem = (tempId: string) => {
    setItems((prev) => prev.filter((i) => i.tempId !== tempId));
  };

  const handleSubmit = async () => {
    transition(() => {
      props.submitIncomeAction(items).then((response) => {
        if (response.status === "success") {
          setItems([]);
        }

        notificationAdapter.add(response.message || "", response.status);
      });
    });
    props.submitIncomeAction(items);
  };

  return (
    <div className={styles.root}>
      <ProductSearchSection
        initialStocks={props.initialStocks}
        priceTypes={props.priceTypes}
        warehouses={props.warehouses}
        getFillValuesAction={props.getFillValuesAction}
        onAddItem={handleAddItem}
        categories={props.categories}
      />
      <IncomeList
        items={items}
        onDeleteItem={handleDeleteItem}
        onSubmit={handleSubmit}
        isSubmitting={disabled}
      />
    </div>
  );
};

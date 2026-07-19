import { useState } from "react";
import type { CategoryModel } from "@/app/category/action";
import type { PriceTypeModel } from "@/app/price-types/action";
import type { ProductModel } from "@/app/product/action";
import type { WarehouseModel } from "@/app/warehouses/action";
import { Button } from "@/shared/ui/button-main/Button";
import { CategorySvg } from "@/views/LayoutLeftSide/svg/CategorySvg";
import { FormInstruction } from "@/widgets/form-instruction/FormInstruction";
import { FormSection } from "@/widgets/form-section/FormSection";
import type { IncomeItem } from "../../action";
import { ModalCatalog } from "../modal-catalog/ModalCatalog";
import { ProductDetailsForm } from "../product-details/ProductDetailsForm";
import { SearchResults } from "../search-results/SearchResults";
import styles from "./ProductSearchSection.module.css";

type EditingProductInfo = {
  product: ProductModel | null;
  isNew: boolean;
};

type Props = {
  initialStocks: Record<number, string>;
  categories: CategoryModel[];
  warehouses: WarehouseModel[];
  priceTypes: PriceTypeModel[];
  onAddItem: (item: IncomeItem) => void;
  getFillValuesAction: (
    currentPrice: number,
  ) => Promise<{ updateFillValues: Record<string, number>; isHasRange: boolean }>;
};

export const ProductSearchSection = (props: Props) => {
  const [search, setSearch] = useState<string>("");
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<EditingProductInfo | null>(null);

  const selectedProduct = (product: ProductModel) => {
    setSearch(product.name);
    setEditingItem({ product, isNew: false });
  };

  const handleCreateNew = () => {
    setEditingItem({ product: null, isNew: true });
  };

  const handleSelectCategoryProduct = (product: ProductModel) => {
    if (product) {
      selectedProduct(product);
      setIsCatalogOpen(false);
    }
  };

  const handleAddProduct = (item: IncomeItem) => {
    props.onAddItem(item);
    setEditingItem(null);
    setSearch("");
  };

  return (
    <>
      {isCatalogOpen && (
        <ModalCatalog
          categories={props.categories}
          onSelectProduct={handleSelectCategoryProduct}
          onClose={() => setIsCatalogOpen(false)}
        />
      )}
      <FormSection title="Поиск товара">
        <FormInstruction>
          {props.categories.length > 0 ? (
            <span>
              Введите штрихкод или название товара, либо выберите из{" "}
              <button
                onClick={() => setIsCatalogOpen(true)}
                type="button"
                className={styles.buttonCatalog}
              >
                каталога
              </button>
              .
            </span>
          ) : (
            <span>Введите штрихкод или название товара.</span>
          )}
        </FormInstruction>

        <div className={styles.searchRow}>
          <SearchResults
            onChangeSearch={setSearch}
            search={search}
            onSelect={selectedProduct}
            onCreateNew={handleCreateNew}
          />
          {props.categories.length > 0 && (
            <Button
              customClass={styles.buttonInputLineCatalog}
              size="sm"
              variant="solid"
              variantColor="blue"
              onClick={() => setIsCatalogOpen(true)}
            >
              <CategorySvg />
              Каталог
            </Button>
          )}
        </div>

        {editingItem && (
          <ProductDetailsForm
            search={search}
            initialStocks={props.initialStocks}
            product={editingItem.product}
            isNew={editingItem.isNew}
            warehouses={props.warehouses}
            priceTypes={props.priceTypes}
            getFillValuesAction={props.getFillValuesAction}
            onConfirm={handleAddProduct}
            onCancel={() => {
              setEditingItem(null);
              setSearch("");
            }}
          />
        )}
      </FormSection>
    </>
  );
};

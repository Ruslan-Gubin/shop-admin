"use client";
import { useRouter } from "next/navigation";
import { useWindowSize } from "@/shared/hooks/useWindowSize";
import { MainMobileTable } from "@/widgets/main-mobile-table/MainMobileTable";
import { MainTable, type RenderTableOptions } from "@/widgets/main-table/MainTable";
import type { IncompleteProductItem } from "../../action";

type Props = {
  products: IncompleteProductItem[];
  isLoadMoreDisabled: boolean;
  patch: string;
  searchParams: { [key: string]: string | string[] | undefined };
};

export const IncompleteTableWrapper = (props: Props) => {
  const router = useRouter();
  const { isMobile, isMounted } = useWindowSize();

  const handleEditRouter = (item: IncompleteProductItem) => {
    router.push(`/product/edit/${item.id}`);
  };

  const typeConfig = { status: { key: "status", value: "message" } };

  const tableOptions: RenderTableOptions<IncompleteProductItem>[] = [
    { key: "id" },
    { key: "name" },
    { key: "category", type: "status", typeConfig },
    { key: "price", type: "status", typeConfig },
    { key: "photos", type: "status", typeConfig },
    { key: "specifications", type: "status", typeConfig },
    { key: "stocks", type: "status", typeConfig },
    { key: "dimensions", type: "status", typeConfig },
    { key: "product_type", type: "status", typeConfig },
    { key: "country", type: "status", typeConfig },
    { key: "equipment", type: "status", typeConfig },
  ];

  const headerRowLabels = [
    "ID",
    "Название",
    "Категория",
    "Цена",
    "Фото",
    "Характеристики",
    "Остатки",
    "Габариты",
    "Вид товара",
    "Страна",
    "Состав",
  ];

  return (
    <div>
      {isMounted && !isMobile && props.products && props.products.length > 0 && (
        <MainTable
          data={props.products}
          headerRowLabels={headerRowLabels}
          stickyFirstColumn
          stickyActionColumn
          gridTemplateColumns="65px minmax(150px, 1fr) minmax(130px, 180px) minmax(130px, 180px) minmax(130px, 180px) minmax(130px, 180px) minmax(100px, 130px) minmax(100px, 130px) minmax(100px, 130px) minmax(100px, 130px) minmax(100px, 130px) 32px"
          tableOptions={tableOptions}
          actions={[{ label: "Редактировать", action: handleEditRouter }]}
        />
      )}

      {isMounted && isMobile && props.products && props.products.length > 0 && (
        <MainMobileTable
          titleKey="name"
          data={props.products}
          headerRowLabels={headerRowLabels}
          headerRowWidth={[
            "38px",
            "140px",
            "100px",
            "80px",
            "100px",
            "120px",
            "80px",
            "100px",
            "100px",
            "80px",
            "80px",
          ]}
          tableOptions={tableOptions}
          searchParams={props.searchParams}
          isLoadMoreDisabled={props.isLoadMoreDisabled}
          patch={props.patch}
          actions={[{ label: "Редактировать", action: handleEditRouter }]}
        />
      )}
    </div>
  );
};

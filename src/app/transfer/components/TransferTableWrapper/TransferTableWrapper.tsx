"use client";
import { useRouter } from "next/navigation";
import { useWindowSize } from "@/shared/hooks/useWindowSize";
import {
  transferStatusTranslations,
  transferTypeTranslations,
} from "@/shared/translate/transform-translate";
import type { ResponseData } from "@/shared/types/response";
import { MainMobileTable } from "@/widgets/main-mobile-table/MainMobileTable";
import type { RenderTableOptions } from "@/widgets/main-table/MainTable";
import { MainTable } from "@/widgets/main-table/MainTable";
import type { TransferModelTable } from "../../action";

type Props = {
  transfers: TransferModelTable[];
  searchParams: { [key: string]: string | string[] | undefined };
  isLoadMoreDisabled: boolean;
  patch: string;
  fetchTableElementAction: (id: string) => Promise<ResponseData<TransferModelTable>>;
};

export const TransferTableWrapper = (props: Props) => {
  const router = useRouter();
  const { isMobile, isMounted } = useWindowSize();

  const handleInfoRouter = (item: TransferModelTable) => {
    if (item.id) {
      router.push(`/transfer/info/${item.id}`);
    }
  };

  const handleOrderRouter = (item: TransferModelTable) => {
    if (item.order_id) {
      router.push(`/orders/edit/${item.order_id}`);
    }
  };

  const tableOptions: RenderTableOptions<TransferModelTable>[] = [
    { key: "id" },
    {
      key: "type",
      type: "translate",
      typeConfig: { translateMap: transferTypeTranslations },
    },
    {
      key: "status",
      type: "translate",
      typeConfig: { translateMap: transferStatusTranslations },
    },
    { key: "from_warehouse_name" },
    { key: "to_address_formatted" },
    { key: "created_at", type: "date" },
  ];

  const headerRowLabels = ["ID", "Тип", "Статус", "Откуда", "Куда", "Дата создания"];

  return (
    <div className="table-container">
      {isMounted && !isMobile && props.transfers.length > 0 && (
        <MainTable
          data={props.transfers}
          headerRowLabels={headerRowLabels}
          gridTemplateColumns="65px minmax(120px, 140px) minmax(120px, 140px) minmax(150px, 1fr) minmax(150px, 1fr) minmax(160px, 1fr) 32px"
          tableOptions={tableOptions}
          stickyActionColumn
          stickyFirstColumn
          actions={[
            { label: "Подробнее", action: handleInfoRouter },
            { label: "Посмотреть заказ", action: handleOrderRouter },
          ]}
        />
      )}

      {isMounted && isMobile && props.transfers.length > 0 && (
        <MainMobileTable
          titleKey="id"
          data={props.transfers}
          tableOptions={tableOptions}
          headerRowLabels={headerRowLabels}
          headerRowWidth={["40px", "100px", "60px", "120px", "120px", "130px"]}
          searchParams={props.searchParams}
          isLoadMoreDisabled={props.isLoadMoreDisabled}
          patch={props.patch}
          fetchTableElementAction={props.fetchTableElementAction}
          actions={[
            { label: "Подробнее", action: handleInfoRouter },
            { label: "Посмотреть заказ", action: handleOrderRouter },
          ]}
        />
      )}
    </div>
  );
};

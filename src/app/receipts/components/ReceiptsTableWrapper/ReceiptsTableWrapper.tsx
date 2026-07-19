"use client";
import { useRouter } from "next/navigation";
import { useWindowSize } from "@/shared/hooks/useWindowSize";
import type { ResponseData } from "@/shared/types/response";
import { MainMobileTable } from "@/widgets/main-mobile-table/MainMobileTable";
import { MainTable, type RenderTableOptions } from "@/widgets/main-table/MainTable";
import { TableControls } from "@/widgets/table-controls/TableControls";
import type { ReceiptModelTable } from "../../action";

type Props = {
  receipts: ReceiptModelTable[];
  fetchTableElementAction: (id: string) => Promise<ResponseData<ReceiptModelTable>>;
  name: string;
  isLoadMoreDisabled: boolean;
  patch: string;
  searchParams: { [key: string]: string | string[] | undefined };
};

export const ReceiptsTableWrapper = (props: Props) => {
  const router = useRouter();
  const { isMobile, isMounted } = useWindowSize();

  const handleDetailRouter = (item: ReceiptModelTable) => {
    if (item.id) {
      router.push(`/receipts/${item.id}`);
    }
  };

  const tableOptions: RenderTableOptions<ReceiptModelTable>[] = [
    { key: "id" },
    { key: "display_stocks" },
    { key: "total_count" },
    { key: "created_at", type: "date" },
  ];

  const headerRowLabels = ["ID", "Склады и остатки", "Количество", "Дата создания"];

  return (
    <div className="table-container">
      <TableControls
        addAction={{
          href: "/receipts/create",
          text: "Создать поступление",
        }}
        name={props.name}
        queryKey="name"
        inputSearchLabel="Поиск по названию или штрих-коду товара"
      />
      {isMounted && !isMobile && props.receipts && props.receipts.length > 0 && (
        <MainTable
          data={props.receipts}
          headerRowLabels={headerRowLabels}
          stickyFirstColumn
          gridTemplateColumns="65px minmax(200px, 1fr) 140px 160px 32px"
          tableOptions={tableOptions}
          actions={[{ label: "Подробнее", action: handleDetailRouter }]}
        />
      )}

      {isMounted && isMobile && props.receipts && props.receipts.length > 0 && (
        <MainMobileTable
          titleKey="display_stocks"
          data={props.receipts}
          tableOptions={tableOptions}
          headerRowLabels={headerRowLabels}
          headerRowWidth={["38px", "200px", "70px", "120px"]}
          searchParams={props.searchParams}
          isLoadMoreDisabled={props.isLoadMoreDisabled}
          patch={props.patch}
          fetchTableElementAction={props.fetchTableElementAction}
          actions={[{ label: "Подробнее", action: handleDetailRouter }]}
        />
      )}
    </div>
  );
};

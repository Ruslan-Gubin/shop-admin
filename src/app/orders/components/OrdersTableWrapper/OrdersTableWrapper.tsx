"use client";
import { useRouter } from "next/navigation";
import { useWindowSize } from "@/shared/hooks/useWindowSize";
import {
  orderMethodReceiptTranslations,
  orderPaymentMethodTranslations,
  orderStatusTranslations,
} from "@/shared/translate/order-translates";
import type { ResponseData } from "@/shared/types/response";
import { MainMobileTable } from "@/widgets/main-mobile-table/MainMobileTable";
import { MainTable, type RenderTableOptions } from "@/widgets/main-table/MainTable";
import { TableControls } from "@/widgets/table-controls/TableControls";
import type { OrderModel } from "../../action";

type Props = {
  orders: OrderModel[];
  orderNumber: string;
  isLoadMoreDisabled: boolean;
  patch: string;
  searchParams: { [key: string]: string | string[] | undefined };
  fetchTableElementAction: (id: string) => Promise<ResponseData<OrderModel>>;
};

export const OrdersTableWrapper = (props: Props) => {
  const router = useRouter();
  const { isMobile, isMounted } = useWindowSize();

  const handleEditRouter = (item: OrderModel) => {
    if (item.id) {
      router.push(`/orders/edit/${item.id}`);
    }
  };

  const tableOptions: RenderTableOptions<OrderModel>[] = [
    { key: "order_number" },
    {
      key: "status",
      type: "translate",
      typeConfig: { translateMap: orderStatusTranslations },
    },
    { key: "phone" },
    { key: "total" },
    {
      key: "payment_method",
      type: "translate",
      typeConfig: { translateMap: orderPaymentMethodTranslations },
    },
    {
      key: "method_receipt",
      type: "translate",
      typeConfig: { translateMap: orderMethodReceiptTranslations },
    },
    { key: "created_at", type: "date" },
  ];

  const headerRowLabels = [
    "Номер заказа",
    "Статус",
    "Телефон",
    "Сумма",
    "Оплата",
    "Способ получения",
    "Дата создания",
  ];

  return (
    <div className="table-container">
      <TableControls
        name={props.orderNumber}
        queryKey="order_number"
        inputSearchLabel="Поиск по номеру заказа"
      />
      {isMounted && !isMobile && props.orders && props.orders.length > 0 && (
        <MainTable
          data={props.orders}
          headerRowLabels={headerRowLabels}
          stickyActionColumn
          stickyFirstColumn
          gridTemplateColumns="minmax(120px, 130px) minmax(130px, 160px) minmax(120px, 150px) 100px minmax(150px, 160px) 160px minmax(160px, 1fr) 32px"
          tableOptions={tableOptions}
          actions={[{ label: "Редактировать", action: handleEditRouter }]}
        />
      )}

      {isMounted && isMobile && props.orders && props.orders.length > 0 && (
        <MainMobileTable
          titleKey="order_number"
          data={props.orders}
          tableOptions={tableOptions}
          headerRowLabels={headerRowLabels}
          headerRowWidth={["120px", "110px", "100px", "80px", "100px", "120px", "130px"]}
          searchParams={props.searchParams}
          isLoadMoreDisabled={props.isLoadMoreDisabled}
          patch={props.patch}
          fetchTableElementAction={props.fetchTableElementAction}
          actions={[{ label: "Редактировать", action: handleEditRouter }]}
        />
      )}
    </div>
  );
};

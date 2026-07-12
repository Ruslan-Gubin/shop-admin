"use server";
import { ErrorAlert } from "@/shared/ui/error-alert/ErrorAlert";
import { UpdateToken } from "@/views/UpdateToken/UpdateToken";
import { TransfersList } from "@/widgets/transfers-list/TransfersList";
import { OrderInfo } from "../../components/OrderInfo/OrderInfo";
import { OrderProductsTable } from "../../components/OrderProductsTable/OrderProductsTable";
import { OrderStatusActions } from "../../components/OrderStatusActions/OrderStatusActions";
import { changeOrderStatusAction, fetchOrderEditPage } from "./action";

export default async function OrderEditPage(req: { params: Promise<{ id: string }> }) {
  const { id } = await req.params;
  const [productsData, orderData, transfersData, deliveryData] = await fetchOrderEditPage(id);

  const products = productsData.data || [];
  const order = orderData.data;
  const transfers = transfersData.data || [];
  const title = order ? `Заказ # ${order.order_number}` : "Заказ";
  const baseWarehouseId = order?.warehouse?.id || 0;
  const delivery = deliveryData.data || [];

  const isNeedTransfer =
    order?.warehouse?.id && order.status === "new"
      ? products.some((product) =>
          product.reservations.some((res) => res.warehouse_id !== order?.warehouse?.id),
        )
      : false;

  return (
    <section className="page-wrapper">
      <h2>{title}</h2>
      {deliveryData?.tokens && <UpdateToken tokens={deliveryData.tokens} />}
      {productsData.status === "error" && productsData.message && (
        <ErrorAlert message={productsData.message} />
      )}
      {orderData.status === "error" && orderData.message && (
        <ErrorAlert message={orderData.message} />
      )}
      {transfersData.status === "error" && transfersData.message && (
        <ErrorAlert message={transfersData.message} />
      )}
      {deliveryData.status === "error" && deliveryData.message && (
        <ErrorAlert message={deliveryData.message} />
      )}
      {order && <OrderInfo order={order} />}
      {products.length > 0 && order && (
        <OrderProductsTable
          products={products}
          baseId={baseWarehouseId}
          in_delivery={delivery.length > 0 && order.status === "in_delivery"}
          hasAnyTransfers={transfers.length > 0}
          method_receipt={order.method_receipt}
          order_status={order.status}
        />
      )}

      {delivery.length > 0 &&
        order &&
        (order.status === "in_delivery" || order.status === "completed") && (
          <>
            <h2>Доставка курьером</h2>
            <TransfersList
              isCompleted={order.status === "completed"}
              transfers={delivery}
              products={products}
              baseId={baseWarehouseId}
            />
          </>
        )}

      {transfers.length > 0 &&
        order &&
        (order.status === "processing" || order.status === "completed") && (
          <>
            <h2>Список перемещений</h2>
            <TransfersList
              isCompleted={products.some((el) => el.transfers.length > 0)}
              transfers={transfers}
              products={products}
              baseId={baseWarehouseId}
            />
          </>
        )}

      {order && products && (
        <OrderStatusActions
          isNeedTransfer={isNeedTransfer}
          status={order.status}
          order_id={order.id}
          method_receipt={order.method_receipt}
          changeOrderStatusAction={changeOrderStatusAction}
        />
      )}
    </section>
  );
}
